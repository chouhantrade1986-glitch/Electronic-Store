const test = require("node:test");
const assert = require("node:assert/strict");

const auth = require("../src/lib/auth");

function restoreJwtSecret(previousSecret) {
  if (typeof previousSecret === "string") {
    process.env.JWT_SECRET = previousSecret;
    return;
  }
  delete process.env.JWT_SECRET;
}

test("assertJwtSecretConfigured rejects placeholder secrets", () => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "replace-with-strong-secret";

  assert.throws(() => auth.assertJwtSecretConfigured(), /JWT_SECRET is required/i);

  restoreJwtSecret(previousSecret);
});

test("signToken and verifyToken work with a configured secret", () => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "unit-test-secret-value";

  const token = auth.signToken({
    id: "user-1",
    role: "customer",
    email: "customer@example.com",
    sessionVersion: 3
  });
  const payload = auth.verifyToken(token);

  assert.equal(payload.sub, "user-1");
  assert.equal(payload.role, "customer");
  assert.equal(payload.email, "customer@example.com");
  assert.equal(payload.sessionVersion, 3);

  restoreJwtSecret(previousSecret);
});
