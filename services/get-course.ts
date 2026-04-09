import { Course } from "@/store/course";

import { API_BASE } from "@/constants/api";

export async function getTermStart(): Promise<string> {
  const data = await fetch(`${API_BASE}/Config/time/term`).then((response) =>
    response.json(),
  );
  return data.termStart.split("T")[0];
}

async function changeUserRole(headers: Record<string, string>) {
  try {
    await fetch(
      "https://jwxt.whut.edu.cn/jwapp/sys/homeapp/api/home/changeAppRole.do?appRole=ef212c48c8f84be79acbd9d81b090f51",
      {
        method: "POST",
        headers,
      },
    );
  } catch {}
}

async function getCurrentTerm(
  headers: Record<string, string>,
): Promise<string> {
  return await fetch(
    "https://jwxt.whut.edu.cn/jwapp/sys/wdkbby/modules/jshkcb/dqxnxq.do",
    {
      method: "POST",
      headers,
    },
  )
    .then((response) => response.json())
    .then((data) => data.datas.dqxnxq.rows[0].DM);
}

async function fetchCourse(
  headers: Record<string, string>,
  term: string,
): Promise<any[]> {
  return await fetch(
    "https://jwxt.whut.edu.cn/jwapp/sys/wdkbby/modules/xskcb/cxxszhxqkb.do",
    {
      method: "POST",
      headers,
      body: new URLSearchParams({
        XNXQDM: term,
      }).toString(),
    },
  )
    .then((response) => response.json())
    .then((data) => data.datas.cxxszhxqkb.rows);
}

function splitWeekSegments(weekStr: string): [number, number][] {
  return [...weekStr.matchAll(/1+/g)].map((m) => [
    m.index! + 1,
    m.index! + m[0].length,
  ]);
}

export async function getCourse(cookie: string) {
  const headers = {
    Cookie: cookie,
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0",
    Origin: "https://jwxt.whut.edu.cn",
    Referer: "https://jwxt.whut.edu.cn/jwapp/sys/wdkbby/*default/index.do",
  };

  await changeUserRole(headers);
  const term = await getCurrentTerm(headers);
  const courses = await fetchCourse(headers, term);

  const result: Course[] = courses.flatMap((course) => {
    const weeks = splitWeekSegments(course.SKZC);

    return weeks.map(([weekStart, weekEnd]) => ({
      name: course.KCM,
      room: course.JASMC,
      weekStart,
      weekEnd,
      day: course.SKXQ,
      sectionStart: course.KSJC,
      sectionEnd: course.JSJC,
    }));
  });

  return result;
}
