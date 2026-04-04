import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { zustandStorage } from "@/lib/storage";

interface WlanStore {
  username: string;
  hasSaved: boolean;
  save: (username: string, password: string) => void;
  clear: () => void;
  getCredentials: () => Promise<{
    username: string;
    password: string;
  } | null>;
}

export const useWlanStore = create<WlanStore>()(
  persist(
    (set, get) => ({
      username: "",
      hasSaved: false,

      save: (username, password) => {
        SecureStore.setItemAsync("wlan_password", password);
        set({ username, hasSaved: true });
      },

      clear: () => {
        SecureStore.deleteItemAsync("wlan_password");
        set({ username: "", hasSaved: false });
      },

      getCredentials: async () => {
        const { hasSaved, username } = get();
        if (!hasSaved || !username) return null;
        const password = await SecureStore.getItemAsync("wlan_password");
        if (!password) return null;
        return { username, password };
      },
    }),
    {
      name: "wlan",
      storage: zustandStorage,
      partialize: (state) => ({
        username: state.username,
        hasSaved: state.hasSaved,
      }),
    },
  ),
);
