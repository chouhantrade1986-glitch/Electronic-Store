const AUTH_STORAGE_KEY = "electromart_auth_v1";
const PROFILE_STORAGE_KEY = "electromart_profile_v1";
const LANGUAGE_STORAGE_KEY = "electromart_lang_v1";
const LOCAL_USERS_KEY = "electromart_local_users_v1";
const API_BASE_OVERRIDE_KEY = "electromart_api_base_url";
const OFFLINE_DEMO_STORAGE_KEY = "electromart_allow_offline_demo";
const OFFLINE_ADMIN_EMAIL = "admin@electromart.com";
const OFFLINE_ADMIN_MOBILE = "9999999999";
const OFFLINE_ADMIN_PASSWORD = "Admin@123";
const OFFLINE_CUSTOMER_EMAIL = "customer@electromart.com";
const OFFLINE_CUSTOMER_MOBILE = "8888888888";
const OFFLINE_CUSTOMER_PASSWORD = "Customer@123";
const LOCAL_PASSWORD_HASH_PREFIX = "sha256:";
const AUTH_TOAST_STACK_ID = "authToastStack";

const signinTab = document.getElementById("signinTab");
const signupTab = document.getElementById("signupTab");
const signinForm = document.getElementById("signinForm");
const signupForm = document.getElementById("signupForm");
const authMessage = document.getElementById("authMessage");

const signinMethod = document.getElementById("signinMethod");
const signinIdentifier = document.getElementById("signinIdentifier");
const signinPassword = document.getElementById("signinPassword");
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const generateOtpBtn = document.getElementById("generateOtpBtn");
const signinOtp = document.getElementById("signinOtp");
const signinOtpAssist = document.getElementById("signinOtpAssist");
const signinOtpDestination = document.getElementById("signinOtpDestination");
const signinOtpTimer = document.getElementById("signinOtpTimer");

const resetForm = document.getElementById("resetForm");
const resetMethod = document.getElementById("resetMethod");
const resetIdentifier = document.getElementById("resetIdentifier");
const resetPassword = document.getElementById("resetPassword");
const backToSigninBtn = document.getElementById("backToSigninBtn");
const generateResetOtpBtn = document.getElementById("generateResetOtpBtn");
const resetOtp = document.getElementById("resetOtp");
const resetOtpAssist = document.getElementById("resetOtpAssist");
const resetOtpDestination = document.getElementById("resetOtpDestination");
const resetOtpTimer = document.getElementById("resetOtpTimer");

const signupName = document.getElementById("signupName");
const signupEmail = document.getElementById("signupEmail");
const signupMobile = document.getElementById("signupMobile");
const signupPassword = document.getElementById("signupPassword");
const signupAddress = document.getElementById("signupAddress");
const signupOtpMethod = document.getElementById("signupOtpMethod");
const generateSignupOtpBtn = document.getElementById("generateSignupOtpBtn");
const signupOtp = document.getElementById("signupOtp");
const signupOtpAssist = document.getElementById("signupOtpAssist");
const signupOtpDestination = document.getElementById("signupOtpDestination");
const signupOtpTimer = document.getElementById("signupOtpTimer");
const languageSelect = document.getElementById("languageSelect");
const authHeading = document.getElementById("authHeading");
const authSubheading = document.getElementById("authSubheading");
const adminAccessCard = document.getElementById("adminAccessCard");
const adminAccessTitle = document.getElementById("adminAccessTitle");
const adminAccessCopy = document.getElementById("adminAccessCopy");
const adminAccessPrimaryLink = document.getElementById("adminAccessPrimaryLink");
const adminAccessSecondaryLink = document.getElementById("adminAccessSecondaryLink");

const pageParams = new URLSearchParams(window.location.search);
const authMode = String(pageParams.get("mode") || "").trim().toLowerCase();
const requestedRedirect = (() => {
  const raw = String(pageParams.get("redirect") || "").trim();
  if (!raw || /^(https?:|\/\/|javascript:)/i.test(raw)) {
    return "";
  }
  if (!/^[a-z0-9\-_/?.=&.]+$/i.test(raw)) {
    return "";
  }
  return raw;
})();

let activeOtp = "";
let activeOtpTarget = "";
let activeOtpMethod = "";
let activeOtpChallengeId = "";
let signupActiveOtp = "";
let signupActiveOtpTarget = "";
let signupActiveOtpMethod = "";
let signupActiveOtpChallengeId = "";
let resetActiveOtp = "";
let resetActiveOtpTarget = "";
let resetActiveOtpMethod = "";
let resetActiveOtpChallengeId = "";
let resolvedApiBaseUrl = "";
let apiResolvePromise = null;
let apiAvailable = false;
const OTP_RESEND_FALLBACK_MS = 60 * 1000;
const OTP_EXPIRY_FALLBACK_MS = 10 * 60 * 1000;
const otpState = {
  signin: {
    challengeId: "",
    method: "",
    target: "",
    destinationMasked: "",
    expiresAt: "",
    resendAvailableAt: "",
    status: "idle",
    preview: ""
  },
  signup: {
    challengeId: "",
    method: "",
    target: "",
    destinationMasked: "",
    expiresAt: "",
    resendAvailableAt: "",
    status: "idle",
    preview: ""
  },
  reset: {
    challengeId: "",
    method: "",
    target: "",
    destinationMasked: "",
    expiresAt: "",
    resendAvailableAt: "",
    status: "idle",
    preview: ""
  }
};
let otpTickInterval = null;
let lastAuthToastKey = "";
let lastAuthToastAt = 0;

function loadLanguagePreference() {
  try {
    const value = String(localStorage.getItem(LANGUAGE_STORAGE_KEY) || "").trim().toLowerCase();
    return value || "en";
  } catch (error) {
    return "en";
  }
}

function saveLanguagePreference(lang) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, String(lang || "en").toLowerCase());
  } catch (error) {
    return;
  }
}

function setActiveView(mode) {
  const isSignin = mode === "signin";
  const isSignup = mode === "signup";
  const isReset = mode === "reset";
  signinTab.classList.toggle("active", isSignin || isReset);
  signupTab.classList.toggle("active", isSignup);
  signinForm.classList.toggle("active", isSignin);
  signupForm.classList.toggle("active", isSignup);
  resetForm.classList.toggle("active", isReset);
  setMessage("");
}

function ensureAuthToastStack() {
  const existing = document.getElementById(AUTH_TOAST_STACK_ID);
  if (existing) {
    return existing;
  }
  const stack = document.createElement("section");
  stack.id = AUTH_TOAST_STACK_ID;
  stack.className = "em-toast-stack";
  stack.setAttribute("aria-live", "polite");
  stack.setAttribute("aria-atomic", "false");
  document.body.appendChild(stack);
  return stack;
}

function showAuthToast({ title = "", message = "", tone = "error", timeoutMs = 4200 } = {}) {
  const safeMessage = String(message || "").trim();
  if (!safeMessage) {
    return;
  }

  const toastKey = `${String(tone || "error").trim().toLowerCase()}:${safeMessage}`;
  const now = Date.now();
  if (toastKey === lastAuthToastKey && now - lastAuthToastAt < 1200) {
    return;
  }
  lastAuthToastKey = toastKey;
  lastAuthToastAt = now;

  const stack = ensureAuthToastStack();
  const safeTone = ["success", "error", "warning", "info"].includes(String(tone || "").trim().toLowerCase())
    ? String(tone || "error").trim().toLowerCase()
    : "error";

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
  }, Math.max(1200, Number(timeoutMs || 0)));
}

function setMessage(text, isError = false, options = {}) {
  const normalized = String(text || "");
  authMessage.textContent = normalized;
  authMessage.classList.toggle("error", isError);
  if (!normalized.trim()) {
    return;
  }
  if (isError) {
    showAuthToast({
      title: String(options.title || "Action required").trim(),
      message: normalized,
      tone: String(options.tone || "error").trim().toLowerCase(),
      timeoutMs: Number(options.timeoutMs || 4200)
    });
  }
}

function readSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    return null;
  }
}

function getPostAuthDestination(user = {}) {
  const role = String(user && user.role ? user.role : "").trim().toLowerCase();
  if (requestedRedirect) {
    const wantsAdmin = requestedRedirect.includes("admin-dashboard") || requestedRedirect.includes("admin.html");
    if (!wantsAdmin || role === "admin") {
      return requestedRedirect;
    }
  }
  if (authMode === "admin" && role === "admin") {
    return "admin-dashboard.html";
  }
  return "account.html";
}

function navigateAfterAuth(user) {
  window.location.href = getPostAuthDestination(user);
}

function applyAuthModeUi() {
  if (!adminAccessCard || !authHeading || !authSubheading) {
    return;
  }

  const session = readSession();
  const isAdminMode = authMode === "admin";
  adminAccessCard.hidden = !isAdminMode;

  if (!isAdminMode) {
    authHeading.textContent = "Sign in or create account";
    authSubheading.textContent = "Access your orders, saved profile, and account settings.";
    return;
  }

  authHeading.textContent = "Admin sign in";
  authSubheading.textContent = "Use an admin account to open Seller Central and manage store operations.";
  signupTab.hidden = true;
  if (signupForm.classList.contains("active")) {
    setActiveView("signin");
  }

  if (signinIdentifier && !signinIdentifier.value) {
    signinIdentifier.value = OFFLINE_ADMIN_EMAIL;
  }

  if (session && String(session.role || "").toLowerCase() === "admin") {
    adminAccessTitle.textContent = "Admin session detected";
    adminAccessCopy.textContent = "Your admin session is already active. Open the dashboard directly or switch user if needed.";
    adminAccessPrimaryLink.href = "admin-dashboard.html";
    adminAccessPrimaryLink.textContent = "Open Admin Dashboard";
    adminAccessSecondaryLink.href = "account.html";
    adminAccessSecondaryLink.textContent = "Admin Account";
    return;
  }

  adminAccessTitle.textContent = "Seller Central access";
  adminAccessCopy.textContent = "Sign in with your admin account. Customer and demo accounts remain unchanged.";
  adminAccessPrimaryLink.href = "admin.html";
  adminAccessPrimaryLink.textContent = "Admin Panel Home";
  adminAccessSecondaryLink.href = "index.html";
  adminAccessSecondaryLink.textContent = "Back to Store";
}

function saveSession(payload) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    return;
  }
}

function saveProfile(payload) {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    return;
  }
}

function isOfflineDemoEnabled() {
  if (window.ELECTROMART_ALLOW_OFFLINE_DEMO === true) {
    return true;
  }
  try {
    const raw = String(localStorage.getItem(OFFLINE_DEMO_STORAGE_KEY) || "").trim().toLowerCase();
    return ["1", "true", "yes", "on", "enabled"].includes(raw);
  } catch (error) {
    return false;
  }
}

function getOfflineDemoHelpText() {
  return `Start backend on port 4000, or explicitly enable offline demo mode with localStorage key "${OFFLINE_DEMO_STORAGE_KEY}".`;
}

function buildOtpFeedback(data, method) {
  const channelLabel = method === "mobile" ? "mobile number" : method;
  const base = String(data && data.message ? data.message : `OTP sent to your ${channelLabel}.`).trim();
  if (data && data.otpPreview) {
    return `${base} Demo OTP: ${data.otpPreview}`;
  }
  if (data && data.destinationMasked) {
    return `${base} Sent to ${data.destinationMasked}.`;
  }
  return base;
}

function getOtpUiConfig(formKey) {
  if (formKey === "reset") {
    return {
      state: otpState.reset,
      button: generateResetOtpBtn,
      assist: resetOtpAssist,
      destination: resetOtpDestination,
      timer: resetOtpTimer
    };
  }
  if (formKey === "signup") {
    return {
      state: otpState.signup,
      button: generateSignupOtpBtn,
      assist: signupOtpAssist,
      destination: signupOtpDestination,
      timer: signupOtpTimer
    };
  }
  return {
    state: otpState.signin,
    button: generateOtpBtn,
    assist: signinOtpAssist,
    destination: signinOtpDestination,
    timer: signinOtpTimer
  };
}

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function maskIdentifier(identifier, method) {
  const value = String(identifier || "").trim();
  if (!value) {
    return "";
  }
  if (method === "mobile") {
    const digits = value.replace(/\D+/g, "");
    if (digits.length <= 4) {
      return digits;
    }
    return `${"*".repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
  }
  const [localPart, domain] = value.toLowerCase().split("@");
  if (!localPart || !domain) {
    return value;
  }
  if (localPart.length <= 2) {
    return `${localPart[0] || "*"}*@${domain}`;
  }
  return `${localPart.slice(0, 2)}${"*".repeat(Math.max(2, localPart.length - 2))}@${domain}`;
}

function clearOtpUiState(formKey, options = {}) {
  const { keepContact = false, status = "idle", message = "" } = options;
  const { state } = getOtpUiConfig(formKey);
  state.challengeId = "";
  if (!keepContact) {
    state.method = "";
    state.target = "";
    state.destinationMasked = "";
  }
  state.expiresAt = "";
  state.resendAvailableAt = "";
  state.status = status;
  state.preview = message;
  renderOtpUi(formKey);
}

function updateOtpUiState(formKey, nextState = {}) {
  const { state } = getOtpUiConfig(formKey);
  Object.assign(state, nextState);
  renderOtpUi(formKey);
}

function ensureOtpTicker() {
  if (otpTickInterval) {
    return;
  }
  otpTickInterval = window.setInterval(() => {
    renderOtpUi("signin");
    renderOtpUi("signup");
    renderOtpUi("reset");
  }, 1000);
}

function renderOtpUi(formKey) {
  const { state, button, assist, destination, timer } = getOtpUiConfig(formKey);
  if (!button || !assist || !destination || !timer) {
    return;
  }

  let status = String(state.status || "idle");
  let challengeId = String(state.challengeId || "").trim();
  const now = Date.now();
  const resendAt = state.resendAvailableAt ? new Date(state.resendAvailableAt).getTime() : NaN;
  const expiresAt = state.expiresAt ? new Date(state.expiresAt).getTime() : NaN;
  const resendRemainingMs = Number.isFinite(resendAt) ? Math.max(0, resendAt - now) : 0;
  const expiryRemainingMs = Number.isFinite(expiresAt) ? Math.max(0, expiresAt - now) : 0;

  if (challengeId && Number.isFinite(expiresAt) && expiresAt <= now) {
    status = "expired";
    state.status = "expired";
    state.challengeId = "";
    challengeId = "";
  }

  if (status === "idle" && !challengeId && !state.destinationMasked) {
    assist.hidden = true;
    destination.textContent = "";
    timer.textContent = "";
    button.textContent = "Send OTP";
    return;
  }

  assist.hidden = false;

  if (status === "sent" || (challengeId && status !== "expired")) {
    destination.textContent = state.destinationMasked
      ? `OTP sent to ${state.destinationMasked}.`
      : "OTP sent. Enter the 6-digit code to continue.";
    const timerParts = [];
    if (expiryRemainingMs > 0) {
      timerParts.push(`Expires in ${formatCountdown(expiryRemainingMs)}.`);
    }
    if (resendRemainingMs > 0) {
      timerParts.push(`Resend available in ${formatCountdown(resendRemainingMs)}.`);
    } else {
      timerParts.push("You can request a fresh OTP now.");
    }
    if (state.preview) {
      timerParts.push(`Demo preview available in the status banner.`);
    }
    timer.textContent = timerParts.join(" ");
  } else if (status === "expired") {
    destination.textContent = state.destinationMasked
      ? `OTP for ${state.destinationMasked} expired.`
      : "Your OTP expired.";
    timer.textContent = "Send a new OTP to continue.";
  } else if (status === "locked") {
    destination.textContent = state.destinationMasked
      ? `Too many incorrect OTP attempts for ${state.destinationMasked}.`
      : "Too many incorrect OTP attempts.";
    timer.textContent = "Request a fresh OTP to continue.";
  } else if (status === "error") {
    destination.textContent = state.preview || "Unable to send OTP right now.";
    timer.textContent = resendRemainingMs > 0 ? `Try again in ${formatCountdown(resendRemainingMs)}.` : "";
  } else {
    destination.textContent = state.destinationMasked
      ? `Ready to send OTP to ${state.destinationMasked}.`
      : "Ready to send OTP.";
    timer.textContent = "";
  }

  if (resendRemainingMs > 0) {
    button.disabled = true;
    button.textContent = `Resend OTP in ${formatCountdown(resendRemainingMs)}`;
  } else {
    button.disabled = false;
    button.textContent = status === "idle" && !state.destinationMasked ? "Send OTP" : "Resend OTP";
  }
}

function seedOtpUiState(formKey, method, target, responseData = {}) {
  updateOtpUiState(formKey, {
    challengeId: String(responseData.challengeId || "").trim(),
    method,
    target,
    destinationMasked: String(responseData.destinationMasked || maskIdentifier(target, method)).trim(),
    expiresAt: String(responseData.expiresAt || new Date(Date.now() + OTP_EXPIRY_FALLBACK_MS).toISOString()),
    resendAvailableAt: String(responseData.resendAvailableAt || new Date(Date.now() + OTP_RESEND_FALLBACK_MS).toISOString()),
    status: "sent",
    preview: responseData.otpPreview ? "preview" : ""
  });
}

function bindOtpFieldReset(formKey, elements) {
  elements.forEach((element) => {
    if (!element) {
      return;
    }
    element.addEventListener("input", () => clearOtpUiState(formKey));
    element.addEventListener("change", () => clearOtpUiState(formKey));
  });
}

function normalizeIdentifier(value, method) {
  const raw = String(value || "").trim();
  if (method === "mobile") {
    return raw.replace(/\s+/g, "");
  }
  return raw.toLowerCase();
}

function isValidIdentifier(identifier, method) {
  if (method === "mobile") {
    return /^(\+?\d{10,15})$/.test(identifier);
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
}

function createOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function mapUserToProfile(user) {
  return {
    fullName: user.name || "",
    email: user.email || "",
    phone: user.mobile || "",
    company: "",
    address: user.address || ""
  };
}

async function hashLocalPassword(password) {
  const value = String(password || "");
  if (window.crypto && window.crypto.subtle && typeof TextEncoder !== "undefined") {
    const buffer = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    const hashHex = Array.from(new Uint8Array(buffer))
      .map((item) => item.toString(16).padStart(2, "0"))
      .join("");
    return `${LOCAL_PASSWORD_HASH_PREFIX}${hashHex}`;
  }

  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `${LOCAL_PASSWORD_HASH_PREFIX}${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

async function normalizeStoredLocalUser(user) {
  const nextUser = user && typeof user === "object" ? { ...user } : {};
  let changed = false;

  if (!String(nextUser.passwordHash || "").trim() && String(nextUser.password || "")) {
    nextUser.passwordHash = await hashLocalPassword(nextUser.password);
    changed = true;
  }
  if (Object.prototype.hasOwnProperty.call(nextUser, "password")) {
    delete nextUser.password;
    changed = true;
  }

  return {
    user: nextUser,
    changed
  };
}

async function loadLocalUsers() {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(parsed) ? parsed : [];
    let changed = false;
    const normalizedUsers = [];
    for (const entry of list) {
      const normalized = await normalizeStoredLocalUser(entry);
      normalizedUsers.push(normalized.user);
      changed = changed || normalized.changed;
    }
    if (changed) {
      saveLocalUsers(normalizedUsers);
    }
    return normalizedUsers;
  } catch (error) {
    return [];
  }
}

function saveLocalUsers(users) {
  try {
    const sanitizedUsers = Array.isArray(users)
      ? users.map((entry) => {
        const nextEntry = entry && typeof entry === "object" ? { ...entry } : {};
        if (Object.prototype.hasOwnProperty.call(nextEntry, "password")) {
          delete nextEntry.password;
        }
        return nextEntry;
      })
      : [];
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(sanitizedUsers));
  } catch (error) {
    return;
  }
}

function findLocalUserByIdentifier(users, identifier) {
  const normalized = String(identifier || "").trim().toLowerCase();
  return users.find((item) => {
    const emailMatch = String(item.email || "").toLowerCase() === normalized;
    const mobileMatch = String(item.mobile || "").toLowerCase() === normalized;
    return emailMatch || mobileMatch;
  }) || null;
}

async function verifyLocalUserPassword(user, password) {
  if (!user) {
    return false;
  }
  const expectedHash = String(user.passwordHash || "").trim();
  if (!expectedHash) {
    return false;
  }
  const actualHash = await hashLocalPassword(password);
  return actualHash === expectedHash;
}

async function ensureOfflineSeedUsers() {
  const users = await loadLocalUsers();
  const defaults = [
    {
      id: "local_admin_1",
      name: "ElectroMart Admin",
      email: OFFLINE_ADMIN_EMAIL,
      mobile: OFFLINE_ADMIN_MOBILE,
      passwordHash: await hashLocalPassword(OFFLINE_ADMIN_PASSWORD),
      address: "HQ",
      role: "admin"
    },
    {
      id: "local_customer_1",
      name: "ElectroMart Customer",
      email: OFFLINE_CUSTOMER_EMAIL,
      mobile: OFFLINE_CUSTOMER_MOBILE,
      passwordHash: await hashLocalPassword(OFFLINE_CUSTOMER_PASSWORD),
      address: "Jaipur, Rajasthan",
      role: "customer"
    }
  ];

  defaults.forEach((entry) => {
    const exists = users.some((user) => {
      const emailMatch = String(user.email || "").toLowerCase() === String(entry.email || "").toLowerCase();
      const mobileMatch = String(user.mobile || "") === String(entry.mobile || "");
      return emailMatch || mobileMatch;
    });
    if (!exists) {
      users.push(entry);
    }
  });
  saveLocalUsers(users);
}

function getApiCandidates() {
  const candidates = [];
  const fromWindow = String(window.ELECTROMART_API_BASE_URL || "").trim();
  const fromStorage = String(localStorage.getItem(API_BASE_OVERRIDE_KEY) || "").trim();
  if (fromWindow) {
    candidates.push(fromWindow);
  }
  if (fromStorage) {
    candidates.push(fromStorage);
  }

  const { protocol, hostname, port } = window.location;
  const origin = `${protocol}//${hostname}${port ? `:${port}` : ""}`;
  candidates.push(`${origin}/api`);
  candidates.push("http://localhost:4000/api");
  candidates.push("http://127.0.0.1:4000/api");

  return Array.from(new Set(candidates.map((item) => item.replace(/\/+$/, ""))));
}

async function probeApi(baseUrl) {
  try {
    const response = await fetch(`${baseUrl}/health`, { method: "GET" });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function resolveApiBaseUrl() {
  if (resolvedApiBaseUrl) {
    return resolvedApiBaseUrl;
  }
  if (apiResolvePromise) {
    return apiResolvePromise;
  }

  apiResolvePromise = (async () => {
    const candidates = getApiCandidates();
    for (const candidate of candidates) {
      const ok = await probeApi(candidate);
      if (ok) {
        resolvedApiBaseUrl = candidate;
        apiAvailable = true;
        return resolvedApiBaseUrl;
      }
    }
    apiAvailable = false;
    return "";
  })();

  try {
    return await apiResolvePromise;
  } finally {
    apiResolvePromise = null;
  }
}

async function offlineAuth(path, body) {
  await ensureOfflineSeedUsers();
  const users = await loadLocalUsers();

  if (path === "/auth/register") {
    const email = String(body.email || "").trim().toLowerCase();
    const mobile = String(body.mobile || "").trim();
    const existing = users.find((user) => user.email === email || user.mobile === mobile);
    if (existing) {
      throw new Error("User already exists with this email or mobile.");
    }

    const userRole = email === OFFLINE_ADMIN_EMAIL ? "admin" : "customer";
    const user = {
      id: `local_${Date.now()}`,
      name: String(body.name || "").trim(),
      email,
      mobile,
      passwordHash: await hashLocalPassword(String(body.password || "")),
      address: String(body.address || "").trim(),
      role: userRole
    };
    users.push(user);
    saveLocalUsers(users);

    return {
      token: `offline-token-${user.id}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        address: user.address
      }
    };
  }

  if (path === "/auth/login") {
    const identifier = String(body.emailOrMobile || "").trim().toLowerCase();
    const password = String(body.password || "");
    const user = findLocalUserByIdentifier(users, identifier);

    if (!user || !(await verifyLocalUserPassword(user, password))) {
      throw new Error("Invalid credentials.");
    }

    return {
      token: `offline-token-${user.id}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        address: user.address
      }
    };
  }

  throw new Error("Unsupported offline auth request.");
}

async function postJson(path, body) {
  let apiBaseUrl = "";
  try {
    apiBaseUrl = await resolveApiBaseUrl();
  } catch (error) {
    if (isOfflineDemoEnabled()) {
      return await offlineAuth(path, body);
    }
    throw new Error(`Auth server is unavailable. ${getOfflineDemoHelpText()}`);
  }
  if (!apiBaseUrl || !apiAvailable) {
    if (isOfflineDemoEnabled()) {
      return await offlineAuth(path, body);
    }
    throw new Error(`Auth server is unavailable. ${getOfflineDemoHelpText()}`);
  }

  let response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } catch (error) {
    apiAvailable = false;
    if (isOfflineDemoEnabled()) {
      return await offlineAuth(path, body);
    }
    throw new Error(`Auth server is unavailable. ${getOfflineDemoHelpText()}`);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    error.payload = data;
    throw error;
  }
  return data;
}

signinTab.addEventListener("click", () => setActiveView("signin"));
signupTab.addEventListener("click", () => setActiveView("signup"));
forgotPasswordBtn.addEventListener("click", () => setActiveView("reset"));
backToSigninBtn.addEventListener("click", () => setActiveView("signin"));

generateOtpBtn.addEventListener("click", async () => {
  await resolveApiBaseUrl().catch(() => "");
  if (!apiAvailable && !isOfflineDemoEnabled()) {
    setMessage(`Auth server is unavailable. ${getOfflineDemoHelpText()}`, true);
    return;
  }

  const method = signinMethod.value;
  const identifier = normalizeIdentifier(signinIdentifier.value, method);

  if (!isValidIdentifier(identifier, method)) {
    setMessage("Enter a valid email or mobile number to generate OTP.", true);
    return;
  }

  const password = signinPassword.value.trim();
  if (!password) {
    setMessage("Enter your password before requesting OTP.", true);
    return;
  }

  activeOtpTarget = identifier;
  activeOtpMethod = method;
  activeOtpChallengeId = "";
  clearOtpUiState("signin", {
    keepContact: true,
    status: "idle"
  });

  if (apiAvailable) {
    try {
      const data = await postJson("/auth/otp/request", {
        purpose: "login",
        channel: method,
        emailOrMobile: identifier,
        password
      });
      activeOtp = "";
      activeOtpChallengeId = String(data.challengeId || "").trim();
      seedOtpUiState("signin", method, identifier, data);
      setMessage(buildOtpFeedback(data, method));
    } catch (error) {
      if (error.status === 429 && error.payload && error.payload.resendAvailableAt) {
        updateOtpUiState("signin", {
          method,
          target: identifier,
          destinationMasked: maskIdentifier(identifier, method),
          resendAvailableAt: String(error.payload.resendAvailableAt),
          status: "sent"
        });
      } else {
        activeOtp = "";
        activeOtpTarget = "";
        activeOtpMethod = "";
        activeOtpChallengeId = "";
        clearOtpUiState("signin", {
          status: "error",
          message: error.message
        });
      }
      setMessage(error.message, true);
    }
    return;
  }

  activeOtp = createOtp();
  seedOtpUiState("signin", method, identifier, {
    challengeId: "offline-demo-signin",
    destinationMasked: maskIdentifier(identifier, method),
    otpPreview: activeOtp
  });
  setMessage(`OTP sent to your ${method}. Demo OTP: ${activeOtp}`);
});

generateResetOtpBtn.addEventListener("click", async () => {
  await resolveApiBaseUrl().catch(() => "");
  if (!apiAvailable && !isOfflineDemoEnabled()) {
    setMessage(`Auth server is unavailable. ${getOfflineDemoHelpText()}`, true);
    return;
  }

  const method = resetMethod.value;
  const identifier = normalizeIdentifier(resetIdentifier.value, method);
  const nextPassword = resetPassword.value.trim();

  if (!isValidIdentifier(identifier, method)) {
    setMessage(`Enter a valid ${method === "email" ? "email address" : "mobile number"}.`, true);
    return;
  }
  if (!nextPassword || nextPassword.length < 6) {
    setMessage("Enter a new password with at least 6 characters before requesting OTP.", true);
    return;
  }

  resetActiveOtpTarget = identifier;
  resetActiveOtpMethod = method;
  resetActiveOtpChallengeId = "";
  clearOtpUiState("reset", {
    keepContact: true,
    status: "idle"
  });

  if (apiAvailable) {
    try {
      const data = await postJson("/auth/password-reset/request", {
        channel: method,
        emailOrMobile: identifier
      });
      resetActiveOtp = "";
      resetActiveOtpChallengeId = String(data.challengeId || "").trim();
      seedOtpUiState("reset", method, identifier, data);
      setMessage(buildOtpFeedback(data, method));
    } catch (error) {
      if (error.status === 429 && error.payload && error.payload.resendAvailableAt) {
        updateOtpUiState("reset", {
          method,
          target: identifier,
          destinationMasked: maskIdentifier(identifier, method),
          resendAvailableAt: String(error.payload.resendAvailableAt),
          status: "sent"
        });
      } else {
        resetActiveOtp = "";
        resetActiveOtpTarget = "";
        resetActiveOtpMethod = "";
        resetActiveOtpChallengeId = "";
        clearOtpUiState("reset", {
          status: "error",
          message: error.message
        });
      }
      setMessage(error.message, true);
    }
    return;
  }

  await ensureOfflineSeedUsers();
  const users = await loadLocalUsers();
  const user = findLocalUserByIdentifier(users, identifier);
  if (!user) {
    setMessage("No account found for this email or mobile number.", true);
    return;
  }

  resetActiveOtp = createOtp();
  seedOtpUiState("reset", method, identifier, {
    challengeId: "offline-demo-reset",
    destinationMasked: maskIdentifier(identifier, method),
    otpPreview: resetActiveOtp
  });
  setMessage(`Password reset OTP sent to your ${method}. Demo OTP: ${resetActiveOtp}`);
});

generateSignupOtpBtn.addEventListener("click", async () => {
  await resolveApiBaseUrl().catch(() => "");
  if (!apiAvailable && !isOfflineDemoEnabled()) {
    setMessage(`Auth server is unavailable. ${getOfflineDemoHelpText()}`, true);
    return;
  }

  const method = signupOtpMethod.value;
  const email = signupEmail.value.trim().toLowerCase();
  const mobile = signupMobile.value.trim().replace(/\s+/g, "");
  const target = method === "email" ? email : mobile;

  if (!isValidIdentifier(target, method)) {
    setMessage(`Enter a valid ${method === "email" ? "email ID" : "mobile number"} to generate OTP.`, true);
    return;
  }

  signupActiveOtpTarget = target;
  signupActiveOtpMethod = method;
  signupActiveOtpChallengeId = "";
  clearOtpUiState("signup", {
    keepContact: true,
    status: "idle"
  });

  if (apiAvailable) {
    const name = signupName.value.trim();
    const password = signupPassword.value.trim();
    const address = signupAddress.value.trim();
    if (!name || !email || !mobile || !password || !address) {
      setMessage("Please fill all account fields before requesting OTP.", true);
      signupActiveOtp = "";
      signupActiveOtpTarget = "";
      signupActiveOtpMethod = "";
      return;
    }

    try {
      const data = await postJson("/auth/otp/request", {
        purpose: "register",
        channel: method,
        name,
        email,
        mobile,
        password,
        address
      });
      signupActiveOtp = "";
      signupActiveOtpChallengeId = String(data.challengeId || "").trim();
      seedOtpUiState("signup", method, target, data);
      setMessage(buildOtpFeedback(data, method));
    } catch (error) {
      if (error.status === 429 && error.payload && error.payload.resendAvailableAt) {
        updateOtpUiState("signup", {
          method,
          target,
          destinationMasked: maskIdentifier(target, method),
          resendAvailableAt: String(error.payload.resendAvailableAt),
          status: "sent"
        });
      } else {
        signupActiveOtp = "";
        signupActiveOtpTarget = "";
        signupActiveOtpMethod = "";
        signupActiveOtpChallengeId = "";
        clearOtpUiState("signup", {
          status: "error",
          message: error.message
        });
      }
      setMessage(error.message, true);
    }
    return;
  }

  signupActiveOtp = createOtp();
  seedOtpUiState("signup", method, target, {
    challengeId: "offline-demo-signup",
    destinationMasked: maskIdentifier(target, method),
    otpPreview: signupActiveOtp
  });
  setMessage(`OTP sent to your ${method}. Demo OTP: ${signupActiveOtp}`);
});

signinForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const method = signinMethod.value;
  const identifier = normalizeIdentifier(signinIdentifier.value, method);
  const password = signinPassword.value.trim();
  const otp = signinOtp.value.trim();

  if (!isValidIdentifier(identifier, method)) {
    setMessage("Enter a valid email or mobile number.", true);
    return;
  }

  if (!password) {
    setMessage("Enter your password.", true);
    return;
  }

  if (apiAvailable) {
    if (!activeOtpChallengeId || activeOtpMethod !== method || activeOtpTarget !== identifier) {
      setMessage("Generate OTP first for this email or mobile number.", true);
      return;
    }

    try {
      const data = await postJson("/auth/otp/verify", {
        purpose: "login",
        challengeId: activeOtpChallengeId,
        code: otp,
        emailOrMobile: identifier,
        password
      });

      saveSession({
        token: data.token,
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        mobile: data.user.mobile,
        role: data.user.role
      });
      saveProfile(mapUserToProfile(data.user));

      activeOtp = "";
      activeOtpTarget = "";
      activeOtpMethod = "";
      activeOtpChallengeId = "";
      clearOtpUiState("signin");
      navigateAfterAuth(data.user);
    } catch (error) {
      if (error.status === 429 || /request a new otp|expired|no longer active/i.test(String(error.message || ""))) {
        activeOtpChallengeId = "";
        updateOtpUiState("signin", {
          challengeId: "",
          status: error.status === 429 ? "locked" : "expired"
        });
      }
      setMessage(error.message, true);
    }
    return;
  }

  if (!activeOtp || activeOtpMethod !== method || activeOtpTarget !== identifier) {
    setMessage("Generate OTP first for this email or mobile number.", true);
    return;
  }

  if (!/^\d{6}$/.test(otp) || otp !== activeOtp) {
    setMessage("Invalid OTP. Please try again.", true);
    return;
  }

  try {
    const data = await postJson("/auth/login", {
      emailOrMobile: identifier,
      password
    });

    saveSession({
      token: data.token,
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      mobile: data.user.mobile,
      role: data.user.role
    });
    saveProfile(mapUserToProfile(data.user));

    activeOtp = "";
    activeOtpTarget = "";
    activeOtpMethod = "";
    activeOtpChallengeId = "";
    clearOtpUiState("signin");
    navigateAfterAuth(data.user);
  } catch (error) {
    setMessage(error.message, true);
  }
});

resetForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const method = resetMethod.value;
  const identifier = normalizeIdentifier(resetIdentifier.value, method);
  const nextPassword = resetPassword.value.trim();
  const otp = resetOtp.value.trim();

  if (!isValidIdentifier(identifier, method)) {
    setMessage(`Enter a valid ${method === "email" ? "email address" : "mobile number"}.`, true);
    return;
  }
  if (!nextPassword || nextPassword.length < 6) {
    setMessage("Enter a new password with at least 6 characters.", true);
    return;
  }

  if (apiAvailable) {
    if (!resetActiveOtpChallengeId || resetActiveOtpMethod !== method || resetActiveOtpTarget !== identifier) {
      setMessage("Generate OTP first for this email or mobile number.", true);
      return;
    }

    try {
      await postJson("/auth/password-reset/confirm", {
        channel: method,
        emailOrMobile: identifier,
        challengeId: resetActiveOtpChallengeId,
        code: otp,
        newPassword: nextPassword
      });

      resetActiveOtp = "";
      resetActiveOtpTarget = "";
      resetActiveOtpMethod = "";
      resetActiveOtpChallengeId = "";
      clearOtpUiState("reset");
      signinMethod.value = method;
      signinIdentifier.value = identifier;
      signinPassword.value = "";
      signinOtp.value = "";
      setActiveView("signin");
      setMessage("Password reset successful. Sign in with your new password.");
    } catch (error) {
      if (error.status === 429 || /request a new otp|expired|no longer active/i.test(String(error.message || ""))) {
        resetActiveOtpChallengeId = "";
        updateOtpUiState("reset", {
          challengeId: "",
          status: error.status === 429 ? "locked" : "expired"
        });
      }
      setMessage(error.message, true);
    }
    return;
  }

  if (!resetActiveOtp || resetActiveOtpMethod !== method || resetActiveOtpTarget !== identifier) {
    setMessage("Generate OTP first for this email or mobile number.", true);
    return;
  }
  if (!/^\d{6}$/.test(otp) || otp !== resetActiveOtp) {
    setMessage("Invalid OTP. Please try again.", true);
    return;
  }

  await ensureOfflineSeedUsers();
  const users = await loadLocalUsers();
  const user = findLocalUserByIdentifier(users, identifier);
  if (!user) {
    setMessage("Account not found. Request a new OTP.", true);
    return;
  }

  user.passwordHash = await hashLocalPassword(nextPassword);
  saveLocalUsers(users);
  resetActiveOtp = "";
  resetActiveOtpTarget = "";
  resetActiveOtpMethod = "";
  resetActiveOtpChallengeId = "";
  clearOtpUiState("reset");
  signinMethod.value = method;
  signinIdentifier.value = identifier;
  signinPassword.value = "";
  signinOtp.value = "";
  setActiveView("signin");
  setMessage("Password reset successful. Sign in with your new password.");
});

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = signupName.value.trim();
  const email = signupEmail.value.trim().toLowerCase();
  const mobile = signupMobile.value.trim().replace(/\s+/g, "");
  const password = signupPassword.value.trim();
  const address = signupAddress.value.trim();
  const method = signupOtpMethod.value;
  const otp = signupOtp.value.trim();
  const selectedTarget = method === "email" ? email : mobile;

  if (!name || !email || !mobile || !password || !address) {
    setMessage("Please fill all account fields.", true);
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setMessage("Enter a valid email ID.", true);
    return;
  }

  if (!/^(\+?\d{10,15})$/.test(mobile)) {
    setMessage("Enter a valid mobile number.", true);
    return;
  }

  if (apiAvailable) {
    if (!signupActiveOtpChallengeId || signupActiveOtpMethod !== method || signupActiveOtpTarget !== selectedTarget) {
      setMessage("Generate OTP first using your selected email or mobile number.", true);
      return;
    }

    try {
      const data = await postJson("/auth/otp/verify", {
        purpose: "register",
        challengeId: signupActiveOtpChallengeId,
        code: otp
      });

      saveSession({
        token: data.token,
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        mobile: data.user.mobile,
        role: data.user.role
      });
      saveProfile(mapUserToProfile(data.user));

      signupActiveOtp = "";
      signupActiveOtpTarget = "";
      signupActiveOtpMethod = "";
      signupActiveOtpChallengeId = "";
      clearOtpUiState("signup");
      navigateAfterAuth(data.user);
    } catch (error) {
      if (error.status === 429 || /request a new otp|expired|no longer active/i.test(String(error.message || ""))) {
        signupActiveOtpChallengeId = "";
        updateOtpUiState("signup", {
          challengeId: "",
          status: error.status === 429 ? "locked" : "expired"
        });
      }
      setMessage(error.message, true);
    }
    return;
  }

  if (!signupActiveOtp || signupActiveOtpMethod !== method || signupActiveOtpTarget !== selectedTarget) {
    setMessage("Generate OTP first using your selected email or mobile number.", true);
    return;
  }

  if (!/^\d{6}$/.test(otp) || otp !== signupActiveOtp) {
    setMessage("Invalid OTP. Please try again.", true);
    return;
  }

  try {
    const data = await postJson("/auth/register", {
      name,
      email,
      mobile,
      password,
      address
    });

    saveSession({
      token: data.token,
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      mobile: data.user.mobile,
      role: data.user.role
    });
    saveProfile(mapUserToProfile(data.user));

    signupActiveOtp = "";
    signupActiveOtpTarget = "";
    signupActiveOtpMethod = "";
    signupActiveOtpChallengeId = "";
    clearOtpUiState("signup");
    navigateAfterAuth(data.user);
  } catch (error) {
    setMessage(error.message, true);
  }
});

if (languageSelect) {
  const savedLang = loadLanguagePreference();
  languageSelect.value = savedLang;
  document.documentElement.setAttribute("lang", savedLang);
  languageSelect.addEventListener("change", (event) => {
    const nextLang = String(event.target.value || "en").toLowerCase();
    saveLanguagePreference(nextLang);
    document.documentElement.setAttribute("lang", nextLang);
  });
}

bindOtpFieldReset("signin", [signinMethod, signinIdentifier, signinPassword]);
bindOtpFieldReset("signup", [signupOtpMethod, signupName, signupEmail, signupMobile, signupPassword, signupAddress]);
bindOtpFieldReset("reset", [resetMethod, resetIdentifier, resetPassword]);
ensureOtpTicker();
renderOtpUi("signin");
renderOtpUi("signup");
renderOtpUi("reset");

applyAuthModeUi();
setActiveView("signin");

resolveApiBaseUrl()
  .then(async (baseUrl) => {
    if (baseUrl) {
      setMessage("Connected to auth server.");
      return;
    }
    if (isOfflineDemoEnabled()) {
      await ensureOfflineSeedUsers();
      setMessage("Backend offline: local auth demo mode enabled.");
      return;
    }
    setMessage(`Auth server is unavailable. ${getOfflineDemoHelpText()}`, true);
  })
  .catch(async () => {
    if (isOfflineDemoEnabled()) {
      await ensureOfflineSeedUsers();
      setMessage("Backend offline: local auth demo mode enabled.");
      return;
    }
    setMessage(`Auth server is unavailable. ${getOfflineDemoHelpText()}`, true);
  });
