---
description: Parallel debugging — five agents propose root-cause hypotheses for a symptom
argument-hint: "[--wait|--background] <symptom description>"
disable-model-invocation: true
allowed-tools: Bash(node:*), Bash(git:*)
---

Generate parallel root-cause hypotheses from five agents and synthesize a ranked investigation plan.

Raw slash-command arguments:
`$ARGUMENTS`

**Debug focus per agent:**
- Claude — application logic, state management, data flow
- Gemini — infrastructure, concurrency, external dependencies, environment
- Codex — edge cases in input handling, type coercion, off-by-one errors
- Cursor — framework, library, and third-party integration issues
- Kilo — naming, types, readability, and long-term maintainability

**Execution mode:**
- Default: foreground (debugging needs immediate results).
- If `--background` is in the arguments, run in background mode.
- Strip `--background` and `--wait` before passing to companion.

**Pre-flight:**
```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/companion.mjs" check-all
```
If non-zero, stop and tell the user which agents are missing.

**Foreground execution:**
```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/companion.mjs" debug $ARGUMENTS
```

**Background execution:**
```typescript
Bash({
  command: `node "$CLAUDE_PLUGIN_ROOT/scripts/companion.mjs" debug $ARGUMENTS`,
  description: "Parallel debug",
  run_in_background: true
})
```

**After the companion exits, synthesize an investigation plan:**

```
## Hypothesis Pool

| # | Hypothesis | Proposed by | Likelihood |
|---|-----------|-------------|------------|
| 1 | … | Claude | High |
| 2 | … | Gemini + Codex | Medium |
| … |

## Investigation Plan

1. Check X first (quick, rules out hypotheses 1 and 3)
2. …

## Most Likely Root Cause

<1–2 sentences based on the aggregate council input.>
```

Rank hypotheses by likelihood, surfacing ones flagged by multiple agents first.
