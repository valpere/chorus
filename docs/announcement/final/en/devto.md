# Chorus: letting AI coding CLIs review each other

I use several AI coding CLIs depending on the task.

Claude Code is good at one kind of workflow. OpenCode has its own shape. Gemini CLI is useful when I want another model family in the loop. Codex is often strong when I need a second implementation or review pass. Cursor Agent CLI has strong repo-wide context. Kilo Code CLI is focused on maintainability and readability.

The annoying part is not the models. The annoying part is switching tools.

`chorus` is my attempt to remove that friction.

It is an open-source cross-agent plugin collection for six AI coding CLIs:

- Claude Code
- OpenCode
- Gemini CLI
- Codex
- Cursor Agent CLI
- Kilo Code CLI

The idea is simple: from the tool I am already using, I should be able to delegate a task to the other agents.

That creates a **full 6×6 mesh**. Every agent can delegate to every other agent.

## What it looks like in practice

From Claude Code:

```text
/gemini:review Review this diff for hidden edge cases and missing tests.
/codex:run Add regression tests for the parser bug we just fixed.
/opencode:run Try a smaller refactor of the auth middleware without changing behavior.
/cursor:run Check if this change fits the existing patterns in the repo.
/kilo:run Review this for naming clarity and long-term maintainability.
```

From OpenCode, the same idea is exposed through MCP tools:

```text
delegate_claude
delegate_gemini
delegate_codex
delegate_cursor
delegate_kilo
```

Gemini CLI, Codex, Cursor, and Kilo get skills/rules installed so they can delegate in any direction too.

## The main use case: parallel review

Instead of asking one agent "is this fine?", ask five different agents to review the same change independently.

Different agents have different failure modes. One will over-focus on architecture. Another will catch a small test gap. Another will suggest a simpler implementation. Another will flag a pattern inconsistency. Another will notice a naming issue that'll confuse the next maintainer. Often one of them is wrong. That is fine. The value is in having multiple independent passes without leaving the terminal.

```text
/gemini:review   Check correctness and missed edge cases.
/codex:run       Review test coverage and suggest missing cases.
/cursor:run      Check for codebase integration and pattern consistency.
/kilo:run        Review for maintainability and naming clarity.
/claude:review   Security and correctness review.
```

This is not about pretending agents are teammates. It is about using model disagreement as a tool.

## Workflow patterns

The ad-hoc parallel review above works fine, but chorus now also ships named workflow pattern commands as first-class installable plugins — so the common patterns have a single command instead of five:

| Command | What it does |
|---|---|
| `/chorus:review` | Parallel review of `git diff HEAD` — one command, 5 independent opinions |
| `/chorus:council` | Same task to all 5 agents with different roles (correctness / edge-cases / scope / integration / maintainability); host synthesizes |
| `/chorus:debug` | Ranked root-cause hypotheses from 5 agents for a bug symptom |
| `/chorus:second-opinion` | Quick independent check from one chosen agent (`--agent claude\|gemini\|codex\|cursor\|kilo`) |

Five agents run in parallel: Claude, Gemini, Codex, Cursor, Kilo. OpenCode participates in the 6×6 mesh but is excluded from parallel workflow patterns — its TUI stdout isn't capturable programmatically.

So instead of manually wiring `/gemini:review`, `/codex:run`, and `/cursor:run` with different prompts each time, you just run `/chorus:review`.

OpenCode gets these as MCP tools (`council`, `parallel_review`, `parallel_debug`, `second_opinion`). Gemini CLI, Codex, Cursor, and Kilo get them as skills/rules.

## Design philosophy

The important design constraint for `chorus` is that it does not try to become a new AI IDE or orchestration platform. It is glue.

One install gives you access to the other agents from your preferred tool. Claude Code gets slash commands. OpenCode gets MCP tools. Gemini CLI, Codex, Cursor, and Kilo get skills/rules.

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
gemini skills install https://github.com/valpere/chorus --path for-gemini/cursor
gemini skills install https://github.com/valpere/chorus --path for-gemini/kilo
```

Full installation for Codex, Cursor, and Kilo is in the README.

I built this because my own workflow had become repetitive — make a change in one CLI, copy context into another, ask for a review, manually bring the useful parts back. It worked, but it was clumsy.

`chorus` turns that into a normal command.

GitHub: **https://github.com/valpere/chorus**

If you already use more than one AI coding CLI, this may fit your workflow without asking you to change it. If you only use one, multi-agent review may still be worth trying on risky changes. A second opinion from a different agent is often cheaper than debugging the same blind spot later.

---

*Valentyn Solomko — Ukrainian software engineer*
