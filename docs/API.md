# ElectroMart API Reference

All API endpoints are served from the backend at `http://localhost:4000/api` by default. The base URL can be configured via the `PUBLIC_API_BASE_URL` environment variable in staging and production.

## Authentication

Most endpoints require a JSON Web Token (JWT) passed as a Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are issued by the OTP-verify, register, and login endpoints. Admin-only endpoints additionally require the authenticated user to have the `admin` role.

---

## Health and Metrics

### `GET /api/health`

Returns a dependency-aware health snapshot. No authentication required.

**Response**

```json
{
  "status": "ok",
  "db": "ok",
  "uptime": 123.4
}
```

### `GET /api/metrics`

Returns runtime counters (request counts, latency, memory usage). No authentication required.

**Response**

```json
{
  "requests": 42,
  "errors": 0,
  "memory": { "rss": 12345678 }
}
```

---

## Auth (`/api/auth`)

### `POST /api/auth/admin/bootstrap`

Creates the first admin account. Requires the `ADMIN_BOOTSTRAP_SECRET` environment variable to be set. Rate-limited.

**Request body**

```json
{
  "bootstrapSecret": "your-secret",
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "SecurePassword1!"
}
```

**Response** — `201 Created`

```json
{ "message": "Admin account created.", "token": "<jwt>" }
```

---

### `POST /api/auth/otp/request`

Requests a one-time password (OTP) for login or account creation. Sends OTP via email or SMS depending on the `channel` field and backend notification config. Rate-limited.

**Request body**

```json
{
  "emailOrMobile": "user@example.com",
  "channel": "email",
  "intent": "login"
}
```

`intent` — `"login"` | `"register"`

**Response** — `200 OK`

```json
{ "message": "OTP sent.", "cooldownMs": 60000 }
```

---

### `POST /api/auth/otp/verify`

Verifies the OTP and returns a JWT on success. Rate-limited.

**Request body**

```json
{
  "emailOrMobile": "user@example.com",
  "otp": "123456",
  "intent": "login"
}
```

**Response** — `200 OK`

```json
{ "token": "<jwt>", "user": { "id": "...", "name": "...", "email": "..." } }
```

---

### `POST /api/auth/password-reset/request`

Sends a password-reset OTP to the user's email. Rate-limited.

**Request body**

```json
{ "email": "user@example.com" }
```

**Response** — `200 OK`

```json
{ "message": "Password-reset OTP sent." }
```

---

### `POST /api/auth/password-reset/confirm`

Resets the password using the OTP received by email. Rate-limited.

**Request body**

```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePassword1!"
}
```

**Response** — `200 OK`

```json
{ "message": "Password updated." }
```

---

### `POST /api/auth/register`

Registers a new user with email and password. Available only when `ALLOW_PASSWORD_AUTH_FALLBACK=true`. Legacy endpoint.

**Request body**

```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "Password1!" }
```

**Response** — `201 Created`

```json
{ "token": "<jwt>", "user": { "id": "...", "name": "...", "email": "..." } }
```

---

### `POST /api/auth/login`

Authenticates a user with email and password. Available only when `ALLOW_PASSWORD_AUTH_FALLBACK=true`. Legacy endpoint.

**Request body**

```json
{ "email": "jane@example.com", "password": "Password1!" }
```

**Response** — `200 OK`

```json
{ "token": "<jwt>", "user": { "id": "...", "name": "...", "email": "..." } }
```

---

### `GET /api/auth/me` 🔒

Returns the current authenticated user's profile.

**Response** — `200 OK`

```json
{
  "id": "...",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "mobile": "+910000000000",
  "role": "customer"
}
```

---

### `GET /api/auth/security` 🔒

Returns the user's security preferences and recent authentication activity.

**Response** — `200 OK`

```json
{
  "preferences": { "twoFactorEnabled": false },
  "recentActivity": [ { "event": "login", "at": "2026-04-01T12:00:00Z" } ]
}
```

---

### `PATCH /api/auth/security-preferences` 🔒

Updates security preferences such as two-factor authentication settings.

**Request body**

```json
{ "twoFactorEnabled": true }
```

**Response** — `200 OK`

```json
{ "message": "Security preferences updated." }
```

---

### `POST /api/auth/change-password` 🔒

Changes the authenticated user's password. Rate-limited.

**Request body**

```json
{ "currentPassword": "OldPassword1!", "newPassword": "NewPassword1!" }
```

**Response** — `200 OK`

```json
{ "message": "Password changed." }
```

---

### `POST /api/auth/logout-all` 🔒

Invalidates all active sessions for the user. Rate-limited.

**Response** — `200 OK`

```json
{ "message": "All sessions signed out." }
```

---

### `PATCH /api/auth/notification-preferences` 🔒

Updates the user's notification preferences (email, SMS, WhatsApp).

**Request body**

```json
{
  "email": true,
  "sms": false,
  "whatsapp": false
}
```

**Response** — `200 OK`

```json
{ "message": "Notification preferences updated." }
```

---

### `PATCH /api/auth/profile` 🔒

Updates the authenticated user's profile fields (name, email, mobile, address).

**Request body** — all fields optional

```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "mobile": "+911234567890",
  "address": { "line1": "123 Main St", "city": "Bengaluru", "pincode": "560001" }
}
```

**Response** — `200 OK`

```json
{ "message": "Profile updated.", "user": { ... } }
```

---

### `POST /api/auth/phone-verification/request` 🔒

Sends a phone verification OTP to the authenticated user's registered mobile number. Rate-limited.

**Response** — `200 OK`

```json
{ "message": "Verification code sent.", "cooldownMs": 60000 }
```

---

### `POST /api/auth/phone-verification/confirm` 🔒

Confirms the phone verification OTP. Rate-limited.

**Request body**

```json
{ "code": "123456" }
```

**Response** — `200 OK`

```json
{ "message": "Phone number verified." }
```

---

### `POST /api/auth/test-notification` 🔒

Sends a test notification to the user using their current notification preferences. Useful for verifying notification channel configuration.

**Response** — `200 OK`

```json
{ "message": "Test notification sent." }
```

---

## Products (`/api/products`)

### `GET /api/products`

Returns a paginated, filterable list of products. No authentication required.

**Query parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Full-text search query |
| `category` | string | Filter by category name |
| `brand` | string | Filter by brand name |
| `minPrice` | number | Minimum price filter |
| `maxPrice` | number | Maximum price filter |
| `minRating` | number | Minimum rating filter |
| `sort` | string | `price_asc` \| `price_desc` \| `rating_desc` \| `newest` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

**Response** — `200 OK`

```json
{
  "products": [ { "id": "...", "name": "...", "price": 12999, "brand": "...", "category": "..." } ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

---

### `GET /api/products/:id`

Returns details for a single product by ID. No authentication required.

**Response** — `200 OK`

```json
{
  "id": "prod_001",
  "name": "Laptop Pro",
  "brand": "AstraTech",
  "category": "Laptops",
  "price": 59999,
  "stock": 14,
  "rating": 4.5,
  "description": "..."
}
```

---

### `POST /api/products/:id/back-in-stock-request`

Subscribes the caller to back-in-stock notifications for an out-of-stock product. No authentication required; email address collected in the request body.

**Request body**

```json
{ "email": "customer@example.com" }
```

**Response** — `201 Created`

```json
{ "message": "You will be notified when this product is back in stock." }
```

---

### `GET /api/products/back-in-stock/unsubscribe`

Unsubscribes an email address from back-in-stock notifications using a signed token in the query string.

**Query parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `token` | string | Signed unsubscribe token (from notification email) |

**Response** — `200 OK`

```json
{ "message": "Unsubscribed from back-in-stock notifications." }
```

---

### `POST /api/products` 🔒 Admin

Creates a new product.

**Request body**

```json
{
  "name": "New Laptop",
  "brand": "AstraTech",
  "category": "Laptops",
  "price": 49999,
  "stock": 20,
  "description": "...",
  "imageUrl": "https://..."
}
```

**Response** — `201 Created`

```json
{ "id": "prod_xxx", "name": "New Laptop", ... }
```

---

### `PUT /api/products/:id` 🔒 Admin

Fully updates an existing product.

**Request body** — same shape as `POST /api/products`

**Response** — `200 OK`

```json
{ "id": "prod_001", "name": "Updated Laptop", ... }
```

---

### `DELETE /api/products/:id` 🔒 Admin

Deletes a product by ID.

**Response** — `200 OK`

```json
{ "message": "Product deleted." }
```

---

### `POST /api/products/bulk` 🔒 Admin

Applies bulk status or collection updates to multiple products at once.

**Request body**

```json
{
  "ids": ["prod_001", "prod_002"],
  "update": { "status": "inactive" }
}
```

**Response** — `200 OK`

```json
{ "updated": 2 }
```

---

### `POST /api/products/:id/clone` 🔒 Admin

Creates a copy of an existing product with a new ID.

**Response** — `201 Created`

```json
{ "id": "prod_clone_001", "name": "Laptop Pro (Copy)", ... }
```

---

## Orders (`/api/orders`)

All order endpoints require authentication.

### `POST /api/orders` 🔒

Creates a new order. Items are validated against current inventory. A payment intent is automatically created for the Razorpay or simulated payment flow.

**Request body**

```json
{
  "items": [
    { "productId": "prod_001", "quantity": 2 }
  ],
  "paymentMethod": "razorpay",
  "shippingAddress": {
    "line1": "123 Main St",
    "city": "Bengaluru",
    "pincode": "560001"
  }
}
```

**Response** — `201 Created`

```json
{
  "orderId": "ord_xxx",
  "totalAmount": 119998,
  "paymentIntent": { "razorpayOrderId": "order_yyy" }
}
```

---

### `GET /api/orders/my` 🔒

Returns all orders belonging to the authenticated user, including after-sales information.

**Response** — `200 OK`

```json
{
  "orders": [
    { "id": "ord_001", "status": "delivered", "totalAmount": 59999, "items": [...] }
  ]
}
```

---

### `GET /api/orders/notifications` 🔒

Returns order status change notifications for the authenticated user.

**Response** — `200 OK`

```json
{
  "notifications": [
    { "orderId": "ord_001", "event": "shipped", "at": "2026-04-01T10:00:00Z" }
  ]
}
```

---

### `GET /api/orders/:id` 🔒

Returns details for a specific order. Users can only access their own orders.

**Response** — `200 OK`

```json
{
  "id": "ord_001",
  "status": "processing",
  "items": [...],
  "totalAmount": 59999,
  "shippingAddress": { ... }
}
```

---

### `POST /api/orders/:id/after-sales` 🔒

Submits a return, refund, or exchange request for a delivered order.

**Request body**

```json
{
  "type": "return",
  "reason": "Product not as described",
  "items": ["prod_001"]
}
```

`type` — `"return"` | `"refund"` | `"exchange"`

**Response** — `201 Created`

```json
{ "caseId": "as_001", "status": "open", "type": "return" }
```

---

### `PATCH /api/orders/:id/cancel` 🔒

Cancels an order that has not yet shipped. Releases reserved inventory and triggers a refund if payment was already captured.

**Response** — `200 OK`

```json
{ "message": "Order cancelled.", "refundStatus": "initiated" }
```

---

## Payments (`/api/payments`)

### `GET /api/payments/config`

Returns the active payment provider configuration. No authentication required. Used by the frontend to determine whether to display the Razorpay widget or the simulated payment form.

**Response** — `200 OK`

```json
{ "provider": "razorpay", "razorpayKeyId": "rzp_live_xxx" }
```

---

### `POST /api/payments/webhooks/razorpay`

Receives and validates Razorpay webhook events. No authentication required; secured by `RAZORPAY_WEBHOOK_SECRET` HMAC signature verification. Rate-limited.

**Headers**

```
X-Razorpay-Signature: <hmac-sha256-signature>
```

**Response** — `200 OK`

```json
{ "status": "ok" }
```

---

### `POST /api/payments/intent` 🔒

Creates a payment intent for an existing order. Returns provider-specific data needed to complete payment on the frontend.

**Request body**

```json
{ "orderId": "ord_001" }
```

**Response** — `201 Created`

```json
{
  "paymentId": "pay_xxx",
  "provider": "razorpay",
  "razorpayOrderId": "order_yyy",
  "amount": 59999,
  "currency": "INR"
}
```

---

### `POST /api/payments/:paymentId/confirm` 🔒

Confirms or captures a payment after the user completes the provider checkout flow.

**Request body (Razorpay)**

```json
{
  "razorpayPaymentId": "pay_zzz",
  "razorpaySignature": "<signature>"
}
```

**Response** — `200 OK`

```json
{ "status": "captured", "orderId": "ord_001" }
```

---

### `POST /api/payments/:paymentId/refund` 🔒

Initiates a refund for a captured payment.

**Request body**

```json
{ "amount": 59999, "reason": "Customer requested cancellation" }
```

**Response** — `200 OK`

```json
{ "refundId": "rfnd_xxx", "status": "initiated" }
```

---

### `POST /api/payments/:paymentId/cancel` 🔒

Cancels a payment that has not yet been captured.

**Response** — `200 OK`

```json
{ "status": "cancelled" }
```

---

## Admin (`/api/admin`)

All admin endpoints require authentication and the `admin` role.

### `GET /api/admin/dashboard` 🔒 Admin

Returns a summary of key business metrics: revenue, user count, order count, and more.

**Response** — `200 OK`

```json
{
  "totalRevenue": 1234567,
  "totalOrders": 420,
  "totalUsers": 88,
  "pendingOrders": 12
}
```

---

### `GET /api/admin/users` 🔒 Admin

Returns a list of all registered users with profile details.

**Response** — `200 OK`

```json
{
  "users": [
    { "id": "usr_001", "name": "Jane Doe", "email": "jane@example.com", "role": "customer" }
  ]
}
```

---

### `GET /api/admin/audit-trail` 🔒 Admin

Returns a paginated log of admin-performed actions.

**Query parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

**Response** — `200 OK`

```json
{
  "entries": [
    { "action": "product.update", "adminId": "usr_admin", "at": "2026-04-01T09:00:00Z" }
  ]
}
```

---

### `GET /api/admin/orders` 🔒 Admin

Returns all orders across all users.

**Response** — `200 OK`

```json
{
  "orders": [
    { "id": "ord_001", "userId": "usr_001", "status": "shipped", "totalAmount": 59999 }
  ]
}
```

---

### `PATCH /api/admin/orders/:id/status` 🔒 Admin

Updates the status of any order.

**Request body**

```json
{ "status": "shipped" }
```

`status` — `"processing"` | `"shipped"` | `"delivered"` | `"cancelled"`

**Response** — `200 OK`

```json
{ "message": "Order status updated.", "orderId": "ord_001", "status": "shipped" }
```

---

### `GET /api/admin/after-sales` 🔒 Admin

Returns after-sales cases with optional filtering and search.

**Query parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | `open` \| `in_progress` \| `resolved` |
| `type` | string | `return` \| `refund` \| `exchange` |
| `q` | string | Search by order ID or user email |

**Response** — `200 OK`

```json
{
  "cases": [
    { "id": "as_001", "orderId": "ord_001", "type": "return", "status": "open" }
  ]
}
```

---

### `POST /api/admin/after-sales` 🔒 Admin

Creates an after-sales case on behalf of a customer.

**Request body**

```json
{
  "orderId": "ord_001",
  "type": "refund",
  "reason": "Item damaged on arrival"
}
```

**Response** — `201 Created`

```json
{ "caseId": "as_002", "status": "open" }
```

---

### `PATCH /api/admin/after-sales/:id` 🔒 Admin

Updates the status of an after-sales case.

**Request body**

```json
{ "status": "resolved", "resolution": "Refund issued" }
```

**Response** — `200 OK`

```json
{ "caseId": "as_001", "status": "resolved" }
```

---

### `GET /api/admin/order-notifications` 🔒 Admin

Returns all order notifications with delivery status counts.

**Response** — `200 OK`

```json
{
  "notifications": [
    { "orderId": "ord_001", "event": "shipped", "delivered": true }
  ],
  "counts": { "delivered": 38, "failed": 2, "pending": 5 }
}
```

---

### `POST /api/admin/order-notifications/:id/resend` 🔒 Admin

Re-sends a previously failed or undelivered order notification.

**Response** — `200 OK`

```json
{ "message": "Notification resent." }
```

---

### `GET /api/admin/phone-verification-automation` 🔒 Admin

Returns the current configuration of the automated phone verification reminder job.

**Response** — `200 OK`

```json
{
  "enabled": true,
  "channels": ["sms", "whatsapp"],
  "lastRunAt": "2026-04-01T06:00:00Z"
}
```

---

### `PATCH /api/admin/phone-verification-automation/settings` 🔒 Admin

Updates the channels used by the phone verification automation job.

**Request body**

```json
{ "channels": ["sms"] }
```

**Response** — `200 OK`

```json
{ "message": "Settings updated." }
```

---

### `POST /api/admin/phone-verification-automation/run` 🔒 Admin

Manually triggers the phone verification reminder job.

**Response** — `200 OK`

```json
{ "message": "Phone verification automation job triggered.", "remindersQueued": 3 }
```

---

### `GET /api/admin/sales` 🔒 Admin

Returns sales orders with customer information and revenue breakdown.

**Response** — `200 OK`

```json
{
  "sales": [
    { "orderId": "ord_001", "customerName": "Jane Doe", "totalAmount": 59999, "status": "delivered" }
  ],
  "totalRevenue": 1234567
}
```

---

### `GET /api/admin/catalog` 🔒 Admin

Returns all products with inventory-level thresholds for stock management purposes.

**Response** — `200 OK`

```json
{
  "products": [
    { "id": "prod_001", "name": "Laptop Pro", "stock": 14, "lowStockThreshold": 5 }
  ]
}
```

---

### `GET /api/admin/inventory-settings` 🔒 Admin

Returns the current inventory management settings (low-stock thresholds, restock targets).

**Response** — `200 OK`

```json
{
  "lowStockThreshold": 5,
  "restockTarget": 50
}
```

---

### `PATCH /api/admin/inventory-settings` 🔒 Admin

Updates inventory management settings.

**Request body**

```json
{ "lowStockThreshold": 10, "restockTarget": 100 }
```

**Response** — `200 OK`

```json
{ "message": "Inventory settings updated." }
```

---

### `GET /api/admin/analytics` 🔒 Admin

Returns business analytics KPIs including revenue trends, order statistics, and top-selling products.

**Response** — `200 OK`

```json
{
  "revenue": { "total": 1234567, "trend": "+12%" },
  "orders": { "total": 420, "avgValue": 2939 },
  "topProducts": [ { "id": "prod_001", "name": "Laptop Pro", "unitsSold": 42 } ]
}
```

---

### `GET /api/admin/back-in-stock/requests` 🔒 Admin

Returns all back-in-stock subscription requests with demand counts per product.

**Response** — `200 OK`

```json
{
  "requests": [
    { "id": "bs_001", "productId": "prod_out", "email": "customer@example.com", "status": "pending" }
  ],
  "demandSummary": [ { "productId": "prod_out", "requestCount": 7 } ]
}
```

---

### `POST /api/admin/back-in-stock/notify/:productId` 🔒 Admin

Manually sends back-in-stock notification emails to all subscribed customers for the given product.

**Response** — `200 OK`

```json
{ "message": "Notifications sent.", "notified": 7 }
```

---

### `PATCH /api/admin/back-in-stock/requests/:id/status` 🔒 Admin

Updates the status of a back-in-stock subscription request.

**Request body**

```json
{ "status": "notified" }
```

`status` — `"pending"` | `"notified"` | `"dismissed"`

**Response** — `200 OK`

```json
{ "id": "bs_001", "status": "notified" }
```

---

### `POST /api/admin/media/upload-drive` 🔒 Admin

Uploads a media file (product image) to the configured Google Drive folder. Requires `GOOGLE_DRIVE_*` environment variables.

**Request** — `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `file` | file | Image file to upload |
| `productId` | string | Associated product ID |

**Response** — `200 OK`

```json
{ "driveFileId": "1BxiMVs0...", "webViewLink": "https://drive.google.com/..." }
```

---

## Error Responses

All endpoints return errors in the following shape:

```json
{ "error": "Human-readable error message." }
```

| HTTP Status | Meaning |
|-------------|---------|
| `400` | Bad request — missing or invalid parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient role (e.g., non-admin accessing admin route) |
| `404` | Not found — resource does not exist |
| `409` | Conflict — e.g., duplicate registration |
| `429` | Too many requests — rate limit exceeded |
| `500` | Internal server error |

---

## Rate Limits

The following endpoints apply in-memory rate limits to protect against abuse:

| Endpoint | Limit |
|----------|-------|
| `POST /api/auth/admin/bootstrap` | 5 requests / 15 min per IP |
| `POST /api/auth/otp/request` | 5 requests / 10 min per identifier |
| `POST /api/auth/otp/verify` | 10 requests / 10 min per identifier |
| `POST /api/auth/password-reset/request` | 5 requests / 15 min per IP |
| `POST /api/auth/password-reset/confirm` | 10 requests / 15 min per IP |
| `POST /api/auth/change-password` | 5 requests / 10 min per user |
| `POST /api/auth/logout-all` | 5 requests / 10 min per user |
| `POST /api/auth/phone-verification/request` | 5 requests / 10 min per user |
| `POST /api/auth/phone-verification/confirm` | 10 requests / 10 min per user |
| `POST /api/payments/webhooks/razorpay` | 100 requests / 1 min per IP |
