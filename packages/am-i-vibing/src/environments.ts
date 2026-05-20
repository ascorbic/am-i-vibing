import type { EnvironmentConfig } from "./types.js";

/**
 * Environment configurations for runtime sandboxes, CI runners, IDEs, and WebContainers.
 *
 * Environments are detected independently of agents: a result can have an agent
 * with no environment, an environment with no agent, or both.
 */
export const environments: EnvironmentConfig[] = [
  {
    id: "claude-code-cloud",
    name: "Claude Code Cloud",
    kind: "cloud-sandbox",
    envVars: [
      {
        any: [["CLAUDE_CODE_REMOTE", "true"], "CLAUDE_CODE_CONTAINER_ID"],
      },
    ],
    containerIdEnvVar: "CLAUDE_CODE_CONTAINER_ID",
  },
  {
    id: "github-actions",
    name: "GitHub Actions",
    kind: "ci-runner",
    envVars: [["GITHUB_ACTIONS", "true"]],
    containerIdEnvVar: "RUNNER_NAME",
    runIdEnvVar: "GITHUB_RUN_ID",
  },
  {
    id: "gitlab-ci",
    name: "GitLab CI",
    kind: "ci-runner",
    envVars: [["GITLAB_CI", "true"]],
    runIdEnvVar: "CI_JOB_ID",
  },
  {
    id: "circleci",
    name: "CircleCI",
    kind: "ci-runner",
    envVars: [["CIRCLECI", "true"]],
    runIdEnvVar: "CIRCLE_BUILD_NUM",
  },
  {
    id: "buildkite",
    name: "Buildkite",
    kind: "ci-runner",
    envVars: [["BUILDKITE", "true"]],
    containerIdEnvVar: "BUILDKITE_AGENT_NAME",
    runIdEnvVar: "BUILDKITE_BUILD_ID",
  },
  {
    id: "replit-cloud",
    name: "Replit",
    kind: "cloud-sandbox",
    envVars: ["REPL_ID"],
    containerIdEnvVar: "REPL_ID",
  },
  {
    id: "jules-cloud",
    name: "Jules",
    kind: "cloud-sandbox",
    envVars: [
      {
        all: [
          ["HOME", "/home/jules"],
          ["USER", "swebot"],
        ],
      },
    ],
  },
  {
    id: "webcontainer",
    name: "WebContainer",
    kind: "webcontainer",
    envVars: [
      {
        all: [["SHELL", "/bin/jsh"]],
      },
    ],
  },
  {
    id: "cursor",
    name: "Cursor",
    kind: "ide",
    envVars: ["CURSOR_TRACE_ID"],
  },
  {
    id: "vscode",
    name: "Visual Studio Code",
    kind: "ide",
    envVars: [["TERM_PROGRAM", "vscode"]],
  },
  {
    id: "zed",
    name: "Zed",
    kind: "ide",
    envVars: [["TERM_PROGRAM", "zed"]],
  },
];

/**
 * Get environment configuration by id
 */
export function getEnvironment(id: string): EnvironmentConfig | undefined {
  return environments.find((e) => e.id === id);
}

/**
 * Get all environments of a specific kind
 */
export function getEnvironmentsByKind(
  kind: EnvironmentConfig["kind"],
): EnvironmentConfig[] {
  return environments.filter((e) => e.kind === kind);
}
