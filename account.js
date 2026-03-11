const AUTH_STORAGE_KEY = "electromart_auth_v1";
const STORAGE_KEY = "electromart_profile_v1";
const ORDER_NOTIFICATIONS_STORAGE_KEY = "electromart_order_notifications_v1";
const NOTIFICATION_READ_STATE_KEY = "electromart_notification_reads_v1";
const NOTIFICATION_PREFERENCES_STORAGE_KEY = "electromart_notification_preferences_v1";
const PHONE_VERIFICATION_STORAGE_KEY = "electromart_phone_verification_v1";
const SECURITY_PREFERENCES_STORAGE_KEY = "electromart_security_preferences_v1";
const AUTH_ACTIVITY_STORAGE_KEY = "electromart_auth_activity_v1";
const PHONE_VERIFICATION_RESEND_COOLDOWN_MS = 60 * 1000;
const PHONE_VERIFICATION_MAX_ATTEMPTS = 5;
const PHONE_VERIFICATION_LOCK_MS = 10 * 60 * 1000;
const ACCOUNT_TOAST_STACK_ID = "accountToastStack";
const API_BASE_URL = (() => {
  const { protocol, hostname, port } = window.location;
  if (protocol === "file:" || hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:4000/api";
  }
  const origin = `${protocol}//${hostname}${port ? `:${port}` : ""}`;
  return `${origin}/api`;
})();

const menuButtons = document.querySelectorAll(".menu-btn");
const panels = document.querySelectorAll(".panel");
const profileForm = document.getElementById("profileForm");
const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const companyInput = document.getElementById("company");
const twoFactorToggle = document.getElementById("twoFactorToggle");
const alertsToggle = document.getElementById("alertsToggle");
const securityPreferencesMeta = document.getElementById("securityPreferencesMeta");
const saveSecurityPreferencesBtn = document.getElementById("saveSecurityPreferencesBtn");
const changePasswordForm = document.getElementById("changePasswordForm");
const currentPasswordInput = document.getElementById("currentPassword");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const changePasswordBtn = document.getElementById("changePasswordBtn");
const logoutAllSessionsBtn = document.getElementById("logoutAllSessionsBtn");
const authActivityMeta = document.getElementById("authActivityMeta");
const authActivityList = document.getElementById("authActivityList");
const refreshAuthActivityBtn = document.getElementById("refreshAuthActivityBtn");
const signOutBtn = document.getElementById("signOutBtn");
const adminDashboardLink = document.getElementById("adminDashboardLink");
const adminQuickCard = document.getElementById("adminQuickCard");
const accountPhoneVerificationBadge = document.getElementById("accountPhoneVerificationBadge");
const overviewNotificationsMeta = document.getElementById("overviewNotificationsMeta");
const overviewNotificationsList = document.getElementById("overviewNotificationsList");
const accountNotificationsMeta = document.getElementById("accountNotificationsMeta");
const accountNotificationsList = document.getElementById("accountNotificationsList");
const markAllNotificationsReadBtn = document.getElementById("markAllNotificationsReadBtn");
const notificationStatusFilter = document.getElementById("notificationStatusFilter");
const notificationTypeFilter = document.getElementById("notificationTypeFilter");
const resetNotificationFiltersBtn = document.getElementById("resetNotificationFiltersBtn");
const notificationPreferencesMeta = document.getElementById("notificationPreferencesMeta");
const saveNotificationPreferencesBtn = document.getElementById("saveNotificationPreferencesBtn");
const sendTestNotificationBtn = document.getElementById("sendTestNotificationBtn");
const phoneVerificationMeta = document.getElementById("phoneVerificationMeta");
const requestPhoneVerificationBtn = document.getElementById("requestPhoneVerificationBtn");
const phoneVerificationCodeInput = document.getElementById("phoneVerificationCodeInput");
const confirmPhoneVerificationBtn = document.getElementById("confirmPhoneVerificationBtn");
const prefEmailEnabledToggle = document.getElementById("prefEmailEnabledToggle");
const prefSmsEnabledToggle = document.getElementById("prefSmsEnabledToggle");
const prefWhatsappEnabledToggle = document.getElementById("prefWhatsappEnabledToggle");
const prefSmsProviderSelect = document.getElementById("prefSmsProviderSelect");
const prefWhatsappProviderSelect = document.getElementById("prefWhatsappProviderSelect");
const prefOrderShippedToggle = document.getElementById("prefOrderShippedToggle");
const prefOrderDeliveredToggle = document.getElementById("prefOrderDeliveredToggle");
const prefOrderCancelledToggle = document.getElementById("prefOrderCancelledToggle");
let currentNotifications = [];
let currentNotificationPreferences = {
  emailEnabled: true,
  smsEnabled: false,
  whatsappEnabled: false,
  smsProvider: "twilio",
  whatsappProvider: "twilio",
  orderShipped: true,
  orderDelivered: true,
  orderCancelled: true
};
let currentNotificationFilters = {
  status: "all",
  type: "all"
};
let currentSecurityPreferences = {
  twoFactorEnabled: false,
  loginAlertsEnabled: true
};
let currentAuthActivity = [];
let currentPhoneVerification = {
  isVerified: false,
  verifiedAt: null,
  mobileMasked: "N/A",
  hasPendingCode: false,
  pendingExpiresAt: null,
  resendAvailableAt: null,
  remainingAttempts: PHONE_VERIFICATION_MAX_ATTEMPTS,
  isLocked: false,
  lockedUntil: null
};
let phoneVerificationTimerId = null;
let lastAccountToastKey = "";
let lastAccountToastAt = 0;

function ensureAccountToastStack() {
  const existing = document.getElementById(ACCOUNT_TOAST_STACK_ID);
  if (existing) {
    return existing;
  }
  if (!document.body) {
    return null;
  }
  const stack = document.createElement("section");
  stack.id = ACCOUNT_TOAST_STACK_ID;
  stack.className = "em-toast-stack";
  stack.setAttribute("aria-live", "polite");
  stack.setAttribute("aria-atomic", "false");
  document.body.appendChild(stack);
  return stack;
}

function inferAccountToastTone(message) {
  const text = String(message || "").trim().toLowerCase();
  if (!text) {
    return "info";
  }
  if (/(saved|successful|successfully|updated|verified|sent|signed out|completed|created|enabled)/.test(text)) {
    return "success";
  }
  if (/(wait|locked|retry|expired|unavailable|not found|cannot|can't|not eligible|invalid|required|please)/.test(text)) {
    return "warning";
  }
  if (/(failed|unable|error|denied|forbidden)/.test(text)) {
    return "error";
  }
  return "info";
}

function toastTitleFromTone(tone) {
  if (tone === "success") {
    return "Success";
  }
  if (tone === "warning") {
    return "Action required";
  }
  if (tone === "error") {
    return "Request failed";
  }
  return "Notice";
}

function showAccountToast({ title = "", message = "", tone = "info", timeoutMs = 4600 } = {}) {
  const safeMessage = String(message || "").trim();
  if (!safeMessage) {
    return;
  }

  const toastKey = `${String(tone || "info").trim().toLowerCase()}:${safeMessage}`;
  const now = Date.now();
  if (toastKey === lastAccountToastKey && now - lastAccountToastAt < 1200) {
    return;
  }
  lastAccountToastKey = toastKey;
  lastAccountToastAt = now;

  const stack = ensureAccountToastStack();
  if (!stack) {
    return;
  }

  const safeTone = ["success", "error", "warning", "info"].includes(String(tone || "").trim().toLowerCase())
    ? String(tone || "info").trim().toLowerCase()
    : "info";

  const toast = document.createElement("article");
  toast.className = `em-toast ${safeTone}`;

  if (title) {
    const heading = document.createElement("strong");
    heading.className = "em-toast-title";
    heading.textContent = String(title).trim();
    toast.appendChild(heading);
  }

  const body = document.createElement("p");
  body.className = "em-toast-message";
  body.textContent = safeMessage;
  toast.appendChild(body);

  const close = document.createElement("button");
  close.type = "button";
  close.className = "em-toast-close";
  close.textContent = "Dismiss";
  close.addEventListener("click", () => {
    toast.remove();
  });
  toast.appendChild(close);

  stack.appendChild(toast);
  window.setTimeout(() => {
    toast.remove();
  }, Math.max(1400, Number(timeoutMs || 0)));
}

window.alert = (message) => {
  const safeMessage = String(message || "").trim();
  if (!safeMessage) {
    return;
  }
  const tone = inferAccountToastTone(safeMessage);
  showAccountToast({
    title: toastTitleFromTone(tone),
    message: safeMessage,
    tone,
    timeoutMs: 5400
  });
};

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

function defaultNotificationPreferences() {
  return {
    emailEnabled: true,
    smsEnabled: false,
    whatsappEnabled: false,
    smsProvider: "twilio",
    whatsappProvider: "twilio",
    orderShipped: true,
    orderDelivered: true,
    orderCancelled: true
  };
}

function defaultSecurityPreferences() {
  return {
    twoFactorEnabled: false,
    loginAlertsEnabled: true
  };
}

function normalizeNotificationPreferences(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    emailEnabled: source.emailEnabled !== false,
    smsEnabled: source.smsEnabled === true,
    whatsappEnabled: source.whatsappEnabled === true,
    smsProvider: source.smsProvider || "twilio",
    whatsappProvider: source.whatsappProvider || "twilio",
    orderShipped: source.orderShipped !== false,
    orderDelivered: source.orderDelivered !== false,
    orderCancelled: source.orderCancelled !== false
  };
}

function normalizeSecurityPreferences(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    twoFactorEnabled: source.twoFactorEnabled === true,
    loginAlertsEnabled: source.loginAlertsEnabled !== false
  };
}

function normalizeAuthActivityItem(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    id: String(source.id || `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`),
    eventKey: String(source.eventKey || "account_update").trim().toLowerCase() || "account_update",
    eventLabel: String(source.eventLabel || source.eventKey || "Account update").trim() || "Account update",
    createdAt: String(source.createdAt || new Date().toISOString()).trim(),
    ip: String(source.ip || "").trim(),
    userAgent: String(source.userAgent || "").trim(),
    note: String(source.note || "").trim(),
    actor: String(source.actor || "user").trim() || "user"
  };
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

function maskPhone(value) {
  const normalized = normalizePhone(value);
  const digits = normalized.replace(/[^\d]/g, "");
  if (!digits) {
    return "N/A";
  }
  if (digits.length <= 4) {
    return digits;
  }
  return `${normalized.startsWith("+") ? "+" : ""}${"*".repeat(Math.max(2, digits.length - 4))}${digits.slice(-4)}`;
}

function defaultPhoneVerificationState() {
  const session = readSession();
  return {
    isVerified: false,
    verifiedAt: null,
    mobileMasked: maskPhone(session && session.mobile ? session.mobile : ""),
    hasPendingCode: false,
    pendingExpiresAt: null,
    resendAvailableAt: null,
    remainingAttempts: PHONE_VERIFICATION_MAX_ATTEMPTS,
    isLocked: false,
    lockedUntil: null,
    otpPreview: ""
  };
}

function normalizePhoneVerificationState(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    isVerified: source.isVerified === true,
    verifiedAt: source.verifiedAt ? String(source.verifiedAt) : null,
    mobileMasked: String(source.mobileMasked || defaultPhoneVerificationState().mobileMasked || "N/A"),
    hasPendingCode: source.hasPendingCode === true,
    pendingExpiresAt: source.pendingExpiresAt ? String(source.pendingExpiresAt) : null,
    resendAvailableAt: source.resendAvailableAt ? String(source.resendAvailableAt) : null,
    remainingAttempts: Number.isFinite(Number(source.remainingAttempts))
      ? Math.max(0, Number(source.remainingAttempts))
      : PHONE_VERIFICATION_MAX_ATTEMPTS,
    isLocked: source.isLocked === true,
    lockedUntil: source.lockedUntil ? String(source.lockedUntil) : null,
    otpPreview: source.otpPreview ? String(source.otpPreview) : ""
  };
}

function loadLocalOrderNotifications() {
  try {
    const raw = localStorage.getItem(ORDER_NOTIFICATIONS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveLocalOrderNotifications(list) {
  try {
    localStorage.setItem(ORDER_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(Array.isArray(list) ? list : []));
  } catch (error) {
    return;
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

function loadNotificationPreferencesLocal() {
  try {
    const raw = localStorage.getItem(NOTIFICATION_PREFERENCES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const safe = parsed && typeof parsed === "object" ? parsed : {};
    return normalizeNotificationPreferences(safe[getNotificationUserKey()] || defaultNotificationPreferences());
  } catch (error) {
    return defaultNotificationPreferences();
  }
}

function saveNotificationPreferencesLocal(value) {
  try {
    const raw = localStorage.getItem(NOTIFICATION_PREFERENCES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const safe = parsed && typeof parsed === "object" ? parsed : {};
    safe[getNotificationUserKey()] = normalizeNotificationPreferences(value);
    localStorage.setItem(NOTIFICATION_PREFERENCES_STORAGE_KEY, JSON.stringify(safe));
  } catch (error) {
    return;
  }
}

function loadSecurityPreferencesLocal() {
  try {
    const raw = localStorage.getItem(SECURITY_PREFERENCES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const safe = parsed && typeof parsed === "object" ? parsed : {};
    return normalizeSecurityPreferences(safe[getNotificationUserKey()] || defaultSecurityPreferences());
  } catch (error) {
    return defaultSecurityPreferences();
  }
}

function saveSecurityPreferencesLocal(value) {
  try {
    const raw = localStorage.getItem(SECURITY_PREFERENCES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const safe = parsed && typeof parsed === "object" ? parsed : {};
    safe[getNotificationUserKey()] = normalizeSecurityPreferences(value);
    localStorage.setItem(SECURITY_PREFERENCES_STORAGE_KEY, JSON.stringify(safe));
  } catch (error) {
    return;
  }
}

function loadAuthActivityLocal() {
  try {
    const raw = localStorage.getItem(AUTH_ACTIVITY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const safe = parsed && typeof parsed === "object" ? parsed : {};
    const list = Array.isArray(safe[getNotificationUserKey()]) ? safe[getNotificationUserKey()] : [];
    return list.map(normalizeAuthActivityItem);
  } catch (error) {
    return [];
  }
}

function saveAuthActivityLocal(list) {
  try {
    const raw = localStorage.getItem(AUTH_ACTIVITY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const safe = parsed && typeof parsed === "object" ? parsed : {};
    safe[getNotificationUserKey()] = (Array.isArray(list) ? list : []).map(normalizeAuthActivityItem).slice(0, 12);
    localStorage.setItem(AUTH_ACTIVITY_STORAGE_KEY, JSON.stringify(safe));
  } catch (error) {
    return;
  }
}

function loadPhoneVerificationStore() {
  try {
    const raw = localStorage.getItem(PHONE_VERIFICATION_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
}

function savePhoneVerificationStore(store) {
  try {
    localStorage.setItem(PHONE_VERIFICATION_STORAGE_KEY, JSON.stringify(store && typeof store === "object" ? store : {}));
  } catch (error) {
    return;
  }
}

function getLocalPhoneVerificationPublicState(entry, mobile) {
  const safeEntry = entry && typeof entry === "object" ? entry : {};
  const normalizedMobile = normalizePhone(mobile);
  const resendAvailableAt = safeEntry.lastRequestedAt
    ? new Date(new Date(safeEntry.lastRequestedAt).getTime() + PHONE_VERIFICATION_RESEND_COOLDOWN_MS).toISOString()
    : null;
  const resendActive = resendAvailableAt && new Date(resendAvailableAt).getTime() > Date.now() ? resendAvailableAt : null;
  const lockedUntil = safeEntry.lockedUntil && new Date(safeEntry.lockedUntil).getTime() > Date.now()
    ? String(safeEntry.lockedUntil)
    : null;
  const pendingExpiresAt = safeEntry.pendingExpiresAt && new Date(safeEntry.pendingExpiresAt).getTime() > Date.now()
    ? String(safeEntry.pendingExpiresAt)
    : null;
  const failedAttempts = Number.isFinite(Number(safeEntry.failedAttempts)) ? Math.max(0, Number(safeEntry.failedAttempts)) : 0;
  return normalizePhoneVerificationState({
    isVerified: Boolean(safeEntry.verifiedAt && safeEntry.verifiedForMobile === normalizedMobile && normalizedMobile),
    verifiedAt: safeEntry.verifiedAt || null,
    mobileMasked: maskPhone(normalizedMobile),
    hasPendingCode: Boolean(safeEntry.pendingCode && safeEntry.pendingMobile === normalizedMobile && pendingExpiresAt),
    pendingExpiresAt,
    resendAvailableAt: resendActive,
    remainingAttempts: Math.max(0, PHONE_VERIFICATION_MAX_ATTEMPTS - failedAttempts),
    isLocked: Boolean(lockedUntil),
    lockedUntil
  });
}

function loadLocalPhoneVerification() {
  const session = readSession();
  const store = loadPhoneVerificationStore();
  const entry = store[getNotificationUserKey(session)] || {};
  const mobile = normalizePhone(session && session.mobile ? session.mobile : "");
  return getLocalPhoneVerificationPublicState(entry, mobile);
}

function saveLocalPhoneVerificationPatch(patch) {
  const session = readSession();
  const mobile = normalizePhone(session && session.mobile ? session.mobile : "");
  const key = getNotificationUserKey(session);
  const store = loadPhoneVerificationStore();
  const next = { ...(store[key] || {}) };
  const safePatch = patch && typeof patch === "object" ? patch : {};

  if (safePatch.reset === true) {
    next.pendingCode = "";
    next.pendingMobile = "";
    next.pendingExpiresAt = null;
  }
  if (safePatch.lastRequestedAt) {
    next.lastRequestedAt = String(safePatch.lastRequestedAt);
  }
  if (typeof safePatch.pendingCode === "string") {
    next.pendingCode = safePatch.pendingCode;
    next.pendingMobile = mobile;
    next.pendingExpiresAt = safePatch.pendingExpiresAt || null;
  }
  if (typeof safePatch.failedAttempts === "number") {
    next.failedAttempts = safePatch.failedAttempts;
  }
  if (safePatch.lockedUntil !== undefined) {
    next.lockedUntil = safePatch.lockedUntil || null;
  }
  if (safePatch.verifiedAt) {
    next.verifiedAt = String(safePatch.verifiedAt);
    next.verifiedForMobile = mobile;
  }
  if (safePatch.clearVerified === true) {
    next.verifiedAt = null;
    next.verifiedForMobile = "";
  }
  store[key] = next;
  savePhoneVerificationStore(store);
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

function setToggleButtonState(button, enabled) {
  if (!button) {
    return;
  }
  const on = Boolean(enabled);
  button.classList.toggle("on", on);
  button.textContent = on ? "Enabled" : "Disabled";
  button.setAttribute("aria-pressed", String(on));
}

function formatCountdown(targetIso) {
  const targetTime = new Date(targetIso || "").getTime();
  if (!Number.isFinite(targetTime)) {
    return "";
  }
  const remainingMs = Math.max(0, targetTime - Date.now());
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${String(seconds).padStart(2, "0")}s` : `${seconds}s`;
}

function stopPhoneVerificationTimer() {
  if (phoneVerificationTimerId) {
    window.clearTimeout(phoneVerificationTimerId);
    phoneVerificationTimerId = null;
  }
}

function applyPhoneVerificationState(value) {
  stopPhoneVerificationTimer();
  currentPhoneVerification = normalizePhoneVerificationState(value || defaultPhoneVerificationState());
  if (accountPhoneVerificationBadge) {
    accountPhoneVerificationBadge.textContent = currentPhoneVerification.isVerified ? "Phone Verified" : "Phone Pending";
    accountPhoneVerificationBadge.classList.toggle("verified", currentPhoneVerification.isVerified);
    accountPhoneVerificationBadge.classList.toggle("pending", !currentPhoneVerification.isVerified);
    accountPhoneVerificationBadge.title = currentPhoneVerification.isVerified
      ? `Verified on ${formatDateTime(currentPhoneVerification.verifiedAt)}`
      : "Verify your phone number to enable SMS or WhatsApp notifications.";
  }
  if (phoneVerificationMeta) {
    if (currentPhoneVerification.isLocked) {
      phoneVerificationMeta.textContent = `Verification locked for ${currentPhoneVerification.mobileMasked} until ${formatDateTime(currentPhoneVerification.lockedUntil)}.`;
    } else if (currentPhoneVerification.isVerified) {
      phoneVerificationMeta.textContent = `Verified for ${currentPhoneVerification.mobileMasked}${currentPhoneVerification.verifiedAt ? ` on ${formatDateTime(currentPhoneVerification.verifiedAt)}` : ""}.`;
    } else if (currentPhoneVerification.hasPendingCode) {
      const cooldownLine = currentPhoneVerification.resendAvailableAt
        ? ` Resend available in ${formatCountdown(currentPhoneVerification.resendAvailableAt)}.`
        : "";
      phoneVerificationMeta.textContent = `Code sent to ${currentPhoneVerification.mobileMasked}. Enter the 6-digit OTP to verify before enabling SMS/WhatsApp.${cooldownLine} Attempts left: ${currentPhoneVerification.remainingAttempts}.`;
    } else {
      phoneVerificationMeta.textContent = `Verify ${currentPhoneVerification.mobileMasked} before enabling SMS or WhatsApp notifications.`;
    }
  }
  if (requestPhoneVerificationBtn) {
    const cooldownActive = Boolean(currentPhoneVerification.resendAvailableAt && new Date(currentPhoneVerification.resendAvailableAt).getTime() > Date.now());
    requestPhoneVerificationBtn.disabled = currentPhoneVerification.isLocked || cooldownActive;
    requestPhoneVerificationBtn.textContent = cooldownActive
      ? `Resend in ${formatCountdown(currentPhoneVerification.resendAvailableAt)}`
      : "Send Code";
  }
  if (confirmPhoneVerificationBtn) {
    confirmPhoneVerificationBtn.disabled = currentPhoneVerification.isLocked || !currentPhoneVerification.hasPendingCode;
  }
  if ((currentPhoneVerification.resendAvailableAt && new Date(currentPhoneVerification.resendAvailableAt).getTime() > Date.now())
    || (currentPhoneVerification.isLocked && currentPhoneVerification.lockedUntil && new Date(currentPhoneVerification.lockedUntil).getTime() > Date.now())) {
    phoneVerificationTimerId = window.setTimeout(() => {
      applyPhoneVerificationState(currentPhoneVerification);
    }, 1000);
  }
}

function isChannelKey(key) {
  return key === "smsEnabled" || key === "whatsappEnabled";
}

function ensurePhoneVerifiedForChannelPreference(key, nextValue) {
  if (!isChannelKey(key) || !nextValue) {
    return true;
  }
  if (currentPhoneVerification.isVerified) {
    return true;
  }
  setActivePanel("notifications");
  if (phoneVerificationCodeInput) {
    phoneVerificationCodeInput.focus();
  }
  alert("Verify your phone number before enabling SMS or WhatsApp notifications.");
  return false;
}

function applyNotificationPreferences(preferences) {
  currentNotificationPreferences = normalizeNotificationPreferences(preferences);
  saveNotificationPreferencesLocal(currentNotificationPreferences);
  setToggleButtonState(prefEmailEnabledToggle, currentNotificationPreferences.emailEnabled);
  setToggleButtonState(prefSmsEnabledToggle, currentNotificationPreferences.smsEnabled);
  setToggleButtonState(prefWhatsappEnabledToggle, currentNotificationPreferences.whatsappEnabled);
  setToggleButtonState(prefOrderShippedToggle, currentNotificationPreferences.orderShipped);
  setToggleButtonState(prefOrderDeliveredToggle, currentNotificationPreferences.orderDelivered);
  setToggleButtonState(prefOrderCancelledToggle, currentNotificationPreferences.orderCancelled);
  if (prefSmsProviderSelect) {
    prefSmsProviderSelect.value = currentNotificationPreferences.smsProvider;
    prefSmsProviderSelect.disabled = !currentNotificationPreferences.smsEnabled;
  }
  if (prefWhatsappProviderSelect) {
    prefWhatsappProviderSelect.value = currentNotificationPreferences.whatsappProvider;
    prefWhatsappProviderSelect.disabled = !currentNotificationPreferences.whatsappEnabled;
  }
  if (notificationPreferencesMeta) {
    const enabledChannels = [
      currentNotificationPreferences.emailEnabled ? "Email" : "",
      currentNotificationPreferences.smsEnabled ? `SMS (${currentNotificationPreferences.smsProvider})` : "",
      currentNotificationPreferences.whatsappEnabled ? `WhatsApp (${currentNotificationPreferences.whatsappProvider})` : ""
    ].filter(Boolean);
    notificationPreferencesMeta.textContent = enabledChannels.length
      ? `Enabled channels: ${enabledChannels.join(", ")}. Order milestone toggles apply to every active channel.`
      : "All notification channels are currently disabled.";
  }
}

function togglePreferenceValue(key) {
  const nextValue = !currentNotificationPreferences[key];
  if (!ensurePhoneVerifiedForChannelPreference(key, nextValue)) {
    return;
  }
  currentNotificationPreferences = normalizeNotificationPreferences({
    ...currentNotificationPreferences,
    [key]: nextValue
  });
  applyNotificationPreferences(currentNotificationPreferences);
}

function setProviderValue(key, value) {
  currentNotificationPreferences = normalizeNotificationPreferences({
    ...currentNotificationPreferences,
    [key]: value
  });
  applyNotificationPreferences(currentNotificationPreferences);
}

async function loadNotificationPreferences() {
  const session = readSession();
  const localPrefs = loadNotificationPreferencesLocal();
  const localPhoneVerification = loadLocalPhoneVerification();
  if (!session || !session.token) {
    applyNotificationPreferences(localPrefs);
    applyPhoneVerificationState(localPhoneVerification);
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${session.token}`
      }
    });
    if (!response.ok) {
      applyNotificationPreferences(localPrefs);
      applyPhoneVerificationState(localPhoneVerification);
      return;
    }
    const user = await response.json().catch(() => null);
    applyNotificationPreferences(user && user.notificationPreferences ? user.notificationPreferences : localPrefs);
    applyPhoneVerificationState(user && user.phoneVerification ? user.phoneVerification : localPhoneVerification);
  } catch (error) {
    applyNotificationPreferences(localPrefs);
    applyPhoneVerificationState(localPhoneVerification);
  }
}

async function saveNotificationPreferences() {
  const session = readSession();
  const payload = normalizeNotificationPreferences(currentNotificationPreferences);
  if ((payload.smsEnabled || payload.whatsappEnabled) && !currentPhoneVerification.isVerified) {
    alert("Verify your phone number before enabling SMS or WhatsApp notifications.");
    return;
  }
  if (!session || !session.token) {
    applyNotificationPreferences(payload);
    return;
  }
  if (saveNotificationPreferencesBtn) {
    saveNotificationPreferencesBtn.disabled = true;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/auth/notification-preferences`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Unable to save notification preferences.");
    }
    applyNotificationPreferences(data.notificationPreferences || payload);
    if (data && data.phoneVerification) {
      applyPhoneVerificationState(data.phoneVerification);
    }
    alert("Notification preferences saved.");
  } catch (error) {
    applyNotificationPreferences(payload);
    alert(error.message || "Backend unavailable. Preferences saved locally.");
  } finally {
    if (saveNotificationPreferencesBtn) {
      saveNotificationPreferencesBtn.disabled = false;
    }
  }
}

function buildLocalTestNotification(session = readSession()) {
  const timestamp = new Date().toISOString();
  return {
    id: `local-test-${Date.now()}`,
    orderId: "",
    userId: String(session && session.id ? session.id : ""),
    email: String(session && session.email ? session.email : "").trim().toLowerCase(),
    eventKey: "test",
    eventLabel: "Test notification",
    status: "sent",
    channel: "local",
    provider: "local",
    destination: "This browser",
    subject: "Test notification from ElectroMart",
    createdAt: timestamp,
    sentAt: timestamp
  };
}

function addLocalTestNotification() {
  const next = buildLocalTestNotification();
  const current = loadLocalOrderNotifications();
  saveLocalOrderNotifications([next, ...current]);
  return next;
}

function applyNotificationFilters(list) {
  const safeList = Array.isArray(list) ? list : [];
  return safeList.filter((item) => {
    if (currentNotificationFilters.status === "unread" && isNotificationRead(item)) {
      return false;
    }
    if (["sent", "queued", "failed", "muted"].includes(currentNotificationFilters.status) && item.status !== currentNotificationFilters.status) {
      return false;
    }
    if (currentNotificationFilters.type === "test" && item.eventKey !== "test") {
      return false;
    }
    if (currentNotificationFilters.type === "order" && item.eventKey === "test") {
      return false;
    }
    return true;
  });
}

function syncNotificationFilterControls() {
  if (notificationStatusFilter) {
    notificationStatusFilter.value = currentNotificationFilters.status;
  }
  if (notificationTypeFilter) {
    notificationTypeFilter.value = currentNotificationFilters.type;
  }
}

function resetNotificationFilters() {
  currentNotificationFilters = {
    status: "all",
    type: "all"
  };
  syncNotificationFilterControls();
  refreshNotificationViews();
}

function renderNotifications(list, metaEl, containerEl, options = {}) {
  const safeList = Array.isArray(list) ? list : [];
  const limit = Number(options.limit || 8);
  const showActions = Boolean(options.showActions);
  const totalCount = Number.isFinite(Number(options.totalCount)) ? Number(options.totalCount) : safeList.length;
  const unreadCount = safeList.filter((item) => !isNotificationRead(item)).length;
  if (metaEl) {
    metaEl.textContent = totalCount !== safeList.length
      ? `${safeList.length} of ${totalCount} updates • Unread ${unreadCount}`
      : `${safeList.length} updates • Unread ${unreadCount}`;
  }
  if (!containerEl) {
    return;
  }
  if (!safeList.length) {
    containerEl.innerHTML = `<div class='notification-empty'>${escapeHtml(options.emptyMessage || "No order updates yet. Your shipment notifications will appear here.")}</div>`;
    return;
  }

  containerEl.innerHTML = safeList.slice(0, limit).map((item) => `
    <article class="notification-item ${isNotificationRead(item) ? "read" : "unread"}">
      <div class="notification-item-head">
        <div>
          <h3>${escapeHtml(item.eventLabel)}</h3>
          <p>${escapeHtml(item.subject || `Order ${item.orderId || "update"} status changed.`)}</p>
        </div>
        <span class="notification-time">${escapeHtml(formatDateTime(item.createdAt))}</span>
      </div>
      <div class="notification-meta">
        <span class="notification-badge ${escapeHtml(item.status)}">${escapeHtml(item.status)}</span>
        <span class="notification-channel">${escapeHtml(formatNotificationChannel(item.channel))}</span>
        <span class="notification-read-state">${isNotificationRead(item) ? "Read" : "Unread"}</span>
        <span>Order: <strong>${escapeHtml(item.orderId || "N/A")}</strong></span>
        <a class="notification-link" href="orders.html">Open Orders</a>
        ${showActions ? `<button class="notification-action-btn" type="button" data-action="toggle-read" data-notification-key="${escapeHtml(getNotificationStateKey(item))}">${isNotificationRead(item) ? "Mark Unread" : "Mark Read"}</button>` : ""}
      </div>
    </article>
  `).join("");
}

function applySecurityPreferences(value) {
  currentSecurityPreferences = normalizeSecurityPreferences(value);
  saveSecurityPreferencesLocal(currentSecurityPreferences);
  if (twoFactorToggle) {
    twoFactorToggle.classList.toggle("on", currentSecurityPreferences.twoFactorEnabled);
    twoFactorToggle.textContent = currentSecurityPreferences.twoFactorEnabled ? "Enabled" : "Disabled";
    twoFactorToggle.setAttribute("aria-pressed", String(currentSecurityPreferences.twoFactorEnabled));
  }
  if (alertsToggle) {
    alertsToggle.classList.toggle("on", currentSecurityPreferences.loginAlertsEnabled);
    alertsToggle.textContent = currentSecurityPreferences.loginAlertsEnabled ? "Enabled" : "Disabled";
    alertsToggle.setAttribute("aria-pressed", String(currentSecurityPreferences.loginAlertsEnabled));
  }
  if (securityPreferencesMeta) {
    securityPreferencesMeta.textContent = currentSecurityPreferences.loginAlertsEnabled
      ? "Review account security settings and recent sign-in activity."
      : "Login alerts are currently muted on this account.";
  }
}

function renderAuthActivity(list) {
  currentAuthActivity = (Array.isArray(list) ? list : []).map(normalizeAuthActivityItem);
  saveAuthActivityLocal(currentAuthActivity);
  if (authActivityMeta) {
    authActivityMeta.textContent = `${currentAuthActivity.length} recent events`;
  }
  if (!authActivityList) {
    return;
  }
  if (!currentAuthActivity.length) {
    authActivityList.innerHTML = "<div class='notification-empty'>No recent auth activity yet.</div>";
    return;
  }
  authActivityList.innerHTML = currentAuthActivity.map((item) => `
    <article class="auth-activity-item">
      <div class="auth-activity-head">
        <div>
          <strong>${escapeHtml(item.eventLabel)}</strong>
          <p>${escapeHtml(item.note || "No additional notes.")}</p>
        </div>
        <span class="notification-time">${escapeHtml(formatDateTime(item.createdAt))}</span>
      </div>
      <div class="auth-activity-meta">
        <span>${escapeHtml(item.actor === "system" ? "System" : "Account")}</span>
        <span>${escapeHtml(item.ip || "IP unavailable")}</span>
        <span>${escapeHtml(item.userAgent ? item.userAgent.slice(0, 90) : "Browser info unavailable")}</span>
      </div>
    </article>
  `).join("");
}

function refreshNotificationViews() {
  renderNotifications(currentNotifications, overviewNotificationsMeta, overviewNotificationsList, { limit: 3, showActions: false });
  renderNotifications(
    applyNotificationFilters(currentNotifications),
    accountNotificationsMeta,
    accountNotificationsList,
    {
      limit: 20,
      showActions: true,
      totalCount: currentNotifications.length,
      emptyMessage: "No notifications match the current filters."
    }
  );
}

async function loadOrderNotifications() {
  const session = readSession();
  const localList = loadLocalOrderNotifications()
    .filter((item) => {
      const email = String(item && item.email ? item.email : "").trim().toLowerCase();
      return !session?.email || !email || email === String(session.email || "").trim().toLowerCase();
    })
    .map(normalizeNotification);

  if (!session || !session.token) {
    currentNotifications = localList;
    refreshNotificationViews();
    return;
  }

  let remoteList = [];
  try {
    const response = await fetch(`${API_BASE_URL}/orders/notifications?limit=25`, {
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

  currentNotifications = merged;
  refreshNotificationViews();
}

async function loadSecurityCenter() {
  const session = readSession();
  const localPrefs = loadSecurityPreferencesLocal();
  const localActivity = loadAuthActivityLocal();
  if (!session || !session.token) {
    applySecurityPreferences(localPrefs);
    renderAuthActivity(localActivity);
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/security`, {
      headers: {
        Authorization: `Bearer ${session.token}`
      }
    });
    if (!response.ok) {
      applySecurityPreferences(localPrefs);
      renderAuthActivity(localActivity);
      return;
    }
    const data = await response.json().catch(() => null);
    applySecurityPreferences(data && data.securityPreferences ? data.securityPreferences : localPrefs);
    renderAuthActivity(data && Array.isArray(data.recentAuthActivity) ? data.recentAuthActivity : localActivity);
  } catch (error) {
    applySecurityPreferences(localPrefs);
    renderAuthActivity(localActivity);
  }
}

async function saveSecurityPreferences() {
  const session = readSession();
  const payload = normalizeSecurityPreferences(currentSecurityPreferences);
  if (saveSecurityPreferencesBtn) {
    saveSecurityPreferencesBtn.disabled = true;
  }
  try {
    if (!session || !session.token) {
      applySecurityPreferences(payload);
      alert("Security settings saved locally.");
      return;
    }
    const response = await fetch(`${API_BASE_URL}/auth/security-preferences`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Unable to save security settings.");
    }
    applySecurityPreferences(data.securityPreferences || payload);
    renderAuthActivity(Array.isArray(data.recentAuthActivity) ? data.recentAuthActivity : currentAuthActivity);
    alert(data.message || "Security settings saved.");
  } catch (error) {
    applySecurityPreferences(payload);
    alert(error.message || "Security settings saved locally.");
  } finally {
    if (saveSecurityPreferencesBtn) {
      saveSecurityPreferencesBtn.disabled = false;
    }
  }
}

async function changePassword(event) {
  event.preventDefault();
  const currentPassword = String(currentPasswordInput && currentPasswordInput.value ? currentPasswordInput.value : "").trim();
  const newPassword = String(newPasswordInput && newPasswordInput.value ? newPasswordInput.value : "").trim();
  const confirmPassword = String(confirmPasswordInput && confirmPasswordInput.value ? confirmPasswordInput.value : "").trim();
  if (!currentPassword || !newPassword || !confirmPassword) {
    alert("Fill in current password, new password, and confirm password.");
    return;
  }
  if (newPassword.length < 6) {
    alert("New password must be at least 6 characters long.");
    return;
  }
  if (newPassword !== confirmPassword) {
    alert("New password and confirm password do not match.");
    return;
  }

  const session = readSession();
  if (!session || !session.token) {
    alert("Backend login is required to change your password.");
    return;
  }
  if (changePasswordBtn) {
    changePasswordBtn.disabled = true;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Unable to change password.");
    }
    if (data && data.user) {
      updateSessionFromUserPayload(data.user);
    }
    if (data && data.token) {
      const latestSession = readSession() || {};
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        ...latestSession,
        token: data.token
      }));
    }
    renderAuthActivity(Array.isArray(data.recentAuthActivity) ? data.recentAuthActivity : currentAuthActivity);
    if (changePasswordForm) {
      changePasswordForm.reset();
    }
    alert(data.message || "Password updated successfully.");
  } catch (error) {
    alert(error.message || "Unable to change password.");
  } finally {
    if (changePasswordBtn) {
      changePasswordBtn.disabled = false;
    }
  }
}

async function logoutAllSessions() {
  const session = readSession();
  if (!session || !session.token) {
    alert("You are already signed out.");
    return;
  }
  const confirmed = window.confirm("This will sign out your account from every device. Continue?");
  if (!confirmed) {
    return;
  }
  if (logoutAllSessionsBtn) {
    logoutAllSessionsBtn.disabled = true;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout-all`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.token}`
      }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Unable to sign out all sessions.");
    }
    renderAuthActivity(Array.isArray(data.recentAuthActivity) ? data.recentAuthActivity : currentAuthActivity);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(SECURITY_PREFERENCES_STORAGE_KEY);
      localStorage.removeItem(AUTH_ACTIVITY_STORAGE_KEY);
    } catch (error) {
      return;
    }
    alert(data.message || "All sessions signed out.");
    window.location.href = "auth.html";
  } catch (error) {
    alert(error.message || "Unable to sign out all sessions.");
  } finally {
    if (logoutAllSessionsBtn) {
      logoutAllSessionsBtn.disabled = false;
    }
  }
}

async function sendTestNotification() {
  const session = readSession();
  if (sendTestNotificationBtn) {
    sendTestNotificationBtn.disabled = true;
  }

  try {
    if (!session || !session.token) {
      throw new Error("LOCAL_ONLY");
    }
    const response = await fetch(`${API_BASE_URL}/auth/test-notification`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.token}`
      }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Unable to send test notification.");
    }
    await loadOrderNotifications();
    alert(data.message || "Test notification sent.");
  } catch (error) {
    addLocalTestNotification();
    await loadOrderNotifications();
    const message = error && error.message && error.message !== "LOCAL_ONLY"
      ? `${error.message} A local test notification was added instead.`
      : "Backend unavailable. A local test notification was added instead.";
    alert(message);
  } finally {
    if (sendTestNotificationBtn) {
      sendTestNotificationBtn.disabled = false;
    }
  }
}

function generateLocalOtpCode() {
  return String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
}

function updateSessionPhoneVerification(phoneVerification) {
  const session = readSession();
  if (!session) {
    return;
  }
  const nextSession = {
    ...session,
    phoneVerification: normalizePhoneVerificationState(phoneVerification || defaultPhoneVerificationState())
  };
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
  } catch (error) {
    return;
  }
}

async function requestPhoneVerification() {
  const session = readSession();
  const mobile = normalizePhone(session && session.mobile ? session.mobile : phoneInput.value);
  if (!/^\+?[1-9]\d{7,14}$/.test(mobile)) {
    alert("Add a valid phone number in your account before requesting verification.");
    return;
  }
  if (currentPhoneVerification.isLocked) {
    alert(`Verification is locked until ${formatDateTime(currentPhoneVerification.lockedUntil)}.`);
    return;
  }
  if (currentPhoneVerification.resendAvailableAt && new Date(currentPhoneVerification.resendAvailableAt).getTime() > Date.now()) {
    alert(`Please wait ${formatCountdown(currentPhoneVerification.resendAvailableAt)} before requesting another code.`);
    return;
  }
  if (requestPhoneVerificationBtn) {
    requestPhoneVerificationBtn.disabled = true;
  }

  try {
    if (!session || !session.token) {
      throw new Error("LOCAL_ONLY");
    }
    const response = await fetch(`${API_BASE_URL}/auth/phone-verification/request`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.token}`
      }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (data && data.phoneVerification) {
        const nextState = normalizePhoneVerificationState(data.phoneVerification);
        applyPhoneVerificationState(nextState);
        updateSessionPhoneVerification(nextState);
      }
      const serverError = new Error(data.message || "Unable to request phone verification.");
      serverError.fromServer = true;
      throw serverError;
    }
    const nextState = normalizePhoneVerificationState(data.phoneVerification || defaultPhoneVerificationState());
    applyPhoneVerificationState(nextState);
    updateSessionPhoneVerification(nextState);
    if (data.otpPreview) {
      alert(`Verification code sent. Demo OTP: ${data.otpPreview}`);
    } else {
      alert(data.message || "Verification code sent.");
    }
    if (phoneVerificationCodeInput) {
      phoneVerificationCodeInput.focus();
    }
  } catch (error) {
    if (error && error.fromServer) {
      alert(error.message);
      return;
    }
    const otpCode = generateLocalOtpCode();
    const nowIso = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    saveLocalPhoneVerificationPatch({
      pendingCode: otpCode,
      pendingExpiresAt: expiresAt,
      lastRequestedAt: nowIso,
      failedAttempts: 0,
      lockedUntil: null
    });
    const localState = loadLocalPhoneVerification();
    applyPhoneVerificationState(localState);
    updateSessionPhoneVerification(localState);
    alert(`Backend unavailable. Demo OTP: ${otpCode}`);
    if (phoneVerificationCodeInput) {
      phoneVerificationCodeInput.focus();
    }
  }
}

async function confirmPhoneVerification() {
  const code = String(phoneVerificationCodeInput && phoneVerificationCodeInput.value ? phoneVerificationCodeInput.value : "").trim();
  if (!/^\d{6}$/.test(code)) {
    alert("Enter the 6-digit verification code.");
    return;
  }
  if (currentPhoneVerification.isLocked) {
    alert(`Verification is locked until ${formatDateTime(currentPhoneVerification.lockedUntil)}.`);
    return;
  }
  if (confirmPhoneVerificationBtn) {
    confirmPhoneVerificationBtn.disabled = true;
  }

  const session = readSession();
  try {
    if (!session || !session.token) {
      throw new Error("LOCAL_ONLY");
    }
    const response = await fetch(`${API_BASE_URL}/auth/phone-verification/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`
      },
      body: JSON.stringify({ code })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (data && data.phoneVerification) {
        const nextState = normalizePhoneVerificationState(data.phoneVerification);
        applyPhoneVerificationState(nextState);
        updateSessionPhoneVerification(nextState);
      }
      const serverError = new Error(data.message || "Unable to verify phone code.");
      serverError.fromServer = true;
      throw serverError;
    }
    const nextState = normalizePhoneVerificationState(data.phoneVerification || defaultPhoneVerificationState());
    applyPhoneVerificationState(nextState);
    updateSessionPhoneVerification(nextState);
    if (phoneVerificationCodeInput) {
      phoneVerificationCodeInput.value = "";
    }
    alert(data.message || "Phone verified successfully.");
  } catch (error) {
    if (error && error.fromServer) {
      alert(error.message);
      return;
    }
    const localStore = loadPhoneVerificationStore();
    const entry = localStore[getNotificationUserKey(session)] || {};
    const pendingCode = String(entry.pendingCode || "");
    const pendingExpires = entry.pendingExpiresAt ? new Date(entry.pendingExpiresAt).getTime() : 0;
    const lockedUntil = entry.lockedUntil ? new Date(entry.lockedUntil).getTime() : 0;
    if (lockedUntil > Date.now()) {
      alert(`Verification is locked until ${formatDateTime(entry.lockedUntil)}.`);
      return;
    }
    if (!pendingCode || pendingExpires <= Date.now()) {
      alert("No active verification code. Request a new code.");
      return;
    }
    if (pendingCode !== code) {
      const failedAttempts = (Number(entry.failedAttempts || 0) || 0) + 1;
      if (failedAttempts >= PHONE_VERIFICATION_MAX_ATTEMPTS) {
        const lockIso = new Date(Date.now() + PHONE_VERIFICATION_LOCK_MS).toISOString();
        saveLocalPhoneVerificationPatch({
          reset: true,
          failedAttempts: PHONE_VERIFICATION_MAX_ATTEMPTS,
          lockedUntil: lockIso
        });
        const lockedState = loadLocalPhoneVerification();
        applyPhoneVerificationState(lockedState);
        updateSessionPhoneVerification(lockedState);
        alert("Too many incorrect attempts. Phone verification is temporarily locked.");
        return;
      }
      saveLocalPhoneVerificationPatch({
        failedAttempts
      });
      const retryState = loadLocalPhoneVerification();
      applyPhoneVerificationState(retryState);
      updateSessionPhoneVerification(retryState);
      alert(`Invalid verification code. Attempts left: ${retryState.remainingAttempts}.`);
      return;
    }
    saveLocalPhoneVerificationPatch({
      reset: true,
      verifiedAt: new Date().toISOString(),
      failedAttempts: 0,
      lockedUntil: null
    });
    const localState = loadLocalPhoneVerification();
    applyPhoneVerificationState(localState);
    updateSessionPhoneVerification(localState);
    if (phoneVerificationCodeInput) {
      phoneVerificationCodeInput.value = "";
    }
    alert("Phone verified in local mode.");
  }
}

function setActivePanel(panelName) {
  menuButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.panel === panelName);
  });

  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === `panel-${panelName}`);
  });
}

function applyProfile(profile) {
  fullNameInput.value = profile.fullName || "";
  emailInput.value = profile.email || "";
  phoneInput.value = profile.phone || "";
  companyInput.value = profile.company || "";
}

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const profile = raw ? JSON.parse(raw) : null;
    if (!profile) {
      return;
    }
    applyProfile(profile);
  } catch (error) {
    return;
  }
}

function updateAdminLink(session) {
  if (!adminDashboardLink) {
    return;
  }
  const isAdmin = session && session.role === "admin";
  adminDashboardLink.hidden = !isAdmin;
  if (adminQuickCard) {
    adminQuickCard.hidden = !isAdmin;
  }
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
    phoneVerification: normalizePhoneVerificationState(user.phoneVerification || defaultPhoneVerificationState()),
    notificationPreferences: normalizeNotificationPreferences(user.notificationPreferences || defaultNotificationPreferences()),
    securityPreferences: normalizeSecurityPreferences(user.securityPreferences || defaultSecurityPreferences())
  };
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
  } catch (error) {
    return;
  }
}

async function syncProfileFromBackend() {
  const session = readSession();
  if (!session || !session.token) {
    return;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${session.token}`
      }
    });
  } catch (error) {
    return;
  }

  if (!response.ok) {
    return;
  }

  const user = await response.json().catch(() => null);
  if (!user) {
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
    phoneVerification: normalizePhoneVerificationState(user.phoneVerification || defaultPhoneVerificationState()),
    notificationPreferences: normalizeNotificationPreferences(user.notificationPreferences),
    securityPreferences: normalizeSecurityPreferences(user.securityPreferences || defaultSecurityPreferences())
  };

  const profile = {
    fullName: user.name || "",
    email: user.email || "",
    phone: user.mobile || "",
    company: "",
    address: user.address || ""
  };

  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    saveNotificationPreferencesLocal(user.notificationPreferences || defaultNotificationPreferences());
    saveLocalPhoneVerificationPatch({
      clearVerified: !user.phoneVerification || user.phoneVerification.isVerified !== true,
      verifiedAt: user && user.phoneVerification && user.phoneVerification.isVerified ? user.phoneVerification.verifiedAt : ""
    });
  } catch (error) {
    return;
  }

  applyProfile(profile);
  applyNotificationPreferences(user.notificationPreferences || defaultNotificationPreferences());
  applySecurityPreferences(user.securityPreferences || defaultSecurityPreferences());
  applyPhoneVerificationState(user.phoneVerification || defaultPhoneVerificationState());
}

async function saveProfile(event) {
  event.preventDefault();
  const payload = {
    fullName: fullNameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
    company: companyInput.value.trim()
  };

  const session = readSession();
  if (!session || !session.token) {
    const mobileChanged = normalizePhone(payload.phone) !== normalizePhone(session && session.mobile ? session.mobile : "");
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      if (session) {
        const nextSession = {
          ...session,
          name: payload.fullName || session.name,
          email: payload.email || session.email,
          mobile: payload.phone || session.mobile
        };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
      }
      if (mobileChanged) {
        saveLocalPhoneVerificationPatch({ reset: true, clearVerified: true });
        applyPhoneVerificationState(loadLocalPhoneVerification());
        currentNotificationPreferences = normalizeNotificationPreferences({
          ...currentNotificationPreferences,
          smsEnabled: false,
          whatsappEnabled: false
        });
        applyNotificationPreferences(currentNotificationPreferences);
      }
      alert("Profile saved locally.");
    } catch (error) {
      alert("Unable to save profile in this browser.");
    }
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`
      },
      body: JSON.stringify({
        name: payload.fullName,
        email: payload.email,
        mobile: payload.phone,
        address: session.address || "Address pending"
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Unable to save profile.");
    }
    if (data && data.user) {
      updateSessionFromUserPayload(data.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      applyProfile(payload);
      applyNotificationPreferences(data.user.notificationPreferences || currentNotificationPreferences);
      applyPhoneVerificationState(data.user.phoneVerification || defaultPhoneVerificationState());
    }
    alert(data.message || "Profile saved successfully.");
  } catch (error) {
    alert(error.message || "Unable to save profile.");
  }
}

menuButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const panelName = String(button.dataset.panel || "").trim();
    if (!panelName) {
      return;
    }
    setActivePanel(panelName);
  });
});

profileForm.addEventListener("submit", saveProfile);

if (twoFactorToggle) {
  twoFactorToggle.addEventListener("click", () => {
    applySecurityPreferences({
      ...currentSecurityPreferences,
      twoFactorEnabled: !currentSecurityPreferences.twoFactorEnabled
    });
  });
}
if (alertsToggle) {
  alertsToggle.addEventListener("click", () => {
    applySecurityPreferences({
      ...currentSecurityPreferences,
      loginAlertsEnabled: !currentSecurityPreferences.loginAlertsEnabled
    });
  });
}
if (saveSecurityPreferencesBtn) {
  saveSecurityPreferencesBtn.addEventListener("click", saveSecurityPreferences);
}
if (changePasswordForm) {
  changePasswordForm.addEventListener("submit", changePassword);
}
if (logoutAllSessionsBtn) {
  logoutAllSessionsBtn.addEventListener("click", logoutAllSessions);
}
if (refreshAuthActivityBtn) {
  refreshAuthActivityBtn.addEventListener("click", loadSecurityCenter);
}
if (accountNotificationsList) {
  accountNotificationsList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action='toggle-read'][data-notification-key]");
    if (!button) {
      return;
    }
    const key = String(button.getAttribute("data-notification-key") || "").trim();
    const item = currentNotifications.find((notification) => getNotificationStateKey(notification) === key);
    if (!item) {
      return;
    }
    setNotificationRead(item, !isNotificationRead(item));
    refreshNotificationViews();
  });
}
if (markAllNotificationsReadBtn) {
  markAllNotificationsReadBtn.addEventListener("click", () => {
    currentNotifications.forEach((item) => setNotificationRead(item, true));
    refreshNotificationViews();
  });
}
if (notificationStatusFilter) {
  notificationStatusFilter.addEventListener("change", () => {
    currentNotificationFilters.status = String(notificationStatusFilter.value || "all").trim().toLowerCase();
    refreshNotificationViews();
  });
}
if (notificationTypeFilter) {
  notificationTypeFilter.addEventListener("change", () => {
    currentNotificationFilters.type = String(notificationTypeFilter.value || "all").trim().toLowerCase();
    refreshNotificationViews();
  });
}
if (resetNotificationFiltersBtn) {
  resetNotificationFiltersBtn.addEventListener("click", resetNotificationFilters);
}
if (prefEmailEnabledToggle) {
  prefEmailEnabledToggle.addEventListener("click", () => togglePreferenceValue("emailEnabled"));
}
if (prefSmsEnabledToggle) {
  prefSmsEnabledToggle.addEventListener("click", () => togglePreferenceValue("smsEnabled"));
}
if (prefWhatsappEnabledToggle) {
  prefWhatsappEnabledToggle.addEventListener("click", () => togglePreferenceValue("whatsappEnabled"));
}
if (prefSmsProviderSelect) {
  prefSmsProviderSelect.addEventListener("change", () => {
    setProviderValue("smsProvider", String(prefSmsProviderSelect.value || "twilio").trim());
  });
}
if (prefWhatsappProviderSelect) {
  prefWhatsappProviderSelect.addEventListener("change", () => {
    setProviderValue("whatsappProvider", String(prefWhatsappProviderSelect.value || "twilio").trim());
  });
}
if (prefOrderShippedToggle) {
  prefOrderShippedToggle.addEventListener("click", () => togglePreferenceValue("orderShipped"));
}
if (prefOrderDeliveredToggle) {
  prefOrderDeliveredToggle.addEventListener("click", () => togglePreferenceValue("orderDelivered"));
}
if (prefOrderCancelledToggle) {
  prefOrderCancelledToggle.addEventListener("click", () => togglePreferenceValue("orderCancelled"));
}
if (saveNotificationPreferencesBtn) {
  saveNotificationPreferencesBtn.addEventListener("click", saveNotificationPreferences);
}
if (sendTestNotificationBtn) {
  sendTestNotificationBtn.addEventListener("click", sendTestNotification);
}
if (requestPhoneVerificationBtn) {
  requestPhoneVerificationBtn.addEventListener("click", requestPhoneVerification);
}
if (confirmPhoneVerificationBtn) {
  confirmPhoneVerificationBtn.addEventListener("click", confirmPhoneVerification);
}
if (phoneVerificationCodeInput) {
  phoneVerificationCodeInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      confirmPhoneVerification();
    }
  });
}
signOutBtn.addEventListener("click", () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SECURITY_PREFERENCES_STORAGE_KEY);
    localStorage.removeItem(AUTH_ACTIVITY_STORAGE_KEY);
  } catch (error) {
    return;
  }
  window.location.href = "auth.html";
});

requireAuthSession();
loadProfile();
syncProfileFromBackend();
loadNotificationPreferences();
loadSecurityCenter();
loadOrderNotifications();
syncNotificationFilterControls();
setActivePanel("overview");

function requireAuthSession() {
  const session = readSession();
  if (!session || (!session.email && !session.token)) {
    window.location.href = "auth.html";
  }
  updateAdminLink(session);
}
