const crypto = require("crypto");
const express = require("express");
const { readDb, writeDb, withWriteLock } = require("../lib/db");
const { requireAuth } = require("../middleware/authMiddleware");
const { createMemoryRateLimiter, resolveClientIp } = require("../middleware/rateLimitMiddleware");
const { dispatchOrderStatusNotification } = require("../lib/orderNotifications");
const {
  getSqliteLatestPaymentForOrder,
  getSqliteOrderById,
  getSqlitePaymentById,
  isSqliteOrderPaymentQueriesEnabled,
  writeSqliteOrderPaymentCollections
} = require("../lib/sqliteOrdersPayments");
const {
  appendPaymentEvent,
  cancelOrderPayments,
  confirmPayment,
  createPaymentIntent,
  ensurePaymentCollections,
  getLatestPaymentForOrder,
  isOnlinePaymentMethod,
  refundPayment
} = require("../lib/paymentLifecycle");
const { appendOrderStatusEvent, withNormalizedOrderStatusHistory } = require("../lib/orderStatus");
const { releaseInventoryForOrder } = require("../lib/orderCommerce");
const {
  buildRazorpayCheckoutPayload,
  captureRazorpayPayment,
  createRazorpayOrder,
  createRazorpayRefund,
  fetchRazorpayPayment,
  isRazorpayEnabled,
  mapRazorpayPaymentEntity,
  mapRazorpayRefundEntity,
  verifyRazorpayCheckoutSignature,
  verifyRazorpayWebhookSignature
} = require("../lib/razorpayGateway");
const { logError, logInfo } = require("../lib/logger");

const router = express.Router();
const PAYMENT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

const paymentIntentLimiter = createMemoryRateLimiter({
  namespace: "payment-intent",
  windowMs: PAYMENT_RATE_LIMIT_WINDOW_MS,
  max: 24,
  keyGenerator: (req) => {
    const orderId = String(req && req.body && req.body.orderId ? req.body.orderId : "").trim();
    const userId = String(req && req.user && req.user.id ? req.user.id : "guest");
    return `${resolveClientIp(req)}|${userId}|${orderId || "unknown-order"}`;
  },
  message: "Too many payment intent attempts for this order. Please wait before trying again."
});

const paymentConfirmLimiter = createMemoryRateLimiter({
  namespace: "payment-confirm",
  windowMs: PAYMENT_RATE_LIMIT_WINDOW_MS,
  max: 30,
  keyGenerator: (req) => {
    const paymentId = String(req && req.params && req.params.paymentId ? req.params.paymentId : "").trim();
    const userId = String(req && req.user && req.user.id ? req.user.id : "guest");
    return `${resolveClientIp(req)}|${userId}|${paymentId || "unknown-payment"}`;
  },
  message: "Too many payment confirmation attempts. Please wait before trying again."
});

const paymentWebhookLimiter = createMemoryRateLimiter({
  namespace: "payment-webhook",
  windowMs: 5 * 60 * 1000,
  max: 240,
  keyGenerator: (req) => resolveClientIp(req),
  message: "Too many webhook events received. Please retry shortly."
});

function canAccessOrder(req, order) {
  return order && (order.userId === req.user.id || req.user.role === "admin");
}

function createHttpError(status, message, extra = {}) {
  const error = new Error(message);
  error.status = status;
  Object.assign(error, extra);
  return error;
}

function clearGatewayProvisioning(payment) {
  if (!payment || !payment.metadata || typeof payment.metadata !== "object") {
    return;
  }
  delete payment.metadata.gatewayProvisioning;
}

function persistPaymentRouteMutation(db, collections) {
  if (isSqliteOrderPaymentQueriesEnabled()) {
    writeSqliteOrderPaymentCollections(db, collections);
    return;
  }
  writeDb(db);
}

router.get("/config", (req, res) => {
  const razorpayEnabled = isRazorpayEnabled();
  return res.json({
    provider: razorpayEnabled ? "razorpay" : "simulated",
    razorpayEnabled,
    onlineCheckoutLabel: razorpayEnabled ? "Razorpay Secure Checkout" : "Built-in payment flow"
  });
});

function ensureWebhookEventCollection(db) {
  if (!Array.isArray(db.paymentWebhookEvents)) {
    db.paymentWebhookEvents = [];
  }
  return db.paymentWebhookEvents;
}

function toIsoDate(value, fallback = "") {
  if (value === null || value === undefined || value === "") {
    return fallback ? String(fallback) : "";
  }
  const asNumber = Number(value);
  if (Number.isFinite(asNumber) && asNumber > 0) {
    const millis = asNumber > 1e12 ? asNumber : asNumber * 1000;
    const fromEpoch = new Date(millis);
    if (!Number.isNaN(fromEpoch.getTime())) {
      return fromEpoch.toISOString();
    }
  }
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }
  return fallback ? String(fallback) : "";
}

function hashWebhookPayload(rawBody) {
  return crypto
    .createHash("sha256")
    .update(String(rawBody || ""))
    .digest("hex");
}

function resolveWebhookEventId(eventId, eventName, paymentEntity = {}, refundEntity = {}, payloadHash = "") {
  const normalizedEventId = String(eventId || "").trim();
  if (normalizedEventId) {
    return normalizedEventId;
  }
  const fallbackSeed = JSON.stringify({
    eventName: String(eventName || "").trim().toLowerCase(),
    paymentId: String(paymentEntity && paymentEntity.id ? paymentEntity.id : "").trim(),
    gatewayOrderId: String(paymentEntity && paymentEntity.order_id ? paymentEntity.order_id : "").trim(),
    refundId: String(refundEntity && refundEntity.id ? refundEntity.id : "").trim(),
    refundPaymentId: String(refundEntity && refundEntity.payment_id ? refundEntity.payment_id : "").trim(),
    payloadHash: String(payloadHash || "").trim()
  });
  const digest = crypto.createHash("sha256").update(fallbackSeed).digest("hex").slice(0, 24);
  return `rzp-fallback-${digest}`;
}

function markWebhookEvent(entry, patch = {}) {
  if (!entry || typeof entry !== "object") {
    return;
  }
  Object.assign(entry, patch);
  entry.updatedAt = new Date().toISOString();
}

function rememberWebhookEvent(db, details = {}) {
  const events = ensureWebhookEventCollection(db);
  const now = new Date().toISOString();
  const normalizedId = String(details.id || "").trim() || `webhook-${Date.now()}`;
  const existing = events.find((entry) => String(entry && entry.id ? entry.id : "") === normalizedId);
  if (existing) {
    markWebhookEvent(existing, {
      lastSeenAt: now,
      duplicateCount: Number(existing.duplicateCount || 0) + 1,
      attemptCount: Number(existing.attemptCount || 1) + 1
    });
    return {
      accepted: false,
      entry: existing
    };
  }

  const entry = {
    id: normalizedId,
    source: "razorpay",
    event: String(details.eventName || "").trim().toLowerCase(),
    requestId: String(details.requestId || "").trim(),
    ip: String(details.ip || "").trim(),
    payloadHash: String(details.payloadHash || "").trim(),
    gatewayPaymentId: String(details.gatewayPaymentId || "").trim(),
    gatewayOrderId: String(details.gatewayOrderId || "").trim(),
    gatewayRefundId: String(details.gatewayRefundId || "").trim(),
    gatewayCreatedAt: toIsoDate(details.gatewayCreatedAt),
    status: "received",
    outcome: "received",
    reason: "",
    duplicateCount: 0,
    attemptCount: 1,
    paymentId: "",
    orderId: "",
    notification: null,
    createdAt: now,
    receivedAt: now,
    processedAt: "",
    lastSeenAt: now,
    updatedAt: now
  };
  events.push(entry);
  db.paymentWebhookEvents = events.slice(-500);
  return {
    accepted: true,
    entry
  };
}

function findPaymentFromGateway(db, paymentEntity = {}, fallbackOrderId = "") {
  ensurePaymentCollections(db);
  const paymentSource = Array.isArray(db.payments) ? db.payments : [];
  const notes = paymentEntity.notes && typeof paymentEntity.notes === "object" ? paymentEntity.notes : {};
  const internalPaymentId = String(notes.internalPaymentId || "").trim();
  if (internalPaymentId) {
    const byInternalId = paymentSource.find((payment) => payment.id === internalPaymentId);
    if (byInternalId) {
      return byInternalId;
    }
  }

  const gatewayPaymentId = String(paymentEntity.id || "").trim();
  if (gatewayPaymentId) {
    const byGatewayPaymentId = paymentSource.find((payment) => String(payment && payment.metadata && payment.metadata.gatewayPaymentId ? payment.metadata.gatewayPaymentId : "") === gatewayPaymentId);
    if (byGatewayPaymentId) {
      return byGatewayPaymentId;
    }
  }

  const gatewayOrderId = String(paymentEntity.order_id || fallbackOrderId || "").trim();
  if (gatewayOrderId) {
    const byGatewayOrderId = paymentSource.find((payment) => {
      return String(payment.gatewayReference || "") === gatewayOrderId
        || String(payment && payment.metadata && payment.metadata.gatewayOrderId ? payment.metadata.gatewayOrderId : "") === gatewayOrderId;
    });
    if (byGatewayOrderId) {
      return byGatewayOrderId;
    }
  }

  const internalOrderId = String(notes.internalOrderId || "").trim();
  if (internalOrderId) {
    return getLatestPaymentForOrder(db, internalOrderId);
  }

  return null;
}

function buildFailureFromClient(details = {}) {
  const error = details && typeof details.error === "object" ? details.error : {};
  const metadata = error && typeof error.metadata === "object" ? error.metadata : {};
  const paymentId = String(details.razorpay_payment_id || metadata.payment_id || "").trim();
  const orderId = String(details.razorpay_order_id || metadata.order_id || "").trim();
  return {
    paymentId,
    orderId,
    gatewayResult: {
      provider: "razorpay",
      status: "failed",
      gatewayOrderId: orderId,
      gatewayPaymentId: paymentId,
      failure: {
        code: String(error.code || "payment_failed").trim(),
        message: String(error.description || error.reason || "Payment failed at Razorpay.").trim()
      },
      gatewayPayload: {
        error: {
          code: String(error.code || ""),
          description: String(error.description || ""),
          reason: String(error.reason || ""),
          source: String(error.source || ""),
          step: String(error.step || "")
        }
      }
    }
  };
}

async function notifyIfPaymentCaptured(db, payment, order, result, triggeredBy, triggeredFrom) {
  if (!result.ok || result.alreadyProcessed === true || String(payment.method || "").toLowerCase() === "cod") {
    return { skipped: true, reason: "payment-not-captured" };
  }
  return dispatchOrderStatusNotification(db, order, {
    eventKey: "ordered",
    triggeredBy,
    triggeredFrom
  });
}

async function notifyIfPaymentFailed(db, order, result, triggeredBy, triggeredFrom) {
  if (result.ok || result.status !== 402 || String(order.status || "").toLowerCase() !== "cancelled") {
    return { skipped: true, reason: "payment-not-failed" };
  }
  return dispatchOrderStatusNotification(db, order, {
    eventKey: "cancelled",
    triggeredBy,
    triggeredFrom
  });
}

router.post("/webhooks/razorpay", paymentWebhookLimiter, async (req, res) => {
  if (!isRazorpayEnabled()) {
    return res.status(503).json({ message: "Razorpay webhooks are not enabled." });
  }

  const signature = req.headers["x-razorpay-signature"];
  if (!verifyRazorpayWebhookSignature(req.rawBody || "", signature)) {
    return res.status(400).json({ message: "Invalid Razorpay webhook signature." });
  }

  const eventName = String(req.body && req.body.event ? req.body.event : "").trim().toLowerCase() || "unknown";
  const paymentEntity = req.body && req.body.payload && req.body.payload.payment && req.body.payload.payment.entity
    ? req.body.payload.payment.entity
    : null;
  const refundEntity = req.body && req.body.payload && req.body.payload.refund && req.body.payload.refund.entity
    ? req.body.payload.refund.entity
    : null;
  const payloadHash = hashWebhookPayload(req.rawBody || "");
  const eventId = resolveWebhookEventId(
    req.headers["x-razorpay-event-id"],
    eventName,
    paymentEntity || {},
    refundEntity || {},
    payloadHash
  );
  const requestId = String(req.headers["x-request-id"] || req.headers["x-razorpay-request-id"] || "").trim();
  const sourceIp = resolveClientIp(req);

  try {
    const outcome = await withWriteLock(async () => {
      const db = readDb();
      ensurePaymentCollections(db);

      const trackedEvent = rememberWebhookEvent(db, {
        id: eventId,
        eventName,
        requestId,
        ip: sourceIp,
        payloadHash,
        gatewayPaymentId: String(paymentEntity && paymentEntity.id ? paymentEntity.id : refundEntity && refundEntity.payment_id ? refundEntity.payment_id : "").trim(),
        gatewayOrderId: String(paymentEntity && paymentEntity.order_id ? paymentEntity.order_id : "").trim(),
        gatewayRefundId: String(refundEntity && refundEntity.id ? refundEntity.id : "").trim(),
        gatewayCreatedAt: req.body && req.body.created_at ? req.body.created_at : ""
      });

      const webhookEvent = trackedEvent.entry;
      if (!trackedEvent.accepted) {
        markWebhookEvent(webhookEvent, {
          status: "duplicate",
          outcome: "duplicate",
          reason: "duplicate-event"
        });
        persistPaymentRouteMutation(db, ["paymentWebhookEvents"]);
        return {
          statusCode: 200,
          body: {
            ok: true,
            duplicate: true,
            event: eventName,
            eventId
          }
        };
      }

      markWebhookEvent(webhookEvent, {
        status: "processing",
        outcome: "processing",
        reason: ""
      });

      try {
        if (eventName === "payment.authorized" || eventName === "payment.captured" || eventName === "payment.failed") {
          const payment = findPaymentFromGateway(db, paymentEntity);
          if (!payment) {
            markWebhookEvent(webhookEvent, {
              status: "skipped",
              outcome: "payment-not-mapped",
              reason: "payment-not-mapped",
              processedAt: new Date().toISOString()
            });
            persistPaymentRouteMutation(db, ["paymentWebhookEvents"]);
            return {
              statusCode: 202,
              body: { ok: true, skipped: true, reason: "payment-not-mapped", event: eventName, eventId }
            };
          }
          const order = db.orders.find((item) => item.id === payment.orderId);
          if (!order) {
            markWebhookEvent(webhookEvent, {
              status: "skipped",
              outcome: "order-not-found",
              reason: "order-not-found",
              paymentId: payment.id,
              processedAt: new Date().toISOString()
            });
            persistPaymentRouteMutation(db, ["paymentWebhookEvents"]);
            return {
              statusCode: 202,
              body: { ok: true, skipped: true, reason: "order-not-found", event: eventName, eventId }
            };
          }

          let livePayment = paymentEntity;
          if (eventName === "payment.authorized") {
            const gatewayPaymentId = String(paymentEntity && paymentEntity.id ? paymentEntity.id : "").trim();
            if (!gatewayPaymentId) {
              markWebhookEvent(webhookEvent, {
                status: "skipped",
                outcome: "gateway-payment-id-missing",
                reason: "gateway-payment-id-missing",
                paymentId: payment.id,
                orderId: order.id,
                processedAt: new Date().toISOString()
              });
              persistPaymentRouteMutation(db, ["paymentWebhookEvents"]);
              return {
                statusCode: 202,
                body: { ok: true, skipped: true, reason: "gateway-payment-id-missing", event: eventName, eventId }
              };
            }
            livePayment = await captureRazorpayPayment(gatewayPaymentId, payment.amount || order.total, payment.currency || "INR");
          }

          const result = confirmPayment(db, payment, order, {
            at: new Date().toISOString(),
            gatewayResult: mapRazorpayPaymentEntity(livePayment)
          });

          const notification = result.ok
            ? await notifyIfPaymentCaptured(db, payment, order, result, "payment-webhook", "razorpay")
            : await notifyIfPaymentFailed(db, order, result, "payment-webhook-failed", "razorpay");

          markWebhookEvent(webhookEvent, {
            status: "processed",
            outcome: result.ok ? (result.alreadyProcessed ? "payment-already-captured" : "payment-captured") : "payment-failed",
            reason: result.ok ? "" : String(result.message || "").trim(),
            paymentId: payment.id,
            orderId: order.id,
            notification,
            processedAt: new Date().toISOString()
          });

          persistPaymentRouteMutation(db, ["orders", "payments", "products", "orderNotifications", "paymentWebhookEvents"]);
          return {
            statusCode: 200,
            body: {
              ok: true,
              event: eventName,
              eventId,
              paymentId: payment.id,
              orderId: order.id,
              notification
            }
          };
        }

        if (eventName === "refund.created" || eventName === "refund.processed") {
          const gatewayPaymentId = String(refundEntity && refundEntity.payment_id ? refundEntity.payment_id : "").trim();
          if (!gatewayPaymentId) {
            markWebhookEvent(webhookEvent, {
              status: "skipped",
              outcome: "refund-payment-id-missing",
              reason: "refund-payment-id-missing",
              processedAt: new Date().toISOString()
            });
            persistPaymentRouteMutation(db, ["paymentWebhookEvents"]);
            return {
              statusCode: 202,
              body: { ok: true, skipped: true, reason: "refund-payment-id-missing", event: eventName, eventId }
            };
          }

          const payment = db.payments.find((item) => String(item && item.metadata && item.metadata.gatewayPaymentId ? item.metadata.gatewayPaymentId : "") === gatewayPaymentId);
          if (!payment) {
            markWebhookEvent(webhookEvent, {
              status: "skipped",
              outcome: "refund-payment-not-mapped",
              reason: "refund-payment-not-mapped",
              processedAt: new Date().toISOString()
            });
            persistPaymentRouteMutation(db, ["paymentWebhookEvents"]);
            return {
              statusCode: 202,
              body: { ok: true, skipped: true, reason: "refund-payment-not-mapped", event: eventName, eventId }
            };
          }
          const order = db.orders.find((item) => item.id === payment.orderId);
          if (!order) {
            markWebhookEvent(webhookEvent, {
              status: "skipped",
              outcome: "refund-order-not-found",
              reason: "refund-order-not-found",
              paymentId: payment.id,
              processedAt: new Date().toISOString()
            });
            persistPaymentRouteMutation(db, ["paymentWebhookEvents"]);
            return {
              statusCode: 202,
              body: { ok: true, skipped: true, reason: "refund-order-not-found", event: eventName, eventId }
            };
          }

          const refundResult = refundPayment(db, payment, order, {
            at: new Date().toISOString(),
            gatewayResult: mapRazorpayRefundEntity(refundEntity)
          });
          markWebhookEvent(webhookEvent, {
            status: "processed",
            outcome: refundResult.refunded === true ? "refund-completed" : "refund-pending",
            reason: "",
            paymentId: payment.id,
            orderId: order.id,
            processedAt: new Date().toISOString()
          });
          persistPaymentRouteMutation(db, ["orders", "payments", "paymentWebhookEvents"]);
          return {
            statusCode: 200,
            body: {
              ok: true,
              event: eventName,
              eventId,
              paymentId: payment.id,
              orderId: order.id
            }
          };
        }

        markWebhookEvent(webhookEvent, {
          status: "ignored",
          outcome: "ignored",
          reason: "unsupported-event",
          processedAt: new Date().toISOString()
        });
        persistPaymentRouteMutation(db, ["paymentWebhookEvents"]);
        return {
          statusCode: 200,
          body: { ok: true, ignored: true, event: eventName, eventId }
        };
      } catch (error) {
        markWebhookEvent(webhookEvent, {
          status: "failed",
          outcome: "failed",
          reason: String(error && error.message ? error.message : "webhook-processing-failed"),
          processedAt: new Date().toISOString()
        });
        persistPaymentRouteMutation(db, ["paymentWebhookEvents"]);
        return {
          statusCode: error.status || 500,
          body: {
            message: error.message || "Unable to process Razorpay webhook."
          }
        };
      }
    });
    logInfo("payment_webhook_processed", {
      eventName,
      eventId,
      statusCode: Number(outcome && outcome.statusCode ? outcome.statusCode : 200)
    }, {
      requestId: requestId || req.requestId
    });
    return res.status(outcome.statusCode).json(outcome.body);
  } catch (error) {
    logError("payment_webhook_failed", {
      eventName,
      eventId,
      message: error && error.message ? error.message : String(error)
    }, {
      requestId: requestId || req.requestId
    });
    return res.status(error.status || 500).json({
      message: error.message || "Unable to process Razorpay webhook."
    });
  }
});

router.post("/intent", requireAuth, paymentIntentLimiter, async (req, res) => {
  const { orderId, method = "cod" } = req.body || {};
  if (!orderId) {
    return res.status(400).json({ message: "orderId is required" });
  }

  let phaseOne;
  try {
    phaseOne = await withWriteLock(async () => {
      const db = readDb();
      ensurePaymentCollections(db);
      const order = db.orders.find((item) => item.id === orderId);
      if (!order) {
        throw createHttpError(404, "Order not found");
      }
      if (!canAccessOrder(req, order)) {
        throw createHttpError(403, "Forbidden");
      }
      if (String(order.status || "").toLowerCase() === "cancelled") {
        throw createHttpError(409, "Cancelled orders cannot receive payment intents.");
      }
      if (String(order.paymentStatus || "").toLowerCase() === "paid") {
        throw createHttpError(409, "This order is already paid.");
      }
      if (String(order.paymentStatus || "").toLowerCase() === "refunded") {
        throw createHttpError(409, "Refunded orders require a fresh checkout.");
      }

      const useRazorpay = isRazorpayEnabled() && isOnlinePaymentMethod(method);
      const result = createPaymentIntent(db, order, req.user, {
        method,
        provider: useRazorpay ? "razorpay" : undefined
      });
      const user = db.users.find((item) => item.id === order.userId) || {};
      const statusCode = result.created ? 201 : 200;

      if (!useRazorpay) {
        persistPaymentRouteMutation(db, ["orders", "payments"]);
        return {
          ready: true,
          statusCode,
          body: {
            ...result.payment,
            order: withNormalizedOrderStatusHistory(order),
            reused: result.reused === true
          }
        };
      }

      const metadata = result.payment.metadata && typeof result.payment.metadata === "object"
        ? result.payment.metadata
        : {};
      result.payment.provider = "razorpay";
      result.payment.metadata = metadata;

      if (result.payment.gatewayReference) {
        clearGatewayProvisioning(result.payment);
        persistPaymentRouteMutation(db, ["orders", "payments"]);
        return {
          ready: true,
          statusCode,
          body: {
            ...result.payment,
            order: withNormalizedOrderStatusHistory(order),
            reused: result.reused === true,
            checkoutProvider: "razorpay",
            checkout: buildRazorpayCheckoutPayload(result.payment, order, user)
          }
        };
      }

      if (String(metadata.gatewayProvisioning && metadata.gatewayProvisioning.state || "").toLowerCase() === "pending") {
        return {
          ready: true,
          statusCode: 409,
          body: {
            message: "Payment checkout is already being prepared. Retry shortly.",
            paymentId: result.payment.id,
            order: withNormalizedOrderStatusHistory(order)
          }
        };
      }

      result.payment.metadata.gatewayProvisioning = {
        state: "pending",
        requestedAt: new Date().toISOString(),
        requestedBy: String(req.user && req.user.id ? req.user.id : "")
      };
      appendPaymentEvent(result.payment, "requires_confirmation", "Preparing Razorpay checkout.", new Date().toISOString());
      persistPaymentRouteMutation(db, ["orders", "payments"]);

      return {
        ready: false,
        statusCode,
        paymentId: result.payment.id,
        orderId: order.id,
        reused: result.reused === true,
        paymentSnapshot: {
          ...result.payment
        },
        orderSnapshot: {
          ...order
        },
        userSnapshot: {
          ...user
        }
      };
    });
  } catch (error) {
    return res.status(error.status || 502).json({
      message: error.message || "Unable to prepare payment intent."
    });
  }

  if (phaseOne.ready) {
    logInfo("payment_intent_ready", {
      orderId: orderId,
      statusCode: Number(phaseOne.statusCode || 200),
      provider: String(phaseOne && phaseOne.body && phaseOne.body.provider ? phaseOne.body.provider : "simulated")
    }, {
      requestId: req.requestId
    });
    return res.status(phaseOne.statusCode).json(phaseOne.body);
  }

  let gatewayOrder;
  try {
    gatewayOrder = await createRazorpayOrder(phaseOne.paymentSnapshot, phaseOne.orderSnapshot, phaseOne.userSnapshot);
  } catch (error) {
    await withWriteLock(async () => {
      const db = readDb();
      ensurePaymentCollections(db);
      const payment = db.payments.find((item) => item.id === phaseOne.paymentId);
      if (payment && !payment.gatewayReference) {
        clearGatewayProvisioning(payment);
        persistPaymentRouteMutation(db, ["payments"]);
      }
    });
    return res.status(error.status || 502).json({
      message: error.message || "Unable to create gateway payment order."
    });
  }

  try {
    const finalized = await withWriteLock(async () => {
      const db = readDb();
      ensurePaymentCollections(db);
      const payment = db.payments.find((item) => item.id === phaseOne.paymentId);
      if (!payment) {
        throw createHttpError(404, "Payment not found");
      }
      const order = db.orders.find((item) => item.id === phaseOne.orderId);
      if (!order) {
        throw createHttpError(404, "Order not found");
      }
      if (!canAccessOrder(req, order)) {
        throw createHttpError(403, "Forbidden");
      }
      if (String(order.status || "").toLowerCase() === "cancelled") {
        throw createHttpError(409, "Cancelled orders cannot receive payment intents.");
      }
      if (String(order.paymentStatus || "").toLowerCase() === "paid") {
        throw createHttpError(409, "This order is already paid.");
      }
      if (String(order.paymentStatus || "").toLowerCase() === "refunded") {
        throw createHttpError(409, "Refunded orders require a fresh checkout.");
      }

      const user = db.users.find((item) => item.id === order.userId) || {};
      payment.provider = "razorpay";
      if (!payment.gatewayReference) {
        payment.gatewayReference = String(gatewayOrder.id || "").trim();
        payment.metadata = payment.metadata && typeof payment.metadata === "object" ? payment.metadata : {};
        payment.metadata.gatewayOrderId = String(gatewayOrder.id || "").trim();
        payment.metadata.gatewayOrderStatus = String(gatewayOrder.status || "").trim().toLowerCase();
        payment.metadata.gatewayOrderPayload = {
          id: gatewayOrder.id,
          entity: gatewayOrder.entity,
          amount: gatewayOrder.amount,
          currency: gatewayOrder.currency,
          receipt: gatewayOrder.receipt,
          status: gatewayOrder.status
        };
        appendPaymentEvent(payment, "requires_confirmation", "Razorpay order created and ready for checkout.", new Date().toISOString());
      }
      clearGatewayProvisioning(payment);
      persistPaymentRouteMutation(db, ["orders", "payments"]);

      return {
        statusCode: phaseOne.statusCode,
        body: {
          ...payment,
          order: withNormalizedOrderStatusHistory(order),
          reused: phaseOne.reused === true,
          checkoutProvider: "razorpay",
          checkout: buildRazorpayCheckoutPayload(payment, order, user)
        }
      };
    });
    logInfo("payment_intent_gateway_ready", {
      orderId: phaseOne.orderId,
      paymentId: phaseOne.paymentId,
      statusCode: Number(finalized && finalized.statusCode ? finalized.statusCode : 200)
    }, {
      requestId: req.requestId
    });
    return res.status(finalized.statusCode).json(finalized.body);
  } catch (error) {
    logError("payment_intent_gateway_failed", {
      orderId: phaseOne.orderId,
      paymentId: phaseOne.paymentId,
      message: error && error.message ? error.message : String(error)
    }, {
      requestId: req.requestId
    });
    return res.status(error.status || 502).json({
      message: error.message || "Unable to finalize gateway payment order."
    });
  }
});

router.post("/:paymentId/confirm", requireAuth, paymentConfirmLimiter, async (req, res) => {
  const db = readDb();
  ensurePaymentCollections(db);
  const payment = isSqliteOrderPaymentQueriesEnabled()
    ? getSqlitePaymentById(req.params.paymentId)
    : db.payments.find((item) => item.id === req.params.paymentId);
  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }
  if (payment.userId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const order = isSqliteOrderPaymentQueriesEnabled()
    ? getSqliteOrderById(payment.orderId)
    : db.orders.find((item) => item.id === payment.orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const details = req.body && typeof req.body.details === "object" ? req.body.details : req.body || {};
  const persistedProvider = String(payment.provider || "").trim().toLowerCase();
  const clientProvider = String(details.provider || "").trim().toLowerCase();
  if (clientProvider && persistedProvider && clientProvider !== persistedProvider) {
    return res.status(409).json({ message: "Payment provider mismatch for this payment attempt." });
  }
  const useRazorpay = persistedProvider === "razorpay";
  if (useRazorpay && !isRazorpayEnabled()) {
    return res.status(503).json({ message: "Razorpay payment verification is not configured on this backend." });
  }

  let gatewayResult = null;
  try {
    if (useRazorpay && isRazorpayEnabled()) {
      const isExplicitFailure = String(details.status || "").trim().toLowerCase() === "failed" || Boolean(details.error);

      if (isExplicitFailure) {
        const failed = buildFailureFromClient(details);
        if (failed.paymentId) {
          const liveFailedPayment = await fetchRazorpayPayment(failed.paymentId);
          gatewayResult = mapRazorpayPaymentEntity(liveFailedPayment);
        } else {
          gatewayResult = failed.gatewayResult;
        }
      } else {
        const gatewayOrderId = String(details.razorpay_order_id || details.orderId || "").trim();
        const gatewayPaymentId = String(details.razorpay_payment_id || details.paymentId || "").trim();
        if (!gatewayOrderId || !gatewayPaymentId || !verifyRazorpayCheckoutSignature(details)) {
          return res.status(400).json({ message: "Invalid Razorpay payment verification payload." });
        }
        if (String(payment.gatewayReference || "") !== gatewayOrderId) {
          return res.status(409).json({ message: "Razorpay order mismatch for this payment attempt." });
        }

        let livePayment = await fetchRazorpayPayment(gatewayPaymentId);
        if (String(livePayment.order_id || "").trim() !== gatewayOrderId) {
          return res.status(409).json({ message: "Razorpay payment is not linked to this order." });
        }
        if (String(livePayment.status || "").trim().toLowerCase() === "authorized") {
          livePayment = await captureRazorpayPayment(gatewayPaymentId, payment.amount || order.total, payment.currency || "INR");
        }
        gatewayResult = mapRazorpayPaymentEntity(livePayment);
      }
    }
  } catch (error) {
    return res.status(error.status || 502).json({
      message: error.message || "Unable to confirm gateway payment.",
      payment,
      order: withNormalizedOrderStatusHistory(order)
    });
  }

  let committed;
  try {
    committed = await withWriteLock(async () => {
      const currentDb = readDb();
      ensurePaymentCollections(currentDb);
      const currentPayment = currentDb.payments.find((item) => item.id === req.params.paymentId);
      if (!currentPayment) {
        throw createHttpError(404, "Payment not found");
      }
      if (currentPayment.userId !== req.user.id && req.user.role !== "admin") {
        throw createHttpError(403, "Forbidden");
      }

      const currentOrder = currentDb.orders.find((item) => item.id === currentPayment.orderId);
      if (!currentOrder) {
        throw createHttpError(404, "Order not found");
      }

      const currentPersistedProvider = String(currentPayment.provider || "").trim().toLowerCase();
      if (clientProvider && currentPersistedProvider && clientProvider !== currentPersistedProvider) {
        throw createHttpError(409, "Payment provider mismatch for this payment attempt.");
      }

      const result = currentPersistedProvider === "razorpay"
        ? confirmPayment(currentDb, currentPayment, currentOrder, {
          at: new Date().toISOString(),
          details,
          gatewayResult
        })
        : confirmPayment(currentDb, currentPayment, currentOrder, {
          details
        });

      const notification = result.ok
        ? await notifyIfPaymentCaptured(currentDb, currentPayment, currentOrder, result, "payment-confirm", "checkout")
        : await notifyIfPaymentFailed(currentDb, currentOrder, result, "payment-confirm-failed", "checkout");

      persistPaymentRouteMutation(currentDb, ["orders", "payments", "products", "orderNotifications"]);

      return {
        result,
        payment: {
          ...currentPayment
        },
        order: withNormalizedOrderStatusHistory(currentOrder),
        notification
      };
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Unable to confirm payment.",
      payment,
      order: withNormalizedOrderStatusHistory(order)
    });
  }

  if (!committed.result.ok) {
    return res.status(committed.result.status || 400).json({
      message: committed.result.message || "Unable to confirm payment.",
      payment: committed.payment,
      order: committed.order,
      notification: committed.notification,
      retryable: committed.result.retryable === true
    });
  }

  return res.json({
    ...committed.payment,
    order: committed.order,
    notification: committed.notification
  });
});

router.post("/:paymentId/refund", requireAuth, async (req, res) => {
  const db = readDb();
  ensurePaymentCollections(db);
  const payment = isSqliteOrderPaymentQueriesEnabled()
    ? getSqlitePaymentById(req.params.paymentId)
    : db.payments.find((item) => item.id === req.params.paymentId);
  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  const order = isSqliteOrderPaymentQueriesEnabled()
    ? getSqliteOrderById(payment.orderId)
    : db.orders.find((item) => item.id === payment.orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  if (!canAccessOrder(req, order)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  if (req.user.role !== "admin" && String(order.status || "").toLowerCase() !== "cancelled") {
    return res.status(409).json({ message: "Only cancelled customer orders can be refunded directly." });
  }
  if (payment.provider === "razorpay" && !isRazorpayEnabled()) {
    return res.status(503).json({ message: "Razorpay refund is not configured on this backend." });
  }

  let gatewayRefundResult = null;
  try {
    if (payment.provider === "razorpay" && isRazorpayEnabled()) {
      const gatewayPaymentId = String(payment && payment.metadata && payment.metadata.gatewayPaymentId ? payment.metadata.gatewayPaymentId : "").trim();
      if (!gatewayPaymentId) {
        return res.status(409).json({ message: "Gateway payment reference missing for refund." });
      }
      const gatewayRefund = await createRazorpayRefund(gatewayPaymentId, {
        amount: payment.amountCaptured || payment.amount,
        notes: {
          internalOrderId: String(order.id || "").slice(0, 40),
          internalPaymentId: String(payment.id || "").slice(0, 40)
        }
      });
      gatewayRefundResult = mapRazorpayRefundEntity(gatewayRefund);
    }
  } catch (error) {
    return res.status(error.status || 502).json({
      message: error.message || "Unable to initiate gateway refund.",
      payment,
      order: withNormalizedOrderStatusHistory(order)
    });
  }

  try {
    const committed = await withWriteLock(async () => {
      const currentDb = readDb();
      ensurePaymentCollections(currentDb);
      const currentPayment = currentDb.payments.find((item) => item.id === req.params.paymentId);
      if (!currentPayment) {
        throw createHttpError(404, "Payment not found");
      }
      const currentOrder = currentDb.orders.find((item) => item.id === currentPayment.orderId);
      if (!currentOrder) {
        throw createHttpError(404, "Order not found");
      }
      if (!canAccessOrder(req, currentOrder)) {
        throw createHttpError(403, "Forbidden");
      }
      if (req.user.role !== "admin" && String(currentOrder.status || "").toLowerCase() !== "cancelled") {
        throw createHttpError(409, "Only cancelled customer orders can be refunded directly.");
      }

      const result = refundPayment(currentDb, currentPayment, currentOrder, gatewayRefundResult
        ? {
          at: new Date().toISOString(),
          gatewayResult: gatewayRefundResult
        }
        : {});
      if (!result.ok) {
        return {
          ok: false,
          status: result.status || 400,
          body: {
            message: result.message || "Unable to refund payment.",
            payment: {
              ...currentPayment
            },
            order: withNormalizedOrderStatusHistory(currentOrder)
          }
        };
      }

      persistPaymentRouteMutation(currentDb, ["orders", "payments"]);
      return {
        ok: true,
        status: 200,
        body: {
          message: result.message,
          ...currentPayment,
          order: withNormalizedOrderStatusHistory(currentOrder)
        }
      };
    });

    return res.status(committed.status).json(committed.body);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Unable to refund payment.",
      payment,
      order: withNormalizedOrderStatusHistory(order)
    });
  }
});

router.post("/:paymentId/cancel", requireAuth, async (req, res) => {
  const db = readDb();
  ensurePaymentCollections(db);
  const payment = isSqliteOrderPaymentQueriesEnabled()
    ? getSqlitePaymentById(req.params.paymentId)
    : db.payments.find((item) => item.id === req.params.paymentId);
  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  const order = isSqliteOrderPaymentQueriesEnabled()
    ? getSqliteOrderById(payment.orderId)
    : db.orders.find((item) => item.id === payment.orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  if (!canAccessOrder(req, order)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  if (String(order.status || "").toLowerCase() === "delivered") {
    return res.status(400).json({ message: "Delivered orders cannot be cancelled." });
  }
  if (String(order.status || "").toLowerCase() === "cancelled") {
    return res.json({
      message: "Order is already cancelled.",
      payment,
      order: withNormalizedOrderStatusHistory(order),
      notification: { skipped: true, reason: "already-cancelled" }
    });
  }

  let refundGatewayResult = null;
  try {
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
      const gatewayRefund = await createRazorpayRefund(gatewayPaymentId, {
        amount: latestPayment.amountCaptured || latestPayment.amount,
        notes: {
          internalOrderId: String(order.id || "").slice(0, 40),
          internalPaymentId: String(latestPayment.id || "").slice(0, 40)
        }
      });
      refundGatewayResult = mapRazorpayRefundEntity(gatewayRefund);
    }
  } catch (error) {
    return res.status(error.status || 502).json({
      message: error.message || "Unable to cancel gateway payment.",
      payment,
      order: withNormalizedOrderStatusHistory(order)
    });
  }

  try {
    const committed = await withWriteLock(async () => {
      const currentDb = readDb();
      ensurePaymentCollections(currentDb);
      const currentPayment = currentDb.payments.find((item) => item.id === req.params.paymentId);
      if (!currentPayment) {
        throw createHttpError(404, "Payment not found");
      }

      const currentOrder = currentDb.orders.find((item) => item.id === currentPayment.orderId);
      if (!currentOrder) {
        throw createHttpError(404, "Order not found");
      }
      if (!canAccessOrder(req, currentOrder)) {
        throw createHttpError(403, "Forbidden");
      }
      if (String(currentOrder.status || "").toLowerCase() === "delivered") {
        throw createHttpError(400, "Delivered orders cannot be cancelled.");
      }
      if (String(currentOrder.status || "").toLowerCase() === "cancelled") {
        return {
          ok: true,
          status: 200,
          body: {
            message: "Order is already cancelled.",
            payment: {
              ...currentPayment
            },
            order: withNormalizedOrderStatusHistory(currentOrder),
            notification: { skipped: true, reason: "already-cancelled" }
          }
        };
      }

      const latestPayment = getLatestPaymentForOrder(currentDb, currentOrder.id);
      if (
        latestPayment
        && latestPayment.provider === "razorpay"
        && latestPayment.status === "captured"
        && !refundGatewayResult
      ) {
        throw createHttpError(409, "Payment state changed during cancellation. Retry the cancellation request.");
      }

      const cancelledAt = new Date().toISOString();
      currentOrder.status = "cancelled";
      currentOrder.statusHistory = appendOrderStatusEvent(currentOrder, "cancelled", cancelledAt);
      releaseInventoryForOrder(currentDb, currentOrder, {
        reason: "payment-cancel",
        at: cancelledAt
      });
      const result = cancelOrderPayments(currentDb, currentOrder, {
        at: cancelledAt,
        refundGatewayResult
      });
      if (!result.ok) {
        return {
          ok: false,
          status: result.status || 400,
          body: {
            message: result.message || "Unable to close payment.",
            payment: {
              ...currentPayment
            },
            order: withNormalizedOrderStatusHistory(currentOrder)
          }
        };
      }
      const notification = await dispatchOrderStatusNotification(currentDb, currentOrder, {
        eventKey: "cancelled",
        triggeredBy: "payment-cancel",
        triggeredFrom: "checkout"
      });

      persistPaymentRouteMutation(currentDb, ["orders", "payments", "products", "orderNotifications"]);
      return {
        ok: true,
        status: 200,
        body: {
          message: result.message,
          payment: result.payment,
          order: withNormalizedOrderStatusHistory(currentOrder),
          notification
        }
      };
    });

    return res.status(committed.status).json(committed.body);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Unable to close payment.",
      payment,
      order: withNormalizedOrderStatusHistory(order)
    });
  }
});

module.exports = router;
