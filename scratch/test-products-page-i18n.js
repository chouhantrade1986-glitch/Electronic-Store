const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');
const transCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
const prodHtml = fs.readFileSync(path.join(projectDir, 'products.html'), 'utf8');
const prodJs = fs.readFileSync(path.join(projectDir, 'products.js'), 'utf8');

console.log("=== Testing Products Page i18n & Dynamic Card Localization ===");

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
const catalogKeys = [
  'you_save', 'free_delivery_tomorrow', 'apply_coupon', 'add_to_cart',
  'quick_view', 'view_details', 'wishlist', 'under', 'above',
  'price_results', 'showing_products', 'by_brand', 'price_under_10k',
  'price_above_50k'
];

languages.forEach(lang => {
  assert(trans[lang], `Language ${lang} must exist`);
  catalogKeys.forEach(key => {
    assert(trans[lang][key], `Key "${key}" must exist in language "${lang}"`);
  });
});
console.log(`PASS: All ${catalogKeys.length} catalog keys exist across all 11 languages!`);

// 2. Exact Hindi strings requested by user
assert.strictEqual(trans.hi.you_save, "बचत:");
assert.strictEqual(trans.hi.free_delivery_tomorrow, "मुफ़्त डिलीवरी कल तक");
assert.strictEqual(trans.hi.apply_coupon, "कूपन लागू करें");
assert.strictEqual(trans.hi.add_to_cart, "कार्ट में जोड़ें");
assert.strictEqual(trans.hi.quick_view, "क्विक व्यू");
assert.strictEqual(trans.hi.view_details, "विवरण देखें");
assert.strictEqual(trans.hi.wishlist, "विशलिस्ट");
assert.strictEqual(trans.hi.under, "से कम");
assert.strictEqual(trans.hi.above, "से अधिक");
assert.strictEqual(trans.hi.by_brand, "द्वारा");
console.log("PASS: Exact Hindi catalog strings match user specifications");

// 3. HTML attributes in products.html
assert(prodHtml.includes('data-i18n="price_under_10k"'), "products.html must have data-i18n='price_under_10k'");
assert(prodHtml.includes('data-i18n="price_above_50k"'), "products.html must have data-i18n='price_above_50k'");
console.log("PASS: products.html price preset data-i18n tags verified");

// 4. Test dynamic card rendering in Hindi
const mockProduct = {
  id: 2,
  name: "Nimbus Phone X",
  brand: "Nimbus",
  price: 56175,
  listPrice: 67635,
  rating: 4.5,
  stock: 15,
  image: "test.jpg",
  segment: "b2c"
};

// Create a mock context to test productCard in Hindi
const cardFn = new Function(
  'product', 'normalizeImageUrl', 'fallbackImage', 'getRibbonLabel',
  'isWishlisted', 'getReviewCount', 'isCouponEligible', 'renderStarCharacters',
  'brandStoreUrl', 'encodeURIComponent', 'localStorage', 'window',
  `
  ${prodJs.match(/function productCard\(product\) \{[\s\S]*?\n\}/)[0]}
  return productCard(product);
  `
);

const cardHtmlHi = cardFn(
  mockProduct,
  () => "test.jpg",
  () => "fallback.jpg",
  () => ({ label: "BEST SELLER", cssClass: "ribbon-best" }),
  () => false,
  () => 104,
  () => 500,
  () => "★★★★☆",
  () => "#",
  encodeURIComponent,
  { getItem: () => "hi" },
  mockWindow
);

assert(cardHtmlHi.includes("द्वारा"), "Card must contain Hindi 'द्वारा'");
assert(cardHtmlHi.includes("बचत:"), "Card must contain Hindi 'बचत:'");
assert(cardHtmlHi.includes("मुफ़्त डिलीवरी कल तक"), "Card must contain Hindi 'मुफ़्त डिलीवरी कल तक'");
assert(cardHtmlHi.includes("लागू करें"), "Card must contain Hindi 'लागू करें'");
assert(cardHtmlHi.includes("कूपन"), "Card must contain Hindi 'कूपन'");
assert(cardHtmlHi.includes("कार्ट में जोड़ें"), "Card must contain Hindi 'कार्ट में जोड़ें'");
assert(cardHtmlHi.includes("क्विक व्यू"), "Card must contain Hindi 'क्विक व्यू'");
assert(cardHtmlHi.includes("विवरण देखें"), "Card must contain Hindi 'विवरण देखें'");
assert(cardHtmlHi.includes("विशलिस्ट"), "Card must contain Hindi 'विशलिस्ट'");
assert(cardHtmlHi.includes("बेस्ट सेलर"), "Card must contain Hindi 'बेस्ट सेलर'");
console.log("PASS: Dynamic productCard in Hindi renders ALL authentic Hindi labels, badges, coupon and buttons!");

// 5. Test dynamic card rendering in Tamil
const cardHtmlTa = cardFn(
  mockProduct,
  () => "test.jpg",
  () => "fallback.jpg",
  () => ({ label: "BEST SELLER", cssClass: "ribbon-best" }),
  () => false,
  () => 104,
  () => 500,
  () => "★★★★☆",
  () => "#",
  encodeURIComponent,
  { getItem: () => "ta" },
  mockWindow
);

assert(cardHtmlTa.includes("சேமிப்பு:"), "Card must contain Tamil 'சேமிப்பு:'");
assert(cardHtmlTa.includes("நாளைக்குள் இலவச டெலிவரி"), "Card must contain Tamil 'நாளைக்குள் இலவச டெலிவரி'");
assert(cardHtmlTa.includes("கார்ட்டில் சேர்"), "Card must contain Tamil 'கார்ட்டில் சேர்'");
assert(cardHtmlTa.includes("விரைவுப் பார்வை"), "Card must contain Tamil 'விரைவுப் பார்வை'");
assert(cardHtmlTa.includes("விவரங்களைக் காண்க"), "Card must contain Tamil 'விவரங்களைக் காண்க'");
console.log("PASS: Dynamic productCard in Tamil renders authentic Tamil localized strings!");

// 6. Test translations.js trigger for renderProductsList
assert(transCode.includes('window.renderProductsList'), "translations.js triggers renderProductsList on language change");
console.log("PASS: translations.js hook for renderProductsList verified");

console.log("\nALL PRODUCTS PAGE I18N VERIFICATION TESTS PASSED (100%)!");
