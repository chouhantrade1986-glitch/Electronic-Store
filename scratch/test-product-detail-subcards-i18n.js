const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');

console.log("=== Testing Product Details Sub-Cards, Stock Status & Wishlist Button i18n ===");

// 1. Load translations.js
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
    getItem: () => "hi",
    setItem: () => {}
  }
};
vm.createContext(sandbox);
vm.runInContext(transCode, sandbox);

const trans = sandbox.window.EM_TRANSLATIONS;
assert(trans, "EM_TRANSLATIONS must be exported to window");

const requiredKeys = [
  "save_to_wishlist",
  "in_stock",
  "sub_bank_offer",
  "sub_no_cost_emi",
  "sub_exchange_offer",
  "sub_partner_offer",
  "sub_delivery",
  "sub_returns",
  "sub_warranty",
  "sub_seller"
];

const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];

languages.forEach((lang) => {
  assert(trans[lang], `Language "${lang}" must exist in EM_TRANSLATIONS`);
  requiredKeys.forEach((key) => {
    assert(trans[lang][key], `Key "${key}" must exist for language "${lang}" (got: ${trans[lang][key]})`);
  });
});
console.log(`PASS: All ${requiredKeys.length} sub-card & stock/wishlist keys exist across all 11 languages!`);

// 2. Exact Hindi strings check
assert.strictEqual(trans.hi.save_to_wishlist, "विशलिस्ट में सहेजें");
assert.strictEqual(trans.hi.in_stock, "स्टॉक में उपलब्ध");
assert.strictEqual(trans.hi.sub_bank_offer, "बैंक ऑफ़र");
assert.strictEqual(trans.hi.sub_no_cost_emi, "नो कॉस्ट ईएमआई");
assert.strictEqual(trans.hi.sub_exchange_offer, "एक्सचेंज ऑफ़र");
assert.strictEqual(trans.hi.sub_partner_offer, "पार्टनर ऑफ़र");
assert.strictEqual(trans.hi.sub_delivery, "डिलीवरी");
assert.strictEqual(trans.hi.sub_returns, "वापसी");
assert.strictEqual(trans.hi.sub_warranty, "वारंटी");
assert.strictEqual(trans.hi.sub_seller, "विक्रेता");
console.log("PASS: Exact Hindi subcard, stock, and wishlist strings match user specifications verbatim!");

// 3. Check product-detail.html
const htmlContent = fs.readFileSync(path.join(projectDir, 'product-detail.html'), 'utf8');
assert(htmlContent.includes('id="saveWishlistBtn"'), "product-detail.html must contain id='saveWishlistBtn'");
assert(htmlContent.includes('data-i18n="save_to_wishlist"'), "product-detail.html must contain data-i18n='save_to_wishlist'");
assert(htmlContent.includes('class="availability in-stock stock-status"'), "product-detail.html must contain class='... stock-status'");
assert(htmlContent.includes('data-i18n="in_stock"'), "product-detail.html must contain data-i18n='in_stock'");
assert(htmlContent.includes('data-i18n="sub_delivery"'), "product-detail.html must contain data-i18n='sub_delivery'");
assert(htmlContent.includes('data-i18n="sub_returns"'), "product-detail.html must contain data-i18n='sub_returns'");
assert(htmlContent.includes('data-i18n="sub_warranty"'), "product-detail.html must contain data-i18n='sub_warranty'");
assert(htmlContent.includes('data-i18n="sub_seller"'), "product-detail.html must contain data-i18n='sub_seller'");
console.log("PASS: product-detail.html elements, IDs, and data-i18n tags verified!");

// 4. Check product-detail.js
const jsContent = fs.readFileSync(path.join(projectDir, 'product-detail.js'), 'utf8');
assert(jsContent.includes('saveWishlistBtn'), "product-detail.js must support saveWishlistBtn");
assert(jsContent.includes('.stock-status'), "product-detail.js must bind to .stock-status");
assert(jsContent.includes('t.sub_bank_offer'), "product-detail.js must bind sub_bank_offer");
assert(jsContent.includes('t.sub_no_cost_emi'), "product-detail.js must bind sub_no_cost_emi");
assert(jsContent.includes('t.sub_exchange_offer'), "product-detail.js must bind sub_exchange_offer");
assert(jsContent.includes('t.sub_partner_offer'), "product-detail.js must bind sub_partner_offer");
assert(jsContent.includes('t.sub_delivery'), "product-detail.js must bind sub_delivery");
assert(jsContent.includes('t.sub_returns'), "product-detail.js must bind sub_returns");
assert(jsContent.includes('t.sub_warranty'), "product-detail.js must bind sub_warranty");
assert(jsContent.includes('t.sub_seller'), "product-detail.js must bind sub_seller");
assert(jsContent.includes('t.in_stock'), "product-detail.js must bind t.in_stock");
console.log("PASS: product-detail.js dynamic bindings verified!");

console.log("\nALL PRODUCT DETAILS SUB-CARDS I18N TESTS PASSED (100%)!\n");
