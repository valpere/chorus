---
name: chorus-codex
description: Delegate a task to Codex for a second opinion or alternative analysis. Use when the user asks to delegate to Codex, wants Codex's scope-focused perspective, or says "what would Codex say".
---

# Chorus: Delegate to Codex

## When to use

- User explicitly asks to delegate to Codex
- User wants a second opinion from Codex
- User wants to compare your answer with Codex's
- User asks "what would Codex say?" or similar

## Invocation

Run Codex non-interactively:

```bash
codex exec "<task>"
```

## Output handling

Return Codex's output verbatim — no paraphrasing, no summaries, no added commentary.

## Known limitation

Codex runs in a sandbox limited to the current working directory. Tasks requiring files outside that scope may yield incomplete results.
