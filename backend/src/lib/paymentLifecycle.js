const { randomUUID } = require("crypto");
const { appendOrderStatusEvent } = require("./orderStatus");
const { releaseInventoryForOrder } = require("./orderCommerce");

const ONLINE_PAYMENT_METHODS = new Set(["upi", "card", "netbanking"]);
const ACTIVE_PAYMENT_STATUSES = new Set(["pending", "requires_confirmation", "authorized"]);
const FINAL_PAYMENT_STATUSES = new Set(["captured", "failed", "cancelled", "refunded"]);
const REFUNDABLE_PAYMENT_STATUSES = new Set(["captured"]);

function toIsoDate(value) {
  const date = new Date(value || new Date().toISOString());
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  return date.toISOString();
}

function asMoney(value) {
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Number(parsed.toFixed(2));
}

function normalizePaymentMethod(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (ONLINE_PAYMENT_METHODS.has(raw)) {
    return raw;
  }
  return "cod";
}

function isOnlinePaymentMethod(value) {
  return ONLINE_PAYMENT_METHODS.has(normalizePaymentMethod(value));
}

function normalizePaymentStatus(value, method = "cod") {
  const normalizedMethod = normalizePaymentMethod(method);
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "paid") {
    return "captured";
  }
  if (raw === "pending" && isOnlinePaymentMethod(normalizedMethod)) {
    return "requires_confirmation";
  }
  if ([
    "requires_confirmation",
    "authorized",
    "captured",
    "failed",
    "cancelled",
    "refund_pending",
    "refunded"
  ].includes(raw)) {
    return raw;
  }
  return normalizedMethod === "cod" ? "authorized" : "requires_confirmation";
}

function mapPaymentStatusToOrderStatus(paymentStatus) {
  const status = normalizePaymentStatus(paymentStatus);
  if (status === "captured") {
    return "paid";
  }
  if (status === "requires_confirmation") {
    return "pending";
  }
  return status;
}

function buildPaymentEvent(status, message, createdAt, extra = {}) {
  const normalizedStatus = normalizePaymentStatus(status);
  return {
    status: normalizedStatus,
    message: String(message || "").trim() || defaultEventMessage(normalizedStatus),
    createdAt: toIsoDate(createdAt),
    ...(extra && typeof extra === "object" ? extra : {})
  };
}

function defaultEventMessage(status) {
  if (status === "requires_confirmation") {
    return "Payment attempt created.";
  }
  if (status === "authorized") {
    return "Payment authorized.";
  }
  if (status === "captured") {
    return "Payment captured successfully.";
  }
  if (status === "failed") {
    return "Payment failed.";
  }
  if (status === "cancelled") {
    return "Payment closed.";
  }
  if (status === "refund_pending") {
    return "Refund initiated.";
  }
  if (status === "refunded") {
    return "Refund completed.";
  }
  return "Payment updated.";
}

function normalizePaymentTimeline(source, status, createdAt) {
  const rawTimeline = Array.isArray(source && source.timeline) ? source.timeline : [];
  const normalized = rawTimeline
    .map((entry) => {
      const entryStatus = normalizePaymentStatus(entry && entry.status ? entry.status : status);
      return buildPaymentEvent(entryStatus, entry && entry.message ? entry.message : "", entry && entry.createdAt ? entry.createdAt : createdAt, {
        code: entry && entry.code ? String(entry.code) : undefined
      });
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  if (!normalized.length) {
    normalized.push(buildPaymentEvent(status, "", createdAt));
  }

  return normalized;
}

function normalizePaymentRecord(source) {
  const method = normalizePaymentMethod(source && source.method);
  const createdAt = toIsoDate(source && source.createdAt ? source.createdAt : new Date().toISOString());
  const status = normalizePaymentStatus(source && source.status, method);
  const amount = asMoney(source && source.amount);
  return {
    id: String(source && source.id ? source.id : randomUUID()),
    orderId: String(source && source.orderId ? source.orderId : "").trim(),
    userId: String(source && source.userId ? source.userId : "").trim(),
    method,
    provider: String(source && source.provider ? source.provider : method === "cod" ? "offline" : "simulated").trim().toLowerCase(),
    status,
    amount,
    currency: String(source && source.currency ? source.currency : "INR").trim().toUpperCase() || "INR",
    attempt: Math.max(1, Number.isFinite(Number(source && source.attempt)) ? Number(source.attempt) : 1),
    amountAuthorized: asMoney(source && source.amountAuthorized),
    amountCaptured: asMoney(source && source.amountCaptured),
    amountRefunded: asMoney(source && source.amountRefunded),
    gatewayReference: String(source && source.gatewayReference ? source.gatewayReference : "").trim(),
    receiptId: String(source && source.receiptId ? source.receiptId : "").trim(),
    lastMessage: String(source && source.lastMessage ? source.lastMessage : "").trim(),
    failureCode: String(source && source.failureCode ? source.failureCode : "").trim(),
    failureMessage: String(source && source.failureMessage ? source.failureMessage : "").trim(),
    createdAt,
    updatedAt: toIsoDate(source && source.updatedAt ? source.updatedAt : createdAt),
    authorizedAt: source && source.authorizedAt ? toIsoDate(source.authorizedAt) : "",
    capturedAt: source && source.capturedAt ? toIsoDate(source.capturedAt) : "",
    failedAt: source && source.failedAt ? toIsoDate(source.failedAt) : "",
    refundedAt: source && source.refundedAt ? toIsoDate(source.refundedAt) : "",
    metadata: source && source.metadata && typeof source.metadata === "object" ? { ...source.metadata } : {},
    timeline: normalizePaymentTimeline(source, status, createdAt)
  };
}

function ensurePaymentCollections(db) {
  if (!Array.isArray(db.payments)) {
    db.payments = [];
    return db.payments;
  }
  db.payments.forEach((payment, index) => {
    db.payments[index] = Object.assign(payment, normalizePaymentRecord(payment));
  });
  return db.payments;
}

function sortPaymentsNewestFirst(payments) {
  return [...payments].sort((left, right) => new Date(right.updatedAt || right.createdAt || 0).getTime() - new Date(left.updatedAt || left.createdAt || 0).getTime());
}

function listPaymentsForOrder(db, orderId) {
  ensurePaymentCollections(db);
  const normalizedOrderId = String(orderId || "").trim();
  return sortPaymentsNewestFirst(db.payments.filter((payment) => payment.orderId === normalizedOrderId));
}

function getLatestPaymentForOrder(db, orderId, predicate = null) {
  const payments = listPaymentsForOrder(db, orderId);
  if (typeof predicate !== "function") {
    return payments[0] || null;
  }
  return payments.find((payment) => predicate(payment)) || null;
}

function appendPaymentEvent(payment, status, message, createdAt, extra = {}) {
  const event = buildPaymentEvent(status, message, createdAt, extra);
  payment.timeline = Array.isArray(payment.timeline) ? payment.timeline : [];
  payment.timeline.push(event);
  payment.timeline = payment.timeline
    .slice(-30)
    .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());
  payment.lastMessage = event.message;
  payment.updatedAt = event.createdAt;
  return payment.timeline;
}

function updateOrderPaymentState(order, nextStatus, options = {}) {
  order.paymentStatus = String(nextStatus || order.paymentStatus || "pending").trim().toLowerCase() || "pending";
  order.paymentUpdatedAt = toIsoDate(options.at || new Date().toISOString());
  if (options.paymentId) {
    order.latestPaymentId = String(options.paymentId).trim();
  }
  if (options.clearFailure) {
    delete order.paymentFailure;
  }
  if (options.failure) {
    order.paymentFailure = {
      code: String(options.failure.code || "").trim(),
      message: String(options.failure.message || "").trim(),
      at: toIsoDate(options.failure.at || options.at || new Date().toISOString()),
      paymentId: String(options.failure.paymentId || options.paymentId || order.latestPaymentId || "").trim()
    };
  }
}

function applyGatewayMetadata(payment, gatewayResult = {}) {
  if (!gatewayResult || typeof gatewayResult !== "object") {
    return payment;
  }
  payment.metadata = payment.metadata && typeof payment.metadata === "object" ? payment.metadata : {};
  if (gatewayResult.provider) {
    payment.provider = String(gatewayResult.provider).trim().toLowerCase() || payment.provider;
  }
  if (gatewayResult.gatewayOrderId) {
    const gatewayOrderId = String(gatewayResult.gatewayOrderId).trim();
    payment.gatewayReference = gatewayOrderId;
    payment.metadata.gatewayOrderId = gatewayOrderId;
  }
  if (gatewayResult.gatewayPaymentId) {
    payment.metadata.gatewayPaymentId = String(gatewayResult.gatewayPaymentId).trim();
  }
  if (gatewayResult.gatewayRefundId) {
    payment.metadata.gatewayRefundId = String(gatewayResult.gatewayRefundId).trim();
  }
  if (gatewayResult.gatewayStatus) {
    payment.metadata.gatewayStatus = String(gatewayResult.gatewayStatus).trim().toLowerCase();
  }
  if (gatewayResult.gatewayMethod) {
    payment.metadata.gatewayMethod = String(gatewayResult.gatewayMethod).trim().toLowerCase();
  }
  if (gatewayResult.gatewayFee !== undefined) {
    payment.metadata.gatewayFee = Number(gatewayResult.gatewayFee || 0);
  }
  if (gatewayResult.gatewayTax !== undefined) {
    payment.metadata.gatewayTax = Number(gatewayResult.gatewayTax || 0);
  }
  if (gatewayResult.gatewayPayload && typeof gatewayResult.gatewayPayload === "object") {
    payment.metadata.lastGatewayPayload = { ...gatewayResult.gatewayPayload };
  }
  if (gatewayResult.email) {
    payment.metadata.customerEmail = String(gatewayResult.email).trim();
  }
  if (gatewayResult.contact) {
    payment.metadata.customerContact = String(gatewayResult.contact).trim();
  }
  return payment;
}

function createPaymentIntent(db, order, user, options = {}) {
  ensurePaymentCollections(db);

  const method = normalizePaymentMethod(options.method || order.paymentMethod);
  const createdAt = toIsoDate(options.at || new Date().toISOString());
  const latestActivePayment = getLatestPaymentForOrder(db, order.id, (payment) => {
    return payment.method === method && ACTIVE_PAYMENT_STATUSES.has(payment.status);
  });

  if (latestActivePayment) {
    updateOrderPaymentState(order, mapPaymentStatusToOrderStatus(latestActivePayment.status), {
      at: createdAt,
      paymentId: latestActivePayment.id,
      clearFailure: true
    });
    return {
      payment: latestActivePayment,
      created: false,
      reused: true
    };
  }

  const latestPayment = getLatestPaymentForOrder(db, order.id);
  const payment = normalizePaymentRecord({
    id: randomUUID(),
    orderId: order.id,
    userId: user && user.id ? user.id : order.userId,
    method,
    provider: options.provider || (method === "cod" ? "offline" : "simulated"),
    status: method === "cod" ? "authorized" : "requires_confirmation",
    amount: Number(order.total || 0),
    attempt: Math.max(1, Number(latestPayment && latestPayment.attempt ? latestPayment.attempt : 0) + 1),
    createdAt,
    updatedAt: createdAt,
    authorizedAt: method === "cod" ? createdAt : "",
    amountAuthorized: method === "cod" ? Number(order.total || 0) : 0,
    metadata: options.metadata && typeof options.metadata === "object" ? options.metadata : {},
    receiptId: `PAY-${String(order.id).slice(0, 8).toUpperCase()}-${Date.now()}`,
    lastMessage: method === "cod" ? "Cash on delivery order confirmed." : "Payment attempt created."
  });

  if (method === "cod") {
    payment.timeline = [
      buildPaymentEvent("authorized", "Cash on delivery order confirmed.", createdAt)
    ];
  } else {
    payment.timeline = [
      buildPaymentEvent("requires_confirmation", "Payment attempt created.", createdAt)
    ];
  }

  db.payments.push(payment);
  updateOrderPaymentState(order, mapPaymentStatusToOrderStatus(payment.status), {
    at: createdAt,
    paymentId: payment.id,
    clearFailure: true
  });

  return {
    payment,
    created: true,
    reused: false
  };
}

function getFailureFromDetails(method, details = {}) {
  const normalizedMethod = normalizePaymentMethod(method);
  const forceStatus = String(details.forceStatus || "").trim().toLowerCase();
  if (forceStatus === "failed") {
    return {
      code: "forced_failure",
      message: "Payment was declined during gateway simulation."
    };
  }

  if (normalizedMethod === "card") {
    const cardNumber = String(details.cardNumber || "").replace(/\D+/g, "");
    if (cardNumber.endsWith("0002")) {
      return {
        code: "card_declined",
        message: "Card payment was declined by the issuing bank."
      };
    }
    if (cardNumber.endsWith("9995")) {
      return {
        code: "insufficient_funds",
        message: "Card payment failed due to insufficient funds."
      };
    }
  }

  if (normalizedMethod === "upi") {
    const upiId = String(details.upiId || "").trim().toLowerCase();
    if (upiId.includes("fail") || upiId.includes("blocked")) {
      return {
        code: "upi_declined",
        message: "UPI payment request was declined."
      };
    }
  }

  if (normalizedMethod === "netbanking") {
    const bankName = String(details.bankName || "").trim().toLowerCase();
    if (bankName.includes("fail") || bankName.includes("down")) {
      return {
        code: "bank_unavailable",
        message: "Net banking payment failed because the bank session could not be completed."
      };
    }
  }

  return null;
}

function confirmPayment(db, payment, order, options = {}) {
  ensurePaymentCollections(db);

  const at = toIsoDate(options.at || new Date().toISOString());
  const normalizedPayment = Object.assign(payment, normalizePaymentRecord(payment));
  const gatewayResult = options.gatewayResult && typeof options.gatewayResult === "object" ? options.gatewayResult : null;
  applyGatewayMetadata(normalizedPayment, gatewayResult);

  const providerFailure = gatewayResult && gatewayResult.failure && typeof gatewayResult.failure === "object"
    ? {
      code: String(gatewayResult.failure.code || "").trim() || "gateway_failure",
      message: String(gatewayResult.failure.message || "").trim() || "Payment failed at the gateway."
    }
    : null;
  const failure = providerFailure || getFailureFromDetails(normalizedPayment.method, options.details);
  const currentOrderStatus = String(order && order.status ? order.status : "").trim().toLowerCase();
  const gatewayStatus = gatewayResult && gatewayResult.status ? normalizePaymentStatus(gatewayResult.status, normalizedPayment.method) : "";
  const successStatus = gatewayStatus === "captured" ? "captured" : "";

  if (currentOrderStatus === "cancelled") {
    if (!FINAL_PAYMENT_STATUSES.has(normalizedPayment.status)) {
      normalizedPayment.status = "cancelled";
      appendPaymentEvent(normalizedPayment, "cancelled", "Payment attempt closed because the order was already cancelled.", at);
    }
    updateOrderPaymentState(order, order.paymentStatus || "cancelled", {
      at,
      paymentId: normalizedPayment.id
    });
    return {
      ok: false,
      status: 409,
      payment: normalizedPayment,
      order,
      message: "Cancelled orders cannot be confirmed for payment."
    };
  }

  if (normalizedPayment.status === "captured") {
    updateOrderPaymentState(order, "paid", {
      at,
      paymentId: normalizedPayment.id,
      clearFailure: true
    });
    return {
      ok: true,
      payment: normalizedPayment,
      order,
      alreadyProcessed: true
    };
  }

  if (normalizedPayment.status === "refunded" || normalizedPayment.status === "refund_pending") {
    return {
      ok: false,
      status: 409,
      payment: normalizedPayment,
      order,
      message: "Refunded payments cannot be confirmed again."
    };
  }

  if (normalizedPayment.status === "failed" || normalizedPayment.status === "cancelled") {
    return {
      ok: false,
      status: 409,
      payment: normalizedPayment,
      order,
      message: "This payment attempt is closed. Create a new payment intent to retry."
    };
  }

  if (failure) {
    normalizedPayment.status = "failed";
    normalizedPayment.failedAt = at;
    normalizedPayment.failureCode = failure.code;
    normalizedPayment.failureMessage = failure.message;
    appendPaymentEvent(normalizedPayment, "failed", failure.message, at, { code: failure.code });

    updateOrderPaymentState(order, "failed", {
      at,
      paymentId: normalizedPayment.id,
      failure: {
        ...failure,
        at,
        paymentId: normalizedPayment.id
      }
    });

    if (String(order.status || "").toLowerCase() !== "cancelled") {
      order.status = "cancelled";
      order.statusHistory = appendOrderStatusEvent(order, "cancelled", at, {
        label: "Payment failed - order closed"
      });
      releaseInventoryForOrder(db, order, {
        reason: "payment-failed",
        at
      });
    }

    return {
      ok: false,
      status: 402,
      payment: normalizedPayment,
      order,
      retryable: true,
      message: `${failure.message} The order was cancelled and inventory was released.`
    };
  }

  normalizedPayment.status = successStatus || "captured";
  normalizedPayment.capturedAt = at;
  normalizedPayment.amountCaptured = normalizedPayment.amount;
  normalizedPayment.failureCode = "";
  normalizedPayment.failureMessage = "";
  appendPaymentEvent(normalizedPayment, "captured", "Payment captured successfully.", at);

  updateOrderPaymentState(order, "paid", {
    at,
    paymentId: normalizedPayment.id,
    clearFailure: true
  });

  return {
    ok: true,
    payment: normalizedPayment,
    order,
    alreadyProcessed: false
  };
}

function refundPayment(db, payment, order, options = {}) {
  ensurePaymentCollections(db);
  const at = toIsoDate(options.at || new Date().toISOString());
  const normalizedPayment = Object.assign(payment, normalizePaymentRecord(payment));
  const gatewayResult = options.gatewayResult && typeof options.gatewayResult === "object" ? options.gatewayResult : null;
  applyGatewayMetadata(normalizedPayment, gatewayResult);

  if (normalizedPayment.status === "refunded") {
    updateOrderPaymentState(order, "refunded", {
      at,
      paymentId: normalizedPayment.id,
      clearFailure: true
    });
    return {
      ok: true,
      payment: normalizedPayment,
      order,
      alreadyProcessed: true,
      refunded: true,
      message: "Payment is already refunded."
    };
  }

  if (normalizedPayment.status === "refund_pending") {
    updateOrderPaymentState(order, "refund_pending", {
      at,
      paymentId: normalizedPayment.id,
      clearFailure: true
    });
    return {
      ok: true,
      payment: normalizedPayment,
      order,
      alreadyProcessed: true,
      refunded: false,
      message: "Refund is already in progress."
    };
  }

  if (!REFUNDABLE_PAYMENT_STATUSES.has(normalizedPayment.status)) {
    return {
      ok: false,
      status: 409,
      payment: normalizedPayment,
      order,
      message: "Only captured payments can be refunded."
    };
  }

  const refundStatus = gatewayResult && gatewayResult.status
    ? String(gatewayResult.status).trim().toLowerCase()
    : "refunded";
  const pendingRefund = refundStatus === "refund_pending" || refundStatus === "pending" || refundStatus === "created" || refundStatus === "processed_pending";

  normalizedPayment.status = pendingRefund ? "refund_pending" : "refunded";
  normalizedPayment.refundedAt = at;
  normalizedPayment.amountRefunded = gatewayResult && gatewayResult.amountRefunded !== undefined
    ? asMoney(gatewayResult.amountRefunded)
    : (normalizedPayment.amountCaptured || normalizedPayment.amount);
  appendPaymentEvent(
    normalizedPayment,
    pendingRefund ? "refund_pending" : "refunded",
    pendingRefund ? "Refund initiated with the payment gateway." : "Refund completed to the original payment method.",
    at
  );

  updateOrderPaymentState(order, pendingRefund ? "refund_pending" : "refunded", {
    at,
    paymentId: normalizedPayment.id,
    clearFailure: true
  });

  return {
    ok: true,
    payment: normalizedPayment,
    order,
    refunded: !pendingRefund,
    alreadyProcessed: false,
    message: pendingRefund ? "Refund initiated successfully." : "Refund processed successfully."
  };
}

function cancelOrderPayments(db, order, options = {}) {
  ensurePaymentCollections(db);
  const at = toIsoDate(options.at || new Date().toISOString());
  const refundablePayment = getLatestPaymentForOrder(db, order.id, (payment) => REFUNDABLE_PAYMENT_STATUSES.has(payment.status));

  if (refundablePayment) {
    return refundPayment(db, refundablePayment, order, {
      at,
      gatewayResult: options.refundGatewayResult
    });
  }

  const latestPayment = getLatestPaymentForOrder(db, order.id);
  if (!latestPayment) {
    updateOrderPaymentState(order, order.paymentMethod === "cod" ? "cancelled" : String(order.paymentStatus || "cancelled").toLowerCase() === "failed" ? "failed" : "cancelled", {
      at
    });
    return {
      ok: true,
      payment: null,
      order,
      refunded: false,
      cancelled: true,
      message: "Order payment state closed without an active payment record."
    };
  }

  if (latestPayment.status === "refunded" || latestPayment.status === "refund_pending") {
    updateOrderPaymentState(order, mapPaymentStatusToOrderStatus(latestPayment.status), {
      at,
      paymentId: latestPayment.id,
      clearFailure: true
    });
    return {
      ok: true,
      payment: latestPayment,
      order,
      refunded: latestPayment.status === "refunded",
      cancelled: false,
      message: latestPayment.status === "refunded" ? "Payment is already refunded." : "Refund is already in progress."
    };
  }

  if (latestPayment.status === "failed") {
    updateOrderPaymentState(order, "failed", {
      at,
      paymentId: latestPayment.id,
      failure: {
        code: latestPayment.failureCode,
        message: latestPayment.failureMessage || latestPayment.lastMessage || "Payment failed.",
        at: latestPayment.failedAt || at,
        paymentId: latestPayment.id
      }
    });
    return {
      ok: true,
      payment: latestPayment,
      order,
      refunded: false,
      cancelled: false,
      message: "Payment already failed before cancellation."
    };
  }

  if (latestPayment.status !== "cancelled") {
    latestPayment.status = "cancelled";
    appendPaymentEvent(
      latestPayment,
      "cancelled",
      latestPayment.method === "cod"
        ? "Cash on delivery collection closed because the order was cancelled."
        : "Payment attempt closed because the order was cancelled.",
      at
    );
  }

  updateOrderPaymentState(order, "cancelled", {
    at,
    paymentId: latestPayment.id,
    clearFailure: latestPayment.status !== "failed"
  });

  return {
    ok: true,
    payment: latestPayment,
    order,
    refunded: false,
    cancelled: true,
    message: "Payment attempt closed."
  };
}

function isOrderPaymentCleared(order) {
  const status = String(order && order.paymentStatus ? order.paymentStatus : "").trim().toLowerCase();
  if (status === "paid") {
    return true;
  }
  return normalizePaymentMethod(order && order.paymentMethod) === "cod" && status === "authorized";
}

module.exports = {
  ACTIVE_PAYMENT_STATUSES,
  FINAL_PAYMENT_STATUSES,
  appendPaymentEvent,
  cancelOrderPayments,
  confirmPayment,
  createPaymentIntent,
  ensurePaymentCollections,
  getLatestPaymentForOrder,
  isOnlinePaymentMethod,
  isOrderPaymentCleared,
  normalizePaymentMethod,
  normalizePaymentRecord,
  refundPayment
};
