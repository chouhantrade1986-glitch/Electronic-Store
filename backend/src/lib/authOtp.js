const { randomUUID, randomInt } = require("crypto");
const { sendNotificationPayload } = require("./orderNotifications");
const { isValidPhone, maskPhone, normalizePhone } = require("./phoneVerification");

const AUTH_OTP_TTL_MS = Math.max(60 * 1000, Number(process.env.AUTH_OTP_TTL_MS || 10 * 60 * 1000));
const AUTH_OTP_REQUEST_COOLDOWN_MS = Math.max(
  15 * 1000,
  Number(process.env.AUTH_OTP_REQUEST_COOLDOWN_MS || 60 * 1000)
);
const AUTH_OTP_MAX_VERIFY_ATTEMPTS = Math.max(1, Number(process.env.AUTH_OTP_MAX_VERIFY_ATTEMPTS || 5));
const AUTH_OTP_HISTORY_LIMIT = Math.max(50, Math.min(500, Number(process.env.AUTH_OTP_HISTORY_LIMIT || 200)));

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

function maskEmail(value) {
  const normalized = normalizeEmail(value);
  const [localPart, domain] = normalized.split("@");
  if (!localPart || !domain) {
    return "N/A";
  }
  if (localPart.length <= 2) {
    return `${localPart[0] || "*"}*@${domain}`;
  }
  return `${localPart.slice(0, 2)}${"*".repeat(Math.max(2, localPart.length - 2))}@${domain}`;
}

function normalizeAuthOtpPurpose(value) {
  const purpose = String(value || "").trim().toLowerCase();
  if (purpose === "register") {
    return "register";
  }
  if (["reset-password", "password-reset", "forgot-password", "reset"].includes(purpose)) {
    return "reset-password";
  }
  return "login";
}

function normalizeAuthOtpChannel(value) {
  const channel = String(value || "email").trim().toLowerCase();
  if (channel === "sms" || channel === "mobile") {
    return "sms";
  }
  return "email";
}

function normalizePendingUserDraft(value = {}) {
  const source = value && typeof value === "object" ? value : {};
  return {
    name: String(source.name || "").trim(),
    email: normalizeEmail(source.email || ""),
    mobile: normalizePhone(source.mobile || ""),
    address: String(source.address || "").trim(),
    passwordHash: String(source.passwordHash || ""),
    role: "customer"
  };
}

function normalizeAuthOtpStatus(value) {
  const status = String(value || "pending").trim().toLowerCase();
  return ["pending", "used", "failed", "superseded", "expired"].includes(status) ? status : "pending";
}

function normalizeAuthOtpChallenge(value = {}) {
  const source = value && typeof value === "object" ? value : {};
  const channel = normalizeAuthOtpChannel(source.channel);
  const destination = channel === "email"
    ? normalizeEmail(source.destination || "")
    : normalizePhone(source.destination || "");

  return {
    id: String(source.id || randomUUID()),
    purpose: normalizeAuthOtpPurpose(source.purpose),
    channel,
    destination,
    destinationMasked: source.destinationMasked
      ? String(source.destinationMasked)
      : channel === "email"
        ? maskEmail(destination)
        : maskPhone(destination),
    identifier: String(source.identifier || "").trim().toLowerCase(),
    userId: String(source.userId || ""),
    pendingUser: normalizePendingUserDraft(source.pendingUser),
    code: source.code ? String(source.code) : "",
    createdAt: source.createdAt ? String(source.createdAt) : new Date().toISOString(),
    lastRequestedAt: source.lastRequestedAt ? String(source.lastRequestedAt) : null,
    expiresAt: source.expiresAt ? String(source.expiresAt) : null,
    attempts: Math.max(0, Number(source.attempts || 0)),
    maxAttempts: Math.max(1, Number(source.maxAttempts || AUTH_OTP_MAX_VERIFY_ATTEMPTS)),
    status: normalizeAuthOtpStatus(source.status),
    deliveryProvider: String(source.deliveryProvider || ""),
    deliveryStatus: String(source.deliveryStatus || ""),
    messageId: String(source.messageId || ""),
    sentAt: source.sentAt ? String(source.sentAt) : null,
    verifiedAt: source.verifiedAt ? String(source.verifiedAt) : null,
    invalidatedAt: source.invalidatedAt ? String(source.invalidatedAt) : null,
    error: String(source.error || "")
  };
}

function ensureAuthOtpCollection(db) {
  if (!Array.isArray(db.authOtpChallenges)) {
    db.authOtpChallenges = [];
  }
  db.authOtpChallenges = db.authOtpChallenges
    .map((item) => normalizeAuthOtpChallenge(item))
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, AUTH_OTP_HISTORY_LIMIT);
  return db.authOtpChallenges;
}

function getAuthOtpResendAvailableAt(challenge) {
  if (!challenge || !challenge.lastRequestedAt) {
    return null;
  }
  const requestedAt = new Date(challenge.lastRequestedAt).getTime();
  if (!Number.isFinite(requestedAt)) {
    return null;
  }
  const resendAt = requestedAt + AUTH_OTP_REQUEST_COOLDOWN_MS;
  return resendAt > Date.now() ? new Date(resendAt).toISOString() : null;
}

function isAuthOtpChallengeExpired(challenge) {
  if (!challenge || !challenge.expiresAt) {
    return true;
  }
  const expiresAt = new Date(challenge.expiresAt).getTime();
  return !Number.isFinite(expiresAt) || expiresAt <= Date.now();
}

function getActiveChallengeForContext(db, params = {}) {
  ensureAuthOtpCollection(db);
  const purpose = normalizeAuthOtpPurpose(params.purpose);
  const channel = normalizeAuthOtpChannel(params.channel);
  const userId = String(params.userId || "");
  const destination = channel === "email"
    ? normalizeEmail(params.destination || "")
    : normalizePhone(params.destination || "");
  const identifier = String(params.identifier || "").trim().toLowerCase();

  return db.authOtpChallenges.find((challenge) => {
    if (challenge.status !== "pending") {
      return false;
    }
    if (challenge.purpose !== purpose || challenge.channel !== channel) {
      return false;
    }
    if (userId && challenge.userId !== userId) {
      return false;
    }
    if (!userId && destination && challenge.destination !== destination) {
      return false;
    }
    if (identifier && challenge.identifier !== identifier) {
      return false;
    }
    return !isAuthOtpChallengeExpired(challenge);
  }) || null;
}

function buildAuthOtpPayload(challenge) {
  const purposeLabel = challenge.purpose === "register"
    ? "create your account"
    : challenge.purpose === "reset-password"
      ? "reset your password"
      : "sign in";
  const storeName = String(process.env.STORE_BRAND_NAME || "ElectroMart").trim() || "ElectroMart";
  const expiryMinutes = Math.max(1, Math.ceil(AUTH_OTP_TTL_MS / (60 * 1000)));
  const subject = `${storeName}: your ${purposeLabel} OTP`;
  const text = [
    `Your ${storeName} OTP to ${purposeLabel} is ${challenge.code}.`,
    `It expires in ${expiryMinutes} minute(s).`,
    "Do not share this code with anyone."
  ].join(" ");

  return {
    eventLabel: challenge.purpose === "register"
      ? "Registration OTP"
      : challenge.purpose === "reset-password"
        ? "Password Reset OTP"
        : "Sign-in OTP",
    subject,
    text,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <p style="margin:0 0 12px">Use the following OTP to ${purposeLabel}:</p>
        <p style="margin:0 0 16px;font-size:28px;font-weight:700;letter-spacing:4px">${challenge.code}</p>
        <p style="margin:0 0 12px">This code expires in ${expiryMinutes} minute(s).</p>
        <p style="margin:0;color:#475569">Do not share this code with anyone.</p>
      </div>
    `
  };
}

async function sendAuthOtpChallenge(challenge) {
  const recipient = challenge.channel === "email"
    ? { email: challenge.destination }
    : { mobile: challenge.destination };
  const payload = buildAuthOtpPayload(challenge);
  return sendNotificationPayload(challenge.channel, recipient, payload);
}

async function createAuthOtpChallenge(db, params = {}) {
  ensureAuthOtpCollection(db);
  const purpose = normalizeAuthOtpPurpose(params.purpose);
  const channel = normalizeAuthOtpChannel(params.channel);
  const destination = channel === "email"
    ? normalizeEmail(params.destination || "")
    : normalizePhone(params.destination || "");

  if (channel === "email" && !isValidEmail(destination)) {
    return { ok: false, status: 400, message: "A valid email address is required for OTP delivery." };
  }
  if (channel === "sms" && !isValidPhone(destination)) {
    return { ok: false, status: 400, message: "A valid mobile number is required for OTP delivery." };
  }

  const existing = getActiveChallengeForContext(db, {
    purpose,
    channel,
    destination,
    userId: params.userId,
    identifier: params.identifier
  });
  const resendAvailableAt = getAuthOtpResendAvailableAt(existing);
  if (resendAvailableAt) {
    return {
      ok: false,
      status: 429,
      message: "Please wait before requesting another OTP.",
      resendAvailableAt
    };
  }

  const nowIso = new Date().toISOString();
  db.authOtpChallenges = db.authOtpChallenges.map((item) => {
    if (
      item.status === "pending"
      && item.purpose === purpose
      && item.channel === channel
      && item.destination === destination
      && String(item.userId || "") === String(params.userId || "")
    ) {
      return normalizeAuthOtpChallenge({
        ...item,
        status: "superseded",
        invalidatedAt: nowIso
      });
    }
    return item;
  });

  const challenge = normalizeAuthOtpChallenge({
    id: randomUUID(),
    purpose,
    channel,
    destination,
    identifier: params.identifier,
    userId: params.userId,
    pendingUser: params.pendingUser,
    code: String(randomInt(0, 1000000)).padStart(6, "0"),
    createdAt: nowIso,
    lastRequestedAt: nowIso,
    expiresAt: new Date(Date.now() + AUTH_OTP_TTL_MS).toISOString(),
    attempts: 0,
    maxAttempts: AUTH_OTP_MAX_VERIFY_ATTEMPTS,
    status: "pending"
  });

  db.authOtpChallenges.unshift(challenge);
  db.authOtpChallenges = db.authOtpChallenges.slice(0, AUTH_OTP_HISTORY_LIMIT);

  try {
    const delivery = await sendAuthOtpChallenge(challenge);
    if (!delivery.delivered || delivery.provider === "disabled") {
      const index = db.authOtpChallenges.findIndex((item) => item.id === challenge.id);
      if (index >= 0) {
        db.authOtpChallenges[index] = normalizeAuthOtpChallenge({
          ...challenge,
          status: "failed",
          error: "OTP delivery is disabled for this channel.",
          deliveryProvider: String(delivery.provider || ""),
          deliveryStatus: String(delivery.status || "")
        });
      }
      return {
        ok: false,
        status: 503,
        message: "OTP delivery is currently disabled for this channel."
      };
    }

    const updated = normalizeAuthOtpChallenge({
      ...challenge,
      deliveryProvider: String(delivery.provider || ""),
      deliveryStatus: String(delivery.status || "sent"),
      messageId: String(delivery.messageId || ""),
      sentAt: nowIso
    });
    const index = db.authOtpChallenges.findIndex((item) => item.id === challenge.id);
    if (index >= 0) {
      db.authOtpChallenges[index] = updated;
    }

    return {
      ok: true,
      status: 200,
      message: challenge.purpose === "register"
        ? "Registration OTP sent."
        : challenge.purpose === "reset-password"
          ? "Password reset OTP sent."
          : "Sign-in OTP sent.",
      challenge: updated,
      otpPreview: delivery.provider === "simulated" ? challenge.code : undefined
    };
  } catch (error) {
    const index = db.authOtpChallenges.findIndex((item) => item.id === challenge.id);
    if (index >= 0) {
      db.authOtpChallenges[index] = normalizeAuthOtpChallenge({
        ...challenge,
        status: "failed",
        error: String(error && error.message ? error.message : "Unable to send OTP.")
      });
    }
    return {
      ok: false,
      status: 500,
      message: String(error && error.message ? error.message : "Unable to send OTP.")
    };
  }
}

function verifyAuthOtpChallenge(db, params = {}) {
  ensureAuthOtpCollection(db);
  const challengeId = String(params.challengeId || "").trim();
  const purpose = normalizeAuthOtpPurpose(params.purpose);
  const code = String(params.code || "").trim();

  if (!challengeId) {
    return { ok: false, status: 400, message: "Missing OTP challenge." };
  }
  if (!/^\d{6}$/.test(code)) {
    return { ok: false, status: 400, message: "Enter the 6-digit OTP." };
  }

  const index = db.authOtpChallenges.findIndex((item) => item.id === challengeId);
  if (index === -1) {
    return { ok: false, status: 404, message: "OTP challenge not found. Request a new OTP." };
  }

  const challenge = db.authOtpChallenges[index];
  if (challenge.purpose !== purpose) {
    return { ok: false, status: 400, message: "OTP challenge purpose mismatch." };
  }
  if (challenge.status === "used") {
    return { ok: false, status: 409, message: "This OTP has already been used. Request a new one." };
  }
  if (challenge.status === "superseded" || challenge.status === "expired" || challenge.status === "failed") {
    return { ok: false, status: 409, message: "This OTP is no longer active. Request a new one." };
  }
  if (isAuthOtpChallengeExpired(challenge)) {
    db.authOtpChallenges[index] = normalizeAuthOtpChallenge({
      ...challenge,
      status: "expired",
      invalidatedAt: new Date().toISOString()
    });
    return { ok: false, status: 400, message: "OTP expired. Request a new one." };
  }
  if (challenge.code !== code) {
    const nextAttempts = Number(challenge.attempts || 0) + 1;
    const failed = nextAttempts >= Number(challenge.maxAttempts || AUTH_OTP_MAX_VERIFY_ATTEMPTS);
    db.authOtpChallenges[index] = normalizeAuthOtpChallenge({
      ...challenge,
      attempts: nextAttempts,
      status: failed ? "failed" : "pending",
      error: failed ? "Too many incorrect OTP attempts." : ""
    });
    return {
      ok: false,
      status: failed ? 429 : 400,
      message: failed
        ? "Too many incorrect OTP attempts. Request a new OTP."
        : "Invalid OTP. Please try again."
    };
  }

  const verifiedAt = new Date().toISOString();
  const updated = normalizeAuthOtpChallenge({
    ...challenge,
    status: "used",
    verifiedAt
  });
  db.authOtpChallenges[index] = updated;
  return {
    ok: true,
    status: 200,
    challenge: updated
  };
}

module.exports = {
  AUTH_OTP_MAX_VERIFY_ATTEMPTS,
  AUTH_OTP_REQUEST_COOLDOWN_MS,
  AUTH_OTP_TTL_MS,
  createAuthOtpChallenge,
  ensureAuthOtpCollection,
  normalizeAuthOtpChannel,
  normalizeAuthOtpChallenge,
  normalizePendingUserDraft,
  verifyAuthOtpChallenge
};
