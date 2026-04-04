import { router, Stack } from "expo-router";
import { useRef } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { WebView } from "react-native-webview";

import { getCourse, getTermStart } from "@/services/get-course";
import { useCourseStore } from "@/store/course";

export default function BachelorCourseScreen() {
  const isImporting = useRef(false);
  const webview = useRef<WebView>(null);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: "本科生课表导入" }} />

      <WebView
        source={{
          uri: "https://zhlgd.whut.edu.cn/tpass/login?service=https%3A%2F%2Fjwxt.whut.edu.cn%2Fjwapp%2Fsys%2Fhomeapp%2Findex.do%3FforceCas%3D1",
        }}
        style={{ flex: 1 }}
        javaScriptEnabled
        originWhitelist={["*"]}
        onNavigationStateChange={(state) => {
          if (
            !isImporting.current &&
            state.url.startsWith(
              "https://jwxt.whut.edu.cn/jwapp/sys/homeapp/home/index.html",
            )
          ) {
            isImporting.current = true;

            webview.current?.injectJavaScript(
              `window.ReactNativeWebView.postMessage(document.cookie); true;`,
            );
          }
        }}
        onMessage={(event) => {
          const cookie = event.nativeEvent.data;

          Promise.all([getCourse(cookie), getTermStart()])
            .then(([courses, termStart]) => {
              const store = useCourseStore.getState();
              store.setCourses(courses);
              store.setTermStart(termStart);

              Toast.show({
                type: "success",
                text1: "导入成功",
                text2: "好耶！",
                position: "bottom",
              });

              router.back();
            })
            .catch(() => {
              Toast.show({
                type: "error",
                text1: "导入失败",
                text2: "请检查网络连接并重试",
                position: "bottom",
              });
            });
        }}
        ref={webview}
      />
    </View>
  );
}
