---
name: chorus-council
description: Run an LLM council — four agents tackle the same task with different roles and you synthesize as chairman. Use when the user says "council", "multiple opinions", "ask all agents", "LLM council", or "multi-agent review".
---

# Chorus: LLM Council

## When to use

- User asks for a multi-agent perspective on a decision, approach, or problem
- User says "council", "get multiple opinions", "ask all agents", or similar
- You want independent validation from agents with different strengths

## Your role in the council

You are the **MAINTAINABILITY reviewer**. Focus on: readability, naming clarity, long-term tech debt.

## Agent roles

| Agent | Focus |
|-------|-------|
| Claude | Correctness — logic errors, type safety, security issues |
| Gemini | Edge cases — unusual inputs, failure modes, alternatives |
| Codex | Scope — unnecessary complexity, smallest viable solution |
| Cursor | Integration — codebase fit, patterns, dependency risks |
| (you) | Maintainability — readability, naming, long-term tech debt |

## Invocation

Spawn all four agents in parallel, then add your own maintainability review:

```bash
claude --print "You are the CORRECTNESS reviewer in an LLM council. Focus on: logic errors, type safety, off-by-one bugs, security issues. Be concise — bullet points.\n\nTask: <task>" --dangerously-skip-permissions &
CLAUDE_PID=$!

gemini --prompt "You are the EDGE-CASES reviewer in an LLM council. Focus on: unusual inputs, failure modes, alternatives not considered. Be concise — bullet points.\n\nTask: <task>" --yolo --output-format text &
GEMINI_PID=$!

codex exec "You are the SCOPE reviewer in an LLM council. Focus on: unnecessary complexity, premature abstractions, smallest viable solution. Be concise — bullet points.\n\nTask: <task>" &
CODEX_PID=$!

agent -p --force "You are the INTEGRATION reviewer in an LLM council. Focus on: codebase fit, consistency with existing patterns, dependency implications. Be concise — bullet points.\n\nTask: <task>" &
CURSOR_PID=$!

wait $CLAUDE_PID $GEMINI_PID $CODEX_PID $CURSOR_PID
```

**Graceful degradation:** Check each agent with `command -v <binary>` before spawning. Skip missing agents and warn the user. Proceed as long as at least 2 agents (including yourself) are available.

## Output handling

After collecting outputs (fewer if some agents were skipped) plus your own maintainability review, synthesize as chairman:

1. **Consensus** — points multiple agents agree on
2. **Disagreements** — flag and adjudicate
3. **Chairman's Recommendation** — your own 2–4 sentence verdict informed by (but not just a summary of) the council

Format under `## Council Synthesis` and `## Recommendation`.
