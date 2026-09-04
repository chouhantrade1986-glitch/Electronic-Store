const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.resolve(__dirname, '..');
console.log("=== Testing Amazon India Shopping Cart (Step 1) ===");

// 1. Verify cart.html structure & required elements
const cartHtml = fs.readFileSync(path.join(projectDir, 'cart.html'), 'utf8');

// Preservation of existing test-critical IDs and data-i18n attributes
const criticalAttributes = [
  'id="cartItems"',
  'id="cartMeta"',
  'id="clearCart"',
  'id="summaryItems"',
  'id="totalValue"',
  'id="cartDeliveryEstimate"',
  'id="cartReservationMessage"',
  'id="couponInput"',
  'id="applyCouponBtn"',
  'id="couponMessage"',
  'id="removeCouponBtn"',
  'id="checkoutBtn"',
  'id="subtotalValue"',
  'id="shippingValue"',
  'id="discountRow"',
  'id="discountValue"',
  'id="taxValue"',
  'id="orderTotalValue"',
  'data-i18n="shopping_cart"',
  'data-i18n="cart_subtotal"',
  'data-i18n="proceed_to_buy"',
  'data-i18n="order_summary"',
  'data-i18n="order_total"'
];

criticalAttributes.forEach(attr => {
  assert(cartHtml.includes(attr), `cart.html must preserve critical attribute: ${attr}`);
});
console.log("  ✓ PASS: All critical legacy IDs & i18n attributes preserved in cart.html");

// New Amazon India Cart layout elements
const newAmazonCartElements = [
  'id="freeDeliveryBar"',
  'id="fdQualifiedMsg"',
  'id="fdUnqualifiedMsg"',
  'id="fdProgressBar"',
  'id="fdProgressText"',
  'id="toggleSelectAllBtn"',
  'id="cartBottomSubtotal"',
  'id="savedForLaterSection"',
  'id="savedItemsList"',
  'id="giftOrderCheck"',
  'class="amz-emi-banner"'
];

newAmazonCartElements.forEach(elem => {
  assert(cartHtml.includes(elem), `cart.html must include new Amazon India element: ${elem}`);
});
console.log("  ✓ PASS: All new Amazon India Cart elements present in cart.html");

// 2. Verify amazon-theme.css contains cart rules
const amzCss = fs.readFileSync(path.join(projectDir, 'amazon-theme.css'), 'utf8');
assert(amzCss.includes('.amz-free-delivery-bar'), "amazon-theme.css has .amz-free-delivery-bar");
assert(amzCss.includes('.amz-saved-for-later'), "amazon-theme.css has .amz-saved-for-later");
assert(amzCss.includes('#checkoutBtn'), "amazon-theme.css has #checkoutBtn pill styling");
assert(amzCss.includes('.amz-qty-select-wrap'), "amazon-theme.css has .amz-qty-select-wrap");
console.log("  ✓ PASS: amazon-theme.css includes complete Amazon Cart styling rules");

// 3. Verify translations across all 11 languages
const transCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
const mockDoc = {
  readyState: 'complete',
  documentElement: { lang: 'en', setAttribute: function() {} },
  querySelectorAll: () => [],
  querySelector: () => null,
  getElementById: () => null,
  addEventListener: () => {}
};
const mockWindow = { location: { pathname: '/cart.html' } };
const fnTrans = new Function('window', 'document', 'localStorage', transCode);
fnTrans(mockWindow, mockDoc, { getItem: () => 'hi', setItem: () => {} });

const trans = mockWindow.EM_TRANSLATIONS;
assert(trans, "translations dictionary must be loaded");

const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const cartKeys = [
  'free_delivery_qualified',
  'deselect_all_items',
  'save_for_later',
  'see_more_like_this',
  'saved_for_later_title',
  'move_to_cart',
  'this_is_a_gift',
  'emi_available'
];

languages.forEach(lang => {
  assert(trans[lang], `Language ${lang} must exist`);
  cartKeys.forEach(key => {
    assert(trans[lang][key], `Cart key "${key}" must exist in language "${lang}"`);
  });
});
console.log(`  ✓ PASS: All ${cartKeys.length} new cart keys exist across all 11 languages!`);

// 4. Verify cart.js logic & pricing calculations
const cartJsCode = fs.readFileSync(path.join(projectDir, 'cart.js'), 'utf8');
const mockLocalStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};

const domEls = {};
function getFakeEl(id) {
  if (!domEls[id]) {
    domEls[id] = {
      id,
      textContent: '',
      innerHTML: '',
      hidden: false,
      disabled: false,
      style: {},
      classList: {
        toggle() {},
        add() {},
        remove() {}
      },
      addEventListener() {}
    };
  }
  return domEls[id];
}

const mockCartDoc = {
  getElementById: getFakeEl,
  addEventListener: () => {}
};

const cartSandbox = {
  window: { location: { href: '', origin: 'http://localhost:5500', pathname: '/cart.html' } },
  document: mockCartDoc,
  localStorage: mockLocalStorage,
  Intl: Intl,
  encodeURIComponent: encodeURIComponent,
  setTimeout: setTimeout,
  Date: Date,
  Math: Math,
  Number: Number,
  String: String,
  JSON: JSON,
  Object: Object,
  Array: Array,
  console: console
};

const fnCart = new Function(
  'window', 'document', 'localStorage', 'Intl', 'encodeURIComponent', 'setTimeout', 'Date', 'Math', 'Number', 'String', 'JSON', 'Object', 'Array', 'console',
  cartJsCode + `
  return {
    getCartRows,
    getPricingBreakdown,
    saveForLater,
    moveToCart,
    loadSavedMap,
    loadCartMap,
    loadUnselectedMap,
    saveCartMap,
    renderCart
  };`
);

const cartModule = fnCart(
  cartSandbox.window, cartSandbox.document, cartSandbox.localStorage, Intl, encodeURIComponent, setTimeout, Date, Math, Number, String, JSON, Object, Array, console
);

// Test pricing breakdown under ₹499 (shipping = 19)
const sampleRowsBelow499 = [
  { id: '1', name: 'Item A', price: 200, quantity: 1, selected: true }
];
const breakdownBelow = cartModule.getPricingBreakdown(sampleRowsBelow499);
assert.strictEqual(breakdownBelow.itemCount, 1);
assert.strictEqual(breakdownBelow.subtotal, 200);
assert.strictEqual(breakdownBelow.shipping, 19, "Orders under ₹499 have standard shipping ₹19");

// Test pricing breakdown above ₹499 (shipping = 0, FREE delivery)
const sampleRowsAbove499 = [
  { id: '2', name: 'Item B', price: 999, quantity: 1, selected: true }
];
const breakdownAbove = cartModule.getPricingBreakdown(sampleRowsAbove499);
assert.strictEqual(breakdownAbove.itemCount, 1);
assert.strictEqual(breakdownAbove.subtotal, 999);
assert.strictEqual(breakdownAbove.shipping, 0, "Orders above ₹499 qualify for FREE shipping (₹0)");

// Test unselected item exclusion from totals
const sampleWithUnselected = [
  { id: '1', name: 'Selected Item', price: 500, quantity: 1, selected: true },
  { id: '2', name: 'Unselected Item', price: 300, quantity: 1, selected: false }
];
const breakdownFiltered = cartModule.getPricingBreakdown(sampleWithUnselected);
assert.strictEqual(breakdownFiltered.itemCount, 1, "Only selected items count towards itemCount");
assert.strictEqual(breakdownFiltered.subtotal, 500, "Only selected items count towards subtotal");

// Test Save for Later and Move to Cart flow
mockLocalStorage.store['electromart_cart_v1'] = JSON.stringify({ '101': 2 });
cartModule.saveForLater('101');

assert.strictEqual(cartModule.loadCartMap()['101'], undefined, "Item removed from cartMap");
assert.strictEqual(cartModule.loadSavedMap()['101'], 2, "Item transferred to savedMap with quantity 2");

cartModule.moveToCart('101');
assert.strictEqual(cartModule.loadSavedMap()['101'], undefined, "Item removed from savedMap");
assert.strictEqual(cartModule.loadCartMap()['101'], 2, "Item moved back to cartMap with quantity 2");
console.log("  ✓ PASS: Save for Later and Move to Cart storage lifecycle verified");

console.log("==================================================");
console.log("ALL AMAZON INDIA SHOPPING CART TESTS PASSED! (100%)");
console.log("==================================================");
