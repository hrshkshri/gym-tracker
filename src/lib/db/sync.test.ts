import { describe, it, expect, beforeEach, vi } from "vitest";
import { db } from "./dexie";
import { saveSession } from "./repo";
import { flushMutations, pullRemote } from "./sync";
import type { Session } from "@/lib/types";

const session = (id: string): Session => ({
  id, date: "2026-07-15", dayKey: "pushA", title: "Push A",
  cardioDone: false, updatedAt: 1, exercises: [],
});

describe("sync", () => {
  beforeEach(async () => {
    await db.sessions.clear();
    await db.bodyweights.clear();
    await db.mutations.clear();
  });

  it("flushMutations POSTs each pending mutation and clears the queue", async () => {
    await saveSession(session("s1"));
    const fetchFn = vi.fn().mockResolvedValue({ ok: true });
    const count = await flushMutations(fetchFn as unknown as typeof fetch);
    expect(count).toBe(1);
    expect(fetchFn).toHaveBeenCalledWith(
      "/api/sessions",
      expect.objectContaining({ method: "POST" })
    );
    expect(await db.mutations.count()).toBe(0);
  });

  it("keeps the mutation queued when the POST fails", async () => {
    await saveSession(session("s1"));
    const fetchFn = vi.fn().mockResolvedValue({ ok: false });
    await flushMutations(fetchFn as unknown as typeof fetch);
    expect(await db.mutations.count()).toBe(1);
  });

  it("pullRemote merges fetched rows into local", async () => {
    const fetchFn = vi.fn((url: string) =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve(url === "/api/sessions" ? [session("r1")] : []),
      })
    );
    await pullRemote(fetchFn as unknown as typeof fetch);
    expect(await db.sessions.count()).toBe(1);
  });
});
