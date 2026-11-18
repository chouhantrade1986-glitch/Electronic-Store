const test = require("node:test");
const assert = require("node:assert/strict");

const previousDbProvider = process.env.DB_PROVIDER;
const previousJwtSecret = process.env.JWT_SECRET;
const previousPiiEncryptionKey = process.env.PII_ENCRYPTION_KEY;
process.env.DB_PROVIDER = "json";
process.env.JWT_SECRET = "corporate-registry-test-secret-2026";
process.env.PII_ENCRYPTION_KEY = "corporate-registry-test-pii-secret-2026";

const dbModule = require("../src/lib/db");
const originalReadDb = dbModule.readDb;
const originalWriteDb = dbModule.writeDb;
const { decryptPiiFields, encryptPiiFields } = require("../src/middleware/piiEncryption");
let fixtureDb;
dbModule.readDb = () => decryptPiiFields(structuredClone(fixtureDb));
dbModule.writeDb = (nextDb) => {
  fixtureDb = encryptPiiFields(structuredClone(nextDb));
};

const express = require("express");
const { once } = require("node:events");
const { signToken } = require("../src/lib/auth");
const piiEncryption = require("../src/middleware/piiEncryption");
const { serializeDbMutations } = require("../src/middleware/writeLockMiddleware");
const corporateRoutes = require("../src/routes/corporateRoutes");
const app = express();
app.use(express.json());
app.use(piiEncryption);
app.use(serializeDbMutations);
app.use("/api/corporate", corporateRoutes);

let server;
let apiBaseUrl;

function resetFixture() {
  fixtureDb = {
    users: [
      { id: "corp-user-1", role: "customer", email: "one@company.test", name: "Corporate Owner", organizationId: "acme", sessionVersion: 1 },
      { id: "corp-user-2", role: "customer", email: "two@company.test", name: "Corporate Colleague", organizationId: "acme", sessionVersion: 1 },
      { id: "other-user", role: "customer", email: "other@company.test", name: "Other User", sessionVersion: 1 }
    ],
    corporateRegistries: []
  };
}

function tokenFor(userId) {
  return signToken({ id: userId, sessionVersion: 1 });
}

async function request(path, { method = "GET", token, shareToken, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (shareToken) headers["x-corporate-share-token"] = shareToken;
  if (body) headers["Content-Type"] = "application/json";
  return fetch(`${apiBaseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
}

test.before(async () => {
  resetFixture();
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  apiBaseUrl = `http://127.0.0.1:${server.address().port}/api/corporate`;
});

test.after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  dbModule.readDb = originalReadDb;
  dbModule.writeDb = originalWriteDb;
  if (previousDbProvider === undefined) delete process.env.DB_PROVIDER;
  else process.env.DB_PROVIDER = previousDbProvider;
  if (previousJwtSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = previousJwtSecret;
  if (previousPiiEncryptionKey === undefined) delete process.env.PII_ENCRYPTION_KEY;
  else process.env.PII_ENCRYPTION_KEY = previousPiiEncryptionKey;
});

test("registry creation requires authentication and persists organization scope", async () => {
  resetFixture();
  const unauthorized = await request("/registry", {
    method: "POST",
    body: { registryName: "Annual Rewards", items: [] }
  });
  assert.equal(unauthorized.status, 401);

  const response = await request("/registry", {
    method: "POST",
    token: tokenFor("corp-user-1"),
    body: {
      registryName: "Annual Rewards",
      occasion: "rewards",
      eventDate: "2027-01-15",
      items: [{ productId: "CG-PROD-01", quantity: 20 }],
      recipients: [{ name: "Riya Sharma", email: "riya@company.test" }]
    }
  });
  const data = await response.json();

  assert.equal(response.status, 201);
  assert.match(data.registry.id, /^EM-CG-REG-/);
  assert.equal(fixtureDb.corporateRegistries[0].createdBy, "corp-user-1");
  assert.equal(data.registry.items[0].quantity, 20);
  assert.equal(data.registry.createdBy, undefined);
  assert.equal(data.registry.recipients[0].email, "riya@company.test");
  assert.match(fixtureDb.corporateRegistries[0].recipients[0].recipientEmail, /^v1:/);
  assert.match(fixtureDb.corporateRegistries[0].recipients[0].recipientName, /^v1:/);
  assert.match(data.shareToken, /^[a-f0-9]{64}$/);
  assert.equal(fixtureDb.corporateRegistries.length, 1);
  assert.notEqual(fixtureDb.corporateRegistries[0].shareTokenHash, data.shareToken);
});

test("registry reads are restricted to owner or scoped share token", async () => {
  resetFixture();
  const created = await request("/registry", {
    method: "POST",
    token: tokenFor("corp-user-1"),
    body: {
      registryName: "Client Gifts",
      occasion: "diwali",
      eventDate: "2027-10-10",
      items: [{ productId: "CG-PROD-02", quantity: 5 }],
      recipients: []
    }
  });
  const { registry, shareToken } = await created.json();

  const forbidden = await request(`/registry/${registry.id}`, { token: tokenFor("other-user") });
  assert.equal(forbidden.status, 403);
  const organizationMember = await request(`/registry/${registry.id}`, { token: tokenFor("corp-user-2") });
  assert.equal(organizationMember.status, 200);
  const shared = await request(`/registry/${registry.id}`, { shareToken });
  assert.equal(shared.status, 200);
  assert.equal((await shared.json()).registry.registryName, "Client Gifts");
  const invalidToken = await request(`/registry/${registry.id}`, { shareToken: "invalid-token" });
  assert.equal(invalidToken.status, 401);
  const missingToken = await request(`/registry/${registry.id}`);
  assert.equal(missingToken.status, 401);

  const rotated = await request(`/registry/${registry.id}/share-token`, {
    method: "POST",
    token: tokenFor("corp-user-1")
  });
  const rotatedToken = (await rotated.json()).shareToken;
  assert.equal(rotated.status, 200);
  assert.equal((await request(`/registry/${registry.id}`, { shareToken })).status, 401);
  assert.equal((await request(`/registry/${registry.id}`, { shareToken: rotatedToken })).status, 200);
});

test("registry items can synchronize through a valid scoped share token", async () => {
  resetFixture();
  const created = await request("/registry", {
    method: "POST",
    token: tokenFor("corp-user-1"),
    body: {
      registryName: "Partner Gifts",
      occasion: "rewards",
      eventDate: "2027-01-15",
      items: [],
      recipients: []
    }
  });
  const { registry, shareToken } = await created.json();
  const denied = await request(`/registry/${registry.id}/items`, {
    method: "PATCH",
    token: tokenFor("other-user"),
    body: { productId: "CG-PROD-01", quantity: 3 }
  });
  assert.equal(denied.status, 403);

  const added = await request(`/registry/${registry.id}/items`, {
    method: "PATCH",
    shareToken,
    body: { productId: "CG-PROD-01", quantity: 3 }
  });
  assert.equal(added.status, 200);
  assert.equal((await added.json()).registry.items[0].productId, "CG-PROD-01");
  assert.equal(fixtureDb.corporateRegistries[0].items.length, 1);
});

test("registry rejects invalid GSTIN and item payloads without mutating state", async () => {
  resetFixture();
  const response = await request("/registry", {
    method: "POST",
    token: tokenFor("corp-user-1"),
    body: {
      registryName: "Invalid Registry",
      occasion: "diwali",
      eventDate: "2027-10-10",
      gstin: "INVALID",
      items: [{ productId: "CG-PROD-01", quantity: 0 }],
      recipients: []
    }
  });
  assert.equal(response.status, 400);
  assert.equal(fixtureDb.corporateRegistries.length, 0);
});
