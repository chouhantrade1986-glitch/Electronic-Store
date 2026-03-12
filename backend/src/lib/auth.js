const jwt = require("jsonwebtoken");

const DISALLOWED_JWT_SECRETS = new Set([
  "",
  "dev-secret-change-me",
  "replace-with-strong-secret",
  "changeme"
]);

function resolveJwtSecret(env = process.env) {
  const secret = String(env.JWT_SECRET || "").trim();
  if (DISALLOWED_JWT_SECRETS.has(secret)) {
    const error = new Error("JWT_SECRET is required and must not use a default placeholder value.");
    error.code = "JWT_SECRET_REQUIRED";
    throw error;
  }
  return secret;
}

function assertJwtSecretConfigured(env = process.env) {
  return resolveJwtSecret(env);
}

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
      sessionVersion: Number.isFinite(Number(user && user.sessionVersion)) ? Math.max(1, Math.floor(Number(user.sessionVersion))) : 1
    },
    resolveJwtSecret(),
    { expiresIn: "7d" }
  );
}

function verifyToken(token) {
  return jwt.verify(token, resolveJwtSecret());
}

module.exports = {
  assertJwtSecretConfigured,
  resolveJwtSecret,
  signToken,
  verifyToken
};
