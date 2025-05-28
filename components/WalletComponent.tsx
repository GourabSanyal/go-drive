// WalletComponent.tsx
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Button, Alert, Platform } from 'react-native';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import * as Linking from 'expo-linking';
import { Buffer } from 'buffer';

global.Buffer = global.Buffer || Buffer;

export default function WalletComponent() {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [deepLink, setDeepLink] = useState<string>('');

  // Keep the DApp keypair and shared secret around
  const [dappKeyPair] = useState(nacl.box.keyPair());
  const [sharedSecret, setSharedSecret] = useState<Uint8Array>();
  const [session, setSession] = useState<string>();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connection = new Connection(clusterApiUrl('devnet'));

  // Create redirect links
  const onConnectRedirectLink = Linking.createURL('onConnect');
  const onDisconnectRedirectLink = Linking.createURL('onDisconnect');

  /**
   * If true, uses universal links instead of deep links. This is the recommended way for dapps
   * and Phantom to handle deeplinks as we own the phantom.app domain.
   *
   * Set this to false to use normal deeplinks, starting with phantom://. This is easier for
   * debugging with a local build such as Expo Dev Client builds.
   */
  const useUniversalLinks = false;
  const buildUrl = (path: string, params: URLSearchParams) =>
    `${useUniversalLinks ? 'https://phantom.app/ul/' : 'phantom://'}v1/${path}?${params.toString()}`;

  const decryptPayload = (data: string, nonce: string, sharedSecret?: Uint8Array) => {
    if (!sharedSecret) throw new Error('missing shared secret');

    const decryptedData = nacl.box.open.after(bs58.decode(data), bs58.decode(nonce), sharedSecret);
    if (!decryptedData) {
      throw new Error('Unable to decrypt data');
    }
    return JSON.parse(Buffer.from(decryptedData).toString('utf8'));
  };

  const encryptPayload = (payload: any, sharedSecret?: Uint8Array) => {
    if (!sharedSecret) throw new Error('missing shared secret');

    const nonce = nacl.randomBytes(24);

    const encryptedPayload = nacl.box.after(
      Buffer.from(JSON.stringify(payload)),
      nonce,
      sharedSecret
    );

    return [nonce, encryptedPayload];
  };

  // Deep-link handler
  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      console.log('Received deep link:', url);
      setDeepLink(url);
    };

    const getInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        setDeepLink(initialUrl);
      }
    };

    getInitialUrl();
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle inbound links
  useEffect(() => {
    if (!deepLink) return;

    console.log('Processing deep link:', deepLink);

    // Clear the timeout when we receive a response
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    try {
      const url = new URL(deepLink);
      const params = url.searchParams;

      console.log('URL pathname:', url.pathname);
      console.log('URL host:', url.host);
      console.log('Params:', Object.fromEntries(params.entries()));

      if (params.get('errorCode')) {
        const errorMessage = params.get('errorMessage') || 'Unknown error occurred';
        console.error('Phantom returned error:', {
          errorCode: params.get('errorCode'),
          errorMessage
        });
        
        setConnecting(false);
        setConnected(false);
        setAddress(null);
        
        Alert.alert('Connection Error', errorMessage);
        return;
      }

      if (/onConnect/.test(url.pathname || url.host)) {
        console.log('Processing connection response...');

        const phantomEncryptionPublicKey = params.get('phantom_encryption_public_key');
        const nonce = params.get('nonce');
        const data = params.get('data');

        if (!phantomEncryptionPublicKey || !nonce || !data) {
          throw new Error('Missing required parameters from Phantom response');
        }

        // Create shared secret
        const sharedSecretDapp = nacl.box.before(
          bs58.decode(phantomEncryptionPublicKey),
          dappKeyPair.secretKey
        );

        // Decrypt the response
        const connectData = decryptPayload(data, nonce, sharedSecretDapp);
        
        console.log('Decrypted connect data:', connectData);

        if (!connectData.public_key) {
          throw new Error('No public key found in Phantom response');
        }

        // Validate the public key format
        try {
          new PublicKey(connectData.public_key);
        } catch (err) {
          throw new Error('Invalid public key format received from Phantom');
        }

        // Update state
        setSharedSecret(sharedSecretDapp);
        setSession(connectData.session);
        setAddress(connectData.public_key);
        setConnected(true);
        setConnecting(false);

        console.log('Connection successful:', connectData.public_key);
        Alert.alert('Connected Successfully!', `Public key:\n${connectData.public_key}`);

      } else if (/onDisconnect/.test(url.pathname || url.host)) {
        console.log('Processing disconnect response...');
        
        setAddress(null);
        setConnected(false);
        setConnecting(false);
        setSharedSecret(undefined);
        setSession(undefined);
        
        Alert.alert('Disconnected', 'Wallet disconnected successfully');
      }

    } catch (err) {
      console.error('Deep link processing error:', err);
      
      // Always reset connecting state on error
      setConnecting(false);
      setConnected(false);
      setAddress(null);
      
      Alert.alert(
        'Connection Failed', 
        `Error: ${(err as Error).message}\n\nPlease try connecting again.`
      );
    }
  }, [deepLink, dappKeyPair.secretKey]);

  // Connect to Phantom
  const connectWallet = useCallback(async () => {
    console.log('Starting connection to Phantom...');
    
    setConnecting(true);
    setConnected(false);
    setAddress(null);
    
    try {
      const params = new URLSearchParams({
        dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
        cluster: 'devnet',
        app_url: 'https://phantom.app',
        redirect_link: onConnectRedirectLink
      });

      const url = buildUrl('connect', params);
      
      console.log('Opening Phantom with URL:', url);
      console.log('Redirect link:', onConnectRedirectLink);

      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        throw new Error('Phantom wallet is not installed');
      }

      await Linking.openURL(url);

      // Set timeout for connection
      timeoutRef.current = setTimeout(() => {
        if (connecting) {
          console.log('Connection timeout reached');
          setConnecting(false);
          
          Alert.alert(
            'Connection Timeout',
            'No response from Phantom. Make sure Phantom is installed and unlocked, then try again.',
            [
              { text: 'OK' }, 
              { text: 'Install Phantom', onPress: openWalletStore }
            ]
          );
        }
      }, 15000);

    } catch (err) {
      console.error('Connect error:', err);
      setConnecting(false);
      
      if ((err as Error).message.includes('not installed')) {
        Alert.alert(
          'Phantom Not Found',
          'Phantom wallet is not installed on this device.',
          [
            { text: 'OK' },
            { text: 'Install Phantom', onPress: openWalletStore }
          ]
        );
      } else {
        Alert.alert('Connection Error', 'Failed to open Phantom wallet');
      }
    }
  }, [connecting, dappKeyPair.publicKey, onConnectRedirectLink]);

  // Disconnect from Phantom
  const disconnectWallet = useCallback(async () => {
    if (!session || !sharedSecret) {
      // Local disconnect if no session
      setAddress(null);
      setConnected(false);
      setConnecting(false);
      setSharedSecret(undefined);
      setSession(undefined);
      Alert.alert('Disconnected', 'Wallet disconnected locally');
      return;
    }

    try {
      const payload = { session };
      const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);

      const params = new URLSearchParams({
        dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
        nonce: bs58.encode(nonce),
        redirect_link: onDisconnectRedirectLink,
        payload: bs58.encode(encryptedPayload)
      });

      const url = buildUrl('disconnect', params);
      await Linking.openURL(url);
    } catch (err) {
      console.error('Disconnect error:', err);
      // Fallback to local disconnect
      setAddress(null);
      setConnected(false);
      setConnecting(false);
      setSharedSecret(undefined);
      setSession(undefined);
      Alert.alert('Disconnected', 'Wallet disconnected locally');
    }
  }, [session, sharedSecret, dappKeyPair.publicKey, onDisconnectRedirectLink]);

  // Fetch SOL balance
  const getBalance = useCallback(async () => {
    if (!address) return;
    try {
      const bal = await connection.getBalance(new PublicKey(address));
      Alert.alert('Balance', `${(bal / 1e9).toFixed(4)} SOL`);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Unable to fetch balance');
    }
  }, [address, connection]);

  const openWalletStore = useCallback(() => {
    const url =
      Platform.OS === 'ios'
        ? 'https://apps.apple.com/app/phantom-solana-wallet/id1598432977'
        : 'https://play.google.com/store/apps/details?id=app.phantom';
    Linking.openURL(url);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phantom Wallet Integration</Text>

      {connected && address ? (
        <View style={styles.connectedContainer}>
          <Text style={styles.label}>Connected Public Key:</Text>
          <Text style={styles.addressValue}>{address}</Text>
          <View style={styles.buttonContainer}>
            <Button title="Get Balance" onPress={getBalance} />
            <View style={{ width: 16 }} />
            <Button title="Disconnect" onPress={disconnectWallet} color="#ff4444" />
          </View>
        </View>
      ) : (
        <View style={styles.disconnectedContainer}>
          <Text style={styles.description}>
            {connecting ? 'Connecting to Phantom…' : 'Connect your Phantom wallet:'}
          </Text>
          <Button
            title={connecting ? 'Connecting…' : 'Connect Phantom'}
            onPress={connectWallet}
            disabled={connecting}
          />
          <View style={{ height: 12 }} />
          <Button title="Install Phantom" onPress={openWalletStore} color="#6f42c1" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  connectedContainer: { alignItems: 'center' },
  disconnectedContainer: { alignItems: 'center' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  addressValue: {
    fontSize: 12,
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: { flexDirection: 'row' },
  description: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
});
