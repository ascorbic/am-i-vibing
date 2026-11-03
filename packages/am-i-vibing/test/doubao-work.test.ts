import { expect, test } from "vitest";
import { detectAgenticEnvironment as detect } from "../src/detector.js";
test("Doubao Work execution marker and boundaries", () => {
  for (const env of [
    { DOUBAO_OFFICE_AGENT_NAME: "1" },
    { DOUBAO_OFFICE_AGENT_NAME: "0" },
    { DOUBAO_OFFICE_AGENT_NAME: "false" },
    { DOUBAO_OFFICE_AGENT_NAME: " " },
  ])
    expect(detect({ env, checkProcesses: false }).id).toBe("doubao-work");
  for (const env of [{}, {}, { DOUBAO_OFFICE_AGENT_NAME: "" }])
    expect(detect({ env, checkProcesses: false }).id).not.toBe("doubao-work");
});
