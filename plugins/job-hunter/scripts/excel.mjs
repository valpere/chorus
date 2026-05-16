#!/usr/bin/env node
import { readFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import ExcelJS from 'exceljs';

const DEFAULT_FILE = join(homedir(), '.config', 'job-hunter', 'applications.xlsx');

const COLUMNS = [
  { header: 'Date',              key: 'date',              width: 12 },
  { header: 'Platform',         key: 'platform',          width: 12 },
  { header: 'URL',              key: 'url',               width: 50 },
  { header: 'Title',            key: 'title',             width: 35 },
  { header: 'Company',          key: 'company',           width: 25 },
  { header: 'Salary',           key: 'salary',            width: 15 },
  { header: 'Score',            key: 'score',             width: 8  },
  { header: 'Skills Breakdown', key: 'skill_breakdown',   width: 40 },
  { header: 'Status',           key: 'status',            width: 12 },
  { header: 'Cover Letter Sent',key: 'cover_letter_sent', width: 18 },
  { header: 'Notes',            key: 'notes',             width: 40 },
];

function resolveFile(p) {
  if (!p) return DEFAULT_FILE;
  return p.startsWith('~') ? join(homedir(), p.slice(1)) : p;
}

function parseNamedArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const val = argv[i + 1];
      out[argv[i].slice(2)] = (val === undefined || val.startsWith('--')) ? true : argv[++i];
    }
  }
  return out;
}

async function appendRows(file, rows) {
  mkdirSync(dirname(file), { recursive: true });
  const wb = new ExcelJS.Workbook();
  try { await wb.xlsx.readFile(file); } catch { /* new file, start empty */ }

  let ws = wb.getWorksheet('Applications');
  if (!ws) {
    ws = wb.addWorksheet('Applications');
    ws.columns = COLUMNS;
    ws.getRow(1).font = { bold: true };
    ws.getRow(1).fill = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: 'FFD9EAD3' },
    };
  } else {
    // Restore column keys lost when reading from file; required for addRow({key: val}) to work
    COLUMNS.forEach((col, i) => { ws.getColumn(i + 1).key = col.key; });
  }

  for (const row of rows) ws.addRow(row);
  await wb.xlsx.writeFile(file);
  process.stdout.write(`Appended ${rows.length} row(s) to ${file}\n`);
}

async function readRows(file, last) {
  const wb = new ExcelJS.Workbook();
  try { await wb.xlsx.readFile(file); } catch { process.stdout.write('[]\n'); return; }

  const ws = wb.getWorksheet('Applications');
  if (!ws) { process.stdout.write('[]\n'); return; }

  const rows = [];
  ws.eachRow({ includeEmpty: false }, (row, idx) => {
    if (idx === 1) return; // skip header
    rows.push({
      date:              row.getCell(1).value,
      platform:         row.getCell(2).value,
      url:              row.getCell(3).value,
      title:            row.getCell(4).value,
      company:          row.getCell(5).value,
      salary:           row.getCell(6).value,
      score:            row.getCell(7).value,
      skill_breakdown:  row.getCell(8).value,
      status:           row.getCell(9).value,
      cover_letter_sent:row.getCell(10).value,
      notes:            row.getCell(11).value,
    });
  });

  const result = last ? rows.slice(-last) : rows;
  process.stdout.write(JSON.stringify(result) + '\n');
}

const [, , command] = process.argv;
const args = parseNamedArgs(process.argv);
const file = resolveFile(args.file);

if (command === 'append') {
  const rowsJson = args.rows ?? readFileSync(0, 'utf8');
  await appendRows(file, JSON.parse(rowsJson));
} else if (command === 'read') {
  await readRows(file, args.last ? parseInt(args.last, 10) : undefined);
} else {
  process.stderr.write(`Unknown command: ${command}\n`);
  process.stderr.write('Usage: excel.mjs <append|read> --file <path> [--rows \'<json>\'|--last <N>]\n');
  process.exit(1);
}
