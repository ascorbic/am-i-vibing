import { expect, test } from "vitest";
import { detectAgenticEnvironment as detect } from "../src/detector.js";
test("Grok Build execution marker and boundaries", () => {
  for (const env of [
    { GROK_AGENT: "1" },
    { GROK_PLUGIN_ROOT: "1" },
    { GROK_PLUGIN_ROOT: "0" },
    { GROK_PLUGIN_ROOT: "false" },
    { GROK_PLUGIN_ROOT: " " },
    { GROK_PLUGIN_DATA: "1" },
    { GROK_PLUGIN_DATA: "0" },
    { GROK_PLUGIN_DATA: "false" },
    { GROK_PLUGIN_DATA: " " },
  ])
    expect(detect({ env, checkProcesses: false }).id).toBe("grok-build");
  for (const env of [
    {},
    {},
    { GROK_AGENT: "" },
    { GROK_AGENT: "true" },
    { GROK_AGENT: "01" },
    { GROK_AGENT: " 1" },
    { GROK_AGENT: "1\n" },
    { GROK_AGENT: "other-selector" },
    {},
    { GROK_PLUGIN_ROOT: "" },
    {},
    { GROK_PLUGIN_DATA: "" },
  ])
    expect(detect({ env, checkProcesses: false }).id).not.toBe("grok-build");
});
