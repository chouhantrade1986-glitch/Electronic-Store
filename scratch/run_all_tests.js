const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const scratchDir = __dirname;
const files = fs.readdirSync(scratchDir).filter(f => f.startsWith('test-') && f.endsWith('.js'));

console.log(`Running ${files.length} test suites...`);
let passed = 0;
let failed = 0;
const failedTests = [];

for (const file of files) {
  const fullPath = path.join(scratchDir, file);
  try {
    execSync(`node "${fullPath}"`, { stdio: 'pipe' });
    console.log(`  ✓ PASS: ${file}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${file}`);
    console.error(err.stdout ? err.stdout.toString() : '');
    console.error(err.stderr ? err.stderr.toString() : '');
    failed++;
    failedTests.push(file);
  }
}

console.log(`\n==================================================`);
console.log(`SUMMARY: ${passed} passed, ${failed} failed out of ${files.length} test suites.`);
console.log(`==================================================`);

if (failed > 0) {
  process.exit(1);
}
