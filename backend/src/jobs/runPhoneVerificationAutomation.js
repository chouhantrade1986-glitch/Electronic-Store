require("dotenv").config();

const { executePhoneVerificationAutomationJob, normalizeChannels } = require("../lib/phoneVerificationAutomationJob");

function parseArgs(argv = []) {
  const args = Array.isArray(argv) ? argv : [];
  const options = {
    dryRun: false,
    limit: undefined,
    channels: undefined
  };

  args.forEach((arg) => {
    const value = String(arg || "").trim();
    if (!value) {
      return;
    }
    if (value === "--dry-run") {
      options.dryRun = true;
      return;
    }
    if (value.startsWith("--limit=")) {
      options.limit = Number(value.split("=").slice(1).join("="));
      return;
    }
    if (value.startsWith("--channels=")) {
      options.channels = normalizeChannels(value.split("=").slice(1).join("="), ["sms", "email"]);
    }
  });

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = await executePhoneVerificationAutomationJob({
    ...options,
    actor: options.dryRun ? "cli-dry-run" : "cli",
    trigger: options.dryRun ? "dry-run" : "cli"
  });

  // eslint-disable-next-line no-console
  console.log(result.message);

  if (result.snapshot && result.snapshot.summary) {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result.snapshot.summary));
  }

  process.exitCode = result.status >= 500 ? 1 : 0;
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
