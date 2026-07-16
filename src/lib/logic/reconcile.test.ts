import { describe, it, expect } from "vitest";
import { reconcileById } from "./reconcile";

type Row = { id: string; updatedAt: number; v: string };

describe("reconcileById", () => {
  it("keeps the higher updatedAt for each id and unions ids", () => {
    const local: Row[] = [
      { id: "a", updatedAt: 5, v: "local-a" },
      { id: "b", updatedAt: 1, v: "local-b" },
    ];
    const remote: Row[] = [
      { id: "a", updatedAt: 3, v: "remote-a" },
      { id: "c", updatedAt: 9, v: "remote-c" },
    ];
    const out = reconcileById(local, remote).sort((x, y) => x.id.localeCompare(y.id));
    expect(out).toEqual([
      { id: "a", updatedAt: 5, v: "local-a" },
      { id: "b", updatedAt: 1, v: "local-b" },
      { id: "c", updatedAt: 9, v: "remote-c" },
    ]);
  });
});
