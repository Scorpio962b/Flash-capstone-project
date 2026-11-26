// Pass rate, flakiness and execution-time metrics from JUnit XML (no extra packages needed).
// Usage:  node scripts/qa-metrics.mjs              -> reads results/history/* (or results/<layer> if no history)
//         node scripts/qa-metrics.mjs --enforce    -> exit 1 if pass rate < 95% or flakiness >= 5%
// Output: results/metrics/metrics.md, metrics.json, tests.csv
import fs from 'node:fs';
import path from 'node:path';

const PASS_TARGET = 95;  // %
const FLAKY_LIMIT = 5;   // %
const LAYERS = ['lint', 'ui', 'e2e', 'api', 'db', 'mobile', 'zap'];
const root = process.cwd();
const resultsDir = path.join(root, 'results');
const outDir = path.join(resultsDir, 'metrics');
const enforce = process.argv.includes('--enforce');

const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
const attrs = (s) => Object.fromEntries([...s.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1], decode(m[2])]));
const xmlFiles = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.xml')).map((f) => path.join(dir, f)) : []);

function parseJUnit(file) {
  const xml = fs.readFileSync(file, 'utf8');
  const cases = [];
  for (const m of xml.matchAll(/<testcase\b([^>]*?)(?:\/>|>([\s\S]*?)<\/testcase>)/g)) {
    const a = attrs(m[1]);
    const body = m[2] || '';
    const status = /<(failure|error)\b/.test(body) ? 'failed' : /<skipped\b/.test(body) ? 'skipped' : 'passed';
    cases.push({ id: `${a.classname || ''} :: ${a.name || ''}`, name: a.name || '', time: parseFloat(a.time || '0') || 0, status });
  }
  return cases;
}

// Collect runs: results/history/<run>/<layer>/*.xml, or fall back to results/<layer>/*.xml as one run
const runs = [];
const historyDir = path.join(resultsDir, 'history');
if (fs.existsSync(historyDir)) {
  for (const run of fs.readdirSync(historyDir).sort()) {
    for (const layer of LAYERS) {
      for (const f of xmlFiles(path.join(historyDir, run, layer))) runs.push({ run, layer, cases: parseJUnit(f) });
    }
  }
}
if (runs.length === 0) {
  for (const layer of LAYERS) for (const f of xmlFiles(path.join(resultsDir, layer))) runs.push({ run: 'latest', layer, cases: parseJUnit(f) });
}
if (runs.length === 0) { console.error('No JUnit XML found in results/. Run the tests first.'); process.exit(2); }

// Aggregate per layer and per test
const layers = {};
for (const { run, layer, cases } of runs) {
  const L = (layers[layer] ??= { runs: new Set(), passed: 0, failed: 0, skipped: 0, time: 0, tests: {} });
  L.runs.add(run);
  for (const c of cases) {
    L[c.status]++; L.time += c.time;
    const t = (L.tests[c.id] ??= { name: c.name, passed: 0, failed: 0, skipped: 0, time: 0 });
    t[c.status]++; t.time += c.time;
  }
}

const pct = (a, b) => (b === 0 ? 0 : Math.round((a / b) * 1000) / 10);
const summary = {};
let allPassed = 0, allExecuted = 0, allTests = 0, allFlaky = 0;
const csv = ['layer,test,passed,failed,skipped,flaky,avg_time_s'];
const failedList = [];
for (const [layer, L] of Object.entries(layers)) {
  const tests = Object.entries(L.tests);
  const flaky = tests.filter(([, t]) => t.passed > 0 && t.failed > 0);
  const executed = L.passed + L.failed;
  summary[layer] = {
    runs: L.runs.size, tests: tests.length, executions: executed + L.skipped,
    passed: L.passed, failed: L.failed, skipped: L.skipped,
    passRate: pct(L.passed, executed), flakyTests: flaky.length, flakiness: pct(flaky.length, tests.length),
    totalTimeS: Math.round(L.time * 10) / 10,
    flakyNames: flaky.map(([id]) => id),
  };
  allPassed += L.passed; allExecuted += executed; allTests += tests.length; allFlaky += flaky.length;
  for (const [id, t] of tests) {
    const runsForTest = t.passed + t.failed + t.skipped;
    csv.push([layer, `"${id.replace(/"/g, '""')}"`, t.passed, t.failed, t.skipped, t.passed > 0 && t.failed > 0, (t.time / Math.max(runsForTest, 1)).toFixed(2)].join(','));
    if (t.failed > 0 && t.passed === 0) failedList.push(`${layer}: ${id}`);
  }
}
const overall = { passRate: pct(allPassed, allExecuted), flakiness: pct(allFlaky, allTests), tests: allTests, executions: allExecuted };
const meetsPass = overall.passRate >= PASS_TARGET;
const meetsFlaky = overall.flakiness < FLAKY_LIMIT;

// Markdown report
const md = [];
md.push('# Test execution metrics', '', `Generated: ${new Date().toISOString()}`, '');
md.push(`**Overall pass rate:** ${overall.passRate}% (target >= ${PASS_TARGET}%) ${meetsPass ? 'PASS' : 'FAIL'}  `);
md.push(`**Overall flakiness:** ${overall.flakiness}% (target < ${FLAKY_LIMIT}%) ${meetsFlaky ? 'PASS' : 'FAIL'}`, '');
md.push('| Layer | Runs | Tests | Passed | Failed | Skipped | Pass rate | Flaky tests | Flakiness | Total time (s) |');
md.push('|---|---|---|---|---|---|---|---|---|---|');
for (const [layer, s] of Object.entries(summary)) {
  md.push(`| ${layer} | ${s.runs} | ${s.tests} | ${s.passed} | ${s.failed} | ${s.skipped} | ${s.passRate}% | ${s.flakyTests} | ${s.flakiness}% | ${s.totalTimeS} |`);
}
md.push('', '## Flaky tests (passed in some runs, failed in others)', '');
const flakyAll = Object.entries(summary).flatMap(([l, s]) => s.flakyNames.map((n) => `- ${l}: ${n}`));
md.push(...(flakyAll.length ? flakyAll : ['None']));
md.push('', '## Consistently failing tests (log these in docs/defect-log.csv)', '');
md.push(...(failedList.length ? failedList.map((f) => `- ${f}`) : ['None']));

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'metrics.md'), md.join('\n') + '\n');
fs.writeFileSync(path.join(outDir, 'metrics.json'), JSON.stringify({ overall, layers: summary }, null, 2));
fs.writeFileSync(path.join(outDir, 'tests.csv'), csv.join('\n') + '\n');
console.log(md.join('\n'));
console.log(`\nWritten to ${outDir}`);
if (enforce && !(meetsPass && meetsFlaky)) process.exit(1);
