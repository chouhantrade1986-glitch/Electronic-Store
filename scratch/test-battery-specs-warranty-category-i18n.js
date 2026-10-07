const fs = require('fs');
const assert = require('assert');

console.log('==================================================');
console.log('TEST SUITE: Battery Specs, Warranty & Category i18n');
console.log('==================================================');

// Mock browser environment
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

console.log('\n[TEST 1] Testing ThinkPad Yoga battery catalog registration...');
const targetId = 'product_d5c39a68-42cd-cc7b-d3d5-b3655e13a791';
const prod = window.EM_CATALOG_MAP[targetId];
assert(prod, 'ThinkPad Yoga battery exists in EM_CATALOG_MAP');
assert(prod.category === 'laptop_accessories' || prod.category === 'laptop', 'Category is laptop_accessories or laptop');
console.log('  PASS: Product found with category: ' + prod.category);

console.log('\n[TEST 2] Testing Category Family & Localization (Avoid "printer" mismatch)...');
const catFamily = window.getProductCategoryFamily(prod);
assert.strictEqual(catFamily, 'laptop', 'Category family must resolve to laptop, not printer');
const localizedCat = window.getLocalizedCategory(catFamily, 'hi');
assert.strictEqual(localizedCat, 'लैपटॉप और एक्सेसरीज़', 'Category must resolve to "लैपटॉप और एक्सेसरीज़" in Hindi');
console.log('  PASS: getProductCategoryFamily resolved to: ' + catFamily + ' -> ' + localizedCat);

console.log('\n[TEST 3] Testing Title & Specs in Hindi...');
const titleHi = window.getLocalizedTitle(prod, 'hi');
assert(titleHi.includes('45N1704 के लिए लैपटॉप बैटरी'), 'Hindi title matches');
console.log('  PASS: Localized Title: ' + titleHi);

const specsHi = window.getLocalizedSpecs(prod, 'hi');
assert(Array.isArray(specsHi) && specsHi.length >= 4, 'Specs in Hindi must have >= 4 items');
assert(specsHi.some(s => s.includes('क्षमता:')), 'Specs include "क्षमता:"');
assert(specsHi.some(s => s.includes('वारंटी विवरण:')), 'Specs include "वारंटी विवरण:"');
console.log('  PASS: Localized Specs verified: ' + specsHi.length + ' items');

console.log('\n[TEST 4] Testing localizeBatterySpecs() replacement logic...');
const testElements = [
  { innerHTML: '<li>Capacity: 3.18Ah/47WH&nbsp; Voltage:14.8V</li>' },
  { innerHTML: '<li>Warranty Details: 12-months replacement warranty.</li>' },
  { innerHTML: '<li>Quality Lenovo&nbsp;Yoga&nbsp;Battery – 100% compatible with your Lenovo laptop</li>' },
  { innerHTML: '<p>6 Months to 1 Year standard brand warranty.</p>' }
];
global.document.querySelectorAll = () => testElements;
const mockKwRow = { style: {} };
global.document.querySelector = (sel) => sel.includes('keywords') ? mockKwRow : null;

window.localizeBatterySpecs();

assert(testElements[0].innerHTML.includes('क्षमता:'), 'Capacity translated');
assert(testElements[0].innerHTML.includes('वोल्टेज:'), 'Voltage translated');
assert(testElements[1].innerHTML.includes('वारंटी विवरण:'), 'Warranty Details translated');
assert(testElements[1].innerHTML.includes('12 महीने की रिप्लेसमेंट वारंटी।'), '12-months warranty translated');
assert(testElements[2].innerHTML.includes('उच्च गुणवत्ता वाली लेनोवो योगा बैटरी'), 'Quality Lenovo Yoga Battery translated');
assert(testElements[2].innerHTML.includes('100% संगत'), '100% compatible translated');
assert(testElements[3].innerHTML.includes('6 महीने से 1 वर्ष की मानक ब्रांड वारंटी।'), 'Warranty card copy translated');
console.log('  PASS: All bullet specs and warranty card copy successfully localized to Hindi!');

console.log('\n[TEST 5] Testing Keywords Row Concealment...');
assert.strictEqual(mockKwRow.style.display, 'none', 'Keywords row must be hidden (display: none)');
console.log('  PASS: Keywords row is hidden (display: none), matching Amazon India.');

console.log('\n==================================================');
console.log('ALL BATTERY SPECS & WARRANTY TESTS PASSED! 100%');
console.log('==================================================\n');
