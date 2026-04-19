Зробив `chorus` — open-source колекцію плагінів, яка зʼєднує шість AI coding CLI: Claude Code, OpenCode, Gemini CLI, Codex, Cursor та Kilo.

Ідея проста: залишатися у своєму улюбленому інструменті, але делегувати задачі іншим агентам, коли це корисно. Виходить mesh 6×6 — кожен агент може делегувати будь-якому іншому.

У Claude Code — slash commands:
```
/opencode:run
/gemini:review
/codex:run
/cursor:run
/kilo:run
```

В OpenCode — MCP tools:
```
delegate_claude
delegate_gemini
delegate_codex
delegate_cursor
delegate_kilo
```

Gemini CLI, Codex, Cursor та Kilo підтримуються через skills і rules.

Найцікавіший workflow: паралельне code review. Даєш один diff кільком агентам незалежно, читаєш результат і сам приймаєш інженерне рішення. Різні агенти помічають різне — edge cases, прогалини в тестах, зайву складність, невідповідність паттернам. Жоден не замінює judgment. Вони просто роблять дешевшим отримання різноманітної критики перед merge.

У chorus тепер є також **named workflow команди** — встановлюються як окремі плагіни, тому найпоширеніші патерни мають одну команду замість пʼяти:

```
/chorus:review        — паралельне review git diff HEAD, 5 незалежних думок
/chorus:council       — одне завдання пʼятьом агентам із різними ролями; host синтезує
/chorus:debug         — ранжовані гіпотези першопричини від 5 агентів
/chorus:second-opinion — швидка незалежна перевірка одним обраним агентом
```

Пʼять агентів паралельно (Claude, Gemini, Codex, Cursor, Kilo). OpenCode підключений до mesh, але виключений із паралельних паттернів — TUI stdout не захопити програматично.

OpenCode отримує їх як MCP tools (`council`, `parallel_review`, `parallel_debug`, `second_opinion`). Gemini CLI, Codex, Cursor та Kilo — як skills і rules.

Open source: https://github.com/valpere/chorus

#OpenSource #DeveloperTools #AITools #Ukraine
