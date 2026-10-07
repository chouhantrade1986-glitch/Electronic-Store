const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.resolve(__dirname, '..');

console.log("Starting test-amazon-compare-hub.js (Phase 19)...");

// 1. Check compare.html structure & script hierarchy
const compareHtml = fs.readFileSync(path.join(projectDir, 'compare.html'), 'utf8');

assert(compareHtml.startsWith('<!DOCTYPE html>'), "compare.html must start with <!DOCTYPE html>");
const doctypeMatches = compareHtml.match(/<!DOCTYPE html>/gi) || [];
assert.strictEqual(doctypeMatches.length, 1, "Only one <!DOCTYPE html> declaration allowed in compare.html");

assert(compareHtml.includes('amazon-theme.css'), "compare.html includes amazon-theme.css");
assert(compareHtml.includes('compare.css'), "compare.html includes compare.css");
assert(compareHtml.includes('data-i18n="compare_title">Compare Products</h1>'), "Includes h1 with data-i18n='compare_title'");

// Check script execution hierarchy per AGENT_INSTRUCTIONS.md
const scripts = [];
const scriptRegex = /<script\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
let match;
while ((match = scriptRegex.exec(compareHtml)) !== null) {
  scripts.push(match[1].split('?')[0]);
}

const transIdx = scripts.findIndex(s => s.endsWith('translations.js'));
const catIdx = scripts.findIndex(s => s.endsWith('products-data.js'));
const busIdx = scripts.findIndex(s => s.endsWith('universal-i18n-bus.js'));
const headerIdx = scripts.findIndex(s => s.endsWith('header.js'));
const menuIdx = scripts.findIndex(s => s.endsWith('menu-manager.js'));
const authIdx = scripts.findIndex(s => s.endsWith('auth-state.js'));
const searchIdx = scripts.findIndex(s => s.endsWith('shared-search.js'));
const compareIdx = scripts.findIndex(s => s.endsWith('compare.js'));

assert(transIdx > -1, "translations.js is present");
assert(catIdx > -1, "products-data.js is present");
assert(busIdx > -1, "universal-i18n-bus.js is present");
assert(headerIdx > -1, "header.js is present");
assert(menuIdx > -1, "menu-manager.js is present");
assert(authIdx > -1, "auth-state.js is present");
assert(searchIdx > -1, "shared-search.js is present");
assert(compareIdx > -1, "compare.js is present");

assert(transIdx < catIdx, "translations.js loads before products-data.js");
assert(catIdx < busIdx, "products-data.js loads before universal-i18n-bus.js");
assert(busIdx < headerIdx, "universal-i18n-bus.js loads before header.js");
assert(headerIdx < menuIdx, "header.js loads before menu-manager.js");
assert(menuIdx < authIdx, "menu-manager.js loads before auth-state.js");
assert(authIdx < searchIdx, "auth-state.js loads before shared-search.js");
assert(searchIdx < compareIdx, "shared-search.js loads before compare.js");

console.log("  ✓ compare.html markup and script hierarchy verified.");

// 2. Check UI & Toolbar elements
assert(compareHtml.includes('id="compareToolbar"'), "compare.html contains #compareToolbar");
assert(compareHtml.includes('id="highlightDiffToggle"'), "compare.html contains #highlightDiffToggle");
assert(compareHtml.includes('id="shareCompareBtn"'), "compare.html contains #shareCompareBtn");
assert(compareHtml.includes('id="clearAllCompareBtn"'), "compare.html contains #clearAllCompareBtn");
assert(compareHtml.includes('id="openAddProductModalBtn"'), "compare.html contains #openAddProductModalBtn");

// Check Empty state and Presets
assert(compareHtml.includes('id="emptyCompareState"'), "compare.html contains #emptyCompareState");
assert(compareHtml.includes('id="comparePresetsContainer"'), "compare.html contains #comparePresetsContainer");
assert(compareHtml.includes('data-preset="laptops"'), "compare.html contains laptops preset");
assert(compareHtml.includes('data-preset="audio"'), "compare.html contains audio preset");
assert(compareHtml.includes('data-preset="mobiles"'), "compare.html contains mobiles preset");
assert(compareHtml.includes('data-preset="components"'), "compare.html contains components preset");

// Check Matrix Table
assert(compareHtml.includes('id="comparisonTableWrapper"'), "compare.html contains #comparisonTableWrapper");
assert(compareHtml.includes('id="comparisonTableElement"'), "compare.html contains #comparisonTableElement");
assert(compareHtml.includes('id="productHeaderRow"'), "compare.html contains #productHeaderRow");
assert(compareHtml.includes('id="comparedItemsCountBadge"'), "compare.html contains #comparedItemsCountBadge");
assert(compareHtml.includes('id="comparisonBody"'), "compare.html contains #comparisonBody");

// Check Modal Elements
assert(compareHtml.includes('id="addProductModal"'), "compare.html contains #addProductModal");
assert(compareHtml.includes('id="compareModalTitle"'), "compare.html contains #compareModalTitle");
assert(compareHtml.includes('id="closeAddProductModalBtn"'), "compare.html contains #closeAddProductModalBtn");
assert(compareHtml.includes('id="compareModalSearchInput"'), "compare.html contains #compareModalSearchInput");
assert(compareHtml.includes('id="modalCatPills"'), "compare.html contains #modalCatPills");
assert(compareHtml.includes('id="modalProductsResultsList"'), "compare.html contains #modalProductsResultsList");

console.log("  ✓ compare.html toolbar, empty state, matrix table, and modal elements verified.");

// 3. Check compare.css styles
const compareCss = fs.readFileSync(path.join(projectDir, 'compare.css'), 'utf8');
assert(compareCss.includes('.diff-highlight'), "compare.css contains .diff-highlight");
assert(compareCss.includes('.sticky-feature-header'), "compare.css contains .sticky-feature-header");
assert(compareCss.includes('.amz-compare-add-slot'), "compare.css contains .amz-compare-add-slot");
assert(compareCss.includes('.amz-btn-add-cart'), "compare.css contains .amz-btn-add-cart");
assert(compareCss.includes('.amz-btn-buy-now'), "compare.css contains .amz-btn-buy-now");
assert(compareCss.includes('.amz-compare-modal-backdrop'), "compare.css contains .amz-compare-modal-backdrop");
assert(compareCss.includes('.modal-cat-pill'), "compare.css contains .modal-cat-pill");

console.log("  ✓ compare.css styles verified.");

// 4. Check translations.js 11-language coverage for comparison keys
const transCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
assert(transCode.includes('AMAZON_COMPARE_HUB_I18N'), "translations.js includes AMAZON_COMPARE_HUB_I18N");

const sandbox = {
  localStorage: { getItem: () => 'en', setItem: () => {} },
  document: {
    readyState: 'complete',
    addEventListener: () => {},
    querySelectorAll: () => [],
    getElementById: () => null
  }
};
const fn = new Function('window', 'localStorage', 'document', transCode);
fn(sandbox, sandbox.localStorage, sandbox.document);

const translations = sandbox.EM_TRANSLATIONS;
assert(translations, "window.EM_TRANSLATIONS is defined");

const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const requiredKeys = [
  'compare_title',
  'compare_subtitle',
  'compare_highlight_diff',
  'compare_clear_all',
  'compare_share',
  'compare_add_slot',
  'compare_empty_title',
  'compare_empty_desc',
  'compare_browse_btn',
  'compare_popular_presets',
  'compare_modal_title',
  'compare_sec_overview',
  'compare_sec_technical',
  'compare_sec_warranty'
];

languages.forEach(lang => {
  assert(translations[lang], `Language '${lang}' must exist in translations`);
  requiredKeys.forEach(key => {
    assert(translations[lang][key], `Key '${key}' must exist for language '${lang}'`);
  });
});

console.log("  ✓ translations.js 11-language coverage for comparison verified.");

// 5. Brand Safety: 0 visible Amazon brand references
const strippedHtml = compareHtml
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '');

const FORBIDDEN_VISIBLE_BRAND_REGEX = /\b(amazon|amazons)\b|अमेज़न|अमेजन|अमेजॉन/i;
const textMatches = strippedHtml.match(/>([^<]+)</g) || [];
textMatches.forEach(tm => {
  const text = tm.slice(1, -1).trim();
  assert(!FORBIDDEN_VISIBLE_BRAND_REGEX.test(text), `compare.html visible text must not contain Amazon: "${text}"`);
});

console.log("  ✓ Legal brand compliance verified (100% ElectroMart).");
console.log("\nALL PHASE 19 AMAZON COMPARE HUB TESTS PASSED (100%)!\n");
