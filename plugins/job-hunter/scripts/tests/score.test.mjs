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
