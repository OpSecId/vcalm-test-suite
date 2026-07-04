# VCALM test suite — documentation index

## Start here

| If you want to… | Read |
|-----------------|------|
| Install and run tests | [../README.md](../README.md) |
| Configure `localConfig.cjs` / profiles | [test-coverage.md](test-coverage.md) → VCALM tag and endpoint registration |
| See which test file maps to which spec section | [test-coverage.md](test-coverage.md) |
| Understand scope and phased rollout | [test-suite-design-analysis.md](test-suite-design-analysis.md) |
| Run Schemathesis / OAS fuzzing | [schemathesis/README.md](schemathesis/README.md) |

## Normative traceability

| File | Purpose |
|------|---------|
| [normative-requirements.md](normative-requirements.md) | Prose / conformance / config inventory (excludes OAS tables) |
| [normative-mapping.md](normative-mapping.md) | File-tree map: requirements → tests (✅ / 🔷 / ⏭) |
| [test-coverage.md](test-coverage.md) | Per-file matrix, config keys, Schemathesis profiles |
| [../tests/normative-statements.js](../tests/normative-statements.js) | Canonical `it()` title strings (TR text + suite `negative.*` keys) |

## Stats and analysis

| File | Purpose |
|------|---------|
| [vcalm-normative-stats.html](vcalm-normative-stats.html) | Keyword counts dashboard |
| [vcalm-normative-stats.json](vcalm-normative-stats.json) | Machine-readable stats |
| [test-suite-design-analysis.md](test-suite-design-analysis.md) | Why 418 MUSTs ≠ 418 tests |

## Test layers (quick reference)

```text
npm test              Mocha — §1.3 probes, happy paths, negatives, §3.8 semantics
npm run test:schema   Schemathesis — OAS request/response shapes (~357 http MUSTs)
VCALM_OPENAPI=1       Optional Chai OpenAPI on Mocha happy-path responses (default: on;
                      set VCALM_OPENAPI=0 when nested VC schema checks are too strict)
```

## Negative / anti-stub tests

Implemented in Mocha (not Schemathesis):

- `tests/3.2-Issuing/3.2.6-IssueCredentialNegatives.js` — malformed issue bodies → 4xx
- `tests/3.3-Verifying/3.3.4-VerifyCredentialNegatives.js` — foreign VC, no proof, etc.
- `tests/3.3-Verifying/3.3.5-VerifyPresentationNegatives.js` — foreign VP, no proof
- `tests/fixtures/reference-foreign-*.json` — credentials not issued by the SUT
- §1.3 conformance probes — malformed issue/verify bodies (not empty `POST {}`)

Fixtures and case lists: `tests/negative-fixtures.js`.
