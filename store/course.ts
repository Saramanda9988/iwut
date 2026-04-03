import { zustandStorage } from "@/lib/storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Course {
  name: string; // 课程名
  room: string; // 教室
  teacher: string; // 教师
  weekStart: number; // 开始周数
  weekEnd: number; // 结束周数
  day: number; // 星期几
  sectionStart: number; // 开始节数
  sectionEnd: number; // 结束节数
}

interface CourseStore {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
}

export const useCourseStore = create<CourseStore>()(
  persist(
    (set) => ({
      courses: [],
      setCourses: (courses: Course[]) => set({ courses }),
    }),
    {
      name: "course",
      storage: zustandStorage,
    },
  ),
);
