---
name: chorus-parallel-debug
description: Parallel root-cause hypotheses from multiple agents for a reported bug. Use when the user says "parallel debug", "chorus debug", "multiple hypotheses", or "debug with all agents".
---

# Chorus: Parallel Debug

## When to use

- Root cause of a bug is unclear
- User says "parallel debug", "chorus debug", "hypotheses from all agents"

## Your role

You generate hypotheses focused on **edge cases in input handling, type coercion, off-by-one errors**.

## Invocation

```bash
SYMPTOM="<symptom>"

claude --print "Root-cause hypotheses, ranked by likelihood (numbered list). Focus: application logic, state management.\n\nSymptom: $SYMPTOM" --dangerously-skip-permissions &
gemini --prompt "Root-cause hypotheses, ranked by likelihood (numbered list). Focus: infrastructure, concurrency, environment.\n\nSymptom: $SYMPTOM" --yolo --output-format text &
wait
```

## Output handling

Merge all three hypothesis lists, prioritize ones flagged by multiple agents:

```
## Hypothesis Pool (ranked)
1. … (Claude + Gemini)
2. … (Codex)

## Investigation Plan
1. Check X first — rules out hypotheses 1 and 3
```

## Known limitation

Codex sandbox limits access to the current working directory.
