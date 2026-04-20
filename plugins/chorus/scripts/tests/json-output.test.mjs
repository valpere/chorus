import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFakeAgents, runCompanion } from './helpers/fake-agents.mjs';

const ALL_AGENTS = ['claude', 'gemini', 'codex', 'cursor', 'kilo'];

test('council --json emits valid JSON with 5 results when all agents present', () => {
  const fake = createFakeAgents(ALL_AGENTS);
  try {
    const { stdout, stderr, code } = runCompanion(['council', '--json', 'ping'], { path: fake.path });
    assert.equal(code, 0, `stderr: ${stderr}`);
    const parsed = JSON.parse(stdout.trim());
    assert.equal(parsed.command, 'council');
    assert.equal(parsed.results.length, 5);
    for (const r of parsed.results) {
      assert.ok(r.name, 'result has name');
      assert.ok(typeof r.output === 'string', 'result has output');
    }
  } finally {
    fake.cleanup();
  }
});

test('council --json with 3 agents emits 3 results and skipped warning on stderr', () => {
  const fake = createFakeAgents(
    ['claude', 'gemini', 'codex'],
    { unavailable: ['cursor', 'kilo'] }
  );
  try {
    const { stdout, stderr, code } = runCompanion(['council', '--json', 'ping'], { path: fake.path });
    assert.equal(code, 0, `stderr: ${stderr}`);
    const parsed = JSON.parse(stdout.trim());
    assert.equal(parsed.results.length, 3);
    assert.match(stderr, /⚠ Skipped agents:/);
  } finally {
    fake.cleanup();
  }
});

test('council without --json emits delimited text with AGENT banners', () => {
  const fake = createFakeAgents(
    ['claude', 'gemini', 'codex'],
    { unavailable: ['cursor', 'kilo'] }
  );
  try {
    const { stdout, code } = runCompanion(['council', 'ping'], { path: fake.path });
    assert.equal(code, 0);
    assert.match(stdout, /AGENT: CLAUDE/);
    assert.match(stdout, /AGENT: GEMINI/);
  } finally {
    fake.cleanup();
  }
});

test('debug --json emits valid JSON with command=debug', () => {
  const fake = createFakeAgents(
    ['claude', 'gemini', 'codex'],
    { unavailable: ['cursor', 'kilo'] }
  );
  try {
    const { stdout, code, stderr } = runCompanion(['debug', '--json', 'something broke'], { path: fake.path });
    assert.equal(code, 0, `stderr: ${stderr}`);
    const parsed = JSON.parse(stdout.trim());
    assert.equal(parsed.command, 'debug');
    assert.ok(parsed.results.length >= 2);
  } finally {
    fake.cleanup();
  }
});
