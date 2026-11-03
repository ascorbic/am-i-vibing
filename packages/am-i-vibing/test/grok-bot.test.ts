import { expect, test } from "vitest";
import { detectAgenticEnvironment as detect } from "../src/detector.js";
test("Grok Bot execution marker and boundaries", () => {
  for (const env of [
    { SAND_AGENT: "1" },
    { SAND_AGENT: "0" },
    { SAND_AGENT: "false" },
    { SAND_AGENT: " " },
    { CURSOR_AGENT: "1", SAND_MANIFEST_V2: "1", SAND_SUPERVISOR_ENABLED: "1" },
    { CURSOR_AGENT: "0", SAND_MANIFEST_V2: "1", SAND_SUPERVISOR_ENABLED: "1" },
    {
      CURSOR_AGENT: "false",
      SAND_MANIFEST_V2: "1",
      SAND_SUPERVISOR_ENABLED: "1",
    },
    { CURSOR_AGENT: " ", SAND_MANIFEST_V2: "1", SAND_SUPERVISOR_ENABLED: "1" },
    { CURSOR_AGENT: "1", SAND_MANIFEST_V2: "0", SAND_SUPERVISOR_ENABLED: "1" },
    {
      CURSOR_AGENT: "1",
      SAND_MANIFEST_V2: "false",
      SAND_SUPERVISOR_ENABLED: "1",
    },
    { CURSOR_AGENT: "1", SAND_MANIFEST_V2: " ", SAND_SUPERVISOR_ENABLED: "1" },
    { CURSOR_AGENT: "1", SAND_MANIFEST_V2: "1", SAND_SUPERVISOR_ENABLED: "0" },
    {
      CURSOR_AGENT: "1",
      SAND_MANIFEST_V2: "1",
      SAND_SUPERVISOR_ENABLED: "false",
    },
    { CURSOR_AGENT: "1", SAND_MANIFEST_V2: "1", SAND_SUPERVISOR_ENABLED: " " },
  ])
    expect(detect({ env, checkProcesses: false }).id).toBe("grok-bot");
  for (const env of [
    {},
    {},
    { SAND_AGENT: "" },
    { SAND_MANIFEST_V2: "1", SAND_SUPERVISOR_ENABLED: "1" },
    { CURSOR_AGENT: "", SAND_MANIFEST_V2: "1", SAND_SUPERVISOR_ENABLED: "1" },
    { CURSOR_AGENT: "1", SAND_SUPERVISOR_ENABLED: "1" },
    { CURSOR_AGENT: "1", SAND_MANIFEST_V2: "", SAND_SUPERVISOR_ENABLED: "1" },
    { CURSOR_AGENT: "1", SAND_MANIFEST_V2: "1" },
    { CURSOR_AGENT: "1", SAND_MANIFEST_V2: "1", SAND_SUPERVISOR_ENABLED: "" },
  ])
    expect(detect({ env, checkProcesses: false }).id).not.toBe("grok-bot");
});
