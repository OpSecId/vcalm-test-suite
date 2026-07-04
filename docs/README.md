# VCALM test suite — normative documentation

Branch **`feature/vcalm-docs`** holds spec traceability and planning artifacts.
Mocha tests and run instructions live on **`feature/vcalm-interop-suite`**.
OpenAPI / Schemathesis tooling lives on **`feature/vcalm-oas-pin`**.

## Start here

| If you want to… | Read |
|-----------------|------|
| Install and run tests | [../README.md](../README.md) on `feature/vcalm-interop-suite` |
| Configure `localConfig.cjs` / profiles | [test-coverage.md](test-coverage.md) → VCALM tag and endpoint registration |
| See which test file maps to which spec section | [test-coverage.md](test-coverage.md) |
| Understand scope and phased rollout | [test-suite-design-analysis.md](test-suite-design-analysis.md) |
| Run Schemathesis / OAS fuzzing | `feature/vcalm-oas-pin` → [schemathesis/README.md](schemathesis/README.md) |

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

## Regenerating stats

```sh
SKILL=~/.cursor/skills/spec-analyzer/scripts
python3 "$SKILL/extract_normative.py" SPEC.md --title "VCALM 1.0" \
  --source "https://www.w3.org/TR/vcalm-1.0/" -o docs/vcalm-normative-stats.json
python3 "$SKILL/generate_stats_html.py" docs/vcalm-normative-stats.json \
  -o docs/vcalm-normative-stats.html --footer vcalm-test-suite
```

Prose inventory: `docs/scripts/extract_requirements.py` or edit
[normative-requirements.md](normative-requirements.md) directly.

## Checkout this tree from another branch

```sh
git checkout feature/vcalm-docs -- docs/
```
