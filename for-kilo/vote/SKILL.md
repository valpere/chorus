---
name: chorus-vote
description: >
  Put a yes/no proposition to five agents and tally YES / NO / ABSTAIN votes.
  Use when the user says "vote on", "should we", "poll the agents", "take a vote",
  or wants a decision signal rather than a council discussion.
---

# Chorus: Parallel Vote

## When to use

- User wants a decision signal: "should we adopt X?", "vote on whether we should Y"
- User says "vote", "take a vote", "poll the agents", or "yes/no from all agents"
- You want a quick consensus check before committing to an approach
- Use the council skill instead when you want reasoning and trade-offs

## Your role

You are the **MAINTAINABILITY voter**. Your vote should reflect whether the proposition leads to readable, well-named, maintainable code or introduces long-term tech debt. Vote YES if it improves or preserves maintainability, NO if it creates debt, ABSTAIN if it is neutral.

## Invocation

Spawn four agents in parallel, then cast your own vote:

```bash
# Step 1: spawn four agents in parallel
claude --print "Vote on the following proposition. Reply with a single line starting with YES, NO, or ABSTAIN (uppercase), followed by one sentence of rationale. No other text.\n\nProposition: <proposition>" --dangerously-skip-permissions &
CLAUDE_PID=$!

gemini --prompt "Vote on the following proposition. Reply with a single line starting with YES, NO, or ABSTAIN (uppercase), followed by one sentence of rationale. No other text.\n\nProposition: <proposition>" --yolo --output-format text &
GEMINI_PID=$!

codex exec "Vote on the following proposition. Reply with a single line starting with YES, NO, or ABSTAIN (uppercase), followed by one sentence of rationale. No other text.\n\nProposition: <proposition>" &
CODEX_PID=$!

agent -p --force "Vote on the following proposition. Reply with a single line starting with YES, NO, or ABSTAIN (uppercase), followed by one sentence of rationale. No other text.\n\nProposition: <proposition>" &
CURSOR_PID=$!

# Step 2: wait for all
wait $CLAUDE_PID $GEMINI_PID $CODEX_PID $CURSOR_PID
```

**Graceful degradation:** Check each agent with `command -v <binary>` before spawning. Skip missing agents and warn the user. Proceed as long as at least 2 agents (including yourself) are available.

## Casting your vote

After collecting the other agents' responses, cast your own vote:

```
YES|NO|ABSTAIN — one sentence rationale from maintainability perspective.
```

## Output format

```
## Vote Tally

| Vote    | Count |
|---------|-------|
| YES     | N     |
| NO      | N     |
| ABSTAIN | N     |

## Per-Agent Rationale

**Claude:** YES — ...
**Gemini:** NO — ...
**Codex:** ABSTAIN — ...
**Cursor:** YES — ...
**(you):** YES — ...
```

## Output handling

Return the vote tally and per-agent rationales in the format above verbatim.

Do not synthesize, reconcile, or adjudicate the votes unless the user explicitly asks for analysis or a recommendation.
