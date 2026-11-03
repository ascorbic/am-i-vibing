import { expect, test } from "vitest";
import { detectAgenticEnvironment as detect } from "../src/detector.js";
test("Claude Cowork execution marker and boundaries", () => {
  for (const env of [
    { CLAUDE_CODE_IS_COWORK: "1", CLAUDECODE: "1" },
    { CLAUDE_CODE_IS_COWORK: "0", CLAUDECODE: "1" },
    { CLAUDE_CODE_IS_COWORK: "false", CLAUDECODE: "1" },
    { CLAUDE_CODE_IS_COWORK: " ", CLAUDECODE: "1" },
    { CLAUDE_CODE_IS_COWORK: "1", CLAUDECODE: "0" },
    { CLAUDE_CODE_IS_COWORK: "1", CLAUDECODE: "false" },
    { CLAUDE_CODE_IS_COWORK: "1", CLAUDECODE: " " },
    { CLAUDE_CODE_IS_COWORK: "1", CLAUDE_CODE: "1" },
    { CLAUDE_CODE_IS_COWORK: "0", CLAUDE_CODE: "1" },
    { CLAUDE_CODE_IS_COWORK: "false", CLAUDE_CODE: "1" },
    { CLAUDE_CODE_IS_COWORK: " ", CLAUDE_CODE: "1" },
    { CLAUDE_CODE_IS_COWORK: "1", CLAUDE_CODE: "0" },
    { CLAUDE_CODE_IS_COWORK: "1", CLAUDE_CODE: "false" },
    { CLAUDE_CODE_IS_COWORK: "1", CLAUDE_CODE: " " },
  ])
    expect(detect({ env, checkProcesses: false }).id).toBe("cowork");
  for (const env of [
    {},
    { CLAUDECODE: "1" },
    { CLAUDE_CODE_IS_COWORK: "", CLAUDECODE: "1" },
    { CLAUDE_CODE_IS_COWORK: "1" },
    { CLAUDE_CODE_IS_COWORK: "1", CLAUDECODE: "" },
    { CLAUDE_CODE: "1" },
    { CLAUDE_CODE_IS_COWORK: "", CLAUDE_CODE: "1" },
    { CLAUDE_CODE_IS_COWORK: "1" },
    { CLAUDE_CODE_IS_COWORK: "1", CLAUDE_CODE: "" },
  ])
    expect(detect({ env, checkProcesses: false }).id).not.toBe("cowork");
});
