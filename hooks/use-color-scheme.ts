import { useThemeStore } from "@/store/theme";
import { useColorScheme as useRNColorScheme } from "react-native";

export function useColorScheme() {
  const systemScheme = useRNColorScheme();
  const themeMode = useThemeStore((s) => s.themeMode);

  if (themeMode === "system") {
    return systemScheme ?? "light";
  }
  return themeMode;
}
