import { expect, test } from "vitest";
import { detectAgenticEnvironment as detect } from "../src/detector.js";
test("QwenWork execution marker and boundaries", () => {
  for (const env of [
    { QODER_WORK_INTEGRATION_PRODUCT: "1" },
    { QODER_WORK_INTEGRATION_PRODUCT: "0" },
    { QODER_WORK_INTEGRATION_PRODUCT: "false" },
    { QODER_WORK_INTEGRATION_PRODUCT: " " },
  ])
    expect(detect({ env, checkProcesses: false }).id).toBe("qwenwork");
  for (const env of [{}, {}, { QODER_WORK_INTEGRATION_PRODUCT: "" }])
    expect(detect({ env, checkProcesses: false }).id).not.toBe("qwenwork");
});
