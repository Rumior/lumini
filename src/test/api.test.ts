import { describe, it, expect } from "vitest";
describe("api client", () => {
  it("exports api", async () => {
    const m = await import("@/lib/api/client");
    expect(m.api).toBeDefined();
  });
});