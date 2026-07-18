import { describe, it, expect } from "vitest";
import { bodyweightSummary } from "./bodyweightSummary";
import type { BodyweightEntry } from "@/lib/types";

const bw = (date: string, weightKg: number): BodyweightEntry => ({
  id: date, date, weightKg, updatedAt: 1,
});

describe("bodyweightSummary", () => {
  it("returns null with no entries", () => {
    expect(bodyweightSummary([])).toBeNull();
  });

  it("reports the latest weigh-in and its date", () => {
    const s = bodyweightSummary([bw("2026-07-15", 79), bw("2026-07-17", 78)])!;
    expect(s.latest).toBe(78);
    expect(s.latestDate).toBe("2026-07-17");
  });

  it("has no week change until there are enough entries", () => {
    expect(bodyweightSummary([bw("2026-07-17", 78)])!.weekChange).toBeNull();
  });

  it("computes the weekly change in the average", () => {
    // 8 daily entries dropping 0.2kg/day; avg should trend down over the window.
    const entries = Array.from({ length: 8 }, (_, i) =>
      bw(`2026-07-${String(10 + i).padStart(2, "0")}`, 80 - i * 0.2)
    );
    const s = bodyweightSummary(entries)!;
    expect(s.weekChange).not.toBeNull();
    expect(s.weekChange!).toBeLessThan(0);
  });
});
