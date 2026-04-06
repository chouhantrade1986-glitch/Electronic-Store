const { encryptPIIInObject, decryptPIIInObject, encryptPIIInArray, decryptPIIInArray } = require('../lib/encryption');

/**
 * PII fields that should be encrypted in database
 * Add/remove fields based on GDPR compliance requirements
 */
const PII_FIELDS = [
  'email',
  'phone',
  'firstName',
  'lastName',
  'address',
  'city',
  'state',
  'postalCode',
  'country',
  'ssn'
];

const SENSITIVE_FIELDS = [
  'password',
  'jwt_secret',
  'api_key',
  'oauth_token'
];

/**
 * Middleware: Auto-encrypt PII on INSERT/UPDATE (before sending to database)
 * Usage: Apply to routes that write user/user-related data
 * 
 * Example:
 *   router.post('/register', encryptPIIOnWrite, registerController);
 */
function encryptPIIOnWrite(req, res, next) {
  try {
    if (req.body && typeof req.body === 'object') {
      // Encrypt single object
      if (!Array.isArray(req.body)) {
        encryptPIIInObject(req.body, PII_FIELDS);
      } else {
        // Or array of objects
        encryptPIIInArray(req.body, PII_FIELDS);
      }
    }
    
    next();
  } catch (error) {
    console.error('PII encryption middleware error:', error);
    // Don't block on encryption error, but log it
    next(error);
  }
}

/**
 * Middleware: Auto-decrypt PII on response (after fetching from database)
 * Usage: Apply to routes that read user/user-related data
 * 
 * Intercepts res.json() to decrypt before sending to client
 * 
 * Example:
 *   router.get('/profile', decryptPIIOnRead, getProfileController);
 */
function decryptPIIOnRead(req, res, next) {
  try {
    const originalJson = res.json;
    
    res.json = function(data) {
      // Handle single object
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        decryptPIIInObject(data, PII_FIELDS);
      }
      // Handle array
      else if (Array.isArray(data)) {
        decryptPIIInArray(data, PII_FIELDS);
      }
      // Handle nested response (pagination, metadata)
      else if (data && data.data) {
        if (Array.isArray(data.data)) {
          decryptPIIInArray(data.data, PII_FIELDS);
        } else {
          decryptPIIInObject(data.data, PII_FIELDS);
        }
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  } catch (error) {
    console.error('PII decryption middleware error:', error);
    next(error);
  }
}

/**
 * Middleware: Mask sensitive fields in logs/responses
 * Usage: Apply globally to prevent accidental data exposure
 */
function maskSensitiveFields(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const copy = Array.isArray(obj) ? [...obj] : { ...obj };
  
  for (const field of SENSITIVE_FIELDS) {
    if (copy[field]) {
      copy[field] = '****MASKED****';
    }
  }
  
  return copy;
}

/**
 * Middleware: Prevent accidental PII in query params/logs
 * Usage: Applied globally to catch mistakes
 */
function piiAuditLog(req, res, next) {
  // Log request path + method (not body, to avoid PII)
  const logLine = `[${new Date().toISOString()}] ${req.method} ${req.path}`;
  
  // Check for common PII patterns in query string
  const queryString = JSON.stringify(req.query).toLowerCase();
  if (
    queryString.includes('email=') ||
    queryString.includes('phone=') ||
    queryString.includes('password=')
  ) {
    console.warn(`⚠️ POTENTIAL PII IN QUERY STRING: ${req.path}`);
  }
  
  // Store correlation ID for audit trail
  req.correlationId = req.headers['x-correlation-id'] || 
                     req.headers['x-request-id'] ||
                     `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  next();
}

/**
 * Middleware: Rate limiting for sensitive endpoints
 * Usage: Apply to /profile, /export-data, /delete-account
 */
function rateLimitSensitiveEndpoints(windowMs = 60000, maxRequests = 10) {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `${ip}:${req.path}`;
    
    const now = Date.now();
    const userRequests = requests.get(key) || [];
    
    // Clean old requests
    const recentRequests = userRequests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests to sensitive endpoint',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    recentRequests.push(now);
    requests.set(key, recentRequests);
    
    // Cleanup old IPs
    if (requests.size > 1000) {
      const oldestKey = requests.keys().next().value;
      requests.delete(oldestKey);
    }
    
    next();
  };
}

module.exports = {
  PII_FIELDS,
  SENSITIVE_FIELDS,
  encryptPIIOnWrite,
  decryptPIIOnRead,
  maskSensitiveFields,
  piiAuditLog,
  rateLimitSensitiveEndpoints
};
