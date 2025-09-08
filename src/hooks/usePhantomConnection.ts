import { useState, useCallback, useEffect } from 'react';
import { Linking, Platform } from 'react-native';
import { PublicKey, Keypair } from '@solana/web3.js';
import * as nacl from 'tweetnacl';
import bs58 from 'bs58';
import { authStorage } from '@/src/utils/storage/authStorage';
import { storage } from '@/src/utils/storage/mmkv';

export type PhantomConnectionState = {
  isConnecting: boolean;
  isCheckingConnection: boolean;
  error: string | null;
  isConnected: boolean;
};

export interface PhantomSession {
  publicKey: string;    // Wallet address
  sessionToken: string; // Session token from Phantom
  connectedAt: number;  // Timestamp
}

const PHANTOM_SESSION_KEY = 'phantom_session';
const PHANTOM_KEYPAIR_KEY = 'phantom_keypair';

export const usePhantomConnection = () => {
  const [connectionState, setConnectionState] = useState<PhantomConnectionState>({
    isConnecting: false,
    isCheckingConnection: false,
    error: null,
    isConnected: false,
  });

  // Session management functions
  const saveSession = useCallback((session: PhantomSession) => {
    try {
      storage.set(PHANTOM_SESSION_KEY, JSON.stringify(session));
      console.log('✅ Phantom session saved:', session.publicKey);
    } catch (error) {
      console.error('❌ Error saving session:', error);
    }
  }, []);

  const getSession = useCallback((): PhantomSession | null => {
    try {
      const sessionStr = storage.getString(PHANTOM_SESSION_KEY);
      return sessionStr ? JSON.parse(sessionStr) : null;
    } catch (error) {
      console.error('❌ Error retrieving session:', error);
      return null;
    }
  }, []);

  const clearSession = useCallback(() => {
    try {
      storage.delete(PHANTOM_SESSION_KEY);
      console.log('✅ Phantom session cleared');
    } catch (error) {
      console.error('❌ Error clearing session:', error);
    }
  }, []);

  // Keypair management functions
  const storeKeypair = useCallback((keypair: Keypair) => {
    try {
      const keypairData = {
        publicKey: keypair.publicKey.toBase58(),
        secretKey: bs58.encode(keypair.secretKey)
      };
      storage.set(PHANTOM_KEYPAIR_KEY, JSON.stringify(keypairData));
      console.log('✅ Keypair stored:', {
        publicKey: keypairData.publicKey,
        secretKeyLength: keypair.secretKey.length
      });
    } catch (error) {
      console.error('❌ Error storing keypair:', error);
    }
  }, []);

  const getStoredKeypair = useCallback((): Keypair | null => {
    try {
      const keypairStr = storage.getString(PHANTOM_KEYPAIR_KEY);
      if (!keypairStr) {
        console.log('❌ No keypair found in storage');
        return null;
      }
      
      const keypairData = JSON.parse(keypairStr);
      console.log('🔍 Retrieved keypair data from storage:', {
        publicKey: keypairData.publicKey,
        secretKeyLength: keypairData.secretKey.length
      });
      
      const publicKey = new PublicKey(keypairData.publicKey);
      const secretKey = bs58.decode(keypairData.secretKey);
      
      console.log('🔍 Decoded keypair:', {
        publicKey: publicKey.toBase58(),
        secretKeyLength: secretKey.length
      });
      
      return new Keypair({ publicKey: publicKey.toBytes(), secretKey });
    } catch (error) {
      console.error('❌ Error retrieving keypair:', error);
      return null;
    }
  }, []);

  const clearKeypair = useCallback(() => {
    try {
      storage.delete(PHANTOM_KEYPAIR_KEY);
      console.log('✅ Keypair cleared');
    } catch (error) {
      console.error('❌ Error clearing keypair:', error);
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

      console.log('🔍 Parsing deep link URL:', url);

      // Parse URL parameters
      const urlParts = url.split('?');
      const queryString = urlParts[1] || '';
      const params = new URLSearchParams(queryString);
      
      console.log('📋 URL parameters:', Object.fromEntries(params.entries()));
      
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
      
      console.log('🔑 Retrieved keypair from storage:', {
        publicKey: keypair.publicKey.toBase58(),
        secretKeyLength: keypair.secretKey.length
      });
      
      // Create shared secret and decrypt data
      const phantomPubKey = new PublicKey(phantomPublicKey);
      console.log('🔐 Creating shared secret with:', {
        phantomPublicKey: phantomPubKey.toBase58(),
        ourSecretKeyLength: keypair.secretKey.length
      });
      
      // Use the same keypair that generated the dapp_encryption_public_key
      // Convert the stored Ed25519 keypair to x25519 format
      const dappPrivateKey = keypair.secretKey.slice(0, 32);
      const dappKeyPair = nacl.box.keyPair.fromSecretKey(dappPrivateKey);
      
      // Create shared secret using Phantom's public key and our private key
      const phantomPubKeyBytes = bs58.decode(phantomPublicKey);
      const sharedSecretDapp = nacl.box.before(phantomPubKeyBytes, dappKeyPair.secretKey);
      console.log('🔐 Shared secret created, length:', sharedSecretDapp.length);
      
      try {
        const decryptedData = decryptPayload(data, nonce, sharedSecretDapp);
        
        // Create session data
        const session: PhantomSession = {
          publicKey: decryptedData.public_key,
          sessionToken: decryptedData.session,
          connectedAt: Date.now()
        };
        
        // Save session immediately
        saveSession(session);
        
        // Also store in auth storage for compatibility
        const walletData = {
          address: decryptedData.public_key,
          publicKey: decryptedData.public_key,
          authToken: decryptedData.session,
          username: `Phantom_${decryptedData.public_key.substring(0, 6)}`,
        };
        
        const success = await authStorage.setSolanaWalletAuth(walletData);
        
        if (success) {
          console.log('✅ Phantom session and wallet data stored successfully');
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
        console.error('❌ Decryption failed:', decryptError);
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
  }, [decryptPayload, saveSession, getStoredKeypair, clearKeypair]);

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
      
      console.log('Opening Phantom connect URL:', connectUrl);
      
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
    console.log('🔧 Setting up deep link listener...');
    
    const handleUrl = (event: { url: string }) => {
      console.log('🔗 Deep link received:', event.url);
      handleConnectionResponse(event.url);
    };

    const subscription = Linking.addEventListener('url', handleUrl);
    
    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      console.log('🔗 Initial URL:', url);
      if (url) {
        handleConnectionResponse(url);
      }
    });

    return () => {
      console.log('🔧 Removing deep link listener');
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
          // Clear keypair after successful connection
          clearKeypair();
        }
      }, 1000); // Check every second
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
