const fs = require('fs');
const path = require('path');
const assert = require('assert');

const repoRoot = "C:\\Users\\Admin\\Documents\\GitHub\\Electronic-Store";

console.log("==================================================");
console.log("TEST SUITE: Product Detail Quick Fixes Verification");
console.log("==================================================");

// 1. Verify translations.js
console.log("\n[TEST 1] Checking translations.js keys across all 11 languages...");
const transContent = fs.readFileSync(path.join(repoRoot, 'translations.js'), 'utf8');

// Mock window and document to evaluate translations.js
const mockWindow = { location: { pathname: 'product-detail.html' } };
const mockDoc = {
  readyState: 'complete',
  addEventListener: () => {},
  querySelectorAll: () => [],
  getElementById: () => null,
  documentElement: { setAttribute: () => {} }
};

const sandbox = {
  window: mockWindow,
  document: mockDoc,
  localStorage: { getItem: () => 'hi', setItem: () => {} },
  navigator: {},
  setTimeout: () => {}
};

const vm = require('vm');
vm.createContext(sandbox);
vm.runInContext(transContent, sandbox);

const translations = sandbox.window.EM_TRANSLATIONS;
assert(translations, "EM_TRANSLATIONS should be exposed on window");

const allLangs = ['en', 'hi', 'ta', 'te', 'mr', 'bn', 'kn', 'ml', 'ur', 'pa', 'gu'];
const requiredKeys = [
  'partner_card_cashback',
  'warranty_subtext',
  'no_cost_emi_subtext',
  'exchange_offer_subtext',
  'partner_offer_subtext',
  'free_delivery_subtext',
  'return_subtext',
  'seller_subtext',
  'spec_high_performance',
  'spec_ssd_storage',
  'spec_battery_life'
];

allLangs.forEach(lang => {
  assert(translations[lang], `Language '${lang}' should exist in EM_TRANSLATIONS`);
  requiredKeys.forEach(k => {
    assert(translations[lang][k], `Key '${k}' must exist for language '${lang}'`);
  });
});
console.log("  PASS: All 11 languages contain all 11 required quick fix keys.");

// Verify exact Hindi strings
console.log("\n[TEST 2] Checking exact Hindi phrasing as specified by user...");
const hi = translations.hi;
assert.strictEqual(hi.partner_card_cashback, "पार्टनर कार्ड पर अतिरिक्त 5% कैशबैक");
assert.strictEqual(hi.warranty_subtext, "1 वर्ष की निर्माता वारंटी");
assert.strictEqual(hi.free_delivery_subtext, "चुनिंदा शहरों में कल तक मुफ़्त डिलीवरी");
assert.strictEqual(hi.return_subtext, "7 दिनों में आसान रिप्लेसमेंट");
assert.strictEqual(hi.seller_subtext, "अधिकृत विक्रेता एवं जीएसटी चालान उपलब्ध");
assert.strictEqual(hi.spec_high_performance, "उच्च प्रदर्शन प्रोसेसर");
assert.strictEqual(hi.spec_ssd_storage, "एसएसडी स्टोरेज");
assert.strictEqual(hi.spec_battery_life, "लंबी बैटरी लाइफ");
console.log("  PASS: All 8 Hindi strings match the requested wording verbatim!");

// 2. Verify product-detail.html markup
console.log("\n[TEST 3] Checking product-detail.html markup...");
const htmlContent = fs.readFileSync(path.join(repoRoot, 'product-detail.html'), 'utf8');

assert(htmlContent.includes('id="productStockMeta"'), "Must contain id='productStockMeta'");
assert(htmlContent.includes('data-alias="productQuickMeta"'), "Must contain data-alias='productQuickMeta'");
assert(htmlContent.includes('id="productSpecs"'), "Must contain id='productSpecs'");
assert(htmlContent.includes('data-alias="aboutItemBulletList"'), "Must contain data-alias='aboutItemBulletList'");
assert(htmlContent.includes('data-i18n="sub_delivery"'), "Must contain data-i18n='sub_delivery'");
assert(htmlContent.includes('data-i18n="sub_returns"'), "Must contain data-i18n='sub_returns'");
assert(htmlContent.includes('data-i18n="sub_warranty"'), "Must contain data-i18n='sub_warranty'");
assert(htmlContent.includes('data-i18n="sub_seller"'), "Must contain data-i18n='sub_seller'");
console.log("  PASS: product-detail.html markup contains all aliases and data-i18n attributes.");

// 3. Verify product-detail.js logic
console.log("\n[TEST 4] Checking product-detail.js logic...");
const jsContent = fs.readFileSync(path.join(repoRoot, 'product-detail.js'), 'utf8');

// A. DOMContentLoaded auto-read
assert(jsContent.includes('document.addEventListener("DOMContentLoaded"'), "Must contain DOMContentLoaded listener");
assert(jsContent.includes('localStorage.getItem("electromart_lang_v1")'), "Must auto-read electromart_lang_v1");
assert(jsContent.includes('applyFullPageTranslation(currentLang)'), "Must trigger applyFullPageTranslation");
assert(jsContent.includes('renderProductDetailPage('), "Must invoke renderProductDetailPage");

// B. Safe renderProductDetailPage
assert(jsContent.includes('const target = (prod && typeof prod === "object") ? prod : (window.currentLoadedProduct || activeRenderedProduct);'), 
  "renderProductDetailPage must guard against string language code argument");

// C. Raw meta row localized template
assert(jsContent.includes('document.getElementById("productQuickMeta") || productStockMeta'), "Must check productQuickMeta or productStockMeta");
assert(jsContent.includes('metaRow.innerHTML = `${t.tbl_stock || "उपलब्ध स्टॉक"}:'), "Must use localized stock label");
assert(jsContent.includes('${t.tbl_status || "स्थिति"}:'), "Must use localized status label");
assert(jsContent.includes('${t.tbl_fulfillment || "फुलफिलमेंट"}:'), "Must use localized fulfillment label");

// D. Bullet map auto-translation
assert(jsContent.includes('const bulletMap = {'), "Must define bulletMap");
assert(jsContent.includes('"High performance processor": t.spec_high_performance || "उच्च प्रदर्शन प्रोसेसर"'), "bulletMap must map High performance processor");
assert(jsContent.includes('"SSD storage": t.spec_ssd_storage || "एसएसडी स्टोरेज"'), "bulletMap must map SSD storage");
assert(jsContent.includes('"Long battery life": t.spec_battery_life || "लंबी बैटरी लाइफ"'), "bulletMap must map Long battery life");
assert(jsContent.includes('document.querySelectorAll("#productSpecs li, #aboutItemBulletList li")'), "Must select both aliases for bullet points");

// E. Offer and Service subtexts
assert(jsContent.includes('serviceDeliveryText.setAttribute("data-i18n", "free_delivery_subtext")'), "serviceDeliveryText must set data-i18n='free_delivery_subtext'");
assert(jsContent.includes('serviceReturnText.setAttribute("data-i18n", "return_subtext")'), "serviceReturnText must set data-i18n='return_subtext'");
assert(jsContent.includes('serviceWarrantyText.setAttribute("data-i18n", "warranty_subtext")'), "serviceWarrantyText must set data-i18n='warranty_subtext'");
assert(jsContent.includes('serviceSellerText.setAttribute("data-i18n", "seller_subtext")'), "serviceSellerText must set data-i18n='seller_subtext'");
assert(jsContent.includes('descKey: "partner_card_cashback"'), "offersGrid must assign partner_card_cashback descKey");
assert(jsContent.includes('descKey: "no_cost_emi_subtext"'), "offersGrid must assign no_cost_emi_subtext descKey");

// Also check product-detail.html has them on the elements
assert(htmlContent.includes('id="serviceDeliveryText" data-i18n="free_delivery_subtext"'), "serviceDeliveryText element must have data-i18n");
assert(htmlContent.includes('id="serviceReturnText" data-i18n="return_subtext"'), "serviceReturnText element must have data-i18n");
assert(htmlContent.includes('id="serviceWarrantyText" data-i18n="warranty_subtext"'), "serviceWarrantyText element must have data-i18n");
assert(htmlContent.includes('id="serviceSellerText" data-i18n="seller_subtext"'), "serviceSellerText element must have data-i18n");

console.log("  PASS: product-detail.js logic verified for all requirements!");

console.log("\n==================================================");
console.log("ALL TESTS PASSED! 100% VERIFIED.");
console.log("==================================================");
