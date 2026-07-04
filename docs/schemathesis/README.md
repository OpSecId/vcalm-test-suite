# Schemathesis (local schema conformance)

Branch **`feature/vcalm-oas-pin`** — pinned OpenAPI bundle and Schemathesis tooling.
Mocha tests: **`feature/vcalm-interop-suite`**. Normative docs: **`feature/vcalm-docs`**.

Property-based tests for VCALM **request/response bodies** against the OpenAPI spec
([w3c.github.io/vcalm/oas.yaml](https://w3c.github.io/vcalm/oas.yaml)), using
[Schemathesis](https://schemathesis.io/).

## Prerequisites

- A **running VCALM-compatible HTTP API** (same deployment you use for `npm test`)
- [uv](https://docs.astral.sh/uv/) (for `uvx schemathesis`) or Schemathesis installed globally

## Configuration

| File | Role |
|------|------|
| [`schemathesis.local.cjs`](../../schemathesis.local.example.cjs) | **Your settings** — `BASE_URL`, profile, auth, example limits |
| [`schemathesis.toml`](../../schemathesis.toml) | **Tool defaults** — schema path, checks, `${BASE_URL}` / `${VCALM_TOKEN}` |

`BASE_URL` should match the Mocha suite: the **service root** that prefixes paths like `/credentials/issue` (not the full issue URL).

```js
// schemathesis.local.cjs (from example)
baseUrl: 'http://localhost:40443/id'
profile: 'phase1-core'   // issueCredential, verifyCredential, verifyPresentation
```

Alternatively, add a `schemathesis: { ... }` block to `localConfig.cjs` (same shape as the example file).

### Profiles

| Profile | Operations | Use when |
|---------|------------|----------|
| `phase1-core` | issue, verify credential, verify presentation | Default local run; §1.3 minimum |
| `issuer` | §3.2 + status lists | Issuer-only deployment |
| `verifier` | §3.3 | Verifier-only deployment |
| `holder` | §3.5 | Holder service |
| `full` | All paths in `oas.yaml` | Deep fuzzing; may create/delete resources |

Override: `VCALM_SCHEMA_PROFILE=issuer npm run test:schema`

### Auth

```sh
export VCALM_TOKEN=your-bearer-token
npm run test:schema
```

Disable auth headers: `VCALM_SCHEMA_AUTH=0 npm run test:schema`

### Tuning

| Variable | Default | Meaning |
|----------|---------|---------|
| `VCALM_SCHEMA_EXAMPLES` | `25` | Examples per operation (`-n`) |
| `VCALM_SCHEMA_TIMEOUT` | `30` | Request timeout (seconds) |

## Run locally

```sh
cp schemathesis.local.example.cjs schemathesis.local.cjs
# Start your VCALM agent, then:
BASE_URL=http://localhost:40443/id npm run test:schema
```

Reports: `reports/schemathesis/junit.xml` and `reports/schemathesis/index.html` (rendered after each run).

## Update pinned OpenAPI

```sh
npm run schema:update-oas
```

Pulls [`oas.yaml`](https://w3c.github.io/vcalm/oas.yaml) and `components/` from
[w3c.github.io/vcalm](https://w3c.github.io/vcalm/), then rebuilds `oas.bundled.json`.

## What to expect

- Many **4xx** responses are normal — Schemathesis sends generated (often invalid) payloads.
- **Failures that matter**: 5xx, response body not matching schema, undocumented status codes.
- Combine with **Mocha** happy-path tests from `feature/vcalm-interop-suite`.
