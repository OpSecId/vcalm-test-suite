# VCALM test coverage matrix

Maps each test file to normative statements. OAS field-level MUSTs are covered
by Schemathesis (`npm run test:schema`), not listed here.

## Test layout

Behavioral tests mirror the VCALM spec TOC — one directory per section.
Naming: `{section}-{Title}/` and `{section}.{subsection}-{Name}.js` (dash always
follows the section or subsection number). Config keys (`issuers`, `verifiers`,
…) stay role-based.

| Directory | Spec section | Status |
|-----------|--------------|--------|
| `1.3-Conformance/` | §1.3 service roles | `services.js` |
| `3.2-Issuing/` | §3.2 Issuing | `3.2.1-issue-credential.js`, `3.2.2-get-credential.js`, `3.2.3-delete-credential.js` |
| `3.3-Verifying/` | §3.3 Verifying | `3.3.1-VerifyCredential.js`, `3.3.2-VerifyPresentation.js`, `3.3.3-CreateChallenge.js` |
| `3.4-RequestingAPresentation/` | §3.4 Requesting a Presentation | `3.4.1-VerifiablePresentationRequest.js`, `3.4.2-QueryByExample.js`, `3.4.3-DIDAuthentication.js`, `3.4.4-AuthorizationCapabilityRequest.js`, `3.4.5-LogicalOperationsInQueries.js` |
| `3.5-Presenting/` | §3.5 Presenting | `3.5.1-DeriveCredential.js`, `3.5.2-CreatePresentation.js`, `3.5.3-GetPresentations.js`, `3.5.4-GetASpecificPresentation.js`, `3.5.5-DeleteASpecificPresentation.js` |
| `3.6-WorkflowsAndExchanges/` | §3.6 Workflows and Exchanges | `3.6.1-CreateWorkflow.js` … `3.6.8-ExchangeExamples.js` |
| `3.7-InitiatingInteractions/` | §3.7 Initiating Interactions | `3.7.1-InteractionURLFormat.js` … `3.7.6-vcapiInteractionProtocol.js` |
| `3.8-ErrorHandling/` | §3.8 Error Handling | `3.8.1-VerificationErrorsVsWarnings.js` |

## Mocha behavioral tests

| Test file | Normative statement | Spec link |
|-----------|---------------------|-----------|
| `1.3-Conformance/services.js` → Issuer | §1.3: issuer service **MUST** provide Issue Credential (§3.2.1) | [#conformance](https://www.w3.org/TR/vcalm-1.0/#conformance) |
| `1.3-Conformance/services.js` → Verifier | §1.3: verifier service **MUST** provide Verify Credential (§3.3.1) | [#conformance](https://www.w3.org/TR/vcalm-1.0/#conformance) |
| `1.3-Conformance/services.js` → VP verifier | §1.3: verifier service **MUST** provide Verify Presentation (§3.3.2) | [#conformance](https://www.w3.org/TR/vcalm-1.0/#conformance) |
| `1.3-Conformance/services.js` → Holder (optional) | §1.3: holder service **MUST** provide Get Exchange Protocols + Participate in Exchange | [#conformance](https://www.w3.org/TR/vcalm-1.0/#conformance) |
| `1.3-Conformance/services.js` → Status (optional) | §1.3: status service **MUST** provide Update Status (Appendix C.3) | [#conformance](https://www.w3.org/TR/vcalm-1.0/#conformance) |
| `3.2-Issuing/3.2.1-issue-credential.js` | §3.2.1: issue credential → HTTP **201** + signed VC | [#issue-credential](https://www.w3.org/TR/vcalm-1.0/#issue-credential) |
| `3.2-Issuing/3.2.2-get-credential.js` | §3.2.2: get credential → HTTP **200** + signed VC | [#get-a-specific-credential](https://www.w3.org/TR/vcalm-1.0/#get-a-specific-credential) |
| `3.2-Issuing/3.2.3-delete-credential.js` | §3.2.3: delete credential → HTTP **202** | [#delete-a-specific-credential](https://www.w3.org/TR/vcalm-1.0/#delete-a-specific-credential) |
| `3.3-Verifying/3.3.1-VerifyCredential.js` | §3.3.1: verify credential → HTTP **200** + `verified: true` | [#verify-credential](https://www.w3.org/TR/vcalm-1.0/#verify-credential) |
| `3.3-Verifying/3.3.2-VerifyPresentation.js` | §3.3.2: verify presentation → HTTP **200** + `verified: true` | [#verify-presentation](https://www.w3.org/TR/vcalm-1.0/#verify-presentation) |
| `3.5-Presenting/3.5.2-CreatePresentation.js` | §3.5.2: create presentation → HTTP **201** + signed VP | [#create-presentation](https://www.w3.org/TR/vcalm-1.0/#create-presentation) |
| `3.5-Presenting/3.5.1-DeriveCredential.js` | §3.5.1: derive credential → HTTP **201** + signed VC | [#derive-credential](https://www.w3.org/TR/vcalm-1.0/#derive-credential) |
| `3.5-Presenting/3.5.3-GetPresentations.js` | §3.5.3: get presentations → HTTP **200** + array | [#get-presentations](https://www.w3.org/TR/vcalm-1.0/#get-presentations) |
| `3.5-Presenting/3.5.4-GetASpecificPresentation.js` | §3.5.4: get presentation by id → HTTP **200** | [#get-a-specific-presentation](https://www.w3.org/TR/vcalm-1.0/#get-a-specific-presentation) |
| `3.5-Presenting/3.5.5-DeleteASpecificPresentation.js` | §3.5.5: delete presentation by id → HTTP **202** | [#delete-a-specific-presentation](https://www.w3.org/TR/vcalm-1.0/#delete-a-specific-presentation) |
| `3.3-Verifying/3.3.3-CreateChallenge.js` | §3.3.3: create challenge → HTTP **200** + `challenge` string | [#create-challenge](https://www.w3.org/TR/vcalm-1.0/#create-challenge) |
| `3.4-RequestingAPresentation/3.4.1-VerifiablePresentationRequest.js` | §3.4.1: `query` **REQUIRED**; each entry **MUST** define `type` | [#verifiable-presentation-request](https://www.w3.org/TR/vcalm-1.0/#verifiable-presentation-request) |
| `3.4-RequestingAPresentation/3.4.2-QueryByExample.js` | §3.4.2: **SHOULD** include SD cryptosuites in `acceptedCryptosuites` | [#query-by-example](https://www.w3.org/TR/vcalm-1.0/#query-by-example) |
| `3.4-RequestingAPresentation/3.4.3-DIDAuthentication.js` | §3.4.3: DID Authentication response **MUST** be a VP | [#did-authentication](https://www.w3.org/TR/vcalm-1.0/#did-authentication) |
| `3.4-RequestingAPresentation/3.4.4-AuthorizationCapabilityRequest.js` | §3.4.4: deferred (spec Issue 3) | [#authorization-capability-request](https://www.w3.org/TR/vcalm-1.0/#authorization-capability-request) |
| `3.4-RequestingAPresentation/3.4.5-LogicalOperationsInQueries.js` | §3.4.5: AND within `group`, OR across groups | [#logical-operations-in-queries](https://www.w3.org/TR/vcalm-1.0/#logical-operations-in-queries) |
| `3.6-WorkflowsAndExchanges/3.6.1-CreateWorkflow.js` | §3.6.1: create workflow → HTTP **201/204** + `Location` | [#create-workflow](https://www.w3.org/TR/vcalm-1.0/#create-workflow) |
| `3.6-WorkflowsAndExchanges/3.6.2-GetWorkflowConfiguration.js` | §3.6.2: get workflow configuration → HTTP **200** | [#get-workflow-configuration](https://www.w3.org/TR/vcalm-1.0/#get-workflow-configuration) |
| `3.6-WorkflowsAndExchanges/3.6.3-CreateExchange.js` | §3.6.3: create exchange → HTTP **201/204** + `Location` | [#create-exchange](https://www.w3.org/TR/vcalm-1.0/#create-exchange) |
| `3.6-WorkflowsAndExchanges/3.6.4-GetExchangeProtocols.js` | §3.6.4: get exchange protocols → HTTP **200** | [#get-exchange-protocols](https://www.w3.org/TR/vcalm-1.0/#get-exchange-protocols) |
| `3.6-WorkflowsAndExchanges/3.6.5-ParticipateInAnExchange.js` | §3.6.5: participate in exchange → HTTP **200** | [#participate-in-an-exchange](https://www.w3.org/TR/vcalm-1.0/#participate-in-an-exchange) |
| `3.6-WorkflowsAndExchanges/3.6.6-GetExchangeState.js` | §3.6.6: get exchange state → HTTP **200** | [#get-exchange-state](https://www.w3.org/TR/vcalm-1.0/#get-exchange-state) |
| `3.6-WorkflowsAndExchanges/3.6.7-ExchangeStepCallbacks.js` | §3.6.7: exchange step callbacks | [#exchange-step-callbacks](https://www.w3.org/TR/vcalm-1.0/#exchange-step-callbacks) |
| `3.6-WorkflowsAndExchanges/3.6.8-ExchangeExamples.js` | §3.6.8: normative exchange examples | [#exchange-examples](https://www.w3.org/TR/vcalm-1.0/#exchange-examples) |
| `3.7-InitiatingInteractions/3.7.1-InteractionURLFormat.js` | §3.7.1: interaction URL **MUST** include `iuv=1` | [#interaction-url-format](https://www.w3.org/TR/vcalm-1.0/#interaction-url-format) |
| `3.7-InitiatingInteractions/3.7.2-InteractionQRCodeFormat.js` | §3.7.2: QR-encoded URL **MUST NOT** exceed 4,296 characters | [#interaction-qr-code-format](https://www.w3.org/TR/vcalm-1.0/#interaction-qr-code-format) |
| `3.7-InitiatingInteractions/3.7.3-InteractionSchemeFormat.js` | §3.7.3: `interaction:` scheme **MUST** conform to URL syntax | [#interaction-scheme-format](https://www.w3.org/TR/vcalm-1.0/#interaction-scheme-format) |
| `3.7-InitiatingInteractions/3.7.4-InteractionProtocolsResponse.js` | §3.7.4: protocols object **MUST** advertise `inviteRequest` and/or `vcapi` | [#interaction-protocols-response](https://www.w3.org/TR/vcalm-1.0/#interaction-protocols-response) |
| `3.7-InitiatingInteractions/3.7.5-inviteRequestInteractionProtocol.js` | §3.7.5: inviteRequest protocol (planned) | [#inviterequest-interaction-protocol](https://www.w3.org/TR/vcalm-1.0/#inviterequest-interaction-protocol) |
| `3.7-InitiatingInteractions/3.7.6-vcapiInteractionProtocol.js` | §3.7.6: vcapi protocol (planned) | [#vcapi-interaction-protocol](https://www.w3.org/TR/vcalm-1.0/#vcapi-interaction-protocol) |
| `3.8-ErrorHandling/3.8.1-VerificationErrorsVsWarnings.js` | §3.8.1: errors → `verified: false`; no errors → `verified: true` | [#verification-errors-vs-warnings](https://www.w3.org/TR/vcalm-1.0/#verification-errors-vs-warnings) |

### Implementation requirements per test

| Test | `localConfig` endpoints needed |
|------|--------------------------------|
| §1.3 issuer smoke | `issuers` tagged `VCALM` |
| §1.3 verifier smoke | `verifiers` tagged `VCALM` |
| §1.3 VP verifier smoke | `vpVerifiers` tagged `VCALM` |
| §3.2.1 issue | `issuers` |
| §3.2.2 get credential | `issuers` (skips if GET not implemented) |
| §3.2.3 delete credential | `issuers` (skips if DELETE not implemented) |
| §3.3.1 verify VC | `issuers` + `verifiers` (same implementation entry) |
| §3.3.2 verify VP | `issuers` + `holders` + `vpVerifiers` (issue → create → verify) |
| §3.3.3 create challenge | `verifiers` or `vpVerifiers` (skips if not implemented) |
| §3.5.1 derive | `issuers` + `holders` (skips if not implemented) |
| §3.5.2 create presentation | `issuers` + `holders` |
| §3.5.3 get presentations | `holders` (skips if not implemented) |
| §3.5.4 get presentation | `issuers` + `holders` + stored presentation `id` |
| §3.5.5 delete presentation | `issuers` + `holders` + stored presentation `id` |
| §3.4.1–3.4.5 | fixture / exchange tests (no dedicated HTTP endpoint) |
| §3.6.1–3.6.6 | `workflows` (stateful; skips if not implemented) |
| §3.6.7–3.6.8 | planned (callback capability URL / spec examples) |
| §3.7.1–3.7.3 | fixture (no HTTP endpoint) |
| §3.7.4 | `interactions` (skips if GET not implemented) |
| §3.7.5–3.7.6 | planned (live inviteRequest / vcapi exchange flow) |
| §3.8.1 verify VC | `issuers` + `verifiers` (issue → verify; tampered negative) |
| §3.8.1 verify VP | `issuers` + `holders` + `vpVerifiers` (issue → present → verify) |

When endpoints use path-specific URLs:

```js
issuers: [{ endpoint: `${baseUrl}/credentials/issue`, tags: ['VCALM'] }],
holders: [{ endpoint: `${baseUrl}/presentations`, tags: ['VCALM'] }],
vpVerifiers: [{ endpoint: `${baseUrl}/presentations/verify`, tags: ['VCALM'] }],
```

Unified gateways (e.g. credential.ninja) may use the same `baseUrl` for all roles.

## Configuration guide

### Two configs, two jobs

| File | Used by | `endpoint` / `baseUrl` meaning |
|------|---------|--------------------------------|
| `localConfig.cjs` | **Mocha** (`npm test`) | Each role's `endpoint` is the **full operation URL** (POST/GET target) |
| `schemathesis.local.cjs` | **Schemathesis** (`npm run test:schema`) | `baseUrl` is the **instance root**; paths come from `oas.yaml` |

Use the same host for both; only the path depth differs.

### Mocha: what to register

Register only roles your deployment implements. Tests skip missing pairings
(e.g. no VP test without `holders` + `vpVerifiers`).

| Profile | Register in `localConfig.cjs` | Tests enabled |
|---------|------------------------------|---------------|
| Issuer only | `issuers` | §1.3 issuer smoke, §3.2.1 issue |
| Verifier only | `verifiers`, `vpVerifiers` | §1.3 verifier smoke |
| Issuer + verifier | `issuers`, `verifiers` | + §3.3.1 verify VC |
| Full §1.3 core | above + `holders` | + §3.3.2 verify VP |
| Holder §1.3 (exchange) | `workflows` + `probes` | §1.3 holder smoke |
| Status | `issuers` with `VCALM:status` | §1.3 status smoke |

See `localConfig.example.cjs` for unified-gateway vs explicit-path templates.

### Schemathesis: testing all endpoints

Mocha does **not** iterate every OAS operation — use Schemathesis profiles:

```sh
cp schemathesis.local.example.cjs schemathesis.local.cjs
BASE_URL=http://localhost:40443/my-instance npm run test:schema                    # §1.3 core (3 ops)
VCALM_SCHEMA_PROFILE=issuer npm run test:schema                                    # §3.2 + status
VCALM_SCHEMA_PROFILE=verifier npm run test:schema                                  # §3.3
VCALM_SCHEMA_PROFILE=holder npm run test:schema                                    # §3.5
VCALM_SCHEMA_PROFILE=workflow npm run test:schema                                  # §3.6
VCALM_SCHEMA_PROFILE=full npm run test:schema                                      # all 22 operations
```

Run profiles against a **throwaway instance** — `full` and workflow ops may create
or mutate state. Many 4xx responses are expected (fuzzed invalid bodies).

To cover everything in CI, run `phase1-core` on every PR and `full` (or per-role
profiles) on a schedule or manual workflow.

### All OAS operations (Schemathesis `full` profile)

| operationId | Path | Area |
|-------------|------|------|
| `issueCredential` | POST `/credentials/issue` | §3.2 |
| `getCredential` | GET `/credentials/{id}` | §3.2 |
| `deleteCredential` | DELETE `/credentials/{id}` | §3.2 |
| `updateCredentialStatus` | POST `/credentials/status` | status |
| `createStatusList` | POST `/status-lists` | status |
| `getStatusList` | GET `/status-lists/{id}` | status |
| `verifyCredential` | POST `/credentials/verify` | §3.3 |
| `verifyPresentation` | POST `/presentations/verify` | §3.3 |
| `challenge` | POST `/challenges` | §3.3 |
| `deriveCredential` | POST `/credentials/derive` | §3.5 |
| `createPresentation` | POST `/presentations` | §3.5 |
| `getPresentations` | GET `/presentations` | §3.5 |
| `getPresentation` | GET `/presentations/{id}` | §3.5 |
| `deletePresentation` | DELETE `/presentations/{id}` | §3.5 |
| `createWorkflow` | POST `/workflows` | §3.6 |
| `getWorkflowConfiguration` | GET `/workflows/{localWorkflowId}` | §3.6 |
| `createExchange` | POST `.../exchanges` | §3.6 |
| `getExchangeConfiguration` | GET `.../exchanges/{localExchangeId}` | §3.6 |
| `participateInExchange` | POST `.../exchanges/{localExchangeId}` | §3.6 |
| `getSupportedProtocolsConfiguration` | GET `.../protocols` | §3.6 |
| `callback` | POST `/callbacks/{localCallbackId}` | §3.6 |
| `startInteraction` | GET interaction URL | §3.7 |
| `receiveInvitationResponse` | POST invitation | §3.7 |

Mocha will gain behavioral tests for prose requirements over time; Schemathesis
owns shape coverage for the full surface.

### Schemathesis profile summary

| Profile | Operations | Normative source |
|---------|------------|------------------|
| `phase1-core` (default) | issue, verify VC, verify VP | §1.3 minimum |
| `issuer` | §3.2 + status lists | OAS |
| `verifier` | §3.3 | OAS |
| `holder` | §3.5 | OAS |
| `workflow` | §3.6 + callbacks | OAS |
| `full` | all 22 operations | OAS |

## Not ported from CCG vc-api suites

| CCG test pattern | Reason | Covered by |
|------------------|--------|------------|
| `credential MUST have @context` negatives | OAS / VCDM field rules | Schemathesis |
| `MUST not verify if proof missing` negatives | OAS / verifier behavior tables | Schemathesis |
| JWT / enveloped profiles | deferred profile | future optional suite |

## Planned (prose normative, no test yet)

| Statement | Section |
|-----------|---------|
| Multi-proof in single issue response | §3.2.1 prose |
| Proof sets / chains configuration | §3.2.1 prose |
| Unknown `options` → error | §2.4 |
| Exchange `referenceId` correlation | §3.6.5 |

See [normative-requirements.md](normative-requirements.md) for the full prose inventory.
See [normative-mapping.md](normative-mapping.md) for a file-tree map of statements → tests.
