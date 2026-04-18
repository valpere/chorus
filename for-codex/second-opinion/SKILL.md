---
name: chorus-second-opinion
description: Quick independent second opinion from one agent on a decision or approach. The agent gives a verdict — approve, approve-with-caveats, or reject. Use when the user says "second opinion", "sanity check", "quick check", or "what does X think".
---

# Chorus: Second Opinion

## When to use

- Quick sanity check on a decision or approach
- User says "second opinion", "sanity check", "what does Claude/Gemini think"

## Invocation

```bash
# Ask Claude (depth — correctness, edge cases)
claude --print "Give a concise second opinion. Be direct: agree / concerns / verdict (approve / approve-with-caveats / reject).\n\n<approach>" --dangerously-skip-permissions

# Or ask Gemini (breadth — alternatives, long-context)
gemini --prompt "Give a concise second opinion. Be direct: agree / concerns / verdict (approve / approve-with-caveats / reject).\n\n<approach>" --yolo --output-format text
```

## Output handling

Return the agent's output verbatim — no additional commentary needed. The agent's verdict is self-contained.
