import type { DietDay } from "@/lib/data/diet";

export function MealChecklist({
  day,
  checked,
  toggle,
}: {
  day: DietDay;
  checked: Record<string, boolean>;
  toggle: (id: string) => void;
}) {
  const doneCount = day.meals.filter((m) => checked[`${day.label}|${m.meal}`]).length;
  const allDone = doneCount === day.meals.length;

  return (
    <section className="rounded-3xl bg-surface p-5 shadow-sm">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">{day.label}</h2>
        <span className="shrink-0 text-sm text-accent">{day.calories} · {day.protein}</span>
      </div>
      <div className={`mt-1 text-[13px] font-semibold tabular-nums ${allDone ? "text-accent" : "text-muted"}`}>
        {doneCount}/{day.meals.length} eaten{allDone ? " ✓" : ""}
      </div>

      <ul className="mt-2">
        {day.meals.map((m) => {
          const id = `${day.label}|${m.meal}`;
          const done = !!checked[id];
          return (
            <li key={m.meal} className="border-t border-line first:border-t-0">
              <button
                onClick={() => toggle(id)}
                aria-pressed={done}
                className="flex w-full items-start gap-3 py-3 text-left"
              >
                <span
                  className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors ${
                    done ? "border-accent bg-accent text-white" : "border-line text-transparent"
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="4 12 10 18 20 6" />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] uppercase tracking-wide text-muted">{m.meal}</span>
                  <span className={`block text-sm ${done ? "text-muted line-through" : "text-fg"}`}>{m.food}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
