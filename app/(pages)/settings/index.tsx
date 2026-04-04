import { Stack } from "expo-router";
import { ScrollView } from "react-native";

export default function SettingsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "通用设置" }} />
      <ScrollView
        className="flex-1 bg-neutral-100 dark:bg-neutral-900"
        contentContainerClassName="px-4 pt-4"
      />
    </>
  );
}
