import { expect, test } from "vitest";
import { detectAgenticEnvironment as detect } from "../src/detector.js";
test("Muse execution marker and boundaries", () => {
  for (const env of [
    { JARVIS_IS_ASSIGNED: "1" },
    { JARVIS_IS_ASSIGNED: "0" },
    { JARVIS_IS_ASSIGNED: "false" },
    { JARVIS_IS_ASSIGNED: " " },
    { JARVIS_TOOL_CALL_ID: "1" },
    { JARVIS_TOOL_CALL_ID: "0" },
    { JARVIS_TOOL_CALL_ID: "false" },
    { JARVIS_TOOL_CALL_ID: " " },
  ])
    expect(detect({ env, checkProcesses: false }).id).toBe("muse");
  for (const env of [
    {},
    {},
    { JARVIS_IS_ASSIGNED: "" },
    {},
    { JARVIS_TOOL_CALL_ID: "" },
    { JARVIS_SESSION_ID: "synthetic" },
  ])
    expect(detect({ env, checkProcesses: false }).id).not.toBe("muse");
});
