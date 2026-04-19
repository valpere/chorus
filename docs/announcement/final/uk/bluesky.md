Post 1:
Зробив `chorus` — open-source плагіни, які дозволяють AI coding CLI делегувати одне одному. Claude Code, OpenCode, Gemini CLI, Codex. Встановіть раз, використовуйте інших агентів зі свого улюбленого інструмента. https://github.com/valpere/chorus

---

Post 2:
Найкорисніше — паралельне review. Codex дивиться на correctness, Gemini на edge cases, OpenCode на scope, Claude на maintainability. Жоден не є "істиною". Цінність у тому, що помиляються вони по-різному.

---

Post 3:
chorus: slash commands для Claude Code, MCP tools для OpenCode, skills для Gemini CLI / Codex. По суті — plumbing для розробників, які вже користуються кількома AI agents і втомилися бути clipboard між ними.

---

Post 4:
chorus тепер має named workflow команди. `/chorus:review` — паралельне review `git diff HEAD` одною командою замість трьох. Також є `/chorus:council`, `/chorus:debug` та `/chorus:second-opinion`. Доступні як slash commands, MCP tools і skills.
