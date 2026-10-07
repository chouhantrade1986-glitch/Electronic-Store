const test = require("node:test");
const assert = require("node:assert/strict");
const { after, before, describe, it } = test;

const { buildOrderPricing } = require("../src/lib/orderCommerce");

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
  process.env.DB_PROVIDER = "json";
  process.env.JWT_SECRET = "checkout-route-test-secret-2026";

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
  const { serializeDbMutations } = require("../src/middleware/writeLockMiddleware");
  const orderRoutes = require("../src/routes/orderRoutes");
  const app = express();
  app.use(express.json());
  app.use(serializeDbMutations);
  app.use("/api/orders", orderRoutes);

  let server;
  let apiBaseUrl;

  function createFixtureDb(stock = 5, price = 100) {
    return {
      users: [
        { id: "customer-1", role: "customer", email: "one@example.test", sessionVersion: 1 },
        { id: "customer-2", role: "customer", email: "two@example.test", sessionVersion: 1 }
      ],
      products: [{ id: "product-1", name: "Test Laptop", price, stock, status: "active" }],
      orders: [],
      payments: [],
      orderNotifications: [],
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
