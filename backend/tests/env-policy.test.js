const test = require("node:test");
const assert = require("node:assert/strict");

const {
  assertRuntimeEnvPolicyConfigured,
  validateRuntimeEnvPolicy
} = require("../src/lib/envPolicy");

function buildStrictEnv(overrides = {}) {
  return {
    APP_RUNTIME_ENV: "production",
    JWT_SECRET: "unit-test-secret-value",
    DB_PROVIDER: "sqlite",
    SQLITE_NORMALIZATION_MODE: "strict",
    PUBLIC_STORE_BASE_URL: "https://store.electromart.in",
    PUBLIC_API_BASE_URL: "https://api.electromart.in/api",
    ALLOW_PASSWORD_AUTH_FALLBACK: "false",
    PAYMENT_PROVIDER: "razorpay",
    RAZORPAY_KEY_ID: "rzp_live_unit_test_key",
    RAZORPAY_KEY_SECRET: "razorpay-live-secret",
    RAZORPAY_WEBHOOK_SECRET: "razorpay-webhook-secret",
    BACK_IN_STOCK_EMAIL_MODE: "sendgrid",
    ORDER_NOTIFICATION_EMAIL_MODE: "sendgrid",
    SENDGRID_API_KEY: "sg.unit.test.secret",
    SENDGRID_FROM_EMAIL: "ops@electromart.in",
    PHONE_VERIFICATION_MODE: "twilio",
    ORDER_NOTIFICATION_SMS_MODE: "twilio",
    ORDER_NOTIFICATION_WHATSAPP_MODE: "disabled",
    TWILIO_ACCOUNT_SID: "AC1234567890",
    TWILIO_AUTH_TOKEN: "twilio-auth-token-live",
    TWILIO_SMS_FROM: "+919999999999",
    STORE_SUPPORT_EMAIL: "support@electromart.in",
    ...overrides
  };
}

test("validateRuntimeEnvPolicy allows local runtime with optional placeholder integrations", () => {
  const report = validateRuntimeEnvPolicy({
    APP_RUNTIME_ENV: "local",
    JWT_SECRET: "local-unit-test-secret",
    PUBLIC_STORE_BASE_URL: "http://localhost:5500",
    PUBLIC_API_BASE_URL: "http://localhost:4000/api",
    GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL: "service-account@project-id.iam.gserviceaccount.com",
    GOOGLE_DRIVE_PRIVATE_KEY: "replace-me",
    PAYMENT_PROVIDER: "simulated"
  });

  assert.equal(report.ok, true);
  assert.equal(report.strictRuntime, false);
});

test("validateRuntimeEnvPolicy rejects localhost urls and password fallback in production", () => {
  const report = validateRuntimeEnvPolicy(buildStrictEnv({
    PUBLIC_STORE_BASE_URL: "http://localhost:5500",
    PUBLIC_API_BASE_URL: "http://127.0.0.1:4000/api",
    ALLOW_PASSWORD_AUTH_FALLBACK: "true",
    PAYMENT_PROVIDER: "simulated"
  }));

  assert.equal(report.ok, false);
  assert.match(report.errors.join("\n"), /PUBLIC_STORE_BASE_URL must use https/i);
  assert.match(report.errors.join("\n"), /PUBLIC_API_BASE_URL must not point to localhost/i);
  assert.match(report.errors.join("\n"), /ALLOW_PASSWORD_AUTH_FALLBACK must remain false/i);
  assert.match(report.errors.join("\n"), /PAYMENT_PROVIDER=simulated is not allowed in production runtime/i);
});

test("validateRuntimeEnvPolicy requires selected provider secrets in strict runtimes", () => {
  const report = validateRuntimeEnvPolicy(buildStrictEnv({
    RAZORPAY_KEY_SECRET: "",
    SENDGRID_API_KEY: "",
    TWILIO_AUTH_TOKEN: "",
    TWILIO_SMS_FROM: ""
  }));

  assert.equal(report.ok, false);
  assert.match(report.errors.join("\n"), /RAZORPAY_KEY_SECRET is required/i);
  assert.match(report.errors.join("\n"), /SENDGRID_API_KEY is required/i);
  assert.match(report.errors.join("\n"), /TWILIO_AUTH_TOKEN is required/i);
  assert.match(report.errors.join("\n"), /TWILIO_SMS_FROM is required/i);
});

test("validateRuntimeEnvPolicy rejects placeholder drive configuration in staging", () => {
  const report = validateRuntimeEnvPolicy(buildStrictEnv({
    APP_RUNTIME_ENV: "staging",
    GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL: "service-account@project-id.iam.gserviceaccount.com",
    GOOGLE_DRIVE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\nreplace-me\n-----END PRIVATE KEY-----",
    GOOGLE_DRIVE_CATEGORY_FOLDER_MAP_JSON: "{\"laptop\":\"folderId123\"}"
  }));

  assert.equal(report.ok, false);
  assert.match(report.errors.join("\n"), /GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL must not use an example placeholder address/i);
  assert.match(report.errors.join("\n"), /GOOGLE_DRIVE_PRIVATE_KEY must not use a placeholder/i);
  assert.match(report.errors.join("\n"), /GOOGLE_DRIVE_CATEGORY_FOLDER_MAP_JSON must not include placeholder folder ids/i);
});

test("validateRuntimeEnvPolicy requires strict SQLite normalization in strict runtimes", () => {
  const report = validateRuntimeEnvPolicy(buildStrictEnv({
    SQLITE_NORMALIZATION_MODE: "compat"
  }));

  assert.equal(report.ok, false);
  assert.match(report.errors.join("\n"), /SQLITE_NORMALIZATION_MODE must be strict when DB_PROVIDER=sqlite/i);
});

test("assertRuntimeEnvPolicyConfigured returns deployment-safe error messages", () => {
  assert.throws(() => assertRuntimeEnvPolicyConfigured(buildStrictEnv({
    SENDGRID_API_KEY: "replace-me-secret-value"
  })), (error) => {
    assert.equal(error.code, "ENV_POLICY_INVALID");
    assert.match(error.message, /SENDGRID_API_KEY must not use a placeholder/i);
    assert.equal(error.message.includes("replace-me-secret-value"), false);
    return true;
  });
});

test("assertRuntimeEnvPolicyConfigured accepts valid strict runtime configuration", () => {
  const report = assertRuntimeEnvPolicyConfigured(buildStrictEnv({
    GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL: "",
    GOOGLE_DRIVE_PRIVATE_KEY: "",
    GOOGLE_DRIVE_CATEGORY_FOLDER_MAP_JSON: ""
  }));

  assert.equal(report.ok, true);
  assert.equal(report.runtimeProfile, "production");
});
