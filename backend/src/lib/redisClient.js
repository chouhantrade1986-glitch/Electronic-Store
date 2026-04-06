const Redis = require("ioredis");

/**
 * Redis client singleton.
 * Supports REDIS_URL or host/port config.
 */

let redisClient;

function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = String(process.env.REDIS_URL || "").trim();
  const redisHost = String(process.env.REDIS_HOST || "").trim();
  const redisPort = Number(process.env.REDIS_PORT || 6379);
  const redisPassword = String(process.env.REDIS_PASSWORD || "").trim();

  const options = {
    enableReadyCheck: true,
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    connectTimeout: 10000
  };

  if (redisUrl) {
    redisClient = new Redis(redisUrl, options);
  } else {
    const connection = {
      host: redisHost || "127.0.0.1",
      port: redisPort
    };
    if (redisPassword) {
      connection.password = redisPassword;
    }
    redisClient = new Redis(connection, options);
  }

  redisClient.on("error", (err) => {
    // Don't crash the process; log errors for observability.
    // Logging system uses logError.
    /* eslint-disable no-console */
    console.error("Redis client error:", err);
    /* eslint-enable no-console */
  });

  return redisClient;
}

function isRedisEnabled() {
  const redisUrl = String(process.env.REDIS_URL || "").trim();
  const redisHost = String(process.env.REDIS_HOST || "").trim();
  return Boolean(redisUrl || redisHost);
}

module.exports = {
  getRedisClient,
  isRedisEnabled
};
