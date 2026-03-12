const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const {
  dbBackupPath,
  dbPath,
  getDbProvider,
  getSqliteDbPath,
  readDb
} = require("./db");

const DAY_MS = 24 * 60 * 60 * 1000;

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

function toPositiveNumber(value, fallback, min = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(min, parsed);
}

function formatBackupId(dateValue = new Date()) {
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  const iso = date.toISOString();
  return iso
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function resolveSourceVersion(env = process.env) {
  let backendVersion = "unknown";
  try {
    const packagePath = path.join(__dirname, "..", "..", "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    backendVersion = String(packageJson.version || "unknown");
  } catch (error) {
    backendVersion = "unknown";
  }

  return {
    backendVersion,
    commitSha: String(env.GITHUB_SHA || env.SOURCE_COMMIT_SHA || "").trim(),
    nodeVersion: process.version
  };
}

function resolveBackupConfig(env = process.env, overrides = {}) {
  const rootDir = path.resolve(
    String(
      overrides.rootDir
      || env.BACKUP_ROOT_DIR
      || path.join(__dirname, "..", "..", "backups")
    ).trim()
  );
  const maxBackups = toPositiveInteger(
    overrides.maxBackups !== undefined ? overrides.maxBackups : env.BACKUP_RETENTION_MAX_BACKUPS,
    14,
    1
  );
  const maxAgeDaysRaw = toPositiveNumber(
    overrides.maxAgeDays !== undefined ? overrides.maxAgeDays : env.BACKUP_RETENTION_MAX_AGE_DAYS,
    14,
    0
  );
  const maxAgeDays = maxAgeDaysRaw > 0 ? maxAgeDaysRaw : Number.POSITIVE_INFINITY;
  const includeJsonBackup = asBoolean(
    overrides.includeJsonBackup !== undefined ? overrides.includeJsonBackup : env.BACKUP_INCLUDE_JSON_BAK,
    true
  );
  const includeCompatibilitySnapshot = asBoolean(
    overrides.includeCompatibilitySnapshot !== undefined
      ? overrides.includeCompatibilitySnapshot
      : env.BACKUP_INCLUDE_COMPATIBILITY_SNAPSHOT,
    true
  );
  const checksumAlgorithm = String(overrides.checksumAlgorithm || "sha256").trim().toLowerCase() || "sha256";
  const manifestFileName = String(overrides.manifestFileName || "backup-manifest.json").trim() || "backup-manifest.json";

  return {
    rootDir,
    runsDir: path.join(rootDir, "runs"),
    manifestPath: path.join(rootDir, manifestFileName),
    manifestFileName,
    maxBackups,
    maxAgeDays,
    includeJsonBackup,
    includeCompatibilitySnapshot,
    checksumAlgorithm
  };
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function hashBuffer(buffer, algorithm = "sha256") {
  return crypto.createHash(algorithm).update(buffer).digest("hex");
}

function hashFile(filePath, algorithm = "sha256") {
  const contents = fs.readFileSync(filePath);
  return hashBuffer(contents, algorithm);
}

function safeReadManifest(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return { version: 1, entries: [] };
    }
    const entries = Array.isArray(parsed.entries) ? parsed.entries : [];
    return {
      version: 1,
      entries
    };
  } catch (error) {
    return { version: 1, entries: [] };
  }
}

function writeManifest(filePath, payload) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function isPathInside(parentPath, targetPath) {
  const parent = path.resolve(parentPath);
  const target = path.resolve(targetPath);
  if (target === parent) {
    return true;
  }
  return target.startsWith(`${parent}${path.sep}`);
}

function normalizeRunDirectoryName(backupId, provider) {
  const safeProvider = String(provider || "unknown")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-") || "unknown";
  return `${backupId}-${safeProvider}`;
}

function copySourceFile(params = {}) {
  const sourcePath = String(params.sourcePath || "").trim();
  if (!sourcePath || !fs.existsSync(sourcePath)) {
    return null;
  }

  const checksumAlgorithm = String(params.checksumAlgorithm || "sha256").trim().toLowerCase() || "sha256";
  const backupRoot = String(params.backupRoot || "").trim();
  const dryRun = params.dryRun === true;
  const kind = String(params.kind || "artifact").trim() || "artifact";
  const targetFileName = String(params.targetFileName || path.basename(sourcePath)).trim() || path.basename(sourcePath);
  const backupPath = backupRoot ? path.join(backupRoot, targetFileName) : "";
  const sizeBytes = Number(fs.statSync(sourcePath).size || 0);

  if (!dryRun && backupPath) {
    ensureDir(path.dirname(backupPath));
    fs.copyFileSync(sourcePath, backupPath);
  }

  const checksum = hashFile(dryRun ? sourcePath : backupPath, checksumAlgorithm);
  return {
    kind,
    sourcePath: path.resolve(sourcePath),
    backupPath: backupPath ? path.resolve(backupPath) : "",
    sizeBytes,
    checksumAlgorithm,
    checksum
  };
}

function writeCompatibilitySnapshot(params = {}) {
  const snapshot = params.snapshot && typeof params.snapshot === "object" ? params.snapshot : {};
  const backupRoot = String(params.backupRoot || "").trim();
  const targetFileName = String(params.targetFileName || "compatibility-db.json").trim() || "compatibility-db.json";
  const checksumAlgorithm = String(params.checksumAlgorithm || "sha256").trim().toLowerCase() || "sha256";
  const dryRun = params.dryRun === true;
  const serialized = `${JSON.stringify(snapshot, null, 2)}\n`;
  const payloadBuffer = Buffer.from(serialized, "utf8");
  const backupPath = backupRoot ? path.join(backupRoot, targetFileName) : "";

  if (!dryRun && backupPath) {
    ensureDir(path.dirname(backupPath));
    fs.writeFileSync(backupPath, serialized, "utf8");
  }

  return {
    kind: "compatibility-json-snapshot",
    sourcePath: "runtime-snapshot",
    backupPath: backupPath ? path.resolve(backupPath) : "",
    sizeBytes: Number(payloadBuffer.length || 0),
    checksumAlgorithm,
    checksum: hashBuffer(payloadBuffer, checksumAlgorithm)
  };
}

function planRetention(entries = [], config = {}, nowValue = new Date()) {
  const nowMs = nowValue instanceof Date ? nowValue.getTime() : new Date(nowValue).getTime();
  const maxBackups = Math.max(1, Number(config.maxBackups || 1));
  const maxAgeMs = Number.isFinite(Number(config.maxAgeDays)) ? Number(config.maxAgeDays) * DAY_MS : Number.POSITIVE_INFINITY;
  const sorted = [...entries].sort((left, right) => {
    const leftTime = new Date(left && left.createdAt ? left.createdAt : 0).getTime();
    const rightTime = new Date(right && right.createdAt ? right.createdAt : 0).getTime();
    return rightTime - leftTime;
  });

  const kept = [];
  const pruned = [];
  sorted.forEach((entry, index) => {
    const createdAtMs = new Date(entry && entry.createdAt ? entry.createdAt : 0).getTime();
    const ageExceeded = Number.isFinite(maxAgeMs)
      && Number.isFinite(createdAtMs)
      && createdAtMs > 0
      && nowMs - createdAtMs > maxAgeMs;
    const countExceeded = index >= maxBackups;
    if (ageExceeded || countExceeded) {
      pruned.push(entry);
      return;
    }
    kept.push(entry);
  });

  return {
    kept,
    pruned
  };
}

function removePrunedArtifacts(entries = [], rootDir, dryRun = false) {
  const removed = [];
  entries.forEach((entry) => {
    const backupRoot = String(entry && entry.backupRoot ? entry.backupRoot : "").trim();
    if (!backupRoot || !isPathInside(rootDir, backupRoot)) {
      return;
    }
    if (!fs.existsSync(backupRoot)) {
      removed.push({
        id: String(entry && entry.id ? entry.id : ""),
        backupRoot: path.resolve(backupRoot),
        removed: true,
        existed: false
      });
      return;
    }
    if (!dryRun) {
      fs.rmSync(backupRoot, { recursive: true, force: true });
    }
    removed.push({
      id: String(entry && entry.id ? entry.id : ""),
      backupRoot: path.resolve(backupRoot),
      removed: true,
      existed: true
    });
  });
  return removed;
}

function runDatastoreBackup(options = {}) {
  const env = options.env || process.env;
  const config = resolveBackupConfig(env, options.configOverrides || {});
  const now = options.now instanceof Date ? options.now : (options.now ? new Date(options.now) : new Date());
  const dryRun = options.dryRun === true;
  const provider = String(options.provider || getDbProvider() || "json").trim().toLowerCase() || "json";
  const backupId = String(options.backupId || formatBackupId(now)).trim();
  const backupRoot = path.join(config.runsDir, normalizeRunDirectoryName(backupId, provider));
  const sourcePaths = {
    jsonPrimaryPath: options.sourcePaths && options.sourcePaths.jsonPrimaryPath ? options.sourcePaths.jsonPrimaryPath : dbPath,
    jsonBackupPath: options.sourcePaths && options.sourcePaths.jsonBackupPath ? options.sourcePaths.jsonBackupPath : dbBackupPath,
    sqlitePath: options.sourcePaths && options.sourcePaths.sqlitePath ? options.sourcePaths.sqlitePath : getSqliteDbPath()
  };

  if (!dryRun) {
    ensureDir(backupRoot);
  }

  const files = [];
  if (provider === "sqlite") {
    const sqliteArtifact = copySourceFile({
      sourcePath: sourcePaths.sqlitePath,
      backupRoot,
      checksumAlgorithm: config.checksumAlgorithm,
      dryRun,
      kind: "sqlite-database",
      targetFileName: path.basename(sourcePaths.sqlitePath)
    });
    if (sqliteArtifact) {
      files.push(sqliteArtifact);
    }

    const sqliteWalArtifact = copySourceFile({
      sourcePath: `${sourcePaths.sqlitePath}-wal`,
      backupRoot,
      checksumAlgorithm: config.checksumAlgorithm,
      dryRun,
      kind: "sqlite-wal",
      targetFileName: `${path.basename(sourcePaths.sqlitePath)}-wal`
    });
    if (sqliteWalArtifact) {
      files.push(sqliteWalArtifact);
    }

    const sqliteShmArtifact = copySourceFile({
      sourcePath: `${sourcePaths.sqlitePath}-shm`,
      backupRoot,
      checksumAlgorithm: config.checksumAlgorithm,
      dryRun,
      kind: "sqlite-shm",
      targetFileName: `${path.basename(sourcePaths.sqlitePath)}-shm`
    });
    if (sqliteShmArtifact) {
      files.push(sqliteShmArtifact);
    }

    if (config.includeCompatibilitySnapshot) {
      const snapshot = typeof options.readCompatibilitySnapshot === "function"
        ? options.readCompatibilitySnapshot()
        : readDb();
      files.push(writeCompatibilitySnapshot({
        snapshot,
        backupRoot,
        checksumAlgorithm: config.checksumAlgorithm,
        dryRun,
        targetFileName: "compatibility-db.json"
      }));
    }
  } else {
    const primaryJsonArtifact = copySourceFile({
      sourcePath: sourcePaths.jsonPrimaryPath,
      backupRoot,
      checksumAlgorithm: config.checksumAlgorithm,
      dryRun,
      kind: "json-primary",
      targetFileName: path.basename(sourcePaths.jsonPrimaryPath)
    });
    if (primaryJsonArtifact) {
      files.push(primaryJsonArtifact);
    }

    if (config.includeJsonBackup) {
      const backupJsonArtifact = copySourceFile({
        sourcePath: sourcePaths.jsonBackupPath,
        backupRoot,
        checksumAlgorithm: config.checksumAlgorithm,
        dryRun,
        kind: "json-backup",
        targetFileName: path.basename(sourcePaths.jsonBackupPath)
      });
      if (backupJsonArtifact) {
        files.push(backupJsonArtifact);
      }
    }
  }

  if (files.length === 0) {
    throw new Error(`No datastore artifacts found for provider "${provider}".`);
  }

  const totalSizeBytes = files.reduce((sum, item) => sum + Number(item && item.sizeBytes ? item.sizeBytes : 0), 0);
  const createdAt = now.toISOString();
  const backupEntry = {
    id: backupId,
    createdAt,
    provider,
    backupRoot: path.resolve(backupRoot),
    totalSizeBytes,
    fileCount: files.length,
    files,
    sourceVersion: resolveSourceVersion(env)
  };

  const manifest = safeReadManifest(config.manifestPath);
  const retentionPlan = planRetention([backupEntry, ...(manifest.entries || [])], config, now);
  const removedEntries = removePrunedArtifacts(retentionPlan.pruned, config.rootDir, dryRun);
  const manifestPayload = {
    version: 1,
    updatedAt: createdAt,
    retention: {
      maxBackups: config.maxBackups,
      maxAgeDays: Number.isFinite(config.maxAgeDays) ? config.maxAgeDays : null
    },
    entries: retentionPlan.kept
  };

  if (!dryRun) {
    writeManifest(config.manifestPath, manifestPayload);
  }

  return {
    ok: true,
    dryRun,
    createdAt,
    backupId,
    provider,
    backupRoot: path.resolve(backupRoot),
    totalSizeBytes,
    fileCount: files.length,
    files,
    manifestPath: path.resolve(config.manifestPath),
    retention: {
      maxBackups: config.maxBackups,
      maxAgeDays: Number.isFinite(config.maxAgeDays) ? config.maxAgeDays : null,
      keptEntries: retentionPlan.kept.length,
      prunedEntries: removedEntries.length
    },
    pruned: removedEntries
  };
}

module.exports = {
  formatBackupId,
  planRetention,
  resolveBackupConfig,
  runDatastoreBackup
};
