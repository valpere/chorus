---
description: Scan job platforms, score vacancies, generate cover letters, and apply
argument-hint: "[--platform djinni|work_ua|robota_ua|dou_ua] [--dry-run] [--limit N]"
---

Main job-hunter loop: scan → score → cover letter → apply → track.

Raw arguments: `$ARGUMENTS`

Parse flags from `$ARGUMENTS`:
- `--platform <name>` → only scan this platform (skip others)
- `--dry-run` → score and display table, but do not apply or write to tracking
- `--limit N` → stop after N vacancies per platform per query (default: 20)

## Pre-flight

1. Check profile exists:
   ```bash
   node "$CLAUDE_PLUGIN_ROOT/scripts/profile.mjs" exists
   ```
   If exits 1: tell user to run `/job-hunter:setup` first. Stop.

2. Load profile:
   ```bash
   node "$CLAUDE_PLUGIN_ROOT/scripts/profile.mjs" load
   ```
   Parse the JSON output as `profile`.

3. Verify Playwright MCP is available by taking a browser snapshot:
   ```
   browser_snapshot
   ```
   If this fails (tool not available), stop and tell the user: "Playwright MCP is required. Install it via `claude mcp add playwright` and restart."

4. Determine active platforms: if `--platform` was specified, use only that platform (verify it is enabled in profile). Otherwise use all platforms where `enabled: true`.

## Scan each platform

Process platforms sequentially to avoid browser conflicts. For each active platform, run its scan section below.

### Djinni (`https://djinni.co`)

For each query in `profile.platforms.djinni.queries`:

1. Load session: `node "$CLAUDE_PLUGIN_ROOT/scripts/profile.mjs" load-session djinni`
   If not null, inject non-HttpOnly cookies via `browser_evaluate` (note: HttpOnly cookies
   cannot be set via JavaScript and are silently ignored):
   ```javascript
   // for each cookie { name, value, domain }
   document.cookie = `${name}=${value}; path=/`;
   ```
   After injecting, navigate to `https://djinni.co` and check for a logged-in indicator
   (e.g. user avatar or account menu). If not logged in, warn the user that the saved
   session has expired and they should re-run `/job-hunter:setup` to refresh it.

2. Navigate to search URL:
   `https://djinni.co/jobs/?primary_keyword=<url-encoded-query>&employment=remote`

3. For each vacancy card on the results page (up to `--limit`, default 20):
   - Extract from card: title, company, salary text, vacancy URL, tech tag chips
   - Follow the vacancy URL, extract full description text
   - Navigate back to results

4. Return vacancy objects with `"platform": "djinni"`.

### Work.ua (`https://www.work.ua`)

For each query in `profile.platforms.work_ua.queries`:

1. Load session: `node "$CLAUDE_PLUGIN_ROOT/scripts/profile.mjs" load-session work_ua`
   Inject non-HttpOnly cookies (same pattern as Djinni). Verify logged-in state on
   `https://www.work.ua` before searching; warn on session expiry.

2. Navigate to: `https://www.work.ua/jobs/?q=<url-encoded-query>&employment=74`

3. Extract up to `--limit` cards; follow each link, extract title/company/salary/description.

4. Return vacancy objects with `"platform": "work_ua"`.

### Robota.ua (`https://robota.ua`)

For each query in `profile.platforms.robota_ua.queries`:

1. Load session: `node "$CLAUDE_PLUGIN_ROOT/scripts/profile.mjs" load-session robota_ua`
   Inject non-HttpOnly cookies (same pattern as Djinni). Verify logged-in state on
   `https://robota.ua` before searching; warn on session expiry.

2. Navigate to: `https://robota.ua/jobs/<url-encoded-query>?employmentTypeName=remote`

3. Extract up to `--limit` cards; follow each, extract title/company/salary/description.

4. Return vacancy objects with `"platform": "robota_ua"`.

### DOU.ua (`https://jobs.dou.ua`)

For each query in `profile.platforms.dou_ua.queries`:

1. Load session: `node "$CLAUDE_PLUGIN_ROOT/scripts/profile.mjs" load-session dou_ua`
   Inject non-HttpOnly cookies (same pattern as Djinni). Verify logged-in state on
   `https://jobs.dou.ua` before searching; warn on session expiry.

2. Navigate to: `https://jobs.dou.ua/vacancies/?search=<url-encoded-query>&remote`

3. Extract up to `--limit` cards; follow each, extract title/company/salary/description.

4. Return vacancy objects with `"platform": "dou_ua"`.

## Score all vacancies

For each collected vacancy:

```bash
# Write vacancy JSON to a temp file to avoid shell quoting issues with
# apostrophes or special characters in vacancy titles/descriptions.
_VACANCY_TMP=$(mktemp)
cat > "$_VACANCY_TMP" << 'VACANCY_EOF'
<vacancy-json-single-line>
VACANCY_EOF
node "$CLAUDE_PLUGIN_ROOT/scripts/score.mjs" \
  --profile ~/.config/job-hunter/profile.yaml \
  --vacancy-file "$_VACANCY_TMP"
rm -f "$_VACANCY_TMP"
```

Parse `{ score, breakdown }` from stdout. Attach to vacancy object.

## Deduplicate

Load existing tracking:
```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/excel.mjs" read \
  --file "<profile.tracking_file>"
```

Filter out any vacancies whose `url` is already in the tracking data.

## Display results table

Sort remaining vacancies by `score` descending. Display as a markdown table:

```
| # | Score | Title | Company | Salary | Platform | Notes |
|---|-------|-------|---------|--------|----------|-------|
| 1 | 91 | Senior Go Developer | Acme Corp | $5k–$8k | djinni | ✅ auto |
| 2 | 72 | Backend Engineer | TechCo | $4k–$6k | work_ua | 🔶 confirm |
| 3 | 45 | Go Dev | Unknown | — | robota_ua | ⏭ skip |
```

Legend: ✅ ≥ auto threshold → auto-apply | 🔶 ≥ confirm threshold → will ask | ⏭ below confirm → skip

If `--dry-run`: print table and stop. Do not apply or track.

## Apply loop

Process vacancies in score-descending order.

### Auto-apply (score ≥ `profile.thresholds.auto`)

For each vacancy:

1. Generate cover letter by substituting into `profile.cover_letter_template`:
   - `{title}` → vacancy title
   - `{company}` → company name
   - `{custom_paragraph}` → write a 2-sentence paragraph about why this specific role is a fit (based on vacancy description and profile skills)
   - `{profile_summary}` → first 200 characters of a skills summary built from `profile.skills` and `profile.title`
   - `{name}` → `profile.name`

2. Navigate to the vacancy URL via Playwright MCP. Find and click the "Apply" button.

3. Fill the application form:
   - Name field → `profile.name`
   - Email field → `profile.email`
   - Cover letter / message field → generated cover letter
   - CV/resume file upload → `profile.cv_path` if not null and upload field is present
   - Submit button → click

4. Record `status: "applied"`, `cover_letter_sent: "yes"`.

### Confirm-apply (score between `profile.thresholds.confirm` and `profile.thresholds.auto` - 1)

For each vacancy, display a summary and ask:

```
─────────────────────────────────────
Title:  Senior Backend Engineer at TechCo
Score:  72  (skills:24 salary:20 location:20 seniority:6 company:2)
Salary: $4,000–$6,000
Stack:  Go, PostgreSQL, Redis
URL:    https://work.ua/jobs/456
─────────────────────────────────────
```

Use `AskUserQuestion` with options: `Yes, apply` / `No, skip`.

- Yes: apply using the same steps as auto-apply. Record `status: "confirmed"`, `cover_letter_sent: "yes"`.
- No: record `status: "skipped"`, `cover_letter_sent: "no"`.

### Skip (score < `profile.thresholds.confirm`)

Record `status: "skipped"`, `cover_letter_sent: "no"`. No display, no prompt.

## Write tracking

After all vacancies are processed, write all entries (applied + confirmed + skipped) to Excel:

```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/excel.mjs" append \
  --file "<profile.tracking_file>" \
  --rows '<rows-json>'
```

Each row object:
```json
{
  "date": "2026-05-16",
  "platform": "djinni",
  "url": "https://djinni.co/jobs/123",
  "title": "Senior Go Developer",
  "company": "Acme Corp",
  "salary": "$5000–$8000",
  "score": 91,
  "skill_breakdown": "{\"skills\":28,\"salary\":20,\"location\":20,\"seniority\":10,\"company\":8}",
  "status": "applied",
  "cover_letter_sent": "yes",
  "notes": ""
}
```

## Summary

Print final counts:
```
Hunt complete.
Applied:  N (auto)
Applied:  N (confirmed)
Skipped:  N
Total:    N vacancies processed
Tracking: <tracking_file>
```
