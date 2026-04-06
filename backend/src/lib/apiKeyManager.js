const crypto = require("crypto");
const { readDb, writeDb } = require("./db");

/**
 * API Key Management System
 * Generates, validates, and manages API keys for service-to-service authentication
 */

const API_KEY_PREFIX = "sk_"; // Secret key prefix
const API_KEY_LENGTH = 32; // 32 chars + 3 char prefix = 35 chars total

/**
 * Generate a new API key
 * @param {string} name - Name/description of the API key
 * @param {string} createdBy - User ID or email who created this key
 * @param {object} metadata - Additional metadata (userId, service name, etc)
 * @returns {object} {key: 'sk_xxxxx', hashedKey: 'hash'}
 */
function generateApiKey(name, createdBy, metadata = {}) {
  if (!name || !createdBy) {
    throw new Error("API key name and creator are required");
  }

  // Generate random 32-character key
  const randomKey = crypto.randomBytes(24).toString("hex");
  const apiKey = `${API_KEY_PREFIX}${randomKey}`;
  
  // Hash the key for storage (one-way)
  const hashedKey = hashApiKey(apiKey);

  const keyRecord = {
    id: crypto.randomUUID(),
    name,
    key: hashedKey, // Never store plaintext key
    prefix: API_KEY_PREFIX + randomKey.substring(0, 8), // Show first 8 chars for identification
    createdBy,
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
    isRevoked: false,
    revokedAt: null,
    revokedBy: null,
    expiresAt: null, // Optional: set expiration time
    metadata, // Service name, permissions, rate limit, etc
    usage: {
      requestCount: 0,
      lastRequestAt: null
    }
  };

  return {
    plainKey: apiKey, // Return plaintext key only once during creation
    hashedKey,
    record: keyRecord
  };
}

/**
 * Hash an API key for storage
 * @param {string} apiKey - The plaintext API key
 * @returns {string} Hashed key
 */
function hashApiKey(apiKey) {
  return crypto
    .createHash("sha256")
    .update(apiKey)
    .digest("hex");
}

/**
 * Validate an API key against stored hash
 * @param {string} apiKey - The plaintext API key to validate
 * @param {string} storedHash - The stored hashed key
 * @returns {boolean} True if valid
 */
function validateApiKeyHash(apiKey, storedHash) {
  const apiKeyHash = hashApiKey(apiKey);
  return apiKeyHash === storedHash;
}

/**
 * Store API key in database
 * @param {object} keyRecord - The API key record to store
 * @returns {boolean} Success status
 */
function storeApiKey(keyRecord) {
  try {
    const db = readDb();
    if (!db.apiKeys) {
      db.apiKeys = [];
    }
    db.apiKeys.push(keyRecord);
    writeDb(db);
    return true;
  } catch (error) {
    console.error("Error storing API key:", error);
    return false;
  }
}

/**
 * Retrieve API key by plaintext key
 * @param {string} apiKey - The plaintext API key
 * @returns {object|null} The API key record or null
 */
function getApiKeyByKey(apiKey) {
  if (!apiKey || !apiKey.startsWith(API_KEY_PREFIX)) {
    return null;
  }

  try {
    const db = readDb();
    const hashedKey = hashApiKey(apiKey);
    
    const keyRecord = db.apiKeys?.find(
      k => k.key === hashedKey && !k.isRevoked
    );

    if (!keyRecord) {
      return null;
    }

    // Check expiration
    if (keyRecord.expiresAt && new Date(keyRecord.expiresAt) < new Date()) {
      keyRecord.isRevoked = true;
      keyRecord.revokedAt = new Date().toISOString();
      writeDb(db);
      return null;
    }

    return keyRecord;
  } catch (error) {
    console.error("Error retrieving API key:", error);
    return null;
  }
}

/**
 * Retrieve API key by ID
 * @param {string} keyId - The API key ID
 * @returns {object|null} The API key record or null
 */
function getApiKeyById(keyId) {
  try {
    const db = readDb();
    return db.apiKeys?.find(k => k.id === keyId) || null;
  } catch (error) {
    console.error("Error retrieving API key by ID:", error);
    return null;
  }
}

/**
 * List all API keys for a creator
 * @param {string} createdBy - Creator ID or email
 * @param {boolean} includeRevoked - Include revoked keys
 * @returns {array} List of API key records (without plaintext keys)
 */
function listApiKeysByCreator(createdBy, includeRevoked = false) {
  try {
    const db = readDb();
    return (db.apiKeys || []).filter(k => {
      if (k.createdBy !== createdBy) return false;
      if (!includeRevoked && k.isRevoked) return false;
      return true;
    });
  } catch (error) {
    console.error("Error listing API keys:", error);
    return [];
  }
}

/**
 * Revoke an API key
 * @param {string} keyId - The API key ID to revoke
 * @param {string} revokedBy - User ID or email revoking the key
 * @returns {boolean} Success status
 */
function revokeApiKey(keyId, revokedBy) {
  try {
    const db = readDb();
    const keyRecord = db.apiKeys?.find(k => k.id === keyId);
    
    if (!keyRecord) {
      return false;
    }

    keyRecord.isRevoked = true;
    keyRecord.revokedAt = new Date().toISOString();
    keyRecord.revokedBy = revokedBy;
    writeDb(db);
    
    return true;
  } catch (error) {
    console.error("Error revoking API key:", error);
    return false;
  }
}

/**
 * Record API key usage
 * @param {string} keyId - The API key ID
 * @param {string} endpoint - The endpoint called
 * @param {number} statusCode - HTTP status code
 * @returns {boolean} Success status
 */
function recordApiKeyUsage(keyId, endpoint, statusCode) {
  try {
    const db = readDb();
    const keyRecord = db.apiKeys?.find(k => k.id === keyId);

    if (!keyRecord) {
      return false;
    }

    keyRecord.usage.requestCount++;
    keyRecord.usage.lastRequestAt = new Date().toISOString();
    
    if (!keyRecord.usage.byEndpoint) {
      keyRecord.usage.byEndpoint = {};
    }
    
    if (!keyRecord.usage.byEndpoint[endpoint]) {
      keyRecord.usage.byEndpoint[endpoint] = {
        count: 0,
        successCount: 0,
        errorCount: 0
      };
    }

    keyRecord.usage.byEndpoint[endpoint].count++;
    if (statusCode < 400) {
      keyRecord.usage.byEndpoint[endpoint].successCount++;
    } else {
      keyRecord.usage.byEndpoint[endpoint].errorCount++;
    }

    writeDb(db);

    return true;
  } catch (error) {
    console.error("Error recording API key usage:", error);
    return false;
  }
}

/**
 * Get API key usage statistics
 * @param {string} keyId - The API key ID
 * @returns {object} Usage statistics
 */
function getApiKeyUsageStats(keyId) {
  try {
    const db = readDb();
    const keyRecord = db.apiKeys?.find(k => k.id === keyId);
    
    if (!keyRecord) {
      return null;
    }

    return {
      totalRequests: keyRecord.usage.requestCount,
      lastUsedAt: keyRecord.usage.lastRequestAt,
      byEndpoint: keyRecord.usage.byEndpoint || {}
    };
  } catch (error) {
    console.error("Error getting API key stats:", error);
    return null;
  }
}

/**
 * Delete an API key (admin only)
 * @param {string} keyId - The API key ID to delete
 * @returns {boolean} Success status
 */
function deleteApiKey(keyId) {
  try {
    const db = readDb();
    const index = db.apiKeys?.findIndex(k => k.id === keyId);
    
    if (index === -1 || index === undefined) {
      return false;
    }

    db.apiKeys.splice(index, 1);
  writeDb(db);
    return true;
  } catch (error) {
    console.error("Error deleting API key:", error);
    return false;
  }
}

module.exports = {
  generateApiKey,
  hashApiKey,
  validateApiKeyHash,
  storeApiKey,
  getApiKeyByKey,
  getApiKeyById,
  listApiKeysByCreator,
  revokeApiKey,
  recordApiKeyUsage,
  getApiKeyUsageStats,
  deleteApiKey,
  API_KEY_PREFIX
};
