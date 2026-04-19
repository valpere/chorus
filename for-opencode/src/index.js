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
    name: 'council',
    description: 'Run an LLM council: Claude (correctness), Gemini (edge cases), Codex (scope), Cursor (integration), Kilo (maintainability) tackle the same task in parallel. Returns delimited output — the host agent synthesizes.',
    inputSchema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: 'The task, question, or decision to put before the council'
        }
      },
      required: ['task']
    }
  },
  {
    name: 'parallel_review',
    description: 'Parallel code review of the current git diff: Claude (correctness/security), Gemini (edge cases), Codex (scope/simplicity), Cursor (integration), Kilo (maintainability). Returns delimited output — the host agent synthesizes.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'parallel_debug',
    description: 'Parallel root-cause hypotheses from five agents for a given symptom. Returns ranked hypotheses per agent — the host synthesizes an investigation plan.',
    inputSchema: {
      type: 'object',
      properties: {
        symptom: {
          type: 'string',
          description: 'The bug symptom or unexpected behavior to diagnose'
        }
      },
      required: ['symptom']
    }
  },
  {
    name: 'second_opinion',
    description: 'Quick independent second opinion from one agent on a decision or approach. Agent gives a verdict: approve / approve-with-caveats / reject.',
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
  }
];

// Check if a CLI binary exists and get its version
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

// Execute Claude with a task
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
    
    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
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

// Execute Gemini with a task
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
    
    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
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

// Execute Cursor Agent with a task
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

// Execute Kilo with a task
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

// Execute Codex with a task
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
    
    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
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

async function runCouncil(task) {
  return runParallel([
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
  ]);
}

async function runParallelReview() {
  const gitResult = spawnSync('git', ['diff', 'HEAD'], { encoding: 'utf8' });
  if (gitResult.error || gitResult.status !== 0) {
    const msg = gitResult.stderr?.trim() || gitResult.error?.message || `exit ${gitResult.status}`;
    throw new Error(`Failed to get git diff: ${msg}`);
  }
  const diff = gitResult.stdout?.trim() || 'No uncommitted changes found.';
  return runParallel([
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
  ]);
}

async function runParallelDebug(symptom) {
  const prompt = (focus) =>
    `A software bug has been reported. Generate a ranked list of hypotheses for the root cause.\n` +
    `Focus area: ${focus}.\n` +
    `Format: numbered list, most likely first, one sentence per hypothesis.\n\nSymptom: ${symptom}`;
  return runParallel([
    { name: 'claude',  fn: () => delegateToClaude(prompt('application logic, state management, data flow')) },
    { name: 'gemini',  fn: () => delegateToGemini(prompt('infrastructure, concurrency, external dependencies, environment')) },
    { name: 'codex',   fn: () => delegateToCodex(prompt('edge cases in input handling, type coercion, off-by-one errors')) },
    { name: 'cursor',  fn: () => delegateToCursor(prompt('framework, library, and third-party integration issues')) },
    { name: 'kilo',    fn: () => delegateToKilo(prompt('naming, types, readability, and long-term maintainability')) }
  ]);
}

async function runSecondOpinion(approach, agent = 'gemini') {
  const prompt =
    `Give a concise second opinion on the following decision or approach.\n` +
    `Be direct: state what you agree with, what concerns you, and your overall verdict (approve / approve-with-caveats / reject).\n\n` +
    `${approach}`;
  const fns = { claude: delegateToClaude, gemini: delegateToGemini, codex: delegateToCodex, cursor: delegateToCursor, kilo: delegateToKilo };
  const fn = fns[agent];
  if (!fn) throw new Error(`Unknown agent: ${agent}`);
  const output = (await fn(prompt)).trim();
  return [{ name: agent, output }];
}

// Create MCP server
const server = new Server(
  {
    name: 'chorus-opencode',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Handle list tools request
server.setRequestHandler('tools/list', async () => {
  return { tools: TOOLS };
});

// Handle tool calls
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args = {} } = request.params;

  let results;

  function requireString(value, name) {
    if (typeof value !== 'string') throw new Error(`Missing required parameter: ${name}`);
    const trimmed = value.trim();
    if (!trimmed) throw new Error(`Parameter ${name} must be a non-empty string`);
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
    case 'council': {
      const task = requireString(args.task, 'task');
      results = await runCouncil(task);
      break;
    }
    case 'parallel_review': {
      results = await runParallelReview();
      break;
    }
    case 'parallel_debug': {
      const symptom = requireString(args.symptom, 'symptom');
      results = await runParallelDebug(symptom);
      break;
    }
    case 'second_opinion': {
      const approach = requireString(args.approach, 'approach');
      const supportedAgents = new Set(['claude', 'gemini', 'codex', 'cursor', 'kilo']);
      const agent = args.agent ?? 'gemini';
      if (!supportedAgents.has(agent)) throw new Error(`Invalid agent: ${agent}. Choose from: ${[...supportedAgents].join(', ')}`);
      results = await runSecondOpinion(approach, agent);
      break;
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }

  return {
    content: [{ type: 'text', text: delimit(results) }]
  };
});

// Start server with stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Chorus MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
