const test = require("node:test");
const assert = require("node:assert/strict");

const {
  appendAuthActivity,
  authActivityPublicView,
  normalizeSecurityPreferences,
  normalizeSessionVersion
} = require("../src/lib/authSecurity");

test("normalizeSecurityPreferences provides safe defaults", () => {
  const normalized = normalizeSecurityPreferences({});
  assert.equal(normalized.twoFactorEnabled, false);
  assert.equal(normalized.loginAlertsEnabled, true);
});

test("normalizeSessionVersion clamps invalid values", () => {
  assert.equal(normalizeSessionVersion(undefined), 1);
  assert.equal(normalizeSessionVersion(0), 1);
  assert.equal(normalizeSessionVersion(4.9), 4);
});

test("appendAuthActivity stores newest events first and limits the list", () => {
  const user = {
    authActivity: []
  };

  appendAuthActivity(user, {
    eventKey: "login",
    eventLabel: "OTP sign-in",
    createdAt: "2026-03-09T09:00:00.000Z"
  });
  appendAuthActivity(user, {
    eventKey: "password_change",
    eventLabel: "Password changed",
    createdAt: "2026-03-09T10:00:00.000Z"
  });

  const recent = authActivityPublicView(user, 10);
  assert.equal(recent.length, 2);
  assert.equal(recent[0].eventKey, "password_change");
  assert.equal(recent[1].eventKey, "login");
});
