const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const { summarizeNormalizationCoverage } = require("../src/lib/sqliteStore");

test("current db.json snapshot is fully covered by SQLite managed schema", () => {
  const dbPath = path.join(__dirname, "..", "src", "data", "db.json");
  const snapshot = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  const summary = summarizeNormalizationCoverage(snapshot);

  assert.equal(summary.fullyNormalized, true);
  assert.deepEqual(summary.unmanagedTopLevelKeys, []);
  assert.deepEqual(summary.unmanagedNestedKeysByParent, {});
});
