const fs = require('fs');
const assert = require('assert');

console.log('==================================================');
console.log('TEST SUITE: HP KP03 Battery Price & MRP Verification');
console.log('==================================================');

// Mock browser DOM environment
const elements = new Map();
function getOrCreateEl(id) {
  if (!elements.has(id)) {
    elements.set(id, {
      id,
      textContent: '',
      innerHTML: '',
      style: {},
      children: [],
      classList: {
        add: () => {},
        remove: () => {},
        toggle: () => {}
      },
      setAttribute: function(k, v) { this[k] = v; },
      getAttribute: function(k) { return this[k] || ''; },
      removeAttribute: () => {},
      querySelectorAll: () => [],
      querySelector: (sel) => getOrCreateEl('child_' + sel.replace(/^[#.]/, '')),
      addEventListener: () => {},
      pause: () => {},
      play: () => Promise.resolve()
    });
  }
  return elements.get(id);
}

global.window = global;
global.window.addEventListener = () => {};
global.location = { 
  protocol: 'http:', 
  hostname: 'localhost', 
  port: '4000', 
  search: '?id=product_faadad46-7286-8744-5d9a-1263da26d23c' 
};
global.localStorage = {
  store: { electromart_lang_v1: 'en', electromart_lang: 'en' },
  getItem: function(k) { return this.store[k] || null; },
  setItem: function(k, v) { this.store[k] = v; }
};
global.document = {
  body: { style: {}, classList: { add: () => {}, remove: () => {} } },
  documentElement: { lang: 'en' },
  getElementById: (id) => getOrCreateEl(id),
  querySelector: (sel) => getOrCreateEl(sel.replace(/^[#.]/, '')),
  querySelectorAll: () => [],
  addEventListener: () => {}
};

eval(fs.readFileSync('./translations.js', 'utf8'));
eval(fs.readFileSync('./products-data.js', 'utf8'));
eval(fs.readFileSync('./product-detail.js', 'utf8'));

console.log('\n[TEST 1] Testing KP03 Battery in EM_CATALOG_MAP...');
const targetId = 'product_faadad46-7286-8744-5d9a-1263da26d23c';
const catalogProduct = window.EM_CATALOG_MAP[targetId];
assert(catalogProduct, 'KP03 battery exists in EM_CATALOG_MAP');
assert.strictEqual(catalogProduct.price, 1399, 'Catalog price must be 1399');
assert.strictEqual(catalogProduct.listPrice, 1713, 'Catalog listPrice must be 1713');
console.log('  PASS: EM_CATALOG_MAP has KP03 battery with Price=1399, MRP=1713.');

console.log('\n[TEST 2] Testing renderProduct with KP03 in English...');
window.renderProductDetailPage(catalogProduct);

const discountEl = document.getElementById('productDiscountPercent');
const mainPriceEl = document.getElementById('productMainPrice');
const mrpEl = document.getElementById('productMrpPrice');
const dealBadge = document.getElementById('dealBadgePill');
const buyBoxPriceEl = document.getElementById('buyBoxPrice');
const buyBoxMrpEl = document.getElementById('buyBoxMrp');
const buyBoxSavingsEl = document.getElementById('buyBoxSavings');
const brandStoreLinkEl = document.getElementById('brandStoreLink');

assert.strictEqual(mainPriceEl.textContent, '1,399', 'Main price rendered must be 1,399');
assert.strictEqual(mrpEl.textContent, '₹1,713', 'MRP rendered must be ₹1,713');
assert.strictEqual(discountEl.textContent, '-18%', 'Discount percentage must be -18%');
assert.strictEqual(buyBoxPriceEl.textContent, '₹1,399.00', 'Buy Box price must be ₹1,399.00');
assert.strictEqual(buyBoxMrpEl.textContent, 'M.R.P.: ₹1,713.00', 'Buy Box MRP must be M.R.P.: ₹1,713.00');
assert.strictEqual(buyBoxSavingsEl.textContent, 'You save ₹314.00 (18% off)', 'Buy Box savings must be ₹314.00 (18% off)');
assert.strictEqual(brandStoreLinkEl.textContent, 'Visit the HP Store', 'Brand store link text in English must be "Visit the HP Store"');

console.log('  PASS: English rendering: Price=1,399, MRP=₹1,713, Discount=-18%, Brand Link="Visit the HP Store".');

console.log('\n[TEST 3] Testing renderProduct with KP03 in Hindi...');
global.localStorage.store.electromart_lang_v1 = 'hi';
global.localStorage.store.electromart_lang = 'hi';
window.renderProductDetailPage(catalogProduct);

assert.strictEqual(mainPriceEl.textContent, '1,399', 'Hindi main price rendered must be 1,399');
assert.strictEqual(mrpEl.textContent, '₹1,713', 'Hindi MRP rendered must be ₹1,713');
assert.strictEqual(discountEl.textContent, '-18%', 'Hindi discount percentage must be -18%');
assert.strictEqual(buyBoxPriceEl.textContent, '₹1,399.00', 'Hindi Buy Box price must be ₹1,399.00');
assert(buyBoxMrpEl.textContent.includes('₹1,713.00'), 'Hindi Buy Box MRP must contain ₹1,713.00');
assert(buyBoxSavingsEl.textContent.includes('₹314.00') && buyBoxSavingsEl.textContent.includes('18% off'), 'Hindi Buy Box savings has ₹314.00 and 18% off');
assert.strictEqual(brandStoreLinkEl.textContent, 'HP स्टोर पर जाएं', 'Hindi brand store link must be "HP स्टोर पर जाएं"');

console.log('  PASS: Hindi rendering: Price=1,399, MRP=₹1,713, Discount=-18%, Brand Link="HP स्टोर पर जाएं".');

console.log('\n[TEST 4] Testing mapApiProduct safety with un-normalized raw object (price: 139930, listPrice: 171338)...');
const unnormalized = {
  id: targetId,
  name: 'KP03 Laptop Battery For HP',
  brand: 'HP',
  category: 'hp-laptop-battery',
  price: 139930,
  listPrice: 171338
};
const mapped = window.mapApiProduct(unnormalized);
assert.strictEqual(mapped.price, 1399, 'mapApiProduct must normalize 139930 to 1399');
assert.strictEqual(mapped.listPrice, 1713, 'mapApiProduct must normalize 171338 to 1713');
console.log('  PASS: mapApiProduct auto-normalizes paise prices for accessories.');

console.log('\n==================================================');
console.log('ALL HP KP03 BATTERY PRICE TESTS PASSED! 100%');
console.log('==================================================\n');
