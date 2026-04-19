---
name: chorus-second-opinion
description: Quick independent second opinion from one agent on a decision or approach. Use when the user says "second opinion", "sanity check", "quick check", or "what does X think about this".
---

# Chorus: Second Opinion

## When to use

- Quick sanity check on a decision or approach
- User says "second opinion", "sanity check", "what does Claude/Gemini/Codex/Cursor think"

## Invocation

Default: ask Claude (depth — correctness, edge cases). Override with the agent the user names.

```bash
# Ask Claude (default)
claude --print "Give a concise second opinion. Be direct: agree / concerns / verdict (approve / approve-with-caveats / reject).\n\n<approach>" --dangerously-skip-permissions

# Ask Gemini
gemini --prompt "Give a concise second opinion. Be direct: agree / concerns / verdict (approve / approve-with-caveats / reject).\n\n<approach>" --yolo --output-format text

# Ask Codex
codex exec "Give a concise second opinion. Be direct: agree / concerns / verdict (approve / approve-with-caveats / reject).\n\n<approach>"

# Ask Cursor
agent -p --force "Give a concise second opinion. Be direct: agree / concerns / verdict (approve / approve-with-caveats / reject).\n\n<approach>"
```

**Graceful degradation:** If the requested agent is not installed (`command -v <binary>` fails), fall back to the next available one and tell the user which agent you used instead.

## Output handling

Return the agent's output verbatim — no additional commentary needed. The agent's verdict is self-contained.
