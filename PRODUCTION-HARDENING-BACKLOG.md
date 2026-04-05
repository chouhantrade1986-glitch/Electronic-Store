# Production Hardening Backlog

Last updated: April 5, 2026

## Goal

Move from "demo-safe" operations to production-grade operational safety with explicit controls for:

1. Monitoring and alerting
2. Backup and restore reliability
3. Provisioning and admin access guardrails

## Execution Order

1. `PH-01` Monitoring baseline
2. `PH-02` Alerting and incident triggers
3. `PH-03` Backup automation
4. `PH-04` Restore drill validation
5. `PH-05` Admin provisioning guardrails
6. `PH-06` Environment and secret guardrails
7. `PH-07` Release and rollback guardrails

## Master Checklist

- [x] `PH-01` Add runtime health + metrics baseline and centralize structured logs
- [x] `PH-02` Add error/uptime alert rules with clear thresholds and escalation path
- [x] `PH-03` Add scheduled backup job for SQLite/JSON snapshots with retention policy
- [x] `PH-04` Add automated restore drill and publish restore time evidence
- [x] `PH-05` Enforce production admin provisioning path and disable seeded demo access
- [x] `PH-06` Enforce env/secret validation at startup (fail fast on unsafe config)
- [x] `PH-07` Add release guardrails: pre-deploy smoke, post-deploy health gate, rollback runbook

## Issue Drafts

### PH-01: Monitoring Baseline

**Title:** `prod-hardening: monitoring baseline for backend runtime`

**Why**
- Current logs and health checks are enough for local QA but not enough for production diagnostics.

**Scope**
- Add `/api/health` extended checks for datastore and critical dependencies.
- Add `/api/metrics` endpoint (basic process/runtime counters and request rates).
- Ensure all backend logs are structured JSON and include `requestId`.

**Acceptance Criteria**
- Health endpoint returns dependency status details.
- Metrics endpoint is available and documented.
- At least 3 critical flows emit correlated logs with request IDs.
- Smoke suite continues to pass.

**Suggested Labels**
- `type:ops`, `area:backend`, `priority:high`

### PH-02: Alerting and Incident Triggers

**Title:** `prod-hardening: uptime and error alert rules`

**Why**
- Monitoring without actionable alerts does not reduce production risk.

**Scope**
- Define error-rate, latency, and uptime thresholds.
- Configure alert destinations (email/webhook/on-call channel).
- Add alert runbook links in alert descriptions.

**Acceptance Criteria**
- Alerts fire in a controlled test.
- Alert payload contains service name, threshold, and runbook link.
- False-positive baseline reviewed and documented.

**Suggested Labels**
- `type:ops`, `area:monitoring`, `priority:high`

### PH-03: Backup Automation

**Title:** `prod-hardening: automated backup pipeline with retention`

**Why**
- Manual backups are unreliable and untestable under incident pressure.

**Scope**
- Add scheduled backup job for active datastore (`sqlite` and compatibility snapshots if used).
- Add backup naming convention, retention, and integrity checksum.
- Store backup metadata (timestamp, size, checksum, source version).

**Acceptance Criteria**
- Scheduled backup executes successfully in test environment.
- Retention policy automatically prunes old backups.
- Backup metadata is queryable/logged.

**Suggested Labels**
- `type:ops`, `area:data`, `priority:high`

### PH-04: Restore Drill Validation

**Title:** `prod-hardening: automated restore drill and recovery evidence`

**Why**
- A backup is only useful if restore is tested and repeatable.

**Scope**
- Add scripted restore flow to a clean environment.
- Add verification checks after restore (health + key data sanity).
- Capture restore duration and success/failure logs.

**Acceptance Criteria**
- Restore drill runs end-to-end using latest backup artifact.
- Post-restore smoke checks pass.
- Recovery time is recorded and published.

**Suggested Labels**
- `type:ops`, `area:reliability`, `priority:high`

### PH-05: Admin Provisioning Guardrails

**Title:** `prod-hardening: admin provisioning and seeded-demo guardrails`

**Why**
- Production admin access must be tightly controlled and auditable.

**Scope**
- Disable seeded demo users in production mode.
- Enforce bootstrap/admin-create flow with strong password and audit trail.
- Add startup warning or hard-fail if unsafe admin/demo config is detected.

**Acceptance Criteria**
- Production profile rejects seeded demo login paths.
- Admin creation is auditable via admin audit trail.
- Unsafe config combinations fail fast on startup.

**Suggested Labels**
- `type:security`, `area:auth`, `priority:high`

### PH-06: Environment and Secret Guardrails

**Title:** `prod-hardening: env and secret validation policy`

**Why**
- Misconfigured secrets are one of the highest production risks.

**Scope**
- Validate required secrets for selected runtime mode at boot.
- Block known-unsafe defaults/placeholders.
- Add env policy matrix in docs (`local`, `staging`, `production`).

**Acceptance Criteria**
- Startup fails with clear message when required secrets are missing.
- Placeholder values are explicitly rejected.
- Docs include mode-based required env matrix.

**Suggested Labels**
- `type:security`, `area:config`, `priority:high`

### PH-07: Release and Rollback Guardrails

**Title:** `prod-hardening: release gates and rollback runbook`

**Why**
- Fast rollback and predictable release checks reduce outage blast radius.

**Scope**
- Enforce pre-deploy smoke gate and post-deploy health verification.
- Define rollback trigger policy and rollback steps.
- Add release checklist file used by deploy owners.

**Acceptance Criteria**
- Deployment checklist is documented and versioned.
- Rollback can be executed using documented steps without ad-hoc decisions.
- One controlled dry run is completed and recorded.

**Suggested Labels**
- `type:ops`, `area:release`, `priority:medium`

## Definition of Done for Backlog #4

- All `PH-*` issues are closed.
- Backup + restore drill evidence exists for latest release cycle.
- Production admin provisioning is auditable and seeded demo path is blocked.
- Monitoring + alerting produces actionable signals with runbook links.
- Release preflight, post-deploy verify, and rollback dry-run evidence exist in versioned tooling/docs.
