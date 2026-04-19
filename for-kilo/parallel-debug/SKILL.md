---
name: chorus-parallel-debug
description: Parallel root-cause hypotheses from multiple agents for a reported bug. Use when the user says "parallel debug", "chorus debug", "multiple hypotheses", "debug with all agents", or describes a symptom and wants multiple root-cause perspectives.
---

# Chorus: Parallel Debug

## When to use

- Root cause of a bug is unclear
- User says "parallel debug", "chorus debug", "hypotheses from all agents"
- User describes a symptom and wants multiple root-cause perspectives

## Your role

You generate hypotheses focused on **naming confusion, type misuse, and readability issues that hide bugs**.

## Invocation

```bash
SYMPTOM="<symptom>"

claude --print "Root-cause hypotheses, ranked by likelihood (numbered list). Focus: application logic, state management, data flow.\n\nSymptom: $SYMPTOM" --dangerously-skip-permissions &
CLAUDE_PID=$!

gemini --prompt "Root-cause hypotheses, ranked by likelihood (numbered list). Focus: infrastructure, concurrency, external dependencies, environment.\n\nSymptom: $SYMPTOM" --yolo --output-format text &
GEMINI_PID=$!

codex exec "Root-cause hypotheses, ranked by likelihood (numbered list). Focus: edge cases in input handling, type coercion, off-by-one errors.\n\nSymptom: $SYMPTOM" &
CODEX_PID=$!

agent -p --force "Root-cause hypotheses, ranked by likelihood (numbered list). Focus: framework, library, and third-party integration issues.\n\nSymptom: $SYMPTOM" &
CURSOR_PID=$!

wait $CLAUDE_PID $GEMINI_PID $CODEX_PID $CURSOR_PID
```

**Graceful degradation:** Check each agent with `command -v <binary>` before spawning. Skip missing agents and warn the user. Proceed as long as at least 2 agents (including yourself) are available.

## Output handling

Merge all available hypothesis lists (up to four agents + your maintainability hypotheses), prioritize ones flagged by multiple agents:

```
## Hypothesis Pool (ranked)
1. … (Claude + Gemini)
2. … (Kilo)

## Investigation Plan
1. Check X first — rules out hypotheses 1 and 3
```
