# chorus — Agent Context

Cross-agent plugin collection connecting six AI coding CLIs in a full 6×6 delegation mesh.

## What this project is

Every agent can delegate to every other agent. The project ships plugins/skills/rules for each host so they can invoke the others without leaving their own interface.

Agents: **Claude Code**, **OpenCode**, **Gemini CLI**, **Codex**, **Cursor Agent CLI**, **Kilo Code CLI**

OpenCode is excluded from parallel workflow patterns — its TUI stdout is not capturable.

## Project structure

```
chorus/
├── plugins/                        # Claude Code plugins (one per target agent)
│   ├── claude/                     # Self-delegation (second Claude instance)
│   ├── opencode/
│   ├── gemini/
│   ├── codex/
│   ├── cursor/
│   ├── kilo/
│   └── chorus/                     # Workflow patterns (orchestrate multiple agents)
│       ├── commands/               # council.md, review.md, debug.md, second-opinion.md
│       └── scripts/companion.mjs   # Parallel orchestrator: spawns agents, captures output
├── for-gemini/                     # Gemini CLI skills (SKILL.md per target)
├── for-codex/                      # Codex skills (SKILL.md per target)
├── for-cursor/                     # Cursor Agent CLI rules (RULE.mdc per target)
├── for-kilo/                       # Kilo Code CLI skills (SKILL.md per target)
└── for-opencode/                   # OpenCode MCP npm package
    └── src/index.js                # MCP stdio server exposing delegate_* tools
```

Each `for-*/` directory has 9 entries: 5 delegation targets + council + parallel-review + parallel-debug + second-opinion.

## Key files

| File | Purpose |
|------|---------|
| `plugins/chorus/scripts/companion.mjs` | Core orchestrator. Runs `council`, `review`, `debug`, `second-opinion` subcommands. Checks agent availability, warns about missing agents. `council`/`review`/`debug` require ≥2 agents; `second-opinion` requires ≥1. |
| `plugins/chorus/commands/*.md` | Claude Code slash-command specs for each workflow pattern. |
| `for-opencode/src/index.js` | MCP server. Exports `delegate_*` tools and `council`, `parallel_review`, `parallel_debug`, `second_opinion`. |
| `.claude-plugin/marketplace.json` | Claude Code plugin registry. |

## Agent registry (companion.mjs)

```js
const REGISTRY = {
  claude: { binary: 'claude', setup: '/claude:setup' },
  gemini: { binary: 'gemini', setup: '/gemini:setup' },
  codex:  { binary: 'codex',  setup: '/codex:setup'  },
  cursor: { binary: 'agent',  setup: '/cursor:setup'  },
  kilo:   { binary: 'kilo',   setup: '/kilo:setup'    },
};
```

`checkCli(binary)` returns `{ status: 'ok'|'not-installed'|'unavailable', version: string }`.

## CLI invocation patterns

| Agent | Non-interactive invocation |
|-------|--------------------------|
| Claude Code | `claude --print "<task>" --dangerously-skip-permissions` |
| Gemini CLI | `gemini --prompt "<task>" --yolo --output-format text` |
| Codex | `codex exec "<task>"` |
| Cursor | `agent -p --force "<task>"` |
| Kilo | `kilo run --auto "<task>"` |
| OpenCode | TUI only — not usable for output capture |

## Conventions

- Return CLI output **verbatim** — no summaries, no paraphrasing
- JSONL output from agents: one JSON object per line
- companion.mjs stdin: `'ignore'` (prevents TTY-less hang in Codex/Kilo)
- Background mode in Claude Code plugins: `run_in_background: true` on Bash tool
- `--dangerously-skip-permissions` for Claude: intentional — delegated sandboxed context
- `--yolo` for Gemini: auto-approves tool calls for non-interactive use

## Known limitations

- **Codex sandbox**: file access limited to working directory — cross-project delegation yields partial results
- **OpenCode TUI**: stdout not capturable — excluded from parallel workflow patterns
- **Workflow patterns require ≥2 agents**: `council`, `review`, `debug` exit non-zero if fewer than 2 agents are installed
