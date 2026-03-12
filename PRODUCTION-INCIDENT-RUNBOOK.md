# Production Incident Runbook

Last updated: March 11, 2026

## Escalation Path

1. `primary`: `email:ops-oncall@electromart.in`
2. `secondary`: `slack:#incident-ops`
3. If unresolved within 15 minutes, escalate to engineering owner and business stakeholder.

## Health Degraded

Alert id: `backend-health-degraded`

Immediate checks:

1. Call `GET /api/health` and confirm which dependency is degraded.
2. Check datastore status (provider availability and read/write ability).
3. Validate auth dependency (`JWT_SECRET` and startup env validity).
4. Verify scheduler states (reservation expiry and phone-verification automation).

Mitigation:

1. If datastore unavailable, switch traffic to healthy instance and restore datastore service.
2. If auth config invalid, redeploy with corrected secret configuration.
3. If scheduler unhealthy, restart backend after fixing env/config root cause.

## Error Rate High

Alert id: `backend-http-error-rate-high`

Immediate checks:

1. Pull recent structured logs by `event=http_error` and group by `path`.
2. Confirm whether failures are concentrated on one API (`auth`, `orders`, `payments`).
3. Compare `GET /api/metrics` request volume and error rate with deployment timeline.

Mitigation:

1. Roll back latest release if regression is clear.
2. Apply targeted rate limiting if abuse traffic is causing spikes.
3. Disable risky integration toggles (gateway, email/SMS provider) if needed.

## Latency High

Alert ids:

- `backend-http-latency-avg-high`
- `backend-http-latency-max-high`

Immediate checks:

1. Inspect `GET /api/metrics` duration fields and top routes.
2. Check backend process memory growth and GC pressure.
3. Review datastore I/O latency and upstream provider timeout rates.

Mitigation:

1. Temporarily reduce expensive background job load.
2. Increase backend replicas and confirm load balancing.
3. Roll back recent performance-impacting changes if latency persists.

## False-Positive Baseline Notes

Current policy avoids low-traffic noise by requiring minimum request volume in last 5 minutes before rate/latency alerts fire.

- `ALERT_MIN_REQUEST_VOLUME_5M=20`
- `ALERT_ERROR_RATE_PERCENT_5M=5`
- `ALERT_AVG_LATENCY_MS_5M=1200`
- `ALERT_MAX_LATENCY_MS_5M=5000`

Review this baseline weekly after collecting real production metrics.
