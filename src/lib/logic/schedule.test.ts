import { describe, it, expect } from "vitest";
import { getDayKeyForWeekday } from "./schedule";

describe("getDayKeyForWeekday", () => {
  it("maps each weekday to its day key", () => {
    expect(getDayKeyForWeekday(0)).toBe("rest");   // Sun
    expect(getDayKeyForWeekday(1)).toBe("legs");   // Mon
    expect(getDayKeyForWeekday(2)).toBe("pull");   // Tue
    expect(getDayKeyForWeekday(3)).toBe("push");   // Wed
    expect(getDayKeyForWeekday(4)).toBe("rest");   // Thu
    expect(getDayKeyForWeekday(5)).toBe("lower");  // Fri
    expect(getDayKeyForWeekday(6)).toBe("upper");  // Sat
  });

  it("throws on an out-of-range weekday", () => {
    expect(() => getDayKeyForWeekday(7)).toThrow();
  });
});
