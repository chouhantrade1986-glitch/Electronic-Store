const test = require("node:test");
const assert = require("node:assert/strict");

const {
  ADMIN_PASSWORD_MIN_LENGTH,
  createOrPromoteRealAdmin,
  hasRealAdminAccount
} = require("../src/lib/adminAccounts");

test("createOrPromoteRealAdmin creates a non-demo admin", () => {
  const db = { users: [] };

  const result = createOrPromoteRealAdmin(db, {
    name: "Ops Admin",
    email: "ops@example.com",
    mobile: "9876543210",
    password: "StrongPass1",
    address: "Jaipur"
  });

  assert.equal(result.ok, true);
  assert.equal(result.created, true);
  assert.equal(db.users.length, 1);
  assert.equal(db.users[0].role, "admin");
  assert.equal(db.users[0].seededDemoUser, undefined);
  assert.equal(hasRealAdminAccount(db), true);
});

test("createOrPromoteRealAdmin rejects weak admin passwords", () => {
  const db = { users: [] };

  const result = createOrPromoteRealAdmin(db, {
    name: "Ops Admin",
    email: "ops@example.com",
    mobile: "9876543210",
    password: "weakpass",
    address: "Jaipur"
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
  assert.match(result.message, new RegExp(String(ADMIN_PASSWORD_MIN_LENGTH)));
});

test("createOrPromoteRealAdmin rejects seeded demo identifiers", () => {
  const db = {
    users: [
      {
        id: "demo-admin",
        name: "Admin User",
        email: "admin@electromart.com",
        mobile: "9999999999",
        passwordHash: "hash",
        role: "admin",
        address: "HQ",
        seededDemoUser: true,
        seededDemoProfileKey: "admin"
      }
    ]
  };

  const result = createOrPromoteRealAdmin(db, {
    name: "Real Admin",
    email: "admin@electromart.com",
    mobile: "9999999999",
    password: "StrongPass1",
    address: "Delhi"
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, 409);
  assert.match(result.message, /seeded demo user/i);
});

test("createOrPromoteRealAdmin can promote an existing non-demo user", () => {
  const db = {
    users: [
      {
        id: "user-1",
        name: "Existing User",
        email: "existing@example.com",
        mobile: "9876500000",
        passwordHash: "old-hash",
        role: "customer",
        address: "Ajmer"
      }
    ]
  };

  const result = createOrPromoteRealAdmin(db, {
    name: "Existing Admin",
    email: "existing@example.com",
    mobile: "9876500000",
    password: "StrongPass1",
    address: "Jaipur"
  }, {
    promoteExisting: true
  });

  assert.equal(result.ok, true);
  assert.equal(result.promoted, true);
  assert.equal(db.users[0].role, "admin");
  assert.equal(db.users[0].email, "existing@example.com");
  assert.equal(db.users[0].address, "Jaipur");
});

test("createOrPromoteRealAdmin appends admin audit trail entries when audit context is provided", () => {
  const db = {
    users: [],
    adminAuditTrail: []
  };

  const result = createOrPromoteRealAdmin(db, {
    name: "Ops Admin",
    email: "ops@example.com",
    mobile: "9876543210",
    password: "StrongPass1",
    address: "Jaipur"
  }, {
    auditContext: {
      actorEmail: "ops@example.com",
      actorName: "Ops Admin",
      requestId: "req-1",
      source: "unit_test"
    }
  });

  assert.equal(result.ok, true);
  assert.equal(db.adminAuditTrail.length, 1);
  assert.equal(db.adminAuditTrail[0].category, "admin");
  assert.equal(db.adminAuditTrail[0].actionKey, "admin_created");
  assert.equal(db.adminAuditTrail[0].details.source, "unit_test");
});
