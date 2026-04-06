# Two-Factor Authentication (TOTP) Implementation Guide

## 📋 Overview
This document guides you through the new **2FA (TOTP)** implementation, including setup, testing, API endpoints, and frontend integration.

---

## ✨ Features Implemented

### 1. **Soft Login Mode** (Temporary Token Flow)
- User logs in with OTP + password
- If 2FA is enabled, server returns a **temporary JWT** instead of rejecting login
- Client can then complete login by providing the TOTP code
- Temporary token is valid for **15 minutes** and only allows access to `/auth/2fa/login-verify`

### 2. **2FA Setup & Management**
- `POST /2fa/setup` - Generates TOTP secret and QR code
- `POST /2fa/verify` - Enables 2FA after validating TOTP code
- `POST /2fa/disable` - Disables 2FA (requires password + current TOTP code)
- `POST /2fa/login-verify` - Completes login with 2FA code (using temporary token)

### 3. **Frontend UI** 
- **2fa-setup.html** - Complete 2FA management interface with:
  - QR code display (using qrcode.js CDN)
  - Setup form with secret key backup
  - Verification form
  - Disable form
  - Status dashboard
- **auth.html** - Updated login flow with 2FA modal dialog
- **auth.js** - Enhanced authentication state management

### 4. **Persistent Audit Logging**
All 2FA events are recorded in user's `authActivity`:
- `2fa_setup_initiated` - 2FA setup started
- `2fa_enabled` - 2FA successfully enabled
- `2fa_disabled` - 2FA successfully disabled
- `auth_2fa_login_verified` - Successful login via OTP + 2FA

---

## 🔑 API Endpoints

### Setup 2FA
```bash
POST /api/auth/2fa/setup
Authorization: Bearer {token}

Response:
{
  "message": "Two-factor authentication setup is ready...",
  "otpauthUrl": "otpauth://totp/Electronic%20Store:user@example.com?issuer=Electronic%20Store&secret=...",
  "secret": "BASE32_SECRET_KEY"
}
```

### Verify 2FA
```bash
POST /api/auth/2fa/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "token": "123456"
}

Response (on success):
{
  "message": "Two-factor authentication is enabled."
}
```

### Disable 2FA
```bash
POST /api/auth/2fa/disable
Authorization: Bearer {token}
Content-Type: application/json

{
  "token": "123456",
  "password": "user_password"
}

Response:
{
  "message": "Two-factor authentication is disabled."
}
```

### Login with 2FA (Soft Flow)
```bash
# Step 1: Request OTP
POST /api/auth/otp/request
{ "purpose": "login", "channel": "email", "emailOrMobile": "...", "password": "..." }

# Step 2: Verify OTP
POST /api/auth/otp/verify
{
  "purpose": "login",
  "challengeId": "...",
  "code": "OTP_CODE",
  "emailOrMobile": "...",
  "password": "..."
}

Response (if 2FA enabled):
{
  "message": "Enter your two-factor authentication code to complete login.",
  "tempToken": "eyJhbGc...",
  "twoFactorRequired": true
}

# Step 3: Complete with 2FA Code
POST /api/auth/2fa/login-verify
{
  "tempToken": "eyJhbGc...",
  "token": "123456"
}

Response:
{
  "message": "Login successful.",
  "token": "FULL_JWT_TOKEN",
  "user": { ... }
}
```

---

## 🧪 Testing the 2FA Flow

### Option 1: Using E2E Test Script
```bash
cd /path/to/Electronic-Store

# Make sure backend is running first
cd backend
npm run dev

# In another terminal, run the full E2E test
cd ..
node qa-2fa-e2e.js
```

This will:
1. Create a test user
2. Setup 2FA
3. Verify with a real TOTP code (generated using speakeasy)
4. Test soft login flow
5. Complete login with 2FA
6. Disable 2FA
7. Display full results

### Option 2: Manual Frontend Testing
1. Open http://localhost:3000/2fa-setup.html
2. Login with your account (you'll need an auth token)
3. Click "Setup 2FA"
4. Scan the QR code with Google Authenticator, Microsoft Authenticator, or Authy
5. Enter the 6-digit code to enable
6. Log out and login again
7. After OTP, you'll see the 2FA verification modal
8. Enter the code from your authenticator app
9. You'll receive a full JWT

### Option 3: Using cURL/API Client

```bash
# 1. Setup 2FA
curl -X POST http://localhost:3001/api/auth/2fa/setup \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# 2. Generate TOTP (using Node.js)
node -e "const s=require('speakeasy'); console.log(s.totp({secret:'BASE32_SECRET',encoding:'base32'}))"

# 3. Verify 2FA
curl -X POST http://localhost:3001/api/auth/2fa/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"token":"123456"}'

# 4. Login with soft flow (see API section above)
```

---

## 🏗️ Code Changes

### Backend Files Modified
- **backend/src/lib/auth.js**
  - Added `signTemporaryTwoFactorToken()` - Creates 15-min JWT with `twoFactorPending: true`
  
- **backend/src/lib/twoFactorAuth.js**
  - Updated `generateTotpSecret()` - Added issuer/accountName support
  
- **backend/src/routes/authRoutes.js**
  - `POST /2fa/setup` - New endpoint
  - `POST /2fa/verify` - New endpoint
  - `POST /2fa/disable` - New endpoint
  - `POST /2fa/login-verify` - New endpoint (completes soft login)
  - Updated login OTP verify handler - Returns temp token if 2FA enabled
  - Added audit logging to all 2FA endpoints

### Frontend Files
- **2fa-setup.html** - New page for 2FA management
- **auth.html** - Added 2FA modal dialog
- **auth.js** - Added 2FA flow handlers:
  - `showTwoFAModal()` - Display 2FA prompt
  - `submitTwoFAForm()` - Verify 2FA code
  - `cancelTwoFA()` - Cancel 2FA flow

---

## 🔐 Security Considerations

1. **Temporary Tokens**
   - 15-minute expiry
   - Can only be used with `/2fa/login-verify` endpoint
   - Include `twoFactorPending: true` claim

2. **TOTP Codes**
   - Time-window: ±1 step (±30 seconds)
   - Base32 encoded secrets
   - Real-time generation required

3. **Rate Limiting**
   - Existing rate limiters apply to all endpoints
   - 2FA verification failures are logged in audit trail

4. **Audit Trail**
   - All 2FA events stored in user's `authActivity`
   - Timestamps and event types recorded
   - Accessible via `/auth/me` endpoint

---

## 📊 User Flow Diagram

```
Login Page
    ↓
OTP Request → OTP Delivery
    ↓
OTP Verification
    ↓
    ├─→ If 2FA Disabled → Full JWT ✓
    │
    └─→ If 2FA Enabled → Temp Token
            ↓
        2FA Modal Dialog
            ↓
        TOTP Code Entry
            ↓
        2FA Login Verify
            ↓
        Full JWT ✓
```

---

## 🐛 Troubleshooting

**Q: Backend returns "2FA not set up" when trying to enable**  
A: Run `POST /2fa/setup` first to generate the secret.

**Q: TOTP code shows as invalid**  
A: Check that your system time is synchronized (TOTP is time-based).

**Q: Can't disable 2FA with correct password and code**  
A: Verify you're using the correct password hash (bcrypt). If offline mode, use dummy code `000000`.

**Q: Frontend 2FA modal doesn't appear after login**  
A: Check browser console for errors. Ensure auth.html includes the 2FA modal HTML.

---

## 📚 Environment Variables

Optional - can customize 2FA experience:

```bash
TWO_FACTOR_ISSUER=YourCompanyName
```

This sets the issuer name shown in authenticator apps.

---

## 🎯 Next Steps (Optional Enhancements)

1. **SMS Fallback** - Allow SMS TOTP delivery as alternative to app
2. **Backup Codes** - Generate one-time codes for account recovery
3. **Device Trust** - Remember trusted devices
4. **2FA Enforcement** - Require 2FA for admin accounts
5. **Security Keys** - Support WebAuthn / FIDO2 devices

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs: `backend/src/logs/`
3. Check user's `authActivity` for event records
4. Verify environment configuration

---

**Last Updated:** March 18, 2026  
**Implementation Status:** ✅ Complete (Soft Login + 2FA Setup/Verify/Disable + Audit Logging)
