---
name: chorus-opencode
description: Delegate a task to OpenCode for a second opinion or alternative analysis. Use when the user asks to delegate to OpenCode, wants OpenCode's perspective, or says "what would OpenCode say".
---

# Chorus: Delegate to OpenCode

## When to use

- User explicitly asks to delegate to OpenCode
- User wants a second opinion from OpenCode
- User wants to compare your answer with OpenCode's
- User asks "what would OpenCode say?" or similar

## Invocation

```bash
opencode run "<task>"
```

> **Note:** `opencode run` is a TUI — it writes output to the terminal but does not expose stdout for programmatic capture. OpenCode will open in your terminal; read the output there. If you need capturable output, use another agent (e.g., Claude) as a proxy instead.

## Output handling

OpenCode output is visible in the terminal only. Read it there and summarize or relay relevant findings to the user.
