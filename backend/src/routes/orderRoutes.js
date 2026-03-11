const express = require("express");
const { randomUUID } = require("crypto");
const { readDb, writeDb, withWriteLock } = require("../lib/db");
const { requireAuth } = require("../middleware/authMiddleware");
const { appendOrderStatusEvent, withNormalizedOrderStatusHistory } = require("../lib/orderStatus");
const { dispatchOrderStatusNotification, listOrderNotificationsForUser } = require("../lib/orderNotifications");
const {
  getSqliteLatestPaymentForOrder,
  getSqliteOrderById,
  isSqliteOrderPaymentQueriesEnabled,
  listSqliteOrders,
  writeSqliteOrderPaymentCollections
} = require("../lib/sqliteOrdersPayments");
const {
  buildOrderPricing,
  releaseInventoryForOrder,
  reserveInventoryForOrder
} = require("../lib/orderCommerce");
const {
  cancelOrderPayments,
  getLatestPaymentForOrder,
  isOnlinePaymentMethod
} = require("../lib/paymentLifecycle");
const {
  createRazorpayRefund,
  isRazorpayEnabled,
  mapRazorpayRefundEntity
} = require("../lib/razorpayGateway");
const { buildReservationUntil } = require("../lib/orderReservationMaintenance");
const {
  AFTER_SALES_REASON_LABELS,
  AFTER_SALES_STATUS_LABELS,
  canCustomerRequestAfterSalesForOrder,
  createAfterSalesCase,
  ensureAfterSalesCollections,
  getAfterSalesStatusesForType,
  isFinalAfterSalesStatus,
  normalizeAfterSalesCase
} = require("../lib/afterSalesCases");

const router = express.Router();

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function persistOrderRouteMutation(db, collections) {
  if (isSqliteOrderPaymentQueriesEnabled()) {
    writeSqliteOrderPaymentCollections(db, collections);
    return;
  }
  writeDb(db);
}

function formatAfterSalesTypeLabel(type) {
  const value = String(type || "").trim().toLowerCase();
  if (!value) {
    return "Request";
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function buildAfterSalesCaseView(caseItem) {
  const normalizedCase = normalizeAfterSalesCase(caseItem);
  const timeline = Array.isArray(normalizedCase.timeline) ? [...normalizedCase.timeline] : [];
  const latestUpdate = timeline.length
    ? [...timeline].sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime())[0]
    : null;
  return {
    ...normalizedCase,
    typeLabel: formatAfterSalesTypeLabel(normalizedCase.type),
    reasonLabel: AFTER_SALES_REASON_LABELS[normalizedCase.reason] || formatAfterSalesTypeLabel(normalizedCase.reason),
    statusLabel: AFTER_SALES_STATUS_LABELS[normalizedCase.status] || formatAfterSalesTypeLabel(normalizedCase.status),
    latestUpdate,
    final: isFinalAfterSalesStatus(normalizedCase.status),
    statusOptions: getAfterSalesStatusesForType(normalizedCase.type)
  };
}

function withOrderAfterSales(db, order) {
  ensureAfterSalesCollections(db);
  const afterSalesCases = db.afterSalesCases
    .filter((item) => item.orderId === order.id)
    .map((item) => buildAfterSalesCaseView(item))
    .sort((left, right) => new Date(right.updatedAt || right.createdAt || 0).getTime() - new Date(left.updatedAt || left.createdAt || 0).getTime());
  const openCase = afterSalesCases.find((item) => !item.final) || null;
  return {
    ...withNormalizedOrderStatusHistory(order),
    afterSalesCases,
    openAfterSalesCaseId: openCase ? openCase.id : "",
    canRequestAfterSales: canCustomerRequestAfterSalesForOrder(order) && !openCase
  };
}

router.post("/", requireAuth, async (req, res) => {
  const {
    items = [],
    shippingAddress = "",
    paymentMethod = "cod",
    couponCode = "",
    deliverySlot = null,
    reservationUntil = ""
  } = req.body || {};
  if (!Array.isArray(items) || items.length === 0 || !shippingAddress) {
    return res.status(400).json({ message: "Invalid order payload" });
  }

  const db = readDb();
  const pricing = buildOrderPricing(items, db.products, { couponCode });
  if (!pricing.ok) {
    return res.status(pricing.status || 400).json({ message: pricing.message || "Unable to create order." });
  }

  const createdAt = new Date().toISOString();
  const effectiveReservationUntil = buildReservationUntil(paymentMethod, reservationUntil, createdAt);
  const order = {
    id: randomUUID(),
    userId: req.user.id,
    items: pricing.items,
    shippingAddress,
    paymentMethod,
    couponCode: pricing.couponCode,
    discount: pricing.discount,
    deliverySlot,
    reservationUntil: effectiveReservationUntil,
    paymentStatus: String(paymentMethod || "").trim().toLowerCase() === "cod" ? "authorized" : "pending",
    status: "processing",
    subtotal: pricing.subtotal,
    shipping: pricing.shipping,
    tax: pricing.tax,
    total: pricing.total,
    createdAt
  };
  order.statusHistory = appendOrderStatusEvent(order, "processing", createdAt);

  const inventory = reserveInventoryForOrder(db, order, { at: createdAt });
  if (!inventory.ok) {
    return res.status(inventory.status || 409).json({
      message: inventory.message || "Unable to reserve inventory for this order."
    });
  }

  db.orders.push(order);
  const notification = isOnlinePaymentMethod(paymentMethod)
    ? { skipped: true, reason: "awaiting-payment-confirmation" }
    : await dispatchOrderStatusNotification(db, order, {
      eventKey: "ordered",
      triggeredBy: "order-create",
      triggeredFrom: "checkout"
    });
  persistOrderRouteMutation(db, ["orders", "products", "orderNotifications"]);
  return res.status(201).json({
    ...withOrderAfterSales(db, order),
    notification
  });
});

router.get("/my", requireAuth, (req, res) => {
  const db = readDb();
  const orderSource = isSqliteOrderPaymentQueriesEnabled()
    ? listSqliteOrders({ userId: req.user.id })
    : db.orders;
  const orders = orderSource
    .filter((order) => order.userId === req.user.id)
    .map((order) => withOrderAfterSales(db, order));
  return res.json({ count: orders.length, orders });
});

router.get("/notifications", requireAuth, (req, res) => {
  const db = readDb();
  const notifications = listOrderNotificationsForUser(db, req.user, Number(req.query.limit || 50));
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

router.get("/:id", requireAuth, (req, res) => {
  const db = readDb();
  const order = isSqliteOrderPaymentQueriesEnabled()
    ? getSqliteOrderById(req.params.id)
    : db.orders.find((item) => item.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  if (order.userId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  return res.json(withOrderAfterSales(db, order));
});

router.post("/:id/after-sales", requireAuth, async (req, res) => {
  try {
    const committed = await withWriteLock(async () => {
      const currentDb = readDb();
      ensureAfterSalesCollections(currentDb);
      const order = currentDb.orders.find((item) => item.id === req.params.id);
      if (!order) {
        throw createHttpError(404, "Order not found");
      }
      if (order.userId !== req.user.id && req.user.role !== "admin") {
        throw createHttpError(403, "Forbidden");
      }
      if (!canCustomerRequestAfterSalesForOrder(order)) {
        throw createHttpError(409, "This order is not eligible for a new return, refund, or exchange request.");
      }

      const user = currentDb.users.find((item) => item.id === order.userId) || null;
      const result = createAfterSalesCase(currentDb, order, {
        type: req.body && req.body.type,
        reason: req.body && req.body.reason,
        requestedBy: req.user.role === "admin" ? "admin" : "customer",
        customerName: user && user.name ? user.name : req.user.name || "",
        customerEmail: user && user.email ? user.email : req.user.email || "",
        customerMobile: user && user.mobile ? user.mobile : "",
        note: req.body && req.body.note ? req.body.note : "",
        refundAmount: req.body && req.body.refundAmount !== undefined ? req.body.refundAmount : order.total,
        currency: "INR"
      });

      if (!result.ok) {
        throw createHttpError(result.status || 400, result.message || "Unable to submit after-sales request.");
      }

      writeDb(currentDb);
      return {
        status: result.status || 201,
        body: {
          message: "Your after-sales request has been submitted.",
          caseItem: buildAfterSalesCaseView(result.caseItem),
          order: withOrderAfterSales(currentDb, order)
        }
      };
    });

    return res.status(committed.status).json(committed.body);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Unable to submit after-sales request."
    });
  }
});

router.patch("/:id/cancel", requireAuth, async (req, res) => {
  const db = readDb();
  const order = db.orders.find((item) => item.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  if (order.userId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  if (order.status === "delivered") {
    return res.status(400).json({ message: "Delivered orders cannot be cancelled" });
  }
  if (order.status === "cancelled") {
    return res.json({
      message: "Order is already cancelled.",
      ...withNormalizedOrderStatusHistory(order),
      notification: { skipped: true, reason: "already-cancelled" }
    });
  }

  let refundGatewayResult = null;
  const latestPayment = isSqliteOrderPaymentQueriesEnabled()
    ? getSqliteLatestPaymentForOrder(order.id)
    : getLatestPaymentForOrder(db, order.id);
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

  try {
    const committed = await withWriteLock(async () => {
      const currentDb = readDb();
      const currentOrder = currentDb.orders.find((item) => item.id === req.params.id);
      if (!currentOrder) {
        throw createHttpError(404, "Order not found");
      }
      if (currentOrder.userId !== req.user.id && req.user.role !== "admin") {
        throw createHttpError(403, "Forbidden");
      }
      if (currentOrder.status === "delivered") {
        throw createHttpError(400, "Delivered orders cannot be cancelled");
      }
      if (currentOrder.status === "cancelled") {
        return {
          status: 200,
          body: {
            message: "Order is already cancelled.",
            ...withOrderAfterSales(currentDb, currentOrder),
            notification: { skipped: true, reason: "already-cancelled" }
          }
        };
      }

      const currentLatestPayment = getLatestPaymentForOrder(currentDb, currentOrder.id);
      if (
        currentLatestPayment
        && currentLatestPayment.provider === "razorpay"
        && currentLatestPayment.status === "captured"
        && !refundGatewayResult
      ) {
        throw createHttpError(409, "Payment state changed during cancellation. Retry the cancellation request.");
      }

      currentOrder.status = "cancelled";
      const cancelledAt = new Date().toISOString();
      currentOrder.statusHistory = appendOrderStatusEvent(currentOrder, "cancelled", cancelledAt);
      releaseInventoryForOrder(currentDb, currentOrder, {
        reason: "customer-cancel",
        at: cancelledAt
      });
      const paymentUpdate = cancelOrderPayments(currentDb, currentOrder, {
        at: cancelledAt,
        refundGatewayResult
      });
      const notification = await dispatchOrderStatusNotification(currentDb, currentOrder, {
        eventKey: "cancelled",
        triggeredBy: "order-cancel",
        triggeredFrom: "customer"
      });
      persistOrderRouteMutation(currentDb, ["orders", "payments", "products", "orderNotifications"]);
      return {
        status: 200,
        body: {
          ...withOrderAfterSales(currentDb, currentOrder),
          notification,
          paymentUpdate
        }
      };
    });

    return res.status(committed.status).json(committed.body);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Unable to cancel order."
    });
  }
});

module.exports = router;
