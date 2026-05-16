#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import yaml from 'js-yaml';

// ── scoring dimensions ────────────────────────────────────────────────────────

function skillOverlap(profileSkills, vacancyStack) {
  if (!vacancyStack?.length || !profileSkills?.length) return 0;
  const pSet = new Set(profileSkills.map(s => s.toLowerCase()));
  const vSet = new Set(vacancyStack.map(s => s.toLowerCase()));
  const intersection = [...pSet].filter(s => vSet.has(s)).length;
  const union = new Set([...pSet, ...vSet]).size;
  return Math.round((intersection / union) * 40);
}

function salaryScore(profileMin, vacancy) {
  if (!vacancy.salary_min && !vacancy.salary_max) return 10; // unknown → partial credit
  const vacMax = vacancy.salary_max ?? vacancy.salary_min;
  if (vacMax >= profileMin) return 20;
  return Math.round((vacMax / profileMin) * 20);
}

function locationScore(profileLocation, vacancy) {
  if (profileLocation === 'any') return 20;
  const wantsRemote = profileLocation === 'remote';
  const wantsHybrid = profileLocation === 'hybrid';
  if (wantsRemote && vacancy.remote) return 20;
  if (wantsHybrid && (vacancy.remote || vacancy.hybrid)) return 20;
  if (profileLocation === 'onsite' && !vacancy.remote && !vacancy.hybrid) return 20;
  return 0;
}

function seniorityScore(profileTitle, vacancy) {
  const text = `${vacancy.title ?? ''} ${vacancy.description ?? ''}`.toLowerCase();
  const pt = profileTitle.toLowerCase();
  if (/junior|intern/.test(text)) return 0;
  if ((pt.includes('senior') && text.includes('senior')) ||
      (pt.includes('lead') && /lead|principal/.test(text)) ||
      (pt.includes('cto') && /head|director|principal|vp/.test(text))) return 10;
  return 6; // role exists, level unspecified
}

function companyScore(vacancy) {
  let pts = 2;
  if (vacancy.salary_min || vacancy.salary_max) pts += 3;
  if (vacancy.company?.length > 1) pts += 3;
  if (!/outsource|body.?leas|no.?name/i.test(vacancy.company ?? '')) pts += 2;
  return Math.min(pts, 10);
}

// ── CLI ───────────────────────────────────────────────────────────────────────

function parseNamedArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith('--')) out[argv[i].slice(2)] = argv[++i];
  }
  return out;
}

const args = parseNamedArgs(process.argv);

if (!args.vacancy) {
  process.stderr.write("Usage: score.mjs --profile <path> --vacancy '<json>'\n");
  process.exit(1);
}

const profilePath = args.profile
  ? (args.profile.startsWith('~') ? join(homedir(), args.profile.slice(1)) : args.profile)
  : join(homedir(), '.config', 'job-hunter', 'profile.yaml');

const profile = yaml.load(readFileSync(profilePath, 'utf8'));
const vacancy = JSON.parse(args.vacancy);

const breakdown = {
  skills:    skillOverlap(profile.skills, vacancy.stack),
  salary:    salaryScore(profile.salary_min, vacancy),
  location:  locationScore(profile.location, vacancy),
  seniority: seniorityScore(profile.title, vacancy),
  company:   companyScore(vacancy),
};
const score = Object.values(breakdown).reduce((a, b) => a + b, 0);

process.stdout.write(JSON.stringify({ score, breakdown }, null, 2) + '\n');
