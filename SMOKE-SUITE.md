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
- `qa-reports/ui/*.png`
- `qa-baselines/ui/*.png`
- `qa-baselines/ui/baseline-manifest.json`

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
- The smoke suite restores `backend/src/data/db.json` after each run
