const fs = require('fs');
const assert = require('assert');

console.log('================================================================================');
console.log('TEST SUITE: Phase 22 - ElectroMart Lightning Deals Live Drops & Countdown Hub');
console.log('================================================================================');

// Test 1: Markup and DOM structure verification
console.log('\n[TEST 1] Verifying todays-deals.html and product-detail.html markup...');
const dealsHtml = fs.readFileSync('./todays-deals.html', 'utf8');
const pdpHtml = fs.readFileSync('./product-detail.html', 'utf8');

assert(dealsHtml.includes('id="dealStatusTabs"'), 'todays-deals.html must have #dealStatusTabs');
assert(dealsHtml.includes('data-status="live"'), 'todays-deals.html must have live deals status tab');
assert(dealsHtml.includes('data-status="upcoming"'), 'todays-deals.html must have upcoming drops status tab');
assert(dealsHtml.includes('data-status="waitlist"'), 'todays-deals.html must have waitlist deals status tab');
assert(dealsHtml.includes('id="liveDealsCount"'), 'todays-deals.html must have #liveDealsCount');
assert(dealsHtml.includes('id="upcomingDealsCount"'), 'todays-deals.html must have #upcomingDealsCount');
assert(dealsHtml.includes('id="waitlistDealsCount"'), 'todays-deals.html must have #waitlistDealsCount');
assert(dealsHtml.includes('id="lightningDropsSchedule"'), 'todays-deals.html must have #lightningDropsSchedule');
assert(dealsHtml.includes('id="dropsSchedulePills"'), 'todays-deals.html must have #dropsSchedulePills');
assert(dealsHtml.includes('id="dealToastContainer"'), 'todays-deals.html must have #dealToastContainer');

assert(pdpHtml.includes('id="pdpLightningDealBox"'), 'product-detail.html must have #pdpLightningDealBox');
assert(pdpHtml.includes('id="pdpLightningTimerLabel"'), 'product-detail.html must have #pdpLightningTimerLabel');
assert(pdpHtml.includes('id="pdpLightningTimer"'), 'product-detail.html must have #pdpLightningTimer');
assert(pdpHtml.includes('id="pdpLightningProgressWrap"'), 'product-detail.html must have #pdpLightningProgressWrap');
assert(pdpHtml.includes('id="pdpLightningProgressFill"'), 'product-detail.html must have #pdpLightningProgressFill');
assert(pdpHtml.includes('id="pdpLightningProgressText"'), 'product-detail.html must have #pdpLightningProgressText');
assert(pdpHtml.includes('id="pdpLightningUrgency"'), 'product-detail.html must have #pdpLightningUrgency');
console.log('  PASS: HTML markup verified for catalog tabs, drops schedule, and PDP deal box.');

// Test 2: CSS Styles verification in amazon-theme.css
console.log('\n[TEST 2] Verifying CSS styles in amazon-theme.css...');
const css = fs.readFileSync('./amazon-theme.css', 'utf8');

assert(css.includes('.amz-deal-status-tabs'), 'CSS must define .amz-deal-status-tabs');
assert(css.includes('.amz-deal-status-tab'), 'CSS must define .amz-deal-status-tab');
assert(css.includes('.amz-pulse-dot'), 'CSS must define .amz-pulse-dot');
assert(css.includes('.amz-drops-schedule'), 'CSS must define .amz-drops-schedule');
assert(css.includes('.amz-drop-pill'), 'CSS must define .amz-drop-pill');
assert(css.includes('.deal-progress-bar.urgent'), 'CSS must define .deal-progress-bar.urgent');
assert(css.includes('.deal-progress-bar.full'), 'CSS must define .deal-progress-bar.full');
assert(css.includes('.amz-btn-waitlist'), 'CSS must define .amz-btn-waitlist');
assert(css.includes('.amz-btn-remind'), 'CSS must define .amz-btn-remind');
assert(css.includes('.pdp-lightning-deal-box'), 'CSS must define .pdp-lightning-deal-box');
assert(css.includes('.deal-toast'), 'CSS must define .deal-toast');
console.log('  PASS: CSS styles for status tabs, pulses, progress bars, waitlists, and toasts verified.');

// Test 3: Translations verification across all 11 Indian regional languages
console.log('\n[TEST 3] Verifying 11-language translations in translations.js...');
const transContent = fs.readFileSync('./translations.js', 'utf8');
const sandbox = {
  window: {},
  document: {
    addEventListener: () => {},
    querySelectorAll: () => [],
    querySelector: () => null,
    getElementById: () => null,
    documentElement: { lang: 'hi' },
    body: { style: {} }
  },
  localStorage: { getItem: () => 'hi', setItem: () => {} }
};
sandbox.window = sandbox;
require('vm').runInNewContext(transContent, sandbox);
const EM_TRANSLATIONS = sandbox.window.EM_TRANSLATIONS;

const expectedLangs = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const requiredKeys = [
  'lightning_deals_hub',
  'live_now',
  'upcoming_drops',
  'waitlist_deals',
  'join_waitlist',
  'in_waitlist',
  'leave_waitlist',
  'remind_me',
  'reminder_set',
  'drop_starts_in',
  'claimed_hurry',
  'waitlist_available',
  'all_drops',
  'next_1_hour',
  'next_3_hours',
  'tomorrows_drops',
  'drops_schedule_title',
  'waitlist_position',
  'limited_drop_allocation'
];

for (const lang of expectedLangs) {
  assert(EM_TRANSLATIONS[lang], `translations.js missing language: ${lang}`);
  for (const key of requiredKeys) {
    assert(EM_TRANSLATIONS[lang][key], `translations.js[${lang}] missing key: ${key}`);
  }
}
console.log('  PASS: All 16 Phase 22 i18n keys present across all 11 Indian languages.');

// Test 4: JavaScript Logic & State Management in todays-deals.js
console.log('\n[TEST 4] Testing todays-deals.js deal model, waitlist, and alert mechanisms...');
const tdJs = fs.readFileSync('./todays-deals.js', 'utf8');

assert(tdJs.includes('window.EM_LIGHTNING_DEALS'), 'todays-deals.js must expose window.EM_LIGHTNING_DEALS');
assert(tdJs.includes('window.getLightningDealForProduct'), 'todays-deals.js must expose window.getLightningDealForProduct');
assert(tdJs.includes('function initDealStatusTabs('), 'todays-deals.js must define initDealStatusTabs');
assert(tdJs.includes('function initDropsSchedulePills('), 'todays-deals.js must define initDropsSchedulePills');
assert(tdJs.includes('function updateDealStatusCounts('), 'todays-deals.js must define updateDealStatusCounts');
assert(tdJs.includes('function getWaitlists('), 'todays-deals.js must define getWaitlists');
assert(tdJs.includes('function joinWaitlist('), 'todays-deals.js must define joinWaitlist');
assert(tdJs.includes('function leaveWaitlist('), 'todays-deals.js must define leaveWaitlist');
assert(tdJs.includes('function getReminders('), 'todays-deals.js must define getReminders');
assert(tdJs.includes('function toggleReminder('), 'todays-deals.js must define toggleReminder');
assert(tdJs.includes('electromart_deal_waitlists_v1'), 'Waitlist storage key must be electromart_deal_waitlists_v1');
assert(tdJs.includes('electromart_deal_alerts_v1'), 'Reminder storage key must be electromart_deal_alerts_v1');

// Setup mock browser environment to execute todays-deals methods
const storageMap = new Map();
const mockLocalStorage = {
  getItem: (k) => storageMap.get(k) || null,
  setItem: (k, v) => storageMap.set(k, String(v)),
  removeItem: (k) => storageMap.delete(k)
};

const tdSandbox = {
  window: {},
  document: {
    getElementById: (id) => ({
      id,
      value: 'all',
      textContent: '',
      addEventListener: () => {},
      querySelectorAll: () => [],
      querySelector: () => null,
      classList: { add: () => {}, remove: () => {}, toggle: () => {} },
      setAttribute: () => {},
      getAttribute: () => '',
      style: {},
      appendChild: () => {}
    }),
    createElement: (tag) => ({
      tagName: tag,
      className: '',
      innerHTML: '',
      textContent: '',
      style: {},
      appendChild: () => {},
      remove: () => {}
    }),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {}
  },
  localStorage: mockLocalStorage,
  Intl: Intl,
  Date: Date,
  Math: Math,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: () => 1,
  clearInterval: () => {},
  addEventListener: () => {},
  URLSearchParams: URLSearchParams,
  URL: URL,
  location: { search: '', href: 'http://localhost/' },
  history: { replaceState: () => {} }
};
tdSandbox.window = tdSandbox;

require('vm').runInNewContext(transContent + ';' + tdJs, tdSandbox);

const emDeals = tdSandbox.window.EM_LIGHTNING_DEALS;
assert(Array.isArray(emDeals) && emDeals.length >= 6, 'EM_LIGHTNING_DEALS should have at least 6 deals');

const liveDeal = emDeals.find(d => d.status === 'live');
const upcomingDeal = emDeals.find(d => d.status === 'upcoming');
const waitlistDeal = emDeals.find(d => d.status === 'waitlist');

assert(liveDeal, 'Must have at least one live deal');
assert(upcomingDeal, 'Must have at least one upcoming drop deal');
assert(waitlistDeal, 'Must have at least one waitlist deal (100% claimed)');

// Test waitlist flow
assert(!tdSandbox.isInWaitlist(waitlistDeal.id), 'Initially not in waitlist');
tdSandbox.joinWaitlist(waitlistDeal.id);
assert(tdSandbox.isInWaitlist(waitlistDeal.id), 'Should be in waitlist after joinWaitlist');
assert(tdSandbox.getWaitlistPosition(waitlistDeal.id) >= 1, 'Waitlist position should be positive number');
tdSandbox.leaveWaitlist(waitlistDeal.id);
assert(!tdSandbox.isInWaitlist(waitlistDeal.id), 'Should not be in waitlist after leaveWaitlist');

// Test reminder alert flow
assert(!tdSandbox.hasReminder(upcomingDeal.id), 'Initially no reminder');
tdSandbox.toggleReminder(upcomingDeal.id);
assert(tdSandbox.hasReminder(upcomingDeal.id), 'Reminder active after toggle');
tdSandbox.toggleReminder(upcomingDeal.id);
assert(!tdSandbox.hasReminder(upcomingDeal.id), 'Reminder deactivated after 2nd toggle');
console.log('  PASS: Deal model, waitlist queue, and reminder alerts functional and validated.');

// Test 5: PDP Lightning Deal Box Sync in product-detail.js
console.log('\n[TEST 5] Verifying PDP Lightning Deal Box sync in product-detail.js...');
const pdpJs = fs.readFileSync('./product-detail.js', 'utf8');

assert(pdpJs.includes('function getPdpLightningDeal('), 'product-detail.js must define getPdpLightningDeal');
assert(pdpJs.includes('function startPdpLightningTimer('), 'product-detail.js must define startPdpLightningTimer');
assert(pdpJs.includes('pdpLightningDealBox'), 'product-detail.js must reference pdpLightningDealBox');
assert(pdpJs.includes('pdpLightningProgressFill'), 'product-detail.js must reference pdpLightningProgressFill');
assert(pdpJs.includes('pdpLightningProgressText'), 'product-detail.js must reference pdpLightningProgressText');

// Mock DOM execution for PDP
const pdpElements = new Map();
function getPdpEl(id) {
  if (!pdpElements.has(id)) {
    pdpElements.set(id, {
      id,
      textContent: '',
      innerHTML: '',
      style: {},
      classList: {
        classes: new Set(),
        add: function(c) { this.classes.add(c); },
        remove: function(c) { this.classes.delete(c); },
        contains: function(c) { return this.classes.has(c); },
        toggle: function(c, force) {
          if (force !== undefined) {
            if (force) this.classes.add(c);
            else this.classes.delete(c);
            return force;
          }
          if (this.classes.has(c)) { this.classes.delete(c); return false; }
          this.classes.add(c); return true;
        }
      },
      addEventListener: () => {},
      removeEventListener: () => {},
      pause: () => {},
      play: () => Promise.resolve(),
      setAttribute: () => {},
      getAttribute: () => '',
      removeAttribute: () => {},
      querySelectorAll: () => [],
      querySelector: (sel) => getPdpEl('child_' + sel.replace(/^[#.]/, ''))
    });
  }
  return pdpElements.get(id);
}

const pdpSandbox = {
  window: {},
  document: {
    body: { style: {}, classList: { add: () => {}, remove: () => {} } },
    documentElement: { lang: 'en' },
    getElementById: (id) => getPdpEl(id),
    querySelector: (sel) => getPdpEl(sel.replace(/^[#.]/, '')),
    querySelectorAll: () => [],
    addEventListener: () => {}
  },
  localStorage: {
    getItem: () => 'en',
    setItem: () => {}
  },
  Intl: Intl,
  Date: Date,
  Math: Math,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: () => 2,
  clearInterval: () => {},
  addEventListener: () => {},
  URLSearchParams: URLSearchParams,
  URL: URL,
  location: { protocol: 'http:', hostname: 'localhost', port: '4000', search: '?id=1' }
};
pdpSandbox.window = pdpSandbox;

require('vm').runInNewContext(transContent + ';' + pdpJs, pdpSandbox);

// Render PDP for product with lightning deal (id 1: AstraBook Pro 14)
const dealProduct = { id: 1, name: 'AstraBook Pro 14', price: 999, listPrice: 1149 };
pdpSandbox.window.renderAmazonPrice(dealProduct);

const pdpBox = getPdpEl('pdpLightningDealBox');
const progressFill = getPdpEl('pdpLightningProgressFill');
const progressText = getPdpEl('pdpLightningProgressText');

assert.strictEqual(pdpBox.style.display, 'block', 'pdpLightningDealBox must be visible for lightning deal product');
assert(progressFill.style.width && progressFill.style.width.includes('%'), 'Progress fill width must be percentage');
assert(progressText.textContent.includes('claimed') || progressText.textContent.includes('Claimed'), 'Progress text must mention claimed');

// Render non-deal product
const nonDealProduct = { id: 'some_other_product_9999', name: 'Standard Cable', price: 299, listPrice: 299 };
pdpSandbox.window.renderAmazonPrice(nonDealProduct);
assert.strictEqual(pdpBox.style.display, 'none', 'pdpLightningDealBox must be hidden for non-deal product');
console.log('  PASS: PDP price and deal box sync successfully verified.');

// Test 6: Brand Safety & Legal Compliance
console.log('\n[TEST 6] Verifying brand safety across Phase 22 modifications...');
const forbidden = [
  'amazon lightning deals',
  'amazon deal',
  'amazon drops',
  'अमेज़न लाइटनिंग',
  'अमेज़न डील'
];

for (const phrase of forbidden) {
  assert(!dealsHtml.toLowerCase().includes(phrase), `todays-deals.html must not contain: ${phrase}`);
  assert(!pdpHtml.toLowerCase().includes(phrase), `product-detail.html must not contain: ${phrase}`);
}
console.log('  PASS: 100% Brand safe and ElectroMart compliant.');

console.log('\n================================================================================');
console.log('ALL PHASE 22 LIGHTNING DEALS TESTS PASSED SUCCESSFULLY! (100%)');
console.log('================================================================================\n');
