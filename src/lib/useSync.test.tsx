import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

const sync = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/db/sync", () => ({ sync: () => sync() }));

import { SyncTrigger } from "@/components/SyncTrigger";

describe("SyncTrigger", () => {
  beforeEach(() => sync.mockClear());

  it("syncs on mount", () => {
    render(<SyncTrigger />);
    expect(sync).toHaveBeenCalledTimes(1);
  });

  it("syncs again when the browser comes online", () => {
    render(<SyncTrigger />);
    window.dispatchEvent(new Event("online"));
    expect(sync).toHaveBeenCalledTimes(2);
  });
});
