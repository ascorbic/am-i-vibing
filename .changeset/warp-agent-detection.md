---
"am-i-vibing": minor
---

Detect Warp's agent via the `OZ_RUN_ID` environment variable it sets while running an agent task, and report it as an `agent` rather than a `hybrid` environment.

Previously Warp was detected from `TERM_PROGRAM=WarpTerminal`, which is set in every Warp window whether or not its agent is active. That produced false positives for people using Warp as a regular terminal (e.g. running `astro dev` by hand). Plain Warp sessions are no longer detected; only commands run under Warp's agent are.
