import type {
  AgentInfo,
  DetectionResult,
  DetectOptions,
  EnvironmentConfig,
  EnvironmentInfo,
  EnvVarDefinition,
  EnvVarExtractor,
  EnvVarGroup,
  ProviderConfig,
} from "./types.js";
import { providers } from "./providers.js";
import { environments } from "./environments.js";
import { getProcessAncestry } from "process-ancestry";

type EnvMap = Record<string, string | undefined>;
type ProcessAncestry = Array<{ command?: string }>;

interface NormalizedOptions {
  env: EnvMap;
  processAncestry?: ProcessAncestry;
  checkProcesses: boolean;
}

/**
 * Check if a specific environment variable exists (handles both strings and tuples)
 */
function checkEnvVar(envVarDef: EnvVarDefinition, env: EnvMap): boolean {
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
  env: EnvMap,
): boolean {
  if (typeof definition === "string" || Array.isArray(definition)) {
    return checkEnvVar(definition, env);
  }

  const { any, all, none } = definition;

  const anyResult =
    !any?.length || any.some((envVar) => checkEnvVar(envVar, env));
  const allResult =
    !all?.length || all.every((envVar) => checkEnvVar(envVar, env));
  const noneResult =
    !none?.length || !none.some((envVar) => checkEnvVar(envVar, env));

  return anyResult && allResult && noneResult;
}

/**
 * Pull the first non-empty value from a declared env-var extractor.
 */
function extractValue(
  extractor: EnvVarExtractor | undefined,
  env: EnvMap,
): string | undefined {
  if (!extractor) return undefined;
  const names = Array.isArray(extractor) ? extractor : [extractor];
  for (const name of names) {
    const value = env[name];
    if (value) return value;
  }
  return undefined;
}

/**
 * Run custom detectors for a config entry
 */
function runCustomDetectors(
  detectors: ProviderConfig["customDetectors"],
): boolean {
  return (
    detectors?.some((detector) => {
      try {
        return detector();
      } catch {
        return false;
      }
    }) ?? false
  );
}

/**
 * Normalise the supported argument shapes into a NormalizedOptions object.
 *
 * Supported shapes:
 *   - detectAgenticEnvironment()
 *   - detectAgenticEnvironment(options)
 *   - detectAgenticEnvironment(env)                       // legacy
 *   - detectAgenticEnvironment(env, processAncestry)      // legacy
 */
function normalizeOptions(
  envOrOptions?: EnvMap | DetectOptions,
  legacyAncestry?: ProcessAncestry,
): NormalizedOptions {
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
    env: (envOrOptions as EnvMap | undefined) ?? process.env,
    processAncestry: legacyAncestry,
    // Legacy callers that explicitly passed an ancestry are presumed to want
    // process checks; otherwise default off.
    checkProcesses: legacyAncestry !== undefined,
  };
}

/**
 * Lazily compute and cache the process ancestry on demand.
 */
function makeAncestryGetter(seed?: ProcessAncestry): () => ProcessAncestry {
  let cached = seed;
  return () => {
    if (cached === undefined) {
      try {
        cached = getProcessAncestry();
      } catch {
        cached = [];
      }
    }
    return cached;
  };
}

/**
 * Find the first config that matches. Cheap checks (env vars, then custom
 * detectors) run across every config first; process-tree checks only run if
 * `checkProcesses` is enabled, since reading the process tree spawns a
 * subprocess (notably slow on Windows).
 */
function findMatch<T extends ProviderConfig | EnvironmentConfig>(
  configs: readonly T[],
  env: EnvMap,
  checkProcesses: boolean,
  getAncestry: () => ProcessAncestry,
): T | null {
  for (const config of configs) {
    if (config.envVars?.some((group) => checkEnvVars(group, env))) {
      return config;
    }
  }
  for (const config of configs) {
    if (runCustomDetectors(config.customDetectors)) {
      return config;
    }
  }
  if (checkProcesses) {
    for (const config of configs) {
      if (
        config.processChecks?.some((name) =>
          checkProcess(name, getAncestry()),
        )
      ) {
        return config;
      }
    }
  }
  return null;
}

function buildAgentInfo(
  provider: ProviderConfig,
  env: EnvMap,
): AgentInfo {
  const info: AgentInfo = {
    id: provider.id,
    name: provider.name,
    type: provider.type,
  };
  const version = extractValue(provider.versionEnvVar, env);
  if (version) info.version = version;
  const sessionId = extractValue(provider.sessionIdEnvVar, env);
  if (sessionId) info.sessionId = sessionId;
  return info;
}

function buildEnvironmentInfo(
  environment: EnvironmentConfig,
  env: EnvMap,
): EnvironmentInfo {
  const info: EnvironmentInfo = {
    id: environment.id,
    name: environment.name,
    kind: environment.kind,
  };
  const containerId = extractValue(environment.containerIdEnvVar, env);
  if (containerId) info.containerId = containerId;
  const runId = extractValue(environment.runIdEnvVar, env);
  if (runId) info.runId = runId;
  return info;
}

/**
 * Internal helper: find an agent given normalised options and a shared
 * ancestry getter. Public functions go through this so they can share the
 * normalisation/ancestry work without ricocheting through overload dispatch.
 */
function findAgent(
  opts: NormalizedOptions,
  getAncestry: () => ProcessAncestry,
): AgentInfo | null {
  const provider = findMatch(
    providers,
    opts.env,
    opts.checkProcesses,
    getAncestry,
  );
  return provider ? buildAgentInfo(provider, opts.env) : null;
}

/**
 * Internal helper: find an environment given normalised options and a shared
 * ancestry getter.
 */
function findEnvironment(
  opts: NormalizedOptions,
  getAncestry: () => ProcessAncestry,
): EnvironmentInfo | null {
  const environment = findMatch(
    environments,
    opts.env,
    opts.checkProcesses,
    getAncestry,
  );
  return environment ? buildEnvironmentInfo(environment, opts.env) : null;
}

/**
 * Detect the AI agent driving this process, if any.
 */
export function detectAgent(options?: DetectOptions): AgentInfo | null;
/**
 * @deprecated Pass an options object instead. This signature is retained for
 * backwards compatibility and will be removed in a future major release.
 */
export function detectAgent(
  env: EnvMap,
  processAncestry?: ProcessAncestry,
): AgentInfo | null;
export function detectAgent(
  envOrOptions?: EnvMap | DetectOptions,
  legacyAncestry?: ProcessAncestry,
): AgentInfo | null {
  const opts = normalizeOptions(envOrOptions, legacyAncestry);
  return findAgent(opts, makeAncestryGetter(opts.processAncestry));
}

/**
 * Detect the runtime environment this process is running in, if recognised.
 */
export function detectEnvironment(
  options?: DetectOptions,
): EnvironmentInfo | null;
/**
 * @deprecated Pass an options object instead.
 */
export function detectEnvironment(
  env: EnvMap,
  processAncestry?: ProcessAncestry,
): EnvironmentInfo | null;
export function detectEnvironment(
  envOrOptions?: EnvMap | DetectOptions,
  legacyAncestry?: ProcessAncestry,
): EnvironmentInfo | null {
  const opts = normalizeOptions(envOrOptions, legacyAncestry);
  return findEnvironment(opts, makeAncestryGetter(opts.processAncestry));
}

/**
 * Detect the agent and runtime environment together.
 */
export function detectAgenticEnvironment(
  options?: DetectOptions,
): DetectionResult;
/**
 * @deprecated Pass an options object instead.
 */
export function detectAgenticEnvironment(
  env: EnvMap,
  processAncestry?: ProcessAncestry,
): DetectionResult;
export function detectAgenticEnvironment(
  envOrOptions?: EnvMap | DetectOptions,
  legacyAncestry?: ProcessAncestry,
): DetectionResult {
  const opts = normalizeOptions(envOrOptions, legacyAncestry);
  const getAncestry = makeAncestryGetter(opts.processAncestry);
  const agent = findAgent(opts, getAncestry);
  const environment = findEnvironment(opts, getAncestry);
  return {
    isAgentic: agent !== null,
    agent,
    environment,
  };
}

/**
 * Check if currently running under a specific provider (by name)
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
  env: EnvMap,
  processAncestry?: ProcessAncestry,
): boolean;
export function isProvider(
  providerName: string,
  envOrOptions?: EnvMap | DetectOptions,
  legacyAncestry?: ProcessAncestry,
): boolean {
  const opts = normalizeOptions(envOrOptions, legacyAncestry);
  return (
    findAgent(opts, makeAncestryGetter(opts.processAncestry))?.name ===
    providerName
  );
}

/**
 * Check if currently running in any agent environment
 */
export function isAgent(options?: DetectOptions): boolean;
/**
 * @deprecated Pass an options object instead.
 */
export function isAgent(
  env: EnvMap,
  processAncestry?: ProcessAncestry,
): boolean;
export function isAgent(
  envOrOptions?: EnvMap | DetectOptions,
  legacyAncestry?: ProcessAncestry,
): boolean {
  const opts = normalizeOptions(envOrOptions, legacyAncestry);
  const agent = findAgent(opts, makeAncestryGetter(opts.processAncestry));
  return agent?.type === "agent" || agent?.type === "hybrid";
}

/**
 * Check if currently running in any interactive AI environment
 */
export function isInteractive(options?: DetectOptions): boolean;
/**
 * @deprecated Pass an options object instead.
 */
export function isInteractive(
  env: EnvMap,
  processAncestry?: ProcessAncestry,
): boolean;
export function isInteractive(
  envOrOptions?: EnvMap | DetectOptions,
  legacyAncestry?: ProcessAncestry,
): boolean {
  const opts = normalizeOptions(envOrOptions, legacyAncestry);
  const agent = findAgent(opts, makeAncestryGetter(opts.processAncestry));
  return agent?.type === "interactive" || agent?.type === "hybrid";
}

/**
 * Check if currently running in any hybrid AI environment
 */
export function isHybrid(options?: DetectOptions): boolean;
/**
 * @deprecated Pass an options object instead.
 */
export function isHybrid(
  env: EnvMap,
  processAncestry?: ProcessAncestry,
): boolean;
export function isHybrid(
  envOrOptions?: EnvMap | DetectOptions,
  legacyAncestry?: ProcessAncestry,
): boolean {
  const opts = normalizeOptions(envOrOptions, legacyAncestry);
  return (
    findAgent(opts, makeAncestryGetter(opts.processAncestry))?.type ===
    "hybrid"
  );
}
