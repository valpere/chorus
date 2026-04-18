I couldn’t fetch the GitHub README directly, so these drafts stick to the facts you provided and avoid invented install syntax beyond the named commands/tools.

## dev.to

### EN

# Chorus: letting AI coding CLIs review each other

I use several AI coding CLIs depending on the task.

Claude Code is good at one kind of workflow. OpenCode has its own shape. Gemini CLI is useful when I want another model family in the loop. Codex is often strong when I need a second implementation or review pass.

The annoying part is not the models. The annoying part is switching tools.

`chorus` is my attempt to remove that friction.

It is an open-source cross-agent plugin collection for four AI coding CLIs:

- Claude Code
- OpenCode
- Gemini CLI
- Codex

The idea is simple: from the tool I am already using, I should be able to delegate a task to the other agents.

That creates a 4x3 mesh. Each agent can call the other three.

So if I am inside Claude Code, I can ask Gemini to review something, Codex to implement a test, or OpenCode to try a different refactor path.

Example Claude Code commands:

```text
/gemini:review Review this diff for hidden edge cases and missing tests.
/codex:run Add regression tests for the parser bug we just fixed.
/opencode:run Try a smaller refactor of the auth middleware without changing behavior.
```

If I am working from OpenCode, the same idea is exposed through MCP tools:

```text
delegate_claude
delegate_gemini
delegate_codex
```

A typical use case is parallel review.

Instead of asking one agent “is this fine?”, ask three different agents to review the same change independently:

```text
/gemini:review Check correctness and missed edge cases.
/codex:run Review the test coverage and suggest missing cases.
/opencode:run Look for simplifications and risky abstractions.
```

This is not about pretending that agents are “teammates” in the human sense. They are not.

It is about using model disagreement as a tool.

Different agents have different failure modes. One will over-focus on architecture. Another will catch a small test gap. Another will suggest a simpler implementation. Often one of them is wrong. That is fine. The value is in having multiple independent passes without leaving the terminal.

The important design constraint for `chorus` is that it does not try to become a new AI IDE or orchestration platform. It is glue.

One install gives you access to the other agents from your preferred tool.

Claude Code gets slash commands:

```text
/opencode:run
/gemini:review
/codex:run
```

OpenCode gets MCP tools:

```text
delegate_claude
delegate_gemini
delegate_codex
```

Gemini CLI and Codex get skills.

That is the whole point: keep using the interface you already like, but stop treating each CLI as an isolated island.

I built this because my own workflow had become repetitive. I would make a change in one CLI, copy context into another, ask for a review, then manually bring the useful parts back. It worked, but it was clumsy.

`chorus` turns that into a normal command.

The project is open source: https://github.com/valpere/chorus

If you already use more than one AI coding CLI, this may be useful. If you only use one, it may still be worth trying for code review. A second opinion from a different agent is often cheaper than debugging the same blind spot later.

Author: Valentyn Solomko, Ukrainian software engineer.

### UA

# Chorus: як дати AI coding CLI перевіряти одне одного

Я використовую кілька AI coding CLI залежно від задачі.

Claude Code зручний для одного типу роботи. OpenCode має свій підхід. Gemini CLI корисний, коли хочеться підключити іншу модельну сімʼю. Codex часто добре заходить як другий прохід для реалізації або ревʼю.

Проблема не в моделях. Проблема в постійному перемиканні між інструментами.

`chorus` — моя спроба прибрати цю зайву тертя.

Це open-source колекція плагінів для чотирьох AI coding CLI:

- Claude Code
- OpenCode
- Gemini CLI
- Codex

Ідея проста: з того інструмента, в якому я вже працюю, я хочу делегувати задачу іншим агентам.

Виходить mesh 4x3. Кожен агент може запускати задачі на трьох інших.

Наприклад, якщо я в Claude Code, я можу попросити Gemini зробити ревʼю, Codex додати тест, або OpenCode спробувати інший варіант рефакторингу.

Приклади команд у Claude Code:

```text
/gemini:review Review this diff for hidden edge cases and missing tests.
/codex:run Add regression tests for the parser bug we just fixed.
/opencode:run Try a smaller refactor of the auth middleware without changing behavior.
```

Якщо я працюю з OpenCode, та сама ідея доступна через MCP tools:

```text
delegate_claude
delegate_gemini
delegate_codex
```

Типовий сценарій — паралельне code review.

Замість того щоб питати одного агента “нормально?”, можна дати один і той самий diff кільком агентам незалежно:

```text
/gemini:review Check correctness and missed edge cases.
/codex:run Review the test coverage and suggest missing cases.
/opencode:run Look for simplifications and risky abstractions.
```

Це не про те, що агенти стають “членами команди” в людському сенсі. Ні.

Це про використання розбіжностей між моделями як інструмента.

У різних агентів різні слабкі місця. Один занадто фокусується на архітектурі. Інший помітить маленьку прогалину в тестах. Третій запропонує простішу реалізацію. Часто хтось із них буде неправий. Це нормально. Цінність у тому, що можна отримати кілька незалежних проходів, не виходячи з терміналу.

Головне обмеження в дизайні `chorus`: він не намагається стати новою AI IDE або великою orchestration platform. Це glue.

Одна інсталяція дає доступ до інших агентів із вашого улюбленого інструмента.

Claude Code отримує slash commands:

```text
/opencode:run
/gemini:review
/codex:run
```

OpenCode отримує MCP tools:

```text
delegate_claude
delegate_gemini
delegate_codex
```

Gemini CLI та Codex отримують skills.

У цьому вся суть: продовжуйте працювати в тому інтерфейсі, який вам зручний, але не сприймайте кожен CLI як окремий острів.

Я зробив це, бо мій власний workflow став повторюваним. Зробити зміну в одному CLI, скопіювати контекст в інший, попросити ревʼю, потім вручну перенести корисні частини назад. Воно працювало, але було незграбно.

`chorus` перетворює це на звичайну команду.

Проєкт open source: https://github.com/valpere/chorus

Якщо ви вже використовуєте більше ніж один AI coding CLI, це може бути корисно. Якщо використовуєте тільки один, спробуйте хоча б для code review. Друга думка від іншого агента часто дешевша, ніж потім дебажити той самий blind spot.

Автор: Валентин Соломко, український software engineer.

## Substack

### EN

# I got tired of copy-pasting between AI coding agents, so I built chorus

For a while my AI coding workflow looked productive from the outside and slightly ridiculous from the inside.

I would start in Claude Code because that was already open in the repo. It would implement something useful. Then I would want a second opinion, so I would switch to another terminal and ask Gemini CLI to review the same change. Then I would ask Codex to write tests, or OpenCode to look at the shape of the refactor.

The result was often good.

The process was not.

Too much copying. Too much context reconstruction. Too many little “wait, which agent saw which files?” moments. Not a big dramatic problem, just the kind of workflow tax that slowly becomes annoying enough to fix.

So I built `chorus`.

`chorus` is an open-source cross-agent plugin collection for four AI coding CLIs:

- Claude Code
- OpenCode
- Gemini CLI
- Codex

The goal is not to replace any of them. I like that these tools have different interfaces and different tradeoffs. The goal is to connect them.

One install, four AI agents available from your preferred tool.

The mental model is a 4x3 mesh: each of the four agents can delegate tasks to the other three.

If you are in Claude Code, you can run commands like:

```text
/opencode:run Try a simpler implementation of this change.
/gemini:review Review the diff for missed edge cases.
/codex:run Add focused regression tests for the new behavior.
```

If you are in OpenCode, you get MCP tools:

```text
delegate_claude
delegate_gemini
delegate_codex
```

Gemini CLI and Codex are supported through skills.

The most useful workflow so far is multi-agent review.

I do not want one agent to tell me my code is good. I want a few different agents to attack the change from different angles. One can focus on correctness. One can look at tests. One can look for unnecessary complexity. Then I read the output and decide what is real.

That last part matters.

I am not trying to automate judgment away. I am trying to make it easier to gather useful criticism before I merge something.

AI coding agents are very good at sounding confident. They are also very good at missing things. But they do not all miss the same things. That is the practical advantage.

Sometimes Gemini catches a weird edge case. Sometimes Codex gives a better test plan. Sometimes Claude explains why a refactor is too clever. Sometimes OpenCode suggests the boring solution, which is usually the right one.

The value is not that any one agent is “the best”. The value is that switching between them should be cheap.

That is the design philosophy behind `chorus`: no new giant dashboard, no new workflow religion, no forced orchestration layer. Just commands and tools that let the AI coding CLIs talk to each other.

The project is open source here:

https://github.com/valpere/chorus

I built it as a working developer, not as a product campaign. My use case is simple: I want to stay in the terminal, keep my current tool, and still get useful work from the other agents when it helps.

If you already use Claude Code, OpenCode, Gemini CLI, or Codex, `chorus` may fit into your workflow without asking you to change the workflow itself.

That is the whole point.

Author: Valentyn Solomko, Ukrainian software engineer.

### UA

# Мені набридло копіювати контекст між AI coding agents, тому я зробив chorus

Деякий час мій AI coding workflow виглядав продуктивно зовні й трохи абсурдно зсередини.

Я починав у Claude Code, бо він уже був відкритий у репозиторії. Він робив корисну зміну. Потім мені хотілося другої думки, і я відкривав інший термінал, щоб попросити Gemini CLI зробити ревʼю того самого diff. Потім питав Codex про тести або OpenCode про форму рефакторингу.

Результат часто був хороший.

Процес — ні.

Забагато копіювання. Забагато відновлення контексту. Забагато дрібних моментів у стилі “стоп, а який агент бачив які файли?”. Це не якась драматична проблема. Просто workflow tax, який накопичується, поки не стає достатньо дратівливим, щоб його прибрати.

Так зʼявився `chorus`.

`chorus` — це open-source колекція плагінів для чотирьох AI coding CLI:

- Claude Code
- OpenCode
- Gemini CLI
- Codex

Мета не в тому, щоб замінити будь-який із них. Мені подобається, що ці інструменти мають різні інтерфейси й різні tradeoffs. Мета — зʼєднати їх.

Одна інсталяція, чотири AI agents із вашого улюбленого інструмента.

Ментальна модель — mesh 4x3: кожен із чотирьох агентів може делегувати задачі трьом іншим.

Якщо ви в Claude Code, можна запускати такі команди:

```text
/opencode:run Try a simpler implementation of this change.
/gemini:review Review the diff for missed edge cases.
/codex:run Add focused regression tests for the new behavior.
```

Якщо ви в OpenCode, доступні MCP tools:

```text
delegate_claude
delegate_gemini
delegate_codex
```

Gemini CLI та Codex підтримуються через skills.

Найкорисніший workflow зараз — multi-agent review.

Я не хочу, щоб один агент сказав мені, що код нормальний. Я хочу, щоб кілька різних агентів атакували зміну з різних боків. Один дивиться на correctness. Інший — на тести. Третій — на зайву складність. Потім я читаю результат і вирішую, що з цього справді має сенс.

Остання частина важлива.

Я не намагаюся автоматизувати judgment. Я намагаюся простіше збирати корисну критику до merge.

AI coding agents дуже добре звучать впевнено. І так само добре щось пропускають. Але вони не завжди пропускають одне й те саме. У цьому практична користь.

Іноді Gemini ловить дивний edge case. Іноді Codex дає кращий test plan. Іноді Claude пояснює, чому рефакторинг занадто clever. Іноді OpenCode пропонує нудне рішення, яке зазвичай і є правильним.

Цінність не в тому, що один агент “найкращий”. Цінність у тому, що перемикання між ними має бути дешевим.

Це і є дизайн-філософія `chorus`: без нового великого dashboard, без нової workflow-релігії, без примусового orchestration layer. Просто команди й tools, які дозволяють AI coding CLI говорити між собою.

Проєкт open source:

https://github.com/valpere/chorus

Я зробив його як практикуючий розробник, не як рекламну кампанію. Мій use case простий: хочу залишатися в терміналі, працювати у своєму поточному інструменті й підключати інших агентів тоді, коли це реально допомагає.

Якщо ви вже використовуєте Claude Code, OpenCode, Gemini CLI або Codex, `chorus` може вписатися у ваш workflow без вимоги змінювати сам workflow.

У цьому вся ідея.

Автор: Валентин Соломко, український software engineer.

## Medium

### EN

# Chorus: a small bridge between AI coding CLIs

Most AI coding tools are built as if they are the only tool in your workflow.

That is not how I use them.

Some days I start in Claude Code. Sometimes I want Gemini CLI to review a large change. Sometimes I ask Codex to write tests. Sometimes OpenCode gives me a cleaner second implementation. Each tool has its own strengths, and each model has its own blind spots.

The problem is the glue.

Without glue, the workflow becomes manual: copy context, switch terminals, re-explain the task, compare outputs, then bring the useful parts back. It works, but it feels like the kind of repetitive work software should remove.

`chorus` is an open-source project that connects four AI coding CLIs:

- Claude Code
- OpenCode
- Gemini CLI
- Codex

It gives you a 4x3 delegation mesh. Each agent can send tasks to the other three.

From Claude Code, that means slash commands like:

```text
/opencode:run
/gemini:review
/codex:run
```

Example:

```text
/gemini:review Review this diff for missed edge cases and weak tests.
/codex:run Add regression tests for the new parser behavior.
/opencode:run Try a simpler implementation without changing public APIs.
```

From OpenCode, the same idea is available through MCP tools:

```text
delegate_claude
delegate_gemini
delegate_codex
```

Gemini CLI and Codex are supported through skills.

The main workflow I care about is code review from multiple agents at the same time.

Not because agents are always right. They are not. The useful part is that different agents fail differently. One catches an edge case. Another questions a test. Another suggests deleting half the abstraction. You still need to read the output and make the engineering decision yourself.

That is the right boundary for me.

I do not want an AI system to merge code because three models agreed. I want fast, cheap, independent criticism before I make the final call.

`chorus` is intentionally not a new IDE, not a chat app, and not a full orchestration platform. It is a plugin collection. The point is to keep your preferred interface and make the other agents reachable from it.

One install, four agents at your fingertips.

If you already use more than one AI coding CLI, this removes a small but constant source of friction. If you use only one, multi-agent review may still be worth trying on risky changes.

Open source repo:

https://github.com/valpere/chorus

Built by Valentyn Solomko, Ukrainian software engineer.

### UA

# Chorus: невеликий міст між AI coding CLI

Більшість AI coding tools зроблені так, ніби вони єдиний інструмент у вашому workflow.

Я так ними не користуюся.

Іноді я починаю в Claude Code. Іноді хочу, щоб Gemini CLI подивився великий diff. Іноді прошу Codex написати тести. Іноді OpenCode дає простішу другу реалізацію. У кожного інструмента свої сильні сторони, і в кожної моделі свої blind spots.

Проблема — у glue.

Без нього workflow стає ручним: скопіювати контекст, перейти в інший термінал, заново пояснити задачу, порівняти відповіді, перенести корисне назад. Воно працює, але це саме той тип повторюваної роботи, який софт має прибирати.

`chorus` — open-source проєкт, який зʼєднує чотири AI coding CLI:

- Claude Code
- OpenCode
- Gemini CLI
- Codex

Він дає mesh делегування 4x3. Кожен агент може відправляти задачі трьом іншим.

У Claude Code це slash commands:

```text
/opencode:run
/gemini:review
/codex:run
```

Наприклад:

```text
/gemini:review Review this diff for missed edge cases and weak tests.
/codex:run Add regression tests for the new parser behavior.
/opencode:run Try a simpler implementation without changing public APIs.
```

В OpenCode та сама ідея доступна через MCP tools:

```text
delegate_claude
delegate_gemini
delegate_codex
```

Gemini CLI та Codex підтримуються через skills.

Основний workflow, який для мене важливий, — code review від кількох агентів одночасно.

Не тому, що агенти завжди праві. Ні. Корисно те, що різні агенти помиляються по-різному. Один ловить edge case. Інший ставить під сумнів тест. Третій пропонує видалити половину абстракції. А інженерне рішення все одно приймаєте ви.

Для мене це правильна межа.

Я не хочу, щоб AI система merge-ила код, бо три моделі погодилися. Я хочу швидку, дешеву, незалежну критику перед тим, як прийняти фінальне рішення.

`chorus` навмисно не є новою IDE, chat app або великою orchestration platform. Це колекція плагінів. Сенс у тому, щоб залишити ваш улюблений інтерфейс і зробити інших агентів доступними з нього.

Одна інсталяція, чотири агенти під рукою.

Якщо ви вже використовуєте більше ніж один AI coding CLI, це прибирає маленьке, але постійне тертя. Якщо використовуєте лише один, multi-agent review все одно варто спробувати на ризикованих змінах.

Open source repo:

https://github.com/valpere/chorus

Автор: Валентин Соломко, український software engineer.

## LinkedIn

### EN

I built `chorus`, an open-source plugin collection that connects four AI coding CLIs:

Claude Code, OpenCode, Gemini CLI, and Codex.

The idea is simple: keep working in your preferred tool, but delegate tasks to the others when useful.

It is a 4x3 mesh: each agent can run tasks on the other three.

In Claude Code, that means slash commands like:

```text
/opencode:run
/gemini:review
/codex:run
```

In OpenCode, it means MCP tools:

```text
delegate_claude
delegate_gemini
delegate_codex
```

Gemini CLI and Codex are supported through skills.

The workflow I care about most is parallel code review. Ask multiple agents to review the same diff independently, then make the engineering decision yourself.

This is not about replacing judgment. It is about getting more useful criticism before merging code.

Different agents catch different things. One may notice an edge case, another may question tests, another may suggest a simpler implementation.

Open source: https://github.com/valpere/chorus

Built by Valentyn Solomko, Ukrainian software engineer.

### UA

Я зробив `chorus` — open-source колекцію плагінів, яка зʼєднує чотири AI coding CLI:

Claude Code, OpenCode, Gemini CLI та Codex.

Ідея проста: працювати у своєму улюбленому інструменті, але делегувати задачі іншим агентам, коли це корисно.

Це mesh 4x3: кожен агент може запускати задачі на трьох інших.

У Claude Code це slash commands:

```text
/opencode:run
/gemini:review
/codex:run
```

В OpenCode це MCP tools:

```text
delegate_claude
delegate_gemini
delegate_codex
```

Gemini CLI та Codex підтримуються через skills.

Найцікавіший workflow для мене — паралельне code review. Даєш один diff кільком агентам незалежно, читаєш результат і сам приймаєш інженерне рішення.

Це не заміна judgment. Це спосіб отримати більше корисної критики перед merge.

Різні агенти ловлять різні речі: edge cases, прогалини в тестах, зайву складність.

Open source: https://github.com/valpere/chorus

Автор: Валентин Соломко, український software engineer.

## Facebook

### EN

I made a small open-source thing for people who use AI coding CLIs.

It is called `chorus`: https://github.com/valpere/chorus

It connects Claude Code, OpenCode, Gemini CLI, and Codex so they can delegate tasks to each other.

So from Claude Code you can run things like:

```text
/gemini:review
/codex:run
/opencode:run
```

And from OpenCode there are MCP tools like:

```text
delegate_claude
delegate_gemini
delegate_codex
```

The main use case for me is code review from multiple agents at once.

Not because AI agents are magically right. They are not. But different agents notice different problems, and it is useful to get a few independent opinions before merging something.

One install, four agents available from the tool you already use.

Built by Valentyn Solomko, Ukrainian software engineer.

### UA

Зробив невеликий open-source інструмент для тих, хто користується AI coding CLI.

Називається `chorus`: https://github.com/valpere/chorus

Він зʼєднує Claude Code, OpenCode, Gemini CLI та Codex, щоб вони могли делегувати задачі одне одному.

Наприклад, із Claude Code можна запускати:

```text
/gemini:review
/codex:run
/opencode:run
```

А в OpenCode є MCP tools:

```text
delegate_claude
delegate_gemini
delegate_codex
```

Головний use case для мене — code review від кількох агентів одночасно.

Не тому, що AI agents завжди праві. Ні. Але різні агенти помічають різні проблеми, і кілька незалежних думок перед merge реально корисні.

Одна інсталяція, чотири агенти з того інструмента, яким ви вже користуєтесь.

Автор: Валентин Соломко, український software engineer.

## X/Twitter

### EN

1/5  
I built `chorus`: an open-source plugin collection that connects Claude Code, OpenCode, Gemini CLI, and Codex.

One install, four AI coding agents available from the tool you already use.

https://github.com/valpere/chorus

2/5  
The model is a 4x3 mesh.

Each agent can delegate tasks to the other three.

Claude Code can call OpenCode, Gemini CLI, and Codex. OpenCode can call Claude, Gemini, and Codex. Same idea for the others.

3/5  
In Claude Code:

```text
/opencode:run
/gemini:review
/codex:run
```

In OpenCode:

```text
delegate_claude
delegate_gemini
delegate_codex
```

Gemini CLI and Codex get skills.

4/5  
My favorite workflow: parallel code review.

Send the same diff to multiple agents. Let them disagree. Read the output yourself.

Different agents catch different bugs, weak tests, and over-complicated abstractions.

5/5  
`chorus` is not trying to be a new IDE or orchestration platform.

It is glue between tools developers already use.

Open source, built by Valentyn Solomko, Ukrainian software engineer.

https://github.com/valpere/chorus

### UA

1/5  
Я зробив `chorus`: open-source колекцію плагінів, яка зʼєднує Claude Code, OpenCode, Gemini CLI та Codex.

Одна інсталяція, чотири AI coding agents із того інструмента, яким ви вже користуєтесь.

https://github.com/valpere/chorus

2/5  
Модель проста: mesh 4x3.

Кожен агент може делегувати задачі трьом іншим.

Claude Code може викликати OpenCode, Gemini CLI та Codex. OpenCode може викликати Claude, Gemini та Codex. І так далі.

3/5  
У Claude Code:

```text
/opencode:run
/gemini:review
/codex:run
```

В OpenCode:

```text
delegate_claude
delegate_gemini
delegate_codex
```

Gemini CLI та Codex отримують skills.

4/5  
Мій улюблений workflow: паралельне code review.

Даєш один diff кільком агентам. Дозволяєш їм не погоджуватись. Читаєш результат сам.

Різні агенти ловлять різні bugs, слабкі тести й зайві абстракції.

5/5  
`chorus` не намагається бути новою IDE або orchestration platform.

Це glue між інструментами, якими розробники вже користуються.

Open source, автор — Валентин Соломко, український software engineer.

https://github.com/valpere/chorus

## Bluesky

### EN

`chorus` is open source: a plugin collection that connects Claude Code, OpenCode, Gemini CLI, and Codex.

One install, four AI coding agents available from your preferred tool.

https://github.com/valpere/chorus

From Claude Code:

```text
/opencode:run
/gemini:review
/codex:run
```

From OpenCode:

```text
delegate_claude
delegate_gemini
delegate_codex
```

The best use case so far: send the same diff to multiple agents for review, then decide yourself.

Not automation of judgment. Just more independent criticism before merge.

### UA

`chorus` — open-source колекція плагінів, яка зʼєднує Claude Code, OpenCode, Gemini CLI та Codex.

Одна інсталяція, чотири AI coding agents із вашого улюбленого інструмента.

https://github.com/valpere/chorus

Із Claude Code:

```text
/opencode:run
/gemini:review
/codex:run
```

З OpenCode:

```text
delegate_claude
delegate_gemini
delegate_codex
```

Найкорисніший use case: дати один diff кільком агентам на review, а рішення прийняти самому.

Це не заміна judgment. Це більше незалежної критики перед merge.
r example, from Claude Code:

```text
/gemini:review this change
/codex:run add tests
/opencode:run simplify this module
```

The best part so far is parallel review. Different agents catch different things. None of them replaces your judgment, but together they can give useful pressure on a patch before you ship it.

Open source here: https://github.com/valpere/chorus

### UA

Я зробив невеликий open-source проєкт — **chorus**.

Він з’єднує чотири AI coding tools: Claude Code, OpenCode, Gemini CLI і Codex.

Проблема дуже практична: мені набридло копіювати код і контекст між різними агентами, щоб отримати другу думку або попросити інший інструмент виконати конкретну задачу.

З chorus можна залишатися у своєму улюбленому CLI й делегувати задачі іншим.

Наприклад, з Claude Code:

```text
/gemini:review this change
/codex:run add tests
/opencode:run simplify this module
```

Найкраще поки працює паралельне review. Різні агенти ловлять різні речі. Жоден не замінює твій judgment, але разом вони можуть добре притиснути patch перед shipping.

Open source тут: https://github.com/valpere/chorus

---

## 6. X/Twitter

### EN

1/ I built **chorus**: an open-source plugin collection that lets AI coding CLIs delegate tasks to each other.

Claude Code, OpenCode, Gemini CLI, Codex.

A `4x3` mesh: each agent can ask the other three to run tasks, review code, or answer questions.

https://github.com/valpere/chorus

2/ Example from Claude Code:

```text
/opencode:run refactor this module
/gemini:review check the architecture
/codex:run add missing tests
```

Same idea in OpenCode via MCP tools: `delegate_claude`, `delegate_gemini`, `delegate_codex`.

3/ The workflow I care about most: parallel review.

Ask multiple agents to review the same diff with different priorities:

correctness, architecture, test coverage, maintainability.

They fail differently. That is useful.

4/ chorus is not about replacing developer judgment.

It is about removing the copy-paste tax between tools and making second opinions cheap.

Install once. Use all four agents from your preferred CLI.

### UA

1/ Я зробив **chorus**: open-source колекцію плагінів, яка дозволяє AI coding CLI делегувати задачі одне одному.

Claude Code, OpenCode, Gemini CLI, Codex.

`4x3` mesh: кожен агент може просити інших трьох виконати задачу, зробити review або відповісти на питання.

https://github.com/valpere/chorus

2/ Приклад з Claude Code:

```text
/opencode:run refactor this module
/gemini:review check the architecture
/codex:run add missing tests
```

В OpenCode та сама ідея працює через MCP tools: `delegate_claude`, `delegate_gemini`, `delegate_codex`.

3/ Найкорисніший workflow: паралельне review.

Просиш кількох агентів подивитися на один diff з різними фокусами:

correctness, architecture, tests, maintainability.

Вони помиляються по-різному. І це корисно.

4/ chorus не про заміну developer judgment.

Він про те, щоб прибрати copy-paste tax між інструментами й зробити другу думку дешевою.

Встановив один раз. Використовуєш усі чотири агенти зі свого улюбленого CLI.

---

## 7. Bluesky

### EN

Post 1:

I built **chorus**: open-source plugins that let AI coding CLIs delegate to each other.

Claude Code, OpenCode, Gemini CLI, Codex.

Install once, use the other agents from the tool you already like.

https://github.com/valpere/chorus

Post 2:

The useful part is parallel review.

Ask Codex to focus on correctness, Gemini on architecture, OpenCode on scope, Claude on maintainability.

None of them is “the truth”. The value is that they fail differently.

Post 3:

chorus supports Claude Code slash commands, OpenCode MCP tools, and skills for Gemini CLI / Codex.

It is basically plumbing for developers who already use more than one AI coding agent and are tired of being the clipboard.

### UA

Post 1:

Я зробив **chorus**: open-source плагіни, які дозволяють AI coding CLI делегувати задачі одне одному.

Claude Code, OpenCode, Gemini CLI, Codex.

Встановлюєш один раз і використовуєш інших агентів зі свого улюбленого інструмента.

https://github.com/valpere/chorus

Post 2:

Найкорисніше — паралельне review.

Codex може дивитися на correctness, Gemini на architecture, OpenCode на scope, Claude на maintainability.

Жоден не є “істиною”. Цінність у тому, що вони помиляються по-різному.

Post 3:

chorus підтримує slash commands у Claude Code, MCP tools в OpenCode і skills для Gemini CLI / Codex.

По суті, це plumbing для розробників, які вже користуються кількома AI coding agents і втомилися бути clipboard між ними.
tokens used
14,988
## 1. dev.to

### EN

# I made chorus so AI coding agents can argue with each other

Most AI coding tools are designed like islands.

You pick one: Claude Code, OpenCode, Gemini CLI, or Codex. Then you stay inside that tool’s workflow. If you want another model’s opinion, you usually copy context, paste it somewhere else, explain the task again, wait, compare answers, and manually bring the result back.

That felt wrong to me.

I use different agents for different kinds of work. Sometimes Claude is better at reading a messy codebase. Sometimes Codex is sharper on implementation details. Sometimes Gemini catches architectural issues. Sometimes OpenCode fits better into the terminal flow.

So I built **chorus**: an open-source cross-agent plugin collection that lets AI coding CLIs delegate work to each other.

GitHub: https://github.com/valpere/chorus

The basic idea is simple: install once, then use the other agents from the tool you already prefer.

chorus creates a `4x3` mesh between four coding agents:

- Claude Code
- OpenCode
- Gemini CLI
- Codex

Each agent can ask the other three to:

- run a task
- review code
- answer a question

That means Claude Code can delegate to OpenCode, Gemini, or Codex. OpenCode can delegate to Claude, Gemini, or Codex. And so on.

Here is what it looks like from Claude Code:

```text
/opencode:run refactor the auth middleware to remove duplicated session checks

/gemini:review src/payments

/codex:run add tests for the new retry behavior
```

The nice part is that you do not need to leave Claude Code. The other agent runs as a delegated worker, and you get the result back in the same flow.

From OpenCode, chorus exposes MCP tools:

```text
delegate_claude:
  task: "Review this migration for data loss risk"

delegate_gemini:
  task: "Check if this API design has hidden edge cases"

delegate_codex:
  task: "Implement the missing tests for this module"
```

Gemini CLI and Codex use skills, so the same idea fits into their native extension model instead of forcing one abstraction everywhere.

The most useful workflow so far is parallel review.

Instead of asking one agent “is this good?”, I can ask three agents to review the same patch from different angles:

```text
/claude:review focus on maintainability
/gemini:review focus on architecture
/codex:review focus on correctness and tests
```

The point is not that agents are always right. They are not. The point is that they fail differently.

One model might miss a race condition but catch unclear naming. Another might complain about test isolation. Another might notice that an abstraction does not match the rest of the codebase.

As a developer, I still make the final call. chorus just makes it cheap to get several independent passes before I ship something.

I also like using it for task delegation:

```text
/gemini:ask what is the cleanest way to split this module?

/codex:run implement the small mechanical rename

/opencode:review check the final diff
```

This feels closer to how I actually work with people: ask one person for design feedback, another for implementation help, another for review.

chorus is not trying to replace judgment. It is trying to reduce friction.

If you already use one of these tools and occasionally wonder “what would another agent say about this?”, chorus is for that moment.

It is open source, early, and practical. I built it because I wanted my tools to cooperate instead of making me act as the clipboard between them.

### UA

# Я зробив chorus, щоб AI-агенти для коду могли сперечатися між собою

Більшість AI-інструментів для програмування працюють як окремі острови.

Ти обираєш щось одне: Claude Code, OpenCode, Gemini CLI або Codex. Потім живеш у цьому workflow. Якщо хочеш думку іншої моделі, зазвичай треба скопіювати контекст, вставити його в інший інструмент, знову пояснити задачу, почекати, порівняти відповіді й вручну перенести результат назад.

Мені це не подобалось.

Я використовую різних агентів для різних задач. Іноді Claude краще читає заплутану кодову базу. Іноді Codex точніший в імплементації. Іноді Gemini краще бачить архітектурні проблеми. Іноді OpenCode просто краще лягає в terminal-first workflow.

Тому я зробив **chorus**: open-source колекцію плагінів, яка дозволяє AI coding CLI делегувати задачі одне одному.

GitHub: https://github.com/valpere/chorus

Ідея проста: встановлюєш один раз і використовуєш інших агентів з того інструмента, в якому тобі зручно працювати.

chorus створює `4x3` mesh між чотирма coding agents:

- Claude Code
- OpenCode
- Gemini CLI
- Codex

Кожен агент може попросити інших трьох:

- виконати задачу
- зробити review
- відповісти на питання

Наприклад, з Claude Code це виглядає так:

```text
/opencode:run refactor the auth middleware to remove duplicated session checks

/gemini:review src/payments

/codex:run add tests for the new retry behavior
```

Тобі не треба виходити з Claude Code. Інший агент запускається як delegated worker, а результат повертається в той самий workflow.

В OpenCode chorus доступний через MCP tools:

```text
delegate_claude:
  task: "Review this migration for data loss risk"

delegate_gemini:
  task: "Check if this API design has hidden edge cases"

delegate_codex:
  task: "Implement the missing tests for this module"
```

Gemini CLI і Codex використовують skills, тому chorus підлаштовується під їхню нативну модель розширень, а не тягне всюди одну штучну абстракцію.

Найкорисніший workflow для мене зараз — паралельне review.

Замість того щоб питати одного агента “чи все ок?”, можна попросити трьох агентів подивитися на один patch з різних боків:

```text
/claude:review focus on maintainability
/gemini:review focus on architecture
/codex:review focus on correctness and tests
```

Сенс не в тому, що агенти завжди праві. Ні, не завжди. Сенс у тому, що вони помиляються по-різному.

Одна модель може пропустити race condition, але помітити нечітку назву. Інша може поскаржитися на ізоляцію тестів. Третя може побачити, що абстракція не схожа на решту кодової бази.

Фінальне рішення все одно за розробником. chorus просто здешевлює кілька незалежних проходів перед тим, як щось відправити далі.

Ще один корисний сценарій — делегування:

```text
/gemini:ask what is the cleanest way to split this module?

/codex:run implement the small mechanical rename

/opencode:review check the final diff
```

Це ближче до того, як ми працюємо з людьми: одного питаєш про дизайн, іншому даєш невелику імплементацію, третього просиш подивитися diff.

chorus не замінює інженерне мислення. Він прибирає зайве тертя.

Якщо ти вже користуєшся одним із цих інструментів і часом думаєш “а що б сказала інша модель?”, chorus саме для цього моменту.

Проєкт open source, ще ранній, але вже практичний. Я зробив його, бо хотів, щоб мої інструменти співпрацювали, а не змушували мене бути clipboard між ними.

---

## 2. Substack

### EN

# The best AI coding agent is sometimes the other one

I did not set out to build a grand multi-agent system.

I just got tired of copying text between terminals.

My normal coding workflow has become a mix of tools. Claude Code is often open when I need deep codebase reading. Codex is useful when I want implementation work done with a lot of attention to the surrounding code. Gemini CLI is good for another kind of reasoning pass. OpenCode fits nicely when I want something terminal-native and scriptable.

The problem is that each tool wants to be the whole universe.

You start in Claude Code, then realize you want Codex to take a pass at the tests. So you copy context. Then you paste it somewhere else. Then you explain the same thing again. Then you bring the result back. Then maybe you ask Gemini to review the architecture, which means doing the same dance again.

At some point I realized the annoying part was not the models. It was the plumbing.

So I built **chorus**.

chorus is an open-source cross-agent plugin collection for four AI coding CLIs:

- Claude Code
- OpenCode
- Gemini CLI
- Codex

It lets each one delegate to the other three. That gives you a `4x3` mesh of agents that can run tasks, review code, or answer questions from inside your preferred tool.

The goal is not to create a fake “AI team” with dramatic roles and dashboards. The goal is smaller and more useful: let the tools talk to each other without making the developer act as the messenger.

If I am working in Claude Code, I can do this:

```text
/opencode:run simplify the CLI argument parsing

/gemini:review check this module boundary for architectural issues

/codex:run add regression tests for the cache invalidation bug
```

That is the shape I wanted: stay where I am, send a task to the agent that might be good at it, get the result back.

In OpenCode, chorus exposes MCP tools like:

```text
delegate_claude
delegate_gemini
delegate_codex
```

Gemini CLI and Codex use skills, because that is the native extension point in those environments. I wanted chorus to feel local in each tool, not like one tool awkwardly pretending to be another.

The most interesting use case is review.

A lot of AI code review is framed as “ask the model if the code is correct.” I do not really trust that framing. Models miss things. They can be overconfident. They can nitpick style and miss behavior.

But multiple agents reviewing the same change independently is different.

One agent might focus on test coverage. Another might notice an API shape problem. Another might point out that the new helper does not fit the project’s existing patterns.

The value is not authority. The value is disagreement.

When three agents all flag the same issue, I pay attention. When they disagree, that is often useful too, because it shows where the decision is actually about tradeoffs instead of correctness.

The workflow becomes something like:

```text
/codex:review focus on correctness and missing tests
/gemini:review focus on architecture and long-term maintainability
/opencode:review focus on whether this change is too large
```

Then I read the outputs like I would read comments from different engineers. Some are useful. Some are not. The final judgment is still mine.

That matters to me. I do not want coding tools that encourage me to stop thinking. I want tools that make it easier to think with more context.

chorus also makes small delegation practical. If I need a mechanical refactor, I can send it to one agent. If I need a second opinion before changing a public interface, I can ask another. If I want a final review before pushing, I can run parallel reviews without leaving the CLI I am already using.

I am Ukrainian, and a lot of my engineering taste comes from being practical under constraints. Tools should earn their place. They should remove friction, not add ceremony. chorus is very much in that spirit.

It is not a platform. It is not a new IDE. It does not ask you to abandon your current workflow.

It just connects the agents you may already be using.

Install once. Use all four from your preferred tool. Let them disagree. Keep the judgment.

GitHub: https://github.com/valpere/chorus

### UA

# Найкращий AI coding agent іноді той, який не відкритий зараз

Я не планував будувати якусь велику multi-agent систему.

Мені просто набридло копіювати текст між терміналами.

Мій звичайний workflow зараз складається з кількох інструментів. Claude Code часто відкритий, коли треба глибоко прочитати кодову базу. Codex корисний, коли треба акуратна імплементація з увагою до контексту. Gemini CLI дає інший тип reasoning. OpenCode добре лягає в terminal-native і scriptable підхід.

Проблема в тому, що кожен інструмент поводиться так, ніби він увесь всесвіт.

Ти починаєш у Claude Code, а потім розумієш, що хочеш попросити Codex подивитися на тести. Копіюєш контекст. Вставляєш в інший інструмент. Знову пояснюєш задачу. Потім переносиш результат назад. Потім, можливо, хочеш Gemini для архітектурного review, і все повторюється.

У якийсь момент я зрозумів: проблема не в моделях. Проблема в plumbing.

Тому я зробив **chorus**.

chorus — це open-source колекція плагінів для чотирьох AI coding CLI:

- Claude Code
- OpenCode
- Gemini CLI
- Codex

Він дозволяє кожному з них делегувати задачі іншим трьом. Виходить `4x3` mesh агентів, які можуть виконувати задачі, робити code review або відповідати на питання прямо з твого улюбленого інструмента.

Мета не в тому, щоб зробити театральну “AI-команду” з ролями й дашбордами. Мета простіша: дозволити інструментам говорити між собою, не змушуючи розробника бути кур’єром.

Якщо я працюю в Claude Code, я можу написати:

```text
/opencode:run simplify the CLI argument parsing

/gemini:review check this module boundary for architectural issues

/codex:run add regression tests for the cache invalidation bug
```

Саме цього workflow я хотів: залишаюся там, де працюю, відправляю задачу агенту, який може добре з нею впоратися, отримую результат назад.

В OpenCode chorus доступний як MCP tools:

```text
delegate_claude
delegate_gemini
delegate_codex
```

Gemini CLI і Codex використовують skills, бо це їхня природна точка розширення. Я хотів, щоб chorus відчувався нативно в кожному інструменті, а не як один інструмент, який незграбно прикидається іншим.

Найцікавіший сценарій — review.

Багато AI code review звучить як “спитай модель, чи код правильний”. Я не дуже довіряю такому формулюванню. Моделі пропускають речі. Вони можуть бути надто впевненими. Вони можуть чіплятися до стилю й не помітити поведінкову проблему.

Але кілька агентів, які незалежно review-ять один і той самий diff, — це вже інша історія.

Один агент може сфокусуватися на тестах. Інший помітить проблему в API. Третій побачить, що новий helper не схожий на решту кодової бази.

Цінність не в авторитеті. Цінність у різниці поглядів.

Коли три агенти вказують на одну проблему, я уважно дивлюся. Коли вони не погоджуються, це теж корисно: часто означає, що рішення не про “правильно/неправильно”, а про tradeoff.

Workflow може виглядати так:

```text
/codex:review focus on correctness and missing tests
/gemini:review focus on architecture and long-term maintainability
/opencode:review focus on whether this change is too large
```

Потім я читаю відповіді так само, як читав би коментарі від різних інженерів. Щось корисне. Щось ні. Фінальне рішення все одно моє.

Для мене це важливо. Я не хочу інструменти, які привчають не думати. Я хочу інструменти, які допомагають думати з більшим контекстом.

chorus також робить дрібне делегування практичним. Треба mechanical refactor — відправляю одному агенту. Треба друга думка перед зміною public interface — питаю іншого. Треба фінальне review перед push — запускаю кілька review паралельно, не виходячи з CLI.

Я український інженер, і мій смак до інструментів дуже практичний. Інструмент має заслужити місце в workflow. Він має прибирати тертя, а не додавати церемонії. chorus саме з цієї категорії.

Це не платформа. Не новий IDE. Він не просить тебе викинути поточний workflow.

Він просто з’єднує агентів, якими ти вже можеш користуватися.

Встановив один раз. Використовуєш усі чотири з улюбленого інструмента. Дозволяєш їм не погоджуватися. Рішення залишаєш за собою.

GitHub: https://github.com/valpere/chorus

---

## 3. Medium

### EN

# chorus: Let AI coding agents delegate to each other

I use more than one AI coding agent because they are not interchangeable.

Claude Code, OpenCode, Gemini CLI, and Codex all have different strengths. One may be better at reading a large codebase. Another may be better at implementation. Another may give a useful architecture critique. Another may fit better into a terminal workflow.

But switching between them is still clumsy.

You copy context from one tool, paste it into another, explain the task again, wait for a result, then manually bring that result back. After doing that enough times, the problem becomes obvious: the agents are useful, but the workflow around them is still fragmented.

That is why I built **chorus**.

chorus is an open-source cross-agent plugin collection that connects four AI coding CLIs:

- Claude Code
- OpenCode
- Gemini CLI
- Codex

It creates a `4x3` mesh. Each agent can delegate to the other three. Delegation can mean running a task, reviewing code, or answering a question.

From Claude Code, that looks like slash commands:

```text
/opencode:run clean up this parser and keep behavior unchanged
/gemini:review check the architecture of this change
/codex:run add missing tests for the retry logic
```

From OpenCode, chorus provides MCP tools:

```text
delegate_claude
delegate_gemini
delegate_codex
```

Gemini CLI and Codex use skills, so the integration matches how those tools already work.

The workflow I care about most is parallel review.

Instead of asking one model to review a change, I can ask several agents to look at the same diff with different priorities:

```text
/codex:review focus on correctness
/gemini:review focus on design tradeoffs
/opencode:review focus on scope and simplicity
```

This is useful because AI agents fail differently. One misses a bug but notices unclear structure. Another overthinks design but catches a missing test. Another gives a blunt “this is too much change for one PR” response.

I do not treat any single answer as truth. I treat them as review comments. Some are right. Some are noise. The value is in getting multiple independent passes quickly, while staying in the tool I already use.

chorus is intentionally small in concept. It does not try to replace your editor or become a new AI platform. It just lets your existing coding agents cooperate.

Install once. Use all four from your preferred CLI. Delegate the boring parts. Ask for second opinions. Run parallel reviews before shipping.

As developers, we are still responsible for the code. chorus does not change that. It just makes the surrounding feedback loop faster and less annoying.

GitHub: https://github.com/valpere/chorus

### UA

# chorus: AI coding agents, які можуть делегувати задачі одне одному

Я використовую більше ніж одного AI coding agent, бо вони не однакові.

Claude Code, OpenCode, Gemini CLI і Codex мають різні сильні сторони. Один краще читає велику кодову базу. Інший точніший в імплементації. Третій дає корисний архітектурний погляд. Четвертий краще вписується в terminal workflow.

Але перемикатися між ними досі незручно.

Ти копіюєш контекст з одного інструмента, вставляєш в інший, знову пояснюєш задачу, чекаєш результат і вручну переносиш його назад. Коли робиш це багато разів, стає очевидно: агенти корисні, але workflow між ними фрагментований.

Тому я зробив **chorus**.

chorus — це open-source колекція плагінів, яка з’єднує чотири AI coding CLI:

- Claude Code
- OpenCode
- Gemini CLI
- Codex

Він створює `4x3` mesh. Кожен агент може делегувати задачі іншим трьом. Делегування може бути виконанням задачі, code review або питанням.

У Claude Code це виглядає як slash commands:

```text
/opencode:run clean up this parser and keep behavior unchanged
/gemini:review check the architecture of this change
/codex:run add missing tests for the retry logic
```

В OpenCode chorus доступний через MCP tools:

```text
delegate_claude
delegate_gemini
delegate_codex
```

Gemini CLI і Codex використовують skills, тому інтеграція відповідає тому, як ці інструменти вже працюють.

Найважливіший для мене workflow — паралельне review.

Замість того щоб просити одну модель review-нути зміну, я можу попросити кількох агентів подивитися на той самий diff з різними пріоритетами:

```text
/codex:review focus on correctness
/gemini:review focus on design tradeoffs
/opencode:review focus on scope and simplicity
```

Це корисно, бо AI-агенти помиляються по-різному. Один пропускає bug, але помічає нечітку структуру. Інший занадто багато думає про дизайн, але ловить відсутній тест. Третій прямо каже: “ця зміна завелика для одного PR”.

Я не сприймаю жодну відповідь як істину. Я сприймаю їх як review comments. Частина корисна. Частина шум. Цінність у тому, що можна швидко отримати кілька незалежних проходів, не виходячи з інструмента, в якому вже працюєш.

chorus навмисно простий за ідеєю. Він не намагається замінити editor чи стати новою AI-платформою. Він просто дозволяє існуючим coding agents співпрацювати.

Встановив один раз. Використовуєш усі чотири з улюбленого CLI. Делегуєш рутину. Питаєш другу думку. Запускаєш паралельні review перед тим, як shipping.

Ми, розробники, все одно відповідаємо за код. chorus цього не змінює. Він просто робить feedback loop швидшим і менш дратівливим.

GitHub: https://github.com/valpere/chorus

---

## 4. LinkedIn

### EN

I built **chorus**, an open-source plugin collection that lets AI coding CLIs delegate tasks to each other.

It connects four tools:

Claude Code, OpenCode, Gemini CLI, and Codex.

The idea is simple: install once, then use the other agents from whichever tool you already prefer.

From Claude Code, for example:

```text
/opencode:run refactor this module
/gemini:review check the architecture
/codex:run add missing tests
```

OpenCode gets MCP tools like `delegate_claude`, `delegate_gemini`, and `delegate_codex`. Gemini CLI and Codex use skills.

The most useful workflow for me is parallel review. Ask multiple agents to review the same change with different priorities: correctness, architecture, maintainability, test coverage.

I do not think of this as replacing engineering judgment. The opposite, actually. Different agents fail differently, and comparing their feedback often makes the real tradeoffs clearer.

chorus is small, practical, and open source.

GitHub: https://github.com/valpere/chorus

### UA

Я зробив **chorus** — open-source колекцію плагінів, яка дозволяє AI coding CLI делегувати задачі одне одному.

Він з’єднує чотири інструменти:

Claude Code, OpenCode, Gemini CLI і Codex.

Ідея проста: встановлюєш один раз, а потім використовуєш інших агентів з того інструмента, в якому тобі зручно працювати.

Наприклад, з Claude Code:

```text
/opencode:run refactor this module
/gemini:review check the architecture
/codex:run add missing tests
```

В OpenCode є MCP tools: `delegate_claude`, `delegate_gemini`, `delegate_codex`. Gemini CLI і Codex використовують skills.

Найкорисніший workflow для мене — паралельне review. Можна попросити кількох агентів подивитися на одну зміну з різних боків: correctness, architecture, maintainability, tests.

Я не сприймаю це як заміну інженерному judgment. Навпаки. Різні агенти помиляються по-різному, і порівняння їхнього feedback часто краще показує справжні tradeoffs.

chorus маленький, практичний і open source.

GitHub: https://github.com/valpere/chorus

---

## 5. Facebook

### EN

I made a small open-source thing called **chorus**.

It connects four AI coding tools: Claude Code, OpenCode, Gemini CLI, and Codex.

The problem it solves is very practical: I was tired of copying code and context between different agents just to get a second opinion or ask another tool to do a specific task.

With chorus, you can stay in your preferred CLI and delegate to the others.

For example, from Claude Code:

```text
/gemini:review this change
/codex:run add tests
/opencode:run simplify this module
```

The best part so far is parallel review. Different agents catch different things. None of them replaces your judgment, but together they can give useful pressure on a patch before you ship it.

Open source here: https://github.com/valpere/chorus

### UA

Я зробив невеликий open-source проєкт — **chorus**.

Він з’єднує чотири AI coding tools: Claude Code, OpenCode, Gemini CLI і Codex.

Проблема дуже практична: мені набридло копіювати код і контекст між різними агентами, щоб отримати другу думку або попросити інший інструмент виконати конкретну задачу.

З chorus можна залишатися у своєму улюбленому CLI й делегувати задачі іншим.

Наприклад, з Claude Code:

```text
/gemini:review this change
/codex:run add tests
/opencode:run simplify this module
```

Найкраще поки працює паралельне review. Різні агенти ловлять різні речі. Жоден не замінює твій judgment, але разом вони можуть добре притиснути patch перед shipping.

Open source тут: https://github.com/valpere/chorus

---

## 6. X/Twitter

### EN

1/ I built **chorus**: an open-source plugin collection that lets AI coding CLIs delegate tasks to each other.

Claude Code, OpenCode, Gemini CLI, Codex.

A `4x3` mesh: each agent can ask the other three to run tasks, review code, or answer questions.

https://github.com/valpere/chorus

2/ Example from Claude Code:

```text
/opencode:run refactor this module
/gemini:review check the architecture
/codex:run add missing tests
```

Same idea in OpenCode via MCP tools: `delegate_claude`, `delegate_gemini`, `delegate_codex`.

3/ The workflow I care about most: parallel review.

Ask multiple agents to review the same diff with different priorities:

correctness, architecture, test coverage, maintainability.

They fail differently. That is useful.

4/ chorus is not about replacing developer judgment.

It is about removing the copy-paste tax between tools and making second opinions cheap.

Install once. Use all four agents from your preferred CLI.

### UA

1/ Я зробив **chorus**: open-source колекцію плагінів, яка дозволяє AI coding CLI делегувати задачі одне одному.

Claude Code, OpenCode, Gemini CLI, Codex.

`4x3` mesh: кожен агент може просити інших трьох виконати задачу, зробити review або відповісти на питання.

https://github.com/valpere/chorus

2/ Приклад з Claude Code:

```text
/opencode:run refactor this module
/gemini:review check the architecture
/codex:run add missing tests
```

В OpenCode та сама ідея працює через MCP tools: `delegate_claude`, `delegate_gemini`, `delegate_codex`.

3/ Найкорисніший workflow: паралельне review.

Просиш кількох агентів подивитися на один diff з різними фокусами:

correctness, architecture, tests, maintainability.

Вони помиляються по-різному. І це корисно.

4/ chorus не про заміну developer judgment.

Він про те, щоб прибрати copy-paste tax між інструментами й зробити другу думку дешевою.

Встановив один раз. Використовуєш усі чотири агенти зі свого улюбленого CLI.

---

## 7. Bluesky

### EN

Post 1:

I built **chorus**: open-source plugins that let AI coding CLIs delegate to each other.

Claude Code, OpenCode, Gemini CLI, Codex.

Install once, use the other agents from the tool you already like.

https://github.com/valpere/chorus

Post 2:

The useful part is parallel review.

Ask Codex to focus on correctness, Gemini on architecture, OpenCode on scope, Claude on maintainability.

None of them is “the truth”. The value is that they fail differently.

Post 3:

chorus supports Claude Code slash commands, OpenCode MCP tools, and skills for Gemini CLI / Codex.

It is basically plumbing for developers who already use more than one AI coding agent and are tired of being the clipboard.

### UA

Post 1:

Я зробив **chorus**: open-source плагіни, які дозволяють AI coding CLI делегувати задачі одне одному.

Claude Code, OpenCode, Gemini CLI, Codex.

Встановлюєш один раз і використовуєш інших агентів зі свого улюбленого інструмента.

https://github.com/valpere/chorus

Post 2:

Найкорисніше — паралельне review.

Codex може дивитися на correctness, Gemini на architecture, OpenCode на scope, Claude на maintainability.

Жоден не є “істиною”. Цінність у тому, що вони помиляються по-різному.

Post 3:

chorus підтримує slash commands у Claude Code, MCP tools в OpenCode і skills для Gemini CLI / Codex.

По суті, це plumbing для розробників, які вже користуються кількома AI coding agents і втомилися бути clipboard між ними.
