import { Tabs } from "expo-router";
import { Colors } from "@/theme/colors";
import { Handshake, History, House, User } from "lucide-react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Platform } from "react-native";

export default function DriverLayout() {
  const isIOS = Platform.OS === "ios";
  return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: "#fff",
          tabBarActiveBackgroundColor: Colors.background,
          tabBarInactiveBackgroundColor: Colors.background,
          tabBarStyle: {
            backgroundColor: Colors.background,
            borderTopWidth: 0,
            height: isIOS ? hp(8) : hp(6),
          }
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <House color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "History",
            tabBarIcon: ({ color }) => <History color={color} />,
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: "Community",
            tabBarIcon: ({ color }) => <Handshake color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => <User color={color} />,
          }}
        />
      </Tabs>
  );
}
