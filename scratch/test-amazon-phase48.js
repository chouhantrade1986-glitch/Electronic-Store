const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectDir = path.resolve(__dirname, '..');
const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const requiredFiles = ['buy-again.html', 'buy-again.js', 'buy-again.css'];

console.log('Starting Phase 48 Buy Again hub contract test...');

requiredFiles.forEach((name) => {
  assert(fs.existsSync(path.join(projectDir, name)), `${name} must exist`);
});

const html = fs.readFileSync(path.join(projectDir, 'buy-again.html'), 'utf8');
const forbiddenBrand = /\b(amazon|amazons|flipkart|walmart)\b|अमेज़न|अमेजन|अमेजॉन/i;
const visibleHtml = html
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '');
(visibleHtml.match(/>([^<]+)</g) || []).forEach((match) => {
  assert(!forbiddenBrand.test(match.slice(1, -1).trim()), 'customer-visible page text must use ElectroMart branding only');
});
const attributePattern = /(?:alt|title|placeholder|aria-label)=['"]([^'"]+)['"]/gi;
let visibleAttribute;
while ((visibleAttribute = attributePattern.exec(visibleHtml)) !== null) {
  assert(!forbiddenBrand.test(visibleAttribute[1]), 'customer-facing page attributes must use ElectroMart branding only');
}
const expectedScripts = [
  'translations.js',
  'products-data.js',
  'universal-i18n-bus.js',
  'header.js',
  'menu-manager.js',
  'auth-state.js',
  'shared-search.js',
  'buy-again.js'
];
let lastScriptIndex = -1;
expectedScripts.forEach((name) => {
  const index = html.indexOf(`src="${name}`);
  assert(index > lastScriptIndex, `${name} must follow the canonical script order`);
  lastScriptIndex = index;
});
assert(html.includes('class="buy-again-shell"'), 'page must use the dedicated content wrapper');
[
  'buyAgainGrid', 'buyAgainSearch', 'buyAgainMeta', 'buyAgainEmptyState',
  'buyAgainTimeFilters', 'buyAgainCategoryFilters', 'buyAgainGuestNotice'
].forEach((id) => assert(html.includes(`id="${id}"`), `page must include #${id}`));
assert(html.includes('buy-again.css'), 'page must load buy-again.css');
assert(html.includes('buy-again.js'), 'page must load buy-again.js after shared scripts');

const jsCode = fs.readFileSync(path.join(projectDir, 'buy-again.js'), 'utf8');
assert(jsCode.includes('window.__ELECTROMART_CONFIG__'), 'page must use injected API configuration');
assert(jsCode.includes('/orders/my'), 'page must request the authenticated order history route');
assert(jsCode.includes('Authorization'), 'order request must send the signed-in session token');
assert(jsCode.includes('aggregatePurchaseHistory'), 'page must aggregate repeated purchases by product');
assert(jsCode.includes('addPurchaseToCart'), 'page must expose one-click cart support');
assert(jsCode.includes('checkout.html'), 'Buy It Now must continue directly to checkout');

const mockWindow = {
  EM_CATALOG: [
    { id: 101, name: 'ElectroMart Demo Laptop', price: 1200, image: 'demo.jpg', category: 'laptop' },
    { id: 102, name: 'ElectroMart Demo Speaker', price: 600, image: 'speaker.jpg', category: 'audio' }
  ],
  EM_CATALOG_MAP: {
    101: { id: 101, name: 'ElectroMart Demo Laptop', price: 1200, image: 'demo.jpg', category: 'laptop' },
    102: { id: 102, name: 'ElectroMart Demo Speaker', price: 600, image: 'speaker.jpg', category: 'audio' }
  },
  location: { search: '' },
  setTimeout,
  clearTimeout,
  addEventListener: () => {}
};
mockWindow.window = mockWindow;
const mockDocument = { readyState: 'loading', addEventListener: () => {}, getElementById: () => null };
const context = vm.createContext({ window: mockWindow, document: mockDocument, console, Intl, Date, URLSearchParams, setTimeout, clearTimeout });
vm.runInContext(jsCode, context);

const api = mockWindow.ElectroMartBuyAgain;
assert(api, 'buy-again.js must export its testable feature API');
const purchases = api.aggregatePurchaseHistory([
  {
    id: 'order-old', createdAt: '2026-01-10T00:00:00.000Z', status: 'delivered',
    paymentStatus: 'paid', items: [{ productId: '101', title: 'Old Laptop', price: 1500, quantity: 2 }]
  },
  {
    id: 'order-new', createdAt: '2026-05-12T00:00:00.000Z', status: 'delivered',
    paymentStatus: 'paid', items: [{ productId: '101', title: 'Old Laptop', price: 1400, qty: 1 }]
  },
  {
    id: 'order-cancelled', createdAt: '2026-06-01T00:00:00.000Z', status: 'cancelled',
    paymentStatus: 'paid', items: [{ productId: '102', title: 'Speaker', price: 700, qty: 1 }]
  }
], mockWindow.EM_CATALOG_MAP);
assert.strictEqual(purchases.length, 1, 'cancelled orders must not count as purchases');
assert.strictEqual(purchases[0].purchaseCount, 3, 'purchase frequency counts purchased units');
assert.strictEqual(purchases[0].orderCount, 2, 'order frequency counts distinct orders');
assert.strictEqual(purchases[0].lastPurchasePrice, 1400, 'latest purchase price must be retained');
assert.strictEqual(purchases[0].priceDropped, true, 'current catalog price must be compared with last purchase price');
assert.strictEqual(api.filterPurchases(purchases, { category: 'laptop', query: 'laptop', time: 'all', now: new Date('2026-07-01T00:00:00.000Z') }).length, 1);
assert.strictEqual(api.filterPurchases(purchases, { category: 'audio', query: '', time: 'all', now: new Date('2026-07-01T00:00:00.000Z') }).length, 0);

const storage = { value: '{}', getItem() { return this.value; }, setItem(_key, value) { this.value = value; } };
assert.strictEqual(api.addPurchaseToCart(storage, '101', 3), true);
assert.strictEqual(JSON.parse(storage.value)['101'], 3, 'quantity selector value must be added to the cart map');
assert.strictEqual(api.addPurchaseToCart(storage, 'unknown', 1), false, 'unknown products must not enter the cart');

const translationsSource = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
assert(translationsSource.includes('ELECTROMART_BUY_AGAIN_I18N'), 'translations.js must define the Phase 48 dictionary');
const translationsContext = vm.createContext({ window: {}, console, Intl, Date });
vm.runInContext(translationsSource, translationsContext);
const dictionaries = translationsContext.window.EM_TRANSLATIONS;
const requiredKeys = [
  'buy_again_hero_title', 'buy_again_hero_subtitle', 'buy_again_search_placeholder',
  'buy_again_time_30_days', 'buy_again_time_3_months', 'buy_again_time_2026',
  'buy_again_category_all', 'buy_again_purchased_times', 'buy_again_last_ordered',
  'buy_again_price_dropped', 'buy_again_add_to_cart', 'buy_again_buy_now',
  'buy_again_guest_notice', 'buy_again_history_fallback', 'buy_again_empty'
];
languages.forEach((lang) => {
  assert(dictionaries[lang], `translation dictionary for ${lang} must exist`);
  requiredKeys.forEach((key) => assert(dictionaries[lang][key], `${key} must be translated for ${lang}`));
  Object.entries(dictionaries[lang]).filter(([key]) => key.startsWith('buy_again_')).forEach(([, value]) => {
    assert(!forbiddenBrand.test(String(value)), `Buy Again translation in ${lang} must use ElectroMart branding only`);
  });
});

const runner = fs.readFileSync(path.join(projectDir, 'scratch/run_all_tests.js'), 'utf8');
assert(runner.includes("f.startsWith('test-')"), 'run_all_tests.js must auto-register the Phase 48 test by filename');
assert(fs.readFileSync(path.join(projectDir, 'header.html'), 'utf8').includes('href="buy-again.html"'), 'header.html must link to the Buy Again hub');
assert(fs.readFileSync(path.join(projectDir, 'header.js'), 'utf8').includes('href="buy-again.html"'), 'header.js must link to the Buy Again hub');
assert(fs.readFileSync(path.join(projectDir, 'orders.html'), 'utf8').includes('href="buy-again.html"'), 'orders.html must link to the dedicated hub');
assert(fs.readFileSync(path.join(projectDir, 'sitemap.xml'), 'utf8').includes('buy-again.html'), 'sitemap.xml must list the Buy Again hub');

console.log('Phase 48 Buy Again hub contract test passed.');
