import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DAY_LABELS } from "@/components/layout/schedule";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  formatCourseSectionTimeRange,
  SECTION_TIMES,
} from "@/services/course-time";
import { getCurrentDayOfWeek, getCurrentWeek, isVacation } from "@/lib/date";
import type { Course } from "@/store/course";
import { useCourseStore } from "@/store/course";
import { useScheduleStore } from "@/store/schedule";
import { useUpdateStore } from "@/store/update";

const GREETINGS: { start: number; end: number; title: string; sub: string }[] =
  [
    { start: 5, end: 8, title: "早安", sub: "新的一天，从此刻开始" },
    { start: 8, end: 11, title: "上午好", sub: "今天也要元气满满" },
    { start: 11, end: 13, title: "午安", sub: "记得好好吃饭哦" },
    { start: 13, end: 17, title: "下午好", sub: "继续加油" },
    { start: 17, end: 19, title: "傍晚了", sub: "忙碌了一天，辛苦啦" },
    { start: 19, end: 23, title: "晚上好", sub: "忙完了就早点休息" },
    { start: 23, end: 5, title: "夜深了", sub: "熬夜伤身，早点睡哦" },
  ];

function isCourseFinished(course: Course): boolean {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return nowMin > (SECTION_TIMES[course.sectionEnd]?.[3] ?? 0);
}

function getCourseCountdown(course: Course): string | null {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const startMin = SECTION_TIMES[course.sectionStart]?.[2] ?? 0;
  const endMin = SECTION_TIMES[course.sectionEnd]?.[3] ?? 0;

  if (nowMin > endMin) return null;
  if (nowMin < startMin) {
    const diff = startMin - nowMin;
    return diff <= 60 ? `${diff} 分钟后开始` : null;
  }
  const remaining = endMin - nowMin;
  return `${remaining} 分钟后结束`;
}

function getGreeting() {
  const hour = new Date().getHours();
  const match = GREETINGS.find((g) =>
    g.start < g.end
      ? hour >= g.start && hour < g.end
      : hour >= g.start || hour < g.end,
  );
  return match ?? GREETINGS[0];
}

function getDateContext(termStart: string, vacation: boolean) {
  const now = new Date();
  const day = getCurrentDayOfWeek();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  if (vacation) {
    return `假期中 · ${DAY_LABELS[day - 1]} · ${month}月${date}日`;
  }
  const week = getCurrentWeek(termStart);
  return `第 ${week} 周 · ${DAY_LABELS[day - 1]} · ${month}月${date}日`;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const courses = useCourseStore((s) => s.courses);
  const termStart = useCourseStore((s) => s.termStart);
  const hasUpdate = useUpdateStore((s) => s.hasUpdate);
  const colorPalette = useScheduleStore((s) => s.colorPalette);
  const courseColorOverrides = useScheduleStore((s) => s.courseColorOverrides);

  const greeting = getGreeting();
  const vacation = isVacation(termStart);
  const dateContext = getDateContext(termStart, vacation);

  const week = getCurrentWeek(termStart);
  const today = getCurrentDayOfWeek();

  const todayCourses = useMemo(
    () =>
      courses
        .filter(
          (c) => c.day === today && c.weekStart <= week && c.weekEnd >= week,
        )
        .sort((a, b) => a.sectionStart - b.sectionStart),
    [courses, today, week],
  );

  const paletteColors = colorPalette.colors;
  const colorMap = useMemo(() => {
    const map = new Map<string, number>();
    let idx = 0;
    for (const c of courses) {
      if (!map.has(c.name)) {
        map.set(c.name, idx % paletteColors.length);
        idx++;
      }
    }
    return map;
  }, [courses, paletteColors.length]);
  const hasCourses = courses.length > 0;

  const finishedCount = useMemo(
    () => todayCourses.filter((c) => isCourseFinished(c)).length,
    [todayCourses],
  );

  const MAX_VISIBLE = 4;
  const GAP = 10;
  const cardHeights = useRef<number[]>([]);
  const courseScrollRef = useRef<ScrollView>(null);
  const didAutoScroll = useRef(false);

  const firstUpcomingIdx = useMemo(
    () => todayCourses.findIndex((c) => !isCourseFinished(c)),
    [todayCourses],
  );

  const maxHeight = useMemo(() => {
    const heights = cardHeights.current;
    if (heights.length < todayCourses.length) return undefined;
    let total = 0;
    for (let i = 0; i < Math.min(MAX_VISIBLE, heights.length); i++) {
      total += heights[i] + (i > 0 ? GAP : 0);
    }
    return total || undefined;
  }, [todayCourses.length]);

  const handleCardLayout = useCallback(
    (index: number, e: LayoutChangeEvent) => {
      cardHeights.current[index] = e.nativeEvent.layout.height;

      if (
        !didAutoScroll.current &&
        cardHeights.current.filter(Boolean).length === todayCourses.length &&
        firstUpcomingIdx > 0
      ) {
        didAutoScroll.current = true;
        let scrollY = 0;
        for (let i = 0; i < firstUpcomingIdx; i++) {
          scrollY += (cardHeights.current[i] ?? 0) + GAP;
        }
        courseScrollRef.current?.scrollTo({ y: scrollY, animated: true });
      }
    },
    [todayCourses.length, firstUpcomingIdx],
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 问候 */}
        <View className="px-6 pb-2 pt-8">
          <View className="flex-row items-center justify-between">
            <Text
              className="text-[32px] font-bold tracking-tight text-neutral-900 dark:text-neutral-50"
              numberOfLines={1}
            >
              {greeting.title}
            </Text>
            {hasUpdate && (
              <Pressable
                className="relative p-1 active:opacity-60"
                onPress={() => router.push("/about" as any)}
              >
                <Ionicons
                  name="arrow-up-circle-outline"
                  size={24}
                  color={isDark ? "#a3a3a3" : "#737373"}
                />
                <View className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 dark:border-neutral-900" />
              </Pressable>
            )}
          </View>
          <Text className="mt-1.5 text-base text-neutral-400 dark:text-neutral-500">
            {greeting.sub}
          </Text>
          <View className="mt-3 flex-row items-center gap-1.5">
            <Ionicons
              name="calendar-outline"
              size={13}
              color={isDark ? "#737373" : "#a3a3a3"}
            />
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">
              {dateContext}
            </Text>
          </View>
        </View>

        <View className="mx-6 my-5 h-px bg-neutral-100 dark:bg-neutral-800/60" />

        {vacation ? (
          <VacationState isDark={isDark} />
        ) : (
          <>
            {/* 课程进度条 */}
            <View className="mb-3 px-6">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Text className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                    今日课程
                  </Text>
                  {hasCourses && todayCourses.length > 0 && (
                    <View className="ml-2 rounded-full bg-blue-500/10 px-2.5 py-0.5">
                      <Text className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {todayCourses.length}
                      </Text>
                    </View>
                  )}
                </View>
                {hasCourses && todayCourses.length > 0 && finishedCount > 0 && (
                  <Text className="text-xs text-neutral-400 dark:text-neutral-500">
                    已完成 {finishedCount}/{todayCourses.length}
                  </Text>
                )}
              </View>

              {hasCourses && todayCourses.length > 0 && (
                <View
                  className="mt-2.5 overflow-hidden rounded-full"
                  style={{
                    height: 3,
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.04)",
                  }}
                >
                  <View
                    style={{
                      height: 3,
                      width: `${(finishedCount / todayCourses.length) * 100}%`,
                      backgroundColor: isDark
                        ? "rgba(59,130,246,0.6)"
                        : "rgba(59,130,246,0.5)",
                      borderRadius: 99,
                    }}
                  />
                </View>
              )}
            </View>

            {/* 课程列表 */}
            {hasCourses && todayCourses.length > 0 ? (
              <ScrollView
                ref={courseScrollRef}
                style={maxHeight ? { maxHeight } : undefined}
                contentContainerStyle={{ gap: GAP, paddingHorizontal: 24 }}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                {todayCourses.map((course, i) => {
                  const past = isCourseFinished(course);
                  const countdown =
                    !past && i === firstUpcomingIdx
                      ? getCourseCountdown(course)
                      : null;
                  return (
                    <View
                      key={`${course.name}-${course.sectionStart}-${i}`}
                      onLayout={(e) => handleCardLayout(i, e)}
                    >
                      <CourseCard
                        course={course}
                        color={
                          courseColorOverrides[course.name] ??
                          colorPalette.overrides?.[course.name] ??
                          paletteColors[
                            (colorMap.get(course.name) ?? 0) %
                              paletteColors.length
                          ]
                        }
                        past={past}
                        countdown={countdown}
                        isDark={isDark}
                      />
                    </View>
                  );
                })}
              </ScrollView>
            ) : (
              <EmptyState hasCourses={hasCourses} isDark={isDark} />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function CourseCard({
  course,
  color,
  past,
  countdown,
  isDark,
}: {
  course: Course;
  color: string;
  past: boolean;
  countdown: string | null;
  isDark: boolean;
}) {
  const barColor = past
    ? isDark
      ? "rgba(255,255,255,0.1)"
      : "rgba(0,0,0,0.08)"
    : color;
  const nameColor = past
    ? isDark
      ? "#525252"
      : "#a3a3a3"
    : isDark
      ? "#f5f5f5"
      : "#1c1c1e";
  const subColor = past
    ? isDark
      ? "#404040"
      : "#c4c4c4"
    : isDark
      ? "#a3a3a3"
      : "#737373";

  return (
    <View
      style={{
        flexDirection: "row",
        borderRadius: 12,
        backgroundColor: isDark
          ? "rgba(255,255,255,0.04)"
          : "rgba(0,0,0,0.025)",
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: 4,
          backgroundColor: barColor,
          borderTopLeftRadius: 12,
          borderBottomLeftRadius: 12,
        }}
      />
      <View style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 12 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: nameColor,
              flex: 1,
            }}
            numberOfLines={1}
          >
            {course.name}
          </Text>
          {countdown && (
            <View
              style={{
                marginLeft: 8,
                backgroundColor: countdown.includes("结束")
                  ? "rgba(234,179,8,0.12)"
                  : "rgba(59,130,246,0.12)",
                borderRadius: 6,
                paddingHorizontal: 6,
                paddingVertical: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: countdown.includes("结束") ? "#ca8a04" : "#3b82f6",
                }}
              >
                {countdown}
              </Text>
            </View>
          )}
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 5,
            gap: 12,
          }}
        >
          <ChipInfo
            icon="time-outline"
            text={formatCourseSectionTimeRange(
              course.sectionStart,
              course.sectionEnd,
            )}
            color={subColor}
          />
          <ChipInfo
            icon="location-outline"
            text={course.room}
            color={subColor}
          />
        </View>
      </View>
    </View>
  );
}

function ChipInfo({
  icon,
  text,
  color,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  text: string;
  color: string;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
      <Ionicons name={icon} size={12} color={color} />
      <Text style={{ fontSize: 12, color }} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

function EmptyState({
  hasCourses,
  isDark,
}: {
  hasCourses: boolean;
  isDark: boolean;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        paddingTop: 48,
        paddingHorizontal: 24,
        gap: 12,
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: isDark
            ? "rgba(255,255,255,0.06)"
            : "rgba(0,0,0,0.04)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons
          name={hasCourses ? "sunny-outline" : "calendar-outline"}
          size={26}
          color={isDark ? "#525252" : "#a3a3a3"}
        />
      </View>
      <Text
        style={{
          fontSize: 15,
          fontWeight: "600",
          color: isDark ? "#a3a3a3" : "#737373",
        }}
      >
        {hasCourses ? "今天没有课程" : "还没有课程"}
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: isDark ? "#525252" : "#a3a3a3",
          textAlign: "center",
          lineHeight: 20,
        }}
      >
        {hasCourses ? "好好享受空闲时光吧" : "前往「课程」标签页导入你的课表"}
      </Text>
    </View>
  );
}

function VacationState({ isDark }: { isDark: boolean }) {
  return (
    <View
      style={{
        alignItems: "center",
        paddingTop: 48,
        paddingHorizontal: 24,
        gap: 12,
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: isDark
            ? "rgba(255,255,255,0.06)"
            : "rgba(0,0,0,0.04)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons
          name="airplane-outline"
          size={26}
          color={isDark ? "#525252" : "#a3a3a3"}
        />
      </View>
      <Text
        style={{
          fontSize: 15,
          fontWeight: "600",
          color: isDark ? "#a3a3a3" : "#737373",
        }}
      >
        假期中
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: isDark ? "#525252" : "#a3a3a3",
          textAlign: "center",
          lineHeight: 20,
        }}
      >
        假期愉快~
      </Text>
    </View>
  );
}
