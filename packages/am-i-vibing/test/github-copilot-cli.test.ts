import { expect, test } from "vitest";
import { detectAgenticEnvironment as detect } from "../src/detector.js";
test("GitHub Copilot CLI execution marker and boundaries", () => {
  for (const env of [
    { COPILOT_CLI: "1" },
    { COPILOT_CLI: "0" },
    { COPILOT_CLI: "false" },
    { COPILOT_CLI: " " },
    { COPILOT_AGENT_SESSION_ID: "1" },
    { COPILOT_AGENT_SESSION_ID: "0" },
    { COPILOT_AGENT_SESSION_ID: "false" },
    { COPILOT_AGENT_SESSION_ID: " " },
  ])
    expect(detect({ env, checkProcesses: false }).id).toBe(
      "github-copilot-cli",
    );
  for (const env of [
    {},
    {},
    { COPILOT_CLI: "" },
    {},
    { COPILOT_AGENT_SESSION_ID: "" },
    { COPILOT_MODEL: "synthetic" },
    { COPILOT_GITHUB_TOKEN: "synthetic" },
  ])
    expect(detect({ env, checkProcesses: false }).id).not.toBe(
      "github-copilot-cli",
    );
});
