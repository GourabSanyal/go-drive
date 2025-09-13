import { useState, useCallback, useEffect, useRef } from "react";
import { Linking } from "react-native";
import { useSession } from "../../session";
import { SolflareAdapter } from "@/src/adapters/wallet/SolflareAdapter";
import { WalletConnectionState } from "@/src/enums/wallet.enums";
import { WalletConnectionState as IWalletConnectionState } from "@/src/types/wallet/wallet.types";

export const useSolflareConnection = () => {
  const [connectionState, setConnectionState] =
    useState<IWalletConnectionState>({
      state: WalletConnectionState.DISCONNECTED,
      isConnecting: false,
      isCheckingConnection: false,
      error: null,
      isConnected: false,
    });

  const sessionHook = useSession();
  const adapterRef = useRef<SolflareAdapter | null>(null);

  useEffect(() => {
    if (!adapterRef.current) {
      adapterRef.current = new SolflareAdapter(sessionHook);
    }
  }, [sessionHook]);

  const handleConnectionResponse = useCallback(async (url: string) => {
    if (adapterRef.current) {
      await adapterRef.current.handleConnectionResponse(url);
      setConnectionState(adapterRef.current.getConnectionState());
    }
  }, []);

  const connect = useCallback(async () => {
    if (adapterRef.current) {
      await adapterRef.current.connect();
      setConnectionState(adapterRef.current.getConnectionState());
    }
  }, []);

  useEffect(() => {
    const handleUrl = (event: { url: string }) => {
      if (
        event.url.includes("solflare") ||
        (event.url.includes("drive://") &&
          event.url.includes("solflare_encryption_public_key"))
      ) {
        handleConnectionResponse(event.url);
      }
    };

    const subscription = Linking.addEventListener("url", handleUrl);

    Linking.getInitialURL().then((url) => {
      if (
        url &&
        (url.includes("solflare") ||
          (url.includes("drive://") &&
            url.includes("solflare_encryption_public_key")))
      ) {
        handleConnectionResponse(url);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [handleConnectionResponse]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (connectionState.isConnecting && !connectionState.isConnected) {
      interval = setInterval(() => {
        const session = sessionHook.getSession();
        if (session) {
          setConnectionState((prev) => ({
            ...prev,
            isConnecting: false,
            isConnected: true,
            error: null,
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
    connectionState,
  };
};
