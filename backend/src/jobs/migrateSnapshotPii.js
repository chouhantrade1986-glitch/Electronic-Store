const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
const { isDeepStrictEqual } = require("util");
const { dbPath } = require("../lib/db");
const { decryptPiiFields, encryptPiiFields } = require("../middleware/piiEncryption");

const SNAPSHOT_PATHS = [dbPath, `${dbPath}.bak`];

function migrateSnapshot(snapshot, now = Date.now()) {
  const expectedSnapshot = decryptPiiFields(snapshot);
  const challenges = Array.isArray(expectedSnapshot.authOtpChallenges)
    ? expectedSnapshot.authOtpChallenges
    : [];
  const retainedChallenges = challenges.filter((challenge) => {
    const expiresAt = Date.parse(String(challenge && challenge.expiresAt || ""));
    return !Number.isFinite(expiresAt) || expiresAt > now;
  });
  if (Array.isArray(expectedSnapshot.authOtpChallenges)) {
    expectedSnapshot.authOtpChallenges = retainedChallenges;
  }

  const encryptedSnapshot = encryptPiiFields(expectedSnapshot);
  const restoredSnapshot = decryptPiiFields(encryptedSnapshot);
  if (!isDeepStrictEqual(restoredSnapshot, expectedSnapshot)) {
    throw new Error("PII snapshot migration verification failed.");
  }

  return {
    snapshot: encryptedSnapshot,
    removedExpiredOtpChallenges: challenges.length - retainedChallenges.length
  };
}

function readAndMigrateSnapshot(filePath, now) {
  const raw = fs.readFileSync(filePath, "utf8");
  const snapshot = JSON.parse(raw);
  const result = migrateSnapshot(snapshot, now);
  return {
    filePath,
    snapshot: result.snapshot,
    originalBytes: Buffer.byteLength(raw, "utf8"),
    migratedBytes: Buffer.byteLength(JSON.stringify(result.snapshot, null, 2), "utf8"),
    removedExpiredOtpChallenges: result.removedExpiredOtpChallenges
  };
}

function writeSnapshotAtomically(filePath, snapshot) {
  const tempPath = `${filePath}.${process.pid}.${crypto.randomUUID()}.tmp`;
  const contents = `${JSON.stringify(snapshot, null, 2)}\n`;
  const descriptor = fs.openSync(tempPath, "wx", 0o600);
  try {
    fs.writeFileSync(descriptor, contents, "utf8");
    fs.fsyncSync(descriptor);
  } finally {
    fs.closeSync(descriptor);
  }

  try {
    fs.renameSync(tempPath, filePath);
  } finally {
    if (fs.existsSync(tempPath)) {
      fs.rmSync(tempPath, { force: true });
    }
  }
}

function runMigration(options = {}) {
  const apply = options.apply === true;
  const now = options.now === undefined ? Date.now() : options.now;
  const prepared = SNAPSHOT_PATHS.map((filePath) => readAndMigrateSnapshot(filePath, now));

  if (apply) {
    prepared.forEach((entry) => writeSnapshotAtomically(entry.filePath, entry.snapshot));
  }

  return prepared.map((entry) => ({
    file: path.relative(process.cwd(), entry.filePath),
    applied: apply,
    originalBytes: entry.originalBytes,
    migratedBytes: entry.migratedBytes,
    removedExpiredOtpChallenges: entry.removedExpiredOtpChallenges
  }));
}

if (require.main === module) {
  try {
    const apply = process.argv.slice(2).includes("--apply");
    const summary = runMigration({ apply });
    console.log(JSON.stringify({ applyRequired: !apply, snapshots: summary }, null, 2));
  } catch (error) {
    console.error(error.message || "Unable to migrate JSON snapshot PII.");
    process.exitCode = 1;
  }
}

module.exports = {
  migrateSnapshot,
  runMigration
};
