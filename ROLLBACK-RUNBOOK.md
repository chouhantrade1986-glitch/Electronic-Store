# Production Rollback Runbook

Last reviewed: October 1, 2026

## Purpose and limits

Use this runbook when a production release causes a customer-impacting outage or data-integrity risk. The repository provides preflight, health verification, backup, restore-drill, and rollback dry-run tooling. It does not deploy releases or issue a production rollback; the operator must use the configured hosting provider's deployment controls.

The current SQLite layer creates managed tables with `CREATE TABLE IF NOT EXISTS`; it has no versioned, reversible schema migration runner. A code rollback is not automatically a database rollback. Never assume that restoring an older database is safe for newer writes.

## Rollback triggers

Start rollback when one or more of these are true and a rapid forward fix is not clearly lower-risk:

- Post-deploy verification fails after its configured retry budget.
- `/api/health` reports a critical dependency degraded.
- A critical customer flow is broken or production error/latency alerts exceed the incident response threshold.
- The release causes data corruption, incorrect payment/order state, or an unsafe security regression.
- The incident commander determines that restoring the previous application version is the lowest-risk mitigation.

## Immediate response

1. Declare the incident, assign an incident commander and an operator, and stop further deployments.
2. Record the incident start time, current deployed release/SHA, symptoms, affected services, and the decision owner in the incident timeline.
3. If writes may be corrupting data, use the hosting provider to pause writes or place the affected service in maintenance mode before further recovery actions.
4. Preserve logs, health/metrics responses, deployment events, and the failed release evidence. Do not delete the failed deployment or its artifacts.

## Application rollback

1. Identify the exact last-known-good commit or immutable image digest from production deployment history. Do not infer it from `HEAD~1`; production may be running a different revision.
2. Confirm the target contains the current data contract, environment requirements, and secrets needed by production.
3. Generate a rollback dry-run record from the repository root, supplying the explicit target and production API base URL:

   ```powershell
   npm run release:rollback:dry -- -TargetCommit <KNOWN_GOOD_SHA> -Reason "<INCIDENT_ID> <SHORT_REASON>" -ApiBaseUrl https://<PRODUCTION_API_HOST>/api
   ```

   This writes evidence under `release-evidence/`; it does not change Git state, deploy code, or alter production data.
4. Through the deployment provider, redeploy/promote the exact known-good revision or image digest. Use the provider's approved rollback mechanism; do not run `git reset`, force-push, or manually replace files on a live instance.
5. Wait for service startup and confirm the deployed revision matches the selected target.
6. Run post-deploy health and metrics verification from the repository root:

   ```powershell
   npm run release:verify:postdeploy -- --api-base-url=https://<PRODUCTION_API_HOST>/api --output=release-evidence/post-rollback-health.json
   ```

7. Run the production smoke/critical-flow checks available to the deployment owner. If verification fails, keep the incident active, stop traffic or writes if needed, and escalate; do not repeatedly switch versions without understanding the failure.
8. Record verification output and evidence links in the incident timeline. Announce recovery only after the service and critical flows are confirmed healthy.

## Database or migration incident

1. Do not automatically restore a pre-release database just because application code was rolled back. First establish whether the schema/data changes are backward-compatible and whether post-release writes must be retained.
2. Preserve the current failed-state datastore as a separate artifact before attempting repair. For a SQLite deployment, preserve the database and any `-wal`/`-shm` files consistently using the deployment's storage/snapshot mechanism. Do not overwrite the only copy.
3. If the previous application version is compatible with the current schema, roll back application code only, verify health and critical data, and plan a forward database repair.
4. If the previous application version is incompatible or data is damaged, stop writes and follow the hosting provider's documented point-in-time/snapshot restore procedure into an isolated recovery target. Compare critical entity counts and payment/order state before routing production traffic to the recovered datastore.
5. The repository's `npm run job:restore:drill` validates checksums and restores backup artifacts into an isolated drill directory. It does not replace the live datastore and is not a production database restore command.
6. Resume writes only after the incident commander and datastore operator confirm the recovered application/data combination is consistent. Record the recovery point and any lost-write window.

## Evidence and follow-up

- Pre-deploy backup manifest and artifact checksums.
- Failed release SHA/image digest and last-known-good target SHA/image digest.
- `release-evidence/rollback-dry-run-*.json` and `release-evidence/post-rollback-health.json`.
- Smoke results, incident timeline, database recovery point, and approval to resume writes.
- Within one business day, open a corrective-action issue covering root cause, detection gap, data impact, and prevention. Add a regression test or release gate where practical.

## Related tooling

- [Release checklist and guardrails](./RELEASE-GUARDRAILS.md)
- [Production incident runbook](./PRODUCTION-INCIDENT-RUNBOOK.md)
- `npm run release:preflight`
- `npm run release:verify:postdeploy -- --api-base-url=https://<PRODUCTION_API_HOST>/api`
- `npm run release:rollback:dry -- -TargetCommit <KNOWN_GOOD_SHA>`
- From `backend/`: `npm run job:backup`, `npm run job:restore:drill`