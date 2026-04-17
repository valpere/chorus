---
description: Check that Gemini CLI is installed and authenticated
argument-hint: ""
disable-model-invocation: true
allowed-tools: Bash(gemini:*)
---

Check that Gemini CLI is installed and authenticated.

Steps:
1. Check if `gemini` binary exists in PATH:
   ```bash
   which gemini
   ```

2. Check Gemini version:
   ```bash
   gemini --version
   ```

3. Check authentication status:
   ```bash
   gemini auth
   ```

If any check fails, provide installation instructions:

**Gemini CLI Installation:**

Gemini CLI requires Node.js 18+ and npm.

Install via npm:
```bash
npm install -g @google/gemini-cli
```

Or download from: https://github.com/google-gemini/gemini-cli

**Authentication:**

After installation, authenticate with:
```bash
gemini auth
```

Follow the prompts to complete authentication.
