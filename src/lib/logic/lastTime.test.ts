import { describe, it, expect } from "vitest";
import { findLastTime } from "./lastTime";
import type { Session } from "@/lib/types";

const mk = (date: string, name: string, sets: [number, number][]): Session => ({
  id: date + name,
  date,
  dayKey: "pushA",
  title: "Push A",
  cardioDone: false,
  updatedAt: 0,
  exercises: [
    { name, targetSets: sets.length, repRange: "6–8", skipped: false,
      sets: sets.map(([weight, reps]) => ({ weight, reps, done: true })) },
  ],
});

describe("findLastTime", () => {
  it("returns the sets from the most recent earlier session with that exercise", () => {
    const sessions = [
      mk("2026-07-01", "Barbell Bench Press", [[60, 8]]),
      mk("2026-07-08", "Barbell Bench Press", [[62.5, 8], [62.5, 7]]),
    ];
    const result = findLastTime(sessions, "Barbell Bench Press", "2026-07-15");
    expect(result).toEqual([
      { weight: 62.5, reps: 8, done: true },
      { weight: 62.5, reps: 7, done: true },
    ]);
  });

  it("ignores sessions on or after beforeDate", () => {
    const sessions = [mk("2026-07-15", "Barbell Bench Press", [[65, 5]])];
    expect(findLastTime(sessions, "Barbell Bench Press", "2026-07-15")).toBeNull();
  });

  it("ignores exercises that were skipped", () => {
    const s = mk("2026-07-08", "Barbell Bench Press", [[62.5, 8]]);
    s.exercises[0].skipped = true;
    expect(findLastTime([s], "Barbell Bench Press", "2026-07-15")).toBeNull();
  });

  it("returns null when the exercise was never done before", () => {
    const sessions = [mk("2026-07-01", "Deadlift", [[100, 5]])];
    expect(findLastTime(sessions, "Barbell Bench Press", "2026-07-15")).toBeNull();
  });
});
