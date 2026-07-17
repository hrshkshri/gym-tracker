import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DietTables } from "./DietTables";

describe("DietTables", () => {
  it("renders both day types and at least one rule", () => {
    render(<DietTables />);
    expect(screen.getByText(/Training \/ Run Days/)).toBeInTheDocument();
    expect(screen.getByText(/Rest Days/)).toBeInTheDocument();
    expect(screen.getByText(/Lift heavy/)).toBeInTheDocument();
  });
});
