# Normative requirements → test suite mapping

Maps [normative-requirements.md](normative-requirements.md) to the repository
layout. Use this when scoping interop coverage or planning new tests.

## Architecture

```text
vcalm-test-suite/
│
├── npm test                          Mocha — behavioral interop (§1.3 roles, prose, happy paths)
├── npm run test:schema               Schemathesis — OAS request/response shapes (~357 http MUSTs)
│
├── localConfig.cjs                   Mocha endpoints (per-role operation URLs)
├── schemathesis.local.cjs            Schemathesis baseUrl + profile
│
├── docs/
│   ├── normative-requirements.md     Prose / conformance / config inventory (no OAS tables)
│   ├── normative-mapping.md          ← this file
│   ├── test-coverage.md              Per-file matrix + config guide
│   └── schemathesis/oas.yaml         Pinned OpenAPI (shape source of truth)
│
└── tests/                            Mirrors VCALM TOC (one directory per §3 section)
    ├── helpers.js, assertions.js, mock.data.js, TestEndpoints.js, …
    └── {section}-{Title}/3.{subsection}-{Name}.js
```

### Coverage legend

| Symbol | Layer | Meaning |
|--------|-------|---------|
| ✅ | Mocha | Behavioral test exists (`npm test`) |
| 🔷 | Schemathesis | OAS operation/shape fuzzed (`npm run test:schema`) |
| ⏭ | — | Skipped or placeholder (`it.skip` / planned) |
| ❌ | — | Not covered yet |
| ⊘ | — | Deferred, non-normative, or out of suite scope |

Mocha tests use `localConfig.cjs` role keys (`issuers`, `verifiers`, `holders`,
`workflows`, `interactions`). Optional endpoints skip on HTTP 404/501.

---

## §1 Introduction

### §1.3 Conformance — `tests/1.3-Conformance/services.js`

```text
1.3-Conformance/
└── services.js
    ├── Issuer service
    │   └── [MUST] POST /credentials/issue (§3.2.1) ........................ ✅  probe
    ├── Verifier service
    │   ├── [MUST] POST /credentials/verify (§3.3.1) ...................... ✅  probe
    │   └── [MUST] POST /presentations/verify (§3.3.2) .................... ✅  probe (vpVerifiers)
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

### §2.4 Configurations

```text
(no dedicated test directory — cross-cutting)
├── Base URL
│   └── [MAY] hostname / subdomain / path prefix ........................ ⊘  deployment choice
├── Authorization
│   ├── [MUST NOT] long-lived static credentials .......................... ❌
│   └── [MAY] OAuth 2.0 token types / grant types ......................... ⊘  instance-specific
├── Options
│   ├── [OPTIONAL] per-instance options ................................... 🔷  OAS options objects
│   ├── [MAY] prohibit / require specific keys ............................ ⊘  instance policy
│   ├── [MAY] extend options .............................................. ⊘
│   └── [MUST] error on unknown options/data .............................. ❌  planned (see test-coverage.md)
├── Content serialization
│   └── [MUST] JSON, Content-Type: application/json ....................... 🔷  Schemathesis + probes
└── Payload sizes
    └── [RECOMMENDED] 10 MB VC baseline ................................... ❌
```

---

## §3 HTTP API

### §3.2 Issuing — `tests/3.2-Issuing/`

```text
3.2-Issuing/
├── 3.2.1-issue-credential.js
│   ├── [MUST] issue → HTTP 201 + signed VC ............................. ✅🔷  issueCredential
│   ├── [MUST] multiple proofs in single response ........................ ❌  prose; planned
│   └── [SHOULD] pre-existing proof → sets/chains/error config .......... ❌  prose; planned
├── 3.2.2-get-credential.js
│   └── GET /credentials/{id} → HTTP 200 .................................. ✅🔷  getCredential (skip 404/501)
└── 3.2.3-delete-credential.js
    └── DELETE /credentials/{id} → HTTP 202 ............................. ✅🔷  deleteCredential (skip 404/501)
```

### §3.3 Verifying — `tests/3.3-Verifying/`

```text
3.3-Verifying/
├── 3.3.1VerifyCredential.js
│   └── POST /credentials/verify → HTTP 200, verified: true .............. ✅🔷  verifyCredential
├── 3.3.2VerifyPresentation.js
│   └── POST /presentations/verify → HTTP 200, verified: true ............ ✅🔷  verifyPresentation
└── 3.3.3CreateChallenge.js
    └── POST /challenges → HTTP 200 + challenge .......................... ✅🔷  challenge (skip 404/501)

(OAS field-level MUSTs on verify request/response bodies) ................. 🔷  verifier profile
```

### §3.4 Requesting a Presentation — `tests/3.4RequestingAPresentation/`

```text
3.4RequestingAPresentation/
├── 3.4.1VerifiablePresentationRequest.js
│   ├── [REQUIRED] query property ......................................... ✅  fixture
│   └── [MUST] each query map defines type (string) ....................... ✅  fixture
├── 3.4.2QueryByExample.js
│   └── [SHOULD] SD cryptosuites in acceptedCryptosuites .................. ✅  fixture
├── 3.4.3DIDAuthentication.js
│   └── [MUST] DID Auth response is a VP .................................. ⏭  skipped (needs exchange)
├── 3.4.4AuthorizationCapabilityRequest.js
│   └── §3.4.4 (Issue 3) .................................................. ⊘  deferred
└── 3.4.5LogicalOperationsInQueries.js
    └── AND within group / OR across groups ............................... ⏭  skipped (needs exchange)
```

### §3.5 Presenting — `tests/3.5Presenting/`

```text
3.5Presenting/
├── 3.5.1DeriveCredential.js
│   └── POST /credentials/derive → HTTP 201 ............................... ✅🔷  deriveCredential (skip 404/501)
├── 3.5.2CreatePresentation.js
│   └── POST /presentations → HTTP 201 + signed VP ........................ ✅🔷  createPresentation
├── 3.5.3GetPresentations.js
│   └── GET /presentations → HTTP 200 ..................................... ✅🔷  getPresentations (skip 404/501)
├── 3.5.4GetASpecificPresentation.js
│   └── GET /presentations/{id} → HTTP 200 ................................ ✅🔷  getPresentation (skip 404/501)
└── 3.5.5DeleteASpecificPresentation.js
    └── DELETE /presentations/{id} → HTTP 202 ............................. ✅🔷  deletePresentation (skip 404/501)

(OAS field-level MUSTs on presentation bodies) ............................ 🔷  holder profile
```

### §3.6 Workflows and Exchanges — `tests/3.6WorkflowsAndExchanges/`

```text
3.6WorkflowsAndExchanges/
├── 3.6.1CreateWorkflow.js
│   ├── POST /workflows → HTTP 201/204 + Location ....................... ✅🔷  createWorkflow
│   ├── [MAY] variables on issue request .................................. 🔷  OAS only
│   └── [MAY] result property + variables / JSON pointer rules ............ 🔷  OAS only
├── 3.6.2GetWorkflowConfiguration.js
│   └── GET /workflows/{id} → HTTP 200 .................................... ✅🔷  getWorkflowConfiguration
├── 3.6.3CreateExchange.js
│   └── POST .../exchanges → HTTP 201/204 + Location ...................... ✅🔷  createExchange
├── 3.6.4GetExchangeProtocols.js
│   └── GET .../protocols → HTTP 200 .................................... ✅🔷  getSupportedProtocolsConfiguration
├── 3.6.5ParticipateInAnExchange.js
│   ├── POST .../exchanges/{id} → HTTP 200 ................................ ✅🔷  participateInExchange
│   ├── [MAY] referenceId in server message ............................... 🔷  OAS only
│   ├── [SHOULD] client echo referenceId ................................ ❌  planned
│   └── [SHOULD] referenceId as urn:uuid: ................................ ❌  planned
├── 3.6.6GetExchangeState.js
│   └── GET .../exchanges/{id} → HTTP 200 ................................. ✅🔷  getExchangeConfiguration
├── 3.6.7ExchangeStepCallbacks.js
│   └── POST /callbacks/{id} .............................................. ⏭  skipped
└── 3.6.8ExchangeExamples.js
    └── Normative exchange examples ....................................... ⏭  skipped

§1.3 workflow service “all §3.6 interfaces” ............................. 🔷  workflow profile (+ callback op)
```

### §3.7 Initiating Interactions — `tests/3.7InitiatingInteractions/`

```text
3.7InitiatingInteractions/
├── 3.7.1InteractionURLFormat.js
│   ├── [MUST] valid URL with iuv query param ............................. ✅  fixture
│   └── [MUST] iuv = 1 .................................................... ✅  fixture
│   ├── [SHOULD] HTTPS, opaque URL ........................................ ❌
│   └── [SHOULD NOT] query params that belong in GET body ................. ❌
├── 3.7.2InteractionQRCodeFormat.js
│   ├── [MUST] encode interaction URL (ISO 18004) ......................... ⊘  format implied by URL test
│   ├── [MUST NOT] exceed 4,296 characters .............................. ✅  fixture
│   └── [SHOULD] ≤ 400 alphanumeric chars ................................. ❌
├── 3.7.3InteractionSchemeFormat.js
│   └── [MUST] interaction: + URL syntax .................................. ✅  fixture
├── 3.7.4InteractionProtocolsResponse.js
│   ├── [MUST] Accept: application/json → protocols object ................ ✅  fixture + optional HTTP
│   ├── [MUST] unrecognized Accept → text/html ............................ ❌
│   └── OAS GET /interactions/{interactionId} ............................. 🔷  full profile (startInteraction)
├── 3.7.5inviteRequestInteractionProtocol.js
│   └── inviteRequest flow ................................................ ⏭  planned
└── 3.7.6vcapiInteractionProtocol.js
    └── vcapi exchange continuation ....................................... ⏭  planned

POST invitation (receiveInvitationResponse) ............................... 🔷  full profile
```

### §3.8 Error Handling — `tests/3.8ErrorHandling/`

```text
3.8ErrorHandling/
├── (no file yet) ProblemDetails (RFC 9457)
│   ├── [MUST] type present (URL) ....................................... 🔷  OAS ProblemDetails schema
│   ├── [SHOULD] title, detail human-readable ............................. 🔷  partial (shape only)
│   └── UNKNOWN_OPTION_PROVIDED type ...................................... ❌
└── 3.8.1VerificationErrorsVsWarnings.js
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

## Appendix B — Security (selected)

```text
├── §B.1 strip unknown proof types before presentation .................... ❌
├── §B.2 HTTPS for interaction URLs ....................................... ❌  SHOULD-level
└── §B.4 instance payload limits .......................................... ❌  RECOMMENDED
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
| ✅ Mocha | ~35 statements | Includes HTTP happy paths + fixtures |
| 🔷 Schemathesis only | ~357+ | OAS tables; not itemized here |
| ⏭ Planned / skipped | ~8 | §3.4.3/3.4.5, §3.6.7/3.6.8, §3.7.5/3.7.6 |
| ❌ Not covered | ~15 | §2.4 unknown options, §3.2.1 proof prose, §3.6.5 referenceId, §3.8 ProblemDetails behavior, Appendix B |
| ⊘ Out of scope | remainder | MAY clauses, client role, deployment choices |

For per-test config keys and command examples, see [test-coverage.md](test-coverage.md).
