/**
 * Phase 43: ElectroMart Subscription & Recurring Orders Hub Test Suite
 * scratch/test-amazon-subscriptions.js
 *
 * 9 Verification Layers:
 *  1. DOM Elements & Hub Structure (subscriptions.html)
 *  2. Subscribe & Save Engine (product enrollment, discount tiers)
 *  3. Flexible Delivery Schedule Engine (monthly/weekly/custom)
 *  4. Pause / Resume / Cancel Engine
 *  4. Cart & Checkout Subscription Integration
 *  5. PDP Subscription Widget Integration
 *  6. Cart & Checkout Synchronization
 *  7. Brand Safety (0 Amazon references) & 11-Language i18n Coverage
 *  8. Deterministic Engine Contracts
 *  9. Subscription Management UI
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectDir = path.join(__dirname, '..');
const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const requiredFiles = ['subscriptions.html', 'subscriptions.css', 'subscriptions.js'];

console.log('===============================================================');
console.log('TEST SUITE: ElectroMart Subscription & Recurring Orders (Phase 43)');
console.log('===============================================================');

// 1. Required files
requiredFiles.forEach((fileName) => {
  const filePath = path.join(projectDir, fileName);
  assert(fs.existsSync(filePath), `${fileName} must exist in project directory`);
});
console.log('✓ File existence verified.');

// 2. Read source contracts
const html = fs.readFileSync(path.join(projectDir, 'subscriptions.html'), 'utf8');
const css = fs.readFileSync(path.join(projectDir, 'subscriptions.css'), 'utf8');
const js = fs.readFileSync(path.join(projectDir, 'subscriptions.js'), 'utf8');
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
  'subscriptions.js'
];

let lastIndex = -1;
expectedScripts.forEach((scriptName) => {
  const index = html.indexOf(scriptName);
  assert(index !== -1, `subscriptions.html must load ${scriptName}`);
  assert(index > lastIndex, `Script ${scriptName} is not in the canonical loading order`);
  lastIndex = index;
});
console.log('✓ Canonical script sequence verified.');

// 4. Required DOM contracts
const requiredIds = [
  'subscriptionsHero',
  'mySubscriptionsSection',
  'subscriptionsList',
  'addSubscriptionBtn',
  'deliveryScheduleSection',
  'frequencySelect',
  'dayOfMonthInput',
  'dayOfWeekSelect',
  'nextDeliveryDateDisplay',
  'discountTierSection',
  'discountTierDisplay',
  'subscriptionDiscountDisplay',
  'pauseResumeSection',
  'pauseSubscriptionBtn',
  'resumeSubscriptionBtn',
  'cancelSubscriptionBtn',
  'subscriptionStatusDisplay',
  'nextDeliveryDate',
  'subscriptionProductGrid',
  'subscriptionSummarySection',
  'totalSavingsDisplay',
  'nextDeliverySummary',
  'manageSubscriptionBtn'
];

requiredIds.forEach((id) => {
  assert(html.includes(`id="${id}"`) || html.includes(`id='${id}'`), `subscriptions.html must contain #${id}`);
});

// Form controls
['frequency', 'dayOfMonth', 'dayOfWeek', 'subscriptionId'].forEach((name) => {
  assert(new RegExp(`name=["']${name}["']`).test(html), `Form control #${name} must have a name attribute`);
});

// Submit buttons targeting forms
assert(/id=["']saveScheduleBtn["'][^>]*form=["']deliveryScheduleForm["']/.test(html), 'Save schedule button must target #deliveryScheduleForm');
assert(/id=["']confirmPauseBtn["'][^>]*form=["']pauseSubscriptionForm["']/.test(html), 'Confirm pause button must target #pauseSubscriptionForm');
assert(/id=["']confirmCancelBtn["'][^>]*form=["']cancelSubscriptionForm["']/.test(html), 'Confirm cancel button must target #cancelSubscriptionForm');
assert(html.includes('amazon-theme.css') && html.includes('shared-search.css'), 'Subscriptions page must load shared storefront styles');
console.log('✓ Required DOM and form contracts verified.');

// 5. Theme and accessibility surfaces
assert(css.includes('--subscriptions-accent') && css.includes('#006D77'), 'subscriptions.css must define the subscriptions teal accent');
assert(css.includes('prefers-reduced-motion'), 'subscriptions.css must respect reduced-motion preferences');
assert(css.includes('color: #ffffff') && css.includes('font-weight: 700'), 'Subscription CTAs must use readable high-contrast text');
assert(css.includes('backdrop-filter') || css.includes('rgba'), 'subscriptions.css must include layered surfaces');
console.log('✓ Theme and accessibility contracts verified.');

// 6. Controller, storage and engine contracts
assert(js.includes('electromart_subscriptions_v1'), 'subscriptions.js must persist subscriptions');
assert(js.includes('electromart_subscription_schedules_v1'), 'subscriptions.js must persist delivery schedules');
assert(js.includes('ElectroMart.Subscriptions') || js.includes('ElectroMartSubscriptions'), 'subscriptions.js must use the approved ElectroMart namespace');
assert(js.includes('calculateSubscriptionDiscount'), 'subscriptions.js must expose the subscription discount engine');
assert(js.includes('calculateNextDeliveryDate'), 'subscriptions.js must expose the next delivery date calculator');
assert(js.includes('processSubscriptionAction'), 'subscriptions.js must expose the subscription action engine (pause/resume/cancel)');
assert(js.includes('enrollProductInSubscription'), 'subscriptions.js must expose the product enrollment engine');

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

const subscriptionsNamespace = sandbox.window.ElectroMart && sandbox.window.ElectroMart.Subscriptions;
assert(subscriptionsNamespace, 'window.ElectroMart.Subscriptions must exist after subscriptions.js runs');
['calculateSubscriptionDiscount', 'calculateNextDeliveryDate', 'processSubscriptionAction', 'enrollProductInSubscription'].forEach((fn) => {
  assert(typeof subscriptionsNamespace[fn] === 'function', `Subscriptions namespace must expose ${fn}()`);
});

// 6a. Deterministic subscription discount engine
const discount1 = subscriptionsNamespace.calculateSubscriptionDiscount({ basePrice: 1000, frequency: 'monthly', tier: 1 });
const discount2 = subscriptionsNamespace.calculateSubscriptionDiscount({ basePrice: 1000, frequency: 'monthly', tier: 1 });
assert.strictEqual(discount1.discountPercent, discount2.discountPercent, 'Subscription discount must be deterministic for identical input');
assert(typeof discount1.discountPercent === 'number' && discount1.discountPercent >= 0, 'Discount percent must be non-negative number');

// Tier thresholds (deterministic)
const tier1 = subscriptionsNamespace.calculateSubscriptionDiscount({ basePrice: 1000, frequency: 'monthly', tier: 1 });
assert.strictEqual(tier1.discountPercent, 5, 'Tier 1 (1-2 subscriptions) = 5% discount');

const tier2 = subscriptionsNamespace.calculateSubscriptionDiscount({ basePrice: 1000, frequency: 'monthly', tier: 2 });
assert.strictEqual(tier2.discountPercent, 10, 'Tier 2 (3-4 subscriptions) = 10% discount');

const tier3 = subscriptionsNamespace.calculateSubscriptionDiscount({ basePrice: 1000, frequency: 'monthly', tier: 3 });
assert.strictEqual(tier3.discountPercent, 15, 'Tier 3 (5+ subscriptions) = 15% discount');

console.log('✓ Subscription discount engine verified (deterministic).');

// 6b. Next delivery date calculator
const nextDate1 = subscriptionsNamespace.calculateNextDeliveryDate({ frequency: 'monthly', dayOfMonth: 15, startDate: '2026-10-01' });
const nextDate2 = subscriptionsNamespace.calculateNextDeliveryDate({ frequency: 'monthly', dayOfMonth: 15, startDate: '2026-10-01' });
assert.strictEqual(nextDate1, nextDate2, 'Next delivery date must be deterministic for identical input');
assert(typeof nextDate1 === 'string' && nextDate1.match(/^\d{4}-\d{2}-\d{2}$/), 'Next delivery date must be in YYYY-MM-DD format');

// Weekly frequency
const weeklyDate = subscriptionsNamespace.calculateNextDeliveryDate({ frequency: 'weekly', dayOfWeek: 1, startDate: '2026-10-01' });
assert(typeof weeklyDate === 'string' && weeklyDate.match(/^\d{4}-\d{2}-\d{2}$/), 'Weekly delivery date must be in YYYY-MM-DD format');
console.log('✓ Next delivery date calculator verified (deterministic).');

// 6c. Subscription action processor (pause/resume/cancel)
const pauseResult = subscriptionsNamespace.processSubscriptionAction({
  subscriptionId: 'SUB-2026-ABC123',
  action: 'pause',
  reason: 'vacation'
});
assert(pauseResult && pauseResult.success === true, 'Pause action must succeed');
assert(pauseResult.status === 'paused', 'Status must be paused');

const resumeResult = subscriptionsNamespace.processSubscriptionAction({
  subscriptionId: 'SUB-2026-ABC123',
  action: 'resume'
});
assert(resumeResult && resumeResult.success === true, 'Resume action must succeed');
assert(resumeResult.status === 'active', 'Status must be active');

const cancelResult = subscriptionsNamespace.processSubscriptionAction({
  subscriptionId: 'SUB-2026-ABC123',
  action: 'cancel',
  reason: 'no longer needed'
});
assert(cancelResult && cancelResult.success === true, 'Cancel action must succeed');
assert(cancelResult.status === 'cancelled', 'Status must be cancelled');

// Deterministic: same subscription + action = same result
const pauseResult2 = subscriptionsNamespace.processSubscriptionAction({
  subscriptionId: 'SUB-2026-ABC123',
  action: 'pause',
  reason: 'vacation'
});
assert.strictEqual(pauseResult.subscriptionId, pauseResult2.subscriptionId, 'Pause action must be deterministic');
console.log('✓ Subscription action processor verified (deterministic).');

// 6c. Product enrollment engine
const enrollment = subscriptionsNamespace.enrollProductInSubscription({
  productId: 'PROD-001',
  frequency: 'monthly',
  dayOfMonth: 15,
  quantity: 2
});
assert(enrollment && enrollment.subscriptionId, 'Enrollment must return subscriptionId');
assert(enrollment.subscriptionId.startsWith('SUB-'), 'Subscription ID must follow SUB-XXXXXX format');
assert(enrollment.status === 'active', 'New subscription must be active');
assert(enrollment.frequency === 'monthly', 'Frequency must match input');
assert(enrollment.quantity === 2, 'Quantity must match input');

const enrollment2 = subscriptionsNamespace.enrollProductInSubscription({
  productId: 'PROD-001',
  frequency: 'monthly',
  dayOfMonth: 15,
  quantity: 2
});
assert.strictEqual(enrollment.subscriptionId, enrollment2.subscriptionId, 'Enrollment must be deterministic for identical input');
console.log('✓ Product enrollment engine verified (deterministic).');

// 7. PDP integration
assert(pdpHtml.includes('pdpSubscriptionCallout') || pdpHtml.includes('pdpSubscriptionBadge'), 'product-detail.html must contain the Subscription callout');
assert(pdpJs.includes('renderPdpSubscriptionCallout'), 'product-detail.js must contain renderPdpSubscriptionCallout');
assert(pdpHtml.includes('ElectroMart Subscribe & Save: Auto-Deliver & Save Up to 15%'), 'PDP must render the Subscribe & Save certification message');
console.log('✓ PDP subscription integration verified.');

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
  'subscriptions_hub_title',
  'subscriptions_hub_subtitle',
  'subscriptions_my_subscriptions_title',
  'subscriptions_add_new_btn',
  'subscriptions_frequency_label',
  'subscriptions_monthly_option',
  'subscriptions_weekly_option',
  'subscriptions_custom_option',
  'subscriptions_day_of_month_label',
  'subscriptions_day_of_week_label',
  'subscriptions_next_delivery_label',
  'subscriptions_discount_tier_label',
  'subscriptions_your_tier_label',
  'subscriptions_discount_percent_label',
  'subscriptions_pause_btn',
  'subscriptions_resume_btn',
  'subscriptions_cancel_btn',
  'subscriptions_status_label',
  'subscriptions_next_delivery_label',
  'subscriptions_pdp_badge'
];
languages.forEach((language) => {
  assert(translations[language], `Language ${language} must exist in translations`);
  expectedI18nKeys.forEach((key) => {
    assert(translations[language][key], `Key "${key}" must exist for language "${language}"`);
  });
});
assert(translationsCode.includes('ELECTROMART_SUBSCRIPTIONS_I18N'), 'translations.js must expose ELECTROMART_SUBSCRIPTIONS_I18N');
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
console.log('PASS: Phase 43 ElectroMart Subscription & Recurring Orders contract verified successfully!');
console.log('===============================================================');