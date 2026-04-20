import Constants from "expo-constants";
import { Directory, File, Paths } from "expo-file-system";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { ActivityIndicator, ScrollView, Switch } from "react-native";
import { FileLogger } from "react-native-file-logger";
import Toast from "react-native-toast-message";

import { ConfirmSheet } from "@/components/ui/confirm-sheet";
import { MenuGroup, MenuItem } from "@/components/ui/menu-item";
import { reportError } from "@/lib/report";
import { useScheduleStore } from "@/store/schedule";
import { useSettingsStore } from "@/store/settings";

export default function SettingsScreen() {
  const hapticFeedback = useSettingsStore((s) => s.hapticFeedback);
  const setHapticFeedback = useSettingsStore((s) => s.setHapticFeedback);
  const openCourseOnLaunch = useSettingsStore((s) => s.openCourseOnLaunch);
  const setOpenCourseOnLaunch = useSettingsStore(
    (s) => s.setOpenCourseOnLaunch,
  );

  const [clearVisible, setClearVisible] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [exporting, setExporting] = useState(false);

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

      const Device = await import("expo-device");

      const version = Constants.expoConfig?.version;
      const commit = Constants.expoConfig?.extra?.commit;

      const header = [
        `Version: ${version}, Commit: ${commit}`,
        `Device: ${Device.manufacturer} ${Device.modelName} ${Device.modelId}`,
        `OS: ${Device.osName} ${Device.osVersion} ${Device.osBuildId} ${Device.osInternalBuildId} ${Device.osBuildFingerprint}`,
        `Architecture: ${Device.supportedCpuArchitectures}`,
        `Memory: ${Device.totalMemory}`,
        `Time: ${new Date().toISOString()}`,
        "",
      ].join("\n");

      let log = header;
      for (const path of paths) {
        const file = new File(path);
        const content = file.text();
        log += content + "\n";
      }

      const file = new File(new Directory(Paths.cache), "iwut-logs.txt");
      await file.write(log);
      await Sharing.shareAsync(file.uri, {
        UTI: "public.plain-text",
        mimeType: "text/plain",
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
    </>
  );
}
