import type { ProviderConfig } from "./types.js";

/**
 * Provider configurations for major AI coding tools
 */
export const providers: ProviderConfig[] = [
  {
    id: "opencode",
    name: "OpenCode",
    type: "agent",
    envVars: [
      {
        any: [
          "OPENCODE",
          "OPENCODE_BIN_PATH",
          "OPENCODE_SERVER",
          "OPENCODE_APP_INFO",
          "OPENCODE_MODES",
        ],
      },
    ],
  },
  {
    id: "jules",
    name: "Jules",
    type: "agent",
    envVars: [
      {
        all: [
          ["HOME", "/home/jules"],
          ["USER", "swebot"],
        ],
      },
    ],
  },
  {
    id: "claude-code",
    name: "Claude Code",
    type: "agent",
    envVars: ["CLAUDECODE"],
  },
  {
    id: "cursor-agent",
    name: "Cursor Agent",
    type: "agent",
    envVars: [
      {
        all: ["CURSOR_TRACE_ID", ["PAGER", "head -n 10000 | cat"]],
      },
    ],
  },
  {
    id: "cursor",
    name: "Cursor",
    type: "interactive",
    envVars: ["CURSOR_TRACE_ID"],
  },
  {
    id: "gemini-agent",
    name: "Gemini CLI",
    type: "agent",
    // Gemini CLI sets GEMINI_CLI=1 on every shell command and MCP server it spawns.
    // See: https://github.com/google-gemini/gemini-cli/blob/main/packages/core/src/services/shellExecutionService.ts
    envVars: [["GEMINI_CLI", "1"]],
    processChecks: ["gemini"],
  },
  {
    id: "codex",
    name: "OpenAI Codex",
    type: "agent",
    // Codex injects CODEX_THREAD_ID (the session conversation id) into every shell command it runs.
    // See: https://github.com/openai/codex/blob/main/codex-rs/protocol/src/shell_environment.rs
    envVars: ["CODEX_THREAD_ID"],
    processChecks: ["codex"],
  },
  {
    id: "replit",
    name: "Replit",
    type: "agent",
    envVars: ["REPL_ID"],
  },
  {
    id: "aider",
    name: "Aider",
    type: "agent",
    envVars: ["AIDER_API_KEY"],
    processChecks: ["aider"],
  },
  {
    id: "bolt-agent",
    name: "Bolt.new Agent",
    type: "agent",
    envVars: [
      {
        all: [["SHELL", "/bin/jsh"], "npm_config_yes"],
      },
    ],
  },
  {
    id: "bolt",
    name: "Bolt.new",
    type: "interactive",
    envVars: [
      {
        all: [["SHELL", "/bin/jsh"]],
        none: ["npm_config_yes"],
      },
    ],
  },
  {
    id: "zed-agent",
    name: "Zed Agent",
    type: "agent",
    envVars: [
      {
        all: [
          ["TERM_PROGRAM", "zed"],
          ["PAGER", "cat"],
        ],
      },
    ],
  },
  {
    id: "zed",
    name: "Zed",
    type: "interactive",
    envVars: [
      {
        all: [["TERM_PROGRAM", "zed"]],
        none: [["PAGER", "cat"]],
      },
    ],
  },
  {
    id: "replit-assistant",
    name: "Replit Assistant",
    type: "agent",
    envVars: [
      {
        all: ["REPL_ID", ["REPLIT_MODE", "assistant"]],
      },
    ],
  },
  {
    id: "replit",
    name: "Replit",
    type: "interactive",
    envVars: [
      {
        all: ["REPL_ID"],
        none: [["REPLIT_MODE", "assistant"]],
      },
    ],
  },
  {
    id: "windsurf",
    name: "Windsurf",
    type: "agent",
    envVars: ["CODEIUM_EDITOR_APP_ROOT"],
  },
  {
    id: "crush",
    name: "Crush",
    type: "agent",
    // Crush sets CRUSH=1 (and AGENT=crush, AI_AGENT=crush) on every shell exec.
    // See: https://github.com/charmbracelet/crush/blob/main/internal/shell/shell.go
    envVars: [
      {
        any: [
          ["CRUSH", "1"],
          ["AGENT", "crush"],
          ["AI_AGENT", "crush"],
        ],
      },
    ],
    processChecks: ["crush"],
  },
  {
    id: "vscode-copilot-agent",
    name: "GitHub Copilot in VS Code",
    type: "agent",
    envVars: [
      {
        all: [
          ["TERM_PROGRAM", "vscode"],
          ["GIT_PAGER", "cat"],
        ],
      },
    ],
  },
  {
    id: "warp",
    name: "Warp Terminal",
    type: "hybrid",
    envVars: [
      {
        all: [["TERM_PROGRAM", "WarpTerminal"]],
      },
    ],
  },
  {
    id: "octofriend",
    name: "Octofriend",
    type: "agent",
    // Octofriend does not currently expose an environment variable signal, so it
    // can only be detected via process ancestry (opt-in).
    processChecks: ["octofriend"],
  },
];

/**
 * Get provider configuration by name
 */
export function getProvider(name: string): ProviderConfig | undefined {
  return providers.find((p) => p.name === name);
}

/**
 * Get all providers of a specific type
 */
export function getProvidersByType(
  type: "agent" | "interactive" | "hybrid",
): ProviderConfig[] {
  return providers.filter((p) => p.type === type);
}
