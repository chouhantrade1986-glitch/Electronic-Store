const AUTH_STORAGE_KEY = "electromart_auth_v1";
const OFFLINE_ORDERS_KEY = "electromart_offline_orders_v1";
const ORDER_NOTIFICATIONS_STORAGE_KEY = "electromart_order_notifications_v1";
const NOTIFICATION_READ_STATE_KEY = "electromart_notification_reads_v1";
const API_BASE_URL = (() => {
  const { protocol, hostname, port } = window.location;
  if (protocol === "file:" || hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:4000/api";
  }
  const origin = `${protocol}//${hostname}${port ? `:${port}` : ""}`;
  return `${origin}/api`;
})();

const ordersGrid = document.getElementById("ordersGrid");
const ordersMeta = document.getElementById("ordersMeta");
const orderSearch = document.getElementById("orderSearch");
const statusFilter = document.getElementById("statusFilter");
const timeFilter = document.getElementById("timeFilter");
const orderTabs = document.getElementById("orderTabs");
let currentOrderTab = "orders";
const ordersPhoneVerificationBadge = document.getElementById("ordersPhoneVerificationBadge");
const orderNotificationsMeta = document.getElementById("orderNotificationsMeta");
const orderNotificationsList = document.getElementById("orderNotificationsList");
const markAllOrderNotificationsReadBtn = document.getElementById("markAllOrderNotificationsReadBtn");
const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});
const STATUS_HISTORY_LABELS = {
  ordered: "Order placed",
  processing: "Preparing for dispatch",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled"
};
const AFTER_SALES_TYPE_LABELS = {
  return: "Return",
  refund: "Refund",
  exchange: "Exchange"
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
const AFTER_SALES_PROGRESS_FLOW = {
  refund: ["requested", "approved", "refund_pending", "refunded", "closed"],
  return: ["requested", "approved", "pickup_scheduled", "in_transit", "received", "refund_pending", "refunded", "closed"],
  exchange: ["requested", "approved", "pickup_scheduled", "in_transit", "received", "exchange_processing", "exchange_shipped", "exchange_completed", "closed"]
};

let orders = [];
let currentOrderNotifications = [];
let razorpayScriptPromise = null;
let orderToastTimeoutCounter = 0;
let filterChipController = null;

function normalizePhoneVerificationState(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    isVerified: source.isVerified === true,
    verifiedAt: source.verifiedAt ? String(source.verifiedAt) : null
  };
}

function applyOrdersPhoneVerificationBadge(value) {
  if (!ordersPhoneVerificationBadge) {
    return;
  }
  const state = normalizePhoneVerificationState(value);
  ordersPhoneVerificationBadge.textContent = state.isVerified ? "Phone Verified" : "Phone Pending";
  ordersPhoneVerificationBadge.classList.toggle("verified", state.isVerified);
  ordersPhoneVerificationBadge.classList.toggle("pending", !state.isVerified);
  if (state.verifiedAt) {
    ordersPhoneVerificationBadge.title = `Verified on ${formatDateTime(state.verifiedAt)}`;
  } else {
    ordersPhoneVerificationBadge.title = "Verify your phone number from account settings to enable SMS or WhatsApp updates.";
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeAfterSalesCaseView(item) {
  const source = item && typeof item === "object" ? item : {};
  const timeline = Array.isArray(source.timeline) ? source.timeline : [];
  const latestUpdate = source.latestUpdate && typeof source.latestUpdate === "object"
    ? source.latestUpdate
    : (timeline.length
      ? [...timeline].sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime())[0]
      : null);

  return {
    id: String(source.id || "").trim(),
    orderId: String(source.orderId || "").trim(),
    type: String(source.type || "return").trim().toLowerCase(),
    typeLabel: String(source.typeLabel || AFTER_SALES_TYPE_LABELS[source.type] || formatStatus(source.type || "return")).trim(),
    reason: String(source.reason || "other").trim().toLowerCase(),
    reasonLabel: String(source.reasonLabel || AFTER_SALES_REASON_LABELS[source.reason] || formatStatus(source.reason || "other")).trim(),
    status: String(source.status || "requested").trim().toLowerCase(),
    statusLabel: String(source.statusLabel || AFTER_SALES_STATUS_LABELS[source.status] || formatStatus(source.status || "requested")).trim(),
    note: String(source.note || "").trim(),
    adminNote: String(source.adminNote || "").trim(),
    resolutionNote: String(source.resolutionNote || "").trim(),
    refundAmount: Number(source.refundAmount || 0),
    createdAt: String(source.createdAt || "").trim(),
    updatedAt: String(source.updatedAt || source.createdAt || "").trim(),
    timeline,
    latestUpdate,
    final: source.final === true
  };
}

function readSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function updateSessionFromUserPayload(user) {
  const session = readSession();
  if (!session || !user) {
    return;
  }
  const nextSession = {
    ...session,
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    address: user.address,
    role: user.role,
    phoneVerification: normalizePhoneVerificationState(user.phoneVerification)
  };
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
  } catch (error) {
    return;
  }
}

async function syncOrdersAccountState(session) {
  applyOrdersPhoneVerificationBadge(session && session.phoneVerification ? session.phoneVerification : null);
  if (!session || !session.token) {
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${session.token}`
      }
    });
    if (!response.ok) {
      return;
    }
    const user = await response.json().catch(() => null);
    if (!user) {
      return;
    }
    updateSessionFromUserPayload(user);
    applyOrdersPhoneVerificationBadge(user.phoneVerification || null);
  } catch (error) {
    return;
  }
}

function loadOfflineOrders() {
  try {
    const raw = localStorage.getItem(OFFLINE_ORDERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function loadOfflineOrderNotifications() {
  try {
    const raw = localStorage.getItem(ORDER_NOTIFICATIONS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function getNotificationUserKey(session = readSession()) {
  const id = String(session && session.id ? session.id : "").trim();
  const email = String(session && session.email ? session.email : "").trim().toLowerCase();
  return id || email || "guest";
}

function loadNotificationReadState() {
  try {
    const raw = localStorage.getItem(NOTIFICATION_READ_STATE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
}

function saveNotificationReadState(state) {
  try {
    localStorage.setItem(NOTIFICATION_READ_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    return;
  }
}

function getNotificationStateKey(item) {
  return String(item && item.id ? item.id : "")
    || `${String(item.orderId || "").trim()}|${String(item.eventKey || "").trim()}|${String(item.channel || "email").trim()}|${String(item.createdAt || "").trim()}`;
}

function isNotificationRead(item, session = readSession()) {
  const store = loadNotificationReadState();
  const userKey = getNotificationUserKey(session);
  return Boolean(store[userKey] && store[userKey][getNotificationStateKey(item)]);
}

function setNotificationRead(item, read, session = readSession()) {
  const store = loadNotificationReadState();
  const userKey = getNotificationUserKey(session);
  const next = { ...(store[userKey] || {}) };
  const key = getNotificationStateKey(item);
  if (read) {
    next[key] = true;
  } else {
    delete next[key];
  }
  store[userKey] = next;
  saveNotificationReadState(store);
}

function normalizeNotification(item) {
  return {
    id: String(item && item.id ? item.id : ""),
    orderId: String(item && item.orderId ? item.orderId : "").trim(),
    email: String(item && item.email ? item.email : "").trim().toLowerCase(),
    eventKey: String(item && item.eventKey ? item.eventKey : "update").trim().toLowerCase(),
    eventLabel: String(item && item.eventLabel ? item.eventLabel : "Order update").trim(),
    status: String(item && item.status ? item.status : "queued").trim().toLowerCase(),
    channel: String(item && item.channel ? item.channel : "email").trim().toLowerCase(),
    provider: String(item && item.provider ? item.provider : "system").trim(),
    destination: String(item && item.destination ? item.destination : "").trim(),
    subject: String(item && item.subject ? item.subject : "").trim(),
    createdAt: String(item && (item.sentAt || item.createdAt) ? (item.sentAt || item.createdAt) : "").trim()
  };
}

function formatNotificationChannel(channel) {
  const key = String(channel || "").trim().toLowerCase();
  if (key === "sms") {
    return "SMS";
  }
  if (key === "whatsapp") {
    return "WhatsApp";
  }
  if (key === "local") {
    return "Local";
  }
  return "Email";
}

function renderOrderNotifications(list) {
  const safeList = Array.isArray(list) ? list : [];
  const unreadCount = safeList.filter((item) => !isNotificationRead(item)).length;
  if (orderNotificationsMeta) {
    orderNotificationsMeta.textContent = `${safeList.length} updates • Unread ${unreadCount}`;
  }
  if (!orderNotificationsList) {
    return;
  }
  if (!safeList.length) {
    orderNotificationsList.innerHTML = "<div class='empty-message'>Order notifications will appear here after status updates are sent.</div>";
    return;
  }

  orderNotificationsList.innerHTML = safeList.slice(0, 4).map((item) => `
    <article class="order-update-item ${isNotificationRead(item) ? "read" : "unread"}">
      <div class="order-update-item-head">
        <div>
          <strong>${escapeHtml(item.eventLabel)}</strong>
          <p>${escapeHtml(item.subject || `Order ${item.orderId || "update"} changed status.`)}</p>
        </div>
        <span class="order-update-time">${escapeHtml(formatDateTime(item.createdAt))}</span>
      </div>
      <div class="order-update-meta">
        <span class="badge ${escapeHtml(item.status)}">${escapeHtml(formatStatus(item.status))}</span>
        <span class="order-update-channel">${escapeHtml(formatNotificationChannel(item.channel))}</span>
        <span class="order-update-read-state">${isNotificationRead(item) ? "Read" : "Unread"}</span>
        <span>Order: <strong>${escapeHtml(item.orderId || "N/A")}</strong></span>
        <a href="#ordersGrid">Jump to orders</a>
        <button class="order-update-action" type="button" data-action="toggle-read" data-notification-key="${escapeHtml(getNotificationStateKey(item))}">${isNotificationRead(item) ? "Mark Unread" : "Mark Read"}</button>
      </div>
    </article>
  `).join("");
}

async function loadOrderNotifications(session) {
  const localList = loadOfflineOrderNotifications()
    .filter((item) => {
      const email = String(item && item.email ? item.email : "").trim().toLowerCase();
      return !session?.email || !email || email === String(session.email || "").trim().toLowerCase();
    })
    .map(normalizeNotification);

  if (!session || !session.token) {
    renderOrderNotifications(localList);
    return;
  }

  let remoteList = [];
  try {
    const response = await fetch(`${API_BASE_URL}/orders/notifications?limit=20`, {
      headers: {
        Authorization: `Bearer ${session.token}`
      }
    });
    if (response.ok) {
      const data = await response.json().catch(() => null);
      remoteList = Array.isArray(data && data.notifications) ? data.notifications.map(normalizeNotification) : [];
    }
  } catch (error) {
    remoteList = [];
  }

  const seen = new Set();
  const merged = [...remoteList, ...localList]
    .filter((item) => {
      const key = getNotificationStateKey(item);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  currentOrderNotifications = merged;
  renderOrderNotifications(currentOrderNotifications);
}

function getSessionOrRedirect() {
  const session = readSession();
  if (!session || !session.token) {
    window.location.href = "auth.html";
    return null;
  }
  return session;
}

function formatDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return String(isoDate || "N/A");
  }
  return date.toISOString().slice(0, 10);
}

function formatDateTime(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return String(isoDate || "Pending");
  }
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function normalizeHistoryKey(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) {
    return "";
  }
  if (raw === "placed" || raw === "order_placed") {
    return "ordered";
  }
  if (raw === "packed") {
    return "processing";
  }
  return ["ordered", "processing", "shipped", "delivered", "cancelled"].includes(raw) ? raw : "";
}

function buildStatusHistoryEntry(key, createdAt, overrides = {}) {
  const normalizedKey = normalizeHistoryKey(key);
  if (!normalizedKey) {
    return null;
  }
  return {
    key: normalizedKey,
    status: normalizedKey === "ordered" ? "processing" : normalizedKey,
    label: String(overrides.label || STATUS_HISTORY_LABELS[normalizedKey] || normalizedKey),
    createdAt: String(createdAt || "").trim() || new Date().toISOString(),
    inferred: Boolean(overrides.inferred)
  };
}

function normalizeStatusHistory(list, createdAt, currentStatus) {
  const status = normalizeHistoryKey(currentStatus) || "processing";
  const orderedAt = String(createdAt || "").trim() || new Date().toISOString();
  const history = (Array.isArray(list) ? list : [])
    .map((entry) => buildStatusHistoryEntry(entry && (entry.key || entry.status), entry && entry.createdAt ? entry.createdAt : orderedAt, {
      label: entry && entry.label ? entry.label : "",
      inferred: entry && entry.inferred
    }))
    .filter(Boolean)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const byKey = new Map();
  history.forEach((entry) => {
    const previous = byKey.get(entry.key);
    if (!previous || (previous.inferred && !entry.inferred)) {
      byKey.set(entry.key, entry);
    }
  });

  if (!byKey.has("ordered")) {
    byKey.set("ordered", buildStatusHistoryEntry("ordered", orderedAt));
  }
  if (!byKey.has("processing")) {
    byKey.set("processing", buildStatusHistoryEntry("processing", orderedAt, {
      inferred: history.length === 0 || status !== "processing"
    }));
  }
  if (["shipped", "delivered", "cancelled"].includes(status) && !byKey.has(status)) {
    byKey.set(status, buildStatusHistoryEntry(status, orderedAt, { inferred: true }));
  }

  return Array.from(byKey.values())
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

function getStatusEvent(order, key) {
  const normalizedKey = normalizeHistoryKey(key);
  if (!normalizedKey || !Array.isArray(order && order.statusHistory)) {
    return null;
  }
  const matches = order.statusHistory.filter((entry) => entry.key === normalizedKey);
  return matches.length ? matches[matches.length - 1] : null;
}

function getLatestStatusEvent(order) {
  if (!Array.isArray(order && order.statusHistory) || !order.statusHistory.length) {
    return null;
  }
  return [...order.statusHistory].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).pop() || null;
}

function formatStatus(status) {
  const value = String(status || "").trim().replace(/[_-]+/g, " ");
  if (!value) {
    return "Unknown";
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatPaymentStatus(status) {
  const key = String(status || "").trim().toLowerCase();
  if (key === "pending" || key === "requires_confirmation") {
    return "Awaiting payment";
  }
  if (key === "paid") {
    return "Paid";
  }
  if (key === "authorized") {
    return "Authorized";
  }
  if (key === "refund_pending") {
    return "Refund in progress";
  }
  if (key === "refunded") {
    return "Refunded";
  }
  if (key === "failed") {
    return "Failed";
  }
  return formatStatus(key);
}

function formatPaymentMethod(method) {
  const key = normalizePaymentMethod(method);
  if (key === "upi") {
    return "UPI";
  }
  if (key === "cod") {
    return "Cash on Delivery";
  }
  if (key === "netbanking") {
    return "Netbanking";
  }
  if (key === "n/a" || !key) {
    return "N/A";
  }
  return formatStatus(key);
}

function money(value) {
  return inrFormatter.format(Number(value || 0));
}

function ensureOrderToastStack() {
  let stack = document.getElementById("ordersToastStack");
  if (stack) {
    return stack;
  }
  stack = document.createElement("div");
  stack.id = "ordersToastStack";
  stack.className = "orders-toast-stack";
  stack.setAttribute("aria-live", "polite");
  stack.setAttribute("aria-atomic", "false");
  document.body.appendChild(stack);
  return stack;
}

function showOrderToast({ title = "", message = "", tone = "info", timeoutMs = 4200 } = {}) {
  const stack = ensureOrderToastStack();
  const safeTone = ["success", "error", "warning", "info"].includes(String(tone || "").trim().toLowerCase())
    ? String(tone).trim().toLowerCase()
    : "info";
  const toast = document.createElement("article");
  toast.className = `orders-toast ${safeTone}`;

  const heading = document.createElement("strong");
  heading.className = "orders-toast-title";
  heading.textContent = String(title || "").trim() || "Update";
  toast.appendChild(heading);

  if (String(message || "").trim()) {
    const body = document.createElement("p");
    body.className = "orders-toast-message";
    body.textContent = String(message || "").trim();
    toast.appendChild(body);
  }

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "orders-toast-close";
  closeBtn.setAttribute("aria-label", "Dismiss notification");
  closeBtn.textContent = "Close";
  closeBtn.addEventListener("click", () => {
    toast.remove();
  });
  toast.appendChild(closeBtn);

  stack.appendChild(toast);

  const timerId = ++orderToastTimeoutCounter;
  window.setTimeout(() => {
    if (timerId <= orderToastTimeoutCounter && toast.isConnected) {
      toast.remove();
    }
  }, Math.max(1800, Number(timeoutMs) || 4200));
}

function buildCancelOutcomeText(payload = {}) {
  const details = [];
  const paymentStatusLabel = formatPaymentStatus(payload && payload.paymentStatus ? payload.paymentStatus : "");
  if (paymentStatusLabel && paymentStatusLabel !== "Unknown") {
    details.push(`Payment status: ${paymentStatusLabel}`);
  }

  const paymentUpdate = payload && payload.paymentUpdate && typeof payload.paymentUpdate === "object"
    ? payload.paymentUpdate
    : null;

  if (paymentUpdate && paymentUpdate.refunded === true) {
    const refundedValue = Number(
      paymentUpdate && paymentUpdate.payment && paymentUpdate.payment.amountRefunded !== undefined
        ? paymentUpdate.payment.amountRefunded
        : (paymentUpdate && paymentUpdate.amountRefunded !== undefined ? paymentUpdate.amountRefunded : 0)
    );
    if (Number.isFinite(refundedValue) && refundedValue > 0) {
      details.push(`Refund processed: ${money(refundedValue)}`);
    } else {
      details.push("Refund processed successfully.");
    }
  } else if (paymentUpdate && paymentUpdate.message) {
    details.push(String(paymentUpdate.message).trim());
  }

  if (payload && payload.notification && payload.notification.failed) {
    details.push("Order cancelled, but update notification could not be sent.");
  } else if (payload && payload.notification && payload.notification.delivered) {
    details.push("Cancellation update sent to your notifications.");
  }

  return details.join(" ");
}

function buildAfterSalesOutcomeText(result = {}) {
  const details = [];
  const caseItem = result && result.caseItem && typeof result.caseItem === "object" ? result.caseItem : null;
  if (caseItem) {
    const typeLabel = String(caseItem.typeLabel || formatStatus(caseItem.type || "request")).trim();
    const statusLabel = String(caseItem.statusLabel || formatStatus(caseItem.status || "requested")).trim();
    details.push(`${typeLabel} request status: ${statusLabel}`);
    const refundAmount = Number(caseItem.refundAmount || 0);
    if (Number.isFinite(refundAmount) && refundAmount > 0) {
      details.push(`Requested amount: ${money(refundAmount)}`);
    }
  }
  return details.join(" ");
}

function statusLine(status) {
  if (status === "delivered") {
    return "Delivered";
  }
  if (status === "shipped") {
    return "On the way";
  }
  if (status === "processing") {
    return "Preparing for dispatch";
  }
  return "Order cancelled";
}

function normalizePaymentMethod(value) {
  return String(value || "").trim().toLowerCase();
}

function isOnlinePaymentMethod(value) {
  const method = normalizePaymentMethod(value);
  return method === "upi" || method === "card" || method === "netbanking";
}

function isOrderResumeEligible(order) {
  if (!order) {
    return false;
  }
  const paymentStatus = String(order.paymentStatus || "").trim().toLowerCase();
  const orderStatus = String(order.status || "").trim().toLowerCase();
  return isOnlinePaymentMethod(order.paymentMethod)
    && (paymentStatus === "pending" || paymentStatus === "requires_confirmation")
    && orderStatus !== "cancelled"
    && orderStatus !== "delivered";
}

function isOrderCancelEligible(order) {
  if (!order) {
    return false;
  }
  const orderStatus = String(order.status || "").trim().toLowerCase();
  return orderStatus !== "cancelled" && orderStatus !== "delivered";
}

async function postAuthed(path, body, token) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body || {})
    });
  } catch (error) {
    throw new Error("Unable to connect to the payment service.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const nextError = new Error(data.message || "Request failed.");
    nextError.status = response.status;
    nextError.payload = data;
    throw nextError;
  }
  return data;
}

function loadRazorpayCheckoutScript() {
  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }
  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      if (window.Razorpay) {
        resolve(window.Razorpay);
      } else {
        reject(new Error("Razorpay Checkout SDK loaded without exposing Razorpay."));
      }
    };
    script.onerror = () => reject(new Error("Unable to load Razorpay Checkout SDK."));
    document.head.appendChild(script);
  }).finally(() => {
    razorpayScriptPromise = null;
  });

  return razorpayScriptPromise;
}

function normalizeRazorpayFailurePayload(payload = {}) {
  const source = payload && typeof payload === "object" ? payload : {};
  const error = source.error && typeof source.error === "object" ? source.error : source;
  const metadata = error && typeof error.metadata === "object" ? error.metadata : {};
  return {
    provider: "razorpay",
    status: "failed",
    error: {
      code: String(error.code || "").trim(),
      description: String(error.description || error.reason || "Payment failed at Razorpay.").trim(),
      reason: String(error.reason || "").trim(),
      source: String(error.source || "").trim(),
      step: String(error.step || "").trim(),
      metadata: {
        payment_id: String(metadata.payment_id || source.razorpay_payment_id || "").trim(),
        order_id: String(metadata.order_id || source.razorpay_order_id || "").trim()
      }
    }
  };
}

async function openRazorpayCheckout(payment) {
  const Razorpay = await loadRazorpayCheckoutScript();
  const checkout = payment && payment.checkout && typeof payment.checkout === "object" ? payment.checkout : null;
  if (!checkout || !checkout.orderId || !checkout.key) {
    throw new Error("Razorpay checkout details are missing from the payment intent.");
  }

  return new Promise((resolve, reject) => {
    const instance = new Razorpay({
      key: checkout.key,
      amount: checkout.amount,
      currency: checkout.currency,
      name: checkout.name,
      description: checkout.description,
      order_id: checkout.orderId,
      callback_url: checkout.callbackUrl,
      prefill: checkout.prefill || {},
      notes: checkout.notes || {},
      theme: checkout.theme || {},
      modal: {
        ondismiss: () => resolve({ dismissed: true })
      },
      handler: (response) => resolve({
        success: true,
        response: {
          provider: "razorpay",
          ...response
        }
      })
    });

    instance.on("payment.failed", (response) => {
      resolve({
        failed: true,
        response: normalizeRazorpayFailurePayload(response)
      });
    });

    try {
      instance.open();
    } catch (error) {
      reject(error);
    }
  });
}

function setResumePaymentButtonState(orderId, pending, label = "Resume Payment") {
  const button = Array.from(ordersGrid.querySelectorAll(".resume-payment-btn"))
    .find((item) => String(item.getAttribute("data-id") || "").trim() === String(orderId || "").trim());
  if (!button) {
    return;
  }
  button.disabled = pending;
  button.textContent = pending ? "Opening payment..." : label;
}

function setCancelOrderButtonState(orderId, pending, label = "Cancel Order") {
  const button = Array.from(ordersGrid.querySelectorAll(".cancel-order-btn"))
    .find((item) => String(item.getAttribute("data-id") || "").trim() === String(orderId || "").trim());
  if (!button) {
    return;
  }
  button.disabled = pending;
  button.textContent = pending ? "Cancelling..." : label;
}

async function cancelOrder(orderId) {
  const session = getSessionOrRedirect();
  if (!session) {
    return;
  }
  const order = orders.find((item) => item.id === orderId);
  if (!isOrderCancelEligible(order)) {
    showOrderToast({
      title: "Cancellation blocked",
      message: "This order can no longer be cancelled.",
      tone: "warning"
    });
    await fetchOrders();
    return;
  }
  if (!window.confirm("Cancel this order now? If payment is captured, refund will be processed automatically.")) {
    return;
  }

  setCancelOrderButtonState(orderId, true);

  try {
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({
          reason: "customer-cancel-action"
        })
      });
    } catch (error) {
      throw new Error("Unable to connect to the order service.");
    }

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.message || "Unable to cancel order.");
    }

    await fetchOrders();
    showOrderToast({
      title: "Order cancelled",
      message: buildCancelOutcomeText(payload) || String(payload.message || "Cancellation completed successfully."),
      tone: "success"
    });
  } catch (error) {
    showOrderToast({
      title: "Cancellation failed",
      message: error.message || "Unable to cancel order.",
      tone: "error"
    });
    await fetchOrders();
  } finally {
    setCancelOrderButtonState(orderId, false);
  }
}

async function resumePendingPayment(orderId) {
  const session = getSessionOrRedirect();
  if (!session) {
    return;
  }

  const order = orders.find((item) => item.id === orderId);
  if (!isOrderResumeEligible(order)) {
    showOrderToast({
      title: "Resume unavailable",
      message: "This order is no longer eligible for payment resume.",
      tone: "warning"
    });
    await fetchOrders();
    return;
  }

  setResumePaymentButtonState(orderId, true);

  try {
    const payment = await postAuthed("/payments/intent", {
      orderId: order.id,
      method: order.paymentMethod
    }, session.token);

    if (String(payment.checkoutProvider || "").trim().toLowerCase() !== "razorpay") {
      throw new Error("Resume payment is available only when Razorpay checkout is enabled on this store.");
    }

    const checkoutResult = await openRazorpayCheckout(payment);
    if (checkoutResult.dismissed) {
      showOrderToast({
        title: "Payment window closed",
        message: "You can resume the same order again from this page.",
        tone: "info"
      });
      return;
    }

    if (checkoutResult.failed) {
      try {
        await postAuthed(`/payments/${encodeURIComponent(String(payment.id || "").trim())}/confirm`, {
          details: checkoutResult.response
        }, session.token);
      } catch (error) {
        await fetchOrders();
        showOrderToast({
          title: "Payment failed",
          message: error.message || "Payment failed. Please try again.",
          tone: "error"
        });
        return;
      }
      await fetchOrders();
      showOrderToast({
        title: "Payment failed",
        message: "You can retry the order from this page.",
        tone: "warning"
      });
      return;
    }

    await postAuthed(`/payments/${encodeURIComponent(String(payment.id || "").trim())}/confirm`, {
      details: checkoutResult.response
    }, session.token);
    await fetchOrders();
    showOrderToast({
      title: "Payment successful",
      message: "Payment captured. Redirecting to order confirmation...",
      tone: "success",
      timeoutMs: 2200
    });
    window.setTimeout(() => {
      window.location.href = `thank-you.html?orderId=${encodeURIComponent(order.id)}`;
    }, 700);
  } catch (error) {
    showOrderToast({
      title: "Resume payment failed",
      message: error.message || "Unable to resume payment for this order.",
      tone: "error"
    });
    await fetchOrders();
  } finally {
    setResumePaymentButtonState(orderId, false);
  }
}

async function submitAfterSalesRequest(orderId, form) {
  const session = getSessionOrRedirect();
  if (!session) {
    return;
  }
  const order = orders.find((item) => item.id === orderId);
  if (!order) {
    showOrderToast({
      title: "Request failed",
      message: "Order not found. Refresh the page and try again.",
      tone: "error"
    });
    return;
  }
  if (!order.canRequestAfterSales) {
    showOrderToast({
      title: "Request not allowed",
      message: "This order is not eligible for a new request right now.",
      tone: "warning"
    });
    await fetchOrders();
    return;
  }

  const formData = new FormData(form);
  const submitButton = form.querySelector("button[type='submit']");
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";
  }

  try {
    const payload = {
      type: String(formData.get("type") || "return").trim().toLowerCase(),
      reason: String(formData.get("reason") || "other").trim().toLowerCase(),
      note: String(formData.get("note") || "").trim(),
      refundAmount: Number(formData.get("refundAmount") || order.total || 0)
    };
    const result = await postAuthed(`/orders/${encodeURIComponent(orderId)}/after-sales`, payload, session.token);
    await fetchOrders();
    showOrderToast({
      title: "Request submitted",
      message: `${String(result.message || "Your request has been submitted.").trim()} ${buildAfterSalesOutcomeText(result)}`.trim(),
      tone: "success"
    });
  } catch (error) {
    showOrderToast({
      title: "Request failed",
      message: error.message || "Unable to submit your request.",
      tone: "error"
    });
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Submit Request";
    }
  }
}

function getDeliveryLine(order) {
  const deliveredEvent = getStatusEvent(order, "delivered");
  const cancelledEvent = getStatusEvent(order, "cancelled");
  if (order.deliverySlot?.label) {
    return `${order.deliverySlot.label}${order.deliverySlot.eta ? ` | ${order.deliverySlot.eta}` : ""}`;
  }
  if (deliveredEvent) {
    return `Delivered on ${formatDate(deliveredEvent.createdAt)}`;
  }
  if (cancelledEvent || order.status === "cancelled") {
    return "Cancelled";
  }
  if (order.status === "shipped") {
    return "Expected in 1-2 days";
  }
  return "Expected in 2-4 days";
}

function getLatestAfterSalesCase(order) {
  const list = Array.isArray(order && order.afterSalesCases) ? order.afterSalesCases : [];
  if (!list.length) {
    return null;
  }
  return [...list].sort((left, right) => new Date(right.updatedAt || right.createdAt || 0).getTime() - new Date(left.updatedAt || left.createdAt || 0).getTime())[0] || null;
}

function getOpenAfterSalesCase(order) {
  const list = Array.isArray(order && order.afterSalesCases) ? order.afterSalesCases : [];
  return list.find((item) => item && item.final !== true) || null;
}

function canShowAfterSalesPanel(order) {
  return Boolean(order && (order.canRequestAfterSales || (Array.isArray(order.afterSalesCases) && order.afterSalesCases.length)));
}

function getAfterSalesProgressFlow(caseItem) {
  const status = String(caseItem && caseItem.status ? caseItem.status : "requested").trim().toLowerCase();
  const type = String(caseItem && caseItem.type ? caseItem.type : "return").trim().toLowerCase();
  if (status === "rejected") {
    return ["requested", "rejected"];
  }
  const base = AFTER_SALES_PROGRESS_FLOW[type] || AFTER_SALES_PROGRESS_FLOW.return;
  if (base.includes(status)) {
    return [...base];
  }
  return [...base, status];
}

function getSortedAfterSalesTimeline(caseItem) {
  const timeline = Array.isArray(caseItem && caseItem.timeline) ? caseItem.timeline : [];
  return [...timeline].sort((left, right) => new Date(left.createdAt || 0).getTime() - new Date(right.createdAt || 0).getTime());
}

function buildAfterSalesProgressSteps(caseItem) {
  const flow = getAfterSalesProgressFlow(caseItem);
  const status = String(caseItem && caseItem.status ? caseItem.status : "requested").trim().toLowerCase();
  const activeIndex = Math.max(0, flow.indexOf(status));
  const timeline = getSortedAfterSalesTimeline(caseItem);
  return flow.map((key, index) => {
    const state = index < activeIndex ? "done" : index === activeIndex ? "current" : "pending";
    const matchedUpdate = [...timeline].reverse().find((entry) => String(entry && entry.status ? entry.status : "").trim().toLowerCase() === key);
    const meta = matchedUpdate && matchedUpdate.createdAt
      ? formatDateTime(matchedUpdate.createdAt)
      : state === "pending" ? "Pending" : "Completed";
    return {
      key,
      label: AFTER_SALES_STATUS_LABELS[key] || formatStatus(key),
      state,
      meta
    };
  });
}

function afterSalesNextStepCopy(caseItem) {
  const status = String(caseItem && caseItem.status ? caseItem.status : "requested").trim().toLowerCase();
  const type = String(caseItem && caseItem.type ? caseItem.type : "return").trim().toLowerCase();
  if (status === "requested") {
    return "Support review is in progress. Expect an update within 24 hours.";
  }
  if (status === "approved") {
    return type === "exchange"
      ? "Pickup scheduling is next. Keep the product and accessories ready."
      : "Pickup scheduling is next. Keep the product in return-ready condition.";
  }
  if (status === "pickup_scheduled") {
    return "Pickup partner will contact you shortly for handover.";
  }
  if (status === "in_transit") {
    return "Returned item is in transit to our warehouse.";
  }
  if (status === "received") {
    return type === "exchange"
      ? "Quality check is underway, then replacement dispatch starts."
      : "Warehouse received the item. Refund initiation is next.";
  }
  if (status === "refund_pending") {
    return "Refund is initiated and should reflect in 2-5 business days.";
  }
  if (status === "refunded") {
    return "Refund completed to your original payment method.";
  }
  if (status === "exchange_processing") {
    return "Replacement unit is being prepared for dispatch.";
  }
  if (status === "exchange_shipped") {
    return "Replacement is shipped and delivery updates will appear shortly.";
  }
  if (status === "exchange_completed") {
    return "Exchange completed successfully.";
  }
  if (status === "rejected") {
    return "Request was rejected. Check support note or resolution details below.";
  }
  if (status === "closed") {
    return "Case is closed. Contact support if any follow-up is still needed.";
  }
  return "Support team is processing your request.";
}

function buildAfterSalesRecentTimeline(caseItem) {
  const timeline = getSortedAfterSalesTimeline(caseItem);
  return timeline
    .slice(-4)
    .reverse()
    .map((entry) => {
      const status = String(entry && entry.status ? entry.status : "").trim().toLowerCase();
      return {
        label: String(entry && entry.label ? entry.label : AFTER_SALES_STATUS_LABELS[status] || formatStatus(status || "update")).trim(),
        note: String(entry && entry.note ? entry.note : "").trim(),
        createdAt: String(entry && entry.createdAt ? entry.createdAt : "").trim()
      };
    });
}

function latestAfterSalesCopy(caseItem) {
  if (!caseItem) {
    return "";
  }
  const latestUpdate = caseItem.latestUpdate && caseItem.latestUpdate.createdAt
    ? `${caseItem.latestUpdate.label || caseItem.statusLabel} on ${formatDateTime(caseItem.latestUpdate.createdAt)}`
    : `${caseItem.statusLabel} on ${formatDateTime(caseItem.updatedAt || caseItem.createdAt)}`;
  return latestUpdate;
}

function buildOrderView(order) {
  const firstItem = Array.isArray(order.items) && order.items.length ? order.items[0] : null;
  return {
    id: order.id,
    idLabel: `EM-${String(order.id).slice(0, 8).toUpperCase()}`,
    product: firstItem ? firstItem.name : "Order item",
    date: formatDate(order.createdAt),
    total: Number(order.total || 0),
    discount: Number(order.discount || 0),
    couponCode: String(order.couponCode || "").trim(),
    status: order.status || "processing",
    returnInitiated: Boolean(order.returnInitiated || String(order.status || "").toLowerCase() === "return_initiated" || String(order.status || "").toLowerCase() === "pickup_scheduled"),
    returnId: order.returnId || null,
    paymentStatus: order.paymentStatus || "pending",
    deliverySlot: order.deliverySlot && typeof order.deliverySlot === "object"
      ? {
        id: String(order.deliverySlot.id || "").trim(),
        label: String(order.deliverySlot.label || "").trim(),
        eta: String(order.deliverySlot.eta || "").trim()
      }
      : null,
    reservationUntil: String(order.reservationUntil || "").trim(),
    statusHistory: normalizeStatusHistory(order.statusHistory, order.createdAt, order.status),
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80",
    items: Array.isArray(order.items) ? order.items : [],
    createdAt: order.createdAt,
    paymentMethod: order.paymentMethod || "N/A",
    afterSalesCases: Array.isArray(order.afterSalesCases) ? order.afterSalesCases.map(normalizeAfterSalesCaseView) : [],
    canRequestAfterSales: order.canRequestAfterSales === true,
    tracking: {
      carrier: "ElectroMart Logistics",
      trackingId: `TRK-${String(order.id).slice(0, 8).toUpperCase()}`,
      eta: getDeliveryLine(order)
    }
  };
}

function getTrackingSteps(order) {
  const orderedEvent = getStatusEvent(order, "ordered");
  const processingEvent = getStatusEvent(order, "processing");
  const shippedEvent = getStatusEvent(order, "shipped");
  const deliveredEvent = getStatusEvent(order, "delivered");
  const cancelledEvent = getStatusEvent(order, "cancelled");
  const steps = [
    { key: "ordered", label: "Order placed", date: orderedEvent ? formatDateTime(orderedEvent.createdAt) : "Pending", completed: Boolean(orderedEvent) },
    { key: "packed", label: "Packed", date: processingEvent ? formatDateTime(processingEvent.createdAt) : cancelledEvent ? "Not completed" : "Pending", completed: Boolean(processingEvent) },
    { key: "shipped", label: "Shipped", date: shippedEvent ? formatDateTime(shippedEvent.createdAt) : cancelledEvent ? "Not completed" : "Pending", completed: Boolean(shippedEvent) },
    { key: "delivered", label: "Delivered", date: deliveredEvent ? formatDateTime(deliveredEvent.createdAt) : cancelledEvent ? "Cancelled" : "Pending", completed: Boolean(deliveredEvent) }
  ];

  if (cancelledEvent || order.status === "cancelled") {
    return {
      steps,
      cancelled: true
    };
  }

  return {
    steps,
    cancelled: false
  };
}

function buildDeliveryTimeline(order) {
  const reservationDate = order.reservationUntil ? new Date(order.reservationUntil) : null;
  const hasReservation = reservationDate && !Number.isNaN(reservationDate.getTime());
  const processingEvent = getStatusEvent(order, "processing");
  const shippedEvent = getStatusEvent(order, "shipped");
  const deliveredEvent = getStatusEvent(order, "delivered");
  const cancelledEvent = getStatusEvent(order, "cancelled");
  const orderedEvent = getStatusEvent(order, "ordered");
  const isDelivered = Boolean(deliveredEvent);
  const isShipped = Boolean(shippedEvent) || isDelivered;
  const isCancelled = Boolean(cancelledEvent) || order.status === "cancelled";
  const slotLabel = order.deliverySlot?.label || "Standard delivery";
  const etaLabel = order.deliverySlot?.eta || getDeliveryLine(order);
  const milestones = [
    {
      title: "Slot confirmed",
      detail: slotLabel,
      meta: orderedEvent ? formatDateTime(orderedEvent.createdAt) : formatDateTime(order.createdAt),
      state: "done"
    }
  ];

  if (hasReservation) {
    milestones.push({
      title: "Stock reserved",
      detail: `Reserved until ${formatDateTime(reservationDate)}`,
      meta: isCancelled ? "Reservation released" : "Held for checkout",
      state: isCancelled ? "upcoming" : "done"
    });
  }

  milestones.push({
    title: "Courier handoff",
    detail: isShipped ? "Package left the warehouse" : "Dispatch queue in progress",
    meta: isCancelled
      ? `Cancelled ${formatDateTime(cancelledEvent ? cancelledEvent.createdAt : order.createdAt)}`
      : isShipped
        ? formatDateTime(shippedEvent ? shippedEvent.createdAt : order.createdAt)
        : processingEvent
          ? formatDateTime(processingEvent.createdAt)
          : "Preparing for dispatch",
    state: isCancelled ? "upcoming" : isShipped ? "done" : "current"
  });

  milestones.push({
    title: "Delivery window",
    detail: `${slotLabel}${order.deliverySlot?.eta ? ` | ${order.deliverySlot.eta}` : ""}`,
    meta: isDelivered
      ? formatDateTime(deliveredEvent.createdAt)
      : isCancelled
        ? `Cancelled ${formatDateTime(cancelledEvent ? cancelledEvent.createdAt : order.createdAt)}`
        : etaLabel,
    state: isDelivered ? "done" : "upcoming"
  });

  return milestones;
}

function trackingPanel(order) {
  const tracking = getTrackingSteps(order);
  const status = String(order.status || "").toLowerCase();

  const milestones = [
    { key: "ordered", label: "Ordered", i18nKey: "track_milestone_ordered" },
    { key: "shipped", label: "Shipped", i18nKey: "track_milestone_shipped" },
    { key: "out_for_delivery", label: "Out for delivery", i18nKey: "track_milestone_out_for_delivery" },
    { key: "delivered", label: "Delivered", i18nKey: "track_milestone_delivered" }
  ];

  let currentStageIndex = 0;
  if (status === "delivered") currentStageIndex = 3;
  else if (status === "shipped") currentStageIndex = 2;
  else if (status === "processing") currentStageIndex = 1;
  else currentStageIndex = 0;

  const stepperProgressPercent = status === "delivered" ? 100 : (currentStageIndex === 2 ? 66 : (currentStageIndex === 1 ? 33 : 8));

  const stepperHtml = `
    <div class="amz-tracking-stepper-wrap">
      <div class="amz-tracking-stepper">
        <div class="amz-tracking-stepper-progress" style="width: ${stepperProgressPercent}%;"></div>
        ${milestones.map((m, idx) => {
          const isCompleted = idx <= currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          const cls = isCompleted ? (isCurrent ? "current completed" : "completed") : "";
          return `
            <div class="amz-tracking-node ${cls}">
              <div class="amz-tracking-dot">${isCompleted ? "✓" : ""}</div>
              <span class="amz-tracking-label" data-i18n="${m.i18nKey}">${m.label}</span>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;

  const completedCount = tracking.steps.filter((step) => step.completed).length;
  const progressPercent = Math.max(8, Math.round((completedCount / tracking.steps.length) * 100));

  const rows = tracking.steps.map((step) => `
    <li class="${step.completed ? "done" : ""}">
      <span class="dot"></span>
      <span class="step-copy">
        <strong>${step.label}</strong>
        <small>${step.date}</small>
      </span>
    </li>
  `).join("");

  const note = tracking.cancelled
    ? `<p class='tracking-note cancelled'>This order was cancelled${getStatusEvent(order, "cancelled") ? ` on ${formatDateTime(getStatusEvent(order, "cancelled").createdAt)}` : ""} and will not ship.</p>`
    : `<p class='tracking-note'>Latest update: ${(() => {
      const latestEvent = getLatestStatusEvent(order);
      return latestEvent ? `${latestEvent.label} on ${formatDateTime(latestEvent.createdAt)}` : statusLine(order.status);
    })()} | Payment: ${formatPaymentStatus(order.paymentStatus)}</p>`;
  const timeline = buildDeliveryTimeline(order).map((item) => `
    <li class="${item.state}">
      <span class="slot-dot"></span>
      <span class="slot-copy">
        <strong>${item.title}</strong>
        <small>${item.detail}</small>
        <small>${item.meta}</small>
      </span>
    </li>
  `).join("");

  return `
    <div class="tracking-panel order-tracking-panel" id="tracking-${order.id}" hidden>
      ${stepperHtml}
      <div class="tracking-meta">
        <p><span>Carrier:</span> <strong>${order.tracking.carrier}</strong></p>
        <p><span>Tracking ID:</span> <strong>${order.tracking.trackingId}</strong></p>
        <p><span>Delivery:</span> <strong>${order.tracking.eta}</strong></p>
      </div>
      ${note}
      <section class="slot-timeline">
        <p class="slot-timeline-title">Delivery slot timeline</p>
        <ol class="slot-timeline-list">${timeline}</ol>
      </section>
      <div class="tracking-bar">
        <span style="width:${progressPercent}%"></span>
      </div>
      <ol class="tracking-steps">${rows}</ol>
    </div>
  `;
}

function afterSalesPanel(order) {
  const cases = Array.isArray(order.afterSalesCases) ? order.afterSalesCases : [];
  const openCase = getOpenAfterSalesCase(order);
  const requestBlockedMessage = openCase
    ? "An open request already exists for this order. Track updates below."
    : "This order is not currently eligible for a new return, refund, or exchange request.";
  const caseMarkup = cases.length
    ? cases.map((caseItem) => {
      const progressSteps = buildAfterSalesProgressSteps(caseItem);
      const progressMarkup = progressSteps.map((step) => `
        <li class="${step.state}">
          <span class="after-sales-progress-dot"></span>
          <span class="after-sales-progress-copy">
            <strong>${escapeHtml(step.label)}</strong>
            <small>${escapeHtml(step.meta)}</small>
          </span>
        </li>
      `).join("");
      const recentUpdates = buildAfterSalesRecentTimeline(caseItem);
      const recentUpdateMarkup = recentUpdates.length
        ? `
          <div class="after-sales-events">
            <p class="after-sales-events-title">Recent updates</p>
            <ol class="after-sales-events-list">
              ${recentUpdates.map((entry) => `
                <li>
                  <strong>${escapeHtml(entry.label)}</strong>
                  <small>${escapeHtml(formatDateTime(entry.createdAt))}</small>
                  ${entry.note ? `<small>${escapeHtml(entry.note)}</small>` : ""}
                </li>
              `).join("")}
            </ol>
          </div>
        `
        : "";

      return `
        <article class="after-sales-case-card ${caseItem.final ? "final" : "active"}">
          <div class="after-sales-case-head">
            <div>
              <strong>${escapeHtml(caseItem.typeLabel)}</strong>
              <p>${escapeHtml(caseItem.reasonLabel)}</p>
            </div>
            <span class="badge ${escapeHtml(caseItem.status)}">${escapeHtml(caseItem.statusLabel)}</span>
          </div>
          <div class="after-sales-case-meta">
            <span>Case ID: <strong>${escapeHtml(String(caseItem.id || "").slice(0, 8).toUpperCase())}</strong></span>
            <span>Requested: <strong>${escapeHtml(formatDateTime(caseItem.createdAt))}</strong></span>
            <span>Refund amount: <strong>${escapeHtml(money(caseItem.refundAmount || order.total))}</strong></span>
          </div>
          <p class="after-sales-case-update">Latest update: ${escapeHtml(latestAfterSalesCopy(caseItem))}</p>
          <p class="after-sales-next-step"><strong>Next step:</strong> ${escapeHtml(afterSalesNextStepCopy(caseItem))}</p>
          <ol class="after-sales-progress-list">${progressMarkup}</ol>
          ${recentUpdateMarkup}
          ${caseItem.note ? `<p class="after-sales-note"><strong>Your note:</strong> ${escapeHtml(caseItem.note)}</p>` : ""}
          ${caseItem.adminNote ? `<p class="after-sales-note"><strong>Support note:</strong> ${escapeHtml(caseItem.adminNote)}</p>` : ""}
          ${caseItem.resolutionNote ? `<p class="after-sales-note"><strong>Resolution:</strong> ${escapeHtml(caseItem.resolutionNote)}</p>` : ""}
        </article>
      `;
    }).join("")
    : "<div class='empty-message compact'>No return, refund, or exchange request has been created for this order yet.</div>";
  const formMarkup = order.canRequestAfterSales
    ? `
      <form class="after-sales-form" data-order-id="${order.id}">
        <div class="after-sales-form-grid">
          <label>
            <span>Request type</span>
            <select name="type">
              <option value="return">Return</option>
              <option value="refund">Refund</option>
              <option value="exchange">Exchange</option>
            </select>
          </label>
          <label>
            <span>Reason</span>
            <select name="reason">
              <option value="damaged">Damaged item</option>
              <option value="defective">Defective item</option>
              <option value="wrong_item">Wrong item received</option>
              <option value="missing_parts">Missing parts or accessories</option>
              <option value="not_as_described">Not as described</option>
              <option value="no_longer_needed">No longer needed</option>
              <option value="size_issue">Size or fit issue</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            <span>Requested refund</span>
            <input name="refundAmount" type="number" min="0" step="0.01" max="${escapeHtml(String(Number(order.total || 0).toFixed(2)))}" value="${escapeHtml(String(Number(order.total || 0).toFixed(2)))}" />
          </label>
        </div>
        <label class="after-sales-textarea">
          <span>Tell us what happened</span>
          <textarea name="note" rows="3" placeholder="Describe the issue, missing item, or exchange preference."></textarea>
        </label>
        <p class="after-sales-help">Your request will appear in the admin panel immediately, and status updates will show here on the order page.</p>
        <button type="submit" class="primary">Submit Request</button>
      </form>
    `
    : `<p class="after-sales-help">${escapeHtml(requestBlockedMessage)}</p>`;

  return `
    <section class="after-sales-panel" id="after-sales-${order.id}" hidden>
      <div class="after-sales-panel-head">
        <div>
          <h3>Returns / Refunds / Exchanges</h3>
          <p>${cases.length ? `${cases.length} request${cases.length > 1 ? "s" : ""} on record` : "Start a new request or review earlier updates."}</p>
        </div>
      </div>
      <div class="after-sales-case-list">${caseMarkup}</div>
      ${formMarkup}
    </section>
  `;
}

function formatShippingAddressLines(addr) {
  if (!addr) return "Flat 402, Royal Palms, Connaught Place, New Delhi, Delhi 110001";
  if (typeof addr === "string") return addr;
  const parts = [
    addr.addressLine || addr.address || "",
    addr.city || "",
    addr.state || "",
    addr.pincode || addr.pinCode || ""
  ].filter(Boolean);
  return parts.join(", ") || "Connaught Place, New Delhi 110001";
}

function getShippingPhone(order) {
  if (order.shippingAddress && typeof order.shippingAddress === "object" && order.shippingAddress.phone) {
    return order.shippingAddress.phone;
  }
  if (order.phone) return order.phone;
  const session = readSession();
  return session?.user?.phone || session?.phone || "+91 98765 43210";
}

function openOrderDetailsModal(orderId) {
  const modal = document.getElementById("orderDetailsModal");
  const content = document.getElementById("orderDetailsModalContent");
  const invoiceLink = document.getElementById("modalDownloadInvoiceLink");
  if (!modal || !content) return;

  const order = orders.find((o) => String(o.id) === String(orderId));
  if (!order) return;

  if (invoiceLink) {
    invoiceLink.href = `invoice.html?orderId=${encodeURIComponent(order.id)}`;
  }

  const recipientName = order.shippingAddress?.fullName || (typeof order.shippingAddress === "string" ? order.shippingAddress : (readSession()?.user?.name || "Customer"));
  const fullAddress = formatShippingAddressLines(order.shippingAddress);
  const phone = getShippingPhone(order);

  const orderItems = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : [{
        productId: order.productId || "",
        title: order.product || "Product",
        image: order.image || "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80",
        price: order.total || 0,
        qty: 1
      }];

  const itemsHtml = orderItems.map((item) => {
    const pId = item.productId || order.productId || "";
    const pTitle = item.title || order.product || "ElectroMart Item";
    const pImg = item.image || order.image || "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80";
    const pPrice = Number(item.price || order.total || 0);
    const pQty = Number(item.qty || item.quantity || 1);

    return `
      <div class="amz-modal-item-row">
        <img src="${escapeHtml(pImg)}" alt="${escapeHtml(pTitle)}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80';" />
        <div class="amz-modal-item-info">
          <h5><a href="product-detail.html?id=${encodeURIComponent(pId)}">${escapeHtml(pTitle)}</a></h5>
          <p>Quantity: ${pQty} | Price: ${money(pPrice)}</p>
          <p class="seller-line">Sold by: <strong>ElectroMart Retail Pvt Ltd</strong></p>
        </div>
        <div>
          <button type="button" class="amz-buy-again-inline-btn" data-product-id="${escapeHtml(pId)}" data-product-title="${escapeHtml(pTitle)}">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            <span data-i18n="buy_it_again">Buy it again</span>
          </button>
        </div>
      </div>
    `;
  }).join("");

  const total = Number(order.total || 0);
  const baseSubtotal = total / 1.18;
  const totalGst = total - baseSubtotal;
  const isDelhi = String(order.shippingAddress?.state || "Delhi").toLowerCase().includes("delhi");

  content.innerHTML = `
    <div class="amz-modal-order-summary-bar">
      <div>
        <p data-i18n="order_num_label">ORDER #</p>
        <strong>${escapeHtml(order.idLabel || order.id)}</strong>
      </div>
      <div>
        <p data-i18n="order_placed_label">ORDER PLACED</p>
        <strong>${escapeHtml(order.date)}</strong>
      </div>
      <div>
        <p data-i18n="total_label">TOTAL</p>
        <strong>${money(total)}</strong>
      </div>
      <div>
        <p>STATUS</p>
        <span class="badge ${escapeHtml(order.status)}">${formatStatus(order.status)}</span>
      </div>
    </div>

    <div class="amz-modal-grid">
      <div class="amz-modal-section">
        <h4 data-i18n="order_items_label">Items in this order</h4>
        <div class="amz-modal-items-list">${itemsHtml}</div>
      </div>

      <div class="amz-modal-section">
        <div class="amz-modal-side-card">
          <h4 data-i18n="shipping_address_label">Shipping Address</h4>
          <p><strong>${escapeHtml(recipientName)}</strong></p>
          <p>${escapeHtml(fullAddress)}</p>
          <p><span data-i18n="phone_label">Phone:</span> ${escapeHtml(phone)}</p>
          ${order.deliverySlot?.label ? `<p style="margin-top:6px; color:#067d62;"><strong>Slot:</strong> ${escapeHtml(order.deliverySlot.label)}</p>` : ""}
        </div>

        <div class="amz-modal-side-card">
          <h4 data-i18n="payment_method_label">Payment Method</h4>
          <p>${escapeHtml(formatPaymentMethod(order.paymentMethod))}</p>
          <p>Status: <span class="badge ${escapeHtml(String(order.paymentStatus || "").toLowerCase() || "completed")}">${formatPaymentStatus(order.paymentStatus)}</span></p>
        </div>

        <div class="amz-modal-side-card">
          <h4 data-i18n="order_summary_label">Order Summary</h4>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span>Items Subtotal:</span>
            <span>${money(baseSubtotal)}</span>
          </div>
          ${isDelhi ? `
            <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:12px; color:#565959;">
              <span>CGST (9%):</span>
              <span>${money(totalGst / 2)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:12px; color:#565959;">
              <span>SGST (9%):</span>
              <span>${money(totalGst / 2)}</span>
            </div>
          ` : `
            <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:12px; color:#565959;">
              <span>IGST (18%):</span>
              <span>${money(totalGst)}</span>
            </div>
          `}
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span>Shipping:</span>
            <span>FREE</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-weight:700; font-size:14px; border-top:1px solid #d5d9d9; padding-top:6px; margin-top:4px;">
            <span data-i18n="total_label">Grand Total:</span>
            <span style="color:#b12704;">${money(total)}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.removeAttribute("hidden");
  window.EM_I18N?.updateAllTranslations?.() || window.applyTranslations?.();
}

function closeOrderDetailsModal() {
  const modal = document.getElementById("orderDetailsModal");
  if (modal) {
    modal.setAttribute("hidden", "");
  }
}

function orderCard(order) {
  const canResumePayment = isOrderResumeEligible(order);
  const latestAfterSales = getLatestAfterSalesCase(order);
  const afterSalesSummary = latestAfterSales
    ? `
      <div class="after-sales-summary">
        <span class="badge ${escapeHtml(latestAfterSales.status)}">${escapeHtml(latestAfterSales.typeLabel)}: ${escapeHtml(latestAfterSales.statusLabel)}</span>
        <span>${escapeHtml(latestAfterSales.reasonLabel)}</span>
        <span>${escapeHtml(latestAfterSalesCopy(latestAfterSales))}</span>
      </div>
    `
    : "";
  const couponMeta = order.couponCode
    ? `<p class="order-date-line">Coupon: ${order.couponCode}${order.discount > 0 ? ` | Saved ${money(order.discount)}` : ""}</p>`
    : "";
  const deliveryMeta = order.deliverySlot?.label
    ? `<p class="order-date-line">Delivery slot: ${order.deliverySlot.label}${order.deliverySlot.eta ? ` | ${order.deliverySlot.eta}` : ""}</p>`
    : "";
  const reservationDate = order.reservationUntil ? new Date(order.reservationUntil) : null;
  const reservationMeta = reservationDate && !Number.isNaN(reservationDate.getTime())
    ? `<p class="order-date-line">Reserved until: ${reservationDate.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>`
    : "";
  const paymentMeta = `<p class="payment-line">Payment: <span class="badge ${escapeHtml(String(order.paymentStatus || "").trim().toLowerCase() || "pending")}">${formatPaymentStatus(order.paymentStatus)}</span> via ${escapeHtml(formatPaymentMethod(order.paymentMethod))}</p>`;
  const paymentHint = canResumePayment
    ? `<p class="payment-hint">This order is waiting for payment capture. Resume checkout to complete it.</p>`
    : "";
  const exchangeMeta = (Array.isArray(order.exchangeDetails) && order.exchangeDetails.length > 0)
    ? `<p class="order-exchange-meta" style="background:#e7f4f5;border:1px solid #007185;padding:4px 8px;border-radius:4px;font-size:12px;color:#007185;margin:4px 0;display:inline-block;">
        🔄 <strong>Includes Device Exchange:</strong> ${order.exchangeDetails.map(ex => `${escapeHtml(ex.exchangeDeviceName || "Trade-In Device")} (-${money(ex.discountAmount)})`).join(", ")}
      </p>`
    : "";
  const canCancelOrder = isOrderCancelEligible(order);

  const isDelivered = String(order.status || "").toLowerCase() === "delivered";
  const isCancelled = String(order.status || "").toLowerCase() === "cancelled";
  const isReturnInitiated = Boolean(
    order.returnInitiated ||
    String(order.status || "").toLowerCase() === "return_initiated" ||
    String(order.status || "").toLowerCase() === "pickup_scheduled" ||
    (Array.isArray(order.afterSalesCases) && order.afterSalesCases.some(c => (c.type === "return" || c.type === "exchange") && !c.final))
  );

  const returnBadge = isReturnInitiated
    ? `<span class="badge return-initiated" style="background:#e6f4ea; color:#137333; border:1px solid #ceead6; font-weight:700; padding:2px 8px; border-radius:4px; margin-left:6px;" data-i18n="return_initiated_badge">Return Initiated</span>`
    : "";
  
  const deliveryHeadline = isReturnInitiated
    ? `<h2 class="order-delivery-headline" style="color:#067d62;">Return Initiated &bull; Pickup Scheduled</h2><p class="order-delivery-subtext">ElectroMart Logistics doorstep pickup is scheduled.</p>`
    : (isDelivered
      ? `<h2 class="order-delivery-headline delivered">Delivered ${order.tracking?.eta ? `${order.tracking.eta}` : order.date}</h2><p class="order-delivery-subtext">Package was handed directly to resident.</p>`
      : (isCancelled
        ? `<h2 class="order-delivery-headline">Order Cancelled</h2><p class="order-delivery-subtext">This order was cancelled and will not ship.</p>`
        : `<h2 class="order-delivery-headline">Expected Delivery: ${order.tracking?.eta || "Arriving soon"}</h2><p class="order-delivery-subtext">${statusLine(order.status)}</p>`));

  const recipientName = order.shippingAddress?.fullName || (typeof order.shippingAddress === "string" ? order.shippingAddress : (readSession()?.user?.name || "Customer"));
  const firstProductId = order.productId || (Array.isArray(order.items) && order.items[0]?.productId) || "";

  return `
    <article class="order-card" data-order-id="${order.id}">
      <div class="order-top">
        <div class="order-top-details">
          <div>
            <p data-i18n="order_placed_label">ORDER PLACED</p>
            <strong>${order.date}</strong>
          </div>
          <div>
            <p data-i18n="total_label">TOTAL</p>
            <strong>${money(order.total)}</strong>
          </div>
          <div>
            <p data-i18n="ship_to_label">SHIP TO</p>
            <div class="amz-ship-to-wrapper">
              <button type="button" class="amz-ship-to-trigger" aria-expanded="false" aria-haspopup="true">
                <strong title="${escapeHtml(typeof order.shippingAddress === 'string' ? order.shippingAddress : (order.shippingAddress?.addressLine || 'Address'))}">${escapeHtml(recipientName)} ▾</strong>
              </button>
              <div class="amz-ship-to-popover" role="tooltip" hidden>
                <div class="amz-ship-to-popover-content">
                  <h4 data-i18n="ship_to_address_details">Shipping Address</h4>
                  <p><strong>${escapeHtml(recipientName)}</strong></p>
                  <p>${escapeHtml(formatShippingAddressLines(order.shippingAddress))}</p>
                  <p class="popover-phone"><span data-i18n="phone_label">Phone:</span> ${escapeHtml(getShippingPhone(order))}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="order-top-right">
          <p><span data-i18n="order_num_label">ORDER #</span> ${order.idLabel}</p>
          <div class="order-top-links">
            <a href="javascript:void(0);" class="view-order-details-link" data-id="${order.id}" data-i18n="view_order_details">View order details</a>
            <span>|</span>
            <a href="invoice.html?orderId=${encodeURIComponent(order.id)}" target="_blank" rel="noopener" data-i18n="download_invoice">Invoice ▾</a>
          </div>
        </div>
      </div>
      <div class="order-body">
        <a href="product-detail.html?id=${encodeURIComponent(firstProductId)}" aria-label="${escapeHtml(order.product)}">
          <img src="${order.image}" alt="${order.product}" loading="lazy" />
        </a>
        <div class="order-product-info">
          ${deliveryHeadline}
          <h3 class="order-product">
            <a href="product-detail.html?id=${encodeURIComponent(firstProductId)}">${order.product}</a>
          </h3>
          <p class="seller-line">Sold by: <strong>ElectroMart Retail Pvt Ltd</strong> | Return eligible within 7 days</p>
          <p class="order-item-price">${money(order.total)}</p>
          ${exchangeMeta}
          <button type="button" class="amz-buy-again-inline-btn" data-product-id="${escapeHtml(firstProductId)}" data-product-title="${escapeHtml(order.product)}">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            <span data-i18n="buy_it_again">Buy it again</span>
          </button>
          ${couponMeta}
          ${deliveryMeta}
          ${reservationMeta}
          ${paymentMeta}
          ${paymentHint}
          ${afterSalesSummary}
          <p class="status-line">${statusLine(order.status)} <span class="badge ${order.status}">${formatStatus(order.status)}</span>${returnBadge}</p>
        </div>
        <div class="order-actions">
          ${canResumePayment ? `<button type="button" class="primary resume-payment-btn" data-id="${order.id}">Resume Payment</button>` : ""}
          <a href="tracking.html?orderId=${encodeURIComponent(order.id)}" class="primary track-btn" data-id="${order.id}" data-i18n="track_package">Track package</a>
          <a href="returns.html?orderId=${encodeURIComponent(order.id)}" class="after-sales-btn" data-id="${order.id}" data-i18n="return_or_replace">${isReturnInitiated ? "Return / Replacement Details" : (order.afterSalesCases && order.afterSalesCases.length ? "View Request" : "Return or replace items")}</a>
          ${canCancelOrder ? `<button type="button" class="cancel-order-btn" data-id="${order.id}" data-i18n="cancel_order">Cancel Order</button>` : ""}
          <button type="button" class="secondary-pill-btn write-review-btn" data-id="${order.id}" data-product-id="${escapeHtml(firstProductId)}" data-i18n="write_review">Write a product review</button>
          <button type="button" class="secondary-pill-btn seller-feedback-btn" data-id="${order.id}" data-i18n="seller_feedback">Leave seller feedback</button>
          <a href="invoice.html?orderId=${encodeURIComponent(order.id)}" class="secondary-pill-btn" target="_blank" rel="noopener" data-i18n="download_invoice">Download Invoice</a>
        </div>
      </div>
      ${trackingPanel(order)}
      ${afterSalesPanel(order)}
    </article>
  `;
}

function getOrderStatusFilterLabel(value) {
  if (value === "awaiting_payment") {
    return "Status: Awaiting Payment";
  }
  const selectedLabel = String(statusFilter?.selectedOptions?.[0]?.textContent || value || "").trim();
  return `Status: ${selectedLabel}`;
}

function getActiveOrderFilters() {
  const filters = [];
  const query = String(orderSearch?.value || "").trim();
  const status = String(statusFilter?.value || "all").trim();

  if (query) {
    filters.push({
      id: "query",
      label: `Search: ${query}`,
      clear: () => {
        orderSearch.value = "";
      },
      focus: orderSearch,
      feedback: "Removed order search filter. Focus moved to the search input."
    });
  }

  if (status !== "all") {
    filters.push({
      id: "status",
      label: getOrderStatusFilterLabel(status),
      clear: () => {
        statusFilter.value = "all";
      },
      focus: statusFilter,
      feedback: "Removed order status filter. Focus moved to the status filter."
    });
  }

  return filters;
}

function renderOrders(list) {
  if (list.length === 0) {
    ordersGrid.innerHTML = `
      <div class="amz-empty-orders-card">
        <div class="amz-empty-orders-icon">
          <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="#e77600" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        </div>
        <h2 class="amz-empty-orders-title" data-i18n="no_orders_found_title">No orders found</h2>
        <p class="amz-empty-orders-desc" data-i18n="no_orders_found_desc">Looks like you have no orders matching this filter or time period.</p>
        <a href="index.html" class="amz-empty-continue-btn" data-i18n="continue_shopping">Continue Shopping</a>
      </div>
    `;
    ordersMeta.textContent = "Showing 0 orders";
    window.EM_I18N?.updateAllTranslations?.() || window.applyTranslations?.();
    return;
  }

  ordersGrid.innerHTML = list.map(orderCard).join("");
  ordersMeta.textContent = `Showing ${list.length} orders`;
  window.EM_I18N?.updateAllTranslations?.() || window.applyTranslations?.();
}

function filterOrders() {
  const query = (orderSearch ? orderSearch.value : "").trim().toLowerCase();
  const status = statusFilter ? statusFilter.value : "all";
  const timeVal = timeFilter ? timeFilter.value : "past_3_months";

  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
  const sixMonthsAgo = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000));

  const filtered = orders.filter((order) => {
    // 1. Tab filter
    if (currentOrderTab === "buy_again") {
      if (order.status === "cancelled") return false;
    } else if (currentOrderTab === "not_yet_shipped") {
      if (order.status === "delivered" || order.status === "cancelled") return false;
    } else if (currentOrderTab === "cancelled") {
      if (order.status !== "cancelled") return false;
    }

    // 2. Search query filter
    const queryMatch = !query ||
      order.id.toLowerCase().includes(query) ||
      order.idLabel.toLowerCase().includes(query) ||
      order.product.toLowerCase().includes(query);

    // 3. Status filter (if set manually)
    const statusMatch = status === "all"
      || (status === "awaiting_payment" && isOrderResumeEligible(order))
      || order.status === status;

    // 4. Time filter
    let timeMatch = true;
    const orderDate = new Date(order.createdAt || order.date);
    if (!Number.isNaN(orderDate.getTime())) {
      if (timeVal === "past_3_months") {
        timeMatch = orderDate >= threeMonthsAgo;
      } else if (timeVal === "past_6_months") {
        timeMatch = orderDate >= sixMonthsAgo;
      } else if (timeVal === "2026") {
        timeMatch = orderDate.getFullYear() === 2026;
      } else if (timeVal === "2025") {
        timeMatch = orderDate.getFullYear() === 2025;
      } else if (timeVal === "archived") {
        timeMatch = orderDate < sixMonthsAgo;
      }
    }

    return queryMatch && statusMatch && timeMatch;
  });

  renderOrders(filtered);
  filterChipController?.update();
}

async function fetchOrders() {
  const session = getSessionOrRedirect();
  if (!session) {
    return;
  }

  syncOrdersAccountState(session);

  ordersMeta.textContent = "Loading orders...";
  ordersGrid.innerHTML = "<div class='empty-message'>Fetching your orders...</div>";

  let response;
  try {
    loadOrderNotifications(session);
    response = await fetch(`${API_BASE_URL}/orders/my`, {
      headers: {
        Authorization: `Bearer ${session.token}`
      }
    });
  } catch (error) {
    const offlineOrders = loadOfflineOrders();
    orders = offlineOrders.map(buildOrderView);
    loadOrderNotifications(session);
    if (orders.length === 0) {
      renderOrders([]);
      return;
    }
    filterOrders();
    return;
  }

  const data = await response.json().catch(() => null);
  if (!response.ok || !data || !Array.isArray(data.orders)) {
    const offlineOrders = loadOfflineOrders();
    orders = offlineOrders.map(buildOrderView);
    loadOrderNotifications(session);
    if (orders.length === 0) {
      renderOrders([]);
      return;
    }
    filterOrders();
    return;
  }

  const merged = [...data.orders, ...loadOfflineOrders()];
  const seen = new Set();
  orders = merged
    .map(buildOrderView)
    .filter((order) => {
      const key = String(order.id);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  loadOrderNotifications(session);
  filterOrders();
}

if (orderSearch) orderSearch.addEventListener("input", filterOrders);
if (statusFilter) statusFilter.addEventListener("change", filterOrders);
if (timeFilter) timeFilter.addEventListener("change", filterOrders);

if (orderTabs) {
  orderTabs.addEventListener("click", (e) => {
    const tabBtn = e.target.closest(".amz-order-tab-btn");
    if (!tabBtn) return;
    orderTabs.querySelectorAll(".amz-order-tab-btn").forEach((b) => b.classList.remove("active"));
    tabBtn.classList.add("active");
    currentOrderTab = tabBtn.getAttribute("data-tab") || "orders";
    filterOrders();
  });
}

const orderSearchForm = document.getElementById("orderSearchForm");
if (orderSearchForm) {
  orderSearchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    filterOrders();
  });
}

ordersGrid.addEventListener("click", async (event) => {
  const buyAgainBtn = event.target.closest(".amz-buy-again-inline-btn");
  if (buyAgainBtn) {
    const productId = buyAgainBtn.getAttribute("data-product-id");
    if (productId) {
      try {
        const rawCart = localStorage.getItem("electromart_cart_v1");
        const cart = rawCart ? JSON.parse(rawCart) : {};
        cart[productId] = (Number(cart[productId]) || 0) + 1;
        localStorage.setItem("electromart_cart_v1", JSON.stringify(cart));
        const total = Object.values(cart).reduce((sum, qty) => sum + Number(qty || 0), 0);
        const cartCountEl = document.getElementById("cartCount");
        if (cartCountEl) cartCountEl.textContent = String(total);
        buyAgainBtn.style.background = "#007600";
        buyAgainBtn.style.color = "#ffffff";
        buyAgainBtn.style.borderColor = "#006000";
        buyAgainBtn.innerHTML = "✓ Added to Cart";
        setTimeout(() => {
          buyAgainBtn.style.background = "";
          buyAgainBtn.style.color = "";
          buyAgainBtn.style.borderColor = "";
          buyAgainBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            <span>Buy it again</span>
          `;
        }, 2000);
      } catch (err) {
        console.error(err);
      }
    }
    return;
  }

  const reviewBtn = event.target.closest(".write-review-btn");
  if (reviewBtn) {
    const orderId = reviewBtn.getAttribute("data-id") || "";
    const pId = reviewBtn.getAttribute("data-product-id") || "";
    window.location.href = `review.html?productId=${encodeURIComponent(pId)}&orderId=${encodeURIComponent(orderId)}`;
    return;
  }

  const feedbackBtn = event.target.closest(".seller-feedback-btn");
  if (feedbackBtn) {
    alert("Thank you for rating ElectroMart Retail! Your seller feedback is highly appreciated.");
    return;
  }

  const resumeBtn = event.target.closest(".resume-payment-btn");
  if (resumeBtn) {
    const orderId = String(resumeBtn.getAttribute("data-id") || "").trim();
    if (!orderId) {
      return;
    }
    await resumePendingPayment(orderId);
    return;
  }

  const cancelBtn = event.target.closest(".cancel-order-btn");
  if (cancelBtn) {
    const orderId = String(cancelBtn.getAttribute("data-id") || "").trim();
    if (!orderId) {
      return;
    }
    await cancelOrder(orderId);
    return;
  }

  const afterSalesBtn = event.target.closest(".after-sales-btn");
  if (afterSalesBtn) {
    if (afterSalesBtn.tagName === "A" && afterSalesBtn.getAttribute("href")) {
      return;
    }
    const orderId = String(afterSalesBtn.getAttribute("data-id") || "").trim();
    const panel = document.getElementById(`after-sales-${orderId}`);
    if (!panel) {
      return;
    }
    const isHidden = panel.hasAttribute("hidden");
    if (isHidden) {
      panel.removeAttribute("hidden");
      afterSalesBtn.textContent = "Hide Request";
    } else {
      panel.setAttribute("hidden", "");
      afterSalesBtn.textContent = Array.from(panel.querySelectorAll(".after-sales-case-card")).length
        ? "View Request"
        : "Request Return / Refund / Exchange";
    }
    return;
  }

  const shipToBtn = event.target.closest(".amz-ship-to-trigger");
  if (shipToBtn) {
    event.preventDefault();
    event.stopPropagation();
    const wrapper = shipToBtn.closest(".amz-ship-to-wrapper");
    const popover = wrapper?.querySelector(".amz-ship-to-popover");
    if (popover) {
      const isClosed = popover.hasAttribute("hidden");
      document.querySelectorAll(".amz-ship-to-popover:not([hidden])").forEach((pop) => {
        if (pop !== popover) {
          pop.setAttribute("hidden", "");
          const tr = pop.closest(".amz-ship-to-wrapper")?.querySelector(".amz-ship-to-trigger");
          if (tr) tr.setAttribute("aria-expanded", "false");
        }
      });
      if (isClosed) {
        popover.removeAttribute("hidden");
        shipToBtn.setAttribute("aria-expanded", "true");
      } else {
        popover.setAttribute("hidden", "");
        shipToBtn.setAttribute("aria-expanded", "false");
      }
    }
    return;
  }

  const detailsBtn = event.target.closest(".view-order-details-link");
  if (detailsBtn) {
    event.preventDefault();
    const orderId = detailsBtn.getAttribute("data-id");
    if (orderId) {
      openOrderDetailsModal(orderId);
    }
    return;
  }

  const trackBtn = event.target.closest(".track-btn");
  if (!trackBtn) {
    return;
  }
  if (trackBtn.tagName && trackBtn.tagName.toLowerCase() === "a") {
    return;
  }

  const orderId = trackBtn.getAttribute("data-id");
  const panel = document.getElementById(`tracking-${orderId}`);
  if (!panel) {
    return;
  }

  const isHidden = panel.hasAttribute("hidden");
  if (isHidden) {
    panel.removeAttribute("hidden");
    trackBtn.textContent = "Hide tracking";
  } else {
    panel.setAttribute("hidden", "");
    trackBtn.textContent = "Track package";
  }
});

// Outside click & Escape key handlers for Ship To popover and Order Details modal
document.addEventListener("click", (event) => {
  if (!event.target.closest(".amz-ship-to-wrapper")) {
    document.querySelectorAll(".amz-ship-to-popover:not([hidden])").forEach((pop) => {
      pop.setAttribute("hidden", "");
      const tr = pop.closest(".amz-ship-to-wrapper")?.querySelector(".amz-ship-to-trigger");
      if (tr) tr.setAttribute("aria-expanded", "false");
    });
  }

  const modal = document.getElementById("orderDetailsModal");
  if (modal && !modal.hasAttribute("hidden")) {
    if (event.target === modal || event.target.closest("#closeOrderDetailsBtn") || event.target.closest("#dismissOrderDetailsBtn")) {
      closeOrderDetailsModal();
    }
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeOrderDetailsModal();
    document.querySelectorAll(".amz-ship-to-popover:not([hidden])").forEach((pop) => {
      pop.setAttribute("hidden", "");
      const tr = pop.closest(".amz-ship-to-wrapper")?.querySelector(".amz-ship-to-trigger");
      if (tr) tr.setAttribute("aria-expanded", "false");
    });
  }
});

ordersGrid.addEventListener("submit", async (event) => {
  const form = event.target.closest(".after-sales-form[data-order-id]");
  if (!form) {
    return;
  }
  event.preventDefault();
  const orderId = String(form.getAttribute("data-order-id") || "").trim();
  if (!orderId) {
    return;
  }
  await submitAfterSalesRequest(orderId, form);
});

if (orderNotificationsList) {
  orderNotificationsList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action='toggle-read'][data-notification-key]");
    if (!button) {
      return;
    }
    const key = String(button.getAttribute("data-notification-key") || "").trim();
    const item = currentOrderNotifications.find((notification) => getNotificationStateKey(notification) === key);
    if (!item) {
      return;
    }
    setNotificationRead(item, !isNotificationRead(item));
    renderOrderNotifications(currentOrderNotifications);
  });
}

if (markAllOrderNotificationsReadBtn) {
  markAllOrderNotificationsReadBtn.addEventListener("click", () => {
    currentOrderNotifications.forEach((item) => setNotificationRead(item, true));
    renderOrderNotifications(currentOrderNotifications);
  });
}

filterChipController = window.ElectroMartListingFilterChips?.init({
  mountAfter: "#ordersMeta",
  getFilters: getActiveOrderFilters,
  clearAll: () => {
    if (orderSearch) {
      orderSearch.value = "";
    }
    if (statusFilter) {
      statusFilter.value = "all";
    }
  },
  focusAfterClearAll: orderSearch,
  clearAllFeedback: "Removed all order filters. Focus moved to the search input.",
  onChange: filterOrders,
  getResultSummary: () => String(ordersMeta?.textContent || "").trim()
}) || null;

fetchOrders();
