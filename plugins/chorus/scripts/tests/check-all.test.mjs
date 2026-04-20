import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFakeAgents, runCompanion } from './helpers/fake-agents.mjs';

test('check-all exits 0 when all 5 agents are present', () => {
  const fake = createFakeAgents(['claude', 'gemini', 'codex', 'cursor', 'kilo']);
  try {
    const { stdout, code } = runCompanion(['check-all'], { path: fake.path });
    assert.equal(code, 0);
    assert.match(stdout, /✓ claude:/);
    assert.match(stdout, /✓ gemini:/);
    assert.match(stdout, /✓ codex:/);
    assert.match(stdout, /✓ cursor:/);
    assert.match(stdout, /✓ kilo:/);
  } finally {
    fake.cleanup();
  }
});

test('check-all exits 1 when kilo is shadowed as unavailable', () => {
  // Shadow all real binaries: 4 working, kilo stub exits non-zero on --version
  const fake = createFakeAgents(
    ['claude', 'gemini', 'codex', 'cursor'],
    { unavailable: ['kilo'] }
  );
  try {
    const { stderr, code } = runCompanion(['check-all'], { path: fake.path });
    assert.equal(code, 1);
    assert.match(stderr, /✗ kilo/);
  } finally {
    fake.cleanup();
  }
});

test('check-all exits 1 when multiple agents are unavailable', () => {
  const fake = createFakeAgents(
    ['claude'],
    { unavailable: ['gemini', 'codex', 'cursor', 'kilo'] }
  );
  try {
    const { stderr, code } = runCompanion(['check-all'], { path: fake.path });
    assert.equal(code, 1);
    assert.match(stderr, /✗ gemini/);
    assert.match(stderr, /✗ kilo/);
  } finally {
    fake.cleanup();
  }
});
