---
name: chorus-council
description: Run an LLM council — Claude (correctness), Gemini (edge cases), Cursor (integration), Kilo (maintainability), and you (scope) tackle the same task in parallel. Use when the user wants multiple independent perspectives on a decision, approach, or problem.
---

# Chorus: LLM Council

## When to use

- User asks for a multi-agent perspective on a decision or problem
- User says "council", "multiple opinions", "ask all agents", "LLM council"

## Your role in the council

You are the **SCOPE reviewer**. Focus on: unnecessary complexity, premature abstractions, whether the smallest viable solution was chosen.

## Agent roles

| Agent | Focus |
|-------|-------|
| Claude | Correctness — logic errors, type safety, security issues |
| Gemini | Edge cases — unusual inputs, failure modes, alternatives |
| Cursor | Integration — codebase fit, patterns, dependency risks |
| Kilo | Maintainability — readability, naming, long-term tech debt |
| (you) | Scope — unnecessary complexity, smallest viable solution |

## Invocation

Spawn all four agents in parallel, then add your own scope review:

```bash
claude --print "You are the CORRECTNESS reviewer in an LLM council. Focus on: logic errors, type safety, off-by-one bugs, security issues. Be concise — bullet points.\n\nTask: <task>" --dangerously-skip-permissions &
CLAUDE_PID=$!

gemini --prompt "You are the EDGE-CASES reviewer in an LLM council. Focus on: unusual inputs, failure modes, alternatives not considered. Be concise — bullet points.\n\nTask: <task>" --yolo --output-format text &
GEMINI_PID=$!

agent -p --force "You are the INTEGRATION reviewer in an LLM council. Focus on: codebase fit, consistency with existing patterns, dependency implications. Be concise — bullet points.\n\nTask: <task>" &
CURSOR_PID=$!

kilo run --auto "You are the MAINTAINABILITY reviewer in an LLM council. Focus on: readability, naming clarity, long-term tech debt. Be concise — bullet points.\n\nTask: <task>" &
KILO_PID=$!

wait $CLAUDE_PID $GEMINI_PID $CURSOR_PID $KILO_PID
```

## Output handling

After collecting all four outputs plus your own scope review, synthesize as chairman:

1. **Consensus** — points all agents agree on
2. **Disagreements** — flag and adjudicate
3. **Chairman's Recommendation** — your own 2–4 sentence verdict informed by (but not just a summary of) the council

Format under `## Council Synthesis` and `## Recommendation`.

## Known limitation

Codex sandbox limits file access to the current working directory. Tasks that require reading files outside this scope may yield partial results.
