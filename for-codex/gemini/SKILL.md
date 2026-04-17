---
name: chorus-gemini
description: Delegate a task to Gemini CLI for a second opinion or alternative analysis.
---

# Chorus: Delegate to Gemini

This skill delegates tasks to Gemini CLI when the user asks for a second opinion from Gemini or wants to compare answers.

## When to use

- User explicitly asks to delegate to Gemini
- User wants a second opinion from Gemini
- User wants to compare Gemini's answer with Codex's
- User asks "what would Gemini say?" or similar

## Invocation

Run Gemini CLI non-interactively:

```bash
gemini --prompt "<task>" --yolo --output-format text
```

The `--yolo` flag auto-approves all tool calls for non-interactive use.
The `--output-format text` returns plain text output.

## Output handling

Return Gemini's output verbatim — no paraphrasing, no summaries.
