---
name: chorus-kilo
description: >
  Delegate a task to Kilo Code CLI when the user wants a maintainability-focused second opinion,
  asks "what would Kilo say", wants to compare with Kilo's perspective, or needs analysis
  focused on code quality, readability, and long-term maintainability. Use when the user
  explicitly requests Kilo's view or wants "Kilo's take" on a decision.
license: MIT
metadata:
  author: valpere
  version: "1.0.0"
---

# Chorus: Delegate to Kilo

## When to use

- User explicitly asks to delegate to Kilo
- User wants Kilo's maintainability-focused perspective on a problem
- User asks "what would Kilo say?" or similar
- User wants a second opinion focused on code quality and readability

## Invocation

```bash
kilo run --auto "<task>"
```

The `--auto` flag runs Kilo in non-interactive mode, auto-approving all permission prompts.

## Output handling

Return Kilo's output **verbatim** — no paraphrasing, no summaries, no added commentary.
