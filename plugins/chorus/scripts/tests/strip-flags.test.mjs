import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stripFlags } from '../companion.mjs';

test('strips --json', () => {
  assert.deepEqual(stripFlags(['--json', 'my task']), ['my task']);
});

test('strips --background', () => {
  assert.deepEqual(stripFlags(['--background', 'task']), ['task']);
});

test('strips --wait', () => {
  assert.deepEqual(stripFlags(['--wait', 'task']), ['task']);
});

test('strips --agent <value> consuming two tokens', () => {
  assert.deepEqual(stripFlags(['--agent', 'gemini', 'task']), ['task']);
});

test('strips --agent=<value> as one token', () => {
  assert.deepEqual(stripFlags(['--agent=gemini', 'task']), ['task']);
});

test('preserves positional args', () => {
  assert.deepEqual(stripFlags(['adopt', 'TypeScript?']), ['adopt', 'TypeScript?']);
});

test('strips multiple flags leaving only positional args', () => {
  assert.deepEqual(
    stripFlags(['--json', '--background', '--agent', 'claude', 'my', 'task']),
    ['my', 'task']
  );
});

test('handles empty array', () => {
  assert.deepEqual(stripFlags([]), []);
});

test('strips --agent by consuming the next token even when it is another flag', () => {
  // stripFlags always consumes the token after --agent unconditionally
  assert.deepEqual(
    stripFlags(['--agent', '--json', 'task']),
    ['task']
  );
});
