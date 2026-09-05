const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.join(__dirname, '..');
const authHtml = fs.readFileSync(path.join(projectDir, 'auth.html'), 'utf8');
const authCss = fs.readFileSync(path.join(projectDir, 'auth.css'), 'utf8');
const authJs = fs.readFileSync(path.join(projectDir, 'auth.js'), 'utf8');
const transCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');

console.log('=== Testing Phase 9: Authentic Amazon India Authentication Flow ===\n');

// 1. Structural DOM Elements in auth.html
console.log('1. Checking auth.html structure and elements...');
assert(authHtml.includes('id="authCard"'), 'Must have #authCard element');
assert(authHtml.includes('class="auth-panel amz-auth-card"'), 'Must have .auth-panel and .amz-auth-card classes');
assert(authHtml.includes('id="signinForm"'), 'Must have #signinForm');
assert(authHtml.includes('id="signupForm"'), 'Must have #signupForm');
assert(authHtml.includes('id="resetForm"'), 'Must have #resetForm');

// Check IN +91 country code prefix
const prefixMatches = authHtml.match(/class="amz-country-prefix"[^>]*>IN \+91<\/span>/g);
assert(prefixMatches && prefixMatches.length >= 2, 'Must have at least 2 IN +91 country code prefixes (signin & signup)');

// Check Password toggle buttons
const pwdToggleMatches = authHtml.match(/class="amz-toggle-pwd-btn"/g);
assert(pwdToggleMatches && pwdToggleMatches.length >= 3, 'Must have password toggle buttons on signin, signup, and reset forms');

// Check Need help accordion
assert(authHtml.includes('class="amz-auth-help-accordion"'), 'Must have amz-auth-help-accordion');
assert(authHtml.includes('id="forgotPasswordBtn"'), 'Must have #forgotPasswordBtn inside help accordion');

// Check divider & switch button
assert(authHtml.includes('class="amz-auth-divider"'), 'Must have amz-auth-divider');
assert(authHtml.includes('id="switchToSignupBtn"'), 'Must have #switchToSignupBtn');
assert(authHtml.includes('id="switchToSigninBtn"'), 'Must have #switchToSigninBtn');

// Check footer
assert(authHtml.includes('class="amz-auth-footer"'), 'Must have amz-auth-footer');
assert(authHtml.includes('class="amz-auth-copyright"'), 'Must have amz-auth-copyright');

console.log('PASS: All required DOM elements and attributes exist in auth.html.');

// 2. CSS Styling Tokens and Card Layout in auth.css
console.log('\n2. Checking auth.css styles and Amazon India styling...');
assert(authCss.includes('.amz-auth-card') || authCss.includes('#authCard'), 'auth.css must style the auth card');
assert(authCss.includes('.amz-country-prefix'), 'auth.css must style IN +91 country prefix');
assert(authCss.includes('.amz-toggle-pwd-btn'), 'auth.css must style password toggle button');
assert(authCss.includes('.amz-auth-divider'), 'auth.css must style the new-to-electromart divider');
assert(authCss.includes('.amz-btn-auth-primary'), 'auth.css must style primary auth button');
assert(authCss.includes('.amz-btn-auth-secondary'), 'auth.css must style secondary auth button');
assert(authCss.includes('.amz-auth-help-accordion'), 'auth.css must style help accordion');
console.log('PASS: All auth.css Amazon India styles verified.');

// 3. auth.js Logic & Event Handling
console.log('\n3. Checking auth.js wiring and logic...');
assert(authJs.includes('setupPasswordToggles'), 'auth.js must define and call setupPasswordToggles');
assert(authJs.includes('switchToSignupBtn'), 'auth.js must wire switchToSignupBtn');
assert(authJs.includes('switchToSigninBtn'), 'auth.js must wire switchToSigninBtn');
assert(authJs.includes('auth_card_title_signup'), 'auth.js must handle signup card title');
assert(authJs.includes('auth_card_title_reset'), 'auth.js must handle reset card title');
console.log('PASS: auth.js logic and event handling verified.');

// 4. i18n Translations across all 11 Indian Languages
console.log('\n4. Checking translations.js for Phase 9 i18n keys across all 11 languages...');
const mockDoc = {
  readyState: 'complete',
  documentElement: { lang: 'en', setAttribute: () => {} },
  querySelectorAll: () => [],
  querySelector: () => null,
  getElementById: () => null,
  addEventListener: () => {}
};
const mockWindow = { location: { pathname: '/auth.html' } };
const mockLocalStorage = { getItem: () => 'hi', setItem: () => {} };

const fnTrans = new Function('window', 'document', 'localStorage', transCode);
fnTrans(mockWindow, mockDoc, mockLocalStorage);

const trans = mockWindow.EM_TRANSLATIONS;
assert(trans, 'EM_TRANSLATIONS must exist on window');

const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const authKeys = [
  'auth_need_help',
  'auth_other_issues',
  'auth_new_to_electromart',
  'auth_create_your_account_btn',
  'auth_terms_prefix',
  'auth_conditions_of_use',
  'auth_privacy_notice',
  'auth_help_link',
  'auth_already_have_account',
  'auth_card_title_signup',
  'auth_card_title_reset',
  'auth_footer_copyright'
];

languages.forEach(lang => {
  assert(trans[lang], `Language ${lang} must exist`);
  authKeys.forEach(key => {
    assert(trans[lang][key], `Key "${key}" must exist in language "${lang}"`);
    assert.strictEqual(typeof trans[lang][key], 'string', `Key "${key}" in "${lang}" must be a string`);
    assert(trans[lang][key].trim().length > 0, `Key "${key}" in "${lang}" cannot be empty`);
  });
});
console.log(`PASS: All ${authKeys.length} keys exist and are non-empty across all 11 languages!`);

// 5. Brand Safety and Legal Compliance
console.log('\n5. Checking Brand Safety & Legal Compliance...');
const forbiddenBrandRegex = /\b(amazon|amazons)\b|अमेज़न|अमेजन|अमेजॉन|അമേസാൻ|அமேசான்|అమెజాన్|ಅಮೆಜಾನ್|অ্যামাজন|ਐਮਾਜ਼ਾਨ|એમેઝોન|ایمیزון/i;

// Check visible text in auth.html (strip style and script tags)
const strippedHtml = authHtml
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<script[\s\S]*?<\/script>/gi, '');

const textNodeRegex = />([^<]+)</g;
let match;
while ((match = textNodeRegex.exec(strippedHtml)) !== null) {
  const text = match[1].trim();
  if (text) {
    assert(!forbiddenBrandRegex.test(text), `Brand violation found in visible HTML text: "${text}"`);
  }
}

// Check translation values
languages.forEach(lang => {
  authKeys.forEach(key => {
    const val = trans[lang][key];
    assert(!forbiddenBrandRegex.test(val), `Brand violation in trans[${lang}][${key}]: "${val}"`);
  });
});
console.log('PASS: Zero forbidden brand words in auth.html visible text and translations.');

console.log('\n======================================================');
console.log('ALL AUTHENTICATION FLOW (PHASE 9) TESTS PASSED (100%)!');
console.log('======================================================\n');
