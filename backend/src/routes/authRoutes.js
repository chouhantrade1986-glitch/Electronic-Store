const express = require("express");
const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");
const { readDb, writeDb } = require("../lib/db");
const { signToken } = require("../lib/auth");
const { requireAuth } = require("../middleware/authMiddleware");
const { createMemoryRateLimiter, resolveClientIp } = require("../middleware/rateLimitMiddleware");
const {
  appendAuthActivity,
  authActivityPublicView,
  defaultSecurityPreferences,
  normalizeSecurityPreferences,
  normalizeSessionVersion
} = require("../lib/authSecurity");
const { normalizeNotificationPreferences } = require("../lib/notificationPreferences");
const { sendTestNotification } = require("../lib/orderNotifications");
const {
  SEEDED_DEMO_USER_BLOCK_MESSAGE,
  isSeededDemoUserBlocked
} = require("../lib/demoUsers");
const {
  createOrPromoteRealAdmin,
  hasRealAdminAccount
} = require("../lib/adminAccounts");
const {
  AUTH_OTP_REQUEST_COOLDOWN_MS,
  createAuthOtpChallenge,
  normalizeAuthOtpChannel,
  normalizePendingUserDraft,
  verifyAuthOtpChallenge
} = require("../lib/authOtp");
const {
  PHONE_VERIFICATION_MODE,
  clearPhoneVerificationChallenge,
  createPhoneVerificationChallenge,
  isPhoneVerifiedForCurrentMobile,
  isValidPhone,
  normalizePhone,
  normalizePhoneVerificationState,
  phoneVerificationPublicView,
  sendPhoneVerificationCode,
  verifyPhoneCode
} = require("../lib/phoneVerification");
const { logInfo } = require("../lib/logger");

const router = express.Router();
const PASSWORD_AUTH_FALLBACK_ENABLED = String(process.env.ALLOW_PASSWORD_AUTH_FALLBACK || "").trim().toLowerCase() === "true";
const ADMIN_BOOTSTRAP_SECRET = String(process.env.ADMIN_BOOTSTRAP_SECRET || "").trim();
const AUTH_IP_WINDOW_MS = 15 * 60 * 1000;

function authRequestIdentifier(req) {
  const body = req && req.body && typeof req.body === "object" ? req.body : {};
  const purpose = String(body.purpose || "").trim().toLowerCase() || "login";
  const channel = normalizeAuthOtpChannel(body.channel);
  let identifier = "";

  if (purpose === "register") {
    identifier = channel === "sms"
      ? normalizePhone(body.mobile || "")
      : normalizeEmail(body.email || "");
  } else if (req && req.path && req.path.includes("password-reset")) {
    identifier = channel === "sms"
      ? normalizePhone(body.emailOrMobile || "")
      : normalizeEmail(body.emailOrMobile || "");
  } else {
    identifier = normalizeLoginIdentifier(body.emailOrMobile || "", channel);
  }

  return `${resolveClientIp(req)}|${purpose}|${identifier || "unknown"}`;
}

function authVerifyIdentifier(req) {
  const body = req && req.body && typeof req.body === "object" ? req.body : {};
  const purpose = String(body.purpose || "").trim().toLowerCase() || "login";
  const challengeId = String(body.challengeId || "").trim();
  const identifier = String(body.emailOrMobile || "").trim().toLowerCase();
  return `${resolveClientIp(req)}|${purpose}|${challengeId || identifier || "unknown"}`;
}

const adminBootstrapLimiter = createMemoryRateLimiter({
  namespace: "auth-admin-bootstrap",
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many admin bootstrap attempts. Please try again later."
});

const authOtpRequestLimiter = createMemoryRateLimiter({
  namespace: "auth-otp-request",
  windowMs: AUTH_IP_WINDOW_MS,
  max: 8,
  keyGenerator: authRequestIdentifier,
  message: "Too many OTP requests for this account. Please wait before trying again."
});

const authOtpVerifyLimiter = createMemoryRateLimiter({
  namespace: "auth-otp-verify",
  windowMs: AUTH_IP_WINDOW_MS,
  max: 18,
  keyGenerator: authVerifyIdentifier,
  message: "Too many OTP verification attempts. Please wait before trying again."
});

const passwordResetRequestLimiter = createMemoryRateLimiter({
  namespace: "password-reset-request",
  windowMs: AUTH_IP_WINDOW_MS,
  max: 6,
  keyGenerator: authRequestIdentifier,
  message: "Too many password reset requests. Please wait before trying again."
});

const passwordResetConfirmLimiter = createMemoryRateLimiter({
  namespace: "password-reset-confirm",
  windowMs: AUTH_IP_WINDOW_MS,
  max: 12,
  keyGenerator: authVerifyIdentifier,
  message: "Too many password reset attempts. Please wait before trying again."
});

const phoneVerificationRequestLimiter = createMemoryRateLimiter({
  namespace: "phone-verification-request",
  windowMs: AUTH_IP_WINDOW_MS,
  max: 6,
  keyGenerator: (req) => `${resolveClientIp(req)}|${String(req && req.user && req.user.id ? req.user.id : "guest")}`,
  message: "Too many phone verification requests. Please wait before trying again."
});

const phoneVerificationConfirmLimiter = createMemoryRateLimiter({
  namespace: "phone-verification-confirm",
  windowMs: AUTH_IP_WINDOW_MS,
  max: 12,
  keyGenerator: (req) => `${resolveClientIp(req)}|${String(req && req.user && req.user.id ? req.user.id : "guest")}`,
  message: "Too many phone verification attempts. Please wait before trying again."
});

const changePasswordLimiter = createMemoryRateLimiter({
  namespace: "account-change-password",
  windowMs: AUTH_IP_WINDOW_MS,
  max: 8,
  keyGenerator: (req) => `${resolveClientIp(req)}|${String(req && req.user && req.user.id ? req.user.id : "guest")}`,
  message: "Too many password change attempts. Please wait before trying again."
});

const logoutAllLimiter = createMemoryRateLimiter({
  namespace: "account-logout-all",
  windowMs: AUTH_IP_WINDOW_MS,
  max: 5,
  keyGenerator: (req) => `${resolveClientIp(req)}|${String(req && req.user && req.user.id ? req.user.id : "guest")}`,
  message: "Too many session reset attempts. Please wait before trying again."
});

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

function normalizeLoginIdentifier(value, channel) {
  const normalizedChannel = normalizeAuthOtpChannel(channel);
  return normalizedChannel === "sms"
    ? normalizePhone(value || "")
    : normalizeEmail(value || "");
}

function mapOtpChannelToClient(channel) {
  return normalizeAuthOtpChannel(channel) === "sms" ? "mobile" : "email";
}

function findUserByIdentifier(db, identifier) {
  const raw = String(identifier || "").trim();
  const normalizedEmail = normalizeEmail(raw);
  const normalizedMobile = normalizePhone(raw);
  return db.users.find(
    (item) =>
      item.email.toLowerCase() === normalizedEmail ||
      normalizePhone(item.mobile) === normalizedMobile
  ) || null;
}

function buildOtpResponse(result, channel) {
  const challenge = result.challenge || {};
  const requestedAt = new Date(challenge.lastRequestedAt || challenge.createdAt || 0).getTime();
  const resendAvailableAt = result.resendAvailableAt || (Number.isFinite(requestedAt)
    ? new Date(requestedAt + AUTH_OTP_REQUEST_COOLDOWN_MS).toISOString()
    : null);
  return {
    message: result.message,
    challengeId: challenge.id || "",
    channel: mapOtpChannelToClient(channel),
    destinationMasked: challenge.destinationMasked || "",
    expiresAt: challenge.expiresAt || "",
    resendAvailableAt,
    otpPreview: result.otpPreview
  };
}

function rejectLegacyPasswordAuth(res) {
  return res.status(410).json({
    message: "Password-only auth is disabled. Use /auth/otp/request and /auth/otp/verify, or explicitly enable ALLOW_PASSWORD_AUTH_FALLBACK=true for legacy tooling."
  });
}

function rejectBlockedSeededDemoUser(res) {
  return res.status(403).json({ message: SEEDED_DEMO_USER_BLOCK_MESSAGE });
}

function rejectInvalidBootstrapSecret(res) {
  return res.status(403).json({ message: "Invalid admin bootstrap secret." });
}

function authUserPayload(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    address: user.address,
    notificationPreferences: normalizeNotificationPreferences(user.notificationPreferences),
    securityPreferences: normalizeSecurityPreferences(user.securityPreferences || defaultSecurityPreferences()),
    phoneVerification: phoneVerificationPublicView(user)
  };
}

function recordAuthEvent(req, user, eventKey, eventLabel, note = "", actor = "user") {
  if (!user) {
    return;
  }
  appendAuthActivity(user, {
    eventKey,
    eventLabel,
    note,
    actor,
    ip: resolveClientIp(req),
    userAgent: String(req && req.headers && req.headers["user-agent"] ? req.headers["user-agent"] : "").trim(),
    createdAt: new Date().toISOString()
  });
}

router.post("/admin/bootstrap", adminBootstrapLimiter, (req, res) => {
  if (!ADMIN_BOOTSTRAP_SECRET) {
    return res.status(503).json({
      message: "ADMIN_BOOTSTRAP_SECRET is not configured on the backend."
    });
  }

  const providedSecret = String(
    (req.body && req.body.bootstrapSecret)
    || req.headers["x-admin-bootstrap-secret"]
    || ""
  ).trim();
  if (!providedSecret || providedSecret !== ADMIN_BOOTSTRAP_SECRET) {
    return rejectInvalidBootstrapSecret(res);
  }

  const db = readDb();
  if (hasRealAdminAccount(db)) {
    return res.status(409).json({
      message: "A real admin account already exists. Use an authenticated admin-management flow instead."
    });
  }

  const result = createOrPromoteRealAdmin(db, req.body || {}, {
    promoteExisting: Boolean(req.body && req.body.promoteExisting)
  });
  if (!result.ok) {
    return res.status(result.status || 400).json({ message: result.message });
  }

  recordAuthEvent(req, result.user, "admin_bootstrap", "Admin account bootstrapped", "", "system");
  writeDb(db);
  const token = signToken(result.user);
  return res.status(result.status || 201).json({
    message: result.message,
    token,
    user: authUserPayload(result.user),
    created: result.created === true,
    promoted: result.promoted === true
  });
});

router.post("/otp/request", authOtpRequestLimiter, async (req, res) => {
  const { purpose, channel } = req.body || {};
  const normalizedPurpose = String(purpose || "").trim().toLowerCase() === "register" ? "register" : "login";
  const normalizedChannel = normalizeAuthOtpChannel(channel);
  const db = readDb();

  if (normalizedPurpose === "register") {
    const { name, email, mobile, password, address } = req.body || {};
    const nextEmail = normalizeEmail(email);
    const nextMobile = normalizePhone(mobile);

    if (!name || !nextEmail || !nextMobile || !password || !address) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (!isValidEmail(nextEmail)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    if (!isValidPhone(nextMobile)) {
      return res.status(400).json({ message: "Enter a valid mobile number." });
    }

    const exists = db.users.some(
      (user) => user.email.toLowerCase() === nextEmail || normalizePhone(user.mobile) === nextMobile
    );
    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    const pendingUser = normalizePendingUserDraft({
      name,
      email: nextEmail,
      mobile: nextMobile,
      address,
      passwordHash: bcrypt.hashSync(String(password), 10)
    });
    const destination = normalizedChannel === "sms" ? nextMobile : nextEmail;
    const result = await createAuthOtpChallenge(db, {
      purpose: "register",
      channel: normalizedChannel,
      destination,
      identifier: destination,
      pendingUser
    });
    writeDb(db);
    if (!result.ok) {
      return res.status(result.status || 400).json({
        message: result.message,
        resendAvailableAt: result.resendAvailableAt || null
      });
    }
    const otpResponse = buildOtpResponse(result, normalizedChannel);
    logInfo("auth_otp_requested", {
      purpose: "register",
      channel: normalizedChannel,
      challengeId: otpResponse.challengeId
    }, {
      requestId: req.requestId
    });
    return res.json(otpResponse);
  }

  const { emailOrMobile, password } = req.body || {};
  if (!emailOrMobile || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  const identifier = normalizeLoginIdentifier(emailOrMobile, normalizedChannel);
  const user = findUserByIdentifier(db, identifier);
  if (isSeededDemoUserBlocked(user)) {
    return rejectBlockedSeededDemoUser(res);
  }
  if (!user || !bcrypt.compareSync(String(password), user.passwordHash)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const destination = normalizedChannel === "sms"
    ? normalizePhone(user.mobile)
    : normalizeEmail(user.email);
  const result = await createAuthOtpChallenge(db, {
    purpose: "login",
    channel: normalizedChannel,
    destination,
    identifier,
    userId: user.id
  });
  writeDb(db);
  if (!result.ok) {
    return res.status(result.status || 400).json({
      message: result.message,
      resendAvailableAt: result.resendAvailableAt || null
    });
  }
  const otpResponse = buildOtpResponse(result, normalizedChannel);
  logInfo("auth_otp_requested", {
    purpose: "login",
    channel: normalizedChannel,
    userId: user.id,
    challengeId: otpResponse.challengeId
  }, {
    requestId: req.requestId
  });
  return res.json(otpResponse);
});

router.post("/otp/verify", authOtpVerifyLimiter, (req, res) => {
  const { purpose, challengeId, code, emailOrMobile, password } = req.body || {};
  const normalizedPurpose = String(purpose || "").trim().toLowerCase() === "register" ? "register" : "login";
  const db = readDb();
  const result = verifyAuthOtpChallenge(db, {
    purpose: normalizedPurpose,
    challengeId,
    code
  });

  if (!result.ok) {
    writeDb(db);
    return res.status(result.status || 400).json({ message: result.message });
  }

  if (normalizedPurpose === "register") {
    const pendingUser = normalizePendingUserDraft(result.challenge && result.challenge.pendingUser);
    if (!pendingUser.name || !pendingUser.email || !pendingUser.mobile || !pendingUser.address || !pendingUser.passwordHash) {
      writeDb(db);
      return res.status(409).json({ message: "Registration details are incomplete. Request a new OTP." });
    }

    const exists = db.users.some(
      (user) => user.email.toLowerCase() === pendingUser.email || normalizePhone(user.mobile) === pendingUser.mobile
    );
    if (exists) {
      writeDb(db);
      return res.status(409).json({ message: "User already exists" });
    }

    const user = {
      id: randomUUID(),
      name: pendingUser.name,
      email: pendingUser.email,
      mobile: pendingUser.mobile,
      passwordHash: pendingUser.passwordHash,
      role: "customer",
      address: pendingUser.address,
      notificationPreferences: normalizeNotificationPreferences({}),
      securityPreferences: normalizeSecurityPreferences({}),
      sessionVersion: normalizeSessionVersion(1),
      authActivity: [],
      phoneVerification: normalizePhoneVerificationState({})
    };

    recordAuthEvent(req, user, "register", "Account created", "", "user");
    db.users.push(user);
    writeDb(db);
    const token = signToken(user);
    logInfo("auth_otp_verified", {
      purpose: "register",
      userId: user.id,
      role: user.role
    }, {
      requestId: req.requestId
    });
    return res.status(201).json({
      token,
      user: authUserPayload(user)
    });
  }

  if (!emailOrMobile || !password) {
    writeDb(db);
    return res.status(400).json({ message: "Missing credentials" });
  }

  const user = findUserByIdentifier(db, emailOrMobile);
  if (!user) {
    writeDb(db);
    return res.status(404).json({ message: "User not found" });
  }
  if (isSeededDemoUserBlocked(user)) {
    writeDb(db);
    return rejectBlockedSeededDemoUser(res);
  }
  if (user.id !== result.challenge.userId || !bcrypt.compareSync(String(password), user.passwordHash)) {
    writeDb(db);
    return res.status(401).json({ message: "Invalid credentials" });
  }

  recordAuthEvent(req, user, "login", "OTP sign-in", "", "user");
  writeDb(db);
  const token = signToken(user);
  logInfo("auth_otp_verified", {
    purpose: "login",
    userId: user.id,
    role: user.role
  }, {
    requestId: req.requestId
  });
  return res.json({
    token,
    user: authUserPayload(user)
  });
});

router.post("/password-reset/request", passwordResetRequestLimiter, async (req, res) => {
  const { channel, emailOrMobile } = req.body || {};
  const normalizedChannel = normalizeAuthOtpChannel(channel);
  const identifier = normalizeLoginIdentifier(emailOrMobile, normalizedChannel);

  if (!identifier) {
    return res.status(400).json({ message: "Enter your email or mobile number." });
  }

  if (normalizedChannel === "email" && !isValidEmail(identifier)) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }
  if (normalizedChannel === "sms" && !isValidPhone(identifier)) {
    return res.status(400).json({ message: "Enter a valid mobile number." });
  }

  const db = readDb();
  const user = findUserByIdentifier(db, identifier);
  if (!user) {
    return res.status(404).json({ message: "No account found for this email or mobile number." });
  }
  if (isSeededDemoUserBlocked(user)) {
    return rejectBlockedSeededDemoUser(res);
  }

  const destination = normalizedChannel === "sms"
    ? normalizePhone(user.mobile)
    : normalizeEmail(user.email);
  const result = await createAuthOtpChallenge(db, {
    purpose: "reset-password",
    channel: normalizedChannel,
    destination,
    identifier,
    userId: user.id
  });
  writeDb(db);
  if (!result.ok) {
    return res.status(result.status || 400).json({
      message: result.message,
      resendAvailableAt: result.resendAvailableAt || null
    });
  }
  return res.json(buildOtpResponse(result, normalizedChannel));
});

router.post("/password-reset/confirm", passwordResetConfirmLimiter, (req, res) => {
  const { channel, emailOrMobile, challengeId, code, newPassword } = req.body || {};
  const normalizedChannel = normalizeAuthOtpChannel(channel);
  const identifier = normalizeLoginIdentifier(emailOrMobile, normalizedChannel);

  if (!identifier) {
    return res.status(400).json({ message: "Enter your email or mobile number." });
  }
  if (!newPassword || String(newPassword).trim().length < 6) {
    return res.status(400).json({ message: "Enter a new password with at least 6 characters." });
  }

  const db = readDb();
  const result = verifyAuthOtpChallenge(db, {
    purpose: "reset-password",
    challengeId,
    code
  });

  if (!result.ok) {
    writeDb(db);
    return res.status(result.status || 400).json({ message: result.message });
  }

  const user = findUserByIdentifier(db, identifier);
  if (!user) {
    writeDb(db);
    return res.status(404).json({ message: "Account not found. Request a new OTP." });
  }
  if (isSeededDemoUserBlocked(user)) {
    writeDb(db);
    return rejectBlockedSeededDemoUser(res);
  }
  if (user.id !== result.challenge.userId) {
    writeDb(db);
    return res.status(401).json({ message: "This reset OTP does not match the selected account." });
  }

  user.passwordHash = bcrypt.hashSync(String(newPassword), 10);
  user.sessionVersion = normalizeSessionVersion((user.sessionVersion || 1) + 1);
  recordAuthEvent(req, user, "password_reset", "Password reset", "Password updated via OTP.", "user");
  writeDb(db);
  return res.json({
    message: "Password reset successful. Sign in with your new password.",
    destinationMasked: normalizedChannel === "sms" ? user.mobile : user.email
  });
});

router.post("/register", (req, res) => {
  if (!PASSWORD_AUTH_FALLBACK_ENABLED) {
    return rejectLegacyPasswordAuth(res);
  }

  const { name, email, mobile, password, address } = req.body || {};

  if (!name || !email || !mobile || !password || !address) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const db = readDb();
  const exists = db.users.some(
    (user) => user.email.toLowerCase() === String(email).toLowerCase() || user.mobile === String(mobile)
  );

  if (exists) {
    return res.status(409).json({ message: "User already exists" });
  }

  const user = {
    id: randomUUID(),
    name: String(name),
    email: String(email).toLowerCase(),
    mobile: String(mobile),
    passwordHash: bcrypt.hashSync(String(password), 10),
    role: "customer",
    address: String(address),
    notificationPreferences: normalizeNotificationPreferences({}),
    securityPreferences: normalizeSecurityPreferences({}),
    sessionVersion: normalizeSessionVersion(1),
    authActivity: [],
    phoneVerification: normalizePhoneVerificationState({})
  };

  recordAuthEvent(req, user, "register", "Account created", "", "user");
  db.users.push(user);
  writeDb(db);

  const token = signToken(user);
  return res.status(201).json({
    token,
    user: authUserPayload(user)
  });
});

router.post("/login", (req, res) => {
  if (!PASSWORD_AUTH_FALLBACK_ENABLED) {
    return rejectLegacyPasswordAuth(res);
  }

  const { emailOrMobile, password } = req.body || {};
  if (!emailOrMobile || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  const db = readDb();
  const user = db.users.find(
    (item) =>
      item.email.toLowerCase() === String(emailOrMobile).toLowerCase() ||
      item.mobile === String(emailOrMobile)
  );

  if (isSeededDemoUserBlocked(user)) {
    return rejectBlockedSeededDemoUser(res);
  }
  if (!user || !bcrypt.compareSync(String(password), user.passwordHash)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  recordAuthEvent(req, user, "login", "Password sign-in", "", "user");
  const token = signToken(user);
  return res.json({
    token,
    user: authUserPayload(user)
  });
});

router.get("/me", requireAuth, (req, res) => {
  const db = readDb();
  const user = db.users.find((item) => item.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json(authUserPayload(user));
});

router.get("/security", requireAuth, (req, res) => {
  const db = readDb();
  const user = db.users.find((item) => item.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({
    securityPreferences: normalizeSecurityPreferences(user.securityPreferences || defaultSecurityPreferences()),
    recentAuthActivity: authActivityPublicView(user, 12)
  });
});

router.patch("/security-preferences", requireAuth, (req, res) => {
  const db = readDb();
  const user = db.users.find((item) => item.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.securityPreferences = normalizeSecurityPreferences({
    ...(user.securityPreferences || defaultSecurityPreferences()),
    ...(req.body || {})
  });
  recordAuthEvent(req, user, "security_preferences", "Security settings updated", "", "user");
  writeDb(db);
  return res.json({
    message: "Security settings saved.",
    securityPreferences: user.securityPreferences,
    recentAuthActivity: authActivityPublicView(user, 12)
  });
});

router.post("/change-password", requireAuth, changePasswordLimiter, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current password and new password are required." });
  }
  if (String(newPassword).trim().length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters long." });
  }
  if (String(currentPassword) === String(newPassword)) {
    return res.status(400).json({ message: "Choose a different password than your current password." });
  }

  const db = readDb();
  const user = db.users.find((item) => item.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if (!bcrypt.compareSync(String(currentPassword), user.passwordHash)) {
    return res.status(401).json({ message: "Current password is incorrect." });
  }

  user.passwordHash = bcrypt.hashSync(String(newPassword), 10);
  user.sessionVersion = normalizeSessionVersion((user.sessionVersion || 1) + 1);
  recordAuthEvent(req, user, "password_change", "Password changed", "", "user");
  writeDb(db);

  const token = signToken(user);
  return res.json({
    message: "Password updated successfully.",
    token,
    user: authUserPayload(user),
    recentAuthActivity: authActivityPublicView(user, 12)
  });
});

router.post("/logout-all", requireAuth, logoutAllLimiter, (req, res) => {
  const db = readDb();
  const user = db.users.find((item) => item.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.sessionVersion = normalizeSessionVersion((user.sessionVersion || 1) + 1);
  recordAuthEvent(req, user, "logout_all", "Signed out from all devices", "", "user");
  writeDb(db);
  return res.json({
    message: "All active sessions have been signed out.",
    recentAuthActivity: authActivityPublicView(user, 12)
  });
});

router.patch("/notification-preferences", requireAuth, (req, res) => {
  const db = readDb();
  const user = db.users.find((item) => item.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const nextPreferences = normalizeNotificationPreferences(req.body || user.notificationPreferences);
  if ((nextPreferences.smsEnabled || nextPreferences.whatsappEnabled) && !isPhoneVerifiedForCurrentMobile(user)) {
    return res.status(409).json({
      message: "Verify your phone number before enabling SMS or WhatsApp notifications.",
      phoneVerification: phoneVerificationPublicView(user)
    });
  }
  user.notificationPreferences = nextPreferences;
  writeDb(db);
  return res.json({
    notificationPreferences: user.notificationPreferences,
    phoneVerification: phoneVerificationPublicView(user)
  });
});

router.patch("/profile", requireAuth, (req, res) => {
  const { name, email, mobile, address } = req.body || {};
  const db = readDb();
  const user = db.users.find((item) => item.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const nextEmail = String(email || user.email).trim().toLowerCase();
  const nextMobile = normalizePhone(mobile || user.mobile);
  if (!name || !nextEmail || !nextMobile || !address) {
    return res.status(400).json({ message: "Name, email, mobile, and address are required." });
  }
  if (!isValidPhone(nextMobile)) {
    return res.status(400).json({ message: "Enter a valid phone number." });
  }

  const conflict = db.users.find((item) => {
    if (item.id === user.id) {
      return false;
    }
    return item.email.toLowerCase() === nextEmail || normalizePhone(item.mobile) === nextMobile;
  });
  if (conflict) {
    return res.status(409).json({ message: "Another account already uses this email or mobile number." });
  }

  const mobileChanged = normalizePhone(user.mobile) !== nextMobile;
  user.name = String(name).trim();
  user.email = nextEmail;
  user.mobile = nextMobile;
  user.address = String(address).trim();

  if (mobileChanged) {
    user.phoneVerification = clearPhoneVerificationChallenge(user.phoneVerification);
    user.phoneVerification.verifiedForMobile = "";
    user.phoneVerification.verifiedAt = null;
    user.notificationPreferences = normalizeNotificationPreferences({
      ...user.notificationPreferences,
      smsEnabled: false,
      whatsappEnabled: false
    });
  }

  writeDb(db);
  return res.json({
    message: mobileChanged
      ? "Profile saved. Phone verification was reset because your mobile number changed."
      : "Profile saved successfully.",
    user: authUserPayload(user)
  });
});

router.post("/phone-verification/request", requireAuth, phoneVerificationRequestLimiter, async (req, res) => {
  const db = readDb();
  const user = db.users.find((item) => item.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const previousVerificationState = normalizePhoneVerificationState(user.phoneVerification);
  const result = createPhoneVerificationChallenge(user);
  if (!result.ok) {
    return res.status(result.status || 400).json({
      message: result.message || "Unable to start phone verification.",
      phoneVerification: phoneVerificationPublicView(user)
    });
  }

  const delivery = await sendPhoneVerificationCode(user, result.code);
  if (!delivery.ok) {
    user.phoneVerification = previousVerificationState;
    return res.status(delivery.status || 500).json({
      message: delivery.message || "Unable to send verification code.",
      phoneVerification: phoneVerificationPublicView(user)
    });
  }

  writeDb(db);
  return res.json({
    message: delivery.message || "Verification code sent.",
    phoneVerification: phoneVerificationPublicView(user),
    otpPreview: PHONE_VERIFICATION_MODE === "simulated" ? delivery.otpPreview || result.code : undefined
  });
});

router.post("/phone-verification/confirm", requireAuth, phoneVerificationConfirmLimiter, (req, res) => {
  const { code } = req.body || {};
  const db = readDb();
  const user = db.users.find((item) => item.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const result = verifyPhoneCode(user, code);
  if (!result.ok) {
    if (result.status === 400 || result.status === 429) {
      writeDb(db);
    }
    return res.status(result.status || 400).json({
      message: result.message || "Unable to verify phone code.",
      phoneVerification: phoneVerificationPublicView(user)
    });
  }

  writeDb(db);
  return res.json({
    message: "Phone number verified successfully.",
    phoneVerification: phoneVerificationPublicView(user)
  });
});

router.post("/test-notification", requireAuth, async (req, res) => {
  const db = readDb();
  const user = db.users.find((item) => item.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const result = await sendTestNotification(db, user, {
    triggeredBy: "customer-test",
    triggeredFrom: "account-page"
  });
  writeDb(db);
  return res.status(result.status || (result.ok ? 200 : 500)).json({
    message: result.message,
    notification: result.notification || null
  });
});

module.exports = router;
