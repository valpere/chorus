Post 1:
Зробив `chorus` — open-source плагіни, які дозволяють AI coding CLI делегувати одне одному. Claude Code, OpenCode, Gemini CLI, Codex, Cursor, Kilo. Встановіть раз, використовуйте будь-якого агента зі свого улюбленого інструмента. Повна mesh 6×6. https://github.com/valpere/chorus

---

Post 2:
Найкорисніше — 5-агентна рада. Claude (Correctness), Gemini (Edge Cases), Codex (Scope), Cursor (Integration), Kilo (Maintainability). Жоден не є "істиною". Цінність у тому, що помиляються вони по-різному і покривають більше. OpenCode — хост, але не учасник: TUI stdout не захопити.

---

Post 3:
chorus: slash commands для Claude Code, MCP tools для OpenCode, skills/rules для Gemini CLI, Codex, Cursor та Kilo. По суті — plumbing для розробників, які вже користуються кількома AI agents і втомилися бути clipboard між ними.

---

Post 4:
chorus тепер має named workflow команди. `/chorus:review` — паралельне review `git diff HEAD` одною командою замість пʼяти. 5 незалежних думок. Також є `/chorus:council`, `/chorus:debug` та `/chorus:second-opinion`. Доступні як slash commands, MCP tools і skills/rules.
