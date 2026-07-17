import { describe, it, expect } from "vitest";
import { getDayKeyForWeekday } from "./schedule";

describe("getDayKeyForWeekday", () => {
  it("maps weekdays to the plan's day keys", () => {
    expect(getDayKeyForWeekday(0)).toBe("rest");   // Sun
    expect(getDayKeyForWeekday(1)).toBe("legs");   // Mon
    expect(getDayKeyForWeekday(2)).toBe("pullA");  // Tue
    expect(getDayKeyForWeekday(3)).toBe("pushA");  // Wed
    expect(getDayKeyForWeekday(4)).toBe("run");    // Thu
    expect(getDayKeyForWeekday(5)).toBe("pullB");  // Fri
    expect(getDayKeyForWeekday(6)).toBe("pushB");  // Sat
  });

  it("throws on an out-of-range weekday", () => {
    expect(() => getDayKeyForWeekday(7)).toThrow();
  });
});
