/**
 * The type of AI coding environment detected
 */
export type AgenticType = "agent" | "interactive" | "hybrid";

/**
 * The kind of runtime environment a process is executing in
 */
export type EnvironmentKind =
  | "cloud-sandbox"
  | "ci-runner"
  | "ide"
  | "webcontainer";

/**
 * Environment variable definition - either just a name or a name/value tuple
 */
export type EnvVarDefinition = string | [string, string];

/**
 * Environment variable group with logical operators
 */
export interface EnvVarGroup {
  /** ANY of these environment variables can match (OR logic) */
  any?: EnvVarDefinition[];

  /** ALL of these environment variables must match (AND logic) */
  all?: EnvVarDefinition[];

  /** NONE of these environment variables should be present (NOT logic) */
  none?: EnvVarDefinition[];
}

/**
 * Declarative extractor: the env var(s) to read for a given field.
 * If an array is given, the first non-empty value wins.
 */
export type EnvVarExtractor = string | string[];

/**
 * Configuration for detecting a specific AI coding agent
 */
export interface ProviderConfig {
  /** Unique identifier for the provider */
  id: string;

  /** Human-readable name of the provider */
  name: string;

  /** Type of AI coding environment */
  type: AgenticType;

  /** Environment variables */
  envVars?: Array<EnvVarGroup | EnvVarDefinition>;

  /** Process names to check for in the process tree (only used when checkProcesses is enabled) */
  processChecks?: string[];

  /** Custom detection functions for complex logic */
  customDetectors?: (() => boolean)[];

  /** Env var(s) to read for the agent's reported version */
  versionEnvVar?: EnvVarExtractor;

  /** Env var(s) to read for the agent's session/conversation id */
  sessionIdEnvVar?: EnvVarExtractor;
}

/**
 * Configuration for detecting a runtime environment (cloud sandbox, CI runner, etc.)
 */
export interface EnvironmentConfig {
  /** Unique identifier for the environment */
  id: string;

  /** Human-readable name of the environment */
  name: string;

  /** Kind of runtime environment */
  kind: EnvironmentKind;

  /** Environment variables */
  envVars?: Array<EnvVarGroup | EnvVarDefinition>;

  /** Process names to check for in the process tree */
  processChecks?: string[];

  /** Custom detection functions for complex logic */
  customDetectors?: (() => boolean)[];

  /** Env var(s) to read for a stable container/sandbox identifier */
  containerIdEnvVar?: EnvVarExtractor;

  /** Env var(s) to read for an execution/run identifier */
  runIdEnvVar?: EnvVarExtractor;
}

/**
 * Information about the detected AI agent
 */
export interface AgentInfo {
  /** Unique identifier for the agent */
  id: string;

  /** Human-readable name of the agent */
  name: string;

  /** Type of AI coding environment */
  type: AgenticType;

  /** Reported version of the agent, if available */
  version?: string;

  /** Session/conversation identifier, if available */
  sessionId?: string;
}

/**
 * Information about the detected runtime environment
 */
export interface EnvironmentInfo {
  /** Unique identifier for the environment */
  id: string;

  /** Human-readable name of the environment */
  name: string;

  /** Kind of runtime environment */
  kind: EnvironmentKind;

  /** Stable container/sandbox identifier, if available */
  containerId?: string;

  /** Execution/run identifier, if available */
  runId?: string;
}

/**
 * Result of agentic environment detection.
 *
 * Prefer destructuring the fields you use rather than passing the whole
 * result object around:
 *
 * ```ts
 * const { agent, environment } = detectAgenticEnvironment();
 * ```
 *
 * New top-level fields may be added in future versions. Destructuring keeps
 * your code forward-compatible with those additions.
 */
export interface DetectionResult {
  /** Whether an AI agent was detected */
  isAgentic: boolean;

  /** Detected AI agent, or null if none */
  agent: AgentInfo | null;

  /** Detected runtime environment, or null if none recognised */
  environment: EnvironmentInfo | null;
}

/**
 * Options for `detectAgenticEnvironment` and related helpers.
 */
export interface DetectOptions {
  /**
   * Environment variables to inspect. Defaults to `process.env`.
   */
  env?: Record<string, string | undefined>;

  /**
   * Pre-computed process ancestry (from `process-ancestry` or compatible). When
   * provided, this is used in place of fetching ancestry at detection time.
   * Implies `checkProcesses: true` unless explicitly set to `false`.
   */
  processAncestry?: Array<{ command?: string }>;

  /**
   * Whether to fall back to process-ancestry checks when no environment-variable
   * match is found. Defaults to `false` because fetching the process tree is
   * expensive on some platforms (notably Windows).
   *
   * Set to `true` to enable detection of providers that only expose a
   * processChecks signal (e.g. Octofriend), at the cost of spawning a
   * subprocess to read the process tree.
   */
  checkProcesses?: boolean;
}
