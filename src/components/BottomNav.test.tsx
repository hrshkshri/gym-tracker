import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BottomNav } from "./BottomNav";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

describe("BottomNav", () => {
  it("renders all destinations", () => {
    render(<BottomNav />);
    for (const label of ["Today", "Plan", "History", "Progress", "Diet"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("marks the active route with aria-current", () => {
    render(<BottomNav />);
    expect(screen.getByText("Today").closest("a"))
      .toHaveAttribute("aria-current", "page");
  });
});
