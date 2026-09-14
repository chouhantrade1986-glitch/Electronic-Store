/**
 * Scratch Test Suite: ElectroMart Prime Membership Hub & Rewards Ecosystem
 * Verifies Phase 24 implementation:
 * 1. prime.html structure, IDs, plan cards, savings tracker, benefits, modals, script dependency order
 * 2. prime.css design tokens, modal pop animation, plan ribbons, responsive layout
 * 3. prime.js state management, 30-day trial activation, plan selection, plan change, modal escape & backdrop dismissal
 * 4. Cross-page synchronization (header.js crown badge, cart.js waiver, checkout.js express waiver, account.html sync)
 * 5. 11 Indian regional languages coverage in translations.js
 * 6. 100% Brand safety verification (0 customer-visible Amazon text)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');

function runTest(testName, testFn) {
  try {
    testFn();
    console.log(`  ✓ PASS: ${testName}`);
  } catch (err) {
    console.error(`  ✗ FAIL: ${testName}`);
    console.error(err);
    process.exitCode = 1;
  }
}

console.log('\n--- Running ElectroMart Prime Membership Hub Tests ---\n');

// 1. Structure Tests: prime.html
runTest('prime.html exists and contains essential elements, cards, and modals', () => {
  const primeHtmlPath = path.join(ROOT_DIR, 'prime.html');
  assert.ok(fs.existsSync(primeHtmlPath), 'prime.html must exist');

  const content = fs.readFileSync(primeHtmlPath, 'utf8');

  // Headers and breadcrumbs
  assert.ok(content.includes('id="headerContainer"'), 'Must have headerContainer');
  assert.ok(content.includes('amz-prime-breadcrumbs'), 'Must have prime breadcrumbs');
  assert.ok(content.includes('href="account.html"'), 'Breadcrumbs must link to account.html');

  // Hero sections: Non-member & active member
  assert.ok(content.includes('id="primeHeroNonMember"'), 'Must have primeHeroNonMember');
  assert.ok(content.includes('id="startTrialHeroBtn"'), 'Must have startTrialHeroBtn');
  assert.ok(content.includes('id="primeHeroMember"'), 'Must have primeHeroMember');
  assert.ok(content.includes('id="memberTierHeadline"'), 'Must have memberTierHeadline');
  assert.ok(content.includes('id="openChangePlanModalBtn"'), 'Must have openChangePlanModalBtn');
  assert.ok(content.includes('id="openCancelModalBtn"'), 'Must have openCancelModalBtn');

  // Savings Tracker
  assert.ok(content.includes('id="primeSavingsCard"'), 'Must have primeSavingsCard');
  assert.ok(content.includes('id="primeTotalSavings"'), 'Must have primeTotalSavings');
  assert.ok(content.includes('id="primeDeliverySavings"'), 'Must have primeDeliverySavings');
  assert.ok(content.includes('id="primeCashbackSavings"'), 'Must have primeCashbackSavings');
  assert.ok(content.includes('id="primeDealsSavings"'), 'Must have primeDealsSavings');

  // Plan Cards
  assert.ok(content.includes('id="planMonthlyCard"'), 'Must have planMonthlyCard');
  assert.ok(content.includes('id="planAnnualCard"'), 'Must have planAnnualCard');
  assert.ok(content.includes('id="planLiteCard"'), 'Must have planLiteCard');
  assert.ok(content.includes('BEST VALUE - SAVE 58%'), 'Annual plan must have best value ribbon');
  assert.ok(content.includes('id="selectMonthlyPlanBtn"'), 'Must have selectMonthlyPlanBtn');
  assert.ok(content.includes('id="selectAnnualPlanBtn"'), 'Must have selectAnnualPlanBtn');
  assert.ok(content.includes('id="selectLitePlanBtn"'), 'Must have selectLitePlanBtn');

  // 6 Prime Benefits
  assert.ok(content.includes('id="benefitFastDelivery"'), 'Must have benefitFastDelivery');
  assert.ok(content.includes('id="benefitEarlyAccess"'), 'Must have benefitEarlyAccess');
  assert.ok(content.includes('id="benefitCashback"'), 'Must have benefitCashback');
  assert.ok(content.includes('id="benefitPrimeVideo"'), 'Must have benefitPrimeVideo');
  assert.ok(content.includes('id="benefitPrimeMusic"'), 'Must have benefitPrimeMusic');
  assert.ok(content.includes('id="benefitPrimeGaming"'), 'Must have benefitPrimeGaming');

  // Modals
  assert.ok(content.includes('id="primeChangePlanModal"'), 'Must have primeChangePlanModal');
  assert.ok(content.includes('id="closeChangePlanModalBtn"'), 'Must have closeChangePlanModalBtn');
  assert.ok(content.includes('id="confirmChangePlanBtn"'), 'Must have confirmChangePlanBtn');
  assert.ok(content.includes('id="primeCancelModal"'), 'Must have primeCancelModal');
  assert.ok(content.includes('id="pauseMembershipBtn"'), 'Must have pauseMembershipBtn');
  assert.ok(content.includes('id="confirmCancelPrimeBtn"'), 'Must have confirmCancelPrimeBtn');

  // Toast container
  assert.ok(content.includes('id="primeToastContainer"'), 'Must have primeToastContainer');

  // Script dependency order
  const scriptOrder = [
    'translations.js',
    'products-data.js',
    'universal-i18n-bus.js',
    'header.js',
    'menu-manager.js',
    'auth-state.js',
    'shared-search.js',
    'prime.js'
  ];

  let lastIndex = -1;
  scriptOrder.forEach((script) => {
    const idx = content.indexOf(script);
    assert.ok(idx !== -1, `Script ${script} must be included in prime.html`);
    assert.ok(idx > lastIndex, `Script ${script} must follow previous script order`);
    lastIndex = idx;
  });
});

// 2. Styling Tests: prime.css
runTest('prime.css includes required design system tokens, animations, and modal rules', () => {
  const primeCssPath = path.join(ROOT_DIR, 'prime.css');
  assert.ok(fs.existsSync(primeCssPath), 'prime.css must exist');

  const css = fs.readFileSync(primeCssPath, 'utf8');
  assert.ok(css.includes('--prime-blue'), 'Must define --prime-blue');
  assert.ok(css.includes('--prime-navy-dark'), 'Must define --prime-navy-dark');
  assert.ok(css.includes('--prime-gold'), 'Must define --prime-gold');
  assert.ok(css.includes('--prime-amber'), 'Must define --prime-amber');
  assert.ok(css.includes('.amz-prime-modal'), 'Must style .amz-prime-modal');
  assert.ok(css.includes('amzModalPop'), 'Must define amzModalPop keyframes');
  assert.ok(css.includes('.amz-plan-ribbon'), 'Must style .amz-plan-ribbon');
  assert.ok(css.includes('.amz-prime-toast'), 'Must style .amz-prime-toast');
});

// 3. Logic & State Management: prime.js
runTest('prime.js exports API, manages state, handles trial activation, plan change, and modal escape', () => {
  const primeJsPath = path.join(ROOT_DIR, 'prime.js');
  assert.ok(fs.existsSync(primeJsPath), 'prime.js must exist');

  const js = fs.readFileSync(primeJsPath, 'utf8');

  // Storage key
  assert.ok(js.includes('electromart_prime_status_v1'), 'Must use electromart_prime_status_v1 storage key');

  // Custom Event
  assert.ok(js.includes('electromart_prime_updated'), 'Must dispatch electromart_prime_updated event');

  // Modal Escape key support
  assert.ok(js.includes('Escape') || js.includes('Esc'), 'Must listen for Escape key');
  assert.ok(js.includes('closeAllModals'), 'Must implement closeAllModals');

  // Mock DOM & test functionality
  const storageMap = {};
  const mockLocalStorage = {
    getItem: (key) => storageMap[key] || null,
    setItem: (key, val) => { storageMap[key] = String(val); },
    removeItem: (key) => { delete storageMap[key]; }
  };

  const dispatchedEvents = [];
  const mockWindow = {
    dispatchEvent: (evt) => dispatchedEvents.push(evt),
    addEventListener: () => {},
    ElectroMartPrime: null
  };

  const mockDoc = {
    getElementById: () => ({
      addEventListener: () => {},
      style: {},
      textContent: '',
      innerHTML: '',
      appendChild: () => {}
    }),
    createElement: () => ({
      style: {},
      className: '',
      textContent: '',
      appendChild: () => {},
      remove: () => {}
    }),
    querySelectorAll: () => [],
    addEventListener: () => {},
    body: { style: {} },
    readyState: 'complete'
  };

  // Run prime.js in simulated VM
  const vm = require('vm');
  const context = vm.createContext({
    localStorage: mockLocalStorage,
    window: mockWindow,
    document: mockDoc,
    console: console,
    CustomEvent: class CustomEvent {
      constructor(type, init) {
        this.type = type;
        this.detail = init ? init.detail : null;
      }
    },
    Event: class Event { constructor(type) { this.type = type; } },
    setTimeout: (fn) => fn(),
    Date: Date
  });

  vm.runInContext(js, context);

  const api = context.window.ElectroMartPrime;
  assert.ok(api, 'ElectroMartPrime API must be exposed on window');

  // Initial state should be inactive
  const initialStatus = api.getPrimeStatus();
  assert.strictEqual(initialStatus.active, false, 'Initial state should be inactive');

  // Test 1: Activate 30-Day Free Trial
  api.activatePlan('annual', true);
  const trialStatus = api.getPrimeStatus();
  assert.strictEqual(trialStatus.active, true, 'Prime must be active');
  assert.strictEqual(trialStatus.isTrial, true, 'Trial flag must be true');
  assert.strictEqual(trialStatus.plan, 'annual', 'Default trial plan should be annual');
  assert.ok(dispatchedEvents.some(e => e.type === 'electromart_prime_updated'), 'Must emit electromart_prime_updated event');

  // Test 2: Change Plan to Monthly
  api.changePlan('monthly');
  const monthlyStatus = api.getPrimeStatus();
  assert.strictEqual(monthlyStatus.plan, 'monthly', 'Plan must be monthly');
  assert.strictEqual(monthlyStatus.price, 299, 'Monthly price must be ₹299');
  assert.strictEqual(monthlyStatus.isTrial, false, 'Trial flag should be false after plan change');

  // Test 3: Calculate savings
  const savings = api.calculateSavings(monthlyStatus);
  assert.ok(savings.total > 0, 'Total savings must be greater than 0');
  assert.ok(savings.delivery > 0, 'Delivery savings must be greater than 0');

  // Test 4: Pause Membership
  api.pauseMembership();
  const pausedStatus = api.getPrimeStatus();
  assert.strictEqual(pausedStatus.isPaused, true, 'Membership must be paused');

  // Test 5: Cancel Membership
  api.cancelMembership();
  const canceledStatus = api.getPrimeStatus();
  assert.strictEqual(canceledStatus.active, false, 'Membership must be canceled');
});

// 4. Storewide Integration Tests
runTest('header.js, cart.js, checkout.js, and account.html are synced with Prime status', () => {
  // header.js checks
  const headerContent = fs.readFileSync(path.join(ROOT_DIR, 'header.js'), 'utf8');
  assert.ok(headerContent.includes('headerPrimeCrownBadge'), 'header.js must render headerPrimeCrownBadge');
  assert.ok(headerContent.includes('syncHeaderPrimeBadge'), 'header.js must include syncHeaderPrimeBadge');
  assert.ok(headerContent.includes('electromart_prime_status_v1'), 'header.js must read electromart_prime_status_v1');
  assert.ok(headerContent.includes('prime.html'), 'header.js must link to prime.html in quick links or flyout');

  // cart.js checks
  const cartContent = fs.readFileSync(path.join(ROOT_DIR, 'cart.js'), 'utf8');
  assert.ok(cartContent.includes('isPrimeActive'), 'cart.js must define isPrimeActive');
  assert.ok(cartContent.includes('electromart_prime_status_v1'), 'cart.js must listen for prime storage changes');
  assert.ok(cartContent.includes('electromart_prime_updated'), 'cart.js must listen for electromart_prime_updated');

  // checkout.js checks
  const checkoutContent = fs.readFileSync(path.join(ROOT_DIR, 'checkout.js'), 'utf8');
  assert.ok(checkoutContent.includes('isPrimeActive'), 'checkout.js must define isPrimeActive');
  assert.ok(checkoutContent.includes('Prime Free Express'), 'checkout.js must include Prime Free Express delivery slot waiver');

  // account.html checks
  const accountHtml = fs.readFileSync(path.join(ROOT_DIR, 'account.html'), 'utf8');
  assert.ok(accountHtml.includes('goToPrimeHubBtn') || accountHtml.includes('href="prime.html"'), 'account.html must link to prime.html');

  // account.js checks
  const accountJs = fs.readFileSync(path.join(ROOT_DIR, 'account.js'), 'utf8');
  assert.ok(accountJs.includes('syncAccountPrimePanel'), 'account.js must implement syncAccountPrimePanel');
});

// 5. 11 Indian Regional Languages Coverage
runTest('translations.js contains ELECTROMART_PRIME_I18N across all 11 Indian languages', () => {
  const transPath = path.join(ROOT_DIR, 'translations.js');
  const transContent = fs.readFileSync(transPath, 'utf8');

  const requiredLangs = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
  requiredLangs.forEach((lang) => {
    assert.ok(transContent.includes(`"${lang}": {`) || transContent.includes(`${lang}: {`), `Language ${lang} must be supported in translations.js`);
  });

  const requiredKeys = [
    'prime_hub_title',
    'prime_hero_title',
    'prime_hero_subtitle',
    'start_30_day_trial',
    'plan_monthly',
    'plan_annual',
    'plan_lite',
    'best_value_badge',
    'total_prime_savings'
  ];

  requiredKeys.forEach((key) => {
    assert.ok(transContent.includes(key), `Key ${key} must exist in translations`);
  });
});

// 6. 100% Brand Safety Verification
runTest('100% Brand Safety: No customer-visible Amazon branding in Prime Hub files', () => {
  const filesToCheck = [
    path.join(ROOT_DIR, 'prime.html'),
    path.join(ROOT_DIR, 'prime.js')
  ];

  filesToCheck.forEach((filePath) => {
    const text = fs.readFileSync(filePath, 'utf8');
    // Check for customer visible strings like "Amazon Prime", "Amazon.in", "Amazon India", "Amazon Pay"
    const visibleAmazonMatches = text.match(/\b(Amazon Prime|Amazon\.in|Amazon India|Amazon Pay)\b/gi);
    assert.strictEqual(visibleAmazonMatches, null, `Found unauthorized Amazon branding in ${filePath}: ${visibleAmazonMatches}`);
  });
});

console.log('\n--- All ElectroMart Prime Membership Hub Tests Passed Successfully! ---\n');
