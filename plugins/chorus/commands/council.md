---
description: Run an LLM council — three agents tackle the same task with different roles, then synthesize
argument-hint: "[--wait|--background] <task or question>"
disable-model-invocation: true
allowed-tools: Bash(node:*), Bash(git:*)
---

Run a multi-agent LLM council on the given task and synthesize the results as chairman.

Raw slash-command arguments:
`$ARGUMENTS`

**Council composition:**
- Claude — correctness reviewer (logic, security, type safety)
- Gemini — edge-cases reviewer (failure modes, alternatives, what was missed)
- Codex — scope reviewer (unnecessary complexity, smallest viable solution)

**Execution mode:**
- Default: foreground (council output needs immediate synthesis).
- If `--background` is in the arguments, run in background mode.
- Strip `--background` and `--wait` before passing to the companion.

**Pre-flight:**
Run:
```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/companion.mjs" check-all
```
If it exits non-zero, stop and tell the user which agents are missing.

**Foreground execution:**
```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/companion.mjs" council $ARGUMENTS
```

**Background execution:**
```typescript
Bash({
  command: `node "$CLAUDE_PLUGIN_ROOT/scripts/companion.mjs" council $ARGUMENTS`,
  description: "LLM council",
  run_in_background: true
})
```

**After the companion exits, synthesize as chairman:**

The companion output contains three delimited sections — one per agent.
Read each section and produce a structured synthesis:

```
## Council Synthesis

**Consensus** (all 3 agree):
- …

**Disagreements:**
- <point>: Claude says X, Gemini says Y — [your adjudication]
- …

## Chairman's Recommendation

<Your own 2–4 sentence recommendation, informed by the council but not just a summary of it.>
```

Do not skip the synthesis — it is the primary value of this command.
Do not paraphrase individual agent outputs beyond what is needed for the synthesis.
