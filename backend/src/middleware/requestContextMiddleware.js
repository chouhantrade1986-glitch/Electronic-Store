const { randomUUID } = require("crypto");
const { logError, logInfo, sanitizeLogValue } = require("../lib/logger");
const { recordHttpRequest } = require("../lib/monitoring");

function normalizeRequestId(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return randomUUID();
  }
  return raw.slice(0, 120);
}

function attachRequestContext(req, res, next) {
  const requestId = normalizeRequestId(req.headers["x-request-id"]);
  req.requestId = requestId;
  req.requestStartedAt = Date.now();
  res.setHeader("X-Request-Id", requestId);
  next();
}

function buildRequestLogPayload(req, res, durationMs) {
  return sanitizeLogValue({
    event: "http_request",
    requestId: String(req.requestId || ""),
    method: String(req.method || ""),
    path: String(req.originalUrl || req.url || ""),
    statusCode: Number(res.statusCode || 0),
    durationMs: Number.isFinite(Number(durationMs)) ? Math.max(0, Math.round(Number(durationMs))) : 0,
    ip: String(req.ip || req.headers["x-forwarded-for"] || "").split(",")[0].trim(),
    userId: String(req.user && req.user.id ? req.user.id : ""),
    userRole: String(req.user && req.user.role ? req.user.role : "")
  });
}

function requestLogger(req, res, next) {
  const startedAt = Number(req.requestStartedAt || Date.now());
  res.on("finish", () => {
    const payload = buildRequestLogPayload(req, res, Date.now() - startedAt);
    recordHttpRequest(payload);
    logInfo(payload.event, payload, { requestId: payload.requestId });
  });
  next();
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const payload = {
    event: "http_error",
    requestId: String(req && req.requestId ? req.requestId : ""),
    method: String(req && req.method ? req.method : ""),
    path: String(req && (req.originalUrl || req.url) ? (req.originalUrl || req.url) : ""),
    errorType: String(error && error.name ? error.name : "Error"),
    errorCode: /^[a-z0-9_-]{1,64}$/i.test(String(error && error.code || ""))
      ? String(error.code)
      : ""
  };

  logError(payload.event, payload, { requestId: payload.requestId });
  return res.status(500).json({
    message: "Internal server error",
    requestId: String(req && req.requestId ? req.requestId : "")
  });
}

module.exports = {
  attachRequestContext,
  buildRequestLogPayload,
  errorHandler,
  normalizeRequestId,
  requestLogger
};
