require("dotenv").config();
const { runRestoreDrill } = require("../lib/dataRestoreDrill");

function parseArgs(argv = []) {
  const options = {
    backupId: "",
    configOverrides: {}
  };

  argv.forEach((arg) => {
    const raw = String(arg || "").trim();
    const value = raw.toLowerCase();
    if (value.startsWith("--backup-id=")) {
      options.backupId = raw.split("=").slice(1).join("=").trim();
      return;
    }
    if (value.startsWith("--root-dir=")) {
      options.configOverrides.rootDir = raw.split("=").slice(1).join("=").trim();
      return;
    }
    if (value === "--skip-checksum") {
      options.configOverrides.verifyChecksums = false;
      return;
    }
    if (value === "--skip-smoke") {
      options.configOverrides.smokeCheckEnabled = false;
      return;
    }
    if (value.startsWith("--history-max=")) {
      options.configOverrides.historyMaxEntries = Number(raw.split("=").slice(1).join("=").trim());
    }
  });

  return options;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const summary = runRestoreDrill({
    backupId: options.backupId,
    configOverrides: options.configOverrides
  });
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(summary, null, 2));
  if (!summary.ok) {
    process.exitCode = 1;
  }
}

try {
  main();
} catch (error) {
  // eslint-disable-next-line no-console
  console.error(error && error.message ? error.message : "Datastore restore drill failed.");
  process.exit(1);
}
