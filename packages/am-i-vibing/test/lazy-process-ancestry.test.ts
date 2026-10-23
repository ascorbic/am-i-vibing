import { afterEach, describe, expect, it, vi } from "vitest";
import { getProcessAncestry } from "tinyps";

vi.mock("tinyps", () => ({
  getProcessAncestry: vi.fn(() => Promise.resolve([])),
}));

afterEach(() => {
  vi.clearAllMocks();
});

// tinyps is loaded on demand via a dynamic import in the detector.
describe("tinyps loading", () => {
  it("does not load tinyps for environment-only detection", async () => {
    const { detectAgenticEnvironment } = await import("../src/detector.js");

    const result = await detectAgenticEnvironment({
      env: { CLAUDECODE: "true" },
    });

    expect(result.id).toBe("claude-code");
    expect(getProcessAncestry).not.toHaveBeenCalled();
  });

  it("loads tinyps when process checking is requested", async () => {
    vi.mocked(getProcessAncestry).mockResolvedValueOnce([
      { pid: 1, ppid: 0, name: "octofriend-cli", command: "octofriend-cli" },
    ]);
    const { detectAgenticEnvironment } = await import("../src/detector.js");

    const result = await detectAgenticEnvironment({
      env: {},
      checkProcesses: true,
    });

    expect(result.id).toBe("octofriend");
    expect(getProcessAncestry).toHaveBeenCalled();
  });

  it("uses pre-supplied ancestry without loading tinyps", async () => {
    const { detectAgenticEnvironment } = await import("../src/detector.js");

    const result = await detectAgenticEnvironment({
      env: {},
      processAncestry: [{ command: "octofriend-cli" }],
    });

    expect(result.id).toBe("octofriend");
    expect(getProcessAncestry).not.toHaveBeenCalled();
  });

  it("works without tinyps in the sync detector", async () => {
    const { detectAgenticEnvironmentSync } = await import(
      "../src/detector.js"
    );

    const result = detectAgenticEnvironmentSync({
      env: { CLAUDECODE: "true" },
    });

    expect(result.id).toBe("claude-code");
    expect(getProcessAncestry).not.toHaveBeenCalled();
  });
});
