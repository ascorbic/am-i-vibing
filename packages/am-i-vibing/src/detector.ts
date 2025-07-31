import type {
  DetectionResult,
  ProviderConfig,
  EnvVarDefinition,
  EnvVarGroup,
} from "./types.js";
import { providers } from "./providers.js";
import { getProcessAncestry } from "process-ancestry";

/**
 * Check if a specific environment variable exists (handles both strings and tuples)
 */
function checkEnvVar(
  envVarDef: EnvVarDefinition,
  env: Record<string, string | undefined> = process.env,
): boolean {
  const [envVar, expectedValue] =
    typeof envVarDef === "string" ? [envVarDef, undefined] : envVarDef;

  const actualValue = env[envVar];
  return Boolean(
    actualValue && (!expectedValue || actualValue === expectedValue),
  );
}

/**
 * Check if a process is running in the process tree
 */
function checkProcess(
  processName: string,
  processAncestry?: Array<{ command?: string }>,
): boolean {
  try {
    const ancestry = processAncestry ?? getProcessAncestry();
    for (const ancestorProcess of ancestry) {
      if (ancestorProcess.command?.includes(processName)) {
        return true;
      }
    }
  } catch (error) {
    // Ignore process check errors
  }
  return false;
}

/**
 * Check if an environment variable group matches based on its properties
 */
function checkEnvVars(
  definition: EnvVarGroup | EnvVarDefinition,
  env: Record<string, string | undefined> = process.env,
): boolean {
  if (typeof definition === "string" || Array.isArray(definition)) {
    return checkEnvVar(definition, env);
  }

  const { any, all, none } = definition;

  // Check ANY conditions (OR logic) - at least one must pass
  const anyResult =
    !any?.length || any.some((envVar) => checkEnvVar(envVar, env));

  // Check ALL conditions (AND logic) - all must pass
  const allResult =
    !all?.length || all.every((envVar) => checkEnvVar(envVar, env));

  // Check NONE conditions (NOT logic) - none should pass
  const noneResult =
    !none?.length || !none.some((envVar) => checkEnvVar(envVar, env));

  return anyResult && allResult && noneResult;
}

/**
 * Run custom detectors for a provider
 */
function runCustomDetectors(provider: ProviderConfig): boolean {
  return (
    provider.customDetectors?.some((detector) => {
      try {
        return detector();
      } catch {
        return false;
      }
    }) ?? false
  );
}

/**
 * Create a positive detection result
 */
function createDetectedResult(provider: ProviderConfig): DetectionResult {
  return {
    isAgentic: true,
    id: provider.id,
    name: provider.name,
    type: provider.type,
  };
}

/**
 * Detect agentic coding environment
 */
export function detectAgenticEnvironment(
  env: Record<string, string | undefined> = process.env,
  processAncestry?: Array<{ command?: string }>,
): DetectionResult {
  for (const provider of providers) {
    // Check environment variables
    if (provider.envVars?.some((group) => checkEnvVars(group, env))) {
      return createDetectedResult(provider);
    }

    // Check processes
    if (provider.processChecks?.some((processName) => checkProcess(processName, processAncestry))) {
      return createDetectedResult(provider);
    }

    // Run custom detectors
    if (runCustomDetectors(provider)) {
      return createDetectedResult(provider);
    }
  }

  // No provider detected
  return {
    isAgentic: false,
    id: null,
    name: null,
    type: null,
  };
}

/**
 * Check if currently running in a specific provider
 */
export function isProvider(
  providerName: string,
  env: Record<string, string | undefined> = process.env,
  processAncestry?: Array<{ command?: string }>,
): boolean {
  const result = detectAgenticEnvironment(env, processAncestry);
  return result.name === providerName;
}

/**
 * Check if currently running in any agent environment
 */
export function isAgent(
  env: Record<string, string | undefined> = process.env,
  processAncestry?: Array<{ command?: string }>,
): boolean {
  const result = detectAgenticEnvironment(env, processAncestry);
  return result.type === "agent" || result.type === "hybrid";
}

/**
 * Check if currently running in any interactive AI environment
 */
export function isInteractive(
  env: Record<string, string | undefined> = process.env,
  processAncestry?: Array<{ command?: string }>,
): boolean {
  const result = detectAgenticEnvironment(env, processAncestry);
  return result.type === "interactive" || result.type === "hybrid";
}

/**
 * Check if currently running in any hybrid AI environment
 */
export function isHybrid(
  env: Record<string, string | undefined> = process.env,
  processAncestry?: Array<{ command?: string }>,
): boolean {
  const result = detectAgenticEnvironment(env, processAncestry);
  return result.type === "hybrid";
}
