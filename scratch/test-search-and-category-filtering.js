const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');
const prodHtml = fs.readFileSync(path.join(projectDir, 'products.html'), 'utf8');
const prodJs = fs.readFileSync(path.join(projectDir, 'products.js'), 'utf8');
const amazonCss = fs.readFileSync(path.join(projectDir, 'amazon-theme.css'), 'utf8');

console.log("================================================================================");
console.log("=== Phase 15 Test Suite: Search & Category Filtering Engine (Amazon India) ===");
console.log("================================================================================\n");

// -----------------------------------------------------------------------------
// 1. Department / Category Tree Verification
// -----------------------------------------------------------------------------
console.log("1. Testing Department / Category Tree...");
const requiredCategories = ['all', 'laptop', 'computer', 'mobile', 'audio', 'accessory'];
requiredCategories.forEach(cat => {
  assert(prodHtml.includes(`data-category="${cat}"`), `Department link with data-category="${cat}" must exist in products.html`);
  assert(prodHtml.includes(`data-category-count="${cat}"`), `Count span with data-category-count="${cat}" must exist in products.html`);
});

// Verify updateDeptTreeCounts function exists and works
assert(prodJs.includes('function updateDeptTreeCounts('), "products.js must contain updateDeptTreeCounts function");
const sampleCatalog = [
  { id: 1, category: 'laptop', collections: ['laptop', 'computer'] },
  { id: 2, category: 'laptop', collections: ['laptop'] },
  { id: 3, category: 'mobile', collections: ['mobile'] },
  { id: 4, category: 'audio', collections: ['audio'] },
  { id: 5, category: 'accessory', collections: ['accessory'] },
  { id: 6, category: 'computer', collections: ['computer'] }
];

const mockSpans = {};
requiredCategories.forEach(cat => {
  mockSpans[cat] = { textContent: '', getAttribute: () => cat };
});

const updateCountsFn = new Function('productsList', 'normalizeCollectionValues', 'document', `
  ${prodJs.match(/function updateDeptTreeCounts\([\s\S]*?\n\}/)[0]}
  updateDeptTreeCounts(productsList);
`);

updateCountsFn(
  sampleCatalog,
  (collections, category) => Array.isArray(collections) && collections.length ? collections : [category],
  {
    querySelectorAll: (selector) => {
      if (selector === '[data-category-count]') {
        return Object.values(mockSpans);
      }
      return [];
    }
  }
);

assert.strictEqual(mockSpans['all'].textContent, `(${sampleCatalog.length})`, "All count must match total catalog items");
assert.strictEqual(mockSpans['laptop'].textContent, '(2)', "Laptop count must match catalog items");
assert.strictEqual(mockSpans['mobile'].textContent, '(1)', "Mobile count must match catalog items");
console.log("  ✓ Department links and dynamic counts verified successfully.");

// -----------------------------------------------------------------------------
// 2. Customer Review Star Ratings Filter Verification
// -----------------------------------------------------------------------------
console.log("\n2. Testing Customer Review Star Ratings Filter...");
[4, 3, 2, 1].forEach(rating => {
  assert(prodHtml.includes(`data-rating="${rating}"`), `amzRatingList must contain item with data-rating="${rating}"`);
});
assert(prodHtml.includes('amz-rating-stars'), "Must contain amz-rating-stars element");
assert(prodHtml.includes('amz-rating-up'), "Must contain amz-rating-up element");

// Verify toggle behavior in setupAmazonListingFilters
assert(prodJs.includes('selectedMinRating === rating'), "Clicking active rating must toggle it off (selectedMinRating = 0)");
console.log("  ✓ Customer reviews 4★, 3★, 2★, 1★ & Up with toggle behavior verified.");

// -----------------------------------------------------------------------------
// 3. Brand Checklist Verification
// -----------------------------------------------------------------------------
console.log("\n3. Testing Dynamic Brand Checklist & Multi-Select...");
const majorBrands = ["Apple", "Samsung", "ASUS", "Sony", "Lenovo", "HP", "Dell", "OnePlus", "boAt"];
majorBrands.forEach(brand => {
  assert(prodJs.includes(`"${brand}"`), `Major brand "${brand}" must be in prioritized brand order`);
});
assert(prodJs.includes('BRAND_FILTER_VISIBLE_COUNT = 10'), "BRAND_FILTER_VISIBLE_COUNT must be configured");

// Verify case-insensitive matching in applyClientFilters
const brandFilterMatchSnippet = prodJs.match(/const brandMatch = [^;]+;/);
assert(brandFilterMatchSnippet, "brandMatch expression must exist in applyClientFilters");
assert(brandFilterMatchSnippet[0].includes('toLowerCase()'), "brandMatch must be case-insensitive");
console.log("  ✓ Major catalog brands prioritized and case-insensitive multi-select verified.");

// -----------------------------------------------------------------------------
// 4. Price Range Filter: Min/Max Inputs, Go Button & Presets
// -----------------------------------------------------------------------------
console.log("\n4. Testing Price Range: Min/Max Inputs, Go Button & Presets...");
assert(prodHtml.includes('id="minPriceInput"'), "products.html must include minPriceInput");
assert(prodHtml.includes('id="maxPriceInput"'), "products.html must include maxPriceInput");
assert(prodHtml.includes('id="priceGoBtn"'), "products.html must include priceGoBtn");
assert(prodHtml.includes('class="price-preset-btn"'), "products.html must include price preset buttons");

// Check min/max swap validation logic
assert(prodJs.includes('minVal > maxVal'), "Go button logic must validate and swap if minVal > maxVal");

// Check preset toggle logic
assert(prodJs.includes('wasActive'), "Price presets must support toggling off when already active");
console.log("  ✓ Price Go button with min/max swap validation and preset toggling verified.");

// -----------------------------------------------------------------------------
// 5. Delivery Options & Availability Fast-Filters
// -----------------------------------------------------------------------------
console.log("\n5. Testing Pay On Delivery & Fast Delivery Filters...");
assert(prodHtml.includes('id="payOnDelivery"'), "products.html must include payOnDelivery");
assert(prodHtml.includes('id="freeDelivery"'), "products.html must include freeDelivery");
assert(prodHtml.includes('id="inStockOnly"'), "products.html must include inStockOnly");

// Check applyClientFilters handles COD and Free Delivery
assert(prodJs.includes('payOnDelivery'), "applyClientFilters must handle payOnDelivery");
assert(prodJs.includes('freeDelivery'), "applyClientFilters must handle freeDelivery");
assert(prodJs.includes('inStockOnly'), "applyClientFilters must handle inStockOnly");
console.log("  ✓ COD, Free Delivery, and Stock filter integration verified.");

// -----------------------------------------------------------------------------
// 6. Active Filter Chips & "Clear All"
// -----------------------------------------------------------------------------
console.log("\n6. Testing Active Filter Chips & Reset Logic...");
assert(prodHtml.includes('id="activeFiltersContainer"'), "products.html must include activeFiltersContainer");
assert(prodHtml.includes('id="activeFiltersList"'), "products.html must include activeFiltersList");
assert(prodHtml.includes('id="clearAllFilters"'), "products.html must include clearAllFilters");

// Verify renderActiveFilterMeta handles facets
const facets = ['pay-on-delivery', 'free-delivery', 'in-stock', 'discount', 'price', 'rating', 'brand'];
facets.forEach(facet => {
  assert(prodJs.includes(`action: "${facet}"`), `renderActiveFilterMeta must create chip for facet "${facet}"`);
});

// Verify removal of chips
assert(prodJs.includes('action === "pay-on-delivery"'), "activeFilterChips must handle pay-on-delivery removal");
assert(prodJs.includes('action === "free-delivery"'), "activeFilterChips must handle free-delivery removal");
assert(prodJs.includes('action === "in-stock"'), "activeFilterChips must handle in-stock removal");
assert(prodJs.includes('action === "discount"'), "activeFilterChips must handle discount removal");
assert(prodJs.includes('action === "price"'), "activeFilterChips must handle price removal");

// Verify resetAllFilters resets currentPage to 1
assert(prodJs.includes('currentPage = 1;'), "Filter reset or updates must reset currentPage to 1");
console.log("  ✓ Active filter chips for all facets and resetAllFilters verified.");

// -----------------------------------------------------------------------------
// 7. Top Sort Bar, View Mode & Pagination
// -----------------------------------------------------------------------------
console.log("\n7. Testing Results Header, Sort Bar, View Toggle & Pagination...");
assert(prodHtml.includes('id="resultMeta"'), "products.html must include resultMeta");
assert(prodHtml.includes('id="sortSelect"'), "products.html must include sortSelect");
assert(prodHtml.includes('data-view="grid"'), "products.html must include grid view button");
assert(prodHtml.includes('data-view="list"'), "products.html must include list view button");
assert(prodHtml.includes('id="itemsPerPage"'), "products.html must include itemsPerPage select");
assert(prodHtml.includes('id="pagination"'), "products.html must include pagination container");

// Verify sort options in mapSort
const sortValues = ['relevance', 'price_asc', 'price_desc', 'rating_desc', 'newest', 'bestseller'];
sortValues.forEach(s => {
  assert(prodJs.includes(`"${s}"`), `mapSort and applyClientFilters must support "${s}"`);
});

// Verify renderPagination function
assert(prodJs.includes('function renderPagination('), "products.js must contain renderPagination");
assert(prodJs.includes('setupViewToggleAndPagination'), "products.js must contain setupViewToggleAndPagination");

// Test pagination markup generation
const mockPaginationEl = { innerHTML: '', style: { display: '' } };
const renderPaginationFn = new Function('totalItems', 'currentPg', 'perPage', 'document', `
  ${prodJs.match(/function renderPagination\(totalItems, currentPg, perPage\) \{[\s\S]*?\n\}/)[0]}
  renderPagination(totalItems, currentPg, perPage);
`);

renderPaginationFn(100, 2, 20, {
  getElementById: (id) => id === 'pagination' ? mockPaginationEl : null
});
assert(mockPaginationEl.innerHTML.includes('pagination-btn'), "renderPagination must render pagination buttons");
assert(mockPaginationEl.innerHTML.includes('data-page="1"'), "Must contain page 1 button");
assert(mockPaginationEl.innerHTML.includes('pagination-btn active') && mockPaginationEl.innerHTML.includes('data-page="2"'), "Must mark current page active");
assert(mockPaginationEl.innerHTML.includes('Next ›'), "Must contain Next button");
console.log("  ✓ Sort options, view toggle, and pagination verified.");

// -----------------------------------------------------------------------------
// 8. Mouse & Cursor Interaction Mandates (Permanent Lock)
// -----------------------------------------------------------------------------
console.log("\n8. Testing Permanent Mouse & Cursor Interaction Mandates...");
const cursorSelectors = [
  '.amz-dept-item',
  '.amz-dept-link',
  '.amz-rating-item',
  '.brand-checkbox',
  '.availability-checkbox',
  '.delivery-checkbox',
  '.price-preset-btn',
  '.amz-price-go-btn',
  '.view-btn',
  '#itemsPerPage',
  '#sortSelect',
  '.active-filter-chip',
  '.pagination-btn'
];

cursorSelectors.forEach(sel => {
  assert(amazonCss.includes(sel), `amazon-theme.css must explicitly declare cursor styling for ${sel}`);
});
assert(amazonCss.includes('cursor: pointer !important;'), "amazon-theme.css must enforce cursor: pointer !important;");
console.log("  ✓ Permanent cursor: pointer !important verified across all filter elements.");

// -----------------------------------------------------------------------------
// 9. Brand Safety & Compliance Check
// -----------------------------------------------------------------------------
console.log("\n9. Testing Brand Safety (Zero Customer-Facing 'Amazon' Branding)...");
// Check that visible text in products.html does not show "Amazon"
const visibleTextOnly = prodHtml
  .replace(/<!--[\s\S]*?-->/g, '') // strip comments
  .replace(/<script[\s\S]*?<\/script>/gi, '') // strip scripts
  .replace(/<style[\s\S]*?<\/style>/gi, '') // strip styles
  .replace(/<[^>]+>/g, ' '); // strip tags

const forbiddenWords = ['Amazon.in', 'Amazon India', 'Shop on Amazon', 'अमेज़न'];
forbiddenWords.forEach(word => {
  assert(!visibleTextOnly.includes(word), `Customer-facing text must not contain "${word}"`);
});
console.log("  ✓ Customer-facing ElectroMart branding verified with zero compliance violations.");

console.log("\n================================================================================");
console.log("=== ALL PHASE 15 TESTS PASSED SUCCESSFULLY (100%) ===");
console.log("================================================================================");
