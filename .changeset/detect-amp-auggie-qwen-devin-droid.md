---
"am-i-vibing": minor
---

Add detection for five more agentic coding tools.

Env-var detection (works by default):

- **Sourcegraph Amp** (`AMP_CURRENT_THREAD_ID`, or `AGENT=amp`)
- **Auggie** from Augment Code (`AUGMENT_AGENT=1`)
- **Qwen Code** (`QWEN_CODE=1`)

Process-ancestry detection (opt-in via `checkProcesses: true`):

- **Devin** for Terminal (Cognition) -- `devin` binary in process tree
- **Factory Droid** -- `droid` binary in process tree

Devin and Droid only inject identifying env vars inside hook commands, not on regular shell tool exec, so process ancestry is the only available signal.
