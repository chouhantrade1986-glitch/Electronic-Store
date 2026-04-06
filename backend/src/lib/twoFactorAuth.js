const speakeasy = require("speakeasy");

/**
 * Creates a new TOTP secret for a user.
 * @param {string|{issuer?: string, accountName: string}} options
 * @returns {{ secret: string, base32: string, otpauthUrl: string }}
 */
function generateTotpSecret(options) {
  const opts = typeof options === "string" ? { issuer: "", accountName: options } : (options || {});
  const issuer = String(opts.issuer || "").trim();
  const accountName = String(opts.accountName || "").trim();
  const label = issuer ? `${issuer}:${accountName}` : accountName;

  const secret = speakeasy.generateSecret({
    name: label,
    length: 20
  });

  return {
    secret: secret.base32,
    base32: secret.base32,
    otpauthUrl: secret.otpauth_url
  };
}

/**
 * Verifies a TOTP code against a secret.
 * @param {string} secret - Base32 secret
 * @param {string} token - TOTP code provided by user
 * @returns {boolean}
 */
function verifyTotpToken(secret, token) {
  return speakeasy.totp.verify({
    secret: String(secret || ""),
    encoding: "base32",
    token: String(token || "").trim(),
    window: 1
  });
}

module.exports = {
  generateTotpSecret,
  verifyTotpToken
};
