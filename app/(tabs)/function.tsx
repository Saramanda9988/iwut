import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IS_DEV } from "@/constants/is-dev";

export default function FunctionScreen() {
  const [showBrowser, setShowBrowser] = useState(false);
  const [uri, setUri] = useState("");

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {IS_DEV && (
        <View className="flex-1 justify-end items-end px-8 py-2">
          <Pressable onPress={() => setShowBrowser(true)}>
            <Ionicons name="globe-outline" size={24} color="#737373" />
          </Pressable>

          <Modal
            visible={showBrowser}
            transparent
            animationType="fade"
            onRequestClose={() => setShowBrowser(false)}
          >
            <KeyboardAvoidingView
              className="flex-1"
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <Pressable
                className="flex-1 justify-center bg-black/40"
                onPress={() => setShowBrowser(false)}
              >
                <Pressable
                  className="mx-8 rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-800"
                  onPress={() => {}}
                >
                  <View className="mb-4 flex-row items-center gap-2">
                    <Ionicons name="globe-outline" size={20} color="#3b82f6" />
                    <Text className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
                      打开网页
                    </Text>
                  </View>

                  <View className="h-12 flex-row items-center rounded-2xl border border-neutral-200 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-700/50">
                    <TextInput
                      className="flex-1 text-base text-neutral-900 dark:text-neutral-100"
                      style={{
                        height: 48,
                        paddingHorizontal: 8,
                        textAlignVertical: "center",
                      }}
                      value={uri}
                      onChangeText={setUri}
                      autoFocus
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="url"
                      returnKeyType="go"
                      onSubmitEditing={() =>
                        router.push({ pathname: "/browser", params: { uri } })
                      }
                    />
                    <Pressable
                      className="mr-1.5 h-9 w-9 items-center justify-center rounded-xl bg-blue-500 active:bg-blue-600"
                      onPress={() =>
                        router.push({ pathname: "/browser", params: { uri } })
                      }
                    >
                      <Ionicons name="arrow-forward" size={20} color="white" />
                    </Pressable>
                  </View>
                </Pressable>
              </Pressable>
            </KeyboardAvoidingView>
          </Modal>
        </View>
      )}
    </SafeAreaView>
  );
}
