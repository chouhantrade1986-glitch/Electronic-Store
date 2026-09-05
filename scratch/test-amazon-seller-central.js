/**
 * Test Suite: Authentic Amazon India Seller Central & Departmental Hubs (Phase 12)
 * Verifies all 8 department pages, shared runtime, 11-language i18n, and brand safety.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');

console.log('===============================================================');
console.log('TEST SUITE: Phase 12 — Amazon Seller Central & Department Hubs');
console.log('===============================================================');

// 1. Check all 8 department HTML pages exist
const departments = [
  { id: 'dashboard', file: 'admin-dashboard.html', script: 'admin-dashboard.js' },
  { id: 'orders', file: 'admin-orders.html', script: 'admin-orders.js' },
  { id: 'listing', file: 'admin-listing.html', script: 'admin-listing.js' },
  { id: 'analytics', file: 'admin-analytics.html', script: 'admin-analytics.js' },
  { id: 'after-sales', file: 'admin-after-sales.html', script: 'admin-after-sales.js' },
  { id: 'users', file: 'admin-users.html', script: 'admin-users.js' },
  { id: 'audit', file: 'admin-audit.html', script: 'admin-audit.js' },
  { id: 'settings', file: 'admin-settings.html', script: 'admin-settings.js' }
];

departments.forEach(dept => {
  const htmlPath = path.join(ROOT_DIR, dept.file);
  const jsPath = path.join(ROOT_DIR, dept.script);

  assert.ok(fs.existsSync(htmlPath), `Department HTML file missing: ${dept.file}`);
  assert.ok(fs.existsSync(jsPath), `Department JS file missing: ${dept.script}`);

  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  assert.ok(htmlContent.includes('admin-dashboard.css'), `${dept.file} must link admin-dashboard.css`);
  assert.ok(htmlContent.includes('admin-shared.js'), `${dept.file} must link admin-shared.js`);
  assert.ok(htmlContent.includes('sellerHeaderContainer'), `${dept.file} must have #sellerHeaderContainer`);
  assert.ok(htmlContent.includes(dept.script), `${dept.file} must link its script ${dept.script}`);
});
console.log('PASS: All 8 department HTML & JS pairs exist and link shared assets.');

// 2. Check admin-shared.js
const sharedPath = path.join(ROOT_DIR, 'admin-shared.js');
assert.ok(fs.existsSync(sharedPath), 'admin-shared.js must exist');
const sharedCode = fs.readFileSync(sharedPath, 'utf8');

assert.ok(sharedCode.includes('renderTopbar'), 'admin-shared.js must have renderTopbar');
assert.ok(sharedCode.includes('formatCurrency'), 'admin-shared.js must have formatCurrency');
assert.ok(sharedCode.includes('formatDate'), 'admin-shared.js must have formatDate');
assert.ok(sharedCode.includes('getOrders'), 'admin-shared.js must have getOrders');
assert.ok(sharedCode.includes('saveOrders'), 'admin-shared.js must have saveOrders');
assert.ok(sharedCode.includes('getCatalog'), 'admin-shared.js must have getCatalog');
assert.ok(sharedCode.includes('recordAudit'), 'admin-shared.js must have recordAudit');
assert.ok(sharedCode.includes('showToast'), 'admin-shared.js must have showToast');

departments.forEach(dept => {
  assert.ok(sharedCode.includes(dept.file), `admin-shared.js must register ${dept.file} in navigation`);
});
console.log('PASS: admin-shared.js exports all required Seller Central functions.');

// 3. Syntax validation for all 9 admin scripts
const allScripts = [
  'admin-shared.js',
  'admin-dashboard.js',
  'admin-orders.js',
  'admin-listing.js',
  'admin-analytics.js',
  'admin-after-sales.js',
  'admin-users.js',
  'admin-audit.js',
  'admin-settings.js'
];

allScripts.forEach(script => {
  const fullPath = path.join(ROOT_DIR, script);
  execSync(`node -c "${fullPath}"`, { stdio: 'pipe' });
});
console.log('PASS: All 9 Seller Central scripts pass JavaScript syntax validation (node -c).');

// 4. Verify i18n translation keys in translations.js across all 11 languages
const translationsPath = path.join(ROOT_DIR, 'translations.js');
const translationsCode = fs.readFileSync(translationsPath, 'utf8');

const expectedKeys = [
  'seller_central',
  'seller_central_title',
  'admin_panel_access',
  'admin_panel_desc',
  'signin_as_admin',
  'go_to_account',
  'dept_dashboard',
  'dept_orders',
  'dept_inventory',
  'dept_analytics',
  'dept_returns',
  'dept_customers',
  'dept_audit',
  'dept_settings',
  'kpi_todays_sales',
  'kpi_pending_orders',
  'kpi_low_stock',
  'kpi_open_claims',
  'kpi_account_health',
  'add_product',
  'fulfill_order',
  'print_invoice'
];

const langs = ['en', 'hi', 'ta', 'te', 'mr', 'bn', 'kn', 'ml', 'ur', 'pa', 'gu'];
langs.forEach(lang => {
  const langBlockRegex = new RegExp(`    ${lang}:\\s*\\{([\\s\\S]*?)\\n    \\}`, 'm');
  const match = translationsCode.match(langBlockRegex);
  assert.ok(match, `Language block for ${lang} not found in translations.js`);
  const block = match[1];

  expectedKeys.forEach(k => {
    assert.ok(block.includes(`${k}:`), `Language ${lang} is missing translation key: ${k}`);
  });
});
console.log(`PASS: All 11 regional Indian languages contain all ${expectedKeys.length} Seller Central i18n keys!`);

// 5. Brand Safety: Zero occurrences of customer-visible Amazon branding in admin pages
departments.forEach(dept => {
  const content = fs.readFileSync(path.join(ROOT_DIR, dept.file), 'utf8');
  // Strip comments
  const noComments = content.replace(/<!--[\s\S]*?-->/g, '');
  // Disallow "Amazon" or "अमेज़न" outside of css classes (classes are internal)
  const textWithoutTags = noComments.replace(/<[^>]+>/g, ' ');
  assert.ok(!/\bamazon\b/i.test(textWithoutTags), `${dept.file} contains forbidden visible Amazon text!`);
  assert.ok(!textWithoutTags.includes('अमेज़न'), `${dept.file} contains forbidden visible Hindi Amazon text!`);
});
console.log('PASS: 100% Brand Safety: Zero customer-visible Amazon text found in any Seller Central page.');

console.log('\n✓ ALL PHASE 12 SELLER CENTRAL TESTS PASSED PERFECTLY!\n');
