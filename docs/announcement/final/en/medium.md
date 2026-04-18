# chorus: a cross-agent plugin mesh for AI coding CLIs

Most AI coding tools are designed like islands.

You pick one — Claude Code, OpenCode, Gemini CLI, or Codex — and stay inside its workflow. A second opinion means copying context, switching terminals, re-explaining the task, waiting, comparing answers, and manually carrying the result back.

I built **chorus** to remove that step.

## What it does

chorus is an open-source plugin collection that creates a **4×3 delegation mesh** between four AI coding CLIs:

| From \ To   | Claude | OpenCode | Gemini | Codex |
|-------------|--------|----------|--------|-------|
| Claude Code |   —    |  ✅      |  ✅    |  ✅   |
| OpenCode    |  ✅    |  —       |  ✅    |  ✅   |
| Gemini CLI  |  ✅    |  ✅      |  —     |  ✅   |
| Codex       |  ✅    |  ✅      |  ✅    |  —    |
|-------------|--------|----------|--------|-------|

Each agent can delegate tasks to the other three, without leaving its own interface.

## How it integrates

**Claude Code** gets slash commands:
```
/opencode:run refactor the auth module
/gemini:review check this diff for edge cases
/codex:run write tests for the new retry logic
```

**OpenCode** gets MCP tools:
```
delegate_claude("review this migration for data loss risk")
delegate_gemini("analyze this for performance bottlenecks")
delegate_codex("add integration tests")
```

**Gemini CLI** and **Codex** get skills — install once, then just ask them to delegate in natural language.

## The workflow that actually matters

Parallel code review. Ask three different agents to review the same diff independently, each with a different focus:

```text
/gemini:review — correctness and edge cases
/codex:run    — test coverage
/opencode:run — architecture and simplification
```

Different models have genuinely different failure modes. One may miss an edge case another catches. One may overweight architecture where another spots a missing test. You read all three and make the call. The agents provide the raw material; judgment stays with you.

## Workflow patterns

The ad-hoc parallel review above works, but chorus also ships named workflow commands as first-class installable plugins:

| Command | What it does |
|---|---|
| `/chorus:review` | Parallel review of `git diff HEAD` — one command, 3 independent opinions |
| `/chorus:council` | Same task to all 3 agents with different roles (correctness / edge-cases / scope); host synthesizes |
| `/chorus:debug` | Ranked root-cause hypotheses from 3 agents for a bug symptom |
| `/chorus:second-opinion` | Quick independent check from one chosen agent (`--agent gemini\|claude\|codex`) |

OpenCode gets these as MCP tools: `council`, `parallel_review`, `parallel_debug`, `second_opinion`. Gemini CLI and Codex get them as skills: `chorus-council`, `chorus-parallel-review`, `chorus-parallel-debug`, `chorus-second-opinion`.

So instead of wiring up three separate delegate commands for a review, you just run `/chorus:review` and read the output.

## Install

```bash
# Claude Code
claude plugin install https://github.com/valpere/chorus

# OpenCode
opencode plugin @valpere/chorus-opencode
```

Full installation for Gemini CLI and Codex is in the README.

chorus is not trying to be a new IDE or orchestration platform. It is plumbing between tools developers already use. One install, four agents, zero new workflows forced on you.

**https://github.com/valpere/chorus**

---

*Valentyn Solomko — Ukrainian software engineer*
