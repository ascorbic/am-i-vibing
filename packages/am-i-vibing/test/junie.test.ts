import { expect, test } from "vitest";
import { detectAgenticEnvironment as detect } from "../src/detector.js";
test("Junie execution marker and boundaries", () => {
  for (const env of [
    { JUNIE_SHIM_PATH: "1" },
    { JUNIE_SHIM_PATH: "0" },
    { JUNIE_SHIM_PATH: "false" },
    { JUNIE_SHIM_PATH: " " },
  ])
    expect(detect({ env, checkProcesses: false }).id).toBe("junie");
  for (const env of [
    {},
    {},
    { JUNIE_SHIM_PATH: "" },
    { JUNIE_DATA: "synthetic" },
  ])
    expect(detect({ env, checkProcesses: false }).id).not.toBe("junie");
});
