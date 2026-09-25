const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectDir = path.join(__dirname, '..');
const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const requiredFiles = ['launchpad.html', 'launchpad.css', 'launchpad.js'];

console.log('==================================================');
console.log('TEST SUITE: ElectroMart Launchpad Hub (Phase 38)');
console.log('==================================================');

// 1. Check required files
requiredFiles.forEach((fileName) => {
  const filePath = path.join(projectDir, fileName);
  assert(fs.existsSync(filePath), `${fileName} must exist in project directory`);
});
console.log('✓ File existence verified.');

// 2. Read file contents
const html = fs.readFileSync(path.join(projectDir, 'launchpad.html'), 'utf8');
const css = fs.readFileSync(path.join(projectDir, 'launchpad.css'), 'utf8');
const js = fs.readFileSync(path.join(projectDir, 'launchpad.js'), 'utf8');
const pdpHtml = fs.readFileSync(path.join(projectDir, 'product-detail.html'), 'utf8');
const pdpCss = fs.readFileSync(path.join(projectDir, 'product-detail.css'), 'utf8');
const pdpJs = fs.readFileSync(path.join(projectDir, 'product-detail.js'), 'utf8');
const translationsCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');

// 3. Script Order Check in launchpad.html
const expectedScripts = [
  'translations.js',
  'products-data.js',
  'universal-i18n-bus.js',
  'header.js',
  'menu-manager.js',
  'auth-state.js',
  'shared-search.js',
  'launchpad.js'
];

let lastIdx = -1;
expectedScripts.forEach((scriptName) => {
  const idx = html.indexOf(scriptName);
  assert(idx !== -1, `launchpad.html must load ${scriptName}`);
  assert(idx > lastIdx, `Script ${scriptName} is not in the canonical loading order`);
  lastIdx = idx;
});
console.log('✓ Canonical script sequence verified.');

// 4. Required IDs in launchpad.html
const requiredIds = [
  'headerContainer',
  'launchpadHero',
  'startupSpotlight',
  'categoryFilters',
  'launchpadProductGrid',
  'fundingProgressBar',
  'launchpadEmptyState',
  'openApplyModalBtn',
  'startupApplyModal',
  'startupApplyForm',
  'startupName',
  'founderEmail',
  'productCategory',
  'dpiitNumber',
  'applyStatus',
  'launchpadDetailsModal',
  'applicationIdDisplay'
];

requiredIds.forEach((id) => {
  assert(html.includes(`id="${id}"`) || html.includes(`id='${id}'`), `launchpad.html must contain #${id}`);
});
assert(html.includes('amazon-theme.css'), 'launchpad.html must load the shared ElectroMart theme');
assert(html.includes('shared-search.css'), 'launchpad.html must load shared search styles');
['startupName', 'founderEmail', 'productCategory', 'dpiitNumber', 'applyStatus', 'startupDescription', 'fundingGoal', 'currentFunding'].forEach((name) => {
  assert(new RegExp(`name=["']${name}["']`).test(html), `Application control #${name} must have a name attribute`);
});
assert(/id=["']submitApplyBtn["'][^>]*form=["']startupApplyForm["']/.test(html), 'Submit button must target #startupApplyForm');
console.log('✓ Required DOM IDs and form contracts verified.');

// 5. CSS Styling Check
assert(css.includes('--launchpad-orange') || css.includes('#FF6F00') || css.includes('#ff6f00'), 'launchpad.css must style orange accents');
assert(css.includes('backdrop-filter') || css.includes('rgba'), 'launchpad.css must include glassmorphism style rules');
console.log('✓ CSS & glassmorphism theme verified.');

// 6. Logic checks in launchpad.js
assert(js.includes('electromart_startup_applications_v1'), 'launchpad.js must persist startup applications');
assert(js.includes('electromart_launchpad_reservations_v1'), 'launchpad.js must persist early-bird reservations separately');
assert(js.includes('calculateFundingProgress') || js.includes('fundingProgress'), 'launchpad.js must calculate funding progress');
assert(js.includes('launchpad-solarsmart-charger'), 'Launchpad offer IDs must be namespaced away from the canonical catalog');
assert(!js.includes('writeStorage(CART_STORAGE_KEY'), 'Launchpad reservations must not mutate the existing cart schema');

// Sandbox test for funding progress calculation
const sandbox = {
  window: {},
  document: {
    addEventListener: () => {},
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => []
  },
  localStorage: { getItem: () => null, setItem: () => {} },
  console
};
vm.createContext(sandbox);
vm.runInContext(js, sandbox);

const launchpadNamespace = sandbox.window.ElectroMart && sandbox.window.ElectroMart.Launchpad;
assert(launchpadNamespace && typeof launchpadNamespace.calculateFundingProgress === 'function', 'Launchpad namespace must expose funding progress');
const progress = launchpadNamespace.calculateFundingProgress(750000, 1000000);
assert.strictEqual(progress, 75, '750,000 of 1,000,000 must equal 75%');
assert.strictEqual(launchpadNamespace.calculateFundingProgress(1500000, 1000000), 100, 'Overfunded campaigns must cap at 100%');
assert.strictEqual(launchpadNamespace.calculateFundingProgress(-10, 0), 0, 'Invalid funding values must return 0');
console.log('✓ Funding calculation engine verified.');

// 7. PDP Integration Check
assert(pdpHtml.includes('pdpLaunchpadCallout'), 'product-detail.html must contain pdpLaunchpadCallout');
assert(pdpJs.includes('renderPdpLaunchpadCallout'), 'product-detail.js must contain renderPdpLaunchpadCallout function');
assert(pdpJs.includes('isLaunchpadEligible') && !pdpJs.includes('Math.random() > 0.7'), 'PDP Launchpad eligibility must be deterministic');
assert(pdpCss.includes('.pdp-launchpad-callout'), 'product-detail.css must style the PDP Launchpad callout');
console.log('✓ PDP Launchpad callout integration verified.');

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
  'launchpad_hub_title',
  'launchpad_hub_subtitle',
  'launchpad_spotlight_title',
  'launchpad_early_bird',
  'launchpad_funded_percent',
  'launchpad_backers_count',
  'launchpad_preorder_btn',
  'launchpad_apply_cta',
  'launchpad_apply_modal_title',
  'launchpad_startup_name_label',
  'launchpad_founder_email_label',
  'launchpad_category_label',
  'launchpad_dpiit_label',
  'launchpad_apply_submit_btn',
  'launchpad_apply_success',
  'launchpad_reserved',
  'launchpad_taxes_included',
  'launchpad_demo_note',
  'launchpad_pdp_callout',
  'launchpad_pdp_cta',
  'nav_launchpad'
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
console.log('PASS: Phase 38 ElectroMart Launchpad contract verified successfully!');
console.log('==================================================');
