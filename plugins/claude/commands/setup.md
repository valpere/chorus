---
description: Check that Claude Code is installed and authenticated
argument-hint: ""
disable-model-invocation: true
allowed-tools: Bash(claude:*)
---

Check that Claude Code CLI is installed and authenticated.

Steps:
1. Check if `claude` binary exists in PATH:
   ```bash
   which claude
   ```

2. Check Claude version:
   ```bash
   claude --version
   ```

3. Check that ANTHROPIC_API_KEY is set:
   ```bash
   if [ -n "$ANTHROPIC_API_KEY" ]; then echo "ANTHROPIC_API_KEY is set"; else echo "ANTHROPIC_API_KEY is not set"; fi
   ```

If any check fails, provide installation instructions:

**Claude Code Installation:**

Install via npm:
```bash
npm install -g @anthropic-ai/claude-code
```

Or download from: https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview

**Authentication:**

Claude Code requires an Anthropic API key. Set it as an environment variable:

```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

Get your API key from: https://console.anthropic.com/settings/keys
