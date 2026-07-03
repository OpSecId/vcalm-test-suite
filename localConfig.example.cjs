// Rename to localConfig.cjs
//
// Two URL conventions (pick one per deployment):
//
// A) Unified gateway — one URL routes by path/body (e.g. credential.ninja).
//    Set every role's `endpoint` to the same BASE_URL.
//
// B) Explicit paths — each role points at the operation URL (typical ACA-Py /
//    instance-per-role setups). Set BASE_URL to the instance root and use the
//    path helpers below.
//
// BASE_URL=http://localhost:40443/my-instance npm test
const baseUrl = process.env.BASE_URL || 'https://credential.ninja';

/** Append VCALM paths when using explicit-path style (B). */
const paths = {
  issue: `${baseUrl}/credentials/issue`,
  verifyVc: `${baseUrl}/credentials/verify`,
  verifyVp: `${baseUrl}/presentations/verify`,
  createPresentation: `${baseUrl}/presentations`,
  updateStatus: `${baseUrl}/credentials/status`,
  workflows: `${baseUrl}/workflows`,
  interactions: `${baseUrl}/interactions`
};

// --- Pattern A: unified gateway (credential.ninja) ---
const endpoint = baseUrl;

// --- Pattern B: explicit paths (uncomment and comment out Pattern A) ---
// const endpoint = null; // unused
// const issuersEndpoint = paths.issue;
// const verifiersEndpoint = paths.verifyVc;
// const vpVerifiersEndpoint = paths.verifyVp;
// const holdersEndpoint = paths.createPresentation;
// const workflowsEndpoint = paths.workflows;

// Optional: Schemathesis settings (npm run test:schema)
// const schemathesis = require('./schemathesis.local.example.cjs');

module.exports = {
  settings: {},
  // schemathesis,
  implementations: [{
    name: 'credential.ninja',
    implementation: 'The VC DOJO',

    // Issuer — §3.2.1 issue (required for §1.3 issuer service)
    issuers: [{
      id: 'did:web:credential.ninja',
      endpoint: endpoint /* or issuersEndpoint */,
      tags: ['VCALM']
    }],

    // Verifier — §3.3.1 verify credential
    verifiers: [{
      endpoint: endpoint /* or verifiersEndpoint */,
      tags: ['VCALM']
    }],

    // Verifier — §3.3.2 verify presentation
    vpVerifiers: [{
      endpoint: endpoint /* or vpVerifiersEndpoint */,
      tags: ['VCALM']
    }],

    // Holder — §3.5.2 create presentation (needed for 3.3.2 VP happy path)
    holders: [{
      endpoint: endpoint /* or holdersEndpoint */,
      tags: ['VCALM']
    }],

    // Workflow — optional; §1.3 holder probes use `probes` when set
    workflows: [{
      endpoint: endpoint /* or workflowsEndpoint */,
      tags: ['VCALM'],
      // probes: {
      //   exchangeProtocols:
      //     `${baseUrl}/workflows/{workflowId}/exchanges/{exchangeId}/protocols`,
      //   participateExchange:
      //     `${baseUrl}/workflows/{workflowId}/exchanges/{exchangeId}`
      // }
    }],

    // Interaction — optional; §3.7.4 GET protocols (skips if not implemented)
    interactions: [{
      endpoint: endpoint /* or paths.interactions */,
      tags: ['VCALM'],
      // probes: {
      //   interactionId: 'urn:uuid:interaction-fixture',
      //   interactionStart:
      //     `${baseUrl}/interactions/urn:uuid:interaction-fixture?iuv=1`
      // }
    }]

    // Status profile (optional): tag issuer entry with VCALM:status and use
    // paths.updateStatus or pathSuffix in §1.3 status smoke test.
    // issuers: [{ endpoint: paths.updateStatus, tags: ['VCALM', 'VCALM:status'] }]
  }]
};
