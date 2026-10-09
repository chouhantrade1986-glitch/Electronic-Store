const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");
const { appendAdminAuditEntry } = require("./adminAuditTrail");
const { findSeededDemoProfile } = require("./demoUsers");
const {
  normalizeAuthActivityList,
  normalizeSecurityPreferences,
  normalizeSessionVersion
} = require("./authSecurity");
const { normalizeNotificationPreferences } = require("./notificationPreferences");
const {
  isValidPhone,
  normalizePhone,
  normalizePhoneVerificationState
} = require("./phoneVerification");

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

const ADMIN_PASSWORD_MIN_LENGTH = 10;

function isStrongAdminPassword(value) {
  const password = String(value || "");
  return password.length >= ADMIN_PASSWORD_MIN_LENGTH
    && /[A-Z]/.test(password)
    && /[a-z]/.test(password)
    && /\d/.test(password);
}

function stripSeededDemoMetadata(user = {}) {
  const nextUser = { ...user };
  delete nextUser.seededDemoUser;
  delete nextUser.seededDemoProfileKey;
  delete nextUser.demoAccessDisabled;
  delete nextUser.demoAccessUpdatedAt;
  return nextUser;
}

function hasRealAdminAccount(db) {
  const users = Array.isArray(db && db.users) ? db.users : [];
  return users.some((user) => String(user && user.role ? user.role : "").trim().toLowerCase() === "admin"
    && user.seededDemoUser !== true);
}

function buildAdminDraft(input = {}) {
  return {
    name: String(input.name || "").trim(),
    email: normalizeEmail(input.email),
    mobile: normalizePhone(input.mobile),
    password: String(input.password || ""),
    address: String(input.address || "").trim()
  };
}

function changeUserRole(db, userId, nextRole, auditContext = {}) {
  const users = Array.isArray(db && db.users) ? db.users : [];
  const targetId = String(userId || "").trim();
  const normalizedNextRole = String(nextRole || "").trim().toLowerCase();
  const actorId = String(auditContext.actorId || "").trim();
  const actor = actorId ? users.find((item) => String(item && item.id ? item.id : "") === actorId) : null;
  const user = users.find((item) => String(item && item.id ? item.id : "") === targetId);

  if (actorId && (!actor || String(actor.role || "").trim().toLowerCase() !== "admin")) {
    return { ok: false, status: 403, message: "An active admin account is required to change user roles." };
  }
  if (!user) {
    return { ok: false, status: 404, message: "User not found." };
  }
  if (normalizedNextRole !== "admin" && normalizedNextRole !== "customer") {
    return { ok: false, status: 400, message: "Role must be either admin or customer." };
  }
  if (user.seededDemoUser === true || findSeededDemoProfile(user)) {
    return { ok: false, status: 409, message: "Seeded demo accounts cannot be assigned a different role." };
  }

  const previousRole = String(user.role || "").trim().toLowerCase();
  if (previousRole === normalizedNextRole) {
    return {
      ok: true,
      changed: false,
      previousRole,
      nextRole: normalizedNextRole,
      user
    };
  }

  if (previousRole === "admin" && normalizedNextRole !== "admin") {
    const otherRealAdmins = users.filter((item) => item !== user
      && String(item && item.role ? item.role : "").trim().toLowerCase() === "admin"
      && item.seededDemoUser !== true
      && !findSeededDemoProfile(item));
    if (otherRealAdmins.length === 0) {
      return {
        ok: false,
        status: 409,
        message: "The last real admin cannot be demoted. Promote another real admin first."
      };
    }
  }

  user.role = normalizedNextRole;
  user.sessionVersion = normalizeSessionVersion(user.sessionVersion) + 1;

  appendAdminAuditEntry(db, {
    category: "admin",
    actionKey: "admin_role_changed",
    actionLabel: "Admin account role changed",
    actorId: String(auditContext.actorId || "").trim(),
    actorEmail: normalizeEmail(auditContext.actorEmail),
    actorName: String(auditContext.actorName || "").trim(),
    requestId: String(auditContext.requestId || "").trim(),
    ip: String(auditContext.ip || "").trim(),
    entityType: "user",
    entityId: targetId,
    status: "success",
    summary: `Changed user role from ${previousRole || "unknown"} to ${normalizedNextRole}.`,
    details: {
      previousRole: previousRole || "",
      nextRole: normalizedNextRole,
      source: String(auditContext.source || "admin_api").trim() || "admin_api"
    }
  });

  return {
    ok: true,
    changed: true,
    previousRole,
    nextRole: normalizedNextRole,
    user
  };
}

function recordAdminProvisioningAudit(db, result, auditContext = {}) {
  if (!result || !result.ok || !result.user || !auditContext || typeof auditContext !== "object") {
    return null;
  }

  return appendAdminAuditEntry(db, {
    category: "admin",
    actionKey: result.promoted ? "admin_promoted" : "admin_created",
    actionLabel: result.promoted ? "Real admin promoted" : "Real admin created",
    actorId: String(auditContext.actorId || result.user.id || ""),
    actorEmail: normalizeEmail(auditContext.actorEmail || result.user.email),
    actorName: String(auditContext.actorName || result.user.name || "").trim(),
    requestId: String(auditContext.requestId || "").trim(),
    ip: String(auditContext.ip || "").trim(),
    entityType: "user",
    entityId: String(result.user.id || ""),
    status: "success",
    summary: result.message,
    details: {
      source: String(auditContext.source || "unknown").trim() || "unknown",
      promoteExisting: result.promoted === true
    }
  });
}

function createOrPromoteRealAdmin(db, input = {}, options = {}) {
  if (!db || typeof db !== "object") {
    return {
      ok: false,
      status: 500,
      message: "Database handle is unavailable."
    };
  }

  if (!Array.isArray(db.users)) {
    db.users = [];
  }

  const draft = buildAdminDraft(input);
  const promoteExisting = options.promoteExisting === true;
  if (!draft.name || !draft.email || !draft.mobile || !draft.password || !draft.address) {
    return {
      ok: false,
      status: 400,
      message: "Name, email, mobile, password, and address are required."
    };
  }
  if (!isValidEmail(draft.email)) {
    return {
      ok: false,
      status: 400,
      message: "Enter a valid admin email address."
    };
  }
  if (!isValidPhone(draft.mobile)) {
    return {
      ok: false,
      status: 400,
      message: "Enter a valid admin mobile number."
    };
  }
  if (!isStrongAdminPassword(draft.password)) {
    return {
      ok: false,
      status: 400,
      message: "Admin password must be at least 10 characters and include uppercase, lowercase, and a number."
    };
  }

  const existingUser = db.users.find((user) => normalizeEmail(user && user.email) === draft.email
    || normalizePhone(user && user.mobile) === draft.mobile);

  if (existingUser && (existingUser.seededDemoUser === true || findSeededDemoProfile(existingUser))) {
    return {
      ok: false,
      status: 409,
      message: "This email or mobile belongs to a seeded demo user. Create a different admin account first."
    };
  }

  if (existingUser && !promoteExisting) {
    return {
      ok: false,
      status: 409,
      message: "User already exists. Re-run with promoteExisting to upgrade that account to admin."
    };
  }

  if (existingUser) {
    existingUser.name = draft.name;
    existingUser.email = draft.email;
    existingUser.mobile = draft.mobile;
    existingUser.address = draft.address;
    existingUser.passwordHash = bcrypt.hashSync(draft.password, 10);
    existingUser.role = "admin";
    existingUser.notificationPreferences = normalizeNotificationPreferences(existingUser.notificationPreferences);
    existingUser.securityPreferences = normalizeSecurityPreferences(existingUser.securityPreferences);
    existingUser.sessionVersion = normalizeSessionVersion(existingUser.sessionVersion);
    existingUser.authActivity = normalizeAuthActivityList(existingUser.authActivity);
    existingUser.phoneVerification = normalizePhoneVerificationState(existingUser.phoneVerification);

    const nextUser = stripSeededDemoMetadata(existingUser);
    Object.keys(existingUser).forEach((key) => {
      delete existingUser[key];
    });
    Object.assign(existingUser, nextUser);

    const result = {
      ok: true,
      status: 200,
      message: "Existing account promoted to real admin successfully.",
      user: existingUser,
      created: false,
      promoted: true
    };
    recordAdminProvisioningAudit(db, result, options.auditContext);
    return result;
  }

  const user = {
    id: randomUUID(),
    name: draft.name,
    email: draft.email,
    mobile: draft.mobile,
    passwordHash: bcrypt.hashSync(draft.password, 10),
    role: "admin",
    address: draft.address,
    notificationPreferences: normalizeNotificationPreferences({}),
    securityPreferences: normalizeSecurityPreferences({}),
    sessionVersion: normalizeSessionVersion(1),
    authActivity: [],
    phoneVerification: normalizePhoneVerificationState({})
  };
  db.users.push(user);

  const result = {
    ok: true,
    status: 201,
    message: "Real admin account created successfully.",
    user,
    created: true,
    promoted: false
  };
  recordAdminProvisioningAudit(db, result, options.auditContext);
  return result;
}

function adminPublicView(user = {}) {
  return {
    id: String(user.id || ""),
    name: String(user.name || ""),
    email: normalizeEmail(user.email),
    mobile: normalizePhone(user.mobile),
    role: String(user.role || ""),
    address: String(user.address || "")
  };
}

module.exports = {
  ADMIN_PASSWORD_MIN_LENGTH,
  adminPublicView,
  buildAdminDraft,
  changeUserRole,
  createOrPromoteRealAdmin,
  hasRealAdminAccount,
  isStrongAdminPassword
};
