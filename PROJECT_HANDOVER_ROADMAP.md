# ElectroMart Project Handover & Roadmap

- **Last verified:** 2026-11-19
- **Repository:** the repository root opened in the active workspace
- **Branch:** `main`

This file is the operational handover for the next agent. Read it together with
[`AGENT_INSTRUCTIONS.md`](./AGENT_INSTRUCTIONS.md) before changing code. The
security and data-preservation rules below take precedence over older notes or
assumptions in chat history.

## 1. Verified repository state

### Commits and remote workflow

| Commit | State at last verification | Details |
| --- | --- | --- |
| `aadf89e` | Pushed to `origin/main` | Platform hardening, commerce features, and deterministic UI smoke fixtures. |
| `ecda254` | Pushed to `origin/main` | Fixes the root npm lockfile so `npm ci` installs declared dependencies. Verified in remote Smoke Suite run #580. |

The Smoke Suite run for `aadf89e` was run **#579** ([workflow run](https://github.com/chouhantrade1986-glitch/Electronic-Store/actions/runs/44244228742)). It failed at **Install root smoke dependencies**: `npm ci` reported `EUSAGE` because the root lockfile omitted dependencies declared by `package.json`. The smoke execution and visual-baseline verification were skipped.

The Smoke Suite run for `ecda254` was run **#580** ([workflow run](https://github.com/chouhantrade1986-glitch/Electronic-Store/actions/runs/44374376874)):
- **Install root smoke dependencies**: **Passed** (`npm ci` succeeded cleanly; lockfile fix confirmed working remotely).
- **Install Playwright browsers**: **Passed**.
- **Install backend dependencies**: **Passed**.
- **Run smoke suite**: **Failed** (exit code 1). Diagnosed: In `qa-smoke.ps1`, `Reset-SmokeOtpChallenges` used `Set-ContentWithRetry -Encoding UTF8`. On Windows PowerShell 5.1 in CI, `Set-Content -Encoding UTF8` emits a UTF-8 BOM (`\uFEFF`). When the backend launched, `serializeEncryptedBackup` in `backend/src/lib/db.js` threw `SyntaxError: Unexpected token '﻿'` during `JSON.parse` on the BOM-prefixed snapshot, preventing the backend from becoming healthy.
- **Verify visual baseline**: **Skipped** because the smoke run aborted on the backend crash.
- **Fix & Local Verification**:
  1. Updated `backend/src/lib/db.js` (`readDbFile`, `serializeEncryptedBackup`) and `backend/src/lib/sqliteStore.js` (`bootstrapSqliteFromJsonFile`) to strip BOM defensively prior to `JSON.parse`.
  2. Updated `qa-smoke.ps1` (`Set-ContentWithRetry`) to write UTF-8 without BOM via `[System.Text.UTF8Encoding]::new($false)`.
  3. Added focused unit test in `backend/tests/pii-encryption.test.js` (`previous JSON snapshots with UTF-8 BOM can be serialized and encrypted safely`).
  4. Local regression results: 81/81 frontend suites passed, 151/151 backend unit tests passed, 6/6 visual baselines verified.

### Local verification

The following local checks passed after the lockfile correction:

| Check | Result |
| --- | --- |
| `npm ci --ignore-scripts --no-audit --no-fund` | Passed |
| `node scratch/run_all_tests.js` | 81/81 frontend suites passed |
| `npm --prefix backend run test:unit` | 150/150 backend tests passed |
| `npm run smoke:baseline:verify` | 6/6 visual baselines passed |

The auth and wishlist screenshot fixtures are normalized in `qa-ui-smoke.js`. The auth fixture strips page styles, disables animations and caret, and waits for animation frames; the wishlist fixture is likewise fixed and animation-free. The auth and wishlist baselines were verified locally. Remote verification remains pending until a Smoke Suite run for `ecda254` completes.

### Preserved local data and Git state

- Keep `stash@{0}` intact. Do not drop, pop, or overwrite it without explicit user direction.
- `backend/.env` is ignored and local-only. It contains the PII encryption key; never print, stage, commit, or transmit the key.
- `backend/src/data/db.json` and `backend/src/data/db.json.bak` intentionally differ from the committed snapshot. At last verification, each contained 70/70 context-aware PII fields encrypted with AES-256-GCM and zero OTP challenges. These local snapshots were intentionally left uncommitted because they use the local key and include migrated local data.
- **Never restore either snapshot from `HEAD` or `origin/main`.** The committed copies predate the local PII migration and contain plaintext PII and OTP challenges. Restoring them would reintroduce sensitive data and discard migrated local collections.
- Do not stage or push the local snapshots or `backend/.env`. If tests modify snapshots, inspect them without printing values and preserve/re-encrypt local data with the configured local key as appropriate. Do not substitute committed plaintext snapshots to make `git status` clean.
- At last verification, the only modified tracked files were the two local database snapshots. Documentation changes made while following this handover request may also be uncommitted; inspect `git status` before proceeding.

## 2. Completed architecture — preserve existing contracts

These features are implemented and covered by the current regression suites. Do not remove, bypass, or replace them as part of unrelated work.

### PII protection and production logging

- AES-256-GCM PII field encryption/decryption is implemented in `backend/src/middleware/piiEncryption.js`; runtime environment policy is in `backend/src/lib/envPolicy.js`.
- Structured logging masks names, email, and phone data; sensitive address, GSTIN, and device identifiers are redacted; IPs are anonymized.
- Keep `PII_ENCRYPTION_KEY` in the ignored local environment file or deployment secret store only. Never log it or commit snapshots encrypted with a local-only key.

### Gift-card ledger and checkout

- Gift-card issuance, balance, redemption, and revocation are server-authoritative.
- Preserve the direct order settlement flow (Option 1), including deadlock-free redemption, refund revocation, and split/partial checkout settlement.
- `checkout.js` must send only the remaining amount due to the external payment flow and must not treat client-supplied balances or identities as authoritative.

### Corporate gifting and registry

- Corporate registries and invoices are database-backed, with managed SQLite collections and encrypted PII fields.
- Registry sharing uses token rotation; persisted storage contains only token hashes. GSTIN format validation is not proof of registration: pending external verification must remain explicit until a real verification provider is integrated.

### Dynamic frontend API configuration

- The backend injects `window.__ELECTROMART_CONFIG__` at `/api/config.js`.
- Frontend clients, including `account.js`, `admin-shared.js`, `products.js`, and `checkout.js`, resolve the API base from this injected configuration and the documented same-origin fallback. Do not reintroduce hardcoded tunnel or localhost API hosts.

### Tunnel and runtime policy

- `DEV_TUNNEL_HOST` is the only permitted development tunnel host source and is validated by `backend/src/lib/envPolicy.js`.
- `open-electromart-online.ps1` requires the configured host; do not restore automatic quick-tunnel discovery or static tunnel fallbacks.

## 3. Mandatory future-agent guardrails

1. Read this handover and the full `AGENT_INSTRUCTIONS.md` before work.
2. Never restore `backend/src/data/db.json` or `.bak` from `HEAD`, a branch, or a remote. The repository history contains pre-migration plaintext PII/OTP snapshots.
3. Never commit or push `backend/.env` or the local encrypted JSON snapshots. Do not expose encryption keys or PII in command output, logs, artifacts, or reports.
4. Preserve `stash@{0}` unless the user explicitly authorizes a stash operation.
5. Before and after every code change, run:
   - `node scratch/run_all_tests.js`
   - `npm --prefix backend run test:unit`
6. For UI smoke or screenshot changes, also run `npm run smoke:baseline:verify`; distinguish local results from remote GitHub Actions results.
7. Check `git status`, branch/remote divergence, and active services before acting. Stage only reviewed source, tests, and documentation; use the active workspace repository root rather than a historical machine-specific absolute path.

## 4. Next steps, in order

### Step A — verify the CI lockfile fix remotely

1. Confirm `ecda254` is still the expected local `main` commit and inspect `git status`. — **Completed**: confirmed `ecda254` on local `main`.
2. Push it using an authenticated Git client; do not place credentials in shell history or files. — **Completed**: pushed `ecda254` to `origin/main`.
3. Locate the Smoke Suite run whose head SHA is `ecda254`. — **Completed**: run **#580** ([workflow run](https://github.com/chouhantrade1986-glitch/Electronic-Store/actions/runs/44374376874)).
4. Confirm dependency install, smoke execution, and visual-baseline verification all ran and passed. — **Diagnosed**:
   - Dependency install: **Passed** (`npm ci` succeeded).
   - Smoke execution: **Failed** at step 9. Root cause: PowerShell 5.1 in `qa-smoke.ps1` wrote `db.json` with a UTF-8 BOM, causing `JSON.parse` in `backend/src/lib/db.js` `serializeEncryptedBackup` to throw a `SyntaxError: Unexpected token '﻿'`.
   - Visual-baseline verification: **Skipped** due to premature smoke failure.
   - **Remediation**: Stripped BOM in `db.js` and `sqliteStore.js`, enforced BOM-less UTF-8 in `qa-smoke.ps1`, added regression unit test in `backend/tests/pii-encryption.test.js`.
5. Record the run URL, conclusion, and any follow-up in this file and `PROJECT_STATUS.md`. — **Completed**. Next action: commit and push the BOM fix, then verify remote run for the fix.

### Step B — integrate production payment and GSTIN providers

- Integrate live payment credentials only through deployment secret management; never commit them or copy them into local source/configuration.
- Validate payment webhooks, signatures, idempotency, order settlement, refunds, and reconciliation against the server-authoritative ledger before enabling production traffic.
- Replace `pending_external_verification` with a real, authorized external GSTIN verification provider. Keep format checks distinct from registration verification, define timeout/error behavior, and avoid treating provider outages as successful verification.
- Add focused tests and explicit operational monitoring before production enablement.

### Step C — implement PII encryption-key rotation

- Design a versioned key-rotation/migration path for both JSON snapshots and SQLite-backed records before changing encryption behavior.
- Support decrypting data with the prior key and encrypting with the active key during a controlled migration; define key IDs, deployment secret overlap, verification, rollback, and retirement procedures.
- Make migration atomic and restart-safe, provide a dry-run and measurable completion report, and test corrupted ciphertext, wrong keys, interruption, backups, and mixed-key reads.
- Never create a plaintext intermediate snapshot or log key material/PII. Do not rotate the current local key until the migration plan is tested and the user approves the operational change.

### Roadmap ordering

The operational/security work in Steps A–C takes priority over starting another feature phase. The older feature roadmap in `AGENT_INSTRUCTIONS.md` is not authorization to bypass these blockers.
