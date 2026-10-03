const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');

console.log("=== Testing Product Information Table & Technical Specs i18n ===");

// 1. Load translations.js
const transCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
const sandbox = {
  window: {},
  document: {
    addEventListener: () => {},
    querySelectorAll: () => [],
    getElementById: () => null,
    querySelector: () => null,
    documentElement: { setAttribute: () => {} }
  },
  localStorage: {
    getItem: () => "hi",
    setItem: () => {}
  }
};
vm.createContext(sandbox);
vm.runInContext(transCode, sandbox);

const trans = sandbox.window.EM_TRANSLATIONS;
assert(trans, "EM_TRANSLATIONS must exist on window");

const tableKeys = [
  "tbl_sku", "tbl_brand", "tbl_category", "tbl_segment", "tbl_price", "tbl_mrp",
  "tbl_stock", "tbl_status", "tbl_fulfillment", "tbl_moq", "tbl_featured",
  "tbl_keywords", "tbl_rating", "val_active", "val_yes", "val_no"
];

const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];

languages.forEach(lang => {
  assert(trans[lang], `Language "${lang}" must exist in EM_TRANSLATIONS`);
  tableKeys.forEach(k => {
    assert(trans[lang][k], `Key "${k}" must exist in language "${lang}" (got: ${trans[lang][k]})`);
  });
});
console.log(`PASS: All ${tableKeys.length} table keys exist across all 11 languages!`);

// 2. Exact Hindi values matching user specifications
assert.strictEqual(trans.hi.tbl_sku, "एसकेयू (SKU)");
assert.strictEqual(trans.hi.tbl_brand, "ब्रांड");
assert.strictEqual(trans.hi.tbl_category, "श्रेणी");
assert.strictEqual(trans.hi.tbl_segment, "सेगमेंट");
assert.strictEqual(trans.hi.tbl_price, "कीमत");
assert.strictEqual(trans.hi.tbl_mrp, "एम.आर.पी.");
assert.strictEqual(trans.hi.tbl_stock, "उपलब्ध स्टॉक");
assert.strictEqual(trans.hi.tbl_status, "स्थिति");
assert.strictEqual(trans.hi.tbl_fulfillment, "फुलफिलमेंट");
assert.strictEqual(trans.hi.tbl_moq, "न्यूनतम ऑर्डर मात्रा (MOQ)");
assert.strictEqual(trans.hi.tbl_featured, "विशेष रुप से प्रदर्शित");
assert.strictEqual(trans.hi.tbl_keywords, "कीवर्ड्स");
assert.strictEqual(trans.hi.tbl_rating, "रेटिंग");
assert.strictEqual(trans.hi.val_active, "सक्रिय");
assert.strictEqual(trans.hi.val_yes, "हाँ");
assert.strictEqual(trans.hi.val_no, "नहीं");
console.log("PASS: Exact Hindi table headers and values match user specifications verbatim!");

// 3. Check product-detail.html
const html = fs.readFileSync(path.join(projectDir, 'product-detail.html'), 'utf8');
assert(html.includes('id="productInfoTable"'), "product-detail.html must contain id='productInfoTable'");
assert(html.includes('data-i18n="tbl_sku"'), "product-detail.html must contain data-i18n='tbl_sku'");
assert(html.includes('data-i18n="tbl_brand"'), "product-detail.html must contain data-i18n='tbl_brand'");
assert(html.includes('data-i18n="tbl_category"'), "product-detail.html must contain data-i18n='tbl_category'");
assert(html.includes('data-i18n="tbl_segment"'), "product-detail.html must contain data-i18n='tbl_segment'");
assert(html.includes('data-i18n="tbl_price"'), "product-detail.html must contain data-i18n='tbl_price'");
assert(html.includes('data-i18n="tbl_mrp"'), "product-detail.html must contain data-i18n='tbl_mrp'");
assert(html.includes('data-i18n="tbl_stock"'), "product-detail.html must contain data-i18n='tbl_stock'");
assert(html.includes('data-i18n="tbl_status"'), "product-detail.html must contain data-i18n='tbl_status'");
assert(html.includes('data-i18n="tbl_fulfillment"'), "product-detail.html must contain data-i18n='tbl_fulfillment'");
assert(html.includes('data-i18n="tbl_moq"'), "product-detail.html must contain data-i18n='tbl_moq'");
assert(html.includes('data-i18n="tbl_featured"'), "product-detail.html must contain data-i18n='tbl_featured'");
assert(html.includes('data-i18n="tbl_keywords"'), "product-detail.html must contain data-i18n='tbl_keywords'");
assert(html.includes('data-i18n="tbl_rating"'), "product-detail.html must contain data-i18n='tbl_rating'");
console.log("PASS: product-detail.html contains all 13 table header data-i18n attributes and productInfoTable ID!");

// 4. Check product-detail.js
const js = fs.readFileSync(path.join(projectDir, 'product-detail.js'), 'utf8');
assert(js.includes('function renderProductInfoTable'), "product-detail.js defines renderProductInfoTable");
assert(js.includes('statusMap'), "product-detail.js defines statusMap");
assert(js.includes('t.val_active'), "product-detail.js maps val_active");
assert(js.includes('featuredMap'), "product-detail.js defines featuredMap");
assert(js.includes('t.val_yes'), "product-detail.js maps val_yes");
assert(js.includes('window.renderProductInfoTable'), "product-detail.js exports window.renderProductInfoTable");
console.log("PASS: product-detail.js dynamic table rendering, status mapping, and export verified!");

console.log("\nALL PRODUCT INFORMATION TABLE I18N TESTS PASSED (100%)!\n");
