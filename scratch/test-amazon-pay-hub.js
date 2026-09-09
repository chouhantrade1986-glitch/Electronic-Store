const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.resolve(__dirname, '..');

console.log("===============================================================");
console.log("TEST SUITE: ElectroMart Pay & UPI Hub (Phase 21 Comprehensive)");
console.log("===============================================================");

// -------------------------------------------------------------
// Layer 1: electromart-pay.html Structure & Semantic Tags
// -------------------------------------------------------------
console.log("-> Layer 1: Checking electromart-pay.html structure & markup...");
const payHtmlPath = path.join(projectDir, 'electromart-pay.html');
assert(fs.existsSync(payHtmlPath), "electromart-pay.html must exist");
const payHtml = fs.readFileSync(payHtmlPath, 'utf8');

assert(payHtml.startsWith('<!DOCTYPE html>'), "Must begin with <!DOCTYPE html>");
const doctypeMatches = payHtml.match(/<!DOCTYPE html>/gi) || [];
assert.strictEqual(doctypeMatches.length, 1, "Only one <!DOCTYPE html> allowed");

// Stylesheets & Scripts
assert(payHtml.includes('styles.css'), "Includes styles.css");
assert(payHtml.includes('shared-search.css'), "Includes shared-search.css");
assert(payHtml.includes('amazon-theme.css'), "Includes amazon-theme.css");
assert(payHtml.includes('electromart-pay.css'), "Includes electromart-pay.css");

// Header and Breadcrumb
assert(payHtml.includes('id="headerContainer"'), "Has headerContainer");
assert(payHtml.includes('id="payBreadcrumb"'), "Has payBreadcrumb navigation");
assert(payHtml.includes('id="payPageWrapper"'), "Has payPageWrapper");

// Hero Balance Card & Auto-Reload
assert(payHtml.includes('id="payBalanceCard"'), "Has payBalanceCard");
assert(payHtml.includes('id="heroBalanceAmount"'), "Has heroBalanceAmount");
assert(payHtml.includes('id="autoReloadToggle"'), "Has autoReloadToggle");
assert(payHtml.includes('id="autoReloadStatus"'), "Has autoReloadStatus");

// Quick Add Money
assert(payHtml.includes('id="addMoneySection"'), "Has addMoneySection");
assert(payHtml.includes('data-preset="500"'), "Has +500 preset");
assert(payHtml.includes('data-preset="1000"'), "Has +1000 preset");
assert(payHtml.includes('data-preset="2000"'), "Has +2000 preset");
assert(payHtml.includes('data-preset="5000"'), "Has +5000 preset");
assert(payHtml.includes('id="customAmountInput"'), "Has customAmountInput");
assert(payHtml.includes('id="addMoneySubmitBtn"'), "Has addMoneySubmitBtn");

// Virtual UPI & QR Scanner Modal
assert(payHtml.includes('id="upiHubSection"'), "Has upiHubSection");
assert(payHtml.includes('id="virtualVpaDisplay"'), "Has virtualVpaDisplay");
assert(payHtml.includes('id="copyVpaBtn"'), "Has copyVpaBtn");
assert(payHtml.includes('id="openQrScannerBtn"'), "Has openQrScannerBtn");
assert(payHtml.includes('id="pendingCollectList"'), "Has pendingCollectList");
assert(payHtml.includes('id="pendingRequestsCount"'), "Has pendingRequestsCount");

// Cashback Rewards & Scratch Card
assert(payHtml.includes('id="cashbackRewardsSection"'), "Has cashbackRewardsSection");
assert(payHtml.includes('id="scratchCardWidget"'), "Has scratchCardWidget");
assert(payHtml.includes('id="scratchCover"'), "Has scratchCover");
assert(payHtml.includes('id="revealScratchCardBtn"'), "Has revealScratchCardBtn");
assert(payHtml.includes('id="scratchRewardResult"'), "Has scratchRewardResult");

// Passbook & Statement
assert(payHtml.includes('id="payStatementSection"'), "Has payStatementSection");
assert(payHtml.includes('id="statementFilterTabs"'), "Has statementFilterTabs");
assert(payHtml.includes('id="statementSearchInput"'), "Has statementSearchInput");
assert(payHtml.includes('id="downloadStatementBtn"'), "Has downloadStatementBtn");
assert(payHtml.includes('id="statementList"'), "Has statementList");

// Modal & Backdrop
assert(payHtml.includes('id="qrScannerModal"'), "Has qrScannerModal");
assert(payHtml.includes('id="qrScannerModalBackdrop"'), "Has qrScannerModalBackdrop");
assert(payHtml.includes('id="closeQrModalBtn"'), "Has closeQrModalBtn");
assert(payHtml.includes('class="qr-laser-beam"'), "Has animated laser beam in QR scanner");
assert(payHtml.includes('class="qr-scan-preset-btn"'), "Has preset QR scan simulation buttons");

// Script order per guidelines
const scriptOrder = [
  'translations.js',
  'products-data.js',
  'universal-i18n-bus.js',
  'header.js',
  'menu-manager.js',
  'auth-state.js',
  'shared-search.js',
  'electromart-pay.js'
];

let lastIdx = -1;
scriptOrder.forEach((src) => {
  const scriptTag = `<script src="${src}`;
  const currentIdx = payHtml.indexOf(scriptTag);
  assert(currentIdx > -1, `electromart-pay.html must include script: ${src}`);
  assert(currentIdx > lastIdx, `Script ${src} is in correct chronological position`);
  lastIdx = currentIdx;
});
console.log("✓ Layer 1 Passed: Markup & script sequence verified!");

// -------------------------------------------------------------
// Layer 2: Checkout Integration & Real-time State Sync
// -------------------------------------------------------------
console.log("-> Layer 2: Checking checkout.html and checkout.js integration...");
const checkoutHtml = fs.readFileSync(path.join(projectDir, 'checkout.html'), 'utf8');
const checkoutJs = fs.readFileSync(path.join(projectDir, 'checkout.js'), 'utf8');

// Wallet option in checkout.html
assert(checkoutHtml.includes('id="payWalletOption"'), "checkout.html has payWalletOption");
assert(checkoutHtml.includes('value="wallet"'), "checkout.html has value='wallet'");
assert(checkoutHtml.includes('id="checkoutWalletBalanceBadge"'), "checkout.html has checkoutWalletBalanceBadge");
assert(checkoutHtml.includes('id="payInsufficientWarning"'), "checkout.html has payInsufficientWarning");
assert(checkoutHtml.includes('id="payInsufficientMsg"'), "checkout.html has payInsufficientMsg");
assert(checkoutHtml.includes('id="walletDetails"'), "checkout.html has walletDetails container");

// Preserves all existing payment options required by test-amazon-checkout.js
assert(checkoutHtml.includes('value="upi"'), "checkout.html preserves upi");
assert(checkoutHtml.includes('value="card"'), "checkout.html preserves card");
assert(checkoutHtml.includes('value="netbanking"'), "checkout.html preserves netbanking");
assert(checkoutHtml.includes('value="cod"'), "checkout.html preserves cod");

// Wallet logic in checkout.js
assert(checkoutJs.includes('getWalletBalance'), "checkout.js has getWalletBalance");
assert(checkoutJs.includes('saveWalletBalance'), "checkout.js has saveWalletBalance");
assert(checkoutJs.includes('syncWalletBalanceState'), "checkout.js has syncWalletBalanceState");
assert(checkoutJs.includes('appendWalletTransaction'), "checkout.js has appendWalletTransaction");
assert(checkoutJs.includes('electromart_pay_balance_v1'), "checkout.js uses electromart_pay_balance_v1 key");
assert(checkoutJs.includes('electromart_pay_txns_v1'), "checkout.js uses electromart_pay_txns_v1 key");

// Real-time synchronization events
assert(checkoutJs.includes('electromart_pay_balance_updated'), "checkout.js listens for balance update event");
assert(checkoutJs.includes('window.addEventListener("storage"'), "checkout.js listens for cross-tab storage changes");

console.log("✓ Layer 2 Passed: Checkout integration & live state sync verified!");

// -------------------------------------------------------------
// Layer 3: electromart-pay.js Interactive Controller Logic
// -------------------------------------------------------------
console.log("-> Layer 3: Testing electromart-pay.js in mock sandbox...");
const payJsCode = fs.readFileSync(path.join(projectDir, 'electromart-pay.js'), 'utf8');

// Mock DOM & Storage sandbox
const storageMap = {};
const mockLocalStorage = {
  getItem: (k) => storageMap[k] !== undefined ? storageMap[k] : null,
  setItem: (k, v) => { storageMap[k] = String(v); },
  removeItem: (k) => { delete storageMap[k]; }
};

const mockListeners = {};
const mockWindow = {
  localStorage: mockLocalStorage,
  dispatchEvent: (ev) => {
    const arr = mockListeners[ev.type] || [];
    arr.forEach(fn => fn(ev));
  },
  addEventListener: (type, fn) => {
    if (!mockListeners[type]) mockListeners[type] = [];
    mockListeners[type].push(fn);
  },
  location: { href: 'electromart-pay.html' }
};

const mockDoc = {
  readyState: 'complete',
  addEventListener: () => {},
  getElementById: () => null,
  querySelectorAll: () => [],
  body: { style: {} }
};

const sandbox = {
  window: mockWindow,
  document: mockDoc,
  localStorage: mockLocalStorage,
  Event: function(type) { this.type = type; },
  console: console
};

const runnerFn = new Function('window', 'document', 'localStorage', 'Event', 'console', payJsCode);
runnerFn(mockWindow, mockDoc, mockLocalStorage, sandbox.Event, console);

assert(mockWindow.ElectroMartPay, "ElectroMartPay exported to window");
const EMPay = mockWindow.ElectroMartPay;

// Default balance seed verification
assert.strictEqual(EMPay.getPayBalance(), 2450.00, "Default balance should be 2450.00");

// Adding money
EMPay.savePayBalance(3000.00);
assert.strictEqual(EMPay.getPayBalance(), 3000.00, "Balance updated to 3000.00");

// Format INR test
assert.strictEqual(EMPay.formatINR(2450.5), "2,450.50", "INR formatting correct");
assert.strictEqual(EMPay.formatINR(1000000), "10,00,000.00", "Indian lakh formatting correct");

// Transactions management
const txns = EMPay.getTransactions();
assert(Array.isArray(txns), "Transactions should be an array");
assert(txns.length >= 4, "Initial seed contains at least 4 transactions");

EMPay.addTransaction({
  id: "test_txn_999",
  date: "Just now",
  description: "Test Transaction",
  type: "added",
  category: "credit",
  amount: 500.00,
  status: "Successful"
});

const updatedTxns = EMPay.getTransactions();
assert.strictEqual(updatedTxns[0].id, "test_txn_999", "Transaction prepended correctly");
assert.strictEqual(updatedTxns[0].amount, 500.00, "Transaction amount matches");

// Pending requests management
const pending = EMPay.getPendingRequests();
assert(Array.isArray(pending), "Pending requests should be an array");
assert(pending.length >= 2, "Default seed contains at least 2 pending requests");
assert(pending.some(r => r.merchant.includes("Zomato")), "Contains Zomato request");
assert(pending.some(r => r.merchant.includes("Swiggy")), "Contains Swiggy request");

console.log("✓ Layer 3 Passed: Controller functions & storage logic verified!");

// -------------------------------------------------------------
// Layer 4: Cross-Navigation & Deep Links Verification
// -------------------------------------------------------------
console.log("-> Layer 4: Checking cross-navigation links...");
const headerJs = fs.readFileSync(path.join(projectDir, 'header.js'), 'utf8');
const headerHtml = fs.readFileSync(path.join(projectDir, 'header.html'), 'utf8');
const accountHtml = fs.readFileSync(path.join(projectDir, 'account.html'), 'utf8');

assert(headerJs.includes('href="electromart-pay.html"'), "header.js links to electromart-pay.html");
assert(headerHtml.includes('href="electromart-pay.html"'), "header.html links to electromart-pay.html");
assert(accountHtml.includes('href="electromart-pay.html"'), "account.html deep links to electromart-pay.html");
assert(accountHtml.includes('id="openFullPayHubBtn"'), "account.html has openFullPayHubBtn");

console.log("✓ Layer 4 Passed: Header & Account navigation paths verified!");

// -------------------------------------------------------------
// Layer 5: 11 Indian Languages i18n Completeness
// -------------------------------------------------------------
console.log("-> Layer 5: Checking 11 Indian languages translations...");
const transCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
const transWindow = {};
const transFn = new Function('window', 'document', 'localStorage', transCode);
transFn(transWindow, mockDoc, mockLocalStorage);

assert(transWindow.EM_TRANSLATIONS, "EM_TRANSLATIONS present in translations.js");
const dict = transWindow.EM_TRANSLATIONS;
const languages = ['en', 'hi', 'ta', 'te', 'mr', 'bn', 'kn', 'ml', 'ur', 'pa', 'gu'];

const requiredPayKeys = [
  'electromart_pay_hub',
  'pay_page_title',
  'electromart_pay_balance',
  'pay_add_money_title',
  'pay_upi_section_title',
  'pay_statement_title',
  'pay_rewards_title',
  'pay_insufficient_warning'
];

languages.forEach(lang => {
  assert(dict[lang], `Language ${lang} must exist in EM_TRANSLATIONS`);
  requiredPayKeys.forEach(key => {
    assert(
      dict[lang][key] && dict[lang][key].length > 0,
      `Language "${lang}" must contain non-empty translation for key: "${key}"`
    );
  });
});

console.log("✓ Layer 5 Passed: All 11 Indian languages have complete ElectroMart Pay keys!");

console.log("\n===============================================================");
console.log("ALL PHASE 21 TESTS PASSED SUCCESSFULLY! (5/5 LAYERS)");
console.log("===============================================================");
