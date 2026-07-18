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
  it("shows last time's weight next to each set", () => {
    render(
      <ExerciseCard
        exercise={exercise}
        lastTimeSets={[{ weight: 62.5, reps: 8, done: true }]}
        onChange={() => {}}
      />
    );
    expect(screen.getByText(/62.5×8/)).toBeInTheDocument();
  });

  it("shows a completed count once every set is done", () => {
    render(
      <ExerciseCard
        exercise={{ ...exercise, sets: [{ weight: 65, reps: 8, done: true }] }}
        lastTimeSets={null}
        onChange={() => {}}
      />
    );
    expect(screen.getByText(/1\/1 ✓/)).toBeInTheDocument();
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

  it("removes a set when its delete button is tapped", () => {
    const onChange = vi.fn();
    const twoSets: SessionExercise = {
      ...exercise,
      sets: [
        { weight: 60, reps: 8, done: false },
        { weight: 62.5, reps: 6, done: false },
      ],
    };
    render(<ExerciseCard exercise={twoSets} lastTimeSets={null} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Remove set 2"));
    const updated = onChange.mock.calls[0][0] as SessionExercise;
    expect(updated.sets).toEqual([{ weight: 60, reps: 8, done: false }]);
  });

  it("toggles skipped", () => {
    const onChange = vi.fn();
    render(<ExerciseCard exercise={exercise} lastTimeSets={null} onChange={onChange} />);
    fireEvent.click(screen.getByText(/Skip/));
    expect((onChange.mock.calls[0][0] as SessionExercise).skipped).toBe(true);
  });
});
