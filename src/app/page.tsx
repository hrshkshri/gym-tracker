"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToday } from "@/lib/useToday";
import { SessionCard } from "@/components/SessionCard";
import { DIET } from "@/lib/data/diet";
import { getSessions, saveSession } from "@/lib/db/repo";
import { sync } from "@/lib/db/sync";
import { getTemplate } from "@/lib/data/templates";
import { getGreeting } from "@/lib/logic/greeting";
import { MealChecklist } from "@/components/MealChecklist";
import { useDailyChecklist } from "@/lib/useDailyChecklist";
import type { Session } from "@/lib/types";

function uuid() {
  return crypto.randomUUID();
}

export default function Home() {
  const router = useRouter();
  const { dayKey, template, todayIso } = useToday();
  const openingRef = useRef(false);

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

  const isTrainingDay = dayKey !== "rest";
  const diet = isTrainingDay ? DIET.training : DIET.rest;
  const greeting = getGreeting(new Date());
  const { checked, toggle } = useDailyChecklist();

  return (
    <main className="p-5 space-y-4">
      <header className="pt-4">
        <p className="text-muted text-sm">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{greeting.hey}</h1>
        <p className="mt-1 text-accent text-sm font-medium">{greeting.line}</p>
      </header>

      <SessionCard template={template} onOpen={openSession} />

      <MealChecklist day={diet} checked={checked} toggle={toggle} />

      <button
        onClick={() => router.push("/diet")}
        className="w-full py-1 text-center text-sm font-medium text-muted hover:text-accent"
      >
        Full diet plan &amp; rules →
      </button>
    </main>
  );
}
