import { spawn, spawnSync } from 'child_process';

const [,, cmd, ...rest] = process.argv;

// ── helpers ──────────────────────────────────────────────────────────────────

function checkCli(binary) {
  const r = spawnSync(binary, ['--version'], { encoding: 'utf8' });
  return !r.error && r.status === 0;
}

function stripFlags(args) {
  const result = [];
  let skipNext = false;
  for (const a of args) {
    if (skipNext) { skipNext = false; continue; }
    if (a === '--background' || a === '--wait') continue;
    if (a === '--agent') { skipNext = true; continue; }
    if (a.startsWith('--agent=')) continue;
    result.push(a);
  }
  return result;
}

function runAgent(name, binary, args) {
  return new Promise(resolve => {
    const out = [];
    const err = [];
    const proc = spawn(binary, args, { stdio: ['pipe', 'pipe', 'pipe'] });
    proc.stdout.on('data', d => out.push(d));
    proc.stderr.on('data', d => err.push(d));
    proc.on('close', code => resolve({
      name,
      output: Buffer.concat(out).toString().trim(),
      error:  Buffer.concat(err).toString().trim(),
      code:   code ?? 0
    }));
    proc.on('error', e => resolve({ name, output: '', error: e.message, code: 1 }));
  });
}

function printDelimited(results) {
  for (const r of results) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`AGENT: ${r.name.toUpperCase()}`);
    console.log('═'.repeat(60));
    if (r.code !== 0 && !r.output) {
      console.log(`[error — exit ${r.code}]`);
      if (r.error) console.log(r.error);
    } else {
      console.log(r.output || r.error || '[no output]');
    }
  }
  console.log(`\n${'═'.repeat(60)}`);
}

// ── check-all ────────────────────────────────────────────────────────────────

if (cmd === 'check-all') {
  const agents = [['claude', 'claude'], ['gemini', 'gemini'], ['codex', 'codex'], ['cursor', 'agent'], ['kilo', 'kilo']];
  let ok = true;
  for (const [name, bin] of agents) {
    if (checkCli(bin)) {
      const v = spawnSync(bin, ['--version'], { encoding: 'utf8' }).stdout.trim();
      console.log(`✓ ${name}: ${v}`);
    } else {
      console.error(`✗ ${name} not found. Run /${name}:setup`);
      ok = false;
    }
  }
  process.exit(ok ? 0 : 1);
}

// ── council ──────────────────────────────────────────────────────────────────

if (cmd === 'council') {
  const task = stripFlags(rest).join(' ').trim();
  if (!task) { console.error('Usage: companion.mjs council <task>'); process.exit(1); }

  const agents = [
    {
      name: 'claude',
      binary: 'claude',
      args: [
        '--print',
        `You are the CORRECTNESS reviewer in an LLM council.\n` +
        `Focus on: logic errors, type safety, off-by-one bugs, unhandled edge cases, security issues.\n` +
        `Be concise — bullet points preferred.\n\nTask: ${task}`,
        '--dangerously-skip-permissions'
      ]
    },
    {
      name: 'gemini',
      binary: 'gemini',
      args: [
        '--prompt',
        `You are the EDGE-CASES reviewer in an LLM council.\n` +
        `Focus on: unusual inputs, failure modes, race conditions, what was not considered, alternative approaches.\n` +
        `Be concise — bullet points preferred.\n\nTask: ${task}`,
        '--yolo', '--output-format', 'text'
      ]
    },
    {
      name: 'codex',
      binary: 'codex',
      args: [
        'exec',
        `You are the SCOPE reviewer in an LLM council.\n` +
        `Focus on: unnecessary complexity, premature abstractions, whether the smallest solution was chosen.\n` +
        `Be concise — bullet points preferred.\n\nTask: ${task}`
      ]
    },
    {
      name: 'cursor',
      binary: 'agent',
      args: [
        '-p', '--force',
        `You are the INTEGRATION reviewer in an LLM council.\n` +
        `Focus on: how this fits with existing codebase patterns, dependency implications, integration risks.\n` +
        `Be concise — bullet points preferred.\n\nTask: ${task}`
      ]
    },
    {
      name: 'kilo',
      binary: 'kilo',
      args: [
        'run', '--auto',
        `You are the MAINTAINABILITY reviewer in an LLM council.\n` +
        `Focus on: readability, naming, long-term tech debt, whether this will be easy to change later.\n` +
        `Be concise — bullet points preferred.\n\nTask: ${task}`
      ]
    }
  ];

  const results = await Promise.all(agents.map(a => runAgent(a.name, a.binary, a.args)));
  printDelimited(results);
}

// ── review ───────────────────────────────────────────────────────────────────

if (cmd === 'review') {
  const gitResult = spawnSync('git', ['diff', 'HEAD'], { encoding: 'utf8' });
  if (gitResult.error || gitResult.status !== 0) {
    const msg = gitResult.stderr?.trim() || gitResult.error?.message || `exit ${gitResult.status}`;
    console.error(`Failed to get git diff: ${msg}`);
    process.exit(1);
  }
  const diff = gitResult.stdout?.trim() || 'No uncommitted changes found.';

  const agents = [
    {
      name: 'claude',
      binary: 'claude',
      args: [
        '--print',
        `Review the following code changes for CORRECTNESS AND SECURITY.\n` +
        `Focus on: bugs, logic errors, security vulnerabilities, unsafe patterns.\n` +
        `Be concise — numbered findings.\n\n${diff}`,
        '--dangerously-skip-permissions'
      ]
    },
    {
      name: 'gemini',
      binary: 'gemini',
      args: [
        '--prompt',
        `Review the following code changes for EDGE CASES AND ROBUSTNESS.\n` +
        `Focus on: unhandled inputs, missing error handling, race conditions, what the author missed.\n` +
        `Be concise — numbered findings.\n\n${diff}`,
        '--yolo', '--output-format', 'text'
      ]
    },
    {
      name: 'codex',
      binary: 'codex',
      args: [
        'exec',
        `Review the following code changes for SCOPE AND SIMPLICITY.\n` +
        `Focus on: unnecessary complexity, changes that exceed the stated goal, simpler alternatives.\n` +
        `Be concise — numbered findings.\n\n${diff}`
      ]
    },
    {
      name: 'cursor',
      binary: 'agent',
      args: [
        '-p', '--force',
        `Review the following code changes for CODEBASE INTEGRATION.\n` +
        `Focus on: consistency with existing patterns, dependency risks, integration issues.\n` +
        `Be concise — numbered findings.\n\n${diff}`
      ]
    },
    {
      name: 'kilo',
      binary: 'kilo',
      args: [
        'run', '--auto',
        `Review the following code changes for MAINTAINABILITY.\n` +
        `Focus on: readability, naming clarity, long-term tech debt introduced.\n` +
        `Be concise — numbered findings.\n\n${diff}`
      ]
    }
  ];

  const results = await Promise.all(agents.map(a => runAgent(a.name, a.binary, a.args)));
  printDelimited(results);
}

// ── debug ────────────────────────────────────────────────────────────────────

if (cmd === 'debug') {
  const symptom = stripFlags(rest).join(' ').trim();
  if (!symptom) { console.error('Usage: companion.mjs debug <symptom>'); process.exit(1); }

  const prompt = (focus) =>
    `A software bug has been reported. Generate a ranked list of hypotheses for the root cause.\n` +
    `Focus area: ${focus}.\n` +
    `Format: numbered list, most likely first, one sentence per hypothesis.\n\n` +
    `Symptom: ${symptom}`;

  const agents = [
    {
      name: 'claude',
      binary: 'claude',
      args: ['--print', prompt('application logic, state management, data flow'), '--dangerously-skip-permissions']
    },
    {
      name: 'gemini',
      binary: 'gemini',
      args: ['--prompt', prompt('infrastructure, concurrency, external dependencies, environment'), '--yolo', '--output-format', 'text']
    },
    {
      name: 'codex',
      binary: 'codex',
      args: ['exec', prompt('edge cases in input handling, off-by-one errors, type coercion')]
    },
    {
      name: 'cursor',
      binary: 'agent',
      args: ['-p', '--force', prompt('framework, library, and third-party integration issues')]
    },
    {
      name: 'kilo',
      binary: 'kilo',
      args: ['run', '--auto', prompt('naming, types, readability, and long-term maintainability')]
    }
  ];

  const results = await Promise.all(agents.map(a => runAgent(a.name, a.binary, a.args)));
  printDelimited(results);
}

// ── second-opinion ───────────────────────────────────────────────────────────

if (cmd === 'second-opinion') {
  const agentEqualsFlag = rest.find(a => a.startsWith('--agent='))?.split('=')[1];
  const agentIndex = rest.indexOf('--agent');
  const agentNextValue = agentIndex !== -1 && rest[agentIndex + 1] && !rest[agentIndex + 1].startsWith('--')
    ? rest[agentIndex + 1] : undefined;
  const agentFlag = agentEqualsFlag ?? agentNextValue ?? 'gemini';

  const task = stripFlags(rest).join(' ').trim();
  if (!task) { console.error('Usage: companion.mjs second-opinion [--agent claude|gemini|codex|cursor|kilo] <decision or approach>'); process.exit(1); }

  const prompt = `Give a concise second opinion on the following decision or approach.\n` +
    `Be direct: state what you agree with, what concerns you, and your overall verdict (approve / approve-with-caveats / reject).\n\n` +
    `${task}`;

  const agentMap = {
    claude:  () => runAgent('claude',  'claude', ['--print', prompt, '--dangerously-skip-permissions']),
    gemini:  () => runAgent('gemini',  'gemini', ['--prompt', prompt, '--yolo', '--output-format', 'text']),
    codex:   () => runAgent('codex',   'codex',  ['exec', prompt]),
    cursor:  () => runAgent('cursor',  'agent',  ['-p', '--force', prompt]),
    kilo:    () => runAgent('kilo',    'kilo',   ['run', '--auto', prompt]),
  };

  const runner = agentMap[agentFlag];
  if (!runner) {
    console.error(`Unknown agent: ${agentFlag}. Choose from: claude, gemini, codex, cursor, kilo`);
    process.exit(1);
  }

  const result = await runner();
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`SECOND OPINION: ${result.name.toUpperCase()}`);
  console.log('═'.repeat(60));
  console.log(result.output || result.error || '[no output]');
  console.log(`\n${'═'.repeat(60)}`);
}

const known = ['check-all', 'council', 'review', 'debug', 'second-opinion'];
if (!cmd || !known.includes(cmd)) {
  if (cmd) console.error(`Unknown command: ${cmd}`);
  console.error('Usage: companion.mjs <check-all|council|review|debug|second-opinion> [args...]');
  process.exit(1);
}
