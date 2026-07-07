# VCALM test suite — documentation

Planning artifacts, normative traceability, and coverage matrices for the
[VCALM interop suite](../README.md).

## Start here

| If you want to… | Read |
|-----------------|------|
| Install, configure, and run tests | [../README.md](../README.md) |
| See which test file maps to which spec section | [test-coverage.md](test-coverage.md) |
| Understand scope and phased rollout | [test-suite-design-analysis.md](test-suite-design-analysis.md) |

## Normative traceability

| File | Purpose |
|------|---------|
| [normative-requirements.md](normative-requirements.md) | Prose / conformance / config inventory (excludes OAS tables) |
| [normative-mapping.md](normative-mapping.md) | File-tree map: requirements → tests (✅ / 🔷 / ⏭) |
| [test-coverage.md](test-coverage.md) | Per-file matrix and config keys |
| [../tests/normative-statements.js](../tests/normative-statements.js) | Canonical RFC 2119 `it()` title strings |

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

Edit [normative-requirements.md](normative-requirements.md) directly for the prose
inventory.
