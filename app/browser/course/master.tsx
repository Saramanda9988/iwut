import { router, Stack } from "expo-router";
import { useRef } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { WebView, type WebViewNavigation } from "react-native-webview";

import { useZhlgdAutoLogin } from "@/hooks/use-zhlgd-autologin";
import { reportError } from "@/lib/report";
import { type Course, useCourseStore } from "@/store/course";

const LOGIN_URL =
  "https://zhlgd.whut.edu.cn/tpass/login?service=https%3a%2f%2fyjsgl.whut.edu.cn%2fcas%2fCasLogin.ashx%3fredirectUrl%3d";

const MAIN_FRAME_PREFIX = "https://yjsgl.whut.edu.cn/MainFrame.htm";

const NAVIGATE_TO_COURSE_SCRIPT = `MenuDataManage.addTab('我的课程表','html/Student/StuCul_TimetableQry.htm','','8124');0; true;`;

const COURSE_PARSE_SCRIPT = `(function() {
  function getSectionRange(s) {
    var parts = s.split(',');
    return { sectionStart: parseInt(parts[0], 10), sectionEnd: parseInt(parts[parts.length - 1], 10) };
  }

  function getCourseSections(m, sw) {
    if (sw === '第') return { sectionStart: parseInt(m[2], 10), sectionEnd: parseInt(m[2], 10) };
    return getSectionRange(m[2]);
  }

  function makeCourses(dow, name, teacher, sw, secStart, secEnd, room, wStart, wEnd) {
    var out = [];
    function push(ws, we) { out.push({ name: name, room: room, teacher: teacher, weekDay: dow, sectionStart: secStart, sectionEnd: secEnd, weekStart: ws, weekEnd: we }); }
    if (sw === '' || sw === '第') { push(wStart, wEnd); }
    else if (sw === '单周') { for (var j = wStart; j <= wEnd; j++) { if (j % 2 === 1) push(j, j); } }
    else if (sw === '双周') { for (var j = wStart; j <= wEnd; j++) { if (j % 2 === 0) push(j, j); } }
    return out;
  }

  function parseCourseBlock(lines, dow) {
    lines = lines.map(function(s) { return s.trim(); });
    var name = lines[0];
    var teacher = lines[1].split(' ')[0];
    var secMatch = lines[2].match(/节次:(.*?)([\\d,]+?)节/);
    if (!secMatch) return [];
    var sw = secMatch[1];
    var sec = getCourseSections(secMatch, sw);
    var weekText = lines[3];
    var room = lines[4].replace('地点:', '').trim();
    var courses = [];

    if (/\\)/.test(weekText)) {
      var re = /(\\d+)(?:-(\\d+))?\\((.+?)\\)/g, m;
      while ((m = re.exec(weekText)) !== null) {
        var ws = parseInt(m[1], 10);
        var we = m[2] ? parseInt(m[2], 10) : ws;
        courses = courses.concat(makeCourses(dow, name, m[3], sw, sec.sectionStart, sec.sectionEnd, room, ws, we));
      }
    } else {
      if (weekText.indexOf('周次:') === 0) weekText = weekText.slice(3);
      var weekList;
      if (weekText.indexOf('、') >= 0) weekList = weekText.split('、');
      else if (weekText.indexOf('，') >= 0) weekList = weekText.split('，');
      else weekList = weekText.split(',');
      weekList.forEach(function(span) {
        var parts = span.split('-');
        var ws = parseInt(parts[0], 10);
        var we = parseInt(parts[parts.length - 1], 10);
        courses = courses.concat(makeCourses(dow, name, teacher, sw, sec.sectionStart, sec.sectionEnd, room, ws, we));
      });
    }
    return courses;
  }

  var tbody = document.querySelector('.WtbodyZlistS');
  var tds = tbody ? Array.from(tbody.querySelectorAll('tr td')) : [];
  var courses = [];
  for (var i = 0; i < tds.length; i++) {
    var dow = (i % 9) - 1;
    if (dow <= 0) continue;
    var text = tds[i].innerText.trim().replace('\\r', '');
    if (!text.length) continue;
    var blocks = text.split('\\n\\n');
    for (var b = 0; b < blocks.length; b++) {
      var lines = blocks[b].split('\\n');
      if (lines.length === 5 && lines[0].indexOf('[考试]') === 0) {
        var examSec = lines[1].match(/节次:(.*?)([\\d,]+?)节/);
        if (!examSec || examSec.length < 3) continue;
        var week = parseInt(lines[2].split(':')[1], 10);
        var secInfo = getSectionRange(examSec[2]);
        courses.push({ name: lines[0], room: lines[3], teacher: '', weekDay: dow, weekStart: week, weekEnd: week, sectionStart: secInfo.sectionStart, sectionEnd: secInfo.sectionEnd });
      } else if (lines.length === 7) {
        courses = courses.concat(parseCourseBlock(lines, dow));
      }
    }
  }

  courses.sort(function(a, b) {
    if (a.weekDay !== b.weekDay) return a.weekDay - b.weekDay;
    if (a.weekStart !== b.weekStart) return a.weekStart - b.weekStart;
    if (a.sectionStart !== b.sectionStart) return a.sectionStart - b.sectionStart;
    return a.name.localeCompare(b.name);
  });

  // merge contiguous sections
  var merged = [];
  for (var i = 0; i < courses.length; i++) {
    var c = courses[i];
    var prev = merged.length ? merged[merged.length - 1] : null;
    if (prev && prev.name === c.name && prev.teacher === c.teacher && prev.room === c.room && prev.weekDay === c.weekDay && prev.weekStart === c.weekStart && prev.weekEnd === c.weekEnd && prev.sectionEnd + 1 === c.sectionStart) {
      prev.sectionEnd = c.sectionEnd;
    } else {
      merged.push({ name: c.name, room: c.room, teacher: c.teacher, weekDay: c.weekDay, weekStart: c.weekStart, weekEnd: c.weekEnd, sectionStart: c.sectionStart, sectionEnd: c.sectionEnd });
    }
  }

  window.ReactNativeWebView.postMessage(JSON.stringify(merged));
})(); true;`;

export default function MasterCourseScreen() {
  const isImporting = useRef(false);
  const webview = useRef<WebView>(null);
  const { onLoadEnd: autoLoginOnLoadEnd } = useZhlgdAutoLogin(webview);

  const handleNavStateChange = (state: WebViewNavigation) => {
    if (!isImporting.current && state.url.startsWith(MAIN_FRAME_PREFIX)) {
      isImporting.current = true;

      setTimeout(() => {
        webview.current?.injectJavaScript(NAVIGATE_TO_COURSE_SCRIPT);

        setTimeout(() => {
          webview.current?.injectJavaScript(COURSE_PARSE_SCRIPT);
        }, 3000);
      }, 3000);
    }
  };

  const handleMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const courses: Course[] = JSON.parse(event.nativeEvent.data).map(
        (c: any) => ({
          name: c.name,
          room: c.room,
          teacher: c.teacher,
          weekStart: c.weekStart,
          weekEnd: c.weekEnd,
          day: c.weekDay,
          sectionStart: c.sectionStart,
          sectionEnd: c.sectionEnd,
        }),
      );

      const store = useCourseStore.getState();
      store.setCourses(courses);

      Toast.show({
        type: "success",
        text1: "导入成功",
        text2: "好耶！",
        position: "bottom",
      });

      router.back();
    } catch (e) {
      reportError(e, { module: "course-master" });
      Toast.show({
        type: "error",
        text1: "导入失败",
        text2: "解析错误，请重试",
        position: "bottom",
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: "研究生课表导入" }} />

      <WebView
        source={{ uri: LOGIN_URL }}
        style={{ flex: 1 }}
        javaScriptEnabled
        originWhitelist={["*"]}
        onLoadEnd={autoLoginOnLoadEnd}
        onNavigationStateChange={handleNavStateChange}
        onMessage={handleMessage}
        ref={webview}
      />
    </View>
  );
}
