---
"am-i-vibing": minor
---

Add env-var detection for Gemini CLI (`GEMINI_CLI=1`), OpenAI Codex (`CODEX_THREAD_ID`), and Crush (`CRUSH=1`, `AGENT=crush`, `AI_AGENT=crush`). These providers previously relied on process-tree inspection, which was the main reason `am-i-vibing` reached for the process tree at all.

Process-ancestry detection is now opt-in. Reading the process tree spawns a subprocess and is slow on Windows, so by default the library only consults environment variables. Pass `{ checkProcesses: true }` to `detectAgenticEnvironment` (or use the new `--check-processes` CLI flag) to restore the previous behaviour. Octofriend, which exposes no identifying env var, requires this flag.

The detector functions also gain an options-object signature: `detectAgenticEnvironment({ env, processAncestry, checkProcesses })`. The legacy positional signature `(env, processAncestry)` continues to work and is treated as opt-in for process checks for backwards compatibility.
