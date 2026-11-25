const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

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

function deriveKey(rawKey) {
  const raw = String(rawKey || "").trim();
  if (Buffer.byteLength(raw, "utf8") < 32) {
    throw new Error("PII encryption keys must be configured with at least 32 bytes.");
  }
  return crypto.createHash("sha256").update(raw, "utf8").digest();
}

function isEncryptedPiiValue(value) {
  return typeof value === "string" && value.startsWith(ENCRYPTED_VALUE_PREFIX);
}

function decryptWithKey(value, rawKey) {
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

  const decipher = crypto.createDecipheriv("aes-256-gcm", deriveKey(rawKey), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

function encryptWithKey(value, rawKey) {
  if (value === null || value === undefined || value === "") {
    return value;
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", deriveKey(rawKey), iv);
  const ciphertext = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${ENCRYPTED_VALUE_PREFIX}${iv.toString("hex")}:${tag.toString("hex")}:${ciphertext.toString("hex")}`;
}

function rotatePiiValue(value, sourceKey, targetKey) {
  if (value === null || value === undefined || value === "") {
    return { value, status: "empty" };
  }

  if (!isEncryptedPiiValue(value)) {
    return {
      value: encryptWithKey(value, targetKey),
      status: "encrypted_plain"
    };
  }

  // Idempotency: verify if already decryptable with targetKey
  try {
    decryptWithKey(value, targetKey);
    return {
      value,
      status: "already_target_key"
    };
  } catch {
    // Expected: not yet rotated to targetKey
  }

  let plaintext;
  try {
    plaintext = decryptWithKey(value, sourceKey);
  } catch (error) {
    throw new Error(`Failed to decrypt PII value with source key: ${error.message}`);
  }

  const reEncrypted = encryptWithKey(plaintext, targetKey);
  return {
    value: reEncrypted,
    status: "rotated"
  };
}

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

function rotatePiiFields(record, sourceKey, targetKey, options = {}) {
  const stats = {
    totalPiiFields: 0,
    rotated: 0,
    alreadyTargetKey: 0,
    encryptedPlain: 0,
    empty: 0
  };

  const includeContextualFields = options.fields === undefined;
  const fieldNames = includeContextualFields
    ? PII_FIELD_NAMES
    : (options.fields instanceof Set ? options.fields : new Set(options.fields));
  const dryRun = Boolean(options.dryRun);

  function transform(node, parentKey = "") {
    if (Array.isArray(node)) {
      return node.map((item) => transform(item, parentKey));
    }
    if (!node || typeof node !== "object") {
      return node;
    }

    const result = {};
    for (const [key, val] of Object.entries(node)) {
      if (isPiiFieldName(key, parentKey, fieldNames, includeContextualFields) && typeof val === "string") {
        stats.totalPiiFields += 1;
        const rotation = rotatePiiValue(val, sourceKey, targetKey);
        if (rotation.status === "rotated") stats.rotated += 1;
        else if (rotation.status === "already_target_key") stats.alreadyTargetKey += 1;
        else if (rotation.status === "encrypted_plain") stats.encryptedPlain += 1;
        else if (rotation.status === "empty") stats.empty += 1;

        result[key] = dryRun ? val : rotation.value;
      } else {
        result[key] = transform(val, key);
      }
    }
    return result;
  }

  const rotatedData = transform(record);
  return {
    data: rotatedData,
    stats
  };
}

function rotatePiiFile({ inputPath, outputPath, sourceKey, targetKey, dryRun = false }) {
  if (!inputPath || !fs.existsSync(inputPath)) {
    throw new Error(`Input file does not exist: ${inputPath}`);
  }
  const rawContent = fs.readFileSync(inputPath, "utf8");
  const json = JSON.parse(rawContent.replace(/^\uFEFF/, ""));

  const { data, stats } = rotatePiiFields(json, sourceKey, targetKey, { dryRun });

  if (!dryRun) {
    const dest = outputPath || inputPath;
    const tempFile = `${dest}.tmp.${crypto.randomBytes(6).toString("hex")}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf8");
    fs.renameSync(tempFile, dest);
  }

  return {
    stats,
    inputPath,
    outputPath: dryRun ? null : (outputPath || inputPath),
    dryRun
  };
}

function parseArgs(argv = []) {
  const args = {
    sourceKey: process.env.SOURCE_PII_KEY || process.env.PII_ENCRYPTION_KEY || "",
    targetKey: process.env.TARGET_PII_KEY || process.env.NEW_PII_ENCRYPTION_KEY || "",
    inputFile: "",
    outputFile: "",
    dryRun: false
  };

  argv.forEach((arg) => {
    const val = String(arg || "").trim();
    if (val === "--dry-run") {
      args.dryRun = true;
    } else if (val.startsWith("--source-key=")) {
      args.sourceKey = val.split("=").slice(1).join("=").trim();
    } else if (val.startsWith("--target-key=")) {
      args.targetKey = val.split("=").slice(1).join("=").trim();
    } else if (val.startsWith("--input-file=")) {
      args.inputFile = val.split("=").slice(1).join("=").trim();
    } else if (val.startsWith("--output-file=")) {
      args.outputFile = val.split("=").slice(1).join("=").trim();
    }
  });

  return args;
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));

  if (!args.sourceKey || !args.targetKey) {
    console.error("Error: Both --source-key and --target-key (or env vars) are required.");
    process.exit(1);
  }

  if (!args.inputFile) {
    console.log("ElectroMart PII Key Rotation CLI");
    console.log("Usage: node rotatePiiKey.js --source-key=<key> --target-key=<key> --input-file=<path> [--output-file=<path>] [--dry-run]");
    console.log("Safety guardrail: --input-file must be provided explicitly.");
    process.exit(1);
  }

  try {
    const result = rotatePiiFile({
      inputPath: path.resolve(args.inputFile),
      outputPath: args.outputFile ? path.resolve(args.outputFile) : undefined,
      sourceKey: args.sourceKey,
      targetKey: args.targetKey,
      dryRun: args.dryRun
    });
    console.log("PII Key Rotation Completed Successfully:");
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(`PII Key Rotation failed: ${err.message}`);
    process.exit(1);
  }
}

module.exports = {
  PII_FIELD_NAMES,
  decryptWithKey,
  deriveKey,
  encryptWithKey,
  parseArgs,
  rotatePiiFields,
  rotatePiiFile,
  rotatePiiValue
};
