const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("http");

const {
  resolveLoadTestConfig,
  runLoadTest
} = require("../src/lib/loadTest");

function startLocalServer(handle) {
  return new Promise((resolve) => {
    const server = http.createServer(handle);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

test("resolveLoadTestConfig rejects remote targets by default", () => {
  assert.throws(() => resolveLoadTestConfig({
    baseUrl: "https://example.com",
    allowRemote: false
  }), /remote load targets/i);
});

test("resolveLoadTestConfig accepts local loopback targets", () => {
  const config = resolveLoadTestConfig({
    baseUrl: "http://127.0.0.1:4000/api",
    allowRemote: false
  });
  assert.equal(config.baseUrl, "http://127.0.0.1:4000/api");
});

test("runLoadTest sends bounded concurrent requests and records summary statistics", async () => {
  const { server, port } = await startLocalServer((req, res) => {
    const safePath = req.url.startsWith("/api/") ? req.url : "/api/health";
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, path: safePath, requests: { total: 1 } }));
  });

  try {
    const report = await runLoadTest({
      baseUrl: `http://127.0.0.1:${port}/api`,
      requests: 6,
      concurrency: 2,
      timeoutMs: 1500,
      paths: ["/health", "/metrics"],
      allowRemote: false
    });

    assert.equal(report.passed, true);
    assert.equal(report.requests.total, 6);
    assert.equal(report.requests.succeeded, 6);
    assert.equal(report.config.concurrency, 2);
    assert.ok(report.latency.p95Ms >= 0);
    assert.ok(Array.isArray(report.errors));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("runLoadTest returns failure details when any request hits an error", async () => {
  const { server, port } = await startLocalServer((req, res) => {
    if (req.url === "/api/metrics") {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, message: "simulated failure" }));
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
  });

  try {
    const report = await runLoadTest({
      baseUrl: `http://127.0.0.1:${port}/api`,
      requests: 4,
      concurrency: 2,
      timeoutMs: 1500,
      paths: ["/health", "/metrics"],
      allowRemote: false
    });

    assert.equal(report.passed, false);
    assert.equal(report.requests.succeeded < report.requests.total, true);
    assert.ok(report.errors.length >= 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
