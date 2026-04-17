# chorus — Implementation Guide for Agent

## What to build

A cross-agent plugin/skill collection that lets four AI coding CLIs delegate tasks to each other:

| From \ To | Claude | OpenCode | Gemini | Codex |
|-----------|--------|----------|--------|-------|
| **Claude Code** | self ✅ | ✅ done | ✅ done | add |
| **OpenCode** | add | self | add | add |
| **Gemini CLI** | add | add | self | add |
| **Codex** | add | add | add | self |

Total: 12 cross-agent integrations (4 hosts × 3 targets).

---

## Installed CLIs on this machine

| Tool | Binary | Version | Non-interactive |
|------|--------|---------|-----------------|
| Claude Code | `claude` (`~/.local/bin/claude`) | 2.1.112 | `claude --print "<task>" --dangerously-skip-permissions` |
| OpenCode | `opencode` (`~/.opencode/bin/opencode`) | 1.4.3 | `opencode run "<task>"` |
| Gemini CLI | `gemini` (`/usr/bin/gemini`) | 0.34.0 | `gemini --prompt "<task>" --yolo --output-format text` |
| Codex | `codex` (`/usr/bin/codex`) | 0.121.0 | `codex exec "<task>"` / `codex review` |

---

## Project structure (final)

```
chorus/
├── .claude-plugin/                  # Claude Code marketplace (root = installable via URL)
│   └── marketplace.json
├── plugins/                         # Claude Code plugins
│   ├── opencode/                    (existing — run/review/setup)
│   ├── gemini/                      (existing — run/review/setup)
│   ├── codex/                       ← ADD THIS
│   │   ├── .claude-plugin/plugin.json
│   │   ├── commands/
│   │   │   ├── run.md
│   │   │   ├── review.md
│   │   │   └── setup.md
│   │   └── scripts/companion.mjs
│   └── claude/                      (existing — self-delegation)
├── for-opencode/                    # OpenCode npm MCP package
│   ├── package.json                 name: "@valpere/chorus-opencode"
│   └── src/
│       └── index.js                 MCP server exposing claude/gemini/codex as tools
├── for-gemini/                      # Gemini CLI skills (SKILL.md per target)
│   ├── claude/
│   │   └── SKILL.md
│   ├── opencode/
│   │   └── SKILL.md
│   └── codex/
│       └── SKILL.md
└── for-codex/                       # Codex skills (.codex/skills/ format)
    ├── claude/
    │   └── SKILL.md
    ├── opencode/
    │   └── SKILL.md
    └── gemini/
        └── SKILL.md
```

---

## Reference implementations to study

### 1. Claude Code plugin format

Fetch these files from: `gh api repos/openai/codex-plugin-cc/contents/<path> --jq '.content' | base64 -d`

- `plugins/codex/.claude-plugin/plugin.json` — plugin metadata
- `plugins/codex/commands/review.md` — command frontmatter + behavior spec
- `plugins/codex/commands/rescue.md` — foreground/background routing pattern
- `.claude-plugin/marketplace.json` — root marketplace descriptor

### 2. Gemini skill format

Already installed locally: `~/.agents/skills/microsoft-foundry/SKILL.md`
Read it to understand frontmatter and skill body structure.

Gemini skill frontmatter:
```yaml
---
name: <name>
description: <description for skill discovery — verbose, used by agent to decide when to activate>
license: MIT
metadata:
  author: valpere
  version: "1.0.0"
---
```

### 3. Codex skill format

Fetch from the official Codex repo:
`gh api repos/openai/codex/contents/.codex/skills/codex-pr-body/SKILL.md --jq '.content' | base64 -d`

Codex skill frontmatter:
```yaml
---
name: <name>
description: <one-line description>
---
```

### 4. OpenCode plugin format

OpenCode plugins are npm packages installed via `opencode plugin <npm-package>`.
They must export an MCP server that OpenCode discovers and registers as tools.

The npm package must have in `package.json`:
```json
{
  "name": "@valpere/chorus-opencode",
  "type": "module",
  "exports": "./src/index.js"
}
```

The `src/index.js` starts an MCP stdio server exposing three tools:
- `delegate_claude(task: string) → string`
- `delegate_gemini(task: string) → string`
- `delegate_codex(task: string) → string`

Use the `@modelcontextprotocol/sdk` package to implement the MCP server.

---

## Spec: what each command/skill must do

### Pattern for all `run` commands/skills

- Accept a task description as input
- Support `--wait` (foreground) and `--background` (async) flags for Claude Code plugins
- Strip execution flags before passing to CLI
- Return CLI stdout **verbatim** — no paraphrasing, no summaries
- If binary not found → tell user to run the corresponding `setup` command
- Empty task → prompt user for input

### Pattern for all `review` commands/skills

1. Run `git diff HEAD` and `git diff --stat HEAD`
2. Build a review prompt: "Review these git changes for correctness, security, and edge cases:\n\n<diff>"
3. Invoke the target CLI with that prompt
4. Return output verbatim
- Default: background (reviews are slow); `--wait` for foreground

### Pattern for all `setup` commands/skills

Check:
1. Binary exists in PATH (`which <tool>`)
2. Auth/credentials available (tool-specific check)
3. Print version if OK, instructions if not

---

## Detailed spec: `plugins/codex/` (Claude Code plugin)

Add following the same pattern as `plugins/opencode/`.

Also update `.claude-plugin/marketplace.json` to add codex to the plugins array.

Codex companion script (`plugins/codex/scripts/companion.mjs`):
```js
// run:
spawn('codex', ['exec', task], { stdio: 'inherit' })
// review:
spawn('codex', ['review', reviewPrompt], { stdio: 'inherit' })
// check:
spawnSync('codex', ['--version'])
```

---

## Detailed spec: `for-gemini/` skills

Each file is a standalone `SKILL.md` installable via:
```bash
gemini skills install https://github.com/valpere/chorus --path for-gemini/claude
```

### `for-gemini/claude/SKILL.md`

- `name: chorus-claude`
- Description should explain when to use: user asks to delegate to Claude, get second opinion from Claude, compare Claude's answer
- Body instructs Gemini to run: `claude --print "<task>" --dangerously-skip-permissions`
- Must include: output returned verbatim rule

### `for-gemini/opencode/SKILL.md`

Same pattern. CLI: `opencode run "<task>"`

### `for-gemini/codex/SKILL.md`

Same pattern. CLI: `codex exec "<task>"`

---

## Detailed spec: `for-codex/` skills

Each `SKILL.md` installs into `~/.codex/skills/<name>/SKILL.md`.

### `for-codex/claude/SKILL.md`

- `name: chorus-claude`
- Body instructs Codex: when user asks to delegate to Claude, run `claude --print "<task>" --dangerously-skip-permissions`

### `for-codex/opencode/SKILL.md`

CLI: `opencode run "<task>"`

### `for-codex/gemini/SKILL.md`

CLI: `gemini --prompt "<task>" --yolo --output-format text`

---

## Detailed spec: `for-opencode/` npm package

### `for-opencode/package.json`

```json
{
  "name": "@valpere/chorus-opencode",
  "version": "1.0.0",
  "description": "OpenCode plugin: delegate tasks to Claude, Gemini, and Codex",
  "type": "module",
  "main": "./src/index.js",
  "exports": "./src/index.js",
  "engines": { "node": ">=18.18.0" },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  }
}
```

### `for-opencode/src/index.js`

MCP stdio server with three tools: `delegate_claude`, `delegate_gemini`, `delegate_codex`.

Each tool:
1. Validates the `task` string input
2. Checks CLI binary exists via `spawnSync`
3. Spawns CLI, collects stdout
4. Returns stdout as MCP tool result text

```js
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { spawnSync, execFileSync } from 'child_process';

// Register three tools, handle ListToolsRequest and CallToolRequest
```

---

## Update README.md

Document installation for all four agents:

### Claude Code
```bash
claude plugin install https://github.com/valpere/chorus
# Adds: /opencode:run, /opencode:review, /gemini:run, /gemini:review,
#        /codex:run, /codex:review, /claude:run, /claude:review
```

### OpenCode
```bash
opencode plugin @valpere/chorus-opencode
# Adds MCP tools: delegate_claude, delegate_gemini, delegate_codex
```

### Gemini CLI
```bash
gemini skills install https://github.com/valpere/chorus --path for-gemini/claude
gemini skills install https://github.com/valpere/chorus --path for-gemini/opencode
gemini skills install https://github.com/valpere/chorus --path for-gemini/codex
```

### Codex
```bash
git clone https://github.com/valpere/chorus /tmp/chorus
mkdir -p ~/.codex/skills/chorus-claude ~/.codex/skills/chorus-opencode ~/.codex/skills/chorus-gemini
cp /tmp/chorus/for-codex/claude/SKILL.md ~/.codex/skills/chorus-claude/
cp /tmp/chorus/for-codex/opencode/SKILL.md ~/.codex/skills/chorus-opencode/
cp /tmp/chorus/for-codex/gemini/SKILL.md ~/.codex/skills/chorus-gemini/
```

---

## Implementation steps (in order)

1. Read all reference files:
   - `gh api repos/openai/codex-plugin-cc/contents/plugins/codex/commands/review.md --jq '.content' | base64 -d`
   - `cat ~/.agents/skills/microsoft-foundry/SKILL.md`
   - `gh api repos/openai/codex/contents/.codex/skills/codex-pr-body/SKILL.md --jq '.content' | base64 -d`
   - Existing `plugins/opencode/scripts/companion.mjs` (for Claude Code pattern)
2. Add `plugins/codex/` — update `marketplace.json`
3. Create `for-gemini/` (3 SKILL.md files)
4. Create `for-codex/` (3 SKILL.md files)
5. Create `for-opencode/` npm MCP package
6. Update `README.md`
7. Commit and push

---

## Notes

- Return CLI output **verbatim** everywhere — no summaries, no paraphrasing
- Background mode for Claude Code plugins uses `run_in_background: true` Bash flag
- `--dangerously-skip-permissions` for Claude is intentional — runs in sandboxed delegated context
- Gemini `--yolo` flag auto-approves all tool calls — required for non-interactive use
- Keep companion scripts minimal — no retries, no caching, no state
- Codex `codex exec` is the non-interactive equivalent of `codex run` with a prompt
