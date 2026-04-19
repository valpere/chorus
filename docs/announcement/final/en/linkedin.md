I built `chorus` — an open-source plugin collection that connects six AI coding CLIs: Claude Code, OpenCode, Gemini CLI, Codex, Cursor, and Kilo.

The idea is simple: keep working in your preferred tool, but delegate tasks to the others when useful. It creates a 6×6 mesh — every agent can delegate to every other agent.

In Claude Code, that means slash commands:
```
/opencode:run
/gemini:review
/codex:run
/cursor:run
/kilo:run
```

In OpenCode, it means MCP tools:
```
delegate_claude
delegate_gemini
delegate_codex
delegate_cursor
delegate_kilo
```

Gemini CLI, Codex, Cursor, and Kilo are supported through skills and rules.

The workflow I find most valuable: parallel code review. Ask multiple agents to review the same diff independently, then make the engineering decision yourself. Different agents catch different things — edge cases, weak tests, unnecessary complexity. None of them replaces judgment. They just make it cheaper to get diverse criticism before merging.

chorus now also ships **named workflow pattern commands** as first-class plugins — so the common patterns have a single command instead of five:

```
/chorus:review        — parallel review of git diff HEAD, 5 independent opinions
/chorus:council       — same task to all 5 agents with different roles; host synthesizes
/chorus:debug         — ranked root-cause hypotheses from 5 agents for a bug symptom
/chorus:second-opinion — quick independent check from one chosen agent
```

Five agents run in parallel (Claude, Gemini, Codex, Cursor, Kilo). OpenCode participates in the mesh but is excluded from parallel patterns — its TUI stdout isn't capturable programmatically.

OpenCode gets these as MCP tools (`council`, `parallel_review`, `parallel_debug`, `second_opinion`). Gemini CLI, Codex, Cursor, and Kilo get them as skills/rules.

Open source: https://github.com/valpere/chorus

#OpenSource #DeveloperTools #AITools #ClaudeCode #Gemini
