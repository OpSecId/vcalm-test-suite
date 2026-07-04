# VCALM Interoperability Test Suite

Interoperability tests for implementations of
[VCALM](https://www.w3.org/TR/vcalm-1.0/) (Verifiable Credential API for
Lifecycle Management).

## Branches

| Branch | Contents |
|--------|----------|
| `feature/vcalm-interop-suite` | Mocha tests, `docs/test-coverage.md`, run instructions (this branch) |
| `feature/vcalm-oas-pin` | Schemathesis, pinned OpenAPI (`docs/schemathesis/`), `npm run test:schema` |
| `feature/vcalm-docs` | Normative traceability, stats, spec-to-test mapping (`docs/` tree) |

```sh
git checkout feature/vcalm-oas-pin -- docs/schemathesis/ schemathesis.local.example.cjs schemathesis.toml scripts/
git checkout feature/vcalm-docs -- docs/
```

## Strategy

| Layer | Tool | Branch |
|-------|------|--------|
| Mocha | Mocha | `feature/vcalm-interop-suite` |
| OAS (optional) | Chai OpenAPI | Checkout `oas.bundled.json` from `feature/vcalm-oas-pin` (`tests/openapi.js`; off when `VCALM_OPENAPI=0`) |
| OAS Conformance | Schemathesis | `feature/vcalm-oas-pin` |

Mocha tests are adapted from the CCG
[vc-api-issuer-test-suite](https://github.com/w3c-ccg/vc-api-issuer-test-suite)
and
[vc-api-verifier-test-suite](https://github.com/w3c-ccg/vc-api-verifier-test-suite),
extended with **negative fixtures** (malformed issue requests, foreign
credentials/presentations) to catch stub implementations. Field-level HTTP
validation is covered by Schemathesis on `feature/vcalm-oas-pin`. This suite does
**not** run VCDM or crypto interop suites — it uses minimal fixture credentials
sufficient to exercise the API.

Mocha tests under `tests/<section>/` mirror the VCALM TOC (helpers live at
`tests/*.js` and are excluded from the `tests/*/**/*.js` glob). See
[docs/test-coverage.md](docs/test-coverage.md).

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
```

| Variable | Default | Meaning |
|----------|---------|---------|
| `NODE_TLS_REJECT_UNAUTHORIZED=0` | — | Allow self-signed HTTPS for local dev |
| `VCALM_OPENAPI=0` | Chai on | Disable Chai OpenAPI (nested VC schemas in OAS are stricter than JSON-LD) |

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

This branch includes the pinned OpenAPI bundle and `npm run test:schema`.

```sh
cp schemathesis.local.example.cjs schemathesis.local.cjs
BASE_URL=https://localhost:8000 npm run test:schema
```

See [docs/schemathesis/README.md](docs/schemathesis/README.md) for profiles and auth.
Mocha tests: use branch `feature/vcalm-interop-suite` (or `npm test` here — same tests).

## Report

`npm test` writes:

- W3C interoperability matrix — `reports/index.html` and `reports/index.json`
- Mocha suite log — `suite.log`

`reports/` is gitignored except `.gitkeep`; regenerate locally after each run.

## License

See [LICENSE.md](LICENSE.md).
