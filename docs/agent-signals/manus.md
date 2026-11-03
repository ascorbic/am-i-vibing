# Manus detection evidence

Investigated while maintaining [Detect Agent](https://github.com/ai-shifu/detect-agent), a community specification with shared synthetic cases. [Pinned rule and evidence record](https://github.com/ai-shifu/detect-agent/blob/c06e732d17d02f74fd9b452f20c4fa17a9f95a03/detect-agent.md).

Adopted signal: non-empty `MANUS_ADDON_RUNTIME_SPEC_PATH` OR non-empty `MANUS_ADDON_RUNTIME_SPECS_REVISION`.

User-reported command-shell observation on 2026-10-16. Only the two add-on runtime descriptor names are adopted; general configuration flags do not satisfy this rule.

Ordinary markers require a non-empty string without trimming or boolean parsing; exact comparisons and conjunctions are preserved. The entry order preserves more specific compatibility markers and places inherited host markers after native coding-agent markers.

The test inputs are synthetic. No fresh live vendor session was run for this contribution. Reported or static observations do not establish every build, interface or operating system. Markers can be inherited or set manually and do not authenticate the immediate caller. The normal detection result adds no marker values, credentials, user paths or session identifiers. Existing diagnostic APIs retain their upstream behavior. There is no runtime dependency on Detect Agent or new process-tree probe.

[Official product identity](https://www.manus.im/about) establishes the product name, not an environment-variable contract.
