import React from "react";
import CustomText from "@/components/ui/CustomText";
import { ScrollView, TouchableOpacity } from "react-native";
import { settingsMenuStyles as styles } from "./styles";
import { LogOut } from "lucide-react-native";
import { Colors } from "@/theme/colors";
import Check from "@/assets/images/profile/check.svg";
import Settings from "@/assets/images/profile/settings.svg";
import Wallet from "@/assets/images/profile/wallet.svg";
import FAQ from "@/assets/images/profile/faq.svg";
import Note from "@/assets/images/profile/note.svg";
import Manage from "@/assets/images/profile/manage.svg";
import { useRouter } from "expo-router";
import { authStorage } from "@/src/utils/storage/authStorage";
import { useSession } from "@/src/hooks/session";
import { Alert } from "react-native";

export default function SettingsMenu() {
  const router = useRouter();
  const { clearSession } = useSession();

  const handleLogout = async () => {
    try {
      // Get current auth provider to determine logout method
      const authProvider = authStorage.getProvider();
      console.log(`Logging out user with provider: ${authProvider}`);

      // Handle Solana wallet logout if using wallet auth
      if (authProvider === "mwa" || authProvider === "solana") {
        const authToken = authStorage.getWalletAuthToken();
        if (authToken) {
          // In a real implementation, you would deauthorize the wallet
          // await SolanaWalletAdapter.deauthorize(authToken);
          console.log("Wallet deauthorized");
        }
      }

      // Clear all auth data regardless of provider
      const clearSuccess = authStorage.clearAuth();

      // Also clear the session data
      clearSession();

      if (clearSuccess) {
        console.log("✅ Auth data and session cleared successfully");
        // Navigate to login screen
        router.replace("/auth/login");
      } else {
        throw new Error("Failed to clear auth data");
      }
    } catch (error) {
      console.error("❌ Error during logout:", error);
      Alert.alert(
        "Logout Error",
        "There was a problem logging out. Please try again.",
        [{ text: "OK" }]
      );
    }
  };
  const SETTINGS = [
    {
      icon: <Check width={24} height={24} />,
      title: "2-Step Verification",
    },
    {
      icon: <Settings width={24} height={24} />,
      title: "Settings",
    },
    {
      icon: <Manage width={24} height={24} />,
      title: "Manage your account",
    },
    {
      icon: <Wallet width={26} height={26} />,
      title: "Payments methods",
    },
    {
      icon: <FAQ width={28} height={28} />,
      title: "FAQs",
    },
    {
      icon: <Note width={24} height={24} />,
      title: "Privacy Policy",
    },
    {
      icon: <Note width={24} height={24} />,
      title: "Terms and condition",
    },
  ];

  return (
    <ScrollView style={styles.settingsCardContainer}>
      {SETTINGS.map((item, i) => {
        return (
          <TouchableOpacity
            activeOpacity={1}
            key={i}
            style={styles.settingsCard}
          >
            {item.icon}
            <CustomText>{item.title}</CustomText>
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity
        onPress={handleLogout}
        activeOpacity={1}
        style={styles.settingsCard}
      >
        <LogOut color={Colors.primary} />
        <CustomText>Logout</CustomText>
      </TouchableOpacity>
    </ScrollView>
  );
}
