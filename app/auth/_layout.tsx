import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      initialRouteName="login"
      screenOptions={{
        contentStyle: {
          backgroundColor: "#fff",
        },
        headerShown: false,
      }}
    />
  );
}
