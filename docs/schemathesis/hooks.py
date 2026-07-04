"""
Optional Schemathesis hooks for VCALM (future: golden IssueCredentialRequest bodies).

Enable in schemathesis.toml when you need custom auth or fixtures:
  hooks = "docs.schemathesis.hooks"

For local runs, scripts/run-schemathesis.cjs passes -H Authorization when VCALM_TOKEN is set.
"""
import os

import schemathesis


@schemathesis.hook
def before_call(context, case):
    token = os.environ.get("VCALM_TOKEN", "").strip()
    if token:
        case.headers = case.headers or {}
        case.headers["Authorization"] = f"Bearer {token}"
