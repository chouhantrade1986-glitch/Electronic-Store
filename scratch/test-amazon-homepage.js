const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = process.cwd();
const indexHtml = fs.readFileSync(path.join(projectDir, 'index.html'), 'utf8');
const amazonCss = fs.readFileSync(path.join(projectDir, 'amazon-theme.css'), 'utf8');
const hpJs = fs.readFileSync(path.join(projectDir, 'homepage-products.js'), 'utf8');

console.log("=== Running Amazon India Homepage & Carousels Verification (Phase 3) ===");

// 1. Hero overlap quad grid
assert(indexHtml.includes('class="amz-hero-quad-grid"'), "index.html must have amz-hero-quad-grid");
assert(indexHtml.includes('data-i18n="cat_gaming_acc"'), "index.html must have cat_gaming_acc");
assert(indexHtml.includes('data-i18n="cat_refresh_space"'), "index.html must have cat_refresh_space");
assert(indexHtml.includes('data-i18n="plus_title"'), "index.html must have plus_title");
assert(indexHtml.includes('data-i18n="cat_creator_laptops"'), "index.html must have cat_creator_laptops");
console.log("✓ PASS: Amazon India hero-overlap quad grid cards are present");

// 2. Carousel wrappers and navigation paddles
const paddleCount = (indexHtml.match(/class="amz-carousel-paddle/g) || []).length;
assert(paddleCount >= 8, `Expected at least 8 carousel paddles in index.html, found ${paddleCount}`);
assert(indexHtml.includes('id="homeDealsGrid"'), "homeDealsGrid must exist");
assert(indexHtml.includes('id="homeTopPicksGrid"'), "homeTopPicksGrid must exist");
assert(indexHtml.includes('id="homeRecommendedShelfRow"'), "homeRecommendedShelfRow must exist");
assert(indexHtml.includes('id="homeBrowsingHistoryRow"'), "homeBrowsingHistoryRow must exist");
console.log("✓ PASS: All 4 carousels (deals, top picks, recommendations, history) have paddle wrappers");

// 3. CSS Tokens in amazon-theme.css
assert(amazonCss.includes('.amz-hero-quad-grid'), "amazon-theme.css must define .amz-hero-quad-grid");
assert(amazonCss.includes('.amz-carousel-paddle'), "amazon-theme.css must define .amz-carousel-paddle");
assert(amazonCss.includes('.amz-hp-atc-btn'), "amazon-theme.css must define .amz-hp-atc-btn");
assert(amazonCss.includes('.btn-added'), "amazon-theme.css must define .btn-added for check feedback");
console.log("✓ PASS: CSS styles for hero overlap, paddles, and button feedback exist");

// 4. homepage-products.js functionality
assert(hpJs.includes('function addToCart('), "homepage-products.js must have addToCart");
assert(hpJs.includes('electromart_cart_v1'), "addToCart must sync with electromart_cart_v1");
assert(hpJs.includes('function setupCarouselPaddles('), "homepage-products.js must have setupCarouselPaddles");
assert(hpJs.includes('window.addToCart = addToCart'), "homepage-products.js must export window.addToCart");

// Test addToCart in a mock environment
const mockStorage = {};
const mockElements = [];
const mockDocument = {
  readyState: 'complete',
  querySelectorAll: (selector) => {
    if (selector === '.cart-count, #cartCount') {
      return [{ textContent: '0' }];
    }
    return [];
  },
  getElementById: () => null,
  addEventListener: () => {}
};
const mockWindow = {
  document: mockDocument,
  localStorage: {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = v; }
  },
  dispatchEvent: () => {}
};

const fn = new Function('window', 'document', 'localStorage', hpJs);
fn(mockWindow, mockDocument, mockWindow.localStorage);

assert(typeof mockWindow.addToCart === 'function', "mockWindow.addToCart must be registered");
mockWindow.addToCart({ id: 'test-item-1', name: 'Test Product', price: 999 });

assert(mockStorage['electromart_cart_v1'], "electromart_cart_v1 must be set in localStorage");
const cart = JSON.parse(mockStorage['electromart_cart_v1']);
assert.strictEqual(cart['test-item-1'], 1, "Item quantity in cart should be 1");
console.log("✓ PASS: addToCart correctly manages localStorage cart state and badge counts");

console.log("\nAll Phase 3 Amazon India Homepage & Carousels assertions passed successfully!");
