import { describe, it, expect } from "vitest";
import { exerciseTopSetSeries } from "./exerciseSeries";
import type { Session } from "@/lib/types";

const mk = (date: string, weights: number[]): Session => ({
  id: date, date, dayKey: "pushA", title: "Push A", cardioDone: false, updatedAt: 0,
  exercises: [{ name: "Bench", targetSets: weights.length, repRange: "6–8", skipped: false,
    sets: weights.map((w) => ({ weight: w, reps: 8, done: true })) }],
});

describe("exerciseTopSetSeries", () => {
  it("returns the max weight per date, chronological", () => {
    const out = exerciseTopSetSeries(
      [mk("2026-07-08", [60, 62.5]), mk("2026-07-01", [57.5, 60])],
      "Bench"
    );
    expect(out).toEqual([
      { date: "2026-07-01", topWeight: 60 },
      { date: "2026-07-08", topWeight: 62.5 },
    ]);
  });

  it("skips sessions without the exercise", () => {
    expect(exerciseTopSetSeries([mk("2026-07-01", [60])], "Squat")).toEqual([]);
  });
});
