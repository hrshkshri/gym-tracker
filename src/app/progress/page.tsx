"use client";
import { useEffect, useMemo, useState } from "react";
import { getSessions, getBodyweights } from "@/lib/db/repo";
import { BodyweightChart } from "@/components/BodyweightChart";
import { WeightChart } from "@/components/WeightChart";
import { exerciseTopSetSeries } from "@/lib/logic/exerciseSeries";
import { bodyweightSummary } from "@/lib/logic/bodyweightSummary";
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
  const summary = bodyweightSummary(bw);

  function fmtDate(iso: string) {
    return new Date(iso + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  return (
    <main className="px-5 pb-6">
      <h1 className="pt-8 text-[30px] font-bold tracking-tight">Progress</h1>

      <section className="mt-6 rounded-3xl bg-surface p-5 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">Bodyweight · 7-day avg</h2>

        {summary ? (
          <>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[34px] font-bold leading-none tracking-tight tabular-nums">
                {summary.latest}
              </span>
              <span className="text-lg font-medium text-muted">kg</span>
              {summary.weekChange !== null && (
                <span
                  className={`ml-1 text-sm font-semibold tabular-nums ${
                    summary.weekChange <= 0 ? "text-accent" : "text-fg2"
                  }`}
                >
                  {summary.weekChange > 0 ? "↑ +" : "↓ "}
                  {Math.abs(summary.weekChange)} kg/wk
                </span>
              )}
            </div>
            <div className="mt-1 text-[13px] text-muted">
              7-day avg {summary.avg} kg · last logged {fmtDate(summary.latestDate)}
            </div>
            <div className="mt-3">
              <BodyweightChart data={bw} />
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm text-muted">No weigh-ins yet. Log your fasted weight on the Today tab.</p>
        )}
      </section>

      <section className="mt-4 rounded-3xl bg-surface p-5 shadow-sm">
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
