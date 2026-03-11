const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const SQLITE_FILENAME = "electromart.sqlite";

const MANAGED_TABLES = {
  products: {
    table: "products",
    key: "products",
    kind: "collection",
    columns: ["sku", "name", "brand", "category", "status", "segment", "price", "stock", "updated_at"],
    values(item) {
      return [
        String(item && item.sku ? item.sku : "").toUpperCase(),
        String(item && item.name ? item.name : ""),
        String(item && item.brand ? item.brand : ""),
        String(item && item.category ? item.category : "").toLowerCase(),
        String(item && item.status ? item.status : "").toLowerCase(),
        String(item && item.segment ? item.segment : "").toLowerCase(),
        Number.isFinite(Number(item && item.price)) ? Number(item.price) : 0,
        Number.isFinite(Number(item && item.stock)) ? Number(item.stock) : 0,
        String(item && item.updatedAt ? item.updatedAt : "")
      ];
    }
  },
  users: {
    table: "users",
    key: "users",
    kind: "collection",
    columns: ["email", "role", "updated_at"],
    values(item) {
      return [
        String(item && item.email ? item.email : "").toLowerCase(),
        String(item && item.role ? item.role : "").toLowerCase(),
        String(item && item.updatedAt ? item.updatedAt : "")
      ];
    }
  },
  orders: {
    table: "orders",
    key: "orders",
    kind: "collection",
    columns: ["user_id", "status", "payment_status", "created_at", "updated_at"],
    values(item) {
      return [
        String(item && item.userId ? item.userId : ""),
        String(item && item.status ? item.status : "").toLowerCase(),
        String(item && item.paymentStatus ? item.paymentStatus : "").toLowerCase(),
        String(item && item.createdAt ? item.createdAt : ""),
        String(item && item.updatedAt ? item.updatedAt : "")
      ];
    }
  },
  payments: {
    table: "payments",
    key: "payments",
    kind: "collection",
    columns: ["order_id", "provider", "status", "created_at", "updated_at"],
    values(item) {
      return [
        String(item && item.orderId ? item.orderId : ""),
        String(item && item.provider ? item.provider : "").toLowerCase(),
        String(item && item.status ? item.status : "").toLowerCase(),
        String(item && item.createdAt ? item.createdAt : ""),
        String(item && item.updatedAt ? item.updatedAt : "")
      ];
    }
  },
  afterSalesCases: {
    table: "after_sales_cases",
    key: "afterSalesCases",
    kind: "collection",
    columns: ["order_id", "user_id", "type", "status", "updated_at"],
    values(item) {
      return [
        String(item && item.orderId ? item.orderId : ""),
        String(item && item.userId ? item.userId : ""),
        String(item && item.type ? item.type : "").toLowerCase(),
        String(item && item.status ? item.status : "").toLowerCase(),
        String(item && item.updatedAt ? item.updatedAt : "")
      ];
    }
  },
  adminAuditTrail: {
    table: "admin_audit_trail",
    key: "adminAuditTrail",
    kind: "collection",
    columns: ["category", "action_key", "actor_email", "entity_id", "order_id", "payment_id", "case_id", "created_at"],
    values(item) {
      return [
        String(item && item.category ? item.category : "").toLowerCase(),
        String(item && item.actionKey ? item.actionKey : "").toLowerCase(),
        String(item && item.actorEmail ? item.actorEmail : "").toLowerCase(),
        String(item && item.entityId ? item.entityId : ""),
        String(item && item.orderId ? item.orderId : ""),
        String(item && item.paymentId ? item.paymentId : ""),
        String(item && item.caseId ? item.caseId : ""),
        String(item && item.createdAt ? item.createdAt : "")
      ];
    }
  },
  orderNotifications: {
    table: "order_notifications",
    key: "orderNotifications",
    kind: "collection",
    columns: ["order_id", "user_id", "channel", "event_key", "status", "created_at"],
    values(item) {
      return [
        String(item && item.orderId ? item.orderId : ""),
        String(item && item.userId ? item.userId : ""),
        String(item && item.channel ? item.channel : "").toLowerCase(),
        String(item && item.eventKey ? item.eventKey : "").toLowerCase(),
        String(item && item.status ? item.status : "").toLowerCase(),
        String(item && item.createdAt ? item.createdAt : "")
      ];
    }
  },
  paymentWebhookEvents: {
    table: "payment_webhook_events",
    key: "paymentWebhookEvents",
    kind: "collection",
    columns: ["event_name", "created_at"],
    values(item) {
      return [
        String(item && item.event ? item.event : "").toLowerCase(),
        String(item && item.createdAt ? item.createdAt : "")
      ];
    }
  },
  authOtpChallenges: {
    table: "auth_otp_challenges",
    key: "authOtpChallenges",
    kind: "collection",
    columns: ["purpose", "channel", "destination", "identifier", "user_id", "status", "created_at", "expires_at"],
    values(item) {
      return [
        String(item && item.purpose ? item.purpose : "").toLowerCase(),
        String(item && item.channel ? item.channel : "").toLowerCase(),
        String(item && item.destination ? item.destination : "").toLowerCase(),
        String(item && item.identifier ? item.identifier : "").toLowerCase(),
        String(item && item.userId ? item.userId : ""),
        String(item && item.status ? item.status : "").toLowerCase(),
        String(item && item.createdAt ? item.createdAt : ""),
        String(item && item.expiresAt ? item.expiresAt : "")
      ];
    }
  },
  backInStockRequests: {
    table: "back_in_stock_requests",
    key: "backInStockRequests",
    kind: "collection",
    columns: ["product_id", "email", "status", "created_at", "last_notified_at"],
    values(item) {
      return [
        String(item && item.productId ? item.productId : ""),
        String(item && item.email ? item.email : "").toLowerCase(),
        String(item && item.status ? item.status : "").toLowerCase(),
        String(item && item.createdAt ? item.createdAt : ""),
        String(item && item.lastNotifiedAt ? item.lastNotifiedAt : "")
      ];
    }
  },
  backInStockNotifications: {
    table: "back_in_stock_notifications",
    key: "backInStockNotifications",
    kind: "collection",
    columns: ["request_id", "product_id", "email", "status", "created_at"],
    values(item) {
      return [
        String(item && item.requestId ? item.requestId : ""),
        String(item && item.productId ? item.productId : ""),
        String(item && item.email ? item.email : "").toLowerCase(),
        String(item && item.status ? item.status : "").toLowerCase(),
        String(item && item.createdAt ? item.createdAt : "")
      ];
    }
  },
  phoneVerificationReminders: {
    table: "phone_verification_reminders",
    key: "phoneVerificationReminders",
    kind: "collection",
    columns: ["user_id", "email", "mobile", "channel", "status", "created_at", "next_retry_at"],
    values(item) {
      return [
        String(item && item.userId ? item.userId : ""),
        String(item && item.email ? item.email : "").toLowerCase(),
        String(item && item.mobile ? item.mobile : ""),
        String(item && item.channel ? item.channel : "").toLowerCase(),
        String(item && item.status ? item.status : "").toLowerCase(),
        String(item && item.createdAt ? item.createdAt : ""),
        String(item && item.nextRetryAt ? item.nextRetryAt : "")
      ];
    }
  },
  inventorySettings: {
    table: "inventory_settings",
    key: "inventorySettings",
    kind: "singleton",
    idColumn: "singleton_key",
    idValue: "default",
    columns: ["updated_at"],
    values(item) {
      return [
        String(item && item.updatedAt ? item.updatedAt : "")
      ];
    }
  },
  phoneVerificationAutomationJobState: {
    table: "phone_verification_automation_job_state",
    key: "automationJobs",
    nestedKey: "phoneVerificationReminder",
    kind: "nestedSingleton",
    idColumn: "singleton_key",
    idValue: "phoneVerificationReminder",
    columns: ["last_run_at", "last_finished_at", "last_status"],
    values(item) {
      return [
        String(item && item.lastRunAt ? item.lastRunAt : ""),
        String(item && item.lastFinishedAt ? item.lastFinishedAt : ""),
        String(item && item.lastStatus ? item.lastStatus : "").toLowerCase()
      ];
    }
  },
  phoneVerificationAutomationSettings: {
    table: "phone_verification_automation_settings",
    key: "automationSettings",
    nestedKey: "phoneVerificationReminder",
    kind: "nestedSingleton",
    idColumn: "singleton_key",
    idValue: "phoneVerificationReminder",
    columns: ["updated_at", "updated_by", "enabled_flag"],
    values(item) {
      return [
        String(item && item.updatedAt ? item.updatedAt : ""),
        String(item && item.updatedBy ? item.updatedBy : ""),
        item && item.enabled === true ? "1" : "0"
      ];
    }
  },
  phoneVerificationAutomationRunHistory: {
    table: "phone_verification_automation_run_history",
    key: "automationRunHistory",
    nestedKey: "phoneVerificationReminder",
    kind: "nestedCollection",
    columns: ["status", "trigger_name", "started_at", "finished_at"],
    values(item) {
      return [
        String(item && item.status ? item.status : "").toLowerCase(),
        String(item && item.trigger ? item.trigger : "").toLowerCase(),
        String(item && item.startedAt ? item.startedAt : ""),
        String(item && item.finishedAt ? item.finishedAt : "")
      ];
    }
  }
};

let sqliteDb = null;

function getDbProvider() {
  return String(process.env.DB_PROVIDER || "json").trim().toLowerCase();
}

function isSqliteProviderEnabled() {
  return getDbProvider() === "sqlite";
}

function getSqliteDbPath() {
  const raw = String(process.env.SQLITE_DB_PATH || "").trim();
  if (raw) {
    return path.resolve(raw);
  }
  return path.join(__dirname, "..", "data", SQLITE_FILENAME);
}

function ensureDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function getSqliteDb() {
  if (sqliteDb) {
    return sqliteDb;
  }
  const filePath = getSqliteDbPath();
  ensureDirectory(filePath);
  sqliteDb = new DatabaseSync(filePath);
  sqliteDb.exec("PRAGMA journal_mode = WAL;");
  sqliteDb.exec("PRAGMA foreign_keys = ON;");
  ensureSchema(sqliteDb);
  return sqliteDb;
}

function ensureSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      ordinal INTEGER NOT NULL DEFAULT 0,
      sku TEXT,
      name TEXT,
      brand TEXT,
      category TEXT,
      status TEXT,
      segment TEXT,
      price REAL NOT NULL DEFAULT 0,
      stock REAL NOT NULL DEFAULT 0,
      updated_at TEXT,
      json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
    CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      ordinal INTEGER NOT NULL DEFAULT 0,
      email TEXT,
      role TEXT,
      updated_at TEXT,
      json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      ordinal INTEGER NOT NULL DEFAULT 0,
      user_id TEXT,
      status TEXT,
      payment_status TEXT,
      created_at TEXT,
      updated_at TEXT,
      json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      ordinal INTEGER NOT NULL DEFAULT 0,
      order_id TEXT,
      provider TEXT,
      status TEXT,
      created_at TEXT,
      updated_at TEXT,
      json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);

    CREATE TABLE IF NOT EXISTS after_sales_cases (
      id TEXT PRIMARY KEY,
      ordinal INTEGER NOT NULL DEFAULT 0,
      order_id TEXT,
      user_id TEXT,
      type TEXT,
      status TEXT,
      updated_at TEXT,
      json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_after_sales_order_id ON after_sales_cases(order_id);

    CREATE TABLE IF NOT EXISTS admin_audit_trail (
      id TEXT PRIMARY KEY,
      ordinal INTEGER NOT NULL DEFAULT 0,
      category TEXT,
      action_key TEXT,
      actor_email TEXT,
      entity_id TEXT,
      order_id TEXT,
      payment_id TEXT,
      case_id TEXT,
      created_at TEXT,
      json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_admin_audit_category ON admin_audit_trail(category);
    CREATE INDEX IF NOT EXISTS idx_admin_audit_created_at ON admin_audit_trail(created_at);

    CREATE TABLE IF NOT EXISTS order_notifications (
      id TEXT PRIMARY KEY,
      ordinal INTEGER NOT NULL DEFAULT 0,
      order_id TEXT,
      user_id TEXT,
      channel TEXT,
      event_key TEXT,
      status TEXT,
      created_at TEXT,
      json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_order_notifications_order_id ON order_notifications(order_id);
    CREATE INDEX IF NOT EXISTS idx_order_notifications_user_id ON order_notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_order_notifications_created_at ON order_notifications(created_at);

    CREATE TABLE IF NOT EXISTS payment_webhook_events (
      id TEXT PRIMARY KEY,
      ordinal INTEGER NOT NULL DEFAULT 0,
      event_name TEXT,
      created_at TEXT,
      json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_payment_webhook_events_created_at ON payment_webhook_events(created_at);

    CREATE TABLE IF NOT EXISTS auth_otp_challenges (
      id TEXT PRIMARY KEY,
      ordinal INTEGER NOT NULL DEFAULT 0,
      purpose TEXT,
      channel TEXT,
      destination TEXT,
      identifier TEXT,
      user_id TEXT,
      status TEXT,
      created_at TEXT,
      expires_at TEXT,
      json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_auth_otp_identifier ON auth_otp_challenges(identifier);
    CREATE INDEX IF NOT EXISTS idx_auth_otp_status ON auth_otp_challenges(status);
    CREATE INDEX IF NOT EXISTS idx_auth_otp_created_at ON auth_otp_challenges(created_at);

    CREATE TABLE IF NOT EXISTS back_in_stock_requests (
      id TEXT PRIMARY KEY,
      ordinal INTEGER NOT NULL DEFAULT 0,
      product_id TEXT,
      email TEXT,
      status TEXT,
      created_at TEXT,
      last_notified_at TEXT,
      json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_back_in_stock_requests_product_id ON back_in_stock_requests(product_id);
    CREATE INDEX IF NOT EXISTS idx_back_in_stock_requests_email ON back_in_stock_requests(email);

    CREATE TABLE IF NOT EXISTS back_in_stock_notifications (
      id TEXT PRIMARY KEY,
      ordinal INTEGER NOT NULL DEFAULT 0,
      request_id TEXT,
      product_id TEXT,
      email TEXT,
      status TEXT,
      created_at TEXT,
      json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_back_in_stock_notifications_request_id ON back_in_stock_notifications(request_id);
    CREATE INDEX IF NOT EXISTS idx_back_in_stock_notifications_created_at ON back_in_stock_notifications(created_at);

    CREATE TABLE IF NOT EXISTS phone_verification_reminders (
      id TEXT PRIMARY KEY,
      ordinal INTEGER NOT NULL DEFAULT 0,
      user_id TEXT,
      email TEXT,
      mobile TEXT,
      channel TEXT,
      status TEXT,
      created_at TEXT,
      next_retry_at TEXT,
      json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_phone_verification_reminders_user_id ON phone_verification_reminders(user_id);
    CREATE INDEX IF NOT EXISTS idx_phone_verification_reminders_status ON phone_verification_reminders(status);
    CREATE INDEX IF NOT EXISTS idx_phone_verification_reminders_created_at ON phone_verification_reminders(created_at);

    CREATE TABLE IF NOT EXISTS inventory_settings (
      singleton_key TEXT PRIMARY KEY,
      updated_at TEXT,
      json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS phone_verification_automation_job_state (
      singleton_key TEXT PRIMARY KEY,
      last_run_at TEXT,
      last_finished_at TEXT,
      last_status TEXT,
      json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS phone_verification_automation_settings (
      singleton_key TEXT PRIMARY KEY,
      updated_at TEXT,
      updated_by TEXT,
      enabled_flag TEXT,
      json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS phone_verification_automation_run_history (
      id TEXT PRIMARY KEY,
      ordinal INTEGER NOT NULL DEFAULT 0,
      status TEXT,
      trigger_name TEXT,
      started_at TEXT,
      finished_at TEXT,
      json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_phone_verification_automation_run_history_started_at
      ON phone_verification_automation_run_history(started_at);

    CREATE TABLE IF NOT EXISTS app_state (
      state_key TEXT PRIMARY KEY,
      json TEXT NOT NULL
    );
  `);
}

function closeSqliteDb() {
  if (!sqliteDb) {
    return;
  }
  sqliteDb.close();
  sqliteDb = null;
}

function tableHasRows(db, tableName) {
  const row = db.prepare(`SELECT COUNT(*) AS count FROM ${tableName}`).get();
  return Number(row && row.count ? row.count : 0) > 0;
}

function sqliteSnapshotExists() {
  const db = getSqliteDb();
  return Object.values(MANAGED_TABLES).some((config) => tableHasRows(db, config.table))
    || tableHasRows(db, "app_state");
}

function clearTable(db, tableName) {
  db.exec(`DELETE FROM ${tableName}`);
}

function resolveManagedValue(snapshot, config) {
  if (!snapshot || typeof snapshot !== "object") {
    return undefined;
  }
  if (config.kind === "nestedSingleton" || config.kind === "nestedCollection") {
    const parent = snapshot[config.key];
    if (!parent || typeof parent !== "object") {
      return undefined;
    }
    return parent[config.nestedKey];
  }
  return snapshot[config.key];
}

function writeManagedTable(db, config, value) {
  clearTable(db, config.table);

  if (config.kind === "singleton" || config.kind === "nestedSingleton") {
    const safeItem = value && typeof value === "object" ? value : null;
    if (!safeItem) {
      return;
    }
    const placeholders = ["?", ...config.columns.map(() => "?"), "?"].join(", ");
    const statement = db.prepare(
      `INSERT INTO ${config.table} (${config.idColumn}, ${config.columns.join(", ")}, json) VALUES (${placeholders})`
    );
    statement.run(
      String(config.idValue || "default"),
      ...config.values(safeItem),
      JSON.stringify(safeItem)
    );
    return;
  }

  const placeholders = ["?", "?", ...config.columns.map(() => "?"), "?"].join(", ");
  const statement = db.prepare(
    `INSERT INTO ${config.table} (id, ordinal, ${config.columns.join(", ")}, json) VALUES (${placeholders})`
  );
  (Array.isArray(value) ? value : []).forEach((item, index) => {
    const safeItem = item && typeof item === "object" ? item : {};
    statement.run(
      String(safeItem.id || `${config.key}-${index + 1}`),
      index,
      ...config.values(safeItem),
      JSON.stringify(safeItem)
    );
  });
}

function readFallbackValueFromAppState(appState, config) {
  if (config.kind === "nestedSingleton" || config.kind === "nestedCollection") {
    const parent = appState[config.key];
    if (parent && typeof parent === "object") {
      return parent[config.nestedKey];
    }
    return config.kind === "nestedCollection" ? [] : null;
  }
  if (Object.prototype.hasOwnProperty.call(appState, config.key)) {
    return appState[config.key];
  }
  return config.kind === "collection" ? [] : null;
}

function readManagedTable(db, config, appState) {
  if (config.kind === "singleton" || config.kind === "nestedSingleton") {
    const row = db.prepare(`SELECT json FROM ${config.table} LIMIT 1`).get();
    if (row && row.json) {
      return JSON.parse(String(row.json || "{}"));
    }
    return readFallbackValueFromAppState(appState, config);
  }

  const rows = db.prepare(`SELECT json FROM ${config.table} ORDER BY ordinal ASC`).all();
  if (rows.length > 0) {
    return rows.map((row) => JSON.parse(String(row.json || "{}")));
  }
  return readFallbackValueFromAppState(appState, config);
}

function writeAppState(db, snapshot) {
  clearTable(db, "app_state");
  const statement = db.prepare("INSERT INTO app_state (state_key, json) VALUES (?, ?)");
  const fullManagedKeys = new Set(
    Object.values(MANAGED_TABLES)
      .filter((config) => !config.nestedKey)
      .map((config) => config.key)
  );
  const nestedManagedKeys = Object.values(MANAGED_TABLES).reduce((accumulator, config) => {
    if (!config.nestedKey) {
      return accumulator;
    }
    if (!accumulator.has(config.key)) {
      accumulator.set(config.key, new Set());
    }
    accumulator.get(config.key).add(config.nestedKey);
    return accumulator;
  }, new Map());
  Object.entries(snapshot)
    .forEach(([key, value]) => {
      if (fullManagedKeys.has(key)) {
        return;
      }
      if (nestedManagedKeys.has(key) && value && typeof value === "object") {
        const clone = { ...value };
        nestedManagedKeys.get(key).forEach((nestedKey) => {
          delete clone[nestedKey];
        });
        if (Object.keys(clone).length === 0) {
          return;
        }
        statement.run(String(key), JSON.stringify(clone));
        return;
      }
      statement.run(String(key), JSON.stringify(value));
    });
}

function readAppState(db) {
  const rows = db.prepare("SELECT state_key, json FROM app_state ORDER BY state_key ASC").all();
  return rows.reduce((accumulator, row) => {
    accumulator[String(row.state_key)] = JSON.parse(String(row.json || "null"));
    return accumulator;
  }, {});
}

function writeSqliteSnapshot(snapshot) {
  const db = getSqliteDb();
  db.exec("BEGIN IMMEDIATE TRANSACTION");
  try {
    Object.values(MANAGED_TABLES).forEach((config) => {
      writeManagedTable(db, config, resolveManagedValue(snapshot, config));
    });
    writeAppState(db, snapshot && typeof snapshot === "object" ? snapshot : {});
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function readSqliteSnapshot() {
  const db = getSqliteDb();
  const appState = readAppState(db);
  Object.values(MANAGED_TABLES).forEach((config) => {
    const value = readManagedTable(db, config, appState);
    if (config.kind === "nestedSingleton" || config.kind === "nestedCollection") {
      const parent = appState[config.key] && typeof appState[config.key] === "object" ? appState[config.key] : {};
      appState[config.key] = {
        ...parent,
        [config.nestedKey]: value
      };
      return;
    }
    appState[config.key] = value;
  });
  return appState;
}

function importJsonSnapshotToSqlite(snapshot) {
  if (!snapshot || typeof snapshot !== "object") {
    return false;
  }
  writeSqliteSnapshot(snapshot);
  return true;
}

function bootstrapSqliteFromJsonFile(jsonFilePath) {
  if (sqliteSnapshotExists()) {
    return false;
  }
  if (!fs.existsSync(jsonFilePath)) {
    return false;
  }
  const raw = fs.readFileSync(jsonFilePath, "utf8");
  const snapshot = JSON.parse(raw);
  importJsonSnapshotToSqlite(snapshot);
  return true;
}

module.exports = {
  bootstrapSqliteFromJsonFile,
  closeSqliteDb,
  getDbProvider,
  getSqliteDb,
  getSqliteDbPath,
  importJsonSnapshotToSqlite,
  isSqliteProviderEnabled,
  readSqliteSnapshot,
  sqliteSnapshotExists,
  writeSqliteSnapshot
};
