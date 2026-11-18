const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");

const { buildFrontendConfigScript, resolveFrontendApiBaseUrl } = require("../src/lib/frontendConfig");

test("frontend API config defaults to the same-origin API proxy when no URL is configured", () => {
  assert.equal(resolveFrontendApiBaseUrl({}), "/api");

  const sandbox = { window: {} };
  vm.runInNewContext(buildFrontendConfigScript({}), sandbox);
  assert.equal(sandbox.window.__ELECTROMART_CONFIG__.apiBaseUrl, "/api");
});

test("frontend API config publishes the configured public API base URL", () => {
  const sandbox = { window: {} };
  vm.runInNewContext(buildFrontendConfigScript({
    PUBLIC_API_BASE_URL: "https://api.electromart.in/api/"
  }), sandbox);

  assert.deepEqual(
    JSON.parse(JSON.stringify(sandbox.window.__ELECTROMART_CONFIG__)),
    { apiBaseUrl: "https://api.electromart.in/api" }
  );
  assert.equal(Object.isFrozen(sandbox.window.__ELECTROMART_CONFIG__), true);
});

test("frontend API config rejects unsafe or malformed configured URLs", () => {
  for (const value of [
    "javascript:alert(1)",
    "https://user:password@api.electromart.in/api",
    "https://api.electromart.in/api?override=1",
    "https://api.electromart.in/not-api"
  ]) {
    assert.throws(
      () => resolveFrontendApiBaseUrl({ PUBLIC_API_BASE_URL: value }),
      (error) => error.code === "FRONTEND_API_CONFIG_INVALID"
    );
  }
});
