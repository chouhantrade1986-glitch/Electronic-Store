const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.resolve(__dirname, '..');

console.log("Starting test-amazon-orders-page.js...");

// 1. Check orders.html structure
const ordersHtml = fs.readFileSync(path.join(projectDir, 'orders.html'), 'utf8');

assert(ordersHtml.startsWith('<!DOCTYPE html>'), "orders.html must start with <!DOCTYPE html>");
const doctypeMatches = ordersHtml.match(/<!DOCTYPE html>/gi) || [];
assert.strictEqual(doctypeMatches.length, 1, "Only one <!DOCTYPE html> in orders.html");
assert(ordersHtml.includes('amazon-theme.css'), "orders.html includes amazon-theme.css");
assert(ordersHtml.includes('data-i18n="your_orders">Your Orders</h1>'), "Includes <h1>Your Orders</h1>");

// Breadcrumb navigation
assert(ordersHtml.includes('class="amz-orders-breadcrumb"'), "Has amz-orders-breadcrumb");

// Search bar & form
assert(ordersHtml.includes('id="orderSearchForm"'), "Has id='orderSearchForm'");
assert(ordersHtml.includes('id="orderSearch"'), "Preserves id='orderSearch'");
assert(ordersHtml.includes('id="orderSearchSubmitBtn"'), "Has id='orderSearchSubmitBtn'");

// 4-Tab Navigation Bar
assert(ordersHtml.includes('id="orderTabs"'), "Has id='orderTabs'");
assert(ordersHtml.includes('data-tab="orders"'), "Has orders tab");
assert(ordersHtml.includes('data-tab="buy_again"'), "Has buy_again tab");
assert(ordersHtml.includes('data-tab="not_yet_shipped"'), "Has not_yet_shipped tab");
assert(ordersHtml.includes('data-tab="cancelled"'), "Has cancelled tab");

// Time filter & status filter
assert(ordersHtml.includes('id="timeFilter"'), "Has id='timeFilter'");
assert(ordersHtml.includes('value="past_3_months"'), "Has past_3_months option");
assert(ordersHtml.includes('value="past_6_months"'), "Has past_6_months option");
assert(ordersHtml.includes('id="statusFilter"'), "Preserves id='statusFilter'");

// Essential QA smoke elements
assert(ordersHtml.includes('id="ordersPhoneVerificationBadge"'), "Preserves id='ordersPhoneVerificationBadge'");
assert(ordersHtml.includes('id="ordersMeta"'), "Preserves id='ordersMeta'");
assert(ordersHtml.includes('id="orderNotificationsMeta"'), "Preserves id='orderNotificationsMeta'");
assert(ordersHtml.includes('id="orderNotificationsList"'), "Preserves id='orderNotificationsList'");
assert(ordersHtml.includes('id="ordersGrid"'), "Preserves id='ordersGrid'");

// Script execution hierarchy per AGENT_INSTRUCTIONS.md
const scripts = [];
const regex = /<script\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
let match;
while ((match = regex.exec(ordersHtml)) !== null) {
  scripts.push(match[1].split('?')[0]);
}

const transIdx = scripts.findIndex(s => s.endsWith('translations.js'));
const catIdx = scripts.findIndex(s => s.endsWith('products-data.js'));
const busIdx = scripts.findIndex(s => s.endsWith('universal-i18n-bus.js'));
const ordersIdx = scripts.findIndex(s => s.endsWith('orders.js'));

assert(transIdx > -1, "translations.js is present");
assert(catIdx > -1, "products-data.js is present");
assert(busIdx > -1, "universal-i18n-bus.js is present");
assert(ordersIdx > -1, "orders.js is present");
assert(transIdx < catIdx, "translations.js loads before products-data.js");
assert(catIdx < busIdx, "products-data.js loads before universal-i18n-bus.js");
assert(busIdx < ordersIdx, "universal-i18n-bus.js loads before orders.js");

console.log("  ✓ orders.html markup and script hierarchy verified.");

// 2. Check amazon-theme.css Phase 5 styles
const cssContent = fs.readFileSync(path.join(projectDir, 'amazon-theme.css'), 'utf8');
assert(cssContent.includes('9. AMAZON INDIA YOUR ORDERS & TRACKING HUB (PHASE 5)'), "Includes Section 9 in amazon-theme.css");
assert(cssContent.includes('.amz-orders-nav-tabs'), "Includes .amz-orders-nav-tabs");
assert(cssContent.includes('.amz-order-tab-btn'), "Includes .amz-order-tab-btn");
assert(cssContent.includes('.amz-order-search-box'), "Includes .amz-order-search-box");
assert(cssContent.includes('.order-card .order-top'), "Includes .order-card .order-top");
assert(cssContent.includes('.order-card .order-actions .track-btn'), "Includes .track-btn styles");
assert(cssContent.includes('.amz-tracking-stepper'), "Includes .amz-tracking-stepper");
assert(cssContent.includes('.amz-buy-again-inline-btn'), "Includes .amz-buy-again-inline-btn");

console.log("  ✓ amazon-theme.css Phase 5 styles verified.");

// 3. Check translations.js Phase 5 11-language coverage
const translationsContent = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
assert(translationsContent.includes('AMAZON_ORDERS_PAGE_I18N'), "Includes AMAZON_ORDERS_PAGE_I18N in translations.js");

const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const requiredKeys = [
  'tab_orders', 'tab_buy_again', 'tab_not_yet_shipped', 'tab_cancelled',
  'time_past_3_months', 'time_past_6_months', 'time_archived',
  'search_orders_placeholder', 'search_orders_btn',
  'order_placed_label', 'total_label', 'ship_to_label', 'order_num_label',
  'view_order_details', 'buy_it_again', 'track_package',
  'write_review', 'seller_feedback', 'return_or_replace', 'download_invoice',
  'track_milestone_ordered', 'track_milestone_shipped', 'track_milestone_out_for_delivery', 'track_milestone_delivered'
];

// Execute translations in sandbox to inspect dictionary keys
const sandboxWindow = {};
const sandboxLocalStorage = {
  getItem: () => 'en',
  setItem: () => {}
};
const evalCode = `
  (function() {
    const window = {};
    const localStorage = { getItem: () => 'en', setItem: () => {} };
    const document = undefined;
    ${translationsContent}
    return window.EM_TRANSLATIONS;
  })()
`;

try {
  const transObj = eval(evalCode);
  for (const lang of languages) {
    assert(transObj[lang], `Language ${lang} must exist in translations`);
    for (const key of requiredKeys) {
      assert(transObj[lang][key], `Key '${key}' must exist for language '${lang}'`);
    }
  }
  console.log("  ✓ All 11 Indian languages have 100% Phase 5 keys verified.");
} catch (e) {
  assert.fail(`Translation eval failed: ${e.message}`);
}

// 4. Verify orders.js card structure and tracking stepper logic
const ordersJsContent = fs.readFileSync(path.join(projectDir, 'orders.js'), 'utf8');
assert(ordersJsContent.includes('currentOrderTab'), "Has currentOrderTab tracking");
assert(ordersJsContent.includes('amz-tracking-stepper'), "Renders amz-tracking-stepper in trackingPanel");
assert(ordersJsContent.includes('amz-buy-again-inline-btn'), "Renders amz-buy-again-inline-btn in orderCard");
assert(ordersJsContent.includes('order-top-details'), "Renders order-top-details in orderCard");
assert(ordersJsContent.includes('order-delivery-headline'), "Renders order-delivery-headline in orderCard");
assert(ordersJsContent.includes('resume-payment-btn'), "Preserves resume-payment-btn in orderCard");
assert(ordersJsContent.includes('track-btn'), "Preserves track-btn in orderCard");

console.log("  ✓ orders.js Amazon card and stepper logic verified.");
console.log("ALL TESTS PASSED for test-amazon-orders-page.js!");
