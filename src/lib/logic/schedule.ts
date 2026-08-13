export type DayKey =
  | "legs" | "pull" | "push" | "lower" | "upper" | "rest";

const WEEKDAY_TO_DAYKEY: Record<number, DayKey> = {
  0: "rest",   // Sun
  1: "legs",   // Mon
  2: "pull",   // Tue
  3: "push",   // Wed
  4: "rest",   // Thu
  5: "lower",  // Fri
  6: "upper",  // Sat
};

export function getDayKeyForWeekday(weekday: number): DayKey {
  const key = WEEKDAY_TO_DAYKEY[weekday];
  if (!key) throw new Error(`Invalid weekday: ${weekday}`);
  return key;
}
