---
applyTo: "for-opencode/src/*.js"
---

## OpenCode MCP server review guidelines

- Every new tool in `TOOLS` must have a matching `case` in the `tools/call` switch. Missing cases cause silent failures.
- Tools with no required args (e.g. `parallel_review`) must not throw on `args = {}`. The handler checks `args = {}` as default.
- Parallel orchestration helpers (`runCouncil`, `runParallelReview`, etc.) must use `Promise.all` — never sequential awaits.
- Individual agent failures inside `runParallel` must be caught and returned as `[error: message]` text, not thrown. One failing agent must not reject the whole `Promise.all`.
- `delimit()` output format must use `═` (U+2550) separator lines and `AGENT: NAME` headers to match the companion.mjs format.
- Do not add OpenCode as a delegate in any parallel orchestration function — its stdout is not capturable (TUI limitation).
- No unused imports. The file uses only `spawn`, `spawnSync` from `child_process` and `Server`/`StdioServerTransport` from the MCP SDK.
