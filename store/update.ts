import { create } from "zustand";

import { checkUpdate } from "@/services/check-update";

interface UpdateStore {
  hasUpdate: boolean;
  latestVersion: string | null;
  checking: boolean;
  check: () => Promise<void>;
}

export const useUpdateStore = create<UpdateStore>()((set, get) => ({
  hasUpdate: false,
  latestVersion: null,
  checking: false,
  check: async () => {
    if (get().checking) return;
    set({ checking: true });
    try {
      const { hasUpdate, latestVersion } = await checkUpdate();
      set({ hasUpdate, latestVersion });
    } catch {
    } finally {
      set({ checking: false });
    }
  },
}));
