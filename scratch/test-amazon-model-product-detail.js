const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');

console.log("=== Testing Amazon India Model on Product Detail Page (5 Layers) ===");

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

const amazonKeys = [
  "breadcrumb_products", "visit_store_prefix", "brand_label", "ratings_count_suffix",
  "inclusive_all_taxes", "ships_from", "sold_by", "payment_secure",
  "spec_capacity", "spec_voltage", "spec_warranty", "frequently_bought_together",
  "add_both_to_cart", "customers_also_viewed", "translate_reviews_btn",
  "global_ratings", "verified_purchase", "val_this_item"
];

const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];

languages.forEach((lang) => {
  assert(trans[lang], `Language "${lang}" must exist in EM_TRANSLATIONS`);
  amazonKeys.forEach((key) => {
    assert(trans[lang][key], `Key "${key}" must exist for language "${lang}" (got: ${trans[lang][key]})`);
  });
});
console.log(`PASS: All ${amazonKeys.length} Amazon model keys exist across all 11 languages!`);

// 2. Exact Hindi strings check
assert.strictEqual(trans.hi.breadcrumb_products, "उत्पाद");
assert.strictEqual(trans.hi.visit_store_prefix, "स्टोर पर जाएं");
assert.strictEqual(trans.hi.brand_label, "ब्रांड:");
assert.strictEqual(trans.hi.inclusive_all_taxes, "सभी टैक्स सहित");
assert.strictEqual(trans.hi.ships_from, "भेजनेवाला:");
assert.strictEqual(trans.hi.sold_by, "विक्रेता:");
assert.strictEqual(trans.hi.payment_secure, "भुगतान: सुरक्षित ट्रांज़ैक्शन");
assert.strictEqual(trans.hi.spec_capacity, "क्षमता");
assert.strictEqual(trans.hi.spec_voltage, "वोल्टेज");
assert.strictEqual(trans.hi.spec_warranty, "वारंटी विवरण");
assert.strictEqual(trans.hi.frequently_bought_together, "अक्सर साथ खरीदे जाने वाले");
assert.strictEqual(trans.hi.add_both_to_cart, "दोनों को कार्ट में जोड़ें");
assert.strictEqual(trans.hi.translate_reviews_btn, "सभी समीक्षाओं का हिन्दी में अनुवाद करें");
assert.strictEqual(trans.hi.global_ratings, "ग्लोबल रेटिंग");
assert.strictEqual(trans.hi.verified_purchase, "सत्यापित की गई खरीदी");
assert.strictEqual(trans.hi.val_this_item, "यह आइटम:");
console.log("PASS: Exact Hindi Amazon model strings match user specifications verbatim!");

// 3. Check product-detail.html
const htmlContent = fs.readFileSync(path.join(projectDir, 'product-detail.html'), 'utf8');
assert(htmlContent.includes('id="productBreadcrumb"'), "product-detail.html must contain id='productBreadcrumb'");
assert(htmlContent.includes('data-i18n="breadcrumb_products"'), "product-detail.html must contain data-i18n='breadcrumb_products'");
assert(htmlContent.includes('id="productBrandRow"'), "product-detail.html must contain id='productBrandRow'");
assert(htmlContent.includes('id="brandStoreLink"'), "product-detail.html must contain id='brandStoreLink'");
assert(htmlContent.includes('id="taxInfo"'), "product-detail.html must contain id='taxInfo'");
assert(htmlContent.includes('data-i18n="inclusive_all_taxes"'), "product-detail.html must contain data-i18n='inclusive_all_taxes'");
assert(htmlContent.includes('id="buyBoxMetaDetails"'), "product-detail.html must contain id='buyBoxMetaDetails'");
assert(htmlContent.includes('id="frequentlyBoughtContainer"'), "product-detail.html must contain id='frequentlyBoughtContainer'");
assert(htmlContent.includes('id="translateReviewsBtn"'), "product-detail.html must contain id='translateReviewsBtn'");
console.log("PASS: product-detail.html elements, IDs, and containers verified!");

// 4. Check product-detail.js
const jsContent = fs.readFileSync(path.join(projectDir, 'product-detail.js'), 'utf8');
assert(jsContent.includes('function renderFrequentlyBoughtTogether'), "product-detail.js defines renderFrequentlyBoughtTogether");
assert(jsContent.includes('function localizeSpec'), "product-detail.js defines localizeSpec");
assert(jsContent.includes('productBreadcrumb'), "product-detail.js updates productBreadcrumb");
assert(jsContent.includes('buyBoxMetaDetails'), "product-detail.js updates buyBoxMetaDetails");
assert(jsContent.includes('t.ships_from'), "product-detail.js uses t.ships_from");
assert(jsContent.includes('t.sold_by'), "product-detail.js uses t.sold_by");
assert(jsContent.includes('t.payment_secure'), "product-detail.js uses t.payment_secure");
assert(jsContent.includes('t.frequently_bought_together'), "product-detail.js uses t.frequently_bought_together");
assert(jsContent.includes('t.add_both_to_cart'), "product-detail.js uses t.add_both_to_cart");
console.log("PASS: product-detail.js dynamic rendering, spec localization, and bundle widgets verified!");

console.log("\nALL AMAZON MODEL PRODUCT DETAIL TESTS PASSED (100%)!\n");
