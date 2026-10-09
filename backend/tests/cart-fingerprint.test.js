const test = require("node:test");
const assert = require("node:assert/strict");

const { buildCartFingerprint } = require("../src/lib/cartFingerprint");

test("buildCartFingerprint changes when cart contents or exchange discount changes", () => {
  const base = buildCartFingerprint({
    rows: [
      { id: "p-1", quantity: 1, price: 100 },
      { id: "p-2", quantity: 2, price: 50 }
    ],
    paymentMethod: "upi",
    couponCode: "SAVE10",
    exchangeDiscount: 25,
    exchangeDetails: [{ targetProductId: "p-1", discountAmount: 25 }],
    deliverySlot: { id: "slot-1" }
  });

  const changedCart = buildCartFingerprint({
    rows: [
      { id: "p-1", quantity: 1, price: 100 },
      { id: "p-3", quantity: 1, price: 75 }
    ],
    paymentMethod: "upi",
    couponCode: "SAVE10",
    exchangeDiscount: 25,
    exchangeDetails: [{ targetProductId: "p-1", discountAmount: 25 }],
    deliverySlot: { id: "slot-1" }
  });

  const changedDiscount = buildCartFingerprint({
    rows: [
      { id: "p-1", quantity: 1, price: 100 },
      { id: "p-2", quantity: 2, price: 50 }
    ],
    paymentMethod: "upi",
    couponCode: "SAVE10",
    exchangeDiscount: 40,
    exchangeDetails: [{ targetProductId: "p-1", discountAmount: 40 }],
    deliverySlot: { id: "slot-1" }
  });

  assert.notEqual(base, changedCart);
  assert.notEqual(base, changedDiscount);
});
