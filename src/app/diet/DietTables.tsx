"use client";
import { DIET } from "@/lib/data/diet";
import { useDailyChecklist } from "@/lib/useDailyChecklist";
import { MealChecklist } from "@/components/MealChecklist";

export function DietTables() {
  const { checked, toggle } = useDailyChecklist();
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">{DIET.context}</p>
      <p className="text-xs text-muted">Tap a meal to tick it off — the checklist resets each day.</p>
      <MealChecklist day={DIET.training} checked={checked} toggle={toggle} />
      <MealChecklist day={DIET.rest} checked={checked} toggle={toggle} />
      <section className="rounded-3xl bg-surface p-5 shadow-sm">
        <h2 className="font-semibold tracking-tight">Key rules</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted">
          {DIET.rules.map((r, i) => <li key={i}>{r}</li>)}
        </ol>
      </section>
    </div>
  );
}
