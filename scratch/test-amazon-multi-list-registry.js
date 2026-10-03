const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.join(__dirname, '..');
const transCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
const registryHtml = fs.readFileSync(path.join(projectDir, 'registry.html'), 'utf8');
const registryJs = fs.readFileSync(path.join(projectDir, 'registry.js'), 'utf8');
const registryCss = fs.readFileSync(path.join(projectDir, 'registry.css'), 'utf8');
const wishlistHtml = fs.readFileSync(path.join(projectDir, 'wishlist.html'), 'utf8');
const wishlistJs = fs.readFileSync(path.join(projectDir, 'wishlist.js'), 'utf8');
const wishlistCss = fs.readFileSync(path.join(projectDir, 'wishlist.css'), 'utf8');

console.log("=== Testing Phase 27: ElectroMart Wishlist & Multi-List Registry Suite ===");

// ---------------------------------------------------------------------------
// 1. Evaluate translations.js and verify 11 Indian languages coverage
// ---------------------------------------------------------------------------
console.log("\n[1/5] Verifying 11-language i18n dictionaries for Registry & Multi-List keys...");
const mockDoc = {
  readyState: 'complete',
  documentElement: { lang: 'en', setAttribute: function(k, v) { this[k] = v; } },
  querySelectorAll: function() { return []; },
  querySelector: function() { return null; },
  getElementById: function() { return null; },
  addEventListener: function() {}
};
const mockWindow = { location: { pathname: '/registry.html' } };
const mockStorage = {
  store: { electromart_lang_v1: 'en' },
  getItem: function(k) { return this.store[k] || null; },
  setItem: function(k, v) { this.store[k] = String(v); }
};

const fnTrans = new Function('window', 'document', 'localStorage', transCode);
fnTrans(mockWindow, mockDoc, mockStorage);

const trans = mockWindow.EM_TRANSLATIONS;
assert(trans, "EM_TRANSLATIONS must exist on window");

const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const targetRegistryKeys = [
  'registry_page_title',
  'registry_breadcrumb_account',
  'registry_breadcrumb_hub',
  'registry_hero_badge',
  'registry_hero_title',
  'registry_hero_subtitle',
  'registry_btn_create',
  'registry_btn_find',
  'registry_categories_heading',
  'reg_cat_birthday_title',
  'reg_cat_wedding_title',
  'reg_cat_tech_title',
  'registry_active_heading',
  'reg_countdown_days_left',
  'reg_progress_heading',
  'reg_stat_total_items',
  'reg_stat_fulfilled',
  'reg_stat_remaining',
  'reg_share_heading',
  'reg_btn_copy_link',
  'reg_btn_whatsapp',
  'reg_btn_add_products',
  'reg_items_heading',
  'reg_btn_gift_item',
  'reg_gifted_badge',
  'reg_create_modal_title',
  'reg_modal_label_name',
  'reg_modal_label_type',
  'reg_modal_label_date',
  'reg_modal_label_host',
  'reg_modal_label_address',
  'reg_modal_label_privacy',
  'reg_btn_save_registry',
  'reg_catalog_modal_title',
  'reg_catalog_search_placeholder',
  'reg_btn_add_to_reg',
  'wishlist_priority_label',
  'wishlist_priority_high',
  'wishlist_priority_medium',
  'wishlist_priority_low',
  'wishlist_notes_label',
  'wishlist_notes_placeholder',
  'wishlist_btn_edit_notes',
  'wishlist_btn_save_notes',
  'wishlist_move_to_list',
  'wishlist_moved_success',
  'wishlist_registry_banner'
];

languages.forEach(lang => {
  assert(trans[lang], `Language dict "${lang}" must exist in EM_TRANSLATIONS`);
  targetRegistryKeys.forEach(key => {
    assert(
      trans[lang][key] && typeof trans[lang][key] === 'string' && trans[lang][key].length > 0,
      `Missing or empty translation key "${key}" for language "${lang}"`
    );
  });
});
console.log("✓ PASS: All 11 Indian languages contain complete Registry and Multi-List translations!");

// ---------------------------------------------------------------------------
// 2. Verify registry.html DOM Architecture & Script Sequencing
// ---------------------------------------------------------------------------
console.log("\n[2/5] Verifying registry.html DOM hierarchy and script dependencies...");

// Critical DOM elements
const requiredRegistryIds = [
  'registryBreadcrumb',
  'registryHeroTitle',
  'registryHeroSubtitle',
  'registryHeroBadge',
  'openCreateRegistryBtn',
  'findRegistryBtn',
  'activeRegistrySection',
  'activeRegistryTitle',
  'activeRegistryHostInfo',
  'activeRegistryDateInfo',
  'activeRegistryAddressInfo',
  'registrySelectDropdown',
  'newRegistryTopBtn',
  'registryCountdownCard',
  'registryCountdownTimer',
  'registryProgressCard',
  'registryProgressFill',
  'statFulfillmentPercent',
  'statTotalItems',
  'statFulfilledItems',
  'statRemainingItems',
  'registryShareCard',
  'registryShareLinkInput',
  'copyRegistryShareBtn',
  'shareWhatsappBtn',
  'openCatalogModalBtn',
  'registryItemsFilterSelect',
  'registryItemsGrid',
  'createRegistryModal',
  'createRegistryForm',
  'catalogPickerModal',
  'catalogSearchInput',
  'catalogResultsList',
  'amzToast'
];

requiredRegistryIds.forEach(id => {
  assert(
    registryHtml.includes(`id="${id}"`),
    `registry.html is missing required DOM ID: #${id}`
  );
});

// Category cards
assert(registryHtml.includes('data-category="wedding"'), "registry.html must contain Wedding registry category card");
assert(registryHtml.includes('data-category="birthday"'), "registry.html must contain Birthday registry category card");
assert(registryHtml.includes('data-category="tech"'), "registry.html must contain Tech Workspace category card");

// Script order
const scriptsInRegistry = [];
const scriptRegex = /<script\s+src="([^"]+)"><\/script>/g;
let sm;
while ((sm = scriptRegex.exec(registryHtml)) !== null) {
  scriptsInRegistry.push(sm[1]);
}

const expectedScriptOrder = ['translations.js', 'products-data.js', 'universal-i18n-bus.js', 'header.js', 'registry.js'];
expectedScriptOrder.forEach(script => {
  const idx = scriptsInRegistry.findIndex(s => s.startsWith(script));
  assert(idx > -1, `Script ${script} is missing from registry.html`);
});

const transIdx = scriptsInRegistry.findIndex(s => s.startsWith('translations.js'));
const registryJsIdx = scriptsInRegistry.findIndex(s => s.startsWith('registry.js'));
assert(transIdx < registryJsIdx, "translations.js must load before registry.js in registry.html");

console.log("✓ PASS: registry.html contains all essential UI containers, modals, and valid script pipeline!");

// ---------------------------------------------------------------------------
// 3. Verify wishlist.html & CSS Enhancements (Banner, Priority, Notes, Modals)
// ---------------------------------------------------------------------------
console.log("\n[3/5] Verifying wishlist.html enhancements and CSS design tokens...");

const requiredWishlistAdditions = [
  'wishlistRegistryBanner',
  'editItemMetaModal',
  'editItemMetaForm',
  'editMetaPrioritySelect',
  'editMetaNotesInput',
  'editMetaQuantityInput',
  'saveEditMetaBtn'
];

requiredWishlistAdditions.forEach(id => {
  assert(
    wishlistHtml.includes(`id="${id}"`),
    `wishlist.html must include enhancement element: #${id}`
  );
});

// CSS verification
assert(wishlistCss.includes('.amz-wishlist-registry-banner'), "wishlist.css must style .amz-wishlist-registry-banner");
assert(wishlistCss.includes('.wishlist-priority-pill'), "wishlist.css must style .wishlist-priority-pill");
assert(wishlistCss.includes('.wishlist-priority-pill.high'), "wishlist.css must style high priority pill");
assert(wishlistCss.includes('.wishlist-item-notes-box'), "wishlist.css must style notes container");
assert(wishlistCss.includes('.wishlist-move-to-list-select'), "wishlist.css must style move-to-list select");

assert(registryCss.includes('.amz-registry-hero'), "registry.css must define hero banner styles");
assert(registryCss.includes('.amz-reg-countdown-card'), "registry.css must style event countdown timer");
assert(registryCss.includes('.amz-reg-progress-fill'), "registry.css must style fulfillment progress fill");
assert(registryCss.includes('.amz-reg-item-card'), "registry.css must style celebration registry cards");

console.log("✓ PASS: Wishlist and Registry CSS tokens, banners, and priority badges verified!");

// ---------------------------------------------------------------------------
// 4. Verify registry.js Engine: Seed, Countdown, Interval Cleanup, and Gifting
// ---------------------------------------------------------------------------
console.log("\n[4/5] Testing registry.js lifecycle, countdown cleanup, and state transitions...");

const mockLocalStorage = {
  store: {},
  getItem: function(k) { return this.store[k] || null; },
  setItem: function(k, v) { this.store[k] = String(v); },
  removeItem: function(k) { delete this.store[k]; }
};

let activeIntervals = [];
const originalSetInterval = global.setInterval;
const originalClearInterval = global.clearInterval;

global.setInterval = function(fn, delay) {
  const id = originalSetInterval(fn, delay);
  activeIntervals.push(id);
  return id;
};

global.clearInterval = function(id) {
  activeIntervals = activeIntervals.filter(i => i !== id);
  return originalClearInterval(id);
};

const domElements = {};
function createMockEl(id) {
  const children = [];
  return {
    id: id,
    innerHTML: '',
    textContent: '',
    className: '',
    style: {},
    children: children,
    appendChild: function(child) {
      children.push(child);
      return child;
    },
    classList: {
      add: function(c) { this[c] = true; },
      remove: function(c) { delete this[c]; },
      contains: function(c) { return !!this[c]; }
    },
    addEventListener: function(ev, fn) { this['on_' + ev] = fn; },
    setAttribute: function(k, v) { this[k] = v; },
    getAttribute: function(k) { return this[k] || null; },
    reset: function() {}
  };
}

requiredRegistryIds.forEach(id => {
  domElements[id] = createMockEl(id);
});

const windowListeners = {};
const jsWindow = {
  EM_TRANSLATIONS: trans,
  location: { search: '', pathname: '/registry.html', origin: 'http://localhost:5500' },
  addEventListener: function(ev, fn) { windowListeners[ev] = fn; },
  removeEventListener: function() {},
  history: { pushState: function() {} }
};

const jsDoc = {
  readyState: 'complete',
  createElement: function(tag) { return createMockEl(tag); },
  getElementById: function(id) { return domElements[id] || null; },
  querySelector: function(sel) { return null; },
  querySelectorAll: function(sel) { return []; },
  addEventListener: function(ev, fn) { windowListeners['doc_' + ev] = fn; }
};

// Execute registry.js
const fnRegistryJs = new Function('window', 'document', 'localStorage', registryJs);
fnRegistryJs(jsWindow, jsDoc, mockLocalStorage);

// Check that default registries were initialized
const savedRegistries = JSON.parse(mockLocalStorage.getItem('electromart_registries_v1') || '[]');
assert(Array.isArray(savedRegistries) && savedRegistries.length >= 2, "Default registries should be seeded");
const weddingReg = savedRegistries.find(r => r.category === 'wedding');
assert(weddingReg, "Wedding celebration registry must exist by default");
assert(weddingReg.items && weddingReg.items.length > 0, "Wedding registry should have sample items");

// Check that interval was started for countdown
assert(activeIntervals.length >= 1, "Countdown timer interval should be active");

// Verify memory cleanup: trigger page unload
assert(typeof windowListeners['unload'] === 'function' || typeof windowListeners['beforeunload'] === 'function', "registry.js must attach unload/beforeunload listener to prevent memory leaks");
if (windowListeners['unload']) windowListeners['unload']();
if (windowListeners['beforeunload']) windowListeners['beforeunload']();

assert.strictEqual(activeIntervals.length, 0, "Countdown interval must be cleared on page unload/beforeunload");

// Reset globals
global.setInterval = originalSetInterval;
global.clearInterval = originalClearInterval;

// Test Gifting Action: giftItem
assert(typeof jsWindow.giftItem === 'function', "giftItem must be exposed on window for gift actions");

// Set up initial cart
mockLocalStorage.setItem('electromart_cart_v1', JSON.stringify({}));
const activeReg = savedRegistries[0];
const firstItem = activeReg.items[0];
const initialPurchased = firstItem.purchased || 0;

jsWindow.giftItem(firstItem.productId);

// Verify cart received item
const cartAfterGift = JSON.parse(mockLocalStorage.getItem('electromart_cart_v1') || '{}');
assert(cartAfterGift[firstItem.productId] >= 1, "Gifting an item must add it to electromart_cart_v1");

// Verify registry item status updated
const registriesAfterGift = JSON.parse(mockLocalStorage.getItem('electromart_registries_v1') || '[]');
const updatedReg = registriesAfterGift.find(r => r.id === activeReg.id);
const updatedItem = updatedReg.items.find(i => i.productId === firstItem.productId);
assert.strictEqual(updatedItem.purchased, initialPurchased + 1, "Purchased count on registry item must increment");

// Verify backward compatibility: ensure wishlist v1 sync logic functions in wishlist.js
assert(wishlistJs.includes('electromart_wishlist_v1'), "wishlist.js must maintain sync with electromart_wishlist_v1");
assert(wishlistJs.includes('saveWishlistIds'), "wishlist.js must call saveWishlistIds to preserve string array format");

console.log("✓ PASS: Registry state management, interval cleanup, gifting, and cart sync verified!");

// ---------------------------------------------------------------------------
// 5. Brand Safety Check: 100% ElectroMart, 0 Visible Amazon Mentions
// ---------------------------------------------------------------------------
console.log("\n[5/5] Enforcing 100% Brand Safety & Legal Compliance...");

const forbiddenRegex = /\b(amazon|amazons)\b|अमेज़न|अमेजन|अमेजॉन|അമേസാൻ|அமேசான்|అమెజాన్|ಅಮೆಜಾನ್|অ্যামাজন|ਐਮਾਜ਼ਾਨ|એમેઝોન|ایمیزون/i;

function checkHtmlCleanliness(htmlContent, fileName) {
  const stripped = htmlContent
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');

  const textNodes = stripped.match(/>([^<]+)</g) || [];
  textNodes.forEach(tn => {
    const text = tn.slice(1, -1).trim();
    assert(!forbiddenRegex.test(text), `${fileName} contains forbidden brand text in node: "${text}"`);
  });

  const attrRegex = /(?:alt|title|placeholder|aria-label)=["']([^"']+)["']/gi;
  let match;
  while ((match = attrRegex.exec(stripped)) !== null) {
    assert(!forbiddenRegex.test(match[1]), `${fileName} contains forbidden brand text in attribute: "${match[1]}"`);
  }
}

checkHtmlCleanliness(registryHtml, 'registry.html');
checkHtmlCleanliness(wishlistHtml, 'wishlist.html');

// Check translations for registry keys
languages.forEach(lang => {
  targetRegistryKeys.forEach(key => {
    const val = trans[lang][key];
    assert(!forbiddenRegex.test(val), `Translation key "${key}" in language "${lang}" contains forbidden brand text: "${val}"`);
  });
});

console.log("✓ PASS: 100% Brand Safety verified! Zero customer-facing forbidden brand references.");

console.log("\n=========================================================================");
console.log("ALL PHASE 27 ELECTROMART WISHLIST & REGISTRY TESTS PASSED (100%)");
console.log("=========================================================================\n");
process.exit(0);
