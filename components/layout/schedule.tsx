import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";

import type { Course } from "@/store/course";

const DAY_LABELS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

const SECTIONS: { flex: number }[] = [
  { flex: 2 }, // 早上 A: DM 1-2
  { flex: 3 }, // 早上 B: DM 3-5
  { flex: 2 }, // 中午:   DM 6-7
  { flex: 3 }, // 下午 A: DM 8-10
  { flex: 2 }, // 下午 B: DM 11-12
  { flex: 4 }, // 晚上:   DM 13-16
];

const SIDEBAR_GROUPS = [
  { label: "早\n上", flex: 5 },
  { label: "中\n午", flex: 2 },
  { label: "下\n午", flex: 5 },
  { label: "晚\n上", flex: 4 },
];

const COURSE_COLORS = [
  "#5B9BD5",
  "#70AD47",
  "#ED7D31",
  "#A855F7",
  "#EC4899",
  "#14B8A6",
  "#F59E0B",
  "#6366F1",
];

const SECTION_MAP: Record<number, number> = {
  1: 0,
  2: 0,
  3: 1,
  4: 1,
  5: 1,
  6: 2,
  7: 2,
  8: 3,
  9: 3,
  10: 3,
  11: 4,
  12: 4,
  13: 5,
  14: 5,
  15: 5,
  16: 5,
};

function buildColorMap(courses: Course[]): Map<string, number> {
  const map = new Map<string, number>();
  let idx = 0;
  for (const c of courses) {
    if (!map.has(c.name)) {
      map.set(c.name, idx % COURSE_COLORS.length);
      idx++;
    }
  }
  return map;
}

function buildGrid(courses: Course[]): (Course | null)[][] {
  const table: Course[][][] = Array.from({ length: 7 }, () =>
    Array.from({ length: SECTIONS.length }, () => []),
  );
  for (const c of courses) {
    const d = c.day - 1;
    const s = SECTION_MAP[c.sectionStart];
    if (d >= 0 && d < 7 && s !== undefined) {
      table[d][s].push(c);
    }
  }
  return table.map((day) => day.map((cell) => cell[0] ?? null));
}

export function Schedule({
  courses,
  week,
}: Readonly<{
  courses: Course[];
  week: number;
}>) {
  const { width: screenWidth } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [selected, setSelected] = useState<Course | null>(null);

  const colorMap = useMemo(() => buildColorMap(courses), [courses]);

  const weekCourses = useMemo(
    () => courses.filter((c) => c.weekStart <= week && c.weekEnd >= week),
    [courses, week],
  );

  const grid = useMemo(() => buildGrid(weekCourses), [weekCourses]);

  const sidebarWidth = 24;
  const headerHeight = 36;
  const colWidth = (screenWidth - sidebarWidth) / 7;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", height: headerHeight }}>
        <View style={{ width: sidebarWidth }} />
        {DAY_LABELS.map((label, i) => (
          <View
            key={i}
            style={{
              width: colWidth,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: isDark ? "#d4d4d4" : "#525252",
              }}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ flex: 1, flexDirection: "row" }}>
        <View style={{ width: sidebarWidth }}>
          {SIDEBAR_GROUPS.map((g) => (
            <View
              key={g.label}
              style={{
                flex: g.flex,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: isDark ? "#737373" : "#a3a3a3",
                  textAlign: "center",
                  lineHeight: 16,
                }}
              >
                {g.label}
              </Text>
            </View>
          ))}
        </View>

        {Array.from({ length: 7 }, (_, dayIdx) => (
          <View key={dayIdx} style={{ width: colWidth }}>
            {SECTIONS.map((sec, secIdx) => {
              const course = grid[dayIdx][secIdx];
              const bg = course
                ? COURSE_COLORS[colorMap.get(course.name) ?? 0]
                : undefined;

              return (
                <View key={secIdx} style={{ flex: sec.flex, padding: 1 }}>
                  {course ? (
                    <Pressable
                      style={{
                        flex: 1,
                        backgroundColor: bg,
                        borderRadius: 6,
                        padding: 4,
                        overflow: "hidden",
                      }}
                      onPress={() => setSelected(course)}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "bold",
                          color: "#fff",
                          lineHeight: 14,
                        }}
                        numberOfLines={3}
                      >
                        {course.name}
                      </Text>
                      <View style={{ flex: 1 }} />
                      <Text
                        style={{
                          fontSize: 9,
                          color: "rgba(255,255,255,0.85)",
                        }}
                        numberOfLines={1}
                      >
                        {course.room}
                      </Text>
                    </Pressable>
                  ) : (
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: isDark
                          ? "rgba(255,255,255,0.03)"
                          : "rgba(0,0,0,0.02)",
                        borderRadius: 6,
                      }}
                    />
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
          onPress={() => setSelected(null)}
        >
          <Pressable
            style={{
              width: 280,
              backgroundColor: isDark ? "#262626" : "#fff",
              borderRadius: 16,
              padding: 20,
            }}
          >
            {selected && (
              <>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "bold",
                    color: isDark ? "#f5f5f5" : "#171717",
                    marginBottom: 12,
                  }}
                >
                  {selected.name}
                </Text>
                <DetailRow label="教室" value={selected.room} isDark={isDark} />
                <DetailRow
                  label="教师"
                  value={selected.teacher}
                  isDark={isDark}
                />
                <DetailRow
                  label="节次"
                  value={`第 ${selected.sectionStart}-${selected.sectionEnd} 节`}
                  isDark={isDark}
                />
                <DetailRow
                  label="周次"
                  value={`第 ${selected.weekStart}-${selected.weekEnd} 周`}
                  isDark={isDark}
                />
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function DetailRow({
  label,
  value,
  isDark,
}: {
  label: string;
  value: string;
  isDark: boolean;
}) {
  return (
    <View style={{ flexDirection: "row", marginBottom: 8 }}>
      <Text
        style={{
          fontSize: 14,
          color: isDark ? "#a3a3a3" : "#737373",
          width: 48,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: isDark ? "#e5e5e5" : "#262626",
          flex: 1,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
