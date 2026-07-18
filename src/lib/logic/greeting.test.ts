import { describe, it, expect } from "vitest";
import { getGreeting } from "./greeting";

// A Monday (2026-07-20 is a Monday) at a fixed time for deterministic output.
const monMorning = new Date("2026-07-20T08:00:00");

describe("getGreeting", () => {
  it("greets by time of day", () => {
    expect(getGreeting(new Date("2026-07-20T08:00:00")).hey).toBe("Morning, Harsh");
    expect(getGreeting(new Date("2026-07-20T14:00:00")).hey).toBe("Afternoon, Harsh");
    expect(getGreeting(new Date("2026-07-20T22:00:00")).hey).toBe("Night grind, Harsh");
    expect(getGreeting(new Date("2026-07-20T03:00:00")).hey).toBe("Still up, Harsh?");
  });

  it("accepts a custom name", () => {
    expect(getGreeting(monMorning, "Wayne").hey).toBe("Morning, Wayne");
  });

  it("returns a line from the correct day's pool", () => {
    // Monday is leg day.
    expect(getGreeting(monMorning).line).toMatch(/leg|foundation/i);
  });

  it("rotates the line as time advances", () => {
    const a = getGreeting(new Date("2026-07-20T08:00:00")).line;
    const b = getGreeting(new Date("2026-07-20T08:40:00")).line;
    expect(a).not.toBe(b);
  });

  it("throws on an invalid date", () => {
    expect(() => getGreeting(new Date("invalid"))).toThrow(/Invalid weekday/);
  });
});
