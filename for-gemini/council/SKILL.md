---
name: chorus-council
description: >
  Run an LLM council from Gemini CLI. Use when you want multiple AI agents to
  tackle the same task with different roles and then synthesize the results.
  Activate when the user says "council", "run a council on", "get multiple opinions",
  "ask all agents", "LLM council", or "multi-agent review".
license: MIT
metadata:
  author: valpere
  version: 1.0.0
---

# Chorus: LLM Council

## When to use

- User asks for a multi-agent perspective on a decision, approach, or problem
- User says "council", "get multiple opinions", "ask all agents", or similar
- You want independent validation from agents with different strengths

## Agent roles

| Agent | Focus |
|-------|-------|
| Claude | Correctness — logic errors, type safety, security issues |
| Codex | Scope — unnecessary complexity, smallest viable solution |
| Cursor | Integration — codebase fit, patterns, dependency risks |
| Kilo | Maintainability — readability, naming, long-term tech debt |
| (you) | Edge cases — unusual inputs, failure modes, alternatives |

## Invocation

Run all four agents **in parallel** using background bash tasks, then collect and synthesize:

```bash
# Step 1: spawn all four in parallel
claude --print "You are the CORRECTNESS reviewer in an LLM council. Focus on: logic errors, type safety, off-by-one bugs, security issues. Be concise — bullet points.\n\nTask: <task>" --dangerously-skip-permissions &
CLAUDE_PID=$!

codex exec "You are the SCOPE reviewer in an LLM council. Focus on: unnecessary complexity, premature abstractions, smallest viable solution. Be concise — bullet points.\n\nTask: <task>" &
CODEX_PID=$!

agent -p --force "You are the INTEGRATION reviewer in an LLM council. Focus on: codebase fit, consistency with existing patterns, dependency implications. Be concise — bullet points.\n\nTask: <task>" &
CURSOR_PID=$!

kilo run --auto "You are the MAINTAINABILITY reviewer in an LLM council. Focus on: readability, naming clarity, long-term tech debt. Be concise — bullet points.\n\nTask: <task>" &
KILO_PID=$!

# Step 2: wait for all
wait $CLAUDE_PID $CODEX_PID $CURSOR_PID $KILO_PID
```

Your own response (Gemini) serves as the **edge-cases** perspective. Run it after collecting the others.

## Output handling

After all five outputs are collected, synthesize as chairman:

1. **Consensus** — points all agents agree on
2. **Disagreements** — flag and adjudicate
3. **Chairman's Recommendation** — your own 2–4 sentence verdict informed by (but not just a summary of) the council

Format the synthesis under `## Council Synthesis` and `## Recommendation`.
