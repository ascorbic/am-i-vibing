import { expect, test } from "vitest";
import { detectAgenticEnvironment as detect } from "../src/detector.js";
test("WorkBuddy execution marker and boundaries", () => {
  for (const env of [
    { WORKBUDDY_APPLICATION_NAME: "1" },
    { WORKBUDDY_APPLICATION_NAME: "0" },
    { WORKBUDDY_APPLICATION_NAME: "false" },
    { WORKBUDDY_APPLICATION_NAME: " " },
    { WORKBUDDY_APP_NAME: "1" },
    { WORKBUDDY_APP_NAME: "0" },
    { WORKBUDDY_APP_NAME: "false" },
    { WORKBUDDY_APP_NAME: " " },
  ])
    expect(detect({ env, checkProcesses: false }).id).toBe("workbuddy");
  for (const env of [
    {},
    {},
    { WORKBUDDY_APPLICATION_NAME: "" },
    {},
    { WORKBUDDY_APP_NAME: "" },
  ])
    expect(detect({ env, checkProcesses: false }).id).not.toBe("workbuddy");
});
