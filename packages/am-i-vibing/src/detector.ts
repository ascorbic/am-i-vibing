import type {
  DetectionResult,
  DetectOptions,
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
  processAncestry: Array<{ command?: string }>,
): boolean {
  for (const ancestorProcess of processAncestry) {
    if (ancestorProcess.command?.includes(processName)) {
      return true;
    }
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
 * Normalize the various supported argument shapes into a DetectOptions object.
 *
 * Supported shapes:
 *   - detectAgenticEnvironment()
 *   - detectAgenticEnvironment(options)
 *   - detectAgenticEnvironment(env)                       // legacy
 *   - detectAgenticEnvironment(env, processAncestry)      // legacy
 */
function normalizeOptions(
  envOrOptions?: Record<string, string | undefined> | DetectOptions,
  legacyAncestry?: Array<{ command?: string }>,
): Required<Pick<DetectOptions, "env" | "checkProcesses">> & {
  processAncestry?: Array<{ command?: string }>;
} {
  // Distinguish a DetectOptions object from a raw env record. DetectOptions
  // has at least one of the known keys; an env record is a flat string map.
  const looksLikeOptions =
    envOrOptions != null &&
    typeof envOrOptions === "object" &&
    ("env" in envOrOptions ||
      "processAncestry" in envOrOptions ||
      "checkProcesses" in envOrOptions);

  if (looksLikeOptions) {
    const opts = envOrOptions as DetectOptions;
    return {
      env: opts.env ?? process.env,
      processAncestry: opts.processAncestry,
      // If the caller pre-supplied an ancestry, default checkProcesses to true
      // unless they explicitly opted out.
      checkProcesses:
        opts.checkProcesses ?? opts.processAncestry !== undefined,
    };
  }

  return {
    env:
      (envOrOptions as Record<string, string | undefined> | undefined) ??
      process.env,
    processAncestry: legacyAncestry,
    // Legacy callers that explicitly passed an ancestry are presumed to want
    // process checks; otherwise default off.
    checkProcesses: legacyAncestry !== undefined,
  };
}

/**
 * Detect agentic coding environment
 */
export function detectAgenticEnvironment(
  options?: DetectOptions,
): DetectionResult;
/**
 * @deprecated Pass an options object instead. This signature is retained for
 * backwards compatibility and will be removed in a future major release.
 */
export function detectAgenticEnvironment(
  env: Record<string, string | undefined>,
  processAncestry?: Array<{ command?: string }>,
): DetectionResult;
export function detectAgenticEnvironment(
  envOrOptions?: Record<string, string | undefined> | DetectOptions,
  legacyAncestry?: Array<{ command?: string }>,
): DetectionResult {
  const { env, processAncestry, checkProcesses } = normalizeOptions(
    envOrOptions,
    legacyAncestry,
  );

  // Fast path: check all environment variables first
  for (const provider of providers) {
    if (provider.envVars?.some((group) => checkEnvVars(group, env))) {
      return createDetectedResult(provider);
    }
  }

  // Custom detectors next (cheap, in-process)
  for (const provider of providers) {
    if (runCustomDetectors(provider)) {
      return createDetectedResult(provider);
    }
  }

  // Slow path: process ancestry checks. Opt-in only because reading the process
  // tree spawns a subprocess (notably slow on Windows).
  if (checkProcesses) {
    let cachedAncestry = processAncestry;
    const getAncestry = () => {
      if (cachedAncestry === undefined) {
        try {
          cachedAncestry = getProcessAncestry();
        } catch {
          cachedAncestry = [];
        }
      }
      return cachedAncestry;
    };

    for (const provider of providers) {
      if (
        provider.processChecks?.some((processName) =>
          checkProcess(processName, getAncestry()),
        )
      ) {
        return createDetectedResult(provider);
      }
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
  options?: DetectOptions,
): boolean;
/**
 * @deprecated Pass an options object instead.
 */
export function isProvider(
  providerName: string,
  env: Record<string, string | undefined>,
  processAncestry?: Array<{ command?: string }>,
): boolean;
export function isProvider(
  providerName: string,
  envOrOptions?: Record<string, string | undefined> | DetectOptions,
  legacyAncestry?: Array<{ command?: string }>,
): boolean {
  const result = detectAgenticEnvironment(
    envOrOptions as DetectOptions,
    legacyAncestry as Array<{ command?: string }> | undefined,
  );
  return result.name === providerName;
}

/**
 * Check if currently running in any agent environment
 */
export function isAgent(options?: DetectOptions): boolean;
/**
 * @deprecated Pass an options object instead.
 */
export function isAgent(
  env: Record<string, string | undefined>,
  processAncestry?: Array<{ command?: string }>,
): boolean;
export function isAgent(
  envOrOptions?: Record<string, string | undefined> | DetectOptions,
  legacyAncestry?: Array<{ command?: string }>,
): boolean {
  const result = detectAgenticEnvironment(
    envOrOptions as DetectOptions,
    legacyAncestry as Array<{ command?: string }> | undefined,
  );
  return result.type === "agent" || result.type === "hybrid";
}

/**
 * Check if currently running in any interactive AI environment
 */
export function isInteractive(options?: DetectOptions): boolean;
/**
 * @deprecated Pass an options object instead.
 */
export function isInteractive(
  env: Record<string, string | undefined>,
  processAncestry?: Array<{ command?: string }>,
): boolean;
export function isInteractive(
  envOrOptions?: Record<string, string | undefined> | DetectOptions,
  legacyAncestry?: Array<{ command?: string }>,
): boolean {
  const result = detectAgenticEnvironment(
    envOrOptions as DetectOptions,
    legacyAncestry as Array<{ command?: string }> | undefined,
  );
  return result.type === "interactive" || result.type === "hybrid";
}

/**
 * Check if currently running in any hybrid AI environment
 */
export function isHybrid(options?: DetectOptions): boolean;
/**
 * @deprecated Pass an options object instead.
 */
export function isHybrid(
  env: Record<string, string | undefined>,
  processAncestry?: Array<{ command?: string }>,
): boolean;
export function isHybrid(
  envOrOptions?: Record<string, string | undefined> | DetectOptions,
  legacyAncestry?: Array<{ command?: string }>,
): boolean {
  const result = detectAgenticEnvironment(
    envOrOptions as DetectOptions,
    legacyAncestry as Array<{ command?: string }> | undefined,
  );
  return result.type === "hybrid";
}
