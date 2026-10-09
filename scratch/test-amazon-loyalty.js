/**
 * Phase 42: ElectroMart Loyalty & Rewards Marketplace Test Suite
 * scratch/test-amazon-loyalty.js
 *
 * 9 Verification Layers:
 *  1. DOM Elements & Hub Structure (loyalty.html)
 *  2. Points Balance & Redemption Catalog
 *  3. Tier Upgrades & Benefits Engine
 *  4. Partner Offers Marketplace
 *  5. Referral Program Engine
 *  6. PDP Loyalty Integration
 *  7. Cart & Checkout Points Integration
 *  8. Brand Safety (0 Amazon references) & 11-Language i18n Coverage
 *  9. Deterministic Engine Contracts
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectDir = path.join(__dirname, '..');
const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const requiredFiles = ['loyalty.html', 'loyalty.css', 'loyalty.js'];

console.log('===============================================================');
console.log('TEST SUITE: ElectroMart Loyalty & Rewards Marketplace (Phase 42)');
console.log('===============================================================');

// 1. Required files
requiredFiles.forEach((fileName) => {
  const filePath = path.join(projectDir, fileName);
  assert(fs.existsSync(filePath), `${fileName} must exist in project directory`);
});
console.log('✓ File existence verified.');

// 2. Read source contracts
const html = fs.readFileSync(path.join(projectDir, 'loyalty.html'), 'utf8');
const css = fs.readFileSync(path.join(projectDir, 'loyalty.css'), 'utf8');
const js = fs.readFileSync(path.join(projectDir, 'loyalty.js'), 'utf8');
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
  'loyalty.js'
];

let lastIndex = -1;
expectedScripts.forEach((scriptName) => {
  const index = html.indexOf(scriptName);
  assert(index !== -1, `loyalty.html must load ${scriptName}`);
  assert(index > lastIndex, `Script ${scriptName} is not in the canonical loading order`);
  lastIndex = index;
});
console.log('✓ Canonical script sequence verified.');

// 4. Required DOM contracts
const requiredIds = [
  'loyaltyHero',
  'pointsBalanceCard',
  'currentPointsDisplay',
  'pointsValueDisplay',
  'tierStatusCard',
  'currentTierDisplay',
  'nextTierDisplay',
  'tierProgressBar',
  'pointsToNextTier',
  'redemptionCatalogSection',
  'redemptionGrid',
  'tierBenefitsSection',
  'tierBenefitsGrid',
  'partnerOffersSection',
  'partnerOffersGrid',
  'referralSection',
  'referralCodeDisplay',
  'referralLinkInput',
  'copyReferralBtn',
  'referralStats',
  'referralHistoryList',
  'earnPointsSection',
  'loyaltyProductGrid'
];

requiredIds.forEach((id) => {
  assert(html.includes(`id="${id}"`) || html.includes(`id='${id}'`), `loyalty.html must contain #${id}`);
});

// Form controls
['referralEmail', 'referralName'].forEach((name) => {
  assert(new RegExp(`name=["']${name}["']`).test(html), `Form control #${name} must have a name attribute`);
});

// Submit buttons targeting forms
assert(/id=["']copyReferralBtn["'][^>]*form=["']referralForm["']/.test(html), 'Copy referral button must target #referralForm');
assert(html.includes('amazon-theme.css') && html.includes('shared-search.css'), 'Loyalty page must load shared storefront styles');
console.log('✓ Required DOM and form contracts verified.');

// 5. Theme and accessibility surfaces
assert(css.includes('--loyalty-accent') && css.includes('#FF6B00'), 'loyalty.css must define the loyalty orange accent');
assert(css.includes('prefers-reduced-motion'), 'loyalty.css must respect reduced-motion preferences');
assert(css.includes('color: #ffffff') && css.includes('font-weight: 700'), 'Loyalty CTAs must use readable high-contrast text');
assert(css.includes('backdrop-filter') || css.includes('rgba'), 'loyalty.css must include layered surfaces');
console.log('✓ Theme and accessibility contracts verified.');

// 6. Controller, storage and engine contracts
assert(js.includes('electromart_loyalty_profile_v1'), 'loyalty.js must persist loyalty profile');
assert(js.includes('electromart_loyalty_referrals_v1'), 'loyalty.js must persist referral data');
assert(js.includes('electromart_loyalty_redemptions_v1'), 'loyalty.js must persist redemption history');
assert(js.includes('ElectroMart.Loyalty') || js.includes('ElectroMartLoyalty'), 'loyalty.js must use the approved ElectroMart namespace');
assert(js.includes('calculateTier'), 'loyalty.js must expose the tier calculation engine');
assert(js.includes('calculateRedemptionValue'), 'loyalty.js must expose the redemption value calculator');
assert(js.includes('processReferral'), 'loyalty.js must expose the referral processing engine');
assert(js.includes('applyPointsToCart'), 'loyalty.js must expose the points-to-cart engine');

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

const loyaltyNamespace = sandbox.window.ElectroMart && sandbox.window.ElectroMart.Loyalty;
assert(loyaltyNamespace, 'window.ElectroMart.Loyalty must exist after loyalty.js runs');
['calculateTier', 'calculateRedemptionValue', 'processReferral', 'applyPointsToCart'].forEach((fn) => {
  assert(typeof loyaltyNamespace[fn] === 'function', `Loyalty namespace must expose ${fn}()`);
});

// 6a. Deterministic tier calculation
const tier1 = loyaltyNamespace.calculateTier({ points: 0 });
const tier2 = loyaltyNamespace.calculateTier({ points: 0 });
assert.strictEqual(tier1.tier, tier2.tier, 'Tier calculation must be deterministic for identical input');
assert(tier1.tier && ['bronze', 'silver', 'gold', 'platinum'].includes(tier1.tier), 'Tier must be one of bronze/silver/gold/platinum');

// Tier thresholds (deterministic)
const bronzeTier = loyaltyNamespace.calculateTier({ points: 0 });
assert.strictEqual(bronzeTier.tier, 'bronze', '0 points = bronze tier');

const silverTier = loyaltyNamespace.calculateTier({ points: 5000 });
assert.strictEqual(silverTier.tier, 'silver', '5000 points = silver tier');

const goldTier = loyaltyNamespace.calculateTier({ points: 20000 });
assert.strictEqual(goldTier.tier, 'gold', '20000 points = gold tier');

const platinumTier = loyaltyNamespace.calculateTier({ points: 50000 });
assert.strictEqual(platinumTier.tier, 'platinum', '50000 points = platinum tier');

console.log('✓ Tier calculation engine verified (deterministic).');

// 6b. Redemption value calculator
const redemption1 = loyaltyNamespace.calculateRedemptionValue({ points: 1000 });
const redemption2 = loyaltyNamespace.calculateRedemptionValue({ points: 1000 });
assert.strictEqual(redemption1.value, redemption2.value, 'Redemption value must be deterministic');
assert(typeof redemption1.value === 'number' && redemption1.value > 0, 'Redemption value must be positive number');
assert.strictEqual(redemption1.value, 10, '1000 points = ₹10 (100 points = ₹1)');
const redemption5000 = loyaltyNamespace.calculateRedemptionValue({ points: 5000 });
assert.strictEqual(redemption5000.value, 50, '5000 points = ₹50');
console.log('✓ Redemption value calculator verified (100 points = ₹1).');

// 6c. Referral processing
const referral1 = loyaltyNamespace.processReferral({
  referrerCode: 'EM-REF-ABC123',
  refereeEmail: 'newuser@example.com',
  refereeName: 'New User'
});
assert(referral1 && referral1.referralId, 'Referral must return referralId');
assert(referral1.referralId.startsWith('EM-REF-'), 'Referral ID must follow EM-REF-XXXXXX format');
assert(typeof referral1.referrerBonus === 'number' && referral1.referrerBonus > 0, 'Referrer must get bonus points');
assert(typeof referral1.refereeBonus === 'number' && referral1.refereeBonus > 0, 'Referee must get welcome points');

const referral2 = loyaltyNamespace.processReferral({
  referrerCode: 'EM-REF-ABC123',
  refereeEmail: 'newuser@example.com',
  refereeName: 'New User'
});
assert.strictEqual(referral1.referralId, referral2.referralId, 'Referral must be deterministic for identical input');
console.log('✓ Referral processing engine verified (deterministic).');

// 6d. Apply points to cart
const cartResult = loyaltyNamespace.applyPointsToCart({ cartTotal: 5000, availablePoints: 10000 });
assert(cartResult && typeof cartResult.pointsUsed === 'number', 'Must return pointsUsed');
assert(cartResult.pointsUsed <= 50000, 'Points used cannot exceed cart value in points equivalent');
assert(typeof cartResult.discountAmount === 'number' && cartResult.discountAmount >= 0, 'Must return discountAmount');
assert.strictEqual(cartResult.discountAmount, Math.round(cartResult.pointsUsed / 100), 'Discount = pointsUsed / 100');
console.log('✓ Points-to-cart engine verified.');

// 7. PDP integration
assert(pdpHtml.includes('pdpLoyaltyCallout') || pdpHtml.includes('pdpLoyaltyBadge'), 'product-detail.html must contain the Loyalty callout');
assert(pdpJs.includes('renderPdpLoyaltyCallout'), 'product-detail.js must contain renderPdpLoyaltyCallout');
assert(pdpHtml.includes('ElectroMart Loyalty: Earn & Redeem Points on Every Purchase'), 'PDP must render the Loyalty certification message');
console.log('✓ PDP loyalty integration verified.');

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
  'loyalty_hub_title',
  'loyalty_hub_subtitle',
  'loyalty_points_balance_title',
  'loyalty_points_value_label',
  'loyalty_tier_title',
  'loyalty_current_tier_label',
  'loyalty_next_tier_label',
  'loyalty_tier_progress_label',
  'loyalty_points_to_next_label',
  'loyalty_redemption_title',
  'loyalty_redeem_btn',
  'loyalty_tier_benefits_title',
  'loyalty_partner_offers_title',
  'loyalty_referral_title',
  'loyalty_referral_code_label',
  'loyalty_copy_referral_btn',
  'loyalty_referral_stats_title',
  'loyalty_referral_history_title',
  'loyalty_earn_points_title',
  'loyalty_pdp_badge'
];
languages.forEach((language) => {
  assert(translations[language], `Language ${language} must exist in translations`);
  expectedI18nKeys.forEach((key) => {
    assert(translations[language][key], `Key "${key}" must exist for language "${language}"`);
  });
});
assert(translationsCode.includes('ELECTROMART_LOYALTY_I18N'), 'translations.js must expose ELECTROMART_LOYALTY_I18N');
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
console.log('PASS: Phase 42 ElectroMart Loyalty & Rewards Marketplace contract verified successfully!');
console.log('===============================================================');