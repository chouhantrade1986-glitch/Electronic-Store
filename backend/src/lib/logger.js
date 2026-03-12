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

function normalizeFields(fields = {}) {
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
    return {};
  }
  const payload = { ...fields };
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
  logInfo
};
