import { createMMKV, type MMKV } from "react-native-mmkv";
import { createJSONStorage } from "zustand/middleware";

let _mmkv: MMKV | null = null;

export function getMMKV(): MMKV {
  if (!_mmkv) {
    _mmkv = createMMKV();
  }
  return _mmkv;
}

export const zustandStorage = createJSONStorage(() => ({
  getItem: (name: string) => getMMKV().getString(name) ?? null,
  setItem: (name: string, value: string) => getMMKV().set(name, value),
  removeItem: (name: string) => getMMKV().remove(name),
}));
