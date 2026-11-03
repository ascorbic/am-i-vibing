import { expect, test } from "vitest";
import { detectAgenticEnvironment as detect } from "../src/detector.js";
test("Roo Code execution marker and boundaries", () => {
  for (const env of [
    { ROO_ACTIVE: "1" },
    { ROO_ACTIVE: "0" },
    { ROO_ACTIVE: "false" },
    { ROO_ACTIVE: " " },
    { ROO_CLI_RUNTIME: "1" },
    { ROO_CLI_RUNTIME: "0" },
    { ROO_CLI_RUNTIME: "false" },
    { ROO_CLI_RUNTIME: " " },
  ])
    expect(detect({ env, checkProcesses: false }).id).toBe("roo-code");
  for (const env of [{}, {}, { ROO_ACTIVE: "" }, {}, { ROO_CLI_RUNTIME: "" }])
    expect(detect({ env, checkProcesses: false }).id).not.toBe("roo-code");
});
