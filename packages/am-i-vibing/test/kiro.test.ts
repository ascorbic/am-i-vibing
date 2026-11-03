import { expect, test } from "vitest";
import { detectAgenticEnvironment as detect } from "../src/detector.js";
test("Kiro execution marker and boundaries", () => {
  for (const env of [
    { AGENT_CONTEXT_OUT: "1" },
    { AGENT_CONTEXT_OUT: "0" },
    { AGENT_CONTEXT_OUT: "false" },
    { AGENT_CONTEXT_OUT: " " },
  ])
    expect(detect({ env, checkProcesses: false }).id).toBe("kiro");
  for (const env of [{}, {}, { AGENT_CONTEXT_OUT: "" }])
    expect(detect({ env, checkProcesses: false }).id).not.toBe("kiro");
});
