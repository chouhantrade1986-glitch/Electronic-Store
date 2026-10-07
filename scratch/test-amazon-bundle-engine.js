const assert = require('assert');
const fs = require('fs');
const path = require('path');

const projectDir = path.join(__dirname, '..');
const bundleEnginePath = path.join(projectDir, 'bundle-engine.js');
const productDetailPath = path.join(projectDir, 'product-detail.js');
const translationsPath = path.join(projectDir, 'translations.js');
const productDetailHtmlPath = path.join(projectDir, 'product-detail.html');

console.log('==================================================');
console.log('TEST SUITE: ElectroMart FBT Bundle Engine (Phase 34)');
console.log('==================================================');

assert(fs.existsSync(bundleEnginePath), 'bundle-engine.js must exist before the bundle logic is implemented');
assert(fs.existsSync(productDetailPath), 'product-detail.js must exist');
assert(fs.existsSync(productDetailHtmlPath), 'product-detail.html must exist');
assert(fs.existsSync(translationsPath), 'translations.js must exist');

const bundleEngineSource = fs.readFileSync(bundleEnginePath, 'utf8');
assert(bundleEngineSource.includes('getBundleRecommendations'), 'bundle-engine.js must expose getBundleRecommendations(productId, options)');
assert(bundleEngineSource.includes('stock') || bundleEngineSource.includes('fallback'), 'bundle-engine.js must include stock-aware fallback matching');

const productDetailSource = fs.readFileSync(productDetailPath, 'utf8');
assert(productDetailSource.includes('renderFrequentlyBoughtTogether') || productDetailSource.includes('getBundleRecommendations'), 'PDP must integrate a FBT bundle renderer or engine hook');
assert(productDetailSource.includes('addBundleBtn') || productDetailSource.includes('fbt'), 'PDP bundle CTA and FBT DOM contract must be present');

const htmlSource = fs.readFileSync(productDetailHtmlPath, 'utf8');
assert(htmlSource.includes('frequentlyBoughtContainer') || htmlSource.includes('fbt'), 'product-detail.html must expose the FBT container for bundle rendering');

const translationsSource = fs.readFileSync(translationsPath, 'utf8');
const expectedBundleKeys = [
  'fbt_title',
  'fbt_subtitle',
  'fbt_bundle_cta',
  'fbt_bundle_discount_label',
  'fbt_add_selected_to_cart',
  'fbt_savings_total',
  'fbt_empty_state',
  'bundle_recommendation_title'
];

for (const key of expectedBundleKeys) {
  assert(translationsSource.includes(`"${key}"`), `translations.js must include bundle key: ${key}`);
}

console.log('PASS: bundle engine API, PDP hooks, DOM contract, and i18n keys were all verified.');
console.log('\nThis suite is expected to fail until the Phase 34 implementation is added.');
