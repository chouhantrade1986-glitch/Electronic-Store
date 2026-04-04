const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const ROOT = __dirname;
const REPORTS_DIR = path.join(ROOT, "qa-reports");
const UI_ARTIFACTS_DIR = path.join(REPORTS_DIR, "ui");
const API_STDOUT_LOG = path.join(REPORTS_DIR, "api-smoke.stdout.log");
const API_STDERR_LOG = path.join(REPORTS_DIR, "api-smoke.stderr.log");
const UI_STDOUT_LOG = path.join(REPORTS_DIR, "ui-smoke.stdout.log");
const UI_STDERR_LOG = path.join(REPORTS_DIR, "ui-smoke.stderr.log");
const JSON_REPORT_PATH = path.join(REPORTS_DIR, "smoke-report.json");
const JUNIT_REPORT_PATH = path.join(REPORTS_DIR, "smoke-report.junit.xml");

function parseArgs(argv = []) {
  const options = {
    reportsDir: REPORTS_DIR
  };

  argv.forEach((arg) => {
    const value = String(arg || "").trim();
    if (!value) {
      return;
    }
    if (value.startsWith("--reports-dir=")) {
      const nextDir = value.split("=").slice(1).join("=").trim();
      if (nextDir) {
        options.reportsDir = path.resolve(ROOT, nextDir);
      }
      return;
    }
  });

  return options;
}

const CLI_OPTIONS = parseArgs(process.argv.slice(2));
const REPORT_ROOT = CLI_OPTIONS.reportsDir;
const UI_DIR = path.join(REPORT_ROOT, "ui");
const API_STDOUT_PATH = path.join(REPORT_ROOT, path.basename(API_STDOUT_LOG));
const API_STDERR_PATH = path.join(REPORT_ROOT, path.basename(API_STDERR_LOG));
const UI_STDOUT_PATH = path.join(REPORT_ROOT, path.basename(UI_STDOUT_LOG));
const UI_STDERR_PATH = path.join(REPORT_ROOT, path.basename(UI_STDERR_LOG));
const JSON_REPORT = path.join(REPORT_ROOT, path.basename(JSON_REPORT_PATH));
const JUNIT_REPORT = path.join(REPORT_ROOT, path.basename(JUNIT_REPORT_PATH));

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeText(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
}

function timestamp() {
  return new Date().toISOString();
}

function logStep(message) {
  process.stdout.write(`[${timestamp()}] ${message}\n`);
}

function xmlEscape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function requireResolveSafe(moduleName) {
  try {
    return require.resolve(moduleName, { paths: [ROOT] });
  } catch (error) {
    return "";
  }
}

function parseJsonOutput(rawText, label) {
  const trimmed = String(rawText || "").trim();
  if (!trimmed) {
    throw new Error(`${label} produced empty output.`);
  }

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      const candidate = trimmed.slice(firstBrace, lastBrace + 1);
      return JSON.parse(candidate);
    }
    throw new Error(`${label} did not produce valid JSON.`);
  }
}

function runCommand(command, args, options = {}) {
  const cwd = options.cwd || ROOT;
  const env = options.env || process.env;
  const label = options.label || command;
  const startedAt = new Date();
  const startedAtMs = Date.now();

  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      env,
      shell: false,
      windowsHide: true
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      stdout += text;
      if (options.echoOutput) {
        process.stdout.write(text);
      }
    });

    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      stderr += text;
      if (options.echoOutput) {
        process.stderr.write(text);
      }
    });

    child.on("error", (error) => {
      stderr += `${error && error.stack ? error.stack : error}\n`;
    });

    child.on("close", (code, signal) => {
      const finishedAt = new Date();
      resolve({
        label,
        command,
        args,
        cwd,
        code: typeof code === "number" ? code : -1,
        signal: signal || "",
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        durationSeconds: Math.max((Date.now() - startedAtMs) / 1000, 0),
        stdout,
        stderr
      });
    });
  });
}

function buildApiCases(apiReport) {
  const health = apiReport.health || {};
  const metrics = apiReport.metrics || {};
  const pages = Array.isArray(apiReport.pages) ? apiReport.pages : [];
  const api = apiReport.api || {};
  const jobs = apiReport.jobs || {};
  const pageFailures = pages.filter((entry) => Number(entry.status) !== 200);

  return [
    {
      suite: "api",
      name: "health",
      passed: Boolean(health) && (String(health.status || "").toLowerCase() === "ok" || Object.keys(health).length > 0),
      message: "Backend health endpoint did not report a healthy response.",
      details: health
    },
    {
      suite: "api",
      name: "metrics",
      passed: Boolean(metrics && metrics.process && metrics.requests)
        && Number(metrics.process.uptimeSeconds || 0) >= 0
        && Number(metrics.requests.total || 0) >= 0,
      message: "Backend metrics endpoint did not return expected runtime counters.",
      details: {
        generatedAt: metrics.generatedAt,
        uptimeSeconds: metrics && metrics.process ? metrics.process.uptimeSeconds : null,
        totalRequests: metrics && metrics.requests ? metrics.requests.total : null
      }
    },
    {
      suite: "api",
      name: "pages",
      passed: pages.length >= 10 && pageFailures.length === 0,
      message: `Expected all smoke pages to return HTTP 200. Failed pages: ${pageFailures.map((entry) => entry.page).join(", ") || "none"}.`,
      details: pages
    },
    {
      suite: "api",
      name: "auth-and-account",
      passed: api.adminRole === "admin"
        && api.customerRole === "customer"
        && api.phoneVerificationRequested === true
        && api.phoneVerificationConfirmed === true,
      message: "Admin/customer auth or phone verification smoke failed.",
      details: {
        adminRole: api.adminRole,
        customerRole: api.customerRole,
        phoneVerificationRequested: api.phoneVerificationRequested,
        phoneVerificationConfirmed: api.phoneVerificationConfirmed,
        testNotificationMessage: api.testNotificationMessage
      }
    },
    {
      suite: "api",
      name: "orders-and-payments",
      passed: Boolean(api.orderAId)
        && Boolean(api.orderBId)
        && api.orderAStatusAfterAdmin === "shipped"
        && api.orderBStatusAfterCancel === "cancelled"
        && Number(api.customerOrdersCount || 0) >= 1
        && Number(api.customerNotificationsCount || 0) >= 1,
      message: "Order creation, admin update, cancellation, or customer notifications failed.",
      details: {
        orderAId: api.orderAId,
        codPaymentAStatus: api.codPaymentAStatus,
        orderAStatusAfterAdmin: api.orderAStatusAfterAdmin,
        orderBId: api.orderBId,
        orderBStatusAfterCancel: api.orderBStatusAfterCancel,
        customerOrdersCount: api.customerOrdersCount,
        customerNotificationsCount: api.customerNotificationsCount
      }
    },
    {
      suite: "api",
      name: "catalog-and-admin",
      passed: Number(api.productCount || 0) > 0
        && Boolean(api.product1Name)
        && Boolean(api.createdProductId)
        && Number(api.updatedProductStock) === 5
        && Boolean(api.clonedProductId)
        && api.backInStockCreated === true
        && Number(api.backInStockRequestsAfter || 0) >= Number(api.backInStockRequestsBefore || 0)
        && Number(api.dashboardProducts || 0) > 0
        && Number(api.adminUsersCount || 0) > 0
        && Number(api.adminOrdersCount || 0) > 0
        && Number(api.adminCatalogCount || 0) > 0
        && api.analyticsHasRevenueSeries === true,
      message: "Catalog CRUD, back-in-stock, or admin dashboard smoke failed.",
      details: {
        productCount: api.productCount,
        product1Name: api.product1Name,
        createdProductId: api.createdProductId,
        updatedProductStock: api.updatedProductStock,
        backInStockCreated: api.backInStockCreated,
        backInStockRequestsBefore: api.backInStockRequestsBefore,
        backInStockRequestsAfter: api.backInStockRequestsAfter,
        backInStockDispatchMatched: api.backInStockDispatchMatched,
        backInStockStatus: api.backInStockStatus,
        clonedProductId: api.clonedProductId,
        dashboardProducts: api.dashboardProducts,
        adminUsersCount: api.adminUsersCount,
        adminOrdersCount: api.adminOrdersCount,
        adminSalesCount: api.adminSalesCount,
        adminCatalogCount: api.adminCatalogCount,
        inventoryDefaultThreshold: api.inventoryDefaultThreshold,
        analyticsHasRevenueSeries: api.analyticsHasRevenueSeries,
        adminOrderNotificationsCount: api.adminOrderNotificationsCount,
        phoneAutomationCandidateCount: api.phoneAutomationCandidateCount
      }
    },
    {
      suite: "api",
      name: "jobs",
      passed: jobs.razorpayCredentialSmokePassed === true
        && jobs.razorpayResumeSmokePassed === true
        && jobs.phoneAutomationDryRunPassed === true,
      message: "One or more backend smoke jobs failed.",
      details: jobs
    }
  ];
}

function buildUiCases(uiReport) {
  const mapping = [
    { key: "auth", name: "auth" },
    { key: "productDetail", name: "product-detail" },
    { key: "cart", name: "cart" },
    { key: "account", name: "account" },
    { key: "admin", name: "admin-dashboard" },
    { key: "checkout", name: "checkout" },
    { key: "wishlist", name: "wishlist" },
    { key: "invoice", name: "invoice" },
    { key: "orders", name: "orders" }
  ];

  return mapping.map((entry) => {
    const details = uiReport[entry.key] || {};
    const skipped = details.skipped === true
      || Boolean(details.result && details.result.skipped === true);
    const passed = details.passed === true || skipped;
    return {
      suite: "ui",
      name: entry.name,
      passed,
      skipped,
      message: `${entry.name} browser smoke failed.`,
      details
    };
  });
}

function buildJUnitXml(suites) {
  const tests = suites.reduce((sum, suite) => sum + suite.testcases.length, 0);
  const failures = suites.reduce((sum, suite) => sum + suite.failures, 0);
  const skipped = suites.reduce((sum, suite) => sum + suite.skipped, 0);
  const duration = suites.reduce((sum, suite) => sum + suite.durationSeconds, 0);

  const suitesXml = suites.map((suite) => {
    const testcasesXml = suite.testcases.map((testcase) => {
      const detailText = JSON.stringify(testcase.details, null, 2);
      const testcaseDuration = Number(testcase.details && testcase.details.durationMs) > 0
        ? Number(testcase.details.durationMs) / 1000
        : suite.durationSeconds;
      const failureXml = testcase.passed
        ? ""
        : `\n      <failure message="${xmlEscape(testcase.message)}">${xmlEscape(detailText)}</failure>`;
      const skippedXml = testcase.skipped
        ? "\n      <skipped message=\"Test skipped in smoke environment.\"/>"
        : "";
      return [
        `    <testcase classname="${xmlEscape(`electromart.${suite.name}`)}" name="${xmlEscape(testcase.name)}" time="${testcaseDuration.toFixed(3)}">`,
        failureXml,
        skippedXml,
        `\n      <system-out>${xmlEscape(detailText)}</system-out>`,
        "\n    </testcase>"
      ].join("");
    }).join("\n");

    return [
      `  <testsuite name="${xmlEscape(`electromart.${suite.name}`)}" tests="${suite.testcases.length}" failures="${suite.failures}" errors="0" skipped="${suite.skipped}" time="${suite.durationSeconds.toFixed(3)}" timestamp="${xmlEscape(suite.timestamp)}">`,
      testcasesXml,
      "\n  </testsuite>"
    ].join("\n");
  }).join("\n");

  return [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    `<testsuites name="electromart-smoke" tests="${tests}" failures="${failures}" errors="0" skipped="${skipped}" time="${duration.toFixed(3)}">`,
    suitesXml,
    "</testsuites>"
  ].join("\n");
}

function ensurePlaywrightAvailable() {
  const existingPath = requireResolveSafe("playwright");
  if (existingPath) {
    return;
  }

  throw new Error([
    "Playwright is required for the smoke suite but is not installed.",
    "Run `npm ci` in the repository root, then run `npm run smoke:install-browsers` once.",
    "After that, rerun `npm run smoke` or `run-smoke-suite.bat`."
  ].join(" "));
}

async function main() {
  ensureDir(REPORT_ROOT);
  ensureDir(UI_DIR);

  const startedAt = new Date();
  let apiCommandResult = null;
  let uiCommandResult = null;
  let apiReport = null;
  let uiReport = null;
  let exitCode = 0;
  let fatalError = "";

  try {
    ensurePlaywrightAvailable();

    logStep("Running API smoke suite.");
    apiCommandResult = await runCommand("powershell.exe", [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      path.join(ROOT, "qa-smoke.ps1")
    ], {
      cwd: ROOT,
      label: "api-smoke",
      echoOutput: true
    });
    writeText(API_STDOUT_PATH, apiCommandResult.stdout);
    writeText(API_STDERR_PATH, apiCommandResult.stderr);
    if (apiCommandResult.code !== 0) {
      const rawDetail = String(apiCommandResult.stderr || apiCommandResult.stdout || "").trim();
      const detailSummary = rawDetail
        ? rawDetail.split(/\r?\n/).slice(-12).join(" | ")
        : "No additional API smoke output captured.";
      throw new Error(`API smoke command failed with exit code ${apiCommandResult.code}. ${detailSummary}`);
    }
    apiReport = parseJsonOutput(apiCommandResult.stdout, "API smoke");

    logStep("Running browser smoke suite.");
    uiCommandResult = await runCommand("node", [
      path.join(ROOT, "qa-ui-smoke.js"),
      `--artifacts-dir=${UI_DIR}`
    ], {
      cwd: ROOT,
      label: "ui-smoke",
      echoOutput: true
    });
    writeText(UI_STDOUT_PATH, uiCommandResult.stdout);
    writeText(UI_STDERR_PATH, uiCommandResult.stderr);
    if (uiCommandResult.code !== 0) {
      const rawDetail = String(uiCommandResult.stderr || uiCommandResult.stdout || "").trim();
      const detailSummary = rawDetail
        ? rawDetail.split(/\r?\n/).slice(-12).join(" | ")
        : "No additional UI smoke output captured.";
      throw new Error(`UI smoke command failed with exit code ${uiCommandResult.code}. ${detailSummary}`);
    }
    uiReport = parseJsonOutput(uiCommandResult.stdout, "UI smoke");
  } catch (error) {
    exitCode = 1;
    fatalError = error && error.stack ? error.stack : String(error);
  }

  const finishedAt = new Date();
  const apiCases = apiReport ? buildApiCases(apiReport) : [];
  const uiCases = uiReport ? buildUiCases(uiReport) : [];
  const suites = [
    {
      name: "api",
      timestamp: apiCommandResult ? apiCommandResult.startedAt : startedAt.toISOString(),
      durationSeconds: apiCommandResult ? apiCommandResult.durationSeconds : 0,
      testcases: apiCases,
      failures: apiCases.filter((entry) => !entry.passed).length,
      skipped: apiCases.filter((entry) => entry.skipped === true).length
    },
    {
      name: "ui",
      timestamp: uiCommandResult ? uiCommandResult.startedAt : startedAt.toISOString(),
      durationSeconds: uiCommandResult ? uiCommandResult.durationSeconds : 0,
      testcases: uiCases,
      failures: uiCases.filter((entry) => !entry.passed).length,
      skipped: uiCases.filter((entry) => entry.skipped === true).length
    }
  ].filter((suite) => suite.testcases.length > 0);

  const assertionFailures = suites.reduce((sum, suite) => sum + suite.failures, 0);
  if (assertionFailures > 0) {
    exitCode = 1;
  }

  const report = {
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    reportsDir: REPORT_ROOT,
    artifactsDir: UI_DIR,
    exitCode,
    fatalError,
    summary: {
      suites: suites.length,
      tests: suites.reduce((sum, suite) => sum + suite.testcases.length, 0),
      failures: assertionFailures,
      skipped: suites.reduce((sum, suite) => sum + suite.skipped, 0)
    },
    commands: {
      api: apiCommandResult,
      ui: uiCommandResult
    },
    raw: {
      api: apiReport,
      ui: uiReport
    },
    assertions: suites
  };

  writeText(JSON_REPORT, `${JSON.stringify(report, null, 2)}\n`);
  writeText(JUNIT_REPORT, buildJUnitXml(suites));

  if (fatalError) {
    process.stderr.write(`${fatalError}\n`);
  }

  logStep(`Smoke reports written to ${REPORT_ROOT}`);
  logStep(`JSON report: ${JSON_REPORT}`);
  logStep(`JUnit report: ${JUNIT_REPORT}`);

  process.exitCode = exitCode;
}

main().catch((error) => {
  process.stderr.write(`${error && error.stack ? error.stack : error}\n`);
  process.exitCode = 1;
});
