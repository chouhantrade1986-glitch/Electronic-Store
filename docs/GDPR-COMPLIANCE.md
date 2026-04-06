# GDPR Compliance Baseline (Phase 1A)

Last updated: 2026-04-06
Owner: Engineering and Operations
Status: Baseline documented, implementation gaps identified

## Purpose

This document establishes the current GDPR baseline for ElectroMart by mapping live data touchpoints, storage locations, processors, retention controls, and current data-subject rights coverage.

This is a technical and operational baseline. It is not legal advice.

## Scope

In scope:
- Customer authentication and profile APIs
- Checkout, order, payment, and after-sales APIs
- Back-in-stock requests and notifications
- Admin views that process customer identifiers
- Runtime storage and backup retention controls

Out of scope for this baseline:
- Legal approval and contract execution
- Full policy language for website legal documents
- New endpoint implementation work (tracked as follow-up)

## Data Touchpoint Inventory

| Touchpoint | Collection Entry Points | Personal Data Processed | Backend API / File Evidence | Storage Locations | Processors |
| --- | --- | --- | --- | --- | --- |
| Account registration and profile management | `auth.html` + `auth.js`, `account.html` + `account.js` | Name, email, mobile, address, password (hashed) | `/api/auth/register`, `/api/auth/me`, `/api/auth/profile` in `backend/src/routes/authRoutes.js` | `db.users` via `backend/src/lib/db.js`; browser local profile cache (`electromart_profile_v1`) | None by default at collection time |
| Sign-in and password reset OTP | Auth forms in `auth.js` | Email/mobile identifier, OTP challenge metadata, password reset events | `/api/auth/otp/request`, `/api/auth/otp/verify`, `/api/auth/password-reset/request`, `/api/auth/password-reset/confirm` in `backend/src/routes/authRoutes.js`; OTP logic in `backend/src/lib/authOtp.js` | `db.authOtpChallenges`; `db.users.passwordHash` | Email/SMS providers depending on configured mode |
| Phone verification and notification preferences | Account settings in `account.js` | Mobile number, verification challenge state, channel preferences | `/api/auth/phone-verification/request`, `/api/auth/phone-verification/confirm`, `/api/auth/notification-preferences` in `backend/src/routes/authRoutes.js`; verification logic in `backend/src/lib/phoneVerification.js` | `db.users[].phoneVerification`, `db.users[].notificationPreferences` | Twilio when configured, otherwise simulated/disabled |
| Checkout and order placement | Checkout form in `checkout.js` | Shipping address, order items, payment method, delivery slot, pricing | `/api/orders` in `backend/src/routes/orderRoutes.js` | `db.orders` (+ product reservation state) | Razorpay only when online payment provider is enabled |
| Payment lifecycle and webhook handling | Checkout payment flow in `checkout.js` | Payment IDs, gateway references, webhook payload metadata, refund metadata | `/api/payments/intent`, `/api/payments/:paymentId/confirm`, `/api/payments/:paymentId/refund`, `/api/payments/webhooks/razorpay` in `backend/src/routes/paymentRoutes.js` | `db.payments`, `db.paymentWebhookEvents` | Razorpay |
| Customer after-sales and refunds | Customer and admin after-sales actions | Customer name/email/mobile, notes, refund amounts, order references | `/api/orders/:id/after-sales` in `backend/src/routes/orderRoutes.js`; `/api/admin/after-sales` in `backend/src/routes/adminRoutes.js` | `db.afterSalesCases`, `db.adminAuditTrail`, `db.payments` | Razorpay for captured-payment refunds |
| Back-in-stock subscriptions | Product detail subscription action | Email, optional name, quantity desired, unsubscribe token | `/api/products/:id/back-in-stock-request` and `/api/products/back-in-stock/unsubscribe` in `backend/src/routes/productRoutes.js`; request model in `backend/src/lib/backInStock.js` | `db.backInStockRequests`, `db.backInStockNotifications` | SMTP or SendGrid (or simulated) |
| Admin customer and order views | Admin dashboard/API consumers | User identity fields, order/payment status, contact identifiers, audit actor details | `/api/admin/users`, `/api/admin/orders`, `/api/admin/sales`, `/api/admin/audit-trail` in `backend/src/routes/adminRoutes.js` | `db.users`, `db.orders`, `db.payments`, `db.adminAuditTrail` | None directly |

## Data Categories and Legal-Basis Draft

| Category | Example Fields | Primary Use | Working Legal Basis (to validate with legal) |
| --- | --- | --- | --- |
| Identity and contact | `name`, `email`, `mobile`, `address` | Account creation, fulfillment, support | Contract performance |
| Authentication and security | `passwordHash`, OTP challenge metadata, auth activity | Secure sign-in and account protection | Legitimate interests + security obligations |
| Transactional order data | `orderId`, items, totals, shipping address, status history | Fulfillment, returns, customer service | Contract performance |
| Payment and gateway metadata | Payment IDs, provider refs, webhook event metadata | Payment confirmation, refund lifecycle, reconciliation | Contract performance + legal obligations |
| Communications and notification prefs | Email/SMS/WhatsApp channel prefs, delivery outcomes | Transactional notifications and reminders | Contract performance or consent based on channel |
| Operational audit and compliance logs | Admin audit events, webhook processing records | Incident response, accountability, fraud review | Legitimate interests + legal obligations |

## Retention Schedule (Baseline)

The table below separates current implemented controls from target policy retention.

| Dataset | Current Implemented Control | Baseline Retention Target (proposed) | Owner |
| --- | --- | --- | --- |
| OTP challenge history (`db.authOtpChallenges`) | Capped by `AUTH_OTP_HISTORY_LIMIT` (default 200) in `backend/src/lib/authOtp.js`; individual challenge TTL default 10 minutes | Keep challenge records <= 30 days for security diagnostics | Backend engineering |
| Phone verification challenge state (`user.phoneVerification`) | Challenge TTL default 10 minutes; lock window default 10 minutes in `backend/src/lib/phoneVerification.js` | Keep only active/most recent verification state on profile; no long-term raw code retention | Backend engineering |
| Auth activity (`user.authActivity`) | Capped to latest 20 entries in `backend/src/lib/authSecurity.js` | Keep latest 20 entries (current behavior acceptable baseline) | Backend engineering |
| Payment webhook events (`db.paymentWebhookEvents`) | Capped to latest 200 entries in `backend/src/lib/db.js` | Keep 90 days or latest 200 events, whichever is stricter | Backend + operations |
| Phone verification automation run history | Capped to 120 entries in `backend/src/lib/db.js` | Keep latest 120 entries (current baseline) | Operations |
| Backup artifacts | Retention planning in `backend/src/lib/dataBackup.js`; defaults `maxBackups=14` and `maxAgeDays=14` via env | Keep 14 daily backups by default; review for production legal/financial obligations | Operations |
| User profiles (`db.users`) | No automatic purge currently | Active account lifetime + 24 months inactivity, subject to legal review | Product + legal |
| Orders and payments (`db.orders`, `db.payments`) | No automatic purge currently | 8 years for accounting/tax records, with PII minimization where possible | Finance + legal |
| Back-in-stock requests | Status lifecycle exists; no age-based purge | Purge or anonymize closed/unsubscribed entries after 12 months | Product + operations |
| Admin audit trail | No age-based purge currently | Define 12-24 month retention depending on security policy | Security + operations |

## Data Subject Rights Flow (Current State)

### Current capabilities

Implemented:
- Authenticated user profile retrieval via `/api/auth/me`
- Authenticated user order retrieval via `/api/orders/my` and `/api/orders/:id`
- Phone verification and notification preference management via `/api/auth/*`

Not implemented as dedicated APIs:
- `GET /api/user/export-data`
- `DELETE /api/user/self`

### Interim right-to-be-forgotten process (manual)

1. Verify requester identity using authenticated session plus one additional factor (email or phone verification challenge).
2. Collect account-linked records from users, orders, payments, after-sales, notifications, and audit collections.
3. Export a requester package (JSON) for access requests.
4. For deletion requests, anonymize order/payment references that must be retained for legal/accounting obligations.
5. Remove or pseudonymize direct identifiers from mutable records (email/mobile/name/address) where legal retention does not require full values.
6. Record action in admin audit trail with actor and timestamp.
7. Return completion confirmation and retained-data rationale to requester.

### Required follow-up implementation tasks

- Add dedicated user export endpoint with authenticated access control.
- Add dedicated self-delete endpoint with legal-safe anonymization workflow.
- Add retention job for stale back-in-stock and notification records.
- Add formal legal sign-off for retention targets above.

## Processor and DPA Checklist

| Processor | Purpose | Data Shared | Config Evidence | DPA Status |
| --- | --- | --- | --- | --- |
| Razorpay | Payment processing and webhook reconciliation | Payment IDs, order references, payment status metadata | `PAYMENT_PROVIDER=razorpay`, `RAZORPAY_*` in `backend/.env.example`; API usage in `backend/src/routes/paymentRoutes.js` | Required; pending legal confirmation |
| Twilio | SMS/WhatsApp OTP and notifications (optional mode) | Mobile number, OTP/notification message content | `TWILIO_*` vars in `backend/.env.example`; usage in `backend/src/lib/phoneVerification.js` and `backend/src/lib/orderNotifications.js` | Required when enabled; pending legal confirmation |
| SendGrid | Transactional email delivery (optional mode) | Email address, order/notification email body | `SENDGRID_*` vars in `backend/.env.example`; usage in `backend/src/lib/orderNotifications.js` and `backend/src/lib/backInStock.js` | Required when enabled; pending legal confirmation |
| SMTP vendor | Transactional email relay (optional mode) | Email address and message content | `SMTP_*` vars in `backend/.env.example`; usage in `backend/src/lib/orderNotifications.js` and `backend/src/lib/backInStock.js` | Vendor-specific DPA required when enabled |
| Google Drive (admin media upload) | Product media storage workflows | Operational metadata; avoid customer PII uploads | `GOOGLE_DRIVE_*` vars in `backend/.env.example`; admin media route in `backend/src/routes/adminRoutes.js` | Evaluate if DPA needed based on usage scope |

## Data Flow Artifact

See `docs/GDPR-DATA-FLOW.md` for the architecture-level flow diagram and boundaries.

## Change Log

- 2026-04-06: Initial Phase 1A GDPR baseline created with data inventory, retention schedule, rights workflow, and processor checklist.
