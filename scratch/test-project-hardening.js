const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('TEST SUITE: ElectroMart Project Hardening & Audit Fixes');
console.log('====================================================');

const ROOT = path.resolve(__dirname, '..');

// 1. Check AGENTS.md exists
console.log('\n[TEST 1] Verifying AGENTS.md existence & content...');
const agentsMdPath = path.join(ROOT, 'AGENTS.md');
assert.ok(fs.existsSync(agentsMdPath), 'AGENTS.md must exist in root');
const agentsContent = fs.readFileSync(agentsMdPath, 'utf8');
assert.ok(agentsContent.includes('AI Agent Guidelines'), 'AGENTS.md must contain guidelines title');
assert.ok(agentsContent.includes('products-data.js'), 'AGENTS.md must mention products-data.js');
assert.ok(agentsContent.includes('translations.js'), 'AGENTS.md must mention translations.js');
console.log('✓ PASS: AGENTS.md is properly established.');

// 2. Check index.html DOCTYPE
console.log('\n[TEST 2] Verifying index.html DOCTYPE on line 1...');
const indexPath = path.join(ROOT, 'index.html');
const indexContent = fs.readFileSync(indexPath, 'utf8');
const indexLines = indexContent.trim().split('\n');
assert.equal(indexLines[0].trim().toLowerCase(), '<!doctype html>', 'Line 1 of index.html must be <!DOCTYPE html>');
console.log('✓ PASS: index.html has strict <!DOCTYPE html> on line 1.');

// 3. Check NO scripts after </body> across all HTML files
console.log('\n[TEST 3] Scanning all HTML files for misplaced scripts after </body>...');
const allFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
let misplacedCount = 0;
allFiles.forEach(file => {
  const content = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const bodyClose = content.lastIndexOf('</body>');
  const htmlClose = content.lastIndexOf('</html>');
  if (bodyClose > -1) {
    const afterBody = content.substring(bodyClose + 7, htmlClose > -1 ? htmlClose : undefined);
    if (/<script/i.test(afterBody)) {
      misplacedCount++;
      console.error(`  FAIL: ${file} still has scripts after </body>`);
    }
  }
});
assert.equal(misplacedCount, 0, 'No HTML file should have scripts after </body>');
console.log(`✓ PASS: All ${allFiles.length} HTML files have 100% compliant script placement.`);

// 4. Check script execution order in cart.html, orders.html, best-sellers.html, printer.html
console.log('\n[TEST 4] Verifying script loading order in key pages...');
const orderedFiles = ['cart.html', 'orders.html', 'best-sellers.html', 'printer.html', 'desktops.html'];
orderedFiles.forEach(file => {
  const content = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const scripts = [];
  const regex = /<script\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    scripts.push(match[1].split('?')[0]);
  }

  const transIdx = scripts.findIndex(s => s.endsWith('translations.js'));
  const catIdx = scripts.findIndex(s => s.endsWith('products-data.js'));
  const baseScript = file.replace('.html', '.js');
  const baseIdx = scripts.findIndex(s => s.endsWith(baseScript));

  assert.ok(transIdx > -1, `${file} must include translations.js`);
  assert.ok(catIdx > -1, `${file} must include products-data.js`);
  assert.ok(baseIdx > -1, `${file} must include ${baseScript}`);
  assert.ok(transIdx < baseIdx, `In ${file}, translations.js (${transIdx}) must load BEFORE ${baseScript} (${baseIdx})`);
  assert.ok(catIdx < baseIdx, `In ${file}, products-data.js (${catIdx}) must load BEFORE ${baseScript} (${baseIdx})`);
  console.log(`  ✓ ${file}: translations (${transIdx}) and catalog (${catIdx}) load before ${baseScript} (${baseIdx})`);
});
console.log('✓ PASS: Key pages have verified correct script loading hierarchy.');

// 5. Check cart.js getCatalogProduct resilience with window.EM_CATALOG_MAP
console.log('\n[TEST 5] Testing cart.js live catalog fallback resilience...');
global.window = {};
global.document = {
  getElementById: () => null,
  addEventListener: () => {}
};
global.localStorage = {
  store: {},
  getItem: function(k) { return this.store[k] || null; },
  setItem: function(k, v) { this.store[k] = String(v); },
  removeItem: function(k) { delete this.store[k]; }
};

// Load products-data.js into global.window
eval(fs.readFileSync(path.join(ROOT, 'products-data.js'), 'utf8'));
assert.ok(global.window.EM_CATALOG_MAP, 'window.EM_CATALOG_MAP must exist');

// Load cart.js into evaluation context
const cartJsContent = fs.readFileSync(path.join(ROOT, 'cart.js'), 'utf8');
// Mock DOM elements that cart.js accesses on load
const mockEl = { 
  innerHTML: '', 
  textContent: '', 
  classList: { toggle: () => {}, add: () => {}, remove: () => {} },
  style: {},
  setAttribute: () => {},
  getAttribute: () => '',
  appendChild: () => {}, 
  addEventListener: () => {} 
};
global.document.getElementById = () => mockEl;

eval(cartJsContent);

// Test getCatalogProduct with HP KP03 battery ID
const testId = 'product_faadad46-7286-8744-5d9a-1263da26d23c';
const product = getCatalogProduct(testId);

assert.ok(product, `getCatalogProduct must resolve product for ${testId}`);
assert.equal(product.id, testId);
assert.equal(product.price, 1399, `Price for HP Battery should be 1399, got ${product.price}`);
assert.ok(product.name.includes('HP') || product.name.includes('Battery'), `Product name should contain HP Battery, got "${product.name}"`);
console.log(`  ✓ Product resolved correctly: "${product.name}" at ₹${product.price}`);
console.log('✓ PASS: Cart live catalog lookup functions flawlessly.');

console.log('\n[TEST 6] Checking ASUS laptop categories in both database snapshots...');
const asusLaptopSkus = [
  'ASUS-ROG-ZEPHYRUS-G14-GA401II-BM131TS',
  'ASUS-TUF-GAMING-A15--FA566IC-HN008T',
  'ASUS-VIVOBOOK-GAMING-F571LH-BQ429T',
  'ASUS-VIVOBOOK-K15-OLED--K513EA-L503TS',
  'ASUS-VIVOBOOK--M515DA-BQ322TS'
];
['db.json', 'db.json.bak'].forEach(fileName => {
  const snapshot = JSON.parse(fs.readFileSync(
    path.join(ROOT, 'backend', 'src', 'data', fileName),
    'utf8'
  ));
  const productsBySku = new Map((snapshot.products || []).map(item => [item.sku, item]));
  asusLaptopSkus.forEach(sku => {
    assert.equal(productsBySku.get(sku)?.category, 'asus-laptop', `${sku} must be categorized as an ASUS laptop in ${fileName}`);
  });
});
console.log('✓ PASS: ASUS laptop categories are consistent in both snapshots.');

console.log('\n[TEST 7] Checking deterministic wishlist screenshot normalization...');
const qaSmokeSource = fs.readFileSync(path.join(ROOT, 'qa-ui-smoke.js'), 'utf8');
const wishlistNormalizerStart = qaSmokeSource.indexOf('if (name === "wishlist") {');
const wishlistNormalizerEnd = qaSmokeSource.indexOf('if (name === "orders") {', wishlistNormalizerStart);
assert(wishlistNormalizerStart > -1 && wishlistNormalizerEnd > wishlistNormalizerStart, 'Wishlist baseline normalization must exist');
const wishlistNormalizer = qaSmokeSource.slice(wishlistNormalizerStart, wishlistNormalizerEnd);
assert(
  wishlistNormalizer.includes('document.body.innerHTML'),
  'Wishlist baseline normalization must replace the dynamic page with a fixed fixture'
);
assert(
  qaSmokeSource.includes('animations: "disabled"') && qaSmokeSource.includes('caret: "hide"'),
  'Wishlist screenshots must disable animations and hide the caret'
);
console.log('✓ PASS: Wishlist screenshots use a fixed, animation-free fixture.');

const authNormalizerStart = qaSmokeSource.indexOf('if (name === "auth") {');
const authNormalizerEnd = qaSmokeSource.indexOf('if (name === "account") {', authNormalizerStart);
assert(authNormalizerStart > -1 && authNormalizerEnd > authNormalizerStart, 'Auth baseline normalization must exist');
const authNormalizer = qaSmokeSource.slice(authNormalizerStart, authNormalizerEnd);
assert(
  authNormalizer.includes('document.querySelectorAll(\'link[rel="stylesheet"], style\')')
    && authNormalizer.includes('document.documentElement.className = ""')
    && authNormalizer.includes('animation: none !important')
    && authNormalizer.includes('caret-color: transparent !important'),
  'Auth baseline fixture must isolate page styles and disable visual effects'
);
const authSmokeStart = qaSmokeSource.indexOf('async function runAuthSmoke(browser) {');
const authSmokeEnd = qaSmokeSource.indexOf('async function runProductDetailSmoke(', authSmokeStart);
assert(authSmokeStart > -1 && authSmokeEnd > authSmokeStart, 'Auth browser smoke must exist');
const authSmokeSourceBlock = qaSmokeSource.slice(authSmokeStart, authSmokeEnd);
assert(
  authSmokeSourceBlock.includes('requestAnimationFrame(() => requestAnimationFrame(resolve))')
    && authSmokeSourceBlock.includes('animations: "disabled"')
    && authSmokeSourceBlock.includes('caret: "hide"'),
  'Auth screenshot capture must wait for stable frames and disable animations and caret'
);

console.log('\n[TEST 8] Checking locale-independent account smoke readiness...');
const authSmoke = authSmokeSourceBlock;
assert(
  authSmoke.includes('h1[data-i18n="your_account_title"]')
    && authSmoke.includes('window.location.pathname === "/account.html"'),
  'Account smoke must wait for the localized account heading on the account route'
);

console.log('\n[TEST 9] Checking the product-detail wishlist smoke hook...');
const productDetailSource = fs.readFileSync(path.join(ROOT, 'product-detail.html'), 'utf8');
assert(
  productDetailSource.includes('id="saveWishlistBtn"')
    && qaSmokeSource.includes('page.click("#saveWishlistBtn")')
    && qaSmokeSource.includes('document.getElementById("saveWishlistBtn")'),
  'Wishlist smoke must use the current product-detail button hook'
);

console.log('\n[TEST 10] Checking product-detail callout container boundaries...');
assert(
  /<\/a>\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*<!-- Phase 45:/.test(productDetailSource),
  'Renewed alternative callout must close before corporate and gift-card callouts'
);

console.log('\n====================================================');
console.log('ALL AUDIT HARDENING TESTS PASSED (10/10)!');
console.log('====================================================\n');
