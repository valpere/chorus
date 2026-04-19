Зробив невеликий open-source інструмент для тих, хто користується AI coding CLI.

Називається `chorus`: https://github.com/valpere/chorus

Він зʼєднує Claude Code, OpenCode, Gemini CLI та Codex, щоб вони могли делегувати задачі одне одному. Тобто з Claude Code можна запускати `/gemini:review` або `/codex:run`, не перемикаючи термінали й не копіюючи контекст.

Головний use case — code review від кількох агентів одночасно. Не тому, що AI agents завжди праві, а тому що різні агенти помічають різні проблеми. Кілька незалежних думок перед merge реально корисні.

У chorus тепер є named workflow команди як плагіни: `/chorus:review` робить паралельне review `git diff HEAD` однією командою (замість трьох окремих). Є також `/chorus:council`, `/chorus:debug` та `/chorus:second-opinion` для інших поширених патернів.

Одна інсталяція, чотири агенти з того інструмента, яким ви вже користуєтесь.
