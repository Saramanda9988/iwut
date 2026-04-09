import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Stack } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Toast from "react-native-toast-message";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { MenuGroup, MenuItem } from "@/components/ui/menu-item";
import {
  BUILTIN_PALETTES,
  type ColorPalette,
  validateColorPalette,
} from "@/constants/course-palettes";
import { useScheduleStore } from "@/store/schedule";

function PaletteRow({
  palette,
  isActive,
  onPress,
  onDelete,
}: {
  palette: ColorPalette;
  isActive: boolean;
  onPress: () => void;
  onDelete?: () => void;
}) {
  return (
    <Pressable
      className="flex-row items-center gap-3 px-4 py-3.5 active:bg-neutral-50 dark:active:bg-neutral-700"
      onPress={onPress}
    >
      <Text
        style={{ width: 56 }}
        numberOfLines={1}
        className={`text-sm ${
          isActive
            ? "font-semibold text-blue-500 dark:text-blue-400"
            : "text-neutral-900 dark:text-neutral-100"
        }`}
      >
        {palette.name}
      </Text>
      <View
        style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 6 }}
      >
        {palette.colors.slice(0, 8).map((color, i) => (
          <View
            key={`${color}-${i}`}
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: color,
            }}
          />
        ))}
        {palette.colors.length > 8 && (
          <Text className="text-xs text-neutral-400 dark:text-neutral-500">
            ...
          </Text>
        )}
      </View>
      {onDelete && (
        <Pressable hitSlop={12} onPress={onDelete} style={{ marginRight: 8 }}>
          <Ionicons name="trash-outline" size={16} color="#ef4444" />
        </Pressable>
      )}
      <Ionicons
        name={isActive ? "checkmark-circle" : "ellipse-outline"}
        size={20}
        color={isActive ? "#3b82f6" : "#d4d4d4"}
      />
    </Pressable>
  );
}

export default function PaletteScreen() {
  const colorPalette = useScheduleStore((s) => s.colorPalette);
  const setColorPalette = useScheduleStore((s) => s.setColorPalette);
  const customPalettes = useScheduleStore((s) => s.customPalettes);
  const addCustomPalette = useScheduleStore((s) => s.addCustomPalette);
  const removeCustomPalette = useScheduleStore((s) => s.removeCustomPalette);
  const courseColorOverrides = useScheduleStore((s) => s.courseColorOverrides);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleImport = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (!text.trim()) {
        Toast.show({ type: "error", text1: "剪贴板为空", position: "bottom" });
        return;
      }
      const data = JSON.parse(text);
      if (!validateColorPalette(data)) {
        Toast.show({
          type: "error",
          text1: "配色格式错误",
          text2: "请检查 JSON 格式是否正确",
          position: "bottom",
        });
        return;
      }
      addCustomPalette(data);
      setColorPalette(data);
      Toast.show({
        type: "success",
        text1: `已导入配色方案：${data.name}`,
        position: "bottom",
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "配色格式错误",
        text2: "无法解析 JSON",
        position: "bottom",
      });
    }
  };

  const handleExport = async () => {
    const exported: ColorPalette = {
      ...colorPalette,
      overrides: {
        ...(colorPalette.overrides ?? {}),
        ...courseColorOverrides,
      },
    };
    if (Object.keys(exported.overrides!).length === 0) {
      delete exported.overrides;
    }
    await Clipboard.setStringAsync(JSON.stringify(exported, null, 2));
    Toast.show({
      type: "success",
      text1: "配色方案已复制到剪贴板",
      position: "bottom",
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (colorPalette.name === deleteTarget) {
      setColorPalette(BUILTIN_PALETTES[0]);
    }
    removeCustomPalette(deleteTarget);
    setDeleteTarget(null);
    Toast.show({
      type: "success",
      text1: `已删除「${deleteTarget}」`,
      position: "bottom",
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: "配色方案" }} />
      <ScrollView
        className="flex-1 bg-neutral-100 dark:bg-neutral-900"
        contentContainerClassName="px-4 pt-4 pb-8"
      >
        <View className="mb-4 overflow-hidden rounded-xl bg-white dark:bg-neutral-800">
          {BUILTIN_PALETTES.map((palette, index) => (
            <View key={palette.name}>
              {index > 0 && (
                <View className="mx-4 border-b border-neutral-200 dark:border-neutral-700" />
              )}
              <PaletteRow
                palette={palette}
                isActive={colorPalette.name === palette.name}
                onPress={() => setColorPalette(palette)}
              />
            </View>
          ))}
        </View>

        {customPalettes.length > 0 && (
          <View className="mb-4 overflow-hidden rounded-xl bg-white dark:bg-neutral-800">
            {customPalettes.map((palette, index) => (
              <View key={palette.name}>
                {index > 0 && (
                  <View className="mx-4 border-b border-neutral-200 dark:border-neutral-700" />
                )}
                <PaletteRow
                  palette={palette}
                  isActive={colorPalette.name === palette.name}
                  onPress={() => setColorPalette(palette)}
                  onDelete={() => setDeleteTarget(palette.name)}
                />
              </View>
            ))}
          </View>
        )}

        <MenuGroup title="操作">
          <MenuItem
            icon="content-paste"
            iconBg="#007AFF"
            label="从剪贴板导入"
            onPress={handleImport}
          />
          <MenuItem
            icon="ios-share"
            iconBg="#34C759"
            label="导出到剪贴板"
            onPress={handleExport}
          />
        </MenuGroup>
      </ScrollView>

      <BottomSheet
        visible={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="删除配色"
      >
        <Text className="px-5 pb-4 text-sm text-neutral-500 dark:text-neutral-400">
          确定要删除「{deleteTarget}」吗？
        </Text>
        <View className="mx-5 mb-2 flex-row gap-3">
          <Pressable
            className="flex-1 items-center rounded-xl bg-neutral-200 py-3 active:bg-neutral-300 dark:bg-neutral-700 dark:active:bg-neutral-600"
            onPress={() => setDeleteTarget(null)}
          >
            <Text className="text-base font-medium text-neutral-600 dark:text-neutral-300">
              取消
            </Text>
          </Pressable>
          <Pressable
            className="flex-1 items-center rounded-xl bg-red-500 py-3 active:bg-red-600"
            onPress={confirmDelete}
          >
            <Text className="text-base font-medium text-white">确认删除</Text>
          </Pressable>
        </View>
      </BottomSheet>
    </>
  );
}
