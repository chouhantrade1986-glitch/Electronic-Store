const fs = require('fs');
const assert = require('assert');

console.log('==================================================');
console.log('TEST SUITE: Amazon India Price Block UI/UX');
console.log('==================================================');

// Mock DOM
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
      querySelectorAll: (sel) => [],
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
global.location = { protocol: 'http:', hostname: 'localhost', port: '4000', search: '?id=product_9f938430-1e94-b66e-92f6-297080564c6b' };
global.localStorage = {
  store: { electromart_lang_v1: 'hi', electromart_lang: 'hi' },
  getItem: function(k) { return this.store[k] || null; },
  setItem: function(k, v) { this.store[k] = v; }
};
global.document = {
  body: { style: {}, classList: { add: () => {}, remove: () => {} } },
  documentElement: { lang: 'hi' },
  getElementById: (id) => getOrCreateEl(id),
  querySelector: (sel) => getOrCreateEl(sel.replace(/^[#.]/, '')),
  querySelectorAll: (sel) => [],
  addEventListener: () => {}
};

eval(fs.readFileSync('./translations.js', 'utf8'));
eval(fs.readFileSync('./products-data.js', 'utf8'));
eval(fs.readFileSync('./product-detail.js', 'utf8'));

console.log('\n[TEST 1] Testing renderAmazonPrice with discounted product (e.g. ₹798, MRP ₹1,199)...');
const sampleProduct = {
  id: 'test_item_case',
  name: 'EooCoo Case for MacBook',
  price: 798,
  listPrice: 1199,
  brand: 'EooCoo'
};

window.renderAmazonPrice(sampleProduct);

const discountEl = document.getElementById('productDiscountPercent');
const mainPriceEl = document.getElementById('productMainPrice');
const mrpEl = document.getElementById('productMrpPrice');
const dealBadge = document.getElementById('dealBadgePill');
const taxInclusive = document.querySelector('.tax-inclusive');

assert.strictEqual(discountEl.textContent, '-33%', 'Discount percent must be -33%');
assert.strictEqual(discountEl.style.display, 'inline', 'Discount percent must be visible');
assert.strictEqual(mainPriceEl.textContent, '798', 'Main price must be 798');
assert.strictEqual(mrpEl.textContent, '₹1,199', 'MRP must be ₹1,199');
assert.strictEqual(dealBadge.style.display, 'inline-block', 'Deal badge must be displayed');
assert.strictEqual(dealBadge.textContent, 'लाइटनिंग डील', 'Deal badge text must be "लाइटनिंग डील" in Hindi');
assert.strictEqual(taxInclusive.textContent, 'सभी टैक्स सहित', 'Tax inclusive label must be "सभी टैक्स सहित" in Hindi');

console.log('  PASS: Discount pill (-33%), price (₹798), MRP (₹1,199) and deal badge verified.');

console.log('\n[TEST 2] Testing redundant "बचत" (You Save) elimination...');
const dealMeta = document.getElementById('productDealMeta');
assert(dealMeta.style.display === 'none' || dealMeta.textContent === '', 'productDealMeta must not display "बचत: ..."');
console.log('  PASS: Redundant You Save text is completely eliminated from main price block.');

console.log('\n[TEST 3] Testing non-discounted product...');
const fullPriceProduct = {
  id: 'test_full_price',
  price: 1500,
  listPrice: 1500,
  brand: 'Generic'
};
window.renderAmazonPrice(fullPriceProduct);
assert.strictEqual(discountEl.style.display, 'none', 'Discount percent hidden when no discount');
assert.strictEqual(dealBadge.style.display, 'none', 'Deal badge hidden when no discount');
assert.strictEqual(mainPriceEl.textContent, '1,500', 'Main price rendered without discount');
console.log('  PASS: Non-discounted product renders cleanly without discount pill or deal badge.');

console.log('\n[TEST 4] Testing HTML and CSS existence...');
const html = fs.readFileSync('./product-detail.html', 'utf8');
const css = fs.readFileSync('./product-detail.css', 'utf8');

assert(html.includes('class="amazon-price-block"'), 'HTML contains .amazon-price-block');
assert(html.includes('class="deal-badge-pill"'), 'HTML contains .deal-badge-pill');
assert(html.includes('id="productDiscountPercent"'), 'HTML contains #productDiscountPercent');
assert(html.includes('id="productMainPrice"'), 'HTML contains #productMainPrice');
assert(html.includes('id="productMrpPrice"'), 'HTML contains #productMrpPrice');

assert(css.includes('.amazon-price-block'), 'CSS contains .amazon-price-block');
assert(css.includes('.deal-badge-pill'), 'CSS contains .deal-badge-pill');
assert(css.includes('.discount-percent-val'), 'CSS contains .discount-percent-val');
assert(css.includes('.main-price-val'), 'CSS contains .main-price-val');
assert(css.includes('.mrp-tax-row'), 'CSS contains .mrp-tax-row');
console.log('  PASS: HTML and CSS structure verified.');

console.log('\n==================================================');
console.log('ALL AMAZON PRICE BLOCK TESTS PASSED! 100%');
console.log('==================================================\n');
