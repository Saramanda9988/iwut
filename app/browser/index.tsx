import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect, useRef } from "react";
import { View } from "react-native";
import { WebView, type WebViewNavigation } from "react-native-webview";

import { useZhlgdAutoLogin } from "@/hooks/use-zhlgd-autologin";

export default function BrowserScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const navigation = useNavigation();
  const webview = useRef<WebView>(null);
  const { onLoadEnd: autoLoginOnLoadEnd } = useZhlgdAutoLogin(webview);

  useLayoutEffect(() => {
    navigation.setOptions({ title: uri.split("/").pop() });
  }, [navigation, uri]);

  const onNavigationStateChange = (navState: WebViewNavigation) => {
    if (navState.title) {
      navigation.setOptions({ title: navState.title });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webview}
        source={{ uri }}
        style={{ flex: 1 }}
        javaScriptEnabled
        originWhitelist={["*"]}
        onNavigationStateChange={onNavigationStateChange}
        onLoadEnd={autoLoginOnLoadEnd}
      />
    </View>
  );
}
