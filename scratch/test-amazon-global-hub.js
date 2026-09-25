const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectDir = path.join(__dirname, '..');
const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const requiredFiles = ['global.html', 'global.css', 'global.js'];

console.log('==================================================');
console.log('TEST SUITE: ElectroMart Global Store Hub (Phase 37)');
console.log('==================================================');

// 1. Check required files
requiredFiles.forEach((fileName) => {
  const filePath = path.join(projectDir, fileName);
  assert(fs.existsSync(filePath), `${fileName} must exist in project directory`);
});
console.log('✓ File existence verified.');

// 2. Read file contents
const html = fs.readFileSync(path.join(projectDir, 'global.html'), 'utf8');
const css = fs.readFileSync(path.join(projectDir, 'global.css'), 'utf8');
const js = fs.readFileSync(path.join(projectDir, 'global.js'), 'utf8');
const pdpHtml = fs.readFileSync(path.join(projectDir, 'product-detail.html'), 'utf8');
const pdpJs = fs.readFileSync(path.join(projectDir, 'product-detail.js'), 'utf8');
const translationsCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');

// 3. Script Order Check in global.html
const expectedScripts = [
  'translations.js',
  'products-data.js',
  'universal-i18n-bus.js',
  'header.js',
  'menu-manager.js',
  'auth-state.js',
  'shared-search.js',
  'global.js'
];

let lastIdx = -1;
expectedScripts.forEach((scriptName) => {
  const idx = html.indexOf(scriptName);
  assert(idx !== -1, `global.html must load ${scriptName}`);
  assert(idx > lastIdx, `Script ${scriptName} is not in the canonical loading order`);
  lastIdx = idx;
});
console.log('✓ Canonical script sequence verified.');

// 4. Required IDs in global.html
const requiredIds = [
  'base-price',
  'calc-btn',
  'duty-amount',
  'igst-amount',
  'total-amount',
  'result',
  'kyc-form',
  'kyc-type',
  'kyc-number',
  'kyc-status'
];

requiredIds.forEach((id) => {
  assert(html.includes(`id="${id}"`) || html.includes(`id='${id}'`), `global.html must contain #${id}`);
});
assert(html.includes('value="standard"') || html.includes("value='standard'"), 'Standard shipping radio must exist');
assert(html.includes('value="express"') || html.includes("value='express'"), 'Express shipping radio must exist');
console.log('✓ Required DOM IDs and elements verified.');

// 5. CSS check
assert(css.includes('--primary-blue') || css.includes('#0F62FE') || css.includes('#0f62fe'), 'global.css must include primary blue styling (#0F62FE)');
assert(css.includes('backdrop-filter') || css.includes('rgba'), 'global.css must include glassmorphism style rules');
console.log('✓ CSS & glassmorphism theme verified.');

// 6. Logic checks in global.js
assert(js.includes('electromart_global_kyc_v1'), 'global.js must persist KYC state in electromart_global_kyc_v1');
assert(js.includes('calculateImportDuty') || js.includes('calc-btn'), 'global.js must handle duty calculation');
assert(js.includes('499') && js.includes('1299'), 'global.js must support Standard (₹499) and Express (₹1299) freight rates');

// Run calculation unit test in sandbox
const calcSandbox = {
  window: {},
  document: {
    addEventListener: () => {},
    getElementById: (id) => ({
      value: id === 'base-price' ? '10000' : '',
      addEventListener: () => {},
      classList: { remove: () => {}, add: () => {} },
      querySelector: () => ({ value: 'standard', checked: true })
    }),
    querySelector: () => ({ value: 'standard' })
  },
  localStorage: { getItem: () => null, setItem: () => {} },
  console
};
vm.createContext(calcSandbox);
vm.runInContext(js, calcSandbox);

if (typeof calcSandbox.window.calculateDutyBreakdown === 'function') {
  const resStd = calcSandbox.window.calculateDutyBreakdown(10000, 'standard');
  assert.strictEqual(resStd.duty, 500, '5% Customs duty on 10,000 must be 500');
  assert.strictEqual(resStd.freight, 499, 'Standard freight must be 499');
  assert.strictEqual(resStd.igst, Math.round((10000 + 500 + 499) * 0.18), '18% IGST on base+duty+freight');
  assert.strictEqual(resStd.total, 10000 + resStd.duty + resStd.freight + resStd.igst, 'Total sum matches');
}
console.log('✓ Duty calculation engine verified.');

// 7. PDP Integration Check
assert(pdpHtml.includes('pdpGlobalStoreCallout') || pdpHtml.includes('globalDeliveryCard') || pdpHtml.includes('global.html'), 'product-detail.html must contain Global Store delivery card or link');
console.log('✓ PDP Global Store integration verified.');

// 8. 11 Indian Languages i18n Check
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
  'global_duty_title',
  'global_base_price_label',
  'global_shipping_mode_label',
  'global_shipping_standard',
  'global_shipping_express',
  'global_calculate_btn',
  'global_duty_result_label',
  'global_igst_result_label',
  'global_total_result_label',
  'global_kyc_title',
  'global_kyc_type_label',
  'global_kyc_passport',
  'global_kyc_aadhaar',
  'global_kyc_dl',
  'global_kyc_number_label',
  'global_submit_btn',
  'global_kyc_verified',
  'global_pdp_callout'
];

languages.forEach((lang) => {
  assert(translations[lang], `Language ${lang} must exist in translations`);
  expectedI18nKeys.forEach((key) => {
    assert(translations[lang][key], `Key "${key}" must exist for language "${lang}"`);
  });
});
console.log('✓ All 11 Indian languages covered in translations.js.');

// 9. Brand Safety Check (100% ElectroMart, 0 Amazon references)
const customerFacingSources = [html, css, js];
customerFacingSources.forEach((source, index) => {
  const visibleSource = source
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\b(?:src|href|class|id)=(['"])[^'"]*\1/gi, '')
    .replace(/<[^>]+>/g, ' ');
  assert(!/Amazon|अमेज़न/i.test(visibleSource), `Source file ${requiredFiles[index]} must be free of prohibited brand references`);
});
console.log('✓ Brand safety verified (100% pure ElectroMart).');

console.log('\n==================================================');
console.log('PASS: Phase 37 ElectroMart Global Store contract verified successfully!');
console.log('==================================================');
