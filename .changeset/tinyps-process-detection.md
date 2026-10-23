---
"am-i-vibing": minor
---

Add a synchronous detection API and move process detection to tinyps.

`detectAgenticEnvironment` now returns a promise, so the process ancestry lookup can load asynchronously. Wrap existing calls in `await`, or use the new `detectAgenticEnvironmentSync` export, which detects via environment variables and custom detectors without touching the process tree. Pre-supplied `processAncestry` can be checked synchronously in either function, and implies `checkProcesses: true` unless explicitly set to `false`.

The process tree is now read with `tinyps` instead of `process-ancestry`, loaded on demand so importing the package still requires no part of Node's module graph until process checks are requested. Process checks now match on process names as well as command lines. The deprecated positional signatures `(env)` and `(env, processAncestry)` no longer work; pass an options object instead.
