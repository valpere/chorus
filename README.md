# Chorus

Cross-agent plugin collection for AI coding CLIs. Delegate tasks between Claude Code, OpenCode, Gemini CLI, Codex, Cursor, and Kilo.

![chorus delegation mesh](docs/announcement/infographic.png)

## Overview

Chorus connects six AI coding agents through a full delegation mesh. Every agent can delegate to every other agent (see [Known Limitations](#known-limitations) for OpenCode output capture constraints).

| From \ To | Claude | OpenCode | Gemini | Codex | Cursor | Kilo |
|-----------|--------|----------|--------|-------|--------|------|
| **Claude Code** | self ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **OpenCode** | ✅ | self | ✅ | ✅ | ✅ | ✅ |
| **Gemini CLI** | ✅ | ✅ | self | ✅ | ✅ | ✅ |
| **Codex** | ✅ | ✅ | ✅ | self | ✅ | ✅ |
| **Cursor** | ✅ | ✅ | ✅ | ✅ | self | ✅ |
| **Kilo** | ✅ | ✅ | ✅ | ✅ | ✅ | self |

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
- `/cursor:run`, `/cursor:review`, `/cursor:setup`
- `/kilo:run`, `/kilo:review`, `/kilo:setup`

**Workflow patterns** (orchestrate multiple agents at once):
- `/chorus:council` — LLM council: five agents, different roles, you synthesize
- `/chorus:review` — parallel code review from all five agents
- `/chorus:debug` — parallel root-cause hypotheses for a bug symptom
- `/chorus:second-opinion` — quick independent check from one agent (`--agent cursor|kilo` supported)

### OpenCode

```bash
opencode plugin @valpere/chorus-opencode
```

Adds MCP tools:
- `delegate_claude(task: string) → string`
- `delegate_gemini(task: string) → string`
- `delegate_codex(task: string) → string`
- `delegate_cursor(task: string) → string`
- `delegate_kilo(task: string) → string`
- `council(task: string) → string` — parallel council, all five agents
- `parallel_review() → string` — parallel review of current git diff
- `parallel_debug(symptom: string) → string` — parallel root-cause hypotheses
- `second_opinion(approach: string, agent?: 'claude'|'gemini'|'codex'|'cursor'|'kilo') → string`

### Gemini CLI

```bash
# Delegation skills
gemini skills install https://github.com/valpere/chorus --path for-gemini/claude
gemini skills install https://github.com/valpere/chorus --path for-gemini/opencode
gemini skills install https://github.com/valpere/chorus --path for-gemini/codex
gemini skills install https://github.com/valpere/chorus --path for-gemini/cursor
gemini skills install https://github.com/valpere/chorus --path for-gemini/kilo

# Workflow pattern skills
gemini skills install https://github.com/valpere/chorus --path for-gemini/council
gemini skills install https://github.com/valpere/chorus --path for-gemini/parallel-review
gemini skills install https://github.com/valpere/chorus --path for-gemini/parallel-debug
gemini skills install https://github.com/valpere/chorus --path for-gemini/second-opinion
```

Adds skills:
- `chorus-claude` - Delegate to Claude Code
- `chorus-opencode` - Delegate to OpenCode
- `chorus-codex` - Delegate to Codex
- `chorus-cursor` - Delegate to Cursor Agent CLI
- `chorus-kilo` - Delegate to Kilo Code CLI
- `chorus-council` - LLM council with all five agents
- `chorus-parallel-review` - Parallel code review
- `chorus-parallel-debug` - Parallel root-cause hypotheses
- `chorus-second-opinion` - Quick independent second opinion

### Codex

```bash
git clone https://github.com/valpere/chorus /tmp/chorus

# Delegation skills
mkdir -p ~/.codex/skills/chorus-claude ~/.codex/skills/chorus-opencode \
         ~/.codex/skills/chorus-gemini ~/.codex/skills/chorus-cursor ~/.codex/skills/chorus-kilo
cp /tmp/chorus/for-codex/claude/SKILL.md ~/.codex/skills/chorus-claude/
cp /tmp/chorus/for-codex/opencode/SKILL.md ~/.codex/skills/chorus-opencode/
cp /tmp/chorus/for-codex/gemini/SKILL.md ~/.codex/skills/chorus-gemini/
cp /tmp/chorus/for-codex/cursor/SKILL.md ~/.codex/skills/chorus-cursor/
cp /tmp/chorus/for-codex/kilo/SKILL.md ~/.codex/skills/chorus-kilo/

# Workflow pattern skills
mkdir -p ~/.codex/skills/chorus-council ~/.codex/skills/chorus-parallel-review \
         ~/.codex/skills/chorus-parallel-debug ~/.codex/skills/chorus-second-opinion
cp /tmp/chorus/for-codex/council/SKILL.md ~/.codex/skills/chorus-council/
cp /tmp/chorus/for-codex/parallel-review/SKILL.md ~/.codex/skills/chorus-parallel-review/
cp /tmp/chorus/for-codex/parallel-debug/SKILL.md ~/.codex/skills/chorus-parallel-debug/
cp /tmp/chorus/for-codex/second-opinion/SKILL.md ~/.codex/skills/chorus-second-opinion/
```

Adds skills:
- `chorus-claude` - Delegate to Claude Code
- `chorus-opencode` - Delegate to OpenCode
- `chorus-gemini` - Delegate to Gemini CLI
- `chorus-cursor` - Delegate to Cursor Agent CLI
- `chorus-kilo` - Delegate to Kilo Code CLI
- `chorus-council` - LLM council with all five agents
- `chorus-parallel-review` - Parallel code review
- `chorus-parallel-debug` - Parallel root-cause hypotheses
- `chorus-second-opinion` - Quick independent second opinion

### Cursor

```bash
git clone https://github.com/valpere/chorus /tmp/chorus

mkdir -p .cursor/rules

# Delegation rules
cp /tmp/chorus/for-cursor/claude/RULE.mdc .cursor/rules/chorus-claude.mdc
cp /tmp/chorus/for-cursor/opencode/RULE.mdc .cursor/rules/chorus-opencode.mdc
cp /tmp/chorus/for-cursor/gemini/RULE.mdc .cursor/rules/chorus-gemini.mdc
cp /tmp/chorus/for-cursor/codex/RULE.mdc .cursor/rules/chorus-codex.mdc
cp /tmp/chorus/for-cursor/kilo/RULE.mdc .cursor/rules/chorus-kilo.mdc

# Workflow pattern rules
cp /tmp/chorus/for-cursor/council/RULE.mdc .cursor/rules/chorus-council.mdc
cp /tmp/chorus/for-cursor/parallel-review/RULE.mdc .cursor/rules/chorus-parallel-review.mdc
cp /tmp/chorus/for-cursor/parallel-debug/RULE.mdc .cursor/rules/chorus-parallel-debug.mdc
cp /tmp/chorus/for-cursor/second-opinion/RULE.mdc .cursor/rules/chorus-second-opinion.mdc
```

Adds rules (activate via natural language in Cursor):
- `chorus-claude` - Delegate to Claude Code
- `chorus-opencode` - Delegate to OpenCode
- `chorus-gemini` - Delegate to Gemini CLI
- `chorus-codex` - Delegate to Codex
- `chorus-kilo` - Delegate to Kilo Code CLI
- `chorus-council` - LLM council with all five agents
- `chorus-parallel-review` - Parallel code review
- `chorus-parallel-debug` - Parallel root-cause hypotheses
- `chorus-second-opinion` - Quick independent second opinion

### Kilo

```bash
git clone https://github.com/valpere/chorus /tmp/chorus

# Delegation skills
mkdir -p ~/.kilo/skills/chorus-claude ~/.kilo/skills/chorus-opencode \
         ~/.kilo/skills/chorus-gemini ~/.kilo/skills/chorus-codex ~/.kilo/skills/chorus-cursor
cp /tmp/chorus/for-kilo/claude/SKILL.md ~/.kilo/skills/chorus-claude/
cp /tmp/chorus/for-kilo/opencode/SKILL.md ~/.kilo/skills/chorus-opencode/
cp /tmp/chorus/for-kilo/gemini/SKILL.md ~/.kilo/skills/chorus-gemini/
cp /tmp/chorus/for-kilo/codex/SKILL.md ~/.kilo/skills/chorus-codex/
cp /tmp/chorus/for-kilo/cursor/SKILL.md ~/.kilo/skills/chorus-cursor/

# Workflow pattern skills
mkdir -p ~/.kilo/skills/chorus-council ~/.kilo/skills/chorus-parallel-review \
         ~/.kilo/skills/chorus-parallel-debug ~/.kilo/skills/chorus-second-opinion
cp /tmp/chorus/for-kilo/council/SKILL.md ~/.kilo/skills/chorus-council/
cp /tmp/chorus/for-kilo/parallel-review/SKILL.md ~/.kilo/skills/chorus-parallel-review/
cp /tmp/chorus/for-kilo/parallel-debug/SKILL.md ~/.kilo/skills/chorus-parallel-debug/
cp /tmp/chorus/for-kilo/second-opinion/SKILL.md ~/.kilo/skills/chorus-second-opinion/
```

Adds skills:
- `chorus-claude` - Delegate to Claude Code
- `chorus-opencode` - Delegate to OpenCode
- `chorus-gemini` - Delegate to Gemini CLI
- `chorus-codex` - Delegate to Codex
- `chorus-cursor` - Delegate to Cursor Agent CLI
- `chorus-council` - LLM council with all five agents
- `chorus-parallel-review` - Parallel code review
- `chorus-parallel-debug` - Parallel root-cause hypotheses
- `chorus-second-opinion` - Quick independent second opinion

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

### Cursor

Once rules are installed in `.cursor/rules/`, Cursor will activate them based on context:

```bash
# In a Cursor Agent session:
"Get a second opinion from Claude on this approach"
"Run a parallel review with all agents"
"Ask Kilo if this naming is clear enough"
```

### Kilo

Once skills are installed, Kilo will activate them when you mention delegating:

```bash
kilo run --auto "Ask Gemini to review this for edge cases"
kilo run --auto "Run a council on whether to use Redis or Postgres for this queue"
```

## Workflow Patterns

Workflow patterns orchestrate **multiple agents in parallel** and synthesize the results. Install the `chorus` plugin once to access all four.

### LLM Council

Three agents tackle the same task with different roles; the host synthesizes as chairman.

```bash
/chorus:council "Should we use optimistic locking or a distributed lock for this feature?"
/chorus:council --background "Review the architecture of the new auth service"
```

### Parallel Review

All five agents review the current `git diff HEAD` simultaneously, each with a different focus (correctness, edge cases, scope, integration, maintainability).

```bash
/chorus:review --wait
/chorus:review --background
```

### Parallel Debug

All five agents propose root-cause hypotheses for a symptom; the host synthesizes an investigation plan.

```bash
/chorus:debug "Checkout fails intermittently with a 500 — only in production, never in staging"
```

### Second Opinion

Quick independent check from one agent. Default: Gemini. Override with `--agent`.

```bash
/chorus:second-opinion "Use a ULID instead of UUID for the new events table primary key"
/chorus:second-opinion --agent claude "Cache the auth token in localStorage vs sessionStorage"
/chorus:second-opinion --agent codex "Extract this 30-line block into a shared utility"
/chorus:second-opinion --agent cursor "Does this change fit the existing patterns in this repo?"
/chorus:second-opinion --agent kilo "Is this function name clear enough for future maintainers?"
```

---

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
- [Cursor Agent CLI](https://cursor.com/docs/cli) (`agent` binary, optional — for Cursor delegation)
- [Kilo Code CLI](https://kilo.ai/docs/cli) (`kilo` binary, optional — for Kilo delegation)

## Project Structure

```
chorus/
├── .claude-plugin/
│   └── marketplace.json       # Claude Code plugin marketplace
├── plugins/                   # Claude Code plugins
│   ├── claude/                # Claude Code self-delegation
│   ├── opencode/              # OpenCode plugin
│   ├── gemini/                # Gemini CLI plugin
│   ├── codex/                 # Codex plugin
│   ├── cursor/                # Cursor Agent CLI plugin
│   ├── kilo/                  # Kilo Code CLI plugin
│   └── chorus/                # Workflow patterns (council, review, debug, second-opinion)
├── for-gemini/                # Gemini CLI skills
│   ├── claude/SKILL.md
│   ├── opencode/SKILL.md
│   ├── codex/SKILL.md
│   ├── cursor/SKILL.md
│   ├── kilo/SKILL.md
│   ├── council/SKILL.md
│   ├── parallel-review/SKILL.md
│   ├── parallel-debug/SKILL.md
│   └── second-opinion/SKILL.md
├── for-codex/                 # Codex skills
│   ├── claude/SKILL.md
│   ├── opencode/SKILL.md
│   ├── gemini/SKILL.md
│   ├── cursor/SKILL.md
│   ├── kilo/SKILL.md
│   ├── council/SKILL.md
│   ├── parallel-review/SKILL.md
│   ├── parallel-debug/SKILL.md
│   └── second-opinion/SKILL.md
├── for-cursor/                # Cursor Agent CLI rules
│   ├── claude/RULE.mdc
│   ├── opencode/RULE.mdc
│   ├── gemini/RULE.mdc
│   ├── codex/RULE.mdc
│   ├── kilo/RULE.mdc
│   ├── council/RULE.mdc
│   ├── parallel-review/RULE.mdc
│   ├── parallel-debug/RULE.mdc
│   └── second-opinion/RULE.mdc
├── for-kilo/                  # Kilo Code CLI skills
│   ├── claude/SKILL.md
│   ├── opencode/SKILL.md
│   ├── gemini/SKILL.md
│   ├── codex/SKILL.md
│   ├── cursor/SKILL.md
│   ├── council/SKILL.md
│   ├── parallel-review/SKILL.md
│   ├── parallel-debug/SKILL.md
│   └── second-opinion/SKILL.md
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
