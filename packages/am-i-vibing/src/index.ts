/**
 * am-i-vibing - Detect agentic coding environments and AI assistant tools
 */

// Export types
export type {
  AgenticType,
  AgentInfo,
  DetectionResult,
  DetectOptions,
  EnvironmentConfig,
  EnvironmentInfo,
  EnvironmentKind,
  EnvVarDefinition,
  EnvVarExtractor,
  EnvVarGroup,
  ProviderConfig,
} from "./types.js";

// Export providers and environments
export { providers, getProvider, getProvidersByType } from "./providers.js";
export {
  environments,
  getEnvironment,
  getEnvironmentsByKind,
} from "./environments.js";

// Export detection functions
export {
  detectAgent,
  detectAgenticEnvironment,
  detectEnvironment,
  isAgent,
  isHybrid,
  isInteractive,
  isProvider,
} from "./detector.js";

// Import for default export
import { detectAgenticEnvironment } from "./detector.js";

// Convenience export for the main function
export default detectAgenticEnvironment;
