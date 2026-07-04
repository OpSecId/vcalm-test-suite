#!/usr/bin/env node
/**
 * Render a browsable HTML summary from Schemathesis JUnit output.
 *
 *   node scripts/render-schemathesis-report.cjs [junitPath] [outPath]
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const junitPath = path.resolve(
  process.argv[2] || path.join(ROOT, 'reports/schemathesis/junit.xml')
);
const outPath = path.resolve(
  process.argv[3] || path.join(ROOT, 'reports/schemathesis/index.html')
);

function parseJUnit(xml) {
  const suite = {
    tests: 0,
    failures: 0,
    errors: 0,
    skipped: 0,
    time: 0,
    cases: []
  };

  const suiteMatch = xml.match(/<testsuite\b([^>]*)>/);
  if (suiteMatch) {
    for (const attr of ['tests', 'failures', 'errors', 'skipped', 'time']) {
      const m = suiteMatch[1].match(new RegExp(`${attr}="([^"]+)"`));
      if (m) {
        suite[attr] = Number(m[1]);
      }
    }
  }

  const caseRe = /<testcase\b([^>]*)(?:\/>|>([\s\S]*?)<\/testcase>)/g;
  let match;
  while ((match = caseRe.exec(xml)) !== null) {
    const attrs = match[1];
    const body = match[2] || '';
    const name = (attrs.match(/name="([^"]+)"/) || [])[1] || 'unknown';
    const time = Number((attrs.match(/time="([^"]+)"/) || [])[1] || 0);
    const failure = body.includes('<failure');
    const error = body.includes('<error');
    const skipped = body.includes('<skipped');
    let message = '';
    const detailMatch = body.match(/<(?:failure|error)[^>]*>([\s\S]*?)<\/(?:failure|error)>/);
    if (detailMatch) {
      message = detailMatch[1].trim();
    }
    suite.cases.push({name, time, failure, error, skipped, message});
  }

  return suite;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function statusFor(testCase) {
  if (testCase.skipped) {
    return 'skipped';
  }
  if (testCase.failure || testCase.error) {
    return 'failed';
  }
  return 'passed';
}

function main() {
  if (!fs.existsSync(junitPath)) {
    console.error(`JUnit report not found: ${junitPath}`);
    process.exit(1);
  }

  const metaPath = path.join(path.dirname(junitPath), 'run-meta.json');
  const meta = fs.existsSync(metaPath) ?
    JSON.parse(fs.readFileSync(metaPath, 'utf8')) :
    {};

  const suite = parseJUnit(fs.readFileSync(junitPath, 'utf8'));
  const generatedAt = meta.generatedAt || new Date().toISOString();
  const baseUrl = meta.baseUrl || process.env.BASE_URL || '(unknown)';
  const profile = meta.profile || process.env.VCALM_SCHEMA_PROFILE || 'phase1-core';
  const seed = meta.seed || '';
  const warnings = Array.isArray(meta.warnings) ? meta.warnings : [];
  const summary = meta.summary || {};
  const passed = suite.failures === 0 && suite.errors === 0;

  const rows = suite.cases.map(testCase => {
    const status = statusFor(testCase);
    return `
      <tr class="${status}">
        <td>${escapeHtml(testCase.name)}</td>
        <td><span class="badge ${status}">${status}</span></td>
        <td>${testCase.time.toFixed(2)}s</td>
        <td>${testCase.message ? `<pre>${escapeHtml(testCase.message)}</pre>` : '—'}</td>
      </tr>`;
  }).join('');

  const warningItems = warnings.length ?
    warnings.map(item => `<li>${escapeHtml(item)}</li>`).join('') :
    '<li>No warnings recorded.</li>';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>VCALM Schemathesis Report</title>
  <style>
    :root {
      color-scheme: light dark;
      --bg: #0f1419;
      --panel: #1a2332;
      --text: #e7ecf3;
      --muted: #9aa7b8;
      --pass: #3ecf8e;
      --fail: #ff6b6b;
      --warn: #f0b429;
      --skip: #8b9bb4;
      --border: #2b3648;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font: 15px/1.5 "IBM Plex Sans", "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--text);
    }
    main { max-width: 1100px; margin: 0 auto; padding: 2rem 1.25rem 3rem; }
    h1 { margin: 0 0 0.25rem; font-size: 1.75rem; }
    .subtitle { color: var(--muted); margin-bottom: 1.5rem; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 1rem 1.1rem;
    }
    .card .label { color: var(--muted); font-size: 0.85rem; }
    .card .value { font-size: 1.35rem; font-weight: 600; margin-top: 0.2rem; }
    .overall.pass .value { color: var(--pass); }
    .overall.fail .value { color: var(--fail); }
    table {
      width: 100%;
      border-collapse: collapse;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
    }
    th, td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid var(--border);
      text-align: left;
      vertical-align: top;
    }
    th { color: var(--muted); font-weight: 600; font-size: 0.85rem; }
    tr:last-child td { border-bottom: 0; }
    .badge {
      display: inline-block;
      padding: 0.15rem 0.55rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge.passed { background: rgba(62, 207, 142, 0.15); color: var(--pass); }
    .badge.failed { background: rgba(255, 107, 107, 0.15); color: var(--fail); }
    .badge.skipped { background: rgba(139, 155, 180, 0.15); color: var(--skip); }
    pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
      font: 12px/1.45 ui-monospace, SFMono-Regular, Menlo, monospace;
      color: #ffd8d8;
    }
    section { margin-top: 1.75rem; }
    section h2 { font-size: 1.1rem; margin: 0 0 0.75rem; }
    ul { margin: 0; padding-left: 1.2rem; color: var(--muted); }
    footer { margin-top: 2rem; color: var(--muted); font-size: 0.85rem; }
    a { color: #7db7ff; }
  </style>
</head>
<body>
  <main>
    <h1>VCALM Schemathesis Report</h1>
    <p class="subtitle">OpenAPI schema conformance against pinned <code>oas.yaml</code></p>

    <div class="grid">
      <div class="card overall ${passed ? 'pass' : 'fail'}">
        <div class="label">Overall</div>
        <div class="value">${passed ? 'Passed' : 'Failed'}</div>
      </div>
      <div class="card">
        <div class="label">Operations tested</div>
        <div class="value">${suite.tests}</div>
      </div>
      <div class="card">
        <div class="label">Generated cases</div>
        <div class="value">${summary.generatedCases ?? '—'}</div>
      </div>
      <div class="card">
        <div class="label">Duration</div>
        <div class="value">${suite.time.toFixed(1)}s</div>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="label">Base URL</div>
        <div class="value" style="font-size:1rem">${escapeHtml(baseUrl)}</div>
      </div>
      <div class="card">
        <div class="label">Profile</div>
        <div class="value" style="font-size:1rem">${escapeHtml(profile)}</div>
      </div>
      <div class="card">
        <div class="label">Seed</div>
        <div class="value" style="font-size:0.95rem; word-break:break-all">${escapeHtml(seed || '—')}</div>
      </div>
      <div class="card">
        <div class="label">Generated</div>
        <div class="value" style="font-size:1rem">${escapeHtml(generatedAt)}</div>
      </div>
    </div>

    <section>
      <h2>Operations</h2>
      <table>
        <thead>
          <tr>
            <th>Operation</th>
            <th>Status</th>
            <th>Time</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </section>

    <section>
      <h2>Warnings</h2>
      <ul>${warningItems}</ul>
    </section>

    <footer>
      Machine-readable report: <a href="junit.xml">junit.xml</a>
    </footer>
  </main>
</body>
</html>`;

  fs.mkdirSync(path.dirname(outPath), {recursive: true});
  fs.writeFileSync(outPath, html);
  console.log(`Wrote ${outPath}`);
}

main();
