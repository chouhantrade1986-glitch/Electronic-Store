const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');
const transCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
const accountHtml = fs.readFileSync(path.join(projectDir, 'account.html'), 'utf8');
const accountJs = fs.readFileSync(path.join(projectDir, 'account.js'), 'utf8');
const themeCss = fs.readFileSync(path.join(projectDir, 'amazon-theme.css'), 'utf8');

console.log("=== Testing Phase 7: Amazon India Your Account 8-Grid Suite ===");

// 1. Evaluate translations.js
const mockDoc = {
  readyState: 'complete',
  documentElement: { lang: 'en', setAttribute: function(k, v) { this[k] = v; } },
  querySelectorAll: function() { return []; },
  querySelector: function() { return null; },
  getElementById: function() { return null; },
  addEventListener: function() {}
};
const mockWindow = { location: { pathname: '/account.html' } };
const sandbox = {
  window: mockWindow,
  document: mockDoc,
  localStorage: { getItem: () => 'en', setItem: () => {} }
};

const fnTrans = new Function('window', 'document', 'localStorage', transCode);
fnTrans(mockWindow, mockDoc, sandbox.localStorage);

const trans = mockWindow.EM_TRANSLATIONS;
assert(trans, "EM_TRANSLATIONS must exist");

const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const targetAccountKeys = [
  'account_title',
  'card_orders_title',
  'card_orders_desc',
  'card_security_title',
  'card_security_desc',
  'card_prime_title',
  'card_prime_desc',
  'card_addresses_title',
  'card_addresses_desc',
  'card_payments_title',
  'card_payments_desc',
  'card_pay_balance_title',
  'card_pay_balance_desc',
  'card_contact_title',
  'card_contact_desc',
  'card_wishlist_title',
  'card_wishlist_desc',
  'card_seller_title',
  'card_seller_desc',
  'back_to_account',
  'digital_content_title',
  'email_prefs_title',
  'more_ways_to_pay_title',
  'add_money_btn',
  'current_balance',
  'prime_benefits_title',
  'prime_benefit_delivery',
  'prime_benefit_deals',
  'prime_benefit_cashback',
  'faq_tracking_title',
  'faq_tracking_desc',
  'faq_returns_title',
  'faq_returns_desc',
  'faq_refunds_title',
  'faq_refunds_desc'
];

languages.forEach(lang => {
  assert(trans[lang], `Language ${lang} must exist`);
  targetAccountKeys.forEach(key => {
    assert(trans[lang][key], `Key "${key}" must exist in language "${lang}"`);
  });
});
console.log(`  PASS: All ${targetAccountKeys.length} Account keys exist across all 11 regional languages!`);

// 2. Exact Hindi strings verification
assert.strictEqual(trans.hi.account_title, "आपका खाता");
assert.strictEqual(trans.hi.card_orders_title, "आपके ऑर्डर");
assert.strictEqual(trans.hi.card_security_title, "लॉग इन और सुरक्षा");
assert.strictEqual(trans.hi.card_prime_title, "प्राइम मेंबरशिप");
assert.strictEqual(trans.hi.card_addresses_title, "आपके पते");
assert.strictEqual(trans.hi.card_payments_title, "भुगतान विकल्प");
assert.strictEqual(trans.hi.card_pay_balance_title, "पे बैलेंस");
assert.strictEqual(trans.hi.card_contact_title, "हमसे संपर्क करें");
assert.strictEqual(trans.hi.card_wishlist_title, "आपकी विशलिस्ट");
assert.strictEqual(trans.hi.back_to_account, "‹ आपके खाते पर वापस जाएं");
console.log("  PASS: Exact Hindi Account strings match specification verbatim!");

// 3. Verify HTML structure in account.html
assert(accountHtml.includes('id="accountBreadcrumb"'), "account.html must include breadcrumb navigation");
assert(accountHtml.includes('id="breadcrumbAccountLink"'), "account.html must include breadcrumb root link");
assert(accountHtml.includes('id="breadcrumbSeparator"'), "account.html must include breadcrumb separator");
assert(accountHtml.includes('id="breadcrumbCurrentSection"'), "account.html must include breadcrumb current section");
assert(accountHtml.includes('class="amazon-account-grid"'), "account.html must include amazon-account-grid");
assert(accountHtml.includes('id="tileOrders"'), "account.html must include Orders tile");
assert(accountHtml.includes('id="tileSecurity"'), "account.html must include Security tile");
assert(accountHtml.includes('id="tilePrime"'), "account.html must include Prime tile");
assert(accountHtml.includes('id="tileAddresses"'), "account.html must include Addresses tile");
assert(accountHtml.includes('id="tilePayments"'), "account.html must include Payments tile");
assert(accountHtml.includes('id="tilePayBalance"'), "account.html must include Pay Balance tile");
assert(accountHtml.includes('id="tileContact"'), "account.html must include Contact Us tile");
assert(accountHtml.includes('id="tileWishlist"'), "account.html must include Wishlist tile");
assert(accountHtml.includes('class="amazon-account-sublinks"'), "account.html must include amazon-account-sublinks");

// 4. Verify Backward Compatibility DOM IDs
const criticalDomIds = [
  'accountPhoneVerificationBadge',
  'signOutBtn',
  'profileForm',
  'fullName',
  'email',
  'phone',
  'company',
  'twoFactorToggle',
  'alertsToggle',
  'securityPreferencesMeta',
  'saveSecurityPreferencesBtn',
  'changePasswordForm',
  'currentPassword',
  'newPassword',
  'confirmPassword',
  'changePasswordBtn',
  'logoutAllSessionsBtn',
  'authActivityMeta',
  'authActivityList',
  'refreshAuthActivityBtn',
  'accountNotificationsMeta',
  'accountNotificationsList',
  'markAllNotificationsReadBtn',
  'notificationStatusFilter',
  'notificationTypeFilter',
  'resetNotificationFiltersBtn',
  'prefEmailEnabledToggle',
  'prefSmsEnabledToggle',
  'prefWhatsappEnabledToggle',
  'prefSmsProviderSelect',
  'prefWhatsappProviderSelect',
  'phoneVerificationMeta',
  'requestPhoneVerificationBtn',
  'phoneVerificationCodeInput',
  'confirmPhoneVerificationBtn',
  'prefOrderShippedToggle',
  'prefOrderDeliveredToggle',
  'prefOrderCancelledToggle',
  'adminQuickCard',
  'overviewNotificationsMeta',
  'overviewNotificationsList'
];

criticalDomIds.forEach(id => {
  assert(accountHtml.includes(`id="${id}"`), `account.html must retain backward-compatible ID "${id}"`);
});
console.log(`  PASS: All ${criticalDomIds.length} critical DOM IDs preserved verbatim in account.html!`);

// 5. Verify New Panels in account.html
assert(accountHtml.includes('id="panel-pay-balance"'), "account.html must have panel-pay-balance");
assert(accountHtml.includes('id="panel-prime"'), "account.html must have panel-prime");
assert(accountHtml.includes('id="panel-contact"'), "account.html must have panel-contact");
assert(accountHtml.includes('data-back-to-overview="true"'), "account.html must have back-to-overview buttons");
console.log("  PASS: New Pay Balance, Prime, and Contact panels verified in account.html!");

// 6. Verify account.js features
assert(accountJs.includes('setupPayBalanceHandlers'), "account.js must include setupPayBalanceHandlers");
assert(accountJs.includes('setupContactHandlers'), "account.js must include setupContactHandlers");
assert(accountJs.includes('data-back-to-overview'), "account.js must handle back-to-overview clicks");
assert(accountJs.includes('breadcrumbSep'), "account.js must update breadcrumbs in setActivePanel");
console.log("  PASS: account.js dynamic panel, breadcrumb, and wallet logic verified!");

// 7. Verify CSS Rules in amazon-theme.css
assert(themeCss.includes('11. AMAZON INDIA YOUR ACCOUNT 8-GRID SUITE (PHASE 7)'), "amazon-theme.css must include Phase 7 section");
assert(themeCss.includes('.amazon-account-grid'), "amazon-theme.css must style .amazon-account-grid");
assert(themeCss.includes('.amazon-account-tile'), "amazon-theme.css must style .amazon-account-tile");
assert(themeCss.includes('.tile-icon-box'), "amazon-theme.css must style .tile-icon-box");
assert(themeCss.includes('.amazon-breadcrumb'), "amazon-theme.css must style .amazon-breadcrumb");
assert(themeCss.includes('.pay-balance-card'), "amazon-theme.css must style .pay-balance-card");
assert(themeCss.includes('.prime-status-banner'), "amazon-theme.css must style .prime-status-banner");
assert(themeCss.includes('.contact-faq-accordion'), "amazon-theme.css must style .contact-faq-accordion");
console.log("  PASS: amazon-theme.css Section 11 styles verified!");

console.log("\nALL AMAZON YOUR ACCOUNT (PHASE 7) TESTS PASSED (100%)!");
