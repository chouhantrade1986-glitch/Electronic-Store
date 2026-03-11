const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createMemoryRateLimiter,
  resolveClientIp
} = require("../src/middleware/rateLimitMiddleware");

function createMockResponse() {
  return {
    headers: {},
    statusCode: 200,
    payload: null,
    setHeader(name, value) {
      this.headers[String(name)] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    }
  };
}

test("resolveClientIp prefers x-forwarded-for", () => {
  const ip = resolveClientIp({
    headers: {
      "x-forwarded-for": "203.0.113.4, 10.0.0.1"
    },
    ip: "::1"
  });

  assert.equal(ip, "203.0.113.4");
});

test("createMemoryRateLimiter blocks requests after configured max", () => {
  const limiter = createMemoryRateLimiter({
    namespace: "unit-limit",
    windowMs: 60_000,
    max: 2,
    message: "Rate limit hit."
  });
  const req = {
    headers: {},
    ip: "127.0.0.1"
  };

  let nextCalls = 0;
  limiter(req, createMockResponse(), () => {
    nextCalls += 1;
  });
  limiter(req, createMockResponse(), () => {
    nextCalls += 1;
  });
  const blockedRes = createMockResponse();
  limiter(req, blockedRes, () => {
    nextCalls += 1;
  });

  assert.equal(nextCalls, 2);
  assert.equal(blockedRes.statusCode, 429);
  assert.equal(blockedRes.payload.message, "Rate limit hit.");
  assert.equal(blockedRes.headers["Retry-After"], "60");
});

test("createMemoryRateLimiter resets counts after the window elapses", () => {
  const originalNow = Date.now;
  let now = 1_000;
  Date.now = () => now;

  try {
    const limiter = createMemoryRateLimiter({
      namespace: "unit-reset",
      windowMs: 5_000,
      max: 1
    });
    const req = {
      headers: {},
      ip: "198.51.100.2"
    };

    let nextCalls = 0;
    limiter(req, createMockResponse(), () => {
      nextCalls += 1;
    });
    const blockedRes = createMockResponse();
    limiter(req, blockedRes, () => {
      nextCalls += 1;
    });
    assert.equal(blockedRes.statusCode, 429);

    now += 6_000;
    limiter(req, createMockResponse(), () => {
      nextCalls += 1;
    });
    assert.equal(nextCalls, 2);
  } finally {
    Date.now = originalNow;
  }
});

test("createMemoryRateLimiter supports custom keys", () => {
  const limiter = createMemoryRateLimiter({
    namespace: "unit-custom",
    windowMs: 60_000,
    max: 1,
    keyGenerator: (req) => `${req.ip}|${req.body.account}`
  });

  let firstAllowed = false;
  limiter({
    headers: {},
    ip: "127.0.0.1",
    body: { account: "a@example.com" }
  }, createMockResponse(), () => {
    firstAllowed = true;
  });
  assert.equal(firstAllowed, true);

  const differentAccountRes = createMockResponse();
  let secondAllowed = false;
  limiter({
    headers: {},
    ip: "127.0.0.1",
    body: { account: "b@example.com" }
  }, differentAccountRes, () => {
    secondAllowed = true;
  });
  assert.equal(secondAllowed, true);
  assert.equal(differentAccountRes.statusCode, 200);
});
