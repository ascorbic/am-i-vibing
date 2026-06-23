import { describe, it, expect } from "vitest";
import {
  providers,
  getProvider,
  getProvidersByType,
} from "../src/providers.js";

describe("providers", () => {
  it("should export provider configurations", () => {
    expect(providers).toBeDefined();
    expect(Array.isArray(providers)).toBe(true);
    expect(providers.length).toBeGreaterThan(0);
  });

  it("should include Claude Code provider", () => {
    const claudeCode = providers.find((p) => p.name === "Claude Code");
    expect(claudeCode).toBeDefined();
    expect(claudeCode?.type).toBe("agent");
    expect(claudeCode?.envVars).toContain("CLAUDECODE");
  });

  it("should include Cursor provider", () => {
    const cursor = providers.find((p) => p.name === "Cursor");
    expect(cursor).toBeDefined();
    expect(cursor?.type).toBe("interactive");
  });

  it("should include Bolt.new providers", () => {
    const bolt = providers.find((p) => p.name === "Bolt.new");
    const boltAgent = providers.find((p) => p.name === "Bolt.new Agent");

    expect(bolt).toBeDefined();
    expect(bolt?.type).toBe("interactive");
    expect(boltAgent).toBeDefined();
    expect(boltAgent?.type).toBe("agent");
  });

  it("should include Warp agent provider", () => {
    const warp = providers.find((p) => p.name === "Warp");
    expect(warp).toBeDefined();
    expect(warp?.type).toBe("agent");
  });

  it("getProvider should return correct provider", () => {
    const claudeCode = getProvider("Claude Code");
    expect(claudeCode).toBeDefined();
    expect(claudeCode?.name).toBe("Claude Code");

    const nonExistent = getProvider("NonExistent");
    expect(nonExistent).toBeUndefined();
  });

  it("getProvidersByType should filter providers correctly", () => {
    const agentProviders = getProvidersByType("agent");
    const interactiveProviders = getProvidersByType("interactive");
    const hybridProviders = getProvidersByType("hybrid");

    expect(agentProviders.length).toBeGreaterThan(0);
    expect(interactiveProviders.length).toBeGreaterThan(0);
    expect(hybridProviders.length).toBe(0);

    expect(agentProviders.every((p) => p.type === "agent")).toBe(true);
    expect(interactiveProviders.every((p) => p.type === "interactive")).toBe(
      true,
    );
    expect(hybridProviders.every((p) => p.type === "hybrid")).toBe(true);
  });
});
