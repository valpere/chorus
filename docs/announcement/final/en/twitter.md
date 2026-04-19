1/6
I built `chorus`: open-source plugins that connect Claude Code, OpenCode, Gemini CLI, Codex, Cursor, and Kilo.

One install, six AI coding agents available from the tool you already use.

https://github.com/valpere/chorus

---

2/6
The model is a 6×6 mesh.

Every agent can delegate tasks to every other agent.

Claude Code → OpenCode, Gemini, Codex, Cursor, Kilo.
OpenCode → Claude, Gemini, Codex, Cursor, Kilo.
And so on in every direction.

---

3/6
In Claude Code:
```
/opencode:run
/gemini:review
/codex:run
/cursor:run
/kilo:run
```

In OpenCode:
```
delegate_claude
delegate_gemini
delegate_codex
delegate_cursor
delegate_kilo
```

Gemini CLI, Codex, Cursor, and Kilo get skills/rules.

---

4/6
My favorite workflow: parallel code review.

Send the same diff to multiple agents. Let them disagree. Read the output yourself.

Different agents catch different bugs, weak tests, and over-complicated abstractions. They fail differently. That's useful.

---

5/6
`chorus` is not trying to be a new IDE or orchestration platform.

It's glue between tools developers already use. Stop being the clipboard between your AI agents.

https://github.com/valpere/chorus

---

6/6
chorus now ships named workflow commands as plugins:

`/chorus:review` — one command, parallel review of `git diff HEAD`, 5 independent opinions
`/chorus:council` — same task to all 5 agents, different roles
`/chorus:debug` — ranked root-cause hypotheses from 5 agents
`/chorus:second-opinion` — quick check from one chosen agent

https://github.com/valpere/chorus
