---
applyTo: "for-gemini/**/*.md,for-codex/**/*.md,for-kilo/**/*.md,for-cursor/**/*.mdc"
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

**Second-opinion defaults are host-specific**: a host's own skill should not default to itself. Example: the chorus command defaults to Gemini; `for-gemini/second-opinion` defaults to Claude (Gemini is the caller, so it asks someone else).

Invocation bash blocks must use the correct non-interactive flags:
- Claude: `claude --print "..." --dangerously-skip-permissions`
- Gemini: `gemini --prompt "..." --yolo --output-format text`
- Codex: `codex exec "..."`
- Cursor: `agent -p --force "..."` (binary is `agent`, not `cursor`)
- Kilo: `kilo run --auto "..."`
