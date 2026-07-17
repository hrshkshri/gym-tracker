import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HistoryList } from "./HistoryList";
import type { Session } from "@/lib/types";

const s = (id: string, date: string): Session => ({
  id, date, dayKey: "pushA", title: "Push A", cardioDone: false, updatedAt: 0,
  exercises: [{ name: "Bench", targetSets: 1, repRange: "6–8", skipped: false,
    sets: [{ weight: 60, reps: 8, done: true }] }],
});

describe("HistoryList", () => {
  it("renders sessions newest-first", () => {
    render(<HistoryList sessions={[s("a", "2026-07-01"), s("b", "2026-07-08")]} />);
    const items = screen.getAllByText(/Push A/);
    expect(items).toHaveLength(2);
    // newest date should appear before the older one in the DOM
    const dates = screen.getAllByText(/2026-07/).map((n) => n.textContent);
    expect(dates[0]).toContain("2026-07-08");
  });
});
