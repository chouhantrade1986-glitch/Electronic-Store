require("dotenv").config();

const { randomUUID } = require("crypto");
const { createRazorpayOrder, resolveRazorpayConfig } = require("../lib/razorpayGateway");

function parseArgs(argv = []) {
  const options = {
    amount: 1,
    method: "upi"
  };

  argv.forEach((arg) => {
    const value = String(arg || "").trim();
    if (!value) {
      return;
    }
    if (value.startsWith("--amount=")) {
      const parsed = Number(value.split("=").slice(1).join("="));
      if (Number.isFinite(parsed) && parsed > 0) {
        options.amount = Number(parsed.toFixed(2));
      }
      return;
    }
    if (value.startsWith("--method=")) {
      const method = String(value.split("=").slice(1).join("=")).trim().toLowerCase();
      if (method) {
        options.method = method;
      }
    }
  });

  return options;
}

function maskKey(value) {
  const raw = String(value || "").trim();
  if (raw.length <= 8) {
    return raw ? `${raw.slice(0, 2)}***${raw.slice(-2)}` : "";
  }
  return `${raw.slice(0, 4)}...${raw.slice(-4)}`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const config = resolveRazorpayConfig();

  if (!config.keyId || !config.keySecret) {
    throw new Error("Razorpay key ID/secret are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET before running this smoke test.");
  }

  if (config.provider !== "razorpay") {
    process.env.PAYMENT_PROVIDER = "razorpay";
  }

  const now = Date.now();
  const payment = {
    id: randomUUID(),
    receiptId: `SMOKE-${now}`,
    amount: options.amount,
    currency: "INR",
    method: options.method
  };
  const order = {
    id: `smoke-order-${now}`,
    total: options.amount,
    paymentMethod: options.method,
    userId: `smoke-user-${now}`
  };
  const user = {
    id: order.userId,
    name: "ElectroMart Smoke Test",
    email: process.env.SMOKE_TEST_EMAIL || "smoke-test@electromart.local",
    mobile: process.env.SMOKE_TEST_MOBILE || ""
  };

  const gatewayOrder = await createRazorpayOrder(payment, order, user);

  // eslint-disable-next-line no-console
  console.log("Razorpay credential smoke test passed.");
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({
    provider: "razorpay",
    providerMode: config.provider === "razorpay" ? "configured" : "forced-for-smoke-test",
    keyIdPreview: maskKey(config.keyId),
    amount: options.amount,
    currency: payment.currency,
    method: payment.method,
    gatewayOrderId: gatewayOrder.id,
    gatewayOrderStatus: gatewayOrder.status,
    receipt: gatewayOrder.receipt
  }, null, 2));
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
