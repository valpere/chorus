import { spawn, spawnSync } from 'child_process';

const [,, cmd, ...rest] = process.argv;

function checkCursor() {
  const result = spawnSync('agent', ['--version'], { encoding: 'utf8' });
  if (result.error || result.status !== 0) {
    console.error('Error: Cursor Agent CLI not found or not working.');
    console.error('Please run setup: /cursor:setup');
    process.exit(1);
  }
  return result.stdout.trim();
}

function stripFlags(args) {
  return args
    .filter(arg => arg !== '--background' && arg !== '--wait')
    .join(' ');
}

if (cmd === 'check') {
  const version = checkCursor();
  console.log(`Cursor Agent version: ${version}`);
  process.exit(0);
}

if (cmd === 'run') {
  checkCursor();
  const task = stripFlags(rest);
  if (!task.trim()) {
    console.error('Error: No task provided');
    process.exit(1);
  }
  const proc = spawn('agent', ['-p', '--force', task], { stdio: 'inherit' });
  proc.on('error', err => { console.error(`Failed to run Cursor Agent: ${err.message}`); process.exit(1); });
  proc.on('exit', code => process.exit(code ?? 0));
}

if (cmd === 'review') {
  checkCursor();
  const gitDiff = spawnSync('git', ['diff', 'HEAD'], { encoding: 'utf8' });
  const reviewPrompt = `Review these changes:\n${gitDiff.stdout || 'No diff available'}\n\nFocus on: correctness, security, edge cases, integration with existing codebase.`;
  const proc = spawn('agent', ['-p', '--force', reviewPrompt], { stdio: 'inherit' });
  proc.on('error', err => { console.error(`Failed to run Cursor Agent: ${err.message}`); process.exit(1); });
  proc.on('exit', code => process.exit(code ?? 0));
}

const known = ['check', 'run', 'review'];
if (!cmd || !known.includes(cmd)) {
  if (cmd) console.error(`Error: Unknown command "${cmd}"`);
  console.error('Usage: node companion.mjs <check|run|review> [args...]');
  process.exit(1);
}
