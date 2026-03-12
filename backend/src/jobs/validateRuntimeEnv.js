require("dotenv").config();
const { validateRuntimeEnvPolicy } = require("../lib/envPolicy");

function main() {
  const report = validateRuntimeEnvPolicy(process.env);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.ok) {
    process.exitCode = 1;
  }
}

main();
