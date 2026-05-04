import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";

import {
  cancelAll,
  createChannel,
  scheduleCountdown,
} from "@/modules/notification";
import { SECTION_TIMES } from "@/services/course-time";
import { useCourseStore } from "@/store/course";
import { useSettingsStore } from "@/store/settings";
import { getCurrentWeek, getTermWeekMonday } from "@/lib/date";

const CHANNEL_ID = "course_reminder";
const BACKGROUND_TASK_NAME = "course-reminder-refresh";
const SCHEDULE_WEEKS = 2;

TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
    await initNotificationChannel();
    await scheduleWeeklyReminders();
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export async function registerBackgroundRefresh(): Promise<void> {
  const isRegistered =
    await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);
  if (isRegistered) return;

  await BackgroundTask.registerTaskAsync(BACKGROUND_TASK_NAME, {
    minimumInterval: 60 * 6,
  });
}

export async function unregisterBackgroundRefresh(): Promise<void> {
  const isRegistered =
    await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);
  if (!isRegistered) return;

  await BackgroundTask.unregisterTaskAsync(BACKGROUND_TASK_NAME);
}

export async function initNotificationChannel(): Promise<void> {
  if (Platform.OS === "android") {
    await createChannel(CHANNEL_ID, "课程提醒", "在课程开始前显示倒计时通知");
  }
}

export async function scheduleWeeklyReminders(): Promise<void> {
  const { courseReminder, reminderMinutes } = useSettingsStore.getState();

  await cancelAll();

  if (!courseReminder) return;

  const { courses, termStart } = useCourseStore.getState();
  if (!termStart || courses.length === 0) return;

  const currentWeek = getCurrentWeek(termStart);
  const now = Date.now();
  let idCounter = 0;

  for (let offset = 0; offset < SCHEDULE_WEEKS; offset++) {
    const week = currentWeek + offset;
    const monday = getTermWeekMonday(termStart, week);
    if (!monday) continue;

    for (const course of courses) {
      if (week < course.weekStart || week > course.weekEnd) continue;

      const sectionTime = SECTION_TIMES[course.sectionStart];
      if (!sectionTime) continue;

      const [startTimeStr] = sectionTime;
      const [startH, startM] = startTimeStr.split(":").map(Number);

      const courseDate = new Date(monday);
      courseDate.setDate(courseDate.getDate() + course.day - 1);
      courseDate.setHours(startH, startM, 0, 0);

      const classStartMs = courseDate.getTime();
      const triggerAtMs = classStartMs - reminderMinutes * 60 * 1000;

      if (triggerAtMs <= now) continue;

      await scheduleCountdown(
        idCounter++,
        CHANNEL_ID,
        course.name,
        `${startTimeStr} · ${course.room}`,
        triggerAtMs,
        classStartMs,
        true,
        true,
      );
    }
  }
}
