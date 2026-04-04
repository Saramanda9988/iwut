import { useUserBindStore } from "@/store/user-bind";
import { router, Stack } from "expo-router";
import { useRef } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { WebView, type WebViewNavigation } from "react-native-webview";

export default function BindScreen() {
  const webview = useRef<WebView>(null);
  const pendingCredentials = useRef<{
    username: string;
    password: string;
  } | null>(null);
  const isBound = useRef(false);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: "智慧理工大绑定" }} />

      <WebView
        ref={webview}
        source={{ uri: "https://zhlgd.whut.edu.cn/tpass/login" }}
        style={{ flex: 1 }}
        javaScriptEnabled
        originWhitelist={["*"]}
        injectedJavaScript={`(function(){
  function track(){
    var u=document.querySelector('#un');
    var p=document.querySelector('#pd');
    if(!u||!p){setTimeout(track,300);return;}
    function send(){
      if(u.value&&p.value){
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type:'credentials',username:u.value,password:p.value
        }));
      }
    }
    u.addEventListener('input',send);
    p.addEventListener('input',send);
    u.addEventListener('change',send);
    p.addEventListener('change',send);
    var btn=document.querySelector('#index_login_btn');
    if(btn)btn.addEventListener('click',send);
    document.addEventListener('submit',send,true);
  }
  track();
})();true;`}
        onNavigationStateChange={(state: WebViewNavigation) => {
          if (isBound.current) return;

          const isLoginPage = state.url.includes(
            "zhlgd.whut.edu.cn/tpass/login",
          );

          if (!isLoginPage && !state.loading && pendingCredentials.current) {
            isBound.current = true;
            const { username, password } = pendingCredentials.current;

            useUserBindStore.getState().bind(username, username, password);

            Toast.show({
              type: "success",
              text1: "绑定成功",
              text2: `已绑定账号 ${username}`,
              position: "bottom",
            });

            router.back();
          }
        }}
        onMessage={(event: { nativeEvent: { data: string } }) => {
          try {
            const msg = JSON.parse(event.nativeEvent.data);
            if (msg.type === "credentials") {
              pendingCredentials.current = {
                username: msg.username,
                password: msg.password,
              };
            }
          } catch {}
        }}
      />
    </View>
  );
}
