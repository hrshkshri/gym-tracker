import type { Session } from "@/lib/types";

export function exerciseTopSetSeries(
  sessions: Session[],
  exerciseName: string
): { date: string; topWeight: number }[] {
  return [...sessions]
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .flatMap((s) => {
      const ex = s.exercises.find((e) => e.name === exerciseName && !e.skipped);
      if (!ex || ex.sets.length === 0) return [];
      const topWeight = Math.max(...ex.sets.map((set) => set.weight));
      return [{ date: s.date, topWeight }];
    });
}
