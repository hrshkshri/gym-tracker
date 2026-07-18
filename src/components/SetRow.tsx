import type { SetEntry } from "@/lib/types";
import { setDelta, fmtWeight } from "@/lib/logic/progression";

const WEIGHT_STEP = 2.5;

const DELTA_STYLES = {
  up: "text-accent",
  same: "text-muted",
  down: "text-muted",
} as const;

const DELTA_ARROW = { up: "↑", same: "=", down: "↓" } as const;

export function SetRow({
  index,
  set,
  lastTime,
  onChange,
  onDelete,
}: {
  index: number;
  set: SetEntry;
  lastTime?: SetEntry;
  onChange: (s: SetEntry) => void;
  onDelete: () => void;
}) {
  const delta = setDelta(set, lastTime);
  const beatingWeight = !!lastTime && set.weight > lastTime.weight;

  function bumpWeight(dir: number) {
    onChange({ ...set, weight: Math.max(0, Math.round((set.weight + dir * WEIGHT_STEP) * 10) / 10) });
  }
  function bumpReps(dir: number) {
    onChange({ ...set, reps: Math.max(0, set.reps + dir) });
  }

  return (
    <div className="flex items-center gap-1.5 border-t border-line py-2.5 first:border-t-0">
      <button
        aria-label={set.done ? `Set ${index + 1} logged, tap to undo` : `Log set ${index + 1}`}
        aria-pressed={set.done}
        onClick={() => onChange({ ...set, done: !set.done })}
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-colors ${
          set.done ? "border-accent bg-accent text-white" : "border-line text-transparent"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
          <polyline points="4 12 10 18 20 6" />
        </svg>
      </button>

      <button
        aria-label="Decrease weight"
        onClick={() => bumpWeight(-1)}
        className="grid h-8 w-6 shrink-0 place-items-center rounded-lg text-xl text-muted hover:bg-surface2 hover:text-fg"
      >
        −
      </button>
      <input
        inputMode="decimal"
        aria-label={`Set ${index + 1} weight in kg`}
        value={set.weight || ""}
        onChange={(e) => onChange({ ...set, weight: parseFloat(e.target.value) || 0 })}
        placeholder={lastTime ? String(lastTime.weight) : "kg"}
        className={`w-11 rounded-lg border-b border-transparent bg-transparent py-1 text-center text-lg font-semibold tabular-nums focus:border-accent focus:bg-accent-soft focus:outline-none ${
          beatingWeight ? "text-accent" : "text-fg"
        }`}
      />
      <button
        aria-label="Increase weight"
        onClick={() => bumpWeight(1)}
        className="grid h-8 w-6 shrink-0 place-items-center rounded-lg text-xl text-muted hover:bg-surface2 hover:text-fg"
      >
        +
      </button>
      <span className="shrink-0 text-xs text-muted">kg</span>

      <span className="shrink-0 text-muted">×</span>
      <input
        inputMode="numeric"
        aria-label={`Set ${index + 1} reps`}
        value={set.reps || ""}
        onChange={(e) => onChange({ ...set, reps: parseInt(e.target.value) || 0 })}
        placeholder={lastTime ? String(lastTime.reps) : "reps"}
        className="w-9 rounded-lg border-b border-transparent bg-transparent py-1 text-center text-lg font-semibold tabular-nums text-fg focus:border-accent focus:bg-accent-soft focus:outline-none"
      />

      <span className="ml-auto shrink-0 text-right leading-tight">
        {lastTime ? (
          <>
            <span className="text-[10px] uppercase tracking-wider text-muted">last </span>
            <span className="text-xs font-semibold tabular-nums text-fg2">
              {fmtWeight(lastTime.weight)}×{lastTime.reps}
            </span>
            {delta && (
              <span className={`ml-1 text-xs font-bold ${DELTA_STYLES[delta.dir]}`}>
                {DELTA_ARROW[delta.dir]}
              </span>
            )}
          </>
        ) : (
          <span className="text-[10px] uppercase tracking-wider text-muted">new</span>
        )}
      </span>

      <button
        aria-label={`Remove set ${index + 1}`}
        onClick={onDelete}
        className="grid h-7 w-6 shrink-0 place-items-center rounded-lg text-muted hover:text-fg"
      >
        ×
      </button>
    </div>
  );
}
