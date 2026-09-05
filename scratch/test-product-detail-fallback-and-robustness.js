const fs = require('fs');
const assert = require('assert');

console.log('==================================================');
console.log('TEST SUITE: Product Detail Fallback & Robustness');
console.log('==================================================');

// 1. Check product-detail.html for image placeholder & onerror
console.log('\n[TEST 1] Checking product-detail.html for image protection...');
const html = fs.readFileSync('./product-detail.html', 'utf8');
assert(html.includes('id="productImage"'), 'productImage exists in HTML');
assert(html.includes('src="product-placeholder.svg"'), 'productImage defaults to product-placeholder.svg');
assert(html.includes('onerror="this.onerror=null;this.src=\'product-placeholder.svg\';"'), 'productImage has inline onerror attribute');
console.log('  PASS: product-detail.html has fallback image and onerror handler.');

// 2. Check product-detail.css for [hidden] overrides
console.log('\n[TEST 2] Checking product-detail.css for hidden element protection...');
const css = fs.readFileSync('./product-detail.css', 'utf8');
assert(css.includes('.product-detail[hidden]'), '.product-detail[hidden] rule exists in CSS');
assert(css.includes('display: none !important;'), 'display: none !important exists for hidden elements');
console.log('  PASS: CSS guarantees hidden sections are not rendered as grid.');

// 3. Setup mock environment and load scripts
console.log('\n[TEST 3] Loading translations.js, products-data.js, and product-detail.js in mock DOM...');
const makeEl = (id) => ({
  id,
  textContent: '',
  innerHTML: '',
  style: {},
  classList: { add: () => {}, remove: () => {}, toggle: () => {} },
  setAttribute: () => {},
  getAttribute: () => '',
  removeAttribute: () => {},
  querySelectorAll: () => [],
  querySelector: () => makeEl('child'),
  addEventListener: () => {},
  pause: () => {},
  play: () => Promise.resolve()
});

global.window = global;
global.window.addEventListener = () => {};
global.location = { protocol: 'http:', hostname: 'localhost', port: '4000', search: '' };
global.localStorage = {
  getItem: (k) => k.includes('lang') ? 'hi' : null,
  setItem: () => {}
};
global.document = {
  body: { style: {} },
  getElementById: (id) => makeEl(id),
  querySelector: () => makeEl('mock'),
  querySelectorAll: () => [],
  addEventListener: () => {}
};

eval(fs.readFileSync('./translations.js', 'utf8'));
eval(fs.readFileSync('./products-data.js', 'utf8'));
eval(fs.readFileSync('./product-detail.js', 'utf8'));
console.log('  PASS: All scripts evaluated with 0 syntax errors.');

// 4. Test registered IDs
console.log('\n[TEST 4] Testing target product resolutions...');
async function testResolutions() {
  // Test MacBook Air M5
  const pMac = await window.loadProductSafely('2');
  assert(pMac, 'MacBook loaded');
  const macTitle = window.getLocalizedTitle(pMac, 'hi');
  assert(macTitle.includes('मैकबुक एयर'), 'MacBook title in Hindi: ' + macTitle);
  console.log('  PASS: id=2 (MacBook) resolves to: ' + macTitle.slice(0, 50) + '...');

  // Test AstraBook Pro
  const pAstra = await window.loadProductSafely('1');
  assert(pAstra, 'AstraBook loaded');
  const astraTitle = window.getLocalizedTitle(pAstra, 'hi');
  assert(astraTitle.includes('एस्ट्राबुक'), 'AstraBook title in Hindi: ' + astraTitle);
  console.log('  PASS: id=1 (AstraBook) resolves to: ' + astraTitle);

  // Test Pantony Tracker
  const pPantony = await window.loadProductSafely('product_c5367fc4-ca38-9435-27dc-8d383b5faa59');
  assert(pPantony, 'Pantony loaded');
  const pantonyTitle = window.getLocalizedTitle(pPantony, 'hi');
  assert(pantonyTitle.includes('पैंटोनी') || pantonyTitle.includes('Pantony'), 'Pantony title in Hindi: ' + pantonyTitle);
  console.log('  PASS: id=product_c5367fc4... resolves to: ' + pantonyTitle);

  // Test Gigabyte Motherboard
  const pMobo = await window.loadProductSafely('product_af346ddc-3f42-2797-7450-5d7e781075be');
  assert(pMobo, 'Gigabyte motherboard loaded');
  const moboTitle = window.getLocalizedTitle(pMobo, 'hi');
  assert(moboTitle.includes('मदरबोर्ड'), 'Gigabyte motherboard title in Hindi: ' + moboTitle);
  const moboSpecs = window.getLocalizedSpecs(pMobo, 'hi');
  assert(Array.isArray(moboSpecs) && moboSpecs.length >= 4, 'Gigabyte motherboard has >= 4 specs');
  console.log('  PASS: id=product_af346ddc... resolves to: ' + moboTitle);
  console.log('    Specs: ' + moboSpecs.length + ' items, first: ' + moboSpecs[0]);

  // Test Unknown ID fallback
  const pFallback = await window.loadProductSafely('completely_unknown_random_id');
  assert(pFallback, 'Fallback product loaded for unknown ID');
  assert(pFallback.id, 'Fallback product has valid ID: ' + pFallback.id);
  console.log('  PASS: Unknown ID gracefully falls back to catalog product: ' + pFallback.name);

  // Test Empty ID fallback
  const pEmptyFallback = await window.loadProductSafely('');
  assert(pEmptyFallback, 'Fallback product loaded for empty ID');
  console.log('  PASS: Empty ID gracefully falls back to catalog product: ' + pEmptyFallback.name);
}

testResolutions().then(() => {
  console.log('\n==================================================');
  console.log('ALL PRODUCT DETAIL FALLBACK TESTS PASSED! 100%');
  console.log('==================================================\n');
}).catch((err) => {
  console.error('\nFAIL:', err);
  process.exit(1);
});
