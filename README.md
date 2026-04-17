# Chorus

Cross-agent plugin collection for AI coding CLIs. Delegate tasks between Claude Code, OpenCode, Gemini CLI, and Codex.

## Overview

Chorus enables four AI coding agents to delegate tasks to each other, creating a mesh of cross-agent capabilities. Get multiple perspectives on your code or run parallel tasks using different AI agents.

| From \ To | Claude | OpenCode | Gemini | Codex |
|-----------|--------|----------|--------|-------|
| **Claude Code** | self ✅ | ✅ | ✅ | ✅ |
| **OpenCode** | ✅ | self | ✅ | ✅ |
| **Gemini CLI** | ✅ | ✅ | self | ✅ |
| **Codex** | ✅ | ✅ | ✅ | self |

## Installation

### Claude Code

```bash
claude plugin install https://github.com/valpere/chorus
```

Adds slash commands:
- `/opencode:run`, `/opencode:review`
- `/gemini:run`, `/gemini:review`
- `/codex:run`, `/codex:review`
- `/claude:run`, `/claude:review` (second Claude instance)

### OpenCode

```bash
opencode plugin @valpere/chorus-opencode
```

Adds MCP tools:
- `delegate_claude(task: string) → string`
- `delegate_gemini(task: string) → string`
- `delegate_codex(task: string) → string`

### Gemini CLI

```bash
gemini skills install https://github.com/valpere/chorus --path for-gemini/claude
gemini skills install https://github.com/valpere/chorus --path for-gemini/opencode
gemini skills install https://github.com/valpere/chorus --path for-gemini/codex
```

Adds skills:
- `chorus-claude` - Delegate to Claude Code
- `chorus-opencode` - Delegate to OpenCode
- `chorus-codex` - Delegate to Codex

### Codex

```bash
git clone https://github.com/valpere/chorus /tmp/chorus
mkdir -p ~/.codex/skills/chorus-claude ~/.codex/skills/chorus-opencode ~/.codex/skills/chorus-gemini
cp /tmp/chorus/for-codex/claude/SKILL.md ~/.codex/skills/chorus-claude/
cp /tmp/chorus/for-codex/opencode/SKILL.md ~/.codex/skills/chorus-opencode/
cp /tmp/chorus/for-codex/gemini/SKILL.md ~/.codex/skills/chorus-gemini/
```

Adds skills:
- `chorus-claude` - Delegate to Claude Code
- `chorus-opencode` - Delegate to OpenCode
- `chorus-gemini` - Delegate to Gemini CLI

## Usage Examples

### Claude Code

```bash
# Run a task in the foreground
/opencode:run --wait "What's the purpose of this codebase?"

# Run a task in the background
/gemini:run --background "Summarize the architecture in 3 sentences."

# Get code reviews from all agents
/codex:review --wait
/opencode:review --wait
/gemini:review --wait
/claude:review --wait

# Get a security-focused review
/claude:run --wait "List potential security issues in this code."
```

### OpenCode

Once the plugin is installed, OpenCode will automatically discover the MCP tools. Use natural language:

```
"Ask Claude to review this function for edge cases"
"Get Gemini's opinion on this architecture"
"Delegate this refactoring task to Codex"
```

### Gemini CLI

Once skills are installed, Gemini will activate them based on context:

```bash
gemini --prompt "Get a second opinion from Claude on my current approach"
```

### Codex

Once skills are installed, Codex will activate them when you mention delegating:

```bash
codex "Ask Gemini to analyze this file for performance issues"
```

## Execution Modes

All `run` and `review` commands support two execution modes:

- `--wait` (or no flag with user confirmation) - Run in foreground and return results immediately
- `--background` - Run as a background task and notify when complete

## Requirements

- Node.js >= 18.18.0
- [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview) (for delegation from OpenCode/Gemini/Codex)
- [OpenCode](https://opencode.ai) (for delegation to/from OpenCode)
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) (for delegation to/from Gemini)
- [Codex](https://github.com/openai/codex) (for delegation to/from Codex)

## Project Structure

```
chorus/
├── .claude-plugin/
│   └── marketplace.json       # Claude Code plugin marketplace
├── plugins/                   # Claude Code plugins
│   ├── claude/                # Claude Code self-delegation
│   ├── opencode/              # OpenCode plugin
│   ├── gemini/                # Gemini CLI plugin
│   └── codex/                 # Codex plugin
├── for-gemini/                # Gemini CLI skills
│   ├── claude/SKILL.md
│   ├── opencode/SKILL.md
│   └── codex/SKILL.md
├── for-codex/                 # Codex skills
│   ├── claude/SKILL.md
│   ├── opencode/SKILL.md
│   └── gemini/SKILL.md
├── for-opencode/              # OpenCode MCP package
│   ├── package.json
│   └── src/
│       └── index.js
├── package.json
└── README.md
```

## Known Limitations

### Codex sandbox restricts file access

Codex runs inside a bubblewrap sandbox that limits filesystem access to the
current working directory. When you delegate a task to Codex from another agent,
Codex can only read files **within the directory where it was launched** — not
arbitrary paths on the system.

**Practical impact:** If you invoke `/codex:run` or `chorus-codex` from a
project outside Codex's working directory (e.g. running Claude Code in
`~/wrk/projectA` but Codex is launched in `~/wrk/common`), Codex will produce
metadata-only output (file sizes, directory structure) instead of content-based
analysis.

**Workaround:** Run Codex from the same project root as the other agents, or
use `codex --no-sandbox` if your environment supports it.

### OpenCode stdout is not capturable

`opencode run` is a TUI application — it writes ANSI output to the terminal but
does not expose stdout for programmatic capture. Chorus uses `claude --print` as
a proxy when a third council voice is needed from within Claude Code.

**Practical impact:** The `delegate_claude` MCP tool in the OpenCode plugin
works correctly. The reverse path (using OpenCode as a council member from
Claude Code) requires the TUI to be visible.

---

## License

MIT
