const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const engine = require('../recommendations.js');

const root = path.resolve(__dirname, '..');
const langs = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const catalog = [
  { id: 'laptop-1', name: 'Studio Laptop', brand: 'Astra', category: 'laptop', keywords: ['creator', 'portable'], price: 50000, stock: 8, rating: 4.8, featured: true },
  { id: 'laptop-2', name: 'Travel Laptop', brand: 'Astra', category: 'laptop', keywords: ['portable'], price: 35000, stock: 4, rating: 4.5 },
  { id: 'mouse-1', name: 'Wireless Mouse', brand: 'Orbit', category: 'accessory', keywords: ['portable', 'wireless'], price: 1200, stock: 20, rating: 4.4 },
  { id: 'audio-1', name: 'Studio Headphones', brand: 'Pulse', category: 'audio', keywords: ['creator', 'wireless'], price: 8000, stock: 5, rating: 4.7 },
  { id: 'laptop-oos', name: 'Unavailable Laptop', brand: 'Astra', category: 'laptop', price: 90000, stock: 0, rating: 5 }
];

const recs = engine.getPersonalizedRecommendations({ catalog, history: ['laptop-1'], limit: 4 });
assert(recs.length > 0, 'history should yield recommendation candidates');
assert(!recs.some((item) => item.id === 'laptop-1'), 'recently viewed items should not be recommended to themselves');
assert(!recs.some((item) => item.stock <= 0), 'unavailable items should be excluded');
assert.strictEqual(JSON.stringify(recs), JSON.stringify(engine.getPersonalizedRecommendations({ catalog, history: ['laptop-1'], limit: 4 })), 'recommendation ranking must be deterministic');
assert.strictEqual(engine.getPersonalizedRecommendations({ catalog, history: [], limit: 2 }).length, 2, 'new visitors should receive a catalog-based fallback');

const coViews = [
  { productId: 'laptop-1', viewedAt: '2026-11-28T10:00:00.000Z' },
  { productId: 'mouse-1', viewedAt: '2026-11-28T10:02:00.000Z' },
  { productId: 'laptop-1', viewedAt: '2026-11-28T10:10:00.000Z' },
  { productId: 'mouse-1', viewedAt: '2026-11-28T10:12:00.000Z' },
  { productId: 'audio-1', viewedAt: '2026-11-28T10:13:00.000Z' }
];
const together = engine.getFrequentlyViewedTogether({ catalog, currentProductId: 'laptop-1', events: coViews, limit: 3 });
assert.strictEqual(together[0].id, 'mouse-1', 'co-view frequency should lead the together ranking');
assert(!together.some((item) => item.id === 'laptop-1'), 'current product must be excluded from paired products');

const requiredFiles = ['recommendations.js', 'index.html', 'product-detail.html', 'product-detail.js'];
requiredFiles.forEach((file) => assert(fs.existsSync(path.join(root, file)), `${file} must exist`));
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const pdp = fs.readFileSync(path.join(root, 'product-detail.html'), 'utf8');
assert(home.includes('id="homeRecommendedShelfRow"'), 'homepage personalized shelf must remain available');
assert(home.includes('recommendations.js'), 'homepage must load the recommendation engine');
assert(pdp.includes('id="frequentlyViewedTogether"'), 'product page must provide a frequently-viewed-together shelf');
assert(pdp.includes('recommendations.js'), 'product page must load the recommendation engine');
const canonicalScripts = ['translations.js', 'products-data.js', 'universal-i18n-bus.js', 'header.js', 'menu-manager.js', 'auth-state.js', 'shared-search.js'];
[home, pdp].forEach((html) => {
  let previous = -1;
  canonicalScripts.forEach((script) => {
    const next = html.lastIndexOf(`<script src="${script}`);
    assert(next > previous, `${script} must follow the canonical shared script sequence`);
    previous = next;
  });
  const scripts = [...html.matchAll(/<script\b(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>|<script\b(?![^>]*application\/ld\+json)[^>]*\/>/gi)];
  const bodyEnd = html.toLowerCase().lastIndexOf('</body>');
  scripts.forEach((match) => assert(match.index < bodyEnd && match.index > html.toLowerCase().indexOf('<body'), 'scripts must be inside body'));
});

const translationsContext = vm.createContext({ window: {}, console, Intl, Date });
vm.runInContext(fs.readFileSync(path.join(root, 'translations.js'), 'utf8'), translationsContext);
const dictionaries = translationsContext.window.EM_TRANSLATIONS;
['recommendation_reason_personalized', 'recommendation_reason_fallback', 'fvt_title', 'fvt_subtitle'].forEach((key) => {
  langs.forEach((lang) => assert(dictionaries[lang] && dictionaries[lang][key], `${key} must be translated for ${lang}`));
});
const visibleBrandPattern = /\b(amazon|amazons|prime|flipkart|walmart)\b|अमेज़न|अमेजन|अमेजॉन/i;
const newCustomerCopy = [
  (home.match(/<p id="homeRecommendationReason"[\s\S]*?<\/p>/i) || [])[0] || '',
  (pdp.match(/<section id="frequentlyViewedTogether"[\s\S]*?<\/section>/i) || [])[0] || ''
].join(' ');
assert(newCustomerCopy, 'Phase 49 customer-facing recommendation copy must be present');
assert(!visibleBrandPattern.test(newCustomerCopy), 'Phase 49 customer-visible copy must use ElectroMart branding only');
langs.forEach((lang) => ['recommendation_reason_personalized', 'recommendation_reason_fallback', 'fvt_title', 'fvt_subtitle'].forEach((key) => {
  assert(!visibleBrandPattern.test(dictionaries[lang][key]), `customer-facing ${key} in ${lang} must be brand-safe`);
}));

console.log('Phase 49 recommendation engine contract test passed.');
