import Constants from "expo-constants";
import * as Device from "expo-device";
import { Directory, File, Paths } from "expo-file-system";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import * as Sharing from "expo-sharing";
import JSZip from "jszip";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { FileLogger } from "react-native-file-logger";
import Toast from "react-native-toast-message";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ConfirmSheet } from "@/components/ui/confirm-sheet";
import { MenuGroup, MenuItem } from "@/components/ui/menu-item";
import { reportError } from "@/lib/report";
import { scheduleWeeklyReminders } from "@/services/course-notification";
import { useScheduleStore } from "@/store/schedule";
import { useSettingsStore } from "@/store/settings";

const REMINDER_PRESETS = [15, 30, 60];

export default function SettingsScreen() {
  const hapticFeedback = useSettingsStore((s) => s.hapticFeedback);
  const setHapticFeedback = useSettingsStore((s) => s.setHapticFeedback);
  const openCourseOnLaunch = useSettingsStore((s) => s.openCourseOnLaunch);
  const setOpenCourseOnLaunch = useSettingsStore(
    (s) => s.setOpenCourseOnLaunch,
  );
  const courseReminder = useSettingsStore((s) => s.courseReminder);
  const setCourseReminder = useSettingsStore((s) => s.setCourseReminder);
  const reminderMinutes = useSettingsStore((s) => s.reminderMinutes);
  const setReminderMinutes = useSettingsStore((s) => s.setReminderMinutes);

  const [clearVisible, setClearVisible] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [reminderSheetVisible, setReminderSheetVisible] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("");
  const customInputRef = useRef<TextInput>(null);

  const handleCourseReminderChange = async (value: boolean) => {
    setCourseReminder(value);
    await scheduleWeeklyReminders();
  };

  const handleReminderMinutesChange = async (value: number) => {
    if (value < 1 || value > 120) return;
    setReminderMinutes(value);
    setCustomMinutes("");
    setReminderSheetVisible(false);
    if (courseReminder) {
      await scheduleWeeklyReminders();
    }
  };

  const handleCustomMinutesSubmit = () => {
    const val = parseInt(customMinutes, 10);
    if (!val || val < 1 || val > 120) {
      Toast.show({
        type: "error",
        text1: "请输入 1-120 之间的数字",
        position: "bottom",
      });
      return;
    }
    handleReminderMinutesChange(val);
  };

  const handleClearCache = async () => {
    setClearVisible(false);
    setClearing(true);
    try {
      await Image.clearDiskCache();

      const docDir = new Directory(Paths.document);
      const currentBgUri = useScheduleStore.getState().backgroundImageUri;
      for (const entry of docDir.listAsRecords()) {
        if (
          !entry.isDirectory &&
          entry.uri.includes("schedule-bg-") &&
          entry.uri.endsWith(".jpg")
        ) {
          const file = new File(entry.uri);
          if (file.uri !== currentBgUri) {
            file.delete();
          }
        }
      }

      const { createMMKV } = await import("react-native-mmkv");
      createMMKV({ id: "rpc_apps" }).clearAll();

      Toast.show({
        type: "success",
        text1: "缓存已清除",
        position: "bottom",
      });
    } catch (e) {
      reportError(e, { module: "settings", action: "clear-cache" });
      Toast.show({
        type: "error",
        text1: "清除失败",
        position: "bottom",
      });
    } finally {
      setClearing(false);
    }
  };

  const handleExportLogs = async () => {
    setExporting(true);

    try {
      const paths = await FileLogger.getLogFilePaths();

      if (paths.length === 0) {
        Toast.show({
          type: "info",
          text1: "暂无日志",
          position: "bottom",
        });
        return;
      }

      const version = Constants.expoConfig?.version;
      const commit = Constants.expoConfig?.extra?.commit;

      const info = [
        `Version: ${version}, Commit: ${commit}`,
        `Device: ${Device.manufacturer} ${Device.modelName} ${Device.modelId}`,
        `OS: ${Device.osName} ${Device.osVersion} ${Device.osBuildId} ${Device.osInternalBuildId} ${Device.osBuildFingerprint}`,
        `Architecture: ${Device.supportedCpuArchitectures}`,
        `Memory: ${Device.totalMemory}`,
        `Time: ${new Date().toISOString()}`,
      ].join("\n");

      const archive = new JSZip();
      archive.file("info.txt", info);

      for (const p of paths) {
        const uri = p.startsWith("file://") ? p : `file://${p}`;
        const src = new File(uri);
        if (src.exists) {
          const content = await src.text();
          archive.file(src.name, content);
        }
      }

      const zipData = await archive.generateAsync({ type: "uint8array" });
      const zipName = `dev.tokenteam.net_logs_${Date.now()}.zip`;
      const zipFile = new File(Paths.cache, zipName);
      await zipFile.write(zipData);

      await Sharing.shareAsync(zipFile.uri, {
        UTI: "public.zip-archive",
        mimeType: "application/zip",
        dialogTitle: "导出日志",
      });
    } catch (e) {
      reportError(e, { module: "settings", action: "export-logs" });
      Toast.show({
        type: "error",
        text1: "导出失败",
        position: "bottom",
      });
    } finally {
      setExporting(false);
    }
  };

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
          <MenuItem
            icon="open-in-new"
            iconBg="#34C759"
            label="将课程页设为首页"
            showArrow={false}
            right={
              <Switch
                value={openCourseOnLaunch}
                onValueChange={setOpenCourseOnLaunch}
              />
            }
          />
        </MenuGroup>

        {Platform.OS === "android" && (
          <MenuGroup title="通知">
            <MenuItem
              icon="notifications-active"
              iconBg="#FF9500"
              label="课前提醒"
              showArrow={false}
              right={
                <Switch
                  value={courseReminder}
                  onValueChange={handleCourseReminderChange}
                />
              }
            />
            {courseReminder && (
              <MenuItem
                icon="schedule"
                iconBg="#5856D6"
                label="提醒时间"
                showArrow
                right={
                  <Text className="text-sm text-neutral-500">
                    提前 {reminderMinutes} 分钟
                  </Text>
                }
                onPress={() => setReminderSheetVisible(true)}
              />
            )}
          </MenuGroup>
        )}

        <MenuGroup title="存储">
          <MenuItem
            icon="delete-outline"
            iconBg="#FF3B30"
            label="清除缓存"
            showArrow={false}
            right={clearing ? <ActivityIndicator size="small" /> : undefined}
            onPress={() => setClearVisible(true)}
          />
          <MenuItem
            icon="description"
            iconBg="#007AFF"
            label="导出日志"
            showArrow={false}
            right={exporting ? <ActivityIndicator size="small" /> : undefined}
            onPress={handleExportLogs}
          />
        </MenuGroup>
      </ScrollView>

      <ConfirmSheet
        visible={clearVisible}
        onClose={() => setClearVisible(false)}
        title="清除缓存"
        description="将清除缓存和临时数据，不会影响已保存的内容。"
        confirmText="清除"
        destructive
        onConfirm={handleClearCache}
      />

      <BottomSheet
        visible={reminderSheetVisible}
        onClose={() => setReminderSheetVisible(false)}
        title="提醒时间"
      >
        {REMINDER_PRESETS.map((mins) => (
          <MenuItem
            key={mins}
            icon={reminderMinutes === mins ? "check" : "radio-button-unchecked"}
            iconBg={reminderMinutes === mins ? "#34C759" : "#C7C7CC"}
            label={`提前 ${mins} 分钟`}
            showArrow={false}
            onPress={() => handleReminderMinutesChange(mins)}
          />
        ))}
        <View className="flex-row items-center px-4 py-3">
          <Text className="text-base text-neutral-900 dark:text-neutral-100">
            自定义
          </Text>
          <TextInput
            ref={customInputRef}
            className="mx-3 h-9 flex-1 rounded-lg border border-neutral-300 px-3 text-center text-base text-neutral-900 dark:border-neutral-600 dark:text-neutral-100"
            keyboardType="number-pad"
            maxLength={3}
            placeholder="1-120"
            placeholderTextColor="#9CA3AF"
            value={customMinutes}
            onChangeText={setCustomMinutes}
            onSubmitEditing={handleCustomMinutesSubmit}
            returnKeyType="done"
          />
          <Text className="text-base text-neutral-500">分钟</Text>
        </View>
      </BottomSheet>
    </>
  );
}
