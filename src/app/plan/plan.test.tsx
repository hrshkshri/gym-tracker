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
    expect(screen.getByText("Pull (Back + Biceps)")).toBeInTheDocument();
    expect(screen.getByText(/Machine Row/)).toBeInTheDocument();
  });

  it("keeps the two rest days apart — Thu forward, Sun back", () => {
    render(<PlanPage />);
    const next = screen.getByLabelText("Next day");
    fireEvent.click(next); // Tue
    fireEvent.click(next); // Wed
    fireEvent.click(next); // Thu
    expect(screen.getByText("Thu")).toBeInTheDocument();
    expect(screen.getByText("Rest")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Previous day")); // back to Wed
    fireEvent.click(screen.getByLabelText("Previous day")); // Tue
    fireEvent.click(screen.getByLabelText("Previous day")); // Mon
    fireEvent.click(screen.getByLabelText("Previous day")); // wraps to Sun
    expect(screen.getByText("Sun")).toBeInTheDocument();
    expect(screen.getByText("Rest")).toBeInTheDocument();
  });
});
