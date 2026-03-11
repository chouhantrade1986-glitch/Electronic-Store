const test = require("node:test");
const assert = require("node:assert/strict");

const { shouldBypassGlobalWriteLock } = require("../src/middleware/writeLockMiddleware");

test("should bypass global lock for payment gateway routes", () => {
  assert.equal(shouldBypassGlobalWriteLock("POST", "/api/payments/intent"), true);
  assert.equal(shouldBypassGlobalWriteLock("POST", "/api/payments/payment-1/confirm"), true);
  assert.equal(shouldBypassGlobalWriteLock("POST", "/api/payments/payment-1/refund"), true);
  assert.equal(shouldBypassGlobalWriteLock("POST", "/api/payments/payment-1/cancel"), true);
});

test("should bypass global lock for drive upload and admin/customer cancellation endpoints", () => {
  assert.equal(shouldBypassGlobalWriteLock("POST", "/api/admin/media/upload-drive"), true);
  assert.equal(shouldBypassGlobalWriteLock("PATCH", "/api/admin/orders/order-1/status"), true);
  assert.equal(shouldBypassGlobalWriteLock("PATCH", "/api/orders/order-1/cancel"), true);
});

test("should keep global lock for unrelated mutating routes", () => {
  assert.equal(shouldBypassGlobalWriteLock("POST", "/api/orders"), false);
  assert.equal(shouldBypassGlobalWriteLock("PATCH", "/api/admin/inventory-settings"), false);
  assert.equal(shouldBypassGlobalWriteLock("DELETE", "/api/products/1"), false);
});
