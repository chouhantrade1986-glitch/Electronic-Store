const fs = require("fs");
const os = require("os");
const path = require("path");
const { runDatastoreBackup } = require("../lib/dataBackup");
const { runRestoreDrill } = require("../lib/dataRestoreDrill");

function writeJson(filePath, payload) {
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function runIsolatedBackupRestoreDrill() {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "electromart-backup-drill-"));
  const sourceDir = path.join(temporaryRoot, "dummy-datastore");
  const backupRoot = path.join(temporaryRoot, "backups");
  const primaryPath = path.join(sourceDir, "db.json");
  const backupPath = path.join(sourceDir, "db.json.bak");

  try {
    fs.mkdirSync(sourceDir, { recursive: true });
    const fixture = {
      users: [{ id: "drill-user-1", role: "customer" }],
      products: [{ id: "drill-product-1", name: "Backup drill fixture" }]
    };
    writeJson(primaryPath, fixture);
    writeJson(backupPath, fixture);

    const backup = runDatastoreBackup({
      provider: "json",
      sourcePaths: {
        jsonPrimaryPath: primaryPath,
        jsonBackupPath: backupPath
      },
      configOverrides: {
        rootDir: backupRoot,
        maxBackups: 1,
        maxAgeDays: 1
      }
    });
    const restore = runRestoreDrill({
      backupId: backup.backupId,
      configOverrides: { rootDir: backupRoot }
    });

    return {
      ok: backup.ok === true && restore.ok === true,
      mode: "isolated-dummy-data",
      backup: {
        ok: backup.ok === true,
        id: backup.backupId,
        fileCount: backup.fileCount,
        totalSizeBytes: backup.totalSizeBytes
      },
      restore: {
        ok: restore.ok === true,
        status: restore.status,
        smoke: restore.smoke,
        timings: restore.timings
      },
      temporaryRoot
    };
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

try {
  const report = runIsolatedBackupRestoreDrill();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.ok) {
    process.exitCode = 1;
  }
} catch (error) {
  process.stderr.write(`${error && error.message ? error.message : "Isolated backup restore drill failed."}\n`);
  process.exitCode = 1;
}