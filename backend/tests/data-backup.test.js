const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
  formatBackupId,
  planRetention,
  runDatastoreBackup
} = require("../src/lib/dataBackup");

function createTempWorkspace() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "electromart-backup-"));
}

function writeJson(filePath, payload) {
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

test("formatBackupId produces timestamp-safe id", () => {
  const id = formatBackupId(new Date("2026-03-12T10:30:45.123Z"));
  assert.equal(id, "20260312T103045Z");
});

test("runDatastoreBackup creates JSON backup with checksum metadata and manifest entry", () => {
  const tempDir = createTempWorkspace();
  try {
    const jsonPrimaryPath = path.join(tempDir, "db.json");
    const jsonBackupPath = path.join(tempDir, "db.json.bak");
    const backupsRoot = path.join(tempDir, "backups");
    writeJson(jsonPrimaryPath, { users: [{ id: "u1" }], products: [] });
    writeJson(jsonBackupPath, { users: [{ id: "u1" }], products: [{ id: "p1" }] });

    const result = runDatastoreBackup({
      provider: "json",
      now: "2026-03-12T11:00:00.000Z",
      sourcePaths: {
        jsonPrimaryPath,
        jsonBackupPath
      },
      configOverrides: {
        rootDir: backupsRoot,
        maxBackups: 5,
        maxAgeDays: 30
      }
    });

    assert.equal(result.ok, true);
    assert.equal(result.provider, "json");
    assert.equal(result.fileCount, 2);
    assert.equal(result.retention.keptEntries, 1);
    assert.equal(result.pruned.length, 0);
    assert.equal(result.files.every((item) => /^[a-f0-9]{64}$/i.test(item.checksum)), true);

    const manifest = readJson(result.manifestPath);
    assert.equal(manifest.entries.length, 1);
    assert.equal(manifest.entries[0].fileCount, 2);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("runDatastoreBackup applies max-backups retention and prunes old artifacts", () => {
  const tempDir = createTempWorkspace();
  try {
    const jsonPrimaryPath = path.join(tempDir, "db.json");
    const backupsRoot = path.join(tempDir, "backups");
    writeJson(jsonPrimaryPath, { users: [{ id: "u1" }], products: [{ id: "p1" }] });

    runDatastoreBackup({
      provider: "json",
      now: "2026-03-12T10:00:00.000Z",
      sourcePaths: { jsonPrimaryPath },
      configOverrides: { rootDir: backupsRoot, maxBackups: 2, maxAgeDays: 365, includeJsonBackup: false }
    });
    runDatastoreBackup({
      provider: "json",
      now: "2026-03-12T10:10:00.000Z",
      sourcePaths: { jsonPrimaryPath },
      configOverrides: { rootDir: backupsRoot, maxBackups: 2, maxAgeDays: 365, includeJsonBackup: false }
    });
    const latest = runDatastoreBackup({
      provider: "json",
      now: "2026-03-12T10:20:00.000Z",
      sourcePaths: { jsonPrimaryPath },
      configOverrides: { rootDir: backupsRoot, maxBackups: 2, maxAgeDays: 365, includeJsonBackup: false }
    });

    assert.equal(latest.retention.keptEntries, 2);
    assert.equal(latest.retention.prunedEntries, 1);

    const manifest = readJson(latest.manifestPath);
    assert.equal(manifest.entries.length, 2);
    const runsDir = path.join(backupsRoot, "runs");
    const runFolders = fs.readdirSync(runsDir, { withFileTypes: true }).filter((item) => item.isDirectory());
    assert.equal(runFolders.length, 2);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("runDatastoreBackup in sqlite mode stores sqlite artifact and compatibility snapshot", () => {
  const tempDir = createTempWorkspace();
  try {
    const sqlitePath = path.join(tempDir, "electromart.sqlite");
    const backupsRoot = path.join(tempDir, "backups");
    fs.writeFileSync(sqlitePath, "sqlite-bytes", "utf8");

    const result = runDatastoreBackup({
      provider: "sqlite",
      now: "2026-03-12T12:45:00.000Z",
      sourcePaths: { sqlitePath },
      readCompatibilitySnapshot: () => ({
        users: [{ id: "u1" }],
        products: [{ id: "p1" }]
      }),
      configOverrides: {
        rootDir: backupsRoot,
        maxBackups: 3,
        maxAgeDays: 90,
        includeCompatibilitySnapshot: true
      }
    });

    const kinds = result.files.map((item) => item.kind).sort();
    assert.deepEqual(kinds, ["compatibility-json-snapshot", "sqlite-database"]);
    assert.equal(typeof result.files[0].checksum, "string");
    assert.equal(Boolean(result.files[0].checksum), true);

    const manifest = readJson(result.manifestPath);
    assert.equal(manifest.entries.length, 1);
    assert.equal(typeof manifest.entries[0].sourceVersion.backendVersion, "string");
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("planRetention prunes entries that exceed age limit", () => {
  const baseEntries = [
    { id: "new", createdAt: "2026-03-12T10:00:00.000Z" },
    { id: "old", createdAt: "2026-02-01T10:00:00.000Z" }
  ];
  const plan = planRetention(baseEntries, {
    maxBackups: 10,
    maxAgeDays: 15
  }, new Date("2026-03-12T12:00:00.000Z"));
  assert.deepEqual(plan.kept.map((item) => item.id), ["new"]);
  assert.deepEqual(plan.pruned.map((item) => item.id), ["old"]);
});
