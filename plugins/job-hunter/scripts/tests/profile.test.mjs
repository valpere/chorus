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
