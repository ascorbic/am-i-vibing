import { expect, test } from "vitest";
import { detectAgenticEnvironment as detect } from "../src/detector.js";
test("VT Code execution marker and boundaries", () => {
  for (const env of [
    { VTCODE: "1" },
    { VTCODE: "0" },
    { VTCODE: "false" },
    { VTCODE: " " },
  ])
    expect(detect({ env, checkProcesses: false }).id).toBe("vtcode");
  for (const env of [{}, {}, { VTCODE: "" }])
    expect(detect({ env, checkProcesses: false }).id).not.toBe("vtcode");
});
