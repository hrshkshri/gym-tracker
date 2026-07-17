import type { BodyweightEntry } from "@/lib/types";

export function rollingAverage7(
  entries: BodyweightEntry[]
): { date: string; weight: number; avg: number }[] {
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? -1 : 1));
  return sorted.map((entry, i) => {
    const window = sorted.slice(Math.max(0, i - 6), i + 1);
    const avg = window.reduce((sum, e) => sum + e.weightKg, 0) / window.length;
    return { date: entry.date, weight: entry.weightKg, avg };
  });
}
