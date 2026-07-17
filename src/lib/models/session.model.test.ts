import { describe, it, expect } from "vitest";
import { SessionModel } from "./session.model";

describe("SessionModel", () => {
  it("defines the expected top-level paths", () => {
    const paths = Object.keys(SessionModel.schema.paths);
    expect(paths).toContain("id");
    expect(paths).toContain("date");
    expect(paths).toContain("dayKey");
    expect(paths).toContain("updatedAt");
    expect(paths).toContain("exercises");
  });

  it("uses id as the document _id shadow (unique)", () => {
    expect(SessionModel.schema.path("id").options.unique).toBe(true);
  });
});
