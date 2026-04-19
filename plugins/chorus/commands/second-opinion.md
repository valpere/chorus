---
description: Quick independent second opinion from one agent on a decision or approach
argument-hint: "[--agent claude|gemini|codex|cursor|kilo] <decision or approach>"
disable-model-invocation: true
allowed-tools: Bash(node:*), Bash(git:*)
---

Get a quick, independent second opinion from one agent on a decision, design choice, or approach.

Raw slash-command arguments:
`$ARGUMENTS`

**Agent selection:**
- Use `--agent gemini` (default), `--agent claude`, `--agent codex`, `--agent cursor`, or `--agent kilo`.
- Default is Gemini — fastest responses, good for quick sanity checks.
- Use `--agent claude` when you want depth and edge-case analysis.
- Use `--agent codex` when you want a terse "is this over-engineered?" check.
- Use `--agent cursor` for integration and codebase-fit questions.
- Use `--agent kilo` for naming, readability, and maintainability questions.
- If the chosen agent is not installed, the companion automatically falls back to the next available agent and tells you which one it used.

**Execution mode:**
- Default: foreground (quick — one agent only).
- If `--background` is in arguments, run background mode.
- Strip `--background` and `--wait` before passing to companion.

**Pre-flight:**
The companion checks whether the chosen agent is installed and falls back to the next available one if not. If no agents are available at all, it exits non-zero — tell the user to install at least one agent.

**Foreground execution:**
```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/companion.mjs" second-opinion $ARGUMENTS
```

**Background execution:**
```typescript
Bash({
  command: `node "$CLAUDE_PLUGIN_ROOT/scripts/companion.mjs" second-opinion $ARGUMENTS`,
  description: "Second opinion",
  run_in_background: true
})
```

**After the companion exits:**

Return the agent's output verbatim — do not add your own commentary unless the user asks.
The agent is instructed to give a verdict (approve / approve-with-caveats / reject), so the output is self-contained.
