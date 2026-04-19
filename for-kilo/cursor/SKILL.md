---
name: chorus-cursor
description: Delegate a task to Cursor Agent CLI for an integration-focused second opinion. Use when the user asks to delegate to Cursor, wants Cursor's perspective, or says "what would Cursor say".
---

# Chorus: Delegate to Cursor

## When to use

- User explicitly asks to delegate to Cursor
- User wants Cursor's integration-focused perspective
- User wants to compare your answer with Cursor's
- User asks "what would Cursor say?" or similar

## Invocation

Run Cursor Agent non-interactively:

```bash
agent -p --force "<task>"
```

The `-p` flag runs the agent in non-interactive (print) mode.
The `--force` flag suppresses permission prompts for file access.

## Output handling

Return Cursor's output verbatim — no paraphrasing, no summaries, no added commentary.
