# PHASE 1 EXECUTION PLAN
**Goal:** Compliance + PII Encryption + Incident Automation  
**Timeline:** 10 business days (1-2 person-weeks)  
**Start Date:** March 28, 2026

---

## PHASE 1A: Compliance Assessment (Days 1-2)
**Effort:** 4-6 hours

### Step 1A.1: GDPR Compliance Checklist
**What to do:**
- [ ] Document all data touchpoints (user profile, cart, orders, payments)
- [ ] Create data flow diagram (customer → frontend → backend → DB → export/archive)
- [ ] Identify personal data categories (email, phone, address, payment info)
- [ ] Document data retention periods per category
- [ ] Create DPA template for email providers (Gmail, SendGrid)
- [ ] Define right-to-be-forgotten process

**Output:**
```
/docs/GDPR-COMPLIANCE.md
- Data inventory
- Retention schedule
- Data subject rights flow (export, delete)
- DPA agreements checklist
```

**Tools Needed:**
- Google Sheets (data inventory template)
- Lucidchart / Miro (data flow diagram)

---

### Step 1A.2: PCI-DSS Compliance Assessment
**What to do:**
- [ ] Verify payment processing architecture (Razorpay integration status)
- [ ] Confirm NO credit card storage in DB (✅ Razorpay handles)
- [ ] Document tokenization flow
- [ ] Check SSL/TLS enforcement on checkout page
- [ ] Verify PCI scope (SAQ A-EP for Razorpay integration)
- [ ] Create PCI compliance checklist (26 core requirements)

**Output:**
```
/docs/PCI-DSS-COMPLIANCE.md
- SAQ A-EP checklist (26 requirements)
- Razorpay tokenization diagram
- SSL certificate validation report
- Network segregation notes
```

**Razorpay Verification:**
```bash
# Verify Razorpay integration in frontend
grep -r "razorpay" src/                # Check token-based implementation
grep -r "cvv\|card" src/               # Ensure NO direct card data
```

---

## PHASE 1B: PII Field-Level Encryption (Days 3-5)
**Effort:** 8-10 hours
**Key Changes:**
1. Add encryption/decryption middleware
2. Encrypt PII fields at application layer (NOT database)
3. Create key rotation schedule

### Step 1B.1: Setup Encryption Library

**Install crypto module (built-in Node.js):**
```bash
cd backend
npm install crypto-js dotenv --save   # For AES encryption + key management
```

**Create `/backend/src/lib/encryption.js`:**
```javascript
const crypto = require('crypto');
const CryptoJS = require('crypto-js');

const ENCRYPTION_KEY = process.env.PII_ENCRYPTION_KEY || 'fallback-key-32-chars-minimum!!';

/**
 * Encrypt PII field using AES-256-GCM
 * @param {string} plaintext - Data to encrypt
 * @returns {string} IV:ciphertext:authTag (hex-encoded)
 */
function encryptPII(plaintext) {
  if (!plaintext) return null;
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY.padEnd(32), 'utf8'), iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
}

/**
 * Decrypt PII field
 * @param {string} encryptedData - Encrypted data (IV:ciphertext:authTag)
 * @returns {string} Decrypted plaintext
 */
function decryptPII(encryptedData) {
  if (!encryptedData) return null;
  
  const parts = encryptedData.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted format');
  
  const iv = Buffer.from(parts[0], 'hex');
  const ciphertext = parts[1];
  const authTag = Buffer.from(parts[2], 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY.padEnd(32), 'utf8'), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

module.exports = { encryptPII, decryptPII };
```

### Step 1B.2: Create PII Encryption Middleware

**Create `/backend/src/middleware/piiEncryption.js`:**
```javascript
const { encryptPII, decryptPII } = require('../lib/encryption');

// PII fields to auto-encrypt
const PII_FIELDS = ['email', 'phone', 'address', 'firstName', 'lastName', 'ssn'];

/**
 * Middleware: Auto-decrypt PII on SELECT
 * Usage: Apply before route handlers that read user data
 */
function decryptPIIOnRead(req, res, next) {
  const originalJson = res.json;
  
  res.json = function(data) {
    if (data && typeof data === 'object') {
      decryptPIIInObject(data);
    } else if (Array.isArray(data)) {
      data.forEach(decryptPIIInObject);
    }
    
    return originalJson.call(this, data);
  };
  
  next();
}

/**
 * Middleware: Auto-encrypt PII on INSERT/UPDATE
 * Usage: Apply before route handlers that write user data
 */
function encryptPIIOnWrite(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    encryptPIIInObject(req.body);
  }
  
  next();
}

function decryptPIIInObject(obj) {
  if (!obj) return;
  
  for (const field of PII_FIELDS) {
    if (obj[field] && typeof obj[field] === 'string') {
      try {
        obj[field] = decryptPII(obj[field]);
      } catch (e) {
        // Field not encrypted or corrupted
      }
    }
  }
}

function encryptPIIInObject(obj) {
  if (!obj) return;
  
  for (const field of PII_FIELDS) {
    if (obj[field] && typeof obj[field] === 'string') {
      obj[field] = encryptPII(obj[field]);
    }
  }
}

module.exports = { decryptPIIOnRead, encryptPIIOnWrite };
```

### Step 1B.3: Apply Middleware to Routes

**Update `/backend/src/routes/auth.js`:**
```javascript
const { encryptPIIOnWrite, decryptPIIOnRead } = require('../middleware/piiEncryption');

// On user registration/update - encrypt PII
router.post('/register', encryptPIIOnWrite, registerController);
router.put('/profile', encryptPIIOnWrite, updateProfileController);

// On user fetch - decrypt PII
router.get('/profile', decryptPIIOnRead, getProfileController);
```

### Step 1B.4: Database Migration Script

**Create `/backend/src/jobs/migrateExistingPII.js`:**
```javascript
const { encryptPII } = require('../lib/encryption');
const db = require('../data/sqlite');

/**
 * One-time job: Encrypt all existing PII in database
 * Run safely: Creates backup first, then migrates
 */
async function migratePIIEncryption() {
  console.log('🔒 Starting PII encryption migration...');
  
  // Backup current database
  const fs = require('fs');
  const timestamp = new Date().toISOString().split('T')[0];
  fs.copyFileSync('data.db', `data.db.backup.${timestamp}`);
  console.log(`✅ Backup created: data.db.backup.${timestamp}`);
  
  const piiFields = ['email', 'phone', 'address', 'firstName', 'lastName'];
  
  try {
    // Migrate users table
    const users = db.prepare(`SELECT * FROM users`).all();
    const updateUser = db.prepare(`UPDATE users SET ${piiFields.map(f => `${f} = ?`).join(',')} WHERE id = ?`);
    
    for (const user of users) {
      const encrypted = piiFields.map(f => user[f] ? encryptPII(user[f]) : null);
      updateUser.run(...encrypted, user.id);
    }
    
    console.log(`✅ Encrypted ${users.length} user records`);
    
    // Migrate orders table
    const orders = db.prepare(`SELECT * FROM orders`).all();
    const updateOrder = db.prepare(`UPDATE orders SET ${piiFields.map(f => `${f} = ?`).join(',')} WHERE id = ?`);
    
    for (const order of orders) {
      const encrypted = piiFields.map(f => order[f] ? encryptPII(order[f]) : null);
      updateOrder.run(...encrypted, order.id);
    }
    
    console.log(`✅ Encrypted ${orders.length} order records`);
    console.log('✅ PII encryption migration complete!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('Restoring from backup...');
    fs.copyFileSync(`data.db.backup.${timestamp}`, 'data.db');
    throw error;
  }
}

module.exports = { migratePIIEncryption };
```

**Add npm script in `/backend/package.json`:**
```json
{
  "scripts": {
    "job:migrate:pii-encrypt": "node src/jobs/migrateExistingPII.js"
  }
}
```

### Step 1B.5: Update .env

**Add to `/backend/.env`:**
```env
# PII Encryption (generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
PII_ENCRYPTION_KEY=your-32-character-hexadecimal-key-here

# Key Rotation Schedule
PII_KEY_ROTATION_INTERVAL=90  # days
```

---

## PHASE 1C: Incident Runbook Automation (Days 6-8)
**Effort:** 6-8 hours
**Goal:** Auto-mitigate 3 critical incidents (health-degraded, high-errors, high-latency)

### Step 1C.1: Create Auto-Mitigation Handler

**Create `/backend/src/jobs/runIncidentAutoMitigation.js`:**
```javascript
const axios = require('axios');
const logger = require('../lib/logger');

/**
 * Auto-mitigation actions for critical incidents
 */

// Incident Type 1: Health Degraded
async function mitigateHealthDegraded() {
  logger.info('🚨 MITIGATION: Health degraded - running diagnostics');
  
  try {
    // 1. Check database connectivity
    const db = require('../data/sqlite');
    const testQuery = db.prepare('SELECT 1').get();
    if (!testQuery) throw new Error('Database unreachable');
    
    // 2. Check memory/CPU
    const os = require('os');
    const memUsage = process.memoryUsage().heapUsed / 1024 / 1024;
    logger.warn(`Memory usage: ${memUsage.toFixed(2)}MB`);
    
    if (memUsage > 800) {
      logger.warn('⚠️ HIGH MEMORY: Forcing garbage collection');
      if (global.gc) global.gc();
    }
    
    // 3. Restart unhealthy services
    const healthCheck = await checkBackendHealth();
    if (!healthCheck) {
      logger.error('❌ Backend health critical - escalating to ops');
      await notifyOps('Backend health degraded', 'critical');
    }
    
  } catch (error) {
    logger.error('Mitigation failed:', error);
    await notifyOps('Auto-mitigation failed', 'critical');
  }
}

// Incident Type 2: Error Rate High
async function mitigateHighErrorRate() {
  logger.info('🚨 MITIGATION: High error rate detected');
  
  try {
    // 1. Identify error source
    const recentErrors = getRecentErrors(300); // Last 5 minutes
    const topEndpoints = findTopErrorEndpoints(recentErrors);
    
    logger.warn(`Top error endpoints: ${topEndpoints.join(', ')}`);
    
    // 2. Enable circuit breaker for external APIs
    if (topEndpoints.includes('/orders')) {
      logger.warn('⚠️ Circuit breaker: Disabling Razorpay API calls (fallback mode)');
      process.env.RAZORPAY_CIRCUIT_BREAKER = 'true';
    }
    
    // 3. Reduce rate limit if abuse detected
    const abusePattern = detectAbusePattern(recentErrors);
    if (abusePattern) {
      logger.warn('⚠️ Abuse detected: Reducing rate limits');
      process.env.RATE_LIMIT_WINDOW = '10'; // 10 requests per minute
    }
    
    // 4. Escalate if unresolved
    if (recentErrors.length > 50) {
      await notifyOps('High error rate (50+ in 5min)', 'high');
    }
    
  } catch (error) {
    logger.error('Error rate mitigation failed:', error);
  }
}

// Incident Type 3: Latency High
async function mitigateHighLatency() {
  logger.info('🚨 MITIGATION: High latency detected');
  
  try {
    // 1. Check database query performance
    const slowQueries = identifySlowQueries();
    logger.warn(`Slow queries: ${slowQueries.map(q => q.name).join(', ')}`);
    
    // 2. Clear in-memory cache (force refresh)
    logger.warn('⚠️ Clearing application cache');
    clearAppCache();
    
    // 3. Enable read-only mode if writes are slow
    const writeLatency = measureWriteLatency();
    if (writeLatency > 1000) {
      logger.warn('⚠️ Write latency critical: Switching to read-only mode');
      process.env.READ_ONLY_MODE = 'true';
      await notifyOps('Read-only mode enabled (high write latency)', 'high');
    }
    
  } catch (error) {
    logger.error('Latency mitigation failed:', error);
  }
}

// Helper: Notify ops team
async function notifyOps(title, severity) {
  try {
    // Send to Slack webhook
    const slackWebhook = process.env.SLACK_INCIDENT_WEBHOOK;
    if (slackWebhook) {
      const color = severity === 'critical' ? 'danger' : 'warning';
      await axios.post(slackWebhook, {
        attachments: [{
          color,
          title,
          text: `⏰ ${new Date().toISOString()}\n📊 Auto-mitigation action triggered`,
          fields: [
            { title: 'Severity', value: severity, short: true },
            { title: 'Service', value: 'ElectroMart Backend', short: true }
          ]
        }]
      });
    }
    
    // Send email to ops-oncall
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    
    await transporter.sendMail({
      to: process.env.OPS_ONCALL_EMAIL,
      subject: `[${severity.toUpperCase()}] ${title}`,
      html: `
        <h2>${title}</h2>
        <p>Auto-mitigation action has been triggered.</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p><strong>Severity:</strong> ${severity}</p>
        <p><a href="${process.env.BACKEND_DASHBOARD_URL}">View Dashboard</a></p>
      `
    });
    
  } catch (error) {
    logger.error('Failed to notify ops:', error);
  }
}

module.exports = {
  mitigateHealthDegraded,
  mitigateHighErrorRate,
  mitigateHighLatency,
  notifyOps
};
```

### Step 1C.2: Create Alert Trigger Hook

**Create `/backend/src/middleware/incidentDetector.js`:**
```javascript
const { 
  mitigateHealthDegraded, 
  mitigateHighErrorRate, 
  mitigateHighLatency 
} = require('../jobs/runIncidentAutoMitigation');

const metrics = {
  errorCount: 0,
  errorTimestamp: {},
  requestLatencies: [],
  lastAlertTime: {}
};

/**
 * Incident Detector Middleware
 * Monitors in-real-time for critical patterns
 */
function incidentDetector(req, res, next) {
  const startTime = Date.now();
  
  // Intercept response
  const originalSend = res.send;
  res.send = function(data) {
    const latency = Date.now() - startTime;
    const route = `${req.method} ${req.path}`;
    
    // Track error rate
    if (res.statusCode >= 500) {
      metrics.errorCount++;
      metrics.errorTimestamp[route] = Date.now();
    }
    
    // Track latency
    metrics.requestLatencies.push(latency);
    if (metrics.requestLatencies.length > 1000) {
      metrics.requestLatencies.shift(); // Keep last 1000
    }
    
    // Check for incidents every 30 seconds
    if (Date.now() - (metrics.lastCheckTime || 0) > 30000) {
      checkIncidents();
      metrics.lastCheckTime = Date.now();
    }
    
    return originalSend.call(this, data);
  };
  
  next();
}

async function checkIncidents() {
  // Incident 1: High Error Rate (>5% in last 5 minutes)
  const recentErrors = Object.entries(metrics.errorTimestamp)
    .filter(([_, time]) => Date.now() - time < 300000).length;
  
  if (recentErrors > metrics.errorCount * 0.05) {
    console.log('🚨 Incident detected: High error rate');
    await mitigateHighErrorRate();
  }
  
  // Incident 2: High Latency (p99 > 2000ms)
  const sortedLatencies = [...metrics.requestLatencies].sort((a, b) => a - b);
  const p99 = sortedLatencies[Math.ceil(sortedLatencies.length * 0.99)];
  
  if (p99 > 2000) {
    console.log('🚨 Incident detected: High latency (p99:', p99, 'ms)');
    await mitigateHighLatency();
  }
  
  // Incident 3: Health Degraded (errors for all routes)
  const healthCheck = await performHealthCheck();
  if (!healthCheck) {
    console.log('🚨 Incident detected: Health degraded');
    await mitigateHealthDegraded();
  }
}

async function performHealthCheck() {
  try {
    const db = require('../data/sqlite');
    const result = db.prepare('SELECT 1').get();
    return !!result;
  } catch (e) {
    return false;
  }
}

module.exports = { incidentDetector };
```

### Step 1C.3: Update Server to Use Auto-Mitigation

**Update `/backend/src/server.js`:**
```javascript
const { incidentDetector } = require('./middleware/incidentDetector');

app.use(incidentDetector);  // Add near top of middleware stack

// ... rest of server config
```

### Step 1C.4: Add Incident Dashboard

**Create `/backend/src/routes/incidents.js`:**
```javascript
const express = require('express');
const router = express.Router();

/**
 * GET /api/incidents/recent
 * Return recent auto-mitigation actions
 */
router.get('/recent', (req, res) => {
  const logger = require('../lib/logger');
  const incidents = logger.getRecentIncidents(50); // Last 50
  
  res.json({
    incidents: incidents.map(inc => ({
      timestamp: inc.timestamp,
      type: inc.type, // health, error-rate, latency
      severity: inc.severity,
      action: inc.action,
      resolved: inc.resolved
    }))
  });
});

module.exports = router;
```

---

## 🎯 EXECUTION CHECKLIST - PHASE 1

### Days 1-2: GDPR & PCI-DSS Compliance
- [ ] Create `/docs/GDPR-COMPLIANCE.md`
- [ ] Create `/docs/PCI-DSS-COMPLIANCE.md`
- [ ] Data inventory spreadsheet
- [ ] Data flow diagram
- [ ] Verify Razorpay integration (no direct card storage)

### Days 3-5: PII Field-Level Encryption
- [ ] Install crypto libraries (`npm install crypto-js`)
- [ ] Create `/backend/src/lib/encryption.js`
- [ ] Create `/backend/src/middleware/piiEncryption.js`
- [ ] Create migration job `/backend/src/jobs/migrateExistingPII.js`
- [ ] Update routes to use middleware
- [ ] Add environment variables
- [ ] Test encryption/decryption (unit tests)
- [ ] Run migration on test database first
- [ ] Verify data integrity post-migration

### Days 6-8: Incident Runbook Automation
- [ ] Create `/backend/src/jobs/runIncidentAutoMitigation.js`
- [ ] Create `/backend/src/middleware/incidentDetector.js`
- [ ] Update `/backend/src/server.js` to use middleware
- [ ] Add Slack webhook integration
- [ ] Add email notification (nodemailer)
- [ ] Test each incident type (health, errors, latency)
- [ ] Create `/api/incidents/recent` endpoint for dashboard
- [ ] Document manual override procedures

---

## 📊 COMPLETION CRITERIA

✅ **GDPR**
- Data inventory documented
- DPA agreements in place
- Right-to-be-forgotten API endpoint working
- GDPR landing page created

✅ **PCI-DSS**
- SAQ A-EP compliance verified
- Zero credit card data in database
- SSL certificate active

✅ **PII Encryption**
- All customer PII encrypted at rest
- Middleware working on prod (tested)
- Key rotation schedule established

✅ **Incident Automation**
- 3 auto-mitigation paths tested
- Slack/email notifications working
- Ops dashboard accessible

---

## 🔒 SECURITY NOTES

1. **DO NOT** commit encryption keys to git
   - Use AWS Secrets Manager (Phase 2)
   - Rotate keys every 90 days

2. **PII Fields** being encrypted:
   - email, phone, firstName, lastName, address, ssn

3. **Backup Strategy:**
   - All migrations create backup before running
   - Test on staging first

4. **Performance Impact:**
   - Encryption adds ~10ms per PII field (acceptable)
   - Use database indexing on encrypted fields (searchable encryption - Phase 3)

---

## Next Phase (After Phase 1 Complete)

**Phase 2 Preview:**
- High Availability (Multi-instance + AWS ALB)
- Aurora Database Setup (replaces SQLite)
- AWS Secrets Manager Integration
- Terraform IaC for reproducible deployments

