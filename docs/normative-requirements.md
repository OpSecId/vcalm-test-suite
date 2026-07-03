# VCALM 1.0 — Normative Requirements (by section)

Source: [VCALM v1.0](https://www.w3.org/TR/vcalm-1.0/) (WD 05 May 2026)  
Editor's draft: [w3c.github.io/vcalm](https://w3c.github.io/vcalm/)  
OpenAPI: [w3c/vcalm `oas.yaml`](https://github.com/w3c/vcalm/blob/main/oas.yaml)

Normative text is everything except sections marked *non-normative*, authoring guidelines, diagrams, examples, and notes. RFC 2119 keywords apply only when capitalized (`MUST`, `SHOULD`, `MAY`, etc.).

**Legend:** `[MUST]` · `[MUST NOT]` · `[SHOULD]` · `[SHOULD NOT]` · `[REQUIRED]` · `[RECOMMENDED]` · `[MAY]`

**Scope of this document:** Requirements extracted from **prose, conformance, and configuration** sections of the spec. **OpenAPI property and response table descriptions are excluded** — those belong in `oas.yaml` and are covered by Schemathesis (`npm run test:schema`).

**Stats (full spec, including OAS):** [vcalm-normative-stats.html](vcalm-normative-stats.html)

---

## §1 Introduction

### §1.3 Conformance

| Role | Required interfaces |
|------|---------------------|
| Issuer service | `[MUST]` `POST /credentials/issue` (§3.2.1). Other §3.2 endpoints `[MAY]` be provided. |
| Verifier service | `[MUST]` `POST /credentials/verify` (§3.3.1) and `POST /presentations/verify` (§3.3.2). Other §3.3 `[MAY]` be provided. |
| Holder service | `[MUST]` Get Exchange Protocols (§3.6.4) and Participate in Exchange (§3.6.5). Conformance to §3.7, §3.4, §3.5.2, §3.5, §3.6 `[MAY]` also be provided. |
| Status service | `[MUST]` Update Status (Appendix C.3). |
| Workflow service | `[MUST]` all interfaces in §3.6 Workflows and Exchanges. |
| Service client | `[MUST]` provide means to communicate with all `[REQUIRED]` interfaces of the corresponding service. |
| All implementations | `[MAY]` provide functionality beyond this specification. |

---

## §2 Architecture

### §2.4 Configurations

#### Base URL

- `[MAY]` Instance base URL be hostname, subdomain, or path prefix (e.g. `website.example`, `api.website.example`, `website.example/api`).

#### Authorization

- `[MUST NOT]` Requests use authorization protocols with long-lived static credentials (e.g. HTTP Basic Authentication with username/password).
- Conforming services require conforming clients to use secure authorization where an endpoint specifies it.
- `[MAY]` OAuth 2.0 access tokens be Bearer Tokens or any valid OAuth 2.0 token type; any valid grant type `[MAY]` be used.

#### Options

- All `options` properties are `[OPTIONAL]` per instance configuration.
- `[MAY]` An instance prohibit or require specific `options` keys.
- `[MAY]` Implementations extend `options`; extensions ought not be mandatory.
- `[MUST]` Implementations throw an error if an endpoint receives data, options, or option values it does not understand.

#### Content serialization

- `[MUST]` All request and response bodies be JSON with `Content-Type: application/json`.

#### Payload sizes

- `[RECOMMENDED]` Default maximum **10 MB per verifiable credential** as an interoperability baseline (configurable upward).

---

## §3 HTTP API (prose only)

### §3.2 Issuing

#### §3.2.1 Issue Credential

- `[MUST]` If multiple proofs are required, attach all proofs in a **single** response to one `POST /credentials/issue`.
- `[SHOULD]` When input `credential` already contains proof(s), instance be configured for proof sets, proof chains, or error.

---

### §3.4 Requesting a Presentation

#### §3.4.1 Verifiable Presentation Request

- `[REQUIRED]` `query` property on a verifiable presentation request.
- `[MUST]` `query` value be one or more maps; each map `[MUST]` define `type` (string).

#### §3.4.2 Query By Example

- `[SHOULD]` To signal that selective-disclosure cryptosuites are acceptable, verifiers include cryptosuites such as `bbs-2023` or `ecdsa-sd-2023` in `acceptedCryptosuites`.

#### §3.4.3 DID Authentication

- `[MUST]` A DID Authentication response be a verifiable presentation (see §3.4.3.2).

#### §3.4.4 Authorization Capability Request

- Not stable in current draft (Issue 3) — defer until standardized.

#### §3.4.5 Logical Operations in Queries

- Queries sharing the same `group` value are processed as AND; queries with different or missing `group` values are processed as OR. *(Descriptive protocol rule; no RFC 2119 keyword in source prose.)*

---

### §3.6 Workflows and Exchanges

#### §3.6.1 Create Workflow

- `[MAY]` An issue request object include a `variables` property for credential template evaluation.
- `[MAY]` An issue request object include optional `result` property; when present, value `[MUST]` be a top-level variable name in the exchange `variables` object or a JSON pointer into `variables`.

#### §3.6.5 Participate in an Exchange

- `[MAY]` Server include `referenceId` in an exchange message.
- `[SHOULD]` Client echo the same `referenceId` in its next message when received.
- `[SHOULD]` `referenceId` value be a `urn:uuid:`.

---

### §3.7 Initiating Interactions *(editor draft)*

#### §3.7.1 Interaction URL format

- `[MUST]` Interaction URL be valid URL with `iuv` query parameter; **`iuv` `[MUST]` be `1`** for this API version.
- `[SHOULD]` URL be HTTPS and opaque.
- `[SHOULD NOT]` Put information in query parameters that belongs in the GET response body.

#### §3.7.2 Interaction QR Code format

- `[MUST]` QR code encode an interaction URL per ISO 18004.
- `[SHOULD]` URL be as short as possible; `[SHOULD NOT]` exceed 400 alphanumeric characters; `[MUST NOT]` exceed 4,296.

#### §3.7.3 Interaction scheme format

- `[MUST]` `interaction:` scheme conform to `interaction:` + URL syntax.

#### §3.7.4 Interaction protocols response

- `[MUST]` With `Accept: application/json`, return `{ "protocols": { "<id>": "<url>", … } }`.
- `[MUST]` With unrecognized `Accept`, return `text/html` with human-readable directions.

---

### §3.8 Error Handling *(editor draft)*

#### ProblemDetails (RFC 9457)

- `[MUST]` `type` be present (URL).
- `[SHOULD]` `title` and `detail` be human-readable strings.
- Defined type: `https://www.w3.org/TR/vcalm#UNKNOWN_OPTION_PROVIDED`

#### §3.8.1 Verification errors vs warnings

- `[MUST]` If any error included → `verified` be `false`.
- `[MUST]` If no errors included → `verified` be `true`.

---

## Appendix C — Status List Management

- `[MUST]` Status service implement Update Status (§C.3) per §1.3 conformance.
- Create list (C.1) and get list (C.2): non-normative recommended approach in appendix intro.

---

## Appendix B — Security (selected)

- Holders must not present unknown proof types; strip unrecognized proofs before presentation (§B.1).
- HTTPS for interaction URLs strongly suggested (§B.2).
- Instance-level payload limits recommended (§B.4).

---

## Statistics (prose / conformance / config only)

Excludes **357** `http`-typed statements from OpenAPI tables. Counts from [vcalm-normative-stats.json](vcalm-normative-stats.json):

| Type | Count | Sections |
|------|------:|----------|
| `conformance` | 19 | §1.3 |
| `config` | 11 | §2.4 |
| `prose` | 12 | §3 narrative (TR export) |
| §3.7–§3.8 † | ~19 | Editor draft (not in TR markdown export) |
| **This document** | **~42 + †** | |

† §3.7–§3.8 not in automated TR export; listed manually from editor draft.

For OAS request/response shape requirements, use Schemathesis against pinned [`docs/schemathesis/oas.yaml`](schemathesis/oas.yaml).

---

## Non-normative (excluded)

- §1.1 Design Goals, §1.2 Architecture Overview, §1.4 Terminology
- §2.1–2.3 Coordinators, Services, Instances
- Appendix A Privacy Considerations
- Examples, notes, and diagrams throughout §3
- **All OpenAPI property/response table cells** (see `oas.yaml`)

---

## Test suite mapping

- **Schemathesis** → OAS request/response shapes (`npm run test:schema`)
- **Mocha interop** → §1.3 service roles + prose/conformance requirements (`npm test`)

See [normative-mapping.md](normative-mapping.md) for a **file tree** mapping each
statement in this document to `tests/` paths and coverage status.

See [test-suite-design-analysis.md](test-suite-design-analysis.md) and
[test-coverage.md](test-coverage.md).
