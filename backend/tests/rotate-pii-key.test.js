const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  decryptWithKey,
  deriveKey,
  encryptWithKey,
  parseArgs,
  rotatePiiFields,
  rotatePiiFile,
  rotatePiiValue
} = require("../src/jobs/rotatePiiKey");

const SOURCE_KEY = "test-source-pii-encryption-key-32-bytes-long";
const TARGET_KEY = "test-target-pii-encryption-key-32-bytes-long";
const WRONG_KEY = "test-wrong-pii-encryption-key-32-bytes-long!";

test("rotatePiiKey deriveKey: requires at least 32 bytes", () => {
  assert.ok(deriveKey(SOURCE_KEY));
  assert.throws(() => deriveKey("short-key"), /at least 32 bytes/);
});

test("rotatePiiKey encryptWithKey and decryptWithKey: round-trips and enforces integrity", () => {
  const secretText = "Arif Mohmmad, 123 ElectroMart Way, Delhi";
  const encrypted = encryptWithKey(secretText, SOURCE_KEY);

  assert.match(encrypted, /^v1:[a-f0-9]{24}:[a-f0-9]{32}:/);
  assert.equal(decryptWithKey(encrypted, SOURCE_KEY), secretText);

  // Decryption with wrong key must fail
  assert.throws(() => decryptWithKey(encrypted, WRONG_KEY));

  // Decryption of tampered ciphertext must fail
  const parts = encrypted.split(":");
  const tamperedCiphertext = parts[3].slice(0, -2) + (parts[3].endsWith("aa") ? "bb" : "aa");
  const tampered = `${parts[0]}:${parts[1]}:${parts[2]}:${tamperedCiphertext}`;
  assert.throws(() => decryptWithKey(tampered, SOURCE_KEY));
});

test("rotatePiiKey rotatePiiValue: rotates from source to target key idempotently", () => {
  const plainText = "+919876543210";
  const sourceEncrypted = encryptWithKey(plainText, SOURCE_KEY);

  // 1. Rotate from source to target
  const rotation1 = rotatePiiValue(sourceEncrypted, SOURCE_KEY, TARGET_KEY);
  assert.equal(rotation1.status, "rotated");
  assert.equal(decryptWithKey(rotation1.value, TARGET_KEY), plainText);
  assert.throws(() => decryptWithKey(rotation1.value, SOURCE_KEY));

  // 2. Idempotency: rotating already target-keyed value returns status already_target_key
  const rotation2 = rotatePiiValue(rotation1.value, SOURCE_KEY, TARGET_KEY);
  assert.equal(rotation2.status, "already_target_key");
  assert.equal(rotation2.value, rotation1.value);

  // 3. Plaintext values get encrypted under targetKey
  const plainRotation = rotatePiiValue("plain.email@electromart.in", SOURCE_KEY, TARGET_KEY);
  assert.equal(plainRotation.status, "encrypted_plain");
  assert.equal(decryptWithKey(plainRotation.value, TARGET_KEY), "plain.email@electromart.in");

  // 4. Unknown source key throws clean error
  const foreignEncrypted = encryptWithKey("secret", WRONG_KEY);
  assert.throws(() => rotatePiiValue(foreignEncrypted, SOURCE_KEY, TARGET_KEY), /Failed to decrypt PII value with source key/);
});

test("rotatePiiKey rotatePiiFields: supports dry-run and updates nested collections", () => {
  const fixture = {
    store: "ElectroMart",
    users: [
      {
        id: "usr-1",
        email: encryptWithKey("alice@electromart.in", SOURCE_KEY),
        name: "Alice Sharma",
        phone: encryptWithKey("+919999988888", SOURCE_KEY),
        role: "customer"
      }
    ],
    orders: [
      {
        id: "ord-1",
        shippingAddress: encryptWithKey("Sector 18, Noida", SOURCE_KEY),
        gstin: "07AAAAA0000A1Z5",
        total: 4999
      }
    ]
  };

  // 1. Dry run should count fields without mutating
  const dryResult = rotatePiiFields(fixture, SOURCE_KEY, TARGET_KEY, { dryRun: true });
  assert.equal(dryResult.stats.totalPiiFields, 5); // email, name (contextual under users), phone, shippingAddress, gstin
  assert.equal(dryResult.stats.rotated, 3);
  assert.equal(dryResult.stats.encryptedPlain, 2); // name and gstin were plain
  // In dry run, values remain as original fixture
  assert.equal(dryResult.data.users[0].email, fixture.users[0].email);

  // 2. Real run mutates and allows decryption with target key
  const liveResult = rotatePiiFields(fixture, SOURCE_KEY, TARGET_KEY, { dryRun: false });
  assert.equal(liveResult.stats.rotated, 3);
  assert.equal(decryptWithKey(liveResult.data.users[0].email, TARGET_KEY), "alice@electromart.in");
  assert.equal(decryptWithKey(liveResult.data.users[0].name, TARGET_KEY), "Alice Sharma");
  assert.equal(decryptWithKey(liveResult.data.users[0].phone, TARGET_KEY), "+919999988888");
  assert.equal(decryptWithKey(liveResult.data.orders[0].shippingAddress, TARGET_KEY), "Sector 18, Noida");
  assert.equal(decryptWithKey(liveResult.data.orders[0].gstin, TARGET_KEY), "07AAAAA0000A1Z5");
  // Non-PII fields remain completely untouched
  assert.equal(liveResult.data.store, "ElectroMart");
  assert.equal(liveResult.data.orders[0].total, 4999);
});

test("rotatePiiKey rotatePiiFile: safely rotates snapshot file on disk with atomic write", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "electromart-rotate-test-"));
  const inputFilePath = path.join(tmpDir, "test-snapshot.json");
  const outputFilePath = path.join(tmpDir, "test-snapshot-rotated.json");

  try {
    const originalData = {
      users: [
        {
          id: "u-100",
          email: encryptWithKey("rotateme@electromart.in", SOURCE_KEY),
          phone: "+919876500000"
        }
      ]
    };
    fs.writeFileSync(inputFilePath, JSON.stringify(originalData, null, 2), "utf8");

    // 1. Dry run does not create output file
    const dryRunRes = rotatePiiFile({
      inputPath: inputFilePath,
      outputPath: outputFilePath,
      sourceKey: SOURCE_KEY,
      targetKey: TARGET_KEY,
      dryRun: true
    });
    assert.equal(dryRunRes.dryRun, true);
    assert.equal(dryRunRes.stats.rotated, 1);
    assert.equal(dryRunRes.stats.encryptedPlain, 1);
    assert.equal(fs.existsSync(outputFilePath), false);

    // 2. Real rotation writes to output file
    const liveRunRes = rotatePiiFile({
      inputPath: inputFilePath,
      outputPath: outputFilePath,
      sourceKey: SOURCE_KEY,
      targetKey: TARGET_KEY,
      dryRun: false
    });
    assert.equal(liveRunRes.dryRun, false);
    assert.equal(fs.existsSync(outputFilePath), true);

    const rotatedFileContent = JSON.parse(fs.readFileSync(outputFilePath, "utf8"));
    assert.equal(decryptWithKey(rotatedFileContent.users[0].email, TARGET_KEY), "rotateme@electromart.in");
    assert.equal(decryptWithKey(rotatedFileContent.users[0].phone, TARGET_KEY), "+919876500000");

    // 3. Second rotation on output file is fully idempotent
    const idempotentRes = rotatePiiFile({
      inputPath: outputFilePath,
      outputPath: outputFilePath,
      sourceKey: SOURCE_KEY,
      targetKey: TARGET_KEY,
      dryRun: false
    });
    assert.equal(idempotentRes.stats.alreadyTargetKey, 2);
    assert.equal(idempotentRes.stats.rotated, 0);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test("rotatePiiKey parseArgs: parses CLI flags properly", () => {
  const parsed = parseArgs([
    "--source-key=my-source-key-12345678901234567890",
    "--target-key=my-target-key-12345678901234567890",
    "--input-file=./my-test-input.json",
    "--output-file=./my-test-output.json",
    "--dry-run"
  ]);

  assert.equal(parsed.sourceKey, "my-source-key-12345678901234567890");
  assert.equal(parsed.targetKey, "my-target-key-12345678901234567890");
  assert.equal(parsed.inputFile, "./my-test-input.json");
  assert.equal(parsed.outputFile, "./my-test-output.json");
  assert.equal(parsed.dryRun, true);
});
