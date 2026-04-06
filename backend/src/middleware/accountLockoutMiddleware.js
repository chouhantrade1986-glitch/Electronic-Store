const {
  checkAccountLockStatus,
  recordFailedAttempt,
  clearFailedAttempts
} = require("../lib/accountLockoutManager");
const { logError } = require("../lib/logger");

/**
 * Account Lockout Middleware
 * Checks if account is locked before allowing login attempt
 */

function checkAccountLockout(req, res, next) {
  const email = req.body?.email?.toLowerCase();

  if (!email) {
    return next();
  }

  const lockStatus = checkAccountLockStatus(email);

  if (lockStatus.isLocked) {
    logError("login_attempt_locked_account", {
      email,
      minutesRemaining: lockStatus.minutesRemaining,
      ip: req.ip
    });

    return res.status(429).json({
      message: lockStatus.message || `Account is locked. Try again later.`,
      code: "ACCOUNT_LOCKED",
      minutesRemaining: lockStatus.minutesRemaining,
      lockedAt: lockStatus.lockedAt
    });
  }

  next();
}

/**
 * Record failed login attempt and check if should lock
 * Call this after a failed login attempt
 */
function recordLoginFailure(email, metadata = {}) {
  const result = recordFailedAttempt(email, {
    ip: metadata.ip || "unknown",
    userAgent: metadata.userAgent || "unknown",
    endpoint: metadata.endpoint || "/api/auth/login"
  });

  return result;
}

/**
 * Clear failed attempts after successful login
 * Call this after a successful login
 */
function recordLoginSuccess(email) {
  clearFailedAttempts(email);
}

/**
 * Brute force detection endpoint response
 * Returns appropriate response based on lockout status
 */
function createLockoutResponse(lockoutResult) {
  if (!lockoutResult.allowed) {
    return {
      status: lockoutResult.lockoutInfo ? 429 : 401,
      json: {
        message: lockoutResult.message,
        code: lockoutResult.lockoutInfo ? "ACCOUNT_LOCKED" : "LOGIN_FAILED",
        minutesRemaining: lockoutResult.minutesRemaining,
        lockoutInfo: lockoutResult.lockoutInfo
      }
    };
  }

  return {
    status: 401,
    json: {
      message: lockoutResult.message,
      code: "LOGIN_FAILED",
      attemptsRemaining: lockoutResult.attemptsRemaining
    }
  };
}

module.exports = {
  checkAccountLockout,
  recordLoginFailure,
  recordLoginSuccess,
  createLockoutResponse
};
