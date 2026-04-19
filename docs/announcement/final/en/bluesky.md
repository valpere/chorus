Post 1:
Built `chorus` — open-source plugins that let AI coding CLIs delegate to each other. Claude Code, OpenCode, Gemini CLI, Codex, Cursor, Kilo. Install once, use any agent from the tool you already like. Full 6×6 mesh. https://github.com/valpere/chorus

---

Post 2:
The useful part is the 5-agent council. Claude (Correctness), Gemini (Edge Cases), Codex (Scope), Cursor (Integration), Kilo (Maintainability). None is "the truth". The value is that they fail differently and cover more ground. OpenCode hosts but doesn't join — TUI stdout can't be captured.

---

Post 3:
chorus supports Claude Code slash commands, OpenCode MCP tools, and skills/rules for Gemini CLI, Codex, Cursor, and Kilo. Basically plumbing for devs who use multiple AI agents and are tired of being the clipboard.

---

Post 4:
chorus now ships named workflow commands. `/chorus:review` runs parallel review of `git diff HEAD` — one command, 5 independent opinions. `/chorus:council`, `/chorus:debug`, and `/chorus:second-opinion` are also in.
