import type {
  DetectionResult,
  DetectOptions,
  ProviderConfig,
  EnvVarDefinition,
  EnvVarGroup,
  ProcessAncestry,
} from "./types.js";
import { providers } from "./providers.js";

/**
 * Fetch the current process ancestry via tinyps.
 *
 * Loaded on demand so importing this package never requires Node's module
 * graph: tinyps is only loaded when process checks are actually requested.
 */
async function fetchProcessAncestry(): Promise<ProcessAncestry> {
  try {
    const { getProcessAncestry } = await import("tinyps");
    return await getProcessAncestry();
  } catch {
    return [];
  }
}

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
  processAncestry: ProcessAncestry,
): boolean {
  for (const ancestorProcess of processAncestry) {
    if (
      ancestorProcess.command?.includes(processName) ||
      ancestorProcess.name?.includes(processName)
    ) {
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
 * Result returned when no provider matched
 */
function noDetectionResult(): DetectionResult {
  return {
    isAgentic: false,
    id: null,
    name: null,
    type: null,
  };
}

/**
 * Common fast-path detection logic (env vars and custom detectors)
 */
function runFastPathDetection(
  env: Record<string, string | undefined>,
): DetectionResult | null {
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

  return null;
}

/**
 * Run process ancestry checks against all providers
 */
function runProcessChecks(ancestry: ProcessAncestry): DetectionResult | null {
  for (const provider of providers) {
    if (
      provider.processChecks?.some((processName) =>
        checkProcess(processName, ancestry),
      )
    ) {
      return createDetectedResult(provider);
    }
  }

  return null;
}

/**
 * Detect agentic coding environment synchronously (env vars, custom detectors,
 * and any pre-supplied process ancestry)
 */
export function detectAgenticEnvironmentSync(
  options?: DetectOptions,
): DetectionResult {
  const env = options?.env ?? process.env;
  const processAncestry = options?.processAncestry;
  // Supplying an ancestry implies opting in to process checks unless the
  // caller explicitly opted out.
  const checkProcesses =
    options?.checkProcesses ?? processAncestry !== undefined;

  const fastResult = runFastPathDetection(env);
  if (fastResult) {
    return fastResult;
  }

  if (checkProcesses && processAncestry) {
    return runProcessChecks(processAncestry) ?? noDetectionResult();
  }

  return noDetectionResult();
}

/**
 * Detect agentic coding environment asynchronously (supports fetching process
 * ancestry via tinyps when pre-supplied ancestry is absent)
 */
export async function detectAgenticEnvironment(
  options?: DetectOptions,
): Promise<DetectionResult> {
  const processAncestry = options?.processAncestry;

  // A pre-supplied ancestry can be checked without any awaits, so the sync
  // path covers everything in that case.
  if (processAncestry !== undefined) {
    return detectAgenticEnvironmentSync(options);
  }

  const env = options?.env ?? process.env;
  const fastResult = runFastPathDetection(env);
  if (fastResult) {
    return fastResult;
  }

  // Slow path: fetch the process tree (only when opted in, because it spawns
  // a subprocess and is notably slow on Windows).
  if (options?.checkProcesses) {
    const ancestry = await fetchProcessAncestry();
    return runProcessChecks(ancestry) ?? noDetectionResult();
  }

  return noDetectionResult();
}

/**
 * Check if currently running in a specific provider
 */
export function isProvider(
  providerName: string,
  options?: DetectOptions,
): boolean {
  const result = detectAgenticEnvironmentSync(options);
  return result.name === providerName;
}

/**
 * Check if currently running in any agent environment
 */
export function isAgent(options?: DetectOptions): boolean {
  const result = detectAgenticEnvironmentSync(options);
  return result.type === "agent" || result.type === "hybrid";
}

/**
 * Check if currently running in any interactive AI environment
 */
export function isInteractive(options?: DetectOptions): boolean {
  const result = detectAgenticEnvironmentSync(options);
  return result.type === "interactive" || result.type === "hybrid";
}

/**
 * Check if currently running in any hybrid AI environment
 */
export function isHybrid(options?: DetectOptions): boolean {
  const result = detectAgenticEnvironmentSync(options);
  return result.type === "hybrid";
}
