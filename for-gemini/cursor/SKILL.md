---
name: chorus-cursor
description: >
  Delegate a task to Cursor Agent CLI when the user wants a codebase-aware second opinion,
  asks "what would Cursor say", wants to compare with Cursor's perspective, or needs analysis
  that considers existing code patterns and project integration. Use when the user explicitly
  requests Cursor's view or wants a "second opinion from Cursor".
license: MIT
metadata:
  author: valpere
  version: "1.0.0"
---

# Chorus: Delegate to Cursor

## When to use

- User explicitly asks to delegate to Cursor
- User wants Cursor's codebase-aware perspective on a problem
- User asks "what would Cursor say?" or similar
- User wants a second opinion that considers existing code integration

## Invocation

```bash
agent -p "<task>"
```

The `-p` flag runs Cursor Agent in non-interactive mode with output to stdout.

## Output handling

Return Cursor's output **verbatim** — no paraphrasing, no summaries, no added commentary.
