const fs = require("fs");
const path = require("path");
const { resolveLoadTestConfig, runLoadTest } = require("../lib/loadTest");

function parseArgs(argv = []) {
  const options = {};
  argv.forEach((arg) => {
    const value = String(arg || "").trim();
    if (value === "--allow-remote") {
      options.allowRemote = true;
      return;
    }
    const separator = value.indexOf("=");
    if (separator < 0) {
      return;
    }
    const key = value.slice(0, separator);
    const setting = value.slice(separator + 1).trim();
    if (key === "--base-url") {
      options.baseUrl = setting;
    } else if (key === "--requests") {
      options.requests = setting;
    } else if (key === "--concurrency") {
      options.concurrency = setting;
    } else if (key === "--timeout-ms") {
      options.timeoutMs = setting;
    } else if (key === "--output") {
      options.outputPath = setting;
    }
  });
  return options;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = resolveLoadTestConfig(args);
  const report = await runLoadTest(config);

  if (args.outputPath) {
    const outputPath = path.resolve(process.cwd(), args.outputPath);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.passed) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  process.stderr.write(`${error && error.message ? error.message : "Load test failed."}\n`);
  process.exitCode = 1;
});