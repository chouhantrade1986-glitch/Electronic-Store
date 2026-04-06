const express = require("express");
const router = express.Router();
const {
  generateApiKey,
  storeApiKey,
  getApiKeyById,
  listApiKeysByCreator,
  revokeApiKey,
  getApiKeyUsageStats,
  deleteApiKey
} = require("../lib/apiKeyManager");
const { body, validationResult } = require("express-validator");
const { logInfo, logError } = require("../lib/logger");

/**
 * API Key Management Routes
 * All endpoints require admin authentication
 */

// Middleware to check if user is authenticated (assumes auth middleware exists)
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }
  next();
}

// Middleware to check if user is admin
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    logError("unauthorized_api_key_access", {
      endpoint: req.path,
      method: req.method,
      userId: req.user?.id,
      userRole: req.user?.role
    }, { requestId: req.requestId });

    return res.status(403).json({
      message: "Admin access required"
    });
  }
  next();
}

/**
 * POST /api/admin/api-keys
 * Generate a new API key
 * Body: { name: string, scopes?: array, expiresIn?: days }
 */
router.post(
  "/",
  requireAuth,
  requireAdmin,
  body("name")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("API key name must be 3-100 characters"),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, scopes = [], expiresIn = null } = req.body;

    // Generate new API key
    const { plainKey, record } = generateApiKey(
      name,
      req.user.email, // createdBy
      { scopes }
    );

    // Set expiration if provided
    if (expiresIn && typeof expiresIn === "number") {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiresIn);
      record.expiresAt = expiryDate.toISOString();
    }

    // Store in database
    const stored = storeApiKey(record);

    if (!stored) {
      logError("api_key_generation_failed", {
        name,
        createdBy: req.user.email
      }, { requestId: req.requestId });

      return res.status(500).json({
        message: "Failed to generate API key"
      });
    }

    logInfo("api_key_generated", {
      keyId: record.id,
      name,
      createdBy: req.user.email,
      scopes
    }, { requestId: req.requestId });

    // Return plain key (only shown once!)
    res.status(201).json({
      message: "API key generated successfully. Save this key securely - it will not be shown again!",
      key: plainKey, // Plain key shown only at creation
      keyId: record.id,
      name: record.name,
      prefix: record.prefix,
      scopes,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt
    });
  }
);

/**
 * GET /api/admin/api-keys
 * List all API keys for the current user
 */
router.get("/", requireAuth, (req, res) => {
  const keys = listApiKeysByCreator(req.user.email, false);

  const safeKeys = keys.map(k => ({
    id: k.id,
    name: k.name,
    prefix: k.prefix, // Show only prefix for identification
    createdAt: k.createdAt,
    lastUsedAt: k.usage.lastUsedAt,
    isRevoked: k.isRevoked,
    revokedAt: k.revokedAt,
    expiresAt: k.expiresAt,
    scopes: k.metadata.scopes || []
  }));

  res.json({
    keys: safeKeys,
    total: safeKeys.length
  });
});

/**
 * GET /api/admin/api-keys/:keyId
 * Get details of a specific API key
 */
router.get("/:keyId", requireAuth, (req, res) => {
  const keyRecord = getApiKeyById(req.params.keyId);

  if (!keyRecord || keyRecord.createdBy !== req.user.email) {
    return res.status(404).json({
      message: "API key not found"
    });
  }

  const stats = getApiKeyUsageStats(req.params.keyId);

  res.json({
    id: keyRecord.id,
    name: keyRecord.name,
    prefix: keyRecord.prefix,
    createdAt: keyRecord.createdAt,
    lastUsedAt: keyRecord.usage.lastUsedAt,
    isRevoked: keyRecord.isRevoked,
    revokedAt: keyRecord.revokedAt,
    expiresAt: keyRecord.expiresAt,
    scopes: keyRecord.metadata.scopes || [],
    usage: stats
  });
});

/**
 * POST /api/admin/api-keys/:keyId/revoke
 * Revoke an API key
 */
router.post("/:keyId/revoke", requireAuth, (req, res) => {
  const keyRecord = getApiKeyById(req.params.keyId);

  if (!keyRecord) {
    return res.status(404).json({
      message: "API key not found"
    });
  }

  if (keyRecord.createdBy !== req.user.email && req.user.role !== "admin") {
    return res.status(403).json({
      message: "You can only revoke your own keys"
    });
  }

  const revoked = revokeApiKey(req.params.keyId, req.user.email);

  if (!revoked) {
    return res.status(500).json({
      message: "Failed to revoke API key"
    });
  }

  logInfo("api_key_revoked", {
    keyId: req.params.keyId,
    revokedBy: req.user.email
  }, { requestId: req.requestId });

  res.json({
    message: "API key revoked successfully",
    keyId: req.params.keyId
  });
});

/**
 * DELETE /api/admin/api-keys/:keyId
 * Delete an API key (admin only)
 */
router.delete("/:keyId", requireAuth, requireAdmin, (req, res) => {
  const deleted = deleteApiKey(req.params.keyId);

  if (!deleted) {
    return res.status(404).json({
      message: "API key not found"
    });
  }

  logInfo("api_key_deleted", {
    keyId: req.params.keyId,
    deletedBy: req.user.email
  }, { requestId: req.requestId });

  res.json({
    message: "API key deleted successfully",
    keyId: req.params.keyId
  });
});

module.exports = router;
