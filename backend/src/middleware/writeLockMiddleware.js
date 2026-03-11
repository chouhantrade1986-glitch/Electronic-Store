const { acquireWriteLock } = require("../lib/db");

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const LOCK_BYPASS_RULES = [
  {
    method: "POST",
    pattern: /^\/api\/payments\/(?:intent|[^/]+\/(?:confirm|refund|cancel))\/?$/i
  },
  {
    method: "POST",
    pattern: /^\/api\/admin\/media\/upload-drive\/?$/i
  },
  {
    method: "PATCH",
    pattern: /^\/api\/admin\/orders\/[^/]+\/status\/?$/i
  },
  {
    method: "PATCH",
    pattern: /^\/api\/orders\/[^/]+\/cancel\/?$/i
  }
];

function normalizeRequestPath(value) {
  const raw = String(value || "").split("?")[0].trim();
  if (!raw) {
    return "/";
  }
  if (raw === "/") {
    return raw;
  }
  return raw.replace(/\/+$/, "") || "/";
}

function shouldBypassGlobalWriteLock(reqOrMethod, maybePath = "") {
  const method = typeof reqOrMethod === "object" && reqOrMethod
    ? String(reqOrMethod.method || "").toUpperCase()
    : String(reqOrMethod || "").toUpperCase();
  const path = normalizeRequestPath(
    typeof reqOrMethod === "object" && reqOrMethod
      ? (reqOrMethod.originalUrl || reqOrMethod.path || reqOrMethod.url || "")
      : maybePath
  );

  return LOCK_BYPASS_RULES.some((rule) => rule.method === method && rule.pattern.test(path));
}

async function serializeDbMutations(req, res, next) {
  if (!MUTATING_METHODS.has(String(req.method || "").toUpperCase())) {
    return next();
  }
  if (shouldBypassGlobalWriteLock(req)) {
    return next();
  }

  let releaseLock;
  try {
    releaseLock = await acquireWriteLock();
  } catch (error) {
    return next(error);
  }

  let released = false;
  const cleanup = () => {
    if (released) {
      return;
    }
    released = true;
    releaseLock();
  };

  res.once("finish", cleanup);
  res.once("close", cleanup);
  res.once("error", cleanup);

  return next();
}

module.exports = {
  serializeDbMutations,
  shouldBypassGlobalWriteLock
};
