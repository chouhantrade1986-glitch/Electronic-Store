const { readDb, writeDb } = require("../lib/db");
const {
  adminPublicView,
  createOrPromoteRealAdmin,
  hasRealAdminAccount
} = require("../lib/adminAccounts");

function parseArgs(argv = []) {
  const options = {
    apply: false,
    promoteExisting: false
  };

  argv.forEach((arg) => {
    const raw = String(arg || "").trim();
    const normalized = raw.toLowerCase();
    if (!raw) {
      return;
    }
    if (normalized === "--apply") {
      options.apply = true;
      return;
    }
    if (normalized === "--promote-existing") {
      options.promoteExisting = true;
      return;
    }
    if (raw.startsWith("--name=")) {
      options.name = raw.slice("--name=".length);
      return;
    }
    if (raw.startsWith("--email=")) {
      options.email = raw.slice("--email=".length);
      return;
    }
    if (raw.startsWith("--mobile=")) {
      options.mobile = raw.slice("--mobile=".length);
      return;
    }
    if (raw.startsWith("--password=")) {
      options.password = raw.slice("--password=".length);
      return;
    }
    if (raw.startsWith("--address=")) {
      options.address = raw.slice("--address=".length);
    }
  });

  return options;
}

function resolveDraft(options = {}) {
  return {
    name: options.name || process.env.REAL_ADMIN_NAME || "",
    email: options.email || process.env.REAL_ADMIN_EMAIL || "",
    mobile: options.mobile || process.env.REAL_ADMIN_MOBILE || "",
    password: options.password || process.env.REAL_ADMIN_PASSWORD || "",
    address: options.address || process.env.REAL_ADMIN_ADDRESS || ""
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const sourceDb = readDb();
  const db = options.apply ? sourceDb : JSON.parse(JSON.stringify(sourceDb));
  const hadRealAdminBefore = hasRealAdminAccount(db);
  const result = createOrPromoteRealAdmin(db, resolveDraft(options), {
    promoteExisting: options.promoteExisting
  });

  if (result.ok && options.apply) {
    writeDb(db);
  }

  process.stdout.write(`${JSON.stringify({
    apply: options.apply,
    promoteExisting: options.promoteExisting,
    hadRealAdminBefore,
    ok: result.ok,
    status: result.status,
    message: result.message,
    created: result.created === true,
    promoted: result.promoted === true,
    user: result.user ? adminPublicView(result.user) : null
  }, null, 2)}\n`);

  if (!result.ok) {
    process.exitCode = 1;
  }
}

main();
