import * as Haptics from "expo-haptics";
import { useCallback } from "react";

import { useSettingsStore } from "@/store/settings";

export function useHaptics() {
  const enabled = useSettingsStore((s) => s.hapticFeedback);

  return useCallback(() => {
    if (enabled) Haptics.selectionAsync();
  }, [enabled]);
}
