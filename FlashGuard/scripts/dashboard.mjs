// Builds a visual dashboard from docs/RTM.csv (and docs/Coverage-Analysis.md) -> docs/Coverage-Dashboard.html
// Usage: node scripts/rtm.mjs ; node scripts/dashboard.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const csvPath = path.join(root, 'docs', 'RTM.csv');
if (!fs.existsSync(csvPath)) { console.error('docs/RTM.csv not found. Run: node scripts/rtm.mjs'); process.exit(1); }

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

const rows = parseCsv(fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, ''));
const head = rows.shift().map((h) => h.trim().toLowerCase());
const col = (re) => head.findIndex((h) => re.test(h));
const iReq = col(/^requirement/), iId = col(/^test id/), iLayer = col(/^test type|layer/), iPri = col(/^priority/), iStat = col(/^status/);
if ([iReq, iId, iLayer, iPri, iStat].some((i) => i < 0)) { console.error('Unexpected RTM.csv columns:', head.join(' | ')); process.exit(1); }

const REQS = Array.from({ length: 10 }, (_, i) => `FR-${String(i + 1).padStart(3, '0')}`);
const norm = (s) => (/pass/i.test(s) ? 'Pass' : /fail/i.test(s) ? 'Fail' : 'Not run');
const tests = new Map();
const byReq = new Map(REQS.map((r) => [r, new Set()]));
for (const r of rows) {
  const id = (r[iId] || '').trim();
  const fr = (r[iReq] || '').trim();
  if (!id || /not covered/i.test(r.join(' '))) continue;
  if (!tests.has(id)) tests.set(id, { id, layer: (r[iLayer] || 'other').trim().toLowerCase(), pri: (r[iPri] || '').trim().toUpperCase(), status: norm(r[iStat] || '') });
  if (byReq.has(fr)) byReq.get(fr).add(id);
}
const all = [...tests.values()];
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const TARGET = 85;

let discovered = all.length, unmapped = 0;
const covPath = path.join(root, 'docs', 'Coverage-Analysis.md');
if (fs.existsSync(covPath)) {
  const m = fs.readFileSync(covPath, 'utf8').match(/Test cases found:\*\*\s*(\d+)\s*\((\d+) not yet mapped/);
  if (m) { discovered = Number(m[1]); unmapped = Number(m[2]); }
}

const covered = REQS.filter((r) => byReq.get(r).size > 0);
const uncovered = REQS.filter((r) => byReq.get(r).size === 0);
const reqStat = (r) => {
  const t = [...byReq.get(r)].map((id) => tests.get(id));
  return { tests: t.length, pass: t.filter((x) => x.status === 'Pass').length, fail: t.filter((x) => x.status === 'Fail').length, notRun: t.filter((x) => x.status === 'Not run').length };
};
const fullyPassing = REQS.filter((r) => { const s = reqStat(r); return s.tests > 0 && s.pass === s.tests; });

const LAYERS = [['ui', 'UI'], ['api', 'API'], ['db', 'Database'], ['mobile', 'Mobile'], ['e2e', 'End-to-end'], ['other', 'Process checks']];
const layerStat = (k) => {
  const t = all.filter((x) => (LAYERS.some(([l]) => l === x.layer) ? x.layer : 'other') === k);
  const executed = t.filter((x) => x.status !== 'Not run').length;
  return { total: t.length, executed, passed: t.filter((x) => x.status === 'Pass').length, notRun: t.length - executed };
};

const tone = (p, target = TARGET) => (p >= target ? 'good' : p >= 60 ? 'warn' : 'bad');
const card = (label, value, sub, t = '') => `<div class="card"><div class="label">${label}</div><div class="value ${t}">${value}</div><div class="sub">${sub}</div></div>`;

const covPct = pct(covered.length, REQS.length);
const passPct = pct(fullyPassing.length, REQS.length);
const layerCards = LAYERS.map(([k, name]) => [k, name, layerStat(k)]).filter(([, , s]) => s.total > 0)
  .map(([, name, s]) => card(`${name} results`, `${s.passed} / ${s.executed}`, `Passed / executed${s.notRun ? ` &middot; ${s.notRun} not run` : ''}`, s.executed ? tone(pct(s.passed, s.executed), 95) : 'warn')).join('');

const riskRows = ['P0', 'P1', 'P2', 'P3'].map((p) => {
  const t = all.filter((x) => x.pri === p), ex = t.filter((x) => x.status !== 'Not run').length, ps = t.filter((x) => x.status === 'Pass').length;
  return `<tr><td>${p}</td><td>${t.length}</td><td>${ex}</td><td>${ps}</td><td>${ex ? pct(ps, ex) + '%' : '-'}</td></tr>`;
}).join('');

const reqRows = REQS.map((r) => {
  const s = reqStat(r);
  const chip = s.tests === 0 ? '<span class="chip bad">Not covered</span>' : s.fail ? '<span class="chip bad">Failing</span>' : s.notRun ? '<span class="chip warn">Not run</span>' : '<span class="chip good">All pass</span>';
  return `<tr><td>${r}</td><td>${s.tests}</td><td>${s.pass}</td><td>${s.fail}</td><td>${s.notRun}</td><td>${chip}</td></tr>`;
}).join('');

const headline = uncovered.length
  ? `${covered.length} of ${REQS.length} requirements have at least one test. ${uncovered.join(', ')} ${uncovered.length === 1 ? 'has' : 'have'} none.`
  : `All ${REQS.length} requirements have at least one test.`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>FlashGuard Coverage Dashboard</title>
<style>
:root{--bg:#ffffff;--card:#ffffff;--border:#e5e7eb;--text:#1f2937;--muted:#6b7280;--good:#15803d;--warn:#b45309;--bad:#dc2626;--chip-good:#dcfce7;--chip-warn:#fef3c7;--chip-bad:#fee2e2}
@media (prefers-color-scheme:dark){:root{--bg:#111827;--card:#1f2937;--border:#374151;--text:#f3f4f6;--muted:#9ca3af;--good:#4ade80;--warn:#fbbf24;--bad:#f87171;--chip-good:#14532d;--chip-warn:#78350f;--chip-bad:#7f1d1d}}
body{margin:0;padding:24px;background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;line-height:1.5}
main{max-width:980px;margin:0 auto}
h1{font-size:22px;margin:0 0 4px}h2{font-size:16px;margin:28px 0 10px}
.muted{color:var(--muted);font-size:13px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-top:14px}
.card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px}
.label{color:var(--muted);font-size:13px}.value{font-size:30px;font-weight:600;margin:4px 0}.sub{color:var(--muted);font-size:13px}
.good{color:var(--good)}.warn{color:var(--warn)}.bad{color:var(--bad)}
.wrap{overflow-x:auto}
table{border-collapse:collapse;width:100%;font-size:14px}
th,td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--border)}th{color:var(--muted);font-weight:500}
.chip{padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600}
.chip.good{background:var(--chip-good);color:var(--good)}.chip.warn{background:var(--chip-warn);color:var(--warn)}.chip.bad{background:var(--chip-bad);color:var(--bad)}
</style></head><body><main>
<h1>FlashGuard coverage dashboard</h1>
<div class="muted">Generated ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC from docs/RTM.csv</div>
<p>${headline}</p>
<div class="grid">
${card('Requirement coverage', covPct + '%', `${covered.length} of ${REQS.length} requirements (target ${TARGET}%)`, tone(covPct))}
${card('Tests discovered', discovered, unmapped ? `${unmapped} not mapped to a requirement` : `All ${discovered} mapped`, unmapped ? 'warn' : '')}
${card('Requirements fully passing', `${fullyPassing.length} / ${REQS.length}`, 'All mapped tests pass', tone(passPct, 95))}
${layerCards}
</div>
<h2>Requirements</h2>
<div class="wrap"><table><tr><th>Requirement</th><th>Tests</th><th>Passed</th><th>Failed</th><th>Not run</th><th>Status</th></tr>${reqRows}</table></div>
<h2>By risk level</h2>
<div class="wrap"><table><tr><th>Priority</th><th>Tests</th><th>Executed</th><th>Passed</th><th>Pass rate</th></tr>${riskRows}</table></div>
<p class="muted">Targets: requirement coverage at least ${TARGET}%, pass rate at least 95%. Pass rate is passed divided by executed.</p>
</main></body></html>`;

fs.writeFileSync(path.join(root, 'docs', 'Coverage-Dashboard.html'), html, 'utf8');
console.log(`Written: docs/Coverage-Dashboard.html  (coverage ${covPct}%, ${all.length} tests in RTM)`);