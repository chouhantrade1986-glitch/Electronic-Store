const { randomInt } = require("crypto");
const { sendTwilioMessage } = require("./twilioDelivery");

const PHONE_CODE_TTL_MS = Math.max(60 * 1000, Number(process.env.PHONE_VERIFICATION_TTL_MS || 10 * 60 * 1000));
const PHONE_REQUEST_COOLDOWN_MS = Math.max(15 * 1000, Number(process.env.PHONE_VERIFICATION_RESEND_COOLDOWN_MS || 60 * 1000));
const PHONE_MAX_VERIFY_ATTEMPTS = Math.max(1, Number(process.env.PHONE_VERIFICATION_MAX_ATTEMPTS || 5));
const PHONE_LOCK_MS = Math.max(60 * 1000, Number(process.env.PHONE_VERIFICATION_LOCK_MS || 10 * 60 * 1000));
const PHONE_VERIFICATION_MODE = String(process.env.PHONE_VERIFICATION_MODE || "simulated").trim().toLowerCase();
const PHONE_VERIFICATION_BRAND = String(process.env.PHONE_VERIFICATION_BRAND || process.env.STORE_BRAND_NAME || "ElectroMart").trim() || "ElectroMart";
const PHONE_CODE_TTL_MINUTES = Math.max(1, Math.ceil(PHONE_CODE_TTL_MS / (60 * 1000)));

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

function normalizePhoneVerificationState(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    verifiedForMobile: normalizePhone(source.verifiedForMobile || ""),
    verifiedAt: source.verifiedAt ? String(source.verifiedAt) : null,
    pendingCode: source.pendingCode ? String(source.pendingCode) : "",
    pendingMobile: normalizePhone(source.pendingMobile || ""),
    pendingExpiresAt: source.pendingExpiresAt ? String(source.pendingExpiresAt) : null,
    lastRequestedAt: source.lastRequestedAt ? String(source.lastRequestedAt) : null,
    failedAttempts: Number.isFinite(Number(source.failedAttempts)) ? Math.max(0, Number(source.failedAttempts)) : 0,
    lockedUntil: source.lockedUntil ? String(source.lockedUntil) : null
  };
}

function clearPhoneVerificationChallenge(state) {
  const next = normalizePhoneVerificationState(state);
  next.pendingCode = "";
  next.pendingMobile = "";
  next.pendingExpiresAt = null;
  return next;
}

function getResendAvailableAt(state) {
  const normalizedState = normalizePhoneVerificationState(state);
  if (!normalizedState.lastRequestedAt) {
    return null;
  }
  const requestedAt = new Date(normalizedState.lastRequestedAt).getTime();
  if (!Number.isFinite(requestedAt)) {
    return null;
  }
  const resendAt = requestedAt + PHONE_REQUEST_COOLDOWN_MS;
  return resendAt > Date.now() ? new Date(resendAt).toISOString() : null;
}

function isVerificationLocked(state) {
  const normalizedState = normalizePhoneVerificationState(state);
  if (!normalizedState.lockedUntil) {
    return false;
  }
  const lockedUntil = new Date(normalizedState.lockedUntil).getTime();
  return Number.isFinite(lockedUntil) && lockedUntil > Date.now();
}

function isPhoneVerifiedForCurrentMobile(user) {
  const mobile = normalizePhone(user && user.mobile ? user.mobile : "");
  if (!mobile) {
    return false;
  }
  const state = normalizePhoneVerificationState(user && user.phoneVerification);
  return Boolean(state.verifiedAt && state.verifiedForMobile && state.verifiedForMobile === mobile);
}

function hasActivePhoneVerificationChallenge(user) {
  const mobile = normalizePhone(user && user.mobile ? user.mobile : "");
  const state = normalizePhoneVerificationState(user && user.phoneVerification);
  if (!mobile || !state.pendingCode || !state.pendingExpiresAt || state.pendingMobile !== mobile) {
    return false;
  }
  const expiresAt = new Date(state.pendingExpiresAt).getTime();
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

function createPhoneVerificationChallenge(user) {
  const mobile = normalizePhone(user && user.mobile ? user.mobile : "");
  if (!isValidPhone(mobile)) {
    return { ok: false, status: 400, message: "A valid phone number is required before verification." };
  }
  const currentState = normalizePhoneVerificationState(user && user.phoneVerification);
  if (isVerificationLocked(currentState)) {
    return {
      ok: false,
      status: 429,
      message: "Too many incorrect attempts. Wait before requesting another code."
    };
  }
  const resendAvailableAt = getResendAvailableAt(currentState);
  if (resendAvailableAt) {
    return {
      ok: false,
      status: 429,
      message: "Please wait before requesting another verification code."
    };
  }
  const nowIso = new Date().toISOString();
  const expiresIso = new Date(Date.now() + PHONE_CODE_TTL_MS).toISOString();
  const code = String(randomInt(0, 1000000)).padStart(6, "0");
  const nextState = normalizePhoneVerificationState(user && user.phoneVerification);
  nextState.pendingCode = code;
  nextState.pendingMobile = mobile;
  nextState.pendingExpiresAt = expiresIso;
  nextState.lastRequestedAt = nowIso;
  nextState.failedAttempts = 0;
  nextState.lockedUntil = null;
  user.phoneVerification = nextState;
  return {
    ok: true,
    status: 200,
    code,
    expiresAt: expiresIso,
    mode: PHONE_VERIFICATION_MODE
  };
}

function verifyPhoneCode(user, code) {
  const normalizedCode = String(code || "").trim();
  if (!/^\d{6}$/.test(normalizedCode)) {
    return { ok: false, status: 400, message: "Enter the 6-digit verification code." };
  }
  const mobile = normalizePhone(user && user.mobile ? user.mobile : "");
  if (!isValidPhone(mobile)) {
    return { ok: false, status: 400, message: "A valid phone number is required before verification." };
  }

  const state = normalizePhoneVerificationState(user && user.phoneVerification);
  if (isVerificationLocked(state)) {
    return { ok: false, status: 429, message: "Too many incorrect attempts. Wait before trying again." };
  }
  if (!state.pendingCode || !state.pendingExpiresAt || state.pendingMobile !== mobile) {
    return { ok: false, status: 400, message: "No active verification code found. Request a new code." };
  }
  const expiresAt = new Date(state.pendingExpiresAt).getTime();
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    const nextState = clearPhoneVerificationChallenge(state);
    nextState.failedAttempts = 0;
    user.phoneVerification = nextState;
    return { ok: false, status: 400, message: "Verification code expired. Request a new code." };
  }
  if (state.pendingCode !== normalizedCode) {
    const nextState = normalizePhoneVerificationState(state);
    nextState.failedAttempts += 1;
    if (nextState.failedAttempts >= PHONE_MAX_VERIFY_ATTEMPTS) {
      nextState.lockedUntil = new Date(Date.now() + PHONE_LOCK_MS).toISOString();
      nextState.failedAttempts = PHONE_MAX_VERIFY_ATTEMPTS;
      user.phoneVerification = clearPhoneVerificationChallenge(nextState);
      user.phoneVerification.failedAttempts = PHONE_MAX_VERIFY_ATTEMPTS;
      user.phoneVerification.lockedUntil = nextState.lockedUntil;
      return { ok: false, status: 429, message: "Too many incorrect attempts. Phone verification is temporarily locked." };
    }
    user.phoneVerification = nextState;
    return { ok: false, status: 400, message: "Invalid verification code." };
  }

  const verifiedAt = new Date().toISOString();
  const nextState = clearPhoneVerificationChallenge(state);
  nextState.verifiedForMobile = mobile;
  nextState.verifiedAt = verifiedAt;
  nextState.failedAttempts = 0;
  nextState.lockedUntil = null;
  user.phoneVerification = nextState;
  return { ok: true, status: 200, verifiedAt };
}

function phoneVerificationPublicView(user) {
  const mobile = normalizePhone(user && user.mobile ? user.mobile : "");
  const state = normalizePhoneVerificationState(user && user.phoneVerification);
  const pendingActive = hasActivePhoneVerificationChallenge(user);
  const resendAvailableAt = getResendAvailableAt(state);
  const locked = isVerificationLocked(state);
  return {
    isVerified: isPhoneVerifiedForCurrentMobile(user),
    verifiedAt: state.verifiedAt || null,
    mobileMasked: maskPhone(mobile),
    hasPendingCode: pendingActive,
    pendingExpiresAt: pendingActive ? state.pendingExpiresAt : null,
    resendAvailableAt,
    remainingAttempts: Math.max(0, PHONE_MAX_VERIFY_ATTEMPTS - state.failedAttempts),
    isLocked: locked,
    lockedUntil: locked ? state.lockedUntil : null
  };
}

function buildPhoneVerificationSmsText(code) {
  return `${PHONE_VERIFICATION_BRAND}: Your verification code is ${code}. It expires in ${PHONE_CODE_TTL_MINUTES} minutes. Do not share this code. If you did not request it, ignore this SMS.`;
}

async function sendPhoneVerificationCode(user, code) {
  const mobile = normalizePhone(user && user.mobile ? user.mobile : "");
  if (!isValidPhone(mobile)) {
    return {
      ok: false,
      status: 400,
      message: "A valid phone number is required before verification."
    };
  }

  if (PHONE_VERIFICATION_MODE === "simulated") {
    return {
      ok: true,
      status: 200,
      message: "Verification code sent.",
      otpPreview: code,
      delivery: {
        delivered: true,
        provider: "simulated"
      }
    };
  }

  if (PHONE_VERIFICATION_MODE === "twilio") {
    try {
      const result = await sendTwilioMessage({
        channel: "sms",
        destination: mobile,
        text: buildPhoneVerificationSmsText(code)
      });
      return {
        ok: true,
        status: 200,
        message: "Verification code sent by SMS.",
        delivery: result
      };
    } catch (error) {
      return {
        ok: false,
        status: 500,
        message: String(error && error.message ? error.message : "Unable to send verification SMS.")
      };
    }
  }

  if (PHONE_VERIFICATION_MODE === "disabled") {
    return {
      ok: false,
      status: 503,
      message: "Phone verification delivery is disabled."
    };
  }

  return {
    ok: false,
    status: 500,
    message: `Unsupported PHONE_VERIFICATION_MODE: ${PHONE_VERIFICATION_MODE}`
  };
}

module.exports = {
  PHONE_VERIFICATION_MODE,
  PHONE_LOCK_MS,
  PHONE_MAX_VERIFY_ATTEMPTS,
  PHONE_REQUEST_COOLDOWN_MS,
  clearPhoneVerificationChallenge,
  createPhoneVerificationChallenge,
  getResendAvailableAt,
  hasActivePhoneVerificationChallenge,
  isPhoneVerifiedForCurrentMobile,
  isVerificationLocked,
  isValidPhone,
  maskPhone,
  normalizePhone,
  normalizePhoneVerificationState,
  phoneVerificationPublicView,
  sendPhoneVerificationCode,
  verifyPhoneCode
};
