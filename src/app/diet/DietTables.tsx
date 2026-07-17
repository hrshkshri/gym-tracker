import { DIET, type DietDay } from "@/lib/data/diet";

function DayBlock({ day }: { day: DietDay }) {
  return (
    <section className="rounded-2xl bg-surface border border-line p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold">{day.label}</h2>
        <span className="text-sm text-accent">{day.calories} · {day.protein}</span>
      </div>
      <ul className="mt-3 divide-y divide-line">
        {day.meals.map((m) => (
          <li key={m.meal} className="py-2">
            <div className="text-xs uppercase tracking-wide text-muted">{m.meal}</div>
            <div className="text-sm">{m.food}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DietTables() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">{DIET.context}</p>
      <DayBlock day={DIET.training} />
      <DayBlock day={DIET.rest} />
      <section className="rounded-2xl bg-surface border border-line p-4">
        <h2 className="font-semibold">Key rules</h2>
        <ol className="mt-2 list-decimal pl-5 space-y-1 text-sm text-muted">
          {DIET.rules.map((r, i) => <li key={i}>{r}</li>)}
        </ol>
      </section>
    </div>
  );
}
