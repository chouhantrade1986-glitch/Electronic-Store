const test = require("node:test");
const assert = require("node:assert/strict");

const {
  applyAdminProvisioningPolicy,
  assertAdminProvisioningGuardrails,
  hasValidAdminBootstrapSecret
} = require("../src/lib/adminProvisioningGuardrails");
const { isSeededDemoUserBlocked } = require("../src/lib/demoUsers");

function buildDb(users = []) {
  return {
    users: users.map((user) => ({ ...user }))
  };
}

test("production runtime disables seeded demo users", () => {
  const db = buildDb([
    {
      id: "demo-admin",
      name: "Admin User",
      email: "admin@electromart.com",
      mobile: "9999999999",
      role: "admin",
      passwordHash: "hash",
      address: "HQ",
      seededDemoUser: true,
      seededDemoProfileKey: "admin",
      demoAccessDisabled: false
    }
  ]);

  const result = applyAdminProvisioningPolicy(db, {
    APP_RUNTIME_ENV: "production",
    ALLOW_SEEDED_DEMO_USERS: "false"
  });

  assert.equal(result.seededDemoUsersForcedDisabled, true);
  assert.equal(result.disabledCount, 1);
  assert.equal(db.users[0].demoAccessDisabled, true);
  assert.equal(isSeededDemoUserBlocked(db.users[0], { env: { APP_RUNTIME_ENV: "production" } }), true);
});

test("production runtime rejects unsafe seeded demo config", () => {
  const db = buildDb([]);

  assert.throws(() => assertAdminProvisioningGuardrails(db, {
    APP_RUNTIME_ENV: "production",
    ALLOW_SEEDED_DEMO_USERS: "true",
    ADMIN_BOOTSTRAP_SECRET: "replace-with-strong-secret"
  }), /ALLOW_SEEDED_DEMO_USERS must remain false in production/i);
});

test("production runtime requires a real admin or secure bootstrap secret", () => {
  const db = buildDb([]);

  assert.equal(hasValidAdminBootstrapSecret({
    ADMIN_BOOTSTRAP_SECRET: "replace-with-strong-secret"
  }), false);

  assert.throws(() => assertAdminProvisioningGuardrails(db, {
    APP_RUNTIME_ENV: "production",
    ALLOW_SEEDED_DEMO_USERS: "false",
    ADMIN_BOOTSTRAP_SECRET: ""
  }), /requires either a real admin account or a secure ADMIN_BOOTSTRAP_SECRET/i);

  const ok = assertAdminProvisioningGuardrails(db, {
    APP_RUNTIME_ENV: "production",
    ALLOW_SEEDED_DEMO_USERS: "false",
    ADMIN_BOOTSTRAP_SECRET: "prod-bootstrap-secret-123"
  });

  assert.equal(ok.ok, true);
  assert.equal(ok.hasSecureBootstrapSecret, true);
});
