const express = require("express");
const { readDb, writeDb, withWriteLock } = require("../lib/db");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const { isDriveConfigured, parseDataUrl, uploadBufferToDrive } = require("../lib/googleDrive");
const {
  ensureBackInStockCollections,
  dispatchBackInStockNotifications,
  setBackInStockRequestStatus,
  getBackInStockDemandSummary,
  listBackInStockRequests
} = require("../lib/backInStock");
const { appendOrderStatusEvent, withNormalizedOrderStatusHistory } = require("../lib/orderStatus");
const { dispatchOrderStatusNotification, listOrderNotifications, resendOrderNotification } = require("../lib/orderNotifications");
const { phoneVerificationPublicView } = require("../lib/phoneVerification");
const {
  getPhoneVerificationAutomationSnapshot
} = require("../lib/phoneVerificationAutomation");
const { executePhoneVerificationAutomationJob } = require("../lib/phoneVerificationAutomationJob");
const {
  releaseInventoryForOrder,
  reReserveInventoryForOrder
} = require("../lib/orderCommerce");
const {
  cancelOrderPayments,
  getLatestPaymentForOrder,
  isOrderPaymentCleared,
  refundPayment
} = require("../lib/paymentLifecycle");
const {
  createRazorpayRefund,
  isRazorpayEnabled,
  mapRazorpayRefundEntity
} = require("../lib/razorpayGateway");
const {
  ensurePhoneVerificationAutomationSettings,
  normalizePhoneVerificationAutomationSettings
} = require("../lib/phoneVerificationAutomationSettings");
const { startPhoneVerificationAutomationScheduler } = require("../lib/phoneVerificationAutomationScheduler");
const {
  buildAfterSalesSummary,
  createAfterSalesCase,
  ensureAfterSalesCollections,
  getAfterSalesStatusesForType,
  isFinalAfterSalesStatus,
  normalizeAfterSalesCase,
  normalizeAfterSalesStatus,
  normalizeAfterSalesType,
  updateAfterSalesCase
} = require("../lib/afterSalesCases");
const {
  appendAdminAuditEntry,
  ensureAdminAuditTrailCollection,
  listAdminAuditTrail,
  summarizeAdminAuditTrail
} = require("../lib/adminAuditTrail");
const {
  getSqliteProductById,
  isSqliteProductQueriesEnabled,
  listSqliteProducts
} = require("../lib/sqliteProducts");
const {
  getSqliteOrderById,
  getSqliteLatestPaymentForOrder,
  isSqliteOrderPaymentQueriesEnabled,
  listSqliteOrders,
  writeSqliteOrderPaymentCollections
} = require("../lib/sqliteOrdersPayments");

const router = express.Router();

router.use(requireAuth, requireAdmin);

const MAX_MEDIA_UPLOAD_ITEMS = 15;
const MAX_IMAGE_UPLOAD_BYTES = 15 * 1024 * 1024;
const MAX_VIDEO_UPLOAD_BYTES = 50 * 1024 * 1024;

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function recordAdminAudit(db, req, entry = {}) {
  ensureAdminAuditTrailCollection(db);
  return appendAdminAuditEntry(db, {
    actorId: req && req.user && req.user.id ? req.user.id : "",
    actorEmail: req && req.user && req.user.email ? req.user.email : "",
    actorName: req && req.user && req.user.name ? req.user.name : "",
    requestId: req && req.requestId ? req.requestId : "",
    ip: String(req && req.ip ? req.ip : "").split(",")[0].trim(),
    ...entry
  });
}

function asNumber(value) {
  return Number(value || 0);
}

function persistAdminMutation(db, collections) {
  if (isSqliteOrderPaymentQueriesEnabled()) {
    writeSqliteOrderPaymentCollections(db, collections);
    return;
  }
  writeDb(db);
}

function normalizeCategoryToken(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) {
    return "";
  }
  if (raw === "accessories") {
    return "accessory";
  }
  return raw.replace(/[\s_]+/g, "-");
}

function normalizeCollectionValues(value, fallbackCategory = "") {
  const list = Array.isArray(value)
    ? value
    : String(value || "").split(/[;|,]+/);
  const normalized = list
    .map((item) => normalizeCategoryToken(item))
    .filter(Boolean)
    .filter((item) => item !== "all" && item !== "all-products");
  const fallback = normalizeCategoryToken(fallbackCategory);
  if (fallback && !normalized.includes(fallback)) {
    normalized.unshift(fallback);
  }
  return [...new Set(normalized)].slice(0, 8);
}

function normalizeThreshold(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return Math.max(0, Math.floor(Number(fallback || 0)));
  }
  return Math.max(0, Math.floor(parsed));
}

function normalizeInventorySettings(rawSettings, products = []) {
  const settings = rawSettings && typeof rawSettings === "object" ? rawSettings : {};
  const categoryThresholdsRaw = settings.categoryThresholds && typeof settings.categoryThresholds === "object"
    ? settings.categoryThresholds
    : {};
  const categories = new Set(
    (Array.isArray(products) ? products : [])
      .map((product) => normalizeCategoryToken(product && product.category))
      .filter(Boolean)
  );

  Object.keys(categoryThresholdsRaw).forEach((key) => {
    const normalized = normalizeCategoryToken(key);
    if (normalized) {
      categories.add(normalized);
    }
  });

  const normalizedThresholds = {};
  Array.from(categories).sort().forEach((category) => {
    normalizedThresholds[category] = normalizeThreshold(
      categoryThresholdsRaw[category],
      settings.defaultLowStockThreshold
    );
  });

  return {
    defaultLowStockThreshold: normalizeThreshold(settings.defaultLowStockThreshold, 5),
    restockTarget: normalizeThreshold(settings.restockTarget, 10),
    categoryThresholds: normalizedThresholds
  };
}

function isoDay(date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildRevenueSeries(orders, days = 7) {
  const now = new Date();
  const dayMap = new Map();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - offset);
    dayMap.set(isoDay(day), {
      date: isoDay(day),
      revenue: 0,
      orders: 0
    });
  }

  orders.forEach((order) => {
    if (!order.createdAt) {
      return;
    }
    const key = isoDay(order.createdAt);
    const slot = dayMap.get(key);
    if (!slot) {
      return;
    }
    slot.revenue += asNumber(order.total);
    slot.orders += 1;
  });

  return Array.from(dayMap.values());
}

function countBy(items, keySelector, allowed = []) {
  const counts = Object.create(null);
  allowed.forEach((key) => {
    counts[key] = 0;
  });

  items.forEach((item) => {
    const key = keySelector(item);
    if (!key) {
      return;
    }
    counts[key] = (counts[key] || 0) + 1;
  });

  return counts;
}

function topProducts(orders, limit = 5) {
  const productMap = new Map();

  orders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const key = item.productId || item.name || "unknown";
      const prev = productMap.get(key) || {
        productId: item.productId || null,
        name: item.name || "Unknown",
        quantity: 0,
        revenue: 0
      };
      const quantity = asNumber(item.quantity || 1);
      const lineTotal = asNumber(item.lineTotal || asNumber(item.price) * quantity);
      prev.quantity += quantity;
      prev.revenue += lineTotal;
      productMap.set(key, prev);
    });
  });

  return Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

function readUploadMaxBytes(mimeType) {
  const type = String(mimeType || "").toLowerCase();
  if (type.startsWith("video/")) {
    return MAX_VIDEO_UPLOAD_BYTES;
  }
  return MAX_IMAGE_UPLOAD_BYTES;
}

function enrichAfterSalesCase(db, caseItem) {
  const normalizedCase = normalizeAfterSalesCase(caseItem);
  const order = isSqliteOrderPaymentQueriesEnabled()
    ? getSqliteOrderById(normalizedCase.orderId)
    : (Array.isArray(db.orders) ? db.orders.find((item) => item.id === normalizedCase.orderId) : null);
  const user = Array.isArray(db.users) ? db.users.find((item) => item.id === normalizedCase.userId) : null;
  const latestPayment = order
    ? (isSqliteOrderPaymentQueriesEnabled() ? getSqliteLatestPaymentForOrder(order.id) : getLatestPaymentForOrder(db, order.id))
    : null;
  return {
    ...normalizedCase,
    customerName: normalizedCase.customerName || (user && user.name ? user.name : "Unknown"),
    customerEmail: normalizedCase.customerEmail || (user && user.email ? user.email : ""),
    customerMobile: normalizedCase.customerMobile || (user && user.mobile ? user.mobile : ""),
    orderTotal: Number(order && order.total ? order.total : normalizedCase.refundAmount || 0),
    orderStatusCurrent: String(order && order.status ? order.status : normalizedCase.orderStatusAtRequest || "").trim().toLowerCase(),
    paymentStatusCurrent: String(order && order.paymentStatus ? order.paymentStatus : "").trim().toLowerCase(),
    paymentMethodCurrent: String(order && order.paymentMethod ? order.paymentMethod : normalizedCase.paymentMethod || "").trim().toLowerCase(),
    latestPaymentId: latestPayment ? latestPayment.id : "",
    latestPaymentRecordStatus: latestPayment ? latestPayment.status : "",
    final: isFinalAfterSalesStatus(normalizedCase.status),
    statusOptions: getAfterSalesStatusesForType(normalizedCase.type)
  };
}

router.get("/dashboard", (req, res) => {
  const db = readDb();
  ensureBackInStockCollections(db);
  const orderSource = isSqliteOrderPaymentQueriesEnabled() ? listSqliteOrders({}) : db.orders;
  const totalRevenue = orderSource
    .filter((order) => order.paymentStatus === "paid" || order.paymentStatus === "authorized")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const summary = {
    users: db.users.length,
    products: db.products.length,
    orders: orderSource.length,
    payments: db.payments.length,
    totalRevenue,
    openBackInStockRequests: db.backInStockRequests.filter((item) => String(item.status || "open") === "open").length
  };

  return res.json(summary);
});

router.get("/users", (req, res) => {
  const db = readDb();
  const users = db.users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    phoneVerification: phoneVerificationPublicView(user)
  }));
  return res.json({ count: users.length, users });
});

router.get("/audit-trail", (req, res) => {
  const db = readDb();
  const payload = listAdminAuditTrail(db, {
    limit: req.query.limit,
    category: req.query.category,
    search: req.query.search
  });
  return res.json({
    count: payload.filteredCount,
    totalCount: payload.totalCount,
    summary: summarizeAdminAuditTrail(ensureAdminAuditTrailCollection(db)),
    entries: payload.entries
  });
});

router.get("/orders", (req, res) => {
  const db = readDb();
  const orderSource = isSqliteOrderPaymentQueriesEnabled() ? listSqliteOrders({}) : db.orders;
  return res.json({
    count: orderSource.length,
    orders: orderSource.map((order) => withNormalizedOrderStatusHistory(order))
  });
});

router.get("/after-sales", (req, res) => {
  const db = readDb();
  ensureAfterSalesCollections(db);
  const query = String(req.query.search || "").trim().toLowerCase();
  const type = normalizeAfterSalesType(req.query.type || "");
  const status = String(req.query.status || "all").trim().toLowerCase();
  const typeFilter = String(req.query.type || "all").trim().toLowerCase();
  const items = db.afterSalesCases
    .map((item) => enrichAfterSalesCase(db, item))
    .filter((item) => {
      const typeMatch = typeFilter === "all" || item.type === type;
      const statusMatch = status === "all" || item.status === status;
      const haystack = [
        item.id,
        item.orderId,
        item.customerName,
        item.customerEmail,
        item.reason,
        item.status
      ].join(" ").toLowerCase();
      const queryMatch = !query || haystack.includes(query);
      return typeMatch && statusMatch && queryMatch;
    })
    .sort((left, right) => new Date(right.updatedAt || right.createdAt || 0).getTime() - new Date(left.updatedAt || left.createdAt || 0).getTime());

  return res.json({
    count: items.length,
    summary: buildAfterSalesSummary(db.afterSalesCases),
    cases: items
  });
});

router.post("/after-sales", (req, res) => {
  const db = readDb();
  ensureAfterSalesCollections(db);
  const orderId = String(req.body && req.body.orderId ? req.body.orderId : "").trim();
  if (!orderId) {
    return res.status(400).json({ message: "Order ID is required." });
  }

  const order = Array.isArray(db.orders) ? db.orders.find((item) => item.id === orderId) : null;
  if (!order) {
    return res.status(404).json({ message: "Order not found." });
  }
  if (String(order.status || "").trim().toLowerCase() === "cancelled") {
    return res.status(409).json({ message: "Cancelled orders cannot open a new after-sales case." });
  }

  const user = Array.isArray(db.users) ? db.users.find((item) => item.id === order.userId) : null;
  const result = createAfterSalesCase(db, order, {
    type: req.body && req.body.type,
    reason: req.body && req.body.reason,
    requestedBy: req.body && req.body.requestedBy ? req.body.requestedBy : "admin",
    customerName: user && user.name ? user.name : "",
    customerEmail: user && user.email ? user.email : "",
    customerMobile: user && user.mobile ? user.mobile : "",
    note: req.body && req.body.note ? req.body.note : "",
    adminNote: req.body && req.body.adminNote ? req.body.adminNote : "",
    refundAmount: req.body && req.body.refundAmount !== undefined ? req.body.refundAmount : order.total,
    currency: "INR"
  });

  if (!result.ok) {
    return res.status(result.status || 400).json({ message: result.message });
  }

  recordAdminAudit(db, req, {
    category: "after_sales",
    actionKey: "after_sales_case_created",
    actionLabel: "After-sales case created",
    entityType: "after_sales_case",
    entityId: result.caseItem && result.caseItem.id ? result.caseItem.id : "",
    orderId,
    caseId: result.caseItem && result.caseItem.id ? result.caseItem.id : "",
    summary: `Opened ${String(result.caseItem && result.caseItem.type ? result.caseItem.type : "after-sales")} case for order ${orderId}.`,
    details: {
      type: result.caseItem && result.caseItem.type ? result.caseItem.type : "",
      reason: result.caseItem && result.caseItem.reason ? result.caseItem.reason : "",
      requestedBy: req.body && req.body.requestedBy ? req.body.requestedBy : "admin",
      refundAmount: req.body && req.body.refundAmount !== undefined ? Number(req.body.refundAmount) : Number(order.total || 0)
    }
  });
  persistAdminMutation(db, ["afterSalesCases", "adminAuditTrail"]);
  return res.status(result.status || 201).json({
    message: "After-sales case created successfully.",
    caseItem: enrichAfterSalesCase(db, result.caseItem),
    summary: buildAfterSalesSummary(db.afterSalesCases)
  });
});

router.patch("/after-sales/:id", async (req, res) => {
  const requestedStatus = String(req.body && req.body.status ? req.body.status : "").trim().toLowerCase();
  const requestedTypeRaw = String(req.body && req.body.type ? req.body.type : "").trim().toLowerCase();

  if (!requestedStatus) {
    return res.status(400).json({ message: "Status is required." });
  }

  try {
    const committed = await withWriteLock(async () => {
      const currentDb = readDb();
      ensureAfterSalesCollections(currentDb);
      const caseItem = currentDb.afterSalesCases.find((item) => item.id === req.params.id);
      if (!caseItem) {
        throw createHttpError(404, "After-sales case not found.");
      }
      const previousStatus = String(caseItem.status || "");
      const previousType = String(caseItem.type || "");

      const order = currentDb.orders.find((item) => item.id === caseItem.orderId);
      if (!order) {
        throw createHttpError(404, "Linked order not found.");
      }

      const nextType = requestedTypeRaw ? normalizeAfterSalesType(requestedTypeRaw) : caseItem.type;
      const nextStatus = normalizeAfterSalesStatus(requestedStatus, nextType);
      let paymentUpdate = null;

      if (nextStatus === "refund_pending" || nextStatus === "refunded") {
        const latestPayment = getLatestPaymentForOrder(currentDb, order.id);
        if (!latestPayment) {
          throw createHttpError(409, "No payment record found for this order.");
        }
        if (latestPayment.provider === "razorpay" && latestPayment.status === "captured" && !isRazorpayEnabled()) {
          throw createHttpError(503, "Razorpay refund is not configured on this backend.");
        }

        let refundGatewayResult = null;
        if (latestPayment.provider === "razorpay" && latestPayment.status === "captured" && isRazorpayEnabled()) {
          const gatewayPaymentId = String(latestPayment && latestPayment.metadata && latestPayment.metadata.gatewayPaymentId ? latestPayment.metadata.gatewayPaymentId : "").trim();
          if (!gatewayPaymentId) {
            throw createHttpError(409, "Gateway payment reference missing for refund.");
          }
          try {
            const gatewayRefund = await createRazorpayRefund(gatewayPaymentId, {
              amount: req.body && req.body.refundAmount !== undefined ? req.body.refundAmount : (latestPayment.amountCaptured || latestPayment.amount),
              notes: {
                internalOrderId: String(order.id || "").slice(0, 40),
                afterSalesCaseId: String(caseItem.id || "").slice(0, 40)
              }
            });
            refundGatewayResult = mapRazorpayRefundEntity(gatewayRefund);
          } catch (error) {
            throw createHttpError(error.status || 502, error.message || "Unable to initiate gateway refund.");
          }
        }

        paymentUpdate = refundPayment(currentDb, latestPayment, order, {
          at: new Date().toISOString(),
          gatewayResult: refundGatewayResult
        });
        if (!paymentUpdate.ok) {
          throw createHttpError(paymentUpdate.status || 409, paymentUpdate.message || "Unable to process refund for this case.");
        }
      }

      const result = updateAfterSalesCase(caseItem, {
        status: paymentUpdate
          ? (paymentUpdate.payment && paymentUpdate.payment.status === "refunded" ? "refunded" : "refund_pending")
          : nextStatus,
        adminNote: req.body && req.body.adminNote,
        resolutionNote: req.body && req.body.resolutionNote,
        refundAmount: req.body && req.body.refundAmount,
        actor: req.user && req.user.email ? req.user.email : "admin",
        note: req.body && req.body.note,
        paymentUpdate: paymentUpdate
          ? {
            paymentId: paymentUpdate.payment ? paymentUpdate.payment.id : "",
            status: paymentUpdate.payment ? paymentUpdate.payment.status : "",
            message: paymentUpdate.message || "",
            refunded: paymentUpdate.refunded === true,
            amountRefunded: paymentUpdate.payment ? Number(paymentUpdate.payment.amountRefunded || 0) : 0
          }
          : null
      });

      if (!result.ok) {
        throw createHttpError(result.status || 400, result.message || "Unable to update after-sales case.");
      }

      recordAdminAudit(currentDb, req, {
        category: "after_sales",
        actionKey: "after_sales_case_updated",
        actionLabel: "After-sales case updated",
        entityType: "after_sales_case",
        entityId: caseItem.id,
        orderId: caseItem.orderId,
        caseId: caseItem.id,
        summary: `Moved ${caseItem.type} case ${caseItem.id.slice(0, 8)} from ${previousStatus || "unknown"} to ${caseItem.status}.`,
        details: {
          previousStatus,
          status: caseItem.status,
          previousType,
          type: caseItem.type,
          adminNote: req.body && req.body.adminNote ? req.body.adminNote : "",
          resolutionNote: req.body && req.body.resolutionNote ? req.body.resolutionNote : ""
        }
      });
      if (paymentUpdate) {
        recordAdminAudit(currentDb, req, {
          category: "refund",
          actionKey: "after_sales_refund_updated",
          actionLabel: "Refund updated from after-sales case",
          entityType: "payment",
          entityId: paymentUpdate.payment && paymentUpdate.payment.id ? paymentUpdate.payment.id : "",
          orderId: order.id,
          paymentId: paymentUpdate.payment && paymentUpdate.payment.id ? paymentUpdate.payment.id : "",
          caseId: caseItem.id,
          summary: `Refund ${paymentUpdate.payment && paymentUpdate.payment.status ? paymentUpdate.payment.status : "updated"} for order ${order.id}.`,
          details: {
            caseType: caseItem.type,
            caseStatus: caseItem.status,
            refundAmount: paymentUpdate.payment ? Number(paymentUpdate.payment.amountRefunded || paymentUpdate.payment.amount || 0) : 0,
            paymentStatus: paymentUpdate.payment && paymentUpdate.payment.status ? paymentUpdate.payment.status : "",
            refunded: paymentUpdate.refunded === true
          }
        });
      }

      persistAdminMutation(currentDb, ["orders", "payments", "afterSalesCases", "adminAuditTrail"]);
      return {
        status: 200,
        body: {
          message: "After-sales case updated successfully.",
          caseItem: enrichAfterSalesCase(currentDb, caseItem),
          paymentUpdate,
          summary: buildAfterSalesSummary(currentDb.afterSalesCases)
        }
      };
    });

    return res.status(committed.status).json(committed.body);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Unable to update after-sales case."
    });
  }
});

router.get("/order-notifications", (req, res) => {
  const db = readDb();
  const notifications = listOrderNotifications(db, Number(req.query.limit || 100));
  const counts = notifications.reduce((accumulator, item) => {
    const key = String(item.status || "queued");
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});
  return res.json({
    count: notifications.length,
    counts,
    notifications
  });
});

router.get("/phone-verification-automation", (req, res) => {
  const db = readDb();
  return res.json(getPhoneVerificationAutomationSnapshot(db, Number(req.query.limit || 50)));
});

router.patch("/phone-verification-automation/settings", (req, res) => {
  const db = readDb();
  const currentSettings = ensurePhoneVerificationAutomationSettings(db);
  const channels = Array.isArray(req.body && req.body.channels) ? req.body.channels : [];
  if (Array.isArray(req.body && req.body.channels) && channels.length === 0) {
    return res.status(400).json({ message: "Select at least one reminder channel." });
  }

  const nextSettings = normalizePhoneVerificationAutomationSettings(
    {
      ...currentSettings,
      ...(req.body || {}),
      updatedAt: new Date().toISOString(),
      updatedBy: req.user && req.user.email ? req.user.email : "admin"
    },
    currentSettings
  );
  db.automationSettings.phoneVerificationReminder = nextSettings;
  writeDb(db);
  startPhoneVerificationAutomationScheduler();
  return res.json({
    message: "Phone verification automation settings saved.",
    ...getPhoneVerificationAutomationSnapshot(db, Number(req.query.limit || 50))
  });
});

router.post("/phone-verification-automation/run", async (req, res) => {
  const result = await executePhoneVerificationAutomationJob({
    limit: Number(req.body && req.body.limit ? req.body.limit : 25),
    actor: req.user && req.user.email ? req.user.email : "admin",
    trigger: "admin"
  });
  return res.status(result.status || 200).json({
    message: result.message,
    run: result,
    ...(result.snapshot || {})
  });
});

router.post("/order-notifications/:id/resend", async (req, res) => {
  const db = readDb();
  const result = await resendOrderNotification(db, req.params.id, {
    triggeredBy: "admin-resend",
    triggeredFrom: "admin-dashboard"
  });
  if (!result.ok) {
    if (result.notification) {
      writeDb(db);
    }
    return res.status(result.status || 500).json({
      message: result.message || "Unable to resend notification.",
      notification: result.notification || null
    });
  }
  recordAdminAudit(db, req, {
    category: "notification",
    actionKey: "order_notification_resent",
    actionLabel: "Order notification resent",
    entityType: "order_notification",
    entityId: result.notification && result.notification.id ? result.notification.id : req.params.id,
    orderId: result.notification && result.notification.orderId ? result.notification.orderId : "",
    summary: `Resent ${String(result.notification && result.notification.channel ? result.notification.channel : "order")} notification${result.notification && result.notification.orderId ? ` for order ${result.notification.orderId}` : ""}.`,
    details: {
      channel: result.notification && result.notification.channel ? result.notification.channel : "",
      status: result.notification && result.notification.status ? result.notification.status : "",
      provider: result.notification && result.notification.provider ? result.notification.provider : "",
      eventKey: result.notification && result.notification.eventKey ? result.notification.eventKey : ""
    }
  });
  writeDb(db);
  return res.json({
    message: result.message,
    notification: result.notification
  });
});

router.get("/sales", (req, res) => {
  const db = readDb();
  const usersById = new Map(db.users.map((user) => [user.id, user]));
  const orderSource = isSqliteOrderPaymentQueriesEnabled() ? listSqliteOrders({}) : db.orders;
  const salesOrders = orderSource
    .filter((order) => order.paymentStatus === "paid" || order.paymentStatus === "authorized")
    .map((order) => {
      const customer = usersById.get(order.userId) || {};
      return {
        orderId: order.id,
        userId: order.userId,
        customerName: customer.name || "Unknown",
        customerEmail: customer.email || "N/A",
        itemCount: Array.isArray(order.items)
          ? order.items.reduce((sum, item) => sum + asNumber(item.quantity || 1), 0)
          : 0,
        total: asNumber(order.total),
        paymentStatus: order.paymentStatus || "pending",
        orderStatus: order.status || "processing",
        createdAt: order.createdAt || null
      };
    })
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

  const totalRevenue = salesOrders.reduce((sum, sale) => sum + asNumber(sale.total), 0);
  return res.json({
    count: salesOrders.length,
    totalRevenue,
    sales: salesOrders
  });
});

router.get("/catalog", (req, res) => {
  const db = readDb();
  const productSource = isSqliteProductQueriesEnabled() ? listSqliteProducts({ status: "all" }) : db.products;
  const inventorySettings = normalizeInventorySettings(db.inventorySettings, productSource);
  const products = productSource
    .map((product) => ({
      categoryToken: normalizeCategoryToken(product.category || "other"),
      id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category || "other",
      segment: product.segment || "b2c",
      price: asNumber(product.price),
      listPrice: asNumber(product.listPrice || product.price),
      stock: asNumber(product.stock),
      rating: asNumber(product.rating),
      moq: asNumber(product.moq || 0),
      sku: String(product.sku || ""),
      status: String(product.status || "active"),
      fulfillment: String(product.fulfillment || "fbm"),
      featured: Boolean(product.featured),
      description: String(product.description || ""),
      keywords: Array.isArray(product.keywords) ? product.keywords : [],
      collections: normalizeCollectionValues(product.collections, product.category),
      image: String(product.image || "")
    }))
    .map((product) => ({
      ...product,
      lowStockThreshold: normalizeThreshold(
        inventorySettings.categoryThresholds[product.categoryToken],
        inventorySettings.defaultLowStockThreshold
      ),
      discountPercent: product.listPrice > 0 && product.listPrice > product.price
        ? Number((((product.listPrice - product.price) / product.listPrice) * 100).toFixed(1))
        : 0,
      inventoryStatus: product.stock <= 0
        ? "out"
        : (product.stock <= normalizeThreshold(
          inventorySettings.categoryThresholds[product.categoryToken],
          inventorySettings.defaultLowStockThreshold
        ) ? "low" : "healthy")
    }))
    .map(({ categoryToken, ...product }) => product)
    .sort((a, b) => a.name.localeCompare(b.name));

  const totalInventoryValue = products.reduce((sum, item) => sum + item.price * item.stock, 0);
  return res.json({
    count: products.length,
    totalInventoryValue,
    inventorySettings,
    products
  });
});

router.get("/inventory-settings", (req, res) => {
  const db = readDb();
  const productSource = isSqliteProductQueriesEnabled() ? listSqliteProducts({ status: "all" }) : db.products;
  return res.json(normalizeInventorySettings(db.inventorySettings, productSource));
});

router.patch("/inventory-settings", (req, res) => {
  const db = readDb();
  const productSource = isSqliteProductQueriesEnabled() ? listSqliteProducts({ status: "all" }) : db.products;
  const nextSettings = normalizeInventorySettings(req.body || {}, productSource);
  db.inventorySettings = nextSettings;
  recordAdminAudit(db, req, {
    category: "catalog",
    actionKey: "inventory_settings_updated",
    actionLabel: "Inventory settings updated",
    entityType: "inventory_settings",
    entityId: "default",
    summary: `Inventory thresholds updated. Default low stock ${nextSettings.defaultLowStockThreshold}, restock target ${nextSettings.restockTarget}.`,
    details: {
      defaultLowStockThreshold: nextSettings.defaultLowStockThreshold,
      restockTarget: nextSettings.restockTarget,
      categoryThresholdCount: Object.keys(nextSettings.categoryThresholds || {}).length
    }
  });
  writeDb(db);
  return res.json(nextSettings);
});

router.get("/analytics", (req, res) => {
  const db = readDb();
  ensureBackInStockCollections(db);
  const productSource = isSqliteProductQueriesEnabled() ? listSqliteProducts({ status: "all" }) : db.products;
  const orderSource = isSqliteOrderPaymentQueriesEnabled() ? listSqliteOrders({}) : db.orders;
  const paidOrders = orderSource.filter((order) => order.paymentStatus === "paid" || order.paymentStatus === "authorized");
  const totalRevenue = paidOrders.reduce((sum, order) => sum + asNumber(order.total), 0);
  const totalOrders = orderSource.length;
  const deliveredOrders = orderSource.filter((order) => order.status === "delivered").length;
  const cancelledOrders = orderSource.filter((order) => order.status === "cancelled").length;
  const openBackInStockRequests = db.backInStockRequests.filter((item) => String(item.status || "open") === "open").length;

  const todayKey = isoDay(new Date());
  const ordersToday = orderSource.filter((order) => order.createdAt && isoDay(new Date(order.createdAt)) === todayKey).length;

  return res.json({
    kpis: {
      averageOrderValue: paidOrders.length ? totalRevenue / paidOrders.length : 0,
      paidOrders: paidOrders.length,
      deliveredRate: totalOrders ? (deliveredOrders / totalOrders) * 100 : 0,
      cancellationRate: totalOrders ? (cancelledOrders / totalOrders) * 100 : 0,
      ordersToday,
      revenueLast7Days: buildRevenueSeries(paidOrders, 7).reduce((sum, slot) => sum + slot.revenue, 0),
      openBackInStockRequests
    },
    ordersByStatus: countBy(
      orderSource,
      (order) => order.status || "processing",
      ["processing", "shipped", "delivered", "cancelled"]
    ),
    paymentsByMethod: countBy(db.payments, (payment) => payment.method || "unknown"),
    revenueLast7Days: buildRevenueSeries(paidOrders, 7),
    topProducts: topProducts(paidOrders)
  });
});

router.get("/back-in-stock/requests", (req, res) => {
  const db = readDb();
  ensureBackInStockCollections(db);
  const requests = listBackInStockRequests(db, {
    search: req.query.search || "",
    status: req.query.status || "all"
  });
  const demandByProduct = getBackInStockDemandSummary(db).slice(0, 12);
  const statusCounts = {
    open: 0,
    notified: 0,
    queued: 0,
    closed: 0,
    unsubscribed: 0
  };
  db.backInStockRequests.forEach((item) => {
    const key = String(item.status || "open");
    statusCounts[key] = (statusCounts[key] || 0) + 1;
  });

  const recentNotifications = [...db.backInStockNotifications]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 20);

  return res.json({
    count: requests.length,
    requests,
    demandByProduct,
    statusCounts,
    recentNotifications
  });
});

router.post("/back-in-stock/notify/:productId", async (req, res) => {
  const db = readDb();
  ensureBackInStockCollections(db);
  const productId = String(req.params.productId || "");
  const product = isSqliteProductQueriesEnabled()
    ? getSqliteProductById(productId)
    : db.products.find((item) => String(item.id) === productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }
  if (asNumber(product.stock) <= 0) {
    return res.status(400).json({ message: "Cannot send notifications while product is out of stock." });
  }

  try {
    const summary = await dispatchBackInStockNotifications(db, product, {
      triggeredBy: "manual-notify",
      triggeredFrom: "admin-dashboard"
    });
    writeDb(db);
    return res.json({
      message: `Notifications processed. Sent: ${summary.sent}, Queued: ${summary.queued}, Failed: ${summary.failed}.`,
      summary
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to process notifications." });
  }
});

router.patch("/back-in-stock/requests/:id/status", (req, res) => {
  const db = readDb();
  ensureBackInStockCollections(db);
  const result = setBackInStockRequestStatus(db, req.params.id, req.body && req.body.status);
  if (!result.ok) {
    return res.status(result.status || 400).json({ message: result.message || "Unable to update request status." });
  }
  writeDb(db);
  return res.json(result.request);
});

router.post("/media/upload-drive", async (req, res) => {
  const payload = req.body || {};
  const files = Array.isArray(payload.files) ? payload.files : [];
  const folderId = String(payload.folderId || "").trim();
  const category = String(payload.category || "").trim();

  if (!files.length) {
    return res.status(400).json({ message: "files array is required" });
  }
  if (files.length > MAX_MEDIA_UPLOAD_ITEMS) {
    return res.status(400).json({ message: `Maximum ${MAX_MEDIA_UPLOAD_ITEMS} files allowed per upload.` });
  }
  if (!isDriveConfigured()) {
    return res.status(503).json({
      message: "Google Drive upload is not configured. Set service account env variables on backend."
    });
  }

  try {
    const uploaded = [];

    for (let index = 0; index < files.length; index += 1) {
      const item = files[index] || {};
      const fileName = String(item.name || `upload-${Date.now()}-${index + 1}`).trim();
      const { mimeType: fromDataUrlMime, buffer } = parseDataUrl(item.dataUrl);
      const mimeType = String(item.mimeType || fromDataUrlMime || "application/octet-stream").toLowerCase();
      const maxBytes = readUploadMaxBytes(mimeType);

      if (buffer.length > maxBytes) {
        const maxMb = Math.round(maxBytes / (1024 * 1024));
        return res.status(413).json({ message: `"${fileName}" exceeds ${maxMb} MB upload limit.` });
      }

      const record = await uploadBufferToDrive({
        buffer,
        mimeType,
        fileName,
        parentFolderId: folderId,
        category
      });

      uploaded.push({
        id: record.id,
        name: record.name,
        mimeType: record.mimeType,
        size: record.size,
        url: record.directUrl,
        webViewLink: record.webViewLink
      });
    }

    return res.status(201).json({
      count: uploaded.length,
      uploaded
    });
  } catch (error) {
    const code = String(error && error.code ? error.code : "");
    if (code === "DRIVE_DEPENDENCY_MISSING") {
      return res.status(500).json({ message: "Install backend dependency: npm install googleapis" });
    }
    if (code === "DRIVE_NOT_CONFIGURED") {
      return res.status(503).json({ message: error.message || "Google Drive is not configured." });
    }
    return res.status(500).json({ message: error.message || "Google Drive upload failed." });
  }
});

router.patch("/orders/:id/status", async (req, res) => {
  const { status } = req.body || {};
  const allowed = ["processing", "shipped", "delivered", "cancelled"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const db = readDb();
  const order = db.orders.find((item) => item.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const previousStatus = String(order.status || "processing");
  const paymentStatus = String(order.paymentStatus || "pending").toLowerCase();
  if ((status === "shipped" || status === "delivered") && !isOrderPaymentCleared(order)) {
    return res.status(409).json({
      message: `Cannot mark this order as ${status} while payment is ${paymentStatus || "pending"}.`
    });
  }
  if (previousStatus === "cancelled" && status !== "cancelled") {
    if (paymentStatus === "refunded" || paymentStatus === "refund_pending") {
      return res.status(409).json({
        message: "Refunded orders cannot be re-opened. Ask the customer to place a fresh order."
      });
    }
    if (paymentStatus === "failed" || paymentStatus === "cancelled" || paymentStatus === "pending") {
      return res.status(409).json({
        message: "This cancelled order does not have a cleared payment state and should not be re-opened."
      });
    }
  }

  let refundGatewayResult = null;
  if (previousStatus !== "cancelled" && status === "cancelled") {
    const latestPayment = getLatestPaymentForOrder(db, order.id);
    if (latestPayment && latestPayment.provider === "razorpay" && latestPayment.status === "captured" && !isRazorpayEnabled()) {
      return res.status(503).json({ message: "Razorpay refund is not configured on this backend." });
    }
    if (latestPayment && latestPayment.provider === "razorpay" && latestPayment.status === "captured" && isRazorpayEnabled()) {
      const gatewayPaymentId = String(latestPayment && latestPayment.metadata && latestPayment.metadata.gatewayPaymentId ? latestPayment.metadata.gatewayPaymentId : "").trim();
      if (!gatewayPaymentId) {
        return res.status(409).json({ message: "Gateway payment reference missing for refund." });
      }
      try {
        const gatewayRefund = await createRazorpayRefund(gatewayPaymentId, {
          amount: latestPayment.amountCaptured || latestPayment.amount,
          notes: {
            internalOrderId: String(order.id || "").slice(0, 40),
            internalPaymentId: String(latestPayment.id || "").slice(0, 40)
          }
        });
        refundGatewayResult = mapRazorpayRefundEntity(gatewayRefund);
      } catch (error) {
        return res.status(error.status || 502).json({
          message: error.message || "Unable to initiate payment refund for this cancellation."
        });
      }
    }
  }

  try {
    const committed = await withWriteLock(async () => {
      const currentDb = readDb();
      const currentOrder = currentDb.orders.find((item) => item.id === req.params.id);
      if (!currentOrder) {
        throw createHttpError(404, "Order not found");
      }

      const currentPreviousStatus = String(currentOrder.status || "processing");
      const currentPaymentStatus = String(currentOrder.paymentStatus || "pending").toLowerCase();
      if ((status === "shipped" || status === "delivered") && !isOrderPaymentCleared(currentOrder)) {
        throw createHttpError(409, `Cannot mark this order as ${status} while payment is ${currentPaymentStatus || "pending"}.`);
      }
      if (currentPreviousStatus === "cancelled" && status !== "cancelled") {
        if (currentPaymentStatus === "refunded" || currentPaymentStatus === "refund_pending") {
          throw createHttpError(409, "Refunded orders cannot be re-opened. Ask the customer to place a fresh order.");
        }
        if (currentPaymentStatus === "failed" || currentPaymentStatus === "cancelled" || currentPaymentStatus === "pending") {
          throw createHttpError(409, "This cancelled order does not have a cleared payment state and should not be re-opened.");
        }
        const reReserve = reReserveInventoryForOrder(currentDb, currentOrder, {
          reason: "admin-reopen",
          at: new Date().toISOString()
        });
        if (!reReserve.ok) {
          throw createHttpError(reReserve.status || 409, reReserve.message || "Unable to re-open order because stock is no longer available.");
        }
      }

      currentOrder.status = status;
      if (currentPreviousStatus !== status) {
        currentOrder.statusHistory = appendOrderStatusEvent(currentOrder, status);
      } else {
        currentOrder.statusHistory = withNormalizedOrderStatusHistory(currentOrder).statusHistory;
      }

      if (currentPreviousStatus !== "cancelled" && status === "cancelled") {
        const currentLatestPayment = getLatestPaymentForOrder(currentDb, currentOrder.id);
        if (
          currentLatestPayment
          && currentLatestPayment.provider === "razorpay"
          && currentLatestPayment.status === "captured"
          && !refundGatewayResult
        ) {
          throw createHttpError(409, "Payment state changed during cancellation. Retry the request.");
        }

        const cancelledAt = new Date().toISOString();
        releaseInventoryForOrder(currentDb, currentOrder, {
          reason: "admin-cancel",
          at: cancelledAt
        });
        cancelOrderPayments(currentDb, currentOrder, {
          at: cancelledAt,
          refundGatewayResult
        });
      }

      const notification = currentPreviousStatus !== status
        ? await dispatchOrderStatusNotification(currentDb, currentOrder, {
          eventKey: status,
          triggeredBy: "admin-order-status-update",
          triggeredFrom: "admin-dashboard"
        })
        : { delivered: false, skipped: true, reason: "status-unchanged" };
      recordAdminAudit(currentDb, req, {
        category: "order",
        actionKey: "order_status_updated",
        actionLabel: "Order status updated",
        entityType: "order",
        entityId: currentOrder.id,
        orderId: currentOrder.id,
        summary: `Changed order ${currentOrder.id} from ${currentPreviousStatus} to ${status}.`,
        details: {
          previousStatus: currentPreviousStatus,
          status,
          paymentStatus: currentOrder.paymentStatus || "",
          notificationStatus: notification && notification.failed
            ? "failed"
            : notification && notification.skipped
              ? "skipped"
              : notification && notification.delivered
                ? "sent"
                : "none"
        }
      });
      if (currentPreviousStatus !== "cancelled" && status === "cancelled") {
        const refundedPayment = getLatestPaymentForOrder(currentDb, currentOrder.id);
        if (refundedPayment && (refundedPayment.status === "refund_pending" || refundedPayment.status === "refunded")) {
          recordAdminAudit(currentDb, req, {
            category: "refund",
            actionKey: "order_cancellation_refund_updated",
            actionLabel: "Cancellation refund updated",
            entityType: "payment",
            entityId: refundedPayment.id,
            orderId: currentOrder.id,
            paymentId: refundedPayment.id,
            summary: `Refund ${refundedPayment.status} for cancelled order ${currentOrder.id}.`,
            details: {
              paymentStatus: refundedPayment.status,
              amountRefunded: Number(refundedPayment.amountRefunded || 0),
              provider: refundedPayment.provider || "",
              method: refundedPayment.method || ""
            }
          });
        }
      }
      persistAdminMutation(currentDb, ["orders", "payments", "products", "orderNotifications", "adminAuditTrail"]);
      return {
        status: 200,
        body: {
          ...withNormalizedOrderStatusHistory(currentOrder),
          notification
        }
      };
    });

    return res.status(committed.status).json(committed.body);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Unable to update order status."
    });
  }
});

module.exports = router;
