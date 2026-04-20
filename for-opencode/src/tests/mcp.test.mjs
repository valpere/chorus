import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFakeAgents, createMcpSession, callTool } from './helpers/mcp-session.mjs';

const ALL_AGENTS = ['claude', 'gemini', 'codex', 'cursor', 'kilo'];

// ── tools/list ────────────────────────────────────────────────────────────────

test('tools/list returns all expected tools', async () => {
  const fake = createFakeAgents(ALL_AGENTS);
  const session = await createMcpSession({ path: fake.path });
  try {
    const result = await session.send('tools/list', {});
    const names = result.tools.map(t => t.name);
    for (const expected of [
      'delegate_claude', 'delegate_gemini', 'delegate_codex', 'delegate_cursor', 'delegate_kilo',
      'check_agents', 'council', 'parallel_review', 'parallel_debug', 'second_opinion', 'vote',
    ]) {
      assert.ok(names.includes(expected), `missing tool: ${expected}`);
    }
  } finally {
    await session.close();
    fake.cleanup();
  }
});

// ── check_agents ──────────────────────────────────────────────────────────────

test('check_agents returns a table with all agent statuses', async () => {
  const fake = createFakeAgents(ALL_AGENTS);
  const session = await createMcpSession({ path: fake.path });
  try {
    const text = await callTool(session, 'check_agents');
    assert.match(text, /claude/);
    assert.match(text, /gemini/);
    assert.match(text, /kilo/);
    assert.match(text, /✓/);
  } finally {
    await session.close();
    fake.cleanup();
  }
});

// ── council graceful degradation ──────────────────────────────────────────────

test('council (strict=false) skips unavailable agents and prepends warning', async () => {
  const fake = createFakeAgents(
    ['claude', 'gemini'],
    { unavailable: ['codex', 'cursor', 'kilo'] }
  );
  const session = await createMcpSession({ path: fake.path });
  try {
    const text = await callTool(session, 'council', { task: 'ping' });
    assert.match(text, /⚠ Skipped:/);
    assert.match(text, /AGENT: CLAUDE/);
    assert.match(text, /AGENT: GEMINI/);
  } finally {
    await session.close();
    fake.cleanup();
  }
});

test('council strict=true includes all agents even if some fail', async () => {
  const fake = createFakeAgents(
    ['claude', 'gemini'],
    { unavailable: ['codex', 'cursor', 'kilo'] }
  );
  const session = await createMcpSession({ path: fake.path });
  try {
    const text = await callTool(session, 'council', { task: 'ping', strict: true });
    // All 5 agent slots should be present in strict mode
    assert.match(text, /AGENT: CLAUDE/);
    assert.match(text, /AGENT: CODEX/);
    // No skipped header in strict mode
    assert.ok(!text.includes('⚠ Skipped:'), 'strict mode should not prepend skipped warning');
  } finally {
    await session.close();
    fake.cleanup();
  }
});

test('council (strict=false) throws when fewer than 2 agents available', async () => {
  const fake = createFakeAgents(
    ['claude'],
    { unavailable: ['gemini', 'codex', 'cursor', 'kilo'] }
  );
  const session = await createMcpSession({ path: fake.path });
  try {
    await assert.rejects(
      () => callTool(session, 'council', { task: 'ping' }),
      /Not enough agents/
    );
  } finally {
    await session.close();
    fake.cleanup();
  }
});

// ── second_opinion fallback ───────────────────────────────────────────────────

test('second_opinion falls back when requested agent is unavailable', async () => {
  const fake = createFakeAgents(['claude'], { unavailable: ['gemini', 'codex', 'cursor', 'kilo'] });
  const session = await createMcpSession({ path: fake.path });
  try {
    // default agent is gemini which is unavailable — should fall back to claude
    const text = await callTool(session, 'second_opinion', { approach: 'use postgres' });
    assert.match(text, /⚠ Agent "gemini" unavailable/);
    assert.match(text, /AGENT: CLAUDE/);
  } finally {
    await session.close();
    fake.cleanup();
  }
});

// ── vote ──────────────────────────────────────────────────────────────────────

test('vote returns tally table and per-agent rationale', async () => {
  const fake = createFakeAgents(ALL_AGENTS, {
    script: (name) => [
      '#!/bin/sh',
      'for arg in "$@"; do',
      '  if [ "$arg" = "--version" ]; then',
      `    echo "${name}-fake 0.0.0"`,
      '    exit 0',
      '  fi',
      'done',
      'echo "YES — looks good to me"',
    ].join('\n'),
  });
  const session = await createMcpSession({ path: fake.path });
  try {
    const text = await callTool(session, 'vote', { proposition: 'adopt TypeScript?' });
    assert.match(text, /## Vote Tally/);
    assert.match(text, /YES/);
  } finally {
    await session.close();
    fake.cleanup();
  }
});

test('vote skips unavailable agents and prepends warning', async () => {
  const fake = createFakeAgents(
    ['claude', 'gemini'],
    {
      unavailable: ['codex', 'cursor', 'kilo'],
      script: (name) => [
        '#!/bin/sh',
        'for arg in "$@"; do',
        '  if [ "$arg" = "--version" ]; then',
        `    echo "${name}-fake 0.0.0"`,
        '    exit 0',
        '  fi',
        'done',
        'echo "NO — not now"',
      ].join('\n'),
    }
  );
  const session = await createMcpSession({ path: fake.path });
  try {
    const text = await callTool(session, 'vote', { proposition: 'add Redis?' });
    assert.match(text, /⚠ Skipped:/);
    assert.match(text, /## Vote Tally/);
  } finally {
    await session.close();
    fake.cleanup();
  }
});
