function resolveClientIp(req) {
  const forwarded = String(req && req.headers && req.headers["x-forwarded-for"] ? req.headers["x-forwarded-for"] : "").trim();
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (req && typeof req.ip === "string" && req.ip.trim()) {
    return req.ip.trim();
  }
  if (req && req.socket && typeof req.socket.remoteAddress === "string" && req.socket.remoteAddress.trim()) {
    return req.socket.remoteAddress.trim();
  }
  return "unknown";
}

function normalizeRetryAfterSeconds(ms) {
  const value = Math.ceil(Math.max(0, Number(ms || 0)) / 1000);
  return Number.isFinite(value) ? value : 0;
}

function buildLimiterState(store, key, windowMs, now) {
  const current = store.get(key);
  if (!current || current.resetAt <= now) {
    const next = {
      count: 0,
      resetAt: now + windowMs
    };
    store.set(key, next);
    return next;
  }
  return current;
}

function createMemoryRateLimiter(options = {}) {
  const windowMs = Math.max(1000, Number(options.windowMs || 60_000));
  const max = Math.max(1, Number(options.max || 10));
  const namespace = String(options.namespace || "global").trim() || "global";
  const message = String(options.message || "Too many requests. Please try again later.").trim();
  const keyGenerator = typeof options.keyGenerator === "function"
    ? options.keyGenerator
    : (req) => resolveClientIp(req);
  const statusCode = Number(options.statusCode || 429);
  const store = new Map();

  const middleware = (req, res, next) => {
    const now = Date.now();
    const derivedKey = String(keyGenerator(req) || "").trim() || resolveClientIp(req);
    const storeKey = `${namespace}:${derivedKey}`;
    const bucket = buildLimiterState(store, storeKey, windowMs, now);

    if (bucket.count >= max) {
      const retryAfterSeconds = normalizeRetryAfterSeconds(bucket.resetAt - now);
      res.setHeader("Retry-After", String(retryAfterSeconds));
      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", "0");
      res.setHeader("X-RateLimit-Reset", String(bucket.resetAt));
      return res.status(statusCode).json({
        message,
        retryAfterSeconds
      });
    }

    bucket.count += 1;
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - bucket.count)));
    res.setHeader("X-RateLimit-Reset", String(bucket.resetAt));
    return next();
  };

  middleware._store = store;
  middleware._options = { windowMs, max, namespace, message, statusCode };
  return middleware;
}

module.exports = {
  createMemoryRateLimiter,
  resolveClientIp
};
