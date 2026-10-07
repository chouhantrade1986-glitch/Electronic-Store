const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');
const transCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
const bshHtml = fs.readFileSync(path.join(projectDir, 'best-sellers.html'), 'utf8');
const bsjCode = fs.readFileSync(path.join(projectDir, 'best-sellers.js'), 'utf8');

console.log("=== Testing Best Sellers Page i18n & Card Localization ===");

// 1. Evaluate translations.js
const mockDoc = {
  readyState: 'complete',
  documentElement: { lang: 'en', setAttribute: function(k, v) { this[k] = v; } },
  querySelectorAll: function() { return []; },
  querySelector: function() { return null; },
  getElementById: function() { return null; },
  addEventListener: function() {}
};
const mockWindow = { location: { pathname: '/best-sellers.html' } };
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
const bsKeys = [
  'most_loved', 'best_sellers_desc', 'updated_weekly', 'top_rated',
  'fast_delivery', 'customer_favorites', 'badge_best_seller', 'view_details',
  'sold_this_month', 'amazon_style_filters', 'best_seller_tip', 'best_seller_tip_desc',
  'ranked_by_demand'
];

languages.forEach(lang => {
  assert(trans[lang], `Language ${lang} must exist`);
  bsKeys.forEach(key => {
    assert(trans[lang][key], `Key "${key}" must exist in "${lang}"`);
  });
});
console.log(`PASS: All ${bsKeys.length} best sellers keys exist across all 11 languages!`);

// 2. Exact Hindi strings requested by the user
assert.strictEqual(trans.hi.most_loved, "सबसे पसंदीदा उत्पाद");
assert.strictEqual(trans.hi.best_sellers_desc, "देखें कि ग्राहक शीर्ष श्रेणियों में सबसे ज्यादा क्या खरीद रहे हैं.");
assert.strictEqual(trans.hi.updated_weekly, "साप्ताहिक अपडेट");
assert.strictEqual(trans.hi.top_rated, "टॉप रेटेड");
assert.strictEqual(trans.hi.fast_delivery, "तेज़ डिलीवरी");
assert.strictEqual(trans.hi.customer_favorites, "ग्राहकों के पसंदीदा");
assert.strictEqual(trans.hi.badge_best_seller, "बेस्ट सेलर");
assert.strictEqual(trans.hi.view_details, "विवरण देखें");
assert.strictEqual(trans.hi.sold_this_month, "इस महीने बिके");
console.log("PASS: Exact Hindi strings match user specification verbatim");

// 3. HTML tags on best-sellers.html
const staticHtmlKeys = [
  'most_loved', 'best_sellers_desc', 'updated_weekly', 'top_rated',
  'fast_delivery', 'customer_favorites', 'amazon_style_filters', 'best_seller_tip',
  'best_seller_tip_desc', 'ranked_by_demand'
];
staticHtmlKeys.forEach(key => {
  assert(bshHtml.includes(`data-i18n="${key}"`), `best-sellers.html must contain data-i18n="${key}"`);
});
console.log("PASS: best-sellers.html contains data-i18n attributes for all static headings, tips, and subtitles");

// 4. Card renderer in best-sellers.js
assert(bsjCode.includes('badge_best_seller'), "best-sellers.js references badge_best_seller");
assert(bsjCode.includes('sold_this_month'), "best-sellers.js references sold_this_month");
assert(bsjCode.includes('view_details'), "best-sellers.js references view_details");
assert(bsjCode.includes('add_to_cart'), "best-sellers.js references add_to_cart");
assert(bsjCode.includes('window.renderBestSellers'), "best-sellers.js exposes window.renderBestSellers");
console.log("PASS: best-sellers.js card template and render hooks verified");

// 5. Test mock card render in Hindi
const mockItem = {
  id: 7,
  name: "Vector Gaming Laptop",
  brand: "Vector",
  category: "laptop",
  price: 1299,
  rating: 4.8,
  soldCount: 2400,
  image: "test.jpg"
};

// Evaluate card function in isolation
const cardFn = new Function(
  'escapeHtml', 'money', 'categoryLabel', 'item', 'localStorage', 'window',
  `
  ${bsjCode.match(/function card\(item\) \{[\s\S]*?\n\}/)[0]}
  return card(item);
  `
);

const cardHtml = cardFn(
  x => x,
  p => `₹${p}`,
  c => c,
  mockItem,
  { getItem: () => 'hi' },
  mockWindow
);

assert(cardHtml.includes("बेस्ट सेलर"), "Card should render 'बेस्ट सेलर' badge in Hindi");
assert(cardHtml.includes("इस महीने बिके"), "Card should render 'इस महीने बिके' in Hindi");
assert(cardHtml.includes("विवरण देखें"), "Card should render 'विवरण देखें' in Hindi");
assert(cardHtml.includes("कार्ट में जोड़ें") || cardHtml.includes("Add to Cart"), "Card should render Add to Cart button");
console.log("PASS: Mock product card renders authentic Hindi best seller badge, sold count, and action links!");

console.log("\nALL BEST SELLERS I18N VERIFICATION TESTS PASSED (100%)!");
