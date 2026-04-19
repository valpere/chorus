---
description: Check that Cursor Agent CLI is installed and authenticated
argument-hint: ""
disable-model-invocation: true
allowed-tools: Bash(agent:*)
---

Check that Cursor Agent CLI is installed and authenticated.

Steps:
1. Check if `agent` binary exists in PATH:
   ```bash
   which agent
   ```

2. Check version:
   ```bash
   agent --version
   ```

If any check fails, provide installation instructions:

**Cursor Agent CLI Installation:**

Cursor Agent CLI requires an active Cursor subscription and the Cursor desktop app.

Install via npm:
```bash
npm install -g @cursor/agent
```

Or download from: https://cursor.com/docs/cli

**Authentication:**

The CLI authenticates using your Cursor account. Set the API key:
```bash
export CURSOR_API_KEY=your_api_key_here
```

Or log in interactively after installation.
