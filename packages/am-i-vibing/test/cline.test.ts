import { expect, test } from "vitest";
import { detectAgenticEnvironment as detect } from "../src/detector.js";
test("Cline execution marker and boundaries", () => {
  for (const env of [
    { CLINE_ACTIVE: "1" },
    { CLINE_ACTIVE: "0" },
    { CLINE_ACTIVE: "false" },
    { CLINE_ACTIVE: " " },
    { CLINE_WRAPPER_PATH: "1" },
    { CLINE_WRAPPER_PATH: "0" },
    { CLINE_WRAPPER_PATH: "false" },
    { CLINE_WRAPPER_PATH: " " },
  ])
    expect(detect({ env, checkProcesses: false }).id).toBe("cline");
  for (const env of [
    {},
    {},
    { CLINE_ACTIVE: "" },
    {},
    { CLINE_WRAPPER_PATH: "" },
  ])
    expect(detect({ env, checkProcesses: false }).id).not.toBe("cline");
});
