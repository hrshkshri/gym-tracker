import type { SetEntry } from "@/lib/types";

export function SetRow({
  index,
  set,
  lastTime,
  onChange,
}: {
  index: number;
  set: SetEntry;
  lastTime?: SetEntry;
  onChange: (s: SetEntry) => void;
}) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="w-6 text-sm text-muted">{index + 1}</span>
      <input
        inputMode="decimal"
        value={set.weight || ""}
        onChange={(e) => onChange({ ...set, weight: parseFloat(e.target.value) || 0 })}
        placeholder={lastTime ? String(lastTime.weight) : "kg"}
        className="w-20 rounded-lg bg-surface2 border border-line px-3 py-2 text-center"
      />
      <span className="text-muted">×</span>
      <input
        inputMode="numeric"
        value={set.reps || ""}
        onChange={(e) => onChange({ ...set, reps: parseInt(e.target.value) || 0 })}
        placeholder={lastTime ? String(lastTime.reps) : "reps"}
        className="w-20 rounded-lg bg-surface2 border border-line px-3 py-2 text-center"
      />
      <button
        onClick={() => onChange({ ...set, done: !set.done })}
        className={`ml-auto rounded-lg px-3 py-2 text-sm font-semibold ${
          set.done ? "bg-accent text-ink" : "bg-surface2 text-muted border border-line"
        }`}
      >
        ✓
      </button>
    </div>
  );
}
