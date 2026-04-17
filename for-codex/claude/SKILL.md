---
name: chorus-claude
description: Delegate a task to Claude Code for a second opinion or alternative analysis.
---

# Chorus: Delegate to Claude

This skill delegates tasks to Claude Code when the user asks for a second opinion from Claude or wants to compare answers.

## When to use

- User explicitly asks to delegate to Claude
- User wants a second opinion from Claude
- User wants to compare Claude's answer with Codex's
- User asks "what would Claude say?" or similar

## Invocation

Run Claude Code non-interactively:

```bash
claude --print "<task>" --dangerously-skip-permissions
```

The `--print` flag runs Claude in non-interactive mode.
The `--dangerously-skip-permissions` flag is required for automated execution.

## Output handling

Return Claude's output verbatim — no paraphrasing, no summaries.
