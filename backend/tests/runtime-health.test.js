const test = require("node:test");
const assert = require("node:assert/strict");

const { buildRuntimeHealthSnapshot, resolveTwilioChannelHealth } = require("../src/lib/runtimeHealth");

test("buildRuntimeHealthSnapshot returns healthy status when critical dependencies are ready", () => {
  const snapshot = buildRuntimeHealthSnapshot({
    now: "2026-03-11T08:00:00.000Z",
    processUptime: () => 123.4,
    getDbProvider: () => "sqlite",
    isSqliteProviderEnabled: () => true,
    getSqliteDbPath: () => "C:/data/electromart.sqlite",
    pathExists: () => true,
    readDb: () => ({
      users: [{ id: "u1" }],
      products: [{ id: "p1" }, { id: "p2" }]
    }),
    resolveJwtSecret: () => "test-secret",
    getOrderReservationExpirySchedulerStatus: () => ({
      healthy: true,
      enabled: true,
      inFlight: false,
      intervalMs: 30000
    }),
    getPhoneVerificationAutomationSchedulerStatus: () => ({
      healthy: true,
      enabled: false,
      active: false,
      inFlight: false,
      intervalMs: 0,
      channels: []
    }),
    resolveRazorpayConfig: () => ({ provider: "simulated" }),
    isRazorpayEnabled: () => false,
    isDriveConfigured: () => false
  });

  assert.equal(snapshot.ok, true);
  assert.equal(snapshot.status, "ok");
  assert.equal(snapshot.storageProvider, "sqlite");
  assert.equal(snapshot.dependencies.datastore.healthy, true);
  assert.equal(snapshot.dependencies.datastore.sqlite.filePresent, true);
  assert.equal(snapshot.dependencies.datastore.summary.users, 1);
  assert.equal(snapshot.dependencies.schedulers.orderReservation.healthy, true);
});

test("buildRuntimeHealthSnapshot marks status degraded when critical dependency fails", () => {
  const snapshot = buildRuntimeHealthSnapshot({
    getDbProvider: () => "json",
    isSqliteProviderEnabled: () => false,
    readDb: () => {
      throw new Error("db unavailable");
    },
    resolveJwtSecret: () => {
      throw new Error("missing jwt secret");
    },
    getOrderReservationExpirySchedulerStatus: () => ({
      healthy: false,
      enabled: false,
      inFlight: false,
      intervalMs: 0
    }),
    getPhoneVerificationAutomationSchedulerStatus: () => ({
      healthy: true,
      enabled: false,
      active: false,
      inFlight: false,
      intervalMs: 0,
      channels: []
    }),
    resolveRazorpayConfig: () => ({ provider: "razorpay" }),
    isRazorpayEnabled: () => false,
    isDriveConfigured: () => true
  });

  assert.equal(snapshot.ok, false);
  assert.equal(snapshot.status, "degraded");
  assert.equal(snapshot.dependencies.datastore.healthy, false);
  assert.match(snapshot.dependencies.datastore.error, /db unavailable/i);
  assert.equal(snapshot.dependencies.auth.healthy, false);
  assert.match(snapshot.dependencies.auth.error, /missing jwt secret/i);
  assert.equal(snapshot.dependencies.schedulers.orderReservation.healthy, false);
});

test("resolveTwilioChannelHealth reports configured and disabled channel states", () => {
  const configured = resolveTwilioChannelHealth("sms", {
    TWILIO_ACCOUNT_SID: "AC123",
    TWILIO_AUTH_TOKEN: "secret",
    TWILIO_SMS_FROM: "+919999999999"
  });
  assert.equal(configured.configured, true);

  const missing = resolveTwilioChannelHealth("whatsapp", {
    TWILIO_ACCOUNT_SID: "",
    TWILIO_AUTH_TOKEN: "",
    TWILIO_WHATSAPP_FROM: ""
  });
  assert.equal(missing.configured, false);
});
