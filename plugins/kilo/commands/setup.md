---
description: Check that Kilo Code CLI is installed and authenticated
argument-hint: ""
disable-model-invocation: true
allowed-tools: Bash(kilo:*)
---

Check that Kilo Code CLI is installed and authenticated.

Steps:
1. Check if `kilo` binary exists in PATH:
   ```bash
   which kilo
   ```

2. Check version:
   ```bash
   kilo --version
   ```

If any check fails, provide installation instructions:

**Kilo Code CLI Installation:**

Kilo Code CLI requires Node.js 18+ and npm.

Install via npm:
```bash
npm install -g kilocode
```

Or download from: https://kilo.ai/docs/cli

**Authentication:**

Set your organisation ID:
```bash
export KILO_ORG_ID=your_org_id_here
```

Or authenticate interactively after installation.
