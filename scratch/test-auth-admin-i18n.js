const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');
const transCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
const authHtml = fs.readFileSync(path.join(projectDir, 'auth.html'), 'utf8');
const authJs = fs.readFileSync(path.join(projectDir, 'auth.js'), 'utf8');
const adminHtml = fs.readFileSync(path.join(projectDir, 'admin.html'), 'utf8');

console.log("=== Testing Admin & Auth Sign In i18n Localization ===");

// 1. Evaluate translations.js
const mockDoc = {
  readyState: 'complete',
  documentElement: { lang: 'en', setAttribute: function(k, v) { this[k] = v; } },
  querySelectorAll: function() { return []; },
  querySelector: function() { return null; },
  getElementById: function() { return null; },
  addEventListener: function() {}
};
const mockWindow = { location: { pathname: '/auth.html' } };
const sandbox = {
  window: mockWindow,
  document: mockDoc,
  localStorage: { getItem: () => 'hi', setItem: () => {} }
};

const fnTrans = new Function('window', 'document', 'localStorage', transCode);
fnTrans(mockWindow, mockDoc, sandbox.localStorage);

const trans = mockWindow.EM_TRANSLATIONS;
assert(trans, "EM_TRANSLATIONS must exist");

const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const targetKeys = [
  'admin_signin_title', 'admin_signin_copy', 'seller_central_access', 'seller_central_copy',
  'admin_panel_home', 'back_to_store', 'otp_delivery', 'email_or_mobile',
  'password', 'forgot_password', 'send_otp', 'enter_otp', 'login_with_otp',
  'seller_central', 'admin_panel_access', 'signin_as_admin', 'go_to_account'
];

languages.forEach(lang => {
  assert(trans[lang], `Language ${lang} must exist`);
  targetKeys.forEach(key => {
    assert(trans[lang][key], `Key "${key}" must exist in language "${lang}"`);
  });
});
console.log(`PASS: All ${targetKeys.length} auth and admin keys exist across all 11 languages!`);

// 2. Exact Hindi strings requested by user
assert.strictEqual(trans.hi.admin_signin_title, "एडमिन साइन इन");
assert.strictEqual(trans.hi.admin_signin_copy, "सेलर सेंट्रल खोलने और स्टोर संचालन प्रबंधित करने के लिए एडमिन खाते का उपयोग करें.");
assert.strictEqual(trans.hi.seller_central_access, "सेलर सेंट्रल एक्सेस");
assert.strictEqual(trans.hi.admin_panel_home, "एडमिन पैनल होम");
assert.strictEqual(trans.hi.back_to_store, "स्टोर पर वापस जाएं");
assert.strictEqual(trans.hi.otp_delivery, "ओटीपी डिलीवरी");
assert.strictEqual(trans.hi.email_or_mobile, "ईमेल या मोबाइल");
assert.strictEqual(trans.hi.password, "पासवर्ड");
assert.strictEqual(trans.hi.forgot_password, "पासवर्ड भूल गए?");
assert.strictEqual(trans.hi.send_otp, "ओटीपी भेजें");
assert.strictEqual(trans.hi.enter_otp, "ओटीपी दर्ज करें");
assert.strictEqual(trans.hi.login_with_otp, "ओटीपी के साथ लॉगिन करें");
assert.strictEqual(trans.hi.seller_central, "सेलर सेंट्रल");
assert.strictEqual(trans.hi.admin_panel_access, "एडमिन पैनल एक्सेस");
assert.strictEqual(trans.hi.signin_as_admin, "एडमिन के रूप में साइन इन करें");
assert.strictEqual(trans.hi.go_to_account, "अकाउंट पर जाएं");
console.log("PASS: Exact Hindi auth and admin strings match user specification verbatim");

// 3. HTML tags and script inclusion in auth.html
assert(authHtml.includes('<script src="translations.js"></script>'), "auth.html includes translations.js");
assert(authHtml.includes('data-i18n="admin_signin_title"') || authHtml.includes('data-i18n="auth_heading"'), "auth.html has heading i18n");
assert(authHtml.includes('data-i18n="seller_central_access"'), "auth.html has seller_central_access");
assert(authHtml.includes('data-i18n="admin_panel_home"'), "auth.html has admin_panel_home");
assert(authHtml.includes('data-i18n="back_to_store"'), "auth.html has back_to_store");
assert(authHtml.includes('data-i18n="otp_delivery"'), "auth.html has otp_delivery");
assert(authHtml.includes('data-i18n="email_or_mobile"'), "auth.html has email_or_mobile");
assert(authHtml.includes('data-i18n="password"'), "auth.html has password");
assert(authHtml.includes('data-i18n="forgot_password"'), "auth.html has forgot_password");
assert(authHtml.includes('data-i18n="send_otp"'), "auth.html has send_otp");
assert(authHtml.includes('data-i18n="enter_otp"'), "auth.html has enter_otp");
assert(authHtml.includes('data-i18n="login_with_otp"'), "auth.html has login_with_otp");
console.log("PASS: All auth.html tags and script tags verified");

// 4. auth.js dynamic localization logic
assert(authJs.includes('t.admin_signin_title'), "auth.js references t.admin_signin_title");
assert(authJs.includes('t.seller_central_access'), "auth.js references t.seller_central_access");
assert(authJs.includes('t.admin_panel_home'), "auth.js references t.admin_panel_home");
assert(authJs.includes('t.back_to_store'), "auth.js references t.back_to_store");
console.log("PASS: auth.js dynamic localization logic verified");

// 5. admin.html tags and script inclusion
assert(adminHtml.includes('<script src="translations.js"></script>'), "admin.html includes translations.js");
assert(adminHtml.includes('data-i18n="seller_central"'), "admin.html has seller_central");
assert(adminHtml.includes('data-i18n="admin_panel_access"'), "admin.html has admin_panel_access");
assert(adminHtml.includes('data-i18n="signin_as_admin"'), "admin.html has signin_as_admin");
assert(adminHtml.includes('data-i18n="go_to_account"'), "admin.html has go_to_account");
console.log("PASS: admin.html tags and translation hooks verified");

console.log("\nALL ADMIN & AUTH SIGN IN I18N TESTS PASSED (100%)!");
