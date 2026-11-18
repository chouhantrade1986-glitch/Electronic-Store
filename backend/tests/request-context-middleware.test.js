const test = require("node:test");
const assert = require("node:assert/strict");

const {
  attachRequestContext,
  buildRequestLogPayload,
  errorHandler,
  normalizeRequestId
} = require("../src/middleware/requestContextMiddleware");
const { buildLogEntry } = require("../src/lib/logger");

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
    originalUrl: "/api/auth/change-password?email=person%40example.test",
    ip: "203.0.113.42",
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
  assert.equal(payload.ip, "203.0.*.*");
  assert.equal(payload.statusCode, 200);
  assert.equal(payload.durationMs, 42);
  assert.equal(payload.userId, "user-1");
  assert.equal(payload.userRole, "customer");
});

test("buildLogEntry redacts PII fields recursively", () => {
  const entry = buildLogEntry("info", "customer_lookup", {
    customerEmail: "alice@example.test",
    phoneNumber: "+919876543210",
    recipientName: "Riya Sharma",
    address: "12 Private Road",
    errorMessage: "Failed for alice@example.test at 9876543210, 12 Private Road",
    context: {
      gstin: "27ABCDE1234F1Z5"
    }
  });
  const serialized = JSON.stringify(entry);

  assert.equal(entry.customerEmail, "a***@example.test");
  assert.equal(entry.phoneNumber, "+91******3210");
  assert.equal(entry.recipientName, "R**a S****a");
  assert.equal(entry.address, "[REDACTED]");
  assert.equal(entry.errorMessage, "[REDACTED]");
  assert.equal(entry.context.gstin, "[REDACTED]");
  assert.equal(serialized.includes("12 Private Road"), false);
  assert.equal(serialized.includes("27ABCDE1234F1Z5"), false);
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

test("errorHandler does not write raw error details to logs", () => {
  const req = {
    requestId: "trace-pii-error",
    method: "POST",
    originalUrl: "/api/auth/register?email=alice%40example.test"
  };
  const res = createResponseDouble();
  const logged = [];
  const originalError = console.error;
  console.error = (...args) => logged.push(args.join(" "));

  try {
    errorHandler(new Error("Failed for alice@example.test at 9876543210, 12 Private Road"), req, res, () => {});
  } finally {
    console.error = originalError;
  }

  const output = logged.join("\n");
  assert.equal(output.includes("alice@example.test"), false);
  assert.equal(output.includes("9876543210"), false);
  assert.equal(output.includes("12 Private Road"), false);
  assert.equal(output.includes("/api/auth/register?"), false);
});
