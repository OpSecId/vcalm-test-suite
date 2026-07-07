# VCALM Interoperability Test Suite

Interoperability tests for implementations of
[VCALM](https://www.w3.org/TR/vcalm-1.0/) (Verifiable Credential API for
Lifecycle Management).

The suite exercises **API behavior** — endpoints, workflows, configuration rules,
and VCALM-specific prose. It does not replace VCDM or cryptosuite interop
suites; fixtures are minimal credentials sufficient to call the API.

Normative requirement text for Mocha `it()` titles lives in
[`tests/normative-statements.js`](tests/normative-statements.js).

## Install

```sh
npm install --legacy-peer-deps
```

## Run

Create **`localConfig.cjs`** (gitignored) listing your implementations, then:

```sh
npm test
```

Override the base URL:

```sh
BASE_URL=https://localhost:8000 npm test
```

## Test layout

Tests mirror the VCALM table of contents. Mocha loads `tests/*/**/*.js` only;
shared helpers at `tests/*.js` are not test files.

```
tests/
  normative-statements.js   # RFC 2119 strings used as it() titles
  helpers.js                # matrix setup, VCALM tag, fixtures
  negative-fixtures.js      # malformed / foreign VC·VP cases
  1.3-Conformance/          # §1.3 service role probes
  2.4-Configurations/       # §2.4 JSON, options, auth, payload limits
  3.2-Issuing/              # §3.2 issue · get · delete · multi-proof
  3.3-Verifying/            # §3.3 verify VC/VP · challenge · negatives
  3.4-Requesting/           # §3.4 VPR shape and query rules
  3.5-Presenting/           # §3.5 derive · create · list · get · delete
  3.6-Workflows/            # §3.6 workflow and exchange lifecycle
  3.7-Interactions/         # §3.7 interaction URL · QR · protocols
  3.8-ErrorHandling/        # §3.8 ProblemDetails · verified true/false
  appendix-B-Security/      # selected appendix B guidance
```

## Implementation config

Implementations are registered in **`localConfig.cjs`**. Each **role** you
support gets an `endpoint` and **`tags: ['VCALM']`**. Register only what you
implement — tests skip missing pairings (for example, presentation verify needs
both `holders` and `verifiers`).

| Role key | Used for | Typical `endpoint` |
|----------|----------|-------------------|
| `issuers` | Issue credential (§3.2.1) | `…/credentials/issue` or gateway root |
| `verifiers` | Verify VC and VP (§3.3.1–2) | `…/credentials/verify` or gateway root |
| `holders` | Create presentation (§3.5.2) | `…/presentations` or gateway root |
| `workflows` | §3.6 workflows (optional) | `…/workflows` or gateway root |
| `interactions` | §3.7 interaction URL fetch (optional) | gateway root or `…/interactions` |

**One `verifiers` entry covers both verify operations.** The suite derives the
sibling path from `endpoint` (for example `…/credentials/verify` →
`…/presentations/verify`).

**Issuers** may set `options.cryptosuite` to a string or string array. An array
requests a proof set and enables the §3.2.4 multi-proof test when length ≥ 2.

```javascript
module.exports = {
  implementations: [{
    name: 'My VCALM service',
    implementation: 'Example Corp',
    issuers: [{
      id: 'did:web:example.com',
      endpoint: process.env.BASE_URL || 'https://credential.ninja',
      tags: ['VCALM'],
      options: { cryptosuite: 'eddsa-jcs-2022' }
    }],
    verifiers: [{
      endpoint: process.env.BASE_URL || 'https://credential.ninja',
      tags: ['VCALM']
    }],
    holders: [{
      endpoint: process.env.BASE_URL || 'https://credential.ninja',
      tags: ['VCALM']
    }]
  }]
};
```

Use one URL for every role (gateway) or point each role at an explicit path
(`…/credentials/issue`, `…/credentials/verify`, etc.).

## The `VCALM` tag

Every endpoint that should run this suite must include **`VCALM`** in `tags`.
The harness uses
[`vc-test-suite-implementations`](https://github.com/w3c/vc-test-suite-implementations)
`filterByTag({ tags: ['VCALM'] })` to build the Mocha matrix.

## Mocha and OpenAPI testing

**Mocha** runs behavioral interop against live endpoints: HTTP status, VCALM
response envelopes (`verifiableCredential` / `verifiablePresentation`), and
spec-specific fields. `it()` titles use strings from `tests/normative-statements.js`.

**OpenAPI (optional)** — when a bundled OAS is present, selected tests validate
responses with Chai OpenAPI. Disable with `VCALM_OPENAPI=0 npm test`. Bulk
request/response fuzzing can use Schemathesis separately (`npm run test:schema`
when configured).

## License

[LICENSE.md](LICENSE.md)
