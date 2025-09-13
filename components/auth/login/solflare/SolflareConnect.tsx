import React, { useEffect, useState } from "react";
import {
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSolflareConnection } from "@/src/hooks/wallet/solflare/useSolflareConnection";
import { useSession } from "@/src/hooks/session";

const SolflareConnect: React.FC = () => {
  const router = useRouter();
  const { connect, connectionState } = useSolflareConnection();
  const { getSession } = useSession();
  const [isButtonPressed, setIsButtonPressed] = useState(false);

  const handleConnect = async () => {
    setIsButtonPressed(true);
    try {
      await connect();
    } catch (error) {
      setIsButtonPressed(false);
    }
  };

  useEffect(() => {
    if (connectionState.error) {
      setIsButtonPressed(false);
      Alert.alert("Solflare Connection Error", connectionState.error, [
        { text: "OK" },
      ]);
    }

    if (connectionState.isConnected) {
      setIsButtonPressed(false);
      const session = getSession();
      if (session) {
        router.replace("/driver/home");
      } else {
        Alert.alert(
          "Solflare Connection Error",
          "Failed to save session data. Please try again.",
          [{ text: "OK" }]
        );
      }
    }
  }, [connectionState, router, getSession, isButtonPressed]);

  return (
    <TouchableOpacity
      style={[
        styles.circularButton,
        {
          opacity:
            isButtonPressed ||
            connectionState.isConnecting ||
            connectionState.isCheckingConnection
              ? 0.7
              : 1,
        },
      ]}
      activeOpacity={0.8}
      disabled={
        isButtonPressed ||
        connectionState.isConnecting ||
        connectionState.isCheckingConnection
      }
      onPress={handleConnect}
    >
      {isButtonPressed ||
      connectionState.isConnecting ||
      connectionState.isCheckingConnection ? (
        <>
          <ActivityIndicator size="small" color="#FFFFFF" />
        </>
      ) : (
        <>
          <Image
            source={require("@/assets/images/icons/solflare/solflare-icon.png")}
            style={styles.solflareIcon}
            resizeMode="contain"
          />
        </>
      )}
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  circularButton: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    backgroundColor: "#202020",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: hp(0.5) },
    shadowOpacity: 0.2,
    shadowRadius: wp(2),
    elevation: 5,
  },
  solflareIcon: {
    width: wp(12.5),
    height: wp(12.5),
  },
});

export default SolflareConnect;
