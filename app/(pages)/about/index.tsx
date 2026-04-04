import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import * as Updates from "expo-updates";
import { useCallback, useRef, useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";

import { IS_DEV } from "@/constants/is-dev";
import { Colors } from "@/constants/theme";
import { VERSION } from "@/constants/version";
import { useColorScheme } from "@/hooks/use-color-scheme";

const icon = require("@/assets/images/icon.png");
const uniLabel = require("@/assets/images/icon_uni_label.svg");

function useCopyState() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const copy = useCallback(async (key: string, value: string) => {
    await Clipboard.setStringAsync(value);
    setCopiedKey(key);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  return { copiedKey, copy };
}

function CopyButton({
  copied,
  onPress,
}: {
  copied: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="ml-2 active:opacity-60"
      onPress={onPress}
      disabled={copied}
    >
      <Ionicons
        name={copied ? "checkmark-circle" : "copy-outline"}
        size={12}
        color={copied ? "#22c55e" : undefined}
        className={copied ? "" : "text-neutral-400 dark:text-neutral-500"}
      />
    </Pressable>
  );
}

export default function AboutScreen() {
  const scheme = useColorScheme();
  const version = `${VERSION}${IS_DEV ? " (Dev)" : ""}`;
  const runtimeVersion = Updates.runtimeVersion;
  const { copiedKey, copy } = useCopyState();

  return (
    <>
      <Stack.Screen options={{ title: "关于" }} />
      <View className="flex-1 items-center bg-neutral-100 pt-10 dark:bg-neutral-900">
        <Image
          source={icon}
          style={{ width: 80, height: 80, borderRadius: 18 }}
        />
        <Text className="mt-4 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          掌上吾理
        </Text>

        <View className="mt-2 flex-row items-center">
          <Text className="text-sm text-neutral-400 dark:text-neutral-500">
            {version}
          </Text>
          <CopyButton
            copied={copiedKey === "version"}
            onPress={() => copy("version", version)}
          />
        </View>

        <View className="mt-0.5 flex-row items-center">
          <Text className="text-xs text-neutral-400 dark:text-neutral-500">
            Runtime {runtimeVersion?.slice(0, 20) ?? "N/A"}
          </Text>
          <CopyButton
            copied={copiedKey === "runtime"}
            onPress={() => copy("runtime", runtimeVersion ?? "N/A")}
          />
        </View>

        <View className="absolute bottom-8 flex-row items-center gap-3">
          <Image
            source={uniLabel}
            style={{
              width: 77,
              height: 18,
              tintColor: Colors[scheme === "dark" ? "dark" : "light"].icon,
            }}
          />
          <View className="h-4 w-px bg-neutral-300 dark:bg-neutral-600" />
          <Pressable
            className="active:opacity-60"
            onPress={() => Linking.openURL("https://github.com/tokenteam/iwut")}
          >
            <Ionicons
              name="logo-github"
              size={24}
              color={Colors[scheme === "dark" ? "dark" : "light"].icon}
            />
          </Pressable>
        </View>
      </View>
    </>
  );
}
