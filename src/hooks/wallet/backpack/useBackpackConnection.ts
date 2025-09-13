import { useState, useCallback, useEffect, useRef } from "react";
import { Linking, Alert } from "react-native";
import { useSession } from "../../session";
import { BackpackAdapter } from "@/src/adapters/wallet/BackpackAdapter";
import { WalletConnectionState } from "@/src/types/wallet/wallet.types";

export const useBackpackConnection = () => {
  const [connectionState, setConnectionState] = useState<WalletConnectionState>(
    {
      state: "disconnected" as any,
      isConnecting: false,
      isCheckingConnection: false,
      error: null,
      isConnected: false,
    }
  );

  const sessionHook = useSession();
  const adapterRef = useRef<BackpackAdapter | null>(null);

  useEffect(() => {
    if (!adapterRef.current) {
      adapterRef.current = new BackpackAdapter(sessionHook);
    }
  }, [sessionHook]);

  // connection response from Backpack
  const handleConnectionResponse = useCallback(async (url: string) => {
    if (adapterRef.current) {
      try {
        const urlObj = new URL(url);
        const params = urlObj.searchParams;
      } catch (error) {
        console.log("🔗 Backpack URL parsing error:", error);
      }

      await adapterRef.current.handleConnectionResponse(url);
      const newState = adapterRef.current.getConnectionState();
      setConnectionState(newState);
    }
  }, []);

  const connect = useCallback(async () => {
    if (adapterRef.current) {
      await adapterRef.current.connect();
      const newState = adapterRef.current.getConnectionState();
      setConnectionState(newState);
    }
  }, []);

  useEffect(() => {
    const handleUrl = (event: { url: string }) => {
      if (
        event.url.includes("backpack") ||
        (event.url.includes("drive://") &&
          event.url.includes("wallet_encryption_public_key"))
      ) {
        handleConnectionResponse(event.url);
      } else {
        Alert.alert(
          "🔗 Backpack ignoring deep link (not relevant):",
          event.url
        );
      }
    };

    const subscription = Linking.addEventListener("url", handleUrl);

    Linking.getInitialURL().then((url) => {
      if (
        url &&
        (url.includes("backpack") ||
          (url.includes("drive://") &&
            url.includes("backpack_encryption_public_key")))
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
