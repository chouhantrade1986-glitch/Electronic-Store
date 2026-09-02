// Simple PII Encryption Middleware (AES-256-CBC)
// NOTE:
// - This middleware is used by several auth/payment/admin routes.
// - In this repo, it must never crash due to mis-sized ENCRYPTION_KEY.

const crypto = require("crypto");

const IV_LENGTH = 16;

function normalizeKey(raw) {
  const value = String(raw || "");

  // If env provided and already correct byte length, use as-is
  const buf = Buffer.from(value, "utf8");
  if (buf.length === 32) {
    return buf;
  }

  // If not 32 bytes, derive a stable 32-byte key from whatever we got.
  // This prevents runtime crashes like: "Invalid key length".
  // (AES-256 requires exactly 32 bytes key material.)
  return crypto.createHash("sha256").update(value).digest();
}

const ENCRYPTION_KEY_RAW = process.env.PII_ENCRYPTION_KEY || "default_32_byte_key_123456789012345";
const ENCRYPTION_KEY_32B = normalizeKey(ENCRYPTION_KEY_RAW);

function encrypt(text) {
  if (!text) return text;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY_32B, iv);

  let encrypted = cipher.update(String(text), "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(text) {
  if (!text) return text;

  const parts = String(text).split(":");
  if (parts.length !== 2) return text;

  const iv = Buffer.from(parts[0], "hex");
  const encryptedText = parts[1];

  const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY_32B, iv);

  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

// Express middleware: encrypt PII fields in req.body before controller
function piiEncryption(req, res, next) {
  if (req.body) {
    if (req.body.email) req.body.email = encrypt(req.body.email);
    if (req.body.mobile) req.body.mobile = encrypt(req.body.mobile);
    if (req.body.address) req.body.address = encrypt(req.body.address);
  }
  next();
}

module.exports = piiEncryption;

