---
description: Check that OpenCode is installed and authenticated
argument-hint: ""
disable-model-invocation: true
allowed-tools: Bash(opencode:*)
---

Check that OpenCode CLI is installed and authenticated.

Steps:
1. Check if `opencode` binary exists in PATH:
   ```bash
   which opencode
   ```

2. Check OpenCode version:
   ```bash
   opencode --version
   ```

3. Check authentication status:
   ```bash
   opencode providers
   ```

If any check fails, provide installation instructions:

**OpenCode Installation:**

OpenCode requires Node.js 18+ and npm.

Install via npm:
```bash
npm install -g @opencode/cli
```

Or download from: https://opencode.ai

**Authentication:**

After installation, authenticate with:
```bash
opencode login
```

Follow the browser prompts to complete authentication.
