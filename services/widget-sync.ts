import {
  getCurrentDayOfWeek,
  getCurrentWeek,
  getTomorrowDayOfWeek,
  getTomorrowWeek,
} from "@/lib/date";
import { reloadWidgets, setWidgetData } from "@/modules/widget";
import { SECTION_TIMES } from "@/services/course-time";
import { useCourseStore } from "@/store/course";

const DAY_NAMES = ["", "周一", "周二", "周三", "周四", "周五", "周六", "周日"];

interface WidgetCourse {
  name: string;
  room: string;
  teacher: string;
  sectionStart: number;
  sectionEnd: number;
  startTime: string;
  endTime: string;
  isToday: boolean;
}

interface ScheduleWidgetData {
  todayCourses: WidgetCourse[];
  tomorrowCourses: WidgetCourse[];
  dayOfWeek: number;
  week: number;
  weekStr: string;
  dateStr: string;
  dayOfWeekStr: string;
  updatedAt: string;
}

function toWidgetCourse(
  c: {
    name: string;
    room: string;
    teacher: string;
    sectionStart: number;
    sectionEnd: number;
  },
  isToday: boolean,
): WidgetCourse {
  return {
    name: c.name,
    room: c.room,
    teacher: c.teacher,
    sectionStart: c.sectionStart,
    sectionEnd: c.sectionEnd,
    startTime: SECTION_TIMES[c.sectionStart]?.[0] ?? "",
    endTime: SECTION_TIMES[c.sectionEnd]?.[1] ?? "",
    isToday,
  };
}

export async function syncWidgetData(): Promise<void> {
  const { courses, termStart } = useCourseStore.getState();
  if (!termStart || courses.length === 0) return;

  const week = getCurrentWeek(termStart);
  const today = getCurrentDayOfWeek();
  const tomorrowDay = getTomorrowDayOfWeek();
  const tomorrowWeek = getTomorrowWeek(termStart);

  const now = new Date();

  const todayCourses = courses
    .filter((c) => c.day === today && c.weekStart <= week && c.weekEnd >= week)
    .sort((a, b) => a.sectionStart - b.sectionStart)
    .map((c) => toWidgetCourse(c, true));

  const tomorrowCourses = courses
    .filter(
      (c) =>
        c.day === tomorrowDay &&
        c.weekStart <= tomorrowWeek &&
        c.weekEnd >= tomorrowWeek,
    )
    .sort((a, b) => a.sectionStart - b.sectionStart)
    .map((c) => toWidgetCourse(c, false));

  const data: ScheduleWidgetData = {
    todayCourses,
    tomorrowCourses,
    dayOfWeek: today,
    week,
    weekStr: `第${week}周`,
    dateStr: `${now.getMonth() + 1}月${now.getDate()}日`,
    dayOfWeekStr: DAY_NAMES[today] ?? "",
    updatedAt: now.toISOString(),
  };

  await setWidgetData("schedule", data as unknown as Record<string, unknown>);
  await reloadWidgets();
}
