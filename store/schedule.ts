import { create } from "zustand";
import { persist } from "zustand/middleware";

import { zustandStorage } from "@/lib/storage";

interface ScheduleStore {
  scrollWeekend: boolean;
  showNoonCourse: boolean;
  setScrollWeekend: (value: boolean) => void;
  setShowNoonCourse: (value: boolean) => void;
}

export const useScheduleStore = create<ScheduleStore>()(
  persist(
    (set) => ({
      scrollWeekend: true,
      showNoonCourse: false,
      setScrollWeekend: (value: boolean) => set({ scrollWeekend: value }),
      setShowNoonCourse: (value: boolean) => set({ showNoonCourse: value }),
    }),
    {
      name: "schedule",
      storage: zustandStorage,
    },
  ),
);
