---
name: chorus-codex
description: Delegate a task to Codex when the user asks to get a second opinion from Codex, compare answers between Gemini and Codex, or specifically requests Codex's perspective on a problem. Use this skill when the user wants to leverage Codex's analysis alongside Gemini's.
license: MIT
metadata:
  author: valpere
  version: "1.0.0"
---

# Chorus: Delegate to Codex

This skill delegates tasks to Codex for a second opinion or alternative analysis.

## When to use

- User explicitly asks to delegate to Codex
- User wants a second opinion from Codex
- User wants to compare Codex's answer with Gemini's
- User asks "what would Codex say?" or similar

## Invocation

Run Codex non-interactively with the task:

```bash
codex exec "<task>"
```

The `exec` command executes the task in non-interactive mode.

## Output handling

Return Codex's output **verbatim** — no paraphrasing, no summaries, no added commentary.
