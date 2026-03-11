const STATUS_HISTORY_KEYS = new Set(["ordered", "processing", "shipped", "delivered", "cancelled"]);

const STATUS_LABELS = {
  ordered: "Order placed",
  processing: "Preparing for dispatch",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled"
};

function toIsoDate(value, fallback = "") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback || new Date().toISOString();
  }
  return date.toISOString();
}

function normalizeHistoryKey(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) {
    return "";
  }
  if (raw === "order_placed" || raw === "placed") {
    return "ordered";
  }
  if (raw === "packed") {
    return "processing";
  }
  return STATUS_HISTORY_KEYS.has(raw) ? raw : "";
}

function buildStatusHistoryEntry(key, createdAt, overrides = {}) {
  const normalizedKey = normalizeHistoryKey(key);
  if (!normalizedKey) {
    return null;
  }
  return {
    key: normalizedKey,
    status: normalizedKey === "ordered" ? "processing" : normalizedKey,
    label: String(overrides.label || STATUS_LABELS[normalizedKey] || normalizedKey),
    createdAt: toIsoDate(createdAt),
    inferred: Boolean(overrides.inferred)
  };
}

function normalizeOrderStatusHistory(order) {
  const createdAt = toIsoDate(order && order.createdAt ? order.createdAt : new Date().toISOString());
  const currentStatus = normalizeHistoryKey(order && order.status ? order.status : "processing") || "processing";
  const rawHistory = Array.isArray(order && order.statusHistory) ? order.statusHistory : [];
  const normalized = rawHistory
    .map((entry) => buildStatusHistoryEntry(entry && (entry.key || entry.status), entry && entry.createdAt ? entry.createdAt : createdAt, {
      label: entry && entry.label ? entry.label : "",
      inferred: entry && entry.inferred
    }))
    .filter(Boolean)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const byKey = new Map();
  normalized.forEach((entry) => {
    const previous = byKey.get(entry.key);
    if (!previous || (previous.inferred && !entry.inferred)) {
      byKey.set(entry.key, entry);
    }
  });

  if (!byKey.has("ordered")) {
    byKey.set("ordered", buildStatusHistoryEntry("ordered", createdAt));
  }

  if (!byKey.has("processing")) {
    byKey.set("processing", buildStatusHistoryEntry("processing", createdAt, {
      inferred: normalized.length === 0 || currentStatus !== "processing"
    }));
  }

  if (["shipped", "delivered", "cancelled"].includes(currentStatus) && !byKey.has(currentStatus)) {
    byKey.set(currentStatus, buildStatusHistoryEntry(currentStatus, createdAt, { inferred: true }));
  }

  return Array.from(byKey.values())
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

function appendOrderStatusEvent(order, key, createdAt = new Date().toISOString(), overrides = {}) {
  const normalizedKey = normalizeHistoryKey(key);
  if (!normalizedKey) {
    return normalizeOrderStatusHistory(order);
  }
  const nextHistory = normalizeOrderStatusHistory(order)
    .filter((entry) => !(entry.key === normalizedKey && entry.inferred));
  nextHistory.push(buildStatusHistoryEntry(normalizedKey, createdAt, overrides));
  return nextHistory
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

function withNormalizedOrderStatusHistory(order) {
  return {
    ...order,
    statusHistory: normalizeOrderStatusHistory(order)
  };
}

module.exports = {
  appendOrderStatusEvent,
  normalizeOrderStatusHistory,
  withNormalizedOrderStatusHistory
};
