import { expect, test } from "vitest";
import { detectAgenticEnvironment as detect } from "../src/detector.js";
test("Hermes Agent execution marker and boundaries", () => {
  for (const env of [
    { HERMES_SESSION_ID: "1" },
    { HERMES_SESSION_ID: "0" },
    { HERMES_SESSION_ID: "false" },
    { HERMES_SESSION_ID: " " },
    { HERMES_AGENT: "1" },
    { HERMES_AGENT: "0" },
    { HERMES_AGENT: "false" },
    { HERMES_AGENT: " " },
  ])
    expect(detect({ env, checkProcesses: false }).id).toBe("hermes-agent");
  for (const env of [
    {},
    {},
    { HERMES_SESSION_ID: "" },
    {},
    { HERMES_AGENT: "" },
  ])
    expect(detect({ env, checkProcesses: false }).id).not.toBe("hermes-agent");
});
