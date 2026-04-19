import { spawn, spawnSync } from 'child_process';

const [,, cmd, ...rest] = process.argv;

function checkKilo() {
  const result = spawnSync('kilo', ['--version'], { encoding: 'utf8' });
  if (result.error || result.status !== 0) {
    console.error('Error: Kilo Code CLI not found or not working.');
    console.error('Please run setup: /kilo:setup');
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
  const version = checkKilo();
  console.log(`Kilo version: ${version}`);
  process.exit(0);
}

if (cmd === 'run') {
  checkKilo();
  const task = stripFlags(rest);
  if (!task.trim()) {
    console.error('Error: No task provided');
    process.exit(1);
  }
  const proc = spawn('kilo', ['run', '--auto', task], { stdio: 'inherit' });
  proc.on('error', err => { console.error(`Failed to run Kilo: ${err.message}`); process.exit(1); });
  proc.on('exit', code => process.exit(code ?? 0));
}

if (cmd === 'review') {
  checkKilo();
  const gitDiff = spawnSync('git', ['diff', 'HEAD'], { encoding: 'utf8' });
  const reviewPrompt = `Review these changes:\n${gitDiff.stdout || 'No diff available'}\n\nFocus on: correctness, maintainability, readability, naming, long-term tech debt.`;
  const proc = spawn('kilo', ['run', '--auto', reviewPrompt], { stdio: 'inherit' });
  proc.on('error', err => { console.error(`Failed to run Kilo: ${err.message}`); process.exit(1); });
  proc.on('exit', code => process.exit(code ?? 0));
}

const known = ['check', 'run', 'review'];
if (!cmd || !known.includes(cmd)) {
  if (cmd) console.error(`Error: Unknown command "${cmd}"`);
  console.error('Usage: node companion.mjs <check|run|review> [args...]');
  process.exit(1);
}
