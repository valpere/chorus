---
description: Run an LLM council — five agents tackle the same task with different roles, then synthesize
argument-hint: "[--wait|--background] [--json] <task or question>"
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
- Cursor — integration reviewer (codebase fit, dependency implications)
- Kilo — maintainability reviewer (readability, naming, long-term tech debt)

**Execution mode:**
- Default: foreground (council output needs immediate synthesis).
- If `--background` is in the arguments, run in background mode.
- If `--json` is in the arguments, the companion emits `{"command":"council","results":[{name,output,error,exitCode}]}` on stdout instead of delimited text. Warnings still go to stderr.
- Strip `--background`, `--wait`, and `--json` before passing to the companion.

**Pre-flight:**
The companion automatically checks which agents are installed. Missing agents are reported in stdout with install instructions. The council proceeds with whatever agents are available — at least 2 are required; if fewer are installed the companion exits non-zero and you should tell the user to install more agents.

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

Tell the user: "Council started in the background. You'll be notified when it completes."

**After the companion exits, synthesize as chairman:**

The companion output contains one delimited section per available agent (up to five).
Read each section and produce a structured synthesis:

```
## Council Synthesis

**Consensus** (flagged by multiple agents):
- …

**Disagreements:**
- <point>: Claude says X, Gemini says Y — [your adjudication]
- …

## Chairman's Recommendation

<Your own 2–4 sentence recommendation, informed by the council but not just a summary of it.>
```

Do not skip the synthesis — it is the primary value of this command.
Do not paraphrase individual agent outputs beyond what is needed for the synthesis.
