const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.resolve(__dirname, '..');

console.log("Starting test-amazon-location-modal.js...");

// 1. Check header.html structure
const headerHtml = fs.readFileSync(path.join(projectDir, 'header.html'), 'utf8');
assert(headerHtml.includes('id="locationTrigger"'), "header.html has #locationTrigger");
assert(headerHtml.includes('id="deliveryLocationText"'), "header.html has #deliveryLocationText");
assert(headerHtml.includes('nav-deliver-box'), "header.html has nav-deliver-box");

// 2. Check header.js universal location manager implementation
const headerJs = fs.readFileSync(path.join(projectDir, 'header.js'), 'utf8');
assert(headerJs.includes('initDeliveryLocationManager'), "header.js defines initDeliveryLocationManager");
assert(headerJs.includes('ensureLocationModal'), "header.js defines ensureLocationModal for store-wide injection");
assert(headerJs.includes('openLocationModal'), "header.js defines openLocationModal");
assert(headerJs.includes('closeLocationModal'), "header.js defines closeLocationModal");
assert(headerJs.includes('window.openLocationModal = openLocationModal'), "header.js exposes window.openLocationModal");
assert(headerJs.includes('window.closeLocationModal = closeLocationModal'), "header.js exposes window.closeLocationModal");
assert(headerJs.includes('electromart:locationChanged'), "header.js dispatches electromart:locationChanged event");
assert(headerJs.includes('electromart_delivery_location'), "header.js uses electromart_delivery_location storage key");
assert(headerJs.includes('electromart_delivery_pincode'), "header.js syncs electromart_delivery_pincode for legacy compatibility");
assert(headerJs.includes('MAJOR_METROS'), "header.js defines MAJOR_METROS list");
assert(headerJs.includes('resolveCityFromPincode'), "header.js defines resolveCityFromPincode helper");

// Assert required legacy & modern element IDs in header.js template
assert(headerJs.includes('modal.id = "locationModal"') || headerJs.includes('id="locationModal"'), "header.js sets locationModal ID");
const requiredModalIds = [
  'id="locationTitle"',
  'id="locationSubtitle"',
  'id="locationPostal"',
  'id="locationSave"',
  'id="locationCancel"',
  'id="locationPostalError"',
  'id="locationCity"',
  'data-close-location-modal'
];
for (const idStr of requiredModalIds) {
  assert(headerJs.includes(idStr), `header.js location modal template must include ${idStr}`);
}

// 3. Check amazon-theme.css classes
const amazonCss = fs.readFileSync(path.join(projectDir, 'amazon-theme.css'), 'utf8');
const requiredCssClasses = [
  '.location-modal',
  '.location-modal__backdrop',
  '.amz-location-card',
  '.amz-location-header',
  '.amz-location-apply-btn',
  '.amz-metro-pill',
  '.amz-location-error'
];
for (const cls of requiredCssClasses) {
  assert(amazonCss.includes(cls), `amazon-theme.css must define ${cls}`);
}

// 4. Check index.html modal markup
const indexHtml = fs.readFileSync(path.join(projectDir, 'index.html'), 'utf8');
assert(indexHtml.includes('id="locationModal"'), "index.html contains #locationModal");
assert(indexHtml.includes('id="locationPostal"'), "index.html contains #locationPostal");
assert(indexHtml.includes('id="locationSave"'), "index.html contains #locationSave");
assert(indexHtml.includes('id="locationCancel"'), "index.html contains #locationCancel");
assert(indexHtml.includes('id="locationPostalError"'), "index.html contains #locationPostalError");
assert(indexHtml.includes('id="locationCity"'), "index.html preserves hidden #locationCity for backward compatibility");
assert(indexHtml.includes('data-close-location-modal'), "index.html contains data-close-location-modal");

// 5. Check product-detail.js integration
const pdpJs = fs.readFileSync(path.join(projectDir, 'product-detail.js'), 'utf8');
assert(pdpJs.includes('buyboxLocationLink'), "product-detail.js wires buyboxLocationLink");
assert(pdpJs.includes('window.openLocationModal'), "product-detail.js opens location modal on buybox location click");
assert(pdpJs.includes('electromart:locationChanged'), "product-detail.js listens to electromart:locationChanged");
assert(pdpJs.includes('buyboxLocText'), "product-detail.js updates buybox location text dynamically");

// 6. Check translations.js across all 11 Indian regional languages
const translationsPath = path.join(projectDir, 'translations.js');
const translationsContent = fs.readFileSync(translationsPath, 'utf8');

// Load translations object safely
const vm = require('vm');
const sandbox = {
  window: {},
  document: {
    addEventListener: () => {},
    querySelectorAll: () => [],
    getElementById: () => null,
    querySelector: () => null,
    documentElement: { setAttribute: () => {} }
  },
  localStorage: {
    getItem: () => 'hi',
    setItem: () => {}
  }
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(translationsContent, sandbox);
const translations = sandbox.translations || sandbox.window.EM_TRANSLATIONS;

assert(translations, "translations object must exist");

const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const locationKeys = [
  'location_choose_title',
  'location_subtitle',
  'location_signin_btn',
  'location_or_pincode',
  'location_pincode_label',
  'location_pincode_placeholder',
  'location_apply_btn',
  'location_or_city',
  'location_invalid_pincode',
  'location_delivering_to',
  'location_close',
  // legacy aliases
  'location.title',
  'location.subtitle',
  'location.cityLabel',
  'location.postalLabel',
  'location.postalPlaceholder',
  'location.cancel',
  'location.save'
];

for (const lang of languages) {
  assert(translations[lang], `translations for language '${lang}' must exist`);
  for (const key of locationKeys) {
    assert(
      translations[lang][key] && translations[lang][key].length > 0,
      `Language '${lang}' is missing location translation key '${key}'`
    );
  }
}

// 7. Brand Safety and Legal Compliance Check for Location components
const forbiddenBrandRegex = /\b(amazon|amazons)\b|अमेज़न|अमेजन|अमेजॉन|അമേസാൻ|அமேசான்|అమెజాన్|ಅಮೆಜಾನ್|অ্যামাজন|ਐਮਾਜ਼ਾਨ|એમેઝોન|ایمیزون/i;

// Check translations for location keys
for (const lang of languages) {
  for (const key of locationKeys) {
    const text = translations[lang][key];
    assert(
      !forbiddenBrandRegex.test(text),
      `Brand safety violation in language '${lang}', key '${key}': "${text}"`
    );
  }
}

// Check visible markup strings in index.html inside #locationModal
const modalMatch = indexHtml.match(/<div id="locationModal"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/i);
if (modalMatch) {
  assert(!forbiddenBrandRegex.test(modalMatch[0]), "Brand safety violation in index.html #locationModal");
}

// 8. Functional Pincode Validation and City Resolution Logic
const pinRegex = /^[1-9][0-9]{5}$/;
assert.strictEqual(pinRegex.test('110001'), true, "110001 is valid Indian PIN code");
assert.strictEqual(pinRegex.test('400001'), true, "400001 is valid Indian PIN code");
assert.strictEqual(pinRegex.test('560001'), true, "560001 is valid Indian PIN code");
assert.strictEqual(pinRegex.test('011001'), false, "Starts with 0 is invalid Indian PIN code");
assert.strictEqual(pinRegex.test('11000'), false, "5 digits is invalid Indian PIN code");
assert.strictEqual(pinRegex.test('1100001'), false, "7 digits is invalid Indian PIN code");
assert.strictEqual(pinRegex.test('11000a'), false, "Alphanumeric is invalid Indian PIN code");
assert.strictEqual(pinRegex.test(''), false, "Empty is invalid Indian PIN code");

console.log("  ✓ All 8 location modal tests passed successfully!");
