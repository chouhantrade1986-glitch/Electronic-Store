const test = require("node:test");
const assert = require("node:assert/strict");

const previousEncryptionKey = process.env.PII_ENCRYPTION_KEY;
const previousJwtSecret = process.env.JWT_SECRET;
const previousDbProvider = process.env.DB_PROVIDER;
process.env.JWT_SECRET = "gift-card-integration-test-jwt-secret";
process.env.DB_PROVIDER = "json";
process.env.PII_ENCRYPTION_KEY = "gift-card-unit-test-encryption-secret-32";

const {
  generateGiftCardClaimCode,
  reserveOrderPaymentSources,
  finalizeOrderPaymentSources,
  releaseOrderPaymentSources,
  revokeGiftCardsForOrder,
  issueGiftCardsForOrder,
  listGiftCardsForUser,
  redeemGiftCard
} = require("../src/lib/giftCards");
const { createPaymentIntent, confirmPayment, refundPayment } = require("../src/lib/paymentLifecycle");

test.after(() => {
  if (previousEncryptionKey === undefined) {
    delete process.env.PII_ENCRYPTION_KEY;
  } else {
    process.env.PII_ENCRYPTION_KEY = previousEncryptionKey;
  }
  if (previousJwtSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = previousJwtSecret;
  }
  if (previousDbProvider === undefined) {
    delete process.env.DB_PROVIDER;
  } else {
    process.env.DB_PROVIDER = previousDbProvider;
  }
});

function createDb() {
  return {
    users: [
      { id: "buyer-1", role: "customer", walletBalance: 25 },
      { id: "buyer-2", role: "customer", walletBalance: 0 }
    ],
    orders: [],
    products: [],
    payments: [],
    orderNotifications: [],
    giftCards: [],
    giftCardRedemptions: []
  };
}

test("claim codes use a cryptographically secure, non-deterministic format", () => {
  const first = generateGiftCardClaimCode();
  const second = generateGiftCardClaimCode();
  assert.match(first, /^EM-GC-[A-F0-9]{6}-[A-F0-9]{6}-[A-F0-9]{6}-[A-F0-9]{6}$/);
  assert.notEqual(first, second);
});

test("gift cards are issued once and codes are recoverable only through buyer view", () => {
  const db = createDb();
  const order = {
    id: "order-1",
    userId: "buyer-1",
    paymentStatus: "paid",
    items: [{
      productId: "EM-GC-500",
      price: 500,
      quantity: 1,
      isGiftCard: true,
      giftCard: { recipientName: "Riya", recipientEmail: "riya@example.test" }
    }]
  };
  const issued = issueGiftCardsForOrder(db, order, {
    payment: { id: "payment-1", gatewayReference: "gateway-transaction-1" }
  });
  const replay = issueGiftCardsForOrder(db, order);

  assert.equal(issued.length, 1);
  assert.equal(replay[0].claimCode, issued[0].claimCode);
  assert.equal(db.giftCards[0].transactionHash, "gateway-transaction-1");
  assert.notEqual(db.giftCards[0].claimCodeEncrypted, issued[0].claimCode);
  assert.equal(listGiftCardsForUser(db, "buyer-1")[0].claimCode, issued[0].claimCode);
  assert.deepEqual(listGiftCardsForUser(db, "buyer-2"), []);
});

test("refunding the issuing order revokes its remaining gift card balance", () => {
  const db = createDb();
  const order = {
    id: "order-refunded",
    userId: "buyer-1",
    paymentStatus: "paid",
    items: [{
      productId: "EM-GC-500",
      price: 500,
      quantity: 1,
      isGiftCard: true,
      giftCard: { recipientEmail: "recipient@example.test" }
    }]
  };
  const [issued] = issueGiftCardsForOrder(db, order);
  const payment = { id: "payment-refunded", orderId: order.id, status: "captured", method: "upi", amount: 500 };

  const result = refundPayment(db, payment, order);

  assert.equal(result.refunded, true);
  assert.equal(db.giftCards[0].status, "revoked");
  assert.equal(db.giftCards[0].balance, 0);
  assert.equal(redeemGiftCard(db, "buyer-2", issued.claimCode).ok, false);
  assert.equal(reserveOrderPaymentSources(db, {
    orderId: "order-after-refund",
    userId: "buyer-2",
    claimCode: issued.claimCode,
    orderTotal: 250
  }).ok, false);
});

test("releasing an in-flight reservation cannot restore a revoked gift card", () => {
  const db = createDb();
  const [issued] = issueGiftCardsForOrder(db, {
    id: "order-reservation-revoked",
    userId: "buyer-1",
    paymentStatus: "paid",
    items: [{
      productId: "EM-GC-500",
      price: 500,
      quantity: 1,
      isGiftCard: true,
      giftCard: { recipientEmail: "recipient@example.test" }
    }]
  });
  reserveOrderPaymentSources(db, {
    orderId: "order-reservation",
    userId: "buyer-2",
    claimCode: issued.claimCode,
    orderTotal: 250
  });

  revokeGiftCardsForOrder(db, "order-reservation-revoked");
  releaseOrderPaymentSources(db, "order-reservation");

  assert.equal(db.giftCards[0].status, "revoked");
  assert.equal(db.giftCards[0].balance, 0);
});

test("checkout reserves gift card and wallet amounts against the server total", () => {
  const db = createDb();
  db.users.find((user) => user.id === "buyer-2").walletBalance = 25;
  const [issued] = issueGiftCardsForOrder(db, {
    id: "order-source",
    userId: "buyer-1",
    paymentStatus: "paid",
    items: [{
      productId: "EM-GC-500",
      price: 500,
      quantity: 1,
      isGiftCard: true,
      giftCard: { recipientEmail: "buyer@example.test" }
    }]
  });
  const result = reserveOrderPaymentSources(db, {
    orderId: "order-checkout",
    userId: "buyer-2",
    claimCode: issued.claimCode,
    orderTotal: 700,
    useWalletBalance: true,
    at: "2026-11-08T00:00:00.000Z"
  });

  assert.equal(result.ok, true);
  assert.deepEqual({
    giftCardAmount: result.giftCardAmount,
    walletAmount: result.walletAmount,
    amountDue: result.amountDue
  }, {
    giftCardAmount: 500,
    walletAmount: 25,
    amountDue: 175
  });
  assert.equal(db.giftCards[0].balance, 0);
  assert.equal(db.users.find((user) => user.id === "buyer-2").walletBalance, 0);

  const finalized = finalizeOrderPaymentSources(db, "order-checkout", "2026-11-08T00:02:00.000Z");
  assert.equal(finalized.ok, true);
  assert.equal(db.giftCards[0].status, "redeemed");
  assert.equal(db.giftCardRedemptions[0].status, "captured");
});

test("failed checkout releases gift card and wallet reservations exactly once", () => {
  const db = createDb();
  db.users.find((user) => user.id === "buyer-2").walletBalance = 25;
  const [issued] = issueGiftCardsForOrder(db, {
    id: "order-source-failure",
    userId: "buyer-1",
    paymentStatus: "paid",
    items: [{
      productId: "EM-GC-500",
      price: 500,
      quantity: 1,
      isGiftCard: true,
      giftCard: { recipientEmail: "buyer@example.test" }
    }]
  });
  const result = reserveOrderPaymentSources(db, {
    orderId: "order-checkout-failure",
    userId: "buyer-2",
    claimCode: issued.claimCode,
    orderTotal: 700,
    useWalletBalance: true
  });

  assert.equal(result.ok, true);
  assert.equal(releaseOrderPaymentSources(db, "order-checkout-failure").ok, true);
  assert.equal(releaseOrderPaymentSources(db, "order-checkout-failure").alreadyProcessed, true);
  assert.equal(db.giftCards[0].balance, 500);
  assert.equal(db.giftCards[0].status, "active");
  assert.equal(db.users.find((user) => user.id === "buyer-2").walletBalance, 25);
  assert.equal(db.paymentSourceReservations[0].status, "released");
});

test("gateway payment charges only the remainder and failed capture restores reserved sources", () => {
  const db = createDb();
  db.users.find((user) => user.id === "buyer-2").walletBalance = 25;
  const [issued] = issueGiftCardsForOrder(db, {
    id: "order-source-gateway",
    userId: "buyer-1",
    paymentStatus: "paid",
    items: [{
      productId: "EM-GC-500",
      price: 500,
      quantity: 1,
      isGiftCard: true,
      giftCard: { recipientEmail: "buyer@example.test" }
    }]
  });
  const allocation = reserveOrderPaymentSources(db, {
    orderId: "order-gateway",
    userId: "buyer-2",
    claimCode: issued.claimCode,
    orderTotal: 700,
    useWalletBalance: true
  });
  const order = {
    id: "order-gateway",
    userId: "buyer-2",
    total: 700,
    paymentMethod: "upi",
    paymentStatus: "pending",
    status: "processing",
    items: [],
    paymentBreakdown: {
      giftCardAmount: allocation.giftCardAmount,
      walletAmount: allocation.walletAmount,
      amountDue: allocation.amountDue
    }
  };
  db.orders.push(order);

  const intent = createPaymentIntent(db, order, db.users.find((user) => user.id === "buyer-2"), { method: "upi" });
  assert.equal(intent.payment.amount, 175);
  const result = confirmPayment(db, intent.payment, order, { details: { forceStatus: "failed" } });

  assert.equal(result.ok, false);
  assert.equal(result.status, 402);
  assert.equal(db.paymentSourceReservations[0].status, "released");
  assert.equal(db.giftCards[0].balance, 500);
  assert.equal(db.users.find((user) => user.id === "buyer-2").walletBalance, 25);
});

test("redemption credits only the authenticated user's server wallet and is single-use", () => {
  const db = createDb();
  const [issued] = issueGiftCardsForOrder(db, {
    id: "order-2",
    userId: "buyer-1",
    paymentStatus: "paid",
    items: [{
      productId: "EM-GC-1000",
      price: 1000,
      quantity: 1,
      isGiftCard: true,
      giftCard: { recipientName: "Sam", recipientEmail: "sam@example.test" }
    }]
  });

  const result = redeemGiftCard(db, "buyer-2", issued.claimCode);
  assert.equal(result.ok, true);
  assert.equal(result.amount, 1000);
  assert.equal(db.users.find((user) => user.id === "buyer-2").walletBalance, 1000);
  assert.equal(db.users.find((user) => user.id === "buyer-1").walletBalance, 25);
  assert.equal(db.giftCards[0].balance, 0);

  const duplicate = redeemGiftCard(db, "buyer-1", issued.claimCode);
  assert.equal(duplicate.ok, false);
  assert.equal(db.users.find((user) => user.id === "buyer-1").walletBalance, 25);
  assert.equal(db.giftCardRedemptions.length, 1);
});

test("gift-card API requires authentication and uses the token account for redemption", async (t) => {
  const { once } = require("node:events");
  const express = require("express");
  const { signToken } = require("../src/lib/auth");
  const dbModule = require("../src/lib/db");
  const { serializeDbMutations } = require("../src/middleware/writeLockMiddleware");
  const originalReadDb = dbModule.readDb;
  const originalWriteDb = dbModule.writeDb;
  const db = createDb();
  const [issued] = issueGiftCardsForOrder(db, {
    id: "order-api",
    userId: "buyer-1",
    paymentStatus: "paid",
    items: [{
      productId: "EM-GC-500",
      price: 500,
      quantity: 1,
      isGiftCard: true,
      giftCard: { recipientName: "Riya", recipientEmail: "riya@example.test" }
    }]
  });
  let fixtureDb = db;
  dbModule.readDb = () => structuredClone(fixtureDb);
  dbModule.writeDb = (nextDb) => {
    fixtureDb = structuredClone(nextDb);
  };
  t.after(() => {
    dbModule.readDb = originalReadDb;
    dbModule.writeDb = originalWriteDb;
  });

  const app = express();
  app.use(express.json());
  app.use(serializeDbMutations);
  app.use("/api/gift-cards", require("../src/routes/giftCardRoutes"));
  app.use("/api/payments", require("../src/routes/paymentRoutes"));
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(async () => {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  });

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const buyerToken = signToken({ id: "buyer-2", role: "customer", sessionVersion: 1 });
  const noAuth = await fetch(`${baseUrl}/api/gift-cards/balance`);
  assert.equal(noAuth.status, 401);

  const balanceResponse = await fetch(`${baseUrl}/api/gift-cards/balance`, {
    headers: { Authorization: `Bearer ${buyerToken}` }
  });
  assert.equal((await balanceResponse.json()).balance, 0);

  const redeemResponse = await fetch(`${baseUrl}/api/gift-cards/redeem`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${buyerToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ claimCode: issued.claimCode, userId: "buyer-1", amount: 10000 })
  });
  assert.equal(redeemResponse.status, 200);
  assert.deepEqual(await redeemResponse.json(), { amount: 500, balance: 500 });
  assert.equal(fixtureDb.users.find((user) => user.id === "buyer-2").walletBalance, 500);
  assert.equal(fixtureDb.users.find((user) => user.id === "buyer-1").walletBalance, 25);

  fixtureDb = createDb();
  fixtureDb.orders.push({
    id: "paid-gift-card-order",
    userId: "buyer-1",
    paymentMethod: "upi",
    paymentStatus: "pending",
    status: "processing",
    total: 250,
    items: [{
      productId: "EM-GC-250",
      price: 250,
      quantity: 1,
      isGiftCard: true,
      giftCard: { recipientName: "Asha", recipientEmail: "asha@example.test" }
    }]
  });
  const buyerOneToken = signToken({ id: "buyer-1", role: "customer", sessionVersion: 1 });
  const intentResponse = await fetch(`${baseUrl}/api/payments/intent`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${buyerOneToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ orderId: "paid-gift-card-order", method: "upi" })
  });
  assert.equal(intentResponse.status, 201);
  const intent = await intentResponse.json();
  const confirmResponse = await fetch(`${baseUrl}/api/payments/${intent.id}/confirm`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${buyerOneToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ details: {} })
  });
  assert.equal(confirmResponse.status, 200);
  const confirmation = await confirmResponse.json();
  assert.equal(confirmation.giftCards.length, 1);
  assert.match(confirmation.giftCards[0].claimCode, /^EM-GC-[A-F0-9]{6}-[A-F0-9]{6}-[A-F0-9]{6}-[A-F0-9]{6}$/);
  assert.equal(fixtureDb.orders[0].paymentStatus, "paid");
  assert.equal(fixtureDb.giftCards.length, 1);

  const replayResponse = await fetch(`${baseUrl}/api/payments/${intent.id}/confirm`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${buyerOneToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ details: {} })
  });
  const replay = await replayResponse.json();
  assert.equal(replay.giftCards[0].claimCode, confirmation.giftCards[0].claimCode);
  assert.equal(fixtureDb.giftCards.length, 1);

  fixtureDb.orders.push({
    id: "failed-gift-card-order",
    userId: "buyer-1",
    paymentMethod: "upi",
    paymentStatus: "pending",
    status: "processing",
    total: 250,
    items: [{
      productId: "EM-GC-250",
      price: 250,
      quantity: 1,
      isGiftCard: true,
      giftCard: { recipientName: "Asha", recipientEmail: "asha@example.test" }
    }]
  });
  const failedIntentResponse = await fetch(`${baseUrl}/api/payments/intent`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${buyerOneToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ orderId: "failed-gift-card-order", method: "upi" })
  });
  const failedIntent = await failedIntentResponse.json();
  const failedConfirm = await fetch(`${baseUrl}/api/payments/${failedIntent.id}/confirm`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${buyerOneToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ details: { forceStatus: "failed" } })
  });
  assert.equal(failedConfirm.status, 402);
  assert.equal(fixtureDb.giftCards.length, 1);
});
