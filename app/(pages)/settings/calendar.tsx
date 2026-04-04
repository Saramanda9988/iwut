import { Stack } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import Toast from "react-native-toast-message";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { MenuGroup, MenuItem } from "@/components/ui/menu-item";
import { useCourseStore } from "@/store/course";
import { useScheduleStore } from "@/store/schedule";

export default function CalendarSettingsScreen() {
  const scrollWeekend = useScheduleStore((s) => s.scrollWeekend);
  const setScrollWeekend = useScheduleStore((s) => s.setScrollWeekend);
  const showNoonCourse = useScheduleStore((s) => s.showNoonCourse);
  const setShowNoonCourse = useScheduleStore((s) => s.setShowNoonCourse);
  const setCourses = useCourseStore((s) => s.setCourses);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <Stack.Screen options={{ title: "课表设置" }} />
      <ScrollView
        className="flex-1 bg-neutral-100 dark:bg-neutral-900"
        contentContainerClassName="px-4 pt-4"
      >
        <MenuGroup title="显示">
          <MenuItem
            icon="swap-horiz"
            iconBg="#007AFF"
            label="周末课表滚动查看"
            showArrow={false}
            right={
              <Switch value={scrollWeekend} onValueChange={setScrollWeekend} />
            }
          />
          <MenuItem
            icon="wb-sunny"
            iconBg="#FF9500"
            label="显示中课"
            showArrow={false}
            right={
              <Switch
                value={showNoonCourse}
                onValueChange={setShowNoonCourse}
              />
            }
          />
        </MenuGroup>

        <MenuGroup title="数据">
          <MenuItem
            icon="delete-outline"
            iconBg="#FF3B30"
            label="清空课表"
            onPress={() => setShowConfirm(true)}
          />
        </MenuGroup>
      </ScrollView>

      <BottomSheet
        visible={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="清空课表"
      >
        <Text className="px-5 pb-4 text-sm text-neutral-500 dark:text-neutral-400">
          确定要删除所有课程数据吗？此操作不可恢复。
        </Text>
        <View className="mx-5 mb-2 flex-row gap-3">
          <Pressable
            className="flex-1 items-center rounded-xl bg-neutral-200 py-3 active:bg-neutral-300 dark:bg-neutral-700 dark:active:bg-neutral-600"
            onPress={() => setShowConfirm(false)}
          >
            <Text className="text-base font-medium text-neutral-600 dark:text-neutral-300">
              取消
            </Text>
          </Pressable>
          <Pressable
            className="flex-1 items-center rounded-xl bg-red-500 py-3 active:bg-red-600"
            onPress={() => {
              setCourses([]);
              setShowConfirm(false);
              Toast.show({
                type: "success",
                text1: "课表已清空",
                position: "bottom",
              });
            }}
          >
            <Text className="text-base font-medium text-white">确认清空</Text>
          </Pressable>
        </View>
      </BottomSheet>
    </>
  );
}
