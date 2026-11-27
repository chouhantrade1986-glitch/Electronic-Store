const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const theme = read('amazon-theme.css');
for (const token of [
  '--em-market-font', '--em-market-shadow-card', '--em-market-cta-primary: #ffd814',
  '--em-market-cta-secondary: #ffa41c'
]) assert.ok(theme.includes(token), `shared design token missing: ${token}`);

for (const file of ['coupons.css', 'buy-again.css', 'gift-cards.css', 'corporate-gifting.css']) {
  const css = read(file);
  assert.ok(css.includes('var(--em-market-font)'), `${file} must use the shared storefront font`);
  assert.ok(css.includes('var(--em-market-cta-primary)'), `${file} must use the shared primary CTA token`);
  assert.ok(css.includes('var(--em-market-shadow-card)'), `${file} must use the shared card shadow`);
  assert.ok(!/font-family:\s*["'](?:Segoe UI|Inter|Chivo)/i.test(css), `${file} retains a separate page font stack`);
}

const productsHtml = read('products.html');
assert.match(productsHtml, /shared-search\.css/);
const productScripts = [...productsHtml.matchAll(/<script\s+src="([^"]+)"/g)].map((match) => match[1].split('?')[0]);
assert.deepEqual(productScripts.slice(0, 7), [
  'translations.js', 'products-data.js', 'universal-i18n-bus.js', 'header.js',
  'menu-manager.js', 'auth-state.js', 'shared-search.js'
]);
assert.ok(productScripts.indexOf('shared-search.js') < productScripts.indexOf('products.js'));

const pdpHtml = read('product-detail.html');
assert.ok(pdpHtml.indexOf('reviews.css') < pdpHtml.indexOf('</head>'), 'reviews.css must load from the document head');
assert.ok(pdpHtml.indexOf('reviews.css') > pdpHtml.indexOf('<head>'));

const homepageHtml = read('index.html');
assert.doesNotMatch(homepageHtml, /<style\b|\sstyle\s*=/i, 'homepage layout styles must be external');
assert.match(homepageHtml, /href="index-inline\.css\?/);
const homepageCss = read('index-inline.css');
assert.match(homepageCss, /\.hero-carousel/);
assert.match(homepageCss, /\.index-inline-style-001/);
assert.match(homepageCss, /index-inline-background-white/);

const smoke = read('qa-ui-smoke.js');
for (const visualCase of [
  'pdp-reviews', 'coupons', 'buy-again', 'coupons-hi-desktop',
  'buy-again-hi-mobile', 'buy-again-ur-desktop', 'coupons-ur-mobile'
]) assert.ok(smoke.includes(`name: "${visualCase}"`), `visual baseline case missing: ${visualCase}`);
assert.match(smoke, /--visual-only/);
assert.match(smoke, /message\.text\(\)/);
assert.match(smoke, /document\.documentElement\.scrollWidth/);
assert.match(smoke, /window\._emPdpTimerInterval[\s\S]*?5h 59m 59s/, 'PDP visual capture must freeze the live deal countdown for deterministic screenshots');
assert.doesNotMatch(smoke, /const existingBaselines =/, 'Phase 52 visual refresh must preserve the six legacy smoke captures');
const smokeWorkflow = read('.github/workflows/smoke-suite.yml');
const smokeRunPosition = smokeWorkflow.indexOf('- name: Run smoke suite');
const phase52CapturePosition = smokeWorkflow.indexOf('- name: Capture Phase 52 visual baselines');
const verifyBaselinePosition = smokeWorkflow.indexOf('- name: Verify visual baseline');
assert.ok(smokeRunPosition >= 0 && phase52CapturePosition > smokeRunPosition && verifyBaselinePosition > phase52CapturePosition,
  'CI must generate Phase 52 captures after smoke screenshots and before baseline verification');
assert.match(smokeWorkflow.slice(phase52CapturePosition, verifyBaselinePosition), /npm run smoke:ui:visual/);
assert.match(read('coupons.css'), /\.coupon-modal-backdrop\[hidden\]\s*\{\s*display:\s*none\s*!important/s);

const lockScript = read('lock-visual-baseline.ps1');
for (const file of ['pdp-reviews', 'coupons-hi-desktop', 'buy-again-hi-mobile', 'buy-again-ur-desktop', 'coupons-ur-mobile']) {
  assert.ok(lockScript.includes(`qa-phase52-${file}.png`), `visual baseline lock list missing ${file}`);
}

const manifestPath = path.join(root, 'qa-baselines', 'ui', 'baseline-manifest.json');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8').replace(/^\uFEFF/, ''));
  const names = new Set((manifest.files || []).map((entry) => entry.name));
  for (const file of ['qa-phase52-pdp-reviews.png', 'qa-phase52-coupons.png', 'qa-phase52-buy-again.png', 'qa-phase52-coupons-hi-desktop.png', 'qa-phase52-buy-again-hi-mobile.png', 'qa-phase52-buy-again-ur-desktop.png', 'qa-phase52-coupons-ur-mobile.png']) {
    assert.ok(names.has(file), `baseline manifest missing ${file}`);
  }
}

console.log('Phase 52 storefront tokens, page wiring, extracted homepage CSS, and visual baseline contracts passed.');
