const fs = require("fs");
const { getDbProvider, getSqliteDbPath, isSqliteProviderEnabled, readDb } = require("./db");
const { resolveJwtSecret } = require("./auth");
const { getOrderReservationExpirySchedulerStatus } = require("./orderReservationExpiryScheduler");
const { getPhoneVerificationAutomationSchedulerStatus } = require("./phoneVerificationAutomationScheduler");
const { isRazorpayEnabled, resolveRazorpayConfig } = require("./razorpayGateway");
const { isDriveConfigured } = require("./googleDrive");

function resolveTwilioChannelHealth(channel, env = process.env) {
  const normalizedChannel = String(channel || "").trim().toLowerCase() === "whatsapp" ? "whatsapp" : "sms";
  const accountSid = String(env.TWILIO_ACCOUNT_SID || "").trim();
  const authToken = String(env.TWILIO_AUTH_TOKEN || "").trim();
  const fromValue = normalizedChannel === "whatsapp"
    ? String(env.TWILIO_WHATSAPP_FROM || env.TWILIO_SMS_FROM || "").trim()
    : String(env.TWILIO_SMS_FROM || "").trim();
  const configured = Boolean(accountSid && authToken && fromValue);

  return {
    channel: normalizedChannel,
    configured,
    mode: configured ? "configured" : "disabled"
  };
}

function buildRuntimeHealthSnapshot(options = {}) {
  const nowIso = options.now ? new Date(options.now).toISOString() : new Date().toISOString();
  const readDbFn = typeof options.readDb === "function" ? options.readDb : readDb;
  const getDbProviderFn = typeof options.getDbProvider === "function" ? options.getDbProvider : getDbProvider;
  const isSqliteProviderEnabledFn = typeof options.isSqliteProviderEnabled === "function"
    ? options.isSqliteProviderEnabled
    : isSqliteProviderEnabled;
  const getSqliteDbPathFn = typeof options.getSqliteDbPath === "function" ? options.getSqliteDbPath : getSqliteDbPath;
  const resolveJwtSecretFn = typeof options.resolveJwtSecret === "function" ? options.resolveJwtSecret : resolveJwtSecret;
  const getOrderSchedulerStatusFn = typeof options.getOrderReservationExpirySchedulerStatus === "function"
    ? options.getOrderReservationExpirySchedulerStatus
    : getOrderReservationExpirySchedulerStatus;
  const getPhoneSchedulerStatusFn = typeof options.getPhoneVerificationAutomationSchedulerStatus === "function"
    ? options.getPhoneVerificationAutomationSchedulerStatus
    : getPhoneVerificationAutomationSchedulerStatus;
  const resolveRazorpayConfigFn = typeof options.resolveRazorpayConfig === "function"
    ? options.resolveRazorpayConfig
    : resolveRazorpayConfig;
  const isRazorpayEnabledFn = typeof options.isRazorpayEnabled === "function"
    ? options.isRazorpayEnabled
    : isRazorpayEnabled;
  const isDriveConfiguredFn = typeof options.isDriveConfigured === "function"
    ? options.isDriveConfigured
    : isDriveConfigured;
  const pathExistsFn = typeof options.pathExists === "function" ? options.pathExists : fs.existsSync;
  const processUptime = typeof options.processUptime === "function" ? options.processUptime : () => process.uptime();

  const storageProvider = String(getDbProviderFn() || "json").trim().toLowerCase() || "json";

  const datastore = {
    healthy: true,
    provider: storageProvider
  };

  if (isSqliteProviderEnabledFn()) {
    const sqlitePath = String(getSqliteDbPathFn() || "").trim();
    datastore.sqlite = {
      path: sqlitePath,
      filePresent: sqlitePath ? Boolean(pathExistsFn(sqlitePath)) : false
    };
  }

  try {
    const db = readDbFn();
    const usersCount = Array.isArray(db && db.users) ? db.users.length : 0;
    const productsCount = Array.isArray(db && db.products) ? db.products.length : 0;
    datastore.summary = {
      users: usersCount,
      products: productsCount
    };
  } catch (error) {
    datastore.healthy = false;
    datastore.error = String(error && error.message ? error.message : error);
  }

  const auth = {
    healthy: true
  };
  try {
    resolveJwtSecretFn();
  } catch (error) {
    auth.healthy = false;
    auth.error = String(error && error.message ? error.message : error);
  }

  const orderReservationScheduler = getOrderSchedulerStatusFn() || {};
  const phoneVerificationScheduler = getPhoneSchedulerStatusFn() || {};

  const razorpayConfig = resolveRazorpayConfigFn() || {};
  const razorpay = {
    provider: String(razorpayConfig.provider || "simulated").trim().toLowerCase() || "simulated",
    enabled: isRazorpayEnabledFn()
  };

  const integrations = {
    razorpay,
    drive: {
      configured: isDriveConfiguredFn()
    },
    twilio: {
      sms: resolveTwilioChannelHealth("sms"),
      whatsapp: resolveTwilioChannelHealth("whatsapp")
    }
  };

  const criticalDependencies = [
    datastore.healthy === true,
    auth.healthy === true,
    orderReservationScheduler.healthy === true
  ];
  const ok = criticalDependencies.every(Boolean);

  return {
    ok,
    status: ok ? "ok" : "degraded",
    service: "electromart-backend",
    timestamp: nowIso,
    uptimeSeconds: Math.max(0, Math.round(Number(processUptime()) || 0)),
    storageProvider,
    dependencies: {
      datastore,
      auth,
      schedulers: {
        orderReservation: orderReservationScheduler,
        phoneVerification: phoneVerificationScheduler
      },
      integrations
    }
  };
}

module.exports = {
  buildRuntimeHealthSnapshot,
  resolveTwilioChannelHealth
};
