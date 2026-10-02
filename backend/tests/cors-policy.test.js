const test = require("node:test");
const assert = require("node:assert/strict");

const { buildCorsOptions, resolveAllowedOrigins } = require("../src/lib/corsPolicy");

test("buildCorsOptions allows any origin in local runtime", () => {
  assert.deepEqual(buildCorsOptions({ APP_RUNTIME_ENV: "local" }), {});
  assert.deepEqual(buildCorsOptions({}), {});
});

test("buildCorsOptions restricts origins to the store URL in production", () => {
  const options = buildCorsOptions({
    APP_RUNTIME_ENV: "production",
    PUBLIC_STORE_BASE_URL: "https://shop.example.com/store/"
  });
  assert.deepEqual(options, { origin: ["https://shop.example.com"] });
});

test("buildCorsOptions restricts origins in staging and merges CORS_ALLOWED_ORIGINS", () => {
  const options = buildCorsOptions({
    APP_RUNTIME_ENV: "staging",
    PUBLIC_STORE_BASE_URL: "https://staging.example.com",
    CORS_ALLOWED_ORIGINS: "https://admin.example.com, https://staging.example.com ,not-a-url"
  });
  assert.deepEqual(options, { origin: ["https://staging.example.com", "https://admin.example.com"] });
});

test("resolveAllowedOrigins returns empty list when nothing is configured", () => {
  assert.deepEqual(resolveAllowedOrigins({}), []);
});
