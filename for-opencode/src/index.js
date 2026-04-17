import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { spawnSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  const { name, arguments: args } = request.params;

  if (!args || typeof args.task !== 'string') {
    throw new Error('Missing required parameter: task');
  }

  const task = args.task.trim();
  if (!task) {
    throw new Error('Task cannot be empty');
  }

  let result;
  
  switch (name) {
    case 'delegate_claude':
      result = await delegateToClaude(task);
      break;
    case 'delegate_gemini':
      result = await delegateToGemini(task);
      break;
    case 'delegate_codex':
      result = await delegateToCodex(task);
      break;
    default:
      throw new Error(`Unknown tool: ${name}`);
  }

  return {
    content: [
      {
        type: 'text',
        text: result
      }
    ]
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
