const fs = require("fs");
const path = require("path");
const {
  dbPath,
  getSqliteDbPath
} = require("../lib/db");
const {
  importJsonSnapshotToSqlite,
  summarizeNormalizationCoverage
} = require("../lib/sqliteStore");

function parseArgs(argv = []) {
  return {
    apply: argv.includes("--apply"),
    strictNormalization: argv.includes("--strict-normalization")
  };
}

function readJsonSnapshot(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function buildSummary(snapshot) {
  const safe = snapshot && typeof snapshot === "object" ? snapshot : {};
  return {
    products: Array.isArray(safe.products) ? safe.products.length : 0,
    users: Array.isArray(safe.users) ? safe.users.length : 0,
    orders: Array.isArray(safe.orders) ? safe.orders.length : 0,
    payments: Array.isArray(safe.payments) ? safe.payments.length : 0,
    afterSalesCases: Array.isArray(safe.afterSalesCases) ? safe.afterSalesCases.length : 0,
    adminAuditTrail: Array.isArray(safe.adminAuditTrail) ? safe.adminAuditTrail.length : 0,
    orderNotifications: Array.isArray(safe.orderNotifications) ? safe.orderNotifications.length : 0,
    paymentWebhookEvents: Array.isArray(safe.paymentWebhookEvents) ? safe.paymentWebhookEvents.length : 0,
    authOtpChallenges: Array.isArray(safe.authOtpChallenges) ? safe.authOtpChallenges.length : 0,
    backInStockRequests: Array.isArray(safe.backInStockRequests) ? safe.backInStockRequests.length : 0,
    backInStockNotifications: Array.isArray(safe.backInStockNotifications) ? safe.backInStockNotifications.length : 0,
    phoneVerificationReminders: Array.isArray(safe.phoneVerificationReminders) ? safe.phoneVerificationReminders.length : 0,
    inventorySettings: safe.inventorySettings && typeof safe.inventorySettings === "object" ? 1 : 0,
    automationJobs: safe.automationJobs && typeof safe.automationJobs === "object" ? 1 : 0,
    automationSettings: safe.automationSettings && typeof safe.automationSettings === "object" ? 1 : 0,
    automationRunHistory: safe.automationRunHistory && typeof safe.automationRunHistory === "object" ? 1 : 0
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const sourcePath = path.resolve(dbPath);
  const sqlitePath = getSqliteDbPath();

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source JSON database not found at ${sourcePath}`);
  }

  const snapshot = readJsonSnapshot(sourcePath);
  const summary = buildSummary(snapshot);
  const normalizationCoverage = summarizeNormalizationCoverage(snapshot);

  if (args.strictNormalization && !normalizationCoverage.fullyNormalized) {
    throw new Error(`Snapshot is not fully normalized for SQLite migration. ${JSON.stringify({
      unmanagedTopLevelKeys: normalizationCoverage.unmanagedTopLevelKeys,
      unmanagedNestedKeysByParent: normalizationCoverage.unmanagedNestedKeysByParent
    })}`);
  }

  if (!args.apply) {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({
      applyRequired: true,
      strictNormalization: args.strictNormalization,
      sourcePath,
      targetPath: sqlitePath,
      summary,
      normalizationCoverage
    }, null, 2));
    return;
  }

  importJsonSnapshotToSqlite(snapshot);
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({
    migrated: true,
    strictNormalization: args.strictNormalization,
    sourcePath,
    targetPath: sqlitePath,
    summary,
    normalizationCoverage
  }, null, 2));
}

try {
  main();
} catch (error) {
  // eslint-disable-next-line no-console
  console.error(error.message || "Unable to migrate JSON data to SQLite.");
  process.exit(1);
}
