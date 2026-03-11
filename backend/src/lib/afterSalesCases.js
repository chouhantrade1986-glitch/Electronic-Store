const { randomUUID } = require("crypto");

const AFTER_SALES_TYPES = new Set(["return", "refund", "exchange"]);
const AFTER_SALES_REASONS = new Set([
  "damaged",
  "defective",
  "wrong_item",
  "missing_parts",
  "not_as_described",
  "no_longer_needed",
  "size_issue",
  "other"
]);

const FINAL_AFTER_SALES_STATUSES = new Set([
  "rejected",
  "refunded",
  "exchange_completed",
  "closed"
]);

const AFTER_SALES_STATUS_FLOW = {
  refund: new Set(["requested", "approved", "rejected", "refund_pending", "refunded", "closed"]),
  return: new Set(["requested", "approved", "rejected", "pickup_scheduled", "in_transit", "received", "refund_pending", "refunded", "closed"]),
  exchange: new Set(["requested", "approved", "rejected", "pickup_scheduled", "in_transit", "received", "exchange_processing", "exchange_shipped", "exchange_completed", "closed"])
};

const AFTER_SALES_STATUS_LABELS = {
  requested: "Requested",
  approved: "Approved",
  rejected: "Rejected",
  pickup_scheduled: "Pickup scheduled",
  in_transit: "In transit",
  received: "Received",
  refund_pending: "Refund pending",
  refunded: "Refunded",
  exchange_processing: "Exchange processing",
  exchange_shipped: "Exchange shipped",
  exchange_completed: "Exchange completed",
  closed: "Closed"
};

const AFTER_SALES_REASON_LABELS = {
  damaged: "Damaged item",
  defective: "Defective item",
  wrong_item: "Wrong item received",
  missing_parts: "Missing parts or accessories",
  not_as_described: "Not as described",
  no_longer_needed: "No longer needed",
  size_issue: "Size or fit issue",
  other: "Other"
};

function toIsoDate(value) {
  const date = new Date(value || new Date().toISOString());
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  return date.toISOString();
}

function asMoney(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return Number(fallback || 0);
  }
  return Number(parsed.toFixed(2));
}

function normalizeAfterSalesType(value) {
  const raw = String(value || "").trim().toLowerCase();
  return AFTER_SALES_TYPES.has(raw) ? raw : "return";
}

function normalizeAfterSalesReason(value) {
  const raw = String(value || "").trim().toLowerCase();
  return AFTER_SALES_REASONS.has(raw) ? raw : "other";
}

function normalizeAfterSalesStatus(value, type = "return") {
  const normalizedType = normalizeAfterSalesType(type);
  const raw = String(value || "").trim().toLowerCase();
  const allowed = AFTER_SALES_STATUS_FLOW[normalizedType];
  if (allowed && allowed.has(raw)) {
    return raw;
  }
  return "requested";
}

function getAfterSalesStatusesForType(type) {
  const normalizedType = normalizeAfterSalesType(type);
  return Array.from(AFTER_SALES_STATUS_FLOW[normalizedType] || []);
}

function buildAfterSalesTimelineEntry(status, createdAt, note = "", overrides = {}) {
  return {
    status: String(status || "").trim().toLowerCase(),
    label: String(overrides.label || AFTER_SALES_STATUS_LABELS[status] || status || "Update"),
    note: String(note || "").trim(),
    createdAt: toIsoDate(createdAt),
    actor: String(overrides.actor || "").trim() || "system"
  };
}

function normalizeAfterSalesCase(item = {}) {
  const type = normalizeAfterSalesType(item.type);
  const createdAt = toIsoDate(item.createdAt || new Date().toISOString());
  const status = normalizeAfterSalesStatus(item.status, type);
  const timeline = Array.isArray(item.timeline) ? item.timeline : [];
  const normalizedTimeline = timeline
    .map((entry) => buildAfterSalesTimelineEntry(
      normalizeAfterSalesStatus(entry && entry.status, type),
      entry && entry.createdAt ? entry.createdAt : createdAt,
      entry && entry.note ? entry.note : "",
      {
        label: entry && entry.label ? entry.label : "",
        actor: entry && entry.actor ? entry.actor : ""
      }
    ))
    .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());

  if (!normalizedTimeline.length) {
    normalizedTimeline.push(buildAfterSalesTimelineEntry(status, createdAt, item.note, {
      actor: item.requestedBy || "customer"
    }));
  }

  return {
    id: String(item.id || randomUUID()),
    orderId: String(item.orderId || "").trim(),
    userId: String(item.userId || "").trim(),
    type,
    reason: normalizeAfterSalesReason(item.reason),
    status,
    requestedBy: String(item.requestedBy || "customer").trim().toLowerCase() || "customer",
    customerName: String(item.customerName || "").trim(),
    customerEmail: String(item.customerEmail || "").trim().toLowerCase(),
    customerMobile: String(item.customerMobile || "").trim(),
    refundAmount: asMoney(item.refundAmount, 0),
    currency: String(item.currency || "INR").trim().toUpperCase() || "INR",
    paymentMethod: String(item.paymentMethod || "").trim().toLowerCase(),
    orderStatusAtRequest: String(item.orderStatusAtRequest || "").trim().toLowerCase(),
    note: String(item.note || "").trim(),
    adminNote: String(item.adminNote || "").trim(),
    resolutionNote: String(item.resolutionNote || "").trim(),
    items: Array.isArray(item.items) ? item.items : [],
    paymentUpdate: item.paymentUpdate && typeof item.paymentUpdate === "object" ? { ...item.paymentUpdate } : null,
    createdAt,
    updatedAt: toIsoDate(item.updatedAt || createdAt),
    timeline: normalizedTimeline
  };
}

function ensureAfterSalesCollections(db) {
  if (!Array.isArray(db.afterSalesCases)) {
    db.afterSalesCases = [];
    return db.afterSalesCases;
  }
  db.afterSalesCases = db.afterSalesCases.map((item) => normalizeAfterSalesCase(item));
  return db.afterSalesCases;
}

function isFinalAfterSalesStatus(status) {
  return FINAL_AFTER_SALES_STATUSES.has(String(status || "").trim().toLowerCase());
}

function canCustomerRequestAfterSalesForOrder(order) {
  const source = order && typeof order === "object" ? order : {};
  const status = String(source.status || "").trim().toLowerCase();
  const paymentStatus = String(source.paymentStatus || "").trim().toLowerCase();
  if (!source.id || status === "cancelled") {
    return false;
  }
  return paymentStatus === "paid" || paymentStatus === "authorized";
}

function getOpenAfterSalesCaseForOrder(db, orderId) {
  ensureAfterSalesCollections(db);
  const normalizedOrderId = String(orderId || "").trim();
  return db.afterSalesCases.find((item) => item.orderId === normalizedOrderId && !isFinalAfterSalesStatus(item.status)) || null;
}

function createAfterSalesCase(db, order, input = {}) {
  ensureAfterSalesCollections(db);
  if (!order || !order.id) {
    return {
      ok: false,
      status: 404,
      message: "Order not found."
    };
  }

  const existing = getOpenAfterSalesCaseForOrder(db, order.id);
  if (existing) {
    return {
      ok: false,
      status: 409,
      message: "An open after-sales case already exists for this order.",
      caseItem: existing
    };
  }

  const type = normalizeAfterSalesType(input.type);
  const reason = normalizeAfterSalesReason(input.reason);
  const createdAt = toIsoDate(input.createdAt || new Date().toISOString());
  const caseItem = normalizeAfterSalesCase({
    id: randomUUID(),
    orderId: order.id,
    userId: order.userId,
    type,
    reason,
    status: "requested",
    requestedBy: input.requestedBy || "customer",
    customerName: input.customerName || "",
    customerEmail: input.customerEmail || "",
    customerMobile: input.customerMobile || "",
    refundAmount: input.refundAmount !== undefined ? input.refundAmount : order.total,
    currency: input.currency || "INR",
    paymentMethod: order.paymentMethod,
    orderStatusAtRequest: order.status,
    note: input.note || "",
    adminNote: input.adminNote || "",
    items: Array.isArray(order.items) ? order.items : [],
    createdAt,
    updatedAt: createdAt,
    timeline: [
      buildAfterSalesTimelineEntry("requested", createdAt, input.note, {
        actor: input.requestedBy || "customer"
      })
    ]
  });

  db.afterSalesCases.push(caseItem);
  return {
    ok: true,
    status: 201,
    caseItem
  };
}

function updateAfterSalesCase(caseItem, input = {}) {
  const normalizedCase = normalizeAfterSalesCase(caseItem);
  const allowedStatuses = getAfterSalesStatusesForType(normalizedCase.type);
  const rawNextStatus = String(input.status || "").trim().toLowerCase();
  if (!allowedStatuses.includes(rawNextStatus)) {
    return {
      ok: false,
      status: 400,
      message: "Invalid after-sales status for this case type."
    };
  }
  const nextStatus = normalizeAfterSalesStatus(rawNextStatus, normalizedCase.type);

  const updatedAt = toIsoDate(input.updatedAt || new Date().toISOString());
  const nextAdminNote = input.adminNote !== undefined ? String(input.adminNote || "").trim() : normalizedCase.adminNote;
  const nextResolutionNote = input.resolutionNote !== undefined ? String(input.resolutionNote || "").trim() : normalizedCase.resolutionNote;
  const nextRefundAmount = input.refundAmount !== undefined
    ? asMoney(input.refundAmount, normalizedCase.refundAmount)
    : normalizedCase.refundAmount;
  const actor = String(input.actor || "admin").trim() || "admin";
  const eventNoteParts = [];
  if (String(input.note || "").trim()) {
    eventNoteParts.push(String(input.note).trim());
  }
  if (input.resolutionNote !== undefined && nextResolutionNote) {
    eventNoteParts.push(`Resolution: ${nextResolutionNote}`);
  }

  normalizedCase.status = nextStatus;
  normalizedCase.adminNote = nextAdminNote;
  normalizedCase.resolutionNote = nextResolutionNote;
  normalizedCase.refundAmount = nextRefundAmount;
  normalizedCase.updatedAt = updatedAt;
  normalizedCase.paymentUpdate = input.paymentUpdate && typeof input.paymentUpdate === "object"
    ? { ...input.paymentUpdate }
    : normalizedCase.paymentUpdate;
  normalizedCase.timeline.push(buildAfterSalesTimelineEntry(nextStatus, updatedAt, eventNoteParts.join(" "), {
    actor
  }));
  normalizedCase.timeline = normalizedCase.timeline
    .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime())
    .slice(-30);

  Object.assign(caseItem, normalizedCase);
  return {
    ok: true,
    caseItem
  };
}

function buildAfterSalesSummary(cases = []) {
  const summary = {
    total: 0,
    open: 0,
    refund: 0,
    return: 0,
    exchange: 0,
    requested: 0,
    approved: 0,
    refund_pending: 0,
    refunded: 0,
    exchange_processing: 0,
    exchange_completed: 0,
    rejected: 0
  };

  (Array.isArray(cases) ? cases : []).forEach((item) => {
    const type = normalizeAfterSalesType(item && item.type);
    const status = normalizeAfterSalesStatus(item && item.status, type);
    summary.total += 1;
    summary[type] = (summary[type] || 0) + 1;
    summary[status] = (summary[status] || 0) + 1;
    if (!isFinalAfterSalesStatus(status)) {
      summary.open += 1;
    }
  });

  return summary;
}

module.exports = {
  AFTER_SALES_REASON_LABELS,
  AFTER_SALES_STATUS_LABELS,
  buildAfterSalesSummary,
  buildAfterSalesTimelineEntry,
  canCustomerRequestAfterSalesForOrder,
  createAfterSalesCase,
  ensureAfterSalesCollections,
  getAfterSalesStatusesForType,
  getOpenAfterSalesCaseForOrder,
  isFinalAfterSalesStatus,
  normalizeAfterSalesCase,
  normalizeAfterSalesReason,
  normalizeAfterSalesStatus,
  normalizeAfterSalesType,
  updateAfterSalesCase
};
