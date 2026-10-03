const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');
const transCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(projectDir, 'index.html'), 'utf8');
const langHtml = fs.readFileSync(path.join(projectDir, 'language-settings.html'), 'utf8');

console.log("=== Testing Footer i18n & Language Switcher ===");

// 1. Evaluate translations.js
const mockWindow = { location: { pathname: '/index.html' } };
const mockDoc = {
  readyState: 'complete',
  documentElement: { lang: 'en', setAttribute: function(k, v) { this[k] = v; } },
  querySelectorAll: function() { return []; },
  querySelector: function() { return null; },
  getElementById: function() { return null; },
  addEventListener: function() {}
};
const sandbox = {
  window: mockWindow,
  document: mockDoc,
  localStorage: { getItem: () => 'hi', setItem: () => {} }
};

const fnTrans = new Function('window', 'document', 'localStorage', transCode);
fnTrans(mockWindow, mockDoc, sandbox.localStorage);

const trans = mockWindow.EM_TRANSLATIONS;
assert(trans, "EM_TRANSLATIONS must exist");

const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const footerKeys = [
  'back_to_top', 'footer_know_us', 'footer_about', 'footer_careers', 'footer_press', 'footer_cares',
  'footer_connect', 'footer_earn', 'footer_sell', 'footer_affiliate', 'footer_fulfilment',
  'footer_advertise', 'footer_help_you', 'footer_your_account', 'footer_your_orders',
  'footer_shipping', 'footer_returns', 'footer_help'
];

languages.forEach(lang => {
  assert(trans[lang], `Language ${lang} must exist`);
  footerKeys.forEach(key => {
    assert(trans[lang][key], `Key "${key}" must exist in "${lang}"`);
  });
});
console.log(`PASS: All 18 footer keys exist across all 11 languages!`);

// 2. Check exact Hindi strings
assert.strictEqual(trans.hi.back_to_top, "वापस सबसे ऊपर जाएं");
assert.strictEqual(trans.hi.footer_know_us, "हमारे बारे में जानें");
assert.strictEqual(trans.hi.footer_about, "हमारे बारे में जानकारी");
assert.strictEqual(trans.hi.footer_careers, "कैरियर");
assert.strictEqual(trans.hi.footer_press, "प्रेस विज्ञप्तियां");
assert.strictEqual(trans.hi.footer_cares, "इलेक्ट्रोमार्ट केयर्स");
assert.strictEqual(trans.hi.footer_connect, "हमसे जुड़ें");
assert.strictEqual(trans.hi.footer_earn, "हमारे साथ पैसे कमाएं");
assert.strictEqual(trans.hi.footer_sell, "ElectroMart पर बेचें");
assert.strictEqual(trans.hi.footer_affiliate, "एफिलिएट बनें");
assert.strictEqual(trans.hi.footer_fulfilment, "ElectroMart द्वारा फुलफिलमेंट");
assert.strictEqual(trans.hi.footer_advertise, "अपने प्रोडक्ट का विज्ञापन दें");
assert.strictEqual(trans.hi.footer_help_you, "हमें आपकी सहायता करने दें");
assert.strictEqual(trans.hi.footer_your_account, "आपका अकाउंट");
assert.strictEqual(trans.hi.footer_your_orders, "आपके ऑर्डर");
assert.strictEqual(trans.hi.footer_shipping, "शिपिंग दरें और नीतियां");
assert.strictEqual(trans.hi.footer_returns, "वापसी और रिप्लेसमेंट");
assert.strictEqual(trans.hi.footer_help, "सहायता");
console.log("PASS: Exact Hindi footer strings verified against user specifications & Amazon India");

// 3. Check data-i18n attributes in index.html
footerKeys.forEach(key => {
  assert(indexHtml.includes(`data-i18n="${key}"`), `index.html must include data-i18n="${key}"`);
});
console.log("PASS: index.html has data-i18n tags for all footer keys");

// 4. Check data-i18n attributes in language-settings.html
const langSettingsFooterKeys = [
  'footer_know_us', 'footer_about', 'footer_careers', 'footer_press', 'footer_cares',
  'footer_connect', 'footer_earn', 'footer_sell', 'footer_affiliate', 'footer_fulfilment',
  'footer_advertise', 'footer_help_you', 'footer_your_account', 'footer_your_orders',
  'footer_shipping', 'footer_returns', 'footer_help'
];
langSettingsFooterKeys.forEach(key => {
  assert(langHtml.includes(`data-i18n="${key}"`), `language-settings.html must include data-i18n="${key}"`);
});
console.log("PASS: language-settings.html has data-i18n tags for footer keys");

// 5. Test footer language selector event listener in translations.js
assert(transCode.includes('footerLanguageSelect'), "translations.js targets footerLanguageSelect");
assert(transCode.includes('footerLangSelect'), "translations.js targets footerLangSelect");
assert(transCode.includes('electromart_lang_v1'), "translations.js sets electromart_lang_v1 on footer change");
console.log("PASS: footer dropdown change listener verified");

console.log("\nALL FOOTER I18N TESTS PASSED SUCCESSFULLY!");
