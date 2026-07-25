"use client";
import { useState } from "react";
import { DAY_TEMPLATES } from "@/lib/data/templates";
import { getDayKeyForWeekday } from "@/lib/logic/schedule";
import type { DayKey } from "@/lib/types";

// The week in training order (Mon → Sun).
const WEEK_ORDER: DayKey[] = ["legs", "pullA", "pushA", "run", "pullB", "pushB", "rest"];
const WEEKDAY_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function PlanPage() {
  const todayKey = getDayKeyForWeekday(new Date().getDay());
  const [index, setIndex] = useState(() => WEEK_ORDER.indexOf(todayKey));

  const dayKey = WEEK_ORDER[index];
  const day = DAY_TEMPLATES[dayKey];
  const isToday = dayKey === todayKey;

  const step = (delta: number) =>
    setIndex((i) => (i + delta + WEEK_ORDER.length) % WEEK_ORDER.length);

  return (
    <main className="p-5 space-y-4">
      <header className="pt-4">
        <h1 className="text-3xl font-bold tracking-tight">Weekly Plan</h1>
        <p className="mt-1 text-sm text-muted">Browse any day&apos;s workout.</p>
      </header>

      <div className="flex items-center justify-between gap-3 rounded-3xl bg-surface p-2 shadow-sm">
        <button
          onClick={() => step(-1)}
          aria-label="Previous day"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-muted active:scale-95 transition hover:text-accent"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 6 9 12 15 18" />
          </svg>
        </button>
        <div className="min-w-0 text-center">
          <div className="text-[11px] uppercase tracking-widest text-muted">
            {WEEKDAY_LABEL[day.weekday]}{isToday ? " · Today" : ""}
          </div>
          <div className="truncate text-lg font-semibold">{day.title}</div>
        </div>
        <button
          onClick={() => step(1)}
          aria-label="Next day"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-muted active:scale-95 transition hover:text-accent"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>
      </div>

      <section className="rounded-3xl bg-surface p-5 shadow-sm">
        {day.cardio && (
          <div className="mb-4 rounded-2xl bg-surface2 p-3 text-sm">
            <span className="text-[11px] uppercase tracking-wide text-muted">Cardio</span>
            <p className="mt-0.5 text-fg">{day.cardio}</p>
          </div>
        )}

        {day.exercises.length === 0 ? (
          <p className="py-2 text-sm text-muted">
            {day.cardio ? "Cardio only — no lifting today." : "Rest day — no lifting."}
          </p>
        ) : (
          <ul>
            {day.exercises.map((e) => (
              <li key={e.name} className="border-t border-line py-3 first:border-t-0 first:pt-0">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 text-sm text-fg">{e.name}</span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-accent">
                    {e.targetSets} × {e.repRange}
                  </span>
                </div>
                {e.note && <p className="mt-0.5 text-xs text-muted">{e.note}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
