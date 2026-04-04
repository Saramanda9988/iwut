import { Stack } from "expo-router";
import { ScrollView, Switch } from "react-native";

import { MenuGroup, MenuItem } from "@/components/ui/menu-item";
import { useSettingsStore } from "@/store/settings";

export default function SettingsScreen() {
  const hapticFeedback = useSettingsStore((s) => s.hapticFeedback);
  const setHapticFeedback = useSettingsStore((s) => s.setHapticFeedback);

  return (
    <>
      <Stack.Screen options={{ title: "通用设置" }} />
      <ScrollView
        className="flex-1 bg-neutral-100 dark:bg-neutral-900"
        contentContainerClassName="px-4 pt-4"
      >
        <MenuGroup title="交互">
          <MenuItem
            icon="vibration"
            iconBg="#AF52DE"
            label="触感反馈"
            showArrow={false}
            right={
              <Switch
                value={hapticFeedback}
                onValueChange={setHapticFeedback}
              />
            }
          />
        </MenuGroup>
      </ScrollView>
    </>
  );
}
