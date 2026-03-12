const test = require("node:test");
const assert = require("node:assert/strict");

const {
  evaluateReleaseVerification,
  resolveReleaseVerificationConfig,
  verifyReleaseHealth
} = require("../src/lib/releaseVerification");

function createJsonResponse(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() {
      return JSON.stringify(payload);
    }
  };
}

test("resolveReleaseVerificationConfig applies defaults and trims base url", () => {
  const config = resolveReleaseVerificationConfig({
    RELEASE_VERIFY_API_BASE_URL: "https://api.example.com/api///",
    RELEASE_VERIFY_MAX_ATTEMPTS: "7",
    RELEASE_VERIFY_RETRY_MS: "9000",
    RELEASE_VERIFY_REQUEST_TIMEOUT_MS: "3000"
  });

  assert.equal(config.apiBaseUrl, "https://api.example.com/api");
  assert.equal(config.maxAttempts, 7);
  assert.equal(config.retryMs, 9000);
  assert.equal(config.requestTimeoutMs, 3000);
});

test("evaluateReleaseVerification returns pass for healthy snapshots", () => {
  const report = evaluateReleaseVerification({
    ok: true,
    status: "ok",
    dependencies: {
      datastore: { healthy: true, provider: "json" },
      auth: { healthy: true },
      schedulers: {
        orderReservation: { healthy: true }
      }
    }
  }, {
    generatedAt: new Date().toISOString(),
    process: {
      startedAt: new Date().toISOString()
    },
    requests: {
      total: 4
    }
  });

  assert.equal(report.passed, true);
  assert.equal(report.checks.every((item) => item.passed), true);
});

test("verifyReleaseHealth retries until health and metrics checks pass", async () => {
  const responses = [
    createJsonResponse(200, {
      ok: false,
      status: "degraded",
      dependencies: {
        datastore: { healthy: true, provider: "json" },
        auth: { healthy: true },
        schedulers: {
          orderReservation: { healthy: true }
        }
      }
    }),
    createJsonResponse(200, {
      generatedAt: new Date().toISOString(),
      process: { startedAt: new Date().toISOString() },
      requests: { total: 0 }
    }),
    createJsonResponse(200, {
      ok: true,
      status: "ok",
      dependencies: {
        datastore: { healthy: true, provider: "json" },
        auth: { healthy: true },
        schedulers: {
          orderReservation: { healthy: true }
        }
      }
    }),
    createJsonResponse(200, {
      generatedAt: new Date().toISOString(),
      process: { startedAt: new Date().toISOString() },
      requests: { total: 3 }
    })
  ];

  const seenUrls = [];
  const waits = [];
  const report = await verifyReleaseHealth({
    apiBaseUrl: "https://api.example.com/api",
    maxAttempts: 2,
    retryMs: 25,
    requestTimeoutMs: 500
  }, {
    fetch: async (url) => {
      seenUrls.push(url);
      return responses.shift();
    },
    wait: async (delayMs) => {
      waits.push(delayMs);
    }
  });

  assert.equal(report.passed, true);
  assert.equal(report.attempts, 2);
  assert.deepEqual(waits, [25]);
  assert.equal(seenUrls.length, 4);
});

test("verifyReleaseHealth returns failure summary after exhausting attempts", async () => {
  const report = await verifyReleaseHealth({
    apiBaseUrl: "https://api.example.com/api",
    maxAttempts: 2,
    retryMs: 1,
    requestTimeoutMs: 500
  }, {
    fetch: async () => createJsonResponse(503, { message: "down" }),
    wait: async () => {}
  });

  assert.equal(report.passed, false);
  assert.equal(report.attempts, 2);
  assert.match(report.error.message, /status 503/i);
});
