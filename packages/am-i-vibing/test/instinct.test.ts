import { expect, test } from "vitest";
import { detectAgenticEnvironment as detect } from "../src/detector.js";
test("Instinct execution marker and boundaries", () => {
  for (const env of [
    { INSTINCT_OUTER_TOOL_USE_ID: "1" },
    { INSTINCT_OUTER_TOOL_USE_ID: "0" },
    { INSTINCT_OUTER_TOOL_USE_ID: "false" },
    { INSTINCT_OUTER_TOOL_USE_ID: " " },
    { INSTINCT_OUTER_TOOL_USE_STARTED_AT: "1" },
    { INSTINCT_OUTER_TOOL_USE_STARTED_AT: "0" },
    { INSTINCT_OUTER_TOOL_USE_STARTED_AT: "false" },
    { INSTINCT_OUTER_TOOL_USE_STARTED_AT: " " },
    { INSTINCT_OUTER_TOOL_USE_TIMEOUT_SECONDS: "1" },
    { INSTINCT_OUTER_TOOL_USE_TIMEOUT_SECONDS: "0" },
    { INSTINCT_OUTER_TOOL_USE_TIMEOUT_SECONDS: "false" },
    { INSTINCT_OUTER_TOOL_USE_TIMEOUT_SECONDS: " " },
  ])
    expect(detect({ env, checkProcesses: false }).id).toBe("instinct");
  for (const env of [
    {},
    {},
    { INSTINCT_OUTER_TOOL_USE_ID: "" },
    {},
    { INSTINCT_OUTER_TOOL_USE_STARTED_AT: "" },
    {},
    { INSTINCT_OUTER_TOOL_USE_TIMEOUT_SECONDS: "" },
  ])
    expect(detect({ env, checkProcesses: false }).id).not.toBe("instinct");
  expect(
    detect({
      env: { INSTINCT_OUTER_TOOL_USE_ID: "1", CLAUDECODE: "1" },
      checkProcesses: false,
    }).id,
  ).toBe("claude-code");
});
