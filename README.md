# VCALM Interoperability Test Suite

Interoperability tests for implementations of
[VCALM](https://www.w3.org/TR/vcalm-1.0/) (Verifiable Credential API for
Lifecycle Management).

## Strategy

| Layer | Tool | Purpose |
|-------|------|---------|
| API shape conformance | Schemathesis | Request/response schemas from pinned `w3c/vcalm` OAS |
| Behavioral interop | Mocha + W3C interop reporter | §1.3 service roles, issue/verify happy paths, VCALM response semantics |

Mocha tests are adapted from the CCG
[vc-api-issuer-test-suite](https://github.com/w3c-ccg/vc-api-issuer-test-suite)
and
[vc-api-verifier-test-suite](https://github.com/w3c-ccg/vc-api-verifier-test-suite),
trimmed to happy-path behavior. Field-level HTTP validation is covered by
Schemathesis. This suite does **not** run VCDM or crypto interop suites — it
uses minimal fixture credentials sufficient to exercise the API.

Mocha tests under `tests/` mirror the VCALM TOC — one directory per section
(`1.3-Conformance/`, `3.2-Issuing/`, `3.3-Verifying/`, `3.4-RequestingAPresentation/`, `3.5-Presenting/`, `3.6-WorkflowsAndExchanges/`, `3.7-InitiatingInteractions/`, `3.8-ErrorHandling/`, …). See
[docs/test-coverage.md](docs/test-coverage.md) for the full matrix.

## Install

```sh
npm install --legacy-peer-deps
```

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
BASE_URL=http://localhost:40443/instance npm test
```

Verify VC tests require `issuers` + `verifiers` on the same implementation.
Verify VP tests require `issuers` + `holders` + `vpVerifiers` (issue → create
presentation → verify).

For path-specific deployments:

```js
holders: [{ endpoint: `${baseUrl}/presentations`, tags: ['VCALM'] }],
vpVerifiers: [{ endpoint: `${baseUrl}/presentations/verify`, tags: ['VCALM'] }],
```

Unified gateways may use one `baseUrl` for all roles (see credential.ninja
example below).

## Implementation registration

Register implementations in
[`w3c/vc-test-suite-implementations`](https://github.com/w3c/vc-test-suite-implementations)
with tag `VCALM` on issuer, verifier, and `vpVerifier` endpoints (and
`workflows` / `VCALM:status` for optional profiles).

## Schema conformance (Schemathesis)

Property-based tests against the pinned OpenAPI bundle in `docs/schemathesis/`.

```sh
npm run schema:update-oas   # refresh oas.yaml from w3c/vcalm
cp schemathesis.local.example.cjs schemathesis.local.cjs
BASE_URL=http://localhost:40443/id npm run test:schema
```

See [docs/schemathesis/README.md](docs/schemathesis/README.md),
[docs/normative-requirements.md](docs/normative-requirements.md), and
[docs/test-coverage.md](docs/test-coverage.md) for profiles, auth, and
normative-to-test mapping.

## Report

`npm test` writes:

- W3C interoperability matrix — `reports/index.html`
- Allure raw results — `allure-results/` (for local debugging)

Browse the Allure report after a test run:

```sh
npm run test:allure
```

## License

See [LICENSE.md](LICENSE.md).
