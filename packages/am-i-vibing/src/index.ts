/**
 * am-i-vibing - Detect agentic coding environments and AI assistant tools
 */

// Export types
export type {
  AgenticType,
  ProviderConfig,
  DetectionResult,
  DetectOptions,
  EnvVarDefinition,
  EnvVarGroup,
} from "./types.js";

// Export providers
export { providers, getProvider, getProvidersByType } from "./providers.js";

// Export detection functions
export {
  detectAgenticEnvironment,
  isProvider,
  isAgent,
  isInteractive,
  isHybrid,
} from "./detector.js";

// Import for default export
import { detectAgenticEnvironment } from "./detector.js";

// Convenience export for the main function
export default detectAgenticEnvironment;
