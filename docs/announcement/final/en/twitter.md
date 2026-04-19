1/5
I built `chorus`: open-source plugins that connect Claude Code, OpenCode, Gemini CLI, and Codex.

One install, four AI coding agents available from the tool you already use.

https://github.com/valpere/chorus

---

2/5
The model is a 4×3 mesh.

Each agent can delegate tasks to the other three.

Claude Code → OpenCode, Gemini, Codex.
OpenCode → Claude, Gemini, Codex.
And so on in every direction.

---

3/5
In Claude Code:
```
/opencode:run
/gemini:review
/codex:run
```

In OpenCode:
```
delegate_claude
delegate_gemini
delegate_codex
```

Gemini CLI and Codex get skills.

---

4/5
My favorite workflow: parallel code review.

Send the same diff to multiple agents. Let them disagree. Read the output yourself.

Different agents catch different bugs, weak tests, and over-complicated abstractions. They fail differently. That's useful.

---

5/5
`chorus` is not trying to be a new IDE or orchestration platform.

It's glue between tools developers already use. Stop being the clipboard between your AI agents.

https://github.com/valpere/chorus

---

6/6
chorus now ships named workflow commands as plugins:

`/chorus:review` — one command, parallel review of `git diff HEAD`
`/chorus:council` — same task to all 3 agents, different roles
`/chorus:debug` — ranked root-cause hypotheses from 3 agents
`/chorus:second-opinion` — quick check from one chosen agent

https://github.com/valpere/chorus
