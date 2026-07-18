import { getPendingMutations, clearMutation, mergeRemote } from "./repo";
import type { Session } from "@/lib/types";

const ENDPOINT = { session: "/api/sessions" } as const;

// Push queued mutations. Stops at the first failure (a 5xx/network error means
// the backend is unreachable, so hammering the rest is pointless) and reports
// whether the whole queue drained cleanly.
export async function flushMutations(
  fetchFn: typeof fetch = fetch
): Promise<{ flushed: number; ok: boolean }> {
  const pending = await getPendingMutations();
  let flushed = 0;
  for (const m of pending) {
    let res: Response;
    try {
      res = await fetchFn(ENDPOINT[m.entity], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(m.payload),
      });
    } catch {
      return { flushed, ok: false };
    }
    if (!res.ok) return { flushed, ok: false };
    if (m.id != null) {
      await clearMutation(m.id);
      flushed++;
    }
  }
  return { flushed, ok: true };
}

export async function pullRemote(fetchFn: typeof fetch = fetch): Promise<void> {
  let sRes: Response;
  try {
    sRes = await fetchFn(ENDPOINT.session);
  } catch {
    return;
  }
  const sessions = (sRes.ok ? await sRes.json() : []) as Session[];
  await mergeRemote(sessions);
}

// Guard against overlapping syncs: while one is in flight (a stalled connection
// can take many seconds to time out), further calls are no-ops instead of
// stacking up into a request storm.
let syncing = false;

export async function sync(fetchFn: typeof fetch = fetch): Promise<void> {
  if (syncing) return;
  syncing = true;
  try {
    const { ok } = await flushMutations(fetchFn);
    // If the push failed, the backend is down — skip the pull rather than
    // firing more requests we already know will fail.
    if (ok) await pullRemote(fetchFn);
  } finally {
    syncing = false;
  }
}

// Debounced trigger for frequent callers (e.g. editing sets): coalesces a burst
// of edits into a single sync shortly after the last change.
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleSync(fetchFn: typeof fetch = fetch, delayMs = 2000): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    sync(fetchFn).catch(() => {});
  }, delayMs);
}
