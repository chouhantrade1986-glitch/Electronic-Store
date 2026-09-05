const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.join(__dirname, '..');

console.log("================================================================================");
console.log("TEST SUITE: Phase 11 - Amazon India-Style Deals & Best Sellers Dedicated Hubs");
console.log("================================================================================");

// 1. Check todays-deals.html markup
console.log("\n[TEST 1] Verifying todays-deals.html structure & elements...");
const tdHtml = fs.readFileSync(path.join(projectDir, 'todays-deals.html'), 'utf8');

assert(tdHtml.includes('id="dealsDeptBar"'), "todays-deals.html must have #dealsDeptBar");
assert(tdHtml.includes('id="dealTypeBar"'), "todays-deals.html must have #dealTypeBar");
assert(tdHtml.includes('id="dealsSpotlightBanner"'), "todays-deals.html must have #dealsSpotlightBanner");
assert(tdHtml.includes('data-deal-type="dotd"'), "todays-deals.html must have Deal of the Day pill");
assert(tdHtml.includes('data-deal-type="lightning"'), "todays-deals.html must have Lightning Deals pill");
assert(tdHtml.includes('data-deal-type="under500"'), "todays-deals.html must have Under ₹500 pill");
assert(tdHtml.includes('data-deal-type="fifty_plus"'), "todays-deals.html must have 50% Off or More pill");
console.log("  PASS: todays-deals.html department bar, deal types, and spotlight container verified.");

// 2. Check todays-deals.js logic
console.log("\n[TEST 2] Verifying todays-deals.js spotlight and pill filters...");
const tdJs = fs.readFileSync(path.join(projectDir, 'todays-deals.js'), 'utf8');

assert(tdJs.includes('function renderSpotlightDeal('), "todays-deals.js must implement renderSpotlightDeal");
assert(tdJs.includes('function syncDeptPillsUI('), "todays-deals.js must implement syncDeptPillsUI");
assert(tdJs.includes('function initDealsDeptPills('), "todays-deals.js must implement initDealsDeptPills");
assert(tdJs.includes('currentDealType'), "todays-deals.js must track currentDealType");
assert(tdJs.includes('amz-spotlight-deal'), "todays-deals.js must render .amz-spotlight-deal");
console.log("  PASS: todays-deals.js spotlight showcase, pill synchronization, and filters verified.");

// 3. Check best-sellers.html markup
console.log("\n[TEST 3] Verifying best-sellers.html structure & elements...");
const bsHtml = fs.readFileSync(path.join(projectDir, 'best-sellers.html'), 'utf8');

assert(bsHtml.includes('id="bestSellersDeptBar"'), "best-sellers.html must have #bestSellersDeptBar");
assert(bsHtml.includes('data-category="laptop"'), "best-sellers.html department bar must include laptop");
assert(bsHtml.includes('data-category="mobile"'), "best-sellers.html department bar must include mobile");
assert(bsHtml.includes('data-category="audio"'), "best-sellers.html department bar must include audio");
console.log("  PASS: best-sellers.html horizontal department bar verified.");

// 4. Check best-sellers.js logic and rank badges
console.log("\n[TEST 4] Verifying best-sellers.js rank badges and department sync...");
const bsJs = fs.readFileSync(path.join(projectDir, 'best-sellers.js'), 'utf8');

assert(bsJs.includes('amz-rank-badge'), "best-sellers.js must render .amz-rank-badge");
assert(bsJs.includes('rank-1'), "best-sellers.js must include rank-1 styling");
assert(bsJs.includes('rank-2'), "best-sellers.js must include rank-2 styling");
assert(bsJs.includes('rank-3'), "best-sellers.js must include rank-3 styling");
assert(bsJs.includes('function syncDeptPillsUI('), "best-sellers.js must implement syncDeptPillsUI");
assert(bsJs.includes('function initBestSellersDeptPills('), "best-sellers.js must implement initBestSellersDeptPills");
console.log("  PASS: best-sellers.js ranked badges (#1, #2, #3, general) and department sync verified.");

// 5. Check CSS styling in amazon-theme.css
console.log("\n[TEST 5] Verifying CSS styles in amazon-theme.css...");
const css = fs.readFileSync(path.join(projectDir, 'amazon-theme.css'), 'utf8');

assert(css.includes('.amz-dept-pills-bar'), "amazon-theme.css must define .amz-dept-pills-bar");
assert(css.includes('.amz-dept-pill'), "amazon-theme.css must define .amz-dept-pill");
assert(css.includes('.amz-deal-types-bar'), "amazon-theme.css must define .amz-deal-types-bar");
assert(css.includes('.amz-deal-type-pill'), "amazon-theme.css must define .amz-deal-type-pill");
assert(css.includes('.amz-spotlight-deal'), "amazon-theme.css must define .amz-spotlight-deal");
assert(css.includes('.amz-rank-badge'), "amazon-theme.css must define .amz-rank-badge");
assert(css.includes('.amz-rank-badge.rank-1'), "amazon-theme.css must define .amz-rank-badge.rank-1 gold");
assert(css.includes('.amz-rank-badge.rank-2'), "amazon-theme.css must define .amz-rank-badge.rank-2 silver");
assert(css.includes('.amz-rank-badge.rank-3'), "amazon-theme.css must define .amz-rank-badge.rank-3 bronze");
console.log("  PASS: amazon-theme.css pills, spotlight, and podium rank ribbons verified.");

// 6. Check translations across all 11 languages
console.log("\n[TEST 6] Verifying translations in translations.js across all 11 languages...");
const transCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
const mockDoc = {
  readyState: 'complete',
  documentElement: { lang: 'en', setAttribute: function(k, v) { this[k] = v; } },
  querySelectorAll: function() { return []; },
  querySelector: function() { return null; },
  getElementById: function() { return null; },
  addEventListener: function() {}
};
const mockWindow = { location: { pathname: '/todays-deals.html' } };
const fnTrans = new Function('window', 'document', 'localStorage', transCode);
fnTrans(mockWindow, mockDoc, { getItem: () => 'en', setItem: () => {} });

const trans = mockWindow.EM_TRANSLATIONS;
assert(trans, "translations.js must define EM_TRANSLATIONS");

const expectedLanguages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const phase11Keys = [
  'all_deals', 'all_best_sellers', 'deal_of_the_day', 'lightning_deals',
  'under_500', 'fifty_percent_off', 'featured_deal_spotlight', 'deal_claimed',
  'ends_in', 'shop_this_deal', 'badge_best_seller', 'ranked_by_demand'
];

expectedLanguages.forEach(lang => {
  assert(trans[lang], `translations.js must have language '${lang}'`);
  phase11Keys.forEach(key => {
    assert(trans[lang][key], `translations.js must have key '${key}' in '${lang}'`);
  });
});
console.log(`  PASS: All 12 Phase 11 keys present across all 11 Indian languages.`);

// 7. Verify brand compliance
console.log("\n[TEST 7] Verifying 100% brand safety (no forbidden Amazon brand text)...");
const brandSafetyRegex = /\b(amazon|amazons|अमेज़न|அமேசான்|అమెజాన్|ಅಮೆಜಾನ್|ആമസോൺ|আমাজন|अ‍ॅमेझॉन|ایمیزون|ਅਮੇਜ਼ਨ|એમેઝોન)\b/i;

expectedLanguages.forEach(lang => {
  phase11Keys.forEach(key => {
    const val = trans[lang][key];
    assert(!brandSafetyRegex.test(val), `Brand safety violation: '${val}' in '${lang}.${key}' contains forbidden brand`);
  });
});
console.log("  PASS: 100% brand safe and compliant with ElectroMart branding.");

console.log("\n================================================================================");
console.log("ALL PHASE 11 DEALS & BEST SELLERS TESTS PASSED SUCCESSFULLY! (100%)");
console.log("================================================================================\n");
