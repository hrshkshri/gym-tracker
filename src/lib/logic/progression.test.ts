import { describe, it, expect } from "vitest";
import { bestSet, compareSet, setDelta, hasBeaten, fmtWeight } from "./progression";
import type { SetEntry } from "@/lib/types";

const s = (weight: number, reps: number): SetEntry => ({ weight, reps, done: false });

describe("fmtWeight", () => {
  it("keeps decimals and drops float drift", () => {
    expect(fmtWeight(60)).toBe("60");
    expect(fmtWeight(62.5)).toBe("62.5");
    expect(fmtWeight(2.5000000001)).toBe("2.5");
  });
});

describe("bestSet", () => {
  it("returns null when no set is logged", () => {
    expect(bestSet([])).toBeNull();
    expect(bestSet([s(0, 0)])).toBeNull();
  });
  it("picks the heaviest set", () => {
    expect(bestSet([s(60, 8), s(65, 5), s(62.5, 8)])).toEqual(s(65, 5));
  });
  it("breaks ties on reps", () => {
    expect(bestSet([s(60, 8), s(60, 10)])).toEqual(s(60, 10));
  });
});

describe("setDelta", () => {
  it("is null when either side is empty", () => {
    expect(setDelta(s(0, 0), s(60, 8))).toBeNull();
    expect(setDelta(s(60, 8), null)).toBeNull();
  });
  it("reports weight increases and decreases", () => {
    expect(setDelta(s(62.5, 8), s(60, 8))).toEqual({ dir: "up", label: "+2.5kg" });
    expect(setDelta(s(57.5, 8), s(60, 8))).toEqual({ dir: "down", label: "−2.5kg" });
  });
  it("compares reps when weight matches", () => {
    expect(setDelta(s(60, 9), s(60, 8))).toEqual({ dir: "up", label: "+1 rep" });
    expect(setDelta(s(60, 6), s(60, 8))).toEqual({ dir: "down", label: "−2 reps" });
    expect(setDelta(s(60, 8), s(60, 8))).toEqual({ dir: "same", label: "matched" });
  });
});

describe("hasBeaten", () => {
  it("is true only when this session's best exceeds last", () => {
    expect(hasBeaten([s(62.5, 8)], [s(60, 8)])).toBe(true);
    expect(hasBeaten([s(60, 8)], [s(60, 8)])).toBe(false);
    expect(hasBeaten([s(60, 6)], [s(60, 8)])).toBe(false);
    expect(hasBeaten([], [s(60, 8)])).toBe(false);
  });
});

describe("compareSet", () => {
  it("orders by weight then reps", () => {
    expect(compareSet(s(65, 5), s(60, 8))).toBeGreaterThan(0);
    expect(compareSet(s(60, 10), s(60, 8))).toBeGreaterThan(0);
    expect(compareSet(s(60, 8), s(60, 8))).toBe(0);
  });
});
