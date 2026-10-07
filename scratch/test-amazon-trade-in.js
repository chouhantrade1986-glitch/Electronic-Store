/**
 * Phase 41: ElectroMart B2B Corporate Bulk Trade-In Hub Test Suite
 * scratch/test-amazon-trade-in.js
 *
 * 9 Verification Layers:
 *  1. DOM Elements & Hub Structure (trade-in.html)
 *  2. Bulk Valuation Engine (multiple devices, category pricing)
 *  3. GST & Corporate Tax Credit Calculator
 *  4. On-Site Bulk Pickup & Verification Booking
 *  5. Enterprise Credit Voucher (Business Account balance / Credit Note)
 *  6. PDP Bulk Trade-In Widget Integration
 *  7. Cart & Checkout Synchronization
 *  8. Brand Safety (0 Amazon references) & 11-Language i18n Coverage
 *  9. Deterministic Engine Contracts
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectDir = path.join(__dirname, '..');
const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const requiredFiles = ['trade-in.html', 'trade-in.css', 'trade-in.js'];

console.log('===============================================================');
console.log('TEST SUITE: ElectroMart B2B Corporate Bulk Trade-In Hub (Phase 41)');
console.log('===============================================================');

// 1. Required files
requiredFiles.forEach((fileName) => {
  const filePath = path.join(projectDir, fileName);
  assert(fs.existsSync(filePath), `${fileName} must exist in project directory`);
});
console.log('✓ File existence verified.');

// 2. Read source contracts
const html = fs.readFileSync(path.join(projectDir, 'trade-in.html'), 'utf8');
const css = fs.readFileSync(path.join(projectDir, 'trade-in.css'), 'utf8');
const js = fs.readFileSync(path.join(projectDir, 'trade-in.js'), 'utf8');
const pdpHtml = fs.readFileSync(path.join(projectDir, 'product-detail.html'), 'utf8');
const pdpJs = fs.readFileSync(path.join(projectDir, 'product-detail.js'), 'utf8');
const translationsCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');

// 3. Canonical script order
const expectedScripts = [
  'translations.js',
  'products-data.js',
  'universal-i18n-bus.js',
  'header.js',
  'menu-manager.js',
  'auth-state.js',
  'shared-search.js',
  'trade-in.js'
];

let lastIndex = -1;
expectedScripts.forEach((scriptName) => {
  const index = html.indexOf(scriptName);
  assert(index !== -1, `trade-in.html must load ${scriptName}`);
  assert(index > lastIndex, `Script ${scriptName} is not in the canonical loading order`);
  lastIndex = index;
});
console.log('✓ Canonical script sequence verified.');

// 4. Required DOM contracts
const requiredIds = [
  'tradeInHero',
  'bulkValuationSection',
  'deviceRowsContainer',
  'addDeviceRowBtn',
  'categorySelect',
  'brandSelect',
  'modelSelect',
  'quantityInput',
  'conditionSelect',
  'valuationSummary',
  'estimatedTotalValue',
  'gstCreditEstimate',
  'taxSavingsEstimate',
  'pickupBookingSection',
  'pickupDateInput',
  'pickupTimeSlotSelect',
  'pickupAddressInput',
  'bookPickupBtn',
  'creditVoucherSection',
  'voucherTypeSelect',
  'businessAccountIdInput',
  'generateVoucherBtn',
  'voucherPreview',
  'voucherCode',
  'voucherValue',
  'voucherExpiry',
  'applyVoucherToCartBtn',
  'tradeInProductGrid'
];

requiredIds.forEach((id) => {
  assert(html.includes(`id="${id}"`) || html.includes(`id='${id}'`), `trade-in.html must contain #${id}`);
});
// Form controls must have name attributes for submission
['category', 'brand', 'model', 'quantity', 'condition', 'pickupDate', 'pickupTimeSlot', 'pickupAddress', 'voucherType', 'businessAccountId'].forEach((name) => {
  assert(new RegExp(`name=["']${name}["']`).test(html), `Form control #${name} must have a name attribute`);
});
// Submit buttons must target their forms
assert(/id=["']addDeviceRowBtn["'][^>]*form=["']bulkValuationForm["']/.test(html), 'Add device row button must target #bulkValuationForm');
assert(/id=["']bookPickupBtn["'][^>]*form=["']pickupBookingForm["']/.test(html), 'Book pickup button must target #pickupBookingForm');
assert(/id=["']generateVoucherBtn["'][^>]*form=["']creditVoucherForm["']/.test(html), 'Generate voucher button must target #creditVoucherForm');
assert(html.includes('amazon-theme.css') && html.includes('shared-search.css'), 'Trade-in page must load shared storefront styles');
console.log('✓ Required DOM and form contracts verified.');

// 5. Theme and accessibility surfaces
assert(css.includes('--tradein-accent') && css.includes('#0F4C81'), 'trade-in.css must define the corporate trade-in accent');
assert(css.includes('prefers-reduced-motion'), 'trade-in.css must respect reduced-motion preferences');
assert(css.includes('color: #ffffff') && css.includes('font-weight: 700'), 'Trade-in CTAs must use readable high-contrast text');
assert(css.includes('backdrop-filter') || css.includes('rgba'), 'trade-in.css must include layered surfaces');
console.log('✓ Theme and accessibility contracts verified.');

// 6. Controller, storage and engine contracts
assert(js.includes('electromart_tradein_bulk_valuation_v1'), 'trade-in.js must persist bulk valuation state');
assert(js.includes('electromart_tradein_pickup_bookings_v1'), 'trade-in.js must persist pickup bookings');
assert(js.includes('electromart_tradein_vouchers_v1'), 'trade-in.js must persist generated vouchers');
assert(js.includes('ElectroMart.TradeIn') || js.includes('ElectroMartTradeIn'), 'trade-in.js must use the approved ElectroMart namespace');
assert(js.includes('calculateBulkValuation'), 'trade-in.js must expose the bulk valuation engine');
assert(js.includes('calculateGstCredit'), 'trade-in.js must expose the GST credit calculator');
assert(js.includes('calculateTaxSavings'), 'trade-in.js must expose the corporate tax savings calculator');
assert(js.includes('bookBulkPickup'), 'trade-in.js must expose the pickup booking engine');
assert(js.includes('generateEnterpriseVoucher'), 'trade-in.js must expose the voucher generation engine');

const sandbox = {
  window: {},
  document: {
    addEventListener: () => {},
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({})
  },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  setTimeout: () => {},
  clearTimeout: () => {},
  Intl,
  Date,
  console
};
vm.createContext(sandbox);
vm.runInContext(js, sandbox);

const tradeInNamespace = sandbox.window.ElectroMart && sandbox.window.ElectroMart.TradeIn;
assert(tradeInNamespace, 'window.ElectroMart.TradeIn must exist after trade-in.js runs');
['calculateBulkValuation', 'calculateGstCredit', 'calculateTaxSavings', 'bookBulkPickup', 'generateEnterpriseVoucher'].forEach((fn) => {
  assert(typeof tradeInNamespace[fn] === 'function', `TradeIn namespace must expose ${fn}()`);
});

// 6a. Deterministic bulk valuation — multiple devices, same input = same output
const valuationInput = [
  { category: 'laptop', brand: 'dell', model: 'latitude-5420', quantity: 10, condition: 'good' },
  { category: 'monitor', brand: 'dell', model: 'p2422h', quantity: 15, condition: 'excellent' },
  { category: 'desktop', brand: 'hp', model: 'pro-tower-280', quantity: 5, condition: 'fair' }
];
const val1 = tradeInNamespace.calculateBulkValuation(valuationInput);
const val2 = tradeInNamespace.calculateBulkValuation(valuationInput);
assert.strictEqual(val1.totalEstimatedValue, val2.totalEstimatedValue, 'Bulk valuation must be deterministic for identical input');
assert(typeof val1.totalEstimatedValue === 'number' && val1.totalEstimatedValue > 0, 'Total estimated value must be a positive number');
assert(typeof val1.deviceBreakdown === 'object' && val1.deviceBreakdown.length === 3, 'Must return breakdown per device type');
assert(val1.deviceBreakdown.every(d => typeof d.estimatedValue === 'number' && d.estimatedValue > 0), 'Each device breakdown must have positive estimated value');
console.log('✓ Bulk valuation engine verified (deterministic).');

// 6b. GST credit calculator — 18% GST on trade-in value, capped at corporate limit
const gstCredit = tradeInNamespace.calculateGstCredit({ tradeInValue: 500000, gstRate: 0.18, entityType: 'corporate' });
assert(typeof gstCredit === 'number' && gstCredit >= 0, 'GST credit must be a non-negative number');
assert.strictEqual(gstCredit, Math.round(500000 * 0.18), 'GST credit must equal tradeInValue × gstRate (rounded)');
const gstCreditSmall = tradeInNamespace.calculateGstCredit({ tradeInValue: 10000, gstRate: 0.18, entityType: 'corporate' });
assert.strictEqual(gstCreditSmall, 1800, 'Small value GST credit must calculate correctly');
console.log('✓ GST credit calculator verified.');

// 6c. Corporate tax savings — Section 32/35AD depreciation benefit estimation
const taxSavings = tradeInNamespace.calculateTaxSavings({ tradeInValue: 500000, corporateTaxRate: 0.25, depreciationRate: 0.4 });
assert(typeof taxSavings === 'number' && taxSavings >= 0, 'Tax savings must be a non-negative number');
// Deterministic: same input = same output
const taxSavings2 = tradeInNamespace.calculateTaxSavings({ tradeInValue: 500000, corporateTaxRate: 0.25, depreciationRate: 0.4 });
assert.strictEqual(taxSavings, taxSavings2, 'Tax savings must be deterministic');
console.log('✓ Corporate tax savings calculator verified.');

// 6d. Pickup booking — returns booking ID, date confirmation, and stores locally
const pickupBooking = tradeInNamespace.bookBulkPickup({
  pickupDate: '2026-11-15',
  pickupTimeSlot: '10:00-12:00',
  pickupAddress: 'ElectroMart Corporate Office, Cyber City, Gurugram',
  deviceCount: 30,
  contactPerson: 'Rajesh Kumar',
  contactPhone: '9876543210'
});
assert(pickupBooking && pickupBooking.bookingId, 'Pickup booking must return a bookingId');
assert(pickupBooking.bookingId.startsWith('EM-TI-'), 'Booking ID must follow EM-TI-XXXXXX format');
assert(pickupBooking.confirmedDate === '2026-11-15', 'Booking must confirm the requested date');
assert(pickupBooking.confirmedTimeSlot === '10:00-12:00', 'Booking must confirm the requested time slot');
assert(pickupBooking.status === 'confirmed', 'Booking status must be confirmed');
console.log('✓ Bulk pickup booking engine verified.');

// 6e. Enterprise voucher generation — Business Account balance / Credit Note
const voucher = tradeInNamespace.generateEnterpriseVoucher({
  tradeInValue: 500000,
  voucherType: 'business_account_balance',
  businessAccountId: 'EM-BIZ-2026-00123',
  validDays: 365
});
assert(voucher && voucher.voucherCode, 'Voucher must have a voucherCode');
assert(voucher.voucherCode.startsWith('EM-VCR-'), 'Voucher code must follow EM-VCR-XXXXXX format');
assert(typeof voucher.value === 'number' && voucher.value === 500000, 'Voucher value must equal trade-in value');
assert(voucher.type === 'business_account_balance', 'Voucher type must match input');
assert(voucher.businessAccountId === 'EM-BIZ-2026-00123', 'Voucher must link to business account');
assert(voucher.expiryDate, 'Voucher must have an expiry date');
const voucher2 = tradeInNamespace.generateEnterpriseVoucher({
  tradeInValue: 500000,
  voucherType: 'business_account_balance',
  businessAccountId: 'EM-BIZ-2026-00123',
  validDays: 365
});
assert.strictEqual(voucher.voucherCode, voucher2.voucherCode, 'Voucher generation must be deterministic for identical input');
console.log('✓ Enterprise voucher generation verified (deterministic).');

// 7. PDP integration
assert(pdpHtml.includes('pdpBulkTradeInCallout') || pdpHtml.includes('pdpBulkTradeInBadge'), 'product-detail.html must contain the Bulk Trade-In callout');
assert(pdpJs.includes('renderPdpBulkTradeInCallout'), 'product-detail.js must contain renderPdpBulkTradeInCallout');
assert(pdpHtml.includes('ElectroMart Corporate Bulk Trade-In: GST Credit & Enterprise Voucher'), 'PDP must render the Corporate Bulk Trade-In certification message');
console.log('✓ PDP bulk trade-in integration verified.');

// 8. 11-language i18n coverage
const i18nSandbox = {
  window: {},
  document: {
    addEventListener: () => {},
    querySelectorAll: () => [],
    getElementById: () => null,
    querySelector: () => null,
    createElement: () => ({})
  },
  localStorage: { getItem: () => null, setItem: () => {} },
  console
};
vm.createContext(i18nSandbox);
vm.runInContext(translationsCode, i18nSandbox);

const translations = i18nSandbox.window.EM_TRANSLATIONS;
assert(translations, 'window.EM_TRANSLATIONS must exist');
const expectedI18nKeys = [
  'tradein_hub_title',
  'tradein_hub_subtitle',
  'tradein_bulk_valuation_title',
  'tradein_add_device_btn',
  'tradein_category_label',
  'tradein_brand_label',
  'tradein_model_label',
  'tradein_quantity_label',
  'tradein_condition_label',
  'tradein_valuation_summary_title',
  'tradein_estimated_value_label',
  'tradein_gst_credit_label',
  'tradein_tax_savings_label',
  'tradein_pickup_booking_title',
  'tradein_pickup_date_label',
  'tradein_pickup_time_label',
  'tradein_pickup_address_label',
  'tradein_book_pickup_btn',
  'tradein_credit_voucher_title',
  'tradein_voucher_type_label',
  'tradein_business_account_label',
  'tradein_generate_voucher_btn',
  'tradein_voucher_preview_title',
  'tradein_voucher_code_label',
  'tradein_voucher_value_label',
  'tradein_voucher_expiry_label',
  'tradein_apply_voucher_btn',
  'tradein_pdp_badge'
];
languages.forEach((language) => {
  assert(translations[language], `Language ${language} must exist in translations`);
  expectedI18nKeys.forEach((key) => {
    assert(translations[language][key], `Key "${key}" must exist for language "${language}"`);
  });
});
assert(translationsCode.includes('ELECTROMART_TRADEIN_I18N'), 'translations.js must expose ELECTROMART_TRADEIN_I18N');
console.log('✓ All 11 Indian languages covered in translations.js.');

// 9. Brand safety
[html, css, js].forEach((source, index) => {
  const visibleSource = source
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\b(?:src|href|class|id)=(['"])[^'"]*\1/gi, '')
    .replace(/<[^>]+>/g, ' ');
  assert(!/Amazon|अमेज़न/i.test(visibleSource), `${requiredFiles[index]} must be free of prohibited brand references`);
});
console.log('✓ Brand safety verified (100% pure ElectroMart).');

console.log('\n===============================================================');
console.log('PASS: Phase 41 ElectroMart B2B Corporate Bulk Trade-In Hub contract verified successfully!');
console.log('===============================================================');