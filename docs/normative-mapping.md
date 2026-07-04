# Normative requirements → test suite mapping

Maps [normative-requirements.md](normative-requirements.md) to the repository
layout. Use this when scoping interop coverage or planning new tests.

## Architecture

```text
vcalm-test-suite/
│
├── npm test                          Mocha (§1.3 roles, prose, happy paths, negatives)
├── npm run test:schema               OAS Conformance — Schemathesis (~357 http MUSTs)
│
├── localConfig.cjs                   Mocha endpoints (per-role operation URLs)
├── schemathesis.local.cjs            Schemathesis baseUrl + profile
│
├── docs/
│   ├── README.md                     Documentation index
│   ├── normative-requirements.md     Prose / conformance / config inventory (no OAS tables)
│   ├── normative-mapping.md          ← this file
│   ├── test-coverage.md              Per-file matrix + config guide
│   └── schemathesis/oas.yaml         Pinned OpenAPI (shape source of truth)
│
└── tests/                            Mirrors VCALM TOC (one directory per section)
    ├── *.js at tests/ root           Helpers only (excluded from Mocha glob)
    ├── normative-statements.js       Canonical `it()` title strings
    ├── negative-fixtures.js          Negative case lists + foreign reference fixtures
    ├── fixtures/                     reference-foreign-vc.json, reference-foreign-vp.json
    ├── helpers.js, assertions.js, mock.data.js, TestEndpoints.js, …
    └── {section}-{Title}/3.{subsection}-{Name}.js
```

### Coverage legend

| Symbol | Layer | Meaning |
|--------|-------|---------|
| ✅ | Mocha | Mocha test exists (`npm test`) |
| 🔷 | OAS Conformance | Schemathesis OAS fuzz (`npm run test:schema`) |
| ⏭ | — | Skipped or placeholder (`it.skip` / planned) |
| ❌ | — | Not covered yet |
| ⊘ | — | Deferred, non-normative, or out of suite scope |

Mocha tests use `localConfig.cjs` role keys (`issuers`, `verifiers`, `holders`,
`workflows`, `interactions`). Optional endpoints skip on HTTP 404/501.
See [test-coverage.md](test-coverage.md) → **VCALM tag and endpoint registration**.

---

## §1 Introduction

### §1.3 Conformance — `tests/1.3-Conformance/services.js`

```text
1.3-Conformance/
└── services.js
    ├── Issuer service
    │   └── [MUST] POST /credentials/issue (§3.2.1) ........................ ✅  malformed-issue probe
    ├── Verifier service
    │   ├── [MUST] POST /credentials/verify (§3.3.1) ...................... ✅  malformed-VC probe
    │   └── [MUST] POST /presentations/verify (§3.3.2) .................... ✅  malformed-VP probe (same verifiers entry)
    ├── Holder service (optional profile)
    │   ├── [MUST] Get Exchange Protocols (§3.6.4) ...................... ✅  probe (workflows)
    │   └── [MUST] Participate in Exchange (§3.6.5) ..................... ✅  probe (workflows)
    ├── Status service (optional, tag VCALM:status)
    │   └── [MUST] Update Status (Appendix C.3) ........................... ✅  probe
    ├── Workflow service
    │   └── [MUST] all §3.6 interfaces .................................. 🔷  workflow profile
    ├── Service client
    │   └── [MUST] communicate with required interfaces .................. ⊘  client-side; not suite scope
    └── All implementations
        └── [MAY] functionality beyond spec ............................. ⊘  not testable
```

---

## §2 Architecture

### §2.4 Configurations — `tests/2.4-Configurations/`

```text
2.4-Configurations/
├── 2.4.1-ContentSerialization.js
│   └── [MUST] JSON, Content-Type: application/json ....................... ✅  HTTP (issue response)
├── 2.4.2-UnknownOptions.js
│   └── [MUST] error on unknown options/data .............................. ✅  HTTP + 3.8.2 type
├── 2.4.3-Authorization.js
│   └── [MUST NOT] long-lived static credentials .......................... ✅  config audit
├── 2.4.4-RecommendedVcPayloadSize.js
│   └── [RECOMMENDED] 10 MB VC baseline ................................... ✅  fixture + config audit
├── Base URL
│   └── [MAY] hostname / subdomain / path prefix ........................ ⊘  deployment choice
├── Authorization (instance policy)
│   └── [MAY] OAuth 2.0 token types / grant types ......................... ⊘  instance-specific
├── Options
│   ├── [OPTIONAL] per-instance options ................................... 🔷  OAS options objects
│   ├── [MAY] prohibit / require specific keys ............................ ⊘  instance policy
│   └── [MAY] extend options .............................................. ⊘
```

---

## §3 HTTP API

### §3.2 Issuing — `tests/3.2-Issuing/`

```text
3.2-Issuing/
├── 3.2.1-issue-credential.js
│   └── [MUST] issue → HTTP 201 + signed VC ............................. ✅🔷  issueCredential
├── 3.2.2-get-credential.js
│   └── GET /credentials/{id} → HTTP 200 .................................. ✅🔷  getCredential (skip 404/501)
├── 3.2.3-delete-credential.js
│   └── DELETE /credentials/{id} → HTTP 202 ............................. ✅🔷  deleteCredential (skip 404/501)
├── 3.2.4-MultipleProofsInSingleResponse.js
│   └── [MUST] multiple proofs in single response ........................ ✅  HTTP (probe-gated)
├── 3.2.5-ProofSetsAndChainsConfiguration.js
│   └── [SHOULD] pre-existing proof → sets/chains/error config .......... ✅  fixture + HTTP (probe-gated)
└── 3.2.6-IssueCredentialNegatives.js
    └── malformed issue requests → client error ........................... ✅  HTTP (suite negative.*)
```

### §3.3 Verifying — `tests/3.3-Verifying/`

```text
3.3-Verifying/
├── 3.3.1-VerifyCredential.js
│   └── POST /credentials/verify → HTTP 200, verified: true .............. ✅🔷  verifyCredential
├── 3.3.2-VerifyPresentation.js
│   └── POST /presentations/verify → HTTP 200, verified: true ............ ✅🔷  verifyPresentation
├── 3.3.3-CreateChallenge.js
│   └── POST /challenges → HTTP 200 + challenge .......................... ✅🔷  challenge (skip 404/501)
├── 3.3.4-VerifyCredentialNegatives.js
│   └── foreign / malformed VC → verified:false ........................... ✅  HTTP (suite negative.*)
└── 3.3.5-VerifyPresentationNegatives.js
    └── foreign / malformed VP → verified:false ........................... ✅  HTTP (suite negative.*)

(OAS field-level MUSTs on verify request/response bodies) ................. 🔷  verifier profile
```

### §3.4 Requesting a Presentation — `tests/3.4-RequestingAPresentation/`

```text
3.4-RequestingAPresentation/
├── 3.4.1-VerifiablePresentationRequest.js
│   ├── [REQUIRED] query property ......................................... ✅  fixture
│   └── [MUST] each query map defines type (string) ....................... ✅  fixture
├── 3.4.2-QueryByExample.js
│   └── [SHOULD] SD cryptosuites in acceptedCryptosuites .................. ✅  fixture
├── 3.4.3-DIDAuthentication.js
│   ├── [MUST] DID Auth query type DIDAuthentication ...................... ✅  fixture
│   └── [MUST] DID Auth response is a VP .................................. ✅  fixture
├── 3.4.4-AuthorizationCapabilityRequest.js
│   └── §3.4.4 (Issue 3) .................................................. ⊘  describe.skip
└── 3.4.5-LogicalOperationsInQueries.js
    └── AND within group / OR across groups ............................... ✅  fixture
```

### §3.5 Presenting — `tests/3.5-Presenting/`

```text
3.5-Presenting/
├── 3.5.1-DeriveCredential.js
│   └── POST /credentials/derive → HTTP 201 ............................... ✅🔷  deriveCredential (skip 404/501)
├── 3.5.2-CreatePresentation.js
│   └── POST /presentations → HTTP 201 + signed VP ........................ ✅🔷  createPresentation
├── 3.5.3-GetPresentations.js
│   └── GET /presentations → HTTP 200 ..................................... ✅🔷  getPresentations (skip 404/501)
├── 3.5.4-GetASpecificPresentation.js
│   └── GET /presentations/{id} → HTTP 200 ................................ ✅🔷  getPresentation (skip 404/501)
└── 3.5.5-DeleteASpecificPresentation.js
    └── DELETE /presentations/{id} → HTTP 202 ............................. ✅🔷  deletePresentation (skip 404/501)

(OAS field-level MUSTs on presentation bodies) ............................ 🔷  holder profile
```

### §3.6 Workflows and Exchanges — `tests/3.6-WorkflowsAndExchanges/`

```text
3.6-WorkflowsAndExchanges/
├── 3.6.1-CreateWorkflow.js
│   └── POST /workflows → HTTP 201/204 + Location ....................... ✅🔷  createWorkflow
├── 3.6.1.1-IssueRequestVariablesAndResult.js
│   ├── [MAY] variables on issue request .................................. ✅  fixture
│   └── [MAY] result property + variables / JSON pointer rules ............ ✅  fixture
├── 3.6.2-GetWorkflowConfiguration.js
│   └── GET /workflows/{id} → HTTP 200 .................................... ✅🔷  getWorkflowConfiguration
├── 3.6.3-CreateExchange.js
│   └── POST .../exchanges → HTTP 201/204 + Location ...................... ✅🔷  createExchange
├── 3.6.4-GetExchangeProtocols.js
│   └── GET .../protocols → HTTP 200 .................................... ✅🔷  getSupportedProtocolsConfiguration
├── 3.6.5-ParticipateInAnExchange.js
│   └── POST .../exchanges/{id} → HTTP 200 ................................ ✅🔷  participateInExchange
├── 3.6.5.1-ExchangeReferenceId.js
│   ├── [MAY] referenceId in server message ............................... ✅  fixture
│   ├── [SHOULD] client echo referenceId ................................ ✅  fixture
│   └── [SHOULD] referenceId as urn:uuid: ................................ ✅  fixture
├── 3.6.6-GetExchangeState.js
│   └── GET .../exchanges/{id} → HTTP 200 ................................. ✅🔷  getExchangeConfiguration
├── 3.6.7-ExchangeStepCallbacks.js
│   └── POST /callbacks/{id} .............................................. ✅  HTTP (skip 404/501)
└── 3.6.8-ExchangeExamples.js
    └── Normative exchange examples ....................................... ⏭  it.skip

§1.3 workflow service “all §3.6 interfaces” ............................. 🔷  workflow profile (+ callback op)
```

### §3.7 Initiating Interactions — `tests/3.7-InitiatingInteractions/`

```text
3.7-InitiatingInteractions/
├── 3.7.1-InteractionURLFormat.js
│   ├── [MUST] valid URL with iuv query param; iuv = 1 .................... ✅  fixture
│   ├── [SHOULD] HTTPS URL ................................................ ✅  fixture
│   ├── [SHOULD] opaque URL ............................................... ✅  fixture
│   └── [SHOULD NOT] extra query params ................................... ✅  fixture
├── 3.7.2-InteractionQRCodeFormat.js
│   ├── [MUST] encode interaction URL (ISO 18004) ......................... ✅  fixture
│   ├── [MUST NOT] exceed 4,296 characters .............................. ✅  fixture
│   └── [SHOULD] ≤ 400 alphanumeric chars ................................. ⚠️  bundled in qrCodeMaxLength it()
├── 3.7.3-InteractionSchemeFormat.js
│   └── [MUST] interaction: + URL syntax .................................. ✅  fixture
├── 3.7.4-InteractionProtocolsResponse.js
│   ├── [MUST] Accept: application/json → protocols object ................ ✅  fixture + HTTP
│   ├── [MUST] unrecognized Accept → text/html ............................ ✅  HTTP (skip 404/501)
│   └── OAS GET /interactions/{interactionId} ............................. 🔷  full profile (startInteraction)
├── 3.7.5-inviteRequestInteractionProtocol.js
│   └── inviteRequest flow ................................................ ⏭  it.skip
└── 3.7.6-vcapiInteractionProtocol.js
    └── vcapi exchange continuation ....................................... ⏭  it.skip

POST invitation (receiveInvitationResponse) ............................... 🔷  full profile
```

### §3.8 Error Handling — `tests/3.8-ErrorHandling/`

```text
3.8-ErrorHandling/
├── 3.8.2-ProblemDetails.js
│   ├── [MUST] type present (URL) ....................................... ✅  fixture
│   ├── [SHOULD] title, detail human-readable ............................. ✅  fixture
│   └── UNKNOWN_OPTION_PROVIDED type ...................................... ✅  fixture + 2.4.2 HTTP
└── 3.8.1-VerificationErrorsVsWarnings.js
    ├── [MUST] errors present → verified: false ........................... ✅  fixture + HTTP (tampered VC/VP)
    └── [MUST] no errors → verified: true ................................. ✅  fixture + HTTP (happy path)
```

---

## Appendix C — Status List Management

```text
(no dedicated §C directory)
├── [MUST] Status service: Update Status (§C.3) ........................... ✅  §1.3 probe (VCALM:status tag)
├── createStatusList (§C.1) ............................................... 🔷  issuer profile
├── getStatusList (§C.2) .................................................. 🔷  issuer profile
└── updateCredentialStatus ................................................ 🔷  issuer profile
```

---

## Appendix B — Security (selected) — `tests/appendix-B-Security/`

```text
appendix-B-Security/
├── B.1-StripUnrecognizedProofs.js
│   └── §B.1 strip unknown proof types before presentation ................ ✅  fixture
├── B.4-InstancePayloadLimits.js
│   └── §B.4 instance payload limits ...................................... ✅  config audit
├── §B.2 HTTPS for interaction URLs ....................................... ⚠️  partial (§3.7.1 SHOULD HTTPS)
```

---

## Schemathesis profile → OAS operations

Maps HTTP-shape coverage when Mocha does not assert individual OAS MUSTs.

```text
schemathesis.local.cjs profiles
├── phase1-core (default)
│   ├── issueCredential ..................... §3.2.1 / §1.3 issuer
│   ├── verifyCredential .................... §3.3.1 / §1.3 verifier
│   └── verifyPresentation .................. §3.3.2 / §1.3 verifier
├── issuer
│   └── §3.2.* + status list ops ............ Appendix C
├── verifier
│   └── §3.3.* .............................. verify + challenge
├── holder
│   └── §3.5.* .............................. derive + presentation CRUD
├── workflow
│   └── §3.6.* + callback ................... exchanges + callbacks
└── full
    └── all 22 operationIds ................. §3.2–§3.7 OAS surface
```

---

## Summary counts (prose / conformance / config)

From [normative-requirements.md](normative-requirements.md) (~42 + §3.7–§3.8 editor draft):

| Status | Approx. | Notes |
|--------|--------:|-------|
| ✅ Mocha | **~92%** of testable prose | Fixture + HTTP + negatives; see test-coverage.md |
| 🔷 Schemathesis only | ~357+ | OAS tables; not itemized here |
| ⏭ Planned / skipped | **4** | §3.4.4, §3.6.8, §3.7.5, §3.7.6 |
| ❌ Not covered | **0** | — |
| ⊘ Out of scope | remainder | MAY clauses, client role, deployment choices |

For per-test config keys and command examples, see [test-coverage.md](test-coverage.md).
For the documentation index, see [README.md](README.md).
