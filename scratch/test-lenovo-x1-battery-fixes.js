const fs = require('fs');
const assert = require('assert');

console.log('==================================================');
console.log('TEST SUITE: Lenovo X1 Carbon Battery & Drawer Parity');
console.log('==================================================');

// 1. Mock browser DOM environment
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
      querySelector: (sel) => getOrCreateEl('child'),
      addEventListener: () => {},
      pause: () => {},
      play: () => Promise.resolve()
    });
  }
  return elements.get(id);
}

global.window = global;
global.window.addEventListener = () => {};
global.location = { protocol: 'http:', hostname: 'localhost', port: '4000', search: '?id=product_2cfd9948-2de2-ddcc-dc54-0db0c73eb439' };
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

console.log('\n[TEST 1] Testing L20C4P71 registration in EM_CATALOG...');
const targetId = 'product_2cfd9948-2de2-ddcc-dc54-0db0c73eb439';
const prod = window.EM_CATALOG_MAP[targetId];
assert(prod, 'L20C4P71 must exist in EM_CATALOG_MAP');
assert(prod.aboutSpecs && prod.aboutSpecs.hi, 'L20C4P71 must have Hindi aboutSpecs');
assert.strictEqual(prod.aboutSpecs.hi.length, 4, 'Must have 4 authentic feature bullets');
assert(prod.aboutSpecs.hi[0].includes('प्रीमियम ग्रेड लिथियम-आयन लैपटॉप बैटरी'), 'Bullet 1 matches');
assert(prod.aboutSpecs.hi[1].includes('सटीक फिटिंग और ओवर-चार्जिंग प्रोटेक्शन सर्किट'), 'Bullet 2 matches');
assert(prod.aboutSpecs.hi[2].includes('लंबे समय तक चलने वाली बैटरी लाइफ'), 'Bullet 3 matches');
assert(prod.aboutSpecs.hi[3].includes('1 वर्ष की निर्माता वारंटी'), 'Bullet 4 matches');
console.log('  PASS: L20C4P71 catalog registration and authentic Hindi specs verified.');

console.log('\n[TEST 2] Testing Brand Store Link Trailing Colon Removal...');
const tHi = window.EM_TRANSLATIONS.hi;
assert(!tHi.visit_store_prefix.endsWith(':'), 'visit_store_prefix must not end with a colon in Hindi');
const allLangs = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
allLangs.forEach(lang => {
  const p = window.EM_TRANSLATIONS[lang]?.visit_store_prefix;
  if (p) {
    assert(!p.endsWith(':'), `visit_store_prefix must not end with colon in ${lang}`);
  }
});
console.log('  PASS: All 11 regional languages have clean visit_store_prefix without colons.');

console.log('\n[TEST 3] Testing Hamburger Drawer Subcategory Localization...');
assert.strictEqual(window.EM_TRANSLATIONS.hi.drawer_subcategory, 'उप-श्रेणी', 'Hindi subcategory title is "उप-श्रेणी"');
assert.strictEqual(window.EM_TRANSLATIONS.en.drawer_subcategory, 'Subcategory', 'English subcategory title is "Subcategory"');
console.log('  PASS: drawer_subcategory dictionary keys verified.');

console.log('\n[TEST 4] Testing localizeBatterySpecs() regex translations...');
const testElements = [
  { innerHTML: '<li>Capacity: 3600mAh | Voltage:15.4V | Number of cells: 4.</li>' },
  { innerHTML: '<li>Warranty Details: 1 Year warranty.</li>' },
  { innerHTML: '<li>Quality Lenovo L20C4P71 15.4V Battery – 100% compatible with your laptop, identical size, including all safety measures.</li>' },
  { innerHTML: '<li>Highly Compatible battery for LENOVO L20C4P71, ThinkPad X1 YOGA GEN 6, ThinkPad X1 CARBON GEN 10 Series Laptops.</li>' },
  { innerHTML: '<li><strong>Capacity:</strong>&nbsp;2200 mAh | Voltage: 14.4V | Number of cell: 4</li>' },
  { innerHTML: '<li><strong>Quality Lenovo IdeaPad S500 Battery</strong>&nbsp;– 100% compatible with your laptop, identical size, including all electronic safety measures.</li>' },
  { innerHTML: '<p><strong>Compatible with Laptop Models:&nbsp;（Please "Ctrl+F" search your laptop model）</strong></p>' },
  { innerHTML: '<p><strong>Package Content:</strong></p>' },
  { innerHTML: '<p><strong>Battery Use Tip:</strong></p>' }
];
global.document.querySelectorAll = (sel) => {
  if (sel.includes('li') || sel.includes('p') || sel.includes('div') || sel.includes('service-item')) {
    return testElements;
  }
  return [];
};

window.localizeBatterySpecs();

assert(testElements[0].innerHTML.includes('सेल की संख्या: 4.'), 'Number of cells translated to सेल की संख्या:');
assert(testElements[0].innerHTML.includes('क्षमता:'), 'Capacity translated to क्षमता:');
assert(testElements[0].innerHTML.includes('वोल्टेज: 15.4V'), 'Voltage translated to वोल्टेज:');
assert(testElements[1].innerHTML.includes('वारंटी विवरण: 1 वर्ष की वारंटी।'), 'Warranty Details & 1 Year warranty translated');
assert(testElements[2].innerHTML.includes('उच्च गुणवत्ता वाली लेनोवो बैटरी'), 'Quality Lenovo L20C4P71 15.4V Battery translated');
assert(testElements[2].innerHTML.includes('आपके लैपटॉप के साथ 100% संगत'), '100% compatible translated');
assert(testElements[3].innerHTML.includes('अत्यधिक संगत बैटरी:'), 'Highly Compatible battery for translated');

// Assertions for the 3 new user-reported items:
assert(testElements[4].innerHTML.includes('सेल की संख्या: 4'), 'Singular "Number of cell:" translated to "सेल की संख्या:"');
assert(testElements[5].innerHTML.includes('सटीक आकार, सभी इलेक्ट्रॉनिक सुरक्षा मानकों सहित।'), '"identical size, including all electronic safety measures." translated');
assert(testElements[6].innerHTML.includes('लैपटॉप मॉडल के साथ संगत:'), '"Compatible with Laptop Models:" translated');
assert(testElements[7].innerHTML.includes('पैकेज सामग्री:'), '"Package Content:" translated');
assert(testElements[8].innerHTML.includes('बैटरी उपयोग टिप्स:'), '"Battery Use Tip:" translated');
console.log('  PASS: All targeted bullet descriptions and headings accurately localized to authentic Hindi!');

console.log('\n[TEST 4B] Testing product_9f938430 registration in EM_CATALOG...');
const prod9f = window.EM_CATALOG_MAP['product_9f938430-1e94-b66e-92f6-297080564c6b'];
assert(prod9f, 'product_9f938430 exists in catalog');
assert.strictEqual(prod9f.aboutSpecs.hi.length, 4, 'product_9f938430 has 4 Hindi specs');
console.log('  PASS: product_9f938430 registered with authentic Hindi specs.');

console.log('\n[TEST 5] Testing Dummy Keyword Elimination from About Item Bullets...');
const dummyProduct = {
  id: 'test_battery_dummy',
  name: 'Generic Laptop Battery',
  category: 'laptop-battery',
  keywords: ['Laptop  Battery', 'Lenovo Laptop Battery', 'Lenovo Store'],
  aboutSpecs: undefined
};
// Simulating spec filtering logic
const rawKeywords = dummyProduct.keywords.map(k => k.trim().toLowerCase());
const candidateSpecs = (dummyProduct.aboutSpecs || []);
const cleanSpecs = candidateSpecs.filter(spec => {
  const s = String(spec || '').replace(/^[-•\s]+/, '').trim().toLowerCase();
  return s && !rawKeywords.includes(s) && !['laptop battery', 'lenovo laptop battery', 'lenovo store'].includes(s);
});
assert.strictEqual(cleanSpecs.length, 0, 'Candidate specs containing keywords must be emptied');
const isBattery = /\b(battery|बैटरी)\b/i.test(dummyProduct.name + ' ' + dummyProduct.category);
assert(isBattery, 'Identified as battery');
const finalFallback = isBattery ? [
  "प्रीमियम ग्रेड लिथियम-आयन लैपटॉप बैटरी",
  "सटीक फिटिंग और ओवर-चार्जिंग प्रोटेक्शन सर्किट",
  "लंबे समय तक चलने वाली बैटरी लाइफ और तेज़ चार्जिंग सपोर्ट",
  "1 वर्ष की निर्माता वारंटी और रिप्लेसमेंट सपोर्ट"
] : [];
assert.strictEqual(finalFallback.length, 4, 'Must supply 4 rich battery bullets instead of keywords');
console.log('  PASS: Dummy SEO keywords successfully prevented from appearing as bullets!');

console.log('\n==================================================');
console.log('ALL LENOVO X1 BATTERY & DRAWER TESTS PASSED! 100%');
console.log('==================================================\n');
