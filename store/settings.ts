import { create } from "zustand";
import { persist } from "zustand/middleware";

import { zustandStorage } from "@/lib/storage";

interface SettingsStore {
  hapticFeedback: boolean;
  openCourseOnLaunch: boolean;
  courseReminder: boolean;
  reminderMinutes: number;
  setHapticFeedback: (value: boolean) => void;
  setOpenCourseOnLaunch: (value: boolean) => void;
  setCourseReminder: (value: boolean) => void;
  setReminderMinutes: (value: number) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      hapticFeedback: true,
      openCourseOnLaunch: false,
      courseReminder: false,
      reminderMinutes: 30,
      setHapticFeedback: (value: boolean) => set({ hapticFeedback: value }),
      setOpenCourseOnLaunch: (value: boolean) =>
        set({ openCourseOnLaunch: value }),
      setCourseReminder: (value: boolean) => set({ courseReminder: value }),
      setReminderMinutes: (value: number) => set({ reminderMinutes: value }),
    }),
    {
      name: "settings",
      storage: zustandStorage,
    },
  ),
);
