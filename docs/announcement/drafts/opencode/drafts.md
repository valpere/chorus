Here are the drafts for all 7 platforms:

---

## dev.to

### EN

**I Made My Four AI Coding Assistants Talk to Each Other**

I've been using Claude Code, OpenCode, Gemini CLI, and Codex — switching between them depending on which model I trusted for a specific task. That got old fast. I was copying code between terminals like a maniac.

So I built **chorus**: a cross-agent plugin collection that connects all four into a 4×3 mesh where each agent can delegate tasks to all the others.

**What it does**

From Claude Code, you get slash commands:

```
/opencode:run analyze this function for edge cases
/gemini:review check for security issues in auth.go
/codex:run suggest a refactor for this module
```

From OpenCode, MCP tools:

```
delegate_claude("write tests for this service")
delegate_gemini("explain this algorithm")
delegate_codex("optimize this SQL query")
```

Gemini CLI and Codex get skills installed so they can delegate back too. Every direction works.

**The real use case: parallel code review**

When I have a significant PR, I run:

```
/gemini:review
/opencode:run review
```

Three perspectives, simultaneously, on the same code. Claude tends to spot architectural concerns. Gemini flags subtle logic errors. OpenCode finds style inconsistencies. When they all flag the same thing, I pay close attention. When they disagree, I dig into why — that's where the interesting decisions are.

**Install**

```bash
# Claude Code
claude mcp add chorus

# OpenCode — add to config:
# mcp: chorus

# Gemini CLI / Codex — install skills from the repo
```

Full docs and install instructions for all four CLIs: https://github.com/valpere/chorus

One install per CLI. You don't leave your preferred tool. You just reach across to the others when you need a second (or third, or fourth) opinion.

Different models have genuinely different strengths. chorus is the plumbing that should have existed already.

---

### UA

**Я змусив своїх чотирьох AI-помічників розмовляти одне з одним**

Я використовував Claude Code, OpenCode, Gemini CLI і Codex — перемикаючись між ними залежно від того, якій моделі більше довіряв для конкретного завдання. Це швидко набридло. Я копіював код між терміналами, як навіжений.

Тому я побудував **chorus**: колекцію крос-агентних плагінів, яка з'єднує всі чотири в мережу 4×3, де кожен агент може делегувати завдання всім іншим.

**Що він робить**

З Claude Code — slash-команди:

```
/opencode:run проаналізуй цю функцію на крайні випадки
/gemini:review перевір безпеку в auth.go
/codex:run запропонуй рефакторинг цього модуля
```

З OpenCode — MCP інструменти:

```
delegate_claude("напиши тести для цього сервісу")
delegate_gemini("поясни цей алгоритм")
delegate_codex("оптимізуй цей SQL-запит")
```

Gemini CLI і Codex теж отримують встановлені skills, щоб могли делегувати у відповідь. Кожен напрямок працює.

**Реальний кейс: паралельний code review**

Коли у мене є значний PR, я запускаю:

```
/gemini:review
/opencode:run review
```

Три точки зору, одночасно, на одному коді. Claude зазвичай помічає архітектурні проблеми. Gemini виявляє тонкі логічні помилки. OpenCode знаходить стилістичні невідповідності. Коли всі вказують на одне — я уважно вдивляюсь. Коли розходяться — копаю глибше. Там і є цікаві рішення.

**Встановлення**

```bash
# Claude Code
claude mcp add chorus

# OpenCode — додати до конфігурації:
# mcp: chorus

# Gemini CLI / Codex — встановити skills з репозиторію
```

Повна документація та інструкції для всіх чотирьох CLI: https://github.com/valpere/chorus

Одне встановлення на CLI. Ви не виходите з улюбленого інструменту. Просто звертаєтесь до інших, коли потрібна друга (або третя, або четверта) думка.

Різні моделі мають справді різні сильні сторони. chorus — це просто зв'язувальне середовище, яке мало існувати вже давно.

---

## Substack

### EN

**The Problem With Having Four AI Coding Assistants**

Last year I started using multiple AI coding CLIs seriously. Claude Code for architecture discussions, Gemini CLI for fast code generation, Codex when I needed something that understood legacy patterns well, OpenCode when I wanted a different perspective.

It worked. Kind of.

The problem was workflow. I'd be deep in a Claude session, realize I wanted Gemini's take on something, copy the relevant code, open a new terminal, start a Gemini session, paste, wait, copy the response, go back to Claude. I did this probably fifty times before I admitted it was unsustainable.

The thing is, these tools are genuinely different. I'm not loyal to one model the way some developers are. Each has real strengths. Claude reasons well about long-range consequences of design decisions. Gemini catches things in the details. Codex understands certain legacy patterns that the others don't. OpenCode has a different architecture that surfaces different kinds of issues.

So instead of choosing one, I wanted all four — without the constant context switching.

**What I built**

chorus is a cross-agent plugin collection. You install it once per CLI, and each agent gains the ability to delegate tasks to all the others. It creates a 4×3 mesh: Claude Code, OpenCode, Gemini CLI, and Codex — each able to reach across to all three others.

From Claude Code, you get slash commands. `/gemini:review` sends your current context to Gemini and brings back the review. `/opencode:run` delegates an arbitrary task. `/codex:run` for anything you'd rather Codex handled.

From OpenCode, MCP tools: `delegate_claude`, `delegate_gemini`, `delegate_codex`.

Gemini CLI and Codex get skills installed so they can delegate in either direction too. The mesh is complete.

**The thing I use most**

Parallel code review.

When I have a significant PR, I'll run `/gemini:review` and `/opencode:run review` back-to-back. Sometimes I add Claude's own review to the mix. Three perspectives, three different reasoning patterns, all on the same code.

They don't agree on everything. That's the point. When they all flag the same issue, I know it's real. When they disagree, I dig into why — that's usually where the most interesting decision is hiding.

**One install**

One command per CLI. Everything lives at https://github.com/valpere/chorus.

I've been using it for a few months. It's become one of those tools I don't think about anymore — I just reach for whatever agent seems right for the task without leaving my editor. That's what good tooling feels like.

---

### UA

**Проблема з чотирма AI-помічниками для кодування**

Минулого року я почав серйозно використовувати кілька AI-CLI. Claude Code для обговорення архітектури, Gemini CLI для швидкої генерації коду, Codex коли потрібен хтось, хто добре розуміє застарілі патерни, OpenCode коли хотів іншу точку зору.

Це працювало. Приблизно.

Проблема була у робочому процесі. Я перебував глибоко в сесії Claude, розумів, що хочу почути Gemini щодо чогось, копіював відповідний код, відкривав новий термінал, починав сесію Gemini, вставляв, чекав, копіював відповідь, повертався до Claude. Я робив це, мабуть, п'ятдесят разів, перш ніж визнав, що це несталий підхід.

Справа в тому, що ці інструменти справді різні. Я не прив'язаний до однієї моделі так, як деякі розробники. Кожен має реальні переваги. Claude добре міркує про довгострокові наслідки дизайнерських рішень. Gemini вловлює деталі. Codex розуміє певні застарілі патерни, яких інші не знають. OpenCode має іншу архітектуру, яка виявляє інші типи проблем.

Тому замість того, щоб вибирати один, я хотів усі чотири — без постійного перемикання контексту.

**Що я побудував**

chorus — колекція крос-агентних плагінів. Встановлюється один раз на CLI, і кожен агент отримує можливість делегувати завдання всім іншим. Це створює мережу 4×3: Claude Code, OpenCode, Gemini CLI і Codex — кожен може звернутися до трьох інших.

З Claude Code — slash-команди. `/gemini:review` надсилає ваш поточний контекст до Gemini і повертає огляд. `/opencode:run` делегує довільне завдання. `/codex:run` для всього, що краще обробить Codex.

З OpenCode — MCP інструменти: `delegate_claude`, `delegate_gemini`, `delegate_codex`.

Gemini CLI і Codex отримують встановлені skills, щоб могли делегувати у будь-якому напрямку. Мережа повна.

**Те, що я використовую найбільше**

Паралельний code review.

Коли у мене є значний PR, я запускаю `/gemini:review` і `/opencode:run review` один за одним. Іноді додаю власний review від Claude. Три точки зору, три різні паттерни мислення — всі на одному коді.

Вони не завжди погоджуються. У цьому і суть. Коли всі вказують на одну проблему — знаю, що вона справжня. Коли розходяться — копаю глибше. Там зазвичай і ховається найцікавіше рішення.

**Одне встановлення**

Одна команда на CLI. Все є на https://github.com/valpere/chorus.

Я використовую це вже кілька місяців. Це стало одним з тих інструментів, про які я більше не думаю — просто беру того агента, який здається найкращим для завдання, не виходячи з редактора. Ось що таке хороший інструмент.

---

## Medium

### EN

**chorus: One Plugin, Four AI Coding Assistants**

I work with four AI coding CLIs — Claude Code, OpenCode, Gemini CLI, and Codex. Each is useful. Each has different strengths. Getting them to collaborate required too much manual copying and terminal switching.

So I built chorus: a plugin collection that connects all four in a 4×3 delegation mesh. Install it once per CLI, and each agent gains the ability to delegate tasks to all the others.

**The architecture**

Each agent uses its native integration points:

- **Claude Code**: slash commands — `/opencode:run`, `/gemini:review`, `/codex:run`
- **OpenCode**: MCP tools — `delegate_claude`, `delegate_gemini`, `delegate_codex`
- **Gemini CLI / Codex**: skills

The result is fully bidirectional: not just Claude calling Gemini, but Gemini calling back too.

**Practical use**

The most immediate use case is parallel code review. Instead of asking one agent, ask several simultaneously. Different models catch different things — Claude tends toward architectural concerns, Gemini toward subtle logic, OpenCode toward style consistency.

Another use case: running the same generation task through multiple models and comparing outputs. Useful when you're unsure which approach is better, or when a decision is high-stakes enough to warrant multiple opinions.

**Install**

```bash
# Claude Code
claude mcp add chorus
```

Full install instructions for all four CLIs: https://github.com/valpere/chorus

chorus doesn't replace your preferred tool. It gives every tool access to all the others. If you're already running multiple AI CLIs, it removes the friction of switching between them.

---

### UA

**chorus: один плагін, чотири AI-помічники**

Я працюю з чотирма AI-CLI для кодування — Claude Code, OpenCode, Gemini CLI і Codex. Кожен корисний. Кожен має різні переваги. Змусити їх співпрацювати вимагало надто багато ручного копіювання та перемикання між терміналами.

Тому я побудував chorus: колекцію плагінів, яка з'єднує всі чотири в мережу делегування 4×3. Встановіть один раз на CLI, і кожен агент отримує можливість делегувати завдання всім іншим.

**Архітектура**

Кожен агент використовує власні нативні точки інтеграції:

- **Claude Code**: slash-команди — `/opencode:run`, `/gemini:review`, `/codex:run`
- **OpenCode**: MCP інструменти — `delegate_claude`, `delegate_gemini`, `delegate_codex`
- **Gemini CLI / Codex**: skills

Результат — повністю двостороння взаємодія: не лише Claude звертається до Gemini, але й Gemini може звернутись назад.

**Практичне застосування**

Найбільш очевидний кейс — паралельний code review. Замість того, щоб просити одного агента, попросіть кількох одночасно. Різні моделі помічають різне — Claude схильний до архітектурних проблем, Gemini до тонкої логіки, OpenCode до стилістичної узгодженості.

Інший кейс: запуск однакового завдання через кілька моделей і порівняння результатів. Корисно, коли не впевнені, який підхід кращий, або коли рішення достатньо важливе, щоб отримати кілька думок.

**Встановлення**

```bash
# Claude Code
claude mcp add chorus
```

Повні інструкції для всіх чотирьох CLI: https://github.com/valpere/chorus

chorus не замінює ваш улюблений інструмент. Він дає кожному інструменту доступ до всіх інших. Якщо ви вже використовуєте кілька AI-CLI, він прибирає тертя при перемиканні між ними.

---

## LinkedIn

### EN

I got tired of switching between four AI coding CLIs — Claude Code, Gemini CLI, OpenCode, and Codex — whenever I wanted a second opinion on my code.

So I built **chorus**: a cross-agent plugin collection that creates a 4×3 delegation mesh between all four. Install it once per CLI and each agent can delegate to all the others through its native interface.

From Claude Code: `/gemini:review`, `/opencode:run`, `/codex:run`. From OpenCode: MCP tools to delegate to Claude, Gemini, or Codex. Gemini CLI and Codex get skills.

The practical payoff: parallel code reviews from multiple AI agents simultaneously. They catch different things — and when they disagree, that's where the most interesting decisions are.

Open source. One install per CLI. Four AI agents without leaving your terminal.

https://github.com/valpere/chorus

---

### UA

Я втомився перемикатись між чотирма AI-CLI — Claude Code, Gemini CLI, OpenCode і Codex — щоразу, коли хотів другу думку щодо свого коду.

Тому я побудував **chorus**: колекцію крос-агентних плагінів, яка створює мережу делегування 4×3 між усіма чотирма. Встановіть один раз на CLI, і кожен агент може делегувати всім іншим через свій нативний інтерфейс.

З Claude Code: `/gemini:review`, `/opencode:run`, `/codex:run`. З OpenCode: MCP інструменти для делегування до Claude, Gemini або Codex. Gemini CLI і Codex отримують skills.

Практичний результат: паралельні code review від кількох AI-агентів одночасно. Вони помічають різне — і коли розходяться, саме там і приховані найцікавіші рішення.

Відкритий код. Одне встановлення на CLI. Чотири AI-агенти без виходу з терміналу.

https://github.com/valpere/chorus

---

## Facebook

### EN

Built a thing called **chorus** because I was tired of copying code between four different AI terminal tools.

It's a plugin that connects Claude Code, OpenCode, Gemini CLI, and Codex into a mesh where they can all delegate tasks to each other. From Claude Code you just type `/gemini:review` and get Gemini's take without leaving your session. Same thing works in every direction.

Best part: parallel code review from multiple models at once. They don't always agree — which is actually the useful part.

Open source: https://github.com/valpere/chorus

---

### UA

Побудував штуку під назвою **chorus**, бо втомився копіювати код між чотирма різними AI-терміналами.

Це плагін, який з'єднує Claude Code, OpenCode, Gemini CLI і Codex у мережу, де всі можуть делегувати завдання одне одному. З Claude Code просто пишеш `/gemini:review` і отримуєш думку Gemini, не виходячи з сесії. Те саме працює в кожному напрямку.

Найкраще: паралельний code review від кількох моделей одночасно. Вони не завжди погоджуються — що насправді і є корисним.

Відкрите джерело: https://github.com/valpere/chorus

---

## X/Twitter

### EN

1/5 I use four AI coding CLIs: Claude Code, Gemini CLI, OpenCode, Codex. Getting a second opinion meant copying code between terminals. So I fixed that.

2/5 Built chorus — a cross-agent plugin collection that connects all four in a 4×3 mesh. Each agent can delegate to all the others. One install per CLI.

3/5 From Claude Code: `/opencode:run`, `/gemini:review`, `/codex:run` — slash commands that send tasks to other agents and bring back results without leaving your session.

4/5 The best use case: parallel code review. Ask Claude, Gemini, and OpenCode to review the same code at once. They catch different things. When they all flag the same issue — that's the one to fix first.

5/5 Open source. https://github.com/valpere/chorus — install instructions for all four CLIs in the README.

---

### UA

1/5 Я використовую чотири AI-CLI: Claude Code, Gemini CLI, OpenCode, Codex. Отримати другу думку означало копіювати код між терміналами. Тож я це виправив.

2/5 Побудував chorus — крос-агентну колекцію плагінів, яка з'єднує всі чотири в мережу 4×3. Кожен агент може делегувати всім іншим. Одне встановлення на CLI.

3/5 З Claude Code: `/opencode:run`, `/gemini:review`, `/codex:run` — slash-команди, що надсилають завдання іншим агентам і повертають результати без виходу з сесії.

4/5 Найкращий кейс: паралельний code review. Попросіть Claude, Gemini і OpenCode перевірити один код одночасно. Вони помічають різне. Коли всі вказують на одну проблему — це та, з якої починати.

5/5 Відкрите джерело. https://github.com/valpere/chorus — інструкції встановлення для всіх чотирьох CLI у README.

---

## Bluesky

### EN

Built chorus — a plugin that connects Claude Code, OpenCode, Gemini CLI, and Codex into a 4×3 delegation mesh. Each agent can delegate to all the others from its native interface. One install per CLI.

From Claude Code: /gemini:review, /opencode:run, /codex:run. From OpenCode: MCP tools. Gemini/Codex get skills. Every direction works — it's a full mesh, not a hub.

Best use: parallel code reviews from multiple models at once. They catch different things. github.com/valpere/chorus

---

### UA

Побудував chorus — плагін, який з'єднує Claude Code, OpenCode, Gemini CLI і Codex у мережу делегування 4×3. Кожен агент може делегувати всім іншим через свій нативний інтерфейс. Одне встановлення на CLI.

З Claude Code: /gemini:review, /opencode:run, /codex:run. З OpenCode: MCP інструменти. Gemini/Codex отримують skills. Кожен напрямок працює — повна мережа, не хаб.

Найкраще: паралельний code review від кількох моделей одночасно. Вони помічають різне. github.com/valpere/chorus
