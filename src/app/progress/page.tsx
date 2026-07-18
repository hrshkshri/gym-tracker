"use client";
import { useEffect, useMemo, useState } from "react";
import { getSessions } from "@/lib/db/repo";
import { WeightChart } from "@/components/WeightChart";
import { exerciseTopSetSeries } from "@/lib/logic/exerciseSeries";
import type { Session } from "@/lib/types";

export default function ProgressPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [exercise, setExercise] = useState<string>("");

  useEffect(() => {
    getSessions().then(setSessions);
  }, []);

  const exerciseNames = useMemo(() => {
    const names = new Set<string>();
    sessions.forEach((s) => s.exercises.forEach((e) => names.add(e.name)));
    return [...names].sort();
  }, [sessions]);

  const selected = exercise || exerciseNames[0] || "";
  const series = exerciseTopSetSeries(sessions, selected);

  return (
    <main className="px-5 pb-6">
      <h1 className="pt-8 text-[30px] font-bold tracking-tight">Progress</h1>

      <section className="mt-6 rounded-3xl bg-surface p-5 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">Lift progression</h2>
        <select
          value={selected}
          onChange={(e) => setExercise(e.target.value)}
          className="mt-2 w-full rounded-xl border border-line bg-surface2 px-3 py-2"
        >
          {exerciseNames.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <div className="mt-3">
          <WeightChart series={series} />
        </div>
      </section>
    </main>
  );
}
