const { assertJwtSecretConfigured } = require("./auth");
const { hasValidAdminBootstrapSecret } = require("./adminProvisioningGuardrails");
const { resolveRuntimeProfile } = require("./runtimeMode");

const VALID_RUNTIME_PROFILES = new Set([
  "local",
  "development",
  "test",
  "staging",
  "production"
]);

const VALID_PAYMENT_PROVIDERS = new Set(["simulated", "razorpay"]);
const VALID_EMAIL_MODES = new Set(["simulated", "smtp", "sendgrid"]);
const VALID_MESSAGE_MODES = new Set(["simulated", "twilio", "disabled"]);
const VALID_PHONE_VERIFICATION_MODES = new Set(["simulated", "twilio", "disabled"]);
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);
const PLACEHOLDER_EMAILS = new Set([
  "service-account@project-id.iam.gserviceaccount.com"
]);
const PLACEHOLDER_FOLDER_IDS = new Set([
  "folderid123",
  "folderid456"
]);
const PLACEHOLDER_SECRET_TOKENS = [
  "changeme",
  "example",
  "paste_",
  "placeholder",
  "replace-me",
  "replace-with-strong-secret",
  "your_",
  "your-"
];

function normalizeToken(value) {
  return String(value || "").trim().toLowerCase();
}

function isStrictRuntime(runtimeProfile) {
  return runtimeProfile === "staging" || runtimeProfile === "production";
}

function isTruthy(value) {
  return normalizeToken(value) === "true";
}

function isConfigured(value) {
  return String(value || "").trim().length > 0;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim().toLowerCase());
}

function looksLikePlaceholderSecret(value) {
  const normalized = normalizeToken(value);
  if (!normalized) {
    return true;
  }
  return PLACEHOLDER_SECRET_TOKENS.some((token) => normalized.includes(token));
}

function looksLikePlaceholderFolderId(value) {
  return PLACEHOLDER_FOLDER_IDS.has(normalizeToken(value));
}

function parseUrl(value) {
  try {
    return new URL(String(value || "").trim());
  } catch (error) {
    return null;
  }
}

function validateBaseUrl(errors, key, value, options = {}) {
  const required = options.required === true;
  const httpsOnly = options.httpsOnly === true;
  const forbidLocal = options.forbidLocal === true;
  const normalized = String(value || "").trim();

  if (!normalized) {
    if (required) {
      errors.push(`${key} is required for ${options.runtimeProfile} runtime.`);
    }
    return;
  }

  const parsed = parseUrl(normalized);
  if (!parsed) {
    errors.push(`${key} must be a valid absolute URL.`);
    return;
  }
  if (httpsOnly && parsed.protocol !== "https:") {
    errors.push(`${key} must use https in ${options.runtimeProfile} runtime.`);
  }
  if (forbidLocal && (LOCAL_HOSTNAMES.has(parsed.hostname) || parsed.hostname.endsWith(".local"))) {
    errors.push(`${key} must not point to localhost or local-only hosts in ${options.runtimeProfile} runtime.`);
  }
}

function validateEmailValue(errors, key, value, options = {}) {
  const required = options.required === true;
  const normalized = String(value || "").trim();
  if (!normalized) {
    if (required) {
      errors.push(`${key} is required.`);
    }
    return;
  }
  if (!isValidEmail(normalized)) {
    errors.push(`${key} must be a valid email address.`);
    return;
  }
  if (PLACEHOLDER_EMAILS.has(normalizeToken(normalized))) {
    errors.push(`${key} must not use an example placeholder address.`);
  }
}

function validateSecretValue(errors, key, value, options = {}) {
  const required = options.required !== false;
  const normalized = String(value || "").trim();
  if (!normalized) {
    if (required) {
      errors.push(`${key} is required.`);
    }
    return;
  }
  if (looksLikePlaceholderSecret(normalized)) {
    errors.push(`${key} must not use a placeholder or example value.`);
  }
}

function validatePaymentConfig(errors, env, runtimeProfile) {
  const provider = normalizeToken(env.PAYMENT_PROVIDER || "simulated");
  if (!VALID_PAYMENT_PROVIDERS.has(provider)) {
    errors.push("PAYMENT_PROVIDER must be one of: simulated, razorpay.");
    return;
  }
  if (runtimeProfile === "production" && provider === "simulated") {
    errors.push("PAYMENT_PROVIDER=simulated is not allowed in production runtime.");
  }
  if (provider !== "razorpay") {
    return;
  }

  if (!isConfigured(env.RAZORPAY_KEY_ID)) {
    errors.push("RAZORPAY_KEY_ID is required when PAYMENT_PROVIDER=razorpay.");
  }
  validateSecretValue(errors, "RAZORPAY_KEY_SECRET", env.RAZORPAY_KEY_SECRET);
  validateSecretValue(errors, "RAZORPAY_WEBHOOK_SECRET", env.RAZORPAY_WEBHOOK_SECRET);
}

function validateEmailDeliveryConfig(errors, env) {
  const backInStockMode = normalizeToken(env.BACK_IN_STOCK_EMAIL_MODE || "simulated");
  const orderEmailMode = normalizeToken(env.ORDER_NOTIFICATION_EMAIL_MODE || env.BACK_IN_STOCK_EMAIL_MODE || "simulated");

  [backInStockMode, orderEmailMode].forEach((mode) => {
    if (!VALID_EMAIL_MODES.has(mode)) {
      errors.push("Email delivery modes must be one of: simulated, smtp, sendgrid.");
    }
  });

  const requiresSmtp = backInStockMode === "smtp" || orderEmailMode === "smtp";
  const requiresSendGrid = backInStockMode === "sendgrid" || orderEmailMode === "sendgrid";

  if (requiresSmtp) {
    if (!isConfigured(env.SMTP_HOST)) {
      errors.push("SMTP_HOST is required when smtp email delivery is enabled.");
    }
    validateEmailValue(errors, "SMTP_FROM_EMAIL", env.SMTP_FROM_EMAIL, { required: true });
    const smtpUserConfigured = isConfigured(env.SMTP_USER);
    const smtpPassConfigured = isConfigured(env.SMTP_PASS);
    if (smtpUserConfigured !== smtpPassConfigured) {
      errors.push("SMTP_USER and SMTP_PASS must be provided together when SMTP auth is enabled.");
    }
    if (smtpPassConfigured) {
      validateSecretValue(errors, "SMTP_PASS", env.SMTP_PASS);
    }
  }

  if (requiresSendGrid) {
    validateSecretValue(errors, "SENDGRID_API_KEY", env.SENDGRID_API_KEY);
    validateEmailValue(errors, "SENDGRID_FROM_EMAIL", env.SENDGRID_FROM_EMAIL, { required: true });
  }
}

function validateTwilioConfig(errors, env) {
  validateSecretValue(errors, "TWILIO_ACCOUNT_SID", env.TWILIO_ACCOUNT_SID);
  validateSecretValue(errors, "TWILIO_AUTH_TOKEN", env.TWILIO_AUTH_TOKEN);
}

function validateMessagingConfig(errors, env) {
  const phoneVerificationMode = normalizeToken(env.PHONE_VERIFICATION_MODE || "simulated");
  const orderSmsMode = normalizeToken(env.ORDER_NOTIFICATION_SMS_MODE || "simulated");
  const orderWhatsappMode = normalizeToken(env.ORDER_NOTIFICATION_WHATSAPP_MODE || "simulated");

  if (!VALID_PHONE_VERIFICATION_MODES.has(phoneVerificationMode)) {
    errors.push("PHONE_VERIFICATION_MODE must be one of: simulated, twilio, disabled.");
  }
  [orderSmsMode, orderWhatsappMode].forEach((mode) => {
    if (!VALID_MESSAGE_MODES.has(mode)) {
      errors.push("Order notification SMS/WhatsApp modes must be one of: simulated, twilio, disabled.");
    }
  });

  const requiresTwilio = phoneVerificationMode === "twilio"
    || orderSmsMode === "twilio"
    || orderWhatsappMode === "twilio";

  if (!requiresTwilio) {
    return;
  }

  validateTwilioConfig(errors, env);
  if (phoneVerificationMode === "twilio" || orderSmsMode === "twilio") {
    if (!isConfigured(env.TWILIO_SMS_FROM)) {
      errors.push("TWILIO_SMS_FROM is required when SMS/Twilio delivery is enabled.");
    }
  }
  if (orderWhatsappMode === "twilio") {
    if (!isConfigured(env.TWILIO_WHATSAPP_FROM) && !isConfigured(env.TWILIO_SMS_FROM)) {
      errors.push("TWILIO_WHATSAPP_FROM or TWILIO_SMS_FROM is required when WhatsApp/Twilio delivery is enabled.");
    }
  }
}

function parseFolderMap(rawValue) {
  const normalized = String(rawValue || "").trim();
  if (!normalized) {
    return null;
  }
  try {
    const parsed = JSON.parse(normalized);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed;
  } catch (error) {
    return null;
  }
}

function validateDriveConfig(errors, env) {
  const anyDriveConfig = [
    env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL,
    env.GOOGLE_DRIVE_PRIVATE_KEY,
    env.GOOGLE_DRIVE_PARENT_FOLDER_ID,
    env.GOOGLE_DRIVE_CATEGORY_FOLDER_MAP_JSON
  ].some(isConfigured);

  if (!anyDriveConfig) {
    return;
  }

  validateEmailValue(
    errors,
    "GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL",
    env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL,
    { required: true }
  );
  validateSecretValue(errors, "GOOGLE_DRIVE_PRIVATE_KEY", env.GOOGLE_DRIVE_PRIVATE_KEY);

  const parentFolderId = String(env.GOOGLE_DRIVE_PARENT_FOLDER_ID || "").trim();
  if (parentFolderId && looksLikePlaceholderFolderId(parentFolderId)) {
    errors.push("GOOGLE_DRIVE_PARENT_FOLDER_ID must not use a placeholder folder id.");
  }

  if (!isConfigured(env.GOOGLE_DRIVE_CATEGORY_FOLDER_MAP_JSON)) {
    return;
  }

  const categoryFolderMap = parseFolderMap(env.GOOGLE_DRIVE_CATEGORY_FOLDER_MAP_JSON);
  if (!categoryFolderMap) {
    errors.push("GOOGLE_DRIVE_CATEGORY_FOLDER_MAP_JSON must be valid JSON object when provided.");
    return;
  }

  Object.values(categoryFolderMap).forEach((folderId) => {
    if (looksLikePlaceholderFolderId(folderId)) {
      errors.push("GOOGLE_DRIVE_CATEGORY_FOLDER_MAP_JSON must not include placeholder folder ids.");
    }
  });
}

function validateRuntimeEnvPolicy(env = process.env) {
  const runtimeProfile = resolveRuntimeProfile(env);
  const errors = [];

  if (!VALID_RUNTIME_PROFILES.has(runtimeProfile)) {
    errors.push("APP_RUNTIME_ENV must resolve to one of: local, development, test, staging, production.");
  }

  try {
    assertJwtSecretConfigured(env);
  } catch (error) {
    errors.push(error.message);
  }

  validateEmailValue(errors, "STORE_SUPPORT_EMAIL", env.STORE_SUPPORT_EMAIL, { required: false });

  const strictRuntime = isStrictRuntime(runtimeProfile);
  if (strictRuntime) {
    validateBaseUrl(errors, "PUBLIC_STORE_BASE_URL", env.PUBLIC_STORE_BASE_URL, {
      required: true,
      httpsOnly: true,
      forbidLocal: true,
      runtimeProfile
    });
    validateBaseUrl(errors, "PUBLIC_API_BASE_URL", env.PUBLIC_API_BASE_URL, {
      required: true,
      httpsOnly: true,
      forbidLocal: true,
      runtimeProfile
    });

    if (isTruthy(env.ALLOW_PASSWORD_AUTH_FALLBACK)) {
      errors.push("ALLOW_PASSWORD_AUTH_FALLBACK must remain false in staging and production runtimes.");
    }

    if (isConfigured(env.ADMIN_BOOTSTRAP_SECRET) && !hasValidAdminBootstrapSecret(env)) {
      errors.push("ADMIN_BOOTSTRAP_SECRET must not use a default or placeholder value when configured.");
    }

    validatePaymentConfig(errors, env, runtimeProfile);
    validateEmailDeliveryConfig(errors, env);
    validateMessagingConfig(errors, env);
    validateDriveConfig(errors, env);
  }

  return {
    ok: errors.length === 0,
    runtimeProfile,
    strictRuntime,
    errors
  };
}

function assertRuntimeEnvPolicyConfigured(env = process.env) {
  const report = validateRuntimeEnvPolicy(env);
  if (report.ok) {
    return report;
  }

  const error = new Error([
    `Environment policy validation failed for runtime profile ${report.runtimeProfile}.`,
    ...report.errors.map((item) => `- ${item}`)
  ].join("\n"));
  error.code = "ENV_POLICY_INVALID";
  error.details = {
    runtimeProfile: report.runtimeProfile,
    errors: [...report.errors]
  };
  throw error;
}

module.exports = {
  VALID_RUNTIME_PROFILES,
  assertRuntimeEnvPolicyConfigured,
  validateRuntimeEnvPolicy
};
