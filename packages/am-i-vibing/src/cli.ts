#!/usr/bin/env node

import { parseArgs } from "node:util";
import { getProcessAncestry } from "process-ancestry";
import {
  detectAgenticEnvironment,
  isAgent,
  isInteractive,
  isHybrid,
} from "./detector.js";

interface CliOptions {
  format?: "json" | "text";
  check?: "agent" | "interactive" | "hybrid";
  quiet?: boolean;
  help?: boolean;
  debug?: boolean;
  checkProcesses?: boolean;
}

function parseCliArgs(): CliOptions {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      format: {
        type: "string",
        short: "f",
        default: "text",
      },
      check: {
        type: "string",
        short: "c",
      },
      quiet: {
        type: "boolean",
        short: "q",
        default: false,
      },
      help: {
        type: "boolean",
        short: "h",
        default: false,
      },
      debug: {
        type: "boolean",
        short: "d",
        default: false,
      },
      "check-processes": {
        type: "boolean",
        short: "p",
        default: false,
      },
    },
    allowPositionals: false,
  });

  // Validate format option
  if (values.format && !["json", "text"].includes(values.format)) {
    console.error(
      `Error: Invalid format '${values.format}'. Must be 'json' or 'text'.`,
    );
    process.exit(1);
  }

  // Validate check option
  if (
    values.check &&
    !["agent", "interactive", "hybrid"].includes(values.check)
  ) {
    console.error(
      `Error: Invalid check type '${values.check}'. Must be 'agent', 'interactive', or 'hybrid'.`,
    );
    process.exit(1);
  }

  return {
    format: values.format as "json" | "text",
    check: values.check as "agent" | "interactive" | "hybrid",
    quiet: values.quiet,
    help: values.help,
    debug: values.debug,
    checkProcesses: values["check-processes"],
  };
}

function showHelp(): void {
  console.log(`
am-i-vibing - Detect agentic coding environments

USAGE:
  npx am-i-vibing [OPTIONS]

OPTIONS:
  -f, --format <json|text>     Output format (default: text)
  -c, --check <agent|interactive|hybrid>  Check for specific environment type
  -q, --quiet                  Only output result, no labels
  -p, --check-processes        Also walk the process tree for detection
                               (slower, off by default)
  -d, --debug                  Debug output with environment and process info
  -h, --help                   Show this help message

EXAMPLES:
  npx am-i-vibing                    # Detect current environment
  npx am-i-vibing --format json      # JSON output
  npx am-i-vibing --check agent      # Check if running under agent
  npx am-i-vibing --check hybrid     # Check if running under hybrid
  npx am-i-vibing --quiet            # Minimal output
  npx am-i-vibing --check-processes  # Include process-tree detection
  npx am-i-vibing --debug            # Debug with full environment info

EXIT CODES:
  0  Agentic environment detected (or specific check passed)
  1  No agentic environment detected (or specific check failed)
`);
}

function checkEnvironmentType(
  checkType: string,
  options: { checkProcesses?: boolean },
): boolean {
  switch (checkType) {
    case "agent":
      return isAgent({ checkProcesses: options.checkProcesses });
    case "interactive":
      return isInteractive({ checkProcesses: options.checkProcesses });
    case "hybrid":
      return isHybrid({ checkProcesses: options.checkProcesses });
    default:
      return false;
  }
}

function formatOutput(
  result: ReturnType<typeof detectAgenticEnvironment>,
  options: CliOptions,
): string {
  if (options.debug) {
    let processAncestry: any[] = [];
    try {
      processAncestry = getProcessAncestry();
    } catch (error) {
      processAncestry = [{ error: "Failed to get process ancestry" }];
    }

    const debugOutput = {
      detection: result,
      environment: process.env,
      processAncestry,
    };
    return JSON.stringify(debugOutput, null, 2);
  }

  if (options.format === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (options.quiet) {
    if (options.check) {
      return checkEnvironmentType(options.check, options) ? "true" : "false";
    }
    return result.isAgentic ? `${result.name}` : "none";
  }

  if (options.check) {
    const matches = checkEnvironmentType(options.check, options);
    return matches
      ? `✓ Running in ${options.check} environment: ${result.name}`
      : `✗ Not running in ${options.check} environment`;
  }

  if (!result.isAgentic) {
    return "✗ No agentic environment detected";
  }

  return `✓ Detected: [${result.id}] ${result.name} (${result.type})`;
}

function main(): void {
  const options = parseCliArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  // --debug always reveals the full picture, including process detection
  const checkProcesses = options.checkProcesses || options.debug;
  const result = detectAgenticEnvironment({ checkProcesses });
  let exitCode = 1;

  if (options.check) {
    exitCode = checkEnvironmentType(options.check, { checkProcesses }) ? 0 : 1;
  } else {
    exitCode = result.isAgentic ? 0 : 1;
  }

  const output = formatOutput(result, options);
  console.log(output);

  process.exit(exitCode);
}

main();
