const fs = require('fs');
const assert = require('assert');

console.log("Testing Amazon Search Button, Lens Icon & Category Facade Hitbox Isolation...");

const headerHtml = fs.readFileSync('header.html', 'utf8');
const headerJs = fs.readFileSync('header.js', 'utf8');
const sharedSearchJs = fs.readFileSync('shared-search.js', 'utf8');
const amazonCss = fs.readFileSync('amazon-theme.css', 'utf8');
const productsHtml = fs.readFileSync('products.html', 'utf8');
const productsJs = fs.readFileSync('products.js', 'utf8');
const productsCss = fs.readFileSync('products.css', 'utf8');
const sharedSearchCss = fs.readFileSync('shared-search.css', 'utf8');

// 1. Check Authentic Amazon Search Lens Icon in header.html, header.js, and shared-search.js
const amazonLensSvg = '<circle cx="10.5" cy="10.5" r="6.5"></circle>';
const amazonLensLine = '<line x1="15.5" y1="15.5" x2="21" y2="21"></line>';

assert(headerHtml.includes(amazonLensSvg) && headerHtml.includes(amazonLensLine), 'header.html must contain authentic Amazon search lens icon SVG');
assert(headerJs.includes(amazonLensSvg) && headerJs.includes(amazonLensLine), 'header.js must contain authentic Amazon search lens icon SVG');
assert(sharedSearchJs.includes(amazonLensSvg) && sharedSearchJs.includes(amazonLensLine), 'shared-search.js must contain authentic Amazon search lens icon SVG');

// 2. Check Compact Amazon Search Button sizing (45px width) in amazon-theme.css
assert(amazonCss.includes('width: 45px !important'), 'amazon-theme.css must enforce 45px width for search submit button');
assert(amazonCss.includes('flex: 0 0 45px !important'), 'amazon-theme.css must enforce flex: 0 0 45px for search submit button');
assert(amazonCss.includes('background: #febd69 !important'), 'amazon-theme.css must style search button in Amazon yellow #febd69');

// 3. Check Category Facade Hitbox Isolation in amazon-theme.css
assert(amazonCss.includes('max-width: 65px !important'), 'amazon-theme.css must cap facade max-width to 65px');
assert(amazonCss.includes('overflow: hidden !important'), 'amazon-theme.css must set overflow: hidden on facade wrap and select');
assert(amazonCss.includes('min-width: 0 !important'), 'amazon-theme.css must set min-width: 0 on facade select to prevent horizontal overflow');

// 4. Check that Search Input Wrap and Input have priority z-index and cursor: text
assert(amazonCss.includes('cursor: text !important'), 'amazon-theme.css must ensure #searchInput has cursor: text');
assert(amazonCss.includes('pointer-events: auto !important'), 'amazon-theme.css must ensure #searchInput has pointer-events: auto');

// 5. Check products.html sidebar ID and products.js isolation
assert(productsHtml.includes('id="sidebarCategoryFilter"'), 'products.html sidebar select must have id="sidebarCategoryFilter" to avoid ID collision with header');
assert(productsJs.includes('sidebarCategoryFilter'), 'products.js must bind to sidebarCategoryFilter');
assert(productsJs.includes('headerCategoryFilter'), 'products.js must handle headerCategoryFilter cleanly without overwriting header select options');

// 6. Check shared-search.css and products.css for facade select min-width overrides
assert(sharedSearchCss.includes('.nav-search-facade-wrap .search-context-select'), 'shared-search.css must override .search-context-select inside facade');
assert(productsCss.includes('.nav-search-facade-wrap .search-context-select'), 'products.css must override .search-context-select inside facade');

console.log("✓ All Amazon Search Button & Category Facade Hitbox Isolation assertions PASSED!");
