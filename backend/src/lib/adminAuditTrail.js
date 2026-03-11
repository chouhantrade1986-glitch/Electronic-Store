const { randomUUID } = require("crypto");

const ADMIN_AUDIT_LIMIT = 500;

function toIsoDate(value) {
  const parsed = new Date(value || new Date().toISOString());
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }
  return parsed.toISOString();
}

function normalizeText(value, fallback = "") {
  const normalized = String(value || "").trim();
  return normalized || fallback;
}

function normalizeCategory(value) {
  const normalized = normalizeText(value, "admin").toLowerCase();
  return normalized.replace(/[\s-]+/g, "_");
}

function normalizeDetails(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => normalizeText(key))
      .map(([key, item]) => [String(key), item])
  );
}

function normalizeTargetIds(value) {
  return (Array.isArray(value) ? value : [])
    .map((item) => normalizeText(item))
    .filter(Boolean)
    .slice(0, 25);
}

function normalizeAdminAuditEntry(value = {}) {
  const source = value && typeof value === "object" ? value : {};
  return {
    id: normalizeText(source.id, randomUUID()),
    createdAt: toIsoDate(source.createdAt),
    category: normalizeCategory(source.category),
    actionKey: normalizeCategory(source.actionKey || "admin_action"),
    actionLabel: normalizeText(source.actionLabel, "Admin action"),
    actorId: normalizeText(source.actorId),
    actorEmail: normalizeText(source.actorEmail),
    actorName: normalizeText(source.actorName),
    requestId: normalizeText(source.requestId),
    ip: normalizeText(source.ip),
    entityType: normalizeText(source.entityType),
    entityId: normalizeText(source.entityId),
    orderId: normalizeText(source.orderId),
    paymentId: normalizeText(source.paymentId),
    caseId: normalizeText(source.caseId),
    status: normalizeText(source.status, "success").toLowerCase(),
    summary: normalizeText(source.summary, "Admin action recorded."),
    targetIds: normalizeTargetIds(source.targetIds),
    details: normalizeDetails(source.details)
  };
}

function ensureAdminAuditTrailCollection(db) {
  if (!db || typeof db !== "object") {
    return [];
  }
  db.adminAuditTrail = (Array.isArray(db.adminAuditTrail) ? db.adminAuditTrail : [])
    .map((item) => normalizeAdminAuditEntry(item))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, ADMIN_AUDIT_LIMIT);
  return db.adminAuditTrail;
}

function appendAdminAuditEntry(db, entry = {}) {
  ensureAdminAuditTrailCollection(db);
  const normalized = normalizeAdminAuditEntry(entry);
  db.adminAuditTrail.unshift(normalized);
  db.adminAuditTrail = db.adminAuditTrail.slice(0, ADMIN_AUDIT_LIMIT);
  return normalized;
}

function listAdminAuditTrail(db, options = {}) {
  const entries = ensureAdminAuditTrailCollection(db);
  const category = normalizeText(options.category, "all").toLowerCase();
  const search = normalizeText(options.search).toLowerCase();
  const limit = Math.max(1, Math.min(250, Number(options.limit || 100) || 100));

  const filtered = entries.filter((item) => {
    if (category !== "all" && item.category !== normalizeCategory(category)) {
      return false;
    }
    if (!search) {
      return true;
    }
    const haystack = [
      item.actionLabel,
      item.summary,
      item.actorEmail,
      item.actorName,
      item.entityId,
      item.orderId,
      item.paymentId,
      item.caseId,
      item.category
    ].join(" ").toLowerCase();
    return haystack.includes(search);
  });

  return {
    totalCount: entries.length,
    filteredCount: filtered.length,
    entries: filtered.slice(0, limit)
  };
}

function summarizeAdminAuditTrail(entries = []) {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const categories = ["order", "refund", "after_sales", "catalog", "notification"];
  const categoryCounts = categories.reduce((accumulator, item) => {
    accumulator[item] = 0;
    return accumulator;
  }, {});
  let recent24h = 0;
  const cutoff = Date.now() - (24 * 60 * 60 * 1000);

  safeEntries.forEach((item) => {
    const category = normalizeCategory(item && item.category);
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    const createdAt = new Date(item && item.createdAt ? item.createdAt : 0).getTime();
    if (Number.isFinite(createdAt) && createdAt >= cutoff) {
      recent24h += 1;
    }
  });

  return {
    total: safeEntries.length,
    recent24h,
    categoryCounts
  };
}

module.exports = {
  ADMIN_AUDIT_LIMIT,
  appendAdminAuditEntry,
  ensureAdminAuditTrailCollection,
  listAdminAuditTrail,
  normalizeAdminAuditEntry,
  summarizeAdminAuditTrail
};
