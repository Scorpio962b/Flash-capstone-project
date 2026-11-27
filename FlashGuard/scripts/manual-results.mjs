// Manual test results -> JUnit XML, so scripts/rtm.mjs can show them.
// 1) node scripts/manual-results.mjs init   creates docs/manual-results.csv (one row per TC-API test file)
// 2) run each test in Postman, then fill Status (Pass or Fail), Tester, Date, Evidence in the CSV
// 3) node scripts/manual-results.mjs        writes results/api-manual/junit.xml
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const csvPath = path.join(root, 'docs', 'manual-results.csv');
const ID_RE = /TC[-_]API[-_]\d+/i;
const normId = (s) => s.toUpperCase().replace(/_/g, '-');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const csvCell = (s) => (/[",\n]/.test(s) ? `"${String(s).replace(/"/g, '""')}"` : String(s));

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules') walk(p, out); } else out.push(p);
  }
  return out;
}

function parseCsv(text) {
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
    else if (c !== '\r') f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim()));
}

if (process.argv[2] === 'init') {
  const found = new Map();
  for (const f of walk(path.join(root, 'tests', 'api'))) {
    const m = path.basename(f).match(ID_RE);
    if (m) found.set(normId(m[0]), path.relative(root, f).split(path.sep).join('/'));
  }
  const existing = fs.existsSync(csvPath) ? parseCsv(fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '')) : [];
  const rows = existing.length ? existing.slice(1) : [];
  const have = new Set(rows.map((r) => normId((r[0] || '').trim())));
  let added = 0;
  for (const [id, file] of found) if (!have.has(id)) { rows.push([id, file, '', '', '', '']); added++; }
  rows.sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }));
  const out = [['Test ID', 'File', 'Status', 'Tester', 'Date', 'Evidence'], ...rows].map((r) => r.map(csvCell).join(',')).join('\n') + '\n';
  fs.mkdirSync(path.dirname(csvPath), { recursive: true });
  fs.writeFileSync(csvPath, out, 'utf8');
  console.log(`docs/manual-results.csv: ${rows.length} tests (${added} added). Fill the Status column with Pass or Fail.`);
  process.exit(0);
}

if (!fs.existsSync(csvPath)) { console.error('docs/manual-results.csv not found. Run: node scripts/manual-results.mjs init'); process.exit(1); }
const rows = parseCsv(fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, ''));
rows.shift();
const cases = []; const bad = []; let pass = 0, fail = 0, blank = 0;
for (const r of rows) {
  const id = normId((r[0] || '').trim());
  if (!id) continue;
  const status = (r[2] || '').trim();
  const name = esc(`${id} manual (tester: ${r[3] || '?'}, date: ${r[4] || '?'}, evidence: ${r[5] || 'none'})`);
  if (/^pass/i.test(status)) { pass++; cases.push(`<testcase classname="${id}" name="${name}" time="0"/>`); }
  else if (/^fail/i.test(status)) { fail++; cases.push(`<testcase classname="${id}" name="${name}" time="0"><failure message="Manual test failed"/></testcase>`); }
  else if (status) bad.push(`${id}: "${status}"`);
  else blank++;
}
const outDir = path.join(root, 'results', 'api-manual');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'junit.xml'),
  `<?xml version="1.0" encoding="UTF-8"?><testsuites><testsuite name="api-manual" tests="${cases.length}" failures="${fail}">${cases.join('')}</testsuite></testsuites>`);
console.log(`Manual API results: ${pass} pass, ${fail} fail, ${blank} not filled in yet -> results/api-manual/junit.xml`);
if (bad.length) console.warn(`Status must be Pass or Fail. Ignored: ${bad.join('; ')}`);