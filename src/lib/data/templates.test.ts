import { describe, it, expect } from "vitest";
import { DAY_TEMPLATES, getTemplate } from "./templates";

describe("DAY_TEMPLATES", () => {
  it("has all seven day keys", () => {
    expect(Object.keys(DAY_TEMPLATES).sort()).toEqual(
      ["legs", "pullA", "pullB", "pushA", "pushB", "rest", "run"].sort()
    );
  });

  it("legs template matches the plan (7 exercises, squat first)", () => {
    const legs = getTemplate("legs");
    expect(legs.title).toContain("Legs");
    expect(legs.exercises).toHaveLength(7);
    expect(legs.exercises[0].name).toContain("Squat");
    expect(legs.exercises[0].targetSets).toBe(4);
    expect(legs.exercises[0].repRange).toBe("6–8");
  });

  it("rest day has no exercises", () => {
    expect(getTemplate("rest").exercises).toHaveLength(0);
  });

  it("pullA carries the jog cardio note", () => {
    expect(getTemplate("pullA").cardio).toContain("1km");
  });
});
