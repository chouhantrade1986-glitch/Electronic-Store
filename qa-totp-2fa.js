#!/usr/bin/env node
/**
 * QA Test Suite for 2FA (TOTP) Implementation
 * Tests: setup, verify, soft login, 2FA login completion, disable
 */

const http = require("http");
const crypto = require("crypto");
const speakeasy = require("speakeasy");

const API_BASE = "http://localhost:4000/api/";

let testResults = [];
let authToken = "";
let tempToken = "";
let testUserId = "";
let twoFactorSecret = "";

function makeRequest(method, endpoint, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, API_BASE);
    console.log(`Making request: ${method} ${url}`); // DEBUG LOG
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        "Content-Type": "application/json"
      }
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on("error", (err) => {
      console.error("Request Error:", err);
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("🧪 Starting 2FA (TOTP) QA Tests\n");

  try {
    // Test 1: Create a test user via OTP registration
    console.log("📝 Test 1: User Registration");
    const testEmail = `2fa-test-${Date.now()}@test.com`;
    const testMobile = `9${Date.now().toString().slice(-9)}`; // Generate a 10-digit number starting with 9, using current timestamp
    const testPassword = "SecurePass123!";

    const otpReqRes = await makeRequest("POST", "auth/otp/request", {
      purpose: "register",
      channel: "email",
      name: "2FA Test User",
      email: testEmail,
      mobile: testMobile,
      password: testPassword,
      address: "123 Test St"
    });

    if (otpReqRes.status !== 200) {
      console.error("OTP request failed. Full response:", otpReqRes); // DEBUG LOG
      throw new Error(`OTP request failed: ${otpReqRes.status}`);
    }

    const challengeId = otpReqRes.data.challengeId;
    const registrationOtp = otpReqRes.data.otpPreview;
    if (!registrationOtp) {
      throw new Error("Could not get registration OTP preview from server.");
    }
    testResults.push({
      test: "Create test user (OTP request)",
      result: "✅ PASS",
      details: `Challenge ID: ${challengeId}`
    });

    const verifyRes = await makeRequest("POST", "auth/otp/verify", {
      purpose: "register",
      challengeId: challengeId,
      code: registrationOtp
    });

    if (verifyRes.status === 201 || verifyRes.status === 200) {
      authToken = verifyRes.data.token;
      testUserId = verifyRes.data.user.id;
      testResults.push({
        test: "Register user (OTP verify)",
        result: "✅ PASS",
        details: `User ID: ${testUserId}`
      });
    } else {
      throw new Error(`User registration failed: ${verifyRes.status}`);
    }

    // Test 2: Setup 2FA
    console.log("📝 Test 2: Setup 2FA");
    const setupRes = await makeRequest("POST", "auth/2fa/setup", {}, authToken);

    if (setupRes.status !== 200) {
      throw new Error(`2FA setup failed: ${setupRes.status}`);
    }

    twoFactorSecret = setupRes.data.secret;
    const otpauthUrl = setupRes.data.otpauthUrl;

    testResults.push({
      test: "2FA Setup",
      result: "✅ PASS",
      details: `Secret: ${twoFactorSecret.substring(0, 8)}...`
    });

    // Test 3: Verify 2FA with a generated TOTP
    console.log("📝 Test 3: Verify 2FA Code");
    const generatedTotp = speakeasy.totp({
      secret: twoFactorSecret,
      encoding: "base32"
    });

    const verify2FARes = await makeRequest("POST", "auth/2fa/verify", {
      token: generatedTotp
    }, authToken);

    if (verify2FARes.status === 200) {
      testResults.push({
        test: "Enable 2FA (live TOTP)",
        result: "✅ PASS",
        details: "Successfully enabled 2FA with a valid, generated token."
      });
    } else {
      throw new Error(`2FA verification failed with live TOTP: ${verify2FARes.status}`);
    }

    // Test 4: Soft login (OTP + password) should return temp token when 2FA is enabled
    console.log("📝 Test 4: Soft Login (OTP + Password)");

    const loginOtpRes = await makeRequest("POST", "auth/otp/request", {
      purpose: "login",
      channel: "email",
      emailOrMobile: testEmail,
      password: testPassword
    });

    if (loginOtpRes.status !== 200) {
      throw new Error(`Login OTP request failed: ${loginOtpRes.status}`);
    }

    const loginChallengeId = loginOtpRes.data.challengeId;
    const loginOtp = loginOtpRes.data.otpPreview;
    if (!loginOtp) {
      throw new Error("Could not get login OTP preview from server.");
    }

    const loginVerifyRes = await makeRequest("POST", "auth/otp/verify", {
      purpose: "login",
      challengeId: loginChallengeId,
      code: loginOtp,
      emailOrMobile: testEmail,
      password: testPassword
    });

    if (loginVerifyRes.status === 200) {
      if (loginVerifyRes.data.twoFactorRequired && loginVerifyRes.data.tempToken) {
        tempToken = loginVerifyRes.data.tempToken;
        testResults.push({
          test: "Soft Login (OTP + password)",
          result: "✅ PASS",
          details: "Returned temp token for 2FA completion"
        });
      } else {
        throw new Error("Soft login did not return a temp token for 2FA-enabled user.");
      }
    } else {
      throw new Error(`Login verification failed: ${loginVerifyRes.status}`);
    }

    // Test 5: 2FA Login Verification (if we have temp token)
    console.log("📝 Test 5: 2FA Login Verification");

    if (tempToken) {
      const loginTotp = speakeasy.totp({
        secret: twoFactorSecret,
        encoding: "base32"
      });
      const twoFALoginRes = await makeRequest("POST", "auth/2fa/login-verify", {
        tempToken: tempToken,
        token: loginTotp
      });
      // Update auth token to the new full-access token
      authToken = twoFALoginRes.data.token;
      return "Issued full JWT after 2FA verification";
    });

    await testStep("Check 2FA Status (Enabled)", async () => {
      const statusRes = await makeRequest("POST", "auth/me", {}, authToken);
      const twoFAEnabled = statusRes.data.user.twoFactorEnabled;
      if (!twoFAEnabled) {
        throw new Error("2FA status check shows it is not enabled after verification.");
      }
      return `2FA Enabled: ${twoFAEnabled}`;
    });

    await testStep("Disable 2FA", async () => {
      const disableTotp = speakeasy.totp({
        secret: twoFactorSecret,
        encoding: "base32"
      });
      const disable2FARes = await makeRequest("POST", "auth/2fa/disable", {
        token: disableTotp,
        password: testPassword
      }, authToken);
      return "2FA disabled successfully";
    });

    await testStep("Check 2FA Status (Disabled)", async () => {
      const statusRes = await makeRequest("POST", "auth/me", {}, authToken);
      const twoFAEnabled = statusRes.data.user.twoFactorEnabled;
      if (twoFAEnabled) {
        throw new Error("2FA status check shows it is still enabled after disabling.");
      }
      return `2FA Enabled: ${twoFAEnabled}`;
    });

    // Test: Login with 2FA enabled, then try to disable with wrong OTP
    // This simulates a negative test case
    let tempTokenForNegativeTest;
    await testStep("Setup 2FA again for negative test", async () => {
      const setupRes = await makeRequest("POST", "auth/2fa/setup", {}, authToken);
      twoFactorSecret = setupRes.data.secret;
      return `Secret: ${twoFactorSecret.substring(0, 8)}...`;
    });

    await testStep("Verify 2FA Code again for negative test", async () => {
      const generatedTotp = speakeasy.totp({ secret: twoFactorSecret, encoding: "base32" });
      await makeRequest("POST", "auth/2fa/verify", { token: generatedTotp }, authToken);
      return "Successfully re-enabled 2FA.";
    });

    await testStep("Attempt to Disable 2FA with Invalid TOTP (Negative Test)", async () => {
      const invalidTotp = "000000"; // Always an invalid TOTP
      try {
        await makeRequest("POST", "auth/2fa/disable", {
          token: invalidTotp,
          password: testPassword
        }, authToken);
        throw new Error("Disabling 2FA with invalid TOTP unexpectedly succeeded.");
      } catch (error) {
        if (error.message.includes("401") || error.message.includes("Invalid TOTP")) { // Adjust message based on actual API error
          return "Successfully prevented disabling 2FA with invalid TOTP.";
        }
        throw error; // Re-throw if it's a different unexpected error
      }
    });

    console.log("\n\n═══════════════════════════════════════════════════════════");
    console.log("📊 TEST RESULTS SUMMARY");
    console.log("═══════════════════════════════════════════════════════════\n");

    testResults.forEach((r) => {
      console.log(`${r.result}`);
      console.log(`   Test: ${r.test}`);
      console.log(`   Details: ${r.details}\n`);
    });

    const passCount = testResults.filter((r) => r.result.includes("PASS")).length;
    console.log(`\n✅ ${passCount}/${testResults.length} tests passed or showed expected behavior`);
    console.log(
      "\n✨ Note: This test suite performs a full E2E 2FA flow using dynamically generated TOTP codes."
    );
  } catch (error) {
    console.error("❌ Test Error:", error);
    testResults.push({
      test: "A test failed unexpectedly",
      result: "❌ FAIL",
      details: error.message
    });
    // Log final results even on failure
    console.log("\n\n═══════════════════════════════════════════════════════════");
    console.log("📊 TEST RESULTS SUMMARY (AFTER FAILURE)");
    console.log("═══════════════════════════════════════════════════════════\n");
    testResults.forEach((r) => {
      console.log(`${r.result}`);
      console.log(`   Test: ${r.test}`);
      console.log(`   Details: ${r.details}\n`);
    });
    process.exit(1);
  }
}

runTests().catch((error) => {
  console.error("❌ Unhandled promise rejection in test run:", error);
  process.exit(1);
});
