import { spawn, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const [,, cmd, ...rest] = process.argv;

// Helper to check if opencode is available
function checkOpenCode() {
  const result = spawnSync('opencode', ['--version'], { encoding: 'utf8' });
  if (result.error || result.status !== 0) {
    console.error('Error: OpenCode CLI not found or not working.');
    console.error('Please run setup: /opencode:setup');
    process.exit(1);
  }
  return result.stdout.trim();
}

// Strip execution flags from arguments
function stripFlags(args) {
  return args
    .filter(arg => arg !== '--background' && arg !== '--wait')
    .join(' ');
}

if (cmd === 'check') {
  const version = checkOpenCode();
  console.log(`OpenCode version: ${version}`);
  process.exit(0);
}

if (cmd === 'run') {
  checkOpenCode();
  const task = stripFlags(rest);
  if (!task.trim()) {
    console.error('Error: No task provided');
    process.exit(1);
  }
  const proc = spawn('opencode', ['run', task], { stdio: 'inherit' });
  proc.on('exit', code => process.exit(code ?? 0));
}

if (cmd === 'review') {
  checkOpenCode();
  
  // Build the review prompt with git context
  const gitStat = spawnSync('git', ['diff', '--stat', 'HEAD'], { encoding: 'utf8' });
  const gitDiff = spawnSync('git', ['diff', 'HEAD'], { encoding: 'utf8' });
  
  const reviewPrompt = `Review the current git changes. Focus on correctness, edge cases, and code quality. Output only findings.

Git diff stat:
${gitStat.stdout || 'No stat available'}

Git diff:
${gitDiff.stdout || 'No diff available'}`;

  const proc = spawn('opencode', ['run', reviewPrompt], { stdio: 'inherit' });
  proc.on('exit', code => process.exit(code ?? 0));
}

if (!cmd) {
  console.error('Usage: node companion.mjs <check|run|review> [args...]');
  process.exit(1);
}
