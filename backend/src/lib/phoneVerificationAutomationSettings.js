const DEFAULT_PHONE_VERIFICATION_REMINDER_BATCH_LIMIT = 25;

function asBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }
  return fallback;
}

function normalizeChannels(value, fallback = ["sms", "email"]) {
  const list = Array.isArray(value)
    ? value
    : String(value || "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
  const normalized = [...new Set(list.filter((item) => item === "sms" || item === "email"))];
  return normalized.length ? normalized : fallback;
}

function getPhoneVerificationAutomationJobConfig(overrides = {}) {
  const enabled = asBoolean(
    overrides.enabled !== undefined ? overrides.enabled : process.env.PHONE_VERIFICATION_AUTOMATION_ENABLED,
    false
  );
  const runOnStart = asBoolean(
    overrides.runOnStart !== undefined ? overrides.runOnStart : process.env.PHONE_VERIFICATION_AUTOMATION_RUN_ON_START,
    false
  );
  const intervalMinutes = Math.max(
    15,
    Number(
      overrides.intervalMinutes !== undefined
        ? overrides.intervalMinutes
        : process.env.PHONE_VERIFICATION_AUTOMATION_INTERVAL_MINUTES || 720
    )
  );
  const limit = Math.max(
    1,
    Math.min(
      200,
      Number(
        overrides.limit !== undefined
          ? overrides.limit
          : process.env.PHONE_VERIFICATION_REMINDER_BATCH_LIMIT || DEFAULT_PHONE_VERIFICATION_REMINDER_BATCH_LIMIT
      )
    )
  );

  return {
    enabled,
    runOnStart,
    intervalMinutes,
    intervalMs: intervalMinutes * 60 * 1000,
    limit,
    channels: normalizeChannels(
      overrides.channels !== undefined ? overrides.channels : process.env.PHONE_VERIFICATION_AUTOMATION_CHANNELS,
      ["sms", "email"]
    ),
    actor: String(overrides.actor || "automation").trim() || "automation",
    trigger: String(overrides.trigger || "manual").trim() || "manual",
    snapshotLimit: Math.max(1, Math.min(200, Number(overrides.snapshotLimit || 50))),
    dryRun: asBoolean(overrides.dryRun, false)
  };
}

function defaultPhoneVerificationAutomationSettings() {
  const config = getPhoneVerificationAutomationJobConfig({});
  return {
    enabled: config.enabled,
    runOnStart: config.runOnStart,
    intervalMinutes: config.intervalMinutes,
    channels: [...config.channels],
    limit: config.limit,
    updatedAt: null,
    updatedBy: ""
  };
}

function normalizePhoneVerificationAutomationSettings(value, fallback = defaultPhoneVerificationAutomationSettings()) {
  const base = fallback && typeof fallback === "object" ? fallback : defaultPhoneVerificationAutomationSettings();
  const source = value && typeof value === "object" ? value : {};
  return {
    enabled: source.enabled !== undefined ? asBoolean(source.enabled, base.enabled !== false) : base.enabled !== false,
    runOnStart: source.runOnStart !== undefined ? asBoolean(source.runOnStart, base.runOnStart === true) : base.runOnStart === true,
    intervalMinutes: Math.max(
      15,
      Number(source.intervalMinutes !== undefined ? source.intervalMinutes : base.intervalMinutes || 720)
    ),
    channels: normalizeChannels(
      source.channels !== undefined ? source.channels : base.channels,
      Array.isArray(base.channels) && base.channels.length ? base.channels : ["sms", "email"]
    ),
    limit: Math.max(
      1,
      Math.min(200, Number(source.limit !== undefined ? source.limit : base.limit || DEFAULT_PHONE_VERIFICATION_REMINDER_BATCH_LIMIT))
    ),
    updatedAt: source.updatedAt ? String(source.updatedAt) : base.updatedAt || null,
    updatedBy: source.updatedBy ? String(source.updatedBy) : base.updatedBy || ""
  };
}

function ensurePhoneVerificationAutomationSettings(db) {
  if (!db.automationSettings || typeof db.automationSettings !== "object") {
    db.automationSettings = {};
  }
  const next = normalizePhoneVerificationAutomationSettings(db.automationSettings.phoneVerificationReminder);
  db.automationSettings.phoneVerificationReminder = next;
  return next;
}

function getPhoneVerificationAutomationEffectiveConfig(db, overrides = {}) {
  const settings = db && typeof db === "object"
    ? ensurePhoneVerificationAutomationSettings(db)
    : defaultPhoneVerificationAutomationSettings();
  return getPhoneVerificationAutomationJobConfig({
    ...settings,
    ...overrides
  });
}

module.exports = {
  asBoolean,
  defaultPhoneVerificationAutomationSettings,
  ensurePhoneVerificationAutomationSettings,
  getPhoneVerificationAutomationEffectiveConfig,
  getPhoneVerificationAutomationJobConfig,
  normalizeChannels,
  normalizePhoneVerificationAutomationSettings
};
