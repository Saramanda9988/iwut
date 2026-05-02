import { reloadWidgets, setWidgetData } from "@/modules/widget";
import { SECTION_TIMES } from "@/services/course-time";
import { useCourseStore } from "@/store/course";

interface WidgetCourse {
  name: string;
  room: string;
  day: number;
  weekStart: number;
  weekEnd: number;
  sectionStart: number;
  sectionEnd: number;
  startTime: string;
  endTime: string;
}

interface ScheduleWidgetData {
  courses: WidgetCourse[];
  termStart: string;
  updatedAt: string;
}

export async function syncWidgetData(): Promise<void> {
  const { courses, termStart } = useCourseStore.getState();
  if (!termStart || courses.length === 0) return;

  const widgetCourses: WidgetCourse[] = courses.map((c) => ({
    name: c.name,
    room: c.room,
    day: c.day,
    weekStart: c.weekStart,
    weekEnd: c.weekEnd,
    sectionStart: c.sectionStart,
    sectionEnd: c.sectionEnd,
    startTime: SECTION_TIMES[c.sectionStart]?.[0] ?? "",
    endTime: SECTION_TIMES[c.sectionEnd]?.[1] ?? "",
  }));

  const data: ScheduleWidgetData = {
    courses: widgetCourses,
    termStart,
    updatedAt: new Date().toISOString(),
  };

  await setWidgetData("schedule", data as unknown as Record<string, unknown>);
  await reloadWidgets();
}
