const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectDir = path.join(__dirname, '..');
const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const requiredFiles = ['gaming.html', 'gaming.css', 'gaming.js'];

console.log('==================================================');
console.log('TEST SUITE: ElectroMart Gaming & eSports Arena (Phase 39)');
console.log('==================================================');

// 1. Required files
requiredFiles.forEach((fileName) => {
  const filePath = path.join(projectDir, fileName);
  assert(fs.existsSync(filePath), `${fileName} must exist in project directory`);
});
console.log('✓ File existence verified.');

// 2. Read source contracts
const html = fs.readFileSync(path.join(projectDir, 'gaming.html'), 'utf8');
const css = fs.readFileSync(path.join(projectDir, 'gaming.css'), 'utf8');
const js = fs.readFileSync(path.join(projectDir, 'gaming.js'), 'utf8');
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
  'gaming.js'
];

let lastIndex = -1;
expectedScripts.forEach((scriptName) => {
  const index = html.indexOf(scriptName);
  assert(index !== -1, `gaming.html must load ${scriptName}`);
  assert(index > lastIndex, `Script ${scriptName} is not in the canonical loading order`);
  lastIndex = index;
});
console.log('✓ Canonical script sequence verified.');

// 4. Required DOM contracts
const requiredIds = [
  'gamingHero',
  'rigConfigurator',
  'cpuSelect',
  'gpuSelect',
  'ramSelect',
  'resolutionSelect',
  'estimateFpsBtn',
  'fpsEstimate',
  'rigSummary',
  'tournamentSection',
  'openSponsorModalBtn',
  'sponsorApplyModal',
  'sponsorApplyForm',
  'sponsorName',
  'sponsorEmail',
  'creatorHandle',
  'sponsorGame',
  'sponsorStatus',
  'gamingProductGrid'
];

requiredIds.forEach((id) => {
  assert(html.includes(`id="${id}"`) || html.includes(`id='${id}'`), `gaming.html must contain #${id}`);
});
['sponsorName', 'sponsorEmail', 'creatorHandle', 'sponsorGame'].forEach((name) => {
  assert(new RegExp(`name=["']${name}["']`).test(html), `Sponsor control #${name} must have a name attribute`);
});
assert(/id=["']sponsorSubmitBtn["'][^>]*form=["']sponsorApplyForm["']/.test(html), 'Sponsor submit button must target #sponsorApplyForm');
assert(html.includes('amazon-theme.css') && html.includes('shared-search.css'), 'Gaming page must load shared storefront styles');
console.log('✓ Required DOM and form contracts verified.');

// 5. Theme and accessibility surfaces
assert(css.includes('--gaming-neon') && css.includes('#A855F7'), 'gaming.css must define the gaming neon accent');
assert(css.includes('backdrop-filter') || css.includes('rgba'), 'gaming.css must include glassmorphism surfaces');
assert(css.includes('prefers-reduced-motion'), 'gaming.css must respect reduced-motion preferences');
assert(css.includes('color: #ffffff') && css.includes('font-weight: 700'), 'Gaming CTAs must use readable high-contrast text');
console.log('✓ Theme and accessibility contracts verified.');

// 6. Controller and estimator contracts
assert(js.includes('electromart_gaming_rig_config_v1'), 'gaming.js must persist rig configuration state');
assert(js.includes('electromart_gaming_sponsor_applications_v1'), 'gaming.js must persist sponsor applications');
assert(js.includes('calculateFpsEstimate'), 'gaming.js must expose the FPS estimator engine');
assert(js.includes('ElectroMart.Gaming') || js.includes('ElectroMartGaming'), 'gaming.js must use the approved ElectroMart namespace');

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

const gamingNamespace = sandbox.window.ElectroMart && sandbox.window.ElectroMart.Gaming;
assert(gamingNamespace && typeof gamingNamespace.calculateFpsEstimate === 'function', 'Gaming namespace must expose calculateFpsEstimate');
const lowEstimate = gamingNamespace.calculateFpsEstimate({ gpuTier: 2, cpuTier: 2, ramGb: 8, resolution: '1080p' });
const highEstimate = gamingNamespace.calculateFpsEstimate({ gpuTier: 4, cpuTier: 4, ramGb: 32, resolution: '1080p' });
assert.strictEqual(lowEstimate, 77, 'Low-tier 1080p rig must estimate 77 FPS');
assert.strictEqual(highEstimate, 198, 'High-tier 1080p rig must estimate 198 FPS');
assert(gamingNamespace.calculateFpsEstimate({ gpuTier: 4, cpuTier: 4, ramGb: 32, resolution: '4k' }) < highEstimate, '4K resolution must reduce the estimate');
console.log('✓ FPS estimator engine verified.');

// 7. PDP integration
assert(pdpHtml.includes('pdpGamingArenaCallout') || pdpHtml.includes('pdpGamingArenaBadge'), 'product-detail.html must contain the Gaming Arena callout');
assert(pdpJs.includes('renderPdpGamingArenaCallout'), 'product-detail.js must contain renderPdpGamingArenaCallout');
assert(pdpHtml.includes('ElectroMart Gaming Arena: High-Performance Rig & eSports Certified'), 'PDP must render the Gaming Arena certification message');
console.log('✓ PDP Gaming Arena integration verified.');

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
  'gaming_hub_title',
  'gaming_hub_subtitle',
  'gaming_rig_configurator_title',
  'gaming_cpu_label',
  'gaming_gpu_label',
  'gaming_ram_label',
  'gaming_resolution_label',
  'gaming_estimate_fps_btn',
  'gaming_fps_estimate_label',
  'gaming_tournament_title',
  'gaming_sponsor_apply_cta',
  'gaming_sponsor_modal_title',
  'gaming_sponsor_name_label',
  'gaming_sponsor_email_label',
  'gaming_creator_handle_label',
  'gaming_sponsor_game_label',
  'gaming_sponsor_submit_btn',
  'gaming_pdp_badge'
];
languages.forEach((language) => {
  assert(translations[language], `Language ${language} must exist in translations`);
  expectedI18nKeys.forEach((key) => {
    assert(translations[language][key], `Key "${key}" must exist for language "${language}"`);
  });
});
assert(translationsCode.includes('ELECTROMART_GAMING_I18N'), 'translations.js must expose ELECTROMART_GAMING_I18N');
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

console.log('\n==================================================');
console.log('PASS: Phase 39 ElectroMart Gaming Arena contract verified successfully!');
console.log('==================================================');
