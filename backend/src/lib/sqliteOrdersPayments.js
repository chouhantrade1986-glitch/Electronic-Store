const { getSqliteDb, isSqliteProviderEnabled } = require("./sqliteStore");

function isSqliteOrderPaymentQueriesEnabled() {
  return isSqliteProviderEnabled();
}

function parseRow(row) {
  if (!row || !row.json) {
    return null;
  }
  return JSON.parse(String(row.json || "{}"));
}

function listSqliteOrders(filters = {}) {
  const db = getSqliteDb();
  let sql = "SELECT json FROM orders WHERE 1=1";
  const params = [];

  const userId = String(filters.userId || "").trim();
  if (userId) {
    sql += " AND user_id = ?";
    params.push(userId);
  }

  const status = String(filters.status || "").trim().toLowerCase();
  if (status && status !== "all") {
    sql += " AND status = ?";
    params.push(status);
  }

  const paymentStatus = String(filters.paymentStatus || "").trim().toLowerCase();
  if (paymentStatus && paymentStatus !== "all") {
    sql += " AND payment_status = ?";
    params.push(paymentStatus);
  }

  sql += " ORDER BY COALESCE(updated_at, created_at, '') DESC, ordinal ASC";
  return db.prepare(sql).all(...params).map(parseRow).filter(Boolean);
}

function getSqliteOrderById(orderId) {
  const db = getSqliteDb();
  const row = db.prepare("SELECT json FROM orders WHERE id = ? LIMIT 1").get(String(orderId || ""));
  return parseRow(row);
}

function listSqlitePayments(filters = {}) {
  const db = getSqliteDb();
  let sql = "SELECT json FROM payments WHERE 1=1";
  const params = [];

  const orderId = String(filters.orderId || "").trim();
  if (orderId) {
    sql += " AND order_id = ?";
    params.push(orderId);
  }

  const paymentId = String(filters.paymentId || "").trim();
  if (paymentId) {
    sql += " AND id = ?";
    params.push(paymentId);
  }

  const userId = String(filters.userId || "").trim();
  if (userId) {
    sql += " AND json_extract(json, '$.userId') = ?";
    params.push(userId);
  }

  sql += " ORDER BY COALESCE(updated_at, created_at, '') DESC, ordinal ASC";
  return db.prepare(sql).all(...params).map(parseRow).filter(Boolean);
}

function getSqlitePaymentById(paymentId) {
  const payments = listSqlitePayments({ paymentId });
  return payments[0] || null;
}

function listSqlitePaymentsForOrder(orderId) {
  return listSqlitePayments({ orderId });
}

function getSqliteLatestPaymentForOrder(orderId, predicate = null) {
  const payments = listSqlitePaymentsForOrder(orderId);
  if (typeof predicate !== "function") {
    return payments[0] || null;
  }
  return payments.find((payment) => predicate(payment)) || null;
}

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function requireCollection(snapshot, key) {
  if (!snapshot || typeof snapshot !== "object" || !Array.isArray(snapshot[key])) {
    throw new Error(`SQLite collection '${key}' is missing from the provided snapshot.`);
  }
  return snapshot[key];
}

function replaceOrdersTable(db, orders) {
  db.exec("DELETE FROM orders");
  const statement = db.prepare(
    "INSERT INTO orders (id, ordinal, user_id, status, payment_status, created_at, updated_at, json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  orders.forEach((order, index) => {
    const item = order && typeof order === "object" ? order : {};
    statement.run(
      String(item.id || `order-${index + 1}`),
      index,
      String(item.userId || ""),
      String(item.status || "").toLowerCase(),
      String(item.paymentStatus || "").toLowerCase(),
      String(item.createdAt || ""),
      String(item.updatedAt || item.paymentUpdatedAt || item.createdAt || ""),
      JSON.stringify(item)
    );
  });
}

function replacePaymentsTable(db, payments) {
  db.exec("DELETE FROM payments");
  const statement = db.prepare(
    "INSERT INTO payments (id, ordinal, order_id, provider, status, created_at, updated_at, json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  payments.forEach((payment, index) => {
    const item = payment && typeof payment === "object" ? payment : {};
    statement.run(
      String(item.id || `payment-${index + 1}`),
      index,
      String(item.orderId || ""),
      String(item.provider || "").toLowerCase(),
      String(item.status || "").toLowerCase(),
      String(item.createdAt || ""),
      String(item.updatedAt || item.createdAt || ""),
      JSON.stringify(item)
    );
  });
}

function replaceProductsTable(db, products) {
  db.exec("DELETE FROM products");
  const statement = db.prepare(
    "INSERT INTO products (id, ordinal, sku, name, brand, category, status, segment, price, stock, updated_at, json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  products.forEach((product, index) => {
    const item = product && typeof product === "object" ? product : {};
    statement.run(
      String(item.id || `product-${index + 1}`),
      index,
      String(item.sku || "").toUpperCase(),
      String(item.name || ""),
      String(item.brand || ""),
      String(item.category || "").toLowerCase(),
      String(item.status || "").toLowerCase(),
      String(item.segment || "").toLowerCase(),
      asNumber(item.price, 0),
      asNumber(item.stock, 0),
      String(item.updatedAt || ""),
      JSON.stringify(item)
    );
  });
}

function replaceOrderNotificationsTable(db, notifications) {
  db.exec("DELETE FROM order_notifications");
  const statement = db.prepare(
    "INSERT INTO order_notifications (id, ordinal, order_id, user_id, channel, event_key, status, created_at, json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  notifications.forEach((notification, index) => {
    const item = notification && typeof notification === "object" ? notification : {};
    statement.run(
      String(item.id || `notification-${index + 1}`),
      index,
      String(item.orderId || ""),
      String(item.userId || ""),
      String(item.channel || "").toLowerCase(),
      String(item.eventKey || "").toLowerCase(),
      String(item.status || "").toLowerCase(),
      String(item.createdAt || ""),
      JSON.stringify(item)
    );
  });
}

function replacePaymentWebhookEventsTable(db, events) {
  db.exec("DELETE FROM payment_webhook_events");
  const statement = db.prepare(
    "INSERT INTO payment_webhook_events (id, ordinal, event_name, created_at, json) VALUES (?, ?, ?, ?, ?)"
  );
  events.forEach((event, index) => {
    const item = event && typeof event === "object" ? event : {};
    statement.run(
      String(item.id || `webhook-event-${index + 1}`),
      index,
      String(item.event || "").toLowerCase(),
      String(item.createdAt || ""),
      JSON.stringify(item)
    );
  });
}

function replaceAfterSalesCasesTable(db, cases) {
  db.exec("DELETE FROM after_sales_cases");
  const statement = db.prepare(
    "INSERT INTO after_sales_cases (id, ordinal, order_id, user_id, type, status, updated_at, json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  cases.forEach((caseItem, index) => {
    const item = caseItem && typeof caseItem === "object" ? caseItem : {};
    statement.run(
      String(item.id || `after-sales-${index + 1}`),
      index,
      String(item.orderId || ""),
      String(item.userId || ""),
      String(item.type || "").toLowerCase(),
      String(item.status || "").toLowerCase(),
      String(item.updatedAt || item.createdAt || ""),
      JSON.stringify(item)
    );
  });
}

function replaceAdminAuditTrailTable(db, auditEntries) {
  db.exec("DELETE FROM admin_audit_trail");
  const statement = db.prepare(
    "INSERT INTO admin_audit_trail (id, ordinal, category, action_key, actor_email, entity_id, order_id, payment_id, case_id, created_at, json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  auditEntries.forEach((entry, index) => {
    const item = entry && typeof entry === "object" ? entry : {};
    statement.run(
      String(item.id || `admin-audit-${index + 1}`),
      index,
      String(item.category || "").toLowerCase(),
      String(item.actionKey || "").toLowerCase(),
      String(item.actorEmail || "").toLowerCase(),
      String(item.entityId || ""),
      String(item.orderId || ""),
      String(item.paymentId || ""),
      String(item.caseId || ""),
      String(item.createdAt || ""),
      JSON.stringify(item)
    );
  });
}

const SQLITE_COLLECTION_WRITERS = {
  orders: replaceOrdersTable,
  payments: replacePaymentsTable,
  products: replaceProductsTable,
  orderNotifications: replaceOrderNotificationsTable,
  paymentWebhookEvents: replacePaymentWebhookEventsTable,
  afterSalesCases: replaceAfterSalesCasesTable,
  adminAuditTrail: replaceAdminAuditTrailTable
};

function writeSqliteOrderPaymentCollections(snapshot, collections = []) {
  const requestedCollections = [...new Set((Array.isArray(collections) ? collections : [])
    .map((value) => String(value || "").trim())
    .filter(Boolean))];
  if (!requestedCollections.length) {
    return 0;
  }

  const db = getSqliteDb();
  db.exec("BEGIN IMMEDIATE TRANSACTION");
  try {
    requestedCollections.forEach((key) => {
      const writer = SQLITE_COLLECTION_WRITERS[key];
      if (!writer) {
        throw new Error(`Unsupported SQLite collection write target: ${key}`);
      }
      writer(db, requireCollection(snapshot, key));
    });
    db.exec("COMMIT");
    return requestedCollections.length;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

module.exports = {
  getSqliteLatestPaymentForOrder,
  getSqliteOrderById,
  getSqlitePaymentById,
  isSqliteOrderPaymentQueriesEnabled,
  listSqliteOrders,
  listSqlitePayments,
  listSqlitePaymentsForOrder,
  writeSqliteOrderPaymentCollections
};
