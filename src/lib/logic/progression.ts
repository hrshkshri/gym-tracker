import type { SetEntry } from "@/lib/types";

// A set counts as "logged" once it carries any weight or reps.
function isLogged(s: SetEntry | undefined | null): s is SetEntry {
  return !!s && (s.weight > 0 || s.reps > 0);
}

// Format a weight, rounding float drift (e.g. 62.500000001 → "62.5", 60 → "60").
export function fmtWeight(w: number): string {
  return String(Math.round(w * 100) / 100);
}

// The heaviest set, tie-broken by reps. Ignores empty sets. Null if none.
export function bestSet(sets: SetEntry[]): SetEntry | null {
  let best: SetEntry | null = null;
  for (const s of sets) {
    if (!isLogged(s)) continue;
    if (!best || compareSet(s, best) > 0) best = s;
  }
  return best;
}

// >0 if a is the stronger set, <0 if weaker, 0 if equal. Weight first, then reps.
export function compareSet(a: SetEntry, b: SetEntry): number {
  if (a.weight !== b.weight) return a.weight - b.weight;
  return a.reps - b.reps;
}

export type DeltaDir = "up" | "down" | "same";
export interface SetDelta {
  dir: DeltaDir;
  label: string;
}

// How the current set compares to the same set last time. Null when there's
// nothing to compare (current set empty, or no matching set last time).
export function setDelta(current: SetEntry, last: SetEntry | undefined | null): SetDelta | null {
  if (!isLogged(current) || !isLogged(last)) return null;
  const dw = current.weight - last.weight;
  if (dw > 0) return { dir: "up", label: `+${fmtWeight(dw)}kg` };
  if (dw < 0) return { dir: "down", label: `−${fmtWeight(-dw)}kg` };
  const dr = current.reps - last.reps;
  if (dr > 0) return { dir: "up", label: `+${dr} rep${dr === 1 ? "" : "s"}` };
  if (dr < 0) return { dir: "down", label: `−${-dr} rep${-dr === 1 ? "" : "s"}` };
  return { dir: "same", label: "matched" };
}

// True once this session's best set beats last session's best.
export function hasBeaten(current: SetEntry[], last: SetEntry[]): boolean {
  const c = bestSet(current);
  const l = bestSet(last);
  if (!c || !l) return false;
  return compareSet(c, l) > 0;
}
