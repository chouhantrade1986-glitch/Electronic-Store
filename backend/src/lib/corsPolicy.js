const { isRestrictedRuntime } = require("./runtimeMode");

function toOrigin(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }
  try {
    return new URL(raw).origin;
  } catch (error) {
    return "";
  }
}

function resolveAllowedOrigins(env = process.env) {
  const candidates = [
    env.PUBLIC_STORE_BASE_URL,
    ...String(env.CORS_ALLOWED_ORIGINS || "").split(",")
  ];
  return [...new Set(candidates.map(toOrigin).filter(Boolean))];
}

function buildCorsOptions(env = process.env) {
  if (!isRestrictedRuntime(env)) {
    return {};
  }
  return { origin: resolveAllowedOrigins(env) };
}

module.exports = {
  buildCorsOptions,
  resolveAllowedOrigins
};
