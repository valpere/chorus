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
