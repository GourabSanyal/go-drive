import React from "react";
import { Stack } from "expo-router";
import Header from "@/components/common/Header";

export default function HomeLayout() {
  return (
    <>
      <Header />
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: "#fff",
          },
          headerShown: false,
        }}
      />
    </>
  );
}
