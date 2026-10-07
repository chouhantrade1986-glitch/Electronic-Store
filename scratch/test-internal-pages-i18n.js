const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');
const transCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');

console.log("=== Testing Internal Pages i18n & Multi-Language Coverage ===");

// 1. Evaluate translations.js
const mockDoc = {
  readyState: 'complete',
  documentElement: { lang: 'en', setAttribute: function(k, v) { this[k] = v; } },
  querySelectorAll: function() { return []; },
  querySelector: function() { return null; },
  getElementById: function() { return null; },
  addEventListener: function() {}
};
const mockWindow = { location: { pathname: '/cart.html' } };
const sandbox = {
  window: mockWindow,
  document: mockDoc,
  localStorage: { getItem: () => 'hi', setItem: () => {} }
};

const fnTrans = new Function('window', 'document', 'localStorage', transCode);
fnTrans(mockWindow, mockDoc, sandbox.localStorage);

const trans = mockWindow.EM_TRANSLATIONS;
assert(trans, "EM_TRANSLATIONS must exist on window");

const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const internalKeys = [
  'cart_subtotal', 'proceed_to_buy', 'delete', 'shopping_cart', 'price',
  'filter_by', 'sort_by', 'in_stock', 'price_low_high', 'price_high_low',
  'avg_customer_review', 'newest_arrivals', 'brands', 'all_categories',
  'shipping_address', 'payment_method', 'place_order', 'review_items', 'delivery_slot',
  'your_account_title', 'your_orders', 'sign_out', 'all_status'
];

languages.forEach(lang => {
  assert(trans[lang], `Language ${lang} must exist`);
  internalKeys.forEach(key => {
    assert(trans[lang][key], `Key "${key}" must exist in language "${lang}"`);
  });
});
console.log(`PASS: All ${internalKeys.length} internal keys exist across all 11 languages!`);

// 2. Check exact Hindi translations requested by the user
assert.strictEqual(trans.hi.cart_subtotal, "उप-योग");
assert.strictEqual(trans.hi.proceed_to_buy, "खरीदने के लिए आगे बढ़ें");
assert.strictEqual(trans.hi.delete, "हटाएं");
assert.strictEqual(trans.hi.filter_by, "फ़िल्टर करें");
assert.strictEqual(trans.hi.sort_by, "क्रमबद्ध करें:");
assert.strictEqual(trans.hi.in_stock, "स्टॉक में उपलब्ध");
assert.strictEqual(trans.hi.shipping_address, "शिपिंग पता");
assert.strictEqual(trans.hi.payment_method, "भुगतान विधि");
assert.strictEqual(trans.hi.place_order, "ऑर्डर दें");
console.log("PASS: Exact Hindi translation strings match user request and Amazon India standard");

// 3. Check Tamil and Marathi translations
assert.strictEqual(trans.ta.cart_subtotal, "உப மொத்தம்");
assert.strictEqual(trans.ta.proceed_to_buy, "வாங்க தொடரவும்");
assert.strictEqual(trans.ta.delete, "நீக்கு");
assert.strictEqual(trans.ta.in_stock, "கையிருப்பில் உள்ளது");
assert.strictEqual(trans.mr.cart_subtotal, "उप-एकूण");
assert.strictEqual(trans.mr.proceed_to_buy, "खरेदी करण्यासाठी पुढे जा");
assert.strictEqual(trans.mr.delete, "हटवा");
assert.strictEqual(trans.mr.in_stock, "स्टॉकमध्ये आहे");
console.log("PASS: Tamil & Marathi translation strings verified");

// 4. Check translations.js inclusion in all core pages
const corePages = [
  'products.html', 'cart.html', 'checkout.html', 'account.html', 'orders.html',
  'todays-deals.html', 'best-sellers.html', 'laptop.html', 'printer.html',
  'product-detail.html', 'language-settings.html', 'index.html'
];
corePages.forEach(page => {
  const c = fs.readFileSync(path.join(projectDir, page), 'utf8');
  assert(c.includes('translations.js'), `${page} must include translations.js`);
  assert(c.includes('header.js'), `${page} must include header.js`);
});
console.log(`PASS: All ${corePages.length} core pages include translations.js and header.js`);

// 5. Verify HTML tags in cart.html, products.html, checkout.html
const cartHtml = fs.readFileSync(path.join(projectDir, 'cart.html'), 'utf8');
assert(cartHtml.includes('data-i18n="shopping_cart"'));
assert(cartHtml.includes('data-i18n="cart_subtotal"'));
assert(cartHtml.includes('data-i18n="proceed_to_buy"'));
assert(cartHtml.includes('data-i18n="order_summary"'));
assert(cartHtml.includes('data-i18n="order_total"'));

const productsHtml = fs.readFileSync(path.join(projectDir, 'products.html'), 'utf8');
assert(productsHtml.includes('data-i18n="filter_by"'));
assert(productsHtml.includes('data-i18n="sort_by"'));
assert(productsHtml.includes('data-i18n="in_stock"'));
assert(productsHtml.includes('data-i18n="price_low_high"'));
assert(productsHtml.includes('data-i18n="price_high_low"'));

const checkoutHtml = fs.readFileSync(path.join(projectDir, 'checkout.html'), 'utf8');
assert(checkoutHtml.includes('data-i18n="shipping_address"'));
assert(checkoutHtml.includes('data-i18n="payment_method"'));
assert(checkoutHtml.includes('data-i18n="place_order"'));
assert(checkoutHtml.includes('data-i18n="order_total"'));

console.log("PASS: Internal page HTML tags (cart, products, checkout) verified");

console.log("\nALL INTERNAL PAGES I18N TESTS PASSED (100%)!");
