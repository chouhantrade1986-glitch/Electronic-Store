const { getRedisClient, isRedisEnabled } = require("./redisClient");

/**
 * Replay protection for webhooks using Redis.
 * Stores event IDs with a TTL to prevent duplicate processing.
 */

const DEFAULT_REPLAY_TTL_SECONDS = 5 * 60; // 5 minutes

function isReplayProtectionEnabled() {
  return isRedisEnabled();
}

function getReplayKey(kind, id) {
  return `webhook-replay:${kind}:${String(id || "").trim()}`;
}

async function markWebhookEventProcessed(kind, id, ttlSeconds = DEFAULT_REPLAY_TTL_SECONDS) {
  if (!isReplayProtectionEnabled()) {
    return false;
  }
  const redis = getRedisClient();
  const key = getReplayKey(kind, id);
  // Set if not exist
  const result = await redis.set(key, "1", "NX", "EX", ttlSeconds);
  return result === "OK";
}

async function isWebhookEventProcessed(kind, id) {
  if (!isReplayProtectionEnabled()) {
    return false;
  }
  const redis = getRedisClient();
  const key = getReplayKey(kind, id);
  const exists = await redis.exists(key);
  return Boolean(exists);
}

module.exports = {
  isReplayProtectionEnabled,
  markWebhookEventProcessed,
  isWebhookEventProcessed,
  DEFAULT_REPLAY_TTL_SECONDS
};
