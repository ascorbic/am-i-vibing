---
"am-i-vibing": minor
---

Split detection into agent and environment halves, exposing version, session, container, and run identifiers where available.

`DetectionResult` now returns `agent: AgentInfo | null` and `environment: EnvironmentInfo | null` as independent objects rather than a single flat shape. `isAgentic` is determined by `agent !== null`; the environment is detected separately and may be populated even when no AI agent is driving the process (for example, a CI runner with no agent).

New fields:

- `agent.version` — populated for Claude Code via `CLAUDE_CODE_VERSION`.
- `agent.sessionId` — populated for Claude Code (`CLAUDE_CODE_SESSION_ID` / `CLAUDE_CODE_REMOTE_SESSION_ID`), Codex (`CODEX_THREAD_ID`), and Cursor (`CURSOR_TRACE_ID`).
- `environment.containerId` — populated for Claude Code Cloud, GitHub Actions, Buildkite, and Replit.
- `environment.runId` — populated for GitHub Actions, GitLab CI, CircleCI, and Buildkite.

New environment matchers: Claude Code Cloud, GitHub Actions, GitLab CI, CircleCI, Buildkite, Replit, Jules, WebContainer, VS Code, Cursor (as IDE), Zed (as IDE).

New exports: `detectAgent`, `detectEnvironment`, `environments`, `getEnvironment`, `getEnvironmentsByKind`, plus the `AgentInfo`, `EnvironmentInfo`, `EnvironmentKind`, `EnvironmentConfig`, and `EnvVarExtractor` types.

**Breaking change**: top-level `id`, `name`, and `type` fields on the detection result are now nested under `agent`. Migrate from `result.id` / `result.name` / `result.type` to `result.agent?.id` / `result.agent?.name` / `result.agent?.type`. The `--format json` CLI output changes shape accordingly. The exit-code contract for the CLI is unchanged (0 if an agent is detected).
