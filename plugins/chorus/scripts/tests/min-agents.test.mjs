import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFakeAgents, runCompanion } from './helpers/fake-agents.mjs';

for (const subcommand of ['council', 'debug']) {
  test(`${subcommand} exits 1 with only 1 agent available`, () => {
    const fake = createFakeAgents(
      ['claude'],
      { unavailable: ['gemini', 'codex', 'cursor', 'kilo'] }
    );
    try {
      const args = subcommand === 'debug' ? [subcommand, 'something broke'] : [subcommand, 'ping'];
      const { stdout, stderr, code } = runCompanion(args, { path: fake.path });
      assert.equal(code, 1);
      assert.match(stderr, /Not enough agents available/);
      assert.equal(stdout.trim(), '', 'stdout must be empty when command fails');
    } finally {
      fake.cleanup();
    }
  });

  test(`${subcommand} exits 1 with no agents available`, () => {
    const fake = createFakeAgents(
      [],
      { unavailable: ['claude', 'gemini', 'codex', 'cursor', 'kilo'] }
    );
    try {
      const args = subcommand === 'debug' ? [subcommand, 'something broke'] : [subcommand, 'ping'];
      const { stdout, stderr, code } = runCompanion(args, { path: fake.path });
      assert.equal(code, 1);
      assert.match(stderr, /Not enough agents available/);
      assert.equal(stdout.trim(), '', 'stdout must be empty when command fails');
    } finally {
      fake.cleanup();
    }
  });
}
