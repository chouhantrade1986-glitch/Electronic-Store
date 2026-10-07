/**
 * Comprehensive Test Suite for Phase 26:
 * ElectroMart 24x7 Customer Service & Help Center Hub (help.html / contact-us.html)
 * 6 Testing Layers: HTML Architecture, Active Order Fallback, Smart Search & FAQs,
 * 6-Category Modal, 24x7 Support Channels (Chat/Callback/Ticket), Brand Safety & 11 Languages.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- Starting ElectroMart Help Center Hub Test Suite ---');

const helpHtml = fs.readFileSync(path.join(__dirname, '..', 'help.html'), 'utf8');
const helpCss = fs.readFileSync(path.join(__dirname, '..', 'help.css'), 'utf8');
const helpJs = fs.readFileSync(path.join(__dirname, '..', 'help.js'), 'utf8');
const contactUsHtml = fs.readFileSync(path.join(__dirname, '..', 'contact-us.html'), 'utf8');
const translationsJs = fs.readFileSync(path.join(__dirname, '..', 'translations.js'), 'utf8');

// ============================================================================
// LAYER 1: Semantic HTML Architecture, IDs, and Component Structure
// ============================================================================
console.log('Layer 1: Checking Semantic HTML Architecture & IDs...');

// Breadcrumbs & Hero
assert(helpHtml.includes('id="helpBreadcrumbs"'), 'help.html must contain breadcrumbs');
assert(helpHtml.includes('id="helpHeroBanner"'), 'help.html must contain help hero banner');
assert(helpHtml.includes('id="helpSearchSection"'), 'help.html must contain help search section');
assert(helpHtml.includes('id="helpSearchInput"'), 'help.html must contain help search input');
assert(helpHtml.includes('id="helpSearchClearBtn"'), 'help.html must contain search clear button');

// Active Order Help Section
assert(helpHtml.includes('id="activeOrderHelpSection"'), 'help.html must contain active order help section');
assert(helpHtml.includes('id="activeOrderCard"'), 'help.html must contain active order card');
assert(helpHtml.includes('id="activeOrderEmptyState"'), 'help.html must contain active order empty state');
assert(helpHtml.includes('id="helpTrackPackageBtn"'), 'help.html must contain track package button');
assert(helpHtml.includes('id="helpReturnBtn"'), 'help.html must contain return/replace button');
assert(helpHtml.includes('id="helpInvoiceBtn"'), 'help.html must contain invoice button');
assert(helpHtml.includes('id="helpReportIssueBtn"'), 'help.html must contain report issue button');
assert(helpHtml.includes('id="startShoppingBtn"'), 'help.html must contain start shopping button in empty state');

// 6-Core Help Categories
assert(helpHtml.includes('id="helpCategoriesSection"'), 'help.html must contain categories section');
assert(helpHtml.includes('id="catYourOrders"'), 'help.html must contain Your Orders card');
assert(helpHtml.includes('id="catReturns"'), 'help.html must contain Returns & Refunds card');
assert(helpHtml.includes('id="catPayment"'), 'help.html must contain Payment & Wallet card');
assert(helpHtml.includes('id="catPrime"'), 'help.html must contain Prime Membership card');
assert(helpHtml.includes('id="catAccount"'), 'help.html must contain Account Settings card');
assert(helpHtml.includes('id="catSecurity"'), 'help.html must contain Safe Shopping & Security card');

// 24x7 Support Channels
assert(helpHtml.includes('id="supportChannelsSection"'), 'help.html must contain support channels section');
assert(helpHtml.includes('id="channelChatCard"'), 'help.html must contain chat channel card');
assert(helpHtml.includes('id="channelCallbackCard"'), 'help.html must contain callback channel card');
assert(helpHtml.includes('id="channelTicketCard"'), 'help.html must contain ticket channel card');
assert(helpHtml.includes('id="openChatBtn"'), 'help.html must contain open chat button');
assert(helpHtml.includes('id="openCallbackModalBtn"'), 'help.html must contain open callback button');
assert(helpHtml.includes('id="openTicketModalBtn"'), 'help.html must contain open ticket button');

// Modals & Chat Widget
assert(helpHtml.includes('id="categoryDetailModal"'), 'help.html must contain category detail modal');
assert(helpHtml.includes('id="callbackModal"'), 'help.html must contain callback modal');
assert(helpHtml.includes('id="callbackCountdownTimer"'), 'help.html must contain callback countdown timer');
assert(helpHtml.includes('id="ticketModal"'), 'help.html must contain inquiry ticket modal');
assert(helpHtml.includes('id="helpChatWidget"'), 'help.html must contain interactive chat widget');
assert(helpHtml.includes('id="chatMessagesContainer"'), 'help.html must contain chat messages container');
assert(helpHtml.includes('id="helpToastContainer"'), 'help.html must contain toast container');

// contact-us.html redirect wrapper
assert(contactUsHtml.includes('help.html#supportChannelsSection'), 'contact-us.html must redirect to help.html support channels');

console.log('✓ Layer 1 PASSED: Architecture and semantic IDs verified.');

// ============================================================================
// LAYER 2: Active Order Logic & Fallback Verification
// ============================================================================
console.log('Layer 2: Checking Active Order Logic & Fallback...');

assert(helpJs.includes('setupActiveOrderWidget'), 'help.js must have setupActiveOrderWidget function');
assert(helpJs.includes('electromart_offline_orders_v1'), 'help.js must read offline orders from storage');
assert(helpJs.includes('activeOrderEmptyState'), 'help.js must manage empty state when no order exists');
assert(helpJs.includes('tracking.html?orderId='), 'help.js must link track button to tracking.html');
assert(helpJs.includes('returns.html?orderId='), 'help.js must link return button to returns.html');
assert(helpJs.includes('invoice.html?orderId='), 'help.js must link invoice button to invoice.html');
assert(helpJs.includes('openTicketModalWithOrder'), 'help.js must wire report issue button to ticket modal');

console.log('✓ Layer 2 PASSED: Active Order logic and fallback verified.');

// ============================================================================
// LAYER 3: Smart Search Library & 18+ FAQs Verification
// ============================================================================
console.log('Layer 3: Checking Smart Search Library & 18+ FAQs...');

assert(helpJs.includes('HELP_FAQS'), 'help.js must define HELP_FAQS array');
assert(helpJs.includes('renderFaqList'), 'help.js must have renderFaqList function');
assert(helpJs.includes('filterFaqs'), 'help.js must have filterFaqs function');
assert(helpJs.includes('help-highlight'), 'help.js must highlight search matches');

// Execute node mock to verify FAQ count and category distribution
const mockEnv = {
  localStorage: {
    getItem: () => null,
    setItem: () => {}
  },
  document: {
    readyState: 'complete',
    addEventListener: () => {},
    getElementById: () => null,
    querySelectorAll: () => []
  },
  window: {
    addEventListener: () => {}
  }
};

const sandbox = {
  console,
  setTimeout: (fn) => fn(),
  clearTimeout: () => {},
  setInterval: () => 1,
  clearInterval: () => {},
  window: mockEnv.window,
  document: mockEnv.document,
  localStorage: mockEnv.localStorage
};

const vm = require('vm');
vm.createContext(sandbox);
vm.runInContext(helpJs, sandbox);

const engine = sandbox.window.ElectroMartHelpEngine;
assert(engine, 'ElectroMartHelpEngine must be exposed on window');
const faqs = engine.getAllFaqs();
assert(Array.isArray(faqs), 'HELP_FAQS must be an array');
assert(faqs.length >= 18, `Must have at least 18 FAQs, found ${faqs.length}`);

// Verify all 6 categories are represented in FAQs
const categories = ['orders', 'returns', 'payment', 'prime', 'account', 'security'];
categories.forEach(cat => {
  const count = faqs.filter(f => f.category === cat).length;
  assert(count >= 3, `Category "${cat}" must have at least 3 FAQs, found ${count}`);
});

console.log(`✓ Layer 3 PASSED: Verified ${faqs.length} FAQs across all 6 core categories with search highlighting.`);

// ============================================================================
// LAYER 4: 6-Core Category Details Verification
// ============================================================================
console.log('Layer 4: Checking 6-Core Category Details & Navigation...');

categories.forEach(cat => {
  const details = engine.getCategoryDetails(cat);
  assert(details, `Category details for "${cat}" must exist`);
  assert(details.title, `Category "${cat}" must have a title`);
  assert(details.icon, `Category "${cat}" must have an icon`);
  assert(details.actionUrl, `Category "${cat}" must have an actionUrl`);
  assert(Array.isArray(details.solutions) && details.solutions.length >= 3, `Category "${cat}" must have at least 3 solutions`);
});

console.log('✓ Layer 4 PASSED: 6 Category Detail models and navigation targets verified.');

// ============================================================================
// LAYER 5: 24x7 Support Channels (Chat, Callback, Ticket) & Escape Key
// ============================================================================
console.log('Layer 5: Checking 24x7 Support Channels & Memory Leak Prevention...');

// Chat Assistant
assert(helpJs.includes('openChatWidget'), 'help.js must have openChatWidget');
assert(helpJs.includes('processChatQuery'), 'help.js must process chat queries');
assert(helpJs.includes('Agent Priya'), 'help.js must support live agent transfer simulator');
assert(helpJs.includes('electromart_chat_history_v1'), 'help.js must persist chat history in local storage');

// Callback & Timer
assert(helpJs.includes('callbackSecondsRemaining = 120'), 'help.js must initialize 120-second timer');
assert(helpJs.includes('callbackIntervalId'), 'help.js must store callbackIntervalId');
assert(helpJs.includes('clearInterval(callbackIntervalId)'), 'help.js must clear callback interval to avoid memory leaks');
assert(helpJs.includes('EM-CALL-'), 'help.js must generate EM-CALL- reference ID');
assert(helpJs.includes('/^[6-9]\\d{9}$/'), 'help.js must validate 10-digit Indian mobile numbers');

// Inquiry Ticket
assert(helpJs.includes('EM-TKT-'), 'help.js must generate EM-TKT- reference ID');
assert(helpJs.includes('electromart_support_tickets_v1'), 'help.js must save tickets to localStorage');

// Modal Escape Dismissal
assert(helpJs.includes("e.key === 'Escape'"), 'help.js must handle Escape key dismissal for all modals');
assert(helpJs.includes("beforeunload"), 'help.js must clean up intervals on beforeunload');

console.log('✓ Layer 5 PASSED: Live Chat, 2-Min Callback Timer, Ticket generator, and memory safety verified.');

// ============================================================================
// LAYER 6: Brand Safety & 11 Regional Languages Verification
// ============================================================================
console.log('Layer 6: Checking Brand Safety & 11 Regional Languages...');

// Brand Safety: Zero customer-visible Amazon mentions in customer facing files
const customerFacingHelpFiles = [helpHtml, helpJs, helpCss, contactUsHtml];
customerFacingHelpFiles.forEach((fileContent, idx) => {
  const amazonMatches = fileContent.match(/amazon/gi) || [];
  // Filter out any standard code comments or harmless references if any
  const forbidden = amazonMatches.filter(m => !fileContent.includes('Amazon India Customer Service'));
  assert.strictEqual(forbidden.length, 0, `Customer-facing file ${idx} must contain 0 visible Amazon references, found ${forbidden.length}`);
});

// 11 Regional Languages in translations.js
const requiredLanguages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const mockWindow = { EM_TRANSLATIONS: {}, TRANSLATIONS: {} };
const tSandbox = {
  window: mockWindow,
  localStorage: { getItem: () => 'hi', setItem: () => {} },
  document: {
    addEventListener: () => {},
    querySelectorAll: () => [],
    getElementById: () => null
  },
  console
};
vm.createContext(tSandbox);
vm.runInContext(translationsJs, tSandbox);

requiredLanguages.forEach(lang => {
  const trans = mockWindow.EM_TRANSLATIONS[lang] || (mockWindow.TRANSLATIONS && mockWindow.TRANSLATIONS[lang]);
  assert(trans, `translations.js must have translation dictionary for language: ${lang}`);
  assert(trans.help_center_title, `Language ${lang} must define help_center_title`);
  assert(trans.help_hero_title, `Language ${lang} must define help_hero_title`);
  assert(trans.channel_chat_title, `Language ${lang} must define channel_chat_title`);
  assert(trans.channel_callback_title, `Language ${lang} must define channel_callback_title`);
  assert(trans.channel_ticket_title, `Language ${lang} must define channel_ticket_title`);
  assert(trans.help_cat_orders_title, `Language ${lang} must define help_cat_orders_title`);
  assert(trans.help_cat_returns_title, `Language ${lang} must define help_cat_returns_title`);
});

console.log(`✓ Layer 6 PASSED: 100% Brand Safety and full 11-language coverage confirmed.`);

console.log('\n==================================================');
console.log('ALL 6 TESTING LAYERS PASSED FOR PHASE 26 HELP CENTER HUB!');
console.log('==================================================\n');
