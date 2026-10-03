const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectDir = path.join(__dirname, '..');

console.log('====================================================');
console.log('TEST SUITE: Amazon India Cart Flyout Drawer Suite');
console.log('====================================================');

// 1. Check translations.js for all 11 languages
const transCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
const sandbox = {
  window: {},
  document: {
    addEventListener: () => {},
    querySelectorAll: () => [],
    getElementById: () => null,
    documentElement: { lang: 'en' }
  },
  localStorage: {
    getItem: () => 'en',
    setItem: () => {}
  }
};
vm.createContext(sandbox);
vm.runInContext(transCode, sandbox);

const translations = sandbox.window.EM_TRANSLATIONS;
assert(translations, 'translations must be exported to window.EM_TRANSLATIONS');

const expectedKeys = [
  'flyout_added_to_cart',
  'flyout_cart_subtotal',
  'flyout_proceed_to_checkout',
  'flyout_go_to_cart',
  'flyout_free_delivery_eligible'
];

const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];

languages.forEach((lang) => {
  assert(translations[lang], `Language '${lang}' must exist in translations`);
  expectedKeys.forEach((key) => {
    assert(
      translations[lang][key],
      `Language '${lang}' must have key '${key}', but got: ${translations[lang][key]}`
    );
  });
});

console.log('PASS: All Cart Flyout keys exist across all 11 Indian languages!');

// Check exact Hindi values
assert.strictEqual(translations.hi.flyout_added_to_cart, 'कार्ट में जोड़ा गया');
assert.strictEqual(translations.hi.flyout_cart_subtotal, 'कार्ट उप-योग');
assert.strictEqual(translations.hi.flyout_proceed_to_checkout, 'चेकआउट के लिए आगे बढ़ें');
assert.strictEqual(translations.hi.flyout_go_to_cart, 'कार्ट पर जाएं');
assert.strictEqual(translations.hi.flyout_free_delivery_eligible, 'आपका ऑर्डर मुफ़्त डिलीवरी के लिए पात्र है');
console.log('PASS: Exact Hindi Cart Flyout translations match verbatim!');

// 2. Inspect header.html markup
const headerHtml = fs.readFileSync(path.join(projectDir, 'header.html'), 'utf8');
assert(headerHtml.includes('id="cartFlyoutOverlay"'), 'header.html must have #cartFlyoutOverlay');
assert(headerHtml.includes('id="cartFlyout"'), 'header.html must have #cartFlyout');
assert(headerHtml.includes('id="cartFlyoutClose"'), 'header.html must have #cartFlyoutClose');
assert(headerHtml.includes('id="cartFlyoutItemCard"'), 'header.html must have #cartFlyoutItemCard');
assert(headerHtml.includes('id="cartFlyoutItemImg"'), 'header.html must have #cartFlyoutItemImg');
assert(headerHtml.includes('id="cartFlyoutItemTitle"'), 'header.html must have #cartFlyoutItemTitle');
assert(headerHtml.includes('id="cartFlyoutItemQty"'), 'header.html must have #cartFlyoutItemQty');
assert(headerHtml.includes('id="cartFlyoutItemPrice"'), 'header.html must have #cartFlyoutItemPrice');
assert(headerHtml.includes('id="cartFlyoutDeliveryBanner"'), 'header.html must have #cartFlyoutDeliveryBanner');
assert(headerHtml.includes('id="cartFlyoutSubtotalItems"'), 'header.html must have #cartFlyoutSubtotalItems');
assert(headerHtml.includes('id="cartFlyoutSubtotalAmount"'), 'header.html must have #cartFlyoutSubtotalAmount');
assert(headerHtml.includes('id="cartFlyoutCheckoutBtn"'), 'header.html must have #cartFlyoutCheckoutBtn');
assert(headerHtml.includes('id="cartFlyoutCheckoutCount"'), 'header.html must have #cartFlyoutCheckoutCount');
assert(headerHtml.includes('id="cartFlyoutItemsList"'), 'header.html must have #cartFlyoutItemsList');
console.log('PASS: header.html full Cart Flyout markup structure verified!');

// 3. Inspect header.js template and logic
const headerJs = fs.readFileSync(path.join(projectDir, 'header.js'), 'utf8');
assert(headerJs.includes('cartFlyoutOverlay'), 'header.js must reference cartFlyoutOverlay');
assert(headerJs.includes('cartFlyoutDrawer') || headerJs.includes('cart-flyout-drawer'), 'header.js must reference cart-flyout-drawer');
assert(headerJs.includes('openCartFlyout'), 'header.js must declare openCartFlyout');
assert(headerJs.includes('closeCartFlyout'), 'header.js must declare closeCartFlyout');
assert(headerJs.includes('window.openCartFlyout = openCartFlyout'), 'header.js must export window.openCartFlyout');
assert(headerJs.includes('initCartFlyoutManager'), 'header.js must initialize Cart Flyout Manager');
console.log('PASS: header.js dynamic injection and manager logic verified!');

// 4. Inspect amazon-theme.css
const cssContent = fs.readFileSync(path.join(projectDir, 'amazon-theme.css'), 'utf8');
assert(cssContent.includes('AMAZON CART FLYOUT (SLIDE-OVER DRAWER) SUITE (PHASE 7)'), 'Must contain Phase 7 header');
assert(cssContent.includes('.cart-flyout-overlay'), 'Must style .cart-flyout-overlay');
assert(cssContent.includes('.cart-flyout-overlay.open'), 'Must style .cart-flyout-overlay.open');
assert(cssContent.includes('.cart-flyout-drawer'), 'Must style .cart-flyout-drawer');
assert(cssContent.includes('.cart-flyout-drawer.open'), 'Must style .cart-flyout-drawer.open');
assert(cssContent.includes('.cart-flyout-checkout-btn'), 'Must style .cart-flyout-checkout-btn');
assert(cssContent.includes('.cart-flyout-cart-btn'), 'Must style .cart-flyout-cart-btn');
console.log('PASS: amazon-theme.css Phase 7 Cart Flyout styling verified!');

// 5. Inspect product-detail.js trigger
const pdpJs = fs.readFileSync(path.join(projectDir, 'product-detail.js'), 'utf8');
assert(
  pdpJs.includes('openCartFlyout') || pdpJs.includes('electromart:itemAddedToCart'),
  'product-detail.js must trigger openCartFlyout or electromart:itemAddedToCart on Add to Cart'
);
console.log('PASS: product-detail.js Add to Cart trigger verified!');

console.log('\nALL CART FLYOUT DRAWER TESTS PASSED (100%)!\n');
