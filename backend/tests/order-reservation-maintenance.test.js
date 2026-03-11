const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildReservationUntil,
  expireStaleReservationsInMemory,
  hasExpiredReservation
} = require("../src/lib/orderReservationMaintenance");

test("buildReservationUntil returns blank for COD orders", () => {
  const result = buildReservationUntil("cod", "", "2026-03-07T00:00:00.000Z");
  assert.equal(result, "");
});

test("buildReservationUntil creates a future timestamp for online orders", () => {
  const result = buildReservationUntil("upi", "", "2026-03-07T00:00:00.000Z");
  assert.ok(result);
  assert.ok(new Date(result).getTime() > new Date("2026-03-07T00:00:00.000Z").getTime());
});

test("expireStaleReservationsInMemory cancels expired pending online orders and restores stock", () => {
  const db = {
    products: [
      {
        id: "1",
        name: "AstraBook Pro 14",
        stock: 8
      }
    ],
    orders: [
      {
        id: "order-1",
        userId: "user-1",
        paymentMethod: "upi",
        paymentStatus: "pending",
        reservationUntil: "2026-03-06T23:00:00.000Z",
        status: "processing",
        items: [
          {
            productId: "1",
            name: "AstraBook Pro 14",
            quantity: 2
          }
        ],
        inventoryReservation: {
          deductedAt: "2026-03-06T22:00:00.000Z",
          releasedAt: null,
          releasedReason: ""
        },
        statusHistory: [
          {
            key: "ordered",
            status: "processing",
            label: "Order placed",
            createdAt: "2026-03-06T22:00:00.000Z",
            inferred: false
          }
        ],
        createdAt: "2026-03-06T22:00:00.000Z",
        total: 1998
      }
    ],
    payments: [
      {
        id: "payment-1",
        orderId: "order-1",
        userId: "user-1",
        method: "upi",
        provider: "simulated",
        status: "requires_confirmation",
        amount: 1998,
        currency: "INR",
        attempt: 1,
        createdAt: "2026-03-06T22:00:00.000Z",
        updatedAt: "2026-03-06T22:00:00.000Z",
        timeline: []
      }
    ]
  };

  const beforeOrder = db.orders[0];
  assert.equal(hasExpiredReservation(beforeOrder, "2026-03-07T00:00:00.000Z"), true);

  const result = expireStaleReservationsInMemory(db, {
    at: "2026-03-07T00:00:00.000Z"
  });

  assert.equal(result.changed, true);
  assert.equal(result.expiredCount, 1);
  assert.equal(db.orders[0].status, "cancelled");
  assert.equal(db.orders[0].paymentStatus, "cancelled");
  assert.equal(db.products[0].stock, 10);
  assert.equal(db.payments[0].status, "cancelled");
  assert.equal(db.orders[0].inventoryReservation.releasedReason, "reservation-expired");
});
