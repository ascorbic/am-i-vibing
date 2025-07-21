# am-i-vibing

Detect agentic coding environments and AI assistant tools. This library allows CLI tools and Node apps to detect when they're being executed by AI agents. This enables them to adapt by, for example, providing different output formats or logs.

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
const result = detectAgenticEnvironment();
console.log(`Detected: ${result.name} (${result.type})`);
```

## Supported AI Tools

- **Aider**
- **Bolt**
- **Claude Code**
- **Cursor**
- **Gemini CLI**
- **GitHub Copilot Agent**
- **Jules**
- **Codex CLI**
- **Replit**
- **Warp**
- **Windsurf**
- **Zed**
- **opencode**

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

## Environment Types

The library detects three main types of environments:

- **Agent**: Command was directly run by an AI agent (e.g. Claude Code, Codex CLI, Jules)
- **Interactive**: Interactive commands run inside an AI environment (e.g. Cursor terminal, Replit shell)
- **Hybrid**: Environments that combine both agentic and interactive features in the same session (e.g. Warp)

There may be false positives, such as if a user directly runs a command in an terminal opened by an AI tool, such as a Copilot terminal in VS Code.

## Library Usage

```typescript
import {
  detectAgenticEnvironment,
  isAgent,
  isInteractive,
  isHybrid,
} from "am-i-vibing";

// Full detection
const result = detectAgenticEnvironment();
console.log(`Detected: ${result.name} (${result.type})`);
console.log(`ID: ${result.id}`);
console.log(`Is agentic: ${result.isAgentic}`);

// Quick checks
if (isAgent()) {
  console.log("Running under direct AI agent control");
}

if (isInteractive()) {
  console.log("Running in interactive AI environment");
}

if (isHybrid()) {
  console.log("Running in hybrid AI environment");
}

// Note: Hybrid environments return true for both isAgent() and isInteractive()
```

## Detection Result

The library returns a `DetectionResult` object with the following structure:

```typescript
interface DetectionResult {
  isAgentic: boolean; // Whether any agentic environment was detected
  id: string | null; // Provider ID (e.g., "claude-code")
  name: string | null; // Human-readable name (e.g., "Claude Code")
  type: AgenticType | null; // "agent" | "interactive" | "hybrid"
}
```

## CLI Usage

Use the CLI to quickly check if you're running in an agentic environment:

```bash
# Basic detection
npx am-i-vibing
# ✓ Detected: Claude Code (agent)

# JSON output
npx am-i-vibing --format json
# {"isAgentic": true, "id": "claude-code", "name": "Claude Code", "type": "agent"}

# Check for specific environment type
npx am-i-vibing --check agent
# ✓ Running in agent environment: Claude Code

npx am-i-vibing --check interactive
# ✗ Not running in interactive environment

# Quiet mode (useful for scripts)
npx am-i-vibing --quiet
# Claude Code

# Debug mode (full diagnostic output)
npx am-i-vibing --debug
# {"detection": {"isAgentic": true, "id": "claude-code", "name": "Claude Code", "type": "agent"}, "environment": {...}, "processAncestry": [...]}
```

### CLI Options

- `-f, --format <json|text>` - Output format (default: text)
- `-c, --check <agent|interactive|hybrid>` - Check for specific environment type
- `-q, --quiet` - Only output result, no labels
- `-d, --debug` - Debug output with environment and process info
- `-h, --help` - Show help message

### Exit Codes

- `0` - Agentic environment detected (or specific check passed)
- `1` - No agentic environment detected (or specific check failed)

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
