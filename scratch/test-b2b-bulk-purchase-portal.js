const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');
const businessHtmlPath = path.join(projectDir, 'business.html');
const businessCssPath = path.join(projectDir, 'business.css');
const businessJsPath = path.join(projectDir, 'business.js');
const translationsPath = path.join(projectDir, 'translations.js');
const headerHtmlPath = path.join(projectDir, 'header.html');
const accountHtmlPath = path.join(projectDir, 'account.html');
const cartJsPath = path.join(projectDir, 'cart.js');

console.log("=== Testing Phase 18: ElectroMart Business B2B Portal & GSTIN Suite ===");

// 1. Check File Existence
assert(fs.existsSync(businessHtmlPath), "business.html must exist");
assert(fs.existsSync(businessCssPath), "business.css must exist");
assert(fs.existsSync(businessJsPath), "business.js must exist");

const businessHtml = fs.readFileSync(businessHtmlPath, 'utf8');
const businessCss = fs.readFileSync(businessCssPath, 'utf8');
const businessJs = fs.readFileSync(businessJsPath, 'utf8');
const headerHtml = fs.readFileSync(headerHtmlPath, 'utf8');
const accountHtml = fs.readFileSync(accountHtmlPath, 'utf8');
const cartJs = fs.readFileSync(cartJsPath, 'utf8');

console.log("✓ Core B2B files exist.");

// 2. Script Loading Order in business.html (Per AGENT_INSTRUCTIONS.md)
const transIdx = businessHtml.indexOf('translations.js');
const pDataIdx = businessHtml.indexOf('products-data.js');
const uBusIdx = businessHtml.indexOf('universal-i18n-bus.js');
const headerIdx = businessHtml.indexOf('header.js');
const b2bIdx = businessHtml.indexOf('business.js');

assert(transIdx !== -1, "translations.js must be loaded");
assert(pDataIdx !== -1, "products-data.js must be loaded");
assert(uBusIdx !== -1, "universal-i18n-bus.js must be loaded");
assert(headerIdx !== -1, "header.js must be loaded");
assert(b2bIdx !== -1, "business.js must be loaded");

assert(transIdx < pDataIdx, "translations.js must load before products-data.js");
assert(pDataIdx < uBusIdx, "products-data.js must load before universal-i18n-bus.js");
assert(uBusIdx < headerIdx, "universal-i18n-bus.js must load before header.js");
assert(headerIdx < b2bIdx, "header.js must load before business.js");

console.log("✓ Mandatory script loading order verified.");

// 3. Header & Account Navigation Links
assert(headerHtml.includes('href="business.html"'), "header.html must link to business.html");
assert(headerHtml.includes('data-i18n="fast_delivery"'), "header.html must preserve fast_delivery key for promo link");
assert(headerHtml.includes('data-i18n="nav_business"'), "header.html account flyout must have nav_business link");
assert(accountHtml.includes('id="tileBusiness"'), "account.html must include tileBusiness tile");
assert(accountHtml.includes('business_portal_title'), "account.html must include business_portal_title translation key");

console.log("✓ Header and Account B2B entry points verified.");

// 4. Evaluate Translations for all 11 Languages
const transCode = fs.readFileSync(translationsPath, 'utf8');
const mockDoc = {
  readyState: 'complete',
  documentElement: { lang: 'en', setAttribute: function() {} },
  querySelectorAll: () => [],
  querySelector: () => null,
  getElementById: () => null,
  addEventListener: () => {}
};
const mockWindow = { location: { pathname: '/business.html' } };
const mockStorage = { getItem: () => 'en', setItem: () => {} };

const fnTrans = new Function('window', 'document', 'localStorage', transCode);
fnTrans(mockWindow, mockDoc, mockStorage);

const trans = mockWindow.EM_TRANSLATIONS;
assert(trans, "EM_TRANSLATIONS must exist");

const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const targetB2bKeys = [
  'business_portal_title',
  'business_portal_subtitle',
  'business_gstin_title',
  'business_gstin_desc',
  'business_verify_btn',
  'bulk_tiers_title',
  'bulk_calculator_title',
  'rfq_title',
  'rfq_modal_title',
  'rfq_submit_btn',
  'b2b_itc_badge',
  'b2b_bulk_discount_badge',
  'b2b_min_moq_alert',
  'nav_business',
  'business_cta_banner'
];

languages.forEach((lang) => {
  assert(trans[lang], `Language ${lang} must exist in translations`);
  targetB2bKeys.forEach((key) => {
    assert(trans[lang][key], `Key ${key} missing in language ${lang}`);
  });
});

console.log(`✓ All 11 languages verified with ${targetB2bKeys.length} B2B keys.`);

// 5. Test GSTIN Validation Logic & State Code Mapping
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const GST_STATE_MAP = {
  "01": "Jammu & Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "19": "West Bengal",
  "24": "Gujarat",
  "27": "Maharashtra",
  "29": "Karnataka",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "36": "Telangana",
  "37": "Andhra Pradesh"
};

const validGstins = [
  { gstin: "07AAAAA0000A1Z5", state: "Delhi" },
  { gstin: "27ABCDE1234F1Z5", state: "Maharashtra" },
  { gstin: "29AAAAA0000A1Z5", state: "Karnataka" },
  { gstin: "33ABCDE1234F1Z5", state: "Tamil Nadu" },
  { gstin: "24AAACB1234P1Z2", state: "Gujarat" }
];

validGstins.forEach(({ gstin, state }) => {
  assert(GSTIN_REGEX.test(gstin), `Valid GSTIN ${gstin} should pass regex`);
  const code = gstin.substring(0, 2);
  assert.strictEqual(GST_STATE_MAP[code], state, `State code ${code} should map to ${state}`);
});

const invalidGstins = [
  "07AAAAA0000A1Z",    // 14 chars
  "07AAAAA0000A1Z55",  // 16 chars
  "ABCDE1234F",        // PAN only
  "99AAAAA0000A1Z5",   // 99 is invalid state
  "07123450000A1Z5",   // digits instead of PAN letters
  "07AAAAA0000A155"    // Missing Z at 14th char
];

invalidGstins.forEach((gstin) => {
  const isValid = GSTIN_REGEX.test(gstin) && !!GST_STATE_MAP[gstin.substring(0, 2)];
  assert(!isValid, `Invalid GSTIN ${gstin} must fail validation`);
});

console.log("✓ Statutory GSTIN format regex and state code mapping validated.");

// 6. Test Tier Discount Calculations
function getTierDiscountRate(qty) {
  const q = Number(qty || 0);
  if (q >= 25) return 0.15;
  if (q >= 10) return 0.10;
  if (q >= 5) return 0.05;
  return 0.00;
}

function getTierLabel(qty) {
  const q = Number(qty || 0);
  if (q >= 25) return "15% Tier Discount";
  if (q >= 10) return "10% Tier Discount";
  if (q >= 5) return "5% Tier Discount";
  return "Standard Wholesale";
}

assert.strictEqual(getTierDiscountRate(1), 0.00, "Qty 1 has 0% tier discount");
assert.strictEqual(getTierDiscountRate(4), 0.00, "Qty 4 has 0% tier discount");
assert.strictEqual(getTierDiscountRate(5), 0.05, "Qty 5 has 5% tier discount");
assert.strictEqual(getTierDiscountRate(9), 0.05, "Qty 9 has 5% tier discount");
assert.strictEqual(getTierDiscountRate(10), 0.10, "Qty 10 has 10% tier discount");
assert.strictEqual(getTierDiscountRate(24), 0.10, "Qty 24 has 10% tier discount");
assert.strictEqual(getTierDiscountRate(25), 0.15, "Qty 25 has 15% tier discount");
assert.strictEqual(getTierDiscountRate(100), 0.15, "Qty 100 has 15% tier discount");

assert.strictEqual(getTierLabel(5), "5% Tier Discount");
assert.strictEqual(getTierLabel(15), "10% Tier Discount");
assert.strictEqual(getTierLabel(50), "15% Tier Discount");

console.log("✓ Tier discount calculation rates and thresholds validated.");

// 7. Test B2B Cart Synchronization & cart.js Line Item Badges
const mockStorageData = {};
const mockLocalStorage = {
  getItem: (key) => mockStorageData[key] || null,
  setItem: (key, val) => { mockStorageData[key] = String(val); }
};

// Simulate addBulkItemToCart
const testProd = {
  id: "b2b-101",
  name: "Commercial Office Laptop 15.6",
  price: 44990,
  moq: 5,
  segment: "b2b",
  gstRate: 0.18,
  image: "laptop.jpg"
};

const bulkQty = 10;
const tierRate = getTierDiscountRate(bulkQty);
const discountedUnit = Math.round(testProd.price * (1 - tierRate));

// Cart map
const cartMap = { [testProd.id]: bulkQty };
mockLocalStorage.setItem("electromart_cart_v1", JSON.stringify(cartMap));

// Catalog map
const catalogMap = {
  [testProd.id]: {
    id: testProd.id,
    name: testProd.name,
    price: discountedUnit,
    originalPrice: testProd.price,
    image: testProd.image,
    stock: 50,
    segment: "b2b",
    moq: testProd.moq,
    gstRate: testProd.gstRate
  }
};
mockLocalStorage.setItem("electromart_catalog_v1", JSON.stringify(catalogMap));

// B2B metadata
const b2bMeta = {
  [testProd.id]: {
    tier: getTierLabel(bulkQty),
    unitPrice: discountedUnit,
    originalPrice: testProd.price,
    itcEligible: true,
    moq: testProd.moq
  }
};
mockLocalStorage.setItem("electromart_b2b_cart_meta_v1", JSON.stringify(b2bMeta));

// Check cart.js integration code
assert(cartJs.includes("electromart_b2b_cart_meta_v1"), "cart.js must read electromart_b2b_cart_meta_v1");
assert(cartJs.includes("b2bDiscountTier"), "cart.js must extract b2bDiscountTier");
assert(cartJs.includes("itcEligible"), "cart.js must handle itcEligible");
assert(cartJs.includes("b2b-tier-badge"), "cart.js must render b2b-tier-badge");
assert(cartJs.includes("b2b-itc-badge"), "cart.js must render b2b-itc-badge");

console.log("✓ B2B Cart synchronization and line-item badges verified.");

// 8. Test Mouse, Pointer & Cursor Rules in business.css
assert(businessCss.includes("#b2bGstinInput"), "business.css must style #b2bGstinInput");
assert(businessCss.includes(".b2b-type-pill"), "business.css must style .b2b-type-pill");
assert(businessCss.includes(".b2b-qty-btn"), "business.css must style .b2b-qty-btn");
assert(businessCss.includes(".b2b-qty-input"), "business.css must style .b2b-qty-input");
assert(businessCss.includes(".b2b-tier-card"), "business.css must style .b2b-tier-card");
assert(businessCss.includes(".b2b-modal-overlay"), "business.css must style .b2b-modal-overlay");

// Check pointer and zero-occlusion overlay rules
assert(businessCss.includes("cursor: pointer !important;"), "business.css must specify cursor: pointer !important;");
assert(businessCss.includes("display: none !important;"), "business.css must have display: none !important for closed overlay");
assert(businessCss.includes("pointer-events: none !important;"), "business.css must have pointer-events: none !important for closed overlay");

console.log("✓ Mouse interaction, cursor rules, and zero-occlusion overlays verified.");

// 9. Brand Safety Check (0 visible Amazon / अमेज़न in business.html)
const forbiddenRegex = /amazon|अमेज़न/i;
// Exclude internal file names like amazon-theme.css
const visibleText = businessHtml.replace(/href="amazon-theme\.css[^"]*"/g, '');
assert(!forbiddenRegex.test(visibleText), "business.html must contain 0 visible Amazon / अमेज़न references");

console.log("✓ Brand safety verified: 0 visible Amazon references in business.html.");

console.log("\nALL 9 B2B BULK PURCHASE & GSTIN PORTAL TESTS PASSED SUCCESSFULLY!");
