# Chorus — Copilot Instructions

Chorus is a cross-agent plugin collection that lets AI coding CLIs delegate tasks to each other. It exposes capabilities on four installation surfaces: Claude Code (slash-command plugins), OpenCode (MCP npm package), Gemini CLI (SKILL.md skills), and Codex (SKILL.md skills).

## Architecture

- `plugins/*/commands/*.md` — Claude Code slash command definitions. Frontmatter must include `description`, `argument-hint`, `disable-model-invocation: true`, and `allowed-tools`.
- `plugins/*/scripts/companion.mjs` — Node.js ESM scripts that spawn external CLI processes. Use `spawn` with `stdio: 'pipe'` when output must be captured; use `stdio: 'inherit'` for pass-through. Use `spawnSync` only for version checks.
- `for-opencode/src/index.js` — MCP stdio server using `@modelcontextprotocol/sdk`. Tools are defined in a `TOOLS` array; the `tools/call` handler switches on `request.params.name`.
- `for-gemini/*/SKILL.md` and `for-codex/*/SKILL.md` — natural-language skill files. Gemini frontmatter requires `name`, `description`, `license`, `metadata`. Codex frontmatter requires only `name` and `description`.

## Code style

- ESM throughout (`import`/`export`). No CommonJS `require`.
- No TypeScript — plain `.mjs` and `.js` files.
- No build step. Files run directly with Node.js >= 18.18.0.
- Prefer `Promise.all` for parallel agent spawns. Never await sequentially when tasks are independent.
- Error handling: companion scripts resolve (not reject) on agent failure, returning `{ code, output, error }` so one failed agent doesn't abort the others.

## Known limitations to consider in review

- OpenCode (`opencode run`) is a TUI — its stdout is not capturable. Do not add OpenCode as a parallel delegate in orchestration workflows.
- Codex runs in a bubblewrap sandbox limited to its working directory. Parallel review and debug skills note this restriction; new Codex-facing skills must repeat the warning.
- `claude --print` is the correct non-interactive invocation for Claude Code. Do not suggest `claude run` or bare `claude`.

## Testing

There are no automated tests. Reviews should check: correct spawn arguments per agent, proper delimiter output format (`═══ AGENT: name ═══`), and that the command markdown synthesis instructions are clear and actionable.
