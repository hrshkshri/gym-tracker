import { describe, it, expect } from "vitest";
import { localIsoDate } from "./useToday";

describe("localIsoDate", () => {
  it("formats a date from its local calendar parts", () => {
    expect(localIsoDate(new Date(2026, 6, 17, 1, 0, 0))).toBe("2026-07-17");
  });

  it("stays on the local calendar day just after local midnight", () => {
    // This is the case the old `now.toISOString().slice(0, 10)` implementation
    // got wrong in positive-offset zones (e.g. IST, UTC+5:30): at 00:05 local
    // time the UTC date is still the previous day.
    expect(localIsoDate(new Date(2026, 6, 17, 0, 5, 0))).toBe("2026-07-17");
  });

  it("pads single-digit months and days", () => {
    expect(localIsoDate(new Date(2026, 0, 5, 12, 0, 0))).toBe("2026-01-05");
  });
});
