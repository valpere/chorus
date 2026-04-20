---
applyTo: "plugins/*/scripts/*.mjs"
---

## Companion script review guidelines

- `spawn` must use `stdio: 'pipe'` when collecting output for delimited printing. Using `stdio: 'inherit'` is correct only for pass-through single-agent delegation (existing `run`/`review` commands).
- `spawnSync` is allowed only for preflight version checks (`--version`). All actual agent invocations must use async `spawn`.
- Each `runAgent` / parallel orchestration call must handle the `error` event on the child process to resolve gracefully — never let an unhandled error abort sibling agent calls.
- Role prompts prepended to tasks must be clearly labelled (e.g. `You are the CORRECTNESS reviewer`) so the agent understands its council role without ambiguity.
- `stripFlags` must remove `--background`, `--wait`, `--json`, and `--agent`/`--agent=*` before passing the task string to CLIs.
- `check-all` subcommand must check all five target CLIs (`claude`, `gemini`, `codex`, `cursor`, `kilo`) and print which ones are missing with a reference to the appropriate `/setup` command. OpenCode is excluded — its TUI stdout is not capturable.
- `companion.mjs` is a dual-purpose module: it exports helpers (`stripFlags`, `checkCli`, `filterAvailable`, `runAgent`, `printDelimited`, `printJSON`, `requireAvailable`, `REGISTRY`) for tests, and runs the CLI dispatcher when `import.meta.url === \`file://\${process.argv[1]}\``. Tests live in `plugins/chorus/scripts/tests/` and run with `npm test`.
