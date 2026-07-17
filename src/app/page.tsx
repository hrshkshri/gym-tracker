"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToday } from "@/lib/useToday";
import { SessionCard } from "@/components/SessionCard";
import { DIET } from "@/lib/data/diet";
import { getSessions, saveSession, saveBodyweight } from "@/lib/db/repo";
import { sync } from "@/lib/db/sync";
import { getTemplate } from "@/lib/data/templates";
import type { Session } from "@/lib/types";

function uuid() {
  return crypto.randomUUID();
}

export default function Home() {
  const router = useRouter();
  const { dayKey, template, todayIso } = useToday();
  const [weight, setWeight] = useState("");
  const openingRef = useRef(false);
  const loggingWeightRef = useRef(false);

  useEffect(() => {
    sync().catch(() => {});
  }, []);

  async function openSession() {
    if (openingRef.current) return;
    openingRef.current = true;
    try {
      const existing = (await getSessions()).find(
        (s) => s.date === todayIso && s.dayKey === dayKey
      );
      if (existing) return router.push(`/session/${existing.id}`);

      const t = getTemplate(dayKey);
      const session: Session = {
        id: uuid(),
        date: todayIso,
        dayKey,
        title: t.title,
        cardioDone: false,
        updatedAt: Date.now(),
        exercises: t.exercises.map((e) => ({
          name: e.name,
          targetSets: e.targetSets,
          repRange: e.repRange,
          note: e.note,
          skipped: false,
          sets: [],
        })),
      };
      await saveSession(session);
      router.push(`/session/${session.id}`);
    } finally {
      openingRef.current = false;
    }
  }

  async function logWeight() {
    if (loggingWeightRef.current) return;
    const kg = parseFloat(weight);
    if (!Number.isFinite(kg)) return;
    loggingWeightRef.current = true;
    try {
      await saveBodyweight({ id: uuid(), date: todayIso, weightKg: kg, updatedAt: Date.now() });
      setWeight("");
      sync().catch(() => {});
    } finally {
      loggingWeightRef.current = false;
    }
  }

  const isTrainingDay = dayKey !== "rest";
  const diet = isTrainingDay ? DIET.training : DIET.rest;

  return (
    <main className="p-5 space-y-4">
      <header className="pt-4">
        <h1 className="text-3xl font-bold tracking-tight">Wayne</h1>
        <p className="text-muted text-sm">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
        </p>
      </header>

      <SessionCard template={template} onOpen={openSession} />

      <section className="rounded-2xl bg-surface border border-line p-5">
        <div className="text-xs uppercase tracking-widest text-muted">Fasted weight</div>
        <div className="mt-2 flex gap-2">
          <input
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="kg"
            className="flex-1 rounded-xl bg-surface2 border border-line px-4 py-3 text-lg"
          />
          <button onClick={logWeight} className="rounded-xl bg-accent text-ink font-semibold px-5">
            Log
          </button>
        </div>
      </section>

      <button
        onClick={() => router.push("/diet")}
        className="w-full text-left rounded-2xl bg-surface border border-line p-5"
      >
        <div className="text-xs uppercase tracking-widest text-muted">{diet.label}</div>
        <div className="mt-1 text-lg font-semibold">{diet.calories} · {diet.protein}</div>
        <div className="mt-1 text-sm text-muted">Tap for full diet plan</div>
      </button>
    </main>
  );
}
