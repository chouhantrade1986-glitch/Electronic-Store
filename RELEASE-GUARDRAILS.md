# Release Guardrails

Last updated: April 5, 2026

## Goal

Provide a predictable release path with:

1. Pre-deploy smoke gate
2. Post-deploy health verification
3. Explicit rollback trigger policy
4. Versioned evidence for dry runs

## Release Checklist

1. Confirm target commit and deployment window.
2. Run preflight from repository root:
   - `npm run release:preflight`
3. If preflight passes, deploy the target commit.
4. Verify deployed runtime health:
   - `cd backend`
   - `npm run job:release:verify -- --api-base-url=https://api.example.com/api`
5. If verification passes, announce release completion and attach evidence.
6. If verification fails or incident thresholds trigger, execute rollback plan below.

## Pre-Deploy Gate

- Command: `npm run release:preflight`
- Included checks:
  - Full smoke suite (`npm run smoke`)
  - Visual baseline verification (`npm run smoke:baseline:verify`)
- Output:
  - `qa-reports/release/release-preflight-summary.json`

Optional:

- Skip visual baseline when intentionally not applicable:
  - `powershell -ExecutionPolicy Bypass -File .\release-preflight.ps1 -SkipVisualBaseline`

## Post-Deploy Verification

- Command:
  - `cd backend`
  - `npm run job:release:verify -- --api-base-url=https://api.example.com/api`
- Verifies:
  - `/api/health` returns `ok=true`
  - datastore/auth/order-reservation scheduler are healthy
  - `/api/metrics` returns process start metadata and request counters
- Optional evidence output:
  - `npm run job:release:verify -- --api-base-url=https://api.example.com/api --output=..\release-evidence\postdeploy-health-verify.json`

## Rollback Trigger Policy

Rollback is required if any of the following occur after deploy:

1. Preflight was bypassed without explicit approval.
2. Post-deploy verification fails after retry budget is exhausted.
3. `/api/health` returns degraded status for critical dependencies.
4. Smoke-equivalent critical user path is broken in production.
5. Incident commander declares rollback lower-risk than live mitigation.

## Rollback Plan

1. Identify last known good commit.
2. Redeploy that commit using the deployment platform.
3. Run post-deploy verification against the rolled-back environment.
4. Announce rollback completion with evidence link.
5. Open follow-up issue before retrying release.

Rollback dry-run helper:

- `npm run release:rollback:dry`
- Output:
  - `release-evidence/rollback-dry-run-<timestamp>.json`

## Workflow

Manual GitHub workflow:

- [.github/workflows/release-guardrails.yml](./.github/workflows/release-guardrails.yml)

Workflow jobs:

1. `preflight` runs release preflight gate
2. `postdeploy` optionally verifies deployed API URL
3. `rollback-dry-run` records rollback evidence

## Controlled Dry Run Record

Latest committed dry-run evidence:

- `release-evidence/rollback-dry-run-*.json`
