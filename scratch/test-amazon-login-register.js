const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.join(__dirname, '..');
const loginHtml = fs.readFileSync(path.join(projectDir, 'login.html'), 'utf8');
const loginJs = fs.readFileSync(path.join(projectDir, 'login.js'), 'utf8');
const registerHtml = fs.readFileSync(path.join(projectDir, 'register.html'), 'utf8');
const registerJs = fs.readFileSync(path.join(projectDir, 'register.js'), 'utf8');
const forgotHtml = fs.readFileSync(path.join(projectDir, 'forgot-password.html'), 'utf8');
const forgotJs = fs.readFileSync(path.join(projectDir, 'forgot-password.js'), 'utf8');
const authCss = fs.readFileSync(path.join(projectDir, 'auth.css'), 'utf8');
const transCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');

console.log('=== Testing Phase 17: Amazon India-Style Dedicated Auth & Security Suite ===\n');

// 1. Structure & Contracts of login.html
console.log('1. Checking login.html structure and contracts...');
assert(loginHtml.includes('id="authCard"'), 'login.html must have #authCard');
assert(loginHtml.includes('class="auth-panel amz-auth-card"'), 'login.html must have .auth-panel and .amz-auth-card');
assert(loginHtml.includes('id="loginForm"'), 'login.html must have #loginForm');
assert(loginHtml.includes('id="loginStep1"'), 'login.html must have #loginStep1');
assert(loginHtml.includes('id="loginStep2"'), 'login.html must have #loginStep2');
assert(loginHtml.includes('id="loginIdentifier"'), 'login.html must have #loginIdentifier');
assert(loginHtml.includes('id="loginContinueBtn"'), 'login.html must have #loginContinueBtn');
assert(loginHtml.includes('id="loginPreviewText"'), 'login.html must have #loginPreviewText');
assert(loginHtml.includes('id="loginChangeIdentifierBtn"'), 'login.html must have #loginChangeIdentifierBtn');
assert(loginHtml.includes('id="loginPassword"'), 'login.html must have #loginPassword');
assert(loginHtml.includes('id="loginSubmitBtn"'), 'login.html must have #loginSubmitBtn');
assert(loginHtml.includes('id="keepSignedInCheckbox"'), 'login.html must have #keepSignedInCheckbox');
assert(loginHtml.includes('class="amz-remember-row"'), 'login.html must have .amz-remember-row');
assert(loginHtml.includes('class="amz-remember-label"'), 'login.html must have .amz-remember-label');
assert(loginHtml.includes('id="keepSignedInDetailsLink"'), 'login.html must have #keepSignedInDetailsLink');
assert(loginHtml.includes('id="keepSignedInTooltip"'), 'login.html must have #keepSignedInTooltip');
assert(loginHtml.includes('class="amz-country-prefix"'), 'login.html must have IN +91 country prefix');
assert(loginHtml.includes('class="amz-toggle-pwd-btn"'), 'login.html must have password visibility toggle');
assert(loginHtml.includes('href="register.html"'), 'login.html must have link to register.html');
assert(loginHtml.includes('href="forgot-password.html"'), 'login.html must have link to forgot-password.html');
assert(loginHtml.includes('class="amz-auth-footer"'), 'login.html must have footer');
assert(loginHtml.includes('class="amz-auth-copyright"'), 'login.html must have copyright');
console.log('PASS: login.html DOM structure verified.');

// 2. Structure & Contracts of register.html
console.log('\n2. Checking register.html structure and contracts...');
assert(registerHtml.includes('id="authCard"'), 'register.html must have #authCard');
assert(registerHtml.includes('id="registerForm"'), 'register.html must have #registerForm');
assert(registerHtml.includes('id="registerName"'), 'register.html must have #registerName');
assert(registerHtml.includes('id="registerMobile"'), 'register.html must have #registerMobile');
assert(registerHtml.includes('id="registerEmail"'), 'register.html must have #registerEmail');
assert(registerHtml.includes('id="registerPassword"'), 'register.html must have #registerPassword');
assert(registerHtml.includes('class="amz-password-hint"'), 'register.html must have password length hint');
assert(registerHtml.includes('id="registerOtpSection"'), 'register.html must have #registerOtpSection');
assert(registerHtml.includes('id="registerOtp"'), 'register.html must have #registerOtp');
assert(registerHtml.includes('id="registerSubmitBtn"'), 'register.html must have #registerSubmitBtn');
assert(registerHtml.includes('href="login.html"'), 'register.html must have link to login.html');
assert(registerHtml.includes('class="amz-country-prefix"'), 'register.html must have IN +91 country prefix');
assert(registerHtml.includes('class="amz-toggle-pwd-btn"'), 'register.html must have password visibility toggle');
console.log('PASS: register.html DOM structure verified.');

// 3. Structure & Contracts of forgot-password.html
console.log('\n3. Checking forgot-password.html structure and contracts...');
assert(forgotHtml.includes('id="authCard"'), 'forgot-password.html must have #authCard');
assert(forgotHtml.includes('id="forgotForm"'), 'forgot-password.html must have #forgotForm');
assert(forgotHtml.includes('id="forgotIdentifier"'), 'forgot-password.html must have #forgotIdentifier');
assert(forgotHtml.includes('id="forgotContinueBtn"'), 'forgot-password.html must have #forgotContinueBtn');
assert(forgotHtml.includes('id="forgotStep2"'), 'forgot-password.html must have #forgotStep2');
assert(forgotHtml.includes('id="forgotOtp"'), 'forgot-password.html must have #forgotOtp');
assert(forgotHtml.includes('id="forgotNewPassword"'), 'forgot-password.html must have #forgotNewPassword');
assert(forgotHtml.includes('id="forgotSubmitBtn"'), 'forgot-password.html must have #forgotSubmitBtn');
assert(forgotHtml.includes('href="login.html"'), 'forgot-password.html must have link to login.html');
assert(forgotHtml.includes('class="amz-country-prefix"'), 'forgot-password.html must have IN +91 country prefix');
console.log('PASS: forgot-password.html DOM structure verified.');

// 4. CSS Styling & Cursor Rules in auth.css
console.log('\n4. Checking auth.css styles and cursor rules...');
assert(authCss.includes('.amz-auth-step'), 'auth.css must style .amz-auth-step');
assert(authCss.includes('.amz-identifier-preview-row'), 'auth.css must style identifier preview row');
assert(authCss.includes('.amz-change-link'), 'auth.css must style change link');
assert(authCss.includes('.amz-remember-row'), 'auth.css must style remember row');
assert(authCss.includes('.amz-remember-label'), 'auth.css must style remember label');
assert(authCss.includes('.amz-details-link'), 'auth.css must style details link');
assert(authCss.includes('.amz-tooltip-popover'), 'auth.css must style tooltip popover');
assert(authCss.includes('.amz-password-hint'), 'auth.css must style password hint');
assert(authCss.includes('.amz-remember-row') && authCss.includes('cursor: pointer !important;'), 'auth.css must enforce pointer cursor on remember row');
assert(authCss.includes('.amz-remember-label') && authCss.includes('cursor: pointer !important;'), 'auth.css must enforce pointer cursor on remember label');
assert(authCss.includes('input[type="checkbox"]') && authCss.includes('cursor: pointer !important;'), 'auth.css must enforce pointer cursor on checkbox');
console.log('PASS: auth.css styling and pointer cursor rules verified.');

// 5. JavaScript Logic Verification
console.log('\n5. Checking login.js, register.js, forgot-password.js logic...');
assert(loginJs.includes('goToStep2'), 'login.js must handle progressive disclosure goToStep2');
assert(loginJs.includes('goToStep1'), 'login.js must handle change identifier goToStep1');
assert(loginJs.includes('loginPassword.focus()'), 'login.js must auto-focus password field on step 2');
assert(loginJs.includes('keepSignedInCheckbox'), 'login.js must handle keep signed in persistence');
assert(loginJs.includes('electromart_auth_v1'), 'login.js must sync electromart_auth_v1');
assert(registerJs.includes('/^[6-9]\\d{9}$/'), 'register.js must validate Indian 10-digit mobile number');
assert(registerJs.includes('electromart_local_users_v1'), 'register.js must persist local users');
assert(forgotJs.includes('forgotNewPassword'), 'forgot-password.js must handle password reset');
console.log('PASS: JS logic and state management verified.');

// 6. Translations across all 11 Indian Languages
console.log('\n6. Checking translations.js for Phase 17 keys across all 11 languages...');
const mockDoc = {
  readyState: 'complete',
  documentElement: { lang: 'en', setAttribute: () => {} },
  querySelectorAll: () => [],
  querySelector: () => null,
  getElementById: () => null,
  addEventListener: () => {}
};
const mockWindow = { location: { pathname: '/login.html' } };
const mockLocalStorage = { getItem: () => 'hi', setItem: () => {} };

const fnTrans = new Function('window', 'document', 'localStorage', transCode);
fnTrans(mockWindow, mockDoc, mockLocalStorage);

const trans = mockWindow.EM_TRANSLATIONS;
assert(trans, 'EM_TRANSLATIONS must exist on window');

const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const phase17Keys = [
  'keep_me_signed_in',
  'keep_me_signed_in_details',
  'keep_me_signed_in_tooltip',
  'login_continue',
  'change_identifier',
  'login_heading',
  'login_identifier_label',
  'login_password_label',
  'forgot_password_link',
  'register_heading',
  'your_name_label',
  'mobile_number_label',
  'passwords_must_be_at_least_6_chars',
  'verify_mobile_number_btn',
  'forgot_heading',
  'forgot_subheading'
];

languages.forEach(lang => {
  assert(trans[lang], `Language ${lang} must exist`);
  phase17Keys.forEach(key => {
    assert(trans[lang][key], `Key "${key}" must exist in language "${lang}"`);
    assert.strictEqual(typeof trans[lang][key], 'string', `Key "${key}" in "${lang}" must be a string`);
    assert(trans[lang][key].trim().length > 0, `Key "${key}" in "${lang}" cannot be empty`);
  });
});
console.log(`PASS: All ${phase17Keys.length} keys exist and are non-empty across all 11 languages!`);

// 7. Brand Safety and Legal Compliance
console.log('\n7. Checking Brand Safety & Legal Compliance...');
function stripMarkup(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ');
}

const forbiddenWords = ['amazon', 'अमेज़न', 'அமேசான்', 'అమెజాన్', 'ಅಮೆಜಾನ್', 'ആമസോൺ', 'অ্যামাজন', 'ॲमेझॉन', 'ایمیزون', 'ਐਮਾਜ਼ਾਨ', 'એમેઝોન'];

[
  { file: 'login.html', text: stripMarkup(loginHtml) },
  { file: 'register.html', text: stripMarkup(registerHtml) },
  { file: 'forgot-password.html', text: stripMarkup(forgotHtml) }
].forEach(({ file, text }) => {
  forbiddenWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    assert(!regex.test(text), `Forbidden word "${word}" found in visible text of ${file}!`);
  });
});

console.log('PASS: Zero customer-facing forbidden brand names in all new authentication files.');

console.log('\n=============================================================');
console.log('ALL PHASE 17 DEDICATED AUTH & SECURITY TESTS PASSED (100%)!');
console.log('=============================================================');
