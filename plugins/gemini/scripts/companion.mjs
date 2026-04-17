import { spawn, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const [,, cmd, ...rest] = process.argv;

// Helper to check if gemini is available
function checkGemini() {
  const result = spawnSync('gemini', ['--version'], { encoding: 'utf8' });
  if (result.error || result.status !== 0) {
    console.error('Error: Gemini CLI not found or not working.');
    console.error('Please run setup: /gemini:setup');
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
  const version = checkGemini();
  console.log(`Gemini version: ${version}`);
  process.exit(0);
}

if (cmd === 'run') {
  checkGemini();
  const task = stripFlags(rest);
  if (!task.trim()) {
    console.error('Error: No task provided');
    process.exit(1);
  }
  const proc = spawn('gemini', ['--prompt', task, '--yolo', '--output-format', 'text'], { stdio: 'inherit' });
  proc.on('exit', code => process.exit(code ?? 0));
}

if (cmd === 'review') {
  checkGemini();
  
  // Build the review prompt with git context
  const gitDiff = spawnSync('git', ['diff', 'HEAD'], { encoding: 'utf8' });
  
  const reviewPrompt = `Review these changes:
${gitDiff.stdout || 'No diff available'}

Focus on: correctness, security, edge cases.`;

  const proc = spawn('gemini', ['--prompt', reviewPrompt, '--yolo', '--output-format', 'text'], { stdio: 'inherit' });
  proc.on('exit', code => process.exit(code ?? 0));
}

if (!cmd) {
  console.error('Usage: node companion.mjs <check|run|review> [args...]');
  process.exit(1);
}
