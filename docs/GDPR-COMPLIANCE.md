# GDPR Compliance Checklist
**ElectroMart Electronic Store**  
**Status:** In Progress  
**Last Updated:** March 28, 2026

---

## 1. DATA INVENTORY & MAPPING

### Personal Data Categories

#### 1.1 User Profile Data (Required)
```
Data Element          | Source        | Storage      | Retention | Purpose
---------------------|---------------|--------------|-----------|------------------
Email Address        | Registration  | SQLite/Name  | Until deletion | Auth, Communications
Phone Number         | Profile/2FA   | Encrypted    | Until deletion | Security, Notifications
First Name          | Registration  | Encrypted    | Until deletion | Personalization
Last Name           | Registration  | Encrypted    | Until deletion | Personalization
Mailing Address     | Checkout      | Encrypted    | 7 years    | Legal (tax/invoice)
Default Payment ID  | Razorpay      | Tokenized    | Until deletion | Recurring payments
Account Created     | System        | Plain        | Indefinite | Audit trail
Last Login          | System        | Plain        | 30 days    | Security
2FA Secret          | System        | Encrypted    | Until deletion | Security
Password Hash       | System        | N/A          | Until deletion | Auth
```

#### 1.2 Transaction Data (Required)
```
Data Element          | Source      | Storage      | Retention | Purpose
---------------------|-------------|--------------|-----------|------------------
Order ID            | System      | Plain        | 7 years    | Legal (invoice)
Order Date          | System      | Plain        | 7 years    | Legal
Order Items         | User        | JSON         | 7 years    | Legal
Delivery Address    | User        | Encrypted    | 3 years    | Fulfillment
Shipping Status     | Carrier     | Plain        | 3 years    | Audit
Order Total        | System      | Plain        | 7 years    | Legal
Tax Calculation    | System      | Plain        | 7 years    | Legal
Payment Method     | Tokenized   | Ref Only     | 7 years    | Legal
```

#### 1.3 Communication Data (Legal Basis)
```
Data Element          | Source           | Storage      | Retention | Purpose
---------------------|------------------|--------------|-----------|------------------
Email Preference     | User Settings    | Plain        | Until deletion | GDPR Compliance
Email Logs           | SendGrid         | Logs         | 90 days    | Audit trail
Phone Verification   | SMS Provider     | Logs         | 30 days    | Security audit
Contact History      | Support System   | Plain        | 1 year     | Customer service
Newsletter Consent   | Explicit Opt-in  | Plain        | Until withdraw | Marketing
```

#### 1.4 Technical Data (Legitimate Interest)
```
Data Element          | Source           | Storage      | Retention | Purpose
---------------------|------------------|--------------|-----------|------------------
IP Address           | HTTP Header      | Logs         | 30 days    | Security/Fraud
User Agent           | HTTP Header      | Logs         | 30 days    | Analytics
Device ID            | Browser          | LocalStorage | Until deletion | Session tracking
Session ID           | Backend          | Memory       | 24 hours   | Session management
API Keys             | System           | Encrypted    | Until deletion | API security
Login Timestamps     | System           | Plain        | 3 months   | Security audit
API Error Logs       | System           | Structured   | 90 days    | Troubleshooting
```

---

## 2. DATA FLOW DOCUMENTATION

### 2.1 Customer Registration Flow (Consents Required)
```
User Web Browser
    ↓
    [Email] ← Customer enters
    [Phone] ← Customer enters
    [Consent Checkbox: Terms + Privacy + Newsletter]
    ↓
POST /api/auth/register
    ↓
Backend Server
    ├─ Validate Data
    ├─ Encrypt PII (Email, Phone)
    ├─ Hash Password
    ├─ NO CARD DATA (Razorpay only)
    ├─ Store in SQLite
    ├─ Send Verification Email (SendGrid)
    └─ Log: "User registered, consent captured for [email, newsletter]"
    ↓
SQLite Database
    ├─ users table (email encrypted, phone encrypted)
    ├─ user_consents table (explicit audit trail)
    └─ user_audit_log table (regulatory audit)
```

### 2.2 Checkout Flow (Payment Security)
```
Checkout Page
    ↓
    [Address] ← Customer enters (encrypted in transit, encrypted at rest)
    [Payment Method] ← Razorpay iframe ONLY
    ↓
    NO DIRECT CARD DATA ENTERS YOUR SYSTEM
    ↓
Razorpay API (PCI-DSS Compliant)
    ├─ Card tokenization
    ├─ Payment processing
    └─ Returns: transaction_id + status
    ↓
Backend: POST /api/orders/create
    ├─ Store order + encrypted address
    ├─ Store Razorpay tx_id (reference only)
    ├─ Create invoice (PDF)
    └─ Send confirmation email
    ↓
SQLite orders table
    ├─ order_id, user_id, tx_id (encrypted address)
    └─ 7-year retention (legal requirement)
```

### 2.3 Data Export Flow (Right-to-Portability)
```
User Request: "Export My Data"
    ↓
   GET /api/user/export-data
    ├─ Verify authentication
    ├─ AUDIT LOG entry (who requested, when, why)
    └─ Generate ZIP containing:
        ├─ user_profile.json (all fields, decrypted)
        ├─ orders.json (all orders)
        ├─ communications.json (email history)
        ├─ payment_methods.json (last 4 digits only)
        └─ audit_log.json (all access logs)
    ↓
Return ZIP via HTTPS
    ↓
User downloads (single-use link, 24-hour expiry)
```

### 2.4 Right-to-Be-Forgotten Flow (Deletion)
```
User Request: "Delete My Account & Data"
    ↓
    [Confirm: Yes, delete everything]
    ↓
DELETE /api/user/self
    ├─ AUDIT LOG entry (retention: 7 years, for compliance)
    ├─ Delete from users table
    ├─ Delete from orders table (anonymize: user_id = NULL)
    ├─ Delete from carts table
    ├─ Delete from wishlists table
    ├─ Delete all auth tokens
    ├─ Unsubscribe from newsletters
    ├─ Send confirmation email (SendGrid log retained 90 days)
    └─ Notify: "Account deleted, data purged within 30 days"
    ↓
Scheduled Job (daily):
    ├─ Purge soft-deleted records (30 days old)
    ├─ Purge temp files
    ├─ Purge API logs (after 90 days)
    └─ Anonymize order records (remove user_id)
```

---

## 3. LEGAL BASIS FOR DATA PROCESSING

### 3.1 Processing Legal Basis

| Data Category | Legal Basis | Purpose | Retention |
|---------------|------------|---------|-----------|
| **Contractual** | Contract Performance | Fulfill order, ship, invoice | 7 years (law) |
| **Essential Profile** | Contract Performance | Account management | Until deletion |
| **2FA/Security** | Legitimate Interest | Protect account | Until deletion |
| **Marketing Email** | Explicit Consent | Newsletter | Withdrawal anytime |
| **Technical Logs** | Legitimate Interest | Fraud detection, debugging | 30-90 days |
| **Tax Records** | Legal Obligation | Tax compliance | 7 years |

---

## 4. CONSENT MANAGEMENT

### 4.1 Consent Types (Explicit Opt-In)

#### Type A: Terms & Privacy (Mandatory)
```
☑ I agree to the Terms of Service
☑ I have read the Privacy Policy
☑ I understand my data will be encrypted

Required to: Create Account
Withdrawal: Cannot un-disagree (account deletion only)
```

#### Type B: Marketing Communications (Optional)
```
☐ I want to receive promotional emails & offers
☐ I want SMS notifications for order updates

Optional to: Create Account
Withdrawal: One-click unsubscribe in email footer
Storage: Managed in `user_consents` table
```

#### Type C: Analytics (Optional)
```
☐ I allow anonymous usage analytics

Optional to: Create Account
Withdrawal: Disable in settings
Storage: Not stored individually (aggregate only)
```

### 4.2 Consent Record Storage

**Database Schema:**
```sql
CREATE TABLE user_consents (
  id INTEGER PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id),
  terms_accepted BOOLEAN DEFAULT FALSE,
  accepted_at TIMESTAMP,
  marketing_emails BOOLEAN DEFAULT FALSE,
  analytics BOOLEAN DEFAULT FALSE,
  ip_address VARCHAR(50),          -- For audit
  user_agent TEXT,                 -- For audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. DATA PROTECTION MEASURES

### 5.1 Encryption Implementation
- ✅ **In Transit:** HTTPS/TLS 1.3 (enforced)
- ✅ **At Rest (PII):** AES-256-GCM (application layer)
- ✅ **At Rest (Passwords):** bcryptjs + 10 rounds
- ✅ **At Rest (2FA):** TOTP secret encrypted in DB

### 5.2 Data Minimization
- ✅ NO credit card storage (Razorpay tokenization)
- ✅ NO SSN storage (unless tax-required, then encrypted)
- ✅ NO API keys in logs (masked with *****)
- ✅ NO passwords in logs (never logged)

### 5.3 Access Controls
- ✅ Admin panel: IP whitelisting (Phase 2)
- ✅ Admin panel: 2FA required
- ✅ Admin audit trail: All data access logged
- ✅ User API: Cannot access other user's data (owner-only)

---

## 6. DATA SUBJECT RIGHTS (Implementation)

### Right 1: Access (GET /api/user/profile)
- ✅ **Implemented:** User can view their profile
- ✅ **Scope:** Email, phone, address, orders, payment methods (last 4 digits)
- ✅ **Response Time:** Immediate (< 1 minute)
- 📋 **TODO:** Add SLA confirmation email

### Right 2: Portability (GET /api/user/export-data)
- 📋 **TODO:** Implement data export in JSON/CSV
- 📋 **TODO:** Generate ZIP file with all data
- 📋 **TODO:** 30-day retention of export
- 📋 **TODO:** Audit log generation

### Right 3: Rectification (PUT /api/user/profile)
- ✅ **Implemented:** Users can update profile
- ✅ **Scope:** Email, phone, address
- 📋 **TODO:** Email confirmation for sensitive changes

### Right 4: Erasure (DELETE /api/user/self)
- 📋 **TODO:** Implement full deletion flow
- 📋 **TODO:** Anonymize order history (keep 7 years for tax)
- 📋 **TODO:** Delete associated media files
- 📋 **TODO:** Verify deletion within 30 days

### Right 5: Restriction (PUT /api/user/restrict-processing)
- 📋 **TODO:** Implement processing restriction flag
- 📋 **TODO:** Block marketing emails on restriction
- 📋 **TODO:** Block analytics tracking

### Right 6: Object (PUT /api/user/object-processing)
- 📋 **TODO:** Object to marketing messages (one-click unsubscribe)
- 📋 **TODO:** Object to analytics (disable tracking)

---

## 7. THIRD-PARTY PROCESSORS (DPA)

### 3.1 SendGrid (Email Service)
- **Purpose:** Transactional + marketing emails
- **DPA Status:** ✅ SIGNED (required)
- **Data Processed:** Email address, name, order data
- **Location:** US + EU data centers
- **Action Required:** 📋 Ensure DPA covers current use

### 3.2 Razorpay (Payment Processor)
- **Purpose:** Payment processing
- **DPA Status:** ✅ BUILT-IN (PCI-DSS certified)
- **Data Processed:** Payment token only (NO card data)
- **Location:** India (complies with RBI)
- **Action Required:** Verify latest DPA v2023

### 3.3 Google Analytics (Optional)
- **Purpose:** Website analytics
- **DPA Status:** ⚠️ Requires anonymization configuration
- **Data Processed:** Anonymous usage patterns
- **Location:** US + EU
- **Action Required:** 📋 Configure for GDPR compliance (anonymize IP)

---

## 8. INCIDENT RESPONSE & BREACH NOTIFICATION

### 8.1 Data Breach Definition
Any unauthorized access to personal data that compromises:
- Confidentiality (encryption broken)
- Integrity (data modified)
- Availability (data deleted/locked)

### 8.2 Breach Response SLA

```
1. Detection (immediate)
   └─ Alert ops@electromart.in & #incident-ops

2. Assessment (< 24 hours)
   ├─ Scope: How many users affected?
   ├─ Severity: What data was exposed?
   └─ Decision: Notify users? (if >5 users, YES)

3. Notification (< 72 hours to GDPR authorities)
   ├─ If scope is small (< 5 users): Notify users only
   ├─ If scope is large (> 5 users or sensitive): Notify authority
   ├─ If CRITICAL (all users): Notify media

4. Evidence Collection (ongoing)
   └─ Logs, backups, forensics (retain 7 years)
```

---

## 9. PRIVACY POLICY & TERMS

### 9.1 Required Sections

- ✅ **Privacy Policy Created:** [Link to /privacy](../../privacy.html)
  - [ ] Data we collect
  - [ ] Why we collect it
  - [ ] Who we share it with
  - [ ] How long we keep it
  - [ ] Your rights
  - [ ] Contact for privacy questions

- ✅ **Terms of Service Created:** [Link to /terms](../../terms.html)
  - [ ] User obligations
  - [ ] Liability limitations
  - [ ] Data ownership
  - [ ] Dispute resolution

---

## 10. IMPLEMENTATION TIMELINE

### Week 1 (IMMEDIATE - By March 31, 2026)
- [ ] Create Privacy Policy document
- [ ] Create Terms of Service document
- [ ] Add consent checkboxes to registration form
- [ ] Create `user_consents` table
- [ ] Update registration flow to capture consent
- [ ] Add audit logging for all data access

### Week 2-3 (By April 7, 2026)
- [ ] Implement GET /api/user/export-data endpoint
- [ ] Implement DELETE /api/user/self endpoint
- [ ] Test data export (manual)
- [ ] Test user deletion (manual)
- [ ] Anonymize order records (scheduled job)
- [ ] Request DPA from SendGrid (confirm signed)

### Week 4 (By April 14, 2026)
- [ ] Security audit of data flows
- [ ] GDPR compliance checklist review
- [ ] Legal review of Privacy Policy
- [ ] Publish GDPR compliance certificate
- [ ] Train support team on user rights

---

## 11. COMPLIANCE VERIFICATION

### Checklist ✅ / ⚠️ / ❌

- [ ] Data inventory documented
- [ ] Legal basis identified for all data
- [ ] Consent management implemented
- [ ] Encryption at rest + in transit
- [ ] Data minimization applied
- [ ] User rights implemented (5/6 critical)
- [ ] DPAs signed with processors
- [ ] Privacy Policy published
- [ ] Breach notification procedure documented
- [ ] Audit logging enabled
- [ ] Cross-border transfer mechanisms (if any)
- [ ] Data Protection Officer assigned (if required)
- [ ] Annual compliance audit scheduled

---

## 12. COMPLIANCE OWNER

**Name:** [Assigned by team]  
**Email:** [privacy@electromart.in]  
**Phone:** [+91-XXXXXXXXXX]  
**Escalation:** CEO, Legal Team

---

**Last Reviewed:** March 28, 2026  
**Next Review:** June 28, 2026 (Quarterly)  
**GDPR Readiness:** 60% (improving)
