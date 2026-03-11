const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const os = require("os");

const sqliteStore = require("../src/lib/sqliteStore");

function withTempEnv(fileName) {
  const previousProvider = process.env.DB_PROVIDER;
  const previousSqlitePath = process.env.SQLITE_DB_PATH;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "electromart-sqlite-"));
  const sqlitePath = path.join(tempDir, fileName);

  process.env.DB_PROVIDER = "sqlite";
  process.env.SQLITE_DB_PATH = sqlitePath;
  sqliteStore.closeSqliteDb();

  return () => {
    sqliteStore.closeSqliteDb();
    if (typeof previousProvider === "string") {
      process.env.DB_PROVIDER = previousProvider;
    } else {
      delete process.env.DB_PROVIDER;
    }
    if (typeof previousSqlitePath === "string") {
      process.env.SQLITE_DB_PATH = previousSqlitePath;
    } else {
      delete process.env.SQLITE_DB_PATH;
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  };
}

test("writeSqliteSnapshot and readSqliteSnapshot round-trip core entities", () => {
  const restore = withTempEnv("roundtrip.sqlite");
  try {
    const snapshot = {
      products: [{ id: "pr1", sku: "EM-PR1", name: "Widget", brand: "Acme", category: "laptop", status: "active", segment: "b2c", price: 999, stock: 12 }],
      users: [{ id: "u1", email: "user@example.com", role: "customer", name: "User" }],
      orders: [{ id: "o1", userId: "u1", status: "processing", paymentStatus: "paid" }],
      payments: [{ id: "p1", orderId: "o1", status: "captured", provider: "razorpay" }],
      afterSalesCases: [{ id: "a1", orderId: "o1", userId: "u1", type: "refund", status: "requested" }],
      adminAuditTrail: [{ id: "t1", category: "catalog", actionKey: "product_created", actionLabel: "Product created" }],
      orderNotifications: [{ id: "n1", orderId: "o1", userId: "u1", channel: "email", eventKey: "ordered", status: "sent" }],
      paymentWebhookEvents: [{ id: "w1", event: "payment.captured", createdAt: "2026-03-09T00:00:00.000Z" }],
      authOtpChallenges: [{ id: "c1", purpose: "login", channel: "email", destination: "user@example.com", identifier: "user@example.com", status: "used" }],
      backInStockRequests: [{ id: "b1", productId: "sku-1", email: "user@example.com", status: "open", createdAt: "2026-03-09T00:10:00.000Z" }],
      backInStockNotifications: [{ id: "bn1", requestId: "b1", productId: "sku-1", email: "user@example.com", status: "sent", createdAt: "2026-03-09T00:20:00.000Z" }],
      phoneVerificationReminders: [{ id: "r1", userId: "u1", email: "user@example.com", channel: "email", status: "sent", createdAt: "2026-03-09T00:30:00.000Z" }],
      inventorySettings: { defaultLowStockThreshold: 5, restockTarget: 9 }
      ,
      automationJobs: { phoneVerificationReminder: { lastRunAt: "2026-03-09T01:00:00.000Z", lastStatus: "success" } },
      automationSettings: { phoneVerificationReminder: { enabled: true, limit: 10, updatedBy: "admin" } },
      automationRunHistory: { phoneVerificationReminder: [{ id: "run1", status: "success", trigger: "manual", startedAt: "2026-03-09T01:00:00.000Z" }] }
    };

    sqliteStore.writeSqliteSnapshot(snapshot);
    const restored = sqliteStore.readSqliteSnapshot();

    assert.equal(restored.products[0].sku, "EM-PR1");
    assert.equal(restored.users[0].email, "user@example.com");
    assert.equal(restored.orders[0].id, "o1");
    assert.equal(restored.payments[0].provider, "razorpay");
    assert.equal(restored.afterSalesCases[0].type, "refund");
    assert.equal(restored.adminAuditTrail[0].actionKey, "product_created");
    assert.equal(restored.orderNotifications[0].eventKey, "ordered");
    assert.equal(restored.paymentWebhookEvents[0].event, "payment.captured");
    assert.equal(restored.authOtpChallenges[0].identifier, "user@example.com");
    assert.equal(restored.backInStockRequests[0].productId, "sku-1");
    assert.equal(restored.backInStockNotifications[0].requestId, "b1");
    assert.equal(restored.phoneVerificationReminders[0].channel, "email");
    assert.deepEqual(restored.inventorySettings, { defaultLowStockThreshold: 5, restockTarget: 9 });
    assert.equal(restored.automationJobs.phoneVerificationReminder.lastStatus, "success");
    assert.equal(restored.automationSettings.phoneVerificationReminder.limit, 10);
    assert.equal(restored.automationRunHistory.phoneVerificationReminder[0].id, "run1");
  } finally {
    restore();
  }
});

test("bootstrapSqliteFromJsonFile imports legacy JSON when SQLite is empty", () => {
  const restore = withTempEnv("bootstrap.sqlite");
  const tempJsonPath = path.join(path.dirname(process.env.SQLITE_DB_PATH), "legacy-db.json");
  try {
    const snapshot = {
      products: [{ id: "pr2", sku: "EM-PR2", name: "Legacy Product", brand: "Legacy", category: "audio", status: "draft", segment: "b2c", price: 49, stock: 4 }],
      users: [{ id: "u2", email: "legacy@example.com", role: "admin" }],
      orders: [{ id: "o2", userId: "u2", status: "delivered", paymentStatus: "paid" }],
      payments: [],
      afterSalesCases: [],
      adminAuditTrail: [{ id: "t2", category: "order", actionKey: "order_status_updated", actionLabel: "Order updated" }],
      orderNotifications: [{ id: "n2", orderId: "o2", userId: "u2", channel: "email", eventKey: "shipped", status: "sent" }],
      paymentWebhookEvents: [{ id: "w2", event: "payment.failed", createdAt: "2026-03-09T00:00:00.000Z" }],
      authOtpChallenges: [{ id: "c2", purpose: "login", channel: "email", destination: "legacy@example.com", identifier: "legacy@example.com", status: "pending" }],
      backInStockRequests: [{ id: "b2", productId: "sku-2", email: "legacy@example.com", status: "open", createdAt: "2026-03-09T00:10:00.000Z" }],
      backInStockNotifications: [{ id: "bn2", requestId: "b2", productId: "sku-2", email: "legacy@example.com", status: "sent", createdAt: "2026-03-09T00:20:00.000Z" }],
      phoneVerificationReminders: [{ id: "r2", userId: "u2", email: "legacy@example.com", channel: "sms", status: "failed", createdAt: "2026-03-09T00:30:00.000Z" }],
      inventorySettings: { defaultLowStockThreshold: 7, restockTarget: 12 }
      ,
      automationJobs: { phoneVerificationReminder: { lastRunAt: "2026-03-09T02:00:00.000Z", lastStatus: "idle" } },
      automationSettings: { phoneVerificationReminder: { enabled: false, limit: 25, updatedBy: "ops" } },
      automationRunHistory: { phoneVerificationReminder: [{ id: "run2", status: "failed", trigger: "scheduler", startedAt: "2026-03-09T02:00:00.000Z" }] }
    };
    fs.writeFileSync(tempJsonPath, JSON.stringify(snapshot, null, 2), "utf8");

    const imported = sqliteStore.bootstrapSqliteFromJsonFile(tempJsonPath);
    const restored = sqliteStore.readSqliteSnapshot();

    assert.equal(imported, true);
    assert.equal(restored.products[0].name, "Legacy Product");
    assert.equal(restored.users[0].email, "legacy@example.com");
    assert.equal(restored.orders[0].status, "delivered");
    assert.equal(restored.adminAuditTrail[0].category, "order");
    assert.equal(restored.orderNotifications[0].eventKey, "shipped");
    assert.equal(restored.paymentWebhookEvents[0].event, "payment.failed");
    assert.equal(restored.authOtpChallenges[0].identifier, "legacy@example.com");
    assert.equal(restored.backInStockRequests[0].productId, "sku-2");
    assert.equal(restored.backInStockNotifications[0].requestId, "b2");
    assert.equal(restored.phoneVerificationReminders[0].channel, "sms");
    assert.equal(restored.inventorySettings.defaultLowStockThreshold, 7);
    assert.equal(restored.inventorySettings.restockTarget, 12);
    assert.equal(restored.automationJobs.phoneVerificationReminder.lastStatus, "idle");
    assert.equal(restored.automationSettings.phoneVerificationReminder.updatedBy, "ops");
    assert.equal(restored.automationRunHistory.phoneVerificationReminder[0].trigger, "scheduler");
  } finally {
    restore();
  }
});
