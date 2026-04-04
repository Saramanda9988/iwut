import { ReactNode, useEffect, useState } from "react";
import { Keyboard, Modal, Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function useKeyboardHeight() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = Keyboard.addListener(showEvent, (e) =>
      setHeight(e.endCoordinates.height),
    );
    const onHide = Keyboard.addListener(hideEvent, () => setHeight(0));

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  return height;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
}: Readonly<{
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}>) {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          className="rounded-t-2xl bg-white dark:bg-neutral-800"
          style={{
            paddingBottom:
              keyboardHeight > 0 ? keyboardHeight + 24 : insets.bottom || 24,
          }}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="items-center py-3">
            <View className="h-1 w-10 rounded-full bg-neutral-300 dark:bg-neutral-600" />
          </View>
          {title && (
            <Text className="px-5 pb-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {title}
            </Text>
          )}
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
