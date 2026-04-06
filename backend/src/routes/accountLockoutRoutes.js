const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const {
  checkAccountLockStatus,
  unlockAccountAdmin,
  getLockoutStatus,
  getSecurityAlerts
} = require("../lib/accountLockoutManager");
const { logInfo, logError } = require("../lib/logger");

/**
 * Admin Account Lockout Management Routes
 * Endpoints for managing account lockouts and security
 */

// Require admin authentication
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required"
    });
  }
  next();
}

/**
 * GET /api/admin/account-lockouts/:email
 * Get lockout status for a user
 */
router.get("/:email", requireAdmin, (req, res) => {
  const email = req.params.email.toLowerCase();

  if (!email || !email.includes("@")) {
    return res.status(400).json({
      message: "Valid email required"
    });
  }

  const lockoutStatus = getLockoutStatus(email);
  const alerts = getSecurityAlerts(email);

  res.json({
    email: lockoutStatus.email,
    isLocked: lockoutStatus.isLocked,
    failedAttempts: lockoutStatus.failedAttempts,
    attemptsRemaining: lockoutStatus.attemptsRemaining,
    lastFailedAt: lockoutStatus.lastFailedAt,
    lockedAt: lockoutStatus.lockedAt,
    recentAttempts: lockoutStatus.attemptHistory,
    securityAlerts: alerts.slice(-5) // Last 5 alerts
  });
});

/**
 * POST /api/admin/account-lockouts/:email/unlock
 * Unlock a locked account (admin only)
 */
router.post("/:email/unlock", requireAdmin, (req, res) => {
  const email = req.params.email.toLowerCase();

  if (!email || !email.includes("@")) {
    return res.status(400).json({
      message: "Valid email required"
    });
  }

  const lockStatus = checkAccountLockStatus(email);

  if (!lockStatus.isLocked) {
    return res.status(400).json({
      message: "Account is not locked"
    });
  }

  const unlocked = unlockAccountAdmin(email, req.user.email);

  if (!unlocked) {
    return res.status(500).json({
      message: "Failed to unlock account"
    });
  }

  logInfo("admin_account_unlocked", {
    email,
    unlockedBy: req.user.email
  });

  res.json({
    message: "Account unlocked successfully",
    email,
    unlockedBy: req.user.email,
    unlockedAt: new Date().toISOString()
  });
});

/**
 * GET /api/admin/account-lockouts
 * List all locked accounts (admin only)
 */
router.get("/", requireAdmin, (req, res) => {
  // This would require access to the full lockout database
  // For now, we return a message that this requires enhancement
  res.json({
    message: "Use specific email lookup via GET /api/admin/account-lockouts/:email",
    note: "Full lockout list requires database enhancement"
  });
});

module.exports = router;
