# Junie detection evidence

Investigated while maintaining [Detect Agent](https://github.com/ai-shifu/detect-agent), a community specification with shared synthetic cases. [Pinned rule and evidence record](https://github.com/ai-shifu/detect-agent/blob/c06e732d17d02f74fd9b452f20c4fa17a9f95a03/detect-agent.md).

Adopted signal: non-empty `JUNIE_SHIM_PATH`.

[Published producer path](https://github.com/JetBrains/junie/blob/cdbfbcf6a9f17951c94dd2902619dffc37f5881f/templates/junie.shim.sh#L684-L700). The CLI launcher exports JUNIE_SHIM_PATH. JUNIE_DATA can be configured globally and is not used by this new detector. Execution without the shim is outside this rule.

Ordinary markers require a non-empty string without trimming or boolean parsing; exact comparisons and conjunctions are preserved. The entry order preserves more specific compatibility markers and places inherited host markers after native coding-agent markers.

The test inputs are synthetic. No fresh live vendor session was run for this contribution. Reported or static observations do not establish every build, interface or operating system. Markers can be inherited or set manually and do not authenticate the immediate caller. The normal detection result adds no marker values, credentials, user paths or session identifiers. Existing diagnostic APIs retain their upstream behavior. There is no runtime dependency on Detect Agent or new process-tree probe.
