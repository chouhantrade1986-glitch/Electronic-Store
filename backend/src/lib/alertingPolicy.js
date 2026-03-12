function toNumber(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return parsed;
}

function toPositiveNumber(value, fallback, min = 0) {
  const parsed = toNumber(value, fallback);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(min, parsed);
}

function toCsvList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function trimTrailingSlash(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function resolveAlertPolicyConfig(env = process.env) {
  const defaultRunbookBaseUrl = [
    "https://github.com/chouhantrade1986-glitch/Electronic-Store",
    "blob/main/PRODUCTION-INCIDENT-RUNBOOK.md"
  ].join("/");

  return {
    minRequestVolume5m: Math.max(1, Math.floor(toPositiveNumber(env.ALERT_MIN_REQUEST_VOLUME_5M, 20, 1))),
    errorRatePercent5m: toPositiveNumber(env.ALERT_ERROR_RATE_PERCENT_5M, 5, 0),
    avgLatencyMs5m: toPositiveNumber(env.ALERT_AVG_LATENCY_MS_5M, 1200, 1),
    maxLatencyMs5m: toPositiveNumber(env.ALERT_MAX_LATENCY_MS_5M, 5000, 1),
    runbookBaseUrl: trimTrailingSlash(env.ALERT_RUNBOOK_BASE_URL || defaultRunbookBaseUrl) || defaultRunbookBaseUrl,
    escalationTargets: toCsvList(env.ALERT_ESCALATION_TARGETS || "email:ops-oncall@electromart.in,slack:#incident-ops")
  };
}

function resolveRunbookUrl(config, anchor) {
  const base = trimTrailingSlash(config && config.runbookBaseUrl ? config.runbookBaseUrl : "");
  if (!base) {
    return "";
  }
  const normalizedAnchor = String(anchor || "").trim().replace(/^#/, "");
  return normalizedAnchor ? `${base}#${normalizedAnchor}` : base;
}

function buildAlert({
  id,
  severity = "high",
  summary = "",
  service = "electromart-backend",
  threshold = {},
  runbookUrl = "",
  escalationTargets = [],
  metadata = {},
  detectedAt = new Date().toISOString()
}) {
  return {
    id: String(id || "").trim() || "alert-unknown",
    severity: String(severity || "high").trim().toLowerCase() || "high",
    service: String(service || "electromart-backend").trim() || "electromart-backend",
    summary: String(summary || "").trim(),
    detectedAt: String(detectedAt || new Date().toISOString()),
    threshold: {
      metric: String(threshold.metric || "").trim(),
      operator: String(threshold.operator || "").trim(),
      value: threshold.value,
      actual: threshold.actual
    },
    runbookUrl: String(runbookUrl || "").trim(),
    escalationTargets: Array.isArray(escalationTargets) ? [...escalationTargets] : [],
    metadata: metadata && typeof metadata === "object" ? { ...metadata } : {}
  };
}

function evaluateAlertRules({
  healthSnapshot = {},
  metricsSnapshot = {},
  config = resolveAlertPolicyConfig(),
  now = new Date().toISOString()
} = {}) {
  const service = String(healthSnapshot && healthSnapshot.service ? healthSnapshot.service : "electromart-backend");
  const alerts = [];

  const requests = metricsSnapshot && metricsSnapshot.requests && typeof metricsSnapshot.requests === "object"
    ? metricsSnapshot.requests
    : {};
  const requestVolume5m = Number(requests.lastFiveMinutes || 0);
  const errorRate5m = Number(requests.errorRateLastFiveMinutes || 0);
  const avgLatencyMs = Number(requests && requests.duration ? requests.duration.averageMs || 0 : 0);
  const maxLatencyMs = Number(requests && requests.duration ? requests.duration.maxMs || 0 : 0);
  const hasMeaningfulTraffic = requestVolume5m >= Number(config.minRequestVolume5m || 0);

  if (healthSnapshot && healthSnapshot.ok === false) {
    alerts.push(buildAlert({
      id: "backend-health-degraded",
      severity: "critical",
      service,
      summary: "Backend health endpoint reported degraded dependencies.",
      threshold: {
        metric: "health.ok",
        operator: "equals",
        value: true,
        actual: Boolean(healthSnapshot.ok)
      },
      runbookUrl: resolveRunbookUrl(config, "health-degraded"),
      escalationTargets: config.escalationTargets,
      metadata: {
        status: healthSnapshot.status || "degraded"
      },
      detectedAt: now
    }));
  }

  if (hasMeaningfulTraffic && errorRate5m >= Number(config.errorRatePercent5m || 0)) {
    alerts.push(buildAlert({
      id: "backend-http-error-rate-high",
      severity: "high",
      service,
      summary: "HTTP 5xx error rate crossed configured threshold in the last 5 minutes.",
      threshold: {
        metric: "requests.errorRateLastFiveMinutes",
        operator: ">=",
        value: Number(config.errorRatePercent5m),
        actual: Number(errorRate5m.toFixed(2))
      },
      runbookUrl: resolveRunbookUrl(config, "error-rate-high"),
      escalationTargets: config.escalationTargets,
      metadata: {
        requestVolume5m
      },
      detectedAt: now
    }));
  }

  if (hasMeaningfulTraffic && avgLatencyMs >= Number(config.avgLatencyMs5m || 0)) {
    alerts.push(buildAlert({
      id: "backend-http-latency-avg-high",
      severity: "medium",
      service,
      summary: "Average HTTP latency crossed configured threshold in the last 5 minutes.",
      threshold: {
        metric: "requests.duration.averageMs",
        operator: ">=",
        value: Number(config.avgLatencyMs5m),
        actual: Number(avgLatencyMs.toFixed(2))
      },
      runbookUrl: resolveRunbookUrl(config, "latency-high"),
      escalationTargets: config.escalationTargets,
      metadata: {
        requestVolume5m
      },
      detectedAt: now
    }));
  }

  if (hasMeaningfulTraffic && maxLatencyMs >= Number(config.maxLatencyMs5m || 0)) {
    alerts.push(buildAlert({
      id: "backend-http-latency-max-high",
      severity: "medium",
      service,
      summary: "Peak HTTP latency crossed configured threshold in the last 5 minutes.",
      threshold: {
        metric: "requests.duration.maxMs",
        operator: ">=",
        value: Number(config.maxLatencyMs5m),
        actual: Number(maxLatencyMs.toFixed(2))
      },
      runbookUrl: resolveRunbookUrl(config, "latency-high"),
      escalationTargets: config.escalationTargets,
      metadata: {
        requestVolume5m
      },
      detectedAt: now
    }));
  }

  return {
    evaluatedAt: String(now || new Date().toISOString()),
    service,
    hasAlerts: alerts.length > 0,
    alertCount: alerts.length,
    thresholds: {
      minRequestVolume5m: config.minRequestVolume5m,
      errorRatePercent5m: config.errorRatePercent5m,
      avgLatencyMs5m: config.avgLatencyMs5m,
      maxLatencyMs5m: config.maxLatencyMs5m
    },
    alerts
  };
}

module.exports = {
  evaluateAlertRules,
  resolveAlertPolicyConfig,
  resolveRunbookUrl
};
