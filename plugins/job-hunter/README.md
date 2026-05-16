# job-hunter

Automated vacancy scanning, scoring, cover letter generation, and hybrid auto-apply for Ukrainian tech job platforms.

**Platforms:** Djinni · Work.ua · Robota.ua · DOU.ua

---

## Quick Start

### 1. Install the plugin

```bash
claude plugin install https://github.com/valpere/chorus
```

### 2. Run setup (first time only)

```
/job-hunter:setup
```

Interactive wizard — creates `~/.config/job-hunter/profile.yaml` and saves browser sessions for each enabled platform.

### 3. Hunt

```
/job-hunter:hunt
```

Scans all enabled platforms, scores vacancies, prompts for medium-score ones, auto-applies for high-score ones.

```
/job-hunter:hunt --dry-run           # preview scores without applying
/job-hunter:hunt --platform djinni   # scan one platform only
/job-hunter:hunt --limit 10          # max 10 vacancies per query
```

### 4. Check status

```
/job-hunter:status
/job-hunter:status --last 50
```

---

## Scoring (0–100)

| Dimension | Weight | Logic |
|-----------|--------|-------|
| Skill overlap | 40 | Jaccard similarity: intersection / union of profile.skills vs vacancy stack tags |
| Salary | 20 | 20 if vacancy max ≥ profile min; proportional if partial; 10 if no salary stated |
| Location | 20 | 20 if preference matches (remote/hybrid/onsite/any) |
| Seniority | 10 | 10 if title level matches; 0 if junior/intern role |
| Company | 10 | Heuristics: named company, salary stated, not an outsource/body-leasing ad |

### Threshold tuning

Edit `~/.config/job-hunter/profile.yaml`:

```yaml
thresholds:
  auto: 85     # raise to be more selective; lower for more auto-applies
  confirm: 60  # lower to see more vacancies in the confirm prompt
```

If getting too many false-positives in auto-apply → raise `auto` to 90.
If good jobs are being skipped → lower `confirm` to 50.

---

## Profile configuration

Full reference: [`profile.example.yaml`](profile.example.yaml)

Key fields:
- `skills` — the more specific, the better the skill score
- `salary_min` — in your chosen currency; vacancies with no salary info get 10 pts (partial credit)
- `location` — `remote` is the most common filter; `any` disables location filtering
- `cv_path` — PDF path for upload fields; set to `null` to skip

---

## Platform-specific notes

### Djinni

Cookie-based auth. `/job-hunter:setup` saves the session. Sessions expire after ~30 days — re-run setup to refresh.

### Work.ua / Robota.ua

Same cookie-based session flow. Salary is often stated in UAH — consider setting `currency: UAH` and `salary_min` in UAH if using these platforms primarily.

### DOU.ua

May show CAPTCHA on some flows. If the browser gets blocked, re-run `/job-hunter:setup` to refresh the session.

---

## Adding a new platform

1. Add an entry to `profile.yaml` under `platforms:` with `enabled: true` and `queries`.
2. Add a scan section to `commands/hunt.md` following the existing platform pattern.
3. Test with `/job-hunter:hunt --dry-run --platform <new>`.

---

## Troubleshooting

**"Profile not found"** — run `/job-hunter:setup`.

**"Session expired" / redirected to login** — re-run `/job-hunter:setup` to re-authenticate each platform.

**Score always low** — check `profile.skills` matches the tech keywords platforms use (e.g. "Golang" vs "Go (Programming Language)").

**CV upload field not found** — skipped automatically; cover letter is still submitted.
