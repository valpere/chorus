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

function withProfile(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'jh-score-'));
  const profilePath = join(dir, 'profile.yaml');
  writeFileSync(profilePath, PROFILE_YAML, 'utf8');
  try {
    fn(profilePath);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function score(profilePath, vacancy) {
  return spawnSync(process.execPath,
    [SCRIPT, '--profile', profilePath, '--vacancy', JSON.stringify(vacancy)],
    { encoding: 'utf8' });
}

test('perfect match scores above 80', () => {
  withProfile(profilePath => {
    const r = score(profilePath, {
      title: 'Senior Go Developer',
      company: 'Acme Corp',
      stack: ['Go', 'Docker', 'Kubernetes', 'PostgreSQL'],
      salary_min: 5000,
      salary_max: 8000,
      remote: true,
      description: 'Senior backend engineer needed',
    });
    assert.equal(r.status, 0, r.stderr);
    const { score: s, breakdown } = JSON.parse(r.stdout);
    assert.ok(s > 80, `expected >80, got ${s}`);
    assert.ok(breakdown.skills > 0);
    assert.equal(breakdown.salary, 20);
    assert.equal(breakdown.location, 20);
  });
});

test('junior vacancy scores 0 on seniority', () => {
  withProfile(profilePath => {
    const r = score(profilePath, {
      title: 'Junior Go Developer',
      company: 'Corp',
      stack: ['Go'],
      salary_min: 5000,
      salary_max: 8000,
      remote: true,
      description: 'Junior developer role, 0-1 years',
    });
    assert.equal(r.status, 0, r.stderr);
    const { breakdown } = JSON.parse(r.stdout);
    assert.equal(breakdown.seniority, 0);
  });
});

test('location mismatch scores 0 on location', () => {
  withProfile(profilePath => {
    const r = score(profilePath, {
      title: 'Senior Engineer',
      company: 'Corp',
      stack: ['Go'],
      salary_min: 6000,
      remote: false,
      hybrid: false,
      description: 'Onsite Kyiv only',
    });
    assert.equal(r.status, 0, r.stderr);
    const { breakdown } = JSON.parse(r.stdout);
    assert.equal(breakdown.location, 0);
  });
});

test('no salary stated gives partial salary credit', () => {
  withProfile(profilePath => {
    const r = score(profilePath, {
      title: 'Senior Engineer',
      company: 'Corp',
      stack: ['Go'],
      remote: true,
      description: 'Senior role',
    });
    assert.equal(r.status, 0, r.stderr);
    const { breakdown } = JSON.parse(r.stdout);
    assert.equal(breakdown.salary, 10);
  });
});

test('score is sum of all breakdown values', () => {
  withProfile(profilePath => {
    const r = score(profilePath, {
      title: 'Engineer',
      company: 'Acme',
      stack: ['Go', 'TypeScript'],
      salary_min: 4000,
      salary_max: 6000,
      remote: true,
      description: 'Senior engineer',
    });
    const { score: s, breakdown } = JSON.parse(r.stdout);
    const expected = Object.values(breakdown).reduce((a, b) => a + b, 0);
    assert.equal(s, expected);
  });
});

test('exits 1 with no --vacancy arg', () => {
  withProfile(profilePath => {
    const r = spawnSync(process.execPath,
      [SCRIPT, '--profile', profilePath],
      { encoding: 'utf8' });
    assert.equal(r.status, 1);
  });
});
