# chorus — Implementation Guide for Agent

## What to build

A Claude Code plugin package that lets the user delegate tasks and code reviews to three AI coding CLIs — **OpenCode**, **Gemini CLI**, and **Claude Code** — using slash commands from within a Claude Code session.

**Installed CLIs on this machine (use these exact paths/versions):**

| Tool | Binary | Version | Non-interactive flag |
|------|--------|---------|----------------------|
| OpenCode | `opencode` (`~/.opencode/bin/opencode`) | 1.4.3 | `opencode run <message>` |
| Gemini CLI | `gemini` (`/usr/bin/gemini`) | 0.34.0 | `gemini --prompt "<text>" --yolo` |
| Claude Code | `claude` (`~/.local/bin/claude`) | 2.1.112 | `claude --print "<text>" --dangerously-skip-permissions` |

---

## Reference implementation

Study this before writing anything:
- Repo: `https://github.com/openai/codex-plugin-cc`
- Fetch key files with: `gh api repos/openai/codex-plugin-cc/contents/<path> --jq '.content' | base64 -d`

Critical files to read:
- `plugins/codex/.claude-plugin/plugin.json` — plugin metadata format
- `plugins/codex/commands/review.md` — command frontmatter + behavior spec pattern
- `plugins/codex/commands/rescue.md` — foreground/background routing pattern
- `plugins/codex/skills/codex-cli-runtime/SKILL.md` — skill file format
- `.claude-plugin/marketplace.json` — root marketplace descriptor

---

## Project structure to create

```
chorus/
├── .claude-plugin/
│   └── marketplace.json
├── plugins/
│   ├── opencode/
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json
│   │   ├── commands/
│   │   │   ├── run.md
│   │   │   ├── review.md
│   │   │   └── setup.md
│   │   └── scripts/
│   │       └── companion.mjs
│   ├── gemini/
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json
│   │   ├── commands/
│   │   │   ├── run.md
│   │   │   ├── review.md
│   │   │   └── setup.md
│   │   └── scripts/
│   │       └── companion.mjs
│   └── claude/
│       ├── .claude-plugin/
│       │   └── plugin.json
│       ├── commands/
│       │   ├── run.md
│       │   ├── review.md
│       │   └── setup.md
│       └── scripts/
│           └── companion.mjs
├── package.json
└── README.md
```

---

## Plugin format specification

### `.claude-plugin/marketplace.json` (root)

```json
{
  "name": "chorus",
  "owner": { "name": "valpere" },
  "metadata": {
    "description": "Claude Code plugins for AI coding agents: OpenCode, Gemini, Claude",
    "version": "1.0.0"
  },
  "plugins": [
    {
      "name": "opencode",
      "description": "Delegate tasks and code reviews to OpenCode from Claude Code.",
      "version": "1.0.0",
      "author": { "name": "valpere" },
      "source": "./plugins/opencode"
    },
    {
      "name": "gemini",
      "description": "Delegate tasks and code reviews to Gemini CLI from Claude Code.",
      "version": "1.0.0",
      "author": { "name": "valpere" },
      "source": "./plugins/gemini"
    },
    {
      "name": "claude",
      "description": "Delegate tasks and code reviews to a second Claude Code instance.",
      "version": "1.0.0",
      "author": { "name": "valpere" },
      "source": "./plugins/claude"
    }
  ]
}
```

### `plugins/<name>/.claude-plugin/plugin.json`

```json
{
  "name": "<opencode|gemini|claude>",
  "version": "1.0.0",
  "description": "<one-line description>",
  "author": { "name": "valpere" }
}
```

### Command file format (`commands/*.md`)

Frontmatter fields:
- `description` — shown in `/help`
- `argument-hint` — shown in autocomplete
- `allowed-tools` — restrict which tools Claude may use in this command
- `disable-model-invocation: true` — command is pure instruction, no extra LLM call

Body is a markdown instruction prompt for Claude to follow when the command is invoked.
`$ARGUMENTS` expands to the raw text the user typed after the slash command.
`$CLAUDE_PLUGIN_ROOT` expands to the absolute path of the plugin directory at runtime.

---

## Commands to implement per plugin

### `/opencode:run`

Delegates a task to OpenCode non-interactively.

```
opencode run <task-text>
```

Behavior:
- If `--background` in arguments → run in background task, tell user to check status
- If `--wait` or no flag → run in foreground, return stdout verbatim
- Strip `--background`/`--wait` before passing to CLI
- If `opencode` binary not found → tell user to run `/opencode:setup`
- Return output verbatim, no paraphrasing

### `/opencode:review`

Runs an OpenCode code review on the current git working tree.

```
opencode run "Review the current git changes. Focus on correctness, edge cases, and code quality. Output only findings."
```

Prepend a git diff summary to the prompt:
```bash
git diff --stat HEAD
git diff HEAD
```

Pass both as context in the prompt string.

Behavior:
- Default: background (reviews can be slow)
- `--wait`: foreground
- Return output verbatim

### `/opencode:setup`

Checks that `opencode` is installed and authenticated.

```bash
opencode --version
opencode providers  # check auth status
```

Print instructions if missing.

---

### `/gemini:run`

```
gemini --prompt "<task>" --yolo --output-format text
```

Behavior: same foreground/background pattern as opencode.

### `/gemini:review`

Build prompt from `git diff HEAD` and pass via `--prompt`. Use `--approval-mode yolo`.

```bash
gemini --prompt "Review these changes:\n$(git diff HEAD)\n\nFocus on: correctness, security, edge cases." --yolo --output-format text
```

### `/gemini:setup`

Check `gemini --version`, guide through `gemini auth` if needed.

---

### `/claude:run`

Delegates to a second Claude Code instance (useful for a second opinion or parallel work).

```
claude --print "<task>" --dangerously-skip-permissions
```

Behavior: same foreground/background pattern.

### `/claude:review`

```
claude --print "Review the following git diff for correctness, security, and code quality:\n\n$(git diff HEAD)" --dangerously-skip-permissions
```

### `/claude:setup`

Check `claude --version`, verify `ANTHROPIC_API_KEY` is set.

---

## Companion scripts (`scripts/companion.mjs`)

Each plugin gets its own `companion.mjs`. It is a thin Node.js ESM script.

The script accepts a subcommand as argv[2] and remaining args as argv[3+]:

```
node companion.mjs run    "<task text>"
node companion.mjs review "<git diff text>"
node companion.mjs check  # auth/install check, exits 0 or 1
```

Responsibilities:
1. `check`: verify binary exists in PATH, exit 1 with message if not
2. `run`: exec the CLI with correct flags, stream stdout to process.stdout
3. `review`: same as run but with a review-specific prompt prefix

Use `child_process.spawn` (not `exec`) so output streams in real time.

### opencode companion core:

```js
import { spawn } from 'child_process';

const [,, cmd, ...rest] = process.argv;

if (cmd === 'check') {
  // spawnSync('opencode', ['--version']), exit accordingly
}

if (cmd === 'run' || cmd === 'review') {
  const task = rest.join(' ');
  const proc = spawn('opencode', ['run', task], { stdio: 'inherit' });
  proc.on('exit', code => process.exit(code ?? 0));
}
```

### gemini companion core:

```js
spawn('gemini', ['--prompt', task, '--yolo', '--output-format', 'text'], { stdio: 'inherit' })
```

### claude companion core:

```js
spawn('claude', ['--print', task, '--dangerously-skip-permissions'], { stdio: 'inherit' })
```

---

## `package.json`

```json
{
  "name": "chorus",
  "version": "1.0.0",
  "description": "Claude Code plugins for AI coding agents",
  "type": "module",
  "engines": { "node": ">=18.18.0" }
}
```

---

## Implementation steps (in order)

1. Read the Codex plugin reference files listed above — understand the exact frontmatter format
2. Create root `marketplace.json`
3. Implement opencode plugin fully (plugin.json + 3 commands + companion.mjs)
4. Implement gemini plugin fully
5. Implement claude plugin fully
6. Write `README.md` with installation instructions (how to `claude plugin install`)
7. Commit everything with conventional commits
8. Push to `https://github.com/valpere/chorus`

---

## Testing

After implementation, test each plugin:

```bash
# In a git repo with some changes:
/opencode:review --wait
/gemini:review --wait
/claude:review --wait

/opencode:run --wait "What's the purpose of this codebase?"
/gemini:run --wait "Summarize the architecture in 3 sentences."
/claude:run --wait "List potential security issues in this code."
```

Expected: output from each respective CLI, verbatim, no extra commentary.

---

## Notes

- Do not add error handling for impossible cases — trust that the CLIs work as documented
- Return CLI output **verbatim** in all run/review commands — no summaries, no paraphrasing
- Background mode should use Claude Code's native `run_in_background: true` Bash flag
- The `--dangerously-skip-permissions` flag for `/claude:run` is intentional — the delegate claude instance runs in a sandboxed context initiated by the user
- Keep companion scripts minimal — no retries, no caching, no state
