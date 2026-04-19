---
name: chorus-parallel-debug
description: >
  Parallel root-cause hypothesis generation from multiple agents. Use when
  debugging a hard-to-reproduce bug and you want hypotheses from different
  perspectives simultaneously. Activate when the user says "parallel debug",
  "chorus debug", "debug with all agents", or "multiple hypotheses".
license: MIT
metadata:
  author: valpere
  version: 1.0.0
---

# Chorus: Parallel Debug

## When to use

- A bug is hard to reproduce or the root cause is unclear
- You want hypotheses from multiple independent perspectives
- User says "parallel debug", "chorus debug", "get hypotheses from all agents"

## Hypothesis focus per agent

| Agent | Focus |
|-------|-------|
| Claude | Application logic, state management, data flow |
| Codex | Edge cases in input handling, type coercion, off-by-one errors |
| Cursor | Framework, library, and third-party integration issues |
| Kilo | Naming confusion, type misuse, readability issues that hide bugs |
| (you) | Infrastructure, concurrency, external dependencies, environment |

## Invocation

```bash
SYMPTOM="<symptom description>"

claude --print "A software bug has been reported. Generate a ranked list of hypotheses for the root cause. Focus area: application logic, state management, data flow. Format: numbered list, most likely first, one sentence per hypothesis.\n\nSymptom: $SYMPTOM" --dangerously-skip-permissions &
CLAUDE_PID=$!

codex exec "A software bug has been reported. Generate a ranked list of hypotheses for the root cause. Focus area: edge cases in input handling, type coercion, off-by-one errors. Format: numbered list, most likely first.\n\nSymptom: $SYMPTOM" &
CODEX_PID=$!

agent -p --force "A software bug has been reported. Generate a ranked list of hypotheses for the root cause. Focus area: framework, library, and third-party integration issues. Format: numbered list, most likely first.\n\nSymptom: $SYMPTOM" &
CURSOR_PID=$!

kilo run --auto "A software bug has been reported. Generate a ranked list of hypotheses for the root cause. Focus area: naming confusion, type misuse, readability issues that hide bugs. Format: numbered list, most likely first.\n\nSymptom: $SYMPTOM" &
KILO_PID=$!

wait $CLAUDE_PID $CODEX_PID $CURSOR_PID $KILO_PID
```

Your own hypotheses (Gemini) cover **infrastructure and environment**. Produce them alongside the collected results.

**Graceful degradation:** Check each agent with `command -v <binary>` before spawning. Skip missing agents and warn the user. Proceed as long as at least 2 agents (including yourself) are available.

## Output handling

Synthesize into a prioritized investigation plan:

```
## Hypothesis Pool

| # | Hypothesis | Agent(s) | Likelihood |
|---|-----------|----------|------------|
| 1 | … | Claude + Gemini | High |
| 2 | … | Codex | Medium |

## Investigation Plan

1. Check X first (quick, rules out hypotheses 1 and 3)
2. …

## Most Likely Root Cause

<1–2 sentences based on aggregate council input.>
```

Surface hypotheses flagged by multiple agents first.
