import type { SessionExercise, SetEntry } from "@/lib/types";
import { SetRow } from "./SetRow";

export function ExerciseCard({
  exercise,
  lastTimeSets,
  onChange,
}: {
  exercise: SessionExercise;
  lastTimeSets: SetEntry[] | null;
  onChange: (e: SessionExercise) => void;
}) {
  function updateSet(i: number, set: SetEntry) {
    const sets = exercise.sets.map((s, idx) => (idx === i ? set : s));
    onChange({ ...exercise, sets });
  }
  function addSet() {
    const last = lastTimeSets?.[exercise.sets.length];
    onChange({
      ...exercise,
      sets: [...exercise.sets, { weight: last?.weight ?? 0, reps: 0, done: false }],
    });
  }

  return (
    <div className={`rounded-2xl bg-surface border border-line p-4 ${exercise.skipped ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold">{exercise.name}</div>
          <div className="text-xs text-muted">
            {exercise.targetSets} × {exercise.repRange}
          </div>
        </div>
        <button
          onClick={() => onChange({ ...exercise, skipped: !exercise.skipped })}
          className="text-xs text-muted border border-line rounded-lg px-2 py-1"
        >
          {exercise.skipped ? "Undo" : "Skip"}
        </button>
      </div>

      {lastTimeSets && lastTimeSets.length > 0 && (
        <div className="mt-2 text-xs text-accent/90">
          Last time: {lastTimeSets.map((s) => `${s.weight}×${s.reps}`).join("  ")}
        </div>
      )}

      {!exercise.skipped && (
        <div className="mt-3">
          {exercise.sets.map((s, i) => (
            <SetRow
              key={i}
              index={i}
              set={s}
              lastTime={lastTimeSets?.[i]}
              onChange={(ns) => updateSet(i, ns)}
            />
          ))}
          <button onClick={addSet} className="mt-2 text-sm text-accent font-medium">
            + Add set
          </button>
        </div>
      )}
    </div>
  );
}
