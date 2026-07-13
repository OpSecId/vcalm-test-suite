# VCALM Interoperability Test Suite

Interoperability tests for implementations of
[VCALM](https://www.w3.org/TR/vcalm-1.0/) (Verifiable Credential API for
Lifecycle Management).

This branch covers **§1.3 issuer and verifier conformance**: smoke probes plus
the MUST interfaces those classes name (§3.2.1 Issue Credential, §3.3.1 Verify
Credential, §3.3.2 Verify Presentation). Holder / status / workflow §1.3 classes
and the rest of §3.x remain on `feature/vcalm-interop-suite`.

## What's in this repo

| Path | Purpose |
|------|---------|
| [`tests/1.3-Conformance/services.js`](tests/1.3-Conformance/services.js) | §1.3 issuer and verifier probes |
| [`tests/3.2-Issuing/3.2.1-issue-credential.js`](tests/3.2-Issuing/3.2.1-issue-credential.js) | §3.2.1 Issue Credential |
| [`tests/3.3-Verifying/3.3.1-VerifyCredential.js`](tests/3.3-Verifying/3.3.1-VerifyCredential.js) | §3.3.1 Verify Credential |
| [`tests/3.3-Verifying/3.3.2-VerifyPresentation.js`](tests/3.3-Verifying/3.3.2-VerifyPresentation.js) | §3.3.2 Verify Presentation |
| [`tests/service-profiles.js`](tests/service-profiles.js) | Minimum HTTP interfaces per service role |
| [`tests/normative-statements.js`](tests/normative-statements.js) | RFC 2119 strings for Mocha `it()` titles |
| `localConfig.example.cjs` | Implementer endpoint template |
| `abstract.hbs` / `respecConfig.json` | W3C interop report metadata |

## Install

```sh
npm install --legacy-peer-deps
```

## Lint

```sh
npm run lint
```

## Run tests

`npm test` runs Mocha with the glob `tests/*/**/*.js` and the W3C interop
reporter (`abstract.hbs`, `respecConfig.json`). Reports are written under
`reports/`.

```sh
cp localConfig.example.cjs localConfig.cjs
# edit issuers / verifiers endpoints, then:
npm test
```

## Test layout

Mocha loads `tests/*/**/*.js` only; shared helpers at `tests/*.js` are not test
files.

```
tests/
  helpers.js / assertions.js / TestEndpoints.js / …
  1.3-Conformance/          # §1.3 issuer + verifier probes
  3.2-Issuing/              # §3.2.1 only (on this branch)
  3.3-Verifying/            # §3.3.1 + §3.3.2 only (on this branch)
```

## Implementation config

Implementations will be registered in **`localConfig.cjs`** (gitignored). Each
role gets an `endpoint` and **`tags: ['VCALM']`**. Register only what you
implement — tests skip missing pairings (for example, presentation verify needs
both `holders` and `verifiers`).

| Role key | Used for | Typical `endpoint` |
|----------|----------|-------------------|
| `issuers` | Issue credential (§3.2.1) | `…/credentials/issue` or gateway root |
| `verifiers` | Verify VC and VP (§3.3.1–2) | `…/credentials/verify` or gateway root |
| `holders` | Create presentation (§3.5.2) | `…/presentations` or gateway root |
| `workflows` | §3.6 workflows (optional) | `…/workflows` or gateway root |
| `interactions` | §3.7 interaction URL fetch (optional) | gateway root or `…/interactions` |

One `verifiers` entry covers both verify operations. Issuers may set
`options.cryptosuite` to a string or string array (array enables §3.2.4
multi-proof when length ≥ 2).

```javascript
module.exports = {
  implementations: [{
    name: 'My VCALM service',
    implementation: 'Example Corp',
    issuers: [{
      id: 'did:web:example.com',
      endpoint: process.env.BASE_URL || 'https://localhost:8000',
      tags: ['VCALM'],
      options: { cryptosuite: 'eddsa-jcs-2022' }
    }],
    verifiers: [{
      endpoint: process.env.BASE_URL || 'https://localhost:8000',
      tags: ['VCALM']
    }],
    holders: [{
      endpoint: process.env.BASE_URL || 'https://localhost:8000',
      tags: ['VCALM']
    }]
  }]
};
```

Override the base URL: `BASE_URL=https://localhost:8000 npm test`

## The `VCALM` tag

Endpoints that participate in this suite include **`VCALM`** in `tags`. The
harness uses
[`vc-test-suite-implementations`](https://github.com/w3c/vc-test-suite-implementations)
`filterByTag({ tags: ['VCALM'] })` to build the Mocha matrix.

## Mocha and OpenAPI (planned)

**Mocha** will run behavioral interop: HTTP status, VCALM response envelopes
(`verifiableCredential` / `verifiablePresentation`), and spec-specific fields.
`it()` titles will use strings from `tests/normative-statements.js`.

**OpenAPI (optional, later)** — selected tests may validate responses against
the VCALM OAS via Chai OpenAPI (`VCALM_OPENAPI=0` to disable).

## License

[LICENSE.md](LICENSE.md)
