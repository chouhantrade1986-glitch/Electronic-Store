const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectDir = path.join(__dirname, '..');
const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];

console.log('==================================================');
console.log('TEST SUITE: ElectroMart Live Shopping Hub (Phase 35)');
console.log('==================================================');

const requiredFiles = [
  'live-shopping.html',
  'live-shopping.css',
  'live-shopping.js'
];
requiredFiles.forEach((fileName) => {
  assert(fs.existsSync(path.join(projectDir, fileName)), `${fileName} must exist`);
});

const html = fs.readFileSync(path.join(projectDir, 'live-shopping.html'), 'utf8');
const css = fs.readFileSync(path.join(projectDir, 'live-shopping.css'), 'utf8');
const js = fs.readFileSync(path.join(projectDir, 'live-shopping.js'), 'utf8');
const pdpHtml = fs.readFileSync(path.join(projectDir, 'product-detail.html'), 'utf8');
const pdpJs = fs.readFileSync(path.join(projectDir, 'product-detail.js'), 'utf8');
const translationsCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');

[
  'liveShoppingHub',
  'liveStreamPlayer',
  'liveStreamStatus',
  'liveStreamChat',
  'liveChatForm',
  'liveQuestionInput',
  'liveProductShelf',
  'liveFlashDeal',
  'liveCouponCode',
  'liveAddAllBtn'
].forEach((id) => {
  assert(html.includes(`id="${id}"`), `live-shopping.html must contain #${id}`);
});

assert(html.includes('translations.js'), 'live-shopping.html must load translations.js');
assert(html.includes('products-data.js'), 'live-shopping.html must load products-data.js');
assert(html.includes('universal-i18n-bus.js'), 'live-shopping.html must load universal-i18n-bus.js');
assert(html.includes('live-shopping.js'), 'live-shopping.html must load live-shopping.js');
assert(css.includes('live-stream-layout'), 'live-shopping.css must style the live stream layout');
assert(js.includes('electromart_live_chat_v1'), 'live-shopping.js must persist chat state safely');
assert(js.includes('electromart_live_session_v1'), 'live-shopping.js must persist live session state');
assert(js.includes('addProductToCart'), 'live-shopping.js must expose product shelf cart sync');
assert(js.includes('Verified Buyer'), 'live-shopping.js must support Verified Buyer chat badges');
assert(js.includes('Host'), 'live-shopping.js must support Host chat badges');
assert(js.includes('clearInterval'), 'live-shopping.js must clean up countdown timers');

[
  'pdpLiveStreamCallout',
  'pdpLiveStreamStatus',
  'pdpWatchLiveBtn'
].forEach((id) => {
  assert(pdpHtml.includes(`id="${id}"`), `product-detail.html must contain #${id}`);
});
assert(pdpHtml.includes('live-shopping.html'), 'PDP must link to the live shopping hub');
assert(pdpJs.includes('pdpLiveStreamCallout'), 'product-detail.js must control the PDP live stream callout');
assert(pdpJs.includes('live-shopping.html'), 'product-detail.js must build a live shopping deep link');

const sandbox = {
  window: {},
  document: {
    addEventListener: () => {},
    querySelectorAll: () => [],
    getElementById: () => null,
    querySelector: () => null,
    documentElement: { setAttribute: () => {} }
  },
  localStorage: { getItem: () => 'en', setItem: () => {} }
};
vm.createContext(sandbox);
vm.runInContext(translationsCode, sandbox);
const translations = sandbox.window.EM_TRANSLATIONS;
assert(translations, 'EM_TRANSLATIONS must exist on window');

const liveKeys = [
  'live_shopping_title',
  'live_stream_now',
  'live_watch_demo',
  'live_chat_title',
  'live_verified_buyer',
  'live_host_badge',
  'live_question_placeholder',
  'live_send_question',
  'live_flash_deal_title',
  'live_coupon_label',
  'live_product_shelf_title',
  'live_add_to_cart',
  'live_add_all_to_cart',
  'live_no_streams',
  'live_view_hub'
];
languages.forEach((language) => {
  assert(translations[language], `Language ${language} must exist`);
  liveKeys.forEach((key) => {
    assert(translations[language][key], `Key ${key} must exist in ${language}`);
  });
});

const pdpLiveSection = pdpHtml.match(/<section id="pdpLiveStreamCallout"[\s\S]*?<\/section>/i)?.[0] || "";
const customerFacingSources = [html, css, js, pdpLiveSection];
customerFacingSources.forEach((source, index) => {
  const visibleSource = source
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\b(?:src|href|class|id)=(["'])[^"']*\1/gi, "")
    .replace(/<[^>]+>/g, " ");
  assert(!/Amazon|अमेज़न/i.test(visibleSource), `Customer-facing source ${index + 1} must remain brand-safe`);
});

console.log('PASS: Phase 35 live shopping contract verified.');
