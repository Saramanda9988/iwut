import { Stack } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MenuGroup, MenuItem } from "@/components/ui/menu-item";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { type ThemeMode, useThemeStore } from "@/store/theme";

const themeOptions: { mode: ThemeMode; icon: string; label: string }[] = [
  { mode: "system", icon: "brightness-auto", label: "跟随系统" },
  { mode: "light", icon: "light-mode", label: "浅色模式" },
  { mode: "dark", icon: "dark-mode", label: "深色模式" },
];

const themeLabelMap: Record<ThemeMode, string> = {
  system: "跟随系统",
  light: "浅色模式",
  dark: "深色模式",
};

export default function AppearanceScreen() {
  const scheme = useColorScheme();
  const iconColor = Colors[scheme === "dark" ? "dark" : "light"].icon;
  const tintColor = Colors[scheme === "dark" ? "dark" : "light"].tint;
  const themeMode = useThemeStore((s) => s.themeMode);
  const setThemeMode = useThemeStore((s) => s.setThemeMode);
  const [showThemePicker, setShowThemePicker] = useState(false);

  return (
    <>
      <Stack.Screen options={{ title: "外观设置" }} />
      <ScrollView
        className="flex-1 bg-neutral-100 dark:bg-neutral-900"
        contentContainerClassName="px-4 pt-4"
      >
        <MenuGroup title="主题">
          <MenuItem
            icon="palette"
            iconBg="#5856D6"
            label="主题"
            value={themeLabelMap[themeMode]}
            onPress={() => setShowThemePicker(true)}
          />
        </MenuGroup>
      </ScrollView>

      <BottomSheet
        visible={showThemePicker}
        onClose={() => setShowThemePicker(false)}
      >
        {themeOptions.map((opt) => (
          <Pressable
            key={opt.mode}
            className="flex-row items-center px-5 py-3.5 active:bg-neutral-100 dark:active:bg-neutral-700"
            onPress={() => {
              setThemeMode(opt.mode);
              setShowThemePicker(false);
            }}
          >
            <IconSymbol
              name={opt.icon as any}
              size={22}
              color={themeMode === opt.mode ? tintColor : iconColor}
            />
            <Text
              className={`ml-3 flex-1 text-base ${
                themeMode === opt.mode
                  ? "font-medium text-sky-600 dark:text-white"
                  : "text-neutral-800 dark:text-neutral-200"
              }`}
            >
              {opt.label}
            </Text>
            {themeMode === opt.mode && (
              <IconSymbol name="check" size={20} color={tintColor} />
            )}
          </Pressable>
        ))}
      </BottomSheet>
    </>
  );
}
