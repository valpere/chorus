1/6
Зробив `chorus`: open-source плагіни, які зʼєднують Claude Code, OpenCode, Gemini CLI, Codex, Cursor та Kilo.

Одна інсталяція, шість AI coding agents із того інструмента, яким ви вже користуєтесь.

https://github.com/valpere/chorus

---

2/6
Модель проста: mesh 6×6.

Кожен агент може делегувати задачі будь-якому іншому.

Claude Code → OpenCode, Gemini, Codex, Cursor, Kilo.
OpenCode → Claude, Gemini, Codex, Cursor, Kilo.
І так в усіх напрямках.

---

3/6
У Claude Code:
```
/opencode:run
/gemini:review
/codex:run
/cursor:run
/kilo:run
```

В OpenCode:
```
delegate_claude
delegate_gemini
delegate_codex
delegate_cursor
delegate_kilo
```

Gemini CLI, Codex, Cursor та Kilo отримують skills/rules.

---

4/6
Мій улюблений workflow: паралельне code review.

Даєш один diff кільком агентам. Дозволяєш їм не погоджуватись. Читаєш результат сам.

Різні агенти ловлять різні bugs, слабкі тести й зайві абстракції. Помиляються вони по-різному. І це корисно.

---

5/6
`chorus` не намагається бути новою IDE або orchestration platform.

Це glue між інструментами, якими розробники вже користуються. Перестаньте бути clipboard між своїми AI agents.

https://github.com/valpere/chorus

---

6/6
chorus тепер має named workflow команди як плагіни:

`/chorus:review` — одна команда, паралельне review `git diff HEAD`, 5 незалежних думок
`/chorus:council` — одне завдання пʼятьом агентам, різні ролі
`/chorus:debug` — ранжовані гіпотези від 5 агентів
`/chorus:second-opinion` — швидка перевірка одним обраним агентом

https://github.com/valpere/chorus
