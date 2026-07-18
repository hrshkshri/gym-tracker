import { describe, it, expect, beforeEach } from "vitest";
import { db } from "./dexie";
import { saveSession, getSessions, getPendingMutations, mergeRemote } from "./repo";
import type { Session } from "@/lib/types";

const session = (id: string, updatedAt: number): Session => ({
  id, date: "2026-07-15", dayKey: "pushA", title: "Push A",
  cardioDone: false, updatedAt, exercises: [],
});

describe("repo", () => {
  beforeEach(async () => {
    await db.sessions.clear();
    await db.mutations.clear();
  });

  it("saveSession stores locally and enqueues a mutation", async () => {
    await saveSession(session("s1", 1));
    expect(await getSessions()).toHaveLength(1);
    const pending = await getPendingMutations();
    expect(pending).toHaveLength(1);
    expect(pending[0].entity).toBe("session");
  });

  it("mergeRemote reconciles by updatedAt without enqueuing", async () => {
    await saveSession(session("s1", 1));
    await db.mutations.clear();
    await mergeRemote([session("s1", 5), session("s2", 2)]);
    const stored = (await getSessions()).sort((a, b) => a.id.localeCompare(b.id));
    expect(stored.map((s) => [s.id, s.updatedAt])).toEqual([["s1", 5], ["s2", 2]]);
    expect(await getPendingMutations()).toHaveLength(0);
  });
});
