Post 1:
Built `chorus` — open-source plugins that let AI coding CLIs delegate to each other. Claude Code, OpenCode, Gemini CLI, Codex. Install once, use the other agents from the tool you already like. https://github.com/valpere/chorus

---

Post 2:
The useful part is parallel review. Ask Codex to focus on correctness, Gemini on edge cases, OpenCode on scope, Claude on maintainability. None of them is "the truth". The value is that they fail differently.

---

Post 3:
chorus supports Claude Code slash commands, OpenCode MCP tools, and skills for Gemini CLI / Codex. Basically plumbing for devs who use more than one AI coding agent and are tired of being the clipboard.

---

Post 4:
chorus now ships named workflow commands. `/chorus:review` runs parallel review of `git diff HEAD` — one command, 3 independent opinions. `/chorus:council`, `/chorus:debug`, and `/chorus:second-opinion` are also in. Available as Claude Code slash commands, OpenCode MCP tools, and Gemini/Codex skills.
