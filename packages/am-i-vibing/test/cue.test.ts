import { expect, test } from "vitest";
import { detectAgenticEnvironment as detect } from "../src/detector.js";
test("Cue execution marker and boundaries", () => {
  for (const env of [
    { MANUS_LONG_DESKTOP_WORKER: "1" },
    { MANUS_LONG_DESKTOP_WORKER: "0" },
    { MANUS_LONG_DESKTOP_WORKER: "false" },
    { MANUS_LONG_DESKTOP_WORKER: " " },
    { MANUS_OPERATOR_PLATFORM: "1" },
    { MANUS_OPERATOR_PLATFORM: "0" },
    { MANUS_OPERATOR_PLATFORM: "false" },
    { MANUS_OPERATOR_PLATFORM: " " },
  ])
    expect(detect({ env, checkProcesses: false }).id).toBe("cue");
  for (const env of [
    {},
    {},
    { MANUS_LONG_DESKTOP_WORKER: "" },
    {},
    { MANUS_OPERATOR_PLATFORM: "" },
  ])
    expect(detect({ env, checkProcesses: false }).id).not.toBe("cue");
});
