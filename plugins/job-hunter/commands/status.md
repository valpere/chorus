---
description: Show recent job applications from tracking Excel file
argument-hint: "[--last N]"
---

Show the last N job applications logged by `/job-hunter:hunt`.

Raw arguments: `$ARGUMENTS`

Parse `--last N` from `$ARGUMENTS` (default 20 if absent).

## Load profile

```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/profile.mjs" load
```

Extract `tracking_file` from the JSON output. If profile load fails, use the default path `~/.config/job-hunter/applications.xlsx`.

## Read tracking

```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/excel.mjs" read \
  --file "<tracking_file>" \
  --last <N>
```

## Display

If the result is `[]`, print:

```
No applications tracked yet. Run /job-hunter:hunt to start.
```

Otherwise display a markdown table:

```
| Date | Platform | Title | Company | Score | Status |
|------|----------|-------|---------|-------|--------|
| 2026-05-16 | djinni | Senior Go Developer | Acme Corp | 88 | applied |
```

Then print counts per status value:

```
applied: N  confirmed: N  skipped: N  pending: N
Total: N applications shown (last N of M total)
```
