const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');
const transCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
const prodHtml = fs.readFileSync(path.join(projectDir, 'products.html'), 'utf8');
const prodJs = fs.readFileSync(path.join(projectDir, 'products.js'), 'utf8');
const amazonCss = fs.readFileSync(path.join(projectDir, 'amazon-theme.css'), 'utf8');

console.log("=== Testing Amazon Products Listing & Faceted Search Page ===");

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
const listingKeys = [
  'amazons_choice', 'limited_time_deal', 'bought_in_past_month',
  'discount_filter_title', 'discount_10_plus', 'discount_25_plus',
  'discount_35_plus', 'discount_50_plus', 'discount_60_plus',
  'discount_70_plus', 'price_go_btn', 'min_price_label',
  'max_price_label', 'department_title', 'pay_on_delivery', 'results_for_prefix'
];

languages.forEach(lang => {
  assert(trans[lang], `Language ${lang} must exist`);
  listingKeys.forEach(key => {
    assert(trans[lang][key], `Key "${key}" must exist in language "${lang}"`);
  });
});
console.log(`PASS: All ${listingKeys.length} listing keys exist across all 11 languages!`);

// 2. Check authentic Hindi strings
assert.strictEqual(trans.hi.amazons_choice, "अमेज़न चॉइस");
assert.strictEqual(trans.hi.limited_time_deal, "सीमित समय की डील");
assert.strictEqual(trans.hi.discount_filter_title, "छूट");
assert.strictEqual(trans.hi.discount_10_plus, "10% या अधिक छूट");
assert.strictEqual(trans.hi.price_go_btn, "जाएं");
assert.strictEqual(trans.hi.department_title, "विभाग");
assert.strictEqual(trans.hi.pay_on_delivery, "डिलीवरी पर भुगतान (COD)");
console.log("PASS: Exact Hindi listing strings match authentic Amazon India specifications");

// 3. Check HTML structure in products.html
const requiredIds = [
  'amzDeptTree', 'amzRatingList', 'amzDiscountList',
  'minPriceInput', 'maxPriceInput', 'priceGoBtn', 'payOnDelivery',
  'sidebarCategoryFilter', 'minPriceRange', 'maxPriceRange',
  'inStockOnly', 'freeDelivery', 'nextDayDelivery',
  'productsGrid', 'resultMeta'
];

requiredIds.forEach(id => {
  assert(prodHtml.includes(`id="${id}"`), `products.html must include id="${id}"`);
});
console.log(`PASS: All ${requiredIds.length} required element IDs present in products.html`);

// 4. Check CSS in amazon-theme.css
const requiredCssClasses = [
  '.amz-dept-tree', '.amz-dept-link', '.amz-rating-filter-list',
  '.amz-rating-stars', '.amz-price-go-box', '.amz-price-input-wrap',
  '.amz-price-go-btn', '.amz-discount-list', '.amz-discount-link',
  '.card-social-proof', '.price-current-amazon', '.card-atc-btn'
];

requiredCssClasses.forEach(cls => {
  assert(amazonCss.includes(cls), `amazon-theme.css must contain ${cls}`);
});
console.log(`PASS: All ${requiredCssClasses.length} Amazon listing CSS classes verified`);

// 5. Test dynamic productCard rendering
const mockProduct = {
  id: 2,
  name: "Nimbus Phone X",
  brand: "Nimbus",
  price: 56175,
  listPrice: 67635,
  rating: 4.5,
  stock: 15,
  image: "test.jpg",
  segment: "b2c",
  featured: true
};

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
  () => ({ label: "BEST SELLER", cssClass: "ribbon-bestseller" }),
  () => false,
  () => 340,
  () => 500,
  () => "★★★★☆",
  () => "#",
  encodeURIComponent,
  { getItem: () => "hi" },
  mockWindow
);

assert(cardHtmlHi.includes("card-social-proof"), "Card must contain social proof element");
assert(cardHtmlHi.includes("पिछले महीने में"), "Card must contain Hindi social proof text");
assert(cardHtmlHi.includes("price-current-amazon"), "Card must contain Amazon price element");
assert(cardHtmlHi.includes("card-atc-btn"), "Card must contain Amazon Add to Cart button");
assert(cardHtmlHi.includes("कार्ट में जोड़ें"), "Card must contain Hindi 'कार्ट में जोड़ें'");
assert(cardHtmlHi.includes("बेस्ट सेलर"), "Card must contain Hindi 'बेस्ट सेलर'");
console.log("PASS: Dynamic productCard renders social proof, authentic pricing, and Amazon action buttons in Hindi!");

// 6. Check JS integration & setup
assert(prodJs.includes('setupAmazonListingFilters'), "products.js must contain setupAmazonListingFilters");
assert(prodJs.includes('selectedMinDiscount'), "products.js must track selectedMinDiscount");
assert(prodJs.includes('window.getLocalizedTitle ? window.getLocalizedTitle(product, currentLang) : product.name'), "products.js must use getLocalizedTitle");
console.log("PASS: products.js setup and catalog engine contract verified");

console.log("\nALL AMAZON PRODUCTS LISTING TESTS PASSED (100%)!");
