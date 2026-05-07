import { describe, it, expect } from "vitest";
import {
  detectAgenticEnvironment,
  isAgent,
  isInteractive,
  isHybrid,
} from "../src/detector.js";

describe("detectAgenticEnvironment", () => {
  it("should return false for non-agentic environment", () => {
    const result = detectAgenticEnvironment({ env: {} });
    expect(result.isAgentic).toBe(false);
    expect(result.name).toBe(null);
  });

  it("should detect Jules environment", () => {
    const env = {
      HOME: "/home/jules",
      USER: "swebot",
    };
    const result = detectAgenticEnvironment({ env });
    expect(result.isAgentic).toBe(true);
    expect(result.name).toBe("Jules");
    expect(result.id).toBe("jules");
  });

  it("should detect Claude Code environment", () => {
    const result = detectAgenticEnvironment({ env: { CLAUDECODE: "true" } });

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("claude-code");
    expect(result.name).toBe("Claude Code");
    expect(result.type).toBe("agent");
  });

  it("should detect Cursor environment", () => {
    const result = detectAgenticEnvironment({
      env: { CURSOR_TRACE_ID: "cursor-trace-123" },
    });

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("cursor");
    expect(result.name).toBe("Cursor");
    expect(result.type).toBe("interactive");
  });

  it("should detect GitHub Copilot Agent environment", () => {
    const result = detectAgenticEnvironment({
      env: {
        TERM_PROGRAM: "vscode",
        GIT_PAGER: "cat",
      },
    });

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("vscode-copilot-agent");
    expect(result.name).toBe("GitHub Copilot in VS Code");
    expect(result.type).toBe("agent");
  });

  it("should detect Cursor Agent environment", () => {
    const result = detectAgenticEnvironment({
      env: {
        CURSOR_TRACE_ID: "cursor-trace-123",
        PAGER: "head -n 10000 | cat",
      },
    });

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("cursor-agent");
    expect(result.name).toBe("Cursor Agent");
    expect(result.type).toBe("agent");
  });

  it("should detect Replit AI environment", () => {
    const result = detectAgenticEnvironment({ env: { REPL_ID: "repl-123" } });

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("replit");
    expect(result.name).toBe("Replit");
    expect(result.type).toBe("agent");
  });

  it("should detect OpenCode environment", () => {
    const result = detectAgenticEnvironment({ env: { OPENCODE: "1" } });

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("opencode");
    expect(result.name).toBe("OpenCode");
    expect(result.type).toBe("agent");
  });

  it("should detect OpenCode environment via legacy env vars", () => {
    const result = detectAgenticEnvironment({
      env: { OPENCODE_BIN_PATH: "/usr/local/bin/opencode" },
    });

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("opencode");
    expect(result.name).toBe("OpenCode");
    expect(result.type).toBe("agent");
  });

  it("should detect Aider environment", () => {
    const result = detectAgenticEnvironment({
      env: { AIDER_API_KEY: "aider-key" },
    });

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("aider");
    expect(result.name).toBe("Aider");
    expect(result.type).toBe("agent");
  });

  it("should detect Bolt.new Agent environment", () => {
    const result = detectAgenticEnvironment({
      env: {
        SHELL: "/bin/jsh",
        npm_config_yes: "true",
      },
    });

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("bolt-agent");
    expect(result.name).toBe("Bolt.new Agent");
    expect(result.type).toBe("agent");
  });

  it("should detect Bolt.new interactive environment", () => {
    const result = detectAgenticEnvironment({ env: { SHELL: "/bin/jsh" } });

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("bolt");
    expect(result.name).toBe("Bolt.new");
    expect(result.type).toBe("interactive");
  });

  it("should detect Zed Agent environment", () => {
    const result = detectAgenticEnvironment({
      env: {
        TERM_PROGRAM: "zed",
        PAGER: "cat",
      },
    });

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("zed-agent");
    expect(result.name).toBe("Zed Agent");
    expect(result.type).toBe("agent");
  });

  it("should detect Zed interactive environment", () => {
    const result = detectAgenticEnvironment({ env: { TERM_PROGRAM: "zed" } });

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("zed");
    expect(result.name).toBe("Zed");
    expect(result.type).toBe("interactive");
  });

  it("should detect Warp hybrid environment", () => {
    const result = detectAgenticEnvironment({
      env: { TERM_PROGRAM: "WarpTerminal" },
    });

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("warp");
    expect(result.name).toBe("Warp Terminal");
    expect(result.type).toBe("hybrid");
  });

  it("should detect Gemini CLI via GEMINI_CLI env var", () => {
    const result = detectAgenticEnvironment({ env: { GEMINI_CLI: "1" } });

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("gemini-agent");
    expect(result.name).toBe("Gemini CLI");
    expect(result.type).toBe("agent");
  });

  it("should not detect Gemini CLI when GEMINI_CLI has the wrong value", () => {
    // Gemini specifically sets GEMINI_CLI=1; any other value shouldn't match.
    const result = detectAgenticEnvironment({
      env: { GEMINI_CLI: "something-else" },
    });
    expect(result.isAgentic).toBe(false);
  });

  it("should detect Codex via CODEX_THREAD_ID env var", () => {
    const result = detectAgenticEnvironment({
      env: { CODEX_THREAD_ID: "thread-abc" },
    });

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("codex");
    expect(result.name).toBe("OpenAI Codex");
    expect(result.type).toBe("agent");
  });

  it("should detect Crush via CRUSH=1 env var", () => {
    const result = detectAgenticEnvironment({ env: { CRUSH: "1" } });

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("crush");
    expect(result.name).toBe("Crush");
    expect(result.type).toBe("agent");
  });

  it("should detect Crush via AGENT=crush env var", () => {
    const result = detectAgenticEnvironment({ env: { AGENT: "crush" } });

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("crush");
  });

  it("should detect Amp via AMP_CURRENT_THREAD_ID env var", () => {
    const result = detectAgenticEnvironment({
      env: { AMP_CURRENT_THREAD_ID: "T-abc123" },
    });

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("amp");
    expect(result.name).toBe("Amp");
    expect(result.type).toBe("agent");
  });

  it("should detect Amp via AGENT=amp env var", () => {
    const result = detectAgenticEnvironment({ env: { AGENT: "amp" } });

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("amp");
  });

  it("should detect Auggie via AUGMENT_AGENT=1 env var", () => {
    const result = detectAgenticEnvironment({
      env: { AUGMENT_AGENT: "1" },
    });

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("auggie");
    expect(result.name).toBe("Auggie");
    expect(result.type).toBe("agent");
  });

  it("should not detect Auggie when AUGMENT_AGENT has the wrong value", () => {
    const result = detectAgenticEnvironment({
      env: { AUGMENT_AGENT: "0" },
    });

    expect(result.isAgentic).toBe(false);
  });

  it("should detect Qwen Code via QWEN_CODE=1 env var", () => {
    const result = detectAgenticEnvironment({
      env: { QWEN_CODE: "1" },
    });

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("qwen-code");
    expect(result.name).toBe("Qwen Code");
    expect(result.type).toBe("agent");
  });

  it("should handle false positive scenarios", () => {
    const result = detectAgenticEnvironment({
      env: { RANDOM_VARIABLE: "some-value" },
    });

    expect(result.isAgentic).toBe(false);
  });

  it("should distinguish between agent and interactive variants", () => {
    const agentResult = detectAgenticEnvironment({
      env: {
        CURSOR_TRACE_ID: "cursor-trace-123",
        PAGER: "head -n 10000 | cat",
      },
    });

    expect(agentResult.id).toBe("cursor-agent");
    expect(agentResult.name).toBe("Cursor Agent");
    expect(agentResult.type).toBe("agent");

    const interactiveResult = detectAgenticEnvironment({
      env: { CURSOR_TRACE_ID: "cursor-trace-123" },
    });

    expect(interactiveResult.id).toBe("cursor");
    expect(interactiveResult.name).toBe("Cursor");
    expect(interactiveResult.type).toBe("interactive");
  });

  it("should distinguish between Zed agent and interactive variants", () => {
    const agentResult = detectAgenticEnvironment({
      env: {
        TERM_PROGRAM: "zed",
        PAGER: "cat",
      },
    });

    expect(agentResult.id).toBe("zed-agent");
    expect(agentResult.name).toBe("Zed Agent");
    expect(agentResult.type).toBe("agent");

    const interactiveResult = detectAgenticEnvironment({
      env: { TERM_PROGRAM: "zed" },
    });

    expect(interactiveResult.id).toBe("zed");
    expect(interactiveResult.name).toBe("Zed");
    expect(interactiveResult.type).toBe("interactive");
  });
});

describe("process ancestry detection (opt-in)", () => {
  it("should NOT consult processChecks by default", () => {
    // Octofriend is detectable only via processChecks. With checkProcesses
    // disabled (the default), passing an ancestry that names octofriend should
    // not yield a match.
    const result = detectAgenticEnvironment({
      env: {},
      processAncestry: [{ command: "octofriend-cli" }],
      checkProcesses: false,
    });
    expect(result.isAgentic).toBe(false);
  });

  it("should detect Octofriend when checkProcesses is enabled", () => {
    const result = detectAgenticEnvironment({
      env: {},
      processAncestry: [{ command: "octofriend-cli" }],
      checkProcesses: true,
    });

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("octofriend");
    expect(result.name).toBe("Octofriend");
    expect(result.type).toBe("agent");
  });

  it("should detect Devin via process ancestry when checkProcesses is enabled", () => {
    const result = detectAgenticEnvironment({
      env: {},
      processAncestry: [{ command: "/Users/me/.local/bin/devin" }],
      checkProcesses: true,
    });

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("devin");
    expect(result.name).toBe("Devin");
    expect(result.type).toBe("agent");
  });

  it("should detect Factory Droid via process ancestry when checkProcesses is enabled", () => {
    const result = detectAgenticEnvironment({
      env: {},
      processAncestry: [{ command: "/usr/local/bin/droid" }],
      checkProcesses: true,
    });

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("droid");
    expect(result.name).toBe("Factory Droid");
    expect(result.type).toBe("agent");
  });

  it("should default checkProcesses to true when processAncestry is supplied without an explicit flag", () => {
    // Convenience: passing ancestry without saying checkProcesses=true is
    // treated as opt-in, so callers don't have to set both.
    const result = detectAgenticEnvironment({
      env: {},
      processAncestry: [{ command: "node /path/to/octofriend" }],
    });
    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("octofriend");
  });

  it("should still honor an explicit checkProcesses: false even when ancestry is supplied", () => {
    const result = detectAgenticEnvironment({
      env: {},
      processAncestry: [{ command: "octofriend" }],
      checkProcesses: false,
    });
    expect(result.isAgentic).toBe(false);
  });

  it("should prefer env var matches over process ancestry", () => {
    // Env var match should win even if ancestry would also match a different
    // provider.
    const result = detectAgenticEnvironment({
      env: { CLAUDECODE: "true" },
      processAncestry: [{ command: "gemini" }, { command: "octofriend" }],
      checkProcesses: true,
    });

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("claude-code");
  });

  it("should fall back to process ancestry when env vars don't match", () => {
    const result = detectAgenticEnvironment({
      env: {},
      processAncestry: [{ command: "/usr/local/bin/octofriend" }],
      checkProcesses: true,
    });

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("octofriend");
  });
});

describe("convenience functions", () => {
  it("isAgent should identify agent environments", () => {
    expect(isAgent({ env: { CLAUDECODE: "true" } })).toBe(true);
    expect(isAgent({ env: { CURSOR_TRACE_ID: "trace-123" } })).toBe(false);
    expect(
      isAgent({
        env: {
          CURSOR_TRACE_ID: "trace-123",
          PAGER: "head -n 10000 | cat",
        },
      }),
    ).toBe(true);
  });

  it("isInteractive should identify interactive environments", () => {
    expect(isInteractive({ env: { CURSOR_TRACE_ID: "trace-123" } })).toBe(true);
  });

  it("isHybrid should identify hybrid environments", () => {
    expect(isHybrid({ env: { TERM_PROGRAM: "WarpTerminal" } })).toBe(true);
    expect(isHybrid({ env: { CLAUDECODE: "true" } })).toBe(false);
    expect(isHybrid({ env: { CURSOR_TRACE_ID: "trace-123" } })).toBe(false);
  });
});

describe("legacy positional API (deprecated)", () => {
  // These call shapes are kept working for backwards compatibility with
  // callers from before the options-object signature landed.
  it("should accept (env) positional", () => {
    const result = detectAgenticEnvironment({ CLAUDECODE: "true" } as any);
    expect(result.id).toBe("claude-code");
  });

  it("should accept (env, processAncestry) positional and treat ancestry as opt-in", () => {
    const result = detectAgenticEnvironment(
      {} as any,
      [{ command: "octofriend" }],
    );
    expect(result.id).toBe("octofriend");
  });

  it("should not consult processAncestry under the legacy (env) one-arg form", () => {
    // No second arg means no opt-in; ancestry isn't consulted.
    const result = detectAgenticEnvironment({} as any);
    expect(result.isAgentic).toBe(false);
  });
});
