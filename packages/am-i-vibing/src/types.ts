/**
 * The type of AI coding environment detected
 */
export type AgenticType = "agent" | "interactive" | "hybrid";

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
 * Configuration for detecting a specific AI coding provider
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
}

/**
 * Result of agentic environment detection
 */
export interface DetectionResult {
  /** Whether an agentic environment was detected */
  isAgentic: boolean;

  /** ID of the detected provider, if any */
  id: string | null;

  /** Name of the detected provider, if any */
  name: string | null;

  /** Type of agentic environment, if detected */
  type: AgenticType | null;
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
