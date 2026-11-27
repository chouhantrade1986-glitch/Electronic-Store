/**
 * Phase 47: ElectroMart Dedicated Coupons & Promo Deals Hub Test Suite
 * scratch/test-amazon-coupons.js
 *
 * 8 Verification Layers:
 *  1. File Existence & Workspace Integrity
 *  2. Canonical Script Loading Sequence (8 scripts)
 *  3. DOM Structure & Accessibility Contracts (coupons.html)
 *  4. Amazon Coupons Hub Ticket & Clipping UI Styling (coupons.css)
 *  5. Coupons Catalog & Clipping Engine Logic (coupons.js)
 *  6. Server-Authoritative Discount Validation & Checkout Integration
 *  7. Brand Safety (0 third-party marketplace mentions)
 *  8. 11-Language i18n Translation Coverage (translations.js)
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectDir = path.join(__dirname, '..');
const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const requiredFiles = ['coupons.html', 'coupons.css', 'coupons.js'];

console.log('===============================================================');
console.log('TEST SUITE: ElectroMart Dedicated Coupons & Promo Deals Hub (Phase 47)');
console.log('===============================================================');

// Layer 1: Required files existence
requiredFiles.forEach((fileName) => {
  const filePath = path.join(projectDir, fileName);
  assert(fs.existsSync(filePath), `${fileName} must exist in project root`);
});
console.log('✓ Layer 1: File existence verified.');

// Layer 2: Canonical script order in coupons.html
const html = fs.readFileSync(path.join(projectDir, 'coupons.html'), 'utf8');
const expectedScripts = [
  'translations.js',
  'products-data.js',
  'universal-i18n-bus.js',
  'header.js',
  'menu-manager.js',
  'auth-state.js',
  'shared-search.js',
  'coupons.js'
];

let lastIdx = -1;
expectedScripts.forEach((scriptName) => {
  const idx = html.indexOf(`src="${scriptName}`);
  assert(idx !== -1, `coupons.html must load script ${scriptName}`);
  assert(idx > lastIdx, `Script ${scriptName} must load in canonical sequence`);
  lastIdx = idx;
});
console.log('✓ Layer 2: Canonical script loading sequence verified.');

// Layer 3: DOM elements in coupons.html
const requiredIds = [
  'headerContainer',
  'couponsHero',
  'couponsHeroTitle',
  'totalCouponsCount',
  'clippedCouponsStat',
  'clippedSummaryBanner',
  'clippedSummaryText',
  'btnClearAllClipped',
  'couponsSearchInput',
  'categoryPillsRow',
  'couponsGrid',
  'couponsEmptyState',
  'couponTermsModal',
  'btnCloseTermsModal',
  'couponToast'
];

requiredIds.forEach((id) => {
  assert(html.includes(`id="${id}"`), `coupons.html must contain element with id="${id}"`);
});
console.log('✓ Layer 3: Semantic DOM structure verified.');

// Layer 4: CSS tear-ticket & clipping styles
const css = fs.readFileSync(path.join(projectDir, 'coupons.css'), 'utf8');
assert(css.includes('.coupon-ticket'), 'coupons.css must style .coupon-ticket');
assert(css.includes('.coupon-tear-line'), 'coupons.css must style .coupon-tear-line for tear-ticket effect');
assert(css.includes('.btn-clip-coupon'), 'coupons.css must style .btn-clip-coupon');
assert(css.includes('.btn-clip-coupon.clipped'), 'coupons.css must style active clipped state');
assert(css.includes('.category-pill'), 'coupons.css must style category pills');
assert(css.includes('.clipped-summary-banner'), 'coupons.css must style clipped summary banner');
console.log('✓ Layer 4: Amazon Coupons Hub ticket & badge styling verified.');

// Layer 5: Coupons catalog & clipping logic
const jsCode = fs.readFileSync(path.join(projectDir, 'coupons.js'), 'utf8');

// Mock browser environment for coupons.js
const mockLocalStorage = {};
const mockWindow = {
  localStorage: {
    getItem: (k) => mockLocalStorage[k] || null,
    setItem: (k, v) => { mockLocalStorage[k] = String(v); },
    removeItem: (k) => { delete mockLocalStorage[k]; }
  },
  document: {
    readyState: 'complete',
    getElementById: () => null,
    addEventListener: () => {}
  }
};
mockWindow.window = mockWindow;
mockWindow.global = mockWindow;

const context = vm.createContext(mockWindow);
vm.runInContext(jsCode, context);

assert(mockWindow.ElectroMartCoupons, 'coupons.js must export ElectroMartCoupons on window');
const couponsApi = mockWindow.ElectroMartCoupons;

assert(Array.isArray(couponsApi.COUPONS_DATA), 'COUPONS_DATA must be an array');
assert(couponsApi.COUPONS_DATA.length >= 8, 'COUPONS_DATA must contain at least 8 coupons');

const save10 = couponsApi.COUPONS_DATA.find((c) => c.code === 'SAVE10');
assert(save10, 'SAVE10 coupon must exist in catalog');
assert.equal(save10.minSpend, 500, 'SAVE10 must have minSpend of 500');

// Test clipping toggle
assert.equal(couponsApi.isCouponClipped('SAVE10'), false);
const clipped = couponsApi.toggleCouponClip('SAVE10');
assert.equal(clipped, true);
assert.equal(couponsApi.isCouponClipped('SAVE10'), true);
assert.deepEqual(couponsApi.getClippedCoupons(), ['SAVE10']);

// Unclip
couponsApi.toggleCouponClip('SAVE10');
assert.equal(couponsApi.isCouponClipped('SAVE10'), false);
assert.deepEqual(couponsApi.getClippedCoupons(), []);

console.log('✓ Layer 5: Coupons catalog & clipping engine contracts verified.');

// Layer 6: Server-authoritative discount validation & checkout integration
const orderCommerce = require('../backend/src/lib/orderCommerce');
assert(orderCommerce.COUPONS.SAVE10, 'orderCommerce must contain SAVE10');
assert(orderCommerce.COUPONS.ELECTRO500, 'orderCommerce must contain ELECTRO500');
assert(typeof orderCommerce.listPublicCoupons === 'function', 'orderCommerce must export listPublicCoupons');

const publicCoupons = orderCommerce.listPublicCoupons();
assert(publicCoupons.length >= 8, 'orderCommerce public coupons must have at least 8 offers');

// Test server-side coupon evaluation
const validRes = orderCommerce.evaluateCoupon('SAVE10', 1000, 19);
assert.equal(validRes.valid, true);
assert.equal(validRes.amount, 100); // 10% of 1000

const belowMinRes = orderCommerce.evaluateCoupon('ELECTRO500', 2000, 19);
assert.equal(belowMinRes.valid, false, 'ELECTRO500 should be invalid below minSubtotal (5000)');

const checkoutJs = fs.readFileSync(path.join(projectDir, 'checkout.js'), 'utf8');
assert(checkoutJs.includes('electromart_clipped_coupons_v1'), 'checkout.js must inspect electromart_clipped_coupons_v1');
assert(checkoutJs.includes('ELECTRO500'), 'checkout.js must support ELECTRO500');

const orderRoutesJs = fs.readFileSync(path.join(projectDir, 'backend/src/routes/orderRoutes.js'), 'utf8');
assert(orderRoutesJs.includes('/coupons'), 'orderRoutes.js must expose /coupons endpoint');
assert(orderRoutesJs.includes('/coupons/validate'), 'orderRoutes.js must expose /coupons/validate endpoint');

console.log('✓ Layer 6: Server-authoritative discount validation & checkout integration verified.');

// Layer 7: Brand safety & legal compliance (visible text & user-facing attributes)
const FORBIDDEN_VISIBLE_BRAND_REGEX = /\b(amazon|amazons|flipkart|walmart)\b|अमेज़न|अमेजन|अमेजॉन/i;
const strippedHtml = html
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '');

const textMatches = strippedHtml.match(/>([^<]+)</g) || [];
textMatches.forEach((tm) => {
  const text = tm.slice(1, -1).trim();
  assert(!FORBIDDEN_VISIBLE_BRAND_REGEX.test(text), `coupons.html text node must NOT contain third-party brand: "${text}"`);
});

const attrRegex = /(?:alt|title|placeholder|aria-label)=["']([^"']+)["']/gi;
let m;
while ((m = attrRegex.exec(strippedHtml)) !== null) {
  assert(!FORBIDDEN_VISIBLE_BRAND_REGEX.test(m[1]), `coupons.html attribute must NOT contain third-party brand: "${m[1]}"`);
}
console.log('✓ Layer 7: Brand safety & legal compliance verified (100% ElectroMart).');

// Layer 8: 11-Language i18n coverage in translations.js
const translationsCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
assert(translationsCode.includes('ELECTROMART_COUPONS_I18N'), 'translations.js must contain ELECTROMART_COUPONS_I18N');
assert(translationsCode.includes('ELECTROMART_COUPONS_OVERRIDES'), 'translations.js must contain ELECTROMART_COUPONS_OVERRIDES');

languages.forEach((lang) => {
  assert(translationsCode.includes(`${lang}:`), `translations.js must have overrides for language "${lang}"`);
});
console.log('✓ Layer 8: 11-Language i18n coverage verified.');

console.log('\n===============================================================');
console.log('ALL 8 LAYERS PASSED: Phase 47 Coupons & Promo Hub 100% VERIFIED!');
console.log('===============================================================');
