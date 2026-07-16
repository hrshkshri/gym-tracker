import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/mongoose", () => ({ connectMongo: vi.fn().mockResolvedValue({}) }));

const find = vi.fn();
const updateOne = vi.fn();
vi.mock("@/lib/models/session.model", () => ({
  SessionModel: {
    find: (...a: unknown[]) => find(...a),
    updateOne: (...a: unknown[]) => updateOne(...a),
  },
}));

import { GET, POST } from "./route";

describe("/api/sessions", () => {
  beforeEach(() => { find.mockReset(); updateOne.mockReset(); });

  it("GET returns all sessions as JSON", async () => {
    find.mockReturnValue({ lean: () => ({ exec: () => Promise.resolve([{ id: "s1" }]) }) });
    const res = await GET();
    expect(await res.json()).toEqual([{ id: "s1" }]);
  });

  it("POST upserts by id", async () => {
    updateOne.mockResolvedValue({});
    const req = new Request("http://x/api/sessions", {
      method: "POST",
      body: JSON.stringify({ id: "s1", updatedAt: 5 }),
    });
    const res = await POST(req);
    expect(await res.json()).toEqual({ ok: true });
    expect(updateOne).toHaveBeenCalledWith(
      { id: "s1" },
      expect.objectContaining({ id: "s1" }),
      { upsert: true }
    );
  });
});
