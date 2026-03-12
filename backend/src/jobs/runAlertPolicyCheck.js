const { evaluateAlertRules, resolveAlertPolicyConfig } = require("../lib/alertingPolicy");
const { buildRuntimeHealthSnapshot } = require("../lib/runtimeHealth");
const { getMetricsSnapshot } = require("../lib/monitoring");

function parseArgs(argv = []) {
  const options = {
    failOnAlert: false
  };
  argv.forEach((arg) => {
    const value = String(arg || "").trim().toLowerCase();
    if (value === "--fail-on-alert") {
      options.failOnAlert = true;
    }
  });
  return options;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const healthSnapshot = buildRuntimeHealthSnapshot();
  const metricsSnapshot = getMetricsSnapshot();
  const config = resolveAlertPolicyConfig(process.env);
  const report = evaluateAlertRules({
    healthSnapshot,
    metricsSnapshot,
    config
  });

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (options.failOnAlert && report.hasAlerts) {
    process.exitCode = 2;
  }
}

main();
