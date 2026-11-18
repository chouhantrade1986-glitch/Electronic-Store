const test = require("node:test");
const assert = require("node:assert/strict");
const { after, before, describe, it } = test;

const {
  buildOrderPricing,
  normalizeCorporateOrderDetails
} = require("../src/lib/orderCommerce");

test("normalizeCorporateOrderDetails validates GSTIN and records bulk invoice intent", () => {
  const result = normalizeCorporateOrderDetails({
    companyName: "Acme Technologies Pvt Ltd",
    poNumber: "PO-2026-001",
    gstin: "27AAACA1234A1Z5",
    billingAddress: "Mumbai, Maharashtra",
    requestBulkInvoice: true
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.details, {
    companyName: "Acme Technologies Pvt Ltd",
    poNumber: "PO-2026-001",
    gstin: "27AAACA1234A1Z5",
    gstinVerificationStatus: "pending_external_verification",
    billingAddress: "Mumbai, Maharashtra",
    requestBulkInvoice: true
  });
});

test("normalizeCorporateOrderDetails rejects malformed GSTIN and incomplete invoice details", () => {
  const invalidGstin = normalizeCorporateOrderDetails({
    companyName: "Acme Technologies",
    gstin: "not-a-gstin",
    requestBulkInvoice: true
  });
  const incompleteInvoice = normalizeCorporateOrderDetails({
    companyName: "Acme Technologies",
    requestBulkInvoice: true
  });

  assert.equal(invalidGstin.ok, false);
  assert.equal(invalidGstin.status, 400);
  assert.equal(incompleteInvoice.ok, false);
  assert.equal(incompleteInvoice.status, 400);
});

test("buildOrderPricing rejects b2b quantities below MOQ", () => {
  const result = buildOrderPricing(
    [
      {
        productId: "bulk-1",
        quantity: 1
      }
    ],
    [
      {
        id: "bulk-1",
        name: "Bulk Laptop Pack",
        category: "laptop",
        segment: "b2b",
        price: 5000,
        stock: 20,
        moq: 5,
        status: "active"
      }
    ]
  );

  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
  assert.match(result.message, /minimum order quantity/i);
});

test("buildOrderPricing accepts b2b quantities at MOQ", () => {
  const result = buildOrderPricing(
    [
      {
        productId: "bulk-1",
        quantity: 5
      }
    ],
    [
      {
        id: "bulk-1",
        name: "Bulk Laptop Pack",
        category: "laptop",
        segment: "b2b",
        price: 5000,
        stock: 20,
        moq: 5,
        status: "active"
      }
    ]
  );

  assert.equal(result.ok, true);
  assert.equal(result.items[0].quantity, 5);
});

describe("POST /api/orders edge cases", () => {
  const previousDbProvider = process.env.DB_PROVIDER;
  const previousJwtSecret = process.env.JWT_SECRET;
  const previousPiiEncryptionKey = process.env.PII_ENCRYPTION_KEY;
  process.env.DB_PROVIDER = "json";
  process.env.JWT_SECRET = "checkout-route-test-secret-2026";
  process.env.PII_ENCRYPTION_KEY = "checkout-route-pii-test-secret-2026-32chars";

  const dbModule = require("../src/lib/db");
  const originalReadDb = dbModule.readDb;
  const originalWriteDb = dbModule.writeDb;
  let fixtureDb;

  dbModule.readDb = () => structuredClone(fixtureDb);
  dbModule.writeDb = (nextDb) => {
    fixtureDb = structuredClone(nextDb);
  };

  const express = require("express");
  const { once } = require("node:events");
  const { signToken } = require("../src/lib/auth");
  const { issueGiftCardsForOrder } = require("../src/lib/giftCards");
  const piiEncryption = require("../src/middleware/piiEncryption");
  const { serializeDbMutations } = require("../src/middleware/writeLockMiddleware");
  const orderRoutes = require("../src/routes/orderRoutes");
  const exchangeRoutes = require("../src/routes/exchangeRoutes");
  const app = express();
  app.use(express.json());
  app.use(piiEncryption);
  app.use(serializeDbMutations);
  app.use("/api/orders", orderRoutes);
  app.use("/api/exchange", exchangeRoutes);

  let server;
  let apiBaseUrl;

  function createFixtureDb(stock = 5, price = 100) {
    return {
      users: [
        { id: "customer-1", role: "customer", email: "one@example.test", sessionVersion: 1, walletBalance: 20 },
        { id: "customer-2", role: "customer", email: "two@example.test", sessionVersion: 1, walletBalance: 0 }
      ],
      products: [{ id: "product-1", name: "Test Laptop", price, stock, status: "active" }],
      orders: [],
      exchangeQuotes: [],
      payments: [],
      giftCards: [],
      giftCardRedemptions: [],
      paymentSourceReservations: [],
      orderNotifications: [],
      corporateInvoices: [],
      afterSalesCases: []
    };
  }

  function tokenFor(userId) {
    return signToken({ id: userId, role: "customer", sessionVersion: 1 });
  }

  function postOrder(userId, body, idempotencyKey) {
    const headers = {
      Authorization: `Bearer ${tokenFor(userId)}`,
      "Content-Type": "application/json"
    };
    const requestBody = idempotencyKey ? { ...body, idempotencyKey } : body;
    return fetch(`${apiBaseUrl}/api/orders`, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody)
    });
  }

  function postExchangeQuote(userId, body) {
    return fetch(`${apiBaseUrl}/api/exchange/quote`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenFor(userId)}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
  }

  before(async () => {
    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    apiBaseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
      });
    }
    dbModule.readDb = originalReadDb;
    dbModule.writeDb = originalWriteDb;
    if (previousDbProvider === undefined) {
      delete process.env.DB_PROVIDER;
    } else {
      process.env.DB_PROVIDER = previousDbProvider;
    }
    if (previousJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = previousJwtSecret;
    }
    if (previousPiiEncryptionKey === undefined) {
      delete process.env.PII_ENCRYPTION_KEY;
    } else {
      process.env.PII_ENCRYPTION_KEY = previousPiiEncryptionKey;
    }
  });

  it("rejects checkout when the submitted subtotal is stale", async () => {
    const checkoutSubtotal = createFixtureDb().products[0].price;
    fixtureDb = createFixtureDb(5, 125);

    const response = await postOrder("customer-1", {
      items: [{ productId: "product-1", quantity: 1 }],
      shippingAddress: "Test address",
      paymentMethod: "upi",
      expectedSubtotal: checkoutSubtotal
    });

    assert.equal(response.status, 409);
    assert.equal((await response.json()).code, "CART_CHANGED");
    assert.equal(fixtureDb.orders.length, 0);
    assert.equal(fixtureDb.products[0].stock, 5);
  });

  it("persists validated corporate invoice requests with the order ledger", async () => {
    fixtureDb = createFixtureDb(5, 100);
    const response = await postOrder("customer-1", {
      items: [{ productId: "product-1", quantity: 1 }],
      shippingAddress: "Test address",
      paymentMethod: "upi",
      corporateDetails: {
        companyName: "Acme Technologies Pvt Ltd",
        poNumber: "PO-2026-001",
        gstin: "27AAACA1234A1Z5",
        billingAddress: "Mumbai, Maharashtra",
        requestBulkInvoice: true
      }
    });
    const payload = await response.json();

    assert.equal(response.status, 201);
    assert.equal(payload.corporateDetails.gstinVerificationStatus, "pending_external_verification");
    assert.ok(payload.bulkInvoiceRequestId);
    assert.equal(fixtureDb.orders[0].bulkInvoiceRequestId, payload.bulkInvoiceRequestId);
    assert.equal(fixtureDb.corporateInvoices[0].orderId, payload.id);
    assert.equal(fixtureDb.corporateInvoices[0].status, "requested");

    fixtureDb = createFixtureDb(5, 100);
    const rejected = await postOrder("customer-1", {
      items: [{ productId: "product-1", quantity: 1 }],
      shippingAddress: "Test address",
      paymentMethod: "upi",
      corporateDetails: {
        companyName: "Acme Technologies",
        poNumber: "PO-2026-002",
        gstin: "INVALID",
        billingAddress: "Mumbai",
        requestBulkInvoice: true
      }
    });
    assert.equal(rejected.status, 400);
    assert.equal(fixtureDb.orders.length, 0);
    assert.equal(fixtureDb.corporateInvoices.length, 0);
  });

  it("prices gift cards on the server and stores recipient details for paid issuance", async () => {
    fixtureDb = createFixtureDb(10, 100);
    const body = {
      items: [{
        productId: "EM-GC-500",
        quantity: 1,
        price: 1,
        giftCard: {
          recipientName: "Riya",
          recipientEmail: "riya@example.test",
          senderName: "Sam",
          giftMessage: "Happy birthday"
        }
      }],
      expectedSubtotal: 500,
      shippingAddress: "Test address",
      paymentMethod: "upi"
    };

    const response = await postOrder("customer-1", body, "gift-card-order-1");
    const payload = await response.json();

    assert.equal(response.status, 201);
    assert.equal(payload.subtotal, 500);
    assert.equal(payload.items[0].price, 500);
    assert.equal(payload.items[0].isGiftCard, true);
    assert.equal(payload.items[0].giftCard.recipientEmail, "riya@example.test");
    assert.equal(fixtureDb.orders[0].items[0].giftCard.recipientEmail, "riya@example.test");
    assert.equal(fixtureDb.products[0].stock, 10);

    const changedRecipientReplay = await postOrder("customer-1", {
      ...body,
      items: [{
        ...body.items[0],
        giftCard: { ...body.items[0].giftCard, recipientEmail: "other@example.test" }
      }]
    }, "gift-card-order-1");
    assert.equal(changedRecipientReplay.status, 409);
  });

  it("rejects cash-on-delivery and malformed gift card purchases", async () => {
    fixtureDb = createFixtureDb(10, 100);
    const cashOnDelivery = await postOrder("customer-1", {
      items: [{
        productId: "EM-GC-500",
        quantity: 1,
        giftCard: { recipientEmail: "riya@example.test" }
      }],
      shippingAddress: "Test address",
      paymentMethod: "cod"
    });
    assert.equal(cashOnDelivery.status, 400);

    const malformed = await postOrder("customer-1", {
      items: [{
        productId: "EM-GC-50000",
        quantity: 1,
        giftCard: { recipientEmail: "riya@example.test" }
      }],
      shippingAddress: "Test address",
      paymentMethod: "upi"
    });
    assert.equal(malformed.status, 400);
    assert.equal(fixtureDb.orders.length, 0);
    assert.equal(fixtureDb.products[0].stock, 10);
  });

  it("reserves server-priced gift card and wallet tenders and charges only the remainder", async () => {
    fixtureDb = createFixtureDb(5, 1000);
    const [issued] = issueGiftCardsForOrder(fixtureDb, {
      id: "paid-gift-card-seed",
      userId: "customer-2",
      paymentStatus: "paid",
      items: [{
        productId: "EM-GC-500",
        price: 500,
        quantity: 1,
        isGiftCard: true,
        giftCard: { recipientEmail: "two@example.test" }
      }]
    });

    const response = await postOrder("customer-1", {
      items: [{ productId: "product-1", quantity: 1 }],
      shippingAddress: "Test address",
      paymentMethod: "upi",
      expectedSubtotal: 1000,
      giftCardClaimCode: issued.claimCode,
      useWalletBalance: true,
      giftCardAmount: 99999,
      walletAmount: 99999
    });
    const order = await response.json();

    assert.equal(response.status, 201);
    assert.deepEqual({
      giftCardAmount: order.paymentBreakdown.giftCardAmount,
      walletAmount: order.paymentBreakdown.walletAmount,
      amountDue: order.paymentBreakdown.amountDue
    }, { giftCardAmount: 500, walletAmount: 20, amountDue: 679 });
    assert.equal(fixtureDb.giftCards[0].balance, 0);
    assert.equal(fixtureDb.users.find((user) => user.id === "customer-1").walletBalance, 0);
    assert.equal(fixtureDb.paymentSourceReservations[0].status, "reserved");
    assert.equal(JSON.stringify(fixtureDb.orders[0]).includes(issued.claimCode), false);
  });

  it("marks an order paid without creating a gateway balance when the server tenders cover it", async () => {
    fixtureDb = createFixtureDb(5, 100);
    const [issued] = issueGiftCardsForOrder(fixtureDb, {
      id: "paid-gift-card-full-seed",
      userId: "customer-2",
      paymentStatus: "paid",
      items: [{
        productId: "EM-GC-500",
        price: 500,
        quantity: 1,
        isGiftCard: true,
        giftCard: { recipientEmail: "two@example.test" }
      }]
    });

    const response = await postOrder("customer-1", {
      items: [{ productId: "product-1", quantity: 1 }],
      shippingAddress: "Test address",
      paymentMethod: "upi",
      expectedSubtotal: 100,
      giftCardClaimCode: issued.claimCode
    });
    const order = await response.json();

    assert.equal(response.status, 201);
    assert.equal(order.paymentStatus, "paid");
    assert.equal(order.paymentBreakdown.amountDue, 0);
    assert.equal(order.paymentBreakdown.settlementStatus, "captured");
    assert.equal(fixtureDb.giftCardRedemptions.length, 1);
    assert.equal(fixtureDb.giftCardRedemptions[0].status, "captured");
  });

  it("issues gift cards immediately when wallet balance fully covers their purchase", async () => {
    fixtureDb = createFixtureDb(5, 100);
    fixtureDb.users.find((user) => user.id === "customer-1").walletBalance = 1000;

    const response = await postOrder("customer-1", {
      items: [{
        productId: "EM-GC-500",
        quantity: 1,
        giftCard: { recipientName: "Riya", recipientEmail: "riya@example.test" }
      }],
      shippingAddress: "Test address",
      paymentMethod: "upi",
      expectedSubtotal: 500,
      useWalletBalance: true
    });
    const order = await response.json();

    assert.equal(response.status, 201);
    assert.equal(order.paymentStatus, "paid");
    assert.equal(order.paymentBreakdown.amountDue, 0);
    assert.equal(order.giftCards.length, 1);
    assert.match(order.giftCards[0].claimCode, /^EM-GC-[A-F0-9]{6}-[A-F0-9]{6}-[A-F0-9]{6}-[A-F0-9]{6}$/);
    assert.equal(fixtureDb.giftCards.length, 1);
  });

  it("rejects client-supplied exchange discounts without a server-issued quote", async () => {
    fixtureDb = createFixtureDb(10, 100);
    const response = await postOrder("customer-1", {
      items: [{ productId: "product-1", quantity: 1 }],
      expectedSubtotal: 100,
      shippingAddress: "Test address",
      paymentMethod: "upi",
      exchangeDiscount: 1000
    });

    assert.equal(response.status, 400);
    assert.equal(fixtureDb.orders.length, 0);
    assert.equal(fixtureDb.products[0].stock, 10);
  });

  it("issues a server-priced quote and subtracts it from the order total once", async () => {
    fixtureDb = createFixtureDb(10, 100);
    const quoteResponse = await postExchangeQuote("customer-1", {
      targetProductId: "product-1",
      category: "laptops",
      brand: "Dell",
      modelName: "Dell Inspiron 15 Core i5",
      condition: { power: "yes", screen: "flawless", body: "flawless" }
    });
    const quote = await quoteResponse.json();
    assert.equal(quoteResponse.status, 201);
    assert.equal(quote.discountAmount, 100);

    const body = {
      items: [{ productId: "product-1", quantity: 1 }],
      expectedSubtotal: 100,
      shippingAddress: "Test address",
      paymentMethod: "upi",
      exchangeQuoteIds: [quote.quoteId],
      exchangeImeiByQuote: { [quote.quoteId]: "SERIAL1234" }
    };

    const response = await postOrder("customer-1", body, "exchange-checkout-1");
    const payload = await response.json();

    assert.equal(response.status, 201);
    assert.equal(payload.exchangeDiscount, 100);
    assert.equal(payload.total, 37);
    assert.equal(payload.subtotal, 100);
    assert.equal(fixtureDb.orders[0].total, 37);
    assert.equal(fixtureDb.orders[0].exchangeDiscount, 100);
    assert.notEqual(fixtureDb.orders[0].shippingAddress, body.shippingAddress);
    assert.equal(payload.shippingAddress, body.shippingAddress);
    assert.equal(fixtureDb.orders[0].exchangeDetails[0].discountAmount, 100);
    assert.notEqual(fixtureDb.orders[0].exchangeDetails[0].imeiEncrypted, "SERIAL1234");
    const { decryptPiiValue } = require("../src/middleware/piiEncryption");
    assert.equal(decryptPiiValue(fixtureDb.orders[0].exchangeDetails[0].imeiEncrypted), "SERIAL1234");
    assert.equal(fixtureDb.exchangeQuotes[0].status, "USED");
    assert.equal(fixtureDb.exchangeQuotes[0].orderId, payload.id);

    const replay = await postOrder("customer-1", body, "exchange-checkout-1");
    assert.equal(replay.status, 200);
    assert.equal((await replay.json()).id, payload.id);
  });

  it("rejects an exchange quote used by another account", async () => {
    fixtureDb = createFixtureDb(10, 100);
    const quoteResponse = await postExchangeQuote("customer-1", {
      targetProductId: "product-1",
      category: "laptops",
      brand: "Dell",
      modelName: "Dell Inspiron 15 Core i5",
      condition: { power: "yes", screen: "flawless", body: "flawless" }
    });
    const quote = await quoteResponse.json();
    const response = await postOrder("customer-2", {
      items: [{ productId: "product-1", quantity: 1 }],
      shippingAddress: "Test address",
      paymentMethod: "upi",
      exchangeQuoteIds: [quote.quoteId],
      exchangeImeiByQuote: { [quote.quoteId]: "SERIAL1234" }
    });

    assert.equal(response.status, 403);
    assert.equal(fixtureDb.orders.length, 0);
    assert.equal(fixtureDb.products[0].stock, 10);
  });

  it("rejects quote redemption when its target product is not in the order", async () => {
    fixtureDb = createFixtureDb(10, 100);
    const quoteResponse = await postExchangeQuote("customer-1", {
      targetProductId: "product-1",
      category: "laptops",
      brand: "Dell",
      modelName: "Dell Inspiron 15 Core i5",
      condition: { power: "yes", screen: "flawless", body: "flawless" }
    });
    const quote = await quoteResponse.json();
    const response = await postOrder("customer-1", {
      items: [{ productId: "another-product", quantity: 1 }],
      shippingAddress: "Test address",
      paymentMethod: "upi",
      exchangeQuoteIds: [quote.quoteId]
    });

    assert.equal(response.status, 404);
    assert.equal(fixtureDb.orders.length, 0);
    assert.equal(fixtureDb.products[0].stock, 10);
  });

  it("allows only one concurrent order to redeem an exchange quote", async () => {
    fixtureDb = createFixtureDb(10, 100);
    const quoteResponse = await postExchangeQuote("customer-1", {
      targetProductId: "product-1",
      category: "laptops",
      brand: "Dell",
      modelName: "Dell Inspiron 15 Core i5",
      condition: { power: "yes", screen: "flawless", body: "flawless" }
    });
    const quote = await quoteResponse.json();
    const body = {
      items: [{ productId: "product-1", quantity: 1 }],
      shippingAddress: "Test address",
      paymentMethod: "upi",
      exchangeQuoteIds: [quote.quoteId],
      exchangeImeiByQuote: { [quote.quoteId]: "SERIAL1234" }
    };
    const responses = await Promise.all([
      postOrder("customer-1", body, "exchange-attempt-a"),
      postOrder("customer-1", body, "exchange-attempt-b")
    ]);

    assert.deepEqual(responses.map((response) => response.status).sort(), [201, 409]);
    assert.equal(fixtureDb.orders.length, 1);
    assert.equal(fixtureDb.products[0].stock, 9);
  });

  it("creates only one order for concurrent requests with the same idempotency key", async () => {
    fixtureDb = createFixtureDb();
    const body = {
      items: [{ productId: "product-1", quantity: 1 }],
      expectedSubtotal: 100,
      shippingAddress: "Test address",
      paymentMethod: "upi"
    };

    const responses = await Promise.all([
      postOrder("customer-1", body, "same-checkout-attempt"),
      postOrder("customer-1", body, "same-checkout-attempt")
    ]);
    const statuses = responses.map((response) => response.status);
    const orders = await Promise.all(responses.map((response) => response.json()));

    assert.equal(statuses.filter((status) => status === 201).length, 1);
    assert.equal(statuses.filter((status) => status === 200).length, 1);
    assert.equal(fixtureDb.orders.length, 1);
    assert.equal(orders[0].id, orders[1].id);
  });

  it("allows only one buyer to reserve the final unit during concurrent checkout", async () => {
    fixtureDb = createFixtureDb(1);
    const body = {
      items: [{ productId: "product-1", quantity: 1 }],
      shippingAddress: "Test address",
      paymentMethod: "upi"
    };

    const responses = await Promise.all([
      postOrder("customer-1", body),
      postOrder("customer-2", body)
    ]);
    const statuses = responses.map((response) => response.status);

    assert.equal(statuses.filter((status) => status === 201).length, 1);
    assert.equal(statuses.filter((status) => status === 409).length, 1);
    assert.equal(fixtureDb.orders.length, 1);
    assert.equal(fixtureDb.products[0].stock, 0);
  });
});
