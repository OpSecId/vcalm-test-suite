# VCALM Interoperability Test Suite

Interoperability tests for implementations of
[VCALM](https://www.w3.org/TR/vcalm-1.0/) (Verifiable Credential API for
Lifecycle Management).

This branch (`feature/vcalm-initial`) scaffolds the project: **npm
dependencies**, **normative documentation**, and a curated
**normative-statements** module. Mocha tests, Schemathesis, and the W3C interop
reporter land in follow-up branches.

## Branches

| Branch | Contents |
|--------|----------|
| `feature/vcalm-initial` | Dependencies, docs, normative statement inventory (this branch) |
| `feature/vcalm-interop-suite` | Mocha behavioral tests and `localConfig` |
| `feature/vcalm-oas-pin` | Schemathesis and pinned OpenAPI |
| `feature/vcalm-docs` | Same `docs/` tree (merged here for the initial PR) |

## Install

```sh
npm install --legacy-peer-deps
```

`--legacy-peer-deps` avoids peer-resolution conflicts between Mocha 11 and older
devDependency trees.

## Lint

```sh
npm run lint
```

## Documentation

See [docs/README.md](docs/README.md) for the normative requirements inventory,
coverage matrix, and design notes.

Canonical RFC 2119 strings for future test titles:
[tests/normative-statements.js](tests/normative-statements.js).

## License

[LICENSE.md](LICENSE.md) — W3C 3-clause BSD or test-suite license.
