# Cline detection evidence

Investigated while maintaining [Detect Agent](https://github.com/ai-shifu/detect-agent), a community specification with shared synthetic cases. [Pinned rule and evidence record](https://github.com/ai-shifu/detect-agent/blob/c06e732d17d02f74fd9b452f20c4fa17a9f95a03/detect-agent.md).

Adopted signal: non-empty `CLINE_ACTIVE` OR non-empty `CLINE_WRAPPER_PATH`.

[Published producer path](https://github.com/cline/cline/blob/5b454165353ac1edc9a7db0ff416739044985908/apps/cli/bin/cline#L19-L24). The npm CLI wrapper sets CLINE_WRAPPER_PATH and propagates it to the child CLI. CLINE_ACTIVE is the editor-terminal alternative. Credentials and data directories are not execution evidence.

Ordinary markers require a non-empty string without trimming or boolean parsing; exact comparisons and conjunctions are preserved. The entry order preserves more specific compatibility markers and places inherited host markers after native coding-agent markers.

The test inputs are synthetic. No fresh live vendor session was run for this contribution. Reported or static observations do not establish every build, interface or operating system. Markers can be inherited or set manually and do not authenticate the immediate caller. The normal detection result adds no marker values, credentials, user paths or session identifiers. Existing diagnostic APIs retain their upstream behavior. There is no runtime dependency on Detect Agent or new process-tree probe.
