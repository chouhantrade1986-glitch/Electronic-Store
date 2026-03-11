const test = require("node:test");
const assert = require("node:assert/strict");

const {
  attachRequestContext,
  buildRequestLogPayload,
  errorHandler,
  normalizeRequestId
} = require("../src/middleware/requestContextMiddleware");

function createResponseDouble() {
  return {
    headers: {},
    statusCode: 200,
    body: null,
    headersSent: false,
    setHeader(name, value) {
      this.headers[String(name)] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

test("normalizeRequestId reuses incoming request id and trims it", () => {
  assert.equal(normalizeRequestId(" req-123 "), "req-123");
});

test("attachRequestContext sets request id and response header", () => {
  const req = {
    headers: {
      "x-request-id": "trace-abc"
    }
  };
  const res = createResponseDouble();
  let called = false;

  attachRequestContext(req, res, () => {
    called = true;
  });

  assert.equal(called, true);
  assert.equal(req.requestId, "trace-abc");
  assert.equal(res.headers["X-Request-Id"], "trace-abc");
  assert.equal(typeof req.requestStartedAt, "number");
});

test("buildRequestLogPayload includes request identity and user context", () => {
  const payload = buildRequestLogPayload({
    requestId: "trace-1",
    method: "POST",
    originalUrl: "/api/auth/change-password",
    ip: "::1",
    user: {
      id: "user-1",
      role: "customer"
    }
  }, {
    statusCode: 200
  }, 42.4);

  assert.equal(payload.requestId, "trace-1");
  assert.equal(payload.method, "POST");
  assert.equal(payload.path, "/api/auth/change-password");
  assert.equal(payload.statusCode, 200);
  assert.equal(payload.durationMs, 42);
  assert.equal(payload.userId, "user-1");
  assert.equal(payload.userRole, "customer");
});

test("errorHandler returns request id in the 500 response", () => {
  const req = {
    requestId: "trace-error",
    method: "GET",
    originalUrl: "/api/test"
  };
  const res = createResponseDouble();
  let delegated = false;

  errorHandler(new Error("Boom"), req, res, () => {
    delegated = true;
  });

  assert.equal(delegated, false);
  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, {
    message: "Internal server error",
    requestId: "trace-error"
  });
});
