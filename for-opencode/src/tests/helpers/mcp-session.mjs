import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SERVER = fileURLToPath(new URL('../../index.js', import.meta.url));

const BINARY_MAP = {
  claude: 'claude',
  gemini: 'gemini',
  codex: 'codex',
  cursor: 'agent',
  kilo: 'kilo',
};

/**
 * Create a temp dir with fake agent binaries.
 * Agents in `names` respond to --version and echo a tagged output line.
 * Agents in `unavailable` exit 1 on every invocation (shadows real binary).
 */
export function createFakeAgents(names, { unavailable = [], script } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'mcp-fake-'));

  for (const agentName of names) {
    const binary = BINARY_MAP[agentName] ?? agentName;
    const src = script
      ? script(agentName)
      : [
          '#!/bin/sh',
          'for arg in "$@"; do',
          '  if [ "$arg" = "--version" ]; then',
          `    echo "${binary}-fake 0.0.0"`,
          '    exit 0',
          '  fi',
          'done',
          `echo "AGENT:${agentName}::ARGS:$*"`,
        ].join('\n');
    const path = join(dir, binary);
    writeFileSync(path, src, 'utf8');
    chmodSync(path, 0o755);
  }

  for (const agentName of unavailable) {
    const binary = BINARY_MAP[agentName] ?? agentName;
    const path = join(dir, binary);
    writeFileSync(path, '#!/bin/sh\nexit 1\n', 'utf8');
    chmodSync(path, 0o755);
  }

  return { path: dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

/**
 * Spawn the MCP server with a fake PATH and return a session handle.
 * Handles the MCP initialize handshake automatically.
 *
 * @param {{ path: string }} opts - fake bin dir to prepend to PATH
 * @returns {Promise<{ call: (method, params) => Promise<any>, close: () => Promise<void> }>}
 */
export async function createMcpSession({ path: fakePath }) {
  const env = { ...process.env, PATH: `${fakePath}:${process.env.PATH}` };
  const proc = spawn(process.execPath, [SERVER], {
    env,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  let nextId = 1;
  const pending = new Map();
  let lineBuffer = '';

  proc.stdout.on('data', (chunk) => {
    lineBuffer += chunk.toString();
    const lines = lineBuffer.split('\n');
    lineBuffer = lines.pop();
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const msg = JSON.parse(line);
        if (msg.id != null && pending.has(msg.id)) {
          const { resolve, reject } = pending.get(msg.id);
          pending.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      } catch { /* ignore malformed */ }
    }
  });

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject });
      proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    });
  }

  function notify(method, params = {}) {
    proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n');
  }

  function close() {
    proc.stdin.end();
    return new Promise(resolve => proc.on('close', resolve));
  }

  // MCP handshake
  await send('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'chorus-test', version: '0.0.0' },
  });
  notify('notifications/initialized');

  return { send, close };
}

/**
 * Convenience: call a tool and return the first content text.
 */
export async function callTool(session, name, args = {}) {
  const result = await session.send('tools/call', { name, arguments: args });
  return result?.content?.[0]?.text ?? '';
}
