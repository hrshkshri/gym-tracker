import type { BodyweightEntry } from "@/lib/types";
import { rollingAverage7 } from "./rollingAverage";

export interface BodyweightSummary {
  latest: number;        // most recent weigh-in (kg)
  latestDate: string;    // ISO date of that weigh-in
  avg: number;           // current 7-day rolling average, 1 dp
  weekChange: number | null; // change in the average vs ~7 entries ago, 1 dp
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function bodyweightSummary(entries: BodyweightEntry[]): BodyweightSummary | null {
  if (entries.length === 0) return null;
  const series = rollingAverage7(entries);
  const last = series[series.length - 1];
  const prior = series[series.length - 8]; // 7 entries earlier, if we have them
  return {
    latest: last.weight,
    latestDate: last.date,
    avg: round1(last.avg),
    weekChange: prior ? round1(last.avg - prior.avg) : null,
  };
}
