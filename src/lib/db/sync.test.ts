import { describe, it, expect, beforeEach, vi } from "vitest";
import { db } from "./dexie";
import { saveSession } from "./repo";
import { flushMutations, pullRemote, sync } from "./sync";
import type { Session } from "@/lib/types";

const session = (id: string): Session => ({
  id, date: "2026-07-15", dayKey: "pushA", title: "Push A",
  cardioDone: false, updatedAt: 1, exercises: [],
});

describe("sync", () => {
  beforeEach(async () => {
    await db.sessions.clear();
    await db.mutations.clear();
  });

  it("flushMutations POSTs each pending mutation and clears the queue", async () => {
    await saveSession(session("s1"));
    const fetchFn = vi.fn().mockResolvedValue({ ok: true });
    const { flushed, ok } = await flushMutations(fetchFn as unknown as typeof fetch);
    expect(flushed).toBe(1);
    expect(ok).toBe(true);
    expect(fetchFn).toHaveBeenCalledWith(
      "/api/sessions",
      expect.objectContaining({ method: "POST" })
    );
    expect(await db.mutations.count()).toBe(0);
  });

  it("keeps the mutation queued and stops flushing when a POST fails", async () => {
    await saveSession(session("s1"));
    await saveSession(session("s2"));
    const fetchFn = vi.fn().mockResolvedValue({ ok: false });
    const { flushed, ok } = await flushMutations(fetchFn as unknown as typeof fetch);
    expect(ok).toBe(false);
    expect(flushed).toBe(0);
    // Stops at the first failure rather than hammering every queued mutation.
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(await db.mutations.count()).toBe(2);
  });

  it("re-saving the same record replaces its queued mutation instead of stacking", async () => {
    await saveSession(session("s1"));
    await saveSession(session("s1"));
    await saveSession(session("s1"));
    expect(await db.mutations.count()).toBe(1);
  });

  it("sync skips the remote pull when the push fails", async () => {
    await saveSession(session("s1"));
    const fetchFn = vi.fn().mockResolvedValue({ ok: false });
    await sync(fetchFn as unknown as typeof fetch);
    // Only the failed POST — no follow-up GETs to a backend we know is down.
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("pullRemote merges fetched sessions into local", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([session("r1")]),
    });
    await pullRemote(fetchFn as unknown as typeof fetch);
    expect(await db.sessions.count()).toBe(1);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});
