import { expect, test } from "vitest";
import { detectAgenticEnvironment as detect } from "../src/detector.js";
test("Kimi Code execution marker and boundaries", () => {
  for (const env of [
    { KIMI_PLUGIN_ROOT: "1" },
    { KIMI_PLUGIN_ROOT: "0" },
    { KIMI_PLUGIN_ROOT: "false" },
    { KIMI_PLUGIN_ROOT: " " },
  ])
    expect(detect({ env, checkProcesses: false }).id).toBe("kimi");
  for (const env of [
    {},
    {},
    { KIMI_PLUGIN_ROOT: "" },
    { KIMI_CODE_HOME: "synthetic" },
  ])
    expect(detect({ env, checkProcesses: false }).id).not.toBe("kimi");
});
