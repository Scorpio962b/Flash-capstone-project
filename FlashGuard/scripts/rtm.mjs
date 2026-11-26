// Builds the Requirements Traceability Matrix and Coverage Analysis.
// 1. Finds every test case by its ID in the file name (TC-API-01, TC-DB-05, TC_MOB_001, TC-UI-001, TC-E2E-001, TC-01 ...)
// 2. Reads docs/requirements-map.csv  (Test ID, Requirements, Priority)  - created for you on the first run, fill it in
//    Tags inside the files also work: @FR-003 @P0 in a .feature, "-- FR-003 P0" in a .sql, FR-003 in a Postman name/description
// 3. Takes the latest status from the JUnit XML in results\
// Usage:  node scripts/rtm.mjs      Output: docs/RTM.csv, docs/RTM.md, docs/Coverage-Analysis.md
import fs from 'node:fs';
import path from 'node:path';

const REQUIREMENTS = Array.from({ length: 10 }, (_, i) => `FR-${String(i + 1).padStart(3, '0')}`);
const COVERAGE_TARGET = 85;
const root = process.cwd();
const docsDir = path.join(root, 'docs');
const mapFile = path.join(docsDir, 'requirements-map.csv');
const FR_RE = /FR-\d{3}/g;
const P_RE = /(?:^|[^A-Za-z0-9])@?(P[0-3])(?![0-9A-Za-z])/;
const ID_RE = /TC[-_](?:(API|DB|MOB|UI|E2E)[-_])?\d+/i;
const SKIP_DIRS = new Set(['node_modules', '.git', '.idea', 'results', 'reports', 'playwright-report', 'allure-results', 'allure-report', 'test-results', 'dist']);
const TEST_FILE = /\.(feature|sql|json|spec\.ts|test\.ts|spec\.js)$/i;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
const rel = (p) => path.relative(root, p).split(path.sep).join('/');
const layerOf = (f) => (f.match(/^tests\/(api|db|mobile|ui|e2e)\//) || [, 'other'])[1];
const normId = (id) => id.toUpperCase().replace(/_/g, '-');

// --- 1. discover test cases (one per ID; several files with the same ID are merged) ---
const tests = new Map();
for (const file of walk(path.join(root, 'tests')).filter((f) => TEST_FILE.test(f) && !/package(-lock)?\.json$/.test(f))) {
  const r = rel(file);
  const m = path.basename(file).match(ID_RE);
  if (!m) continue;
  const id = normId(m[0]);
  const text = fs.readFileSync(file, 'utf8');
  let title = (text.match(/^\s*Feature:\s*(.+)$/m) || [])[1];
  if (!title && r.endsWith('.json')) { try { title = JSON.parse(text).info?.name; } catch { /* not JSON */ } }
  title = (title || path.basename(file).replace(TEST_FILE, '').replace(ID_RE, '').replace(/^[-_. ]+/, '')).trim();
  const t = tests.get(id) || { id, title, layer: layerOf(r), files: [], frs: new Set(), priority: '' };
  t.files.push(r);
  (text.match(FR_RE) || []).forEach((f) => t.frs.add(f));
  const p = text.match(P_RE); if (p && !t.priority) t.priority = p[1];
  tests.set(id, t);
}

// --- 2. requirements map (create a template on first run) ---
const parseCsvLine = (line) => { const out = []; let cur = '', q = false; for (const ch of line) { if (ch === '"') q = !q; else if (ch === ',' && !q) { out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out.map((s) => s.trim()); };
fs.mkdirSync(docsDir, { recursive: true });
if (!fs.existsSync(mapFile)) {
  const rows = ['Test ID,Title,Layer,Requirements (e.g. FR-001;FR-004),Priority (P0-P3)'];
  for (const t of [...tests.values()].sort((a, b) => a.id.localeCompare(b.id))) rows.push([t.id, `"${t.title.replace(/"/g, '""')}"`, t.layer, [...t.frs].join(';'), t.priority].join(','));
  fs.writeFileSync(mapFile, rows.join('\n') + '\n');
  console.log(`Created ${rel(mapFile)} with ${tests.size} test IDs - fill in Requirements and Priority, then run again.\n`);
}
for (const line of fs.readFileSync(mapFile, 'utf8').split(/\r?\n/).slice(1)) {
  if (!line.trim()) continue;
  const [rawId, , , reqs = '', prio = ''] = parseCsvLine(line);
  const id = normId(rawId || '');
  const t = tests.get(id);
  if (!t) { console.warn(`requirements-map.csv: ${rawId} has no matching test file`); continue; }
  (reqs.match(FR_RE) || []).forEach((f) => t.frs.add(f));
  if (/^P[0-3]$/i.test(prio)) t.priority = prio.toUpperCase();
}

// --- 3. latest status from JUnit (matched on test ID in file name, classname or test name) ---
const statusById = new Map();
const setStatus = (id, s) => { const cur = statusById.get(id); if (cur === 'Failed') return; if (s === 'Failed' || !cur || cur === 'Skipped') statusById.set(id, s); };
for (const f of walk(path.join(root, 'results')).filter((f) => f.endsWith('.xml'))) {
  if (f.includes(`${path.sep}history${path.sep}`)) continue;
  const xml = fs.readFileSync(f, 'utf8');
  const fileId = (path.basename(f).match(ID_RE) || [])[0];
  for (const m of xml.matchAll(/<testcase\b([^>]*?)(?:\/>|>([\s\S]*?)<\/testcase>)/g)) {
    const head = m[1];
    const body = m[2] || '';
    const s = /<(failure|error)\b/.test(body) ? 'Failed' : /<skipped\b/.test(body) ? 'Skipped' : 'Passed';
    const id = (head.match(ID_RE) || [])[0] || fileId;
    if (id) setStatus(normId(id), s);
  }
}
for (const t of tests.values()) { t.status = statusById.get(t.id) || 'Not run'; if (!t.priority) t.priority = 'unset'; }
const all = [...tests.values()].sort((a, b) => a.id.localeCompare(b.id));

// --- RTM ---
const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
const evidence = (t) => (t.status === 'Not run' ? t.files[0] : `results/${t.layer}/`);
const rtmCsv = ['Requirement,Test ID,Test title,Test type (layer),Priority,Status,Evidence,Defect ID'];
const rtmMd = ['# Requirements Traceability Matrix', '', `Generated: ${new Date().toISOString()}`, '', '| Requirement | Test ID | Test title | Layer | Priority | Status | Evidence | Defect ID |', '|---|---|---|---|---|---|---|---|'];
for (const fr of REQUIREMENTS) {
  const linked = all.filter((t) => t.frs.has(fr));
  if (!linked.length) { rtmCsv.push(`${fr},,NOT COVERED,,,,,`); rtmMd.push(`| ${fr} | - | **NOT COVERED** | | | | | |`); }
  for (const t of linked) {
    rtmCsv.push([fr, t.id, esc(t.title), t.layer, t.priority, t.status, esc(evidence(t)), ''].join(','));
    rtmMd.push(`| ${fr} | ${t.id} | ${t.title.replace(/\|/g, '\\|')} | ${t.layer} | ${t.priority} | ${t.status} | ${evidence(t)} | |`);
  }
}

// --- Coverage analysis ---
const pct = (a, b) => (b === 0 ? 0 : Math.round((a / b) * 1000) / 10);
const covered = REQUIREMENTS.filter((fr) => all.some((t) => t.frs.has(fr)));
const allPassing = REQUIREMENTS.filter((fr) => { const l = all.filter((t) => t.frs.has(fr)); return l.length && l.every((t) => t.status === 'Passed'); });
const group = (key) => {
  const g = {};
  for (const t of all) { const v = (g[t[key]] ??= { tests: 0, mapped: 0, passed: 0, failed: 0, notRun: 0, frs: new Set() }); v.tests++; if (t.frs.size) v.mapped++; v[t.status === 'Passed' ? 'passed' : t.status === 'Failed' ? 'failed' : 'notRun']++; t.frs.forEach((f) => v.frs.add(f)); }
  return g;
};
const table = (title, g) => [`## Coverage by ${title}`, '', `| ${title} | Test cases | Mapped to a requirement | Passed | Failed | Not run / skipped | Executed | Pass rate | Requirements |`, '|---|---|---|---|---|---|---|---|---|',
  ...Object.entries(g).sort().map(([k, v]) => `| ${k} | ${v.tests} | ${v.mapped} | ${v.passed} | ${v.failed} | ${v.notRun} | ${pct(v.passed + v.failed, v.tests)}% | ${pct(v.passed, v.passed + v.failed)}% | ${[...v.frs].sort().join(', ')} |`)];
const reqCov = pct(covered.length, REQUIREMENTS.length);
const unmapped = all.filter((t) => !t.frs.size);
const cov = ['# Coverage Analysis', '', `Generated: ${new Date().toISOString()}`, '',
  `**Requirement coverage:** ${covered.length}/${REQUIREMENTS.length} = ${reqCov}% (target >= ${COVERAGE_TARGET}%) ${reqCov >= COVERAGE_TARGET ? 'PASS' : 'FAIL'}  `,
  `**Requirements whose tests all pass:** ${allPassing.length}/${REQUIREMENTS.length} = ${pct(allPassing.length, REQUIREMENTS.length)}%  `,
  `**Test cases found:** ${all.length} (${unmapped.length} not yet mapped to a requirement)`, '',
  ...table('layer', group('layer')), '', ...table('priority', group('priority')), '',
  '## Requirements not covered', '', ...(covered.length === REQUIREMENTS.length ? ['None'] : REQUIREMENTS.filter((r) => !covered.includes(r)).map((r) => `- ${r}`)),
  '', '## Test cases not mapped to a requirement (fill in docs/requirements-map.csv)', '', ...(unmapped.length ? unmapped.map((t) => `- ${t.id} ${t.title} (${t.files[0]})`) : ['None'])];

fs.writeFileSync(path.join(docsDir, 'RTM.csv'), rtmCsv.join('\n') + '\n');
fs.writeFileSync(path.join(docsDir, 'RTM.md'), rtmMd.join('\n') + '\n');
fs.writeFileSync(path.join(docsDir, 'Coverage-Analysis.md'), cov.join('\n') + '\n');
console.log(cov.slice(0, 8).join('\n'));
console.log('\nWritten: docs/RTM.csv, docs/RTM.md, docs/Coverage-Analysis.md');
