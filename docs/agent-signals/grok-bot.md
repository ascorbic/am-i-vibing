# Grok Bot detection evidence

Investigated while maintaining [Detect Agent](https://github.com/ai-shifu/detect-agent), a community specification with shared synthetic cases. [Pinned rule and evidence record](https://github.com/ai-shifu/detect-agent/blob/c06e732d17d02f74fd9b452f20c4fa17a9f95a03/detect-agent.md).

Adopted signal: non-empty `SAND_AGENT` OR (non-empty `CURSOR_AGENT` AND non-empty `SAND_MANIFEST_V2` AND non-empty `SAND_SUPERVISOR_ENABLED`).

Local SAND_AGENT comes from static inspection of Grok Bot 0.71.2 macOS. The cloud alternative is a user-reported shell observation (2026-10-16) and requires all three markers. The Sand flags alone are not product identity. Grok Bot is separate from Grok Build.

Ordinary markers require a non-empty string without trimming or boolean parsing; exact comparisons and conjunctions are preserved. The entry order preserves more specific compatibility markers and places inherited host markers after native coding-agent markers.

The test inputs are synthetic. No fresh live vendor session was run for this contribution. Reported or static observations do not establish every build, interface or operating system. Markers can be inherited or set manually and do not authenticate the immediate caller. The normal detection result adds no marker values, credentials, user paths or session identifiers. Existing diagnostic APIs retain their upstream behavior. There is no runtime dependency on Detect Agent or new process-tree probe.

[Official product identity](https://cursor.com/docs/grok-bot) establishes the product name, not an environment-variable contract.
