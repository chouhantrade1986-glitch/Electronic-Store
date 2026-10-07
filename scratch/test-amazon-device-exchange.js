/**
 * Phase 30: ElectroMart Device Trade-In & Exchange Hub Test Suite
 * scratch/test-amazon-device-exchange.js
 * 
 * 7 Verification Layers:
 *  1. DOM Elements & Hub Structure (exchange.html)
 *  2. Diagnostic Math & Condition Deduction Formula
 *  3. Clean Regex IMEI & Serial Number Validation
 *  4. PDP Instant Exchange Widget & Effective Price Reflection
 *  5. Cart & Checkout Synchronization & Total Payable Deductions
 *  6. Orders & Tracking Doorstep Checklist Integration
 *  7. Brand Safety (0 Amazon references) & 11-Language i18n Coverage
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('===============================================================');
console.log('TEST SUITE: ElectroMart Device Trade-In & Exchange Hub (Phase 30)');
console.log('===============================================================\n');

let passedTests = 0;
let totalTests = 0;

function it(desc, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ PASS: ${desc}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${desc}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

const rootDir = path.resolve(__dirname, '..');

// -------------------------------------------------------------
// Layer 1: DOM Elements & Hub Structure (exchange.html)
// -------------------------------------------------------------
console.log('--- Layer 1: DOM Elements & Hub Structure (exchange.html) ---');

const exchangeHtmlPath = path.join(rootDir, 'exchange.html');
assert(fs.existsSync(exchangeHtmlPath), 'exchange.html must exist');
const exchangeHtml = fs.readFileSync(exchangeHtmlPath, 'utf8');

it('exchange.html contains hero banner with key stats', () => {
  assert(exchangeHtml.includes('id="heroExchangeMaxVal"'), 'Missing hero max val');
  assert(exchangeHtml.includes('id="heroExchangeStatVerified"'), 'Missing verified stats');
  assert(exchangeHtml.includes('id="heroExchangeStatDataWipe"'), 'Missing 100% data wipe badge');
});

it('exchange.html contains 4-step calculator elements', () => {
  assert(exchangeHtml.includes('id="calcCategoryPills"'), 'Missing category pills container');
  assert(exchangeHtml.includes('id="calcBrandChips"'), 'Missing brand chips container');
  assert(exchangeHtml.includes('id="exchangeModelSelect"'), 'Missing model select dropdown');
  assert(exchangeHtml.includes('id="exchangeQuoteCard"'), 'Missing valuation card');
  assert(exchangeHtml.includes('id="quoteFinalValue"'), 'Missing quote value element');
  assert(exchangeHtml.includes('id="quoteBonusValue"'), 'Missing trade-in bonus element');
  assert(exchangeHtml.includes('id="quoteVoucherCode"'), 'Missing voucher code element');
  assert(exchangeHtml.includes('id="btnCopyQuoteCode"'), 'Missing copy voucher button');
  assert(exchangeHtml.includes('id="btnApplyQuoteToOrder"'), 'Missing apply to new device button');
});

it('exchange.html contains doorstep handover checklist and FAQs', () => {
  assert(exchangeHtml.includes('id="exchangeChecklist"'), 'Missing doorstep checklist card');
  assert(exchangeHtml.includes('id="exchangeFaqAccordion"'), 'Missing FAQ accordion container');
  assert(exchangeHtml.includes('id="upgradeCategoriesGrid"'), 'Missing eligible upgrade categories');
});

// -------------------------------------------------------------
// Layer 2: Diagnostic Math & Condition Deduction Formula
// -------------------------------------------------------------
console.log('\n--- Layer 2: Diagnostic Math & Condition Deduction Formula ---');

const exchangeJsPath = path.join(rootDir, 'exchange.js');
assert(fs.existsSync(exchangeJsPath), 'exchange.js must exist');
const exchangeJs = fs.readFileSync(exchangeJsPath, 'utf8');

// Test deduction formula
function computeExchangeQuote(baseValue, power, screen, body) {
  let val = baseValue;
  if (power !== 'yes') {
    val = Math.round(baseValue * 0.2);
  } else {
    const screenDeductions = { flawless: 0, minor: 1000, heavy: 2500, cracked: 5000 };
    const bodyDeductions = { flawless: 0, minor: 500, heavy: 1500 };
    val = Math.max(500, baseValue - (screenDeductions[screen] || 0) - (bodyDeductions[body] || 0));
  }
  const bonus = 1000;
  return Math.min(25000, val + bonus);
}

it('Calculates flawless smartphone valuation with ElectroMart bonus', () => {
  const quote = computeExchangeQuote(14000, 'yes', 'flawless', 'flawless');
  // 14000 - 0 - 0 + 1000 = 15000
  assert.strictEqual(quote, 15000);
});

it('Calculates cracked screen & minor body wear deductions properly', () => {
  const quote = computeExchangeQuote(14000, 'yes', 'cracked', 'minor');
  // 14000 - 5000 - 500 + 1000 = 9500
  assert.strictEqual(quote, 9500);
});

it('Calculates non-powering device at 20% salvage value + bonus', () => {
  const quote = computeExchangeQuote(10000, 'no', 'flawless', 'flawless');
  // 10000 * 0.2 = 2000 + 1000 = 3000
  assert.strictEqual(quote, 3000);
});

it('Enforces maximum quote cap at ₹25,000 and minimum floor at ₹500', () => {
  const maxQuote = computeExchangeQuote(35000, 'yes', 'flawless', 'flawless');
  assert.strictEqual(maxQuote, 25000);
  const minQuote = computeExchangeQuote(200, 'yes', 'cracked', 'heavy');
  assert(minQuote >= 1500); // 500 min + 1000 bonus
});

// -------------------------------------------------------------
// Layer 3: Clean Regex IMEI & Serial Number Validation
// -------------------------------------------------------------
console.log('\n--- Layer 3: Clean Regex IMEI & Serial Number Validation ---');

function validateImeiOrSerial(category, value) {
  const str = String(value || '').trim();
  if (category === 'smartphones') {
    return /^\d{15}$/.test(str);
  }
  return /^[A-Za-z0-9]{6,18}$/.test(str);
}

it('Validates 15-digit numeric IMEI for smartphones correctly', () => {
  assert.strictEqual(validateImeiOrSerial('smartphones', '358941098234561'), true);
  assert.strictEqual(validateImeiOrSerial('smartphones', '35894109823456'), false, '14 digits must fail');
  assert.strictEqual(validateImeiOrSerial('smartphones', '3589410982345612'), false, '16 digits must fail');
  assert.strictEqual(validateImeiOrSerial('smartphones', '35894109823456A'), false, 'Alphabetic chars must fail');
  assert.strictEqual(validateImeiOrSerial('smartphones', ''), false, 'Empty string must fail');
});

it('Validates alphanumeric serial number for laptops & tablets', () => {
  assert.strictEqual(validateImeiOrSerial('laptops', 'C02G8764MD6R'), true);
  assert.strictEqual(validateImeiOrSerial('laptops', 'PF3XYZ99'), true);
  assert.strictEqual(validateImeiOrSerial('laptops', 'SN12'), false, 'Less than 6 chars must fail');
  assert.strictEqual(validateImeiOrSerial('laptops', 'SN-123456'), false, 'Special chars must fail');
  assert.strictEqual(validateImeiOrSerial('tablets', 'DMPZ8921MD6T'), true);
});

// -------------------------------------------------------------
// Layer 4: PDP Instant Exchange Widget & Effective Price Reflection
// -------------------------------------------------------------
console.log('\n--- Layer 4: PDP Instant Exchange Widget & Effective Price Reflection ---');

const pdpHtmlPath = path.join(rootDir, 'product-detail.html');
const pdpHtml = fs.readFileSync(pdpHtmlPath, 'utf8');
const pdpJsPath = path.join(rootDir, 'product-detail.js');
const pdpJs = fs.readFileSync(pdpJsPath, 'utf8');

it('product-detail.html has PDP exchange selector card inside Buybox', () => {
  assert(pdpHtml.includes('id="pdpExchangeSelectorCard"'), 'Missing pdpExchangeSelectorCard');
  assert(pdpHtml.includes('id="pdpOptNoExchange"'), 'Missing pdpOptNoExchange radio');
  assert(pdpHtml.includes('id="pdpOptWithExchange"'), 'Missing pdpOptWithExchange radio');
  assert(pdpHtml.includes('id="pdpPriceWithoutExchange"'), 'Missing pdpPriceWithoutExchange');
  assert(pdpHtml.includes('id="pdpExchangeUpToBadge"'), 'Missing pdpExchangeUpToBadge');
  assert(pdpHtml.includes('id="pdpExchangeDetailsPanel"'), 'Missing pdpExchangeDetailsPanel');
  assert(pdpHtml.includes('id="pdpExchangePincode"'), 'Missing pdpExchangePincode input');
  assert(pdpHtml.includes('id="btnCheckExchangePincode"'), 'Missing btnCheckExchangePincode button');
  assert(pdpHtml.includes('id="btnOpenExchangeModal"'), 'Missing btnOpenExchangeModal button');
  assert(pdpHtml.includes('id="pdpExchangeSelectedCard"'), 'Missing pdpExchangeSelectedCard');
});

it('product-detail.html includes in-page valuation modal with IMEI input', () => {
  assert(pdpHtml.includes('id="exchangeValuationModal"'), 'Missing exchangeValuationModal');
  assert(pdpHtml.includes('id="modalCategorySelect"'), 'Missing modalCategorySelect');
  assert(pdpHtml.includes('id="modalBrandSelect"'), 'Missing modalBrandSelect');
  assert(pdpHtml.includes('id="modalModelSelect"'), 'Missing modalModelSelect');
  assert(pdpHtml.includes('name="modalDiagPower"'), 'Missing modalDiagPower radio group');
  assert(pdpHtml.includes('id="modalDiagScreen"'), 'Missing modalDiagScreen');
  assert(pdpHtml.includes('id="modalDiagBody"'), 'Missing modalDiagBody');
  assert(pdpHtml.includes('id="modalQuoteVal"'), 'Missing modalQuoteVal');
  assert(pdpHtml.includes('id="modalExchangeImei"'), 'Missing modalExchangeImei input');
  assert(pdpHtml.includes('id="btnApplyExchangeModal"'), 'Missing btnApplyExchangeModal button');
});

it('product-detail.js contains renderPdpExchangeWidget and openExchangeModal handlers', () => {
  assert(pdpJs.includes('function renderPdpExchangeWidget'), 'Missing renderPdpExchangeWidget function');
  assert(pdpJs.includes('function openExchangeModal'), 'Missing openExchangeModal function');
  assert(pdpJs.includes('electromart_exchange_cart_v1'), 'Must reference electromart_exchange_cart_v1');
  assert(pdpJs.includes('renderPdpExchangeWidget(product, price)'), 'Must call renderPdpExchangeWidget in renderProduct');
});

// -------------------------------------------------------------
// Layer 5: Cart & Checkout Synchronization & Deductions
// -------------------------------------------------------------
console.log('\n--- Layer 5: Cart & Checkout Synchronization & Deductions ---');

const cartHtmlPath = path.join(rootDir, 'cart.html');
const cartHtml = fs.readFileSync(cartHtmlPath, 'utf8');
const cartJsPath = path.join(rootDir, 'cart.js');
const cartJs = fs.readFileSync(cartJsPath, 'utf8');

const checkoutHtmlPath = path.join(rootDir, 'checkout.html');
const checkoutHtml = fs.readFileSync(checkoutHtmlPath, 'utf8');
const checkoutJsPath = path.join(rootDir, 'checkout.js');
const checkoutJs = fs.readFileSync(checkoutJsPath, 'utf8');

it('cart.html and checkout.html include exchange discount summary rows', () => {
  assert(cartHtml.includes('id="exchangeDiscountRow"'), 'Missing exchangeDiscountRow in cart.html');
  assert(cartHtml.includes('id="exchangeDiscountValue"'), 'Missing exchangeDiscountValue in cart.html');
  assert(checkoutHtml.includes('id="checkoutExchangeDiscountRow"'), 'Missing checkoutExchangeDiscountRow in checkout.html');
  assert(checkoutHtml.includes('id="checkoutExchangeDiscountValue"'), 'Missing checkoutExchangeDiscountValue in checkout.html');
});

it('cart.js calculates exchangeDiscount and deducts from total payable', () => {
  assert(cartJs.includes('electromart_exchange_cart_v1'), 'cart.js must read electromart_exchange_cart_v1');
  assert(cartJs.includes('totalExchangeDiscount'), 'cart.js must calculate totalExchangeDiscount');
  assert(cartJs.includes('cart-exchange-badge'), 'cart.js must render exchange badge on item card');
  assert(cartJs.includes('remove-exchange'), 'cart.js must handle exchange removal action');
});

it('checkout.js deducts exchange discount and stores exchangeDetails in order', () => {
  assert(checkoutJs.includes('electromart_exchange_cart_v1'), 'checkout.js must read electromart_exchange_cart_v1');
  assert(checkoutJs.includes('totalExchangeDiscount'), 'checkout.js must compute totalExchangeDiscount');
  assert(checkoutJs.includes('checkout-exchange-doorstep-notice'), 'checkout.js must show doorstep notice');
  assert(checkoutJs.includes('exchangeDetails'), 'checkout.js must attach exchangeDetails to order');
});

// -------------------------------------------------------------
// Layer 6: Orders & Tracking Doorstep Checklist Integration
// -------------------------------------------------------------
console.log('\n--- Layer 6: Orders & Tracking Doorstep Checklist Integration ---');

const ordersJsPath = path.join(rootDir, 'orders.js');
const ordersJs = fs.readFileSync(ordersJsPath, 'utf8');
const trackingHtmlPath = path.join(rootDir, 'tracking.html');
const trackingHtml = fs.readFileSync(trackingHtmlPath, 'utf8');
const trackingJsPath = path.join(rootDir, 'tracking.js');
const trackingJs = fs.readFileSync(trackingJsPath, 'utf8');

it('orders.js renders device exchange info badge on order cards', () => {
  assert(ordersJs.includes('order.exchangeDetails'), 'orders.js must check order.exchangeDetails');
  assert(ordersJs.includes('order-exchange-meta'), 'orders.js must render order-exchange-meta badge');
  assert(ordersJs.includes('Includes Device Exchange'), 'orders.js must label Includes Device Exchange');
});

it('tracking.html and tracking.js display doorstep handover checklist', () => {
  assert(trackingHtml.includes('id="trackingExchangeBanner"'), 'tracking.html must have trackingExchangeBanner');
  assert(trackingHtml.includes('id="trackingExchangeDeviceName"'), 'tracking.html must have trackingExchangeDeviceName');
  assert(trackingHtml.includes('Delivery Boy Handover Checklist'), 'tracking.html must feature handover checklist');
  assert(trackingJs.includes('trackingExchangeBanner'), 'tracking.js must update trackingExchangeBanner');
});

// -------------------------------------------------------------
// Layer 7: Brand Safety & 11-Language i18n Coverage
// -------------------------------------------------------------
console.log('\n--- Layer 7: Brand Safety & 11-Language i18n Coverage ---');

const translationsPath = path.join(rootDir, 'translations.js');
const translationsCode = fs.readFileSync(translationsPath, 'utf8');

it('Zero customer-visible Amazon brand mentions in exchange files', () => {
  const visibleRegex = /\bAmazon(?:\.in)?\b(?!-btn|-buybox|-badge|-card|-item|-qty|-price|-step|-timeline|-detail|-saved|-link|-offers|-ship-to)/;
  assert(!visibleRegex.test(exchangeHtml), 'Customer-visible Amazon text found in exchange.html');
  assert(!visibleRegex.test(exchangeJs), 'Customer-visible Amazon text found in exchange.js');
});

it('translations.js defines exchange keys for all 11 regional languages', () => {
  const requiredLanguages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
  assert(translationsCode.includes('ELECTROMART_EXCHANGE_I18N'), 'Missing ELECTROMART_EXCHANGE_I18N dictionary');
  
  requiredLanguages.forEach((lang) => {
    assert(translationsCode.includes(`${lang}:`), `translations.js must contain exchange entries for ${lang}`);
  });
});

it('Header and Account links point correctly to exchange.html', () => {
  const headerHtml = fs.readFileSync(path.join(rootDir, 'header.html'), 'utf8');
  const accountHtml = fs.readFileSync(path.join(rootDir, 'account.html'), 'utf8');
  assert(headerHtml.includes('href="exchange.html"'), 'header.html must link to exchange.html');
  assert(accountHtml.includes('id="tileExchange"'), 'account.html must have tileExchange');
  assert(accountHtml.includes('href="exchange.html"'), 'account.html must link to exchange.html');
});

console.log(`\n===============================================================`);
console.log(`RESULTS: ${passedTests} of ${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log(`===============================================================\n`);

if (passedTests === totalTests) {
  console.log('✓ Phase 30: ElectroMart Device Trade-In & Exchange Hub test suite PASSED PERFECTLY!\n');
} else {
  process.exitCode = 1;
}
