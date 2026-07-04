# VCALM Interoperability Test Suite

Interoperability tests for implementations of
[VCALM](https://www.w3.org/TR/vcalm-1.0/) (Verifiable Credential API for
Lifecycle Management).

## Strategy

| Layer | Tool | Purpose |
|-------|------|---------|
| OAS Conformance | Schemathesis | Request/response schemas from [w3c.github.io/vcalm/oas.yaml](https://w3c.github.io/vcalm/oas.yaml) (pinned under `docs/schemathesis/`) |
| OAS (optional) | Chai OpenAPI | Response envelope checks on happy paths (`tests/openapi.js`; off when `VCALM_OPENAPI=0`) |
| Mocha | Mocha | §1.3 roles, happy paths, negative inputs, `verified` / ProblemDetails semantics |

Mocha tests are adapted from the CCG
[vc-api-issuer-test-suite](https://github.com/w3c-ccg/vc-api-issuer-test-suite)
and
[vc-api-verifier-test-suite](https://github.com/w3c-ccg/vc-api-verifier-test-suite),
extended with **negative fixtures** (malformed issue requests, foreign
credentials/presentations) to catch stub implementations. Field-level HTTP
validation is covered by Schemathesis. This suite does **not** run VCDM or crypto
interop suites — it uses minimal fixture credentials sufficient to exercise the
API.

Mocha tests under `tests/<section>/` mirror the VCALM TOC (helpers live at
`tests/*.js` and are excluded from the `tests/*/**/*.js` glob). See
[docs/test-coverage.md](docs/test-coverage.md) and [docs/README.md](docs/README.md).

## Install

```sh
npm install --legacy-peer-deps
```

`--legacy-peer-deps` avoids peer-resolution conflicts between Mocha 11 and older
devDependency trees (Chai OpenAPI).

## Setup

Endpoints must follow the VCALM / VC-API shape:

- `POST /credentials/issue`
- `POST /credentials/verify`
- `POST /presentations/verify`

### Local testing

```sh
cp localConfig.example.cjs localConfig.cjs
# edit endpoints, then:
npm test
```

Override the API base URL:

```sh
BASE_URL=https://localhost:8000 npm test
```

### VC Dojo (localhost)

Terminal 1 — start the server:

```sh
cd vc-dojo && ./scripts/dev-server.sh
```

Terminal 2 — run the suite (point `localConfig.cjs` at `https://localhost:8000`):

```sh
cd test-suites/vcalm-test-suite
NODE_TLS_REJECT_UNAUTHORIZED=0 VCALM_OPENAPI=0 npm test
NODE_TLS_REJECT_UNAUTHORIZED=0 BASE_URL=https://localhost:8000 npm run test:schema
```

| Variable | Default | Meaning |
|----------|---------|---------|
| `NODE_TLS_REJECT_UNAUTHORIZED=0` | — | Allow self-signed HTTPS for local dev |
| `VCALM_OPENAPI=0` | Chai on | Disable Chai OpenAPI (nested VC schemas in OAS are stricter than JSON-LD) |
| `BASE_URL` | from `localConfig.cjs` | Instance root for Schemathesis |

### Role registration

Verify VC tests require `issuers` + `verifiers` on the same implementation.
Verify VP tests require `issuers` + `holders` + `verifiers` (issue → create
presentation → verify).

The `verifiers` entry may point at a unified gateway root or at
`POST /credentials/verify`; the suite resolves `/presentations/verify` from
the same setting. See [docs/test-coverage.md](docs/test-coverage.md) →
**VCALM tag and endpoint registration** for tags, per-role URL resolution, and
pairing rules.

For path-specific deployments:

```js
issuers: [{ endpoint: `${baseUrl}/credentials/issue`, tags: ['VCALM'] }],
holders: [{ endpoint: `${baseUrl}/presentations`, tags: ['VCALM'] }],
verifiers: [{ endpoint: `${baseUrl}/credentials/verify`, tags: ['VCALM'] }],
```

Unified gateways may use one `baseUrl` for all roles (see `localConfig.example.cjs`).

## Implementation registration

Register implementations in
[`w3c/vc-test-suite-implementations`](https://github.com/w3c/vc-test-suite-implementations)
with tag `VCALM` on issuer, verifier, and holder endpoints (and
`workflows` / `VCALM:status` for optional profiles).

## OAS conformance (Schemathesis)

Property-based tests against the pinned OpenAPI bundle in `docs/schemathesis/`.

```sh
npm run schema:update-oas   # refresh oas.yaml from https://w3c.github.io/vcalm/oas.yaml
cp schemathesis.local.example.cjs schemathesis.local.cjs
BASE_URL=http://localhost:40443/id npm run test:schema
```

See [docs/schemathesis/README.md](docs/schemathesis/README.md),
[docs/normative-requirements.md](docs/normative-requirements.md), and
[docs/test-coverage.md](docs/test-coverage.md) for profiles, auth, and
normative-to-test mapping.

## Report

`npm test` writes:

- W3C interoperability matrix — `reports/index.html` and `reports/index.json`
- Mocha suite log — `suite.log`

`reports/` is gitignored except `.gitkeep`; regenerate locally after each run.

## License

See [LICENSE.md](LICENSE.md).
