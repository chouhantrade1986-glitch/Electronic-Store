const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const { runDatastoreBackup } = require("../src/lib/dataBackup");
const { runRestoreDrill } = require("../src/lib/dataRestoreDrill");

function createTempWorkspace() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "electromart-restore-"));
}

function writeJson(filePath, payload) {
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function createSqliteSeed(filePath) {
  const db = new DatabaseSync(filePath);
  db.exec("CREATE TABLE users (id TEXT PRIMARY KEY);");
  db.exec("CREATE TABLE products (id TEXT PRIMARY KEY);");
  db.exec("INSERT INTO users (id) VALUES ('u1');");
  db.exec("INSERT INTO products (id) VALUES ('p1');");
  db.close();
}

test("runRestoreDrill restores latest JSON backup and records timing evidence", () => {
  const tempDir = createTempWorkspace();
  try {
    const jsonPrimaryPath = path.join(tempDir, "db.json");
    const jsonBackupPath = path.join(tempDir, "db.json.bak");
    const backupRoot = path.join(tempDir, "backups");
    writeJson(jsonPrimaryPath, {
      users: [{ id: "u1" }],
      products: [{ id: "p1" }]
    });
    writeJson(jsonBackupPath, {
      users: [{ id: "u1" }],
      products: [{ id: "p1" }, { id: "p2" }]
    });

    const backup = runDatastoreBackup({
      provider: "json",
      now: "2026-03-12T12:00:00.000Z",
      sourcePaths: {
        jsonPrimaryPath,
        jsonBackupPath
      },
      configOverrides: {
        rootDir: backupRoot
      }
    });

    const result = runRestoreDrill({
      backupId: backup.backupId,
      configOverrides: {
        rootDir: backupRoot
      }
    });

    assert.equal(result.ok, true);
    assert.equal(result.status, "passed");
    assert.equal(result.backup.id, backup.backupId);
    assert.equal(result.timings.totalMs >= 0, true);
    assert.equal(result.smoke.passed, true);
    assert.equal(fs.existsSync(result.evidencePath), true);
    assert.equal(fs.existsSync(result.historyPath), true);
    assert.equal(result.restore.restoredFiles.length >= 1, true);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("runRestoreDrill fails on checksum mismatch and still records failure evidence", () => {
  const tempDir = createTempWorkspace();
  try {
    const jsonPrimaryPath = path.join(tempDir, "db.json");
    const backupRoot = path.join(tempDir, "backups");
    writeJson(jsonPrimaryPath, {
      users: [{ id: "u1" }],
      products: [{ id: "p1" }]
    });

    const backup = runDatastoreBackup({
      provider: "json",
      now: "2026-03-12T12:15:00.000Z",
      sourcePaths: {
        jsonPrimaryPath
      },
      configOverrides: {
        rootDir: backupRoot,
        includeJsonBackup: false
      }
    });

    const backupFile = backup.files[0].backupPath;
    fs.writeFileSync(backupFile, '{"tampered":true}', "utf8");

    const result = runRestoreDrill({
      backupId: backup.backupId,
      configOverrides: {
        rootDir: backupRoot
      }
    });

    assert.equal(result.ok, false);
    assert.equal(result.status, "failed");
    assert.match(String(result.error || ""), /verification/i);
    assert.equal(fs.existsSync(result.evidencePath), true);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("runRestoreDrill validates sqlite restore smoke checks", () => {
  const tempDir = createTempWorkspace();
  try {
    const sqlitePath = path.join(tempDir, "electromart.sqlite");
    const backupRoot = path.join(tempDir, "backups");
    createSqliteSeed(sqlitePath);

    const backup = runDatastoreBackup({
      provider: "sqlite",
      now: "2026-03-12T12:30:00.000Z",
      sourcePaths: {
        sqlitePath
      },
      readCompatibilitySnapshot: () => ({
        users: [{ id: "u1" }],
        products: [{ id: "p1" }]
      }),
      configOverrides: {
        rootDir: backupRoot,
        includeCompatibilitySnapshot: true
      }
    });

    const result = runRestoreDrill({
      backupId: backup.backupId,
      configOverrides: {
        rootDir: backupRoot
      }
    });

    assert.equal(result.ok, true);
    assert.equal(result.backup.provider, "sqlite");
    assert.equal(result.smoke.passed, true);
    const sqliteCheck = result.smoke.checks.find((item) => item.name === "sqlite-schema-check");
    assert.ok(sqliteCheck);
    assert.equal(sqliteCheck.passed, true);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
