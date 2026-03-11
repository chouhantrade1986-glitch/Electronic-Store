require("dotenv").config();
const { otpLogin } = require("../../../qa-auth-node");

const DEFAULT_API_BASE_URL = String(process.env.PUBLIC_API_BASE_URL || "http://localhost:4000/api").trim().replace(/\/+$/, "");

function parseArgs(argv = []) {
  const options = {
    apiBaseUrl: DEFAULT_API_BASE_URL,
    emailOrMobile: process.env.SMOKE_TEST_USER || "customer@electromart.com",
    password: process.env.SMOKE_TEST_PASSWORD || "Customer@123",
    productId: process.env.SMOKE_TEST_PRODUCT_ID || "1",
    quantity: Number(process.env.SMOKE_TEST_PRODUCT_QTY || 1),
    paymentMethod: process.env.SMOKE_TEST_PAYMENT_METHOD || "upi",
    shippingAddress: process.env.SMOKE_TEST_ADDRESS || "Jaipur, Rajasthan"
  };

  argv.forEach((arg) => {
    const value = String(arg || "").trim();
    if (!value) {
      return;
    }
    if (value.startsWith("--api-base-url=")) {
      options.apiBaseUrl = String(value.split("=").slice(1).join("=")).trim().replace(/\/+$/, "");
      return;
    }
    if (value.startsWith("--user=")) {
      options.emailOrMobile = String(value.split("=").slice(1).join("=")).trim();
      return;
    }
    if (value.startsWith("--password=")) {
      options.password = String(value.split("=").slice(1).join("=")).trim();
      return;
    }
    if (value.startsWith("--product-id=")) {
      options.productId = String(value.split("=").slice(1).join("=")).trim();
      return;
    }
    if (value.startsWith("--quantity=")) {
      const parsed = Number(value.split("=").slice(1).join("="));
      if (Number.isFinite(parsed) && parsed > 0) {
        options.quantity = Math.max(1, Math.floor(parsed));
      }
      return;
    }
    if (value.startsWith("--payment-method=")) {
      options.paymentMethod = String(value.split("=").slice(1).join("=")).trim().toLowerCase();
      return;
    }
    if (value.startsWith("--shipping-address=")) {
      options.shippingAddress = String(value.split("=").slice(1).join("=")).trim();
    }
  });

  return options;
}

async function requestJson(url, options = {}) {
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    const nextError = new Error(`Unable to connect to ${url}.`);
    nextError.cause = error;
    throw nextError;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const nextError = new Error(data.message || `Request failed with status ${response.status}.`);
    nextError.status = response.status;
    nextError.payload = data;
    throw nextError;
  }
  return data;
}

function asProductList(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (!payload || typeof payload !== "object") {
    return [];
  }
  if (Array.isArray(payload.items)) {
    return payload.items;
  }
  if (Array.isArray(payload.products)) {
    return payload.products;
  }
  return [];
}

async function resolveProductIdForOrder(apiBaseUrl, requestedProductId) {
  const requested = String(requestedProductId || "").trim();
  const payload = await requestJson(`${apiBaseUrl}/products?page=1&pageSize=250`);
  const products = asProductList(payload);
  const normalizeStock = (product) => Number(product && product.stock ? product.stock : 0);
  const asId = (product) => String(product && product.id ? product.id : "").trim();

  const requestedProduct = products.find((product) => asId(product) === requested);
  if (requestedProduct && normalizeStock(requestedProduct) > 0) {
    return asId(requestedProduct);
  }

  const inStockProduct = products.find((product) => normalizeStock(product) > 0);
  if (inStockProduct) {
    return asId(inStockProduct);
  }

  if (requested) {
    return requested;
  }
  throw new Error("No in-stock product found for Razorpay resume smoke.");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  const auth = await otpLogin({
    apiBaseUrl: options.apiBaseUrl,
    emailOrMobile: options.emailOrMobile,
    password: options.password
  });

  const token = String(auth && auth.token ? auth.token : "").trim();
  if (!token) {
    throw new Error("Login succeeded without a usable auth token.");
  }

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  const resolvedProductId = await resolveProductIdForOrder(options.apiBaseUrl, options.productId);

  const order = await requestJson(`${options.apiBaseUrl}/orders`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      items: [
        {
          productId: resolvedProductId,
          quantity: options.quantity
        }
      ],
      shippingAddress: options.shippingAddress,
      paymentMethod: options.paymentMethod
    })
  });

  const firstIntent = await requestJson(`${options.apiBaseUrl}/payments/intent`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      orderId: order.id,
      method: options.paymentMethod
    })
  });

  const secondIntent = await requestJson(`${options.apiBaseUrl}/payments/intent`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      orderId: order.id,
      method: options.paymentMethod
    })
  });

  if (String(firstIntent.checkoutProvider || "").trim().toLowerCase() !== "razorpay") {
    throw new Error("Payment intent did not return Razorpay checkout details. Ensure PAYMENT_PROVIDER=razorpay and live credentials are configured.");
  }

  if (String(secondIntent.checkoutProvider || "").trim().toLowerCase() !== "razorpay") {
    throw new Error("Second payment intent did not preserve Razorpay checkout details for resume flow.");
  }

  if (String(firstIntent.id || "").trim() !== String(secondIntent.id || "").trim()) {
    throw new Error("Resume flow created a different payment attempt instead of reusing the pending one.");
  }

  // eslint-disable-next-line no-console
  console.log("Razorpay resume-payment verification passed.");
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({
    user: options.emailOrMobile,
    orderId: order.id,
    productId: resolvedProductId,
    paymentMethod: options.paymentMethod,
    orderPaymentStatus: order.paymentStatus,
    firstPaymentId: firstIntent.id,
    secondPaymentId: secondIntent.id,
    secondIntentReused: secondIntent.reused === true,
    checkoutProvider: secondIntent.checkoutProvider,
    gatewayOrderId: secondIntent.checkout && secondIntent.checkout.orderId ? secondIntent.checkout.orderId : "",
    checkoutKeyPresent: Boolean(secondIntent.checkout && secondIntent.checkout.key)
  }, null, 2));
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
