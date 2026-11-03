import { expect, test } from "vitest";
import { detectAgenticEnvironment as detect } from "../src/detector.js";
test("Goose execution marker and boundaries", () => {
  for (const env of [
    { GOOSE_TERMINAL: "1" },
    { GOOSE_TERMINAL: "0" },
    { GOOSE_TERMINAL: "false" },
    { GOOSE_TERMINAL: " " },
  ])
    expect(detect({ env, checkProcesses: false }).id).toBe("goose");
  for (const env of [{}, {}, { GOOSE_TERMINAL: "" }])
    expect(detect({ env, checkProcesses: false }).id).not.toBe("goose");
});
