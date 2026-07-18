import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDailyChecklist } from "./useDailyChecklist";

beforeEach(() => localStorage.clear());

describe("useDailyChecklist", () => {
  it("persists checks under the day's date key", () => {
    const { result } = renderHook(() => useDailyChecklist("2026-07-17"));
    act(() => result.current.toggle("Lunch"));
    expect(result.current.checked.Lunch).toBe(true);
    expect(localStorage.getItem("wayne.diet.2026-07-17")).toContain("Lunch");
  });

  it("toggles back off", () => {
    const { result } = renderHook(() => useDailyChecklist("2026-07-17"));
    act(() => result.current.toggle("Lunch"));
    act(() => result.current.toggle("Lunch"));
    expect(result.current.checked.Lunch).toBe(false);
  });

  it("starts empty on a new day and prunes the previous day (daily reset)", () => {
    localStorage.setItem("wayne.diet.2026-07-16", JSON.stringify({ Lunch: true }));
    const { result } = renderHook(() => useDailyChecklist("2026-07-17"));
    expect(result.current.checked.Lunch).toBeUndefined();
    expect(localStorage.getItem("wayne.diet.2026-07-16")).toBeNull();
  });

  it("restores today's saved checks on load", () => {
    localStorage.setItem("wayne.diet.2026-07-17", JSON.stringify({ Dinner: true }));
    const { result } = renderHook(() => useDailyChecklist("2026-07-17"));
    expect(result.current.checked.Dinner).toBe(true);
  });
});
