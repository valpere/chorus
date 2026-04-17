---
name: chorus-claude
description: Delegate a task to Claude Code when the user asks to get a second opinion from Claude, compare answers between Gemini and Claude, or specifically requests Claude's perspective on a problem. Use this skill when the user wants to leverage Claude's analysis alongside Gemini's.
license: MIT
metadata:
  author: valpere
  version: "1.0.0"
---

# Chorus: Delegate to Claude

This skill delegates tasks to Claude Code for a second opinion or alternative analysis.

## When to use

- User explicitly asks to delegate to Claude
- User wants a second opinion from Claude
- User wants to compare Claude's answer with Gemini's
- User asks "what would Claude say?" or similar

## Invocation

Run Claude Code non-interactively with the task:

```bash
claude --print "<task>" --dangerously-skip-permissions
```

The `--print` flag runs Claude in non-interactive mode.
The `--dangerously-skip-permissions` flag is required for automated execution (runs in sandboxed delegated context).

## Output handling

Return Claude's output **verbatim** — no paraphrasing, no summaries, no added commentary.
