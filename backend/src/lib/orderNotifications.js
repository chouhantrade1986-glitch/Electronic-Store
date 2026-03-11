const { randomUUID } = require("crypto");
const {
  getChannelPreferenceKey,
  getOrderPreferenceKey,
  isNotificationChannelEnabledForEvent,
  normalizeNotificationPreferences
} = require("./notificationPreferences");
const { isPhoneVerifiedForCurrentMobile } = require("./phoneVerification");
const { sendTwilioMessage } = require("./twilioDelivery");

let smtpTransporterCache = null;
let smtpTransporterCacheKey = "";

const EVENT_LABELS = {
  ordered: "Order placed",
  processing: "Preparing for dispatch",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled"
};

const CHANNEL_LABELS = {
  email: "Email",
  sms: "SMS",
  whatsapp: "WhatsApp"
};

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

function normalizePhone(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }
  const hasPlus = raw.startsWith("+");
  const digits = raw.replace(/[^\d]/g, "");
  return `${hasPlus ? "+" : ""}${digits}`;
}

function isValidPhone(value) {
  return /^\+?[1-9]\d{7,14}$/.test(normalizePhone(value));
}

function resolveStoreBrandName() {
  return String(process.env.STORE_BRAND_NAME || "ElectroMart").trim() || "ElectroMart";
}

function resolveStoreSupportEmail() {
  return String(
    process.env.STORE_SUPPORT_EMAIL
    || process.env.SMTP_FROM_EMAIL
    || process.env.SENDGRID_FROM_EMAIL
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

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function resolveChannelMode(channel) {
  const key = String(channel || "email").trim().toLowerCase();
  if (key === "sms") {
    return String(process.env.ORDER_NOTIFICATION_SMS_MODE || "simulated").trim().toLowerCase();
  }
  if (key === "whatsapp") {
    return String(process.env.ORDER_NOTIFICATION_WHATSAPP_MODE || "simulated").trim().toLowerCase();
  }
  return String(process.env.ORDER_NOTIFICATION_EMAIL_MODE || process.env.BACK_IN_STOCK_EMAIL_MODE || "simulated")
    .trim()
    .toLowerCase();
}

function resolveEmailMode() {
  return resolveChannelMode("email");
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

async function sendWithTwilio(channel, destination, payload) {
  return sendTwilioMessage({
    channel,
    destination,
    text: String(payload.text || payload.subject || "")
  });
}

function ensureOrderNotificationCollection(db) {
  if (!Array.isArray(db.orderNotifications)) {
    db.orderNotifications = [];
  }
}

function buildOrderTrackingUrl(order) {
  const storeBase = resolvePublicStoreBaseUrl();
  return `${storeBase}/orders.html`;
}

function summarizeItems(order, limit = 3) {
  const items = Array.isArray(order && order.items) ? order.items : [];
  const names = items
    .map((item) => String(item && item.name ? item.name : "").trim())
    .filter(Boolean);
  if (!names.length) {
    return "Your order items";
  }
  if (names.length <= limit) {
    return names.join(", ");
  }
  return `${names.slice(0, limit).join(", ")} +${names.length - limit} more`;
}

function formatMoney(value) {
  return `INR ${asNumber(value, 0).toFixed(2)}`;
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Pending";
  }
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function getLatestEvent(order, key) {
  const history = Array.isArray(order && order.statusHistory) ? order.statusHistory : [];
  const matches = history.filter((entry) => String(entry && entry.key || "").toLowerCase() === String(key || "").toLowerCase());
  return matches.length ? matches[matches.length - 1] : null;
}

function buildOrderEmailPayload(order, user, eventKey) {
  const storeName = resolveStoreBrandName();
  const supportEmail = resolveStoreSupportEmail();
  const primaryColor = resolveStorePrimaryColor();
  const orderIdLabel = `EM-${String(order && order.id || "").slice(0, 8).toUpperCase()}`;
  const latestEvent = getLatestEvent(order, eventKey);
  const eventLabel = EVENT_LABELS[eventKey] || "Order update";
  const itemsLine = summarizeItems(order);
  const deliveryLine = order && order.deliverySlot && order.deliverySlot.label
    ? `${order.deliverySlot.label}${order.deliverySlot.eta ? ` | ${order.deliverySlot.eta}` : ""}`
    : "Standard delivery";
  const trackingUrl = buildOrderTrackingUrl(order);
  const paymentMethod = String(order && order.paymentMethod ? order.paymentMethod : "N/A").toUpperCase();

  let subject = `${storeName} update for order ${orderIdLabel}`;
  let headline = eventLabel;
  let bodyLine = `Your order ${orderIdLabel} has a new update.`;
  let nextStep = "Track the latest shipment progress from your orders page.";
  let supportLine = `Need help? Reply to this email or contact ${supportEmail}.`;

  if (eventKey === "ordered") {
    subject = `Order ${orderIdLabel} confirmed at ${storeName}`;
    headline = "Order confirmed";
    bodyLine = `We received your order ${orderIdLabel} and started processing it.`;
    nextStep = "We will notify you again as soon as your package is packed or shipped.";
  } else if (eventKey === "processing") {
    subject = `Order ${orderIdLabel} is being prepared`;
    headline = "Order in preparation";
    bodyLine = `Your order ${orderIdLabel} is being packed and prepared for dispatch.`;
    nextStep = "Inventory is verified and the shipment handoff is in progress.";
  } else if (eventKey === "shipped") {
    subject = `Order ${orderIdLabel} has shipped`;
    headline = "Order shipped";
    bodyLine = `Your order ${orderIdLabel} has left our warehouse and is on the way.`;
    nextStep = `Delivery is currently planned for ${deliveryLine}.`;
  } else if (eventKey === "delivered") {
    subject = `Order ${orderIdLabel} delivered`;
    headline = "Order delivered";
    bodyLine = `Your order ${orderIdLabel} has been marked as delivered.`;
    nextStep = "If anything looks wrong with the delivery, contact support and we will review it.";
  } else if (eventKey === "cancelled") {
    subject = `Order ${orderIdLabel} cancelled`;
    headline = "Order cancelled";
    bodyLine = `Your order ${orderIdLabel} has been cancelled.`;
    nextStep = "If payment was already collected, the refund or reversal will follow your payment method timeline.";
    supportLine = `Need the order restored or reviewed? Contact ${supportEmail}.`;
  }

  const eventTime = latestEvent ? formatDateTime(latestEvent.createdAt) : formatDateTime(order && order.createdAt);
  const text = [
    `Hi ${String(user && user.name || "there")},`,
    "",
    bodyLine,
    `Status: ${eventLabel}`,
    `Updated on: ${eventTime}`,
    `Items: ${itemsLine}`,
    `Order total: ${formatMoney(order && order.total)}`,
    `Payment method: ${paymentMethod}`,
    `Delivery slot: ${deliveryLine}`,
    `Next step: ${nextStep}`,
    `Track order: ${trackingUrl}`,
    "",
    supportLine,
    `${storeName} Support: ${supportEmail}`
  ].join("\n");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#0f172a">
      <h2 style="margin:0 0 12px;color:${escapeHtml(primaryColor)}">${escapeHtml(storeName)}</h2>
      <p style="margin:0 0 10px">Hi ${escapeHtml(user && user.name ? user.name : "there")},</p>
      <p style="margin:0 0 10px"><strong>${escapeHtml(headline)}</strong></p>
      <p style="margin:0 0 10px">${escapeHtml(bodyLine)}</p>
      <div style="margin:0 0 14px;padding:14px;border:1px solid #dbe2e8;border-radius:14px;background:#f8fafc">
        Order: <strong>${escapeHtml(orderIdLabel)}</strong><br />
        Status: ${escapeHtml(eventLabel)}<br />
        Updated on: ${escapeHtml(eventTime)}<br />
        Items: ${escapeHtml(itemsLine)}<br />
        Order total: ${escapeHtml(formatMoney(order && order.total))}<br />
        Payment method: ${escapeHtml(paymentMethod)}<br />
        Delivery slot: ${escapeHtml(deliveryLine)}
      </div>
      <p style="margin:0 0 12px;color:#334155">${escapeHtml(nextStep)}</p>
      <p style="margin:0 0 16px">
        <a href="${escapeHtml(trackingUrl)}" style="display:inline-block;background:${escapeHtml(primaryColor)};color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:999px;font-weight:700">Track Order</a>
      </p>
      <p style="margin:0 0 8px;font-size:13px;color:#475569">${escapeHtml(supportLine)}</p>
      <p style="margin:0;font-size:13px;color:#475569">${escapeHtml(storeName)} Support: ${escapeHtml(supportEmail)}</p>
    </div>
  `;

  return {
    subject,
    text,
    html,
    eventLabel
  };
}

function buildTestEmailPayload(user) {
  const storeName = resolveStoreBrandName();
  const supportEmail = resolveStoreSupportEmail();
  const primaryColor = resolveStorePrimaryColor();
  const accountUrl = `${resolvePublicStoreBaseUrl()}/account.html`;
  const preferences = normalizeNotificationPreferences(user && user.notificationPreferences);
  const enabledChannels = [
    preferences.emailEnabled ? "Email" : "",
    preferences.smsEnabled ? "SMS" : "",
    preferences.whatsappEnabled ? "WhatsApp" : ""
  ].filter(Boolean);
  const enabledMilestones = [
    preferences.orderShipped ? "Order shipped" : "",
    preferences.orderDelivered ? "Order delivered" : "",
    preferences.orderCancelled ? "Order cancelled" : ""
  ].filter(Boolean);
  const disabledMilestones = [
    preferences.orderShipped ? "" : "Order shipped",
    preferences.orderDelivered ? "" : "Order delivered",
    preferences.orderCancelled ? "" : "Order cancelled"
  ].filter(Boolean);
  const preferenceLine = enabledMilestones.length
    ? `Active order milestone alerts: ${enabledMilestones.join(", ")}.`
    : "All order milestone alerts are muted right now.";
  const channelLine = enabledChannels.length
    ? `Enabled channels: ${enabledChannels.join(", ")}.`
    : "All notification channels are disabled right now.";
  const subject = `${storeName} test notification`;
  const text = [
    `Hi ${String(user && user.name || "there")},`,
    "",
    "This is a test notification from your ElectroMart account settings.",
    channelLine,
    preferenceLine,
    disabledMilestones.length ? `Muted alerts: ${disabledMilestones.join(", ")}.` : "No order alert categories are muted right now.",
    `Provider modes: Email ${resolveChannelMode("email")}, SMS ${resolveChannelMode("sms")}, WhatsApp ${resolveChannelMode("whatsapp")}.`,
    `Manage preferences: ${accountUrl}`,
    "",
    `Need help? Contact ${supportEmail}.`
  ].join("\n");
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#0f172a">
      <h2 style="margin:0 0 12px;color:${escapeHtml(primaryColor)}">${escapeHtml(storeName)}</h2>
      <p style="margin:0 0 10px">Hi ${escapeHtml(user && user.name ? user.name : "there")},</p>
      <p style="margin:0 0 10px"><strong>Test notification</strong></p>
      <p style="margin:0 0 10px">This sample email confirms that your account can receive order updates.</p>
      <div style="margin:0 0 14px;padding:14px;border:1px solid #dbe2e8;border-radius:14px;background:#f8fafc">
        ${escapeHtml(channelLine)}<br />
        ${escapeHtml(preferenceLine)}<br />
        ${disabledMilestones.length ? `Muted alerts: ${escapeHtml(disabledMilestones.join(", "))}` : "Muted alerts: None"}<br />
        Provider modes: Email ${escapeHtml(resolveChannelMode("email"))}, SMS ${escapeHtml(resolveChannelMode("sms"))}, WhatsApp ${escapeHtml(resolveChannelMode("whatsapp"))}
      </div>
      <p style="margin:0 0 12px;color:#334155">Use your account settings to change shipped, delivered, or cancelled updates at any time.</p>
      <p style="margin:0 0 16px">
        <a href="${escapeHtml(accountUrl)}" style="display:inline-block;background:${escapeHtml(primaryColor)};color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:999px;font-weight:700">Open Notification Settings</a>
      </p>
      <p style="margin:0;font-size:13px;color:#475569">Need help? Contact ${escapeHtml(supportEmail)}.</p>
    </div>
  `;

  return {
    subject,
    text,
    html,
    eventLabel: "Test notification"
  };
}

function normalizeChannel(value) {
  const key = String(value || "email").trim().toLowerCase();
  if (key === "sms" || key === "whatsapp") {
    return key;
  }
  return "email";
}

function getNotificationChannels() {
  return ["email", "sms", "whatsapp"];
}

function getUserChannelDestination(user, channel) {
  const key = normalizeChannel(channel);
  if (key === "sms" || key === "whatsapp") {
    return normalizePhone(user && user.mobile ? user.mobile : "");
  }
  return normalizeEmail(user && user.email ? user.email : "");
}

function isValidChannelDestination(channel, destination) {
  return normalizeChannel(channel) === "email" ? isValidEmail(destination) : isValidPhone(destination);
}

function buildChannelPreferenceError(channel, preferences, eventKey) {
  const channelKey = getChannelPreferenceKey(channel);
  const eventPreferenceKey = getOrderPreferenceKey(eventKey);
  if (channelKey && preferences[channelKey] !== true) {
    return `${CHANNEL_LABELS[channel] || channel} notifications are disabled for this customer.`;
  }
  if (eventPreferenceKey && preferences[eventPreferenceKey] === false) {
    return `Customer disabled ${EVENT_LABELS[eventKey] || "this"} notifications across all channels.`;
  }
  return "Customer disabled this notification.";
}

function buildMissingDestinationError(channel) {
  return `${CHANNEL_LABELS[channel] || channel} destination is missing or invalid.`;
}

function isPhoneVerificationRequiredForChannel(channel) {
  const key = normalizeChannel(channel);
  return key === "sms" || key === "whatsapp";
}

function buildPhoneVerificationError(channel) {
  return `Customer phone number is not verified for ${CHANNEL_LABELS[channel] || channel} notifications.`;
}

function buildBatchSummaryMessage(label, summary) {
  const parts = [];
  if (summary.deliveredCount > 0) {
    parts.push(`${summary.deliveredCount} sent`);
  }
  if (summary.failedCount > 0) {
    parts.push(`${summary.failedCount} failed`);
  }
  if (summary.skippedCount > 0) {
    parts.push(`${summary.skippedCount} skipped`);
  }
  return parts.length ? `${label}: ${parts.join(", ")}.` : `${label}: no channels processed.`;
}

function summarizeNotificationBatch(results) {
  const safeResults = Array.isArray(results) ? results : [];
  const notifications = safeResults.map((item) => item.notification).filter(Boolean);
  const deliveredCount = safeResults.filter((item) => item.delivered).length;
  const failedCount = safeResults.filter((item) => item.failed).length;
  const skippedCount = safeResults.filter((item) => item.skipped).length;
  const skipped = safeResults.length > 0 && skippedCount === safeResults.length;
  const reasons = [...new Set(safeResults.map((item) => item.reason).filter(Boolean))];
  return {
    delivered: deliveredCount > 0,
    failed: failedCount > 0 && deliveredCount === 0,
    skipped,
    reason: reasons.join(", "),
    notification: notifications[0] || null,
    notifications,
    deliveredCount,
    failedCount,
    skippedCount,
    channels: safeResults.map((item) => ({
      channel: item.channel,
      delivered: Boolean(item.delivered),
      failed: Boolean(item.failed),
      skipped: Boolean(item.skipped),
      reason: String(item.reason || ""),
      notificationId: item.notification && item.notification.id ? item.notification.id : ""
    }))
  };
}

async function sendNotificationPayload(channel, user, payload) {
  const normalizedChannel = normalizeChannel(channel);
  const mode = resolveChannelMode(normalizedChannel);
  const destination = getUserChannelDestination(user, normalizedChannel);
  const baseResult = {
    subject: payload.subject,
    text: payload.text,
    html: normalizedChannel === "email" ? payload.html : "",
    eventLabel: payload.eventLabel,
    channel: normalizedChannel,
    destination
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

  if (normalizedChannel === "email" && mode === "smtp") {
    return {
      ...baseResult,
      ...(await sendWithSmtp(normalizeEmail(user && user.email), payload))
    };
  }

  if (normalizedChannel === "email" && mode === "sendgrid") {
    return {
      ...baseResult,
      ...(await sendWithSendGrid(normalizeEmail(user && user.email), payload))
    };
  }

  if ((normalizedChannel === "sms" || normalizedChannel === "whatsapp") && mode === "twilio") {
    return {
      ...baseResult,
      ...(await sendWithTwilio(normalizedChannel, destination, payload))
    };
  }

  const error = new Error(`Unsupported ${normalizedChannel.toUpperCase()} notification mode: ${mode}`);
  error.code = "NOTIFICATION_MODE_INVALID";
  throw error;
}

async function sendOrderStatusNotificationChannel(order, user, eventKey, channel) {
  const payload = buildOrderEmailPayload(order, user, eventKey);
  return sendNotificationPayload(channel, user, payload);
}

async function sendTestNotificationChannel(user, channel) {
  const payload = buildTestEmailPayload(user);
  return sendNotificationPayload(channel, user, payload);
}

function buildOrderNotificationRecord(params = {}) {
  return {
    id: randomUUID(),
    orderId: String(params.orderId || ""),
    userId: String(params.userId || ""),
    channel: normalizeChannel(params.channel || "email"),
    destination: String(params.destination || ""),
    email: normalizeEmail(params.email || ""),
    eventKey: String(params.eventKey || ""),
    eventLabel: String(params.eventLabel || EVENT_LABELS[params.eventKey] || "Order update"),
    status: String(params.status || "queued"),
    provider: String(params.provider || "system"),
    subject: String(params.subject || ""),
    text: String(params.text || ""),
    messageId: String(params.messageId || randomUUID()),
    error: String(params.error || ""),
    triggeredBy: String(params.triggeredBy || "order-status-update"),
    triggeredFrom: String(params.triggeredFrom || "system"),
    createdAt: String(params.createdAt || new Date().toISOString()),
    sentAt: params.sentAt || null,
    eventCreatedAt: String(params.eventCreatedAt || "")
  };
}

async function dispatchOrderStatusNotification(db, order, meta = {}) {
  ensureOrderNotificationCollection(db);
  const user = (db.users || []).find((item) => String(item.id || "") === String(order && order.userId || ""));
  const eventKey = String(meta.eventKey || "").trim().toLowerCase();
  const latestEvent = getLatestEvent(order, eventKey);

  if (!eventKey || !latestEvent) {
    return { delivered: false, skipped: true, reason: "missing-event" };
  }

  const now = new Date().toISOString();
  const userPreferences = normalizeNotificationPreferences(user && user.notificationPreferences);
  const results = [];

  getNotificationChannels().forEach((channel) => {
    const duplicate = db.orderNotifications.find((item) => {
      const itemChannel = normalizeChannel(item && item.channel ? item.channel : "email");
      return String(item && item.orderId ? item.orderId : "") === String(order.id || "")
        && String(item && item.eventKey ? item.eventKey : "") === eventKey
        && String(item && item.eventCreatedAt ? item.eventCreatedAt : "") === String(latestEvent.createdAt || "")
        && itemChannel === channel;
    });
    if (duplicate) {
      results.push({
        channel,
        delivered: duplicate.status === "sent",
        skipped: true,
        reason: "duplicate",
        notification: duplicate
      });
    }
  });

  for (const channel of getNotificationChannels()) {
    if (results.some((item) => item.channel === channel && item.reason === "duplicate")) {
      continue;
    }

    const destination = getUserChannelDestination(user, channel);
    if (isPhoneVerificationRequiredForChannel(channel) && !isPhoneVerifiedForCurrentMobile(user)) {
      const unverifiedRecord = buildOrderNotificationRecord({
        orderId: order && order.id,
        userId: order && order.userId,
        channel,
        destination,
        email: user && user.email ? user.email : "",
        eventKey,
        eventLabel: EVENT_LABELS[eventKey] || "Order update",
        status: "muted",
        provider: "verification",
        subject: `${EVENT_LABELS[eventKey] || "Order update"} notification`,
        error: buildPhoneVerificationError(channel),
        triggeredBy: String(meta.triggeredBy || "order-status-update"),
        triggeredFrom: String(meta.triggeredFrom || "system"),
        createdAt: now,
        eventCreatedAt: latestEvent.createdAt
      });
      db.orderNotifications.push(unverifiedRecord);
      results.push({ channel, delivered: false, skipped: true, reason: "phone-unverified", notification: unverifiedRecord });
      continue;
    }
    if (!isNotificationChannelEnabledForEvent(user, channel, eventKey)) {
      const mutedRecord = buildOrderNotificationRecord({
        orderId: order && order.id,
        userId: order && order.userId,
        channel,
        destination,
        email: user && user.email ? user.email : "",
        eventKey,
        eventLabel: EVENT_LABELS[eventKey] || "Order update",
        status: "muted",
        provider: "preferences",
        subject: `${EVENT_LABELS[eventKey] || "Order update"} notification`,
        error: buildChannelPreferenceError(channel, userPreferences, eventKey),
        triggeredBy: String(meta.triggeredBy || "order-status-update"),
        triggeredFrom: String(meta.triggeredFrom || "system"),
        createdAt: now,
        eventCreatedAt: latestEvent.createdAt
      });
      db.orderNotifications.push(mutedRecord);
      results.push({ channel, delivered: false, skipped: true, reason: "muted", notification: mutedRecord });
      continue;
    }

    if (!user || !isValidChannelDestination(channel, destination)) {
      const missingRecipient = buildOrderNotificationRecord({
        orderId: order && order.id,
        userId: order && order.userId,
        channel,
        destination,
        email: user && user.email ? user.email : "",
        eventKey,
        status: "failed",
        provider: "system",
        subject: `${EVENT_LABELS[eventKey] || "Order update"} notification`,
        error: buildMissingDestinationError(channel),
        triggeredBy: String(meta.triggeredBy || "order-status-update"),
        triggeredFrom: String(meta.triggeredFrom || "system"),
        createdAt: now,
        eventCreatedAt: latestEvent.createdAt
      });
      db.orderNotifications.push(missingRecipient);
      results.push({ channel, delivered: false, skipped: false, failed: true, notification: missingRecipient });
      continue;
    }

    try {
      const result = await sendOrderStatusNotificationChannel(order, user, eventKey, channel);
      const record = buildOrderNotificationRecord({
        orderId: order.id,
        userId: order.userId,
        channel,
        destination: result.destination,
        email: user.email,
        eventKey,
        eventLabel: result.eventLabel,
        status: result.status,
        provider: result.provider,
        subject: result.subject,
        text: result.text,
        messageId: result.messageId,
        triggeredBy: String(meta.triggeredBy || "order-status-update"),
        triggeredFrom: String(meta.triggeredFrom || "system"),
        createdAt: now,
        sentAt: result.delivered ? now : null,
        eventCreatedAt: latestEvent.createdAt
      });
      db.orderNotifications.push(record);
      results.push({ channel, delivered: result.delivered, skipped: false, failed: false, notification: record });
    } catch (error) {
      const record = buildOrderNotificationRecord({
        orderId: order.id,
        userId: order.userId,
        channel,
        destination,
        email: user && user.email ? user.email : "",
        eventKey,
        status: "failed",
        provider: resolveChannelMode(channel),
        subject: `${EVENT_LABELS[eventKey] || "Order update"} notification`,
        error: String(error && error.message ? error.message : "Notification delivery failed."),
        triggeredBy: String(meta.triggeredBy || "order-status-update"),
        triggeredFrom: String(meta.triggeredFrom || "system"),
        createdAt: now,
        eventCreatedAt: latestEvent.createdAt
      });
      db.orderNotifications.push(record);
      results.push({ channel, delivered: false, skipped: false, failed: true, notification: record });
    }
  }

  return summarizeNotificationBatch(results);
}

async function resendOrderNotification(db, notificationId, meta = {}) {
  ensureOrderNotificationCollection(db);
  const notification = db.orderNotifications.find((item) => String(item && item.id ? item.id : "") === String(notificationId || ""));
  if (!notification) {
    return { ok: false, status: 404, message: "Notification not found." };
  }
  const channel = normalizeChannel(notification.channel || "email");
  const user = (db.users || []).find((item) => {
    return String(item && item.id ? item.id : "") === String(notification.userId || "")
      || normalizeEmail(item && item.email ? item.email : "") === normalizeEmail(notification.email || "");
  });
  if (!user) {
    return { ok: false, status: 404, message: "Customer not found for this notification." };
  }

  const destination = getUserChannelDestination(user, channel);
  const eventKey = String(notification.eventKey || "").trim().toLowerCase();
  const now = new Date().toISOString();
  if (isPhoneVerificationRequiredForChannel(channel) && !isPhoneVerifiedForCurrentMobile(user)) {
    return {
      ok: false,
      status: 409,
      message: buildPhoneVerificationError(channel)
    };
  }
  if (!isNotificationChannelEnabledForEvent(user, channel, eventKey)) {
    return {
      ok: false,
      status: 409,
      message: buildChannelPreferenceError(channel, normalizeNotificationPreferences(user.notificationPreferences), eventKey)
    };
  }
  if (!isValidChannelDestination(channel, destination)) {
    return { ok: false, status: 400, message: buildMissingDestinationError(channel) };
  }

  if (eventKey === "test" || !String(notification.orderId || "").trim()) {
    try {
      const result = await sendTestNotificationChannel(user, channel);
      const record = buildOrderNotificationRecord({
        orderId: "",
        userId: user.id,
        channel,
        destination: result.destination,
        email: user.email,
        eventKey: "test",
        eventLabel: result.eventLabel,
        status: result.status,
        provider: result.provider,
        subject: result.subject,
        text: result.text,
        messageId: result.messageId,
        triggeredBy: String(meta.triggeredBy || "admin-resend"),
        triggeredFrom: String(meta.triggeredFrom || "admin-dashboard"),
        createdAt: now,
        sentAt: result.delivered ? now : null,
        eventCreatedAt: now
      });
      db.orderNotifications.push(record);
      return {
        ok: true,
        status: 200,
        message: result.delivered ? "Notification resent successfully." : "Notification resend queued.",
        notification: record
      };
    } catch (error) {
      const record = buildOrderNotificationRecord({
        orderId: "",
        userId: user.id,
        channel,
        destination,
        email: user.email,
        eventKey: "test",
        eventLabel: "Test notification",
        status: "failed",
        provider: resolveChannelMode(channel),
        subject: "Test notification",
        error: String(error && error.message ? error.message : "Notification resend failed."),
        triggeredBy: String(meta.triggeredBy || "admin-resend"),
        triggeredFrom: String(meta.triggeredFrom || "admin-dashboard"),
        createdAt: now,
        eventCreatedAt: now
      });
      db.orderNotifications.push(record);
      return {
        ok: false,
        status: 500,
        message: record.error || "Notification resend failed.",
        notification: record
      };
    }
  }

  const order = (db.orders || []).find((item) => String(item && item.id ? item.id : "") === String(notification.orderId || ""));
  if (!order) {
    return { ok: false, status: 404, message: "Order not found for this notification." };
  }
  const latestEvent = getLatestEvent(order, eventKey);
  if (!latestEvent) {
    return { ok: false, status: 400, message: "No matching order event available for resend." };
  }

  try {
    const result = await sendOrderStatusNotificationChannel(order, user, eventKey, channel);
    const record = buildOrderNotificationRecord({
      orderId: order.id,
      userId: order.userId,
      channel,
      destination: result.destination,
      email: user.email,
      eventKey,
      eventLabel: result.eventLabel,
      status: result.status,
      provider: result.provider,
      subject: result.subject,
      text: result.text,
      messageId: result.messageId,
      triggeredBy: String(meta.triggeredBy || "admin-resend"),
      triggeredFrom: String(meta.triggeredFrom || "admin-dashboard"),
      createdAt: now,
      sentAt: result.delivered ? now : null,
      eventCreatedAt: latestEvent.createdAt
    });
    db.orderNotifications.push(record);
    return {
      ok: true,
      status: 200,
      message: result.delivered ? "Notification resent successfully." : "Notification resend queued.",
      notification: record
    };
  } catch (error) {
    const record = buildOrderNotificationRecord({
      orderId: order.id,
      userId: order.userId,
      channel,
      destination,
      email: user.email,
      eventKey,
      status: "failed",
      provider: resolveChannelMode(channel),
      subject: `${EVENT_LABELS[eventKey] || "Order update"} notification`,
      error: String(error && error.message ? error.message : "Notification resend failed."),
      triggeredBy: String(meta.triggeredBy || "admin-resend"),
      triggeredFrom: String(meta.triggeredFrom || "admin-dashboard"),
      createdAt: now,
      eventCreatedAt: latestEvent.createdAt
    });
    db.orderNotifications.push(record);
    return {
      ok: false,
      status: 500,
      message: record.error || "Notification resend failed.",
      notification: record
    };
  }
}

async function sendTestNotification(db, user, meta = {}) {
  ensureOrderNotificationCollection(db);
  if (!user) {
    return { ok: false, status: 404, message: "User not found." };
  }

  const now = new Date().toISOString();
  const results = [];
  const preferences = normalizeNotificationPreferences(user.notificationPreferences);

  for (const channel of getNotificationChannels()) {
    const destination = getUserChannelDestination(user, channel);
    if (isPhoneVerificationRequiredForChannel(channel) && !isPhoneVerifiedForCurrentMobile(user)) {
      const unverifiedRecord = buildOrderNotificationRecord({
        orderId: "",
        userId: user.id,
        channel,
        destination,
        email: user.email,
        eventKey: "test",
        eventLabel: "Test notification",
        status: "muted",
        provider: "verification",
        subject: "Test notification",
        error: buildPhoneVerificationError(channel),
        triggeredBy: String(meta.triggeredBy || "customer-test"),
        triggeredFrom: String(meta.triggeredFrom || "account-page"),
        createdAt: now,
        eventCreatedAt: now
      });
      db.orderNotifications.push(unverifiedRecord);
      results.push({ channel, delivered: false, skipped: true, reason: "phone-unverified", notification: unverifiedRecord });
      continue;
    }
    if (!isNotificationChannelEnabledForEvent(user, channel, "test")) {
      const mutedRecord = buildOrderNotificationRecord({
        orderId: "",
        userId: user.id,
        channel,
        destination,
        email: user.email,
        eventKey: "test",
        eventLabel: "Test notification",
        status: "muted",
        provider: "preferences",
        subject: "Test notification",
        error: buildChannelPreferenceError(channel, preferences, "test"),
        triggeredBy: String(meta.triggeredBy || "customer-test"),
        triggeredFrom: String(meta.triggeredFrom || "account-page"),
        createdAt: now,
        eventCreatedAt: now
      });
      db.orderNotifications.push(mutedRecord);
      results.push({ channel, delivered: false, skipped: true, reason: "muted", notification: mutedRecord });
      continue;
    }

    if (!isValidChannelDestination(channel, destination)) {
      const invalidRecipient = buildOrderNotificationRecord({
        orderId: "",
        userId: user.id,
        channel,
        destination,
        email: user.email,
        eventKey: "test",
        eventLabel: "Test notification",
        status: "failed",
        provider: "system",
        subject: "Test notification",
        error: buildMissingDestinationError(channel),
        triggeredBy: String(meta.triggeredBy || "customer-test"),
        triggeredFrom: String(meta.triggeredFrom || "account-page"),
        createdAt: now,
        eventCreatedAt: now
      });
      db.orderNotifications.push(invalidRecipient);
      results.push({ channel, delivered: false, skipped: false, failed: true, notification: invalidRecipient });
      continue;
    }

    try {
      const result = await sendTestNotificationChannel(user, channel);
      const record = buildOrderNotificationRecord({
        orderId: "",
        userId: user.id,
        channel,
        destination: result.destination,
        email: user.email,
        eventKey: "test",
        eventLabel: result.eventLabel,
        status: result.status,
        provider: result.provider,
        subject: result.subject,
        text: result.text,
        messageId: result.messageId,
        triggeredBy: String(meta.triggeredBy || "customer-test"),
        triggeredFrom: String(meta.triggeredFrom || "account-page"),
        createdAt: now,
        sentAt: result.delivered ? now : null,
        eventCreatedAt: now
      });
      db.orderNotifications.push(record);
      results.push({ channel, delivered: result.delivered, skipped: false, failed: false, notification: record });
    } catch (error) {
      const record = buildOrderNotificationRecord({
        orderId: "",
        userId: user.id,
        channel,
        destination,
        email: user.email,
        eventKey: "test",
        eventLabel: "Test notification",
        status: "failed",
        provider: resolveChannelMode(channel),
        subject: "Test notification",
        error: String(error && error.message ? error.message : "Test notification failed."),
        triggeredBy: String(meta.triggeredBy || "customer-test"),
        triggeredFrom: String(meta.triggeredFrom || "account-page"),
        createdAt: now,
        eventCreatedAt: now
      });
      db.orderNotifications.push(record);
      results.push({ channel, delivered: false, skipped: false, failed: true, notification: record });
    }
  }

  const summary = summarizeNotificationBatch(results);
  return {
    ok: !summary.failed || summary.delivered,
    status: summary.failed && !summary.delivered ? 500 : 200,
    message: buildBatchSummaryMessage("Test notification", summary),
    ...summary
  };
}

function listOrderNotifications(db, limit = 100) {
  ensureOrderNotificationCollection(db);
  return [...db.orderNotifications]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, Math.max(1, Math.min(500, asNumber(limit, 100))));
}

function listOrderNotificationsForUser(db, user, limit = 100) {
  ensureOrderNotificationCollection(db);
  const userId = String(user && user.id ? user.id : "");
  const email = normalizeEmail(user && user.email ? user.email : "");
  const mobile = normalizePhone(user && user.mobile ? user.mobile : "");
  return [...db.orderNotifications]
    .filter((item) => {
      const itemUserId = String(item && item.userId ? item.userId : "");
      const itemEmail = normalizeEmail(item && item.email ? item.email : "");
      const itemDestination = normalizePhone(item && item.destination ? item.destination : "");
      return (userId && itemUserId === userId)
        || (email && itemEmail === email)
        || (mobile && itemDestination === mobile);
    })
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, Math.max(1, Math.min(500, asNumber(limit, 100))));
}

module.exports = {
  dispatchOrderStatusNotification,
  ensureOrderNotificationCollection,
  listOrderNotifications,
  listOrderNotificationsForUser,
  resendOrderNotification,
  sendNotificationPayload,
  sendTestNotification
};
