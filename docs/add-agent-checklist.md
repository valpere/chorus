# Adding a New Agent to Chorus

Step-by-step checklist for adding a 7th (or Nth) agent to the delegation mesh. All paths are relative to the repo root.

## 1 — Plugin registry

Add an entry to `.claude-plugin/marketplace.json` in the `plugins` array:

```json
{ "name": "<agent>", "path": "plugins/<agent>", "description": "..." }
```

## 2 — Claude Code plugin

Create `plugins/<agent>/` with:

```
plugins/<agent>/
├── .claude-plugin/
│   └── plugin.json          # { name, version, description, author }
├── commands/
│   ├── setup.md             # Check binary + credentials (see plugins/kilo/commands/setup.md)
│   ├── run.md               # Delegate task (see plugins/kilo/commands/run.md)
│   └── review.md            # Delegate git-diff review (see plugins/kilo/commands/review.md)
└── scripts/
    └── companion.mjs        # Copy plugins/opencode/scripts/companion.mjs, swap binary/check
```

Command files must have `disable-model-invocation: true`. Use `plugins/kilo/` as the reference template for a non-Claude agent.

## 3 — Chorus orchestrator

In `plugins/chorus/scripts/companion.mjs`:

1. **REGISTRY**: add `<agent>: { binary: '<binary>', setup: '/<agent>:setup' }`.
2. **council**: add an agent object with the appropriate role prompt (pick from: correctness, edge-cases, scope, integration, maintainability — or add a new role like "performance" or "security").
3. **review**: add the same agent with a review-focused prompt variant.
4. **debug**: add the same agent with a debug-hypothesis prompt variant.
5. **second-opinion**: add the agent to `agentDefs` (same pattern as existing entries) and to `defaultOrder` (the fallback priority list for the no-`--agent` path).
6. **vote**: add the same agent tuple shape used in council (binary + args array with the vote prompt).

## 4 — Delegation target skills for other hosts

Create `for-<newagent>/` with 11 entries (6 existing agents as delegation targets + 5 workflow patterns):

```
for-<newagent>/
├── claude/SKILL.md          # (or RULE.mdc for Cursor-style hosts)
├── opencode/SKILL.md
├── gemini/SKILL.md
├── codex/SKILL.md
├── cursor/SKILL.md
├── kilo/SKILL.md
├── council/SKILL.md
├── parallel-review/SKILL.md
├── parallel-debug/SKILL.md
├── second-opinion/SKILL.md
└── vote/SKILL.md
```

Use the same format as `for-kilo/` (minimal Codex-style) or `for-gemini/` (full metadata) depending on the host's skill format. Canonical invocation flags are in `.github/instructions/skill-files.instructions.md`.

## 5 — Delegation-to-newagent skills for existing hosts

For each existing host that can delegate to the new agent, create:

```
for-gemini/<newagent>/SKILL.md
for-codex/<newagent>/SKILL.md
for-cursor/<newagent>/RULE.mdc
for-kilo/<newagent>/SKILL.md
```

Use `for-gemini/kilo/SKILL.md` as the reference. Add a matching `delegate_<newagent>` tool to `for-opencode/src/index.js`, and add the new agent to all five parallel orchestrator functions (`runCouncil`, `runParallelReview`, `runParallelDebug`, `runSecondOpinion`, `runVote`). Also add the binary to the `BINARIES` map used by `filterAvailable`.

Add the new agent name to `BINARY_MAP` in both `plugins/chorus/scripts/tests/helpers/fake-agents.mjs` and `for-opencode/src/tests/helpers/mcp-session.mjs` so both test suites can create fake stubs for it. Add `delegate_<newagent>` to the `tools/list` assertion in `for-opencode/src/tests/mcp.test.mjs`.

## 6 — Documentation

- **`AGENTS.md`**: add the agent to the agent list and CLI invocation table.
- **`README.md`**: add a row to the delegation mesh table; add install instructions under the new agent's section; add the new `/<newagent>:*` commands to the Claude Code plugin list.
- **`.github/instructions/skill-files.instructions.md`**: add a canonical-flag bullet for the new agent's non-interactive invocation.
- **`.github/instructions/companion-scripts.instructions.md`**: update `check-all` description if the agent count changes.

## Checklist summary

- [ ] `.claude-plugin/marketplace.json` — new entry
- [ ] `plugins/<agent>/` — setup/run/review commands + companion.mjs
- [ ] `plugins/chorus/scripts/companion.mjs` — REGISTRY + council/review/debug blocks
- [ ] `for-<newagent>/` — 11 SKILL.md (or RULE.mdc) files (6 delegation targets + 5 workflow patterns)
- [ ] `for-gemini/<newagent>/`, `for-codex/<newagent>/`, `for-cursor/<newagent>/`, `for-kilo/<newagent>/` — delegation skills
- [ ] `for-opencode/src/index.js` — `delegate_<newagent>` tool + add to BINARIES + add to all 5 parallel orchestrators
- [ ] `plugins/chorus/scripts/tests/helpers/fake-agents.mjs` — add to `BINARY_MAP`
- [ ] `for-opencode/src/tests/helpers/mcp-session.mjs` — add `<newagent>` to `BINARY_MAP`
- [ ] `for-opencode/src/tests/mcp.test.mjs` — add `delegate_<newagent>` to the `tools/list` assertion
- [ ] `AGENTS.md`, `README.md` — documentation
- [ ] `.github/instructions/*.md` — canonical-flag rules updated
