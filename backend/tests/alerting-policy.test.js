const test = require("node:test");
const assert = require("node:assert/strict");

const {
  evaluateAlertRules,
  resolveAlertPolicyConfig,
  resolveRunbookUrl
} = require("../src/lib/alertingPolicy");

test("resolveAlertPolicyConfig applies defaults and env overrides", () => {
  const config = resolveAlertPolicyConfig({
    ALERT_MIN_REQUEST_VOLUME_5M: "15",
    ALERT_ERROR_RATE_PERCENT_5M: "7.5",
    ALERT_AVG_LATENCY_MS_5M: "1400",
    ALERT_MAX_LATENCY_MS_5M: "6500",
    ALERT_RUNBOOK_BASE_URL: "https://example.com/runbook/",
    ALERT_ESCALATION_TARGETS: "email:ops@example.com,slack:#ops"
  });

  assert.equal(config.minRequestVolume5m, 15);
  assert.equal(config.errorRatePercent5m, 7.5);
  assert.equal(config.avgLatencyMs5m, 1400);
  assert.equal(config.maxLatencyMs5m, 6500);
  assert.equal(config.runbookBaseUrl, "https://example.com/runbook");
  assert.deepEqual(config.escalationTargets, [
    "email:ops@example.com",
    "slack:#ops"
  ]);
});

test("evaluateAlertRules returns no alerts for healthy low-risk snapshot", () => {
  const report = evaluateAlertRules({
    healthSnapshot: {
      ok: true,
      service: "electromart-backend",
      status: "ok"
    },
    metricsSnapshot: {
      requests: {
        lastFiveMinutes: 40,
        errorRateLastFiveMinutes: 2,
        duration: {
          averageMs: 420,
          maxMs: 1100
        }
      }
    },
    config: resolveAlertPolicyConfig({
      ALERT_MIN_REQUEST_VOLUME_5M: "20",
      ALERT_ERROR_RATE_PERCENT_5M: "5",
      ALERT_AVG_LATENCY_MS_5M: "1200",
      ALERT_MAX_LATENCY_MS_5M: "5000"
    }),
    now: "2026-03-11T10:00:00.000Z"
  });

  assert.equal(report.hasAlerts, false);
  assert.equal(report.alertCount, 0);
});

test("evaluateAlertRules fires degraded health and threshold alerts with runbook links", () => {
  const config = resolveAlertPolicyConfig({
    ALERT_MIN_REQUEST_VOLUME_5M: "20",
    ALERT_ERROR_RATE_PERCENT_5M: "5",
    ALERT_AVG_LATENCY_MS_5M: "1200",
    ALERT_MAX_LATENCY_MS_5M: "5000",
    ALERT_RUNBOOK_BASE_URL: "https://example.com/ops/runbook"
  });
  const report = evaluateAlertRules({
    healthSnapshot: {
      ok: false,
      service: "electromart-backend",
      status: "degraded"
    },
    metricsSnapshot: {
      requests: {
        lastFiveMinutes: 120,
        errorRateLastFiveMinutes: 9.2,
        duration: {
          averageMs: 1510,
          maxMs: 7200
        }
      }
    },
    config,
    now: "2026-03-11T10:01:00.000Z"
  });

  assert.equal(report.hasAlerts, true);
  assert.equal(report.alertCount >= 3, true);
  const degradedAlert = report.alerts.find((item) => item.id === "backend-health-degraded");
  assert.ok(degradedAlert);
  assert.equal(degradedAlert.service, "electromart-backend");
  assert.equal(typeof degradedAlert.threshold, "object");
  assert.equal(typeof degradedAlert.runbookUrl, "string");
  assert.match(degradedAlert.runbookUrl, /runbook/i);
  assert.equal(degradedAlert.escalationTargets.length > 0, true);

  const errorRateAlert = report.alerts.find((item) => item.id === "backend-http-error-rate-high");
  assert.ok(errorRateAlert);
  assert.equal(errorRateAlert.threshold.metric, "requests.errorRateLastFiveMinutes");
  assert.equal(errorRateAlert.threshold.value, 5);
  assert.equal(errorRateAlert.threshold.actual, 9.2);
});

test("resolveRunbookUrl appends anchor correctly", () => {
  const url = resolveRunbookUrl({
    runbookBaseUrl: "https://example.com/runbook"
  }, "latency-high");
  assert.equal(url, "https://example.com/runbook#latency-high");
});
