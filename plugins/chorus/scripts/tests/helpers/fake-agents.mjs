import { mkdtempSync, writeFileSync, rmSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const COMPANION = fileURLToPath(new URL('../../companion.mjs', import.meta.url));

// Maps logical agent names to binary names (mirrors REGISTRY in companion.mjs)
const BINARY_MAP = {
  claude: 'claude',
  gemini: 'gemini',
  codex: 'codex',
  cursor: 'agent',
  kilo: 'kilo',
};

/**
 * Create a temp directory with fake agent binaries.
 *
 * Agents in `names` respond normally (--version exits 0, other args echo output).
 * Agents in `unavailable` are created as stubs that exit 1 on --version — this
 * shadows the real binary on PATH and makes checkCli() report them as 'unavailable'.
 *
 * Agents in neither list are absent from the fake dir; if a real binary exists
 * on the system PATH it will still be found. Use `unavailable` to force-shadow them.
 *
 * @param {string[]} names         - agents to create as working fakes
 * @param {{ unavailable?: string[], script?: (name:string)=>string, tmpBase?: string }} [opts]
 * @returns {{ path: string, cleanup: () => void }}
 */
export function createFakeAgents(names, { unavailable = [], script, tmpBase } = {}) {
  const dir = mkdtempSync(join(tmpBase ?? tmpdir(), 'chorus-fake-'));

  for (const agentName of names) {
    const binary = BINARY_MAP[agentName] ?? agentName;
    const src = script
      ? script(agentName)
      : [
          '#!/bin/sh',
          // Handle --version check used by checkCli
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

  // Create stubs that fail --version to shadow any real binary on PATH
  for (const agentName of unavailable) {
    const binary = BINARY_MAP[agentName] ?? agentName;
    const src = '#!/bin/sh\nexit 1\n';
    const path = join(dir, binary);
    writeFileSync(path, src, 'utf8');
    chmodSync(path, 0o755);
  }

  return {
    path: dir,
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}

/**
 * Spawn companion.mjs with a given set of args, injecting a fake PATH first.
 * @param {string[]} args
 * @param {{ path: string }} opts - fake bin dir to prepend to PATH
 * @returns {{ stdout: string, stderr: string, code: number }}
 */
export function runCompanion(args, { path }) {
  const env = { ...process.env, PATH: `${path}:${process.env.PATH}` };
  const result = spawnSync(
    process.execPath,
    [COMPANION, ...args],
    { encoding: 'utf8', env }
  );
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    code: result.status ?? 1,
  };
}
