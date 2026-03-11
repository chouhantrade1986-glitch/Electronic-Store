# Electronic Store

Electronic Store is a storefront and admin dashboard built with static HTML/CSS/JavaScript at the repository root and a Node.js/Express backend in [backend](./backend). The backend supports either the legacy JSON datastore at `backend/src/data/db.json` or a SQLite-backed datastore for the core commerce and catalog entities.

## Architecture

- Frontend: static HTML, CSS, JavaScript pages in the repository root
- Backend: Express API in [backend/src/server.js](./backend/src/server.js)
- Data store: JSON by default, or SQLite for core commerce and catalog entities when `DB_PROVIDER=sqlite`
- Payments: simulated flow or Razorpay, depending on backend env
- QA: API smoke, browser smoke, JSON/JUnit reports, Windows CI workflow

## Project Audit Status (March 10, 2026)

- Completed: **81%**
- Remaining: **19%**
- Detailed report: [PROJECT-AUDIT.md](./PROJECT-AUDIT.md)

## Main Areas

- Customer auth and profile management
- Product catalog, search, filters, and product detail pages
- Cart, checkout, orders, invoices, and payment confirmation
- Admin dashboard, catalog CRUD, analytics, and inventory settings
- Back-in-stock requests and order notification delivery
- Phone verification reminders and automation jobs

## Local Setup

### 1. Install backend dependencies

```powershell
cd backend
npm ci
```

### 1a. Install root smoke dependencies

```powershell
npm ci
npm run smoke:install-browsers
```

### 2. Configure backend env

```powershell
cd backend
Copy-Item .env.example .env
```

Required:

- `JWT_SECRET`

Optional but important:

- `DB_PROVIDER=sqlite` to move core commerce data onto SQLite
- `SQLITE_DB_PATH` if you want a custom SQLite file path
- `ALLOW_SEEDED_DEMO_USERS=true` only if you intentionally want seeded local demo accounts
- `ALLOW_PASSWORD_AUTH_FALLBACK=true` only if you intentionally need legacy `/auth/login` or `/auth/register`
- `ADMIN_BOOTSTRAP_SECRET` if you want to create the first real admin over the API
- `PAYMENT_PROVIDER=razorpay`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `ORDER_RESERVATION_TTL_MINUTES`
- `ORDER_RESERVATION_SWEEP_INTERVAL_MS`
- `GOOGLE_DRIVE_*`
- `SMTP_*` or `SENDGRID_*`
- `PHONE_VERIFICATION_*`
- `SMOKE_TEST_*`

### 3. Run the backend

```powershell
run-backend.bat
```

or

```powershell
cd backend
npm run dev
```

Backend default URL: `http://127.0.0.1:4000`

### SQLite migration

The backend can now persist these core entities in SQLite:

- products
- users
- orders
- payments
- after-sales cases
- admin audit trail
- order notifications
- payment webhook events
- auth OTP challenges
- inventory settings
- back-in-stock requests
- back-in-stock notifications
- phone verification reminders
- phone verification automation job state
- phone verification automation settings
- phone verification automation run history

Dry run:

```powershell
cd backend
npm run job:migrate:sqlite
```

Dry run with strict normalization coverage check:

```powershell
cd backend
npm run job:migrate:sqlite -- --strict-normalization
```

Apply migration from the current JSON snapshot:

```powershell
cd backend
npm run job:migrate:sqlite -- --apply
```

Then set:

```env
DB_PROVIDER=sqlite
```

If `SQLITE_DB_PATH` is blank, the backend uses `backend/src/data/electromart.sqlite`.

### 4. Open the frontend

```powershell
run-frontend.bat
```

For QA/static serving you can also run:

```powershell
node qa-static-server.js
```

Frontend QA server default URL: `http://127.0.0.1:5500`

## Demo Users

Local demo users are seeded only when `ALLOW_SEEDED_DEMO_USERS=true`. Do not treat seeded credentials as production access.

Before disabling or purging seeded demo users, create at least one real admin account:

```powershell
cd backend
npm run job:create-admin -- --apply --name="Ops Admin" --email="ops@example.com" --mobile="9876543210" --password="StrongPass1" --address="Jaipur"
```

If you prefer an API/bootstrap path for the first real admin, set `ADMIN_BOOTSTRAP_SECRET` and call:

```powershell
Invoke-RestMethod -Method POST -Uri "http://127.0.0.1:4000/api/auth/admin/bootstrap" `
  -Headers @{ "x-admin-bootstrap-secret" = $env:ADMIN_BOOTSTRAP_SECRET } `
  -ContentType "application/json" `
  -Body (@{
    name = "Ops Admin"
    email = "ops@example.com"
    mobile = "9876543210"
    password = "StrongPass1"
    address = "Jaipur"
  } | ConvertTo-Json)
```

If an older `db.json` already contains seeded demo users, migrate their access state explicitly:

```powershell
cd backend
npm run job:seeded-demo-users -- --apply --disable
```

To re-enable them later:

```powershell
cd backend
npm run job:seeded-demo-users -- --apply --allow
```

If you do not need old seeded demo data at all, purge the demo accounts and their related test orders/payments/notifications:

```powershell
cd backend
npm run job:seeded-demo-users -- --apply --purge
```

Frontend auth and checkout no longer fall back into local demo mode automatically when the backend is unreachable. If you explicitly want local demo fallback in the browser, enable it yourself:

```javascript
localStorage.setItem("electromart_allow_offline_demo", "true");
```

Disable it again with:

```javascript
localStorage.removeItem("electromart_allow_offline_demo");
```

## Tests

Backend unit tests:

```powershell
cd backend
npm test
```

Full smoke suite from repository root:

```powershell
npm run smoke
```

UI visual baseline lock (checkout/orders/wishlist):

```powershell
npm run smoke:ui
npm run smoke:baseline:lock
npm run smoke:baseline:verify
```

Baseline outputs:

- `qa-baselines/ui/qa-auth-browser.png`
- `qa-baselines/ui/qa-account-browser.png`
- `qa-baselines/ui/qa-invoice-browser.png`
- `qa-baselines/ui/qa-checkout-browser.png`
- `qa-baselines/ui/qa-orders-browser.png`
- `qa-baselines/ui/qa-wishlist-browser.png`
- `qa-baselines/ui/baseline-manifest.json`

Generated smoke/browser artifacts cleanup:

```powershell
npm run cleanup:artifacts:dry
npm run cleanup:artifacts
```

Additional smoke/CI notes are documented in [SMOKE-SUITE.md](./SMOKE-SUITE.md).

## CI

GitHub Actions smoke workflow:

- [.github/workflows/smoke-suite.yml](./.github/workflows/smoke-suite.yml)

Required repository secret:

- `BACKEND_ENV_FILE`

Helper for copying local backend env content to the clipboard:

```powershell
powershell -ExecutionPolicy Bypass -File .\copy-backend-env-secret.ps1
```

Production hardening issue seeding (requires GitHub token in `GITHUB_PAT` or `GH_TOKEN`):

```powershell
npm run issues:prod-hardening
```

## Current Limitations

- Current snapshots are fully covered by the managed SQLite schema; unknown future keys still fall back to the shared `app_state` compatibility layer
- Concurrency safety is improved, but this remains a single-process demo architecture
- Razorpay checkout/resume flows require valid backend credentials
- Production deployment still needs stronger user provisioning, monitoring, backups, and infra hardening

Production hardening execution plan:

- [PRODUCTION-HARDENING-BACKLOG.md](./PRODUCTION-HARDENING-BACKLOG.md)
