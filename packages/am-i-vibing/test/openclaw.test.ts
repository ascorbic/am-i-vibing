import { expect, test } from "vitest";
import { detectAgenticEnvironment as detect } from "../src/detector.js";
test("OpenClaw execution marker and boundaries", () => {
  for (const env of [
    { OPENCLAW_SHELL: "1" },
    { OPENCLAW_SHELL: "0" },
    { OPENCLAW_SHELL: "false" },
    { OPENCLAW_SHELL: " " },
  ])
    expect(detect({ env, checkProcesses: false }).id).toBe("openclaw");
  for (const env of [{}, {}, { OPENCLAW_SHELL: "" }])
    expect(detect({ env, checkProcesses: false }).id).not.toBe("openclaw");
});
