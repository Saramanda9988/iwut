import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { WebView } from "react-native-webview";

export default function BrowserScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>();

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri }}
        style={{ flex: 1 }}
        javaScriptEnabled
        originWhitelist={["*"]}
      />
    </View>
  );
}
