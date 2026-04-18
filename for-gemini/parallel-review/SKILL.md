---
name: chorus-parallel-review
description: >
  Parallel code review from multiple agents on the current git diff. Use when
  the user wants a thorough review from different perspectives simultaneously.
  Activate when the user says "parallel review", "review with all agents",
  "chorus review", or "multi-agent code review".
license: MIT
metadata:
  author: valpere
  version: 1.0.0
---

# Chorus: Parallel Code Review

## When to use

- User wants code reviewed from multiple angles simultaneously
- User says "parallel review", "all agents review", "chorus review"
- You want to catch issues one reviewer might miss

## Review focus per agent

| Agent | Focus |
|-------|-------|
| Claude | Correctness and security (bugs, vulnerabilities, unsafe patterns) |
| Codex | Scope and simplicity (unnecessary complexity, simpler alternatives) |
| (you) | Edge cases and robustness (missing error handling, race conditions) |

## Invocation

```bash
# Get the diff first
git diff HEAD > /tmp/chorus_diff.txt

# Spawn Claude and Codex in parallel
claude --print "Review these code changes for CORRECTNESS AND SECURITY. Focus on: bugs, logic errors, security vulnerabilities. Numbered findings.\n\n$(cat /tmp/chorus_diff.txt)" --dangerously-skip-permissions &
CLAUDE_PID=$!

codex exec "Review these code changes for SCOPE AND SIMPLICITY. Focus on: unnecessary complexity, changes exceeding the stated goal, simpler alternatives. Numbered findings.\n\n$(cat /tmp/chorus_diff.txt)" &
CODEX_PID=$!

wait $CLAUDE_PID
wait $CODEX_PID
```

Your own review (Gemini) covers **edge cases and robustness**. Produce it alongside the collected results.

## Output handling

Synthesize all three reviews into a unified report:

```
## Parallel Review Summary

**Critical findings** (flagged by 2+ agents): …

**Individual findings table:**
| Finding | Claude | Gemini | Codex |
|---------|--------|--------|-------|

## Verdict
<1–2 sentences: should changes proceed as-is or need revision?>
```

This is review-only — do not fix issues or apply patches.

## Known limitation

Codex runs in a sandbox — it can only read files in its working directory.
If the diff references files outside that scope, Codex output may be limited.
