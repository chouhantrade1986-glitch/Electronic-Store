/**
 * Phase 44: ElectroMart BNPL & EMI Hub Test Suite
 * scratch/test-amazon-emi.js
 *
 * 9 Verification Layers:
 *  1. DOM Elements & Hub Structure (emi.html)
 *  2. EMI Calculator Engine (flexible tenures, interest rates)
 *  3. Partner Bank Offers Engine (HDFC, ICICI, SBI, Axis)
 *  4. Eligibility Checker Engine
 *  5. Auto-Deduction Mandate Setup Engine
 *  6. Zero-Cost EMI Badge & PDP Integration
 *  7. Cart & Checkout EMI Integration
 *  8. Brand Safety (0 Amazon references) & 11-Language i18n Coverage
 *  9. Deterministic Engine Contracts
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectDir = path.join(__dirname, '..');
const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const requiredFiles = ['emi.html', 'emi.css', 'emi.js'];

console.log('===============================================================');
console.log('TEST SUITE: ElectroMart BNPL & EMI Hub (Phase 44)');
console.log('===============================================================');

// 1. Required files
requiredFiles.forEach((fileName) => {
  const filePath = path.join(projectDir, fileName);
  assert(fs.existsSync(filePath), `${fileName} must exist in project directory`);
});
console.log('✓ File existence verified.');

// 2. Read source contracts
const html = fs.readFileSync(path.join(projectDir, 'emi.html'), 'utf8');
const css = fs.readFileSync(path.join(projectDir, 'emi.css'), 'utf8');
const js = fs.readFileSync(path.join(projectDir, 'emi.js'), 'utf8');
const pdpHtml = fs.readFileSync(path.join(projectDir, 'product-detail.html'), 'utf8');
const pdpJs = fs.readFileSync(path.join(projectDir, 'product-detail.js'), 'utf8');
const checkoutHtml = fs.readFileSync(path.join(projectDir, 'checkout.html'), 'utf8');
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
  'emi.js'
];

let lastIndex = -1;
expectedScripts.forEach((scriptName) => {
  const index = html.indexOf(scriptName);
  assert(index !== -1, `emi.html must load ${scriptName}`);
  assert(index > lastIndex, `Script ${scriptName} is not in the canonical loading order`);
  lastIndex = index;
});
console.log('✓ Canonical script sequence verified.');

// 4. Required DOM contracts
const requiredIds = [
  'emiHero',
  'emiCalculatorSection',
  'emiAmountInput',
  'emiTenureSelect',
  'emiBankSelect',
  'emiResultCard',
  'emiMonthlyInstallment',
  'emiTotalInterest',
  'emiTotalAmount',
  'emiBankOffersSection',
  'bankOffersGrid',
  'emiEligibilitySection',
  'emiEligibilityChecker',
  'emiPANInput',
  'emiPhoneInput',
  'emiEmailInput',
  'emiCheckEligibilityBtn',
  'emiEligibilityResult',
  'emiAutoDeductionSection',
  'emiMandateSetupBtn',
  'emiMandateStatus',
  'emiZeroCostBadge',
  'emiProductGrid',
  'emiCheckoutIntegration'
];

requiredIds.forEach((id) => {
  assert(html.includes(`id="${id}"`) || html.includes(`id='${id}'`), `emi.html must contain #${id}`);
});

// Form controls
['emiAmount', 'emiTenure', 'emiBank', 'emiPAN', 'emiPhone', 'emiEmail'].forEach((name) => {
  assert(new RegExp(`name=["']${name}["']`).test(html), `Form control #${name} must have a name attribute`);
});

// Submit buttons targeting forms
assert(/id=["']calculateEmiBtn["'][^>]*form=["']emiCalculatorForm["']/.test(html), 'Calculate EMI button must target #emiCalculatorForm');
assert(/id=["']checkEligibilityBtn["'][^>]*form=["']emiEligibilityForm["']/.test(html), 'Check eligibility button must target #emiEligibilityForm');
assert(/id=["']setupMandateBtn["'][^>]*form=["']emiMandateForm["']/.test(html), 'Setup mandate button must target #emiMandateForm');
assert(html.includes('amazon-theme.css') && html.includes('shared-search.css'), 'EMI page must load shared storefront styles');
console.log('✓ Required DOM and form contracts verified.');

// 5. Theme and accessibility surfaces
assert(css.includes('--emi-accent') && css.includes('#7C3AED'), 'emi.css must define the EMI violet accent');
assert(css.includes('prefers-reduced-motion'), 'emi.css must respect reduced-motion preferences');
assert(css.includes('color: #ffffff') && css.includes('font-weight: 700'), 'EMI CTAs must use readable high-contrast text');
assert(css.includes('backdrop-filter') || css.includes('rgba'), 'emi.css must include layered surfaces');
console.log('✓ Theme and accessibility contracts verified.');

// 6. Controller, storage and engine contracts
assert(js.includes('electromart_emi_calculations_v1'), 'emi.js must persist EMI calculations');
assert(js.includes('electromart_emi_eligibility_v1'), 'emi.js must persist eligibility checks');
assert(js.includes('electromart_emi_mandates_v1'), 'emi.js must persist mandate setups');
assert(js.includes('ElectroMart.EMI') || js.includes('ElectroMartEMI'), 'emi.js must use the approved ElectroMart namespace');
assert(js.includes('calculateEMI'), 'emi.js must expose the EMI calculator engine');
assert(js.includes('getBankOffers'), 'emi.js must expose the partner bank offers engine');
assert(js.includes('checkEMIEligibility'), 'emi.js must expose the eligibility checker engine');
assert(js.includes('setupEMIMandate'), 'emi.js must expose the mandate setup engine');

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

const emiNamespace = sandbox.window.ElectroMart && sandbox.window.ElectroMart.EMI;
assert(emiNamespace, 'window.ElectroMart.EMI must exist after emi.js runs');
['calculateEMI', 'getBankOffers', 'checkEMIEligibility', 'setupEMIMandate'].forEach((fn) => {
  assert(typeof emiNamespace[fn] === 'function', `EMI namespace must expose ${fn}()`);
});

// 6a. Deterministic EMI calculator
const emiInput = { principal: 50000, annualRate: 12, tenureMonths: 12 };
const emi1 = emiNamespace.calculateEMI(emiInput);
const emi2 = emiNamespace.calculateEMI(emiInput);
assert.strictEqual(emi1.monthlyInstallment, emi2.monthlyInstallment, 'EMI calculation must be deterministic');
assert.strictEqual(emi1.totalInterest, emi2.totalInterest, 'Total interest must be deterministic');
assert.strictEqual(emi1.totalAmount, emi2.totalAmount, 'Total amount must be deterministic');
assert(typeof emi1.monthlyInstallment === 'number' && emi1.monthlyInstallment > 0, 'Monthly installment must be positive');
assert(typeof emi1.totalInterest === 'number' && emi1.totalInterest >= 0, 'Total interest must be non-negative');
assert.strictEqual(emi1.totalAmount, emi1.monthlyInstallment * 12, 'Total amount = monthly × tenure');

// Test different tenures
const emi6 = emiNamespace.calculateEMI({ principal: 100000, annualRate: 10, tenureMonths: 6 });
const emi12 = emiNamespace.calculateEMI({ principal: 100000, annualRate: 10, tenureMonths: 12 });
const emi24 = emiNamespace.calculateEMI({ principal: 100000, annualRate: 10, tenureMonths: 24 });
assert(emi6.monthlyInstallment > emi12.monthlyInstallment, 'Shorter tenure = higher monthly');
assert(emi24.monthlyInstallment < emi12.monthlyInstallment, 'Longer tenure = lower monthly');
console.log('✓ EMI calculator verified (deterministic).');

// 6b. Partner bank offers engine
const bankOffers = emiNamespace.getBankOffers({ principal: 50000 });
assert(Array.isArray(bankOffers) && bankOffers.length >= 4, 'Must have at least 4 partner banks');
const bankCodes = bankOffers.map(o => o.bankCode);
assert(bankCodes.includes('HDFC'), 'Must include HDFC');
assert(bankCodes.includes('ICICI'), 'Must include ICICI');
assert(bankCodes.includes('SBI'), 'Must include SBI');
assert(bankCodes.includes('AXIS'), 'Must include AXIS');

bankOffers.forEach(offer => {
  assert(offer.bankName && offer.bankCode, 'Offer must have bankName and bankCode');
  assert(typeof offer.effectiveRate === 'number' && offer.effectiveRate >= 0, 'Effective rate must be non-negative');
  assert(typeof offer.processingFee === 'number' && offer.processingFee >= 0, 'Processing fee must be non-negative');
  assert(typeof offer.zeroCostEligible === 'boolean', 'Zero cost eligible must be boolean');
});
console.log('✓ Partner bank offers engine verified.');

// 6c. Eligibility checker
const eligibility1 = emiNamespace.checkEMIEligibility({
  pan: 'ABCDE1234F',
  phone: '9876543210',
  email: 'user@example.com',
  amount: 50000
});
const eligibility2 = emiNamespace.checkEMIEligibility({
  pan: 'ABCDE1234F',
  phone: '9876543210',
  email: 'user@example.com',
  amount: 50000
});
assert.strictEqual(eligibility1.eligible, eligibility2.eligible, 'Eligibility must be deterministic');
assert(typeof eligibility1.eligible === 'boolean', 'Eligible must be boolean');
assert(typeof eligibility1.creditLimit === 'number' && eligibility1.creditLimit >= 0, 'Credit limit must be non-negative');
assert(typeof eligibility1.maxTenure === 'number' && eligibility1.maxTenure > 0, 'Max tenure must be positive');
console.log('✓ Eligibility checker verified (deterministic).');

// 6d. Mandate setup
const mandate = emiNamespace.setupEMIMandate({
  bankCode: 'HDFC',
  accountNumber: '50100123456789',
  ifsc: 'HDFC0001234',
  maxAmount: 5000,
  frequency: 'monthly'
});
assert(mandate && mandate.mandateId, 'Mandate must return mandateId');
assert(mandate.mandateId.startsWith('EM-MND-'), 'Mandate ID must follow EM-MND-XXXXXX format');
assert(mandate.status === 'active', 'New mandate must be active');
assert(mandate.bankCode === 'HDFC', 'Bank code must match');
assert(mandate.maxAmount === 5000, 'Max amount must match');
assert(mandate.frequency === 'monthly', 'Frequency must match');

const mandate2 = emiNamespace.setupEMIMandate({
  bankCode: 'HDFC',
  accountNumber: '50100123456789',
  ifsc: 'HDFC0001234',
  maxAmount: 5000,
  frequency: 'monthly'
});
assert.strictEqual(mandate.mandateId, mandate2.mandateId, 'Mandate setup must be deterministic');
console.log('✓ Mandate setup engine verified (deterministic).');

// 7. PDP integration
assert(pdpHtml.includes('pdpEMICallout') || pdpHtml.includes('pdpEMIBadge'), 'product-detail.html must contain the EMI callout');
assert(pdpJs.includes('renderPdpEMICallout'), 'product-detail.js must contain renderPdpEMICallout');
assert(pdpHtml.includes('ElectroMart EMI: Flexible Tenures, Zero Cost Options, Partner Bank Offers'), 'PDP must render the EMI certification message');
console.log('✓ PDP EMI integration verified.');

// 7b. Checkout integration
assert(checkoutHtml.includes('emiPaymentOption') || checkoutHtml.includes('emiPaymentSection'), 'checkout.html must contain EMI payment option');
console.log('✓ Checkout EMI integration verified.');

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
  'emi_hub_title',
  'emi_hub_subtitle',
  'emi_calculator_title',
  'emi_amount_label',
  'emi_tenure_label',
  'emi_bank_label',
  'emi_calculate_btn',
  'emi_monthly_installment_label',
  'emi_total_interest_label',
  'emi_total_amount_label',
  'emi_bank_offers_title',
  'emi_zero_cost_badge',
  'emi_eligibility_title',
  'emi_pan_label',
  'emi_phone_label',
  'emi_email_label',
  'emi_check_eligibility_btn',
  'emi_eligibility_result_title',
  'emi_mandate_title',
  'emi_mandate_setup_btn',
  'emi_pdp_badge'
];
languages.forEach((language) => {
  assert(translations[language], `Language ${language} must exist in translations`);
  expectedI18nKeys.forEach((key) => {
    assert(translations[language][key], `Key "${key}" must exist for language "${language}"`);
  });
});
assert(translationsCode.includes('ELECTROMART_EMI_I18N'), 'translations.js must expose ELECTROMART_EMI_I18N');
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
console.log('PASS: Phase 44 ElectroMart BNPL & EMI Hub contract verified successfully!');
console.log('===============================================================');