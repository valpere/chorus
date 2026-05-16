#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import yaml from 'js-yaml';

const DEFAULT_PATH = join(homedir(), '.config', 'job-hunter', 'profile.yaml');

function resolvePath(p) {
  if (!p) return DEFAULT_PATH;
  return p.startsWith('~') ? join(homedir(), p.slice(1)) : p;
}

function sessionPath(platform, profilePath) {
  return join(dirname(resolvePath(profilePath)), `session-${platform}.json`);
}

const [, , command, ...args] = process.argv;

switch (command) {
  case 'load': {
    const path = resolvePath(args[0]);
    if (!existsSync(path)) {
      process.stderr.write(`Profile not found: ${path}\nRun /job-hunter:setup first.\n`);
      process.exit(1);
    }
    process.stdout.write(JSON.stringify(yaml.load(readFileSync(path, 'utf8'))) + '\n');
    break;
  }
  case 'save': {
    const path = resolvePath(args[0]);
    const data = JSON.parse(readFileSync(0, 'utf8'));
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, yaml.dump(data, { lineWidth: 120 }), 'utf8');
    process.stdout.write(`Profile saved to ${path}\n`);
    break;
  }
  case 'exists': {
    process.exit(existsSync(resolvePath(args[0])) ? 0 : 1);
  }
  case 'save-session': {
    const [platform, profileArg] = args;
    const spath = sessionPath(platform, profileArg);
    const cookies = JSON.parse(readFileSync(0, 'utf8'));
    mkdirSync(dirname(spath), { recursive: true });
    writeFileSync(spath, JSON.stringify(cookies, null, 2), 'utf8');
    process.stdout.write(`Session saved to ${spath}\n`);
    break;
  }
  case 'load-session': {
    const [platform, profileArg] = args;
    const spath = sessionPath(platform, profileArg);
    process.stdout.write((existsSync(spath) ? readFileSync(spath, 'utf8') : 'null') + '\n');
    break;
  }
  default:
    process.stderr.write(`Unknown command: ${command}\n`);
    process.stderr.write('Usage: profile.mjs <load|save|exists|save-session|load-session> [args]\n');
    process.exit(1);
}
