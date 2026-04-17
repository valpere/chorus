---
description: Check Codex CLI installation and authentication
argument-hint: ""
disable-model-invocation: true
allowed-tools: Bash(node:*)
---

Check if Codex CLI is installed and working properly.

Run:
```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/companion.mjs" check
```

If successful, report: "Codex is ready to use."
If the check fails, report the error and suggest installing Codex CLI.
