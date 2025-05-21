import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: "#fff",
        },
        headerShown: false,
      }}
    />
  );
}
