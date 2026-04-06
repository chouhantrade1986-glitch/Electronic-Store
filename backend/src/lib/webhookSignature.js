const crypto = require("crypto");

/**
 * Create HMAC signature for a webhook payload.
 *
 * @param {string} payload - Raw webhook body string.
 * @param {string} secret - Shared secret.
 * @param {string} algorithm - HMAC algorithm (default: sha256).
 * @returns {string} Hex-encoded signature.
 */
function buildWebhookSignature(payload, secret, algorithm = "sha256") {
  if (!payload || !secret) {
    return "";
  }

  return crypto
    .createHmac(algorithm, secret)
    .update(String(payload))
    .digest("hex");
}

/**
 * Verify webhook signature using timing-safe compare.
 *
 * @param {string} payload - Raw webhook body string.
 * @param {string} signature - Signature from the webhook header.
 * @param {string} secret - Shared secret.
 * @param {string} algorithm - HMAC algorithm (default: sha256).
 * @returns {boolean}
 */
function verifyWebhookSignature(payload, signature, secret, algorithm = "sha256") {
  if (!payload || !signature || !secret) {
    return false;
  }

  const expected = buildWebhookSignature(payload, secret, algorithm);
  const a = Buffer.from(String(expected));
  const b = Buffer.from(String(signature));
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

module.exports = {
  buildWebhookSignature,
  verifyWebhookSignature
};
