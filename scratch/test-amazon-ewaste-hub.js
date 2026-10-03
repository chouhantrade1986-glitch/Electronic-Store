const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('===============================================================');
console.log('TEST SUITE: Phase 33 - ElectroMart E-Waste & Green Initiative');
console.log('===============================================================\n');

const ROOT_DIR = path.resolve(__dirname, '..');
const PAGE_PATH = path.join(ROOT_DIR, 'ewaste.html');
const CSS_PATH = path.join(ROOT_DIR, 'ewaste.css');
const JS_PATH = path.join(ROOT_DIR, 'ewaste.js');
const TRANS_PATH = path.join(ROOT_DIR, 'translations.js');

assert(fs.existsSync(PAGE_PATH), 'ewaste.html must exist');
assert(fs.existsSync(CSS_PATH), 'ewaste.css must exist');
assert(fs.existsSync(JS_PATH), 'ewaste.js must exist');

const html = fs.readFileSync(PAGE_PATH, 'utf-8');
const css = fs.readFileSync(CSS_PATH, 'utf-8');
const js = fs.readFileSync(JS_PATH, 'utf-8');
const translations = fs.readFileSync(TRANS_PATH, 'utf-8');

const requiredDom = [
  'id="ewasteWizard"',
  'id="ewasteStep1"',
  'id="ewasteStep2"',
  'id="ewasteStep3"',
  'id="ewastePincodeInput"',
  'id="ewastePickupDate"',
  'id="ewastePickupSlot"',
  'id="ewasteImpactPanel"',
  'id="ewasteRewardPanel"',
  'id="ewasteVoucherCode"',
  'id="ewasteRequestForm"'
];

requiredDom.forEach((token) => {
  assert(html.includes(token), `ewaste.html missing required element: ${token}`);
});

const requiredBrandTokens = ['ElectroMart Recycling', 'ElectroMart Green Initiative'];
requiredBrandTokens.forEach((token) => {
  assert(html.includes(token) || js.includes(token) || css.includes(token), `Brand token missing: ${token}`);
});
assert(!html.toLowerCase().includes('amazon'), 'Customer-facing page must not include Amazon text');
assert(!js.toLowerCase().includes('amazon'), 'JavaScript must not include Amazon brand text');

assert(js.includes('EM-EWASTE-'), 'Request IDs must use EM-EWASTE-XXXXX format');
assert(js.includes('EM-GREEN-') || js.includes('EM-GV-'), 'Reward vouchers must use ElectroMart green voucher format');
assert(js.includes('electromart_ewaste_v1'), 'E-waste requests must persist under electomart_ewaste_v1');
assert(js.includes('validatePincode') || js.includes('/^\\d{6}$/') || js.includes('^[1-9][0-9]{5}$'), 'Pincode validation logic is required');
assert(js.includes('calculateImpact') || js.includes('computeImpact'), 'Eco-impact calculator logic is required');
assert(js.includes('generateVoucher') || js.includes('createVoucher'), 'Voucher generation logic is required');
assert(js.includes('slot') || js.includes('pickupDate'), 'Pickup slot logic is required');

const requiredLangKeys = [
  'ewaste_hero_title',
  'ewaste_pickup_title',
  'ewaste_reward_title',
  'ewaste_impact_title',
  'ewaste_voucher_label',
  'ewaste_submit_button',
  'ewaste_nav_label'
];

requiredLangKeys.forEach((key) => {
  assert(translations.includes(`"${key}"`), `translations.js missing key: ${key}`);
});

const langCodes = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
langCodes.forEach((lang) => {
  assert(translations.includes(`"${lang}":`), `translations.js missing language block: ${lang}`);
});

assert(css.includes('.ewaste-hero'), 'ewaste.css must define hero styling');
assert(css.includes('.wizard-step'), 'ewaste.css must define wizard layout');
assert(css.includes('.impact-card'), 'ewaste.css must define impact card styles');

console.log('  ✓ Core DOM, validation, reward, and brand-safety checks passed.');
console.log('\n==============================================================');
console.log('✓ E-WASTE TEST LAYER PASSED');
console.log('==============================================================');
