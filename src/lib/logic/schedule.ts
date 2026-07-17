export type DayKey =
  | "legs" | "pullA" | "pushA" | "run" | "pullB" | "pushB" | "rest";

const WEEKDAY_TO_DAYKEY: Record<number, DayKey> = {
  0: "rest",
  1: "legs",
  2: "pullA",
  3: "pushA",
  4: "run",
  5: "pullB",
  6: "pushB",
};

export function getDayKeyForWeekday(weekday: number): DayKey {
  const key = WEEKDAY_TO_DAYKEY[weekday];
  if (!key) throw new Error(`Invalid weekday: ${weekday}`);
  return key;
}
