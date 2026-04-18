1/5
Зробив `chorus`: open-source плагіни, які зʼєднують Claude Code, OpenCode, Gemini CLI та Codex.

Одна інсталяція, чотири AI coding agents із того інструмента, яким ви вже користуєтесь.

https://github.com/valpere/chorus

---

2/5
Модель проста: mesh 4×3.

Кожен агент може делегувати задачі трьом іншим.

Claude Code → OpenCode, Gemini, Codex.
OpenCode → Claude, Gemini, Codex.
І так в усіх напрямках.

---

3/5
У Claude Code:
```
/opencode:run
/gemini:review
/codex:run
```

В OpenCode:
```
delegate_claude
delegate_gemini
delegate_codex
```

Gemini CLI та Codex отримують skills.

---

4/5
Мій улюблений workflow: паралельне code review.

Даєш один diff кільком агентам. Дозволяєш їм не погоджуватись. Читаєш результат сам.

Різні агенти ловлять різні bugs, слабкі тести й зайві абстракції. Помиляються вони по-різному. І це корисно.

---

5/5
`chorus` не намагається бути новою IDE або orchestration platform.

Це glue між інструментами, якими розробники вже користуються. Перестаньте бути clipboard між своїми AI agents.

https://github.com/valpere/chorus

---

6/6
chorus тепер має named workflow команди як плагіни:

`/chorus:review` — одна команда, паралельне review `git diff HEAD`
`/chorus:council` — одне завдання трьом агентам, різні ролі
`/chorus:debug` — ранжовані гіпотези від 3 агентів
`/chorus:second-opinion` — швидка перевірка одним обраним агентом

https://github.com/valpere/chorus
