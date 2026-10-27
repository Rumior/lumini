import { describe, it, expect } from "vitest";
describe("integration", () => {
  it("has api client", async () => {
    const mod = await import("@/lib/api/client");
    expect(typeof mod.api.get).toBe("function");
  });
  it("has auth context", async () => {
    const mod = await import("@/context/AuthContext");
    expect(typeof mod.useAuth).toBe("function");
  });
});