---
name: chorus-cursor
description: Delegate a task to Cursor Agent CLI for a codebase-aware second opinion or alternative analysis.
---

# Chorus: Delegate to Cursor

## When to use

- User explicitly asks to delegate to Cursor
- User wants Cursor's codebase-aware perspective
- User asks "what would Cursor say?" or similar

## Invocation

```bash
agent -p "<task>"
```

The `-p` flag runs Cursor Agent in non-interactive mode with output to stdout.

## Output handling

Return Cursor's output verbatim — no paraphrasing, no summaries.
