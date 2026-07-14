---
"am-i-vibing": patch
---

Load `process-ancestry` only when opt-in process-tree detection is requested, so environment-only detection can be imported in runtimes without Node builtins.
