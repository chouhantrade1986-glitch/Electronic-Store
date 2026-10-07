const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');
const transCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
const headerJs = fs.readFileSync(path.join(projectDir, 'header.js'), 'utf8');
const scriptJs = fs.readFileSync(path.join(projectDir, 'script.js'), 'utf8');
const pdHtml = fs.readFileSync(path.join(projectDir, 'product-detail.html'), 'utf8');
const pdJs = fs.readFileSync(path.join(projectDir, 'product-detail.js'), 'utf8');

console.log("=== Testing Mega i18n Fixes (Flyout, Subcat Drawer, Hero, Product Detail) ===");

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

// A. Flyout keys verification
const flyoutKeys = [
  "nav.yourLists", "nav.createWishlist", "nav.wishAnyWebsite", "nav.yourSavedItems",
  "nav.discoverStyle", "nav.exploreShowroom", "footer.wishlist", "nav.yourRecommendations",
  "dept.pcBuilder", "footer.faq", "footer.yourAccount", "nav.orders", "category.customerService"
];

languages.forEach(lang => {
  flyoutKeys.forEach(key => {
    assert(trans[lang][key], `Flyout key "${key}" must exist in language "${lang}"`);
  });
});
console.log(`PASS: All ${flyoutKeys.length} flyout keys exist across all 11 languages!`);

// Exact Hindi strings for Flyout
assert.strictEqual(trans.hi["nav.yourLists"], "आपकी सूचियां");
assert.strictEqual(trans.hi["nav.createWishlist"], "विशलिस्ट बनाएं");
assert.strictEqual(trans.hi["nav.wishAnyWebsite"], "यूनिवर्सल विशलिस्ट");
assert.strictEqual(trans.hi["nav.yourSavedItems"], "सहेजे गए आइटम");
assert.strictEqual(trans.hi["nav.discoverStyle"], "डिस्कवर स्टाइल");
assert.strictEqual(trans.hi["nav.exploreShowroom"], "शोरूम एक्सप्लोर करें");
assert.strictEqual(trans.hi["footer.wishlist"], "आपकी विशलिस्ट");
assert.strictEqual(trans.hi["nav.yourRecommendations"], "आपकी सिफारिशें");
assert.strictEqual(trans.hi["dept.pcBuilder"], "पीसी बिल्डर");
assert.strictEqual(trans.hi["footer.faq"], "अक्सर पूछे जाने वाले प्रश्न (FAQ)");
console.log("PASS: Exact Hindi flyout menu strings match user specifications verbatim");

// B. Subcategory drawer keys verification
const subcatKeys = [
  "subcat_motherboard", "subcat_ram", "subcat_cpu", "subcat_gpu", "subcat_smps",
  "subcat_cabinet", "subcat_cooling", "subcat_pc_tool", "subcat_all_components"
];

languages.forEach(lang => {
  subcatKeys.forEach(key => {
    assert(trans[lang][key], `Subcat key "${key}" must exist in language "${lang}"`);
  });
});
console.log(`PASS: All ${subcatKeys.length} subcategory keys exist across all 11 languages!`);

// Exact Hindi strings for Subcategory drawer
assert.strictEqual(trans.hi.subcat_motherboard, "मदरबोर्ड");
assert.strictEqual(trans.hi.subcat_ram, "डेस्कटॉप रैम / मेमोरी");
assert.strictEqual(trans.hi.subcat_cpu, "सीपीयू / प्रोसेसर");
assert.strictEqual(trans.hi.subcat_gpu, "ग्राफिक्स कार्ड / जीपीयू");
assert.strictEqual(trans.hi.subcat_smps, "पावर सप्लाई / एसएमपीएस");
assert.strictEqual(trans.hi.subcat_cabinet, "कैबिनेट / पीसी केस");
assert.strictEqual(trans.hi.subcat_cooling, "कैबिनेट फैन और कूलिंग");
assert.strictEqual(trans.hi.subcat_pc_tool, "पीसी बिल्डर टूल");
assert.strictEqual(trans.hi.subcat_all_components, "पीसी कंपोनेंट्स में सभी देखें");
console.log("PASS: Exact Hindi subcategory strings match user specifications verbatim");

// C. Product Detail keys verification
const pdKeys = [
  "brand_label", "visit_store_prefix", "ratings_label", "about_item", "related_products",
  "offers_benefits", "bank_offer", "no_cost_emi", "exchange_offer", "partner_offer",
  "delivery_returns_services", "warranty_label", "seller_label", "customer_reviews_title",
  "questions_answers", "product_information", "save_to_wishlist", "back_to_products",
  "secure_transaction"
];

languages.forEach(lang => {
  pdKeys.forEach(key => {
    assert(trans[lang][key], `Product detail key "${key}" must exist in language "${lang}"`);
  });
});
console.log(`PASS: All ${pdKeys.length} product detail keys exist across all 11 languages!`);

// Exact Hindi strings for Product Detail
assert.strictEqual(trans.hi.brand_label, "ब्रांड:");
assert.strictEqual(trans.hi.visit_store_prefix, "स्टोर पर जाएं");
assert.strictEqual(trans.hi.ratings_label, "रेटिंग");
assert.strictEqual(trans.hi.about_item, "इस उत्पाद के बारे में");
assert.strictEqual(trans.hi.related_products, "संबंधित उत्पाद");
assert.strictEqual(trans.hi.offers_benefits, "ऑफ़र और लाभ");
assert.strictEqual(trans.hi.bank_offer, "बैंक ऑफ़र");
assert.strictEqual(trans.hi.no_cost_emi, "नो कॉस्ट ईएमआई");
assert.strictEqual(trans.hi.exchange_offer, "एक्सचेंज ऑफ़र");
assert.strictEqual(trans.hi.partner_offer, "पार्टनर ऑफ़र");
assert.strictEqual(trans.hi.delivery_returns_services, "डिलीवरी, रिटर्न और सेवाएं");
assert.strictEqual(trans.hi.warranty_label, "वारंटी");
assert.strictEqual(trans.hi.seller_label, "विक्रेता");
assert.strictEqual(trans.hi.customer_reviews_title, "ग्राहक समीक्षाएं");
assert.strictEqual(trans.hi.questions_answers, "प्रश्न और उत्तर");
assert.strictEqual(trans.hi.product_information, "उत्पाद जानकारी");
assert.strictEqual(trans.hi.save_to_wishlist, "विशलिस्ट में सहेजें");
assert.strictEqual(trans.hi.back_to_products, "उत्पादों पर वापस जाएं");
assert.strictEqual(trans.hi.secure_transaction, "सुरक्षित लेन-देन");
console.log("PASS: Exact Hindi product detail strings match user specifications verbatim");

// D. Header.js Subcategory drawer logic
assert(headerJs.includes('subcat_motherboard'), "header.js references subcat_motherboard");
assert(headerJs.includes('subcat_ram'), "header.js references subcat_ram");
assert(headerJs.includes('function getLocalizedNavText'), "header.js defines getLocalizedNavText");
console.log("PASS: header.js subcategory keys and getLocalizedNavText helper verified");

// E. Script.js t(key) fallback & Hero carousel localization
assert(!scriptJs.includes('|| key;'), "script.js does not fall back to raw dot-keys");
assert(scriptJs.includes('hero_creator_title'), "script.js references hero_creator_title");
assert(scriptJs.includes('deals_fast_checkout'), "script.js references deals_fast_checkout");
console.log("PASS: script.js fallback safety and hero carousel localization verified");

// F. Product detail HTML & JS bindings
assert(pdHtml.includes('data-i18n="about_item"'), "product-detail.html has about_item");
assert(pdHtml.includes('data-i18n="add_to_cart"'), "product-detail.html has add_to_cart");
assert(pdHtml.includes('data-i18n="save_to_wishlist"'), "product-detail.html has save_to_wishlist");
assert(pdHtml.includes('data-i18n="buy_now"'), "product-detail.html has buy_now");
assert(pdHtml.includes('data-i18n="back_to_products"'), "product-detail.html has back_to_products");
assert(pdHtml.includes('data-i18n="offers_benefits"'), "product-detail.html has offers_benefits");
assert(pdHtml.includes('data-i18n="delivery_returns_services"'), "product-detail.html has delivery_returns_services");
assert(pdHtml.includes('data-i18n="customer_reviews_title"'), "product-detail.html has customer_reviews_title");
assert(pdHtml.includes('data-i18n="questions_answers"'), "product-detail.html has questions_answers");
assert(pdHtml.includes('data-i18n="product_information"'), "product-detail.html has product_information");

assert(pdJs.includes('window.renderProductDetailPage'), "product-detail.js exports renderProductDetailPage");
console.log("PASS: product-detail.html & product-detail.js localization attributes and hooks verified");

console.log("\nALL MEGA I18N FIXES TESTS PASSED (100%)!");
