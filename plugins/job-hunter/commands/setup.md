---
description: Onboarding wizard for job-hunter — creates profile.yaml and saves browser sessions per platform
argument-hint: "[--reconfigure]"
---

Set up job-hunter profile and browser sessions. Run this once before the first `/job-hunter:hunt`.

Raw arguments: `$ARGUMENTS`

## Pre-flight

Check if profile already exists:

```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/profile.mjs" exists
```

- If it exits **0** (profile exists) AND `--reconfigure` is NOT in `$ARGUMENTS`: tell the user the profile already exists at `~/.config/job-hunter/profile.yaml` and suggest running `/job-hunter:setup --reconfigure` to overwrite it. Stop.
- If it exits **1** (no profile) OR `--reconfigure` is in arguments: proceed with wizard.

## Install plugin dependencies

```bash
npm install --prefix "$CLAUDE_PLUGIN_ROOT" --silent
```

If this exits non-zero, stop and report the error.

## Wizard questions

Ask the user the following questions one at a time using `AskUserQuestion`. Collect all answers before writing the file.

1. **Full name** — used in cover letters
2. **Current title** — e.g. "Senior Software Engineer / CTO"
3. **Key skills** — comma-separated, e.g. "Go, TypeScript, Docker, Kubernetes, PostgreSQL"
4. **Minimum salary** — number only, e.g. 5000
5. **Salary currency** — USD / EUR / UAH
6. **Location preference** — remote / hybrid / onsite / any
7. **Email address** — for application forms
8. **CV file path** — local path to PDF resume, or leave empty to skip CV upload
9. **Which platforms to enable** — multiselect: Djinni / Work.ua / Robota.ua / DOU.ua
10. **Search queries per enabled platform** — comma-separated per platform, e.g. "golang backend, go developer"
11. **Auto-apply threshold** — score 0–100 above which to apply automatically (default: 85)
12. **Confirm threshold** — score 0–100 above which to prompt Y/N (default: 60)
13. **Cover letter template** — multiline text, or press Enter to use the built-in template
14. **Tracking file path** — where to save applications.xlsx (default: ~/.config/job-hunter/applications.xlsx)

If the user skips the cover letter template (empty answer), use this built-in:

```
Hi,

I'm applying for the {title} position at {company}.

{custom_paragraph}

My background: {profile_summary}

Full profile: https://valpere.github.io

Best regards,
{name}
```

## Build profile object

Construct a JSON object matching this shape (set `enabled: true` only for platforms the user selected; queries come from the user's per-platform answers):

```json
{
  "name": "<name>",
  "title": "<title>",
  "skills": ["<skill1>", "<skill2>"],
  "salary_min": 5000,
  "currency": "USD",
  "location": "remote",
  "email": "<email>",
  "cv_path": "<path or null>",
  "platforms": {
    "djinni":    { "enabled": true,  "queries": ["golang backend", "go developer"] },
    "work_ua":   { "enabled": false, "queries": [] },
    "robota_ua": { "enabled": false, "queries": [] },
    "dou_ua":    { "enabled": false, "queries": [] }
  },
  "thresholds": { "auto": 85, "confirm": 60 },
  "cover_letter_template": "<template text>",
  "tracking_file": "~/.config/job-hunter/applications.xlsx"
}
```

## Save profile

```bash
echo '<profile-json>' | node "$CLAUDE_PLUGIN_ROOT/scripts/profile.mjs" save
```

If this exits non-zero, stop and report the error.

## Save browser sessions

For each **enabled** platform:

1. Tell the user: "I'll open [Platform] so you can log in. Once you're logged in and the page has loaded your account, let me know."
2. Navigate to the platform login URL using Playwright MCP:
   - Djinni: `https://djinni.co/login`
   - Work.ua: `https://www.work.ua/uk/login`
   - Robota.ua: `https://robota.ua/auth/login`
   - DOU.ua: `https://dou.ua/login`
3. Ask the user to confirm they are logged in (use `AskUserQuestion` with option "I'm logged in").
4. Extract cookies from the browser using Playwright `browser_evaluate`:
   ```javascript
   document.cookie
   ```
   Parse the cookie string into an array of `{ name, value, domain }` objects (split by `"; "`, then split each by `"="`).
5. Save session:
   ```bash
   echo '<cookies-json>' | node "$CLAUDE_PLUGIN_ROOT/scripts/profile.mjs" save-session <platform>
   ```

## Confirm

Tell the user:
- Profile saved to `~/.config/job-hunter/profile.yaml`
- Sessions saved for: [list of enabled platforms]
- Run `/job-hunter:hunt` to start scanning
