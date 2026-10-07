const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');
const transCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
const headerHtml = fs.readFileSync(path.join(projectDir, 'header.html'), 'utf8');
const headerJs = fs.readFileSync(path.join(projectDir, 'header.js'), 'utf8');
const menuMgrCode = fs.readFileSync(path.join(projectDir, 'menu-manager.js'), 'utf8');

console.log("=== Testing Drawer Internal Items i18n & menu-manager.js Sync ===");

// 1. Evaluate translations.js
const mockDoc = {
  readyState: 'complete',
  documentElement: { lang: 'en', setAttribute: function(k, v) { this[k] = v; } },
  querySelectorAll: function() { return []; },
  querySelector: function() { return null; },
  getElementById: function() { return null; },
  addEventListener: function() {}
};
const mockWindow = { location: { pathname: '/index.html' } };
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
const drawerKeys = [
  'best_sellers', 'todays_deals', 'new_arrivals', 'components_parts',
  'laptops_desktops', 'mobiles_accessories', 'audio_headphones',
  'your_account', 'drawer_sign_in'
];

languages.forEach(lang => {
  assert(trans[lang], `Language ${lang} must exist`);
  drawerKeys.forEach(key => {
    assert(trans[lang][key], `Key "${key}" must exist in language "${lang}"`);
  });
});
console.log(`PASS: All ${drawerKeys.length} drawer item keys exist across all 11 languages!`);

// 2. Exact Hindi strings requested by user
assert.strictEqual(trans.hi.best_sellers, "सर्वाधिक बिकने वाले");
assert.strictEqual(trans.hi.todays_deals, "आज की डील");
assert.strictEqual(trans.hi.new_arrivals, "नए आगमन");
assert.strictEqual(trans.hi.components_parts, "पीसी कंपोनेंट्स और पार्ट्स");
assert.strictEqual(trans.hi.laptops_desktops, "लैपटॉप और डेस्कटॉप");
assert.strictEqual(trans.hi.mobiles_accessories, "मोबाइल और एक्सेसरीज़");
assert.strictEqual(trans.hi.audio_headphones, "ऑडियो और हेडफोन");
assert.strictEqual(trans.hi.your_account, "आपका अकाउंट");
assert.strictEqual(trans.hi.drawer_sign_in, "साइन इन");
console.log("PASS: Exact Hindi drawer items match user specifications verbatim");

// 3. Header tags in header.html and header.js
drawerKeys.forEach(key => {
  assert(headerHtml.includes(`data-i18n="${key}"`), `header.html must include data-i18n="${key}"`);
  assert(headerJs.includes(`data-i18n="${key}"`), `header.js must include data-i18n="${key}"`);
});
console.log("PASS: All drawer item data-i18n tags verified in header.html and header.js");

// 4. Test menu-manager.js drawer sync logic
assert(menuMgrCode.includes('syncDrawerMenuItems'), "menu-manager.js must define syncDrawerMenuItems");
assert(menuMgrCode.includes('best_sellers'), "menu-manager.js must reference best_sellers");
assert(menuMgrCode.includes('components_parts'), "menu-manager.js must reference components_parts");
assert(menuMgrCode.includes('your_account'), "menu-manager.js must reference your_account");
console.log("PASS: menu-manager.js drawer sync logic verified");

console.log("\nALL DRAWER INTERNAL ITEMS I18N TESTS PASSED (100%)!");
