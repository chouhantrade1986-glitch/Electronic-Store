const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createPaymentGatewayOrder,
  fromSubunits,
  getPaymentGatewayConfig,
  getValidatedRazorpayConfig,
  isRazorpayEnabled,
  toSubunits,
  validateRazorpayConfig
} = require("../src/lib/razorpayGateway");

test("Razorpay config: simulated mode returns valid configuration", () => {
  const result = validateRazorpayConfig({
    provider: "simulated",
    keyId: "",
    keySecret: "",
    webhookSecret: ""
  });

  assert.equal(result.valid, true);
  assert.equal(result.provider, "simulated");
  assert.equal(result.mode, "simulated");
  assert.equal(result.keyIdMasked, "");
  assert.deepEqual(result.issues, []);
});

test("Razorpay config: detects missing keys when provider is razorpay", () => {
  const result = validateRazorpayConfig({
    provider: "razorpay",
    keyId: "",
    keySecret: "",
    webhookSecret: ""
  });

  assert.equal(result.valid, false);
  assert.equal(result.mode, "unknown");
  assert.ok(result.issues.length >= 2);
  assert.ok(result.issues.some((issue) => issue.includes("RAZORPAY_KEY_ID")));
  assert.ok(result.issues.some((issue) => issue.includes("RAZORPAY_KEY_SECRET")));
});

test("Razorpay config: validates test mode key and masks keyId", () => {
  const result = validateRazorpayConfig({
    provider: "razorpay",
    keyId: "rzp_test_sample12345678",
    keySecret: "sample_secret_key_long_enough",
    webhookSecret: "whsec_sample123"
  });

  assert.equal(result.valid, true);
  assert.equal(result.mode, "test");
  assert.equal(result.hasKeySecret, true);
  assert.equal(result.hasWebhookSecret, true);
  assert.match(result.keyIdMasked, /^rzp_test\.\.\.[0-9a-zA-Z]{4}$/);
  assert.equal(result.issues.length, 0);
});

test("Razorpay config: validates live mode key and warns when webhook secret is missing", () => {
  const result = validateRazorpayConfig({
    provider: "razorpay",
    keyId: "rzp_live_production987654",
    keySecret: "prod_secret_key_long_enough",
    webhookSecret: ""
  });

  assert.equal(result.valid, true);
  assert.equal(result.mode, "live");
  assert.equal(result.hasWebhookSecret, false);
  assert.ok(result.issues.some((issue) => issue.includes("RAZORPAY_WEBHOOK_SECRET")));
});

test("Razorpay config: getValidatedRazorpayConfig merges overrides correctly", () => {
  const validated = getValidatedRazorpayConfig({
    provider: "razorpay",
    keyId: "rzp_test_override123",
    keySecret: "override_secret_long",
    webhookSecret: "override_wh"
  });

  assert.equal(validated.validation.valid, true);
  assert.equal(validated.validation.mode, "test");
  assert.equal(validated.config.provider, "razorpay");
});

test("Razorpay config: getPaymentGatewayConfig returns safe public fields", () => {
  const publicConfig = getPaymentGatewayConfig();
  assert.ok("provider" in publicConfig);
  assert.ok("keyId" in publicConfig);
  assert.ok("razorpayEnabled" in publicConfig);
  assert.ok("mode" in publicConfig);
  assert.ok("onlineCheckoutLabel" in publicConfig);
  assert.equal(publicConfig.keySecret, undefined);
  assert.equal(publicConfig.webhookSecret, undefined);
});

test("Razorpay config: createPaymentGatewayOrder creates simulated order when Razorpay disabled", async () => {
  const simulatedPayment = { id: "pay-sim-12345", amount: 2499.50, currency: "INR" };
  const mockOrder = { id: "ord-test-67890", total: 2499.50 };

  const gatewayOrder = await createPaymentGatewayOrder(simulatedPayment, mockOrder);
  assert.ok(gatewayOrder.id.startsWith("order_sim_"));
  assert.equal(gatewayOrder.entity, "order");
  assert.equal(gatewayOrder.amount, 249950);
  assert.equal(gatewayOrder.currency, "INR");
  assert.equal(gatewayOrder.status, "created");
  assert.equal(gatewayOrder.notes.simulated, "true");
  assert.equal(gatewayOrder.notes.internalOrderId, "ord-test-67890");
});

test("Razorpay subunits conversions round-trip correctly", () => {
  assert.equal(toSubunits(99.99), 9999);
  assert.equal(toSubunits(0), 0);
  assert.equal(toSubunits(100), 10000);
  assert.equal(fromSubunits(9999), 99.99);
  assert.equal(fromSubunits(10000), 100);
});
