const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const { signToken } = require("../src/lib/auth");
const { serializeDbMutations } = require("../src/middleware/writeLockMiddleware");

const {
  ADMIN_PASSWORD_MIN_LENGTH,
  changeUserRole,
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

test("changeUserRole rejects unsupported roles without mutating the user", () => {
  const db = {
    users: [{ id: "user-1", role: "customer", sessionVersion: 2 }],
    adminAuditTrail: []
  };

  const result = changeUserRole(db, "user-1", "owner");

  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
  assert.equal(db.users[0].role, "customer");
  assert.equal(db.adminAuditTrail.length, 0);
});

test("changeUserRole prevents demotion of the last real admin", () => {
  const db = {
    users: [{ id: "admin-1", role: "admin", seededDemoUser: false }],
    adminAuditTrail: []
  };

  const result = changeUserRole(db, "admin-1", "customer");

  assert.equal(result.ok, false);
  assert.equal(result.status, 409);
  assert.equal(db.users[0].role, "admin");
  assert.equal(db.adminAuditTrail.length, 0);
});

test("changeUserRole audits valid demotion and invalidates the target's sessions", () => {
  const db = {
    users: [
      { id: "admin-1", role: "admin", sessionVersion: 2, seededDemoUser: false },
      { id: "admin-2", role: "admin", sessionVersion: 1, seededDemoUser: false }
    ],
    adminAuditTrail: []
  };

  const result = changeUserRole(db, "admin-1", "customer", {
    actorId: "admin-2",
    actorEmail: "actor@example.com",
    actorName: "Second Admin",
    requestId: "role-change-1",
    source: "admin_api"
  });

  assert.equal(result.ok, true);
  assert.equal(result.previousRole, "admin");
  assert.equal(result.user.role, "customer");
  assert.equal(result.user.sessionVersion, 3);
  assert.equal(db.adminAuditTrail.length, 1);
  assert.equal(db.adminAuditTrail[0].actionKey, "admin_role_changed");
  assert.equal(db.adminAuditTrail[0].actorId, "admin-2");
  assert.equal(db.adminAuditTrail[0].entityId, "admin-1");
  assert.equal(db.adminAuditTrail[0].details.previousRole, "admin");
  assert.equal(db.adminAuditTrail[0].details.nextRole, "customer");
});

test("changeUserRole rejects promoting a seeded demo account", () => {
  const db = {
    users: [
      { id: "admin-1", role: "admin", seededDemoUser: false },
      { id: "demo-1", role: "customer", seededDemoUser: true }
    ],
    adminAuditTrail: []
  };

  const result = changeUserRole(db, "demo-1", "admin");

  assert.equal(result.ok, false);
  assert.equal(result.status, 409);
  assert.equal(db.users[1].role, "customer");
  assert.equal(db.adminAuditTrail.length, 0);
});

test("changeUserRole rejects stale actors that no longer have admin access", () => {
  const db = {
    users: [
      { id: "actor-1", role: "customer", seededDemoUser: false },
      { id: "target-1", role: "customer", seededDemoUser: false }
    ],
    adminAuditTrail: []
  };

  const result = changeUserRole(db, "target-1", "admin", { actorId: "actor-1" });

  assert.equal(result.ok, false);
  assert.equal(result.status, 403);
  assert.equal(db.users[1].role, "customer");
  assert.equal(db.adminAuditTrail.length, 0);
});

test("PATCH /users/:id/role responds with 200 through the real admin route while global mutation locking is active", async () => {
  const dbModulePath = require.resolve("../src/lib/db");
  const adminRoutesPath = require.resolve("../src/routes/adminRoutes");
  const dbModule = require("../src/lib/db");
  const originalReadDb = dbModule.readDb;
  const originalWriteDb = dbModule.writeDb;
  const originalJwtSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "integration-test-secret-strong-123";

  const db = {
    users: [
      {
        id: "admin-1",
        role: "admin",
        email: "admin@example.com",
        name: "Admin One",
        sessionVersion: 1,
        seededDemoUser: false
      },
      {
        id: "user-1",
        role: "customer",
        email: "customer@example.com",
        name: "Customer One",
        sessionVersion: 1,
        seededDemoUser: false
      }
    ],
    adminAuditTrail: []
  };

  dbModule.readDb = () => db;
  dbModule.writeDb = () => {};
  delete require.cache[adminRoutesPath];
  const adminRoutes = require("../src/routes/adminRoutes");

  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.requestId = "role-change-integration";
    req.ip = "127.0.0.1";
    return next();
  });
  app.use(serializeDbMutations);
  app.use("/api/admin", adminRoutes);

  const server = app.listen(0, "127.0.0.1");
  try {
    await new Promise((resolve) => server.once("listening", resolve));
    const port = server.address().port;
    const token = signToken({
      id: "admin-1",
      role: "admin",
      email: "admin@example.com",
      sessionVersion: 1
    });
    const response = await fetch(`http://127.0.0.1:${port}/api/admin/users/user-1/role`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ role: "admin" }),
      signal: AbortSignal.timeout(2000)
    });

    assert.equal(response.status, 200);
    assert.equal(db.users.find((user) => user.id === "user-1").role, "admin");
    assert.equal(db.adminAuditTrail.length, 1);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    dbModule.readDb = originalReadDb;
    dbModule.writeDb = originalWriteDb;
    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }
    delete require.cache[adminRoutesPath];
    delete require.cache[dbModulePath];
  }
});
