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
| `ad4fbf1` | Pushed to `origin/main` | Fixes UTF-8 BOM injection into `db.json` from Windows PowerShell and adds defensive stripping. |
| `f9f1f75` | Pushed to `origin/main` | Fixes quantity select dropdown selector in cart UI smoke. |
| `86c4ee1` | Pushed to `origin/main` | Exports `updateHeaderLocationText` and scopes `syncDrawerMenuItems` in menu-manager. |
| `eb24747` | Pushed to `origin/main` | Fixes hoisted duplicate `saveProfile` in account.js and guards smoke inputs. |
| `0f6a5af` | Pushed to `origin/main` | Aligns admin dashboard UI smoke with modern Seller Central while preserving legacy fallback. |
| `7d70513` | Pushed to `origin/main` | Refreshes visual baseline snapshot hashes for CI Windows runner. |

The Smoke Suite run for `7d70513` was run **#594** ([workflow run](https://github.com/chouhantrade1986-glitch/Electronic-Store/actions/runs/45416557294)):
- **Install root smoke dependencies**: **Passed** (`npm ci` succeeded cleanly).
- **Install Playwright browsers**: **Passed**.
- **Install backend dependencies**: **Passed**.
- **Run smoke suite**: **Passed** (100% of API and UI smoke tests passed).
- **Build smoke flake trend artifact**: **Passed**.
- **Emit smoke failure classification**: **Passed**.
- **Validate smoke artifact schemas**: **Passed**.
- **Save smoke trend history**: **Passed**.
- **Verify visual baseline**: **Passed** (All 6/6 baseline screenshots matched).
- **Upload smoke suite reports**: **Passed**.
- **Overall workflow status**: ✅ **COMPLETED SUCCESS** (100% Green).

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
4. Confirm dependency install, smoke execution, and visual-baseline verification all ran and passed. — **Completed & Verified Remotely**:
   - Initial run #580 passed dependency install but uncovered BOM injection in `db.json`, followed by select dropdown stepper in cart (run #581), header/menu global functions (run #582), account profile hoisted function clobbering (run #583), admin dashboard Seller Central transition alignment (run #589/593), and baseline manifest sync for Windows runner.
   - All fixes committed and pushed incrementally (`ad4fbf1`, `f9f1f75`, `86c4ee1`, `eb24747`, `0f6a5af`, `7d70513`).
   - Remote verification on commit `7d70513` in Smoke Suite **Run #594** ([workflow run](https://github.com/chouhantrade1986-glitch/Electronic-Store/actions/runs/45416557294)) achieved **100% SUCCESS**:
     - `Install root smoke dependencies`: **Passed**
     - `Install Playwright browsers`: **Passed**
     - `Install backend dependencies`: **Passed**
     - `Run smoke suite`: **Passed** (All API and UI steps green)
     - `Verify visual baseline`: **Passed** (6/6 baseline screenshots matched)
     - Overall status: ✅ **COMPLETED SUCCESS**
5. Record the run URL, conclusion, and any follow-up in this file and `PROJECT_STATUS.md`. — **Completed**. Step A is 100% complete and green. Ready for Step B.

### Step B — integrate production payment and GSTIN providers

- **Status**: ✅ **COMPLETED & TESTED**
- **Deliverables**:
  1. **GSTIN Verification Adapter (`backend/src/lib/gstinVerification.js`)**:
     - Environment-gated adapter supporting `simulated` (default), `cleartax`, and `sandbox` providers.
     - Strict format regex: `/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/`.
     - Indian State/UT code mapping (`01` through `38`) and PAN extraction (`getPanFromGstin`).
     - Distinct status outcomes: `verified`, `invalid`, `invalid_format`, `pending_external_verification`, `verification_failed`.
     - External provider timeouts (`AbortController`) and clean fallback when credentials are unconfigured.
  2. **Corporate GSTIN Route (`backend/src/routes/corporateRoutes.js`)**:
     - `POST /api/corporate/gstin/verify` handles format validation (400), unconfigured provider fallback (200 pending), verified registration (200), and external service outages (502).
  3. **Razorpay Live Configuration & Fallback Wrapper (`backend/src/lib/razorpayGateway.js`)**:
     - `validateRazorpayConfig(config)` / `getValidatedRazorpayConfig(overrides)`: validates key format (`rzp_live_`, `rzp_test_`), masks key IDs, checks secret length, and flags missing webhook secret without throwing.
     - `getPaymentGatewayConfig()`: publishes sanitized, client-safe payload `{ provider, keyId, razorpayEnabled, mode, onlineCheckoutLabel }`.
     - `createPaymentGatewayOrder(payment, order, user)`: provides seamless simulated fallback order creation when Razorpay is disabled, preventing runtime 503 errors when live credentials are not present.
     - `GET /api/payments/config` integrated with `getPaymentGatewayConfig()`.
  4. **Unit Test Suites**:
     - `backend/tests/gstin-verification.test.js`: 8 unit tests covering format validation, state/PAN extraction, simulated mode, external fallback, and HTTP route handling.
     - `backend/tests/razorpay-config.test.js`: 8 unit tests covering simulated mode, key validation, live/test modes, masked keys, public config sanitization, order creation fallback, and subunits conversion.

### Step C — implement PII encryption-key rotation

- **Status**: ✅ **COMPLETED & TESTED**
- **Deliverables**:
  1. **CLI Rotation Utility (`backend/src/jobs/rotatePiiKey.js`)**:
     - Supports CLI flags: `--source-key=<key>`, `--target-key=<key>`, `--input-file=<path>`, `--output-file=<path>`, and `--dry-run`.
     - Core library exports: `deriveKey`, `decryptWithKey`, `encryptWithKey`, `rotatePiiValue`, `rotatePiiFields`, `rotatePiiFile`, `parseArgs`.
     - Requires 32-byte key lengths; validates and enforces AES-256-GCM authentication tags.
     - Strict guardrail: requires `--input-file` explicitly to guarantee live `db.json` is never mutated automatically.
     - Atomic disk persistence: writes to temporary file (`${dest}.tmp.${randomHex}`) before renaming.
     - Comprehensive idempotency: detects values already rotated to target key (`already_target_key`) and leaves them intact.
     - Rejects wrong source keys or corrupted ciphertext cleanly with descriptive error without data loss.
  2. **NPM Run Scripts (`backend/package.json`)**:
     - Added `"job:rotate-pii"` and `"job:rotate-pii:dry"`.
  3. **Unit Test Suite (`backend/tests/rotate-pii-key.test.js`)**:
     - 6 unit tests covering key length enforcement, AES-256-GCM roundtripping, wrong key rejection, ciphertext tamper rejection, idempotent value rotation, dry-run scanning, atomic file rotation, and CLI argument parsing.

### Roadmap ordering

The operational/security work in Steps A–C takes priority over starting another feature phase. The older feature roadmap in `AGENT_INSTRUCTIONS.md` is not authorization to bypass these blockers.
