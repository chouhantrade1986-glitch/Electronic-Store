const { RateLimiterRedis } = require("rate-limiter-flexible");
const { getRedisClient, isRedisEnabled } = require("../lib/redisClient");
const { logError } = require("../lib/logger");

function createRedisRateLimiter(options = {}) {
  const {
    points = 100,
    duration = 60,
    keyPrefix = "rl",
    blockDuration = 0,
    db = 0
  } = options;

  if (!isRedisEnabled()) {
    throw new Error("Redis is not configured. Set REDIS_URL or REDIS_HOST/REDIS_PORT.");
  }

  const redisClient = getRedisClient();

  return new RateLimiterRedis({
    storeClient: redisClient,
    points,
    duration,
    blockDuration,
    keyPrefix,
    db
  });
}

function createRedisRateLimiterMiddleware(options = {}) {
  const {
    points = 100,
    duration = 60,
    blockDuration = 0,
    keyPrefix = "rl",
    keyGenerator = (req) => req.ip || "unknown",
    onBlocked = null,
    errorMessage = "Too many requests. Please try again later."
  } = options;

  const limiter = createRedisRateLimiter({
    points,
    duration,
    blockDuration,
    keyPrefix
  });

  return async (req, res, next) => {
    const key = String(keyGenerator(req) || "anonymous");
    try {
      await limiter.consume(key);
      next();
    } catch (rejRes) {
      // rejRes indicates remaining time
      res.set("Retry-After", Math.ceil(rejRes.msBeforeNext / 1000));
      if (typeof onBlocked === "function") {
        try {
          onBlocked(req, rejRes);
        } catch (ex) {
          logError("redis_rate_limiter_onblocked_error", { error: String(ex) });
        }
      }
      res.status(429).json({
        message: errorMessage,
        retryAfter: Math.ceil(rejRes.msBeforeNext / 1000)
      });
    }
  };
}

module.exports = {
  createRedisRateLimiter,
  createRedisRateLimiterMiddleware
};
