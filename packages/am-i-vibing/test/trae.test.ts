import { expect, test } from "vitest";
import { detectAgenticEnvironment as detect } from "../src/detector.js";
test("TRAE execution marker and boundaries", () => {
  for (const env of [
    { TRAE_AI_SHELL_ID: "1" },
    { TRAE_AI_SHELL_ID: "0" },
    { TRAE_AI_SHELL_ID: "false" },
    { TRAE_AI_SHELL_ID: " " },
  ])
    expect(detect({ env, checkProcesses: false }).id).toBe("trae");
  for (const env of [{}, {}, { TRAE_AI_SHELL_ID: "" }])
    expect(detect({ env, checkProcesses: false }).id).not.toBe("trae");
});
