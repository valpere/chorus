# job-hunter Plugin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `job-hunter` plugin to chorus that scans Djinni / Work.ua / Robota.ua / DOU.ua for vacancies, scores them against a user profile, generates cover letters, and submits applications via Playwright MCP.

**Architecture:** Three slash commands (`/job-hunter:setup`, `/job-hunter:hunt`, `/job-hunter:status`) backed by three Node.js helper scripts that handle profile I/O, scoring, and Excel tracking. Commands without `disable-model-invocation` so Claude can reason through Playwright MCP interactions. Scripts receive/emit JSON via stdout so they stay pure data-manipulation utilities.

**Tech Stack:** Node.js 18+ (ESM), `js-yaml` 4.x, `exceljs` 4.x, Playwright MCP (assumed installed), chorus plugin format.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `plugins/job-hunter/.claude-plugin/plugin.json` | Create | Plugin metadata |
| `plugins/job-hunter/package.json` | Create | js-yaml + exceljs deps |
| `plugins/job-hunter/profile.example.yaml` | Create | Annotated reference profile |
| `plugins/job-hunter/README.md` | Create | Setup guide + command reference |
| `plugins/job-hunter/commands/setup.md` | Create | Onboarding wizard command |
| `plugins/job-hunter/commands/hunt.md` | Create | Main scan→score→apply loop |
| `plugins/job-hunter/commands/status.md` | Create | Recent applications display |
| `plugins/job-hunter/scripts/profile.mjs` | Create | Profile YAML load/save + session cookies |
| `plugins/job-hunter/scripts/score.mjs` | Create | 0–100 scoring engine, JSON output |
| `plugins/job-hunter/scripts/excel.mjs` | Create | xlsx append + read |
| `plugins/job-hunter/scripts/tests/profile.test.mjs` | Create | Unit tests for profile.mjs |
| `plugins/job-hunter/scripts/tests/score.test.mjs` | Create | Unit tests for score.mjs |
| `plugins/job-hunter/scripts/tests/excel.test.mjs` | Create | Unit tests for excel.mjs |
| `.claude-plugin/marketplace.json` | Modify | Register job-hunter plugin |
| `package.json` | Modify | Add job-hunter tests to test script |

---

## Task 1: Plugin scaffold

**Files:**
- Create: `plugins/job-hunter/.claude-plugin/plugin.json`
- Create: `plugins/job-hunter/package.json`
- Modify: `.claude-plugin/marketplace.json`

- [ ] **Step 1: Create plugin directory**

```bash
mkdir -p plugins/job-hunter/.claude-plugin
mkdir -p plugins/job-hunter/commands
mkdir -p plugins/job-hunter/scripts/tests
```

- [ ] **Step 2: Write plugin.json**

Create `plugins/job-hunter/.claude-plugin/plugin.json`:

```json
{
  "name": "job-hunter",
  "version": "1.0.0",
  "description": "Automated vacancy scanning, scoring, cover letter generation, and hybrid auto-apply for Djinni, Work.ua, Robota.ua, DOU.ua.",
  "author": { "name": "valpere" }
}
```

- [ ] **Step 3: Write package.json for the plugin**

Create `plugins/job-hunter/package.json`:

```json
{
  "name": "@chorus/job-hunter",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "engines": { "node": ">=18.18.0" },
  "dependencies": {
    "exceljs": "^4.4.0",
    "js-yaml": "^4.1.0"
  }
}
```

- [ ] **Step 4: Register plugin in marketplace.json**

Open `.claude-plugin/marketplace.json`. Add to the end of the `plugins` array (before the closing `]`):

```json
,
    {
      "name": "job-hunter",
      "description": "Automated vacancy scanning, scoring, cover letter generation, and hybrid auto-apply for Djinni, Work.ua, Robota.ua, DOU.ua.",
      "version": "1.0.0",
      "author": { "name": "valpere" },
      "source": "./plugins/job-hunter"
    }
```

- [ ] **Step 5: Verify marketplace.json is valid JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8')); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 6: Commit**

```bash
git add plugins/job-hunter/.claude-plugin/plugin.json plugins/job-hunter/package.json .claude-plugin/marketplace.json
git commit -m "feat(job-hunter): plugin scaffold and marketplace registration"
```

---

## Task 2: `scripts/profile.mjs`

**Files:**
- Create: `plugins/job-hunter/scripts/profile.mjs`

- [ ] **Step 1: Write profile.mjs**

Create `plugins/job-hunter/scripts/profile.mjs`:

```javascript
#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import yaml from 'js-yaml';

const DEFAULT_PATH = join(homedir(), '.config', 'job-hunter', 'profile.yaml');

function resolvePath(p) {
  if (!p) return DEFAULT_PATH;
  return p.startsWith('~') ? join(homedir(), p.slice(1)) : p;
}

function sessionPath(platform, profilePath) {
  return join(dirname(resolvePath(profilePath)), `session-${platform}.json`);
}

const [, , command, ...args] = process.argv;

switch (command) {
  case 'load': {
    const path = resolvePath(args[0]);
    if (!existsSync(path)) {
      process.stderr.write(`Profile not found: ${path}\nRun /job-hunter:setup first.\n`);
      process.exit(1);
    }
    process.stdout.write(JSON.stringify(yaml.load(readFileSync(path, 'utf8'))) + '\n');
    break;
  }
  case 'save': {
    const path = resolvePath(args[0]);
    const data = JSON.parse(readFileSync('/dev/stdin', 'utf8'));
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, yaml.dump(data, { lineWidth: 120 }), 'utf8');
    process.stdout.write(`Profile saved to ${path}\n`);
    break;
  }
  case 'exists': {
    process.exit(existsSync(resolvePath(args[0])) ? 0 : 1);
  }
  case 'save-session': {
    // args: <platform> [profile-path]
    const [platform, profileArg] = args;
    const spath = sessionPath(platform, profileArg);
    const cookies = JSON.parse(readFileSync('/dev/stdin', 'utf8'));
    mkdirSync(dirname(spath), { recursive: true });
    writeFileSync(spath, JSON.stringify(cookies, null, 2), 'utf8');
    process.stdout.write(`Session saved to ${spath}\n`);
    break;
  }
  case 'load-session': {
    const [platform, profileArg] = args;
    const spath = sessionPath(platform, profileArg);
    process.stdout.write((existsSync(spath) ? readFileSync(spath, 'utf8') : 'null') + '\n');
    break;
  }
  default:
    process.stderr.write(`Unknown command: ${command}\n`);
    process.stderr.write('Usage: profile.mjs <load|save|exists|save-session|load-session> [args]\n');
    process.exit(1);
}
```

- [ ] **Step 2: Smoke-test (no deps installed yet, just check syntax)**

```bash
node --input-type=module --eval "import './plugins/job-hunter/scripts/profile.mjs'" 2>&1 | grep -v "Cannot find"
```

Expected: output is empty or only `Cannot find module 'js-yaml'` (which is fine — deps not installed yet). No syntax errors.

- [ ] **Step 3: Commit**

```bash
git add plugins/job-hunter/scripts/profile.mjs
git commit -m "feat(job-hunter): profile YAML manager script"
```

---

## Task 3: `scripts/score.mjs`

**Files:**
- Create: `plugins/job-hunter/scripts/score.mjs`

- [ ] **Step 1: Write score.mjs**

Create `plugins/job-hunter/scripts/score.mjs`:

```javascript
#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import yaml from 'js-yaml';

// ── scoring dimensions ────────────────────────────────────────────────────────

function skillOverlap(profileSkills, vacancyStack) {
  if (!vacancyStack?.length || !profileSkills?.length) return 0;
  const pSet = new Set(profileSkills.map(s => s.toLowerCase()));
  const vSet = new Set(vacancyStack.map(s => s.toLowerCase()));
  const intersection = [...pSet].filter(s => vSet.has(s)).length;
  const union = new Set([...pSet, ...vSet]).size;
  return Math.round((intersection / union) * 40);
}

function salaryScore(profileMin, vacancy) {
  if (!vacancy.salary_min && !vacancy.salary_max) return 10; // unknown → partial credit
  const vacMax = vacancy.salary_max ?? vacancy.salary_min;
  if (vacMax >= profileMin) return 20;
  return Math.round((vacMax / profileMin) * 20);
}

function locationScore(profileLocation, vacancy) {
  if (profileLocation === 'any') return 20;
  const wantsRemote = profileLocation === 'remote';
  const wantsHybrid = profileLocation === 'hybrid';
  if (wantsRemote && vacancy.remote) return 20;
  if (wantsHybrid && (vacancy.remote || vacancy.hybrid)) return 20;
  if (profileLocation === 'onsite' && !vacancy.remote && !vacancy.hybrid) return 20;
  return 0;
}

function seniorityScore(profileTitle, vacancy) {
  const text = `${vacancy.title ?? ''} ${vacancy.description ?? ''}`.toLowerCase();
  const pt = profileTitle.toLowerCase();
  if (/junior|intern/.test(text)) return 0;
  if ((pt.includes('senior') && text.includes('senior')) ||
      (pt.includes('lead') && /lead|principal/.test(text)) ||
      (pt.includes('cto') && /head|director|principal|vp/.test(text))) return 10;
  return 6; // role exists, level unspecified
}

function companyScore(vacancy) {
  let pts = 2;
  if (vacancy.salary_min || vacancy.salary_max) pts += 3;
  if (vacancy.company?.length > 1) pts += 3;
  if (!/outsource|body.?leas|no.?name/i.test(vacancy.company ?? '')) pts += 2;
  return Math.min(pts, 10);
}

// ── CLI ───────────────────────────────────────────────────────────────────────

function parseNamedArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith('--')) out[argv[i].slice(2)] = argv[++i];
  }
  return out;
}

const args = parseNamedArgs(process.argv);

if (!args.vacancy) {
  process.stderr.write("Usage: score.mjs --profile <path> --vacancy '<json>'\n");
  process.exit(1);
}

const profilePath = args.profile
  ? (args.profile.startsWith('~') ? join(homedir(), args.profile.slice(1)) : args.profile)
  : join(homedir(), '.config', 'job-hunter', 'profile.yaml');

const profile = yaml.load(readFileSync(profilePath, 'utf8'));
const vacancy = JSON.parse(args.vacancy);

const breakdown = {
  skills:    skillOverlap(profile.skills, vacancy.stack),
  salary:    salaryScore(profile.salary_min, vacancy),
  location:  locationScore(profile.location, vacancy),
  seniority: seniorityScore(profile.title, vacancy),
  company:   companyScore(vacancy),
};
const score = Object.values(breakdown).reduce((a, b) => a + b, 0);

process.stdout.write(JSON.stringify({ score, breakdown }, null, 2) + '\n');
```

- [ ] **Step 2: Commit**

```bash
git add plugins/job-hunter/scripts/score.mjs
git commit -m "feat(job-hunter): scoring engine (0-100, 5 dimensions)"
```

---

## Task 4: `scripts/excel.mjs`

**Files:**
- Create: `plugins/job-hunter/scripts/excel.mjs`

- [ ] **Step 1: Write excel.mjs**

Create `plugins/job-hunter/scripts/excel.mjs`:

```javascript
#!/usr/bin/env node
import { readFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import ExcelJS from 'exceljs';

const DEFAULT_FILE = join(homedir(), '.config', 'job-hunter', 'applications.xlsx');

const COLUMNS = [
  { header: 'Date',              key: 'date',              width: 12 },
  { header: 'Platform',         key: 'platform',          width: 12 },
  { header: 'URL',              key: 'url',               width: 50 },
  { header: 'Title',            key: 'title',             width: 35 },
  { header: 'Company',          key: 'company',           width: 25 },
  { header: 'Salary',           key: 'salary',            width: 15 },
  { header: 'Score',            key: 'score',             width: 8  },
  { header: 'Skills Breakdown', key: 'skill_breakdown',   width: 40 },
  { header: 'Status',           key: 'status',            width: 12 },
  { header: 'Cover Letter Sent',key: 'cover_letter_sent', width: 18 },
  { header: 'Notes',            key: 'notes',             width: 40 },
];

function resolveFile(p) {
  if (!p) return DEFAULT_FILE;
  return p.startsWith('~') ? join(homedir(), p.slice(1)) : p;
}

function parseNamedArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith('--')) out[argv[i].slice(2)] = argv[i + 1]?.startsWith('--') ? true : argv[++i];
  }
  return out;
}

async function appendRows(file, rows) {
  mkdirSync(dirname(file), { recursive: true });
  const wb = new ExcelJS.Workbook();
  try { await wb.xlsx.readFile(file); } catch { /* new file, start empty */ }

  let ws = wb.getWorksheet('Applications');
  if (!ws) {
    ws = wb.addWorksheet('Applications');
    ws.columns = COLUMNS;
    ws.getRow(1).font = { bold: true };
    ws.getRow(1).fill = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: 'FFD9EAD3' },
    };
  }

  for (const row of rows) ws.addRow(row);
  await wb.xlsx.writeFile(file);
  process.stdout.write(`Appended ${rows.length} row(s) to ${file}\n`);
}

async function readRows(file, last) {
  const wb = new ExcelJS.Workbook();
  try { await wb.xlsx.readFile(file); } catch { process.stdout.write('[]\n'); return; }

  const ws = wb.getWorksheet('Applications');
  if (!ws) { process.stdout.write('[]\n'); return; }

  const rows = [];
  ws.eachRow({ includeEmpty: false }, (row, idx) => {
    if (idx === 1) return; // skip header
    rows.push({
      date:              row.getCell(1).value,
      platform:         row.getCell(2).value,
      url:              row.getCell(3).value,
      title:            row.getCell(4).value,
      company:          row.getCell(5).value,
      salary:           row.getCell(6).value,
      score:            row.getCell(7).value,
      skill_breakdown:  row.getCell(8).value,
      status:           row.getCell(9).value,
      cover_letter_sent:row.getCell(10).value,
      notes:            row.getCell(11).value,
    });
  });

  const result = last ? rows.slice(-last) : rows;
  process.stdout.write(JSON.stringify(result) + '\n');
}

const [, , command] = process.argv;
const args = parseNamedArgs(process.argv);
const file = resolveFile(args.file);

if (command === 'append') {
  const rowsJson = args.rows ?? readFileSync('/dev/stdin', 'utf8');
  await appendRows(file, JSON.parse(rowsJson));
} else if (command === 'read') {
  await readRows(file, args.last ? parseInt(args.last, 10) : undefined);
} else {
  process.stderr.write(`Unknown command: ${command}\n`);
  process.stderr.write('Usage: excel.mjs <append|read> --file <path> [--rows \'<json>\'|--last <N>]\n');
  process.exit(1);
}
```

- [ ] **Step 2: Commit**

```bash
git add plugins/job-hunter/scripts/excel.mjs
git commit -m "feat(job-hunter): Excel tracking script (append + read)"
```

---

## Task 5: Install deps and write tests

**Files:**
- Create: `plugins/job-hunter/scripts/tests/profile.test.mjs`
- Create: `plugins/job-hunter/scripts/tests/score.test.mjs`
- Create: `plugins/job-hunter/scripts/tests/excel.test.mjs`
- Modify: `package.json` (root)

- [ ] **Step 1: Install plugin deps**

```bash
npm install --prefix plugins/job-hunter
```

Expected: `plugins/job-hunter/node_modules/` created, `js-yaml` and `exceljs` installed.

- [ ] **Step 2: Write profile.test.mjs**

Create `plugins/job-hunter/scripts/tests/profile.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('../profile.mjs', import.meta.url));

function run(args, { stdin } = {}) {
  return spawnSync(process.execPath, [SCRIPT, ...args], {
    encoding: 'utf8',
    input: stdin ?? null,
    env: { ...process.env },
  });
}

const SAMPLE_YAML = `name: Test User
title: Senior Engineer
skills:
  - Go
  - TypeScript
salary_min: 5000
currency: USD
location: remote
`;

test('load returns JSON for valid profile', () => {
  const dir = mkdtempSync(join(tmpdir(), 'jh-'));
  try {
    writeFileSync(join(dir, 'profile.yaml'), SAMPLE_YAML, 'utf8');
    const r = run(['load', join(dir, 'profile.yaml')]);
    assert.equal(r.status, 0, r.stderr);
    const profile = JSON.parse(r.stdout);
    assert.equal(profile.name, 'Test User');
    assert.deepEqual(profile.skills, ['Go', 'TypeScript']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('load exits 1 when profile does not exist', () => {
  const r = run(['load', '/tmp/no-such-file-jh.yaml']);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /not found/);
});

test('save writes YAML from stdin JSON', () => {
  const dir = mkdtempSync(join(tmpdir(), 'jh-'));
  const path = join(dir, 'profile.yaml');
  try {
    const data = { name: 'Val', title: 'CTO', skills: ['Go'], salary_min: 6000 };
    const r = run(['save', path], { stdin: JSON.stringify(data) });
    assert.equal(r.status, 0, r.stderr);
    const content = readFileSync(path, 'utf8');
    assert.match(content, /name: Val/);
    assert.match(content, /salary_min: 6000/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('exists exits 0 when file present', () => {
  const dir = mkdtempSync(join(tmpdir(), 'jh-'));
  const path = join(dir, 'p.yaml');
  try {
    writeFileSync(path, SAMPLE_YAML);
    assert.equal(run(['exists', path]).status, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('exists exits 1 when file absent', () => {
  assert.equal(run(['exists', '/tmp/no-such-jh-profile.yaml']).status, 1);
});

test('save-session and load-session round-trip', () => {
  const dir = mkdtempSync(join(tmpdir(), 'jh-'));
  const profilePath = join(dir, 'profile.yaml');
  const cookies = [{ name: 'auth', value: 'tok123', domain: 'djinni.co' }];
  try {
    writeFileSync(profilePath, SAMPLE_YAML);
    const saveR = run(['save-session', 'djinni', profilePath], { stdin: JSON.stringify(cookies) });
    assert.equal(saveR.status, 0, saveR.stderr);

    const loadR = run(['load-session', 'djinni', profilePath]);
    assert.equal(loadR.status, 0, loadR.stderr);
    const loaded = JSON.parse(loadR.stdout);
    assert.deepEqual(loaded, cookies);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('load-session returns null when session absent', () => {
  const dir = mkdtempSync(join(tmpdir(), 'jh-'));
  const profilePath = join(dir, 'profile.yaml');
  try {
    writeFileSync(profilePath, SAMPLE_YAML);
    const r = run(['load-session', 'work_ua', profilePath]);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(JSON.parse(r.stdout), null);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 3: Run profile tests**

```bash
node --test plugins/job-hunter/scripts/tests/profile.test.mjs
```

Expected: 7 passing, 0 failing.

- [ ] **Step 4: Write score.test.mjs**

Create `plugins/job-hunter/scripts/tests/score.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('../score.mjs', import.meta.url));

const PROFILE_YAML = `name: Val
title: Senior Software Engineer
skills:
  - Go
  - TypeScript
  - Docker
  - Kubernetes
  - PostgreSQL
salary_min: 5000
currency: USD
location: remote
`;

function run(args, profilePath) {
  return spawnSync(process.execPath, [SCRIPT, '--profile', profilePath, ...args], {
    encoding: 'utf8',
  });
}

let dir, profilePath;

test('setup temp profile', () => {
  dir = mkdtempSync(join(tmpdir(), 'jh-score-'));
  profilePath = join(dir, 'profile.yaml');
  writeFileSync(profilePath, PROFILE_YAML, 'utf8');
  assert.ok(true);
});

test('perfect match scores above 80', () => {
  const vacancy = JSON.stringify({
    title: 'Senior Go Developer',
    company: 'Acme Corp',
    stack: ['Go', 'Docker', 'Kubernetes', 'PostgreSQL'],
    salary_min: 5000,
    salary_max: 8000,
    remote: true,
    description: 'Senior backend engineer needed',
  });
  const r = spawnSync(process.execPath,
    [SCRIPT, '--profile', profilePath, '--vacancy', vacancy],
    { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const { score, breakdown } = JSON.parse(r.stdout);
  assert.ok(score > 80, `expected >80, got ${score}`);
  assert.ok(breakdown.skills > 0);
  assert.equal(breakdown.salary, 20);
  assert.equal(breakdown.location, 20);
});

test('junior vacancy scores 0 on seniority', () => {
  const vacancy = JSON.stringify({
    title: 'Junior Go Developer',
    company: 'Corp',
    stack: ['Go'],
    salary_min: 5000,
    salary_max: 8000,
    remote: true,
    description: 'Junior developer role, 0-1 years',
  });
  const r = spawnSync(process.execPath,
    [SCRIPT, '--profile', profilePath, '--vacancy', vacancy],
    { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const { breakdown } = JSON.parse(r.stdout);
  assert.equal(breakdown.seniority, 0);
});

test('location mismatch scores 0 on location', () => {
  const vacancy = JSON.stringify({
    title: 'Senior Engineer',
    company: 'Corp',
    stack: ['Go'],
    salary_min: 6000,
    remote: false,
    hybrid: false,
    description: 'Onsite Kyiv only',
  });
  const r = spawnSync(process.execPath,
    [SCRIPT, '--profile', profilePath, '--vacancy', vacancy],
    { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const { breakdown } = JSON.parse(r.stdout);
  assert.equal(breakdown.location, 0);
});

test('no salary stated gives partial salary credit', () => {
  const vacancy = JSON.stringify({
    title: 'Senior Engineer',
    company: 'Corp',
    stack: ['Go'],
    remote: true,
    description: 'Senior role',
  });
  const r = spawnSync(process.execPath,
    [SCRIPT, '--profile', profilePath, '--vacancy', vacancy],
    { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const { breakdown } = JSON.parse(r.stdout);
  assert.equal(breakdown.salary, 10);
});

test('score is sum of all breakdown values', () => {
  const vacancy = JSON.stringify({
    title: 'Engineer',
    company: 'Acme',
    stack: ['Go', 'TypeScript'],
    salary_min: 4000,
    salary_max: 6000,
    remote: true,
    description: 'Senior engineer',
  });
  const r = spawnSync(process.execPath,
    [SCRIPT, '--profile', profilePath, '--vacancy', vacancy],
    { encoding: 'utf8' });
  const { score, breakdown } = JSON.parse(r.stdout);
  const expected = Object.values(breakdown).reduce((a, b) => a + b, 0);
  assert.equal(score, expected);
});

test('exits 1 with no --vacancy arg', () => {
  const r = spawnSync(process.execPath,
    [SCRIPT, '--profile', profilePath],
    { encoding: 'utf8' });
  assert.equal(r.status, 1);
});

test('cleanup', () => {
  rmSync(dir, { recursive: true, force: true });
  assert.ok(true);
});
```

- [ ] **Step 5: Run score tests**

```bash
node --test plugins/job-hunter/scripts/tests/score.test.mjs
```

Expected: 8 passing, 0 failing.

- [ ] **Step 6: Write excel.test.mjs**

Create `plugins/job-hunter/scripts/tests/excel.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('../excel.mjs', import.meta.url));

function run(args, { stdin } = {}) {
  return spawnSync(process.execPath, [SCRIPT, ...args], {
    encoding: 'utf8',
    input: stdin ?? null,
  });
}

const SAMPLE_ROWS = [
  {
    date: '2026-05-16',
    platform: 'djinni',
    url: 'https://djinni.co/jobs/1',
    title: 'Senior Go Developer',
    company: 'Acme',
    salary: '$5000–$8000',
    score: 88,
    skill_breakdown: 'Go+Docker',
    status: 'applied',
    cover_letter_sent: 'yes',
    notes: '',
  },
];

test('append creates new file and adds rows', () => {
  const dir = mkdtempSync(join(tmpdir(), 'jh-excel-'));
  const file = join(dir, 'applications.xlsx');
  try {
    const r = run(['append', '--file', file, '--rows', JSON.stringify(SAMPLE_ROWS)]);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /Appended 1 row/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('read returns [] for non-existent file', () => {
  const r = run(['read', '--file', '/tmp/no-such-excel-jh.xlsx']);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(JSON.parse(r.stdout), []);
});

test('append then read round-trip', () => {
  const dir = mkdtempSync(join(tmpdir(), 'jh-excel-'));
  const file = join(dir, 'applications.xlsx');
  try {
    run(['append', '--file', file, '--rows', JSON.stringify(SAMPLE_ROWS)]);
    const r = run(['read', '--file', file]);
    assert.equal(r.status, 0, r.stderr);
    const rows = JSON.parse(r.stdout);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].title, 'Senior Go Developer');
    assert.equal(rows[0].score, 88);
    assert.equal(rows[0].platform, 'djinni');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('--last N limits returned rows', () => {
  const dir = mkdtempSync(join(tmpdir(), 'jh-excel-'));
  const file = join(dir, 'applications.xlsx');
  try {
    const threeRows = [
      { ...SAMPLE_ROWS[0], title: 'Job A', score: 70 },
      { ...SAMPLE_ROWS[0], title: 'Job B', score: 75 },
      { ...SAMPLE_ROWS[0], title: 'Job C', score: 80 },
    ];
    run(['append', '--file', file, '--rows', JSON.stringify(threeRows)]);
    const r = run(['read', '--file', file, '--last', '2']);
    assert.equal(r.status, 0, r.stderr);
    const rows = JSON.parse(r.stdout);
    assert.equal(rows.length, 2);
    assert.equal(rows[0].title, 'Job B');
    assert.equal(rows[1].title, 'Job C');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('append accumulates across multiple runs', () => {
  const dir = mkdtempSync(join(tmpdir(), 'jh-excel-'));
  const file = join(dir, 'applications.xlsx');
  try {
    run(['append', '--file', file, '--rows', JSON.stringify([{ ...SAMPLE_ROWS[0], title: 'Job 1' }])]);
    run(['append', '--file', file, '--rows', JSON.stringify([{ ...SAMPLE_ROWS[0], title: 'Job 2' }])]);
    const r = run(['read', '--file', file]);
    const rows = JSON.parse(r.stdout);
    assert.equal(rows.length, 2);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 7: Run excel tests**

```bash
node --test plugins/job-hunter/scripts/tests/excel.test.mjs
```

Expected: 5 passing, 0 failing.

- [ ] **Step 8: Run all tests together**

```bash
node --test plugins/job-hunter/scripts/tests/profile.test.mjs plugins/job-hunter/scripts/tests/score.test.mjs plugins/job-hunter/scripts/tests/excel.test.mjs
```

Expected: 20 passing, 0 failing.

- [ ] **Step 9: Add job-hunter tests to root package.json test script**

Open `package.json`. Change `"test"` to include job-hunter tests:

```json
{
  "scripts": {
    "test": "node --test plugins/chorus/scripts/tests/*.test.mjs for-opencode/src/tests/*.test.mjs plugins/job-hunter/scripts/tests/*.test.mjs"
  }
}
```

- [ ] **Step 10: Run full test suite**

```bash
npm test
```

Expected: all tests pass (existing chorus tests + 20 new job-hunter tests).

- [ ] **Step 11: Commit**

```bash
git add plugins/job-hunter/scripts/tests/ plugins/job-hunter/package.json package.json
git commit -m "feat(job-hunter): tests for profile, score, excel scripts"
```

---

## Task 6: `/job-hunter:setup` command

**Files:**
- Create: `plugins/job-hunter/commands/setup.md`

- [ ] **Step 1: Write setup.md**

Create `plugins/job-hunter/commands/setup.md`:

````markdown
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

- If it exits **0** (profile exists) AND `--reconfigure` is NOT in `$ARGUMENTS`: tell the user the profile already exists and suggest `--reconfigure` to overwrite. Stop.
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

If the user skips the cover letter template (empty), use this built-in:

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

Construct a JSON object matching this shape:

```json
{
  "name": "<name>",
  "title": "<title>",
  "skills": ["<skill1>", "<skill2>"],
  "salary_min": <number>,
  "currency": "<USD|EUR|UAH>",
  "location": "<remote|hybrid|onsite|any>",
  "email": "<email>",
  "cv_path": "<path or null>",
  "platforms": {
    "djinni":     { "enabled": true,  "queries": ["<q1>", "<q2>"] },
    "work_ua":    { "enabled": false, "queries": [] },
    "robota_ua":  { "enabled": false, "queries": [] },
    "dou_ua":     { "enabled": false, "queries": [] }
  },
  "thresholds": { "auto": 85, "confirm": 60 },
  "cover_letter_template": "<template text>",
  "tracking_file": "~/.config/job-hunter/applications.xlsx"
}
```

Set `"enabled": true` only for platforms the user selected. Set queries per platform from the user's answers.

## Save profile

```bash
echo '<profile-json>' | node "$CLAUDE_PLUGIN_ROOT/scripts/profile.mjs" save
```

If this exits non-zero, stop and report the error.

## Save browser sessions

For each **enabled** platform:

1. Tell the user: "I'll open [Platform] in the browser so you can log in. Once you're logged in, come back here and confirm."
2. Navigate to the platform URL using Playwright MCP:
   - Djinni: `https://djinni.co/login`
   - Work.ua: `https://www.work.ua/uk/login`
   - Robota.ua: `https://robota.ua/auth/login`
   - DOU.ua: `https://dou.ua/login`
3. Wait for user to confirm they are logged in.
4. Extract cookies from the browser using Playwright MCP `browser_evaluate`:
   ```javascript
   document.cookie
   ```
   Parse cookie string into array of `{ name, value, domain }` objects.
5. Save session:
   ```bash
   echo '<cookies-json>' | node "$CLAUDE_PLUGIN_ROOT/scripts/profile.mjs" save-session <platform>
   ```

## Confirm

Tell the user:
- Profile saved to `~/.config/job-hunter/profile.yaml`
- Sessions saved for: [list of platforms]
- Run `/job-hunter:hunt` to start scanning
````

- [ ] **Step 2: Commit**

```bash
git add plugins/job-hunter/commands/setup.md
git commit -m "feat(job-hunter): setup onboarding wizard command"
```

---

## Task 7: `/job-hunter:hunt` command

**Files:**
- Create: `plugins/job-hunter/commands/hunt.md`

- [ ] **Step 1: Write hunt.md**

Create `plugins/job-hunter/commands/hunt.md`:

````markdown
---
description: Scan job platforms, score vacancies, generate cover letters, and apply
argument-hint: "[--platform djinni|work_ua|robota_ua|dou_ua] [--dry-run] [--limit N]"
---

Main job-hunter loop: scan → score → cover letter → apply → track.

Raw arguments: `$ARGUMENTS`

Parse flags from `$ARGUMENTS`:
- `--platform <name>` → only scan this platform (default: all enabled)
- `--dry-run` → score and display, but do not apply or write to tracking
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

3. Determine active platforms: if `--platform` specified, use only that one if `profile.platforms[name].enabled` is true. Otherwise use all platforms where `enabled: true`.

## Scan each platform

Repeat the following for each active platform. Process platforms sequentially (not in parallel) to avoid browser conflicts.

### Platform: Djinni (`https://djinni.co`)

For each query in `profile.platforms.djinni.queries`:

1. Load session cookies:
   ```bash
   node "$CLAUDE_PLUGIN_ROOT/scripts/profile.mjs" load-session djinni
   ```
   If not null, inject cookies into browser via `mcp__playwright__browser_evaluate`:
   ```javascript
   // For each cookie {name, value, domain}:
   document.cookie = `${name}=${value}; domain=${domain}; path=/`;
   ```

2. Navigate to search URL:
   `https://djinni.co/jobs/?primary_keyword=<url-encoded-query>&english_level=no_english&employment=remote`

3. Extract vacancy cards from the page. For each card on the first results page (up to `--limit`):
   - Extract: title, company name, salary text, URL, remote/hybrid flag, tech keywords shown in tags
   - Navigate to the vacancy URL
   - Extract full description text
   - Navigate back to results

4. Return to caller with array of vacancy objects:
   ```json
   {
     "platform": "djinni",
     "title": "...",
     "company": "...",
     "url": "https://djinni.co/jobs/...",
     "salary_min": 5000,
     "salary_max": 8000,
     "remote": true,
     "hybrid": false,
     "stack": ["Go", "Docker"],
     "description": "full text..."
   }
   ```

### Platform: Work.ua (`https://www.work.ua`)

For each query in `profile.platforms.work_ua.queries`:

1. Load session: `node "$CLAUDE_PLUGIN_ROOT/scripts/profile.mjs" load-session work_ua`

2. Navigate to: `https://www.work.ua/jobs/?q=<url-encoded-query>&employment=74` (74 = remote)

3. Extract cards (up to `--limit`), follow each link, extract title/company/salary/stack/description.

4. Return vacancy objects with `"platform": "work_ua"`.

### Platform: Robota.ua (`https://robota.ua`)

For each query in `profile.platforms.robota_ua.queries`:

1. Load session: `node "$CLAUDE_PLUGIN_ROOT/scripts/profile.mjs" load-session robota_ua`

2. Navigate to: `https://robota.ua/jobs/<url-encoded-query>?employmentTypeName=remote`

3. Extract cards (up to `--limit`), follow each, extract title/company/salary/stack/description.

4. Return vacancy objects with `"platform": "robota_ua"`.

### Platform: DOU.ua (`https://dou.ua`)

For each query in `profile.platforms.dou_ua.queries`:

1. Load session: `node "$CLAUDE_PLUGIN_ROOT/scripts/profile.mjs" load-session dou_ua`

2. Navigate to: `https://jobs.dou.ua/vacancies/?search=<url-encoded-query>&remote`

3. Extract cards (up to `--limit`), follow each, extract title/company/salary/stack/description.

4. Return vacancy objects with `"platform": "dou_ua"`.

## Score all vacancies

For each vacancy object collected above:

```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/score.mjs" \
  --profile ~/.config/job-hunter/profile.yaml \
  --vacancy '<vacancy-json>'
```

Attach `score` and `breakdown` fields from the output to the vacancy object.

## Deduplicate

Load existing tracking to get known URLs:

```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/excel.mjs" read \
  --file "<profile.tracking_file>"
```

Filter out vacancies whose `url` already appears in the tracking data.

## Display results table

Sort vacancies by `score` descending. Display as a markdown table:

```
| # | Score | Title | Company | Salary | Platform | Location |
|---|-------|-------|---------|--------|----------|----------|
| 1 | 91    | Senior Go Developer | Acme | $5k–$8k | djinni | remote |
...
```

Also show threshold legend:
- ✅ ≥ 85: auto-apply
- 🔶 60–84: will ask
- ⏭ < 60: skip

If `--dry-run`: print table, then stop. Do not apply or track.

## Apply loop

Process vacancies in score-descending order.

### Auto-apply (score ≥ `profile.thresholds.auto`)

For each vacancy in this tier:

1. Generate cover letter: fill `profile.cover_letter_template`, substituting:
   - `{title}` → vacancy title
   - `{company}` → company name
   - `{custom_paragraph}` → 2-sentence summary of why this specific role is a fit (generate from vacancy description)
   - `{profile_summary}` → first 200 chars of a skills summary constructed from profile
   - `{name}` → profile name

2. Navigate to vacancy apply URL (append `/apply` or find "Apply" button via Playwright MCP).

3. Fill application form:
   - Name field → `profile.name`
   - Email field → `profile.email`
   - Cover letter / message field → generated cover letter
   - CV/resume upload → `profile.cv_path` if not null and field is present
   - Submit button → click

4. Log result: `status: "applied"`.

### Confirm-apply (score 60–84)

For each vacancy in this tier, show a summary:

```
─────────────────────────────────────────
Title:    Senior Engineer at Corp
Score:    72 (skills:28, salary:20, loc:20, sen:6, co:8)
Salary:   $4000–$6000
Stack:    Go, PostgreSQL
URL:      https://djinni.co/jobs/123
─────────────────────────────────────────
Apply? (Y/n)
```

Use `AskUserQuestion` with options: `Yes, apply` / `No, skip`.

If Yes: apply using same steps as auto-apply. Log `status: "confirmed"`.
If No: log `status: "skipped"`.

### Skip (score < 60)

Log `status: "skipped"` without displaying or prompting.

## Write tracking

After all vacancies are processed (or skipped), write all entries to Excel:

```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/excel.mjs" append \
  --file "<profile.tracking_file>" \
  --rows '<rows-json>'
```

Where rows-json is an array of objects with fields: `date` (today ISO), `platform`, `url`, `title`, `company`, `salary`, `score`, `skill_breakdown` (JSON.stringify of breakdown), `status`, `cover_letter_sent` (yes/no), `notes` (empty).

## Summary

Print final summary:
```
Hunt complete.
Applied:  N vacancies
Prompted: N (M accepted, K skipped)
Skipped:  N (below threshold)
Tracking: ~/.config/job-hunter/applications.xlsx
```
````

- [ ] **Step 2: Commit**

```bash
git add plugins/job-hunter/commands/hunt.md
git commit -m "feat(job-hunter): hunt command — scan/score/apply/track loop"
```

---

## Task 8: `/job-hunter:status` command

**Files:**
- Create: `plugins/job-hunter/commands/status.md`

- [ ] **Step 1: Write status.md**

Create `plugins/job-hunter/commands/status.md`:

````markdown
---
description: Show recent job applications from tracking Excel file
argument-hint: "[--last N]"
---

Show the last N job applications logged by `/job-hunter:hunt`.

Raw arguments: `$ARGUMENTS`

Parse `--last N` from `$ARGUMENTS` (default: 20 if absent).

## Load profile

```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/profile.mjs" load
```

Extract `tracking_file` from the JSON output.

## Read tracking

```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/excel.mjs" read \
  --file "<tracking_file>" \
  --last <N>
```

## Display

If result is `[]`, print: `No applications tracked yet. Run /job-hunter:hunt to start.`

Otherwise print a markdown table:

```
| Date | Platform | Title | Company | Score | Status |
|------|----------|-------|---------|-------|--------|
| 2026-05-16 | djinni | Senior Go Developer | Acme | 88 | applied |
...
```

Then print counts per status:
```
applied: N  confirmed: N  skipped: N  pending: N
```
````

- [ ] **Step 2: Commit**

```bash
git add plugins/job-hunter/commands/status.md
git commit -m "feat(job-hunter): status command — show recent applications"
```

---

## Task 9: `profile.example.yaml` and `README.md`

**Files:**
- Create: `plugins/job-hunter/profile.example.yaml`
- Create: `plugins/job-hunter/README.md`

- [ ] **Step 1: Write profile.example.yaml**

Create `plugins/job-hunter/profile.example.yaml`:

```yaml
# job-hunter profile — copy to ~/.config/job-hunter/profile.yaml
# or run /job-hunter:setup to generate this interactively

name: Your Name
title: Senior Software Engineer         # used for seniority scoring
skills:
  - Go
  - TypeScript
  - Docker
  - Kubernetes
  - PostgreSQL
  # add more — matched against vacancy tech stack tags

salary_min: 5000                        # minimum acceptable salary
currency: USD                           # USD | EUR | UAH

location: remote                        # remote | hybrid | onsite | any

email: you@example.com
cv_path: ~/path/to/Resume.pdf           # null to skip CV upload

platforms:
  djinni:
    enabled: true
    queries:
      - golang backend
      - go developer
      - senior backend engineer
    # filters applied via URL params: remote=true, exp_years_min=3
  work_ua:
    enabled: true
    queries:
      - golang розробник
      - senior backend
  robota_ua:
    enabled: true
    queries:
      - golang
      - java senior
  dou_ua:
    enabled: false                      # set true to enable
    queries:
      - golang

thresholds:
  auto: 85                              # score ≥ auto → apply without asking
  confirm: 60                           # score ≥ confirm → ask Y/N; below → skip

# Placeholders: {title} {company} {custom_paragraph} {profile_summary} {name}
cover_letter_template: |
  Hi,

  I'm applying for the {title} position at {company}.

  {custom_paragraph}

  My background: {profile_summary}

  Full profile: https://valpere.github.io

  Best regards,
  {name}

tracking_file: ~/.config/job-hunter/applications.xlsx
```

- [ ] **Step 2: Write README.md**

Create `plugins/job-hunter/README.md`:

```markdown
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
/job-hunter:hunt --dry-run          # preview scores without applying
/job-hunter:hunt --platform djinni  # scan one platform only
/job-hunter:hunt --limit 10         # max 10 vacancies per query
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
| Skill overlap | 40 | intersection / union of profile.skills vs vacancy stack tags |
| Salary | 20 | 20 if vacancy max ≥ profile min; scaled if partial; 10 if no salary stated |
| Location | 20 | 20 if preference matches (remote/hybrid/onsite/any) |
| Seniority | 10 | 10 if title level matches; 0 if junior/intern |
| Company | 10 | heuristics: named company, salary stated, no "outsource/body-leasing" signal |

### Threshold tuning

Edit `~/.config/job-hunter/profile.yaml`:

```yaml
thresholds:
  auto: 85     # raise to be more selective, lower for more auto-applies
  confirm: 60  # lower to see more vacancies in the confirm prompt
```

If you're getting too many false-positives in auto-apply, raise `auto` to 90.  
If you're seeing good jobs skipped, lower `confirm` to 50.

---

## Profile configuration

Full reference: see [`profile.example.yaml`](profile.example.yaml).

Key fields:
- `skills` — comma-separated; the more specific, the better the skill score
- `salary_min` — in your chosen currency; vacancies with no salary info get 10 pts (partial)
- `location` — `remote` is the most common filter; `any` disables location filtering
- `cv_path` — PDF path; leave null if you prefer to paste a link in the cover letter

---

## Platform-specific notes

### Djinni

- Cookie-based auth. `/job-hunter:setup` saves the session. Sessions expire after 30 days — re-run setup if auth fails.
- Remote filter applied via `&employment=remote` URL param.
- Tech stack tags are extracted from the sidebar chips, not the description text.

### Work.ua / Robota.ua

- Same cookie-based session flow.
- Salary on these platforms is often stated in UAH; score.mjs compares currencies by number only — consider setting `currency: UAH` and `salary_min` in UAH if you use these platforms primarily.

### DOU.ua

- Has CAPTCHA on some flows. If the browser gets blocked, close the tab and re-run setup to refresh the session.
- Vacancy stack tags are less structured than Djinni — skill overlap scores may be lower.

---

## Adding a new platform

1. Add an entry to `profile.yaml` under `platforms:` with `enabled: true` and `queries`.
2. Add a scan section to `commands/hunt.md` following the existing platform pattern.
3. Test with `--dry-run --platform <new>`.

---

## Troubleshooting

**"Profile not found"** — run `/job-hunter:setup`.

**"Session expired"** — re-run `/job-hunter:setup`; it will ask to re-authenticate each platform.

**Score always low** — check `profile.skills` matches the tech stack keywords platforms use (e.g. "Golang" vs "Go").

**CV upload field not found** — the plugin skips CV upload if the field isn't detected; the cover letter is still submitted.
```

- [ ] **Step 3: Commit**

```bash
git add plugins/job-hunter/profile.example.yaml plugins/job-hunter/README.md
git commit -m "feat(job-hunter): README and profile.example.yaml"
```

---

## Task 10: Final verification

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 2: Verify marketplace.json lists all 8 plugins**

```bash
node -e "const m = JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8')); console.log(m.plugins.map(p=>p.name).join(', '))"
```

Expected: `opencode, gemini, claude, codex, cursor, kilo, chorus, job-hunter`

- [ ] **Step 3: Verify plugin directory structure is complete**

```bash
find plugins/job-hunter -type f | sort
```

Expected output:
```
plugins/job-hunter/.claude-plugin/plugin.json
plugins/job-hunter/README.md
plugins/job-hunter/commands/hunt.md
plugins/job-hunter/commands/setup.md
plugins/job-hunter/commands/status.md
plugins/job-hunter/package.json
plugins/job-hunter/profile.example.yaml
plugins/job-hunter/scripts/excel.mjs
plugins/job-hunter/scripts/profile.mjs
plugins/job-hunter/scripts/score.mjs
plugins/job-hunter/scripts/tests/excel.test.mjs
plugins/job-hunter/scripts/tests/profile.test.mjs
plugins/job-hunter/scripts/tests/score.test.mjs
```

- [ ] **Step 4: Verify plugin.json is valid JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('plugins/job-hunter/.claude-plugin/plugin.json','utf8')); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 5: Final commit**

```bash
git add -A
git status  # verify only expected files
git commit -m "feat(job-hunter): complete plugin — setup/hunt/status commands + scripts + tests"
```
