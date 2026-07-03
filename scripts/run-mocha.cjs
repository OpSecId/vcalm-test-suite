'use strict';

const fs = require('node:fs');
const path = require('node:path');
const Mocha = require('mocha');

const root = path.join(__dirname, '..');

function collectJsFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectJsFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(full);
    }
  }
  return files;
}

const w3cReporterOptions = {
  abstract: path.join(root, 'abstract.hbs'),
  reportDir: path.join(root, 'reports'),
  respec: path.join(root, 'respecConfig.json'),
  suiteLog: path.join(root, 'suite.log'),
  templateData: path.join(root, 'reports/index.json'),
  title: 'VCALM Interoperability Report',
};

const mocha = new Mocha({
  timeout: 15000,
  preserveSymlinks: true,
  reporter: 'allure-mocha',
  reporterOptions: {
    resultsDir: path.join(root, 'allure-results'),
    extraReporters: [
      ['@digitalbazaar/mocha-w3c-interop-reporter', w3cReporterOptions],
    ],
  },
});

collectJsFiles(path.join(root, 'tests')).forEach(file => mocha.addFile(file));

mocha.loadFilesAsync()
  .then(() => mocha.run(failures => process.exit(failures ? 1 : 0)))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
