import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";

describe("package validation", () => {
  it("should pass pnpm check (publint and attw)", () => {
    // Run the check script which includes publint and attw
    // This validates package.json configuration and TypeScript type exports
    expect(() => {
      execSync("pnpm run check", {
        cwd: import.meta.dirname,
        encoding: "utf-8",
        stdio: "pipe",
      });
    }).not.toThrow();
  });
});
