Зробив `chorus` — open-source колекцію плагінів, яка зʼєднує чотири AI coding CLI: Claude Code, OpenCode, Gemini CLI та Codex.

Ідея проста: залишатися у своєму улюбленому інструменті, але делегувати задачі іншим агентам, коли це корисно. Виходить mesh 4×3 — кожен агент може запускати задачі на трьох інших.

У Claude Code — slash commands:
```
/opencode:run
/gemini:review
/codex:run
```

В OpenCode — MCP tools:
```
delegate_claude
delegate_gemini
delegate_codex
```

Gemini CLI та Codex підтримуються через skills.

Найцікавіший workflow: паралельне code review. Даєш один diff кільком агентам незалежно, читаєш результат і сам приймаєш інженерне рішення. Різні агенти помічають різне — edge cases, прогалини в тестах, зайву складність. Жоден не замінює judgment. Вони просто роблять дешевшим отримання різноманітної критики перед merge.

У chorus тепер є також **named workflow команди** — встановлюються як окремі плагіни, тому найпоширеніші патерни мають одну команду замість трьох:

```
/chorus:review        — паралельне review git diff HEAD, 3 незалежні думки
/chorus:council       — одне завдання трьом агентам із різними ролями; host синтезує
/chorus:debug         — ранжовані гіпотези першопричини від 3 агентів
/chorus:second-opinion — швидка незалежна перевірка одним обраним агентом
```

OpenCode отримує їх як MCP tools (`council`, `parallel_review`, `parallel_debug`, `second_opinion`). Gemini CLI та Codex — як skills (`chorus-council`, `chorus-parallel-review` тощо).

Open source: https://github.com/valpere/chorus

#OpenSource #DeveloperTools #AITools #Ukraine
