---
description: Parallel vote — five agents cast YES / NO / ABSTAIN on a proposition, tally is returned
argument-hint: "[--background] [--json] <proposition>"
disable-model-invocation: true
allowed-tools: Bash(node:*), Bash(git:*)
---

Put a yes/no proposition to five agents in parallel and return a tally.

Raw slash-command arguments:
`$ARGUMENTS`

**Use when you want a decision signal, not synthesis.** The tally reveals whether there is consensus. Use `/chorus:council` when you want reasoning and trade-offs instead.

**Vote semantics:**
- Each agent replies `YES`, `NO`, or `ABSTAIN` followed by one sentence of rationale.
- Output: a tally table (`| Vote | Count |`) and a per-agent rationale section.
- Verdict is determined by the caller — no chairman synthesis.

**Agent roles (same as council):**
- Claude — correctness and security lens
- Gemini — edge-case and risk lens
- Codex — scope and simplicity lens
- Cursor — codebase integration lens
- Kilo — maintainability lens

**Execution mode:**
- Default: foreground (tally needs immediate results).
- If `--background` is in the arguments, run in background mode.
- If `--json` is in the arguments, the companion emits `{"command":"vote","tally":{"yes":N,"no":N,"abstain":N,"invalid":N},"results":[{name,vote,rationale,output,error,exitCode}]}` on stdout. Warnings still go to stderr.
- Strip `--background`, `--wait`, and `--json` before passing to the companion.

**Pre-flight:**
The companion automatically checks which agents are installed. Missing agents are reported in stderr. Voting proceeds with whatever agents are available — at least 2 are required; if fewer are installed the companion exits non-zero and you should tell the user to install more agents.

**Foreground execution:**
```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/companion.mjs" vote $ARGUMENTS
```

**Background execution:**
```typescript
Bash({
  command: `node "$CLAUDE_PLUGIN_ROOT/scripts/companion.mjs" vote $ARGUMENTS`,
  description: "Parallel vote",
  run_in_background: true
})
```

Tell the user: "Vote started in the background. You'll be notified when it completes."

**After the companion exits:**

Return the tally and per-agent rationale verbatim. Do not adjudicate the result — the caller decides what the tally means. If the user asks "what does this mean?", you may interpret it, but the raw output should be shown first.
