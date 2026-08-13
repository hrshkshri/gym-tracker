import type { DayKey, DayTemplate } from "@/lib/types";

const ex = (name: string, targetSets: number, repRange: string, note?: string) =>
  ({ name, targetSets, repRange, note });

export const DAY_TEMPLATES: Record<DayKey, DayTemplate> = {
  legs: {
    dayKey: "legs",
    title: "Legs",
    exercises: [
      ex("Barbell Squat (deep, safety pins set)", 5, "8–10"),
      ex("RDL", 4, "10–12"),
      ex("Leg Curl", 3, "15"),
      ex("Calf Raises", 4, "15–20"),
      ex("Decline Sit-ups — Upper Abs", 3, "15"),
    ],
  },
  pull: {
    dayKey: "pull",
    title: "Pull (Back + Biceps)",
    exercises: [
      ex("Chest-Supported Machine Row (neutral grip)", 4, "10–12"),
      ex("Assisted Pull Ups", 4, "Max"),
      ex("Face Pulls", 3, "15"),
      ex("DB Curl", 3, "12"),
    ],
  },
  push: {
    dayKey: "push",
    title: "Push (Chest + Shoulders + Triceps)",
    exercises: [
      ex("Barbell Incline Press", 4, "8–10"),
      ex("Cable Flye", 3, "12–15"),
      ex("Standing Barbell OHP", 4, "6–8"),
      ex("Lateral Raise", 3, "15"),
      ex("Triceps Pushdown", 3, "12–15"),
      ex("Reverse Crunches — Lower Abs", 3, "15"),
    ],
  },
  lower: {
    dayKey: "lower",
    title: "Lower (Posterior Chain + Quads)",
    exercises: [
      ex("Deadlift", 5, "5–6"),
      ex("Leg Extension", 3, "12–15"),
      ex("Walking Lunges", 3, "12 each leg"),
      ex("Standing Calf Raise", 4, "15–20"),
    ],
  },
  upper: {
    dayKey: "upper",
    title: "Upper (Chest + Back + Shoulders)",
    exercises: [
      ex("Barbell Bench Press", 4, "6–8"),
      ex("Pullover", 3, "12–15"),
      ex("DB Shoulder Press", 4, "8–10"),
      ex("Bicycle Crunches — Obliques", 3, "20"),
    ],
  },
  rest: {
    dayKey: "rest",
    title: "Rest",
    exercises: [],
  },
};

export function getTemplate(dayKey: DayKey): DayTemplate {
  return DAY_TEMPLATES[dayKey];
}
