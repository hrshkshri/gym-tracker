import type { Session, SetEntry } from "@/lib/types";

export function findLastTime(
  sessions: Session[],
  exerciseName: string,
  beforeDate: string
): SetEntry[] | null {
  const candidates = sessions
    .filter((s) => s.date < beforeDate)
    .sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first

  for (const session of candidates) {
    const match = session.exercises.find(
      (e) => e.name === exerciseName && !e.skipped && e.sets.length > 0
    );
    if (match) return match.sets;
  }
  return null;
}
