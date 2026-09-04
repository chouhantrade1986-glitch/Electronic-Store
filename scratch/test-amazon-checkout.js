const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.resolve(__dirname, '..');

console.log("Starting test-amazon-checkout.js...");

// 1. Check checkout.html content & structure
const checkoutHtml = fs.readFileSync(path.join(projectDir, 'checkout.html'), 'utf8');

// Header and clean HTML structure
assert(checkoutHtml.startsWith('<!DOCTYPE html>'), "checkout.html starts with <!DOCTYPE html>");
const doctypeMatches = checkoutHtml.match(/<!DOCTYPE html>/gi) || [];
assert.strictEqual(doctypeMatches.length, 1, "Only one <!DOCTYPE html> in checkout.html");
assert(checkoutHtml.includes('amazon-theme.css'), "Includes amazon-theme.css");
assert(checkoutHtml.includes('<h1>Checkout</h1>'), "Includes <h1>Checkout</h1> (required by QA smoke suite)");

// 3-step accordion cards
assert(checkoutHtml.includes('id="step1Card"'), "Has step1Card element");
assert(checkoutHtml.includes('id="step2Card"'), "Has step2Card element");
assert(checkoutHtml.includes('id="step3Card"'), "Has step3Card element");

assert(checkoutHtml.includes('id="step1Body"'), "Has step1Body element");
assert(checkoutHtml.includes('id="step2Body"'), "Has step2Body element");
assert(checkoutHtml.includes('id="step3Body"'), "Has step3Body element");

assert(checkoutHtml.includes('id="step1ChangeBtn"'), "Has step1ChangeBtn");
assert(checkoutHtml.includes('id="step2ChangeBtn"'), "Has step2ChangeBtn");

assert(checkoutHtml.includes('id="useAddressBtn"'), "Has useAddressBtn");
assert(checkoutHtml.includes('id="usePaymentBtn"'), "Has usePaymentBtn");
assert(checkoutHtml.includes('id="stepPlaceOrderBtn"'), "Has stepPlaceOrderBtn");
assert(checkoutHtml.includes('id="placeOrderBtn"'), "Has sticky placeOrderBtn");

// Summaries
assert(checkoutHtml.includes('id="addressSummaryText"'), "Has addressSummaryText");
assert(checkoutHtml.includes('id="paymentSummaryText"'), "Has paymentSummaryText");

// Address form fields
const requiredAddressFields = [
  'id="fullName"', 'id="mobileNo"', 'id="emailId"',
  'id="pinCode"', 'id="addressLine"', 'id="cityName"', 'id="stateName"'
];
for (const field of requiredAddressFields) {
  assert(checkoutHtml.includes(field), `checkout.html must preserve address input ${field}`);
}

// Payment details
const requiredPaymentFields = [
  'value="upi"', 'value="card"', 'value="netbanking"', 'value="cod"',
  'id="upiId"', 'id="cardName"', 'id="cardNumber"', 'id="cardExpiry"', 'id="cardCvv"', 'id="bankName"'
];
for (const field of requiredPaymentFields) {
  assert(checkoutHtml.includes(field), `checkout.html must preserve payment input ${field}`);
}

// Order summary and review items
const requiredSummaryElements = [
  'id="summaryItems"', 'id="subtotalValue"', 'id="shippingValue"',
  'id="taxValue"', 'id="totalValue"', 'id="discountRow"', 'id="discountValue"',
  'id="couponInput"', 'id="applyCouponBtn"', 'id="checkoutItems"', 'id="deliverySlotSelect"'
];
for (const elem of requiredSummaryElements) {
  assert(checkoutHtml.includes(elem), `checkout.html must preserve summary element ${elem}`);
}

// i18n attributes
const expectedI18nKeys = [
  'data-i18n="shipping_address"',
  'data-i18n="payment_method"',
  'data-i18n="review_items"',
  'data-i18n="delivery_slot"',
  'data-i18n="order_summary"',
  'data-i18n="place_order"',
  'data-i18n="order_total"',
  'data-i18n="use_this_address"',
  'data-i18n="use_this_payment"',
  'data-i18n="change"',
  'data-i18n="default_address"',
  'data-i18n="add_new_address"',
  'data-i18n="review_order_and_pay"'
];
for (const attr of expectedI18nKeys) {
  assert(checkoutHtml.includes(attr), `checkout.html has i18n attribute ${attr}`);
}

// Required script tags
const requiredScripts = [
  'src="translations.js"',
  'src="products-data.js"',
  'src="universal-i18n-bus.js"',
  'src="header.js"',
  'src="menu-manager.js"',
  'src="auth-state.js"',
  'src="checkout.js"'
];
for (const script of requiredScripts) {
  assert(checkoutHtml.includes(script), `checkout.html includes script ${script}`);
}

// 2. Check CSS styling in amazon-theme.css
const cssContent = fs.readFileSync(path.join(projectDir, 'amazon-theme.css'), 'utf8');
const requiredCssClasses = [
  '.amz-step',
  '.amz-step.active',
  '.amz-step-header',
  '.amz-step-num',
  '.amz-step-title',
  '.amz-step-summary',
  '.amz-step-change-btn',
  '.amz-step-body',
  '.amz-address-card',
  '.amz-address-badge',
  '.amz-btn-primary',
  '.amz-btn-secondary',
  '.amz-checkout-summary-box'
];
for (const cls of requiredCssClasses) {
  assert(cssContent.includes(cls), `amazon-theme.css must define ${cls}`);
}

// 3. Check translations.js for the 6 new keys across all 11 languages
const translationsContent = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
const vm = require('vm');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(translationsContent + '; var rootTrans = typeof translations !== "undefined" ? translations : window.translations || window.EM_TRANSLATIONS;', sandbox);
const trans = sandbox.rootTrans || sandbox.window.translations || sandbox.window.EM_TRANSLATIONS;
assert(trans, "translations object is loaded");

const all11Languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const newKeys = [
  'use_this_address',
  'use_this_payment',
  'change',
  'add_new_address',
  'default_address',
  'review_order_and_pay'
];

for (const lang of all11Languages) {
  assert(trans[lang], `translations must have language ${lang}`);
  for (const key of newKeys) {
    const val = trans[lang][key];
    assert(val && typeof val === 'string' && val.trim().length > 0, `Language '${lang}' must have non-empty translation for key '${key}'`);
  }
}

// 4. Check checkout.js implementation
const checkoutJs = fs.readFileSync(path.join(projectDir, 'checkout.js'), 'utf8');
assert(checkoutJs.includes('function setupAccordionFlow'), "checkout.js contains setupAccordionFlow");
assert(checkoutJs.includes('function openAccordionStep'), "checkout.js contains openAccordionStep");
assert(checkoutJs.includes('function updateAddressSummary'), "checkout.js contains updateAddressSummary");
assert(checkoutJs.includes('function updatePaymentSummary'), "checkout.js contains updatePaymentSummary");
assert(checkoutJs.includes('setupAccordionFlow();'), "checkout.js calls setupAccordionFlow() in initCheckout");
assert(checkoutJs.includes('stepPlaceOrderBtn'), "checkout.js wires stepPlaceOrderBtn");
assert(checkoutJs.includes('useAddressBtn'), "checkout.js wires useAddressBtn");
assert(checkoutJs.includes('usePaymentBtn'), "checkout.js wires usePaymentBtn");

console.log("ALL CHECKS PASSED: Amazon India 4-Step Accordion Flow verified successfully!");
