const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');
const transCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
const tdHtml = fs.readFileSync(path.join(projectDir, 'todays-deals.html'), 'utf8');
const tdJs = fs.readFileSync(path.join(projectDir, 'todays-deals.js'), 'utf8');

console.log("=== Testing Today's Deals Page i18n & Dynamic Deal Card Localization ===");

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
const tdKeys = [
  'limited_time_offers', 'deals_subheading', 'daily_refresh', 'top_categories',
  'fast_checkout', 'deal_tip_title', 'deal_tip_desc', 'best_deals_today',
  'showing_deals', 'limited_time_deal_badge', 'ends_in', 'claimed',
  'grab_before_refresh', 'free_delivery_pincode', 'sort_relevance', 'sort_highest_discount',
  'under_500', 'price_10000_above'
];

languages.forEach(lang => {
  assert(trans[lang], `Language ${lang} must exist`);
  tdKeys.forEach(key => {
    assert(trans[lang][key], `Key "${key}" must exist in language "${lang}"`);
  });
});
console.log(`PASS: All ${tdKeys.length} Today's Deals keys exist across all 11 languages!`);

// 2. Exact Hindi strings requested by user
assert.strictEqual(trans.hi.limited_time_offers, "सीमित समय के ऑफर");
assert.strictEqual(trans.hi.deals_subheading, "अवधि समाप्त होने से पहले शीर्ष इलेक्ट्रॉनिक्स पर फ्लैश छूट पाएं.");
assert.strictEqual(trans.hi.daily_refresh, "दैनिक रिफ्रेश");
assert.strictEqual(trans.hi.top_categories, "शीर्ष श्रेणियां");
assert.strictEqual(trans.hi.fast_checkout, "तेज़ चेकआउट");
assert.strictEqual(trans.hi.deal_tip_title, "डील टिप");
assert.strictEqual(trans.hi.deal_tip_desc, "स्टॉक खत्म होने से पहले प्रोडक्ट विवरण देखें और तुरंत चेकआउट करें.");
assert.strictEqual(trans.hi.best_deals_today, "आज की सर्वश्रेष्ठ डील्स");
assert.strictEqual(trans.hi.showing_deals, "डील्स दिखाई जा रही हैं");
assert.strictEqual(trans.hi.limited_time_deal_badge, "सीमित समय की डील");
assert.strictEqual(trans.hi.ends_in, "समाप्त होने में:");
assert.strictEqual(trans.hi.claimed, "दावा किया गया");
assert.strictEqual(trans.hi.grab_before_refresh, "अगले रिफ्रेश से पहले पाएं.");
assert.strictEqual(trans.hi.free_delivery_pincode, "पात्र पिनकोड पर कल तक मुफ़्त डिलीवरी");
assert.strictEqual(trans.hi.sort_relevance, "क्रमबद्ध: प्रासंगिकता");
assert.strictEqual(trans.hi.sort_highest_discount, "सर्वाधिक छूट");
console.log("PASS: Exact Hindi strings match user specification verbatim");

// 3. Check HTML tags in todays-deals.html
const requiredHtmlTags = [
  'data-i18n="limited_time_offers"',
  'data-i18n="deals_subheading"',
  'data-i18n="daily_refresh"',
  'data-i18n="top_categories"',
  'data-i18n="fast_checkout"',
  'data-i18n="amazon_style_filters"',
  'data-i18n="under_500"',
  'data-i18n="price_10000_above"',
  'data-i18n="sort_relevance"',
  'data-i18n="sort_highest_discount"',
  'data-i18n="deal_tip_title"',
  'data-i18n="deal_tip_desc"',
  'data-i18n="best_deals_today"',
  'data-i18n="limited_time_pricing_note"'
];

requiredHtmlTags.forEach(tag => {
  assert(tdHtml.includes(tag), `todays-deals.html must include ${tag}`);
});
console.log(`PASS: All ${requiredHtmlTags.length} required HTML tags verified in todays-deals.html`);

// Check script order
const transIdx = tdHtml.indexOf('translations.js');
const dealsIdx = tdHtml.indexOf('todays-deals.js');
assert(transIdx !== -1 && dealsIdx !== -1 && transIdx < dealsIdx, "translations.js must be loaded before todays-deals.js");
console.log("PASS: Script loading order verified (translations.js loads before todays-deals.js)");

// 4. Test dynamic deal card rendering in Hindi
const mockDeal = {
  id: 1,
  name: "AstraBook Pro 14",
  brand: "AstraTech",
  category: "laptop",
  oldPrice: 1149,
  dealPrice: 999,
  image: "test.jpg"
};

const cardFn = new Function(
  'item', 'escapeHtml', 'money', 'discountPercent', 'getDealBadge',
  'getDealExpiry', 'getDealProgress', 'getDealRating', 'renderStars',
  'formatCountdown', 'getPrimeTag', 'encodeURIComponent', 'localStorage', 'window',
  `
  ${tdJs.match(/function dealCard\(item\) \{[\s\S]*?\n\}/)[0]}
  return dealCard(item);
  `
);

const cardHtmlHi = cardFn(
  mockDeal,
  x => x,
  p => `₹${p}`,
  () => 15,
  () => ({ label: "Best Seller", class: "badge-best" }),
  () => Date.now() + 100000,
  () => 65,
  () => ({ rating: "4.6", reviews: 102 }),
  () => "★★★★☆",
  () => "5h 20m",
  () => '<span class="prime-tag">Prime</span>',
  encodeURIComponent,
  { getItem: () => "hi" },
  mockWindow
);

assert(cardHtmlHi.includes("सीमित समय की डील"), "Deal card must include Hindi 'सीमित समय की डील'");
assert(cardHtmlHi.includes("द्वारा AstraTech"), "Deal card must include Hindi 'द्वारा AstraTech'");
assert(cardHtmlHi.includes("समाप्त होने में:"), "Deal card must include Hindi 'समाप्त होने में:'");
assert(cardHtmlHi.includes("दावा किया गया"), "Deal card must include Hindi 'दावा किया गया'");
assert(cardHtmlHi.includes("अगले रिफ्रेश से पहले पाएं."), "Deal card must include Hindi 'अगले रिफ्रेश से पहले पाएं.'");
assert(cardHtmlHi.includes("पात्र पिनकोड पर कल तक मुफ़्त डिलीवरी"), "Deal card must include Hindi 'पात्र पिनकोड पर कल तक मुफ़्त डिलीवरी'");
assert(cardHtmlHi.includes("कार्ट में जोड़ें"), "Deal card must include Hindi 'कार्ट में जोड़ें'");
assert(cardHtmlHi.includes("विवरण देखें"), "Deal card must include Hindi 'विवरण देखें'");
assert(cardHtmlHi.includes("बेस्ट सेलर"), "Deal card must include Hindi 'बेस्ट सेलर' badge");
console.log("PASS: Dynamic dealCard in Hindi renders ALL authentic Hindi texts, badges, timer and buttons!");

// 5. Test translations.js hook for renderTodaysDeals
assert(transCode.includes('window.renderTodaysDeals'), "translations.js triggers renderTodaysDeals on language change");
assert(tdJs.includes('window.renderTodaysDeals'), "todays-deals.js exposes window.renderTodaysDeals");
console.log("PASS: translations.js hook for renderTodaysDeals verified");

console.log("\nALL TODAY'S DEALS I18N TESTS PASSED (100%)!");
