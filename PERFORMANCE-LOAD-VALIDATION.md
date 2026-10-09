# API Load Validation

The backend load probe makes concurrent `GET` requests to `/api/health` and `/api/metrics` and reports throughput, status counts, errors, and min/average/p50/p95/max latency. It does not create or mutate customer data.

## Local baseline

Start the canonical application with `npm start`, then from `backend/` run a small baseline:

```powershell
npm run job:load-test -- --requests=100 --concurrency=10 --output=../qa-reports/performance/api-load-local.json
```

The default target is `http://127.0.0.1:4000/api`. Defaults are 100 total requests, concurrency 10, and a 5-second per-request timeout. Requests are capped at 1,000, concurrency at 50, and only the two read-only endpoints are allowed.

## Staging target

Only test a system you own or have explicit authorization to exercise. Begin with low traffic and coordinate the test window with the service owner:

```powershell
npm run job:load-test -- --base-url=https://<STAGING_API_HOST>/api --requests=100 --concurrency=10 --allow-remote --output=../qa-reports/performance/api-load-staging.json
```

Remote targets are rejected unless `--allow-remote` is present. Do not run against production without an approved window, traffic budget, monitoring, and an abort owner. Increase load in measured steps; stop if errors appear, latency rises sharply, or health degrades.

## Reading results

- `requests.failed` must be zero for a healthy probe; inspect status codes and `errors` for failures.
- Compare p50/p95 latency and requests/second across runs on the same host/runtime.
- This small built-in probe is a stability baseline, not a benchmark, soak test, or proof of production capacity. Record host size, runtime version, datastore provider, test configuration, and background traffic alongside results before setting capacity targets.