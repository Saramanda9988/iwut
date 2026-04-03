import { Tabs } from "expo-router";
import React from "react";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor:
          Colors[colorScheme === "dark" ? "dark" : "light"].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "首页",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="course"
        options={{
          title: "课程",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="event" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="function"
        options={{
          title: "功能",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="apps" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: "我的",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
