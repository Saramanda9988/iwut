const MAX_WEEK = 20;

export function getCurrentWeek(termStart: string): number {
  if (!termStart) return 1;
  const start = new Date(termStart);
  const today = new Date();
  const week =
    Math.floor(
      (today.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000),
    ) + 1;
  return Math.max(1, Math.min(week, MAX_WEEK));
}

export function getCurrentDayOfWeek(): number {
  const day = new Date().getDay();
  return day === 0 ? 7 : day;
}
