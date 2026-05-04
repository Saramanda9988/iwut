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
  const monday = getTermWeekMonday(termStart, currentWeek);
  if (!monday) return;

  const now = Date.now();
  let idCounter = 0;

  for (const course of courses) {
    if (currentWeek < course.weekStart || currentWeek > course.weekEnd) {
      continue;
    }

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
