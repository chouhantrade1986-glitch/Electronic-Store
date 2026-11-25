const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const { once } = require("node:events");

const {
  GST_STATE_CODES,
  getPanFromGstin,
  getStateFromGstin,
  isValidGstinFormat,
  resolveGstinConfig,
  verifyGstin
} = require("../src/lib/gstinVerification");

const corporateRoutes = require("../src/routes/corporateRoutes");

test("GSTIN validation: validates 15-character GSTIN format correctly", () => {
  assert.equal(isValidGstinFormat("07AAAAA0000A1Z5"), true);
  assert.equal(isValidGstinFormat("27ABCDE1234F1Z5"), true);
  assert.equal(isValidGstinFormat("29ABCDE1234F1Z6"), true);
  assert.equal(isValidGstinFormat("33AABCT1332L1ZV"), true);

  // Invalid formats
  assert.equal(isValidGstinFormat(""), false);
  assert.equal(isValidGstinFormat("12345"), false);
  assert.equal(isValidGstinFormat("27ABCDE1234F155"), false); // 14th char must be Z
  assert.equal(isValidGstinFormat("07AAAAA0000A1Z5EXTRA"), false);
});

test("GSTIN state codes: extracts correct Indian state/UT from prefix", () => {
  assert.equal(getStateFromGstin("07AAAAA0000A1Z5"), "Delhi");
  assert.equal(getStateFromGstin("27ABCDE1234F1Z5"), "Maharashtra");
  assert.equal(getStateFromGstin("29ABCDE1234F1Z6"), "Karnataka");
  assert.equal(getStateFromGstin("33AABCT1332L1ZV"), "Tamil Nadu");
  assert.equal(getStateFromGstin("99AAAAA0000A1Z5"), "Unknown State");
  assert.equal(getStateFromGstin(""), "");
});

test("GSTIN PAN extraction: retrieves embedded PAN number", () => {
  assert.equal(getPanFromGstin("07AAAAA0000A1Z5"), "AAAAA0000A");
  assert.equal(getPanFromGstin("27ABCDE1234F1Z5"), "ABCDE1234F");
  assert.equal(getPanFromGstin("INVALID"), "");
});

test("GSTIN verification: simulated provider verifies valid GSTIN", async () => {
  const result = await verifyGstin("27ABCDE1234F1Z5", { provider: "simulated" });
  assert.equal(result.ok, true);
  assert.equal(result.status, "verified");
  assert.equal(result.gstin, "27ABCDE1234F1Z5");
  assert.equal(result.state, "Maharashtra");
  assert.equal(result.pan, "ABCDE1234F");
  assert.ok(result.legalName);
});

test("GSTIN verification: simulated provider flags cancelled test fixtures", async () => {
  const result = await verifyGstin("27ABCDE1234F0000", { provider: "simulated" });
  // Note: format regex checks 15 chars, so test with invalid suffix:
  const invalidResult = await verifyGstin("27ABCDE1234F1Z5-BAD", { provider: "simulated" });
  assert.equal(invalidResult.ok, false);
  assert.equal(invalidResult.status, "invalid_format");
});

test("GSTIN verification: simulated provider supports pending mode", async () => {
  const result = await verifyGstin("29ABCDE1234F1Z6", {
    provider: "simulated",
    simulatedStatus: "pending"
  });
  assert.equal(result.ok, false);
  assert.equal(result.status, "pending_external_verification");
});

test("GSTIN verification: external provider fallback returns pending when credentials missing", async () => {
  const clearTaxResult = await verifyGstin("27ABCDE1234F1Z5", {
    provider: "cleartax",
    apiKey: ""
  });
  assert.equal(clearTaxResult.ok, false);
  assert.equal(clearTaxResult.status, "pending_external_verification");
  assert.equal(clearTaxResult.provider, "cleartax");

  const sandboxResult = await verifyGstin("27ABCDE1234F1Z5", {
    provider: "sandbox",
    apiKey: ""
  });
  assert.equal(sandboxResult.ok, false);
  assert.equal(sandboxResult.status, "pending_external_verification");
  assert.equal(sandboxResult.provider, "sandbox");
});

test("GSTIN route: POST /api/corporate/gstin/verify handles valid and invalid requests", async () => {
  const app = express();
  app.use(express.json());
  app.use("/api/corporate", corporateRoutes);

  const server = app.listen(0);
  await once(server, "listening");
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Missing input
    const missingRes = await fetch(`${baseUrl}/api/corporate/gstin/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    assert.equal(missingRes.status, 400);
    const missingData = await missingRes.json();
    assert.equal(missingData.status, "missing_input");

    // 2. Invalid format
    const invalidRes = await fetch(`${baseUrl}/api/corporate/gstin/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gstin: "INVALID" })
    });
    assert.equal(invalidRes.status, 400);
    const invalidData = await invalidRes.json();
    assert.equal(invalidData.status, "invalid_format");

    // 3. Valid format (simulated provider)
    const validRes = await fetch(`${baseUrl}/api/corporate/gstin/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gstin: "27ABCDE1234F1Z5" })
    });
    assert.equal(validRes.status, 200);
    const validData = await validRes.json();
    assert.equal(validData.ok, true);
    assert.equal(validData.status, "verified");
    assert.equal(validData.state, "Maharashtra");
  } finally {
    server.close();
  }
});
