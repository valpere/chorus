# Chorus

Claude Code plugins for AI coding agents: OpenCode, Gemini CLI, and Claude Code.

## Overview

Chorus is a collection of Claude Code plugins that let you delegate tasks and code reviews to three popular AI coding CLIs directly from within your Claude Code session. Get multiple perspectives on your code or run parallel tasks using different AI agents.

## Installation

```bash
claude plugin install https://github.com/valpere/chorus
```

## Plugins

### OpenCode (`/opencode:*`)

Delegate tasks and code reviews to [OpenCode](https://opencode.ai).

- `/opencode:run [--background|--wait] <task>` - Run a task with OpenCode
- `/opencode:review [--wait|--background]` - Review current git changes
- `/opencode:setup` - Check OpenCode installation and auth

### Gemini (`/gemini:*`)

Delegate tasks and code reviews to [Gemini CLI](https://github.com/google-gemini/gemini-cli).

- `/gemini:run [--background|--wait] <task>` - Run a task with Gemini
- `/gemini:review [--wait|--background]` - Review current git changes
- `/gemini:setup` - Check Gemini installation and auth

### Claude (`/claude:*`)

Delegate tasks and code reviews to a second [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview) instance.

- `/claude:run [--background|--wait] <task>` - Run a task with another Claude
- `/claude:review [--wait|--background]` - Review current git changes
- `/claude:setup` - Check Claude Code installation and auth

## Usage Examples

```bash
# Run a task in the foreground
/opencode:run --wait "What's the purpose of this codebase?"

# Run a task in the background
/gemini:run --background "Summarize the architecture in 3 sentences."

# Get code reviews from all three agents
/opencode:review --wait
/gemini:review --wait
/claude:review --wait

# Get a security-focused review
/claude:run --wait "List potential security issues in this code."
```

## Execution Modes

All `run` and `review` commands support two execution modes:

- `--wait` (or no flag with user confirmation) - Run in foreground and return results immediately
- `--background` - Run as a background task and notify when complete

## Requirements

- Node.js >= 18.18.0
- [OpenCode](https://opencode.ai) (optional, for `/opencode:*`)
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) (optional, for `/gemini:*`)
- [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview) (optional, for `/claude:*`)

## Project Structure

```
chorus/
├── .claude-plugin/
│   └── marketplace.json       # Plugin marketplace descriptor
├── plugins/
│   ├── opencode/              # OpenCode plugin
│   ├── gemini/                # Gemini CLI plugin
│   └── claude/                # Second Claude Code plugin
├── package.json
└── README.md
```

## License

MIT
