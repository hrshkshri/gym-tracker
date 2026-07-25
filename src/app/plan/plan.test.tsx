import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PlanPage from "./page";

describe("PlanPage", () => {
  beforeAll(() => {
    // Pin "today" to Monday (Legs) so the switcher order is deterministic.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-27T09:00:00")); // a Monday
  });
  afterAll(() => vi.useRealTimers());

  it("opens on today's workout and shows its exercises", () => {
    render(<PlanPage />);
    expect(screen.getByText("Legs")).toBeInTheDocument();
    expect(screen.getByText(/Today/)).toBeInTheDocument();
    expect(screen.getByText(/Barbell Squat/)).toBeInTheDocument();
  });

  it("moves to the next day when the arrow is clicked", () => {
    render(<PlanPage />);
    fireEvent.click(screen.getByLabelText("Next day"));
    expect(screen.getByText("Pull A (Back + Biceps)")).toBeInTheDocument();
    expect(screen.getByText(/Barbell Row/)).toBeInTheDocument();
  });
});
