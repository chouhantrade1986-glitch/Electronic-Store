# Smoke Suite

## What is included

- `qa-smoke.ps1`: backend and API smoke
- `qa-ui-smoke.js`: browser smoke
- `qa-full-smoke.js`: combined runner with JSON and JUnit export
- `run-smoke-suite.bat`: Windows entrypoint
- `.github/workflows/smoke-suite.yml`: GitHub Actions workflow

## Local prerequisites

1. Install root smoke dependencies with `npm ci`
2. Install the Chromium browser for Playwright once with `npm run smoke:install-browsers`
3. Create `backend/.env` from `backend/.env.example`
4. Install backend dependencies with `cd backend && npm ci`
5. Keep Razorpay credentials in `backend/.env` if you want full checkout and resume-payment smoke

Important:

- `qa-full-smoke.js` and `qa-ui-smoke.js` no longer auto-install Playwright at runtime.
- If Playwright is missing, the smoke suite now fails fast with an explicit setup message instead of mutating `node_modules` during the run.
- Root `package-lock.json` should be committed so smoke tooling stays version-pinned.

## Local run

```powershell
npm run smoke
```

or

```powershell
run-smoke-suite.bat
```

You can still run the combined runner directly:

```powershell
node qa-full-smoke.js --reports-dir=qa-reports
```

## Browser-only smoke

```powershell
npm run smoke:ui
```

## Local triage commands

Run smoke + trend refresh in one command:

```powershell
npm run smoke:triage
```

Run multiple triage iterations and generate a compact loop summary:

```powershell
npm run smoke:triage:loop -- -Runs 5
```

Loop summaries include per-iteration schema validation stats (`schemaValidationExit`, `schemaCheckedArtifacts`, `schemaErrorCount`, `schemaPassed`) and aggregate `schemaFailedRuns`.

Generate or refresh trend artifacts only:

```powershell
npm run smoke:trend
```

Validate schema contract for generated trend/triage artifacts:

```powershell
npm run smoke:validate:artifacts
```

The GitHub Actions smoke workflow also runs this validation step after trend generation and failure-class annotation.
The validator checks schema metadata plus required fields and sequence dual-format consistency (`array` vs `string`) across triage/trend artifacts.
If `qa-reports/smoke-triage-loop-summary.json` exists, the validator also verifies its schema metadata and required summary fields.
It also validates sparkline/sequence coherence and failure-code aggregate consistency (for example count totals vs sequence/results).
Each validator run writes a machine-readable report to `qa-reports/smoke-artifact-validation.json`.

`npm run smoke:triage` prints a compact one-line status for quick terminal scanning:

```text
LOCAL-SMOKE-STATUS exit=<code>, uiRetries=<n>, hottest=<step=count|none>
LOCAL-SMOKE-FAILURE-SUMMARY <none|fatal=...|failed=suite/test,...>
LOCAL-SMOKE-FAILURE-CODE <none|smoke-fatal-api|smoke-fatal-ui|smoke-fatal|smoke-assertion-api|smoke-assertion-ui|smoke-assertion-mixed|smoke-assertion|smoke-unknown|report-parse-error|report-missing|trend-fail>
LOCAL-SMOKE-FAILURE-DOMINANT <none|failureCode=count>
LOCAL-SMOKE-FAILURE-SEQUENCE <oldest-to-newest failureCode list>
LOCAL-SMOKE-FAILURE-SPARKLINE <symbol-mapped failure timeline>
LOCAL-SMOKE-DIAGNOSTICS present=<true|false>, apiExit=<code|null>, uiExit=<code|null>, summary=<none|fatal/error digest>
LOCAL-SMOKE-SCHEMA-VALIDATION exit=<code>
LOCAL-SMOKE-SCHEMA-REPORT checkedArtifacts=<n>, errorCount=<n>, passed=<true|false>
```

## Lock visual baseline

After a green UI smoke run, lock the auth/account/invoice/checkout/orders/wishlist screenshots:

```powershell
npm run smoke:baseline:lock
npm run smoke:baseline:verify
```

## Existing backend requirements

1. Create `backend/.env` from `backend/.env.example`
2. Install backend dependencies with `cd backend && npm ci`
3. Keep Razorpay credentials in `backend/.env` if you want full checkout and resume-payment smoke

- Razorpay-specific smoke checks require:
  - `PAYMENT_PROVIDER=razorpay`
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`
- Without those values, checkout and resume-payment assertions will fail by design.
- Auth smoke now uses backend OTP endpoints, so local smoke runs also require simulated OTP delivery to remain enabled for auth OTP requests.

## Generated outputs

- `qa-reports/smoke-report.json`
- `qa-reports/smoke-report.junit.xml`
- `qa-reports/api-smoke.stdout.log`
- `qa-reports/api-smoke.stderr.log`
- `qa-reports/ui-smoke.stdout.log`
- `qa-reports/ui-smoke.stderr.log`
- `qa-reports/smoke-trend-history.json`
- `qa-reports/smoke-trend-latest.json`
- `qa-reports/smoke-trend-window.json`
- `qa-reports/smoke-trend-summary.md`
- `qa-reports/smoke-failure-diagnostics.json` (written only when a smoke run exits non-zero)
- `qa-reports/smoke-triage-status.json`
- `qa-reports/smoke-triage-loop-summary.json`
- `qa-reports/smoke-triage-loop-summary.md`
- `qa-reports/smoke-artifact-validation.json`
- `qa-reports/ui/*.png`
- `qa-baselines/ui/*.png`
- `qa-baselines/ui/baseline-manifest.json`

Trend outputs include retry telemetry such as `uiRetries`, retry step names, top flaky steps, hottest flaky step, per-run `failureCode` classification, window-level failure-class breakdown counts, a `Top failure classes (window)` table, a `Dominant non-none failure class (window)` label, a compact `Failure-class sequence (window, oldest -> newest)` line, and a symbol-mapped `Failure-class sparkline` plus legend in the markdown summary.

`qa-reports/smoke-triage-status.json` now includes both `failureCodeSequence` (string) and `failureCodeSequenceArray` (array) for backward-compatible and machine-friendly parsing.
It also includes diagnostics fields (`diagnosticsPresent`, `diagnosticsSummary`, `diagnosticsApiExitCode`, `diagnosticsUiExitCode`) so local triage can expose failure context quickly.

`qa-reports/smoke-trend-latest.json` (generated by both local and CI trend steps) now includes the same dual-format pair: `failureCodeSequence` (string) and `failureCodeSequenceArray` (array).

`qa-reports/smoke-trend-window.json` now includes both `failureCodeSequence` (array) and `failureCodeSequenceText` (string) for the window timeline.

Trend and triage JSON artifacts now include `schemaVersion` and `generatedBy` metadata fields for safer downstream parsing and schema evolution.

When you run `npm run smoke:triage`, `qa-reports/smoke-trend-summary.md` also gets a `Latest Local Triage` section refreshed with the current `failureCode`, `failureSummary`, and exit statuses.

## Cleanup

Dry run:

```powershell
npm run cleanup:artifacts:dry
```

Delete generated smoke/browser artifacts:

```powershell
npm run cleanup:artifacts
```

The cleanup script only targets ignored/generated QA outputs, local browser profiles, and local tunnel/backend logs.

## GitHub Actions setup

The workflow runs on:

- `workflow_dispatch`
- push to `main`
- push to `master`

It also runs a nightly schedule and maintains a rolling flake trend summary.

The workflow now emits a dedicated `Smoke Failure Classification` annotation and step-summary block (for example `smoke-fatal-ui` or `smoke-assertion-api`) by parsing `qa-reports/smoke-report.json` on every run.

### Optional workflow_dispatch inputs

You can tune trend behavior for manual runs with these optional inputs:

- `trend_window_size`
- `trend_warn_threshold`
- `trend_error_threshold`
- `trend_failure_warn_threshold`
- `trend_failure_error_threshold`
- `trend_max_entries`
- `trend_fail_on_error_threshold`
- `trend_fail_on_failure_error_threshold`
- `triage_loop_runs`

When `trend_fail_on_error_threshold=true`, the workflow will fail if the flake error threshold is reached.

When `trend_fail_on_failure_error_threshold=true`, the workflow will fail if non-none `failureCode` runs in the window reach the failure-class error threshold.

`triage_loop_runs` controls optional extra triage-loop sampling during manual workflow runs (`0` disables). Scheduled nightly runs default to `2` loop iterations for distribution sampling and publish `smoke-triage-loop-summary.md` into the Actions step summary.

### Required repository secret

Create this GitHub Actions secret:

- `BACKEND_ENV_FILE`

Value:

- Paste the full contents of `backend/.env`

### Windows helper

To copy the local backend env file to the clipboard:

```powershell
powershell -ExecutionPolicy Bypass -File .\copy-backend-env-secret.ps1
```

Then in GitHub:

1. Open repository `Settings`
2. Open `Secrets and variables`
3. Open `Actions`
4. Create `New repository secret`
5. Name it `BACKEND_ENV_FILE`
6. Paste the clipboard value

## Notes

- `backend/.env` is ignored from git
- `qa-reports/` is ignored from git
- The smoke suite restores `backend/src/data/db.json` and `backend/src/data/db.json.bak` to their exact pre-run state after each run
