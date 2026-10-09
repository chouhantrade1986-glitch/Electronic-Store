# Release Guardrails

Last updated: October 2, 2026

## Goal

Provide a predictable release path with:

1. Pre-deploy smoke gate
2. Post-deploy health verification
3. Explicit rollback trigger policy
4. Versioned evidence for dry runs

## Release Checklist

### Before deployment

1. Confirm target commit, deployment window, deploy operator, rollback decision owner, and the last-known-good production commit/image digest.
2. Review the change set for environment, security, datastore, and backward-compatibility risks. For schema/data changes, document the forward-recovery plan; code rollback alone may not undo data changes.
3. Run the required frontend and backend tests: `node scratch/run_all_tests.js` and, from `backend/`, `npm run test:unit`.
4. Run preflight from repository root:
   - `npm run release:preflight`
5. Confirm a recent backup exists and its manifest/checksums are valid. For a risky datastore change, run `npm run job:backup` followed by `npm run job:restore:drill` from `backend/` before deployment.

### Deploy and verify

6. Deploy the exact target commit using the hosting provider. Record the deployed SHA/image digest. The repository's GitHub workflow runs guardrails and does not deploy production.
7. Verify deployed runtime health:
   - `cd backend`
   - `npm run job:release:verify -- --api-base-url=https://api.example.com/api`
8. Run production smoke/critical-flow checks and attach health, smoke, and release evidence.
9. If verification passes, announce release completion. If a rollback trigger fires, follow [ROLLBACK-RUNBOOK.md](./ROLLBACK-RUNBOOK.md); do not treat the dry-run helper as an actual deployment rollback.

## Pre-Deploy Gate

- Command: `npm run release:preflight`
- Included checks:
  - Frontend scratch test suites (`node scratch/run_all_tests.js`)
  - Backend unit tests (`npm run test:unit` from `backend/`)
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

Follow [ROLLBACK-RUNBOOK.md](./ROLLBACK-RUNBOOK.md) for incident response, selecting an explicit known-good revision, provider-based redeployment, data/migration recovery, and post-rollback verification. Do not assume `HEAD~1` is the last production revision.

Rollback dry-run helper:

- `npm run release:rollback:dry`
- Output:
  - `release-evidence/rollback-dry-run-<timestamp>.json`

## Workflow

Manual GitHub workflow:

- [.github/workflows/release-guardrails.yml](./.github/workflows/release-guardrails.yml)

Weekly cadence:

- Automatic run schedule: every Monday at `04:30 UTC` via workflow cron
- Manual fallback trigger: `workflow_dispatch` on the same workflow
- Primary owner: `@chouhantrade1986-glitch`
- Backup owner/escalation contact: incident secondary channel `slack:#incident-ops`

Missed-cadence escalation path (if no successful weekly run within 7 days):

1. Trigger `release-guardrails` manually with `workflow_dispatch`.
2. Post the run URL in the weekly audit update and `PROJECT-AUDIT.md` evidence snapshot.
3. Escalate in `slack:#incident-ops` if the catch-up run is not completed within 24 hours.

Workflow jobs:

1. `preflight` runs frontend and backend unit tests, then the release preflight gate
2. `postdeploy` optionally verifies deployed API URL
3. `rollback-dry-run` records rollback evidence

## Controlled Dry Run Record

Latest committed dry-run evidence:

- `release-evidence/rollback-dry-run-*.json`

Latest two cadence runs currently recorded in this document:

1. [run 24003104432](https://github.com/chouhantrade1986-glitch/Electronic-Store/actions/runs/24003104432) - run number `4`, `success`, April 5, 2026
2. [run 24001858163](https://github.com/chouhantrade1986-glitch/Electronic-Store/actions/runs/24001858163) - run number `3`, `success`, April 5, 2026

Cadence status as of October 2, 2026: the latest successful run recorded above is 180 days old, exceeding the 7-day cadence. Treat this as a missed cadence: trigger the workflow manually, add the resulting run URL to the weekly audit update and `PROJECT-AUDIT.md`, and escalate in `slack:#incident-ops` if the catch-up run is not completed within 24 hours. The run IDs above are historical evidence, not evidence of a current successful cadence.
