const { readDb, writeDb } = require("./db");
const { logInfo, logError } = require("./logger");

/**
 * Account Lockout & Brute Force Protection Manager
 * Tracks failed login attempts and enforces account lockouts
 */

const DEFAULT_MAX_ATTEMPTS = 5; // Lock after 5 failed attempts
const DEFAULT_LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const DEFAULT_ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // Reset attempts after 15 minutes

/**
 * Initialize lockout tracking for a user
 * @param {string} email - User email
 * @returns {object} Lockout record
 */
function initializeUserLockout(email) {
  return {
    email: email.toLowerCase(),
    failedAttempts: 0,
    lastFailedAt: null,
    isLocked: false,
    lockedAt: null,
    unlockedAt: null,
    unlockedBy: null, // 'admin', 'email-verification', 'time-expired'
    attemptHistory: [],
    securityAlerts: []
  };
}

/**
 * Record a failed login attempt
 * @param {string} email - User email
 * @param {object} metadata - Additional info (ip, userAgent, etc)
 * @returns {object} {allowed: boolean, message: string, attemptsRemaining: number, lockoutInfo?: object}
 */
function recordFailedAttempt(email, metadata = {}) {
  email = email.toLowerCase();
  const db = readDb();

  if (!db.accountLockouts) {
    db.accountLockouts = {};
  }

  let lockout = db.accountLockouts[email];
  if (!lockout) {
    lockout = initializeUserLockout(email);
    db.accountLockouts[email] = lockout;
  }

  const now = new Date();

  // Check if locked
  if (lockout.isLocked) {
    const lockDuration = DEFAULT_LOCKOUT_DURATION_MS;
    const timeSinceLock = now - new Date(lockout.lockedAt);

    // Auto-unlock if lockout period expired
    if (timeSinceLock > lockDuration) {
      lockout.isLocked = false;
      lockout.unlockedAt = now.toISOString();
      lockout.unlockedBy = "time-expired";
      lockout.failedAttempts = 0;
      lockout.attemptHistory = [];

      logInfo("account_auto_unlocked", {
        email,
        unlockedBy: "lockout_expired",
        lockoutDuration: lockDuration / 1000 + "s"
      });
      writeDb(db);
    } else {
      // Still locked
      const minutesRemaining = Math.ceil((lockDuration - timeSinceLock) / 60000);

      logError("account_locked_attempt", {
        email,
        minutesRemaining,
        ip: metadata.ip
      });

      return {
        allowed: false,
        message: `Account is locked due to too many failed attempts. Please try again in ${minutesRemaining} minutes.`,
        minutesRemaining,
        attemptsRemaining: 0,
        lockoutInfo: {
          lockedAt: lockout.lockedAt,
          unlocksAt: new Date(new Date(lockout.lockedAt).getTime() + lockDuration).toISOString()
        }
      };
    }
  }

  // Check if resetting attempts (outside the window)
  if (lockout.lastFailedAt) {
    const timeSinceLastAttempt = now - new Date(lockout.lastFailedAt);
    if (timeSinceLastAttempt > DEFAULT_ATTEMPT_WINDOW_MS) {
      lockout.failedAttempts = 0;
      lockout.attemptHistory = [];
    }
  }

  // Increment failed attempts
  lockout.failedAttempts++;
  lockout.lastFailedAt = now.toISOString();

  // Record attempt in history
  lockout.attemptHistory.push({
    timestamp: now.toISOString(),
    ip: metadata.ip || "unknown",
    userAgent: metadata.userAgent || "unknown",
    result: "failed"
  });

  // Keep only last 50 attempts in history
  if (lockout.attemptHistory.length > 50) {
    lockout.attemptHistory = lockout.attemptHistory.slice(-50);
  }

  const attemptsRemaining = DEFAULT_MAX_ATTEMPTS - lockout.failedAttempts;

  // Check if should lock account
  if (lockout.failedAttempts >= DEFAULT_MAX_ATTEMPTS) {
    lockout.isLocked = true;
    lockout.lockedAt = now.toISOString();

    // Add security alert
    lockout.securityAlerts.push({
      type: "account_locked",
      timestamp: now.toISOString(),
      reason: "Too many failed login attempts",
      ip: metadata.ip || "unknown"
    });

    logError("account_locked_threshold", {
      email,
      attempts: lockout.failedAttempts,
      ip: metadata.ip,
      lockoutDuration: DEFAULT_LOCKOUT_DURATION_MS / 1000 + "s"
    });

    writeDb(db);

    return {
      allowed: false,
      message: "Account locked due to too many failed login attempts. Please try again in 15 minutes or contact support.",
      attemptsRemaining: 0,
      lockoutInfo: {
        lockedAt: lockout.lockedAt,
        unlocksAt: new Date(now.getTime() + DEFAULT_LOCKOUT_DURATION_MS).toISOString(),
        reason: "Too many failed attempts"
      }
    };
  }

  logInfo("failed_login_attempt_recorded", {
    email,
    attempts: lockout.failedAttempts,
    attemptsRemaining,
    ip: metadata.ip
  });

  writeDb(db);

  return {
    allowed: true,
    message: `Login attempt failed. ${attemptsRemaining} attempts remaining before account lockout.`,
    attemptsRemaining,
    lockoutInfo: null
  };
}

/**
 * Record a successful login (reset attempts)
 * @param {string} email - User email
 * @returns {void}
 */
function clearFailedAttempts(email) {
  email = email.toLowerCase();
  const db = readDb();

  if (!db.accountLockouts) {
    db.accountLockouts = {};
  }

  let lockout = db.accountLockouts[email];
  if (!lockout) {
    lockout = initializeUserLockout(email);
    db.accountLockouts[email] = lockout;
  }

  // Reset failed attempts on successful login
  lockout.failedAttempts = 0;
  lockout.lastFailedAt = null;
  lockout.attemptHistory.push({
    timestamp: new Date().toISOString(),
    ip: "successful-login",
    userAgent: "login-success",
    result: "success"
  });

  logInfo("failed_attempts_cleared", {
    email
  });

  writeDb(db);
}

/**
 * Check if account is locked
 * @param {string} email - User email
 * @returns {object} {isLocked: boolean, minutesRemaining?: number, message?: string}
 */
function checkAccountLockStatus(email) {
  email = email.toLowerCase();
  const db = readDb();

  const lockout = db.accountLockouts?.[email];
  if (!lockout || !lockout.isLocked) {
    return { isLocked: false };
  }

  const now = new Date();
  const lockDuration = DEFAULT_LOCKOUT_DURATION_MS;
  const timeSinceLock = now - new Date(lockout.lockedAt);

  // Auto-unlock if expired
  if (timeSinceLock > lockDuration) {
    lockout.isLocked = false;
    lockout.unlockedAt = now.toISOString();
    lockout.unlockedBy = "time-expired";
    lockout.failedAttempts = 0;
    writeDb(db);

    return { isLocked: false };
  }

  const minutesRemaining = Math.ceil((lockDuration - timeSinceLock) / 60000);
  return {
    isLocked: true,
    minutesRemaining,
    lockedAt: lockout.lockedAt,
    message: `Account locked. Try again in ${minutesRemaining} minutes`
  };
}

/**
 * Unlock account (by admin)
 * @param {string} email - User email
 * @param {string} unlockedBy - Admin email or reason
 * @returns {boolean} Success status
 */
function unlockAccountAdmin(email, unlockedBy) {
  email = email.toLowerCase();
  const db = readDb();

  if (!db.accountLockouts?.[email]) {
    return false;
  }

  const lockout = db.accountLockouts[email];
  lockout.isLocked = false;
  lockout.unlockedAt = new Date().toISOString();
  lockout.unlockedBy = unlockedBy || "admin";
  lockout.failedAttempts = 0;
  lockout.attemptHistory = [];

  logInfo("account_unlocked_admin", {
    email,
    unlockedBy
  });

  writeDb(db);

  return true;
}

/**
 * Get lockout status for a user
 * @param {string} email - User email
 * @returns {object} Full lockout information
 */
function getLockoutStatus(email) {
  email = email.toLowerCase();
  const db = readDb();

  let lockout = db.accountLockouts?.[email];
  if (!lockout) {
    lockout = initializeUserLockout(email);
  }

  return {
    email: lockout.email,
    failedAttempts: lockout.failedAttempts,
    isLocked: lockout.isLocked,
    lockedAt: lockout.lockedAt,
    attemptsRemaining: Math.max(0, DEFAULT_MAX_ATTEMPTS - lockout.failedAttempts),
    lastFailedAt: lockout.lastFailedAt,
    attemptHistory: lockout.attemptHistory.slice(-10) // Last 10 attempts
  };
}

/**
 * Get security alerts for an account
 * @param {string} email - User email
 * @returns {array} Security alerts
 */
function getSecurityAlerts(email) {
  email = email.toLowerCase();
  const db = readDb();

  const lockout = db.accountLockouts?.[email];
  if (!lockout) {
    return [];
  }

  return lockout.securityAlerts || [];
}

/**
 * Add custom security alert
 * @param {string} email - User email
 * @param {string} type - Alert type
 * @param {string} message - Alert message
 * @returns {void}
 */
function addSecurityAlert(email, type, message) {
  email = email.toLowerCase();
  const db = readDb();

  if (!db.accountLockouts) {
    db.accountLockouts = {};
  }

  let lockout = db.accountLockouts[email];
  if (!lockout) {
    lockout = initializeUserLockout(email);
    db.accountLockouts[email] = lockout;
  }

  lockout.securityAlerts.push({
    type,
    message,
    timestamp: new Date().toISOString()
  });

  // Keep only last 100 alerts
  if (lockout.securityAlerts.length > 100) {
    lockout.securityAlerts = lockout.securityAlerts.slice(-100);
  }

  writeDb(db);
}

module.exports = {
  recordFailedAttempt,
  clearFailedAttempts,
  checkAccountLockStatus,
  unlockAccountAdmin,
  getLockoutStatus,
  getSecurityAlerts,
  addSecurityAlert,
  DEFAULT_MAX_ATTEMPTS,
  DEFAULT_LOCKOUT_DURATION_MS
};
