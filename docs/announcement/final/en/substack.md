# I got tired of copy-pasting between AI coding agents, so I built chorus

For a while my AI coding workflow looked productive from the outside and slightly ridiculous from the inside.

I would start in Claude Code because that was already open in the repo. It would implement something useful. Then I would want a second opinion, so I would switch to another terminal and ask Gemini CLI to review the same change. Then I would ask Codex to write tests, or OpenCode to look at the shape of the refactor.

The result was often good.

The process was not.

Too much copying. Too much context reconstruction. Too many little "wait, which agent saw which files?" moments. Not a big dramatic problem — just the kind of workflow tax that slowly becomes annoying enough to fix.

So I built `chorus`.

---

`chorus` is an open-source cross-agent plugin collection for six AI coding CLIs: Claude Code, OpenCode, Gemini CLI, Codex, Cursor, and Kilo.

The goal is not to replace any of them. I like that these tools have different interfaces and different tradeoffs. The goal is to connect them.

One install. Six AI agents available from your preferred tool.

The mental model is a **6×6 mesh**: every agent can delegate tasks to every other agent.

If you are in Claude Code, you can run:

```text
/opencode:run Try a simpler implementation of this change.
/gemini:review Review the diff for missed edge cases.
/codex:run Add focused regression tests for the new behavior.
/cursor:run Check if this fits the existing patterns.
/kilo:run Review the naming and long-term readability.
```

If you are in OpenCode, you get MCP tools:

```text
delegate_claude
delegate_gemini
delegate_codex
delegate_cursor
delegate_kilo
```

Gemini CLI, Codex, Cursor, and Kilo are supported through skills and rules.

---

The most useful workflow so far is multi-agent review.

I do not want one agent to tell me my code is good. I want a few different agents to attack the change from different angles. One can focus on correctness. One can look at tests. One can look for unnecessary complexity. Then I read the output and decide what is real.

That last part matters.

I am not trying to automate judgment away. I am trying to make it easier to gather useful criticism before I merge something.

AI coding agents are very good at sounding confident. They are also very good at missing things. But they do not all miss the same things. That is the practical advantage.

Sometimes Gemini catches a weird edge case. Sometimes Codex gives a better test plan. Sometimes Claude explains why a refactor is too clever. Sometimes Cursor notices that this pattern doesn't fit the rest of the codebase. Sometimes Kilo flags a naming choice that will confuse the next maintainer.

The value is not that any one agent is "the best". The value is that switching between them should be cheap.

---

chorus now also ships named workflow pattern commands as first-class plugins. The multi-agent review I described above — `/gemini:review`, `/codex:run`, `/opencode:run` — is still there, but there is now a shorter path:

```text
/chorus:review        — parallel review of git diff HEAD, one command, 5 independent opinions
/chorus:council       — same task to all 5 agents with different roles; host synthesizes
/chorus:debug         — ranked root-cause hypotheses from 5 agents for a bug symptom
/chorus:second-opinion — quick check from one chosen agent
```

Five agents run in parallel (Claude, Gemini, Codex, Cursor, Kilo). OpenCode is mesh-connected but excluded from these patterns — its TUI stdout isn't capturable programmatically.

OpenCode gets these as MCP tools. Gemini CLI, Codex, Cursor, and Kilo get them as skills/rules. The idea is the same: you should not have to remember which five delegate commands to wire together every time you want a parallel review. One command, same result.

That is the design philosophy behind `chorus`: no new giant dashboard, no new workflow religion, no forced orchestration layer. Just commands and tools that let the AI coding CLIs talk to each other.

I built it as a working developer, not as a product campaign. My use case is simple: stay in the terminal, keep my current tool, and still get useful work from the other agents when it helps.

The project is open source:
**https://github.com/valpere/chorus**

If you already use Claude Code, OpenCode, Gemini CLI, Codex, Cursor, or Kilo — `chorus` may fit into your workflow without asking you to change the workflow itself.

That is the whole point.

---

*Valentyn Solomko — Ukrainian software engineer*
