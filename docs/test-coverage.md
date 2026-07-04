# VCALM test coverage matrix

Maps each test file to normative statements. OAS field-level MUSTs are covered
by Schemathesis on branch `feature/vcalm-oas-pin`, not listed here.

`it()` titles come from [`tests/normative-statements.js`](../tests/normative-statements.js):
verbatim VCALM TR / OAS text, plus suite-defined `negative.*` keys for anti-stub tests.

Normative inventory and file-tree mapping: branch `feature/vcalm-docs`.

## Coverage summary (prose / conformance / config)

Excludes **357+** OAS table MUSTs (Schemathesis on `feature/vcalm-oas-pin`).

| Status | Approx. | Notes |
|--------|--------:|-------|
| ✅ Active Mocha | **~92%** of testable prose | Fixture + HTTP happy paths + negatives |
| ⏭ Skipped / deferred | **4** | §3.4.4, §3.6.8, §3.7.5, §3.7.6 |
| ❌ Not covered | **0** | — |
| 🔷 Schemathesis only | **357+** | `feature/vcalm-oas-pin` → `npm run test:schema` |

## Test layout

Behavioral tests mirror the VCALM spec TOC — one directory per section.
Naming: `{section}-{Title}/` and `{section}.{subsection}-{Name}.js` (dash always
follows the section or subsection number). Config keys (`issuers`, `verifiers`,
…) stay role-based.

Mocha runs `tests/*/**/*.js` only — helpers at `tests/*.js` (e.g.
`helpers.js`, `negative-fixtures.js`) are not loaded as test files.

| Directory | Spec section | Files |
|-----------|--------------|-------|
| `1.3-Conformance/` | §1.3 service roles | `services.js` |
| `2.4-Configurations/` | §2.4 Configurations | `2.4.1-ContentSerialization.js`, `2.4.2-UnknownOptions.js`, `2.4.3-Authorization.js`, `2.4.4-RecommendedVcPayloadSize.js` |
| `3.2-Issuing/` | §3.2 Issuing | `3.2.1` … `3.2.6-IssueCredentialNegatives.js` |
| `3.3-Verifying/` | §3.3 Verifying | `3.3.1` … `3.3.5-VerifyPresentationNegatives.js` |
| `3.4-Requesting/` | §3.4 Requesting | `3.4.1` … `3.4.5-LogicalOperationsInQueries.js` |
| `3.5-Presenting/` | §3.5 Presenting | `3.5.1` … `3.5.5-DeleteASpecificPresentation.js` |
| `3.6-Workflows/` | §3.6 Workflows | `3.6.1` … `3.6.8-ExchangeExamples.js`, `3.6.1.1-IssueRequestVariablesAndResult.js`, `3.6.5.1-ExchangeReferenceId.js` |
| `3.7-InitiatingInteractions/` | §3.7 Initiating Interactions | `3.7.1` … `3.7.6-vcapiInteractionProtocol.js` |
| `3.8-ErrorHandling/` | §3.8 Error Handling | `3.8.1-VerificationErrorsVsWarnings.js`, `3.8.2-ProblemDetails.js` |
| `appendix-B-Security/` | Appendix B (selected) | `B.1-StripUnrecognizedProofs.js`, `B.4-InstancePayloadLimits.js` |

Shared helpers (not listed as spec sections): `tests/negative-fixtures.js`,
`tests/fixtures/reference-foreign-vc.json`, `tests/fixtures/reference-foreign-vp.json`.

## Mocha behavioral tests

Legend: **fixture** = no live endpoint; **HTTP** = matrix against `localConfig.cjs`;
**config** = audits registered implementation settings.

### §1.3 Conformance

| Test file | `NORMATIVE` key / statement | Layer | Spec link |
|-----------|----------------------------|-------|-----------|
| `1.3-Conformance/services.js` → Issuer | `conformance.issuer` | HTTP probe (malformed issue body) | [#conformance](https://www.w3.org/TR/vcalm-1.0/#conformance) |
| `1.3-Conformance/services.js` → Verifier | `conformance.verifier` | HTTP probe (malformed verify bodies) | [#conformance](https://www.w3.org/TR/vcalm-1.0/#conformance) |
| `1.3-Conformance/services.js` → Holder (optional) | `conformance.holder` | HTTP probe | [#conformance](https://www.w3.org/TR/vcalm-1.0/#conformance) |
| `1.3-Conformance/services.js` → Status (optional) | `conformance.status` | HTTP probe | [#conformance](https://www.w3.org/TR/vcalm-1.0/#conformance) |

### §2.4 Configurations

| Test file | `NORMATIVE` key | Layer | Spec link |
|-----------|-----------------|-------|-----------|
| `2.4-Configurations/2.4.1-ContentSerialization.js` | `configuration.jsonContentType` | HTTP | [#content-serialization](https://www.w3.org/TR/vcalm-1.0/#content-serialization) |
| `2.4-Configurations/2.4.2-UnknownOptions.js` | `configuration.unknownOptions` | HTTP | [#options](https://www.w3.org/TR/vcalm-1.0/#options) |
| `2.4-Configurations/2.4.3-Authorization.js` | `configuration.mustNotStaticCredentials` | config | [#authorization](https://www.w3.org/TR/vcalm-1.0/#authorization) |
| `2.4-Configurations/2.4.4-RecommendedVcPayloadSize.js` | `configuration.vcPayloadBaseline` | fixture + config | [#payload-sizes](https://www.w3.org/TR/vcalm-1.0/#payload-sizes) |

### §3.2 Issuing

| Test file | `NORMATIVE` key | Layer | Spec link |
|-----------|-----------------|-------|-----------|
| `3.2-Issuing/3.2.1-issue-credential.js` | `issuing.issue` | HTTP | [#issue-credential](https://www.w3.org/TR/vcalm-1.0/#issue-credential) |
| `3.2-Issuing/3.2.2-get-credential.js` | `issuing.get` | HTTP | [#get-a-specific-credential](https://www.w3.org/TR/vcalm-1.0/#get-a-specific-credential) |
| `3.2-Issuing/3.2.3-delete-credential.js` | `issuing.delete` | HTTP | [#delete-a-specific-credential](https://www.w3.org/TR/vcalm-1.0/#delete-a-specific-credential) |
| `3.2-Issuing/3.2.4-MultipleProofsInSingleResponse.js` | `issuing.multipleProofs` | HTTP (probe) | [#issue-credential](https://www.w3.org/TR/vcalm-1.0/#issue-credential) |
| `3.2-Issuing/3.2.5-ProofSetsAndChainsConfiguration.js` | `issuing.proofHandling` | fixture + HTTP (probe) | [#issue-credential](https://www.w3.org/TR/vcalm-1.0/#issue-credential) |
| `3.2-Issuing/3.2.6-IssueCredentialNegatives.js` | `negative.issue*` | HTTP | [#issue-credential](https://www.w3.org/TR/vcalm-1.0/#issue-credential) |

### §3.3 Verifying

| Test file | `NORMATIVE` key | Layer | Spec link |
|-----------|-----------------|-------|-----------|
| `3.3-Verifying/3.3.1-VerifyCredential.js` | `verifying.verifyCredential` | HTTP | [#verify-credential](https://www.w3.org/TR/vcalm-1.0/#verify-credential) |
| `3.3-Verifying/3.3.2-VerifyPresentation.js` | `verifying.verifyPresentation` | HTTP | [#verify-presentation](https://www.w3.org/TR/vcalm-1.0/#verify-presentation) |
| `3.3-Verifying/3.3.3-CreateChallenge.js` | `verifying.challenge` | HTTP | [#create-challenge](https://www.w3.org/TR/vcalm-1.0/#create-challenge) |
| `3.3-Verifying/3.3.4-VerifyCredentialNegatives.js` | `negative.verifyCredential*` | HTTP | [#verify-credential](https://www.w3.org/TR/vcalm-1.0/#verify-credential) |
| `3.3-Verifying/3.3.5-VerifyPresentationNegatives.js` | `negative.verifyPresentation*` | HTTP | [#verify-presentation](https://www.w3.org/TR/vcalm-1.0/#verify-presentation) |

### §3.4 Requesting

| Test file | `NORMATIVE` key | Layer | Spec link |
|-----------|-----------------|-------|-----------|
| `3.4-Requesting/3.4.1-VerifiablePresentationRequest.js` | `requestingPresentation.queryRequired`, `queryType` | fixture | [#verifiable-presentation-request](https://www.w3.org/TR/vcalm-1.0/#verifiable-presentation-request) |
| `3.4-Requesting/3.4.2-QueryByExample.js` | `requestingPresentation.queryByExample` | fixture | [#query-by-example](https://www.w3.org/TR/vcalm-1.0/#query-by-example) |
| `3.4-Requesting/3.4.3-DIDAuthentication.js` | `didAuthenticationQueryType`, `didAuthentication` | fixture | [#did-authentication](https://www.w3.org/TR/vcalm-1.0/#did-authentication) |
| `3.4-Requesting/3.4.4-AuthorizationCapabilityRequest.js` | `authorizationCapability` | ⏭ `describe.skip` | [#authorization-capability-request](https://www.w3.org/TR/vcalm-1.0/#authorization-capability-request) |
| `3.4-Requesting/3.4.5-LogicalOperationsInQueries.js` | `logicalOperations` | fixture | [#logical-operations-in-queries](https://www.w3.org/TR/vcalm-1.0/#logical-operations-in-queries) |

### §3.5 Presenting

| Test file | `NORMATIVE` key | Layer | Spec link |
|-----------|-----------------|-------|-----------|
| `3.5-Presenting/3.5.1-DeriveCredential.js` | `presenting.derive` | HTTP | [#derive-credential](https://www.w3.org/TR/vcalm-1.0/#derive-credential) |
| `3.5-Presenting/3.5.2-CreatePresentation.js` | `presenting.create` | HTTP | [#create-presentation](https://www.w3.org/TR/vcalm-1.0/#create-presentation) |
| `3.5-Presenting/3.5.3-GetPresentations.js` | `presenting.getList` | HTTP | [#get-presentations](https://www.w3.org/TR/vcalm-1.0/#get-presentations) |
| `3.5-Presenting/3.5.4-GetASpecificPresentation.js` | `presenting.getById` | HTTP | [#get-a-specific-presentation](https://www.w3.org/TR/vcalm-1.0/#get-a-specific-presentation) |
| `3.5-Presenting/3.5.5-DeleteASpecificPresentation.js` | `presenting.deleteById` | HTTP | [#delete-a-specific-presentation](https://www.w3.org/TR/vcalm-1.0/#delete-a-specific-presentation) |

### §3.6 Workflows

| Test file | `NORMATIVE` key | Layer | Spec link |
|-----------|-----------------|-------|-----------|
| `3.6-Workflows/3.6.1-CreateWorkflow.js` | `workflows.create` | HTTP | [#create-workflow](https://www.w3.org/TR/vcalm-1.0/#create-workflow) |
| `3.6-Workflows/3.6.1.1-IssueRequestVariablesAndResult.js` | `issueRequestVariables`, `issueRequestResult` | fixture | [#workflow-configuration](https://www.w3.org/TR/vcalm-1.0/#workflow-configuration) |
| `3.6-Workflows/3.6.2-GetWorkflowConfiguration.js` | `workflows.getConfiguration` | HTTP | [#get-workflow-configuration](https://www.w3.org/TR/vcalm-1.0/#get-workflow-configuration) |
| `3.6-Workflows/3.6.3-CreateExchange.js` | `workflows.createExchange` | HTTP | [#create-exchange](https://www.w3.org/TR/vcalm-1.0/#create-exchange) |
| `3.6-Workflows/3.6.4-GetExchangeProtocols.js` | `workflows.getProtocols` | HTTP | [#get-exchange-protocols](https://www.w3.org/TR/vcalm-1.0/#get-exchange-protocols) |
| `3.6-Workflows/3.6.5-ParticipateInAnExchange.js` | `workflows.participate` | HTTP | [#participate-in-an-exchange](https://www.w3.org/TR/vcalm-1.0/#participate-in-an-exchange) |
| `3.6-Workflows/3.6.5.1-ExchangeReferenceId.js` | `referenceIdServerMay`, `referenceIdUrnUuid`, `referenceIdEcho` | fixture | [#participate-in-an-exchange](https://www.w3.org/TR/vcalm-1.0/#participate-in-an-exchange) |
| `3.6-Workflows/3.6.6-GetExchangeState.js` | `workflows.getState` | HTTP | [#get-exchange-state](https://www.w3.org/TR/vcalm-1.0/#get-exchange-state) |
| `3.6-Workflows/3.6.7-ExchangeStepCallbacks.js` | `workflows.callbacks` | HTTP | [#exchange-step-callbacks](https://www.w3.org/TR/vcalm-1.0/#exchange-step-callbacks) |
| `3.6-Workflows/3.6.8-ExchangeExamples.js` | `workflows.examples` | ⏭ `it.skip` | [#exchange-examples](https://www.w3.org/TR/vcalm-1.0/#exchange-examples) |

### §3.7 Initiating Interactions

| Test file | `NORMATIVE` key | Layer | Spec link |
|-----------|-----------------|-------|-----------|
| `3.7-InitiatingInteractions/3.7.1-InteractionURLFormat.js` | `interactionUrl`, `interactionHttps`, `interactionOpaque`, `interactionNoExtraQuery` | fixture | [#interaction-url-format](https://www.w3.org/TR/vcalm-1.0/#interaction-url-format) |
| `3.7-InitiatingInteractions/3.7.2-InteractionQRCodeFormat.js` | `qrCode`, `qrCodeMaxLength` | fixture | [#interaction-qr-code-format](https://www.w3.org/TR/vcalm-1.0/#interaction-qr-code-format) |
| `3.7-InitiatingInteractions/3.7.3-InteractionSchemeFormat.js` | `scheme` | fixture | [#interaction-scheme-format](https://www.w3.org/TR/vcalm-1.0/#interaction-scheme-format) |
| `3.7-InitiatingInteractions/3.7.4-InteractionProtocolsResponse.js` | `protocolsJson`, `protocolsHtml` | fixture + HTTP | [#interaction-protocols-response](https://www.w3.org/TR/vcalm-1.0/#interaction-protocols-response) |
| `3.7-InitiatingInteractions/3.7.5-inviteRequestInteractionProtocol.js` | `inviteRequest` | ⏭ `it.skip` | [#inviterequest-interaction-protocol](https://www.w3.org/TR/vcalm-1.0/#inviterequest-interaction-protocol) |
| `3.7-InitiatingInteractions/3.7.6-vcapiInteractionProtocol.js` | `vcapi` | ⏭ `it.skip` | [#vcapi-interaction-protocol](https://www.w3.org/TR/vcalm-1.0/#vcapi-interaction-protocol) |

### §3.8 Error Handling

| Test file | `NORMATIVE` key | Layer | Spec link |
|-----------|-----------------|-------|-----------|
| `3.8-ErrorHandling/3.8.1-VerificationErrorsVsWarnings.js` | `verifiedFalse`, `verifiedTrue` | fixture + HTTP | [#verification-errors-vs-warnings](https://www.w3.org/TR/vcalm-1.0/#verification-errors-vs-warnings) |
| `3.8-ErrorHandling/3.8.2-ProblemDetails.js` | `problemDetailsType`, `problemDetailsReadable`, `unknownOptionType` | fixture | [#problemdetails](https://www.w3.org/TR/vcalm-1.0/#problemdetails) |

### Appendix B — Security

| Test file | `NORMATIVE` key | Layer | Spec link |
|-----------|-----------------|-------|-----------|
| `appendix-B-Security/B.1-StripUnrecognizedProofs.js` | `security.stripUnrecognizedProofs` | fixture | [#proof-type-allow-lists](https://www.w3.org/TR/vcalm-1.0/#proof-type-allow-lists) |
| `appendix-B-Security/B.4-InstancePayloadLimits.js` | `security.instancePayloadLimits` | config | [#instance-payload-limits](https://www.w3.org/TR/vcalm-1.0/#instance-payload-limits) |

### Implementation requirements per test

| Test | `localConfig` endpoints / probes needed |
|------|----------------------------------------|
| §1.3 issuer smoke | `issuers` tagged `VCALM` (malformed issue probe) |
| §1.3 verifier smoke | `verifiers` tagged `VCALM` (malformed verify probes; resolves `/presentations/verify`) |
| §1.3 holder smoke | `workflows` + `probes.exchangeProtocols`, `probes.participateExchange` |
| §1.3 status smoke | `issuers` tagged `VCALM:status` |
| §2.4.1 content serialization | `issuers` (checks `Content-Type` on issue response) |
| §2.4.2 unknown options | `issuers` (skips if issuer accepts unknown option with 201) |
| §2.4.3 authorization | any registered endpoints (config audit only) |
| §2.4.4 VC payload baseline | fixture; optional `settings.vcPayloadLimitBytes` audit |
| §3.2.1 issue | `issuers` |
| §3.2.4 multi-proof | `issuers` + `settings.probes.multiProofIssueBody` |
| §3.2.5 proof handling | fixture; optional `settings.probes.proofHandlingMode` HTTP |
| §3.2.6 issue negatives | `issuers` |
| §3.2.2 get / §3.2.3 delete | `issuers` (skip 404/501) |
| §3.3.1 verify VC | `issuers` + `verifiers` |
| §3.3.2 verify VP | `issuers` + `holders` + `verifiers` |
| §3.3.3 challenge | `verifiers` (skip 404/501) |
| §3.3.4–3.3.5 verify negatives | same pairing as §3.3.1 / §3.3.2 |
| §3.4.1–3.4.5 | fixture only |
| §3.5.* | `holders` (+ `issuers` for flows that issue first) |
| §3.6.1–3.6.6 | `workflows` (stateful; skip 404/501) |
| §3.6.1.1 variables / result | fixture only |
| §3.6.5.1 referenceId | fixture only |
| §3.6.7 callbacks | `workflows` (skip 404/501) |
| §3.7.1–3.7.3 | fixture only |
| §3.7.4 JSON protocols | `interactions` (skip 404/501) |
| §3.7.4 HTML Accept | `interactions` (skip 404/501) |
| §3.8.1 | `issuers` + `verifiers` and/or full VP flow |
| §3.8.2 ProblemDetails | fixture only |
| Appendix B.1 | fixture only |
| Appendix B.4 | optional `settings.instancePayloadLimitBytes` audit |

Optional probe example (`localConfig.cjs`):

```js
issuers: [{
  endpoint: `${baseUrl}/credentials/issue`,
  tags: ['VCALM'],
  probes: {
    multiProofIssueBody: {
      credential: {/* … */},
      options: {/* instance-specific multi-proof request */}
    }
  }
}],
interactions: [{
  endpoint: `${baseUrl}/interactions`,
  tags: ['VCALM'],
  probes: {
    interactionId: 'urn:uuid:interaction-fixture',
    interactionStart:
      `${baseUrl}/interactions/urn:uuid:interaction-fixture?iuv=1`
  }
}]
```

When endpoints use path-specific URLs:

```js
issuers: [{ endpoint: `${baseUrl}/credentials/issue`, tags: ['VCALM'] }],
holders: [{ endpoint: `${baseUrl}/presentations`, tags: ['VCALM'] }],
verifiers: [{ endpoint: `${baseUrl}/credentials/verify`, tags: ['VCALM'] }],
```

Unified gateways (e.g. credential.ninja) may use the same `baseUrl` for all roles.

## VCALM tag and endpoint registration

This section explains how the **`VCALM` tag** selects implementations and how each
role's `endpoint` string is interpreted. URL helpers live in
[`tests/helpers.js`](../tests/helpers.js); role definitions in
[`tests/service-profiles.js`](../tests/service-profiles.js).

### Tags

| Tag | Where | Effect |
|-----|-------|--------|
| `VCALM` | `tags: ['VCALM']` on any role entry | Default — implementation participates in that role's tests |
| `VCALM:status` | `tags: ['VCALM', 'VCALM:status']` on an `issuers` entry | Optional §1.3 status-service probe only (Update Status) |

Tests call `filterByTag` from `vc-test-suite-implementations`:

- **By role** — `filterByTag({ property: 'issuers', tags: ['VCALM'] })` runs only
  implementations with a tagged `issuers[]` entry.
- **Whole implementation** — `filterByTag({ tags: ['VCALM'] })` loads every
  implementation block in `localConfig.cjs` (used for cross-role flows).
- **Pairing** — helpers such as `implementationsWithPresentationFlow` require the
  **same** `implementations[]` row to have `issuers`, `holders`, and `verifiers`
  entries all tagged `VCALM`. Missing a role omits that implementation from the
  matrix for paired tests (not a failure).

### Per-role `endpoint` meaning

Each role key in `localConfig.cjs` is a **separate HTTP client** with its own
`endpoint`. The value may be either:

1. **Operation URL** — the POST (or GET) target for the primary call (Pattern B in
   `localConfig.example.cjs`), or
2. **Unified gateway root** — one base URL; the suite appends VCALM paths
   (Pattern A).

The suite **does not** require every role to use the same pattern, but all roles
for one implementation should point at the **same deployment**.

| Role key | Register for | Typical `endpoint` | Suite resolves (via `helpers.js`) |
|----------|--------------|-------------------|----------------------------------|
| `issuers` | Issue, get/delete credential, §2.4 probes | `…/credentials/issue` or gateway root | `POST` issue; `GET`/`DELETE` `…/credentials/{id}` |
| `verifiers` | Verify VC **and** VP, challenge | `…/credentials/verify` or gateway root | **Both** `…/credentials/verify` and `…/presentations/verify` from **one** entry; `…/challenges` |
| `holders` | Create/list/get/delete presentation, derive | `…/presentations` or gateway root | `POST` presentations; `GET`/`DELETE` `…/presentations/{id}`; `POST` `…/credentials/derive` |
| `workflows` | §3.6 workflow/exchange/callback | `…/workflows` or gateway root | `POST`/`GET` under `…/workflows/{id}/…`; `POST` `…/callbacks/{id}` |
| `interactions` | §3.7.4 interaction protocols | gateway root or `…/interactions` | `GET` start URL (`probes.interactionStart` or derived `…/interactions/{id}?iuv=1`) |

### Verifier: one entry, two operations

Unlike older VC-API suites, there is **no** separate `vpVerifiers` key. A single
`verifiers` entry tagged `VCALM` satisfies §1.3 verifier service conformance
(verify credential **and** verify presentation).

`resolveVerifyCredentialUrl` / `resolveVerifyPresentationUrl` derive the sibling
path when `endpoint` ends with the other verify URL or is a gateway root:

```text
endpoint = https://example/credentials/verify
  → verify VC:  …/credentials/verify
  → verify VP:  …/presentations/verify   (path swap)

endpoint = https://example/              (unified gateway)
  → verify VC:  …/credentials/verify
  → verify VP:  …/presentations/verify   (path append)
```

### Optional roles and skips

| Situation | Suite behavior |
|-----------|----------------|
| Role not registered (e.g. no `holders`) | Implementation excluded from tests that need that pairing |
| Endpoint returns **404** or **501** | `skipIfNotImplemented` — optional operation not implemented |
| Unknown option accepted with **201** | §2.4.2 test skipped (issuer policy) |
| Verify returns **4xx** on bad input | Negative tests **skipped** (prefer 200 + `verified: false` per §3.8) |

### Optional `probes` (per endpoint entry)

| `probes` field | Role | Used by |
|----------------|------|---------|
| `multiProofIssueBody` | `issuers` | §3.2.4 multi-proof |
| `proofHandlingMode` | `issuers` | §3.2.5 proof sets/chains |
| `exchangeProtocols`, `participateExchange` | `workflows` | §1.3 holder service smoke |
| `interactionId`, `interactionStart` | `interactions` | §3.7.4 HTTP |

## Configuration guide

### Configuration

| File | Used by | `endpoint` meaning |
|------|---------|-------------------|
| `localConfig.cjs` | **Mocha** (`npm test`) | Each role's `endpoint` is the **operation URL** (POST/GET target), or a **unified gateway root** when the deployment routes by path |

Schemathesis uses `schemathesis.local.cjs` on branch `feature/vcalm-oas-pin`
(instance `baseUrl` + paths from `oas.yaml`). See `docs/schemathesis/README.md` there.

### Mocha: what to register

Register only roles your deployment implements. Tests skip missing pairings
(e.g. no VP test without `holders` + `verifiers`).

| Profile | Register in `localConfig.cjs` | Tests enabled |
|---------|------------------------------|---------------|
| Issuer only | `issuers` | §1.3 issuer, §2.4.1/2.4.2, §3.2.1, §3.2.6 |
| Verifier only | `verifiers` | §1.3 verifier smoke, §3.3.4–5 (negatives only if paired) |
| Issuer + verifier | `issuers`, `verifiers` | + §3.3.1, §3.3.4, §3.8.1 (VC) |
| Full §1.3 core | above + `holders` | + §3.3.2, §3.3.5, §3.5.2, §3.8.1 (VP) |
| Holder §1.3 (exchange) | `workflows` + `probes` | §1.3 holder smoke |
| Status | `issuers` with `VCALM:status` | §1.3 status smoke |
| Interactions | `interactions` + `probes` | §3.7.4 HTTP |

See `localConfig.example.cjs` for unified-gateway vs explicit-path templates.

## Not ported from CCG vc-api suites

| CCG test pattern | Reason | Covered by |
|------------------|--------|------------|
| `credential MUST have @context` negatives | OAS / VCDM field rules | Schemathesis (`feature/vcalm-oas-pin`) |
| `MUST not verify if proof missing` negatives | Verifier must reject bad input | Mocha §3.3.4–5 + §3.8.1 |
| JWT / enveloped profiles | deferred profile | future optional suite |

## Planned (prose normative)

| Statement | Section | Notes |
|-----------|---------|-------|
| §3.4.4 Authorization Capability | §3.4.4 | spec Issue 3 — `describe.skip` |
| §3.6.8 normative exchange examples | §3.6.8 | `it.skip` |
| §3.7.5 / §3.7.6 live protocol flows | §3.7 | `it.skip` |

Full normative inventory and file-tree mapping: `git checkout feature/vcalm-docs -- docs/`.
