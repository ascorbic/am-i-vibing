import { describe, it, expect } from "vitest";
import {
  detectAgent,
  detectAgenticEnvironment,
  detectEnvironment,
  isAgent,
  isHybrid,
  isInteractive,
  isProvider,
} from "../src/detector.js";

describe("detectAgenticEnvironment", () => {
  it("returns a fully null result for a non-agentic environment", () => {
    const result = detectAgenticEnvironment({ env: {} });
    expect(result.isAgentic).toBe(false);
    expect(result.agent).toBe(null);
    expect(result.environment).toBe(null);
  });

  it("detects Jules", () => {
    const result = detectAgenticEnvironment({
      env: { HOME: "/home/jules", USER: "swebot" },
    });
    expect(result.isAgentic).toBe(true);
    expect(result.agent?.id).toBe("jules");
    expect(result.agent?.name).toBe("Jules");
    expect(result.environment?.id).toBe("jules-cloud");
  });

  it("detects Claude Code", () => {
    const result = detectAgenticEnvironment({ env: { CLAUDECODE: "true" } });
    expect(result.isAgentic).toBe(true);
    expect(result.agent?.id).toBe("claude-code");
    expect(result.agent?.name).toBe("Claude Code");
    expect(result.agent?.type).toBe("agent");
  });

  it("detects Cursor as interactive", () => {
    const result = detectAgenticEnvironment({
      env: { CURSOR_TRACE_ID: "cursor-trace-123" },
    });
    expect(result.agent?.id).toBe("cursor");
    expect(result.agent?.name).toBe("Cursor");
    expect(result.agent?.type).toBe("interactive");
  });

  it("detects GitHub Copilot in VS Code", () => {
    const result = detectAgenticEnvironment({
      env: { TERM_PROGRAM: "vscode", GIT_PAGER: "cat" },
    });
    expect(result.agent?.id).toBe("vscode-copilot-agent");
    expect(result.agent?.name).toBe("GitHub Copilot in VS Code");
    expect(result.agent?.type).toBe("agent");
  });

  it("detects Cursor Agent (more specific) before Cursor", () => {
    const result = detectAgenticEnvironment({
      env: {
        CURSOR_TRACE_ID: "cursor-trace-123",
        PAGER: "head -n 10000 | cat",
      },
    });
    expect(result.agent?.id).toBe("cursor-agent");
    expect(result.agent?.type).toBe("agent");
  });

  it("detects Replit", () => {
    const result = detectAgenticEnvironment({
      env: { REPL_ID: "repl-123" },
    });
    expect(result.agent?.id).toBe("replit");
    expect(result.agent?.name).toBe("Replit");
    expect(result.environment?.id).toBe("replit-cloud");
  });

  it("detects OpenCode", () => {
    const result = detectAgenticEnvironment({ env: { OPENCODE: "1" } });
    expect(result.agent?.id).toBe("opencode");
    expect(result.agent?.type).toBe("agent");
  });

  it("detects OpenCode via legacy env vars", () => {
    const result = detectAgenticEnvironment({
      env: { OPENCODE_BIN_PATH: "/usr/local/bin/opencode" },
    });
    expect(result.agent?.id).toBe("opencode");
  });

  it("detects Aider", () => {
    const result = detectAgenticEnvironment({
      env: { AIDER_API_KEY: "aider-key" },
    });
    expect(result.agent?.id).toBe("aider");
  });

  it("detects Bolt.new Agent", () => {
    const result = detectAgenticEnvironment({
      env: { SHELL: "/bin/jsh", npm_config_yes: "true" },
    });
    expect(result.agent?.id).toBe("bolt-agent");
    expect(result.environment?.id).toBe("webcontainer");
  });

  it("detects Bolt.new interactive", () => {
    const result = detectAgenticEnvironment({ env: { SHELL: "/bin/jsh" } });
    expect(result.agent?.id).toBe("bolt");
    expect(result.environment?.id).toBe("webcontainer");
  });

  it("detects Zed Agent", () => {
    const result = detectAgenticEnvironment({
      env: { TERM_PROGRAM: "zed", PAGER: "cat" },
    });
    expect(result.agent?.id).toBe("zed-agent");
    expect(result.environment?.id).toBe("zed");
  });

  it("detects Zed interactive", () => {
    const result = detectAgenticEnvironment({ env: { TERM_PROGRAM: "zed" } });
    expect(result.agent?.id).toBe("zed");
  });

  it("detects Warp as hybrid", () => {
    const result = detectAgenticEnvironment({
      env: { TERM_PROGRAM: "WarpTerminal" },
    });
    expect(result.agent?.id).toBe("warp");
    expect(result.agent?.type).toBe("hybrid");
  });

  it("detects Gemini CLI via GEMINI_CLI env var", () => {
    const result = detectAgenticEnvironment({ env: { GEMINI_CLI: "1" } });
    expect(result.agent?.id).toBe("gemini-agent");
    expect(result.agent?.name).toBe("Gemini CLI");
    expect(result.agent?.type).toBe("agent");
  });

  it("does not detect Gemini CLI when GEMINI_CLI has the wrong value", () => {
    const result = detectAgenticEnvironment({
      env: { GEMINI_CLI: "something-else" },
    });
    expect(result.isAgentic).toBe(false);
  });

  it("detects Codex via CODEX_THREAD_ID env var", () => {
    const result = detectAgenticEnvironment({
      env: { CODEX_THREAD_ID: "thread-abc" },
    });
    expect(result.agent?.id).toBe("codex");
    expect(result.agent?.name).toBe("OpenAI Codex");
    expect(result.agent?.type).toBe("agent");
  });

  it("detects Crush via CRUSH=1 env var", () => {
    const result = detectAgenticEnvironment({ env: { CRUSH: "1" } });
    expect(result.agent?.id).toBe("crush");
    expect(result.agent?.name).toBe("Crush");
    expect(result.agent?.type).toBe("agent");
  });

  it("detects Crush via AGENT=crush env var", () => {
    const result = detectAgenticEnvironment({ env: { AGENT: "crush" } });
    expect(result.agent?.id).toBe("crush");
  });

  it("detects Amp via AMP_CURRENT_THREAD_ID env var", () => {
    const result = detectAgenticEnvironment({
      env: { AMP_CURRENT_THREAD_ID: "T-abc123" },
    });
    expect(result.agent?.id).toBe("amp");
    expect(result.agent?.name).toBe("Amp");
    expect(result.agent?.type).toBe("agent");
  });

  it("detects Amp via AGENT=amp env var", () => {
    const result = detectAgenticEnvironment({ env: { AGENT: "amp" } });
    expect(result.agent?.id).toBe("amp");
  });

  it("detects Auggie via AUGMENT_AGENT=1 env var", () => {
    const result = detectAgenticEnvironment({
      env: { AUGMENT_AGENT: "1" },
    });
    expect(result.agent?.id).toBe("auggie");
    expect(result.agent?.name).toBe("Auggie");
    expect(result.agent?.type).toBe("agent");
  });

  it("does not detect Auggie when AUGMENT_AGENT has the wrong value", () => {
    const result = detectAgenticEnvironment({
      env: { AUGMENT_AGENT: "0" },
    });
    expect(result.isAgentic).toBe(false);
  });

  it("detects Qwen Code via QWEN_CODE=1 env var", () => {
    const result = detectAgenticEnvironment({ env: { QWEN_CODE: "1" } });
    expect(result.agent?.id).toBe("qwen-code");
    expect(result.agent?.name).toBe("Qwen Code");
    expect(result.agent?.type).toBe("agent");
  });

  it("returns a non-agentic result when no signals match", () => {
    const result = detectAgenticEnvironment({
      env: { RANDOM_VARIABLE: "some-value" },
    });
    expect(result.isAgentic).toBe(false);
  });
});

describe("detectAgent", () => {
  it("returns null when nothing matches", () => {
    expect(detectAgent({ env: {} })).toBe(null);
  });

  it("populates version when versionEnvVar is set on the provider", () => {
    const agent = detectAgent({
      env: { CLAUDECODE: "1", CLAUDE_CODE_VERSION: "2.1.42" },
    });
    expect(agent?.id).toBe("claude-code");
    expect(agent?.version).toBe("2.1.42");
  });

  it("populates sessionId from the first non-empty extractor entry", () => {
    const agent = detectAgent({
      env: {
        CLAUDECODE: "1",
        CLAUDE_CODE_REMOTE_SESSION_ID: "remote-session",
      },
    });
    expect(agent?.sessionId).toBe("remote-session");
  });

  it("prefers earlier extractor entries when multiple are set", () => {
    const agent = detectAgent({
      env: {
        CLAUDECODE: "1",
        CLAUDE_CODE_SESSION_ID: "primary",
        CLAUDE_CODE_REMOTE_SESSION_ID: "fallback",
      },
    });
    expect(agent?.sessionId).toBe("primary");
  });

  it("populates Cursor sessionId from CURSOR_TRACE_ID", () => {
    const agent = detectAgent({ env: { CURSOR_TRACE_ID: "trace-xyz" } });
    expect(agent?.sessionId).toBe("trace-xyz");
  });

  it("populates Codex sessionId from CODEX_THREAD_ID", () => {
    const agent = detectAgent({ env: { CODEX_THREAD_ID: "thread-xyz" } });
    expect(agent?.id).toBe("codex");
    expect(agent?.sessionId).toBe("thread-xyz");
  });

  it("omits version and sessionId when no env vars are present", () => {
    const agent = detectAgent({ env: { CLAUDECODE: "1" } });
    expect(agent?.version).toBeUndefined();
    expect(agent?.sessionId).toBeUndefined();
  });
});

describe("detectEnvironment", () => {
  it("returns null when no environment signal is present", () => {
    expect(detectEnvironment({ env: {} })).toBe(null);
  });

  it("detects Claude Code Cloud via CLAUDE_CODE_REMOTE", () => {
    const env = detectEnvironment({
      env: {
        CLAUDE_CODE_REMOTE: "true",
        CLAUDE_CODE_CONTAINER_ID: "container_xyz",
      },
    });
    expect(env?.id).toBe("claude-code-cloud");
    expect(env?.kind).toBe("cloud-sandbox");
    expect(env?.containerId).toBe("container_xyz");
  });

  it("detects Claude Code Cloud via container id alone", () => {
    const env = detectEnvironment({
      env: { CLAUDE_CODE_CONTAINER_ID: "container_xyz" },
    });
    expect(env?.id).toBe("claude-code-cloud");
  });

  it("detects GitHub Actions and extracts containerId + runId", () => {
    const env = detectEnvironment({
      env: {
        GITHUB_ACTIONS: "true",
        GITHUB_RUN_ID: "42",
        RUNNER_NAME: "ubuntu-latest-1",
      },
    });
    expect(env?.id).toBe("github-actions");
    expect(env?.kind).toBe("ci-runner");
    expect(env?.containerId).toBe("ubuntu-latest-1");
    expect(env?.runId).toBe("42");
  });

  it("detects GitLab CI and extracts runId", () => {
    const env = detectEnvironment({
      env: { GITLAB_CI: "true", CI_JOB_ID: "9001" },
    });
    expect(env?.id).toBe("gitlab-ci");
    expect(env?.runId).toBe("9001");
  });

  it("detects CircleCI", () => {
    const env = detectEnvironment({
      env: { CIRCLECI: "true", CIRCLE_BUILD_NUM: "777" },
    });
    expect(env?.id).toBe("circleci");
    expect(env?.runId).toBe("777");
  });

  it("detects Buildkite", () => {
    const env = detectEnvironment({
      env: {
        BUILDKITE: "true",
        BUILDKITE_AGENT_NAME: "agent-1",
        BUILDKITE_BUILD_ID: "build-1",
      },
    });
    expect(env?.id).toBe("buildkite");
    expect(env?.containerId).toBe("agent-1");
    expect(env?.runId).toBe("build-1");
  });

  it("detects Replit cloud and uses REPL_ID as containerId", () => {
    const env = detectEnvironment({ env: { REPL_ID: "repl-abc" } });
    expect(env?.id).toBe("replit-cloud");
    expect(env?.containerId).toBe("repl-abc");
  });

  it("detects WebContainer via SHELL=/bin/jsh", () => {
    const env = detectEnvironment({ env: { SHELL: "/bin/jsh" } });
    expect(env?.id).toBe("webcontainer");
    expect(env?.kind).toBe("webcontainer");
  });

  it("detects VS Code as IDE", () => {
    const env = detectEnvironment({ env: { TERM_PROGRAM: "vscode" } });
    expect(env?.id).toBe("vscode");
    expect(env?.kind).toBe("ide");
  });

  it("detects Cursor as IDE", () => {
    const env = detectEnvironment({ env: { CURSOR_TRACE_ID: "trace-xyz" } });
    expect(env?.id).toBe("cursor");
    expect(env?.kind).toBe("ide");
  });

  it("detects Zed as IDE", () => {
    const env = detectEnvironment({ env: { TERM_PROGRAM: "zed" } });
    expect(env?.id).toBe("zed");
  });

  it("detects Jules sandbox", () => {
    const env = detectEnvironment({
      env: { HOME: "/home/jules", USER: "swebot" },
    });
    expect(env?.id).toBe("jules-cloud");
    expect(env?.kind).toBe("cloud-sandbox");
  });
});

describe("composed agent + environment results", () => {
  it("populates only agent when no environment signal is present", () => {
    const result = detectAgenticEnvironment({ env: { CLAUDECODE: "1" } });
    expect(result.agent?.id).toBe("claude-code");
    expect(result.environment).toBe(null);
  });

  it("populates only environment when no agent matches", () => {
    const result = detectAgenticEnvironment({
      env: { GITHUB_ACTIONS: "true", GITHUB_RUN_ID: "42" },
    });
    expect(result.isAgentic).toBe(false);
    expect(result.agent).toBe(null);
    expect(result.environment?.id).toBe("github-actions");
    expect(result.environment?.runId).toBe("42");
  });

  it("populates both halves for Claude Code in the cloud sandbox", () => {
    const result = detectAgenticEnvironment({
      env: {
        CLAUDECODE: "1",
        CLAUDE_CODE_VERSION: "2.1.42",
        CLAUDE_CODE_SESSION_ID: "cse_01abc",
        CLAUDE_CODE_REMOTE: "true",
        CLAUDE_CODE_CONTAINER_ID: "container_xyz",
      },
    });
    expect(result.agent?.id).toBe("claude-code");
    expect(result.agent?.version).toBe("2.1.42");
    expect(result.agent?.sessionId).toBe("cse_01abc");
    expect(result.environment?.id).toBe("claude-code-cloud");
    expect(result.environment?.containerId).toBe("container_xyz");
  });

  it("populates both halves for Claude Code on a GitHub Actions runner", () => {
    const result = detectAgenticEnvironment({
      env: {
        CLAUDECODE: "1",
        CLAUDE_CODE_VERSION: "2.1.42",
        GITHUB_ACTIONS: "true",
        GITHUB_RUN_ID: "9999",
        RUNNER_NAME: "ubuntu-latest-1",
      },
    });
    expect(result.agent?.id).toBe("claude-code");
    expect(result.environment?.id).toBe("github-actions");
    expect(result.environment?.containerId).toBe("ubuntu-latest-1");
    expect(result.environment?.runId).toBe("9999");
  });

  it("isAgentic is determined by agent presence, not environment", () => {
    const ciOnly = detectAgenticEnvironment({
      env: { GITHUB_ACTIONS: "true" },
    });
    expect(ciOnly.isAgentic).toBe(false);

    const agentOnly = detectAgenticEnvironment({ env: { CLAUDECODE: "1" } });
    expect(agentOnly.isAgentic).toBe(true);
  });
});

describe("process ancestry detection (opt-in)", () => {
  it("does NOT consult processChecks by default", () => {
    // Octofriend is detectable only via processChecks. With checkProcesses
    // disabled (the default), passing an ancestry that names octofriend
    // should not yield a match.
    const result = detectAgenticEnvironment({
      env: {},
      processAncestry: [{ command: "octofriend-cli" }],
      checkProcesses: false,
    });
    expect(result.isAgentic).toBe(false);
  });

  it("detects Octofriend when checkProcesses is enabled", () => {
    const result = detectAgenticEnvironment({
      env: {},
      processAncestry: [{ command: "octofriend-cli" }],
      checkProcesses: true,
    });
    expect(result.agent?.id).toBe("octofriend");
    expect(result.agent?.name).toBe("Octofriend");
    expect(result.agent?.type).toBe("agent");
  });

  it("detects Devin via process ancestry when checkProcesses is enabled", () => {
    const result = detectAgenticEnvironment({
      env: {},
      processAncestry: [{ command: "/Users/me/.local/bin/devin" }],
      checkProcesses: true,
    });
    expect(result.agent?.id).toBe("devin");
    expect(result.agent?.name).toBe("Devin");
  });

  it("detects Factory Droid via process ancestry when checkProcesses is enabled", () => {
    const result = detectAgenticEnvironment({
      env: {},
      processAncestry: [{ command: "/usr/local/bin/droid" }],
      checkProcesses: true,
    });
    expect(result.agent?.id).toBe("droid");
    expect(result.agent?.name).toBe("Factory Droid");
  });

  it("defaults checkProcesses to true when processAncestry is supplied without an explicit flag", () => {
    // Convenience: passing ancestry without saying checkProcesses=true is
    // treated as opt-in, so callers don't have to set both.
    const result = detectAgenticEnvironment({
      env: {},
      processAncestry: [{ command: "node /path/to/octofriend" }],
    });
    expect(result.agent?.id).toBe("octofriend");
  });

  it("honours an explicit checkProcesses: false even when ancestry is supplied", () => {
    const result = detectAgenticEnvironment({
      env: {},
      processAncestry: [{ command: "octofriend" }],
      checkProcesses: false,
    });
    expect(result.isAgentic).toBe(false);
  });

  it("env-var match wins over a colliding process check", () => {
    const result = detectAgenticEnvironment({
      env: { CLAUDECODE: "true" },
      processAncestry: [{ command: "gemini" }, { command: "octofriend" }],
      checkProcesses: true,
    });
    expect(result.agent?.id).toBe("claude-code");
  });

  it("falls back to process ancestry when env vars do not match", () => {
    const result = detectAgenticEnvironment({
      env: {},
      processAncestry: [{ command: "/usr/local/bin/octofriend" }],
      checkProcesses: true,
    });
    expect(result.agent?.id).toBe("octofriend");
  });
});

describe("convenience functions", () => {
  it("isAgent identifies agent environments", () => {
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

  it("isInteractive identifies interactive environments", () => {
    expect(isInteractive({ env: { CURSOR_TRACE_ID: "trace-123" } })).toBe(true);
  });

  it("isHybrid identifies hybrid environments", () => {
    expect(isHybrid({ env: { TERM_PROGRAM: "WarpTerminal" } })).toBe(true);
    expect(isHybrid({ env: { CLAUDECODE: "true" } })).toBe(false);
    expect(isHybrid({ env: { CURSOR_TRACE_ID: "trace-123" } })).toBe(false);
  });

  it("isProvider matches by name", () => {
    expect(isProvider("Claude Code", { env: { CLAUDECODE: "1" } })).toBe(true);
    expect(isProvider("Cursor", { env: { CLAUDECODE: "1" } })).toBe(false);
  });
});

describe("legacy positional API (deprecated)", () => {
  // These call shapes are kept working for backwards compatibility with
  // callers from before the options-object signature landed.
  it("accepts (env) positional", () => {
    const result = detectAgenticEnvironment({ CLAUDECODE: "true" } as any);
    expect(result.agent?.id).toBe("claude-code");
  });

  it("accepts (env, processAncestry) positional and treats ancestry as opt-in", () => {
    const result = detectAgenticEnvironment(
      {} as any,
      [{ command: "octofriend" }],
    );
    expect(result.agent?.id).toBe("octofriend");
  });

  it("does not consult processAncestry under the legacy (env) one-arg form", () => {
    // No second arg means no opt-in; ancestry isn't consulted.
    const result = detectAgenticEnvironment({} as any);
    expect(result.isAgentic).toBe(false);
  });
});
