export const SECTION_TIMES: Record<
  number,
  [start: string, end: string, startMin: number, endMin: number]
> = {
  1: ["8:00", "8:45", 480, 525],
  2: ["8:50", "9:35", 530, 575],
  3: ["9:55", "10:40", 595, 640],
  4: ["10:45", "11:30", 645, 690],
  5: ["11:35", "12:20", 695, 740],
  6: ["14:00", "14:45", 840, 885],
  7: ["14:50", "15:35", 890, 935],
  8: ["15:40", "16:25", 940, 985],
  9: ["16:45", "17:30", 1005, 1050],
  10: ["17:35", "18:20", 1055, 1100],
  11: ["19:00", "19:45", 1140, 1185],
  12: ["19:50", "20:35", 1190, 1235],
  13: ["20:40", "21:25", 1240, 1285],
};

export function formatCourseSectionTimeRange(
  sectionStart: number,
  sectionEnd: number,
): string {
  const start = SECTION_TIMES[sectionStart]?.[0] ?? "";
  const end = SECTION_TIMES[sectionEnd]?.[1] ?? "";
  return start && end ? `${start} - ${end}` : "";
}
