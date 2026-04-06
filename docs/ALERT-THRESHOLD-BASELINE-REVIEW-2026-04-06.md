# Alert Threshold Baseline Review (April 6, 2026)

Last reviewed: April 6, 2026

Tracking issue: [#34](https://github.com/chouhantrade1986-glitch/Electronic-Store/issues/34)

Owner: `@chouhantrade1986-glitch`

## Scope

Review `ALERT_*` policy thresholds using the latest seven-day operational evidence and confirm whether threshold changes are needed.

## Evidence Inputs

### Seven-day CI reliability window (April 1 to April 6, 2026)

| Workflow | Runs | Success | Failed | Avg duration (min) | Latest run |
| --- | ---: | ---: | ---: | ---: | --- |
| `smoke-suite.yml` | 60 | 28 | 32 | 2.58 | [run 24038900673](https://github.com/chouhantrade1986-glitch/Electronic-Store/actions/runs/24038900673) |
| `release-guardrails.yml` | 4 | 2 | 2 | 3.62 | [run 24003104432](https://github.com/chouhantrade1986-glitch/Electronic-Store/actions/runs/24003104432) |
| `workflow-action-governance.yml` | 7 | 6 | 1 | 0.42 | [run 24007085270](https://github.com/chouhantrade1986-glitch/Electronic-Store/actions/runs/24007085270) |
| `a2z-weekly-audit-intake.yml` | 4 | 4 | 0 | 0.15 | [run 24020746868](https://github.com/chouhantrade1986-glitch/Electronic-Store/actions/runs/24020746868) |

### Runtime request/error/latency snapshots

- Controlled local baseline load sample (61 requests to `/api/health`):
  - `requests.lastFiveMinutes=61`
  - `requests.errorRateLastFiveMinutes=0`
  - `requests.duration.averageMs=82.69`
  - `requests.duration.maxMs=3632`
- API smoke snapshot (`qa-smoke.ps1` metrics capture):
  - `requests.lastFiveMinutes=2`
  - `requests.errorRateLastFiveMinutes=0`
  - `requests.duration.averageMs=1841.5`
  - `requests.duration.maxMs=3658`

Observed request/latency envelope used for calibration:

- last-five-minute volume: `2` to `61`
- error rate: `0%`
- average latency: `82.69 ms` to `1841.5 ms`
- max latency: `3632 ms` to `3658 ms`

## Threshold Review (Before vs After)

| Env var | Before | After | Decision |
| --- | ---: | ---: | --- |
| `ALERT_MIN_REQUEST_VOLUME_5M` | 20 | 20 | Keep. Maintains low-traffic noise protection without suppressing meaningful bursts. |
| `ALERT_ERROR_RATE_PERCENT_5M` | 5 | 5 | Keep. No observed elevated 5xx ratio in baseline samples. |
| `ALERT_AVG_LATENCY_MS_5M` | 1200 | 1200 | Keep. Captures sustained latency regressions while avoiding single-request spikes. |
| `ALERT_MAX_LATENCY_MS_5M` | 5000 | 5000 | Keep. Preserves high-latency incident detection for severe outliers. |

Calibration decision for this cycle: **no threshold value changes**.

## Validation Evidence

Executed baseline profile checks against a live backend with valid local env policy:

```powershell
npm.cmd --prefix backend run job:alerts:check
npm.cmd --prefix backend run job:alerts:check -- --fail-on-alert
```

Result:

- `hasAlerts=false`
- `alertCount=0`
- Threshold set remained active and healthy under baseline profile.

## Follow-up

1. Re-run this review in the week of April 13, 2026 using the same command set.
2. Keep recording review output in runbook notes and weekly audit docs.