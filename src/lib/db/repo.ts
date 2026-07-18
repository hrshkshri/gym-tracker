import { db, type Mutation } from "./dexie";
import { reconcileById } from "@/lib/logic/reconcile";
import type { Session, BodyweightEntry } from "@/lib/types";

export type { Mutation };

// Queue one pending mutation per record: replace any earlier unsynced mutation
// for the same entity+id so the queue can't grow unbounded while offline.
async function queueMutation(
  entity: Mutation["entity"],
  payload: Session | BodyweightEntry
): Promise<void> {
  const stale = await db.mutations
    .where("entity")
    .equals(entity)
    .filter((m) => m.payload.id === payload.id)
    .primaryKeys();
  if (stale.length) await db.mutations.bulkDelete(stale);
  await db.mutations.add({ entity, payload });
}

export async function saveSession(s: Session): Promise<void> {
  await db.sessions.put(s);
  await queueMutation("session", s);
}

export async function getSessions(): Promise<Session[]> {
  return db.sessions.toArray();
}

export async function saveBodyweight(b: BodyweightEntry): Promise<void> {
  await db.bodyweights.put(b);
  await queueMutation("bodyweight", b);
}

export async function getBodyweights(): Promise<BodyweightEntry[]> {
  return db.bodyweights.toArray();
}

export async function getPendingMutations(): Promise<Mutation[]> {
  return db.mutations.toArray();
}

export async function clearMutation(id: number): Promise<void> {
  await db.mutations.delete(id);
}

export async function mergeRemote(
  sessions: Session[],
  bodyweights: BodyweightEntry[]
): Promise<void> {
  const localSessions = await db.sessions.toArray();
  const localBw = await db.bodyweights.toArray();
  await db.sessions.bulkPut(reconcileById(localSessions, sessions));
  await db.bodyweights.bulkPut(reconcileById(localBw, bodyweights));
}
