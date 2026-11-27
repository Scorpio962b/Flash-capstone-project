
// Evidence checks for requirements that are process-based, not app features.
// Writes results/process/junit.xml so scripts/rtm.mjs can mark them Pass or Fail.
// Usage: node scripts/process-checks.mjs

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const repoRoot = path.resolve(root, '..');

const exists = (p) => fs.existsSync(path.join(root, p));
const read = (p) => (exists(p) ? fs.readFileSync(path.join(root, p), 'utf8') : '');

const checks = [];
const add = (id, title, problems) => checks.push({ id, title, problems });

// TC-801 / FR-008: GitHub Actions pipeline
{
  const problems = [];
  const wfDir = path.join(repoRoot, '.github', 'workflows');

  const files = fs.existsSync(wfDir)
    ? fs.readdirSync(wfDir).filter((f) => /\.ya?ml$/i.test(f))
    : [];

  if (!files.length) {
    problems.push('no workflow file in repository .github/workflows');
  }

  const wf = files
    .map((f) => fs.readFileSync(path.join(wfDir, f), 'utf8'))
    .join('\n');

  if (files.length) {
    if (!/^\s*push:/m.test(wf)) {
      problems.push('workflow does not trigger on push');
    }

    for (const job of ['ui', 'api', 'db', 'mobile']) {
      if (!new RegExp(`^  ${job}:`, 'm').test(wf)) {
        problems.push(`no "${job}" job`);
      }
    }

    const timeouts = [...wf.matchAll(/timeout-minutes:\s*(\d+)/g)]
      .map((m) => Number(m[1]));

    if (timeouts.some((n) => n > 30)) {
      problems.push('a job has timeout-minutes above 30');
    }
  }

  const evDir = path.join(root, 'docs', 'evidence');

  const shots = fs.existsSync(evDir)
    ? fs.readdirSync(evDir).filter((f) =>
        /(actions|pipeline|workflow).*\.(png|jpe?g)$/i.test(f)
      )
    : [];

  if (!shots.length) {
    problems.push('no green-run screenshot in docs/evidence');
  }

  add(
    'TC-801',
    'FR-008 GitHub Actions pipeline runs on push with parallel layers (config + green-run screenshot)',
    problems
  );
}

// TC-803 / FR-010: defect log and metrics
{
  const problems = [];

  const log = read('docs/defect-log.csv')
    .split(/\r?\n/)
    .filter((l) => l.trim());

  if (log.length < 2) {
    problems.push('docs/defect-log.csv has no defects');
  } else if (!log[0].toLowerCase().includes('root')) {
    problems.push('defect log has no root cause column');
  }

  const docFiles = exists('docs')
    ? fs.readdirSync(path.join(root, 'docs'))
    : [];

  const metrics = [
    'results/summary.csv',
    ...docFiles
      .filter((f) => /metric/i.test(f))
      .map((f) => `docs/${f}`)
  ].filter(exists);

  if (!metrics.length) {
    problems.push('no metrics file (results/summary.csv or docs/*metrics*)');
  }

  add(
    'TC-803',
    'FR-010 defect log with root causes and metrics (pass/fail counts, execution times)',
    problems
  );
}

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

const cases = checks.map((c) =>
  `<testcase classname="${c.id}" name="${esc(`${c.id} ${c.title}`)}" time="0">${
    c.problems.length
      ? `<failure message="${esc(c.problems.join('; '))}"/>`
      : ''
  }</testcase>`
);

fs.mkdirSync(path.join(root, 'results', 'process'), { recursive: true });

fs.writeFileSync(
  path.join(root, 'results', 'process', 'junit.xml'),
  `<?xml version="1.0" encoding="UTF-8"?><testsuites><testsuite name="process" tests="${checks.length}" failures="${checks.filter((c) => c.problems.length).length}">${cases.join('')}</testsuite></testsuites>`
);

for (const c of checks) {
  console.log(`${c.problems.length ? 'FAIL' : 'PASS'}  ${c.id}  ${c.title}`);

  for (const p of c.problems) {
    console.log(`        - ${p}`);
  }
}

process.exit(checks.some((c) => c.problems.length) ? 1 : 0);
