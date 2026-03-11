function toIsoDate(value) {
  const parsed = new Date(value || new Date().toISOString());
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }
  return parsed.toISOString();
}

function defaultSecurityPreferences() {
  return {
    twoFactorEnabled: false,
    loginAlertsEnabled: true
  };
}

function normalizeSecurityPreferences(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    twoFactorEnabled: source.twoFactorEnabled === true,
    loginAlertsEnabled: source.loginAlertsEnabled !== false
  };
}

function normalizeSessionVersion(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
}

function normalizeAuthActivityEntry(value = {}) {
  const source = value && typeof value === "object" ? value : {};
  return {
    id: String(source.id || `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`),
    eventKey: String(source.eventKey || "account_update").trim().toLowerCase() || "account_update",
    eventLabel: String(source.eventLabel || source.eventKey || "Account update").trim() || "Account update",
    createdAt: toIsoDate(source.createdAt),
    ip: String(source.ip || "").trim(),
    userAgent: String(source.userAgent || "").trim(),
    note: String(source.note || "").trim(),
    actor: String(source.actor || "user").trim() || "user"
  };
}

function normalizeAuthActivityList(value) {
  return (Array.isArray(value) ? value : [])
    .map((item) => normalizeAuthActivityEntry(item))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 20);
}

function appendAuthActivity(user, entry = {}) {
  if (!user || typeof user !== "object") {
    return [];
  }
  const current = normalizeAuthActivityList(user.authActivity);
  const next = [
    normalizeAuthActivityEntry(entry),
    ...current
  ].slice(0, 20);
  user.authActivity = next;
  return next;
}

function authActivityPublicView(user, limit = 10) {
  return normalizeAuthActivityList(user && user.authActivity).slice(0, Math.max(1, Number(limit || 10)));
}

module.exports = {
  appendAuthActivity,
  authActivityPublicView,
  defaultSecurityPreferences,
  normalizeAuthActivityEntry,
  normalizeAuthActivityList,
  normalizeSecurityPreferences,
  normalizeSessionVersion
};
