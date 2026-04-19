I built `chorus` — an open-source plugin collection that connects four AI coding CLIs: Claude Code, OpenCode, Gemini CLI, and Codex.

The idea is simple: keep working in your preferred tool, but delegate tasks to the others when useful. It creates a 4×3 mesh — each agent can run tasks on the other three.

In Claude Code, that means slash commands:
```
/opencode:run
/gemini:review
/codex:run
```

In OpenCode, it means MCP tools:
```
delegate_claude
delegate_gemini
delegate_codex
```

Gemini CLI and Codex are supported through skills.

The workflow I find most valuable: parallel code review. Ask multiple agents to review the same diff independently, then make the engineering decision yourself. Different agents catch different things — edge cases, weak tests, unnecessary complexity. None of them replaces judgment. They just make it cheaper to get diverse criticism before merging.

chorus now also ships **named workflow pattern commands** as first-class plugins — so the common patterns have a single command instead of three:

```
/chorus:review        — parallel review of git diff HEAD, 3 independent opinions
/chorus:council       — same task to all 3 agents with different roles; host synthesizes
/chorus:debug         — ranked root-cause hypotheses from 3 agents for a bug symptom
/chorus:second-opinion — quick independent check from one chosen agent
```

OpenCode gets these as MCP tools (`council`, `parallel_review`, `parallel_debug`, `second_opinion`). Gemini CLI and Codex get them as skills (`chorus-council`, `chorus-parallel-review`, etc.).

Open source: https://github.com/valpere/chorus

#OpenSource #DeveloperTools #AITools #ClaudeCode #Gemini
