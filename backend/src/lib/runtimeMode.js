function normalizeProfile(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) {
    return "local";
  }
  if (normalized === "prod") {
    return "production";
  }
  if (normalized === "dev") {
    return "development";
  }
  return normalized;
}

function resolveRuntimeProfile(env = process.env) {
  const explicit = normalizeProfile(
    env.APP_RUNTIME_ENV
    || env.DEPLOYMENT_ENV
    || env.DEPLOYMENT_PROFILE
    || env.RUNTIME_PROFILE
  );
  if (explicit !== "local") {
    return explicit;
  }
  return normalizeProfile(env.NODE_ENV);
}

const RESTRICTED_PROFILES = new Set(["staging", "production"]);

function isProductionRuntime(env = process.env) {
  return resolveRuntimeProfile(env) === "production";
}

function isRestrictedRuntime(env = process.env) {
  return RESTRICTED_PROFILES.has(resolveRuntimeProfile(env));
}

module.exports = {
  isProductionRuntime,
  isRestrictedRuntime,
  resolveRuntimeProfile
};
