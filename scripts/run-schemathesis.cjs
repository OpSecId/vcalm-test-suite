#!/usr/bin/env node
/**
 * Run Schemathesis locally using schemathesis.local.cjs / localConfig.cjs.
 *
 * Requires: uvx (https://docs.astral.sh/uv/) or `schemathesis` on PATH.
 *
 *   cp schemathesis.local.example.cjs schemathesis.local.cjs
 *   BASE_URL=http://localhost:40443/id npm run test:schema
 */
const {spawnSync} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

function loadConfig() {
  const tryRequire = file => {
    const p = path.join(ROOT, file);
    if (!fs.existsSync(p)) {
      return null;
    }
    return require(p);
  };

  const local = tryRequire('localConfig.cjs');
  if (local?.schemathesis) {
    return mergeDefaults(local.schemathesis);
  }

  const dedicated = tryRequire('schemathesis.local.cjs');
  if (dedicated) {
    return mergeDefaults(dedicated);
  }

  console.warn('No schemathesis.local.cjs or localConfig.cjs#schemathesis — using example defaults.');
  return mergeDefaults(tryRequire('schemathesis.local.example.cjs'));
}

function mergeDefaults(cfg) {
  const example = require(path.join(ROOT, 'schemathesis.local.example.cjs'));
  return {
    ...example,
    ...cfg,
    run: {...example.run, ...cfg.run},
    auth: {...example.auth, ...cfg.auth},
    profiles: {...example.profiles, ...cfg.profiles},
  };
}

function resolveRunner() {
  const uvx = spawnSync('uvx', ['--version'], {encoding: 'utf8'});
  if (uvx.status === 0) {
    return {cmd: 'uvx', prefix: ['schemathesis']};
  }
  const st = spawnSync('schemathesis', ['--version'], {encoding: 'utf8'});
  if (st.status === 0) {
    return {cmd: 'schemathesis', prefix: []};
  }
  console.error(
    'Schemathesis not found. Install uv and run: uvx schemathesis --version\n' +
    '  https://schemathesis.io/'
  );
  process.exit(1);
}

function main() {
  const cfg = loadConfig();
  const profileName = cfg.profile;
  const profile = cfg.profiles[profileName];
  if (!profile) {
    console.error(`Unknown profile "${profileName}". Available: ${Object.keys(cfg.profiles).join(', ')}`);
    process.exit(1);
  }

  if (!fs.existsSync(cfg.schemaPath)) {
    console.error(`OpenAPI schema not found: ${cfg.schemaPath}\nRun: npm run schema:update-oas`);
    process.exit(1);
  }

  fs.mkdirSync(cfg.run.reportDir, {recursive: true});

  process.env.BASE_URL = cfg.baseUrl;
  if (cfg.auth?.bearerToken) {
    process.env.VCALM_TOKEN = cfg.auth.bearerToken;
  } else {
    process.env.VCALM_TOKEN = process.env.VCALM_TOKEN || '';
  }

  const {cmd, prefix} = resolveRunner();
  const args = [
    ...prefix,
    'run',
    cfg.schemaPath,
    '--url', cfg.baseUrl,
    '-c', 'not_a_server_error,status_code_conformance,response_schema_conformance',
    '-n', String(cfg.run.maxExamples),
    '--request-timeout', String(cfg.run.requestTimeout),
    '--report', 'junit',
    '--report-junit-path', cfg.run.junitPath,
  ];

  if (profile.operationIds?.length) {
    for (const opId of profile.operationIds) {
      args.push('--include-operation-id', opId);
    }
  }

  if (cfg.run?.tlsVerify === false) {
    args.push('--tls-verify=false');
  }

  if (cfg.run?.suppressHealthChecks?.length) {
    for (const check of cfg.run.suppressHealthChecks) {
      args.push('--suppress-health-check', check);
    }
  }

  if (cfg.auth?.enabled && cfg.auth.bearerToken) {
    args.push('-H', `Authorization: Bearer ${cfg.auth.bearerToken}`);
  }

  console.log('Schemathesis VCALM schema tests');
  console.log('  base URL :', cfg.baseUrl);
  console.log('  schema   :', cfg.schemaPath);
  console.log('  profile  :', profileName, profile.description ? `— ${profile.description}` : '');
  console.log('  command  :', [cmd, ...args].join(' '));
  console.log('');

  const result = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: 'utf8',
    env: {...process.env},
  });

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  writeRunMeta(cfg, profileName, result.stdout || '');
  renderHtmlReport();

  process.exit(result.status ?? 1);
}

function writeRunMeta(cfg, profileName, stdout) {
  const seedMatch = stdout.match(/Seed:\s+(\S+)/);
  const casesMatch = stdout.match(/(\d+)\s+generated,\s+(\d+)\s+passed/);
  const warnings = [];
  const warnBlock = stdout.match(/Schema validation mismatch:[\s\S]*?(?=\n\n|$)/);
  if (warnBlock) {
    for (const line of warnBlock[0].split('\n')) {
      const trimmed = line.replace(/\u001b\[[0-9;]*m/g, '').trim();
      if (trimmed.startsWith('- POST ')) {
        warnings.push(trimmed.slice(2));
      }
    }
  }

  const meta = {
    generatedAt: new Date().toISOString(),
    baseUrl: cfg.baseUrl,
    profile: profileName,
    seed: seedMatch?.[1] || '',
    warnings,
    summary: {
      generatedCases: casesMatch ? Number(casesMatch[1]) : null,
      passedCases: casesMatch ? Number(casesMatch[2]) : null,
    },
  };

  fs.writeFileSync(
    path.join(cfg.run.reportDir, 'run-meta.json'),
    `${JSON.stringify(meta, null, 2)}\n`
  );
}

function renderHtmlReport() {
  const render = path.join(__dirname, 'render-schemathesis-report.cjs');
  spawnSync(process.execPath, [render], {cwd: ROOT, stdio: 'inherit'});
}

main();
