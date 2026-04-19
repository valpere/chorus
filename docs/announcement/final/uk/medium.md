# chorus: крос-агентна mesh для AI coding CLI

Більшість AI coding tools зроблені як острови.

Ви обираєте один — Claude Code, OpenCode, Gemini CLI або Codex — і залишаєтеся в його workflow. Хочете другу думку? Треба скопіювати контекст, перейти в інший термінал, заново пояснити задачу, зачекати, порівняти відповіді й вручну перенести корисне назад.

Я зробив **chorus**, щоб прибрати цей крок.

## Що це таке

chorus — open-source колекція плагінів, яка створює **mesh делегування 6×6** між шістьма AI coding CLI:

| Від \ До    | Claude | OpenCode | Gemini | Codex | Cursor | Kilo |
|-------------|--------|----------|--------|-------|--------|------|
| Claude Code |   —    |  ✅      |  ✅    |  ✅   |  ✅    |  ✅  |
| OpenCode    |  ✅    |  —       |  ✅    |  ✅   |  ✅    |  ✅  |
| Gemini CLI  |  ✅    |  ✅      |  —     |  ✅   |  ✅    |  ✅  |
| Codex       |  ✅    |  ✅      |  ✅    |  —    |  ✅    |  ✅  |
| Cursor      |  ✅    |  ✅      |  ✅    |  ✅   |  —     |  ✅  |
| Kilo        |  ✅    |  ✅      |  ✅    |  ✅   |  ✅    |  —   |

Кожен агент може делегувати задачі будь-якому іншому, не виходячи зі свого інтерфейсу.

## Інтеграція

**Claude Code** отримує slash commands:
```
/opencode:run refactor the auth module
/gemini:review check this diff for edge cases
/codex:run write tests for the new retry logic
/cursor:run check if this fits existing patterns
/kilo:run review for naming and readability
```

**OpenCode** отримує MCP tools:
```
delegate_claude("review this migration for data loss risk")
delegate_gemini("analyze this for performance bottlenecks")
delegate_codex("add integration tests")
delegate_cursor("check codebase integration")
delegate_kilo("review for maintainability")
```

**Gemini CLI**, **Codex**, **Cursor** та **Kilo** отримують skills і rules — встановіть раз, потім просто скажіть агенту делегувати природною мовою.

## Workflow, який реально важливий

Паралельне code review. Даєте пʼятьом різним агентам один diff незалежно, кожен із різним фокусом:

```text
/gemini:review   — edge cases та robustness
/codex:run       — scope та simplicity
/cursor:run      — відповідність паттернам кодової бази
/kilo:run        — maintainability та naming
/claude:review   — correctness та security
```

У різних моделей різні слабкі місця. Один пропустить edge case, який інший спіймає. Один перебільшить архітектурні деталі, де інший помітить відсутній тест. Ви читаєте всі пʼять відповідей і приймаєте рішення. Агенти надають матеріал, judgment залишається за вами.

## Workflow патерни

Ручне паралельне review, описане вище, досі працює. Але у chorus тепер є named workflow команди як окремі плагіни — щоб поширені патерни мали одну команду замість пʼяти:

| Команда | Що робить |
|---|---|
| `/chorus:review` | Паралельне review `git diff HEAD` — одна команда, 5 незалежних думок |
| `/chorus:council` | Одне завдання пʼятьом агентам із різними ролями (correctness / edge-cases / scope / integration / maintainability); host синтезує |
| `/chorus:debug` | Ранжовані гіпотези першопричини від 5 агентів для симптому баґу |
| `/chorus:second-opinion` | Швидка незалежна перевірка одним обраним агентом (`--agent claude\|gemini\|codex\|cursor\|kilo`) |

Пʼять агентів паралельно: Claude, Gemini, Codex, Cursor, Kilo. OpenCode підключений до mesh 6×6, але виключений із паралельних паттернів — TUI stdout не захопити програматично.

OpenCode отримує їх як MCP tools: `council`, `parallel_review`, `parallel_debug`, `second_opinion`. Gemini CLI, Codex, Cursor та Kilo — як skills і rules.

Тобто замість того, щоб щоразу вручну збирати пʼять delegate команд для review, просто запускаєш `/chorus:review` і читаєш результат.

## Встановлення

```bash
# Claude Code
claude plugin install https://github.com/valpere/chorus

# OpenCode
opencode plugin @valpere/chorus-opencode
```

Повне встановлення для Gemini CLI, Codex, Cursor та Kilo — у README.

chorus не намагається стати новою IDE або orchestration platform. Це plumbing між інструментами, якими розробники вже користуються. Одна інсталяція, шість агентів, жодних нових workflow.

**https://github.com/valpere/chorus**

---

*Валентин Соломко — український software engineer*
