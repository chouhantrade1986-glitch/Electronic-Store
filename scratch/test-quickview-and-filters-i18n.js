const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');
const transCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
const prodHtml = fs.readFileSync(path.join(projectDir, 'products.html'), 'utf8');
const prodJs = fs.readFileSync(path.join(projectDir, 'products.js'), 'utf8');

console.log("=== Testing Quick View Drawer & Filter Labels i18n ===");

// 1. Evaluate translations.js
const mockDoc = {
  readyState: 'complete',
  documentElement: { lang: 'en', setAttribute: function(k, v) { this[k] = v; } },
  querySelectorAll: function() { return []; },
  querySelector: function() { return null; },
  getElementById: function() { return null; },
  addEventListener: function() {}
};
const mockWindow = { location: { pathname: '/products.html' } };
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
const qvKeys = [
  'buy_now', 'in_stock', 'qty', 'add_to_wishlist', 'delivery_options',
  'free_delivery_check', 'next_day_delivery', 'include_out_of_stock',
  'search_in_products', 'grid_view', 'list_view', 'next_day_delivery_badge',
  'free_delivery_badge', 'days_replacement_7', 'secure_payment', 'free_returns',
  'about_this_item', 'fbt_title', 'add_all_to_cart'
];

languages.forEach(lang => {
  assert(trans[lang], `Language ${lang} must exist`);
  qvKeys.forEach(key => {
    assert(trans[lang][key], `Key "${key}" must exist in language "${lang}"`);
  });
});
console.log(`PASS: All ${qvKeys.length} Quick View and filter keys exist across all 11 languages!`);

// 2. Exact Hindi strings requested by user
assert.strictEqual(trans.hi.buy_now, "अभी खरीदें");
assert.strictEqual(trans.hi.in_stock, "स्टॉक में उपलब्ध");
assert.strictEqual(trans.hi.qty, "मात्रा:");
assert.strictEqual(trans.hi.add_to_wishlist, "विशलिस्ट में जोड़ें");
assert.strictEqual(trans.hi.delivery_options, "डिलीवरी के विकल्प");
assert.strictEqual(trans.hi.free_delivery_check, "फ़्री डिलीवरी");
assert.strictEqual(trans.hi.next_day_delivery, "अगले दिन डिलीवरी");
assert.strictEqual(trans.hi.include_out_of_stock, "आउट ऑफ स्टॉक शामिल करें");
assert.strictEqual(trans.hi.search_in_products, "सभी उत्पादों में खोजें...");
assert.strictEqual(trans.hi.grid_view, "⊞ ग्रिड");
assert.strictEqual(trans.hi.list_view, "☰ सूची");
console.log("PASS: Exact Hindi Quick View & filter strings match user specifications verbatim");

// 3. Check HTML tags in products.html
const requiredHtmlTags = [
  'data-i18n="delivery_options"',
  'data-i18n="free_delivery_check"',
  'data-i18n="next_day_delivery"',
  'data-i18n="include_out_of_stock"',
  'data-i18n-placeholder="search_in_products"',
  'data-i18n="grid_view"',
  'data-i18n="list_view"',
  'data-i18n="next_day_delivery_badge"',
  'data-i18n="free_delivery_badge"',
  'data-i18n="days_replacement_7"',
  'data-i18n="secure_payment"',
  'data-i18n="free_returns"',
  'data-i18n="about_this_item"',
  'data-i18n="in_stock"',
  'data-i18n="qty"',
  'data-i18n="add_to_cart"',
  'data-i18n="buy_now"',
  'data-i18n="add_to_wishlist"',
  'data-i18n="fbt_title"',
  'data-i18n="add_all_to_cart"'
];

requiredHtmlTags.forEach(tag => {
  assert(prodHtml.includes(tag), `products.html must include ${tag}`);
});
console.log(`PASS: All ${requiredHtmlTags.length} required HTML tags verified in products.html`);

// 4. Check products.js Quick View logic
assert(prodJs.includes('qvBuyNow.textContent = t.buy_now'), "products.js sets qvBuyNow with t.buy_now");
assert(prodJs.includes('t.add_to_wishlist'), "products.js uses t.add_to_wishlist");
console.log("PASS: products.js Quick View localization hooks verified");

console.log("\nALL QUICK VIEW & FILTER I18N TESTS PASSED (100%)!");
