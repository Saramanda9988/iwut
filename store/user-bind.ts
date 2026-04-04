import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { zustandStorage } from "@/lib/storage";

interface UserBindStore {
  isBound: boolean;
  studentId: string;
  studentName: string;
  bind: (studentId: string, studentName: string, password: string) => void;
  unbind: () => void;
  getCredentials: () => Promise<{
    username: string;
    password: string;
  } | null>;
}

export const useUserBindStore = create<UserBindStore>()(
  persist(
    (set, get) => ({
      isBound: false,
      studentId: "",
      studentName: "",

      bind: (studentId, studentName, password) => {
        SecureStore.setItemAsync("zhlgd_password", password);
        set({ isBound: true, studentId, studentName });
      },

      unbind: () => {
        SecureStore.deleteItemAsync("zhlgd_password");
        set({ isBound: false, studentId: "", studentName: "" });
      },

      getCredentials: async () => {
        const { isBound, studentId } = get();
        if (!isBound || !studentId) return null;
        const password = await SecureStore.getItemAsync("zhlgd_password");
        if (!password) return null;
        return { username: studentId, password };
      },
    }),
    {
      name: "user-bind",
      storage: zustandStorage,
      partialize: (state) => ({
        isBound: state.isBound,
        studentId: state.studentId,
        studentName: state.studentName,
      }),
    },
  ),
);
