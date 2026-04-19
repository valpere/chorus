---
name: chorus-kilo
description: Delegate a task to Kilo Code CLI for a maintainability-focused second opinion or alternative analysis.
---

# Chorus: Delegate to Kilo

## When to use

- User explicitly asks to delegate to Kilo
- User wants Kilo's maintainability-focused perspective
- User asks "what would Kilo say?" or similar

## Invocation

```bash
kilo run --auto "<task>"
```

The `--auto` flag runs Kilo in non-interactive mode, auto-approving all permission prompts.

## Output handling

Return Kilo's output verbatim — no paraphrasing, no summaries.
