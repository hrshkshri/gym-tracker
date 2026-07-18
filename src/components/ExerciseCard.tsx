import type { SessionExercise, SetEntry } from "@/lib/types";
import { SetRow } from "./SetRow";
import { getExerciseMeta } from "@/lib/data/exerciseMeta";

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
      sets: [...exercise.sets, { weight: last?.weight ?? 0, reps: last?.reps ?? 0, done: false }],
    });
  }
  function removeSet(i: number) {
    onChange({ ...exercise, sets: exercise.sets.filter((_, idx) => idx !== i) });
  }

  const meta = getExerciseMeta(exercise.name);
  const doneCount = exercise.sets.filter((s) => s.done).length;
  const complete = exercise.sets.length > 0 && doneCount === exercise.sets.length;

  return (
    <div className={`rounded-3xl bg-surface p-5 shadow-sm ${exercise.skipped ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[17px] font-semibold leading-tight tracking-tight">{exercise.name}</div>
          <div className="mt-1 text-[13px] text-muted">
            {exercise.targetSets} × {exercise.repRange}
            {meta && <span> · {meta.muscles}</span>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span
            className={`text-[13px] font-semibold tabular-nums ${complete ? "text-accent" : "text-muted"}`}
          >
            {doneCount}/{exercise.sets.length || exercise.targetSets}
            {complete ? " ✓" : ""}
          </span>
          <button
            onClick={() => onChange({ ...exercise, skipped: !exercise.skipped })}
            className="text-[13px] text-muted hover:text-fg2"
          >
            {exercise.skipped ? "Undo" : "Skip"}
          </button>
        </div>
      </div>

      {!exercise.skipped && (
        <>
          {meta && (
            <p className="mt-3 flex gap-1.5 text-[12.5px] leading-relaxed text-fg2">
              <span aria-hidden>💡</span>
              <span>{meta.cue}</span>
            </p>
          )}

          <div className="mt-3">
            {exercise.sets.map((s, i) => (
              <SetRow
                key={i}
                index={i}
                set={s}
                lastTime={lastTimeSets?.[i]}
                onChange={(ns) => updateSet(i, ns)}
                onDelete={() => removeSet(i)}
              />
            ))}
            <button
              onClick={addSet}
              className="mt-1 w-full border-t border-line pt-3 text-left text-sm font-semibold text-accent"
            >
              + Add set
            </button>
          </div>
        </>
      )}
    </div>
  );
}
