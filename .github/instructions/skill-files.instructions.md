---
applyTo: "for-gemini/**/*.md,for-codex/**/*.md"
---

## SKILL.md review guidelines

**Gemini skills** (`for-gemini/`) must have frontmatter with:
- `name` — kebab-case, prefixed with `chorus-`
- `description` — multi-line prose with trigger phrases the model will match on
- `license: MIT`
- `metadata.author` and `metadata.version`

**Codex skills** (`for-codex/`) must have frontmatter with only:
- `name` — kebab-case, prefixed with `chorus-`
- `description` — single concise line

**All skills** must include:
- `## When to use` — bullet list of trigger phrases and scenarios
- `## Invocation` — bash code block with the exact CLI command(s) to run
- `## Output handling` — what to do with the result (verbatim / synthesize / etc.)

**Codex skills** that involve file reading (parallel-review, parallel-debug) must include a `## Known limitation` section noting the sandbox restriction.

Invocation bash blocks must use the correct non-interactive flags:
- Claude: `claude --print "..." --dangerously-skip-permissions`
- Gemini: `gemini --prompt "..." --yolo --output-format text`
- Codex: `codex exec "..."`
