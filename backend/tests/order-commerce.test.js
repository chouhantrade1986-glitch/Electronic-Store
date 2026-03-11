const test = require("node:test");
const assert = require("node:assert/strict");

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
