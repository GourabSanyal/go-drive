import { useState, useCallback, useEffect, useRef } from "react";
import { Linking } from "react-native";
import { useSession } from "../../session";
import { PhantomAdapter } from "@/src/adapters/wallet/PhantomAdapter";
import { WalletConnectionState } from "@/src/types/wallet/wallet.types";

export const usePhantomConnection = () => {
  const [connectionState, setConnectionState] = useState<WalletConnectionState>(
    {
      state: "disconnected" as any,
      isConnecting: false,
      isCheckingConnection: false,
      error: null,
      isConnected: false,
    }
  );

  const session = useSession();
  const adapterRef = useRef<PhantomAdapter | null>(null);

  useEffect(() => {
    if (!adapterRef.current) {
      adapterRef.current = new PhantomAdapter(session);
    }
  }, [session]);

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
        event.url.includes("phantom") ||
        (event.url.includes("drive://") &&
          event.url.includes("phantom_encryption_public_key"))
      ) {
        handleConnectionResponse(event.url);
      } else {
        console.log("🔗 Phantom ignoring deep link (not relevant):", event.url);
      }
    };

    const subscription = Linking.addEventListener("url", handleUrl);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (
        url &&
        (url.includes("phantom") ||
          (url.includes("drive://") &&
            url.includes("phantom_encryption_public_key")))
      ) {
        handleConnectionResponse(url);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [handleConnectionResponse]);

  // checks connection status periodically while connecting
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (connectionState.isConnecting && !connectionState.isConnected) {
      interval = setInterval(() => {
        const sessionState = session.getSession();
        if (sessionState) {
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
  }, [connectionState.isConnecting, connectionState.isConnected, session]);

  return {
    connect,
    connectionState,
  };
};
