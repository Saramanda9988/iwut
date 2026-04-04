import { create } from "zustand";
import { persist } from "zustand/middleware";

import { zustandStorage } from "@/lib/storage";

interface SettingsStore {
  hapticFeedback: boolean;
  setHapticFeedback: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      hapticFeedback: true,
      setHapticFeedback: (value: boolean) => set({ hapticFeedback: value }),
    }),
    {
      name: "settings",
      storage: zustandStorage,
    },
  ),
);
