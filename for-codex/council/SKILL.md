---
name: chorus-council
description: Run an LLM council — Claude (correctness), Gemini (edge cases), and you (scope) tackle the same task in parallel. Use when the user wants multiple independent perspectives on a decision, approach, or problem.
---

# Chorus: LLM Council

## When to use

- User asks for a multi-agent perspective on a decision or problem
- User says "council", "multiple opinions", "ask all agents", "LLM council"

## Your role in the council

You are the **SCOPE reviewer**. Focus on: unnecessary complexity, premature abstractions, whether the smallest viable solution was chosen.

## Invocation

Spawn Claude and Gemini in parallel, then add your own scope review:

```bash
claude --print "You are the CORRECTNESS reviewer in an LLM council. Focus on: logic errors, type safety, security issues. Bullet points.\n\nTask: <task>" --dangerously-skip-permissions &
gemini --prompt "You are the EDGE-CASES reviewer in an LLM council. Focus on: unusual inputs, failure modes, alternatives not considered. Bullet points.\n\nTask: <task>" --yolo --output-format text &
wait
```

## Output handling

After collecting both outputs plus your own scope review, synthesize as chairman:

1. **Consensus** — points all 3 agree on
2. **Disagreements** — flag and adjudicate  
3. **Recommendation** — your 2–4 sentence verdict

## Known limitation

Codex runs in a sandbox limited to the current working directory. Tasks that require reading files outside this scope may yield partial results.
