import { describe, it, expect } from "vitest";
import { rollingAverage7 } from "./rollingAverage";
import type { BodyweightEntry } from "@/lib/types";

const bw = (date: string, weightKg: number): BodyweightEntry =>
  ({ id: date, date, weightKg, updatedAt: 0 });

describe("rollingAverage7", () => {
  it("sorts by date and averages the trailing window (<=7 days)", () => {
    const out = rollingAverage7([bw("2026-07-02", 79), bw("2026-07-01", 79.4)]);
    expect(out[0]).toEqual({ date: "2026-07-01", weight: 79.4, avg: 79.4 });
    expect(out[1].date).toBe("2026-07-02");
    expect(out[1].avg).toBeCloseTo(79.2, 5);
  });

  it("windows to the last 7 points once enough exist", () => {
    const entries = Array.from({ length: 8 }, (_, i) =>
      bw(`2026-07-0${i + 1}`, 80 - i) // 80,79,...,73
    );
    const out = rollingAverage7(entries);
    // 8th point averages days 2..8 => weights 79..73 => mean 76
    expect(out[7].avg).toBeCloseTo(76, 5);
  });

  it("returns [] for no entries", () => {
    expect(rollingAverage7([])).toEqual([]);
  });
});
