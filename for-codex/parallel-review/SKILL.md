---
name: chorus-parallel-review
description: Parallel code review of the current git diff from multiple agents — Claude (correctness/security), Gemini (edge cases), and you (scope/simplicity). Use when the user says "parallel review", "review with all agents", or "chorus review".
---

# Chorus: Parallel Code Review

## When to use

- User wants code reviewed from multiple angles simultaneously
- User says "parallel review", "all agents review", "chorus review"

## Your role

You review for **SCOPE AND SIMPLICITY**: unnecessary complexity, changes exceeding the stated goal, simpler alternatives.

## Invocation

```bash
git diff HEAD > /tmp/chorus_diff.txt

claude --print "Review for CORRECTNESS AND SECURITY. Numbered findings.\n\n$(cat /tmp/chorus_diff.txt)" --dangerously-skip-permissions &
gemini --prompt "Review for EDGE CASES AND ROBUSTNESS. Numbered findings.\n\n$(cat /tmp/chorus_diff.txt)" --yolo --output-format text &
wait
```

## Output handling

Synthesize all three reviews:

```
## Parallel Review Summary
**Critical findings** (2+ agents): …
**Verdict**: <proceed / needs revision>
```

Review-only — do not apply patches.

## Known limitation

Codex sandbox limits file access to the current working directory. Reviews of files outside this scope will be incomplete.
