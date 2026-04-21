import { router, Stack } from "expo-router";
import { useRef } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { WebView, type WebViewNavigation } from "react-native-webview";

import { useZhlgdAutoLogin } from "@/hooks/use-zhlgd-autologin";
import { reportError } from "@/lib/report";
import { type Course, useCourseStore } from "@/store/course";

const LOGIN_URL =
  "https://zhlgd.whut.edu.cn/tpass/login?service=https%3A%2F%2Fjwxt.whut.edu.cn%2Fjwapp%2Fsys%2Fhomeapp%2Findex.do%3FforceCas%3D1";

const HOME_PREFIX =
  "https://jwxt.whut.edu.cn/jwapp/sys/homeapp/home/index.html";

const FETCH_SCRIPT = `(async function() {
  try {
    await fetch(
      '/jwapp/sys/homeapp/api/home/changeAppRole.do?appRole=ef212c48c8f84be79acbd9d81b090f51',
      {method:'POST', credentials:'include', headers:{'Content-Type':'application/x-www-form-urlencoded'}}
    );
    var ud = ((await (await fetch('/jwapp/sys/homeapp/api/home/currentUser.do', {
      method:'GET', credentials:'include', headers:{'Fetch-Api':'true'}
    })).json()).datas) || {};
    var xh = ud.userId || '';
    var term = (ud.welcomeInfo && ud.welcomeInfo.xnxqdm) || '';
    var log = function(s){ window.ReactNativeWebView.postMessage(JSON.stringify({type:'debug', message:s})); };
    log('user=' + xh + ' term=' + term);
    if (!xh || !term) {
      window.ReactNativeWebView.postMessage(JSON.stringify({type:'error', message:'获取用户信息失败'}));
      return;
    }
    var resp = await fetch('/jwapp/sys/kcbcxby/modules/xskcb/cxxskcb.do', {
      method:'POST', credentials:'include',
      headers:{
        'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With':'XMLHttpRequest',
        'Accept':'application/json, text/javascript, */*; q=0.01'
      },
      body:'XH=' + encodeURIComponent(xh) + '&XNXQDM=' + encodeURIComponent(term)
    });
    var text = await resp.text();
    log(text.substring(0, 2000));
    var data = JSON.parse(text);
    var rows = data.datas && data.datas.cxxskcb && data.datas.cxxskcb.rows;
    log('rows=' + (rows ? rows.length : 0));
    if (!rows || !rows.length) {
      window.ReactNativeWebView.postMessage(JSON.stringify({type:'error', message:'当前学期(' + term + ')无课程数据'}));
      return;
    }
    var courses = [];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i], re = /1+/g, m;
      while ((m = re.exec(r.SKZC || '')) !== null) {
        courses.push({
          name: r.KCM || '', room: r.JASMC || '', teacher: r.SKJS || '',
          day: r.SKXQ, sectionStart: r.KSJC, sectionEnd: r.JSJC,
          weekStart: m.index + 1, weekEnd: m.index + m[0].length
        });
      }
    }
    var tp = term.split('-');
    var ljcResp = await fetch('/jwapp/sys/kcbcxby/modules/xskcb/cxxljc.do', {
      method:'POST', credentials:'include',
      headers:{
        'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With':'XMLHttpRequest'
      },
      body:'XN=' + encodeURIComponent(tp[0] + '-' + tp[1]) + '&XQ=' + encodeURIComponent(tp[2])
    });
    var ljcData = await ljcResp.json();
    var ljcRows = ljcData.datas && ljcData.datas.cxxljc && ljcData.datas.cxxljc.rows;
    var termStart = (ljcRows && ljcRows[0] && ljcRows[0].XQKSRQ) ? ljcRows[0].XQKSRQ.split(' ')[0] : '';
    log('parsed ' + courses.length + ' courses, termStart=' + termStart);
    window.ReactNativeWebView.postMessage(JSON.stringify({type:'courses', data: courses, termStart: termStart}));
  } catch(e) {
    window.ReactNativeWebView.postMessage(JSON.stringify({type:'error', message: e.message || ''}));
  }
})(); true;`;

export default function BachelorCourseScreen() {
  const injected = useRef(false);
  const webview = useRef<WebView>(null);
  const { onLoadEnd: autoLoginOnLoadEnd } = useZhlgdAutoLogin(webview);

  const handleNavStateChange = (state: WebViewNavigation) => {
    if (state.loading) return;
    if (!injected.current && state.url.startsWith(HOME_PREFIX)) {
      injected.current = true;
      webview.current?.injectJavaScript(FETCH_SCRIPT);
    }
  };

  const handleMessage = (event: { nativeEvent: { data: string } }) => {
    let msg: any;
    try {
      msg = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    if (!msg?.type) return;

    if (msg.type === "debug") {
      console.log(msg.message);
      return;
    }

    if (msg.type === "error") {
      injected.current = false;
      reportError(new Error(msg.message), { module: "course-bachelor" });
      Toast.show({
        type: "error",
        text1: "导入失败",
        text2: msg.message || "请检查网络连接并重试",
        position: "bottom",
      });
      return;
    }

    if (msg.type === "courses") {
      const courses: Course[] = (msg.data as any[]).map((c: any) => ({
        name: c.name,
        room: c.room,
        teacher: c.teacher,
        day: c.day,
        sectionStart: c.sectionStart,
        sectionEnd: c.sectionEnd,
        weekStart: c.weekStart,
        weekEnd: c.weekEnd,
      }));

      if (courses.length === 0) {
        injected.current = false;
        Toast.show({
          type: "error",
          text1: "导入失败",
          text2: "课表数据解析失败",
          position: "bottom",
        });
        return;
      }

      const store = useCourseStore.getState();
      store.setCourses(courses);
      if (msg.termStart) store.setTermStart(msg.termStart);
      Toast.show({
        type: "success",
        text1: "导入成功",
        text2: "好耶！",
        position: "bottom",
      });
      router.back();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: "本科生课表导入" }} />

      <WebView
        source={{ uri: LOGIN_URL }}
        style={{ flex: 1 }}
        javaScriptEnabled
        domStorageEnabled
        thirdPartyCookiesEnabled
        originWhitelist={["*"]}
        onLoadEnd={autoLoginOnLoadEnd}
        onNavigationStateChange={handleNavStateChange}
        onMessage={handleMessage}
        ref={webview}
      />
    </View>
  );
}
