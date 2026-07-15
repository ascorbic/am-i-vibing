import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("process-ancestry", () => {
  throw new Error("process-ancestry was loaded statically");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("process-ancestry loading", () => {
  it("does not load process-ancestry for environment-only detection", async () => {
    const getBuiltinModule = vi.spyOn(process, "getBuiltinModule");
    const { detectAgenticEnvironment } = await import("../src/detector.js");

    const result = detectAgenticEnvironment({ env: { CLAUDECODE: "true" } });

    expect(result.id).toBe("claude-code");
    expect(getBuiltinModule).not.toHaveBeenCalled();
  });

  it("loads process-ancestry when process checking is requested", async () => {
    const require = vi.fn(() => ({
      getProcessAncestry: () => [{ command: "octofriend-cli" }],
    }));
    const getBuiltinModule = vi
      .spyOn(process, "getBuiltinModule")
      .mockReturnValue({ createRequire: () => require } as never);
    const { detectAgenticEnvironment } = await import("../src/detector.js");

    const result = detectAgenticEnvironment({ env: {}, checkProcesses: true });

    expect(result.id).toBe("octofriend");
    expect(getBuiltinModule).toHaveBeenCalledWith("module");
    expect(require).toHaveBeenCalledWith("process-ancestry");
  });
});
