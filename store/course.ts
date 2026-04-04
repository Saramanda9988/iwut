import { create } from "zustand";
import { persist } from "zustand/middleware";

import { zustandStorage } from "@/lib/storage";

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
  termStart: string;
  setCourses: (courses: Course[]) => void;
  setTermStart: (termStart: string) => void;
}

export const useCourseStore = create<CourseStore>()(
  persist(
    (set) => ({
      courses: [],
      termStart: "",
      setCourses: (courses: Course[]) => set({ courses }),
      setTermStart: (termStart: string) => set({ termStart }),
    }),
    {
      name: "course",
      storage: zustandStorage,
    },
  ),
);
