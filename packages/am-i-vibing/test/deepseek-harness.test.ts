import { expect, test } from "vitest";
import { detectAgenticEnvironment } from "../src/detector.js";
test("DeepSeek shell context and boundaries", () => {
  for (const value of ["1", "0", "false", " "])
    expect(
      detectAgenticEnvironment({
        env: { DSH_SHELL: value },
        checkProcesses: false,
      }).id,
    ).toBe("deepseek-harness");
  for (const env of [{}, { DSH_SHELL: "" }, { DSH_HOME: "synthetic" }])
    expect(
      detectAgenticEnvironment({ env, checkProcesses: false }).id,
    ).toBeNull();
  expect(
    detectAgenticEnvironment({
      env: { DSH_SHELL: "1", CLAUDECODE: "1" },
      checkProcesses: false,
    }).id,
  ).toBe("claude-code");
});
