const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const os = require("os");

const sqliteStore = require("../src/lib/sqliteStore");
const {
  getSqliteLatestPaymentForOrder,
  getSqliteOrderById,
  getSqlitePaymentById,
  listSqliteOrders,
  listSqlitePaymentsForOrder,
  writeSqliteOrderPaymentCollections
} = require("../src/lib/sqliteOrdersPayments");

function withTempEnv(fileName) {
  const previousProvider = process.env.DB_PROVIDER;
  const previousSqlitePath = process.env.SQLITE_DB_PATH;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "electromart-sqlite-orders-"));
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

test("sqliteOrdersPayments reads orders by user and id", () => {
  const restore = withTempEnv("orders-query.sqlite");
  try {
    sqliteStore.writeSqliteSnapshot({
      orders: [
        { id: "o1", userId: "u1", status: "processing", paymentStatus: "pending", createdAt: "2026-03-09T00:00:00.000Z" },
        { id: "o2", userId: "u2", status: "delivered", paymentStatus: "paid", createdAt: "2026-03-09T01:00:00.000Z" }
      ],
      payments: []
    });

    const customerOrders = listSqliteOrders({ userId: "u1" });
    const exactOrder = getSqliteOrderById("o2");

    assert.equal(customerOrders.length, 1);
    assert.equal(customerOrders[0].id, "o1");
    assert.equal(exactOrder.status, "delivered");
  } finally {
    restore();
  }
});

test("sqliteOrdersPayments returns newest payment first and latest payment lookup", () => {
  const restore = withTempEnv("payments-query.sqlite");
  try {
    sqliteStore.writeSqliteSnapshot({
      orders: [{ id: "o1", userId: "u1", status: "processing", paymentStatus: "pending", createdAt: "2026-03-09T00:00:00.000Z" }],
      payments: [
        { id: "p1", orderId: "o1", userId: "u1", method: "upi", provider: "razorpay", status: "requires_confirmation", createdAt: "2026-03-09T00:00:00.000Z", updatedAt: "2026-03-09T00:00:00.000Z" },
        { id: "p2", orderId: "o1", userId: "u1", method: "upi", provider: "razorpay", status: "captured", createdAt: "2026-03-09T00:10:00.000Z", updatedAt: "2026-03-09T00:10:00.000Z" }
      ]
    });

    const payments = listSqlitePaymentsForOrder("o1");
    const latestPayment = getSqliteLatestPaymentForOrder("o1");
    const exactPayment = getSqlitePaymentById("p1");

    assert.equal(payments.length, 2);
    assert.equal(payments[0].id, "p2");
    assert.equal(latestPayment.status, "captured");
    assert.equal(exactPayment.id, "p1");
  } finally {
    restore();
  }
});

test("sqliteOrdersPayments partial write helper updates only requested collections", () => {
  const restore = withTempEnv("orders-payments-write.sqlite");
  try {
    sqliteStore.writeSqliteSnapshot({
      orders: [
        { id: "o1", userId: "u1", status: "processing", paymentStatus: "pending", createdAt: "2026-03-09T00:00:00.000Z" }
      ],
      payments: [
        { id: "p1", orderId: "o1", userId: "u1", method: "upi", provider: "razorpay", status: "requires_confirmation", createdAt: "2026-03-09T00:00:00.000Z", updatedAt: "2026-03-09T00:00:00.000Z" }
      ],
      products: [
        { id: "sku-1", sku: "EM-1", name: "Demo", brand: "Demo", category: "accessories", status: "active", segment: "b2c", price: 100, stock: 5, updatedAt: "2026-03-09T00:00:00.000Z" }
      ],
      orderNotifications: [
        { id: "n1", orderId: "o1", userId: "u1", channel: "email", eventKey: "ordered", status: "sent", createdAt: "2026-03-09T00:00:00.000Z" }
      ],
      paymentWebhookEvents: [
        { id: "w1", event: "payment.captured", createdAt: "2026-03-09T00:00:00.000Z" }
      ]
    });

    const snapshot = sqliteStore.readSqliteSnapshot();
    snapshot.orders[0].status = "cancelled";
    snapshot.orders[0].paymentStatus = "failed";
    snapshot.payments[0].status = "failed";
    snapshot.payments[0].updatedAt = "2026-03-09T00:01:00.000Z";
    snapshot.products[0].stock = 0;

    writeSqliteOrderPaymentCollections(snapshot, ["orders", "payments"]);

    const reloaded = sqliteStore.readSqliteSnapshot();
    assert.equal(reloaded.orders[0].status, "cancelled");
    assert.equal(reloaded.orders[0].paymentStatus, "failed");
    assert.equal(reloaded.payments[0].status, "failed");
    assert.equal(reloaded.products[0].stock, 5);
    assert.equal(reloaded.orderNotifications.length, 1);
    assert.equal(reloaded.paymentWebhookEvents.length, 1);
  } finally {
    restore();
  }
});
