const fs = require("fs");
const path = require("path");
const { normalizeNotificationPreferences } = require("./notificationPreferences");
const {
  normalizeAuthActivityList,
  normalizeSecurityPreferences,
  normalizeSessionVersion
} = require("./authSecurity");
const { normalizePhoneVerificationState } = require("./phoneVerification");
const { normalizePhoneVerificationAutomationSettings } = require("./phoneVerificationAutomationSettings");
const { normalizePaymentRecord } = require("./paymentLifecycle");
const {
  normalizePhoneVerificationAutomationRunEntry,
  normalizePhoneVerificationReminderRecord
} = require("./phoneVerificationAutomation");
const {
  createSeededDemoUsers,
  normalizeSeededDemoMetadata
} = require("./demoUsers");
const {
  applyAdminProvisioningPolicy,
  assertAdminProvisioningGuardrails
} = require("./adminProvisioningGuardrails");
const { ensureAdminAuditTrailCollection } = require("./adminAuditTrail");
const { ensureAfterSalesCollections } = require("./afterSalesCases");
const {
  bootstrapSqliteFromJsonFile,
  getDbProvider,
  getSqliteDbPath,
  isSqliteProviderEnabled,
  readSqliteSnapshot,
  writeSqliteSnapshot
} = require("./sqliteStore");
const { isProductionRuntime } = require("./runtimeMode");

const dbPath = path.join(__dirname, "..", "data", "db.json");
const dbBackupPath = `${dbPath}.bak`;

let writeLockTail = Promise.resolve();

const sampleProducts = [
  {
    id: "1",
    name: "AstraBook Pro 14",
    brand: "AstraTech",
    category: "laptop",
    segment: "b2c",
    price: 999,
    rating: 4.6,
    stock: 24,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "2",
    name: "Nimbus Phone X",
    brand: "Nimbus",
    category: "mobile",
    segment: "b2c",
    price: 749,
    rating: 4.5,
    stock: 40,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "3",
    name: "Pulse ANC Headphones",
    brand: "PulseWave",
    category: "audio",
    segment: "b2c",
    price: 179,
    rating: 4.4,
    stock: 65,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "7",
    name: "Vector Gaming Laptop",
    brand: "Vector",
    category: "laptop",
    segment: "b2c",
    price: 1299,
    rating: 4.8,
    stock: 10,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "9",
    name: "Office Laptop Bundle (10 Units)",
    brand: "AstraTech",
    category: "laptop",
    segment: "b2b",
    price: 8690,
    rating: 4.7,
    stock: 8,
    moq: 10,
    image: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "10",
    name: "Retail Smartphone Pack (25 Units)",
    brand: "Nimbus",
    category: "mobile",
    segment: "b2b",
    price: 15499,
    rating: 4.5,
    stock: 6,
    moq: 25,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80"
  }
];

function readDb() {
  if (isSqliteProviderEnabled()) {
    bootstrapSqliteFromJsonFile(dbPath);
    return readSqliteSnapshot();
  }

  const primary = readDbFile(dbPath);
  if (primary.ok) {
    return primary.data;
  }

  const backup = readDbFile(dbBackupPath);
  if (backup.ok) {
    return backup.data;
  }

  throw primary.error;
}

function writeDb(db) {
  if (isSqliteProviderEnabled()) {
    writeSqliteSnapshot(db);
    return;
  }
  persistSerializedDb(JSON.stringify(db, null, 2));
}

function readDbFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return {
      ok: true,
      data: JSON.parse(raw)
    };
  } catch (error) {
    return {
      ok: false,
      error
    };
  }
}

function writeFileWithFsync(filePath, contents) {
  const fd = fs.openSync(filePath, "w");
  try {
    fs.writeFileSync(fd, contents, "utf8");
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
}

function persistSerializedDb(serializedDb) {
  const tempPath = `${dbPath}.${process.pid}.${Date.now()}.tmp`;
  writeFileWithFsync(tempPath, serializedDb);
  try {
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, dbBackupPath);
    }
    fs.copyFileSync(tempPath, dbPath);
    const dbFd = fs.openSync(dbPath, "r+");
    try {
      fs.fsyncSync(dbFd);
    } finally {
      fs.closeSync(dbFd);
    }
  } finally {
    if (fs.existsSync(tempPath)) {
      fs.rmSync(tempPath, { force: true });
    }
  }
}

async function acquireWriteLock() {
  let releaseLock = null;
  const currentLock = new Promise((resolve) => {
    releaseLock = resolve;
  });
  const previousLock = writeLockTail;
  writeLockTail = previousLock.then(() => currentLock, () => currentLock);
  await previousLock;

  let released = false;
  return () => {
    if (released) {
      return;
    }
    released = true;
    releaseLock();
  };
}

async function withWriteLock(task) {
  let releaseLock = null;
  try {
    releaseLock = await acquireWriteLock();
    return await task();
  } finally {
    if (releaseLock) {
      releaseLock();
    }
  }
}

function shouldSeedDemoUsers() {
  if (isProductionRuntime(process.env)) {
    return false;
  }
  const raw = String(process.env.ALLOW_SEEDED_DEMO_USERS || "").trim().toLowerCase();
  return raw === "true";
}

function shouldSeedSampleProducts() {
  if (isProductionRuntime(process.env)) {
    return false;
  }
  const raw = String(process.env.ALLOW_SEEDED_SAMPLE_PRODUCTS || "true").trim().toLowerCase();
  return raw === "true";
}

function ensureSeedData() {
  const db = readDb();

  if (!db.users || db.users.length === 0) {
    db.users = shouldSeedDemoUsers() ? createSeededDemoUsers() : [];
  }

  db.users = db.users.map((user) => ({
    ...normalizeSeededDemoMetadata(user),
    notificationPreferences: normalizeNotificationPreferences(user.notificationPreferences),
    phoneVerification: normalizePhoneVerificationState(user.phoneVerification),
    securityPreferences: normalizeSecurityPreferences(user.securityPreferences),
    sessionVersion: normalizeSessionVersion(user.sessionVersion),
    authActivity: normalizeAuthActivityList(user.authActivity)
  }));

  if (!db.products || db.products.length === 0) {
    db.products = shouldSeedSampleProducts() ? sampleProducts : [];
  }

  if (!db.orders) {
    db.orders = [];
  }

  ensureAfterSalesCollections(db);

  if (!db.payments) {
    db.payments = [];
  } else {
    db.payments = db.payments.map((payment) => normalizePaymentRecord(payment));
  }

  if (!db.backInStockRequests) {
    db.backInStockRequests = [];
  }

  if (!db.backInStockNotifications) {
    db.backInStockNotifications = [];
  }

  if (!Array.isArray(db.orderNotifications)) {
    db.orderNotifications = [];
  }

  ensureAdminAuditTrailCollection(db);

  if (!Array.isArray(db.paymentWebhookEvents)) {
    db.paymentWebhookEvents = [];
  } else {
    db.paymentWebhookEvents = db.paymentWebhookEvents
      .filter((item) => item && typeof item === "object")
      .slice(-200);
  }

  if (!Array.isArray(db.phoneVerificationReminders)) {
    db.phoneVerificationReminders = [];
  } else {
    db.phoneVerificationReminders = db.phoneVerificationReminders.map((item) => normalizePhoneVerificationReminderRecord(item));
  }

  if (!db.automationJobs || typeof db.automationJobs !== "object") {
    db.automationJobs = {};
  }

  if (!db.automationSettings || typeof db.automationSettings !== "object") {
    db.automationSettings = {};
  }

  if (!db.automationRunHistory || typeof db.automationRunHistory !== "object") {
    db.automationRunHistory = {};
  }

  db.automationRunHistory.phoneVerificationReminder = Array.isArray(db.automationRunHistory.phoneVerificationReminder)
    ? db.automationRunHistory.phoneVerificationReminder
      .map((item) => normalizePhoneVerificationAutomationRunEntry(item))
      .slice(0, 120)
    : [];

  db.automationSettings.phoneVerificationReminder = normalizePhoneVerificationAutomationSettings(
    db.automationSettings.phoneVerificationReminder
  );

  if (!db.automationJobs.phoneVerificationReminder || typeof db.automationJobs.phoneVerificationReminder !== "object") {
    db.automationJobs.phoneVerificationReminder = {
      lastRunAt: null,
      lastFinishedAt: null,
      lastStatus: "idle",
      lastMessage: "Automation has not run yet.",
      lastTriggeredBy: "",
      lastSummary: {
        deliveredCount: 0,
        queuedCount: 0,
        failedCount: 0,
        skippedCount: 0,
        affectedUsers: 0
      }
    };
  }

  if (!db.inventorySettings || typeof db.inventorySettings !== "object") {
    db.inventorySettings = {
      defaultLowStockThreshold: 5,
      restockTarget: 10,
      categoryThresholds: {}
    };
  }

  applyAdminProvisioningPolicy(db, process.env);
  writeDb(db);
  assertAdminProvisioningGuardrails(db, process.env);
}

module.exports = {
  acquireWriteLock,
  dbPath,
  dbBackupPath,
  getDbProvider,
  getSqliteDbPath,
  isSqliteProviderEnabled,
  readDb,
  shouldSeedDemoUsers,
  withWriteLock,
  writeDb,
  ensureSeedData
};
