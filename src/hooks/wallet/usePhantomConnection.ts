import { useState, useCallback, useEffect } from 'react';
import { Linking, Platform } from 'react-native';
import { PublicKey, Keypair } from '@solana/web3.js';
import * as nacl from 'tweetnacl';
import bs58 from 'bs58';
import { storage } from '@/src/utils/storage/mmkv';
import { useSession, WalletSession } from '../session';

export type PhantomConnectionState = {
  isConnecting: boolean;
  isCheckingConnection: boolean;
  error: string | null;
  isConnected: boolean;
};

const PHANTOM_KEYPAIR_KEY = 'phantom_keypair';

export const usePhantomConnection = () => {
  const [connectionState, setConnectionState] = useState<PhantomConnectionState>({
    isConnecting: false,
    isCheckingConnection: false,
    error: null,
    isConnected: false,
  });

  // Use the centralized session management
  const { saveSessionWithAuth, getSession, clearSession } = useSession();

  // Keypair management functions
  const storeKeypair = useCallback((keypair: Keypair) => {
    try {
      const keypairData = {
        publicKey: keypair.publicKey.toBase58(),
        secretKey: bs58.encode(keypair.secretKey)
      };
      storage.set(PHANTOM_KEYPAIR_KEY, JSON.stringify(keypairData));
    } catch (error) {
      console.error('Error storing keypair:', error);
    }
  }, []);

  const getStoredKeypair = useCallback((): Keypair | null => {
    try {
      const keypairStr = storage.getString(PHANTOM_KEYPAIR_KEY);
      if (!keypairStr) {
        return null;
      }
      
      const keypairData = JSON.parse(keypairStr);
      const publicKey = new PublicKey(keypairData.publicKey);
      const secretKey = bs58.decode(keypairData.secretKey);
      
      return new Keypair({ publicKey: publicKey.toBytes(), secretKey });
    } catch (error) {
      console.error('Error retrieving keypair:', error);
      return null;
    }
  }, []);

  const clearKeypair = useCallback(() => {
    try {
      storage.delete(PHANTOM_KEYPAIR_KEY);
    } catch (error) {
      console.error('Error clearing keypair:', error);
    }
  }, []);

  // Check if Phantom is installed
  const checkPhantomInstalled = useCallback(async () => {
    try {
      const url = 'phantom://';
      const canOpen = await Linking.canOpenURL(url);
      return canOpen;
    } catch (error) {
      console.error('Error checking Phantom installation:', error);
      return false;
    }
  }, []);

  // Generate encryption keypair
  const generateKeypair = useCallback((): Keypair => {
    return Keypair.generate();
  }, []);

  // Decrypt Phantom response data using secretbox
  const decryptPayload = useCallback((
    data: string,
    nonce: string,
    sharedSecret: Uint8Array
  ): any => {
    try {
      const decryptedData = nacl.secretbox.open(
        bs58.decode(data),
        bs58.decode(nonce),
        sharedSecret
      );
      if (!decryptedData) {
        throw new Error('Failed to decrypt payload');
      }
      return JSON.parse(new TextDecoder().decode(decryptedData));
    } catch (error) {
      console.error('Decryption error:', error);
      throw error;
    }
  }, []);

  // Handle the connection response from Phantom
  const handleConnectionResponse = useCallback(async (url: string) => {
    try {
      setConnectionState(prev => ({ ...prev, isCheckingConnection: true, error: null }));

      // Parse URL parameters
      const urlParts = url.split('?');
      const queryString = urlParts[1] || '';
      const params = new URLSearchParams(queryString);
      
      // Check for error
      if (params.has('errorCode')) {
        const errorMessage = params.get('errorMessage') || 'Unknown error';
        throw new Error(`Phantom connection failed: ${errorMessage}`);
      }
      
      // Extract connection data
      const phantomPublicKey = params.get('phantom_encryption_public_key');
      const nonce = params.get('nonce');
      const data = params.get('data');
      
      if (!phantomPublicKey || !nonce || !data) {
        throw new Error('Invalid response from Phantom');
      }
      
      // Get stored keypair
      const keypair = getStoredKeypair();
      if (!keypair) {
        throw new Error('No keypair available for decryption');
      }
      
      // Create shared secret and decrypt data
      const phantomPubKey = new PublicKey(phantomPublicKey);
      
      // Use the same keypair that generated the dapp_encryption_public_key
      // Convert the stored Ed25519 keypair to x25519 format
      const dappPrivateKey = keypair.secretKey.slice(0, 32);
      const dappKeyPair = nacl.box.keyPair.fromSecretKey(dappPrivateKey);
      
      // Create shared secret using Phantom's public key and our private key
      const phantomPubKeyBytes = bs58.decode(phantomPublicKey);
      const sharedSecretDapp = nacl.box.before(phantomPubKeyBytes, dappKeyPair.secretKey);
      
      try {
        const decryptedData = decryptPayload(data, nonce, sharedSecretDapp);
        
        console.log('🔍 Decrypted data from Phantom:', decryptedData);
        
        // Create session data
        const session: WalletSession = {
          publicKey: decryptedData.public_key,
          sessionToken: decryptedData.session,
          connectedAt: Date.now(),
          walletType: 'phantom'
        };
        
        console.log('📝 Created session data:', session);
        
        // Save session using centralized session management
        const success = await saveSessionWithAuth(session);
        
        if (success) {
          setConnectionState(prev => ({
            ...prev,
            isConnected: true,
            isCheckingConnection: false,
            error: null
          }));
          // Clear the temporary keypair after successful connection
          clearKeypair();
        } else {
          throw new Error('Failed to store wallet data');
        }
      } catch (decryptError) {
        console.error('Decryption failed:', decryptError);
        throw new Error(`Decryption failed: ${decryptError instanceof Error ? decryptError.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error handling connection response:', error);
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        isCheckingConnection: false,
        error: error instanceof Error ? error.message : 'Failed to connect with Phantom'
      }));
    }
  }, [decryptPayload, saveSessionWithAuth, getStoredKeypair, clearKeypair]);

  // Initialize connection with Phantom
  const connect = useCallback(async () => {
    try {
      setConnectionState(prev => ({ ...prev, isConnecting: true, error: null }));

      // Check if Phantom is installed
      const isInstalled = await checkPhantomInstalled();
      if (!isInstalled) {
        throw new Error('Phantom wallet is not installed');
      }

      // Generate new keypair for this connection attempt
      const newKeypair = generateKeypair();
      storeKeypair(newKeypair); // Store keypair in MMKV
      
      // Convert Ed25519 to x25519 for encryption
      const dappKeyPair = nacl.box.keyPair.fromSecretKey(newKeypair.secretKey.slice(0, 32));
      const publicKey = bs58.encode(dappKeyPair.publicKey);
      
      // Create the deep link URL
      const connectUrl = `https://phantom.app/ul/v1/connect?` +
        `dapp_encryption_public_key=${encodeURIComponent(publicKey)}&` +
        `cluster=devnet&` +
        `app_url=${encodeURIComponent('https://go-drive.app')}&` +
        `redirect_link=${encodeURIComponent('drive://')}`;
      
      
      // Open Phantom
      const canOpen = await Linking.canOpenURL(connectUrl);
      if (!canOpen) {
        throw new Error('Cannot open Phantom app');
      }

      await Linking.openURL(connectUrl);
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Failed to connect to Phantom'
      }));
    }
  }, [checkPhantomInstalled, generateKeypair, storeKeypair]);

  // Set up deep link listener
  useEffect(() => {
    
    const handleUrl = (event: { url: string }) => {
      handleConnectionResponse(event.url);
    };

    const subscription = Linking.addEventListener('url', handleUrl);
    
    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleConnectionResponse(url);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [handleConnectionResponse]);

  // Check connection status periodically while connecting
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (connectionState.isConnecting && !connectionState.isConnected) {
      interval = setInterval(() => {
        const session = getSession();
        if (session) {
          setConnectionState(prev => ({
            ...prev,
            isConnecting: false,
            isConnected: true,
            error: null
          }));
          clearKeypair();
        }
      }, 1000); 
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [connectionState.isConnecting, connectionState.isConnected, getSession, clearKeypair]);

  return {
    connect,
    connectionState,
    getSession,
    clearSession,
    clearKeypair,
  };
};
