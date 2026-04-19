---
description: Delegate a task to Cursor Agent CLI non-interactively
argument-hint: "[--background|--wait] <task description>"
disable-model-invocation: true
allowed-tools: Bash(node:*), Bash(git:*), AskUserQuestion
---

Delegate a task to Cursor Agent CLI and return its output verbatim.

Raw slash-command arguments:
`$ARGUMENTS`

Execution mode rules:
- If the raw arguments include `--background`, run in the background.
- If the raw arguments include `--wait`, run in the foreground.
- If neither flag is present, ask the user with two options: `Wait for results (Recommended)` or `Run in background`.
- Strip `--background` and `--wait` before passing the task to Cursor.

Pre-flight check:
- Run: `node "$CLAUDE_PLUGIN_ROOT/scripts/companion.mjs" check`
- If it exits non-zero, stop and tell the user to run `/cursor:setup`.

Execution:

Foreground mode:
- Run:
```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/companion.mjs" run "$ARGUMENTS"
```
- Return the stdout verbatim, exactly as-is.
- Do not paraphrase, summarize, or add commentary.

Background mode:
- Launch with `Bash` in the background:
```typescript
Bash({
  command: `node "$CLAUDE_PLUGIN_ROOT/scripts/companion.mjs" run "$ARGUMENTS"`,
  description: "Cursor task",
  run_in_background: true
})
```
- Tell the user: "Cursor task started in the background."
