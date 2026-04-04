import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MenuGroup, MenuItem } from "@/components/ui/menu-item";

export default function UserScreen() {
  return (
    <View className="flex-1 bg-neutral-100 dark:bg-neutral-900">
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 px-4 pt-4">
          <MenuGroup title="设置">
            <MenuItem
              icon="settings"
              iconBg="#8E8E93"
              label="通用"
              href="/settings"
            />
            <MenuItem
              icon="palette"
              iconBg="#5856D6"
              label="外观"
              href="/settings/appearance"
            />
            <MenuItem
              icon="calendar-today"
              iconBg="#34C759"
              label="课表"
              href="/settings/calendar"
            />
          </MenuGroup>
          <MenuGroup title="其他">
            <MenuItem icon="info" iconBg="#007AFF" label="关于" href="/about" />
          </MenuGroup>
        </View>
      </SafeAreaView>
    </View>
  );
}
