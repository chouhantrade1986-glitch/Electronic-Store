const { readDb, writeDb } = require("../lib/db");
const {
  applySeededDemoUserAccessPolicy,
  purgeSeededDemoUserData
} = require("../lib/demoUsers");

function parseArgs(argv = []) {
  const options = {
    apply: false,
    allowAccess: null,
    purge: false
  };

  argv.forEach((arg) => {
    const value = String(arg || "").trim().toLowerCase();
    if (!value) {
      return;
    }
    if (value === "--apply") {
      options.apply = true;
      return;
    }
    if (value === "--allow" || value === "--enable") {
      options.allowAccess = true;
      return;
    }
    if (value === "--disable" || value === "--block") {
      options.allowAccess = false;
      return;
    }
    if (value === "--purge" || value === "--delete") {
      options.purge = true;
    }
  });

  return options;
}

function resolveAllowAccess(explicitValue) {
  if (explicitValue === true || explicitValue === false) {
    return explicitValue;
  }
  return String(process.env.ALLOW_SEEDED_DEMO_USERS || "").trim().toLowerCase() === "true";
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const db = readDb();
  const allowAccess = resolveAllowAccess(options.allowAccess);
  const summary = options.purge
    ? purgeSeededDemoUserData(db)
    : applySeededDemoUserAccessPolicy(db, { allowAccess });

  const shouldWrite = options.apply && (
    options.purge
      ? summary.matchedUserCount > 0
      : summary.changedCount > 0
  );
  if (shouldWrite) {
    writeDb(db);
  }

  process.stdout.write(`${JSON.stringify({
    apply: options.apply,
    purge: options.purge,
    allowAccess,
    ...summary
  }, null, 2)}\n`);
}

main();
