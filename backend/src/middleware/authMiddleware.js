const { verifyToken } = require("../lib/auth");
const { readDb } = require("../lib/db");
const {
  SEEDED_DEMO_USER_BLOCK_MESSAGE,
  isSeededDemoUserBlocked
} = require("../lib/demoUsers");

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = verifyToken(token);
    const db = readDb();
    const user = db.users.find((item) => item.id === payload.sub);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    if (isSeededDemoUserBlocked(user)) {
      return res.status(403).json({ message: SEEDED_DEMO_USER_BLOCK_MESSAGE });
    }
    const expectedSessionVersion = Number.isFinite(Number(user.sessionVersion)) ? Math.max(1, Math.floor(Number(user.sessionVersion))) : 1;
    const tokenSessionVersion = Number.isFinite(Number(payload.sessionVersion)) ? Math.max(1, Math.floor(Number(payload.sessionVersion))) : 1;
    if (tokenSessionVersion !== expectedSessionVersion) {
      return res.status(401).json({ message: "Session expired. Please sign in again." });
    }

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      sessionVersion: expectedSessionVersion
    };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  return next();
}

module.exports = {
  requireAuth,
  requireAdmin
};
