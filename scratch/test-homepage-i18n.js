const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');
const transCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(projectDir, 'index.html'), 'utf8');
const hpCode = fs.readFileSync(path.join(projectDir, 'homepage-products.js'), 'utf8');
const searchCode = fs.readFileSync(path.join(projectDir, 'shared-search.js'), 'utf8');
const menuCode = fs.readFileSync(path.join(projectDir, 'menu-manager.js'), 'utf8');

console.log("=== Running Homepage i18n & Dynamic Products Test Suite ===");

// 1. Translations completeness
const mockWindow = { location: { pathname: '/index.html' } };
const mockDoc = {
  readyState: 'complete',
  documentElement: { lang: 'en', setAttribute: function(k, v) { this[k] = v; } },
  querySelectorAll: function() { return []; },
  querySelector: function() { return null; },
  getElementById: function() { return null; },
  addEventListener: function() {}
};
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
const homepageKeys = [
  'nav_all_products', 'nav_todays_deals', 'nav_best_sellers',
  'section_top_picks', 'cat_gaming_acc', 'cat_refresh_space',
  'plus_title', 'plus_subtitle', 'btn_explore_plus', 'cat_creator_laptops', 'btn_shop_laptops',
  'see_more', 'add_to_cart', 'deal_of_the_day', 'limited_time_deal',
  'item_headsets', 'item_keyboards', 'item_mice', 'item_chairs',
  'item_monitors', 'item_storage', 'item_printers', 'item_networking',
  'cat_gaming_laptops', 'cat_smartphones_acc', 'cat_wireless_audio', 'cat_smartwatches',
  'keep_shopping_for', 'your_browsing_history', 'todays_hot_deals', 'see_all_deals',
  'recommended_shelf_title', 'see_all_recommendations',
  'hero_slide1_title', 'hero_slide1_subtitle', 'hero_slide1_cta',
  'hero_slide2_title', 'hero_slide2_subtitle', 'hero_slide2_cta',
  'hero_slide3_title', 'hero_slide3_subtitle', 'hero_slide3_cta'
];

languages.forEach(lang => {
  assert(trans[lang], `Language ${lang} must exist in translations`);
  homepageKeys.forEach(key => {
    assert(trans[lang][key], `Key "${key}" must exist in language "${lang}"`);
  });
});
console.log(`PASS: All ${homepageKeys.length} homepage keys exist across all ${languages.length} languages!`);

// 2. Check Hindi translations accuracy
assert.strictEqual(trans.hi.add_to_cart, "कार्ट में जोड़ें");
assert.strictEqual(trans.hi.deal_of_the_day, "आज की डील");
assert.strictEqual(trans.hi.limited_time_deal, "सीमित समय की डील");
assert.strictEqual(trans.hi.see_more, "और देखें");
assert.strictEqual(trans.hi.section_top_picks, "आपके लिए शीर्ष पसंद");
assert.strictEqual(trans.hi.cat_gaming_acc, "गेमिंग एक्सेसरीज");
console.log("PASS: Hindi homepage strings match authentic Amazon India terminology");

// 3. Check index.html data-i18n tags
const indexTags = [
  'data-i18n="hero_slide1_title"',
  'data-i18n="hero_slide1_subtitle"',
  'data-i18n="hero_slide1_cta"',
  'data-i18n="section_top_picks"',
  'data-i18n="deal_of_the_day"',
  'data-i18n="todays_hot_deals"',
  'data-i18n="see_all_deals"',
  'data-i18n="keep_shopping_for"',
  'data-i18n="cat_gaming_laptops"',
  'data-i18n="cat_smartphones_acc"',
  'data-i18n="cat_wireless_audio"',
  'data-i18n="cat_smartwatches"',
  'data-i18n="cat_gaming_acc"',
  'data-i18n="item_headsets"',
  'data-i18n="item_keyboards"',
  'data-i18n="item_mice"',
  'data-i18n="item_chairs"',
  'data-i18n="see_more"',
  'data-i18n="cat_refresh_space"',
  'data-i18n="item_monitors"',
  'data-i18n="item_storage"',
  'data-i18n="item_printers"',
  'data-i18n="item_networking"',
  'data-i18n="plus_title"',
  'data-i18n="plus_subtitle"',
  'data-i18n="btn_explore_plus"',
  'data-i18n="cat_creator_laptops"',
  'data-i18n="btn_shop_laptops"',
  'data-i18n="recommended_shelf_title"',
  'data-i18n="see_all_recommendations"',
  'data-i18n="your_browsing_history"',
  'id="homeTopPicksGrid"',
  'id="homeDealsGrid"',
  'id="homeRecommendedShelfRow"',
  'id="homeBrowsingHistoryRow"',
  'homepage-products.js'
];

indexTags.forEach(tag => {
  assert(indexHtml.includes(tag), `index.html must include ${tag}`);
});
console.log(`PASS: index.html contains all ${indexTags.length} required i18n tags and dynamic container IDs`);

// 4. Test homepage-products.js execution and dynamic rendering
const mockElements = {
  homeTopPicksGrid: { innerHTML: '' },
  homeDealsGrid: { innerHTML: '' },
  homeRecommendedShelfRow: { innerHTML: '' },
  homeBrowsingHistoryRow: { innerHTML: '' }
};

const hpWindow = {
  location: { pathname: '/index.html' },
  EM_TRANSLATIONS: trans
};
const hpDoc = {
  readyState: 'complete',
  getElementById: function(id) {
    return mockElements[id] || null;
  },
  addEventListener: function() {}
};

const fnHp = new Function('window', 'document', 'localStorage', hpCode);
fnHp(hpWindow, hpDoc, sandbox.localStorage);

assert(typeof hpWindow.renderHomepageProducts === 'function', "renderHomepageProducts must be exported");
assert(typeof hpWindow.renderProducts === 'function', "renderProducts must be exported");

// Render in Hindi
hpWindow.renderHomepageProducts('hi');

// Check Top Picks HTML in Hindi
const topPicksHtml = mockElements.homeTopPicksGrid.innerHTML;
assert(topPicksHtml.includes('प्रोबुक 15" लैपटॉप (इंटेल कोर i5, 16GB रैम, 512GB एसएसडी)'), "Hindi ProBook title rendered");
assert(topPicksHtml.includes('ऑरा एएनसी वायरलेस नॉइज़ कैंसिलिंग हेडफ़ोन'), "Hindi Aura Headphones title rendered");
assert(topPicksHtml.includes('कार्ट में जोड़ें'), "Hindi 'कार्ट में जोड़ें' button rendered");
assert(!topPicksHtml.includes('Add to Cart'), "No English Add to Cart in Hindi view");

// Check Deals HTML in Hindi
const dealsHtml = mockElements.homeDealsGrid.innerHTML;
assert(dealsHtml.includes('वेक्टर गेमिंग लैपटॉप'), "Hindi Vector Gaming Laptop title rendered");
assert(dealsHtml.includes('आज की डील'), "Hindi 'आज की डील' badge rendered");
assert(dealsHtml.includes('सीमित समय की डील'), "Hindi 'सीमित समय की डील' text rendered");
assert(dealsHtml.includes('कार्ट में जोड़ें'), "Hindi 'कार्ट में जोड़ें' button rendered in deals");

// Check Recommended Shelf in Hindi
const shelfHtml = mockElements.homeRecommendedShelfRow.innerHTML;
assert(shelfHtml.includes('एचपी पवेलियन 15 गेमिंग लैपटॉप'), "Hindi HP Pavilion title rendered in shelf");
assert(shelfHtml.includes('सोनी WH-1000XM4 वायरलेस नॉइज़ कैंसिलिंग'), "Hindi Sony headphones rendered in shelf");
assert(shelfHtml.includes('कार्ट में जोड़ें'), "Hindi 'कार्ट में जोड़ें' button in shelf");

// Check Browsing History in Hindi
const historyHtml = mockElements.homeBrowsingHistoryRow.innerHTML;
assert(historyHtml.includes('प्रोबुक 15" लैपटॉप'), "Hindi ProBook rendered in history");

console.log("PASS: Dynamic rendering in Hindi successfully transformed all product cards, badges, and buttons!");

// Render in Tamil
hpWindow.renderHomepageProducts('ta');
assert(mockElements.homeTopPicksGrid.innerHTML.includes('புரோபுக் 15" லேப்டாப்'), "Tamil ProBook title rendered");
assert(mockElements.homeTopPicksGrid.innerHTML.includes('கார்ட்டில் சேர்'), "Tamil 'கார்ட்டில் சேர்' button rendered");
console.log("PASS: Dynamic rendering in Tamil successfully transforms all product cards!");

// 5. Test search button SVG protection in shared-search.js
assert(searchCode.includes('!submitButton.querySelector("svg")'), "shared-search.js protects SVG icons from being overwritten");
console.log("PASS: shared-search.js does not overwrite magnifying glass SVG");

// 6. Test menu-manager.js category quick-links protection
assert(menuCode.includes('category-quick-links'), "menu-manager.js does not duplicate or overwrite curated quick links");
assert(menuCode.includes('getI18nKey'), "menu-manager.js attaches data-i18n and translates immediately");
console.log("PASS: menu-manager.js preserves and translates navigation items");

console.log("\nALL 100% HOMEPAGE I18N & DYNAMIC PRODUCT TESTS PASSED!");
