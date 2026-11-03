import { expect, test } from "vitest";
import { detectAgenticEnvironment as detect } from "../src/detector.js";
test("Devin execution marker and boundaries", () => {
  for (const env of [
    { DEVIN_DIR: "1" },
    { DEVIN_DIR: "0" },
    { DEVIN_DIR: "false" },
    { DEVIN_DIR: " " },
    { DEVIN_DISABLE_HISTEXPAND: "1" },
    { DEVIN_DISABLE_HISTEXPAND: "0" },
    { DEVIN_DISABLE_HISTEXPAND: "false" },
    { DEVIN_DISABLE_HISTEXPAND: " " },
  ])
    expect(detect({ env, checkProcesses: false }).id).toBe("devin");
  for (const env of [
    {},
    {},
    { DEVIN_DIR: "" },
    {},
    { DEVIN_DISABLE_HISTEXPAND: "" },
  ])
    expect(detect({ env, checkProcesses: false }).id).not.toBe("devin");
  expect(
    detect({ env: { DEVIN_DIR: "1", CLAUDECODE: "1" }, checkProcesses: false })
      .id,
  ).toBe("claude-code");
});
