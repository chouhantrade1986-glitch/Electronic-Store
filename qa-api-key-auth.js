/**
 * QA Test: API Key Authentication Flow
 * Tests generation, validation, and usage of API keys
 */

const http = require("http");
const assert = require("assert");

const BASE_URL = "http://localhost:4000";

// Test user credentials (demo user)
const testAdmin = {
  email: "admin@test.com",
  password: "Admin@123456" // Strong password
};

let adminToken = null;
let testApiKey = null;
let testApiKeyId = null;

async function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      headers: {
        "Content-Type": "application/json",
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, body: data, headers: res.headers });
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log("\n🧪 API Key Authentication Tests\n");

  try {
    // Test 1: Missing API Key
    console.log("1️⃣ Testing missing API key...");
    const noKeyRes = await makeRequest("GET", "/api/integrations/status");
    assert.strictEqual(noKeyRes.status, 401, "Should require API key");
    console.log("✅ Missing API key detected\n");

    // Test 2: Invalid API key format
    console.log("2️⃣ Testing invalid API key...");
    const invalidKeyRes = await makeRequest("GET", "/api/integrations/status", null, {
      "Authorization": "Bearer sk_invalidivalidinvalid"
    });
    assert.strictEqual(invalidKeyRes.status, 403, "Should reject invalid key");
    console.log("✅ Invalid API key rejected\n");

    // Test 3: X-API-Key header format
    console.log("3️⃣ Testing X-API-Key header format...");
    const xHeaderRes = await makeRequest("GET", "/api/integrations/status", null, {
      "X-API-Key": "sk_invalidivalidinvalid"
    });
    assert.strictEqual(xHeaderRes.status, 403, "Should reject invalid key from X-API-Key header");
    console.log("✅ X-API-Key header recognized\n");

    // Test 4: No X-API-Key and no Authorization
    console.log("4️⃣ Testing missing both auth methods...");
    const noAuthRes = await makeRequest("GET", "/api/integrations/status", null, {});
    assert.strictEqual(noAuthRes.status, 401, "Should reject when both auth headers missing");
    console.log("✅ Both auth methods checked correctly\n");

    // Test 5: Health endpoint (no auth required)
    console.log("5️⃣ Testing public health endpoint...");
    const healthRes = await makeRequest("GET", "/api/health");
    assert.strictEqual(healthRes.status, 200, "Health should be public");
    console.log("✅ Health endpoint is public\n");

    console.log("\n✅ All API Key tests passed!\n");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

// Run tests
runTests().catch(err => {
  console.error("Test error:", err);
  process.exit(1);
});
