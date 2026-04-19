# Chorus: як дати AI coding CLI перевіряти одне одного

Я використовую кілька AI coding CLI залежно від задачі.

Claude Code зручний для одного типу роботи. OpenCode має свій підхід. Gemini CLI корисний, коли хочеться підключити іншу модельну сімʼю. Codex часто добре заходить як другий прохід для реалізації або ревʼю. Cursor Agent CLI добре розуміє контекст усього репозиторію. Kilo Code CLI зосереджений на maintainability та читаємості.

Проблема не в моделях. Проблема в постійному перемиканні між інструментами.

`chorus` — моя спроба прибрати це тертя.

Це open-source колекція плагінів для шести AI coding CLI:

- Claude Code
- OpenCode
- Gemini CLI
- Codex
- Cursor Agent CLI
- Kilo Code CLI

Ідея проста: з того інструмента, в якому я вже працюю, хочу делегувати задачу іншим агентам.

Виходить **повна mesh 6×6**. Кожен агент може делегувати будь-якому іншому.

## Як це виглядає на практиці

У Claude Code:

```text
/gemini:review Review this diff for hidden edge cases and missing tests.
/codex:run Add regression tests for the parser bug we just fixed.
/opencode:run Try a smaller refactor of the auth middleware without changing behavior.
/cursor:run Check if this change fits the existing patterns in the repo.
/kilo:run Review this for naming clarity and long-term maintainability.
```

В OpenCode та сама ідея доступна через MCP tools:

```text
delegate_claude
delegate_gemini
delegate_codex
delegate_cursor
delegate_kilo
```

Gemini CLI, Codex, Cursor та Kilo отримують skills і rules і теж можуть делегувати в будь-якому напрямку.

## Головний use case: паралельне code review

Замість того щоб питати одного агента "нормально?", можна дати один diff пʼятьом агентам незалежно.

У різних агентів різні слабкі місця. Один занадто фокусується на архітектурі. Інший помітить маленьку прогалину в тестах. Третій запропонує простішу реалізацію. Четвертий помітить невідповідність паттернам кодової бази. Пʼятий вкаже на назву, яка заплутає наступного розробника. Часто хтось із них помиляється. Це нормально. Цінність у тому, що можна отримати кілька незалежних проходів, не виходячи з терміналу.

```text
/gemini:review   Check correctness and missed edge cases.
/codex:run       Review test coverage and suggest missing cases.
/cursor:run      Check for codebase integration and pattern consistency.
/kilo:run        Review for maintainability and naming clarity.
/claude:review   Security and correctness review.
```

Це не про те, що агенти — "члени команди". Це про використання розбіжностей між моделями як інструмента.

## Workflow патерни

Ручне паралельне review, описане вище, досі працює. Але у chorus тепер є named workflow команди як окремі плагіни — щоб поширені патерни мали одну команду замість пʼяти:

| Команда | Що робить |
|---|---|
| `/chorus:review` | Паралельне review `git diff HEAD` — одна команда, 5 незалежних думок |
| `/chorus:council` | Одне завдання пʼятьом агентам із різними ролями (correctness / edge-cases / scope / integration / maintainability); host синтезує |
| `/chorus:debug` | Ранжовані гіпотези першопричини від 5 агентів для симптому баґу |
| `/chorus:second-opinion` | Швидка незалежна перевірка одним обраним агентом (`--agent claude\|gemini\|codex\|cursor\|kilo`) |

Пʼять агентів паралельно: Claude, Gemini, Codex, Cursor, Kilo. OpenCode підключений до mesh 6×6, але виключений із паралельних workflow паттернів — TUI stdout не захопити програматично.

Тобто замість ручного збирання `/gemini:review`, `/codex:run` і `/cursor:run` із різними промптами щоразу — просто запускаєш `/chorus:review`.

OpenCode отримує їх як MCP tools (`council`, `parallel_review`, `parallel_debug`, `second_opinion`). Gemini CLI, Codex, Cursor та Kilo — як skills і rules.

## Дизайн

`chorus` навмисно не є новою IDE або великою orchestration platform. Це glue.

Одна інсталяція дає доступ до інших агентів із вашого улюбленого інструмента. Claude Code отримує slash commands. OpenCode — MCP tools. Gemini CLI, Codex, Cursor та Kilo — skills і rules.

Продовжуйте працювати в тому інтерфейсі, який вам зручний, але перестаньте сприймати кожен CLI як окремий острів.

## Встановлення

```bash
# Claude Code
claude plugin install https://github.com/valpere/chorus

# OpenCode
opencode plugin @valpere/chorus-opencode

# Gemini CLI
gemini skills install https://github.com/valpere/chorus --path for-gemini/claude
gemini skills install https://github.com/valpere/chorus --path for-gemini/opencode
gemini skills install https://github.com/valpere/chorus --path for-gemini/codex
gemini skills install https://github.com/valpere/chorus --path for-gemini/cursor
gemini skills install https://github.com/valpere/chorus --path for-gemini/kilo
```

Повне встановлення для Codex, Cursor та Kilo — у README.

Я зробив це, бо мій власний workflow став повторюваним — зміна в одному CLI, копіювання контексту в інший, запит ревʼю, ручне перенесення корисних частин назад. Воно працювало, але було незграбно.

`chorus` перетворює це на звичайну команду.

GitHub: **https://github.com/valpere/chorus**

Якщо ви вже використовуєте більше ніж один AI coding CLI, це може прибрати маленьке, але постійне тертя. Якщо використовуєте лише один, multi-agent review все одно варто спробувати на ризикованих змінах. Друга думка від іншого агента часто дешевша, ніж потім дебажити той самий blind spot.

---

*Валентин Соломко — український software engineer*
