const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { DatabaseSync } = require("node:sqlite");
const { formatBackupId, resolveBackupConfig } = require("./dataBackup");

function asBoolean(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }
  return fallback;
}

function toPositiveInteger(value, fallback, min = 1) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(min, Math.floor(parsed));
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function safeReadJson(filePath, fallback) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

function writeJson(filePath, payload) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function hashFile(filePath, algorithm = "sha256") {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash(algorithm).update(buffer).digest("hex");
}

function resolveRestoreDrillConfig(env = process.env, overrides = {}) {
  const backupConfig = resolveBackupConfig(env, {
    rootDir: overrides.rootDir !== undefined ? overrides.rootDir : env.BACKUP_ROOT_DIR
  });
  const rootDir = backupConfig.rootDir;
  return {
    rootDir,
    manifestPath: backupConfig.manifestPath,
    drillsDir: path.join(rootDir, "restore-drills"),
    historyPath: path.join(rootDir, "restore-drill-history.json"),
    verifyChecksums: asBoolean(
      overrides.verifyChecksums !== undefined ? overrides.verifyChecksums : env.RESTORE_DRILL_VERIFY_CHECKSUMS,
      true
    ),
    smokeCheckEnabled: asBoolean(
      overrides.smokeCheckEnabled !== undefined ? overrides.smokeCheckEnabled : env.RESTORE_DRILL_ENABLE_SMOKE_CHECK,
      true
    ),
    historyMaxEntries: toPositiveInteger(
      overrides.historyMaxEntries !== undefined ? overrides.historyMaxEntries : env.RESTORE_DRILL_HISTORY_MAX_ENTRIES,
      60,
      1
    )
  };
}

function readBackupManifest(filePath) {
  const payload = safeReadJson(filePath, null);
  if (!payload || typeof payload !== "object") {
    return { version: 1, entries: [] };
  }
  return {
    version: 1,
    entries: Array.isArray(payload.entries) ? payload.entries : []
  };
}

function selectBackupEntry(manifest, backupId = "") {
  const entries = Array.isArray(manifest && manifest.entries) ? manifest.entries : [];
  if (entries.length === 0) {
    throw new Error("Backup manifest has no entries. Run `npm run job:backup` first.");
  }
  const requested = String(backupId || "").trim();
  if (!requested) {
    return entries[0];
  }
  const match = entries.find((entry) => String(entry && entry.id ? entry.id : "") === requested);
  if (!match) {
    throw new Error(`Backup id "${requested}" not found in manifest.`);
  }
  return match;
}

function verifyBackupEntryFiles(entry, verifyChecksums = true) {
  const files = Array.isArray(entry && entry.files) ? entry.files : [];
  if (files.length === 0) {
    return {
      passed: false,
      checks: [{
        file: "",
        passed: false,
        reason: "No files listed in selected backup entry."
      }]
    };
  }

  const checks = files.map((item) => {
    const sourcePath = String(item && item.backupPath ? item.backupPath : "").trim();
    const checksumAlgorithm = String(item && item.checksumAlgorithm ? item.checksumAlgorithm : "sha256").trim().toLowerCase() || "sha256";
    const expectedChecksum = String(item && item.checksum ? item.checksum : "").trim().toLowerCase();
    if (!sourcePath || !fs.existsSync(sourcePath)) {
      return {
        file: sourcePath,
        kind: String(item && item.kind ? item.kind : ""),
        passed: false,
        reason: "Backup artifact is missing."
      };
    }
    if (!verifyChecksums) {
      return {
        file: sourcePath,
        kind: String(item && item.kind ? item.kind : ""),
        passed: true,
        reason: "Checksum verification skipped."
      };
    }
    const actualChecksum = hashFile(sourcePath, checksumAlgorithm);
    const matched = actualChecksum.toLowerCase() === expectedChecksum;
    return {
      file: sourcePath,
      kind: String(item && item.kind ? item.kind : ""),
      passed: matched,
      checksumAlgorithm,
      expectedChecksum,
      actualChecksum,
      reason: matched ? "Checksum verified." : "Checksum mismatch."
    };
  });

  return {
    passed: checks.every((item) => item.passed === true),
    checks
  };
}

function copyBackupArtifacts(entry, destinationDir) {
  const files = Array.isArray(entry && entry.files) ? entry.files : [];
  const artifactsDir = path.join(destinationDir, "artifacts");
  ensureDir(artifactsDir);

  return files.map((item) => {
    const sourcePath = String(item && item.backupPath ? item.backupPath : "").trim();
    const fileName = String(path.basename(sourcePath || `${item.kind || "artifact"}.bin`)).trim() || "artifact.bin";
    const restoredPath = path.join(artifactsDir, fileName);
    fs.copyFileSync(sourcePath, restoredPath);
    return {
      kind: String(item && item.kind ? item.kind : ""),
      sourcePath,
      restoredPath: path.resolve(restoredPath),
      checksum: String(item && item.checksum ? item.checksum : ""),
      checksumAlgorithm: String(item && item.checksumAlgorithm ? item.checksumAlgorithm : "sha256"),
      sizeBytes: Number(item && item.sizeBytes ? item.sizeBytes : 0)
    };
  });
}

function runJsonSmokeCheck(filePath, checkName) {
  try {
    const payload = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const isObject = payload && typeof payload === "object" && !Array.isArray(payload);
    const hasUsers = Array.isArray(payload && payload.users);
    const hasProducts = Array.isArray(payload && payload.products);
    return {
      name: checkName,
      passed: Boolean(isObject && hasUsers && hasProducts),
      details: {
        usersCount: hasUsers ? payload.users.length : null,
        productsCount: hasProducts ? payload.products.length : null
      }
    };
  } catch (error) {
    return {
      name: checkName,
      passed: false,
      details: {
        message: error && error.message ? error.message : String(error)
      }
    };
  }
}

function runSqliteSmokeCheck(filePath) {
  let db = null;
  try {
    db = new DatabaseSync(filePath);
    const tableRows = db.prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('users', 'products') ORDER BY name ASC"
    ).all();
    const tableNames = tableRows.map((item) => String(item && item.name ? item.name : ""));
    if (!tableNames.includes("users") || !tableNames.includes("products")) {
      return {
        name: "sqlite-schema-check",
        passed: false,
        details: {
          tablesFound: tableNames
        }
      };
    }
    const usersCount = Number(db.prepare("SELECT COUNT(*) AS count FROM users").get().count || 0);
    const productsCount = Number(db.prepare("SELECT COUNT(*) AS count FROM products").get().count || 0);
    return {
      name: "sqlite-schema-check",
      passed: true,
      details: {
        usersCount,
        productsCount
      }
    };
  } catch (error) {
    return {
      name: "sqlite-schema-check",
      passed: false,
      details: {
        message: error && error.message ? error.message : String(error)
      }
    };
  } finally {
    if (db) {
      db.close();
    }
  }
}

function runPostRestoreSmokeCheck(entry, restoredArtifacts = []) {
  const provider = String(entry && entry.provider ? entry.provider : "").trim().toLowerCase();
  const checks = [];

  if (provider === "sqlite") {
    const sqliteArtifact = restoredArtifacts.find((item) => item.kind === "sqlite-database");
    if (!sqliteArtifact) {
      checks.push({
        name: "sqlite-restore-artifact-present",
        passed: false,
        details: {
          message: "sqlite-database artifact missing after restore."
        }
      });
    } else {
      checks.push(runSqliteSmokeCheck(sqliteArtifact.restoredPath));
    }

    const compatibilityArtifact = restoredArtifacts.find((item) => item.kind === "compatibility-json-snapshot");
    if (compatibilityArtifact) {
      checks.push(runJsonSmokeCheck(compatibilityArtifact.restoredPath, "compatibility-json-smoke"));
    }
  } else {
    const primaryJsonArtifact = restoredArtifacts.find((item) => item.kind === "json-primary");
    if (!primaryJsonArtifact) {
      checks.push({
        name: "json-primary-artifact-present",
        passed: false,
        details: {
          message: "json-primary artifact missing after restore."
        }
      });
    } else {
      checks.push(runJsonSmokeCheck(primaryJsonArtifact.restoredPath, "json-primary-smoke"));
    }

    const jsonBackupArtifact = restoredArtifacts.find((item) => item.kind === "json-backup");
    if (jsonBackupArtifact) {
      checks.push(runJsonSmokeCheck(jsonBackupArtifact.restoredPath, "json-backup-smoke"));
    }
  }

  return {
    passed: checks.every((item) => item.passed === true),
    checks
  };
}

function safeDrillIdSegment(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function loadDrillHistory(filePath) {
  const payload = safeReadJson(filePath, null);
  if (!payload || typeof payload !== "object") {
    return { version: 1, entries: [] };
  }
  return {
    version: 1,
    entries: Array.isArray(payload.entries) ? payload.entries : []
  };
}

function appendDrillHistory(filePath, entry, maxEntries) {
  const history = loadDrillHistory(filePath);
  const nextEntries = [entry, ...history.entries].slice(0, Math.max(1, Number(maxEntries || 1)));
  writeJson(filePath, {
    version: 1,
    updatedAt: new Date().toISOString(),
    entries: nextEntries
  });
}

function runRestoreDrill(options = {}) {
  const env = options.env || process.env;
  const config = resolveRestoreDrillConfig(env, options.configOverrides || {});
  const startedAt = options.now ? new Date(options.now) : new Date();
  const startedAtIso = startedAt.toISOString();
  const drillId = `${formatBackupId(startedAt)}-restore-${safeDrillIdSegment(options.backupId || "latest") || "latest"}`;
  const drillRoot = path.join(config.drillsDir, drillId);
  const evidencePath = path.join(drillRoot, "restore-drill-evidence.json");

  let selectedBackup = null;
  let verification = null;
  let restoredArtifacts = [];
  let smoke = null;
  let failureMessage = "";
  let ok = false;

  const stageTimers = {
    verifyMs: 0,
    restoreMs: 0,
    smokeMs: 0,
    totalMs: 0
  };
  const totalStartedMs = Date.now();

  try {
    const manifest = readBackupManifest(config.manifestPath);
    selectedBackup = selectBackupEntry(manifest, options.backupId || "");

    const verifyStartedMs = Date.now();
    verification = verifyBackupEntryFiles(selectedBackup, config.verifyChecksums);
    stageTimers.verifyMs = Math.max(0, Date.now() - verifyStartedMs);
    if (!verification.passed) {
      throw new Error("Backup artifact verification failed.");
    }

    const restoreStartedMs = Date.now();
    ensureDir(drillRoot);
    restoredArtifacts = copyBackupArtifacts(selectedBackup, drillRoot);
    stageTimers.restoreMs = Math.max(0, Date.now() - restoreStartedMs);

    const smokeStartedMs = Date.now();
    if (config.smokeCheckEnabled) {
      smoke = runPostRestoreSmokeCheck(selectedBackup, restoredArtifacts);
      if (!smoke.passed) {
        throw new Error("Post-restore smoke checks failed.");
      }
    } else {
      smoke = {
        passed: true,
        checks: [{
          name: "post-restore-smoke-skipped",
          passed: true,
          details: {
            reason: "Smoke checks disabled by configuration."
          }
        }]
      };
    }
    stageTimers.smokeMs = Math.max(0, Date.now() - smokeStartedMs);

    ok = true;
  } catch (error) {
    failureMessage = error && error.message ? error.message : String(error);
    if (!smoke) {
      smoke = {
        passed: false,
        checks: []
      };
    }
  }

  stageTimers.totalMs = Math.max(0, Date.now() - totalStartedMs);
  const finishedAtIso = new Date().toISOString();

  const evidence = {
    id: drillId,
    ok,
    status: ok ? "passed" : "failed",
    startedAt: startedAtIso,
    finishedAt: finishedAtIso,
    timings: stageTimers,
    backupManifestPath: path.resolve(config.manifestPath),
    backup: selectedBackup
      ? {
        id: String(selectedBackup.id || ""),
        createdAt: String(selectedBackup.createdAt || ""),
        provider: String(selectedBackup.provider || ""),
        backupRoot: String(selectedBackup.backupRoot || ""),
        fileCount: Number(selectedBackup.fileCount || 0),
        totalSizeBytes: Number(selectedBackup.totalSizeBytes || 0)
      }
      : null,
    verification: verification || {
      passed: false,
      checks: []
    },
    restore: {
      drillRoot: path.resolve(drillRoot),
      restoredFiles: restoredArtifacts
    },
    smoke: smoke || {
      passed: false,
      checks: []
    },
    error: failureMessage
  };

  writeJson(evidencePath, evidence);
  appendDrillHistory(config.historyPath, {
    id: evidence.id,
    status: evidence.status,
    ok: evidence.ok,
    startedAt: evidence.startedAt,
    finishedAt: evidence.finishedAt,
    drillRoot: evidence.restore.drillRoot,
    evidencePath: path.resolve(evidencePath),
    backupId: evidence.backup && evidence.backup.id ? evidence.backup.id : "",
    provider: evidence.backup && evidence.backup.provider ? evidence.backup.provider : "",
    totalMs: stageTimers.totalMs
  }, config.historyMaxEntries);

  return {
    ...evidence,
    evidencePath: path.resolve(evidencePath),
    historyPath: path.resolve(config.historyPath)
  };
}

module.exports = {
  readBackupManifest,
  resolveRestoreDrillConfig,
  runPostRestoreSmokeCheck,
  runRestoreDrill,
  selectBackupEntry,
  verifyBackupEntryFiles
};
