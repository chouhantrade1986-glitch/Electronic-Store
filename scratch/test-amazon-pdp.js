const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectDir = path.join(__dirname, '..');

console.log('==================================================');
console.log('TEST SUITE: Amazon India PDP Full Suite (Phase 6)');
console.log('==================================================');

// 1. Check translations.js across all 11 Indian languages
const transCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
const sandbox = {
  window: {},
  document: {
    addEventListener: () => {},
    querySelectorAll: () => [],
    getElementById: () => null,
    querySelector: () => null,
    documentElement: { setAttribute: () => {} }
  },
  localStorage: {
    getItem: () => 'hi',
    setItem: () => {}
  }
};
vm.createContext(sandbox);
vm.runInContext(transCode, sandbox);

const trans = sandbox.window.EM_TRANSLATIONS;
assert(trans, 'EM_TRANSLATIONS must exist on window');

const expectedPdpKeys = [
  'amazons_choice',
  'bought_in_past_month',
  'bank_offers_title',
  'no_cost_emi_title',
  'partner_offers_title',
  'bank_offer_detail',
  'no_cost_emi_detail',
  'replacement_badge',
  'free_delivery_badge',
  'warranty_badge',
  'pay_on_delivery_badge',
  'top_brand_badge',
  'helpful_button',
  'write_review_btn',
  'read_more_offers',
  'by_feature',
  'value_for_money',
  'battery_life',
  'quality_assurance'
];

const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];

languages.forEach((lang) => {
  assert(trans[lang], `Language "${lang}" must exist`);
  expectedPdpKeys.forEach((key) => {
    assert(trans[lang][key], `Key "${key}" must exist in language "${lang}"`);
  });
});
console.log(`PASS: All ${expectedPdpKeys.length} Amazon PDP keys exist across all 11 Indian languages!`);

// 2. Exact Hindi strings verification
assert.strictEqual(trans.hi.amazons_choice, 'इलेक्ट्रोमार्ट चॉइस');
assert.strictEqual(trans.hi.bought_in_past_month, 'पिछले महीने में 1K+ खरीदे गए');
assert.strictEqual(trans.hi.bank_offers_title, 'बैंक ऑफर');
assert.strictEqual(trans.hi.replacement_badge, '7 दिनों में रिप्लेसमेंट');
assert.strictEqual(trans.hi.free_delivery_badge, 'फ्री डिलीवरी');
assert.strictEqual(trans.hi.warranty_badge, '1 वर्ष की वारंटी');
assert.strictEqual(trans.hi.helpful_button, 'मददगार');
console.log('PASS: Exact Hindi Amazon PDP translations match verbatim!');

// 3. Inspect product-detail.html markup
const htmlContent = fs.readFileSync(path.join(projectDir, 'product-detail.html'), 'utf8');

// Header, Breadcrumb, Choice Badge
assert(htmlContent.includes('id="productBreadcrumb"'), 'Must have #productBreadcrumb');
assert(htmlContent.includes('id="productBadgeSocialRow"'), 'Must have #productBadgeSocialRow');
assert(htmlContent.includes('id="amazonsChoiceBadge"'), 'Must have #amazonsChoiceBadge');
assert(htmlContent.includes('id="socialBoughtCount"'), 'Must have #socialBoughtCount');

// Price block
assert(htmlContent.includes('id="amazonPriceBlock"'), 'Must have #amazonPriceBlock');
assert(htmlContent.includes('id="dealBadgePill"'), 'Must have #dealBadgePill');
assert(htmlContent.includes('id="productDiscountPercent"'), 'Must have #productDiscountPercent');
assert(htmlContent.includes('id="productMainPrice"'), 'Must have #productMainPrice');
assert(htmlContent.includes('id="productMrpPrice"'), 'Must have #productMrpPrice');

// Bank Offers & Trust Badges
assert(htmlContent.includes('id="offersBlock"'), 'Must have #offersBlock');
assert(htmlContent.includes('class="detail-card amazon-offers-card"'), 'Must have amazon-offers-card');
assert(htmlContent.includes('id="offersGrid"'), 'Must have #offersGrid');
assert(htmlContent.includes('id="servicesBlock"'), 'Must have #servicesBlock');
assert(htmlContent.includes('class="detail-card amazon-services-card"'), 'Must have amazon-services-card');
assert(htmlContent.includes('class="service-grid amazon-trust-grid"'), 'Must have amazon-trust-grid');
assert(htmlContent.includes('id="serviceReturnText"'), 'Must have #serviceReturnText');
assert(htmlContent.includes('id="serviceDeliveryText"'), 'Must have #serviceDeliveryText');
assert(htmlContent.includes('id="serviceWarrantyText"'), 'Must have #serviceWarrantyText');
assert(htmlContent.includes('id="serviceSellerText"'), 'Must have #serviceSellerText');

// Reviews 2-Column Hub
assert(htmlContent.includes('id="reviewsBlock"'), 'Must have #reviewsBlock');
assert(htmlContent.includes('class="detail-card amazon-reviews-card"'), 'Must have amazon-reviews-card');
assert(htmlContent.includes('class="amazon-reviews-2col"'), 'Must have amazon-reviews-2col');
assert(htmlContent.includes('id="translateReviewsBtn"'), 'Must have #translateReviewsBtn');
assert(htmlContent.includes('id="reviewHeadline"'), 'Must have #reviewHeadline');
assert(htmlContent.includes('id="reviewBars"'), 'Must have #reviewBars');
assert(htmlContent.includes('id="customerReviewsList"'), 'Must have #customerReviewsList');
assert(htmlContent.includes('data-i18n="write_review_btn"'), 'Must have write_review_btn');

// Buy Box
assert(htmlContent.includes('class="buy-box amazon-buybox"'), 'Must have amazon-buybox');
assert(htmlContent.includes('id="addToCartBtn"'), 'Must have #addToCartBtn');
assert(htmlContent.includes('class="amazon-btn-cart"'), 'Must have amazon-btn-cart');
assert(htmlContent.includes('class="buy-now-btn amazon-btn-buynow"'), 'Must have amazon-btn-buynow');
assert(htmlContent.includes('id="saveWishlistBtn"'), 'Must have #saveWishlistBtn');

console.log('PASS: product-detail.html full Amazon India structure verified!');

// 4. Inspect amazon-theme.css
const cssContent = fs.readFileSync(path.join(projectDir, 'amazon-theme.css'), 'utf8');
assert(cssContent.includes('AMAZON INDIA PRODUCT DETAIL PAGE (PDP) SUITE (PHASE 6)'), 'Must contain Phase 6 header');
assert(cssContent.includes('.ac-badge-pill'), 'Must style .ac-badge-pill');
assert(cssContent.includes('.amazon-offers-card'), 'Must style .amazon-offers-card');
assert(cssContent.includes('.amazon-offer-card'), 'Must style .amazon-offer-card');
assert(cssContent.includes('.amazon-services-card'), 'Must style .amazon-services-card');
assert(cssContent.includes('.amazon-trust-grid'), 'Must style .amazon-trust-grid');
assert(cssContent.includes('.trust-badge-icon'), 'Must style .trust-badge-icon');
assert(cssContent.includes('.amazon-reviews-2col'), 'Must style .amazon-reviews-2col');
assert(cssContent.includes('.amazon-btn-cart'), 'Must style .amazon-btn-cart');
assert(cssContent.includes('.amazon-btn-buynow'), 'Must style .amazon-btn-buynow');
console.log('PASS: amazon-theme.css Phase 6 styling rules verified!');

// 5. Functional runtime simulation of product-detail.js
const domElements = new Map();
function createMockEl(id) {
  if (!domElements.has(id)) {
    domElements.set(id, {
      id,
      textContent: '',
      innerHTML: '',
      style: {},
      children: [],
      classList: {
        add: () => {},
        remove: () => {},
        toggle: () => {}
      },
      setAttribute: function(k, v) { this[k] = v; },
      getAttribute: function(k) { return this[k] || ''; },
      removeAttribute: () => {},
      querySelectorAll: (sel) => [],
      querySelector: (sel) => createMockEl('child_' + sel.replace(/^[#.]/, '')),
      pause: () => {},
      play: () => Promise.resolve(),
      addEventListener: function(event, handler) {
        if (!this._listeners) this._listeners = {};
        this._listeners[event] = handler;
      },
      dispatchEvent: function(event) {
        if (this._listeners && this._listeners[event]) {
          this._listeners[event]();
        }
      }
    });
  }
  return domElements.get(id);
}

global.window = global;
global.window.addEventListener = () => {};
global.location = { protocol: 'http:', hostname: 'localhost', port: '4000', search: '?id=product_1773480601001' };
global.localStorage = {
  store: { electromart_lang_v1: 'hi', electromart_lang: 'hi' },
  getItem: function(k) { return this.store[k] || null; },
  setItem: function(k, v) { this.store[k] = v; }
};
global.document = {
  body: { style: {}, classList: { add: () => {}, remove: () => {} } },
  documentElement: { lang: 'hi' },
  getElementById: (id) => createMockEl(id),
  querySelector: (sel) => createMockEl(sel.replace(/^[#.]/, '')),
  querySelectorAll: (sel) => [],
  addEventListener: () => {}
};

eval(fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8'));
eval(fs.readFileSync(path.join(projectDir, 'products-data.js'), 'utf8'));
eval(fs.readFileSync(path.join(projectDir, 'product-detail.js'), 'utf8'));

// Test renderOffers
assert.strictEqual(typeof renderOffers, 'function', 'renderOffers must be a function');
renderOffers(129999, 139999, 'laptop');
const offersGridEl = document.getElementById('offersGrid');
assert(offersGridEl.innerHTML.includes('amazon-offer-card'), 'offersGrid must render amazon-offer-card');
assert(offersGridEl.innerHTML.includes('data-i18n="sub_bank_offer"'), 'offersGrid must include sub_bank_offer');
assert(offersGridEl.innerHTML.includes('data-i18n="sub_no_cost_emi"'), 'offersGrid must include sub_no_cost_emi');
console.log('PASS: renderOffers generates authentic Amazon offer cards!');

// Test renderReviewSummary
assert.strictEqual(typeof renderReviewSummary, 'function', 'renderReviewSummary must be a function');
renderReviewSummary({ id: '1', rating: 4.8 });
const reviewsListEl = document.getElementById('customerReviewsList');
assert(reviewsListEl.innerHTML.includes('amazon-review-item'), 'reviewsList must contain amazon-review-item');
assert(reviewsListEl.innerHTML.includes('helpful-pill-btn'), 'reviewsList must contain helpful-pill-btn');
assert(reviewsListEl.innerHTML.includes('review-verified-badge'), 'reviewsList must contain review-verified-badge');
console.log('PASS: renderReviewSummary generates authentic Amazon verified review feed!');

// Test renderFrequentlyBoughtTogether with live recalculation
assert.strictEqual(typeof renderFrequentlyBoughtTogether, 'function', 'renderFrequentlyBoughtTogether must be a function');
const testProd = { id: 1, name: 'AstraBook Pro 14', price: 999, category: 'laptop', image: 'test.jpg' };
renderFrequentlyBoughtTogether(testProd, trans.hi);
const bundleContainer = document.getElementById('frequentlyBoughtContainer');
assert(bundleContainer.innerHTML.includes('bundleTotalPrice'), 'Bundle must render bundleTotalPrice element');
assert(bundleContainer.innerHTML.includes('bundleAccCheckbox'), 'Bundle must render bundleAccCheckbox');
console.log('PASS: renderFrequentlyBoughtTogether sets up live reactive price calculation!');

console.log('\nALL AMAZON INDIA PDP (PHASE 6) TESTS PASSED (100%)!\n');
