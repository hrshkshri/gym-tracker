import type { DayKey } from "@/lib/logic/schedule";

export type { DayKey };

export interface ExerciseTemplate {
  name: string;
  targetSets: number;
  repRange: string; // e.g. "6–8", "Max", "10 each leg"
  note?: string;
}

// No weekday field: a template can land on more than one weekday (rest is both
// Thu and Sun), so the weekday → dayKey direction lives in logic/schedule.ts.
export interface DayTemplate {
  dayKey: DayKey;
  title: string;
  exercises: ExerciseTemplate[];
  cardio?: string;
}

export interface SetEntry {
  weight: number;
  reps: number;
  done: boolean;
}

export interface SessionExercise {
  name: string;
  targetSets: number;
  repRange: string;
  skipped: boolean;
  note?: string;
  sets: SetEntry[];
}

export interface Session {
  id: string;          // uuid, shared local + Atlas
  date: string;        // ISO yyyy-mm-dd
  dayKey: DayKey;
  title: string;
  exercises: SessionExercise[];
  cardioDone: boolean;
  updatedAt: number;   // ms epoch, for last-write-wins
}

