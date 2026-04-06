# GDPR Data Flow (Phase 1A Baseline)

Last updated: 2026-04-06

## Diagram

```mermaid
flowchart TD
  A[Customer Browser]
  A1[auth.js]
  A2[account.js]
  A3[checkout.js]
  A4[product detail and wishlist flows]
  A5[Browser localStorage\nauth/profile/cart/wishlist]

  B[Backend API Server\nbackend/src/server.js]
  B1[/api/auth routes]
  B2[/api/orders routes]
  B3[/api/payments routes]
  B4[/api/products routes]
  B5[/api/admin routes]

  C[(Primary datastore\nJSON or SQLite)]
  C1[(users)]
  C2[(orders)]
  C3[(payments)]
  C4[(afterSales and audit)]
  C5[(notifications and OTP state)]

  D[Razorpay]
  E[Twilio]
  F[SendGrid or SMTP]

  G[Backup and retention jobs\nbackend/src/lib/dataBackup.js]

  A --> A1 --> B
  A --> A2 --> B
  A --> A3 --> B
  A --> A4 --> B
  A --> A5

  B --> B1 --> C
  B --> B2 --> C
  B --> B3 --> C
  B --> B4 --> C
  B --> B5 --> C

  C --> C1
  C --> C2
  C --> C3
  C --> C4
  C --> C5

  B3 <--> D
  B1 <--> E
  B2 <--> E
  B4 <--> F
  B2 <--> F

  C --> G
```

## Notes

- Authentication and profile data flows through `/api/auth/*` and is persisted in users and auth-security related collections.
- Checkout and order data flows through `/api/orders/*` and writes shipping and order lifecycle records.
- Payment metadata and webhook processing flow through `/api/payments/*` with optional Razorpay integration.
- Notification channels can route through Twilio, SendGrid, or SMTP depending on runtime mode.
- Backup retention controls are configured by `BACKUP_RETENTION_MAX_BACKUPS` and `BACKUP_RETENTION_MAX_AGE_DAYS`.

## Current Gaps to Close

- No dedicated API endpoint exists yet for full user data export.
- No dedicated self-service account deletion endpoint exists yet.
- Collection-level retention jobs for users, orders, and audit artifacts are not yet enforced by code.
