import { spawn, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const [,, cmd, ...rest] = process.argv;

// Helper to check if codex is available
function checkCodex() {
  const result = spawnSync('codex', ['--version'], { encoding: 'utf8' });
  if (result.error || result.status !== 0) {
    console.error('Error: Codex CLI not found or not working.');
    console.error('Please run setup: /codex:setup');
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
  const version = checkCodex();
  console.log(`Codex version: ${version}`);
  process.exit(0);
}

if (cmd === 'run') {
  checkCodex();
  const task = stripFlags(rest);
  if (!task.trim()) {
    console.error('Error: No task provided');
    process.exit(1);
  }
  const proc = spawn('codex', ['exec', task], { stdio: 'inherit' });
  proc.on('exit', code => process.exit(code ?? 0));
}

if (cmd === 'review') {
  checkCodex();
  
  // Build the review prompt with git context
  const gitStat = spawnSync('git', ['diff', '--stat', 'HEAD'], { encoding: 'utf8' });
  const gitDiff = spawnSync('git', ['diff', 'HEAD'], { encoding: 'utf8' });
  
  const reviewPrompt = `Review these git changes for correctness, security, and edge cases:

Git diff stat:
${gitStat.stdout || 'No stat available'}

Git diff:
${gitDiff.stdout || 'No diff available'}`;

  const proc = spawn('codex', ['review', reviewPrompt], { stdio: 'inherit' });
  proc.on('exit', code => process.exit(code ?? 0));
}

if (!cmd) {
  console.error('Usage: node companion.mjs <check|run|review> [args...]');
  process.exit(1);
}
