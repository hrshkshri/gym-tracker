import type { DayKey, DayTemplate } from "@/lib/types";

const ex = (name: string, targetSets: number, repRange: string, note?: string) =>
  ({ name, targetSets, repRange, note });

const JOG = "1km jog — Incline 6, Speed 8–9 km/h";

export const DAY_TEMPLATES: Record<DayKey, DayTemplate> = {
  legs: {
    dayKey: "legs",
    title: "Legs",
    weekday: 1,
    exercises: [
      ex("Barbell Squat (deep, safety pins set)", 4, "6–8"),
      ex("RDL", 4, "8–10"),
      ex("Bulgarian Split Squat", 3, "10 each leg"),
      ex("Leg Extension", 3, "12–15"),
      ex("Leg Curl", 3, "12–15"),
      ex("Calf Raises", 5, "15–20"),
      ex("Decline Sit-ups — Upper Abs", 3, "15"),
    ],
  },
  pullA: {
    dayKey: "pullA",
    title: "Pull A (Back + Biceps)",
    weekday: 2,
    cardio: JOG,
    exercises: [
      ex("Assisted Pull Ups", 4, "Max"),
      ex("Barbell Row", 4, "6–8"),
      ex("Chest-Supported Machine Row (neutral grip)", 3, "10–12"),
      ex("Lat Pulldown", 3, "10–12"),
      ex("Face Pulls", 3, "15"),
      ex("DB Curl", 3, "12"),
      ex("Hammer Curl", 3, "12"),
    ],
  },
  pushA: {
    dayKey: "pushA",
    title: "Push A (Chest + Shoulders + Triceps)",
    weekday: 3,
    cardio: JOG,
    exercises: [
      ex("Barbell Bench Press", 4, "6–8"),
      ex("Barbell Incline Press", 4, "8–10"),
      ex("Assisted Dips", 3, "8–10"),
      ex("Standing Barbell OHP", 4, "6–8"),
      ex("Lateral Raise", 3, "15"),
      ex("Triceps Pushdown", 3, "12–15"),
      ex("Reverse Crunches — Lower Abs", 3, "15"),
    ],
  },
  run: {
    dayKey: "run",
    title: "Run",
    weekday: 4,
    cardio:
      "3–4km · Speed 9 km/h · Incline 0 (flat) · Run/walk intervals — run at 9 km/h, walk at 4–5 km/h to recover, repeat. Shin tightness → drop to walk immediately.",
    exercises: [],
  },
  pullB: {
    dayKey: "pullB",
    title: "Pull B (Back + Biceps)",
    weekday: 5,
    exercises: [
      ex("Assisted Chin Ups", 4, "Max"),
      ex("Deadlift", 4, "4–5"),
      ex("Single Arm DB Row", 4, "8–10 each"),
      ex("Cable Straight-Arm Pulldown", 3, "12–15"),
      ex("Reverse Fly", 3, "15"),
      ex("Incline DB Curl", 3, "12"),
    ],
  },
  pushB: {
    dayKey: "pushB",
    title: "Push B (Chest + Shoulders + Triceps)",
    weekday: 6,
    cardio: JOG,
    exercises: [
      ex("DB Flat Press", 4, "8–10"),
      ex("DB Shoulder Press", 4, "8–10"),
      ex("Cable Flye", 3, "12–15"),
      ex("Seated Lateral Raise", 3, "15"),
      ex("Triceps Overhead Extension", 3, "12"),
      ex("Bicycle Crunches — Obliques", 3, "20"),
    ],
  },
  rest: {
    dayKey: "rest",
    title: "Rest",
    weekday: 0,
    exercises: [],
  },
};

export function getTemplate(dayKey: DayKey): DayTemplate {
  return DAY_TEMPLATES[dayKey];
}
