const crypto = require('crypto');

/**
 * PII Encryption Module
 * Uses AES-256-GCM for authenticated encryption
 * Format: IV:CIPHERTEXT:AUTHTAG (all hex-encoded)
 */

const ENCRYPTION_KEY = process.env.PII_ENCRYPTION_KEY;

/**
 * Validate encryption key at startup
 */
function validateEncryptionKey() {
  if (!ENCRYPTION_KEY) {
    throw new Error('PII_ENCRYPTION_KEY not set in environment');
  }
  
  if (ENCRYPTION_KEY.length < 32) {
    throw new Error('PII_ENCRYPTION_KEY must be at least 32 characters');
  }
}

/**
 * Encrypt PII field using AES-256-GCM
 * @param {string} plaintext - Data to encrypt
 * @returns {string|null} IV:ciphertext:authTag (hex-encoded) or null if empty
 */
function encryptPII(plaintext) {
  if (!plaintext) return null;
  if (typeof plaintext !== 'string') plaintext = String(plaintext);
  
  validateEncryptionKey();
  
  try {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(ENCRYPTION_KEY.substring(0, 32), 'utf8').slice(0, 32);
    
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
  } catch (error) {
    throw new Error(`PII encryption failed: ${error.message}`);
  }
}

/**
 * Decrypt PII field
 * @param {string} encryptedData - Encrypted data (IV:ciphertext:authTag)
 * @returns {string|null} Decrypted plaintext or null if input is null
 */
function decryptPII(encryptedData) {
  if (!encryptedData) return null;
  if (typeof encryptedData !== 'string') {
    return null; // Not encrypted, return as-is
  }
  
  validateEncryptionKey();
  
  try {
    const parts = encryptedData.split(':');
    
    if (parts.length !== 3) {
      // Not in encrypted format, return as-is
      return encryptedData;
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const ciphertext = parts[1];
    const authTag = Buffer.from(parts[2], 'hex');
    
    // Validate sizes
    if (iv.length !== 16) throw new Error('Invalid IV size');
    if (authTag.length !== 16) throw new Error('Invalid auth tag size');
    
    const key = Buffer.from(ENCRYPTION_KEY.substring(0, 32), 'utf8').slice(0, 32);
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    // Decryption failed, log but don't throw (field might not be encrypted)
    console.warn(`PII decryption failed: ${error.message}`);
    return encryptedData; // Return encrypted data as-is
  }
}

/**
 * Check if a field appears to be encrypted
 * @param {string} value - Value to check
 * @returns {boolean}
 */
function isEncrypted(value) {
  if (!value || typeof value !== 'string') return false;
  const parts = value.split(':');
  return parts.length === 3 && /^[a-f0-9]+$/.test(value);
}

/**
 * Encrypt all PII fields in an object
 * @param {object} obj - Object to encrypt
 * @param {array} piiFields - Fields to encrypt
 * @returns {object} Modified object
 */
function encryptPIIInObject(obj, piiFields) {
  if (!obj || typeof obj !== 'object') return obj;
  
  for (const field of piiFields) {
    if (obj.hasOwnProperty(field) && obj[field]) {
      obj[field] = encryptPII(obj[field]);
    }
  }
  
  return obj;
}

/**
 * Decrypt all PII fields in an object
 * @param {object} obj - Object to decrypt
 * @param {array} piiFields - Fields to decrypt
 * @returns {object} Modified object
 */
function decryptPIIInObject(obj, piiFields) {
  if (!obj || typeof obj !== 'object') return obj;
  
  for (const field of piiFields) {
    if (obj.hasOwnProperty(field) && obj[field]) {
      obj[field] = decryptPII(obj[field]);
    }
  }
  
  return obj;
}

/**
 * Encrypt array of objects
 * @param {array} arr - Array to encrypt
 * @param {array} piiFields - Fields to encrypt
 * @returns {array} Modified array
 */
function encryptPIIInArray(arr, piiFields) {
  if (!Array.isArray(arr)) return arr;
  
  return arr.map(item => encryptPIIInObject(item, piiFields));
}

/**
 * Decrypt array of objects
 * @param {array} arr - Array to decrypt
 * @param {array} piiFields - Fields to decrypt
 * @returns {array} Modified array
 */
function decryptPIIInArray(arr, piiFields) {
  if (!Array.isArray(arr)) return arr;
  
  return arr.map(item => decryptPIIInObject(item, piiFields));
}

module.exports = {
  validateEncryptionKey,
  encryptPII,
  decryptPII,
  isEncrypted,
  encryptPIIInObject,
  decryptPIIInObject,
  encryptPIIInArray,
  decryptPIIInArray
};
