import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFakeAgents, runCompanion } from './helpers/fake-agents.mjs';

test('defaults to gemini when no --agent flag and gemini is present', () => {
  const fake = createFakeAgents(['claude', 'gemini', 'codex'], { unavailable: ['cursor', 'kilo'] });
  try {
    const { stdout, code } = runCompanion(['second-opinion', 'use postgres'], { path: fake.path });
    assert.equal(code, 0);
    assert.match(stdout, /SECOND OPINION: GEMINI/);
  } finally {
    fake.cleanup();
  }
});

test('falls back from gemini to claude when gemini unavailable (no --agent)', () => {
  const fake = createFakeAgents(['claude', 'codex'], { unavailable: ['gemini', 'cursor', 'kilo'] });
  try {
    const { stdout, stderr, code } = runCompanion(['second-opinion', 'use postgres'], { path: fake.path });
    assert.equal(code, 0);
    assert.match(stderr, /⚠ Agent "gemini" not found — using "claude" instead\./);
    assert.match(stdout, /SECOND OPINION: CLAUDE/);
  } finally {
    fake.cleanup();
  }
});

test('falls back from requested absent agent to first available', () => {
  const fake = createFakeAgents(['kilo'], { unavailable: ['claude', 'gemini', 'codex', 'cursor'] });
  try {
    const { stdout, stderr, code } = runCompanion(['second-opinion', '--agent', 'codex', 'use postgres'], { path: fake.path });
    assert.equal(code, 0);
    assert.match(stderr, /⚠ Agent "codex" not found — using "kilo" instead\./);
    assert.match(stdout, /SECOND OPINION: KILO/);
  } finally {
    fake.cleanup();
  }
});

test('exits non-zero with install hint when no agents are present', () => {
  const fake = createFakeAgents([], { unavailable: ['claude', 'gemini', 'codex', 'cursor', 'kilo'] });
  try {
    const { stderr, code } = runCompanion(['second-opinion', 'use postgres'], { path: fake.path });
    assert.notEqual(code, 0);
    assert.match(stderr, /not found and no alternatives are available/);
    assert.match(stderr, /Install at least one agent/);
  } finally {
    fake.cleanup();
  }
});
