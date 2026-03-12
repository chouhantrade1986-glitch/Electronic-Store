const { hasRealAdminAccount } = require("./adminAccounts");
const { applySeededDemoUserAccessPolicy } = require("./demoUsers");
const { isProductionRuntime, resolveRuntimeProfile } = require("./runtimeMode");

const DISALLOWED_ADMIN_BOOTSTRAP_SECRETS = new Set([
  "",
  "admin-bootstrap-secret",
  "changeme",
  "replace-me",
  "replace-with-strong-secret"
]);

function resolveAdminBootstrapSecret(env = process.env) {
  return String(env.ADMIN_BOOTSTRAP_SECRET || "").trim();
}

function hasValidAdminBootstrapSecret(env = process.env) {
  const secret = resolveAdminBootstrapSecret(env);
  return !DISALLOWED_ADMIN_BOOTSTRAP_SECRETS.has(secret);
}

function applyAdminProvisioningPolicy(db, env = process.env) {
  const runtimeProfile = resolveRuntimeProfile(env);
  if (!isProductionRuntime(env)) {
    return {
      runtimeProfile,
      seededDemoUsersForcedDisabled: false,
      matchedCount: 0,
      changedCount: 0,
      enabledCount: 0,
      disabledCount: 0,
      changedUsers: []
    };
  }

  const policy = applySeededDemoUserAccessPolicy(db, { allowAccess: false });
  return {
    runtimeProfile,
    seededDemoUsersForcedDisabled: true,
    ...policy
  };
}

function createGuardrailError(message, details = {}) {
  const error = new Error(message);
  error.code = "ADMIN_PROVISIONING_GUARDRAIL_FAILED";
  error.details = details;
  return error;
}

function assertAdminProvisioningGuardrails(db, env = process.env) {
  const runtimeProfile = resolveRuntimeProfile(env);
  const hasRealAdmin = hasRealAdminAccount(db);
  const allowSeededDemoUsers = String(env.ALLOW_SEEDED_DEMO_USERS || "").trim().toLowerCase() === "true";
  const hasSecureBootstrapSecret = hasValidAdminBootstrapSecret(env);

  if (!isProductionRuntime(env)) {
    return {
      ok: true,
      runtimeProfile,
      hasRealAdmin,
      allowSeededDemoUsers,
      hasSecureBootstrapSecret
    };
  }

  const failures = [];
  if (allowSeededDemoUsers) {
    failures.push("ALLOW_SEEDED_DEMO_USERS must remain false in production.");
  }
  if (!hasRealAdmin && !hasSecureBootstrapSecret) {
    failures.push("Production startup requires either a real admin account or a secure ADMIN_BOOTSTRAP_SECRET for first-admin bootstrap.");
  }

  if (failures.length > 0) {
    throw createGuardrailError(failures.join(" "), {
      runtimeProfile,
      hasRealAdmin,
      allowSeededDemoUsers,
      hasSecureBootstrapSecret
    });
  }

  return {
    ok: true,
    runtimeProfile,
    hasRealAdmin,
    allowSeededDemoUsers,
    hasSecureBootstrapSecret
  };
}

module.exports = {
  DISALLOWED_ADMIN_BOOTSTRAP_SECRETS,
  applyAdminProvisioningPolicy,
  assertAdminProvisioningGuardrails,
  hasValidAdminBootstrapSecret,
  resolveAdminBootstrapSecret
};
