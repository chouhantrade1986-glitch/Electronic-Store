const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

const projectDir = path.resolve(__dirname, '..');

console.log("===============================================================");
console.log("TEST SUITE: Customer Reviews, Ratings & Q&A Suite (Phase 20)");
console.log("===============================================================");

// ---------------------------------------------------------------------------
// Layer 1: review.html Structure & Script Sequence & Brand Safety
// ---------------------------------------------------------------------------
const reviewHtmlPath = path.join(projectDir, 'review.html');
assert(fs.existsSync(reviewHtmlPath), "review.html must exist");
const reviewHtml = fs.readFileSync(reviewHtmlPath, 'utf8');

assert(reviewHtml.startsWith('<!DOCTYPE html>'), "review.html must start with <!DOCTYPE html>");
assert(reviewHtml.includes('styles.css'), "Must include styles.css");
assert(reviewHtml.includes('amazon-theme.css'), "Must include amazon-theme.css");
assert(reviewHtml.includes('review.css'), "Must include review.css");
assert(reviewHtml.includes('id="headerContainer"'), "Must have #headerContainer");
assert(reviewHtml.includes('id="reviewProductCard"'), "Must have #reviewProductCard");
assert(reviewHtml.includes('id="reviewForm"'), "Must have #reviewForm");
assert(reviewHtml.includes('id="starRatingWidget"'), "Must have #starRatingWidget");
assert(reviewHtml.includes('id="starRatingButtons"'), "Must have #starRatingButtons");
assert(reviewHtml.includes('id="starRatingLabel"'), "Must have #starRatingLabel");
assert(reviewHtml.includes('id="reviewHeadline"'), "Must have #reviewHeadline");
assert(reviewHtml.includes('id="reviewMediaInput"'), "Must have #reviewMediaInput");
assert(reviewHtml.includes('id="reviewUploadBtn"'), "Must have #reviewUploadBtn");
assert(reviewHtml.includes('id="reviewMediaPreviewStrip"'), "Must have #reviewMediaPreviewStrip");
assert(reviewHtml.includes('id="reviewText"'), "Must have #reviewText");
assert(reviewHtml.includes('id="reviewerName"'), "Must have #reviewerName");
assert(reviewHtml.includes('id="reviewVerifiedBadge"'), "Must have #reviewVerifiedBadge");
assert(reviewHtml.includes('id="submitReviewBtn"'), "Must have #submitReviewBtn");
assert(reviewHtml.includes('id="reviewSuccessBanner"'), "Must have #reviewSuccessBanner");
assert(reviewHtml.includes('id="recentReviewsSection"'), "Must have #recentReviewsSection");
assert(reviewHtml.includes('id="reviewList"'), "Must have #reviewList");

// Verify Script Sequence per AGENT_INSTRUCTIONS.md
const scripts = [];
const scriptRegex = /<script\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
let match;
while ((match = scriptRegex.exec(reviewHtml)) !== null) {
  scripts.push(match[1].split('?')[0]);
}

const transIdx = scripts.findIndex(s => s.endsWith('translations.js'));
const catIdx = scripts.findIndex(s => s.endsWith('products-data.js'));
const busIdx = scripts.findIndex(s => s.endsWith('universal-i18n-bus.js'));
const headerIdx = scripts.findIndex(s => s.endsWith('header.js'));
const menuIdx = scripts.findIndex(s => s.endsWith('menu-manager.js'));
const authIdx = scripts.findIndex(s => s.endsWith('auth-state.js'));
const searchIdx = scripts.findIndex(s => s.endsWith('shared-search.js'));
const reviewIdx = scripts.findIndex(s => s.endsWith('review.js'));

assert(transIdx > -1, "translations.js is present");
assert(catIdx > -1, "products-data.js is present");
assert(busIdx > -1, "universal-i18n-bus.js is present");
assert(headerIdx > -1, "header.js is present");
assert(menuIdx > -1, "menu-manager.js is present");
assert(authIdx > -1, "auth-state.js is present");
assert(searchIdx > -1, "shared-search.js is present");
assert(reviewIdx > -1, "review.js is present");

assert(transIdx < catIdx, "translations.js before products-data.js");
assert(catIdx < busIdx, "products-data.js before universal-i18n-bus.js");
assert(busIdx < headerIdx, "universal-i18n-bus.js before header.js");
assert(headerIdx < menuIdx, "header.js before menu-manager.js");
assert(menuIdx < authIdx, "menu-manager.js before auth-state.js");
assert(authIdx < searchIdx, "auth-state.js before shared-search.js");
assert(searchIdx < reviewIdx, "shared-search.js before review.js");

console.log("PASS: Layer 1 - review.html markup and script hierarchy verified!");

// ---------------------------------------------------------------------------
// Layer 2: review.css and review.js Functional Logic
// ---------------------------------------------------------------------------
const reviewCssPath = path.join(projectDir, 'review.css');
assert(fs.existsSync(reviewCssPath), "review.css must exist");
const reviewCss = fs.readFileSync(reviewCssPath, 'utf8');
assert(reviewCss.includes('.star-rating-widget'), "review.css styles .star-rating-widget");
assert(reviewCss.includes('.review-media-preview-strip'), "review.css styles .review-media-preview-strip");
assert(reviewCss.includes('.review-submit-btn'), "review.css styles .review-submit-btn");
assert(reviewCss.includes('.customer-review-card'), "review.css styles .customer-review-card");

const reviewJsPath = path.join(projectDir, 'review.js');
assert(fs.existsSync(reviewJsPath), "review.js must exist");
const reviewJs = fs.readFileSync(reviewJsPath, 'utf8');

// Test functional execution of review logic in simulated sandbox
const sandbox = {
  document: {
    getElementById: () => ({ addEventListener: () => {}, querySelectorAll: () => [], style: {}, value: '', classList: { toggle: () => {}, add: () => {} }, innerHTML: '', textContent: '', reset: () => {} }),
    querySelector: () => ({ addEventListener: () => {} }),
    querySelectorAll: () => [],
    addEventListener: () => {}
  },
  window: {
    location: { search: '?productId=1' },
    addEventListener: () => {}
  },
  localStorage: {
    _store: {},
    getItem(k) { return this._store[k] || null; },
    setItem(k, v) { this._store[k] = String(v); }
  },
  URLSearchParams: URLSearchParams,
  console: console
};
vm.createContext(sandbox);
vm.runInContext(reviewJs, sandbox);

assert.strictEqual(typeof sandbox.loadReviews, 'function', 'loadReviews is defined in review.js');
assert.strictEqual(typeof sandbox.saveReviews, 'function', 'saveReviews is defined in review.js');
assert.strictEqual(typeof sandbox.renderReviews, 'function', 'renderReviews is defined in review.js');

// Test review saving and loading
const sampleReview = {
  id: "test_rev_1",
  productId: "1",
  product: "AstraBook Pro 14",
  rating: 5,
  headline: "Superb laptop for developers",
  text: "High speed SSD and crisp display. Delivered in under 24 hours.",
  reviewerName: "Pooja Roy",
  verified: true,
  date: "09 September 2026",
  images: [],
  helpfulCount: 5
};
sandbox.saveReviews([sampleReview]);
const loaded = sandbox.loadReviews();
assert.strictEqual(loaded.length, 1, "Saved review should load");
assert.strictEqual(loaded[0].headline, "Superb laptop for developers");
assert.strictEqual(loaded[0].rating, 5);

console.log("PASS: Layer 2 - review.css styles and review.js controller runtime verified!");

// ---------------------------------------------------------------------------
// Layer 3: PDP Q&A Suite (product-detail.html & product-detail.js)
// ---------------------------------------------------------------------------
const pdpHtmlPath = path.join(projectDir, 'product-detail.html');
const pdpHtml = fs.readFileSync(pdpHtmlPath, 'utf8');

assert(pdpHtml.includes('id="qaBlock"'), "product-detail.html must have #qaBlock");
assert(pdpHtml.includes('id="qaSearchInput"'), "product-detail.html must have #qaSearchInput");
assert(pdpHtml.includes('id="qaSearchClearBtn"'), "product-detail.html must have #qaSearchClearBtn");
assert(pdpHtml.includes('id="askCommunityBtn"'), "product-detail.html must have #askCommunityBtn");
assert(pdpHtml.includes('id="askCommunityFormWrap"'), "product-detail.html must have #askCommunityFormWrap");
assert(pdpHtml.includes('id="askCommunityForm"'), "product-detail.html must have #askCommunityForm");
assert(pdpHtml.includes('id="askQuestionInput"'), "product-detail.html must have #askQuestionInput");
assert(pdpHtml.includes('id="submitQuestionBtn"'), "product-detail.html must have #submitQuestionBtn");
assert(pdpHtml.includes('id="qaList"'), "product-detail.html must have #qaList");

const pdpJs = fs.readFileSync(path.join(projectDir, 'product-detail.js'), 'utf8');
assert(pdpJs.includes('qaSearchInput'), "product-detail.js must handle qaSearchInput");
assert(pdpJs.includes('askCommunityBtn'), "product-detail.js must handle askCommunityBtn");
assert(pdpJs.includes('electromart_qa_v1'), "product-detail.js must persist questions to electromart_qa_v1");
assert(pdpJs.includes('qa-vote-up'), "product-detail.js must support qa-vote-up");
assert(pdpJs.includes('qa-vote-down'), "product-detail.js must support qa-vote-down");

console.log("PASS: Layer 3 - PDP Q&A search, ask community form, and voting verified!");

// ---------------------------------------------------------------------------
// Layer 4: PDP Review Filtering & Order Navigation Link
// ---------------------------------------------------------------------------
assert(pdpHtml.includes('id="customerMediaGallery"'), "product-detail.html must have #customerMediaGallery");
assert(pdpHtml.includes('id="customerGalleryTrack"'), "product-detail.html must have #customerGalleryTrack");
assert(pdpHtml.includes('id="reviewFilterActiveBar"'), "product-detail.html must have #reviewFilterActiveBar");
assert(pdpHtml.includes('id="clearReviewFilterBtn"'), "product-detail.html must have #clearReviewFilterBtn");

assert(pdpJs.includes('data-star-filter'), "product-detail.js must support data-star-filter on review bars");
assert(pdpJs.includes('activeReviewStarFilter'), "product-detail.js must manage activeReviewStarFilter");
assert(pdpJs.includes('review.html?productId='), "product-detail.js must link to review.html with productId");

// Check orders.js integration
const ordersJs = fs.readFileSync(path.join(projectDir, 'orders.js'), 'utf8');
assert(ordersJs.includes('review.html?productId='), "orders.js write-review-btn must navigate to review.html");

console.log("PASS: Layer 4 - PDP star histogram filter and Write Review navigation verified!");

// ---------------------------------------------------------------------------
// Layer 5: 11-Language i18n Completeness for Reviews & Q&A
// ---------------------------------------------------------------------------
const transJs = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
const transSandbox = { window: {} };
vm.createContext(transSandbox);
vm.runInContext(transJs, transSandbox);

const allLangs = ['en', 'hi', 'ta', 'te', 'mr', 'bn', 'kn', 'ml', 'ur', 'pa', 'gu'];
const requiredReviewKeys = [
  'review_page_title',
  'review_page_subtitle',
  'review_breadcrumb_reviews',
  'review_breadcrumb_create',
  'review_product_card_title',
  'review_overall_rating',
  'review_rating_1',
  'review_rating_5',
  'review_headline_label',
  'review_headline_placeholder',
  'review_media_label',
  'review_media_desc',
  'review_upload_btn',
  'review_body_label',
  'review_body_placeholder',
  'review_reviewer_name_label',
  'review_submit_btn',
  'review_success_toast',
  'review_filter_all',
  'review_filter_5_star',
  'review_clear_filter',
  'review_customer_photos',
  'qa_search_placeholder',
  'qa_ask_community_btn',
  'qa_ask_title',
  'qa_ask_desc',
  'qa_question_placeholder',
  'qa_submit_btn',
  'qa_submitted_toast',
  'qa_helpful_vote',
  'qa_unhelpful_vote',
  'qa_no_results'
];

allLangs.forEach(lang => {
  const dict = transSandbox.window.EM_TRANSLATIONS[lang];
  assert(dict, `Language ${lang} must exist in EM_TRANSLATIONS`);
  requiredReviewKeys.forEach(k => {
    assert(dict[k] && String(dict[k]).trim().length > 0, `Missing key '${k}' in language '${lang}'`);
  });
});

// Exact Hindi assertions
const hi = transSandbox.window.EM_TRANSLATIONS.hi;
assert.strictEqual(hi.review_page_title, "उत्पाद समीक्षा लिखें", "Hindi review_page_title must match");
assert.strictEqual(hi.review_overall_rating, "समग्र रेटिंग", "Hindi review_overall_rating must match");
assert.strictEqual(hi.qa_ask_community_btn, "कम्युनिटी से पूछें", "Hindi qa_ask_community_btn must match");
assert.strictEqual(hi.qa_helpful_vote, "उपयोगी", "Hindi qa_helpful_vote must match");

console.log("PASS: Layer 5 - 11-Language translation coverage for reviews & Q&A verified (100%)!");
console.log("\n✓ ALL CUSTOMER REVIEWS, RATINGS & Q&A SUITE (PHASE 20) TESTS PASSED!\n");
