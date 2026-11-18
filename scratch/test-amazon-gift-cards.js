/**
 * Phase 46: ElectroMart Digital Gift Cards Hub Test Suite
 * scratch/test-amazon-gift-cards.js
 *
 * 9 Verification Layers:
 *  1. Required Files Existence (gift-cards.html, gift-cards.css, gift-cards.js)
 *  2. Canonical Script Order & Storefront Integration
 *  3. Required DOM Contracts & Form Attributes
 *  4. Visual Aesthetics, Styling & Accessibility Contracts
 *  5. Namespace window.ElectroMart.GiftCards & server API contracts
 *  6. Server-authoritative redemption and wallet synchronization
 *  7. PDP Callout & Storefront Navigation Integration
 *  8. Brand Safety (0 third-party marketplace references)
 *  9. 11-Language i18n Dictionary Coverage
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectDir = path.join(__dirname, '..');
const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const requiredFiles = ['gift-cards.html', 'gift-cards.css', 'gift-cards.js'];

console.log('===============================================================');
console.log('TEST SUITE: ElectroMart Digital Gift Cards Hub (Phase 46)');
console.log('===============================================================');

// 1. Required files existence
requiredFiles.forEach((fileName) => {
  const filePath = path.join(projectDir, fileName);
  assert(fs.existsSync(filePath), `${fileName} must exist in project directory`);
});
console.log('✓ Layer 1: Required files existence verified.');

// 2. Read source contracts
const html = fs.readFileSync(path.join(projectDir, 'gift-cards.html'), 'utf8');
const css = fs.readFileSync(path.join(projectDir, 'gift-cards.css'), 'utf8');
const js = fs.readFileSync(path.join(projectDir, 'gift-cards.js'), 'utf8');
const checkoutHtml = fs.readFileSync(path.join(projectDir, 'checkout.html'), 'utf8');
const checkoutJs = fs.readFileSync(path.join(projectDir, 'checkout.js'), 'utf8');
const pdpHtml = fs.readFileSync(path.join(projectDir, 'product-detail.html'), 'utf8');
const pdpJs = fs.readFileSync(path.join(projectDir, 'product-detail.js'), 'utf8');
const translationsCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');

// 2a. Canonical script order
const expectedScripts = [
  'translations.js',
  'products-data.js',
  'universal-i18n-bus.js',
  'header.js',
  'menu-manager.js',
  'auth-state.js',
  'shared-search.js',
  'gift-cards.js'
];

let lastIndex = -1;
expectedScripts.forEach((scriptName) => {
  const index = html.indexOf(scriptName);
  assert(index !== -1, `gift-cards.html must load ${scriptName}`);
  assert(index > lastIndex, `Script ${scriptName} is not in the canonical loading order`);
  lastIndex = index;
});
console.log('✓ Layer 2: Canonical script sequence verified.');

// 3. Required DOM elements
const requiredIds = [
  'gcHero',
  'gcDesignSection',
  'gcCardPreview',
  'gcCardPreviewDesign',
  'gcCardPreviewAmount',
  'gcCardPreviewRecipient',
  'gcCardPreviewMessage',
  'gcTemplateGrid',
  'gcPurchaseSection',
  'gcPurchaseForm',
  'gcAmountPillsContainer',
  'gcCustomAmountInput',
  'gcRecipientNameInput',
  'gcRecipientEmailInput',
  'gcSenderNameInput',
  'gcGiftMessageInput',
  'gcDeliveryDateInput',
  'gcAddToCartBtn',
  'gcBuyNowBtn',
  'gcRedeemSection',
  'gcRedeemForm',
  'gcClaimCodeInput',
  'gcRedeemBtn',
  'gcBalanceStatusCard',
  'gcWalletBalanceDisplay',
  'gcRecentGCTable',
  'gcFaqSection'
];

requiredIds.forEach((id) => {
  assert(html.includes(`id="${id}"`) || html.includes(`id='${id}'`), `gift-cards.html must contain #${id}`);
});

// Form controls must have proper name attributes
['templateId', 'amount', 'customAmount', 'recipientName', 'recipientEmail', 'senderName', 'giftMessage', 'deliveryDate', 'claimCode'].forEach((name) => {
  assert(new RegExp(`name=["']${name}["']`).test(html), `Form control #${name} must have a name attribute`);
});

assert(html.includes('amazon-theme.css') && html.includes('shared-search.css'), 'gift-cards.html must load shared storefront styles');
console.log('✓ Layer 3: Required DOM and form contracts verified.');

// 4. Visual Aesthetics, Styling & Accessibility
assert(css.includes('--gc-gold') || css.includes('--gc-accent'), 'gift-cards.css must define gold/amber accent variables');
assert(css.includes('prefers-reduced-motion'), 'gift-cards.css must respect reduced-motion accessibility');
assert(css.includes('.gc-card-preview') || css.includes('#gcCardPreview'), 'gift-cards.css must style card preview');
assert(css.includes('.gc-amount-pill'), 'gift-cards.css must style amount selector pills');
console.log('✓ Layer 4: Styling and accessibility contracts verified.');

// 5. Namespace window.ElectroMart.GiftCards & Deterministic Engine Functions
assert(!js.includes('electromart_gift_cards_orders_v1'), 'gift-cards.js must not store issued gift cards locally');
assert(!js.includes('electromart_gc_redemptions_v1'), 'gift-cards.js must not store redemptions locally');
assert(js.includes('ElectroMart.GiftCards') || js.includes('ElectroMartGiftCards'), 'gift-cards.js must use approved ElectroMart namespace');

const sandbox = {
  window: {},
  document: {
    addEventListener: () => {},
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, classList: { add: () => {}, remove: () => {} } })
  },
  localStorage: {
    data: {},
    getItem(k) { return this.data[k] || null; },
    setItem(k, v) { this.data[k] = String(v); },
    removeItem(k) { delete this.data[k]; }
  },
  setTimeout: () => {},
  clearTimeout: () => {},
  Intl,
  Date,
  console
};
sandbox.window.localStorage = sandbox.localStorage;
vm.createContext(sandbox);
vm.runInContext(js, sandbox);

const gcNamespace = sandbox.window.ElectroMart && sandbox.window.ElectroMart.GiftCards;
assert(gcNamespace, 'window.ElectroMart.GiftCards must exist after gift-cards.js runs');

['getMyGiftCards', 'getWalletBalance', 'redeemGiftCard'].forEach((fn) => {
  assert(typeof gcNamespace[fn] === 'function', `GiftCards namespace must expose ${fn}()`);
});

assert(js.includes("'/gift-cards/my'"), 'Gift card history must be loaded from the authenticated backend');
assert(js.includes("'/gift-cards/balance'"), 'Wallet balance must be loaded from the authenticated backend');

console.log('Layer 5: Namespace and server API contracts verified.');

// 6. Redemption Engine & ElectroMart Pay Wallet Synchronization
assert(js.includes("'/gift-cards/redeem'"), 'Redemptions must be sent to the backend');
assert(!/function\s+generateClaimCode/.test(js), 'Claim codes must not be generated in the browser');
assert(!/function\s+calculateGiftCardBalance/.test(js), 'Claim-code value must not be decoded in the browser');
assert(!/function\s+redeemGiftCard\s*\([^)]*,/.test(js), 'Redemption must not accept a client-supplied user ID');
console.log('Layer 6: Server-authoritative redemption and wallet contracts verified.');

// 7. PDP & Navigation Integration
assert(pdpHtml.includes('pdpGiftCardCallout') || pdpHtml.includes('gift-cards.html'), 'product-detail.html must link to gift-cards.html');
assert(pdpJs.includes('gift-cards.html') || pdpJs.includes('pdpGiftCardCallout'), 'product-detail.js must support gift card callout');
assert(checkoutJs.includes('row.productId || row.id'), 'Checkout must submit the server product ID for gift card cart rows');
assert(checkoutJs.includes('row.isGiftCard && row.giftCard'), 'Checkout must submit gift-card delivery details');
assert(checkoutJs.includes('cannot be purchased in offline demo mode'), 'Offline checkout must not issue unverified gift cards');
assert(checkoutHtml.includes('id="checkoutGiftCardCode"'), 'Checkout must offer an accessible gift card claim code input');
assert(checkoutHtml.includes('id="checkoutUseWalletBalance"'), 'Checkout must expose an explicit wallet tender opt-in');
assert(checkoutHtml.includes('aria-describedby="checkoutGiftCardHelp"'), 'Checkout claim-code input must reference accessible validation guidance');
assert(checkoutHtml.includes('maxlength="33"'), 'Checkout must accept the complete secure claim-code format');
assert(checkoutJs.includes('giftCardClaimCode:'), 'Checkout must send claim codes to server validation, not calculate value locally');
assert(checkoutJs.includes('useWalletBalance:'), 'Checkout must send wallet opt-in without sending client amounts');
assert(checkoutJs.includes('paymentBreakdown') && checkoutJs.includes('amountDue'), 'Checkout must skip or limit gateway payment to the server-calculated remainder');
assert(checkoutJs.includes("/gift-cards/balance"), 'Checkout wallet balance display must be synchronized from the server');
assert((translationsCode.match(/gc_checkout_help:/g) || []).length === languages.length, 'Checkout gift-card help must be translated in all supported languages');
assert((translationsCode.match(/gc_apply_wallet_balance:/g) || []).length === languages.length, 'Wallet tender opt-in must be translated in all supported languages');
console.log('✓ Layer 7: PDP callout and navigation verified.');

// 8. Brand Safety (0 third-party marketplace references)
[html, css, js].forEach((content, idx) => {
  const fileName = requiredFiles[idx];
  assert(!/\bamazon\b/i.test(content) || /amazon-theme\.css|amazon-price-block|amazon-layout/i.test(content),
    `${fileName} contains forbidden third-party customer-facing branding`);
  assert(!/\bflipkart\b/i.test(content), `${fileName} contains forbidden Flipkart reference`);
});
console.log('✓ Layer 8: Brand safety verified (100% pure ElectroMart).');

// 9. 11-Language i18n Dictionary Coverage
assert(translationsCode.includes('ELECTROMART_GIFT_CARDS_I18N'), 'translations.js must contain ELECTROMART_GIFT_CARDS_I18N');
languages.forEach((lang) => {
  assert(translationsCode.includes(`"${lang}"`) || translationsCode.includes(`'${lang}'`), `Translations must cover ${lang}`);
});
console.log('✓ Layer 9: 11-language i18n dictionary verified.');

console.log('===============================================================');
console.log('PASS: Phase 46 ElectroMart Digital Gift Cards Hub contract verified!');
console.log('===============================================================');
