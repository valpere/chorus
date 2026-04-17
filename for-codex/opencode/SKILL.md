---
name: chorus-opencode
description: Delegate a task to OpenCode for a second opinion or alternative analysis.
---

# Chorus: Delegate to OpenCode

This skill delegates tasks to OpenCode when the user asks for a second opinion or wants to compare answers.

## When to use

- User explicitly asks to delegate to OpenCode
- User wants a second opinion from OpenCode
- User wants to compare OpenCode's answer with Codex's
- User asks "what would OpenCode say?" or similar

## Invocation

Run OpenCode non-interactively:

```bash
opencode run "<task>"
```

The `run` command executes the task in non-interactive mode.

## Output handling

Return OpenCode's output verbatim — no paraphrasing, no summaries.
