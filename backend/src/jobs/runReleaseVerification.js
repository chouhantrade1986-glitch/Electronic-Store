require("dotenv").config();
const fs = require("fs");
const path = require("path");
const {
  resolveReleaseVerificationConfig,
  verifyReleaseHealth
} = require("../lib/releaseVerification");

function parseArgs(argv = []) {
  const options = {};
  argv.forEach((arg) => {
    const raw = String(arg || "").trim();
    if (!raw) {
      return;
    }
    if (raw.startsWith("--api-base-url=")) {
      options.apiBaseUrl = raw.slice("--api-base-url=".length);
      return;
    }
    if (raw.startsWith("--max-attempts=")) {
      options.maxAttempts = raw.slice("--max-attempts=".length);
      return;
    }
    if (raw.startsWith("--retry-ms=")) {
      options.retryMs = raw.slice("--retry-ms=".length);
      return;
    }
    if (raw.startsWith("--request-timeout-ms=")) {
      options.requestTimeoutMs = raw.slice("--request-timeout-ms=".length);
      return;
    }
    if (raw.startsWith("--output=")) {
      options.outputPath = raw.slice("--output=".length);
    }
  });
  return options;
}

function writeOutput(outputPath, report) {
  if (!outputPath) {
    return;
  }
  const resolved = path.resolve(process.cwd(), outputPath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const config = resolveReleaseVerificationConfig(process.env, options);
  const report = await verifyReleaseHealth(config);
  writeOutput(options.outputPath, report);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.passed) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  process.stderr.write(`${error && error.stack ? error.stack : error}\n`);
  process.exitCode = 1;
});
