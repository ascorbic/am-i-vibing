import { expect, test } from "vitest";
import { detectAgenticEnvironment as detect } from "../src/detector.js";
test("Manus execution marker and boundaries", () => {
  for (const env of [
    { MANUS_ADDON_RUNTIME_SPEC_PATH: "1" },
    { MANUS_ADDON_RUNTIME_SPEC_PATH: "0" },
    { MANUS_ADDON_RUNTIME_SPEC_PATH: "false" },
    { MANUS_ADDON_RUNTIME_SPEC_PATH: " " },
    { MANUS_ADDON_RUNTIME_SPECS_REVISION: "1" },
    { MANUS_ADDON_RUNTIME_SPECS_REVISION: "0" },
    { MANUS_ADDON_RUNTIME_SPECS_REVISION: "false" },
    { MANUS_ADDON_RUNTIME_SPECS_REVISION: " " },
  ])
    expect(detect({ env, checkProcesses: false }).id).toBe("manus");
  for (const env of [
    {},
    {},
    { MANUS_ADDON_RUNTIME_SPEC_PATH: "" },
    {},
    { MANUS_ADDON_RUNTIME_SPECS_REVISION: "" },
  ])
    expect(detect({ env, checkProcesses: false }).id).not.toBe("manus");
});
