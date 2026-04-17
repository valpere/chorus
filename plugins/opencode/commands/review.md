---
description: Run an OpenCode code review on the current git working tree
argument-hint: "[--wait|--background]"
disable-model-invocation: true
allowed-tools: Read, Glob, Grep, Bash(node:*), Bash(git:*), AskUserQuestion
---

Run an OpenCode code review against the current git state and return its output verbatim.

Raw slash-command arguments:
`$ARGUMENTS`

Core constraint:
- This command is review-only.
- Do not fix issues, apply patches, or suggest that you are about to make changes.
- Your only job is to run the review and return OpenCode's output verbatim to the user.

Execution mode rules:
- Default to background mode since reviews can be slow.
- If the raw arguments include `--wait`, run in the foreground.
- If the raw arguments include `--background`, run in the background.
- Strip `--background` and `--wait` before passing to the companion.

Pre-flight check:
- Run: `node "$CLAUDE_PLUGIN_ROOT/scripts/companion.mjs" check`
- If it exits non-zero, stop and tell the user to run `/opencode:setup`.

Git context preparation:
- Get git diff summary:
```bash
git diff --stat HEAD
git diff HEAD
```
- Pass both outputs to the review prompt.

Execution:

Foreground mode:
- Run:
```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/companion.mjs" review "$ARGUMENTS"
```
- Return the stdout verbatim, exactly as-is.
- Do not paraphrase, summarize, or add commentary.

Background mode:
- Launch the review with `Bash` in the background:
```typescript
Bash({
  command: `node "$CLAUDE_PLUGIN_ROOT/scripts/companion.mjs" review "$ARGUMENTS"`,
  description: "OpenCode review",
  run_in_background: true
})
```
- Tell the user: "OpenCode review started in the background."
