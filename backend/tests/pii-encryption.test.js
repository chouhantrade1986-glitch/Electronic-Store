const test = require("node:test");
const assert = require("node:assert/strict");

const previousEncryptionKey = process.env.PII_ENCRYPTION_KEY;
process.env.PII_ENCRYPTION_KEY = "unit-test-pii-encryption-secret-32-bytes";

const piiEncryption = require("../src/middleware/piiEncryption");
const {
  decryptPiiFields,
  decryptPiiValue,
  encryptPiiFields,
  encryptPiiValue
} = piiEncryption;

test.after(() => {
  if (previousEncryptionKey === undefined) {
    delete process.env.PII_ENCRYPTION_KEY;
  } else {
    process.env.PII_ENCRYPTION_KEY = previousEncryptionKey;
  }
});

test("AES-GCM PII values use a fresh nonce and round-trip", () => {
  const first = encryptPiiValue("123 Main Street");
  const second = encryptPiiValue("123 Main Street");

  assert.match(first, /^v1:[a-f0-9]{24}:[a-f0-9]{32}:/);
  assert.notEqual(first, second);
  assert.equal(decryptPiiValue(first), "123 Main Street");
});

test("PII field helpers encrypt and decrypt only the selected fields", () => {
  const source = {
    shippingAddress: "123 Main Street",
    phone: "+919876543210",
    gstin: "27ABCDE1234F1Z5",
    recipientEmail: "person@example.test",
    giftMessage: "A private note",
    profile: {
      mobileNumber: "+919876543211",
      companyGstin: "29ABCDE1234F1Z6"
    },
    displayName: "ElectroMart"
  };
  const encrypted = encryptPiiFields(source, [
    "shippingAddress",
    "phone",
    "gstin",
    "recipientEmail",
    "giftMessage",
    "mobileNumber",
    "companyGstin"
  ]);

  assert.notEqual(encrypted.shippingAddress, source.shippingAddress);
  assert.notEqual(encrypted.phone, source.phone);
  assert.notEqual(encrypted.gstin, source.gstin);
  assert.notEqual(encrypted.recipientEmail, source.recipientEmail);
  assert.notEqual(encrypted.giftMessage, source.giftMessage);
  assert.notEqual(encrypted.profile.mobileNumber, source.profile.mobileNumber);
  assert.notEqual(encrypted.profile.companyGstin, source.profile.companyGstin);
  assert.equal(encrypted.displayName, source.displayName);
  assert.deepEqual(decryptPiiFields(encrypted), source);
  assert.equal(source.shippingAddress, "123 Main Street");
});

test("default PII fields encrypt personal identity and OTP values without encrypting product names", () => {
  const source = {
    users: [{ name: "Test Customer", email: "customer@example.test" }],
    products: [{ name: "Laptop Product" }],
    authOtpChallenges: [{
      code: "123456",
      destination: "customer@example.test",
      identifier: "customer@example.test",
      pendingUser: {
        name: "Pending Customer",
        email: "pending@example.test"
      }
    }],
    orderNotifications: [{
      destination: "9876543210"
    }],
    phoneVerification: {
      pendingCode: "654321",
      pendingMobile: "9876543210",
      verifiedForMobile: "9876543210"
    }
  };
  const encrypted = encryptPiiFields(source);

  assert.match(encrypted.users[0].name, /^v1:/);
  assert.match(encrypted.users[0].email, /^v1:/);
  assert.equal(encrypted.products[0].name, "Laptop Product");
  assert.match(encrypted.authOtpChallenges[0].code, /^v1:/);
  assert.match(encrypted.authOtpChallenges[0].destination, /^v1:/);
  assert.match(encrypted.authOtpChallenges[0].identifier, /^v1:/);
  assert.match(encrypted.authOtpChallenges[0].pendingUser.name, /^v1:/);
  assert.match(encrypted.authOtpChallenges[0].pendingUser.email, /^v1:/);
  assert.match(encrypted.orderNotifications[0].destination, /^v1:/);
  assert.match(encrypted.phoneVerification.pendingCode, /^v1:/);
  assert.match(encrypted.phoneVerification.pendingMobile, /^v1:/);
  assert.match(encrypted.phoneVerification.verifiedForMobile, /^v1:/);
  assert.deepEqual(decryptPiiFields(encrypted), source);
});

test("snapshot migration encrypts PII, retains active OTPs, removes expired OTPs and is idempotent", () => {
  const { migrateSnapshot } = require("../src/jobs/migrateSnapshotPii");
  const now = Date.parse("2026-11-10T00:00:00.000Z");
  const source = {
    users: [{ name: "Test Customer", email: "customer@example.test" }],
    products: [{ name: "Laptop Product" }],
    authOtpChallenges: [
      { code: "123456", destination: "customer@example.test", expiresAt: "2026-11-11T00:00:00.000Z" },
      { code: "654321", destination: "customer@example.test", expiresAt: "2026-11-09T00:00:00.000Z" }
    ]
  };

  const first = migrateSnapshot(source, now);
  const second = migrateSnapshot(first.snapshot, now);

  assert.equal(first.removedExpiredOtpChallenges, 1);
  assert.equal(first.snapshot.authOtpChallenges.length, 1);
  assert.match(first.snapshot.authOtpChallenges[0].code, /^v1:/);
  assert.match(first.snapshot.authOtpChallenges[0].destination, /^v1:/);
  assert.match(first.snapshot.users[0].name, /^v1:/);
  assert.match(first.snapshot.users[0].email, /^v1:/);
  assert.equal(first.snapshot.products[0].name, "Laptop Product");
  assert.equal(second.removedExpiredOtpChallenges, 0);
  assert.deepEqual(decryptPiiFields(first.snapshot), {
    ...source,
    authOtpChallenges: [source.authOtpChallenges[0]]
  });
});

test("PII response middleware decrypts selected nested fields", () => {
  const address = encryptPiiValue("123 Main Street");
  let nextCalled = false;
  const response = {
    locals: {},
    json(body) {
      this.body = body;
      return this;
    }
  };

  piiEncryption({}, response, () => {
    nextCalled = true;
  });
  response.json({ order: { shippingAddress: address } });

  assert.equal(nextCalled, true);
  assert.equal(response.body.order.shippingAddress, "123 Main Street");
});

test("PII decryption rejects tampered ciphertext", () => {
  const encrypted = encryptPiiValue("private value");
  const tampered = `${encrypted.slice(0, -2)}00`;

  assert.throws(() => decryptPiiValue(tampered));
});

test("previous JSON snapshots are encrypted before becoming the persisted backup", () => {
  const { serializeEncryptedBackup } = require("../src/lib/db");
  const previousSnapshot = {
    orders: [{ shippingAddress: "12 Example Road", corporateDetails: { gstin: "27ABCDE1234F1Z5" } }]
  };

  const backup = JSON.parse(serializeEncryptedBackup(JSON.stringify(previousSnapshot)));

  assert.match(backup.orders[0].shippingAddress, /^v1:/);
  assert.match(backup.orders[0].corporateDetails.gstin, /^v1:/);
  assert.deepEqual(decryptPiiFields(backup), previousSnapshot);
});
