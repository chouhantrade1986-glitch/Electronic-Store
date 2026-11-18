const crypto = require("crypto");

const ENCRYPTED_VALUE_PREFIX = "v1:";
const PII_FIELD_NAMES = new Set([
  "address",
  "billingAddress",
  "companyGstin",
  "customerEmail",
  "email",
  "giftMessage",
  "gstin",
  "gstinNumber",
  "mobile",
  "mobileNumber",
  "phone",
  "phoneNumber",
  "recipientEmail",
  "recipientName",
  "senderName",
  "shippingAddress"
]);
const CONTEXTUAL_PII_FIELD_NAMES = new Map([
  ["name", new Set(["users", "pendingUser"])],
  ["code", new Set(["authOtpChallenges"])],
  ["destination", new Set(["authOtpChallenges", "orderNotifications"])],
  ["identifier", new Set(["authOtpChallenges"])],
  ["pendingCode", new Set(["phoneVerification"])],
  ["pendingMobile", new Set(["phoneVerification"])],
  ["verifiedForMobile", new Set(["phoneVerification"])]
]);

function isPiiFieldName(key, parentKey, fieldNames, includeContextualFields) {
  if (fieldNames.has(key)) {
    return true;
  }
  if (!includeContextualFields) {
    return false;
  }
  const allowedParents = CONTEXTUAL_PII_FIELD_NAMES.get(key);
  return Boolean(allowedParents && allowedParents.has(parentKey));
}

function resolvePiiEncryptionKey() {
  const raw = String(process.env.PII_ENCRYPTION_KEY || "").trim();
  if (Buffer.byteLength(raw, "utf8") < 32) {
    throw new Error("PII_ENCRYPTION_KEY must be configured with at least 32 bytes.");
  }
  return crypto.createHash("sha256").update(raw, "utf8").digest();
}

function isEncryptedPiiValue(value) {
  return typeof value === "string" && value.startsWith(ENCRYPTED_VALUE_PREFIX);
}

function encryptPiiValue(value) {
  if (value === null || value === undefined || value === "") {
    return value;
  }
  if (isEncryptedPiiValue(value)) {
    return value;
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", resolvePiiEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${ENCRYPTED_VALUE_PREFIX}${iv.toString("hex")}:${tag.toString("hex")}:${ciphertext.toString("hex")}`;
}

function decryptPiiValue(value) {
  if (value === null || value === undefined || value === "") {
    return value;
  }
  if (!isEncryptedPiiValue(value)) {
    return value;
  }

  const [version, ivHex, tagHex, ciphertextHex, ...extra] = value.split(":");
  if (version !== "v1" || !ivHex || !tagHex || ciphertextHex === undefined || extra.length > 0) {
    throw new Error("Encrypted PII value has an unsupported format.");
  }

  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const ciphertext = Buffer.from(ciphertextHex, "hex");
  if (iv.length !== 12 || tag.length !== 16 || iv.toString("hex") !== ivHex || tag.toString("hex") !== tagHex || ciphertext.toString("hex") !== ciphertextHex) {
    throw new Error("Encrypted PII value has invalid encoding.");
  }

  const decipher = crypto.createDecipheriv("aes-256-gcm", resolvePiiEncryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

function encryptPiiFields(record, fields) {
  const includeContextualFields = fields === undefined;
  const fieldNames = includeContextualFields
    ? PII_FIELD_NAMES
    : (fields instanceof Set ? fields : new Set(fields));
  return transformPiiFields(record, fieldNames, includeContextualFields, encryptPiiValue);
}

function decryptPiiFields(record, fields) {
  const includeContextualFields = fields === undefined;
  const fieldNames = includeContextualFields
    ? PII_FIELD_NAMES
    : (fields instanceof Set ? fields : new Set(fields));
  return transformPiiFields(record, fieldNames, includeContextualFields, decryptPiiValue);
}

function transformPiiFields(record, fieldNames, includeContextualFields, transformValue, parentKey = "") {
  if (Array.isArray(record)) {
    return record.map((item) => transformPiiFields(
      item,
      fieldNames,
      includeContextualFields,
      transformValue,
      parentKey
    ));
  }
  if (!record || typeof record !== "object") {
    return record;
  }

  const transformed = {};
  Object.entries(record).forEach(([key, value]) => {
    transformed[key] = isPiiFieldName(key, parentKey, fieldNames, includeContextualFields)
      && typeof value === "string"
      ? transformValue(value)
      : transformPiiFields(value, fieldNames, includeContextualFields, transformValue, key);
  });
  return transformed;
}

function piiEncryption(req, res, next) {
  if (!res.locals) {
    res.locals = {};
  }
  if (!res.locals.piiResponseDecryptionInstalled) {
    const sendJson = res.json;
    res.json = function sendJsonWithDecryptedPii(body) {
      return sendJson.call(this, decryptPiiFields(body));
    };
    res.locals.piiResponseDecryptionInstalled = true;
  }
  return next();
}

module.exports = piiEncryption;
module.exports.decryptPiiFields = decryptPiiFields;
module.exports.decryptPiiValue = decryptPiiValue;
module.exports.encryptPiiFields = encryptPiiFields;
module.exports.encryptPiiValue = encryptPiiValue;
