const { randomUUID } = require("crypto");

let smtpTransporterCache = null;
let smtpTransporterCacheKey = "";

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeName(value) {
  return String(value || "").trim().slice(0, 80);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

function normalizeStatus(value) {
  return String(value || "open").trim().toLowerCase();
}

function resolveStoreBrandName() {
  return String(process.env.STORE_BRAND_NAME || "ElectroMart").trim() || "ElectroMart";
}

function resolveStoreSupportEmail() {
  return String(
    process.env.STORE_SUPPORT_EMAIL
    || process.env.SMTP_FROM_EMAIL
    || "support@electromart.com"
  ).trim();
}

function resolveStorePrimaryColor() {
  return String(process.env.STORE_PRIMARY_COLOR || "#0f766e").trim() || "#0f766e";
}

function resolvePublicStoreBaseUrl() {
  const raw = String(process.env.PUBLIC_STORE_BASE_URL || process.env.STORE_BASE_URL || "http://localhost:5500").trim();
  return raw.replace(/\/+$/, "");
}

function resolvePublicApiBaseUrl() {
  const explicit = String(process.env.PUBLIC_API_BASE_URL || "").trim();
  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }
  const port = Number(process.env.PORT || 4000);
  return `http://localhost:${port}/api`;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function ensureBackInStockCollections(db) {
  if (!Array.isArray(db.backInStockRequests)) {
    db.backInStockRequests = [];
  }
  if (!Array.isArray(db.backInStockNotifications)) {
    db.backInStockNotifications = [];
  }
}

function buildProductSnapshot(product = {}) {
  return {
    id: String(product.id || ""),
    name: String(product.name || "Unknown Product"),
    brand: String(product.brand || "Generic"),
    sku: String(product.sku || ""),
    stock: asNumber(product.stock, 0),
    price: asNumber(product.price, 0)
  };
}

function buildProductDetailUrl(productId) {
  const storeBase = resolvePublicStoreBaseUrl();
  return `${storeBase}/product-detail.html?id=${encodeURIComponent(String(productId || ""))}`;
}

function buildUnsubscribeUrl(token) {
  const apiBase = resolvePublicApiBaseUrl();
  return `${apiBase}/products/back-in-stock/unsubscribe?token=${encodeURIComponent(String(token || ""))}`;
}

function buildBackInStockEmailPayload(product, request) {
  const storeName = resolveStoreBrandName();
  const supportEmail = resolveStoreSupportEmail();
  const primaryColor = resolveStorePrimaryColor();
  const productName = String(product && product.name ? product.name : "Your product");
  const subject = `${productName} is back in stock at ${storeName}`;
  const productUrl = buildProductDetailUrl(product && product.id ? product.id : "");
  const unsubscribeUrl = buildUnsubscribeUrl(request && request.unsubscribeToken ? request.unsubscribeToken : "");

  const text = [
    `Hi ${request && request.name ? request.name : "there"},`,
    "",
    `Good news. ${productName} is back in stock.`,
    `Brand: ${product && product.brand ? product.brand : "N/A"}`,
    `Price: INR ${asNumber(product && product.price, 0)}`,
    "",
    `Order now: ${productUrl}`,
    `If you do not want these alerts, unsubscribe: ${unsubscribeUrl}`,
    "",
    `${storeName} Support: ${supportEmail}`
  ].join("\n");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#0f172a">
      <h2 style="margin:0 0 12px;color:${escapeHtml(primaryColor)}">${escapeHtml(storeName)}</h2>
      <p style="margin:0 0 10px">Hi ${escapeHtml(request && request.name ? request.name : "there")},</p>
      <p style="margin:0 0 10px"><strong>${escapeHtml(productName)}</strong> is back in stock.</p>
      <p style="margin:0 0 14px">Brand: ${escapeHtml(product && product.brand ? product.brand : "N/A")}<br />Price: INR ${asNumber(product && product.price, 0)}</p>
      <p style="margin:0 0 16px">
        <a href="${escapeHtml(productUrl)}" style="display:inline-block;background:${escapeHtml(primaryColor)};color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:999px;font-weight:700">View Product</a>
      </p>
      <p style="margin:0 0 8px;font-size:13px;color:#475569">You are receiving this because you requested a back-in-stock alert.</p>
      <p style="margin:0 0 8px;font-size:13px;color:#475569">
        <a href="${escapeHtml(unsubscribeUrl)}" style="color:${escapeHtml(primaryColor)}">Unsubscribe from this product alert</a>
      </p>
      <p style="margin:0;font-size:13px;color:#475569">${escapeHtml(storeName)} Support: ${escapeHtml(supportEmail)}</p>
    </div>
  `;

  return {
    subject,
    text,
    html,
    productUrl,
    unsubscribeUrl
  };
}

function resolveEmailMode() {
  return String(process.env.BACK_IN_STOCK_EMAIL_MODE || "simulated").trim().toLowerCase();
}

function resolveSmtpConfig() {
  const host = String(process.env.SMTP_HOST || "").trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "").trim().toLowerCase() === "true" || port === 465;
  const user = String(process.env.SMTP_USER || "").trim();
  const pass = String(process.env.SMTP_PASS || "").trim();
  const fromEmail = String(process.env.SMTP_FROM_EMAIL || "").trim();
  const fromName = String(process.env.SMTP_FROM_NAME || resolveStoreBrandName()).trim() || resolveStoreBrandName();

  return {
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : null,
    fromEmail,
    fromName
  };
}

function getSmtpTransporter(config) {
  let nodemailer;
  try {
    // eslint-disable-next-line global-require
    nodemailer = require("nodemailer");
  } catch (error) {
    const dependencyError = new Error("SMTP mode requires dependency 'nodemailer'. Run: npm install nodemailer");
    dependencyError.code = "SMTP_DEPENDENCY_MISSING";
    throw dependencyError;
  }

  const cacheKey = JSON.stringify({
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth ? config.auth.user : "",
    fromEmail: config.fromEmail
  });

  if (smtpTransporterCache && smtpTransporterCacheKey === cacheKey) {
    return smtpTransporterCache;
  }

  smtpTransporterCache = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth || undefined
  });
  smtpTransporterCacheKey = cacheKey;
  return smtpTransporterCache;
}

async function sendWithSmtp(toEmail, emailPayload) {
  const config = resolveSmtpConfig();
  if (!config.host) {
    const error = new Error("SMTP_HOST is required for smtp mode.");
    error.code = "SMTP_CONFIG_MISSING";
    throw error;
  }
  if (!config.fromEmail) {
    const error = new Error("SMTP_FROM_EMAIL is required for smtp mode.");
    error.code = "SMTP_CONFIG_MISSING";
    throw error;
  }

  const transporter = getSmtpTransporter(config);
  const info = await transporter.sendMail({
    from: `"${config.fromName}" <${config.fromEmail}>`,
    to: toEmail,
    subject: emailPayload.subject,
    text: emailPayload.text,
    html: emailPayload.html
  });

  return {
    delivered: true,
    status: "sent",
    provider: "smtp",
    messageId: String(info && info.messageId ? info.messageId : randomUUID())
  };
}

async function sendWithSendGrid(toEmail, emailPayload) {
  const apiKey = String(process.env.SENDGRID_API_KEY || "").trim();
  const fromEmail = String(process.env.SENDGRID_FROM_EMAIL || "").trim();
  const fromName = String(process.env.SENDGRID_FROM_NAME || resolveStoreBrandName()).trim() || resolveStoreBrandName();
  if (!apiKey || !fromEmail) {
    const error = new Error("SENDGRID_API_KEY and SENDGRID_FROM_EMAIL are required for sendgrid mode.");
    error.code = "SENDGRID_CONFIG_MISSING";
    throw error;
  }
  if (typeof fetch !== "function") {
    const error = new Error("Fetch API is unavailable in current Node runtime.");
    error.code = "FETCH_UNAVAILABLE";
    throw error;
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { email: fromEmail, name: fromName },
      subject: emailPayload.subject,
      content: [
        { type: "text/plain", value: emailPayload.text },
        { type: "text/html", value: emailPayload.html }
      ]
    })
  });

  if (!response.ok) {
    const responseText = await response.text().catch(() => "");
    const message = responseText || `SendGrid request failed with status ${response.status}`;
    const error = new Error(message);
    error.code = "SENDGRID_REQUEST_FAILED";
    throw error;
  }

  return {
    delivered: true,
    status: "sent",
    provider: "sendgrid",
    messageId: String(response.headers.get("x-message-id") || randomUUID())
  };
}

async function sendBackInStockEmail(product, request) {
  const mode = resolveEmailMode();
  const payload = buildBackInStockEmailPayload(product, request);
  const baseResult = {
    subject: payload.subject,
    text: payload.text,
    html: payload.html
  };

  if (mode === "disabled") {
    return {
      ...baseResult,
      delivered: false,
      status: "queued",
      provider: "disabled",
      messageId: randomUUID()
    };
  }

  if (mode === "simulated") {
    return {
      ...baseResult,
      delivered: true,
      status: "sent",
      provider: "simulated",
      messageId: randomUUID()
    };
  }

  if (mode === "smtp") {
    const smtpResult = await sendWithSmtp(normalizeEmail(request.email), payload);
    return {
      ...baseResult,
      ...smtpResult
    };
  }

  if (mode === "sendgrid") {
    const sendgridResult = await sendWithSendGrid(normalizeEmail(request.email), payload);
    return {
      ...baseResult,
      ...sendgridResult
    };
  }

  const error = new Error(`Unsupported BACK_IN_STOCK_EMAIL_MODE: ${mode}`);
  error.code = "EMAIL_MODE_INVALID";
  throw error;
}

function createBackInStockRequest(db, product, payload = {}) {
  ensureBackInStockCollections(db);
  const email = normalizeEmail(payload.email);
  if (!isValidEmail(email)) {
    return { ok: false, status: 400, message: "A valid email is required." };
  }

  const quantityDesired = Math.max(1, Math.min(999, Math.floor(asNumber(payload.quantityDesired, 1))));
  const name = normalizeName(payload.name || "");
  const productId = String(product && product.id ? product.id : "");
  if (!productId) {
    return { ok: false, status: 404, message: "Product not found." };
  }

  const existing = db.backInStockRequests.find((item) => {
    const itemStatus = normalizeStatus(item.status);
    return String(item.productId || "") === productId
      && normalizeEmail(item.email) === email
      && (itemStatus === "open" || itemStatus === "queued");
  });

  if (existing) {
    existing.quantityDesired = Math.max(existing.quantityDesired || 1, quantityDesired);
    existing.name = existing.name || name;
    existing.updatedAt = new Date().toISOString();
    existing.product = buildProductSnapshot(product);
    return { ok: true, duplicate: true, request: existing };
  }

  const request = {
    id: randomUUID(),
    productId,
    email,
    name,
    quantityDesired,
    status: "open",
    source: String(payload.source || "product-page"),
    product: buildProductSnapshot(product),
    unsubscribeToken: randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notifiedAt: null,
    closedAt: null,
    unsubscribedAt: null,
    lastError: ""
  };
  db.backInStockRequests.push(request);
  return { ok: true, duplicate: false, request };
}

function buildNotificationRecord(params = {}) {
  return {
    id: randomUUID(),
    requestId: String(params.requestId || ""),
    productId: String(params.productId || ""),
    email: normalizeEmail(params.email || ""),
    status: String(params.status || "queued"),
    provider: String(params.provider || "system"),
    subject: String(params.subject || ""),
    text: String(params.text || ""),
    messageId: String(params.messageId || randomUUID()),
    error: String(params.error || ""),
    triggeredBy: String(params.triggeredBy || "inventory-update"),
    triggeredFrom: String(params.triggeredFrom || "system"),
    createdAt: params.createdAt || new Date().toISOString(),
    sentAt: params.sentAt || null
  };
}

async function dispatchBackInStockNotifications(db, product, meta = {}) {
  ensureBackInStockCollections(db);
  const productId = String(product && product.id ? product.id : "");
  if (!productId || asNumber(product && product.stock, 0) <= 0) {
    return { matched: 0, sent: 0, queued: 0, failed: 0 };
  }

  const now = new Date().toISOString();
  const openRequests = db.backInStockRequests.filter((item) => {
    const status = normalizeStatus(item.status);
    return String(item.productId || "") === productId && (status === "open" || status === "queued");
  });

  let sent = 0;
  let queued = 0;
  let failed = 0;

  for (const request of openRequests) {
    try {
      const emailResult = await sendBackInStockEmail(product, request);
      db.backInStockNotifications.push(buildNotificationRecord({
        requestId: request.id,
        productId,
        email: request.email,
        status: emailResult.status,
        provider: emailResult.provider,
        subject: emailResult.subject,
        text: emailResult.text,
        messageId: emailResult.messageId,
        triggeredBy: String(meta.triggeredBy || "inventory-update"),
        triggeredFrom: String(meta.triggeredFrom || "system"),
        createdAt: now,
        sentAt: emailResult.delivered ? now : null
      }));

      request.status = emailResult.delivered ? "notified" : "queued";
      request.notifiedAt = emailResult.delivered ? now : null;
      request.updatedAt = now;
      request.lastError = "";

      if (emailResult.delivered) {
        sent += 1;
      } else {
        queued += 1;
      }
    } catch (error) {
      failed += 1;
      request.status = "queued";
      request.updatedAt = now;
      request.lastError = String(error && error.message ? error.message : "Notification send failed.");
      db.backInStockNotifications.push(buildNotificationRecord({
        requestId: request.id,
        productId,
        email: request.email,
        status: "failed",
        provider: resolveEmailMode(),
        subject: `${String(product.name || "Product")} back in stock notification`,
        text: "",
        error: request.lastError,
        triggeredBy: String(meta.triggeredBy || "inventory-update"),
        triggeredFrom: String(meta.triggeredFrom || "system"),
        createdAt: now,
        sentAt: null
      }));
    }
  }

  return {
    matched: openRequests.length,
    sent,
    queued,
    failed
  };
}

function setBackInStockRequestStatus(db, requestId, status) {
  ensureBackInStockCollections(db);
  const normalizedStatus = normalizeStatus(status);
  if (!["open", "closed", "notified", "queued", "unsubscribed"].includes(normalizedStatus)) {
    return { ok: false, status: 400, message: "Invalid request status." };
  }
  const request = db.backInStockRequests.find((item) => String(item.id || "") === String(requestId || ""));
  if (!request) {
    return { ok: false, status: 404, message: "Request not found." };
  }

  request.status = normalizedStatus;
  request.updatedAt = new Date().toISOString();
  if (normalizedStatus === "closed") {
    request.closedAt = request.updatedAt;
  } else if (normalizedStatus === "unsubscribed") {
    request.unsubscribedAt = request.updatedAt;
    request.closedAt = request.updatedAt;
  } else if (normalizedStatus === "open") {
    request.closedAt = null;
    request.unsubscribedAt = null;
  }
  return { ok: true, request };
}

function unsubscribeBackInStockRequestByToken(db, token) {
  ensureBackInStockCollections(db);
  const normalizedToken = String(token || "").trim();
  if (!normalizedToken) {
    return { ok: false, status: 400, message: "Missing unsubscribe token." };
  }
  const request = db.backInStockRequests.find((item) => String(item.unsubscribeToken || "") === normalizedToken);
  if (!request) {
    return { ok: false, status: 404, message: "Request not found for this unsubscribe link." };
  }
  if (normalizeStatus(request.status) === "unsubscribed") {
    return { ok: true, already: true, request };
  }
  request.status = "unsubscribed";
  request.updatedAt = new Date().toISOString();
  request.unsubscribedAt = request.updatedAt;
  request.closedAt = request.updatedAt;
  return { ok: true, already: false, request };
}

function getBackInStockDemandSummary(db) {
  ensureBackInStockCollections(db);
  const productsById = new Map((db.products || []).map((item) => [String(item.id), item]));
  const demandMap = new Map();

  db.backInStockRequests
    .filter((item) => normalizeStatus(item.status) === "open")
    .forEach((request) => {
      const productId = String(request.productId || "");
      const product = productsById.get(productId) || request.product || {};
      const previous = demandMap.get(productId) || {
        productId,
        name: String(product.name || "Unknown Product"),
        brand: String(product.brand || "Generic"),
        sku: String(product.sku || ""),
        stock: asNumber(product.stock, 0),
        requests: 0,
        demandUnits: 0,
        lastRequestedAt: null
      };
      previous.requests += 1;
      previous.demandUnits += Math.max(1, asNumber(request.quantityDesired, 1));
      const requestedAt = String(request.createdAt || "");
      if (!previous.lastRequestedAt || requestedAt > previous.lastRequestedAt) {
        previous.lastRequestedAt = requestedAt;
      }
      demandMap.set(productId, previous);
    });

  return Array.from(demandMap.values()).sort((a, b) => b.requests - a.requests || b.demandUnits - a.demandUnits);
}

function listBackInStockRequests(db, filters = {}) {
  ensureBackInStockCollections(db);
  const search = String(filters.search || "").trim().toLowerCase();
  const status = String(filters.status || "all").toLowerCase();
  const productsById = new Map((db.products || []).map((item) => [String(item.id), item]));

  return db.backInStockRequests
    .map((request) => {
      const product = productsById.get(String(request.productId || "")) || request.product || {};
      return {
        ...request,
        productName: String(product.name || request.product?.name || "Unknown Product"),
        productBrand: String(product.brand || request.product?.brand || "Generic"),
        productSku: String(product.sku || request.product?.sku || ""),
        productStock: asNumber(product.stock ?? request.product?.stock, 0)
      };
    })
    .filter((request) => {
      const statusMatch = status === "all" || normalizeStatus(request.status) === status;
      const searchMatch = !search
        || String(request.email || "").toLowerCase().includes(search)
        || String(request.productName || "").toLowerCase().includes(search)
        || String(request.productSku || "").toLowerCase().includes(search)
        || String(request.productBrand || "").toLowerCase().includes(search);
      return statusMatch && searchMatch;
    })
    .sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    });
}

module.exports = {
  ensureBackInStockCollections,
  createBackInStockRequest,
  dispatchBackInStockNotifications,
  setBackInStockRequestStatus,
  unsubscribeBackInStockRequestByToken,
  getBackInStockDemandSummary,
  listBackInStockRequests
};
