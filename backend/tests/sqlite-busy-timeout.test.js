const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { DatabaseSync } = require("node:sqlite");

const sqliteStore = require("../src/lib/sqliteStore");

function withTempEnv(fileName, extraEnv = {}) {
  const previous = {
    DB_PROVIDER: process.env.DB_PROVIDER,
    SQLITE_DB_PATH: process.env.SQLITE_DB_PATH,
    SQLITE_NORMALIZATION_MODE: process.env.SQLITE_NORMALIZATION_MODE,
    SQLITE_BUSY_TIMEOUT_MS: process.env.SQLITE_BUSY_TIMEOUT_MS
  };
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "electromart-sqlite-busy-"));
  const sqlitePath = path.join(tempDir, fileName);

  process.env.DB_PROVIDER = "sqlite";
  process.env.SQLITE_DB_PATH = sqlitePath;
  process.env.SQLITE_NORMALIZATION_MODE = "compat";
  Object.entries(extraEnv).forEach(([key, value]) => {
    process.env[key] = String(value);
  });
  sqliteStore.closeSqliteDb();

  return () => {
    sqliteStore.closeSqliteDb();
    Object.entries(previous).forEach(([key, value]) => {
      if (typeof value === "string") {
        process.env[key] = value;
      } else {
        delete process.env[key];
      }
    });
    fs.rmSync(tempDir, { recursive: true, force: true });
  };
}

function readBusyTimeout(db) {
  const row = db.prepare("PRAGMA busy_timeout").get();
  if (!row) {
    return 0;
  }
  const value = row.busy_timeout !== undefined ? row.busy_timeout : Object.values(row)[0];
  return Number(value);
}

function baseSnapshot() {
  return {
    products: [{ id: "pr1", sku: "EM-PR1", name: "Widget", brand: "Acme", category: "laptop", status: "active", segment: "b2c", price: 999, stock: 12 }],
    users: [{ id: "u1", email: "user@example.com", role: "customer", name: "User" }],
    orders: [],
    payments: []
  };
}

test("getSqliteDb configures a positive busy_timeout so writers wait out locks", () => {
  const restore = withTempEnv("busy-default.sqlite");
  try {
    const db = sqliteStore.getSqliteDb();
    const value = readBusyTimeout(db);
    assert.ok(Number.isFinite(value), "busy_timeout pragma must be readable");
    assert.ok(value >= 1000, `busy_timeout must be >= 1000ms to survive lock contention, got ${value}`);
  } finally {
    restore();
  }
});

test("getSqliteDb honours the SQLITE_BUSY_TIMEOUT_MS override", () => {
  const restore = withTempEnv("busy-override.sqlite", { SQLITE_BUSY_TIMEOUT_MS: 250 });
  try {
    const db = sqliteStore.getSqliteDb();
    assert.equal(readBusyTimeout(db), 250, "busy_timeout must respect the env override");
  } finally {
    restore();
  }
});

test("writeSqliteSnapshot surfaces a clean error under lock and recovers after release", () => {
  const restore = withTempEnv("busy-contention.sqlite", { SQLITE_BUSY_TIMEOUT_MS: 150 });
  const sqlitePath = process.env.SQLITE_DB_PATH;
  let blocker = null;
  try {
    sqliteStore.writeSqliteSnapshot(baseSnapshot());

    blocker = new DatabaseSync(sqlitePath);
    blocker.exec("BEGIN IMMEDIATE");

    assert.throws(
      () => sqliteStore.writeSqliteSnapshot({
        ...baseSnapshot(),
        users: [{ id: "u2", email: "second@example.com", role: "customer", name: "Second" }]
      }),
      (error) => {
        assert.match(String(error && error.message), /locked|busy/i);
        return true;
      },
      "a write under lock must throw a clean SQLITE_BUSY error rather than crash the process"
    );

    blocker.exec("ROLLBACK");
    blocker.close();
    blocker = null;

    sqliteStore.writeSqliteSnapshot({
      ...baseSnapshot(),
      users: [{ id: "u3", email: "third@example.com", role: "customer", name: "Third" }]
    });
    const restored = sqliteStore.readSqliteSnapshot();
    assert.equal(restored.users[0].email, "third@example.com", "primary connection must stay usable after a blocked write");
  } finally {
    if (blocker) {
      try {
        blocker.close();
      } catch (_error) {
        // noop
      }
    }
    restore();
  }
});
