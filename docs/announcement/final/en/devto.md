# Chorus: letting AI coding CLIs review each other

I use several AI coding CLIs depending on the task.

Claude Code is good at one kind of workflow. OpenCode has its own shape. Gemini CLI is useful when I want another model family in the loop. Codex is often strong when I need a second implementation or review pass.

The annoying part is not the models. The annoying part is switching tools.

`chorus` is my attempt to remove that friction.

It is an open-source cross-agent plugin collection for four AI coding CLIs:

- Claude Code
- OpenCode
- Gemini CLI
- Codex

The idea is simple: from the tool I am already using, I should be able to delegate a task to the other agents.

That creates a **4×3 mesh**. Each agent can call the other three.

## What it looks like in practice

From Claude Code:

```text
/gemini:review Review this diff for hidden edge cases and missing tests.
/codex:run Add regression tests for the parser bug we just fixed.
/opencode:run Try a smaller refactor of the auth middleware without changing behavior.
```

From OpenCode, the same idea is exposed through MCP tools:

```text
delegate_claude
delegate_gemini
delegate_codex
```

Gemini CLI and Codex get skills installed so they can delegate in any direction too.

## The main use case: parallel review

Instead of asking one agent "is this fine?", ask three different agents to review the same change independently.

Different agents have different failure modes. One will over-focus on architecture. Another will catch a small test gap. Another will suggest a simpler implementation. Often one of them is wrong. That is fine. The value is in having multiple independent passes without leaving the terminal.

```text
/gemini:review Check correctness and missed edge cases.
/codex:run Review test coverage and suggest missing cases.
/opencode:run Look for simplifications and risky abstractions.
```

This is not about pretending agents are teammates. It is about using model disagreement as a tool.

## Workflow patterns

The ad-hoc parallel review above works fine, but chorus now also ships named workflow pattern commands as first-class installable plugins — so the common patterns have a single command instead of three:

| Command | What it does |
|---|---|
| `/chorus:review` | Parallel review of `git diff HEAD` — one command, 3 independent opinions |
| `/chorus:council` | Same task to all 3 agents with different roles (correctness / edge-cases / scope); host synthesizes |
| `/chorus:debug` | Ranked root-cause hypotheses from 3 agents for a bug symptom |
| `/chorus:second-opinion` | Quick independent check from one chosen agent (`--agent gemini\|claude\|codex`) |

So instead of manually wiring `/gemini:review`, `/codex:run`, and `/opencode:run` with different prompts each time, you just run `/chorus:review`.

OpenCode gets these as MCP tools (`council`, `parallel_review`, `parallel_debug`, `second_opinion`). Gemini CLI and Codex get them as skills (`chorus-council`, `chorus-parallel-review`, `chorus-parallel-debug`, `chorus-second-opinion`).

## Design philosophy

The important design constraint for `chorus` is that it does not try to become a new AI IDE or orchestration platform. It is glue.

One install gives you access to the other agents from your preferred tool. Claude Code gets slash commands. OpenCode gets MCP tools. Gemini CLI and Codex get skills.

Keep using the interface you already like, but stop treating each CLI as an isolated island.

## Installation

```bash
# Claude Code
claude plugin install https://github.com/valpere/chorus

# OpenCode
opencode plugin @valpere/chorus-opencode

# Gemini CLI
gemini skills install https://github.com/valpere/chorus --path for-gemini/claude
gemini skills install https://github.com/valpere/chorus --path for-gemini/opencode
gemini skills install https://github.com/valpere/chorus --path for-gemini/codex
```

I built this because my own workflow had become repetitive — make a change in one CLI, copy context into another, ask for a review, manually bring the useful parts back. It worked, but it was clumsy.

`chorus` turns that into a normal command.

GitHub: **https://github.com/valpere/chorus**

If you already use more than one AI coding CLI, this may fit your workflow without asking you to change it. If you only use one, multi-agent review may still be worth trying on risky changes. A second opinion from a different agent is often cheaper than debugging the same blind spot later.

---

*Valentyn Solomko — Ukrainian software engineer*
