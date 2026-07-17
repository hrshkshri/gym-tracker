import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExerciseCard } from "./ExerciseCard";
import type { SessionExercise } from "@/lib/types";

const exercise: SessionExercise = {
  name: "Barbell Bench Press",
  targetSets: 4,
  repRange: "6–8",
  skipped: false,
  sets: [{ weight: 60, reps: 8, done: false }],
};

describe("ExerciseCard", () => {
  it("shows the last-time summary when provided", () => {
    render(
      <ExerciseCard
        exercise={exercise}
        lastTimeSets={[{ weight: 62.5, reps: 8, done: true }]}
        onChange={() => {}}
      />
    );
    expect(screen.getByText(/Last time/)).toBeInTheDocument();
    expect(screen.getByText(/62.5/)).toBeInTheDocument();
  });

  it("adds a set when 'Add set' is tapped", () => {
    const onChange = vi.fn();
    render(<ExerciseCard exercise={exercise} lastTimeSets={null} onChange={onChange} />);
    fireEvent.click(screen.getByText(/Add set/));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ sets: expect.arrayContaining([expect.any(Object)]) })
    );
    const updated = onChange.mock.calls[0][0] as SessionExercise;
    expect(updated.sets).toHaveLength(2);
  });

  it("toggles skipped", () => {
    const onChange = vi.fn();
    render(<ExerciseCard exercise={exercise} lastTimeSets={null} onChange={onChange} />);
    fireEvent.click(screen.getByText(/Skip/));
    expect((onChange.mock.calls[0][0] as SessionExercise).skipped).toBe(true);
  });
});
