const crypto = require("crypto");

const RAZORPAY_API_BASE = "https://api.razorpay.com/v1";

function resolveStoreBrandName() {
  return String(process.env.STORE_BRAND_NAME || "ElectroMart").trim() || "ElectroMart";
}

function resolveStorePrimaryColor() {
  return String(process.env.STORE_PRIMARY_COLOR || "#0f766e").trim() || "#0f766e";
}

function resolvePublicStoreBaseUrl() {
  return String(process.env.PUBLIC_STORE_BASE_URL || "http://localhost:5500").trim().replace(/\/+$/, "");
}

function resolveRazorpayConfig() {
  return {
    provider: String(process.env.PAYMENT_PROVIDER || "simulated").trim().toLowerCase(),
    keyId: String(process.env.RAZORPAY_KEY_ID || "").trim(),
    keySecret: String(process.env.RAZORPAY_KEY_SECRET || "").trim(),
    webhookSecret: String(process.env.RAZORPAY_WEBHOOK_SECRET || "").trim()
  };
}

function isRazorpayEnabled() {
  const config = resolveRazorpayConfig();
  return config.provider === "razorpay" && Boolean(config.keyId && config.keySecret);
}

function assertRazorpayEnabled() {
  if (!isRazorpayEnabled()) {
    const error = new Error("Razorpay is not configured on this backend.");
    error.status = 503;
    throw error;
  }
}

function toSubunits(amount) {
  return Math.max(0, Math.round(Number(amount || 0) * 100));
}

function fromSubunits(amount) {
  return Number((Number(amount || 0) / 100).toFixed(2));
}

async function callRazorpayApi(path, options = {}) {
  assertRazorpayEnabled();
  const config = resolveRazorpayConfig();
  const method = String(options.method || "GET").trim().toUpperCase();
  const headers = {
    Authorization: `Basic ${Buffer.from(`${config.keyId}:${config.keySecret}`).toString("base64")}`
  };
  let body;

  if (options.body && method !== "GET") {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const response = await fetch(`${RAZORPAY_API_BASE}${path}`, {
    method,
    headers,
    body
  });

  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch (error) {
    payload = { raw: text };
  }

  if (!response.ok) {
    const errorMessage = payload && payload.error && payload.error.description
      ? payload.error.description
      : (payload && payload.message ? payload.message : `Razorpay request failed with status ${response.status}.`);
    const error = new Error(errorMessage);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

async function createRazorpayOrder(payment, order, user) {
  const receipt = payment.receiptId || `PAY-${String(payment.id || "").slice(0, 8).toUpperCase()}`;
  const payload = await callRazorpayApi("/orders", {
    method: "POST",
    body: {
      amount: toSubunits(payment.amount || order.total),
      currency: String(payment.currency || "INR").trim().toUpperCase() || "INR",
      receipt: receipt.slice(0, 40),
      notes: {
        internalOrderId: String(order && order.id ? order.id : "").slice(0, 40),
        internalPaymentId: String(payment && payment.id ? payment.id : "").slice(0, 40),
        internalUserId: String(user && user.id ? user.id : order && order.userId ? order.userId : "").slice(0, 40),
        preferredMethod: String(payment && payment.method ? payment.method : order && order.paymentMethod ? order.paymentMethod : "").slice(0, 40)
      }
    }
  });

  return payload;
}

async function fetchRazorpayPayment(paymentId) {
  return callRazorpayApi(`/payments/${encodeURIComponent(String(paymentId || "").trim())}`);
}

async function captureRazorpayPayment(paymentId, amount, currency = "INR") {
  return callRazorpayApi(`/payments/${encodeURIComponent(String(paymentId || "").trim())}/capture`, {
    method: "POST",
    body: {
      amount: toSubunits(amount),
      currency: String(currency || "INR").trim().toUpperCase() || "INR"
    }
  });
}

async function createRazorpayRefund(paymentId, options = {}) {
  const body = {};
  if (options.amount !== undefined && options.amount !== null) {
    body.amount = toSubunits(options.amount);
  }
  if (options.notes && typeof options.notes === "object") {
    body.notes = options.notes;
  }

  return callRazorpayApi(`/payments/${encodeURIComponent(String(paymentId || "").trim())}/refund`, {
    method: "POST",
    body
  });
}

function buildSignature(value, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(value)
    .digest("hex");
}

function safeCompare(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

function verifyRazorpayCheckoutSignature(details = {}) {
  const config = resolveRazorpayConfig();
  if (!config.keySecret) {
    return false;
  }
  const orderId = String(details.razorpay_order_id || details.orderId || "").trim();
  const paymentId = String(details.razorpay_payment_id || details.paymentId || "").trim();
  const signature = String(details.razorpay_signature || details.signature || "").trim();
  if (!orderId || !paymentId || !signature) {
    return false;
  }
  return safeCompare(buildSignature(`${orderId}|${paymentId}`, config.keySecret), signature);
}

function verifyRazorpayWebhookSignature(rawBody, signature) {
  const config = resolveRazorpayConfig();
  if (!config.webhookSecret) {
    return false;
  }
  const payload = typeof rawBody === "string" ? rawBody : "";
  if (!payload || !signature) {
    return false;
  }
  return safeCompare(buildSignature(payload, config.webhookSecret), String(signature).trim());
}

function buildRazorpayCheckoutPayload(payment, order, user) {
  const config = resolveRazorpayConfig();
  const gatewayOrderId = String(payment && payment.gatewayReference ? payment.gatewayReference : payment && payment.metadata ? payment.metadata.gatewayOrderId || "" : "").trim();
  return {
    provider: "razorpay",
    key: config.keyId,
    orderId: gatewayOrderId,
    amount: toSubunits(payment && payment.amount ? payment.amount : order && order.total ? order.total : 0),
    currency: String(payment && payment.currency ? payment.currency : "INR").trim().toUpperCase() || "INR",
    name: resolveStoreBrandName(),
    description: `Order EM-${String(order && order.id ? order.id : "").slice(0, 8).toUpperCase()}`,
    prefill: {
      name: String(user && user.name ? user.name : "").trim(),
      email: String(user && user.email ? user.email : "").trim(),
      contact: String(user && user.mobile ? user.mobile : "").trim()
    },
    notes: {
      internalOrderId: String(order && order.id ? order.id : ""),
      internalPaymentId: String(payment && payment.id ? payment.id : ""),
      preferredMethod: String(payment && payment.method ? payment.method : "")
    },
    theme: {
      color: resolveStorePrimaryColor()
    },
    callbackUrl: `${resolvePublicStoreBaseUrl()}/thank-you.html?orderId=${encodeURIComponent(String(order && order.id ? order.id : ""))}`
  };
}

function buildGatewayFailure(entity = {}) {
  return {
    code: String(entity.error_code || entity.code || "").trim() || "gateway_failure",
    message: String(entity.error_description || entity.description || entity.error_reason || entity.reason || "Payment failed at Razorpay.").trim()
  };
}

function summarizeGatewayEntity(entity = {}) {
  const summary = {
    id: entity.id,
    entity: entity.entity,
    status: entity.status,
    order_id: entity.order_id,
    amount: entity.amount,
    method: entity.method,
    fee: entity.fee,
    tax: entity.tax
  };
  if (entity.error_code || entity.error_description || entity.error_reason) {
    summary.error = {
      code: entity.error_code || "",
      description: entity.error_description || "",
      reason: entity.error_reason || ""
    };
  }
  return summary;
}

function mapRazorpayPaymentEntity(entity = {}) {
  const gatewayStatus = String(entity.status || "").trim().toLowerCase();
  let status = "requires_confirmation";
  if (String(entity.refund_status || "").trim().toLowerCase() === "full") {
    status = "refunded";
  } else if (gatewayStatus === "captured") {
    status = "captured";
  } else if (gatewayStatus === "authorized") {
    status = "authorized";
  } else if (gatewayStatus === "failed") {
    status = "failed";
  }

  return {
    provider: "razorpay",
    status,
    gatewayStatus,
    gatewayOrderId: String(entity.order_id || "").trim(),
    gatewayPaymentId: String(entity.id || "").trim(),
    gatewayMethod: String(entity.method || "").trim().toLowerCase(),
    gatewayFee: Number(entity.fee || 0),
    gatewayTax: Number(entity.tax || 0),
    email: String(entity.email || "").trim(),
    contact: String(entity.contact || "").trim(),
    failure: gatewayStatus === "failed" ? buildGatewayFailure(entity) : null,
    gatewayPayload: summarizeGatewayEntity(entity)
  };
}

function mapRazorpayRefundEntity(entity = {}) {
  const gatewayStatus = String(entity.status || "").trim().toLowerCase();
  const refunded = gatewayStatus === "processed";
  return {
    provider: "razorpay",
    status: refunded ? "refunded" : "refund_pending",
    gatewayStatus,
    gatewayRefundId: String(entity.id || "").trim(),
    amountRefunded: fromSubunits(entity.amount || 0),
    gatewayPayload: {
      id: entity.id,
      entity: entity.entity,
      payment_id: entity.payment_id,
      amount: entity.amount,
      status: entity.status
    }
  };
}

module.exports = {
  buildRazorpayCheckoutPayload,
  captureRazorpayPayment,
  createRazorpayOrder,
  createRazorpayRefund,
  fetchRazorpayPayment,
  fromSubunits,
  isRazorpayEnabled,
  mapRazorpayPaymentEntity,
  mapRazorpayRefundEntity,
  resolveRazorpayConfig,
  toSubunits,
  verifyRazorpayCheckoutSignature,
  verifyRazorpayWebhookSignature
};
