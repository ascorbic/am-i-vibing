import { expect, test } from "vitest";
import { detectAgenticEnvironment as detect } from "../src/detector.js";
test("Kilo Code execution marker and boundaries", () => {
  for (const env of [
    { KILOCODE_FEATURE: "1" },
    { KILOCODE_FEATURE: "0" },
    { KILOCODE_FEATURE: "false" },
    { KILOCODE_FEATURE: " " },
  ])
    expect(detect({ env, checkProcesses: false }).id).toBe("kilo-code");
  for (const env of [{}, {}, { KILOCODE_FEATURE: "" }])
    expect(detect({ env, checkProcesses: false }).id).not.toBe("kilo-code");
});
