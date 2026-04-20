---
name: chorus-second-opinion
description: >
  Quick independent second opinion from one agent on a decision or approach.
  The agent gives a direct verdict: approve, approve-with-caveats, or reject.
  Activate when the user says "second opinion", "quick check", "what does Claude think",
  "what does Codex think", "sanity check", or "independent review".
license: MIT
metadata:
  author: valpere
  version: "1.0.0"
---

# Chorus: Second Opinion

## When to use

- You've made a decision and want a quick independent sanity check
- User says "second opinion", "quick check", "what does X think", "sanity check"
- You want one specific agent's take (not a full council)

## Agent selection

| Agent | Best for |
|-------|----------|
| Claude (default) | Depth — correctness, security implications |
| Codex | Brevity — "is this over-engineered?" check |
| Cursor | Integration — does this fit existing patterns? |
| Kilo | Maintainability — naming, readability, long-term impact |

## Invocation

```bash
# Default: ask Claude
claude --print "Give a concise second opinion on the following decision or approach. Be direct: state what you agree with, what concerns you, and your overall verdict (approve / approve-with-caveats / reject).\n\n<approach>" --dangerously-skip-permissions

# Or ask Codex
codex exec "Give a concise second opinion on the following decision or approach. Be direct: state what you agree with, what concerns you, and your overall verdict (approve / approve-with-caveats / reject).\n\n<approach>"

# Or ask Cursor
agent -p --force "Give a concise second opinion on the following decision or approach. Be direct: state what you agree with, what concerns you, and your overall verdict (approve / approve-with-caveats / reject).\n\n<approach>"

# Or ask Kilo
kilo run --auto "Give a concise second opinion on the following decision or approach. Be direct: state what you agree with, what concerns you, and your overall verdict (approve / approve-with-caveats / reject).\n\n<approach>"
```

**Graceful degradation:** If the requested agent is not installed (`command -v <binary>` fails), fall back to the next available one and tell the user which agent you used instead.

## Output handling

Return the agent's output verbatim. The agent is instructed to give a verdict, so the output is self-contained.

Do not add your own commentary unless the user explicitly asks for a follow-up comparison.
