const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

const projectDir = path.resolve(__dirname, '..');

console.log("Starting test-amazon-distraction-free-checkout.js...");

// 1. Check checkout.html has distraction-free class and minimal footer
const checkoutHtml = fs.readFileSync(path.join(projectDir, 'checkout.html'), 'utf8');

assert(checkoutHtml.includes('<body class="checkout-page">'), "checkout.html body must have class 'checkout-page'");
assert(checkoutHtml.includes('class="amz-checkout-footer"'), "checkout.html has amz-checkout-footer");
assert(checkoutHtml.includes('data-i18n="auth_conditions_of_use"'), "Minimal footer has auth_conditions_of_use link");
assert(checkoutHtml.includes('data-i18n="auth_privacy_notice"'), "Minimal footer has auth_privacy_notice link");
assert(checkoutHtml.includes('data-i18n="auth_help_link"'), "Minimal footer has auth_help_link");
assert(checkoutHtml.includes('data-i18n="auth_footer_copyright"'), "Minimal footer has auth_footer_copyright");

// 2. Check header.html distraction-free bar elements
const headerHtml = fs.readFileSync(path.join(projectDir, 'header.html'), 'utf8');
assert(headerHtml.includes('class="amz-checkout-distraction-free-bar"'), "header.html contains amz-checkout-distraction-free-bar");
assert(headerHtml.includes('id="checkoutHeaderItemCount"'), "header.html contains checkoutHeaderItemCount");
assert(headerHtml.includes('id="checkoutHeaderCountLink"'), "header.html contains checkoutHeaderCountLink");
assert(headerHtml.includes('class="amz-checkout-header-secure"'), "header.html contains amz-checkout-header-secure");

// 3. Check header.js distraction-free bar template and sync function
const headerJs = fs.readFileSync(path.join(projectDir, 'header.js'), 'utf8');
assert(headerJs.includes('amz-checkout-distraction-free-bar'), "header.js renders amz-checkout-distraction-free-bar");
assert(headerJs.includes('syncCheckoutHeaderCount'), "header.js defines syncCheckoutHeaderCount helper");

// 4. Check checkout.js syncs header item count
const checkoutJs = fs.readFileSync(path.join(projectDir, 'checkout.js'), 'utf8');
assert(checkoutJs.includes('checkoutHeaderItemCount'), "checkout.js updates checkoutHeaderItemCount");

// 5. Check amazon-theme.css distraction-free scoped rules
const themeCss = fs.readFileSync(path.join(projectDir, 'amazon-theme.css'), 'utf8');
assert(themeCss.includes('body.checkout-page'), "amazon-theme.css contains scoped rules for body.checkout-page");
assert(themeCss.includes('.amz-checkout-distraction-free-bar'), "amazon-theme.css styles .amz-checkout-distraction-free-bar");
assert(themeCss.includes('amz-checkout-footer'), "amazon-theme.css styles amz-checkout-footer");

// 6. Check translations.js for all 11 languages
const transCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
const sandbox = {
  window: {},
  document: {
    addEventListener: () => {},
    querySelectorAll: () => [],
    getElementById: () => null,
    querySelector: () => null,
    documentElement: { setAttribute: () => {} }
  },
  localStorage: {
    getItem: () => 'hi',
    setItem: () => {}
  }
};
vm.createContext(sandbox);
vm.runInContext(transCode, sandbox);

const trans = sandbox.window.EM_TRANSLATIONS;
assert(trans, "window.EM_TRANSLATIONS must be defined");

const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
for (const lang of languages) {
  assert(trans[lang], `Language ${lang} exists in EM_TRANSLATIONS`);
  assert(trans[lang].checkout_title, `checkout_title exists for ${lang}`);
  assert(trans[lang].checkout_secure_badge, `checkout_secure_badge exists for ${lang}`);
  assert(trans[lang].checkout_item_singular, `checkout_item_singular exists for ${lang}`);
  assert(trans[lang].checkout_items_plural, `checkout_items_plural exists for ${lang}`);
}

console.log("✓ PASS: test-amazon-distraction-free-checkout.js completed successfully with 100% assertions verified!");
