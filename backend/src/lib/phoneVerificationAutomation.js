const { randomUUID } = require("crypto");
const {
  PHONE_VERIFICATION_MODE,
  createPhoneVerificationChallenge,
  hasActivePhoneVerificationChallenge,
  isPhoneVerifiedForCurrentMobile,
  isValidPhone,
  isVerificationLocked,
  normalizePhoneVerificationState,
  phoneVerificationPublicView,
  sendPhoneVerificationCode
} = require("./phoneVerification");
const { sendNotificationPayload } = require("./orderNotifications");
const { ensurePhoneVerificationAutomationSettings } = require("./phoneVerificationAutomationSettings");

const PHONE_VERIFICATION_REMINDER_COOLDOWN_MS = Math.max(
  30 * 60 * 1000,
  Number(process.env.PHONE_VERIFICATION_REMINDER_COOLDOWN_MS || 12 * 60 * 60 * 1000)
);
const PHONE_VERIFICATION_REMINDER_BATCH_LIMIT = Math.max(
  1,
  Math.min(200, Number(process.env.PHONE_VERIFICATION_REMINDER_BATCH_LIMIT || 25))
);
const PHONE_VERIFICATION_REMINDER_MAX_ATTEMPTS = Math.max(
  1,
  Math.min(5, Number(process.env.PHONE_VERIFICATION_REMINDER_MAX_ATTEMPTS || 3))
);
const PHONE_VERIFICATION_REMINDER_RETRY_BACKOFF_MS = Math.max(
  5 * 60 * 1000,
  Number(process.env.PHONE_VERIFICATION_REMINDER_RETRY_BACKOFF_MS || 30 * 60 * 1000)
);
const PHONE_VERIFICATION_AUTOMATION_HISTORY_LIMIT = Math.max(
  20,
  Math.min(500, Number(process.env.PHONE_VERIFICATION_AUTOMATION_HISTORY_LIMIT || 120))
);

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

function resolveStoreBrandName() {
  return String(process.env.STORE_BRAND_NAME || "ElectroMart").trim() || "ElectroMart";
}

function resolveStoreSupportEmail() {
  return String(
    process.env.STORE_SUPPORT_EMAIL
    || process.env.SMTP_FROM_EMAIL
    || process.env.SENDGRID_FROM_EMAIL
    || "support@electromart.com"
  ).trim();
}

function resolvePublicStoreBaseUrl() {
  const raw = String(process.env.PUBLIC_STORE_BASE_URL || process.env.STORE_BASE_URL || "http://localhost:5500").trim();
  return raw.replace(/\/+$/, "");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function clampPhoneVerificationReminderAttempt(value, fallback = 1) {
  return Math.max(
    1,
    Math.min(PHONE_VERIFICATION_REMINDER_MAX_ATTEMPTS, Number.isFinite(Number(value)) ? Number(value) : fallback)
  );
}

function buildPhoneVerificationReminderBackoffAt(createdAt, attempt) {
  const createdAtMs = new Date(createdAt || Date.now()).getTime();
  if (!Number.isFinite(createdAtMs)) {
    return null;
  }
  const multiplier = Math.max(0, clampPhoneVerificationReminderAttempt(attempt, 1) - 1);
  return new Date(createdAtMs + (PHONE_VERIFICATION_REMINDER_RETRY_BACKOFF_MS * (2 ** multiplier))).toISOString();
}

function isPhoneVerificationReminderRetryableFailure(params = {}) {
  const status = String(params.status || "").trim().toLowerCase();
  if (status !== "failed") {
    return false;
  }
  const detail = `${params.error || ""} ${params.reason || ""}`.trim().toLowerCase();
  if (!detail) {
    return true;
  }
  const nonRetryableFragments = [
    "valid mobile number",
    "valid phone number",
    "valid email address",
    "delivery is disabled",
    "unsupported phone_verification_mode",
    "unsupported phone verification mode",
    "user not found",
    "already verified"
  ];
  return !nonRetryableFragments.some((fragment) => detail.includes(fragment));
}

function normalizePhoneVerificationReminderRecord(value = {}) {
  const source = value && typeof value === "object" ? value : {};
  const id = String(source.id || randomUUID());
  const retryMaxAttempts = Math.max(
    1,
    Math.min(PHONE_VERIFICATION_REMINDER_MAX_ATTEMPTS, Number(source.retryMaxAttempts || PHONE_VERIFICATION_REMINDER_MAX_ATTEMPTS))
  );
  const retryAttempt = Math.max(
    1,
    Math.min(retryMaxAttempts, Number(source.retryAttempt || 1))
  );
  const retryEligible = source.retryEligible === true
    && String(source.status || "queued").trim().toLowerCase() === "failed"
    && !source.retryProcessedAt;

  return {
    id,
    userId: String(source.userId || ""),
    name: String(source.name || ""),
    email: normalizeEmail(source.email || ""),
    mobile: String(source.mobile || ""),
    destination: String(source.destination || ""),
    channel: String(source.channel || "email").trim().toLowerCase(),
    status: String(source.status || "queued").trim().toLowerCase(),
    provider: String(source.provider || "system"),
    subject: String(source.subject || "Phone verification reminder"),
    createdAt: source.createdAt ? String(source.createdAt) : new Date().toISOString(),
    sentAt: source.sentAt ? String(source.sentAt) : null,
    error: source.error ? String(source.error) : "",
    reason: source.reason ? String(source.reason) : "",
    actor: String(source.actor || "admin"),
    retryGroupId: String(source.retryGroupId || id),
    retrySourceId: source.retrySourceId ? String(source.retrySourceId) : "",
    retryAttempt,
    retryMaxAttempts,
    retryEligible,
    nextRetryAt: source.nextRetryAt
      ? String(source.nextRetryAt)
      : retryEligible
        ? buildPhoneVerificationReminderBackoffAt(source.createdAt, retryAttempt)
        : null,
    retryProcessedAt: source.retryProcessedAt ? String(source.retryProcessedAt) : null,
    retryFinalFailure: source.retryFinalFailure === true,
    eventLabel: "Phone verification reminder"
  };
}

function ensurePhoneVerificationReminderCollection(db) {
  if (!Array.isArray(db.phoneVerificationReminders)) {
    db.phoneVerificationReminders = [];
    return;
  }
  db.phoneVerificationReminders = db.phoneVerificationReminders.map((item) => normalizePhoneVerificationReminderRecord(item));
}

function normalizePhoneVerificationAutomationRunEntry(value = {}) {
  const source = value && typeof value === "object" ? value : {};
  return {
    id: String(source.id || randomUUID()),
    startedAt: source.startedAt ? String(source.startedAt) : null,
    finishedAt: source.finishedAt ? String(source.finishedAt) : null,
    status: String(source.status || "idle").toLowerCase(),
    message: String(source.message || ""),
    actor: String(source.actor || ""),
    trigger: String(source.trigger || "manual"),
    channels: Array.isArray(source.channels)
      ? [...new Set(source.channels.map((item) => String(item || "").trim().toLowerCase()).filter(Boolean))]
      : [],
    limit: Math.max(1, Math.min(200, Number(source.limit || PHONE_VERIFICATION_REMINDER_BATCH_LIMIT))),
    candidateCount: Math.max(0, Number(source.candidateCount || 0)),
    eligibleCount: Math.max(0, Number(source.eligibleCount || 0)),
    deliveredCount: Math.max(0, Number(source.deliveredCount || 0)),
    queuedCount: Math.max(0, Number(source.queuedCount || 0)),
    failedCount: Math.max(0, Number(source.failedCount || 0)),
    skippedCount: Math.max(0, Number(source.skippedCount || 0)),
    affectedUsers: Math.max(0, Number(source.affectedUsers || 0))
  };
}

function ensurePhoneVerificationAutomationRunHistory(db) {
  if (!db.automationRunHistory || typeof db.automationRunHistory !== "object") {
    db.automationRunHistory = {};
  }
  const current = Array.isArray(db.automationRunHistory.phoneVerificationReminder)
    ? db.automationRunHistory.phoneVerificationReminder
    : [];
  db.automationRunHistory.phoneVerificationReminder = current
    .map((item) => normalizePhoneVerificationAutomationRunEntry(item))
    .sort((a, b) => new Date(b.startedAt || b.finishedAt || 0).getTime() - new Date(a.startedAt || a.finishedAt || 0).getTime())
    .slice(0, PHONE_VERIFICATION_AUTOMATION_HISTORY_LIMIT);
  return db.automationRunHistory.phoneVerificationReminder;
}

function defaultPhoneVerificationAutomationJobState() {
  return {
    lastRunAt: null,
    lastFinishedAt: null,
    lastStatus: "idle",
    lastMessage: "Automation has not run yet.",
    lastTriggeredBy: "",
    lastSummary: {
      deliveredCount: 0,
      queuedCount: 0,
      failedCount: 0,
      skippedCount: 0,
      affectedUsers: 0
    }
  };
}

function ensurePhoneVerificationAutomationJobState(db) {
  if (!db.automationJobs || typeof db.automationJobs !== "object") {
    db.automationJobs = {};
  }
  const next = {
    ...defaultPhoneVerificationAutomationJobState(),
    ...(db.automationJobs.phoneVerificationReminder && typeof db.automationJobs.phoneVerificationReminder === "object"
      ? db.automationJobs.phoneVerificationReminder
      : {})
  };
  next.lastSummary = {
    ...defaultPhoneVerificationAutomationJobState().lastSummary,
    ...(next.lastSummary && typeof next.lastSummary === "object" ? next.lastSummary : {})
  };
  db.automationJobs.phoneVerificationReminder = next;
  return db.automationJobs.phoneVerificationReminder;
}

function buildPhoneVerificationAutomationRunRecord(params = {}) {
  return normalizePhoneVerificationAutomationRunEntry({
    id: params.id || randomUUID(),
    startedAt: params.startedAt || new Date().toISOString(),
    finishedAt: params.finishedAt || new Date().toISOString(),
    status: params.status || "idle",
    message: params.message || "",
    actor: params.actor || "",
    trigger: params.trigger || "manual",
    channels: params.channels || [],
    limit: params.limit,
    candidateCount: params.candidateCount,
    eligibleCount: params.eligibleCount,
    deliveredCount: params.deliveredCount,
    queuedCount: params.queuedCount,
    failedCount: params.failedCount,
    skippedCount: params.skippedCount,
    affectedUsers: params.affectedUsers
  });
}

function listPhoneVerificationAutomationRuns(db, limit = PHONE_VERIFICATION_AUTOMATION_HISTORY_LIMIT) {
  return ensurePhoneVerificationAutomationRunHistory(db)
    .slice(0, Math.max(1, Math.min(PHONE_VERIFICATION_AUTOMATION_HISTORY_LIMIT, Number(limit || PHONE_VERIFICATION_AUTOMATION_HISTORY_LIMIT))));
}

function buildPhoneVerificationAutomationHistorySummary(history = []) {
  const safeHistory = Array.isArray(history) ? history : [];
  const statusCounts = safeHistory.reduce((accumulator, item) => {
    const key = String(item && item.status ? item.status : "idle").toLowerCase();
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});
  const recentWindowStart = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const recentRuns = safeHistory.filter((item) => {
    const startedAt = new Date(item && item.startedAt ? item.startedAt : item && item.finishedAt ? item.finishedAt : 0).getTime();
    return Number.isFinite(startedAt) && startedAt >= recentWindowStart;
  });
  return {
    totalRuns: safeHistory.length,
    runsLast7Days: recentRuns.length,
    sentLast7Days: recentRuns.reduce((sum, item) => sum + Number(item && item.deliveredCount ? item.deliveredCount : 0), 0),
    failedLast7Days: recentRuns.reduce((sum, item) => sum + Number(item && item.failedCount ? item.failedCount : 0), 0),
    affectedUsersLast7Days: recentRuns.reduce((sum, item) => sum + Number(item && item.affectedUsers ? item.affectedUsers : 0), 0),
    statusCounts
  };
}

function isSmsReminderAvailable() {
  return PHONE_VERIFICATION_MODE !== "disabled";
}

function getEligibleReminderChannels(user) {
  const phoneVerification = phoneVerificationPublicView(user);
  const channels = [];
  if (isValidEmail(user && user.email)) {
    channels.push("email");
  }
  if (isValidPhone(user && user.mobile) && isSmsReminderAvailable() && !phoneVerification.isLocked) {
    channels.push("sms");
  }
  return channels;
}

function buildPhoneVerificationReminderPayload(user, options = {}) {
  const storeName = resolveStoreBrandName();
  const supportEmail = resolveStoreSupportEmail();
  const accountUrl = `${resolvePublicStoreBaseUrl()}/account.html`;
  const maskedPhone = options.mobileMasked || "your phone";
  const subject = `${storeName}: verify your phone to unlock SMS and WhatsApp updates`;
  const textLines = [
    `Hi ${String(user && user.name ? user.name : "there").trim() || "there"},`,
    "",
    `Your ${storeName} account still needs phone verification for ${maskedPhone}.`,
    options.smsSent
      ? "A fresh 6-digit verification code has been sent to your phone. Open Account > Notifications to complete verification."
      : "Open Account > Notifications and request a 6-digit verification code to complete verification.",
    options.lockedUntil
      ? `Verification is temporarily locked until ${new Date(options.lockedUntil).toLocaleString()}.`
      : "",
    `Account settings: ${accountUrl}`,
    "",
    `Need help? Reply to ${supportEmail}.`
  ].filter(Boolean);

  return {
    eventLabel: "Phone verification reminder",
    subject,
    text: textLines.join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <p style="margin:0 0 12px">Hi ${escapeHtml(user && user.name ? user.name : "there")},</p>
        <p style="margin:0 0 12px">
          Your <strong>${escapeHtml(storeName)}</strong> account still needs phone verification for
          <strong>${escapeHtml(maskedPhone)}</strong>.
        </p>
        <p style="margin:0 0 12px">
          ${options.smsSent
            ? "A fresh 6-digit verification code has been sent to your phone. Open Account &gt; Notifications to complete verification."
            : "Open Account &gt; Notifications and request a 6-digit verification code to complete verification."}
        </p>
        ${options.lockedUntil
          ? `<p style="margin:0 0 12px;color:#b45309">Verification is temporarily locked until ${escapeHtml(new Date(options.lockedUntil).toLocaleString())}.</p>`
          : ""}
        <p style="margin:0 0 16px">
          <a href="${escapeHtml(accountUrl)}" style="display:inline-block;padding:10px 16px;background:#0f766e;color:#fff;text-decoration:none;border-radius:999px">
            Open Account Settings
          </a>
        </p>
        <p style="margin:0;color:#475569">Need help? Reply to ${escapeHtml(supportEmail)}.</p>
      </div>
    `
  };
}

function getLatestReminderForUser(db, userId) {
  ensurePhoneVerificationReminderCollection(db);
  const normalizedUserId = String(userId || "");
  return [...db.phoneVerificationReminders]
    .filter((item) => String(item && item.userId ? item.userId : "") === normalizedUserId)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0] || null;
}

function getLatestCooldownReminderForUser(db, userId) {
  ensurePhoneVerificationReminderCollection(db);
  const normalizedUserId = String(userId || "");
  return [...db.phoneVerificationReminders]
    .filter((item) => {
      const itemUserId = String(item && item.userId ? item.userId : "");
      const itemStatus = String(item && item.status ? item.status : "").toLowerCase();
      return itemUserId === normalizedUserId && itemStatus !== "failed";
    })
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0] || null;
}

function getReminderCooldownUntil(record) {
  if (!record || !record.createdAt) {
    return null;
  }
  const createdAt = new Date(record.createdAt).getTime();
  if (!Number.isFinite(createdAt)) {
    return null;
  }
  const cooldownUntil = createdAt + PHONE_VERIFICATION_REMINDER_COOLDOWN_MS;
  return cooldownUntil > Date.now() ? new Date(cooldownUntil).toISOString() : null;
}

function buildPhoneVerificationReminderRecord(params = {}) {
  const sourceReminder = params.sourceReminder ? normalizePhoneVerificationReminderRecord(params.sourceReminder) : null;
  const id = String(params.id || randomUUID());
  const createdAt = params.createdAt || new Date().toISOString();
  const retryAttempt = clampPhoneVerificationReminderAttempt(
    sourceReminder ? sourceReminder.retryAttempt + 1 : params.retryAttempt,
    1
  );
  const retryMaxAttempts = Math.max(
    retryAttempt,
    Math.min(
      PHONE_VERIFICATION_REMINDER_MAX_ATTEMPTS,
      Number(
        params.retryMaxAttempts !== undefined
          ? params.retryMaxAttempts
          : sourceReminder
            ? sourceReminder.retryMaxAttempts
            : PHONE_VERIFICATION_REMINDER_MAX_ATTEMPTS
      )
    )
  );
  const status = String(params.status || "queued").trim().toLowerCase();
  const error = params.error ? String(params.error) : "";
  const reason = params.reason ? String(params.reason) : "";
  const retryEligible = status === "failed"
    && retryAttempt < retryMaxAttempts
    && isPhoneVerificationReminderRetryableFailure({ status, error, reason });

  return normalizePhoneVerificationReminderRecord({
    id,
    userId: String(params.userId || ""),
    name: String(params.name || ""),
    email: normalizeEmail(params.email || ""),
    mobile: String(params.mobile || ""),
    destination: String(params.destination || ""),
    channel: String(params.channel || "email").trim().toLowerCase(),
    status,
    provider: String(params.provider || "system"),
    subject: String(params.subject || "Phone verification reminder"),
    createdAt,
    sentAt: params.sentAt || null,
    error,
    reason,
    actor: String(params.actor || "admin"),
    retryGroupId: String(params.retryGroupId || (sourceReminder ? sourceReminder.retryGroupId || sourceReminder.id : id)),
    retrySourceId: String(params.retrySourceId || (sourceReminder ? sourceReminder.id : "")),
    retryAttempt,
    retryMaxAttempts,
    retryEligible,
    nextRetryAt: retryEligible ? buildPhoneVerificationReminderBackoffAt(createdAt, retryAttempt) : null,
    retryProcessedAt: params.retryProcessedAt || null,
    retryFinalFailure: status === "failed" && !retryEligible,
    eventLabel: "Phone verification reminder"
  });
}

function summarizeReminderResults(results = []) {
  const safeResults = Array.isArray(results) ? results : [];
  const deliveredCount = safeResults.filter((item) => item.status === "sent").length;
  const queuedCount = safeResults.filter((item) => item.status === "queued").length;
  const failedCount = safeResults.filter((item) => item.status === "failed").length;
  const skippedCount = safeResults.filter((item) => item.status === "skipped").length;
  return {
    deliveredCount,
    queuedCount,
    failedCount,
    skippedCount,
    affectedUsers: new Set(safeResults.map((item) => item.userId).filter(Boolean)).size
  };
}

function buildReminderSummaryMessage(summary) {
  const parts = [];
  if (summary.deliveredCount > 0) {
    parts.push(`${summary.deliveredCount} sent`);
  }
  if (summary.queuedCount > 0) {
    parts.push(`${summary.queuedCount} queued`);
  }
  if (summary.failedCount > 0) {
    parts.push(`${summary.failedCount} failed`);
  }
  if (summary.skippedCount > 0) {
    parts.push(`${summary.skippedCount} skipped`);
  }
  if (!parts.length) {
    return "No reminders were sent.";
  }
  return `Phone verification reminders: ${parts.join(", ")}.`;
}

function markPhoneVerificationReminderRetryProcessed(db, reminderId, processedAt = new Date().toISOString()) {
  ensurePhoneVerificationReminderCollection(db);
  const index = db.phoneVerificationReminders.findIndex((item) => String(item && item.id ? item.id : "") === String(reminderId || ""));
  if (index === -1) {
    return null;
  }
  db.phoneVerificationReminders[index] = normalizePhoneVerificationReminderRecord({
    ...db.phoneVerificationReminders[index],
    retryEligible: false,
    nextRetryAt: null,
    retryProcessedAt: processedAt
  });
  return db.phoneVerificationReminders[index];
}

function listPendingPhoneVerificationRetryReminders(db, options = {}) {
  ensurePhoneVerificationReminderCollection(db);
  const allowedChannels = Array.isArray(options.channels) && options.channels.length
    ? new Set(options.channels.map((item) => String(item || "").trim().toLowerCase()).filter(Boolean))
    : null;
  return [...db.phoneVerificationReminders]
    .filter((item) => {
      if (!item || item.status !== "failed" || item.retryEligible !== true || item.retryProcessedAt) {
        return false;
      }
      if (allowedChannels && !allowedChannels.has(item.channel)) {
        return false;
      }
      return Boolean(item.nextRetryAt);
    })
    .sort((a, b) => new Date(a.nextRetryAt || a.createdAt || 0).getTime() - new Date(b.nextRetryAt || b.createdAt || 0).getTime());
}

function listDuePhoneVerificationRetryReminders(db, options = {}) {
  const now = Date.now();
  const limit = Number(options.limit || 0);
  const due = listPendingPhoneVerificationRetryReminders(db, options)
    .filter((item) => {
      const retryAt = new Date(item.nextRetryAt || 0).getTime();
      return Number.isFinite(retryAt) && retryAt <= now;
    });
  return limit > 0 ? due.slice(0, limit) : due;
}

function listPhoneVerificationReminderCandidates(db) {
  ensurePhoneVerificationReminderCollection(db);
  return (Array.isArray(db && db.users) ? db.users : [])
    .filter((user) => String(user && user.role ? user.role : "customer").toLowerCase() === "customer")
    .map((user) => {
      const phoneVerification = phoneVerificationPublicView(user);
      const channels = getEligibleReminderChannels(user);
      const lastReminder = getLatestReminderForUser(db, user && user.id);
      const cooldownUntil = getReminderCooldownUntil(getLatestCooldownReminderForUser(db, user && user.id));
      return {
        id: String(user && user.id ? user.id : ""),
        name: String(user && user.name ? user.name : "Customer"),
        email: normalizeEmail(user && user.email ? user.email : ""),
        mobile: String(user && user.mobile ? user.mobile : ""),
        phoneVerification,
        channels,
        lastReminder,
        cooldownUntil,
        eligibleNow: Boolean(!phoneVerification.isVerified && channels.length && !cooldownUntil)
      };
    })
    .filter((item) => item.mobile && item.phoneVerification.isVerified !== true);
}

function getPhoneVerificationAutomationSnapshot(db, limit = 50) {
  ensurePhoneVerificationReminderCollection(db);
  const settings = ensurePhoneVerificationAutomationSettings(db);
  const job = ensurePhoneVerificationAutomationJobState(db);
  const history = listPhoneVerificationAutomationRuns(db, limit);
  const reminders = [...db.phoneVerificationReminders]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, Math.max(1, Math.min(200, Number(limit || 50))));
  const counts = reminders.reduce((accumulator, item) => {
    const key = String(item && item.status ? item.status : "queued").toLowerCase();
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});
  const candidates = listPhoneVerificationReminderCandidates(db);
  const pendingRetries = listPendingPhoneVerificationRetryReminders(db);
  const dueRetryCount = listDuePhoneVerificationRetryReminders(db).length;
  const summary = {
    candidateCount: candidates.length,
    eligibleCount: candidates.filter((item) => item.eligibleNow).length,
    lockedCount: candidates.filter((item) => item.phoneVerification && item.phoneVerification.isLocked).length,
    pendingCount: candidates.filter((item) => item.phoneVerification && item.phoneVerification.hasPendingCode).length,
    recentlyRemindedCount: candidates.filter((item) => item.cooldownUntil).length,
    scheduledRetryCount: pendingRetries.length,
    dueRetryCount,
    finalFailureCount: db.phoneVerificationReminders.filter((item) => item && item.retryFinalFailure === true).length,
    lastRunAt: job.lastRunAt || (reminders[0] ? reminders[0].createdAt : null)
  };
  return {
    settings,
    job,
    summary,
    counts,
    historySummary: buildPhoneVerificationAutomationHistorySummary(history),
    history,
    reminders,
    candidates: candidates.slice(0, 100)
  };
}

async function sendPhoneVerificationReminder(db, user, options = {}) {
  ensurePhoneVerificationReminderCollection(db);
  const actor = String(options.actor || "admin");
  const sourceReminder = options.sourceReminder ? normalizePhoneVerificationReminderRecord(options.sourceReminder) : null;
  if (!user || !user.id) {
    return { ok: false, status: 404, message: "User not found." };
  }
  if (isPhoneVerifiedForCurrentMobile(user)) {
    return { ok: false, status: 409, message: "Phone is already verified for this user." };
  }

  const lastReminder = getLatestCooldownReminderForUser(db, user.id);
  const cooldownUntil = getReminderCooldownUntil(lastReminder);
  if (cooldownUntil && options.force !== true) {
    return {
      ok: false,
      status: 429,
      message: `Reminder cooldown active until ${new Date(cooldownUntil).toLocaleString()}.`,
      cooldownUntil
    };
  }

  const channels = Array.isArray(options.channels) && options.channels.length
    ? [...new Set(options.channels.map((item) => String(item || "").trim().toLowerCase()).filter(Boolean))]
    : getEligibleReminderChannels(user);

  const publicView = phoneVerificationPublicView(user);
  const results = [];
  const now = new Date().toISOString();
  let smsSent = false;

  if (channels.includes("sms")) {
    if (!isValidPhone(user.mobile)) {
      const record = buildPhoneVerificationReminderRecord({
        userId: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        destination: user.mobile || "",
        channel: "sms",
        status: "failed",
        provider: PHONE_VERIFICATION_MODE,
        error: "A valid mobile number is required.",
        actor,
        createdAt: now,
        sourceReminder
      });
      db.phoneVerificationReminders.push(record);
      results.push(record);
    } else if (!isSmsReminderAvailable()) {
      const record = buildPhoneVerificationReminderRecord({
        userId: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        destination: user.mobile,
        channel: "sms",
        status: "skipped",
        provider: PHONE_VERIFICATION_MODE,
        reason: "Phone verification SMS mode is disabled.",
        actor,
        createdAt: now,
        sourceReminder
      });
      db.phoneVerificationReminders.push(record);
      results.push(record);
    } else if (isVerificationLocked(user.phoneVerification)) {
      const record = buildPhoneVerificationReminderRecord({
        userId: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        destination: user.mobile,
        channel: "sms",
        status: "skipped",
        provider: PHONE_VERIFICATION_MODE,
        reason: "Verification is temporarily locked.",
        actor,
        createdAt: now,
        sourceReminder
      });
      db.phoneVerificationReminders.push(record);
      results.push(record);
    } else {
      const previousState = normalizePhoneVerificationState(user.phoneVerification);
      let challengeCode = "";
      let challengeCreated = false;

      if (hasActivePhoneVerificationChallenge(user)) {
        challengeCode = normalizePhoneVerificationState(user.phoneVerification).pendingCode;
      } else {
        const challenge = createPhoneVerificationChallenge(user);
        if (!challenge.ok) {
          const record = buildPhoneVerificationReminderRecord({
            userId: user.id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            destination: user.mobile,
            channel: "sms",
            status: challenge.status === 429 ? "skipped" : "failed",
            provider: PHONE_VERIFICATION_MODE,
            reason: challenge.message,
            actor,
            createdAt: now,
            sourceReminder
          });
          db.phoneVerificationReminders.push(record);
          results.push(record);
        } else {
          challengeCode = challenge.code;
          challengeCreated = true;
        }
      }

      if (challengeCode) {
        const delivery = await sendPhoneVerificationCode(user, challengeCode);
        if (!delivery.ok && challengeCreated) {
          user.phoneVerification = previousState;
        }
        const delivered = Boolean(delivery && delivery.ok && delivery.delivery && delivery.delivery.delivered);
        const status = delivered
          ? "sent"
          : delivery && delivery.ok
            ? String(delivery.delivery && delivery.delivery.status ? delivery.delivery.status : "queued")
            : "failed";
        const record = buildPhoneVerificationReminderRecord({
          userId: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          destination: user.mobile,
          channel: "sms",
          status,
          provider: delivery && delivery.delivery && delivery.delivery.provider ? delivery.delivery.provider : PHONE_VERIFICATION_MODE,
          error: delivery && !delivery.ok ? delivery.message : "",
          actor,
          createdAt: now,
          sentAt: delivered ? now : null,
          sourceReminder
        });
        db.phoneVerificationReminders.push(record);
        results.push(record);
        smsSent = delivered;
      }
    }
  }

  if (channels.includes("email")) {
    if (!isValidEmail(user.email)) {
      const record = buildPhoneVerificationReminderRecord({
        userId: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        destination: user.email || "",
        channel: "email",
        status: "failed",
        provider: "email",
        error: "A valid email address is required.",
        actor,
        createdAt: now,
        sourceReminder
      });
      db.phoneVerificationReminders.push(record);
      results.push(record);
    } else {
      try {
        const payload = buildPhoneVerificationReminderPayload(user, {
          mobileMasked: publicView.mobileMasked,
          smsSent,
          lockedUntil: publicView.lockedUntil
        });
        const delivery = await sendNotificationPayload("email", user, payload);
        const record = buildPhoneVerificationReminderRecord({
          userId: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          destination: user.email,
          channel: "email",
          status: String(delivery.status || "queued"),
          provider: String(delivery.provider || "email"),
          subject: payload.subject,
          actor,
          createdAt: now,
          sentAt: delivery.delivered ? now : null,
          sourceReminder
        });
        db.phoneVerificationReminders.push(record);
        results.push(record);
      } catch (error) {
        const payload = buildPhoneVerificationReminderPayload(user, {
          mobileMasked: publicView.mobileMasked,
          smsSent,
          lockedUntil: publicView.lockedUntil
        });
        const record = buildPhoneVerificationReminderRecord({
          userId: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          destination: user.email,
          channel: "email",
          status: "failed",
          provider: "email",
          subject: payload.subject,
          error: String(error && error.message ? error.message : "Email delivery failed."),
          actor,
          createdAt: now,
          sourceReminder
        });
        db.phoneVerificationReminders.push(record);
        results.push(record);
      }
    }
  }

  const summary = summarizeReminderResults(results);
  return {
    ok: summary.deliveredCount > 0 || summary.queuedCount > 0 || summary.skippedCount > 0,
    status: summary.failedCount > 0 && summary.deliveredCount === 0 && summary.queuedCount === 0 && summary.skippedCount === 0 ? 500 : 200,
    message: buildReminderSummaryMessage(summary),
    reminders: results,
    ...summary
  };
}

async function retryPhoneVerificationReminder(db, reminder, options = {}) {
  ensurePhoneVerificationReminderCollection(db);
  const sourceReminder = normalizePhoneVerificationReminderRecord(reminder);
  if (sourceReminder.status !== "failed" || sourceReminder.retryEligible !== true || sourceReminder.retryProcessedAt) {
    return {
      ok: false,
      status: 409,
      message: "Reminder is not eligible for retry.",
      reminders: [],
      deliveredCount: 0,
      queuedCount: 0,
      failedCount: 0,
      skippedCount: 0,
      affectedUsers: 0
    };
  }

  const actor = String(options.actor || "automation");
  const processedAt = new Date().toISOString();
  markPhoneVerificationReminderRetryProcessed(db, sourceReminder.id, processedAt);
  const user = (db.users || []).find((item) => String(item && item.id ? item.id : "") === sourceReminder.userId);

  if (!user) {
    const record = buildPhoneVerificationReminderRecord({
      userId: sourceReminder.userId,
      name: sourceReminder.name,
      email: sourceReminder.email,
      mobile: sourceReminder.mobile,
      destination: sourceReminder.destination,
      channel: sourceReminder.channel,
      status: "failed",
      provider: sourceReminder.provider || "system",
      error: "User not found for retry.",
      actor,
      createdAt: processedAt,
      sourceReminder
    });
    db.phoneVerificationReminders.push(record);
    const summary = summarizeReminderResults([record]);
    return {
      ok: false,
      status: 404,
      message: buildReminderSummaryMessage(summary),
      reminders: [record],
      ...summary
    };
  }

  if (isPhoneVerifiedForCurrentMobile(user)) {
    const record = buildPhoneVerificationReminderRecord({
      userId: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      destination: sourceReminder.channel === "email" ? user.email : user.mobile,
      channel: sourceReminder.channel,
      status: "skipped",
      provider: sourceReminder.provider || "system",
      reason: "Phone already verified. Retry cancelled.",
      actor,
      createdAt: processedAt,
      sourceReminder
    });
    db.phoneVerificationReminders.push(record);
    const summary = summarizeReminderResults([record]);
    return {
      ok: true,
      status: 200,
      message: buildReminderSummaryMessage(summary),
      reminders: [record],
      ...summary
    };
  }

  const result = await sendPhoneVerificationReminder(db, user, {
    channels: [sourceReminder.channel],
    actor,
    force: true,
    sourceReminder
  });

  if (Array.isArray(result.reminders) && result.reminders.length) {
    return result;
  }

  const fallbackRecord = buildPhoneVerificationReminderRecord({
    userId: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    destination: sourceReminder.channel === "email" ? user.email : user.mobile,
    channel: sourceReminder.channel,
    status: result.ok ? "queued" : "failed",
    provider: sourceReminder.provider || "system",
    error: result.ok ? "" : String(result.message || "Retry execution failed."),
    reason: result.ok ? String(result.message || "Retry queued.") : "",
    actor,
    createdAt: processedAt,
    sentAt: result.ok ? processedAt : null,
    sourceReminder
  });
  db.phoneVerificationReminders.push(fallbackRecord);
  const summary = summarizeReminderResults([fallbackRecord]);
  return {
    ok: result.ok,
    status: Number(result.status || (result.ok ? 200 : 500)),
    message: buildReminderSummaryMessage(summary),
    reminders: [fallbackRecord],
    ...summary
  };
}

async function runPhoneVerificationReminderAutomation(db, options = {}) {
  ensurePhoneVerificationReminderCollection(db);
  const limit = Math.max(1, Math.min(200, Number(options.limit || PHONE_VERIFICATION_REMINDER_BATCH_LIMIT)));
  const channels = Array.isArray(options.channels) && options.channels.length
    ? options.channels
    : ["sms", "email"];
  const retryQueue = listDuePhoneVerificationRetryReminders(db, {
    channels,
    limit
  });
  const retryCount = retryQueue.length;
  const remainingLimit = Math.max(0, limit - retryCount);
  const candidates = remainingLimit > 0
    ? listPhoneVerificationReminderCandidates(db).filter((item) => item.eligibleNow).slice(0, remainingLimit)
    : [];

  if (!retryQueue.length && !candidates.length) {
    return {
      ok: true,
      status: 200,
      message: "No eligible users or due failed retries need a phone verification reminder right now.",
      reminders: [],
      deliveredCount: 0,
      queuedCount: 0,
      failedCount: 0,
      skippedCount: 0,
      affectedUsers: 0,
      retryCount: 0,
      pendingRetryCount: listPendingPhoneVerificationRetryReminders(db, { channels }).length
    };
  }

  const allResults = [];
  for (const reminder of retryQueue) {
    const result = await retryPhoneVerificationReminder(db, reminder, {
      actor: options.actor || "admin"
    });
    if (Array.isArray(result.reminders)) {
      allResults.push(...result.reminders);
    }
  }

  for (const candidate of candidates) {
    const user = (db.users || []).find((item) => String(item && item.id ? item.id : "") === candidate.id);
    if (!user) {
      continue;
    }
    const result = await sendPhoneVerificationReminder(db, user, {
      channels,
      actor: options.actor || "admin"
    });
    if (Array.isArray(result.reminders)) {
      allResults.push(...result.reminders);
    }
  }

  const summary = summarizeReminderResults(allResults);
  const pendingRetryCount = listPendingPhoneVerificationRetryReminders(db, { channels }).length;
  const message = buildReminderSummaryMessage(summary);
  return {
    ok: summary.deliveredCount > 0 || summary.queuedCount > 0 || summary.skippedCount > 0,
    status: summary.failedCount > 0 && summary.deliveredCount === 0 && summary.queuedCount === 0 && summary.skippedCount === 0 ? 500 : 200,
    message: retryCount > 0 || pendingRetryCount > 0
      ? `${message} Retries processed ${retryCount}${pendingRetryCount > 0 ? ` • ${pendingRetryCount} still queued` : ""}.`
      : message,
    reminders: allResults,
    retryCount,
    pendingRetryCount,
    newCandidateCount: candidates.length,
    ...summary
  };
}

module.exports = {
  PHONE_VERIFICATION_REMINDER_BATCH_LIMIT,
  PHONE_VERIFICATION_REMINDER_MAX_ATTEMPTS,
  buildPhoneVerificationAutomationHistorySummary,
  buildPhoneVerificationAutomationRunRecord,
  buildPhoneVerificationReminderRecord,
  defaultPhoneVerificationAutomationJobState,
  ensurePhoneVerificationAutomationJobState,
  ensurePhoneVerificationAutomationRunHistory,
  ensurePhoneVerificationReminderCollection,
  getPhoneVerificationAutomationSnapshot,
  listDuePhoneVerificationRetryReminders,
  listPhoneVerificationReminderCandidates,
  listPhoneVerificationAutomationRuns,
  listPendingPhoneVerificationRetryReminders,
  normalizePhoneVerificationAutomationRunEntry,
  normalizePhoneVerificationReminderRecord,
  retryPhoneVerificationReminder,
  runPhoneVerificationReminderAutomation,
  sendPhoneVerificationReminder
};
