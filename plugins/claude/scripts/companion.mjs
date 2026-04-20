import { spawn, spawnSync } from 'node:child_process';

const [,, cmd, ...rest] = process.argv;

// Helper to check if claude is available
function checkClaude() {
  // Check version
  const versionResult = spawnSync('claude', ['--version'], { encoding: 'utf8' });
  if (versionResult.error || versionResult.status !== 0) {
    console.error('Error: Claude CLI not found or not working.');
    console.error('Please run setup: /claude:setup');
    process.exit(1);
  }
  
  // Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Error: ANTHROPIC_API_KEY environment variable not set.');
    console.error('Please run setup: /claude:setup');
    process.exit(1);
  }
  
  return versionResult.stdout.trim();
}

// Strip execution flags from arguments
function stripFlags(args) {
  return args
    .filter(arg => arg !== '--background' && arg !== '--wait')
    .join(' ');
}

if (cmd === 'check') {
  const version = checkClaude();
  console.log(`Claude version: ${version}`);
  console.log('ANTHROPIC_API_KEY is set');
  process.exit(0);
}

if (cmd === 'run') {
  checkClaude();
  const task = stripFlags(rest);
  if (!task.trim()) {
    console.error('Error: No task provided');
    process.exit(1);
  }
  const proc = spawn('claude', ['--print', task, '--dangerously-skip-permissions'], { stdio: 'inherit' });
  proc.on('exit', code => process.exit(code ?? 0));
}

if (cmd === 'review') {
  checkClaude();
  
  // Build the review prompt with git context
  const gitDiff = spawnSync('git', ['diff', 'HEAD'], { encoding: 'utf8' });
  
  const reviewPrompt = `Review the following git diff for correctness, security, and code quality:

${gitDiff.stdout || 'No diff available'}`;

  const proc = spawn('claude', ['--print', reviewPrompt, '--dangerously-skip-permissions'], { stdio: 'inherit' });
  proc.on('exit', code => process.exit(code ?? 0));
}

if (!cmd) {
  console.error('Usage: node companion.mjs <check|run|review> [args...]');
  process.exit(1);
}
