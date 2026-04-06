const { getApiKeyByKey, recordApiKeyUsage } = require("../lib/apiKeyManager");
const { logInfo, logError } = require("../lib/logger");

/**
 * API Key Validation Middleware
 * Extracts and validates API key from Authorization header
 * Supports: Authorization: Bearer sk_xxxxx or X-API-Key: sk_xxxxx
 */

function apiKeyAuthMiddleware(req, res, next) {
  // Extract API key from header
  let apiKey = null;

  // Try Authorization header first (preferred)
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    apiKey = authHeader.slice(7); // Remove "Bearer " prefix
  }

  // Fall back to X-API-Key header
  if (!apiKey && req.headers["x-api-key"]) {
    apiKey = req.headers["x-api-key"];
  }

  // No API key provided
  if (!apiKey) {
    logError("api_key_missing", {
      endpoint: req.path,
      method: req.method,
      ip: req.ip
    }, { requestId: req.requestId });

    return res.status(401).json({
      message: "API key missing. Use Authorization: Bearer <api-key> or X-API-Key header."
    });
  }

  // Validate API key
  const keyRecord = getApiKeyByKey(apiKey);

  if (!keyRecord) {
    logError("api_key_invalid", {
      endpoint: req.path,
      method: req.method,
      ip: req.ip,
      keyPrefix: apiKey.substring(0, 10) + "***"
    }, { requestId: req.requestId });

    return res.status(403).json({
      message: "Invalid or revoked API key"
    });
  }

  // Check if key is expired
  if (keyRecord.expiresAt && new Date(keyRecord.expiresAt) < new Date()) {
    logError("api_key_expired", {
      endpoint: req.path,
      method: req.method,
      keyId: keyRecord.id,
      expiresAt: keyRecord.expiresAt
    }, { requestId: req.requestId });

    return res.status(403).json({
      message: "API key has expired"
    });
  }

  // Attach API key info to request
  req.apiKey = {
    id: keyRecord.id,
    name: keyRecord.name,
    createdBy: keyRecord.createdBy,
    metadata: keyRecord.metadata || {}
  };

  // Record usage for analytics and rate limiting
  recordApiKeyUsage(keyRecord.id, req.path, 200);

  logInfo("api_key_validated", {
    keyId: keyRecord.id,
    endpoint: req.path,
    method: req.method
  }, { requestId: req.requestId });

  next();
}

/**
 * Optional: API Key scope/permission validation
 * Checks if API key has required permissions for an endpoint
 */
function validateApiKeyScope(...allowedScopes) {
  return (req, res, next) => {
    if (!req.apiKey) {
      return res.status(401).json({
        message: "API key validation required"
      });
    }

    const keyScopes = req.apiKey.metadata.scopes || [];
    const hasPermission = allowedScopes.some(scope => keyScopes.includes(scope));

    if (!hasPermission) {
      logError("api_key_insufficient_permissions", {
        keyId: req.apiKey.id,
        endpoint: req.path,
        requiredScopes: allowedScopes,
        providedScopes: keyScopes
      }, { requestId: req.requestId });

      return res.status(403).json({
        message: `API key does not have required permissions. Needed: ${allowedScopes.join(", ")}`
      });
    }

    next();
  };
}

/**
 * Optional: Rate limiting per API key
 * Set max requests per time window for specific API key
 */
const apiKeyRateLimitStore = new Map();

function createApiKeyRateLimiter(options = {}) {
  const {
    windowMs = 60 * 1000, // 1 minute
    maxRequests = 100
  } = options;

  return (req, res, next) => {
    if (!req.apiKey) {
      return next();
    }

    const keyId = req.apiKey.id;
    const now = Date.now();
    const key = `${keyId}`;

    if (!apiKeyRateLimitStore.has(key)) {
      apiKeyRateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    const record = apiKeyRateLimitStore.get(key);

    // Reset if window has passed
    if (now > record.resetTime) {
      apiKeyRateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    // Check if limit exceeded
    if (record.count >= maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      
      logError("api_key_rate_limit_exceeded", {
        keyId: req.apiKey.id,
        endpoint: req.path,
        limit: maxRequests,
        window: windowMs
      }, { requestId: req.requestId });

      res.set("Retry-After", retryAfter);
      return res.status(429).json({
        message: "API key rate limit exceeded",
        retryAfter,
        limit: maxRequests,
        window: `${windowMs / 1000}s`
      });
    }

    // Increment counter
    record.count++;
    next();
  };
}

module.exports = {
  apiKeyAuthMiddleware,
  validateApiKeyScope,
  createApiKeyRateLimiter
};
