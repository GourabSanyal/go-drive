import { useState, useCallback, useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import { useSession } from '../session';
import { WalletType, WalletConnectionState } from '@/src/enums/wallet.enums';
import { WalletConnectionState as IWalletConnectionState } from '@/src/types/wallet/wallet.types';
import { 
  PhantomAdapter, 
  SolflareAdapter, 
  BackpackAdapter,
} from '@/src/adapters/wallet';

// Define a common interface for all wallet adapters
interface WalletAdapterInterface {
  connect(): Promise<void>;
  handleConnectionResponse(url: string): Promise<void>;
  disconnect(): Promise<void>;
  checkInstalled(): Promise<boolean>;
  getConnectionState(): IWalletConnectionState;
}

/**
 * Factory function to create wallet adapters
 */
const createWalletAdapter = (
  walletType: WalletType,
  sessionHook: ReturnType<typeof useSession>
): WalletAdapterInterface => {
  switch (walletType) {
    case WalletType.PHANTOM:
      return new PhantomAdapter(sessionHook);
    case WalletType.SOLFLARE:
      return new SolflareAdapter(sessionHook);
    case WalletType.BACKPACK:
      return new BackpackAdapter(sessionHook);
    default:
      throw new Error(`Unsupported wallet type: ${walletType}`);
  }
};

/**
 * Generic wallet connection hook that works with any wallet type
 */
export const useWalletConnection = (walletType: WalletType) => {
  const [connectionState, setConnectionState] = useState<IWalletConnectionState>({
    state: WalletConnectionState.DISCONNECTED,
    isConnecting: false,
    isCheckingConnection: false,
    error: null,
    isConnected: false,
  });

  const sessionHook = useSession();
  const adapterRef = useRef<WalletAdapterInterface | null>(null);

  // Initialize adapter
  useEffect(() => {
    if (!adapterRef.current) {
      adapterRef.current = createWalletAdapter(walletType, sessionHook);
    }
  }, [walletType, sessionHook]);

  // Handle the connection response from wallet
  const handleConnectionResponse = useCallback(async (url: string) => {
    if (adapterRef.current) {
      await adapterRef.current.handleConnectionResponse(url);
      setConnectionState(adapterRef.current.getConnectionState());
    }
  }, []);

  // Initialize connection with wallet
  const connect = useCallback(async () => {
    if (adapterRef.current) {
      await adapterRef.current.connect();
      setConnectionState(adapterRef.current.getConnectionState());
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    if (adapterRef.current) {
      await adapterRef.current.disconnect();
      setConnectionState(adapterRef.current.getConnectionState());
    }
  }, []);

  // Check if wallet is installed
  const checkInstalled = useCallback(async (): Promise<boolean> => {
    if (adapterRef.current) {
      return await adapterRef.current.checkInstalled();
    }
    return false;
  }, []);

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
        const session = sessionHook.getSession();
        if (session) {
          setConnectionState(prev => ({
            ...prev,
            isConnecting: false,
            isConnected: true,
            error: null
          }));
        }
      }, 1000); 
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [connectionState.isConnecting, connectionState.isConnected, sessionHook]);

  return {
    connect,
    disconnect,
    checkInstalled,
    connectionState,
  };
};
