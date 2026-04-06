/**
 * Rate limiting middleware (Redis-backed when available, otherwise in-memory).
 */

const { isRedisEnabled } = require("../lib/redisClient");
const {
  createRedisRateLimiterMiddleware
} = require("./redisRateLimiter");

const rateLimitStore = new Map();

function createMemoryRateLimiter(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    message = "Too many requests, please try again later",
    namespace = "default"
  } = options;

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `${namespace}:${ip}`;
    const now = Date.now();

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const record = rateLimitStore.get(key);

    if (now > record.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      res.set("Retry-After", Math.ceil((record.resetTime - now) / 1000));
      return res.status(429).json({
        message,
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }

    record.count++;
    next();
  };
}

function createRateLimiter(options = {}) {
  if (isRedisEnabled()) {
    return createRedisRateLimiterMiddleware(options);
  }
  return createMemoryRateLimiter(options);
}

const globalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 1000,
  namespace: "global"
});

const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 30,
  message: "Too many authentication attempts. Please try again later.",
  namespace: "auth"
});

const apiRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 200,
  namespace: "api"
});

const checkoutRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 20,
  message: "Too many checkout attempts. Please wait before trying again.",
  namespace: "checkout"
});

const adminRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  maxRequests: 500,
  namespace: "admin"
});

module.exports = {
  createRateLimiter,
  globalRateLimiter,
  authRateLimiter,
  apiRateLimiter,
  checkoutRateLimiter,
  adminRateLimiter
};
