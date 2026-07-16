import { getPendingMutations, clearMutation, mergeRemote } from "./repo";
import type { Session, BodyweightEntry } from "@/lib/types";

const ENDPOINT = { session: "/api/sessions", bodyweight: "/api/bodyweight" } as const;

export async function flushMutations(fetchFn: typeof fetch = fetch): Promise<number> {
  const pending = await getPendingMutations();
  let flushed = 0;
  for (const m of pending) {
    const res = await fetchFn(ENDPOINT[m.entity], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(m.payload),
    });
    if (res.ok && m.id != null) {
      await clearMutation(m.id);
      flushed++;
    }
  }
  return flushed;
}

export async function pullRemote(fetchFn: typeof fetch = fetch): Promise<void> {
  const [sRes, bRes] = await Promise.all([
    fetchFn(ENDPOINT.session),
    fetchFn(ENDPOINT.bodyweight),
  ]);
  const sessions = (sRes.ok ? await sRes.json() : []) as Session[];
  const bodyweights = (bRes.ok ? await bRes.json() : []) as BodyweightEntry[];
  await mergeRemote(sessions, bodyweights);
}

export async function sync(fetchFn: typeof fetch = fetch): Promise<void> {
  await flushMutations(fetchFn);
  await pullRemote(fetchFn);
}
