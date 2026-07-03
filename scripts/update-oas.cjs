#!/usr/bin/env node
/**
 * Pin oas.yaml and the full components/ tree from https://github.com/w3c/vcalm
 * (required for Schemathesis to resolve $ref in the OpenAPI spec).
 */
const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs/schemathesis');
const API = 'https://api.github.com/repos/w3c/vcalm/contents';
const RAW = 'https://raw.githubusercontent.com/w3c/vcalm/main';

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

async function syncDir(remotePath, localPath) {
  const listing = JSON.parse(await get(`${API}/${remotePath}?ref=main`));
  for (const item of listing) {
    const dest = path.join(localPath, item.name);
    if (item.type === 'file') {
      await downloadFile(item.download_url, dest);
      console.log('  ', path.relative(OUT, dest));
    } else if (item.type === 'dir') {
      await syncDir(`${remotePath}/${item.name}`, dest);
    }
  }
}

async function main() {
  fs.mkdirSync(OUT, {recursive: true});
  console.log('Fetching oas.yaml');
  await downloadFile(`${RAW}/oas.yaml`, path.join(OUT, 'oas.yaml'));
  console.log('Fetching components/');
  await syncDir('components', path.join(OUT, 'components'));
  console.log('Done. OpenAPI bundle at', OUT);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
