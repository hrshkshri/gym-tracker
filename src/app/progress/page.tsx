"use client";
import { useEffect, useMemo, useState } from "react";
import { getSessions, getBodyweights } from "@/lib/db/repo";
import { BodyweightChart } from "@/components/BodyweightChart";
import { WeightChart } from "@/components/WeightChart";
import { exerciseTopSetSeries } from "@/lib/logic/exerciseSeries";
import type { Session, BodyweightEntry } from "@/lib/types";

export default function ProgressPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [bw, setBw] = useState<BodyweightEntry[]>([]);
  const [exercise, setExercise] = useState<string>("");

  useEffect(() => {
    getSessions().then(setSessions);
    getBodyweights().then(setBw);
  }, []);

  const exerciseNames = useMemo(() => {
    const names = new Set<string>();
    sessions.forEach((s) => s.exercises.forEach((e) => names.add(e.name)));
    return [...names].sort();
  }, [sessions]);

  const selected = exercise || exerciseNames[0] || "";
  const series = exerciseTopSetSeries(sessions, selected);

  return (
    <main className="p-5 space-y-6">
      <h1 className="text-2xl font-bold">Progress</h1>

      <section className="space-y-2">
        <h2 className="text-sm uppercase tracking-widest text-muted">Bodyweight · 7-day avg</h2>
        <BodyweightChart data={bw} />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm uppercase tracking-widest text-muted">Lift progression</h2>
        <select
          value={selected}
          onChange={(e) => setExercise(e.target.value)}
          className="w-full rounded-xl bg-surface2 border border-line px-3 py-2"
        >
          {exerciseNames.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <WeightChart series={series} />
      </section>
    </main>
  );
}
