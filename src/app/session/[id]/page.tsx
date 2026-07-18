"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSessions, saveSession } from "@/lib/db/repo";
import { scheduleSync } from "@/lib/db/sync";
import { findLastTime } from "@/lib/logic/lastTime";
import { ExerciseCard } from "@/components/ExerciseCard";
import type { Session, SessionExercise } from "@/lib/types";

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [all, setAll] = useState<Session[]>([]);

  useEffect(() => {
    getSessions().then((sessions) => {
      setAll(sessions);
      setSession(sessions.find((s) => s.id === id) ?? null);
    });
  }, [id]);

  async function persist(next: Session) {
    const stamped = { ...next, updatedAt: Date.now() };
    setSession(stamped);
    await saveSession(stamped);
    scheduleSync();
  }

  function updateExercise(i: number, ex: SessionExercise) {
    if (!session) return;
    const exercises = session.exercises.map((e, idx) => (idx === i ? ex : e));
    persist({ ...session, exercises });
  }

  function addExercise() {
    if (!session) return;
    const name = prompt("Exercise name");
    if (!name) return;
    persist({
      ...session,
      exercises: [
        ...session.exercises,
        { name, targetSets: 3, repRange: "—", skipped: false, sets: [] },
      ],
    });
  }

  if (!session) return <main className="p-5 text-muted">Loading…</main>;

  const totalSets = session.exercises.reduce(
    (n, ex) => n + (ex.sets.length || ex.targetSets),
    0
  );
  const doneSets = session.exercises.reduce(
    (n, ex) => n + ex.sets.filter((s) => s.done).length,
    0
  );
  const pct = totalSets ? Math.round((doneSets / totalSets) * 100) : 0;
  const dateLabel = new Date(session.date + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <main className="px-5 pb-6">
      <button onClick={() => router.push("/")} className="pt-5 text-sm text-muted">
        ← Today
      </button>

      <header className="pt-3">
        <div className="text-xs font-semibold uppercase tracking-widest text-muted">{dateLabel}</div>
        <h1 className="mt-1.5 text-[30px] font-bold tracking-tight">{session.title}</h1>
      </header>

      <div className="mt-5 flex items-center gap-4 rounded-3xl bg-surface p-5 shadow-sm">
        <div className="flex-1">
          <div className="text-[22px] font-bold tracking-tight">
            {doneSets} set{doneSets === 1 ? "" : "s"} logged
          </div>
          <div className="mt-0.5 text-[13.5px] text-fg2">
            {doneSets >= totalSets && totalSets > 0
              ? "Workout complete — well done"
              : `${totalSets - doneSets} to go`}
          </div>
        </div>
        <ProgressRing pct={pct} />
      </div>

      <div className="mt-5 space-y-3">
        {session.exercises.map((ex, i) => (
          <ExerciseCard
            key={i}
            exercise={ex}
            lastTimeSets={findLastTime(all, ex.name, session.date)}
            onChange={(e) => updateExercise(i, e)}
          />
        ))}
      </div>

      <button
        onClick={addExercise}
        className="mt-3 w-full rounded-2xl border border-dashed border-line py-3 text-sm text-muted hover:border-accent hover:text-accent"
      >
        + Add exercise
      </button>

      <label className="mt-3 flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-sm">
        <input
          type="checkbox"
          checked={session.cardioDone}
          onChange={(e) => persist({ ...session, cardioDone: e.target.checked })}
          className="h-5 w-5 accent-accent"
        />
        <span className="text-[15px]">Cardio done</span>
      </label>
    </main>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 24;
  const circ = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 58 58" className="h-[58px] w-[58px] shrink-0" aria-label={`${pct}% of sets logged`}>
      <circle cx="29" cy="29" r={r} fill="none" stroke="#ECECE9" strokeWidth="5" />
      <circle
        cx="29"
        cy="29"
        r={r}
        fill="none"
        stroke="#3E9B72"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct / 100)}
        transform="rotate(-90 29 29)"
      />
      <text x="29" y="33" textAnchor="middle" className="fill-fg text-[15px] font-bold">
        {pct}%
      </text>
    </svg>
  );
}
