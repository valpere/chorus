---
name: chorus-opencode
description: Delegate a task to OpenCode when the user asks to get a second opinion from OpenCode, compare answers between Gemini and OpenCode, or specifically requests OpenCode's perspective on a problem. Use this skill when the user wants to leverage OpenCode's analysis alongside Gemini's.
license: MIT
metadata:
  author: valpere
  version: "1.0.0"
---

# Chorus: Delegate to OpenCode

This skill delegates tasks to OpenCode for a second opinion or alternative analysis.

## When to use

- User explicitly asks to delegate to OpenCode
- User wants a second opinion from OpenCode
- User wants to compare OpenCode's answer with Gemini's
- User asks "what would OpenCode say?" or similar

## Invocation

Run OpenCode non-interactively with the task:

```bash
opencode run "<task>"
```

The `run` command executes the task in non-interactive mode.

## Output handling

Return OpenCode's output **verbatim** — no paraphrasing, no summaries, no added commentary.
