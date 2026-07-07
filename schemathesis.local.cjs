/**
 * Schemathesis local settings (schema / HTTP-body conformance layer).
 *
 * Copy to schemathesis.local.cjs OR merge the `schemathesis` block into localConfig.cjs.
 * The runner (scripts/run-schemathesis.cjs) loads, in order:
 *   1. localConfig.cjs (if it exports `schemathesis`)
 *   2. schemathesis.local.cjs
 *   3. this example file
 *
 * Share BASE_URL with the Mocha interop suite so both hit the same deployment.
 */
const path = require('node:path');

/** Service root — same host as issuer/verifier endpoints in localConfig.cjs */
const baseUrl = process.env.BASE_URL || 'http://localhost:40443/id';

/** Pinned OpenAPI from https://github.com/w3c/vcalm (update via npm run schema:update-oas) */
const schemaPath = path.join(__dirname, 'docs/schemathesis/oas.yaml');

/**
 * Profiles select which operationIds to fuzz. Default phase1-core matches §1.3
 * minimum issuer + verifier service requirements.
 */
const profiles = {
  'phase1-core': {
    description: '§1.3 minimum — issue, verify credential, verify presentation',
    operationIds: [
      'issueCredential',
      'verifyCredential',
      'verifyPresentation',
    ],
  },
  issuer: {
    description: 'Issuer service surface (§3.2 + status lists)',
    operationIds: [
      'issueCredential',
      'getCredential',
      'deleteCredential',
      'updateCredentialStatus',
      'createStatusList',
      'getStatusList',
    ],
  },
  verifier: {
    description: 'Verifier service surface (§3.3)',
    operationIds: [
      'verifyCredential',
      'verifyPresentation',
      'challenge',
    ],
  },
  holder: {
    description: 'Holder service surface (§3.5)',
    operationIds: [
      'deriveCredential',
      'createPresentation',
      'getPresentation',
      'getPresentations',
      'deletePresentation',
    ],
  },
  workflow: {
    description: 'Workflow / exchange surface (§3.6)',
    operationIds: [
      'createWorkflow',
      'getWorkflowConfiguration',
      'createExchange',
      'getExchangeConfiguration',
      'participateInExchange',
      'getSupportedProtocolsConfiguration',
      'callback',
    ],
  },
  full: {
    description: 'All operations in oas.yaml (slow; may mutate state)',
    operationIds: null,
  },
};

module.exports = {
  /** Passed to schemathesis as --url (overrides servers[] in oas.yaml) */
  baseUrl,

  schemaPath,

  /** Active profile name — override: VCALM_SCHEMA_PROFILE=issuer npm run test:schema */
  profile: process.env.VCALM_SCHEMA_PROFILE || 'phase1-core',

  profiles,

  /**
   * Auth — optional. Leave token empty for unsecured local agents.
   * Schemathesis hooks.py reads VCALM_TOKEN for Authorization: Bearer.
   */
  auth: {
    bearerToken: process.env.VCALM_TOKEN || '',
    /** Set false to skip hooks entirely */
    enabled: process.env.VCALM_SCHEMA_AUTH !== '0',
  },

  /**
   * Local run tuning (maps to CLI flags in scripts/run-schemathesis.cjs).
   * Keep maxExamples low for quick feedback; raise for deeper fuzzing.
   */
  run: {
    maxExamples: Number(process.env.VCALM_SCHEMA_EXAMPLES || 25),
    requestTimeout: Number(process.env.VCALM_SCHEMA_TIMEOUT || 30),
    /** Set false for local HTTPS with self-signed certs */
    tlsVerify: process.env.VCALM_SCHEMA_TLS_VERIFY !== '0' &&
      !/^https:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(
        process.env.BASE_URL || 'http://localhost:40443/id'
      ),
    /** Report directory under reports/ */
    reportDir: path.join(__dirname, 'reports/schemathesis'),
    /** JUnit for CI later */
    junitPath: path.join(__dirname, 'reports/schemathesis/junit.xml'),
    /** hooks.py path */
    hooksPath: path.join(__dirname, 'docs/schemathesis/hooks.py'),
  },
};
