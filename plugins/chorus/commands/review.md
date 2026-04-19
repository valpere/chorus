---
description: Parallel code review from all five agents on the current git diff
argument-hint: "[--wait|--background]"
disable-model-invocation: true
allowed-tools: Bash(node:*), Bash(git:*)
---

Run a parallel code review across five agents and synthesize the findings.

Raw slash-command arguments:
`$ARGUMENTS`

**Review focus per agent:**
- Claude — correctness and security (bugs, vulnerabilities, unsafe patterns)
- Gemini — edge cases and robustness (missing error handling, race conditions)
- Codex — scope and simplicity (unnecessary complexity, simpler alternatives)
- Cursor — codebase integration (consistency with existing patterns, dependency risks)
- Kilo — maintainability (readability, naming clarity, long-term tech debt)

Each agent reviews the current `git diff HEAD`.

**Execution mode:**
- Default: background (reviews are slow).
- If `--wait` is in the arguments, run in foreground.
- Strip `--background` and `--wait` before passing to companion.

**Pre-flight:**
The companion automatically checks which agents are installed. Missing agents are reported in stdout with install instructions. The review proceeds with whatever agents are available — at least 2 are required; if fewer are installed the companion exits non-zero and you should tell the user to install more agents.

**Foreground execution:**
```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/companion.mjs" review $ARGUMENTS
```

**Background execution:**
```typescript
Bash({
  command: `node "$CLAUDE_PLUGIN_ROOT/scripts/companion.mjs" review $ARGUMENTS`,
  description: "Parallel code review",
  run_in_background: true
})
```

**After the companion exits, synthesize:**

```
## Parallel Review Summary

**Critical findings** (flagged by 2+ agents):
- …

**Individual findings** (columns = available agents):
| Finding | Agent 1 | Agent 2 | … |
|---------|---------|---------|---|
| …       | ✓       |         |   |

## Verdict

<1–2 sentences: overall code health and whether changes should proceed as-is or need revision.>
```

This is a review-only command — do not fix issues or apply patches.
