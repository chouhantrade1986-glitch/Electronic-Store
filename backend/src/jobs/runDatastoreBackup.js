require("dotenv").config();
const { runDatastoreBackup } = require("../lib/dataBackup");

function parseArgs(argv = []) {
  const options = {
    dryRun: false,
    configOverrides: {}
  };

  argv.forEach((arg) => {
    const raw = String(arg || "").trim();
    const value = raw.toLowerCase();
    if (value === "--dry-run") {
      options.dryRun = true;
      return;
    }
    if (value.startsWith("--root-dir=")) {
      options.configOverrides.rootDir = raw.split("=").slice(1).join("=").trim();
      return;
    }
    if (value.startsWith("--max-backups=")) {
      options.configOverrides.maxBackups = Number(raw.split("=").slice(1).join("=").trim());
      return;
    }
    if (value.startsWith("--max-age-days=")) {
      options.configOverrides.maxAgeDays = Number(raw.split("=").slice(1).join("=").trim());
      return;
    }
    if (value.startsWith("--include-json-bak=")) {
      options.configOverrides.includeJsonBackup = raw.split("=").slice(1).join("=").trim();
      return;
    }
    if (value.startsWith("--include-compat-snapshot=")) {
      options.configOverrides.includeCompatibilitySnapshot = raw.split("=").slice(1).join("=").trim();
    }
  });

  return options;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const summary = runDatastoreBackup({
    dryRun: args.dryRun,
    configOverrides: args.configOverrides
  });
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(summary, null, 2));
}

try {
  main();
} catch (error) {
  // eslint-disable-next-line no-console
  console.error(error && error.message ? error.message : "Datastore backup job failed.");
  process.exit(1);
}
