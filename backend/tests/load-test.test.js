const test = require("node:test");
const assert = require("node:assert/strict");

const { resolveLoadTestConfig, runLoadTest } = require("../src/lib/loadTest");

test("resolveLoadTestConfig rejects remote targets without explicit opt-in", () => {
  assert.throws(() => resolveLoadTestConfig({
    baseUrl: "https://api.example.com/api"
  }), /allow-remote/i);
});

test("runLoadTest preserves explicit remote opt-in through config normalization", async () => {
  const report = await runLoadTest({
    baseUrl: "https://api.example.com/api",
    requests: 1,
    concurrency: 1,
    allowRemote: true,
    fetch: async () => ({ ok: true, status: 200 })
  });

  assert.equal(report.passed, true);
  assert.equal(report.target, "https://api.example.com/api");
});

test("resolveLoadTestConfig enforces finite request and concurrency bounds", () => {
  assert.throws(() => resolveLoadTestConfig({
    baseUrl: "http://127.0.0.1:4000/api",
    requests: 0
  }), /requests/i);
  assert.throws(() => resolveLoadTestConfig({
    baseUrl: "http://127.0.0.1:4000/api",
    concurrency: 101
  }), /concurrency/i);
  assert.throws(() => resolveLoadTestConfig({
    baseUrl: "http://127.0.0.1:4000/api",
    paths: ["/orders/checkout"]
  }), /read-only/i);
});

test("runLoadTest respects concurrency and reports status and latency metrics", async () => {
  let activeRequests = 0;
  let maxActiveRequests = 0;
  const report = await runLoadTest({
    baseUrl: "http://127.0.0.1:4000/api",
    paths: ["/health", "/metrics"],
    requests: 12,
    concurrency: 3,
    fetch: async () => {
      activeRequests += 1;
      maxActiveRequests = Math.max(maxActiveRequests, activeRequests);
      await new Promise((resolve) => setTimeout(resolve, 3));
      activeRequests -= 1;
      return { ok: true, status: 200 };
    }
  });

  assert.equal(report.passed, true);
  assert.equal(report.requests.total, 12);
  assert.equal(report.requests.succeeded, 12);
  assert.equal(report.requests.failed, 0);
  assert.equal(report.requests.statusCodes["200"], 12);
  assert.equal(maxActiveRequests, 3);
  assert.equal(report.latency.p50Ms >= 0, true);
  assert.equal(report.latency.p95Ms >= report.latency.p50Ms, true);
  assert.equal(report.throughput.requestsPerSecond > 0, true);
});

test("runLoadTest marks HTTP errors as failed without aborting the batch", async () => {
  let requestNumber = 0;
  const report = await runLoadTest({
    baseUrl: "http://127.0.0.1:4000/api",
    paths: ["/health"],
    requests: 4,
    concurrency: 2,
    fetch: async () => {
      requestNumber += 1;
      return { ok: requestNumber !== 2, status: requestNumber === 2 ? 503 : 200 };
    }
  });

  assert.equal(report.passed, false);
  assert.equal(report.requests.total, 4);
  assert.equal(report.requests.succeeded, 3);
  assert.equal(report.requests.failed, 1);
  assert.equal(report.requests.statusCodes["503"], 1);
});