function normalizeEventName(value) {
  const event = String(value || "").trim();
  return event || "app_event";
}

function normalizeRequestId(context = {}, fields = {}) {
  if (context && typeof context === "object") {
    if (context.requestId) {
      return String(context.requestId);
    }
    if (context.req && context.req.requestId) {
      return String(context.req.requestId);
    }
  }
  if (fields && typeof fields === "object" && fields.requestId) {
    return String(fields.requestId);
  }
  return "";
}

function normalizeFieldName(value) {
  return String(value || "").replace(/[^a-z0-9]/gi, "").toLowerCase();
}

const SENSITIVE_NAME_FIELDS = new Set([
  "name",
  "fullname",
  "firstname",
  "lastname",
  "username",
  "recipientname",
  "sendername",
  "customername",
  "contactname",
  "legalname",
  "businesscontactname"
]);
const UNSTRUCTURED_SENSITIVE_FIELDS = new Set([
  "message",
  "errormessage",
  "error",
  "stack",
  "description"
]);

function isSensitiveField(name) {
  const key = normalizeFieldName(name);
  return /(?:email(?:address)?|phone(?:number)?|mobile(?:number)?|address(?:line\d*)?|gstin|imei)$/.test(key)
    || UNSTRUCTURED_SENSITIVE_FIELDS.has(key)
    || SENSITIVE_NAME_FIELDS.has(key);
}

function maskEmail(value) {
  const email = String(value || "").trim();
  const separator = email.indexOf("@");
  if (separator <= 0 || separator === email.length - 1) {
    return "[REDACTED]";
  }
  return `${email[0]}***${email.slice(separator)}`;
}

function maskPhone(value) {
  const phone = String(value || "");
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) {
    return "[REDACTED]";
  }
  const prefix = phone.trim().startsWith("+") ? "+" : "";
  return `${prefix}${digits.slice(0, 2)}${"*".repeat(digits.length - 6)}${digits.slice(-4)}`;
}

function maskName(value) {
  return String(value || "").trim().split(/\s+/).filter(Boolean).map((part) => {
    if (part.length <= 2) {
      return `${part[0] || ""}*`;
    }
    return `${part[0]}${"*".repeat(part.length - 2)}${part[part.length - 1]}`;
  }).join(" ");
}

function sanitizeLogValue(value, fieldName = "") {
  const key = normalizeFieldName(fieldName);
  if (isSensitiveField(key)) {
    if (/(?:email|emailaddress)$/.test(key) && typeof value === "string") {
      return maskEmail(value);
    }
    if (/(?:phone|mobile)(?:number)?$/.test(key) && typeof value === "string") {
      return maskPhone(value);
    }
    if (key.endsWith("name") && typeof value === "string") {
      return maskName(value);
    }
    return "[REDACTED]";
  }
  if (key === "ip" || key === "ipaddress") {
    const ip = String(value || "");
    if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(ip)) {
      return `${ip.split(".").slice(0, 2).join(".")}.*.*`;
    }
    if (ip.includes(":")) {
      return `${ip.split(":").slice(0, 2).join(":")}:*`;
    }
  }
  if (key === "path" || key === "url") {
    return String(value || "").split(/[?#]/, 1)[0];
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeLogValue(item, fieldName));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([keyName, item]) => [keyName, sanitizeLogValue(item, keyName)])
    );
  }
  return value;
}

function normalizeFields(fields = {}) {
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
    return {};
  }
  const payload = sanitizeLogValue(fields);
  delete payload.event;
  delete payload.requestId;
  return payload;
}

function buildLogEntry(level, event, fields = {}, context = {}) {
  const requestId = normalizeRequestId(context, fields);
  return {
    timestamp: new Date().toISOString(),
    level: String(level || "info").trim().toLowerCase() || "info",
    event: normalizeEventName(event || (fields && fields.event ? fields.event : "")),
    requestId,
    ...normalizeFields(fields)
  };
}

function emitLog(method, entry) {
  // eslint-disable-next-line no-console
  console[method](JSON.stringify(entry));
}

function logInfo(event, fields = {}, context = {}) {
  emitLog("log", buildLogEntry("info", event, fields, context));
}

function logError(event, fields = {}, context = {}) {
  emitLog("error", buildLogEntry("error", event, fields, context));
}

module.exports = {
  buildLogEntry,
  logError,
  logInfo,
  sanitizeLogValue
};
