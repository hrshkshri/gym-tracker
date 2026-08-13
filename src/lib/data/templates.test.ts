import { describe, it, expect } from "vitest";
import { DAY_TEMPLATES, getTemplate } from "./templates";

describe("DAY_TEMPLATES", () => {
  it("has all six day keys", () => {
    expect(Object.keys(DAY_TEMPLATES).sort()).toEqual(
      ["legs", "lower", "pull", "push", "rest", "upper"].sort()
    );
  });

  it("legs template matches the plan (squat 5×8–10 first, plus abs)", () => {
    const legs = getTemplate("legs");
    expect(legs.title).toContain("Legs");
    expect(legs.exercises).toHaveLength(5);
    expect(legs.exercises[0].name).toContain("Squat");
    expect(legs.exercises[0].targetSets).toBe(5);
    expect(legs.exercises[0].repRange).toBe("8–10");
  });

  it("lower template opens with the deadlift at 5×5–6", () => {
    const lower = getTemplate("lower");
    expect(lower.exercises[0].name).toBe("Deadlift");
    expect(lower.exercises[0].targetSets).toBe(5);
    expect(lower.exercises[0].repRange).toBe("5–6");
  });

  it("pull day opens with pull-ups and offers the curl swap", () => {
    const pull = getTemplate("pull");
    expect(pull.exercises.map((e) => e.name)).toEqual([
      "Assisted Pull Ups",
      "Lat Pulldown",
      "Chest-Supported Machine Row (neutral grip)",
      "Face Pulls",
      "DB Curl",
    ]);
    expect(pull.exercises[0].targetSets).toBe(3);
    expect(pull.exercises[4].note).toBe("or Hammer Curl");
  });

  it("rest day has no exercises", () => {
    expect(getTemplate("rest").exercises).toHaveLength(0);
  });

  it("puts abs work on legs, push and upper days only", () => {
    const hasAbs = (key: keyof typeof DAY_TEMPLATES) =>
      getTemplate(key).exercises.some((e) => /Abs|Obliques/.test(e.name));
    expect(hasAbs("legs")).toBe(true);
    expect(hasAbs("push")).toBe(true);
    expect(hasAbs("upper")).toBe(true);
    expect(hasAbs("pull")).toBe(false);
    expect(hasAbs("lower")).toBe(false);
  });
});
