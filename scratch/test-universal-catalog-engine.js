const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

const repoRoot = "C:\\Users\\Admin\\Documents\\GitHub\\Electronic-Store";

console.log("==================================================");
console.log("TEST SUITE: Universal Multilingual Catalog Engine");
console.log("==================================================");

// Mock DOM & window
const mockDoc = {
  readyState: 'complete',
  addEventListener: () => {},
  querySelectorAll: () => [],
  getElementById: () => null,
  querySelector: () => null,
  documentElement: { setAttribute: () => {} },
  title: ""
};

const mockWindow = {
  location: { pathname: 'product-detail.html' },
  document: mockDoc,
  localStorage: {
    getItem: (k) => 'hi',
    setItem: () => {}
  },
  addEventListener: () => {}
};

const sandbox = {
  window: mockWindow,
  document: mockDoc,
  localStorage: mockWindow.localStorage,
  navigator: {},
  setTimeout: () => {},
  console: console
};

vm.createContext(sandbox);

// 1. Load translations.js
console.log("\n[TEST 1] Loading translations.js...");
const transCode = fs.readFileSync(path.join(repoRoot, 'translations.js'), 'utf8');
vm.runInContext(transCode, sandbox);
assert(sandbox.window.EM_TRANSLATIONS, "EM_TRANSLATIONS must exist");
console.log("  PASS: translations.js loaded successfully.");

// 2. Load products-data.js
console.log("\n[TEST 2] Loading products-data.js & validating catalog model...");
const catalogCode = fs.readFileSync(path.join(repoRoot, 'products-data.js'), 'utf8');
vm.runInContext(catalogCode, sandbox);

assert(sandbox.window.EM_CATALOG, "EM_CATALOG must be exported");
assert(sandbox.window.EM_CATALOG_MAP, "EM_CATALOG_MAP must be exported");
assert(typeof sandbox.window.getLocalizedTitle === "function", "getLocalizedTitle must be a function");
assert(typeof sandbox.window.getLocalizedDescription === "function", "getLocalizedDescription must be a function");
assert(typeof sandbox.window.getLocalizedSpecs === "function", "getLocalizedSpecs must be a function");
assert(typeof sandbox.window.getLocalizedCategory === "function", "getLocalizedCategory must be a function");

// Verify Gap 1: Full Product Data Model Localization for Pantony & Apple MacBook
const pantony = sandbox.window.EM_CATALOG.find(p => p.id === "product_c5367fc4-ca38-9435-27dc-8d383b5faa59");
assert(pantony, "Pantony 6P Activity Tracker must exist in EM_CATALOG");
assert(pantony.title.hi.includes("पैंटोनी 6P एक्टिविटी ट्रैकर"), "Pantony title.hi must be in Hindi");
assert(pantony.description.hi.includes("हार्ट रेट"), "Pantony description.hi must be in Hindi");
assert(Array.isArray(pantony.aboutSpecs.hi) && pantony.aboutSpecs.hi[0].includes("मोबाइल और वियरेबल तकनीक"), "Pantony aboutSpecs.hi must be localized");

const pantonyTitleHi = sandbox.window.getLocalizedTitle(pantony, "hi");
assert.strictEqual(pantonyTitleHi, "पैंटोनी 6P एक्टिविटी ट्रैकर स्मार्टवॉच (हार्ट रेट और स्लीप मॉनिटरिंग)");

const pantonyDescHi = sandbox.window.getLocalizedDescription(pantony, "hi");
assert(pantonyDescHi.includes("हार्ट रेट, संपूर्ण स्लीप मॉनिटरिंग"), "Pantony description must resolve in Hindi");

const pantonySpecsHi = sandbox.window.getLocalizedSpecs(pantony, "hi");
assert(pantonySpecsHi.includes("मोबाइल और वियरेबल तकनीक - Android और iOS के साथ संगत"), "Pantony specs must resolve in Hindi");

const macbook = sandbox.window.EM_CATALOG.find(p => p.id === "2");
assert(macbook, "Apple MacBook Air must exist in EM_CATALOG");
const macTitleHi = sandbox.window.getLocalizedTitle(macbook, "hi");
assert(macTitleHi.includes("Apple 2026 मैकबुक एयर 13″ लैपटॉप M5 चिप के साथ"), "MacBook title must match user screenshot in Hindi");
assert(macTitleHi.includes("AI और Apple इंटेलिजेंस"), "MacBook title must include AI और Apple इंटेलिजेंस");

console.log("  PASS: Full product data model (title, description, aboutSpecs) verified for Pantony and MacBook!");

// 3. Verify Gap 2: Related Products localization
console.log("\n[TEST 3] Validating Related Products Shelf resolution...");
const related1 = sandbox.window.EM_CATALOG.find(p => p.name === "Smartphone Z Pixel Max 128GB Unlocked");
assert(related1, "Smartphone Z Pixel Max must exist");
const related1Hi = sandbox.window.getLocalizedTitle(related1, "hi");
assert(related1Hi.includes("स्मार्टफ़ोन Z पिक्सेल मैक्स"), "Related smartphone title must resolve in Hindi");

const related2 = sandbox.window.EM_CATALOG.find(p => p.name === "Corr Playtime 10.3″");
assert(related2, "Corr Playtime must exist");
const related2Hi = sandbox.window.getLocalizedTitle(related2, "hi");
assert(related2Hi.includes("कोर प्ले-टाइम 10.3″"), "Related Corr Playtime tablet must resolve in Hindi");

const related3 = sandbox.window.EM_CATALOG.find(p => p.name === "HV Virtual Reality System");
assert(related3, "HV Virtual Reality System must exist");
const related3Hi = sandbox.window.getLocalizedTitle(related3, "hi");
assert(related3Hi.includes("एचवी वर्चुअल Reality (VR) सिस्टम"), "Related HV VR System must resolve in Hindi");

console.log("  PASS: All related products resolve to authentic Hindi titles!");

// 4. Verify Gap 3 & 4: product-detail.js logic
console.log("\n[TEST 4] Checking product-detail.js logic & hooks...");
const prodDetailJs = fs.readFileSync(path.join(repoRoot, 'product-detail.js'), 'utf8');

assert(prodDetailJs.includes('function renderProductHeader('), "renderProductHeader function must be defined");
assert(prodDetailJs.includes('window.renderProductHeader = renderProductHeader;'), "renderProductHeader must be globally exported");
assert(prodDetailJs.includes('const localizedTitle = (window.getLocalizedTitle ? window.getLocalizedTitle(product, currentLang) : (product.title || product.name || "")).trim();'), "renderProduct must resolve localizedTitle");
assert(prodDetailJs.includes('const localizedDesc = (window.getLocalizedDescription ? window.getLocalizedDescription(product, currentLang) : "").trim();'), "renderProduct must resolve localizedDesc");
assert(prodDetailJs.includes('const localizedSpecs = window.getLocalizedSpecs ? window.getLocalizedSpecs(product, currentLang) : [];'), "renderProduct must resolve localizedSpecs");

// Check Frequently Bought Together bundle uses localized titles for both items
assert(prodDetailJs.includes('const mainTitle = (window.getLocalizedTitle ? window.getLocalizedTitle(product, currentLang) : product.name).trim();'), "Bundle must localize main product title");
assert(prodDetailJs.includes('const bundleItemTitle = (window.getLocalizedTitle ? window.getLocalizedTitle(bundleItem, currentLang) : bundleItem.name).trim();'), "Bundle must localize secondary product title");
assert(prodDetailJs.includes('class="this-item-title"'), "Bundle must have class='this-item-title'");
assert(prodDetailJs.includes('class="bundle-item-title"'), "Bundle must have class='bundle-item-title'");

// Check Related products uses getLocalizedTitle
assert(prodDetailJs.includes('const locTitle = (window.getLocalizedTitle ? window.getLocalizedTitle(item, currentLang) : (item.title || item.name || "")).trim();'), "renderRelatedProducts must use getLocalizedTitle");

// Check Category & Keywords localization in Table
assert(prodDetailJs.includes('window.getLocalizedCategory ? window.getLocalizedCategory(catFamily, currentLang) : ""'), "Table must use getLocalizedCategory");
assert(prodDetailJs.includes('"Mobile and Wearable Tech": t.kw_mobile_wearable || "मोबाइल और वियरेबल तकनीक"'), "Table must map Mobile and Wearable Tech keyword");

console.log("  PASS: product-detail.js contains all 4 gap fixes and hooks!");

// 5. Verify universal-i18n-bus.js
console.log("\n[TEST 5] Validating universal-i18n-bus.js...");
const busJs = fs.readFileSync(path.join(repoRoot, 'universal-i18n-bus.js'), 'utf8');
vm.runInContext(busJs, sandbox);
assert(typeof sandbox.window.applyGlobalThemeTranslation === "function", "applyGlobalThemeTranslation must be exported");
assert(busJs.includes('window.addEventListener("storage"'), "Bus must listen to storage event");
assert(busJs.includes('window.addEventListener("languageChanged"'), "Bus must listen to languageChanged event");
console.log("  PASS: universal-i18n-bus.js verified!");

// 6. Verify HTML script injection
console.log("\n[TEST 6] Checking script tags across HTML files...");
const htmlFiles = [
  'product-detail.html',
  'index.html',
  'products.html',
  'todays-deals.html',
  'best-sellers.html',
  'cart.html',
  'checkout.html',
  'orders.html',
  'account.html',
  'laptop.html',
  'printer.html'
];

htmlFiles.forEach(f => {
  const content = fs.readFileSync(path.join(repoRoot, f), 'utf8');
  assert(content.includes('products-data.js'), `${f} must include products-data.js`);
  assert(content.includes('universal-i18n-bus.js'), `${f} must include universal-i18n-bus.js`);
});
console.log("  PASS: All 11 HTML files include products-data.js and universal-i18n-bus.js!");

// 7. Verify Card Renderers
console.log("\n[TEST 7] Checking card renderers in products.js, todays-deals.js, best-sellers.js, cart.js...");
const productsJs = fs.readFileSync(path.join(repoRoot, 'products.js'), 'utf8');
assert(productsJs.includes('window.getLocalizedTitle ? window.getLocalizedTitle(product, currentLang) : product.name'), "products.js must use getLocalizedTitle");

const dealsJs = fs.readFileSync(path.join(repoRoot, 'todays-deals.js'), 'utf8');
assert(dealsJs.includes('window.getLocalizedTitle ? window.getLocalizedTitle(item, currentLang) : item.name'), "todays-deals.js must use getLocalizedTitle");

const bestSellersJs = fs.readFileSync(path.join(repoRoot, 'best-sellers.js'), 'utf8');
assert(bestSellersJs.includes('window.getLocalizedTitle ? window.getLocalizedTitle(item, lang) : item.name'), "best-sellers.js must use getLocalizedTitle");

const cartJs = fs.readFileSync(path.join(repoRoot, 'cart.js'), 'utf8');
assert(cartJs.includes('window.getLocalizedTitle ? window.getLocalizedTitle(row, currentLang) : row.name'), "cart.js must use getLocalizedTitle");

console.log("  PASS: All card and item renderers use window.getLocalizedTitle!");

console.log("\n==================================================");
console.log("ALL UNIVERSAL CATALOG ENGINE TESTS PASSED! 100%");
console.log("==================================================");
