const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getMetricsSnapshot,
  normalizeRoutePath,
  recordHttpRequest,
  resetMonitoringStateForTesting
} = require("../src/lib/monitoring");

test("normalizeRoutePath redacts id-like path segments", () => {
  const normalized = normalizeRoutePath("/api/orders/123/items/550e8400-e29b-41d4-a716-446655440000");
  assert.equal(normalized, "/api/orders/:id/items/:id");
});

test("recordHttpRequest updates totals, rates, and route breakdown", () => {
  resetMonitoringStateForTesting();
  const originalNow = Date.now;
  let now = 1_000_000;
  Date.now = () => now;

  try {
    recordHttpRequest({
      method: "GET",
      path: "/api/orders/123",
      statusCode: 200,
      durationMs: 40
    });
    now += 20_000;
    recordHttpRequest({
      method: "POST",
      path: "/api/payments/intent",
      statusCode: 201,
      durationMs: 60
    });
    now += 50_000;
    recordHttpRequest({
      method: "GET",
      path: "/api/orders/999",
      statusCode: 503,
      durationMs: 120
    });

    const snapshot = getMetricsSnapshot();
    assert.equal(snapshot.requests.total, 3);
    assert.equal(snapshot.requests.errors, 1);
    assert.equal(snapshot.requests.lastMinute, 2);
    assert.equal(snapshot.requests.lastFiveMinutes, 3);
    assert.equal(snapshot.breakdown.statusCodes["200"], 1);
    assert.equal(snapshot.breakdown.statusCodes["201"], 1);
    assert.equal(snapshot.breakdown.statusCodes["503"], 1);
    assert.equal(snapshot.breakdown.topRoutes["GET /api/orders/:id"], 2);
    assert.equal(snapshot.breakdown.topRoutes["POST /api/payments/intent"], 1);

    now += 6 * 60 * 1000;
    const prunedSnapshot = getMetricsSnapshot();
    assert.equal(prunedSnapshot.requests.total, 3);
    assert.equal(prunedSnapshot.requests.lastFiveMinutes, 0);
  } finally {
    Date.now = originalNow;
    resetMonitoringStateForTesting();
  }
});
