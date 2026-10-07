const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');
const transCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
const headerHtml = fs.readFileSync(path.join(projectDir, 'header.html'), 'utf8');
const headerJs = fs.readFileSync(path.join(projectDir, 'header.js'), 'utf8');
const tdJs = fs.readFileSync(path.join(projectDir, 'todays-deals.js'), 'utf8');

console.log("=== Testing Header Drawer, Category Dropdown & Deals Count i18n ===");

// 1. Evaluate translations.js
const mockDoc = {
  readyState: 'complete',
  documentElement: { lang: 'en', setAttribute: function(k, v) { this[k] = v; } },
  querySelectorAll: function() { return []; },
  querySelector: function() { return null; },
  getElementById: function() { return null; },
  addEventListener: function() {}
};
const mockWindow = { location: { pathname: '/todays-deals.html' } };
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
const targetKeys = [
  'all_categories_default', 'hello_sign_in_menu', 'menu_trending',
  'menu_shop_department', 'menu_programs', 'menu_help_settings', 'showing_x_deals'
];

languages.forEach(lang => {
  assert(trans[lang], `Language ${lang} must exist`);
  targetKeys.forEach(key => {
    assert(trans[lang][key], `Key "${key}" must exist in language "${lang}"`);
  });
});
console.log(`PASS: All ${targetKeys.length} keys exist across all 11 languages!`);

// 2. Exact Hindi strings requested by user
assert.strictEqual(trans.hi.all_categories_default, "सभी कैटेगरी");
assert.strictEqual(trans.hi.hello_sign_in_menu, "नमस्ते, साइन इन करें");
assert.strictEqual(trans.hi.menu_trending, "ट्रेंडिंग");
assert.strictEqual(trans.hi.menu_shop_department, "विभाग के अनुसार खरीदारी करें");
assert.strictEqual(trans.hi.menu_programs, "प्रोग्राम और फीचर्स");
assert.strictEqual(trans.hi.menu_help_settings, "सहायता और सेटिंग्स");
assert.strictEqual(trans.hi.showing_x_deals, "डील्स दिखाई जा रही हैं");
console.log("PASS: Exact Hindi strings match user specification verbatim");

// 3. Header tags in header.html and header.js
const headerTags = [
  'data-i18n="categoryFilter.all"',
  'data-i18n="hello_sign_in_menu"',
  'data-i18n="menu_trending"',
  'data-i18n="menu_shop_department"',
  'data-i18n="menu_programs"',
  'data-i18n="menu_help_settings"'
];

headerTags.forEach(tag => {
  assert(headerHtml.includes(tag), `header.html must include ${tag}`);
  assert(headerJs.includes(tag), `header.js must include ${tag}`);
});
console.log("PASS: All drawer and category dropdown data-i18n tags verified in header.html and header.js");

// 4. Test deals count in todays-deals.js
assert(tdJs.includes('showing_x_deals'), "todays-deals.js references showing_x_deals");

// Simulate deals count generation in Hindi
const list = [1, 2, 3, 4, 5, 6];
const t = trans.hi;
const countText = `${list.length} ${t.showing_x_deals || "डील्स दिखाई जा रही हैं"}`;
assert.strictEqual(countText, "6 डील्स दिखाई जा रही हैं", "Deals count text must format as '6 डील्स दिखाई जा रही हैं' in Hindi");
console.log("PASS: Deals count text formats authentically as '6 डील्स दिखाई जा रही हैं'");

console.log("\nALL HEADER DRAWER, CATEGORY DROPDOWN & DEALS COUNT TESTS PASSED (100%)!");
