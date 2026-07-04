#!/usr/bin/env node
/**
 * Pin oas.yaml and the components/ tree from the published VCALM OpenAPI bundle.
 *
 * Canonical source: https://w3c.github.io/vcalm/oas.yaml
 * (same content as https://github.com/w3c/vcalm — required for local $ref resolution).
 */
const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');
const SwaggerParser = require('@apidevtools/swagger-parser');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs/schemathesis');
const CANONICAL_BASE = 'https://w3c.github.io/vcalm';
const OAS_URL = `${CANONICAL_BASE}/oas.yaml`;
const GITHUB_API = 'https://api.github.com/repos/w3c/vcalm/contents';

function get(url) {
  return new Promise((resolve, reject) => {
    const opts = new URL(url);
    opts.headers = {'User-Agent': 'vcalm-test-suite'};
    https.get(opts, res => {
      let body = '';
      res.on('data', c => { body += c; });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`${url} -> ${res.statusCode}`));
          return;
        }
        resolve(body);
      });
    }).on('error', reject);
  });
}

async function downloadFile(url, dest) {
  fs.mkdirSync(path.dirname(dest), {recursive: true});
  const data = await get(url);
  fs.writeFileSync(dest, data);
}

async function syncDirFromGithub(remotePath, localPath) {
  const listing = JSON.parse(await get(`${GITHUB_API}/${remotePath}?ref=main`));
  for (const item of listing) {
    const dest = path.join(localPath, item.name);
    if (item.type === 'file') {
      const publishedUrl = `${CANONICAL_BASE}/${remotePath}/${item.name}`;
      try {
        await downloadFile(publishedUrl, dest);
      } catch {
        await downloadFile(item.download_url, dest);
      }
      console.log('  ', path.relative(OUT, dest));
    } else if (item.type === 'dir') {
      await syncDirFromGithub(`${remotePath}/${item.name}`, dest);
    }
  }
}

function patchOasForLocalValidation(oasPath) {
  const securityPath = path.join(path.dirname(oasPath), 'components/SecuritySchemes.yml');
  if (!fs.existsSync(securityPath)) {
    return;
  }
  const securityYaml = fs.readFileSync(securityPath, 'utf8');
  const match = securityYaml.match(
    /securitySchemes:\n([\s\S]*?)(?:\n\S|\s*$)/
  );
  if (!match) {
    return;
  }
  const schemes = match[1]
    .split('\n')
    .map(line => line.replace(/^ {2}/, '    '))
    .join('\n');
  let oas = fs.readFileSync(oasPath, 'utf8');
  const replaced = oas.replace(
    /  securitySchemes:\n    \$ref: "\.\/components\/SecuritySchemes\.yml#\/components\/securitySchemes"/,
    `  securitySchemes:\n${schemes}`.trimEnd()
  );
  if (replaced !== oas) {
    fs.writeFileSync(oasPath, replaced);
    console.log('  patched securitySchemes $ref for local OpenAPI validators');
  }
  oas = fs.readFileSync(oasPath, 'utf8');
  const serversPatched = oas.replace(
    /servers:\n(?:  - url: [^\n]+\n(?:    [^\n]+\n)*)/,
    'servers:\n  - url: /\n    description: VCALM service root (overridden per implementation)\n'
  );
  if (serversPatched !== oas) {
    fs.writeFileSync(oasPath, serversPatched);
    console.log('  patched servers[] for path-relative OpenAPI validators');
  }
}

async function bundleOasForValidators(oasPath) {
  const bundledPath = path.join(path.dirname(oasPath), 'oas.bundled.json');
  const api = await SwaggerParser.bundle(oasPath);
  fs.writeFileSync(bundledPath, `${JSON.stringify(api, null, 2)}\n`);
  console.log('  wrote', path.relative(ROOT, bundledPath));
}

async function main() {
  fs.mkdirSync(OUT, {recursive: true});
  console.log('Fetching', OAS_URL);
  const oasPath = path.join(OUT, 'oas.yaml');
  await downloadFile(OAS_URL, oasPath);
  console.log('Fetching components/');
  await syncDirFromGithub('components', path.join(OUT, 'components'));
  patchOasForLocalValidation(oasPath);
  await bundleOasForValidators(oasPath);
  console.log('Done. OpenAPI bundle at', OUT);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
