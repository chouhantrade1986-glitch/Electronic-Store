require("dotenv").config();
const { evaluateAlertRules, resolveAlertPolicyConfig } = require("../lib/alertingPolicy");

function parseArgs(argv = []) {
  const options = {
    failOnAlert: false,
    apiBaseUrl: String(process.env.ALERT_TARGET_API_BASE_URL || "").trim()
  };
  argv.forEach((arg) => {
    const rawValue = String(arg || "").trim();
    const value = rawValue.toLowerCase();
    if (value === "--fail-on-alert") {
      options.failOnAlert = true;
      return;
    }
    if (value.startsWith("--api-base-url=")) {
      const next = rawValue.split("=").slice(1).join("=").trim();
      if (next) {
        options.apiBaseUrl = next;
      }
    }
  });
  return options;
}

function resolveApiBaseUrl(options = {}) {
  const configured = String(options.apiBaseUrl || "").trim();
  if (configured) {
    return configured.replace(/\/+$/, "");
  }
  const port = Number(process.env.PORT || 4000);
  return `http://127.0.0.1:${port}/api`;
}

async function requestJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json"
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(`Request failed with status ${response.status}`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const apiBaseUrl = resolveApiBaseUrl(options);
  const [healthSnapshot, metricsSnapshot] = await Promise.all([
    requestJson(`${apiBaseUrl}/health`),
    requestJson(`${apiBaseUrl}/metrics`)
  ]);
  const config = resolveAlertPolicyConfig(process.env);
  const report = evaluateAlertRules({
    healthSnapshot,
    metricsSnapshot,
    config,
    now: new Date().toISOString()
  });
  report.source = {
    apiBaseUrl
  };

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (options.failOnAlert && report.hasAlerts) {
    process.exitCode = 2;
  }
}

main().catch((error) => {
  const payload = {
    evaluatedAt: new Date().toISOString(),
    service: "electromart-backend",
    hasAlerts: true,
    alertCount: 1,
    source: {
      apiBaseUrl: resolveApiBaseUrl(parseArgs(process.argv.slice(2)))
    },
    alerts: [
      {
        id: "backend-monitoring-endpoint-unreachable",
        severity: "critical",
        summary: "Unable to fetch monitoring snapshots from backend API.",
        threshold: {
          metric: "monitoring.endpoint",
          operator: "reachable",
          value: true,
          actual: false
        },
        runbookUrl: "https://github.com/chouhantrade1986-glitch/Electronic-Store/blob/main/PRODUCTION-INCIDENT-RUNBOOK.md#health-degraded",
        escalationTargets: resolveAlertPolicyConfig(process.env).escalationTargets,
        metadata: {
          message: error && error.message ? error.message : String(error)
        }
      }
    ]
  };
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  process.exitCode = 2;
});
