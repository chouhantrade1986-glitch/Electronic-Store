const test = require("node:test");
const assert = require("node:assert/strict");

const {
  canCustomerRequestAfterSalesForOrder,
  createAfterSalesCase,
  getOpenAfterSalesCaseForOrder,
  updateAfterSalesCase
} = require("../src/lib/afterSalesCases");

test("createAfterSalesCase creates a requested case and blocks duplicate open cases", () => {
  const db = { afterSalesCases: [] };
  const order = {
    id: "order-1",
    userId: "user-1",
    paymentMethod: "card",
    status: "delivered",
    total: 199,
    items: [{ productId: "p1", quantity: 1 }]
  };

  const created = createAfterSalesCase(db, order, {
    type: "refund",
    reason: "damaged",
    requestedBy: "customer",
    customerEmail: "customer@example.com"
  });

  assert.equal(created.ok, true);
  assert.equal(created.caseItem.status, "requested");
  assert.equal(created.caseItem.type, "refund");
  assert.equal(getOpenAfterSalesCaseForOrder(db, "order-1").id, created.caseItem.id);

  const duplicate = createAfterSalesCase(db, order, {
    type: "exchange",
    reason: "wrong_item"
  });
  assert.equal(duplicate.ok, false);
  assert.equal(duplicate.status, 409);
});

test("updateAfterSalesCase enforces type-specific statuses", () => {
  const caseItem = {
    id: "case-1",
    orderId: "order-1",
    userId: "user-1",
    type: "refund",
    reason: "damaged",
    status: "requested",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: []
  };

  const invalid = updateAfterSalesCase(caseItem, {
    status: "exchange_processing"
  });
  assert.equal(invalid.ok, false);
  assert.equal(invalid.status, 400);

  const valid = updateAfterSalesCase(caseItem, {
    status: "refund_pending",
    actor: "admin"
  });
  assert.equal(valid.ok, true);
  assert.equal(caseItem.status, "refund_pending");
  assert.equal(Array.isArray(caseItem.timeline), true);
  assert.ok(caseItem.timeline.length >= 1);
});

test("canCustomerRequestAfterSalesForOrder only allows paid or authorized non-cancelled orders", () => {
  assert.equal(canCustomerRequestAfterSalesForOrder({
    id: "paid-order",
    status: "processing",
    paymentStatus: "paid"
  }), true);

  assert.equal(canCustomerRequestAfterSalesForOrder({
    id: "cod-order",
    status: "delivered",
    paymentStatus: "authorized"
  }), true);

  assert.equal(canCustomerRequestAfterSalesForOrder({
    id: "pending-order",
    status: "processing",
    paymentStatus: "pending"
  }), false);

  assert.equal(canCustomerRequestAfterSalesForOrder({
    id: "cancelled-order",
    status: "cancelled",
    paymentStatus: "paid"
  }), false);
});
