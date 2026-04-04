import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MenuGroup, MenuItem } from "@/components/ui/menu-item";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useUserBindStore } from "@/store/user-bind";

function UserCard() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const { isBound, studentId, studentName, unbind } = useUserBindStore();

  if (!isBound) {
    return (
      <Pressable
        className="mb-4 flex-row items-center rounded-2xl bg-white px-4 py-5 active:bg-neutral-50 dark:bg-neutral-800 dark:active:bg-neutral-700"
        onPress={() => router.push("/browser/bind")}
      >
        <View
          className="h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: isDark ? "#1e3a5f" : "#dbeafe" }}
        >
          <MaterialIcons
            name="person-add"
            size={24}
            color={isDark ? "#60a5fa" : "#3b82f6"}
          />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            绑定智慧理工大
          </Text>
          <Text className="mt-0.5 text-sm text-neutral-400 dark:text-neutral-500">
            绑定后可自动登录校园服务
          </Text>
        </View>
        <MaterialIcons
          name="chevron-right"
          size={20}
          color={isDark ? "#525252" : "#a3a3a3"}
        />
      </Pressable>
    );
  }

  const handleUnbind = () => {
    Alert.alert("解除绑定", "确定要解除智慧理工大账号绑定吗？", [
      { text: "取消", style: "cancel" },
      { text: "解绑", style: "destructive", onPress: unbind },
    ]);
  };

  return (
    <View className="mb-4 rounded-2xl bg-white px-4 py-5 dark:bg-neutral-800">
      <View className="flex-row items-center">
        <View
          className="h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: isDark ? "#14532d" : "#dcfce7" }}
        >
          <MaterialIcons
            name="person"
            size={24}
            color={isDark ? "#4ade80" : "#16a34a"}
          />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {studentName}
          </Text>
          <Text className="mt-0.5 text-sm text-neutral-400 dark:text-neutral-500">
            {studentId}
          </Text>
        </View>
        <Pressable
          className="rounded-lg px-3 py-1.5 active:bg-neutral-100 dark:active:bg-neutral-700"
          onPress={handleUnbind}
        >
          <Text className="text-sm text-red-500">解绑</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function UserScreen() {
  return (
    <View className="flex-1 bg-neutral-100 dark:bg-neutral-900">
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          className="flex-1 px-4 pt-4"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <UserCard />
          <MenuGroup title="工具">
            <MenuItem
              icon="wifi"
              iconBg="#007AFF"
              label="校园网连接"
              href="/user/wlan"
            />
          </MenuGroup>
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
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
