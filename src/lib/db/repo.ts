import { db, type Mutation } from "./dexie";
import { reconcileById } from "@/lib/logic/reconcile";
import type { Session } from "@/lib/types";

export type { Mutation };

export async function saveSession(s: Session): Promise<void> {
  await db.sessions.put(s);
  // Queue one pending mutation per record: replace any earlier unsynced
  // mutation for the same id so the queue can't grow unbounded while offline.
  const stale = await db.mutations
    .where("entity")
    .equals("session")
    .filter((m) => m.payload.id === s.id)
    .primaryKeys();
  if (stale.length) await db.mutations.bulkDelete(stale);
  await db.mutations.add({ entity: "session", payload: s });
}

export async function getSessions(): Promise<Session[]> {
  return db.sessions.toArray();
}

export async function getPendingMutations(): Promise<Mutation[]> {
  return db.mutations.toArray();
}

export async function clearMutation(id: number): Promise<void> {
  await db.mutations.delete(id);
}

export async function mergeRemote(sessions: Session[]): Promise<void> {
  const localSessions = await db.sessions.toArray();
  await db.sessions.bulkPut(reconcileById(localSessions, sessions));
}
