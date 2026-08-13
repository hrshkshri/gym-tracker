import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SessionCard } from "./SessionCard";
import { getTemplate } from "@/lib/data/templates";

describe("SessionCard", () => {
  it("shows the session title and exercise count", () => {
    render(<SessionCard template={getTemplate("push")} onOpen={() => {}} />);
    expect(screen.getByText(/Push/)).toBeInTheDocument();
    expect(screen.getByText(/6 exercises/)).toBeInTheDocument();
  });

  it("calls onOpen when tapped", () => {
    const onOpen = vi.fn();
    render(<SessionCard template={getTemplate("legs")} onOpen={onOpen} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onOpen).toHaveBeenCalled();
  });
});
