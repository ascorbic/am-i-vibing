# am-i-vibing

Detect agentic coding environments and AI assistant tools. This library lets CLI tools and Node apps detect when they're being executed by an AI agent — and now also which runtime environment they're running in (cloud sandbox, CI runner, IDE, WebContainer). Tools can adapt by emitting different output formats, choosing different log destinations, or attributing usage.

## Installation

Install as library:

```bash
npm install am-i-vibing
```

Run as CLI tool:

```bash
npx am-i-vibing
```

```ts
import { detectAgenticEnvironment } from "am-i-vibing";
const { agent, environment } = detectAgenticEnvironment();
if (agent) console.log(`Agent: ${agent.name} (${agent.type})`);
if (environment) console.log(`Environment: ${environment.name} (${environment.kind})`);
```

## Supported AI Tools

- **Aider**
- **Bolt**
- **Claude Code**
- **Codex CLI**
- **Crush**
- **Cursor**
- **Gemini CLI**
- **GitHub Copilot Agent**
- **Jules**
- **Octofriend** (process detection only — requires `checkProcesses`)
- **opencode**
- **Replit**
- **Warp**
- **Windsurf**
- **Zed**

## Supported Environments

The library also detects the runtime environment a process is executing in, independently of which agent (if any) is driving it:

- **Cloud sandboxes**: Claude Code Cloud, Replit, Jules
- **CI runners**: GitHub Actions, GitLab CI, CircleCI, Buildkite
- **IDEs**: Visual Studio Code, Cursor, Zed
- **WebContainer**: StackBlitz / Bolt.new

## Example use case

Generating LLM-specific error messages or logs:

```typescript
import { isAgent } from "am-i-vibing";
const agent = isAgent();

function handleError(error: Error) {
  if (agent) {
    console.info(`
# Error
<error_message>${error.message}</error_message>
<error_type>${error.name}</error_type>
<error_stack>${error.stack}</error_stack>
<note>Use the search_docs tool to find help for this error. If the tool is not available,
prompt the user to enable the MCP server followng the instructions at https://example.com/mcp</note>
		`);
  } else {
    console.error("An error occurred:", error.message);
  }
}
```

## Agent Types

The library classifies agents into three types:

- **Agent**: Command was directly run by an AI agent (e.g. Claude Code, Codex CLI, Jules)
- **Interactive**: Interactive commands run inside an AI environment (e.g. Cursor terminal, Replit shell)
- **Hybrid**: Environments that combine both agentic and interactive features in the same session (e.g. Warp)

There may be false positives, such as if a user directly runs a command in a terminal opened by an AI tool, such as a Copilot terminal in VS Code.

## Library Usage

We recommend **destructuring** the fields you use rather than passing the whole result object around. New top-level fields may be added in future versions; destructuring keeps your code forward-compatible with those additions.

```typescript
import {
  detectAgenticEnvironment,
  detectAgent,
  detectEnvironment,
  isAgent,
  isInteractive,
  isHybrid,
} from "am-i-vibing";

// Full detection (returns both agent and environment)
const { isAgentic, agent, environment } = detectAgenticEnvironment();

if (agent) {
  console.log(`Agent: ${agent.name} (${agent.type})`);
  if (agent.version) console.log(`Version: ${agent.version}`);
  if (agent.sessionId) console.log(`Session: ${agent.sessionId}`);
}

if (environment) {
  console.log(`Environment: ${environment.name} (${environment.kind})`);
  if (environment.containerId) console.log(`Container: ${environment.containerId}`);
  if (environment.runId) console.log(`Run: ${environment.runId}`);
}

// Detect just one half
const agentInfo = detectAgent();
const envInfo = detectEnvironment();

// Quick boolean checks
if (isAgent()) console.log("Running under direct AI agent control");
if (isInteractive()) console.log("Running in interactive AI environment");
if (isHybrid()) console.log("Running in hybrid AI environment");
```

### Process-tree detection (opt-in)

Most providers expose an environment variable that uniquely identifies them, and
that's the only signal `am-i-vibing` consults by default. A small number (e.g.
Octofriend) can only be detected by inspecting the parent process chain. Reading
the process tree spawns a subprocess and is meaningfully slow on Windows, so it
is **off by default**.

To opt in:

```typescript
import { detectAgenticEnvironment } from "am-i-vibing";

const result = detectAgenticEnvironment({ checkProcesses: true });
```

You can also pre-supply an ancestry (e.g. if you are already collecting one):

```typescript
import { detectAgenticEnvironment } from "am-i-vibing";
import { getProcessAncestry } from "process-ancestry";

const result = detectAgenticEnvironment({
  processAncestry: getProcessAncestry(),
});
```

Supplying `processAncestry` implies `checkProcesses: true` unless you set it to
`false` explicitly.

## Detection Result

The library returns a `DetectionResult` with two independent halves:

```typescript
interface DetectionResult {
  isAgentic: boolean;            // True iff agent !== null
  agent: AgentInfo | null;       // The AI agent driving the process
  environment: EnvironmentInfo | null; // The runtime sandbox / CI / IDE
}

interface AgentInfo {
  id: string;                    // e.g. "claude-code"
  name: string;                  // e.g. "Claude Code"
  type: "agent" | "interactive" | "hybrid";
  version?: string;              // Reported version, if available
  sessionId?: string;            // Conversation/thread id, if available
}

interface EnvironmentInfo {
  id: string;                    // e.g. "github-actions"
  name: string;                  // e.g. "GitHub Actions"
  kind: "cloud-sandbox" | "ci-runner" | "ide" | "webcontainer";
  containerId?: string;          // Stable per sandbox/runner
  runId?: string;                // Stable per execution
}
```

`agent` and `environment` are populated independently. A CI job running with no AI agent driving it returns `agent: null, environment: { kind: "ci-runner", ... }`. A Claude Code session on a developer's laptop returns the agent populated and `environment: null`. Claude Code running in GitHub Actions populates both.

`null` for `environment` means "no recognised environment fingerprint" rather than "this is a local laptop" — we know what it isn't, not what it is.

### What gets populated where

| Agent | `version` | `sessionId` |
|---|---|---|
| Claude Code | `CLAUDE_CODE_VERSION` | `CLAUDE_CODE_SESSION_ID` ‖ `CLAUDE_CODE_REMOTE_SESSION_ID` |
| Codex CLI | – | `CODEX_THREAD_ID` |
| Cursor / Cursor Agent | – | `CURSOR_TRACE_ID` |
| (others) | – | – |

| Environment | `containerId` | `runId` |
|---|---|---|
| Claude Code Cloud | `CLAUDE_CODE_CONTAINER_ID` | – |
| GitHub Actions | `RUNNER_NAME` | `GITHUB_RUN_ID` |
| GitLab CI | – | `CI_JOB_ID` |
| CircleCI | – | `CIRCLE_BUILD_NUM` |
| Buildkite | `BUILDKITE_AGENT_NAME` | `BUILDKITE_BUILD_ID` |
| Replit | `REPL_ID` | – |
| Jules | – | – |
| WebContainer | – | – |
| VS Code / Cursor / Zed | – | – |

## CLI Usage

Use the CLI to quickly check if you're running in an agentic environment:

```bash
# Basic detection
npx am-i-vibing
# ✓ Agent: [claude-code] Claude Code (agent) v2.1.42
#     sessionId: cse_01abc
#   Environment: [claude-code-cloud] Claude Code Cloud (cloud-sandbox)
#     containerId: container_xyz

# JSON output (full nested shape)
npx am-i-vibing --format json
# {
#   "isAgentic": true,
#   "agent": { "id": "claude-code", "name": "Claude Code", "type": "agent",
#              "version": "2.1.42", "sessionId": "cse_01abc" },
#   "environment": { "id": "claude-code-cloud", "name": "Claude Code Cloud",
#                    "kind": "cloud-sandbox", "containerId": "container_xyz" }
# }

# Check for specific environment type
npx am-i-vibing --check agent
# ✓ Running in agent environment: Claude Code

npx am-i-vibing --check interactive
# ✗ Not running in interactive environment

# Quiet mode (useful for scripts) — outputs the agent name or "none"
npx am-i-vibing --quiet
# Claude Code

# Debug mode (full diagnostic output)
npx am-i-vibing --debug
```

### CLI Options

- `-f, --format <json|text>` - Output format (default: text)
- `-c, --check <agent|interactive|hybrid>` - Check for specific agent type
- `-q, --quiet` - Only output result, no labels
- `-p, --check-processes` - Also walk the process tree for detection (slower, off by default)
- `-d, --debug` - Debug output with environment and process info (implies `--check-processes`)
- `-h, --help` - Show help message

### Exit Codes

- `0` - Agent detected (or specific check passed)
- `1` - No agent detected (or specific check failed)

The exit code is determined by agent detection only. A CI runner with no AI agent will exit `1` even though `environment` is populated.

## Debug Output

The `--debug` flag provides comprehensive diagnostic information including:

- **detection**: Standard detection result (same as `--format json`)
- **environment**: Complete dump of `process.env` variables
- **processAncestry**: Process tree showing parent processes up to the root

This is useful for troubleshooting detection issues and understanding the runtime environment.

```bash
npx am-i-vibing --debug
# {
#   "detection": { ... },
#   "environment": { ... },
#   "processAncestry": [...]
# }
```

## License

MIT

Copyright © 2025 Matt Kane
