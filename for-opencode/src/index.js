import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { spawnSync, spawn } from 'child_process';

// Tool definitions
const TOOLS = [
  {
    name: 'delegate_claude',
    description: 'Delegate a task to Claude Code and return its output verbatim',
    inputSchema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: 'The task to delegate to Claude Code'
        }
      },
      required: ['task']
    }
  },
  {
    name: 'delegate_gemini',
    description: 'Delegate a task to Gemini CLI and return its output verbatim',
    inputSchema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: 'The task to delegate to Gemini CLI'
        }
      },
      required: ['task']
    }
  },
  {
    name: 'delegate_cursor',
    description: 'Delegate a task to Cursor Agent CLI and return its output verbatim',
    inputSchema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: 'The task to delegate to Cursor Agent CLI'
        }
      },
      required: ['task']
    }
  },
  {
    name: 'delegate_kilo',
    description: 'Delegate a task to Kilo Code CLI and return its output verbatim',
    inputSchema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: 'The task to delegate to Kilo Code CLI'
        }
      },
      required: ['task']
    }
  },
  {
    name: 'delegate_codex',
    description: 'Delegate a task to Codex and return its output verbatim',
    inputSchema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: 'The task to delegate to Codex'
        }
      },
      required: ['task']
    }
  },
  {
    name: 'check_agents',
    description: 'Report availability of all 5 target CLIs (claude, gemini, codex, cursor, kilo) — mirrors /chorus check-all',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'council',
    description: 'Run an LLM council: Claude (correctness), Gemini (edge cases), Codex (scope), Cursor (integration), Kilo (maintainability) tackle the same task in parallel. Returns delimited output — the host agent synthesizes.\n\nstrict: if true, every agent slot is preserved and missing agents appear as [error: ...]; if false (default), missing agents are filtered out and a "⚠ Skipped: ..." line is prepended.',
    inputSchema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: 'The task, question, or decision to put before the council'
        },
        strict: {
          type: 'boolean',
          description: 'If true, run all agents regardless of availability and show errors inline. If false (default), skip unavailable agents and prepend a warning.'
        }
      },
      required: ['task']
    }
  },
  {
    name: 'parallel_review',
    description: 'Parallel code review of the current git diff: Claude (correctness/security), Gemini (edge cases), Codex (scope/simplicity), Cursor (integration), Kilo (maintainability). Returns delimited output — the host agent synthesizes.\n\nstrict: if true, every agent slot is preserved and missing agents appear as [error: ...]; if false (default), missing agents are filtered out and a "⚠ Skipped: ..." line is prepended.',
    inputSchema: {
      type: 'object',
      properties: {
        strict: {
          type: 'boolean',
          description: 'If true, run all agents regardless of availability and show errors inline. If false (default), skip unavailable agents and prepend a warning.'
        }
      }
    }
  },
  {
    name: 'parallel_debug',
    description: 'Parallel root-cause hypotheses from five agents for a given symptom. Returns ranked hypotheses per agent — the host synthesizes an investigation plan.\n\nstrict: if true, every agent slot is preserved and missing agents appear as [error: ...]; if false (default), missing agents are filtered out and a "⚠ Skipped: ..." line is prepended.',
    inputSchema: {
      type: 'object',
      properties: {
        symptom: {
          type: 'string',
          description: 'The bug symptom or unexpected behavior to diagnose'
        },
        strict: {
          type: 'boolean',
          description: 'If true, run all agents regardless of availability and show errors inline. If false (default), skip unavailable agents and prepend a warning.'
        }
      },
      required: ['symptom']
    }
  },
  {
    name: 'second_opinion',
    description: 'Quick independent second opinion from one agent on a decision or approach. Agent gives a verdict: approve / approve-with-caveats / reject.\n\nIf the requested agent is unavailable, automatically falls back to the next available agent in order: gemini → claude → codex → kilo → cursor. A warning line is prepended to the output naming which agent was actually used.',
    inputSchema: {
      type: 'object',
      properties: {
        approach: {
          type: 'string',
          description: 'The decision or approach to get a second opinion on'
        },
        agent: {
          type: 'string',
          enum: ['claude', 'gemini', 'codex', 'cursor', 'kilo'],
          description: 'Which agent to consult. Defaults to gemini.'
        }
      },
      required: ['approach']
    }
  },
  {
    name: 'vote',
    description: 'Put a yes/no proposition to all five agents and tally their votes (YES / NO / ABSTAIN). Returns a tally table and per-agent rationale — simpler than council when you need a decision signal rather than synthesis.',
    inputSchema: {
      type: 'object',
      properties: {
        proposition: {
          type: 'string',
          description: 'The proposition to vote on (e.g. "Adopt TypeScript for new files?")'
        }
      },
      required: ['proposition']
    }
  }
];

// ── CLI helpers ───────────────────────────────────────────────────────────────

const BINARIES = {
  claude: 'claude',
  gemini: 'gemini',
  codex: 'codex',
  cursor: 'agent',
  kilo: 'kilo',
};

function checkCli(binary) {
  try {
    const result = spawnSync(binary, ['--version'], { encoding: 'utf8' });
    if (result.error || result.status !== 0) {
      return { available: false, error: `${binary} not found in PATH` };
    }
    return { available: true, version: result.stdout.trim() };
  } catch (e) {
    return { available: false, error: `${binary} not found in PATH` };
  }
}

/** Returns { available: [{name, fn}], skipped: [name] } */
function filterAvailable(tasks) {
  const available = [];
  const skipped = [];
  for (const t of tasks) {
    const binary = BINARIES[t.name];
    if (binary && checkCli(binary).available) {
      available.push(t);
    } else {
      skipped.push(t.name);
    }
  }
  return { available, skipped };
}

// ── delegate functions ────────────────────────────────────────────────────────

async function delegateToClaude(task) {
  const check = checkCli('claude');
  if (!check.available) {
    throw new Error(`Claude CLI not available: ${check.error}. Please install Claude Code.`);
  }

  return new Promise((resolve, reject) => {
    const proc = spawn('claude', ['--print', task, '--dangerously-skip-permissions'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      if (code !== 0 && code !== null) {
        reject(new Error(`Claude exited with code ${code}: ${stderr || stdout}`));
      } else {
        resolve(stdout);
      }
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to run Claude: ${err.message}`));
    });
  });
}

async function delegateToGemini(task) {
  const check = checkCli('gemini');
  if (!check.available) {
    throw new Error(`Gemini CLI not available: ${check.error}. Please install Gemini CLI.`);
  }

  return new Promise((resolve, reject) => {
    const proc = spawn('gemini', ['--prompt', task, '--yolo', '--output-format', 'text'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      if (code !== 0 && code !== null) {
        reject(new Error(`Gemini exited with code ${code}: ${stderr || stdout}`));
      } else {
        resolve(stdout);
      }
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to run Gemini: ${err.message}`));
    });
  });
}

async function delegateToCursor(task) {
  const check = checkCli('agent');
  if (!check.available) {
    throw new Error(`Cursor Agent CLI not available: ${check.error}. Please install Cursor Agent CLI.`);
  }

  return new Promise((resolve, reject) => {
    const proc = spawn('agent', ['-p', '--force', task], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      if (code !== 0 && code !== null) {
        reject(new Error(`Cursor Agent exited with code ${code}: ${stderr || stdout}`));
      } else {
        resolve(stdout);
      }
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to run Cursor Agent: ${err.message}`));
    });
  });
}

async function delegateToKilo(task) {
  const check = checkCli('kilo');
  if (!check.available) {
    throw new Error(`Kilo Code CLI not available: ${check.error}. Please install Kilo Code CLI.`);
  }

  return new Promise((resolve, reject) => {
    const proc = spawn('kilo', ['run', '--auto', task], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      if (code !== 0 && code !== null) {
        reject(new Error(`Kilo exited with code ${code}: ${stderr || stdout}`));
      } else {
        resolve(stdout);
      }
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to run Kilo: ${err.message}`));
    });
  });
}

async function delegateToCodex(task) {
  const check = checkCli('codex');
  if (!check.available) {
    throw new Error(`Codex CLI not available: ${check.error}. Please install Codex.`);
  }

  return new Promise((resolve, reject) => {
    const proc = spawn('codex', ['exec', task], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      if (code !== 0 && code !== null) {
        reject(new Error(`Codex exited with code ${code}: ${stderr || stdout}`));
      } else {
        resolve(stdout);
      }
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to run Codex: ${err.message}`));
    });
  });
}

const DELEGATE_FNS = {
  claude: delegateToClaude,
  gemini: delegateToGemini,
  codex: delegateToCodex,
  cursor: delegateToCursor,
  kilo: delegateToKilo,
};

// ── orchestration helpers ─────────────────────────────────────────────────────

function delimit(results) {
  const sep = '═'.repeat(60);
  return results
    .map(r => `${sep}\nAGENT: ${r.name.toUpperCase()}\n${sep}\n${r.output}`)
    .join('\n\n') + `\n${sep}`;
}

async function runParallel(tasks) {
  return Promise.all(tasks.map(async ({ name, fn }) => {
    try {
      const output = (await fn()).trim();
      return { name, output };
    } catch (e) {
      return { name, output: `[error: ${e.message}]` };
    }
  }));
}

/**
 * Run tasks with optional graceful degradation.
 * strict=false (default): filters out unavailable agents, prepends ⚠ Skipped header, throws if <2 available.
 * strict=true: runs all tasks regardless, inline [error:...] on failure.
 */
async function runParallelWithDegradation(tasks, strict = false) {
  if (strict) {
    return runParallel(tasks);
  }

  const { available, skipped } = filterAvailable(tasks);
  if (available.length < 2) {
    throw new Error(
      `Not enough agents available (need at least 2, got ${available.length}).` +
      (skipped.length ? ` Missing: ${skipped.join(', ')}. Install them to proceed.` : '')
    );
  }

  const results = await runParallel(available);
  const prefix = skipped.length ? `⚠ Skipped: ${skipped.join(', ')}\n\n` : '';
  return { results, prefix };
}

function formatDelimitedWithPrefix(results, prefix) {
  return (prefix || '') + delimit(results);
}

async function runCouncil(task, strict = false) {
  const tasks = [
    {
      name: 'claude',
      fn: () => delegateToClaude(
        `You are the CORRECTNESS reviewer in an LLM council.\n` +
        `Focus on: logic errors, type safety, off-by-one bugs, unhandled edge cases, security issues.\n` +
        `Be concise — bullet points preferred.\n\nTask: ${task}`
      )
    },
    {
      name: 'gemini',
      fn: () => delegateToGemini(
        `You are the EDGE-CASES reviewer in an LLM council.\n` +
        `Focus on: unusual inputs, failure modes, race conditions, what was not considered, alternative approaches.\n` +
        `Be concise — bullet points preferred.\n\nTask: ${task}`
      )
    },
    {
      name: 'codex',
      fn: () => delegateToCodex(
        `You are the SCOPE reviewer in an LLM council.\n` +
        `Focus on: unnecessary complexity, premature abstractions, whether the smallest solution was chosen.\n` +
        `Be concise — bullet points preferred.\n\nTask: ${task}`
      )
    },
    {
      name: 'cursor',
      fn: () => delegateToCursor(
        `You are the INTEGRATION reviewer in an LLM council.\n` +
        `Focus on: how this fits with existing codebase patterns, dependency implications, integration risks.\n` +
        `Be concise — bullet points preferred.\n\nTask: ${task}`
      )
    },
    {
      name: 'kilo',
      fn: () => delegateToKilo(
        `You are the MAINTAINABILITY reviewer in an LLM council.\n` +
        `Focus on: readability, naming, long-term tech debt, whether this will be easy to change later.\n` +
        `Be concise — bullet points preferred.\n\nTask: ${task}`
      )
    }
  ];
  return runParallelWithDegradation(tasks, strict);
}

async function runParallelReview(strict = false) {
  const gitResult = spawnSync('git', ['diff', 'HEAD'], { encoding: 'utf8' });
  if (gitResult.error || gitResult.status !== 0) {
    const msg = gitResult.stderr?.trim() || gitResult.error?.message || `exit ${gitResult.status}`;
    throw new Error(`Failed to get git diff: ${msg}`);
  }
  const diff = gitResult.stdout?.trim() || 'No uncommitted changes found.';
  const tasks = [
    {
      name: 'claude',
      fn: () => delegateToClaude(
        `Review these code changes for CORRECTNESS AND SECURITY.\n` +
        `Focus on: bugs, logic errors, security vulnerabilities, unsafe patterns.\n` +
        `Be concise — numbered findings.\n\n${diff}`
      )
    },
    {
      name: 'gemini',
      fn: () => delegateToGemini(
        `Review these code changes for EDGE CASES AND ROBUSTNESS.\n` +
        `Focus on: unhandled inputs, missing error handling, race conditions, what the author missed.\n` +
        `Be concise — numbered findings.\n\n${diff}`
      )
    },
    {
      name: 'codex',
      fn: () => delegateToCodex(
        `Review these code changes for SCOPE AND SIMPLICITY.\n` +
        `Focus on: unnecessary complexity, changes that exceed the stated goal, simpler alternatives.\n` +
        `Be concise — numbered findings.\n\n${diff}`
      )
    },
    {
      name: 'cursor',
      fn: () => delegateToCursor(
        `Review these code changes for CODEBASE INTEGRATION.\n` +
        `Focus on: consistency with existing patterns, dependency risks, integration issues.\n` +
        `Be concise — numbered findings.\n\n${diff}`
      )
    },
    {
      name: 'kilo',
      fn: () => delegateToKilo(
        `Review these code changes for MAINTAINABILITY.\n` +
        `Focus on: readability, naming clarity, long-term tech debt introduced.\n` +
        `Be concise — numbered findings.\n\n${diff}`
      )
    }
  ];
  return runParallelWithDegradation(tasks, strict);
}

async function runParallelDebug(symptom, strict = false) {
  const prompt = (focus) =>
    `A software bug has been reported. Generate a ranked list of hypotheses for the root cause.\n` +
    `Focus area: ${focus}.\n` +
    `Format: numbered list, most likely first, one sentence per hypothesis.\n\nSymptom: ${symptom}`;
  const tasks = [
    { name: 'claude',  fn: () => delegateToClaude(prompt('application logic, state management, data flow')) },
    { name: 'gemini',  fn: () => delegateToGemini(prompt('infrastructure, concurrency, external dependencies, environment')) },
    { name: 'codex',   fn: () => delegateToCodex(prompt('edge cases in input handling, type coercion, off-by-one errors')) },
    { name: 'cursor',  fn: () => delegateToCursor(prompt('framework, library, and third-party integration issues')) },
    { name: 'kilo',    fn: () => delegateToKilo(prompt('naming, types, readability, and long-term maintainability')) }
  ];
  return runParallelWithDegradation(tasks, strict);
}

async function runSecondOpinion(approach, agent = 'gemini') {
  const prompt =
    `Give a concise second opinion on the following decision or approach.\n` +
    `Be direct: state what you agree with, what concerns you, and your overall verdict (approve / approve-with-caveats / reject).\n\n` +
    `${approach}`;

  if (!DELEGATE_FNS[agent]) throw new Error(`Unknown agent: ${agent}`);

  const defaultOrder = ['gemini', 'claude', 'codex', 'kilo', 'cursor'];
  let chosenAgent = agent;

  if (!checkCli(BINARIES[chosenAgent]).available) {
    const fallback = defaultOrder.find(n => n !== chosenAgent && checkCli(BINARIES[n]).available);
    if (!fallback) {
      throw new Error(`Agent "${chosenAgent}" not available and no alternatives are installed. Install at least one agent to use second_opinion.`);
    }
    const warning = `⚠ Agent "${chosenAgent}" unavailable — used "${fallback}".\n\n`;
    const output = ((await DELEGATE_FNS[fallback](prompt))).trim();
    return [{ name: fallback, output: warning + output }];
  }

  const output = ((await DELEGATE_FNS[chosenAgent](prompt))).trim();
  return [{ name: chosenAgent, output }];
}

function parseVote(text) {
  const line = text.split('\n').find(l => l.trim().length > 0) || '';
  const clean = line.replace(/[*_`]/g, '').trim().toUpperCase();
  if (/^YES\b/.test(clean)) return { vote: 'YES', rationale: line.replace(/^yes[^a-z]*/i, '').trim() };
  if (/^NO\b/.test(clean)) return { vote: 'NO', rationale: line.replace(/^no[^a-z]*/i, '').trim() };
  if (/^ABSTAIN\b/.test(clean)) return { vote: 'ABSTAIN', rationale: line.replace(/^abstain[^a-z]*/i, '').trim() };
  return { vote: 'INVALID', rationale: line };
}

async function runVote(proposition) {
  const prompt =
    `Vote on the following proposition. Reply with a single line starting with YES, NO, or ABSTAIN (uppercase), ` +
    `followed by one sentence of rationale. No other text.\n\nProposition: ${proposition}`;

  const tasks = [
    { name: 'claude',  fn: () => delegateToClaude(prompt) },
    { name: 'gemini',  fn: () => delegateToGemini(prompt) },
    { name: 'codex',   fn: () => delegateToCodex(prompt) },
    { name: 'cursor',  fn: () => delegateToCursor(prompt) },
    { name: 'kilo',    fn: () => delegateToKilo(prompt) },
  ];

  const { available, skipped } = filterAvailable(tasks);
  if (available.length < 2) {
    throw new Error(
      `Not enough agents available for a vote (need at least 2, got ${available.length}).` +
      (skipped.length ? ` Missing: ${skipped.join(', ')}.` : '')
    );
  }

  const raw = await runParallel(available);
  const tally = { yes: 0, no: 0, abstain: 0, invalid: 0 };
  const parsed = raw.map(r => {
    const { vote, rationale } = parseVote(r.output);
    tally[vote.toLowerCase()]++;
    return { name: r.name, vote, rationale, output: r.output };
  });

  const sep = '─'.repeat(40);
  const tallyTable = [
    `| Vote | Count |`,
    `|------|-------|`,
    `| YES  | ${tally.yes} |`,
    `| NO   | ${tally.no} |`,
    `| ABSTAIN | ${tally.abstain} |`,
    tally.invalid > 0 ? `| INVALID | ${tally.invalid} |` : null,
  ].filter(Boolean).join('\n');

  const agentSections = parsed.map(r =>
    `${sep}\n${r.name.toUpperCase()}: ${r.vote}\n${sep}\n${r.rationale || r.output}`
  ).join('\n\n');

  const skippedNote = skipped.length ? `⚠ Skipped: ${skipped.join(', ')}\n\n` : '';
  return skippedNote + `## Vote Tally\n\n${tallyTable}\n\n## Per-Agent Rationale\n\n${agentSections}`;
}

// ── MCP server ────────────────────────────────────────────────────────────────

const server = new Server(
  {
    name: 'chorus-opencode',
    version: '1.1.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

server.setRequestHandler('tools/list', async () => {
  return { tools: TOOLS };
});

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args = {} } = request.params;

  function requireString(value, paramName) {
    if (typeof value !== 'string') throw new Error(`Missing required parameter: ${paramName}`);
    const trimmed = value.trim();
    if (!trimmed) throw new Error(`Parameter ${paramName} must be a non-empty string`);
    return trimmed;
  }

  switch (name) {
    case 'delegate_claude': {
      const task = requireString(args.task, 'task');
      return { content: [{ type: 'text', text: (await delegateToClaude(task)).trim() }] };
    }
    case 'delegate_gemini': {
      const task = requireString(args.task, 'task');
      return { content: [{ type: 'text', text: (await delegateToGemini(task)).trim() }] };
    }
    case 'delegate_cursor': {
      const task = requireString(args.task, 'task');
      return { content: [{ type: 'text', text: (await delegateToCursor(task)).trim() }] };
    }
    case 'delegate_kilo': {
      const task = requireString(args.task, 'task');
      return { content: [{ type: 'text', text: (await delegateToKilo(task)).trim() }] };
    }
    case 'delegate_codex': {
      const task = requireString(args.task, 'task');
      return { content: [{ type: 'text', text: (await delegateToCodex(task)).trim() }] };
    }
    case 'check_agents': {
      const rows = Object.entries(BINARIES).map(([agentName, binary]) => {
        const check = checkCli(binary);
        const status = check.available ? `✓ ${check.version}` : `✗ not found`;
        return `| ${agentName} | \`${binary}\` | ${status} |`;
      });
      const table = `| Agent | Binary | Status |\n|-------|--------|--------|\n${rows.join('\n')}`;
      return { content: [{ type: 'text', text: table }] };
    }
    case 'council': {
      const task = requireString(args.task, 'task');
      const strict = args.strict === true;
      const out = await runCouncil(task, strict);
      const text = strict ? delimit(out) : formatDelimitedWithPrefix(out.results, out.prefix);
      return { content: [{ type: 'text', text }] };
    }
    case 'parallel_review': {
      const strict = args.strict === true;
      const out = await runParallelReview(strict);
      const text = strict ? delimit(out) : formatDelimitedWithPrefix(out.results, out.prefix);
      return { content: [{ type: 'text', text }] };
    }
    case 'parallel_debug': {
      const symptom = requireString(args.symptom, 'symptom');
      const strict = args.strict === true;
      const out = await runParallelDebug(symptom, strict);
      const text = strict ? delimit(out) : formatDelimitedWithPrefix(out.results, out.prefix);
      return { content: [{ type: 'text', text }] };
    }
    case 'second_opinion': {
      const approach = requireString(args.approach, 'approach');
      const supportedAgents = new Set(Object.keys(DELEGATE_FNS));
      const agent = args.agent ?? 'gemini';
      if (!supportedAgents.has(agent)) throw new Error(`Invalid agent: ${agent}. Choose from: ${[...supportedAgents].join(', ')}`);
      const results = await runSecondOpinion(approach, agent);
      return { content: [{ type: 'text', text: delimit(results) }] };
    }
    case 'vote': {
      const proposition = requireString(args.proposition, 'proposition');
      const text = await runVote(proposition);
      return { content: [{ type: 'text', text }] };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Chorus MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
