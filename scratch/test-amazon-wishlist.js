const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.join(__dirname, '..');
const transCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
const wishlistHtml = fs.readFileSync(path.join(projectDir, 'wishlist.html'), 'utf8');
const wishlistJs = fs.readFileSync(path.join(projectDir, 'wishlist.js'), 'utf8');
const wishlistCss = fs.readFileSync(path.join(projectDir, 'wishlist.css'), 'utf8');

console.log("=== Testing Phase 8: Amazon India Wishlist Hub Suite ===");

// 1. Evaluate translations.js
const mockDoc = {
  readyState: 'complete',
  documentElement: { lang: 'en', setAttribute: function(k, v) { this[k] = v; } },
  querySelectorAll: function() { return []; },
  querySelector: function() { return null; },
  getElementById: function() { return null; },
  addEventListener: function() {}
};
const mockWindow = { location: { pathname: '/wishlist.html' } };
const mockStorage = {
  store: { electromart_lang_v1: 'en' },
  getItem: function(k) { return this.store[k] || null; },
  setItem: function(k, v) { this.store[k] = String(v); }
};

const fnTrans = new Function('window', 'document', 'localStorage', transCode);
fnTrans(mockWindow, mockDoc, mockStorage);

const trans = mockWindow.EM_TRANSLATIONS;
assert(trans, "EM_TRANSLATIONS must exist on window");

// Check all 11 Indian languages
const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const targetWishlistKeys = [
  'wishlist_page_title',
  'wishlist_breadcrumb_account',
  'wishlist_your_lists',
  'wishlist_create_list_btn',
  'wishlist_create_list_modal_title',
  'wishlist_create_list_modal_desc',
  'wishlist_list_name_label',
  'wishlist_privacy_label',
  'wishlist_privacy_private',
  'wishlist_privacy_public',
  'wishlist_privacy_private_desc',
  'wishlist_privacy_public_desc',
  'wishlist_cancel',
  'wishlist_create_submit',
  'wishlist_invite_btn',
  'wishlist_search_placeholder',
  'wishlist_sort_default',
  'wishlist_sort_price_low',
  'wishlist_sort_price_high',
  'wishlist_sort_recent',
  'wishlist_price_dropped',
  'wishlist_in_stock',
  'wishlist_low_stock',
  'wishlist_out_of_stock',
  'wishlist_move_to_cart',
  'wishlist_added_to_cart',
  'wishlist_view_details',
  'wishlist_delete_item',
  'wishlist_item_deleted',
  'wishlist_empty_title',
  'wishlist_empty_desc',
  'wishlist_explore_deals',
  'wishlist_continue_shopping',
  'wishlist_link_copied',
  'wishlist_default_list_name',
  'wishlist_saved_for_later'
];

languages.forEach(lang => {
  assert(trans[lang], `translations for language '${lang}' must exist`);
  targetWishlistKeys.forEach(key => {
    assert(trans[lang][key], `Missing translation key '${key}' in '${lang}'`);
    assert(typeof trans[lang][key] === 'string' && trans[lang][key].trim().length > 0, `Empty key '${key}' in '${lang}'`);
  });
});

console.log("✓ PASS: All 11 languages have 100% complete Wishlist Hub translations!");

// 2. Verify HTML Structure
assert(wishlistHtml.includes('id="wishlistGrid"'), "wishlist.html must include #wishlistGrid container");
assert(wishlistHtml.includes('id="wishlistMeta"'), "wishlist.html must include #wishlistMeta for QA compatibility");
assert(wishlistHtml.includes('class="amz-wishlist-breadcrumb"'), "wishlist.html must include Amazon breadcrumb");
assert(wishlistHtml.includes('id="activeListTitle"'), "wishlist.html must include #activeListTitle");
assert(wishlistHtml.includes('id="listPrivacyBadge"'), "wishlist.html must include #listPrivacyBadge");
assert(wishlistHtml.includes('id="togglePrivacyBtn"'), "wishlist.html must include #togglePrivacyBtn");
assert(wishlistHtml.includes('id="inviteListBtn"'), "wishlist.html must include #inviteListBtn");
assert(wishlistHtml.includes('class="amz-wishlist-layout"'), "wishlist.html must include 2-column layout wrapper");
assert(wishlistHtml.includes('class="amz-wishlist-sidebar"'), "wishlist.html must include sidebar");
assert(wishlistHtml.includes('id="listsNav"'), "wishlist.html must include #listsNav in sidebar");
assert(wishlistHtml.includes('id="createListBtn"'), "wishlist.html must include #createListBtn");
assert(wishlistHtml.includes('id="wishlistSearchInput"'), "wishlist.html must include #wishlistSearchInput");
assert(wishlistHtml.includes('id="wishlistSortSelect"'), "wishlist.html must include #wishlistSortSelect");
assert(wishlistHtml.includes('id="createListModal"'), "wishlist.html must include #createListModal");
assert(wishlistHtml.includes('id="shareListModal"'), "wishlist.html must include #shareListModal");

// Verify Script Loading Order Rule
const scriptOrder = [
  'translations.js',
  'products-data.js',
  'universal-i18n-bus.js',
  'header.js',
  'menu-manager.js',
  'auth-state.js',
  'wishlist.js'
];
let lastIndex = -1;
scriptOrder.forEach(script => {
  const idx = wishlistHtml.indexOf(script);
  assert(idx > -1, `Script ${script} is missing from wishlist.html`);
  assert(idx > lastIndex, `Script ${script} is loaded out of required order`);
  lastIndex = idx;
});
console.log("✓ PASS: wishlist.html DOM structure and script loading sequence verified!");

// 3. Verify CSS styling & tokens
assert(wishlistCss.includes('.amz-wishlist-layout'), "wishlist.css must style .amz-wishlist-layout");
assert(wishlistCss.includes('.wishlist-card'), "wishlist.css must retain .wishlist-card class for QA scripts");
assert(wishlistCss.includes('.amz-price-stack'), "wishlist.css must style Amazon 3-line price stack");
assert(wishlistCss.includes('.amz-price-drop-badge'), "wishlist.css must style price drop alert badge");
assert(wishlistCss.includes('.move-btn'), "wishlist.css must style .move-btn");
assert(wishlistCss.includes('.view-btn'), "wishlist.css must style .view-btn");
assert(wishlistCss.includes('.remove-btn'), "wishlist.css must style .remove-btn");
console.log("✓ PASS: wishlist.css Amazon India styles and selectors verified!");

// 4. Verify JavaScript Logic in Sandbox
const storageStore = {
  electromart_cart_v1: JSON.stringify({ "1": 1 }),
  electromart_wishlist_v1: JSON.stringify(["1", "2", "201"]),
  electromart_lang_v1: 'en'
};

const domListeners = {};
const elements = {
  wishlistGrid: { innerHTML: '', querySelectorAll: () => [] },
  wishlistMeta: { textContent: '' },
  cartCount: { textContent: '1' },
  activeListTitle: { textContent: '' },
  listPrivacyBadge: { className: '' },
  privacyStatusText: { textContent: '' },
  privacyIcon: { textContent: '' },
  togglePrivacyBtn: { addEventListener: (ev, fn) => { domListeners['togglePrivacy'] = fn; } },
  togglePrivacyBtnText: { textContent: '' },
  inviteListBtn: { addEventListener: () => {} },
  listsNav: { innerHTML: '', addEventListener: () => {} },
  wishlistSearchInput: { value: '', addEventListener: () => {} },
  wishlistSortSelect: { value: 'default', addEventListener: () => {} },
  createListBtn: { addEventListener: () => {} },
  createListModal: { showModal: () => {}, close: () => {} },
  closeCreateListModalBtn: { addEventListener: () => {} },
  cancelCreateListBtn: { addEventListener: () => {} },
  createListForm: { addEventListener: (ev, fn) => { domListeners['createListSubmit'] = fn; } },
  newListNameInput: { value: 'My Test List' },
  shareListModal: { showModal: () => {}, close: () => {} },
  closeShareModalBtn: { addEventListener: () => {} },
  shareLinkInput: { value: '', select: () => {} },
  copyShareLinkBtn: { addEventListener: () => {} },
  copySuccessMsg: { style: {} },
  amzToast: { textContent: '', classList: { add: () => {}, remove: () => {} } }
};

const jsDoc = {
  readyState: 'complete',
  getElementById: (id) => elements[id] || null,
  querySelector: (sel) => {
    if (sel.includes('input[name="listPrivacy"]:checked')) {
      return { value: 'public' };
    }
    return null;
  },
  querySelectorAll: () => [],
  addEventListener: (ev, fn) => { domListeners[ev] = fn; }
};

const jsStorage = {
  getItem: (k) => storageStore[k] || null,
  setItem: (k, v) => { storageStore[k] = String(v); }
};

const jsWindow = {
  EM_TRANSLATIONS: trans,
  location: { origin: 'http://localhost:5500', pathname: '/wishlist.html' },
  addEventListener: () => {}
};

const fnJs = new Function('window', 'document', 'localStorage', wishlistJs);
fnJs(jsWindow, jsDoc, jsStorage);

// Check rendered output
assert(elements.wishlistMeta.textContent.includes('saved item'), "wishlistMeta must include 'saved item' text for QA tests");
assert(elements.wishlistGrid.innerHTML.includes('wishlist-card'), "wishlistGrid must render .wishlist-card articles");
assert(elements.wishlistGrid.innerHTML.includes('move-btn'), "wishlistGrid cards must have .move-btn");
assert(elements.wishlistGrid.innerHTML.includes('amz-price-stack'), "wishlistGrid cards must have price stack");

// Check privacy toggle
assert(typeof domListeners['togglePrivacy'] === 'function', "togglePrivacy listener must be attached");
const initialBadgeClass = elements.listPrivacyBadge.className;
domListeners['togglePrivacy']();
assert.notStrictEqual(elements.listPrivacyBadge.className, initialBadgeClass, "Privacy toggle should toggle class");

// Check create list form submission
assert(typeof domListeners['createListSubmit'] === 'function', "createListForm submit listener must be attached");
domListeners['createListSubmit']({ preventDefault: () => {} });
const listsAfterCreate = JSON.parse(storageStore.electromart_wishlist_lists_v1 || '[]');
const createdList = listsAfterCreate.find(l => l.name === 'My Test List');
assert(createdList, "Created list must be persisted in electromart_wishlist_lists_v1");
assert.strictEqual(createdList.isPrivate, false, "Created list with 'public' radio should be public");

console.log("✓ PASS: Wishlist JavaScript engine, state sync, and interactions passed!");

// 5. Brand Safety Check: Strictly 0 customer-visible Amazon text
const forbiddenRegex = /\b(amazon|amazons)\b|अमेज़न|अमेजन|अमेजॉन|അമേസാൻ|அமேசான்|అమెజాన్|ಅಮೆಜಾನ್|অ্যামাজন|ਐਮਾਜ਼ਾਨ|એમેઝોન|ایمیزون/i;
const strippedHtml = wishlistHtml
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '');

// Check rendered text nodes
const textMatches = strippedHtml.match(/>([^<]+)</g) || [];
textMatches.forEach(tm => {
  const text = tm.slice(1, -1).trim();
  assert(!forbiddenRegex.test(text), `wishlist.html must not contain user-visible forbidden brand text: "${text}"`);
});

// Check user-visible attributes
const attrRegex = /(?:alt|title|placeholder|aria-label)=["']([^"']+)["']/gi;
let m;
while ((m = attrRegex.exec(strippedHtml)) !== null) {
  assert(!forbiddenRegex.test(m[1]), `wishlist.html attribute must not contain forbidden brand text: "${m[1]}"`);
}
console.log("✓ PASS: Zero customer-visible forbidden brand mentions in Wishlist Hub!");

console.log("\n=======================================================");
console.log("ALL PHASE 8 AMAZON INDIA WISHLIST HUB TESTS PASSED (100%)");
console.log("=======================================================\n");
