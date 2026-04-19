Made a small open-source thing for people who use AI coding CLIs.

It's called `chorus`: https://github.com/valpere/chorus

It connects Claude Code, OpenCode, Gemini CLI, and Codex so they can delegate tasks to each other. So from Claude Code you can run things like `/gemini:review` or `/codex:run` without switching terminals or copying context.

The main use case for me is getting code reviews from multiple agents at once — not because AI agents are magically right, but because different agents notice different problems. A few independent opinions before merging something is genuinely useful.

chorus now also ships named workflow commands as plugins: `/chorus:review` does the parallel review of `git diff HEAD` in one command (instead of wiring three delegate commands yourself). There is also `/chorus:council`, `/chorus:debug`, and `/chorus:second-opinion` for other common patterns.

One install, four agents available from the tool you already use.
