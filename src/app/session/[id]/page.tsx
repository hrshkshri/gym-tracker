"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSessions, saveSession } from "@/lib/db/repo";
import { sync } from "@/lib/db/sync";
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
    sync().catch(() => {});
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

  if (!session) return <main className="p-5">Loading…</main>;

  return (
    <main className="p-5 space-y-3">
      <button onClick={() => router.push("/")} className="text-muted text-sm">← Today</button>
      <h1 className="text-2xl font-bold">{session.title}</h1>

      {session.exercises.map((ex, i) => (
        <ExerciseCard
          key={i}
          exercise={ex}
          lastTimeSets={findLastTime(all, ex.name, session.date)}
          onChange={(e) => updateExercise(i, e)}
        />
      ))}

      <button onClick={addExercise} className="w-full rounded-2xl border border-dashed border-line py-3 text-muted">
        + Add exercise
      </button>

      <label className="flex items-center gap-3 rounded-2xl bg-surface border border-line p-4">
        <input
          type="checkbox"
          checked={session.cardioDone}
          onChange={(e) => persist({ ...session, cardioDone: e.target.checked })}
          className="h-5 w-5 accent-accent"
        />
        <span>Cardio done</span>
      </label>
    </main>
  );
}
