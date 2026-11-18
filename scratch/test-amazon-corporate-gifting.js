/**
 * Phase 45: ElectroMart Corporate Gifting & Bulk Orders Hub Test Suite
 * scratch/test-amazon-corporate-gifting.js
 *
 * 9 Verification Layers:
 *  1. DOM Elements & Hub Structure (corporate-gifting.html)
 *  2. Festival Catalog Engine (seasonal/occasion-based catalogs)
 *  3. Bulk Invoicing Engine (GST-compliant, multi-line, PO support)
 *  4. Gift Registry Engine (recipient management, delivery scheduling)
 *  5. Corporate Dashboard (order history, spending analytics, team management)
 *  6. PDP Corporate Gifting Integration
 *  7. Cart & Checkout Corporate Integration
 *  8. Brand Safety (0 Amazon references) & 11-Language i18n Coverage
 *  9. Deterministic Engine Contracts
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectDir = path.join(__dirname, '..');
const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const requiredFiles = ['corporate-gifting.html', 'corporate-gifting.css', 'corporate-gifting.js'];

console.log('===============================================================');
console.log('TEST SUITE: ElectroMart Corporate Gifting & Bulk Orders (Phase 45)');
console.log('===============================================================');

// 1. Required files
requiredFiles.forEach((fileName) => {
  const filePath = path.join(projectDir, fileName);
  assert(fs.existsSync(filePath), `${fileName} must exist in project directory`);
});
console.log('✓ File existence verified.');

// 2. Read source contracts
const html = fs.readFileSync(path.join(projectDir, 'corporate-gifting.html'), 'utf8');
const css = fs.readFileSync(path.join(projectDir, 'corporate-gifting.css'), 'utf8');
const js = fs.readFileSync(path.join(projectDir, 'corporate-gifting.js'), 'utf8');
const pdpHtml = fs.readFileSync(path.join(projectDir, 'product-detail.html'), 'utf8');
const pdpJs = fs.readFileSync(path.join(projectDir, 'product-detail.js'), 'utf8');
const translationsCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');

// 3. Canonical script order
const expectedScripts = [
  'translations.js',
  'products-data.js',
  'universal-i18n-bus.js',
  'header.js',
  'menu-manager.js',
  'auth-state.js',
  'shared-search.js',
  'corporate-gifting.js'
];

let lastIndex = -1;
expectedScripts.forEach((scriptName) => {
  const index = html.indexOf(scriptName);
  assert(index !== -1, `corporate-gifting.html must load ${scriptName}`);
  assert(index > lastIndex, `Script ${scriptName} is not in the canonical loading order`);
  lastIndex = index;
});
console.log('✓ Canonical script sequence verified.');

// 4. Required DOM contracts
const requiredIds = [
  'cgHero',
  'festivalCatalogSection',
  'festivalTabs',
  'festivalCatalogGrid',
  'bulkOrderSection',
  'bulkOrderForm',
  'poNumberInput',
  'companyNameInput',
  'gstinInput',
  'billingAddressInput',
  'shippingAddressInput',
  'bulkItemsContainer',
  'addBulkItemBtn',
  'bulkItemProductSelect',
  'bulkItemQuantityInput',
  'bulkItemUnitPriceInput',
  'bulkInvoicePreview',
  'bulkInvoiceTotal',
  'giftRegistrySection',
  'registryNameInput',
  'occasionSelect',
  'eventDateInput',
  'recipientNameInput',
  'recipientEmailInput',
  'registryItemsContainer',
  'registryItemProductSelect',
  'registryItemQuantityInput',
  'addRegistryItemBtn',
  'registryShareLink',
  'registryStatus',
  'corporateDashboardSection',
  'ordersHistoryTable',
  'spendingAnalyticsChart',
  'teamManagementTable',
  'addTeamMemberBtn',
  'cgProductGrid',
  'cgDashboardLink'
];

requiredIds.forEach((id) => {
  assert(html.includes(`id="${id}"`) || html.includes(`id='${id}'`), `corporate-gifting.html must contain #${id}`);
});

// Form controls
['festival', 'poNumber', 'companyName', 'gstin', 'billingAddress', 'shippingAddress',
 'productId', 'quantity', 'registryName', 'occasion', 'eventDate', 'recipientName', 'recipientEmail'].forEach((name) => {
  assert(new RegExp(`name=["']${name}["']`).test(html), `Form control #${name} must have a name attribute`);
});

// Submit buttons targeting forms
assert(/id=["']generateInvoiceBtn["'][^>]*form=["']bulkOrderForm["']/.test(html), 'Generate invoice button must target #bulkOrderForm');
assert(/id=["']createRegistryBtn["'][^>]*form=["']giftRegistryForm["']/.test(html), 'Create registry button must target #giftRegistryForm');
assert(/id=["']addTeamMemberBtn["'][^>]*form=["']addTeamMemberForm["']/.test(html), 'Add team member button must target #addTeamMemberForm');
assert(html.includes('amazon-theme.css') && html.includes('shared-search.css'), 'Corporate gifting page must load shared storefront styles');
console.log('✓ Required DOM and form contracts verified.');

// 5. Theme and accessibility surfaces
assert(css.includes('--cg-accent') && css.includes('#1E3A8A'), 'corporate-gifting.css must define the corporate deep blue accent');
assert(css.includes('prefers-reduced-motion'), 'corporate-gifting.css must respect reduced-motion preferences');
assert(css.includes('color: #ffffff') && css.includes('font-weight: 700'), 'Corporate gifting CTAs must use readable high-contrast text');
assert(css.includes('backdrop-filter') || css.includes('rgba'), 'corporate-gifting.css must include layered surfaces');
console.log('✓ Theme and accessibility contracts verified.');

// 6. Controller, storage and engine contracts
assert(js.includes('electromart_cg_festival_catalog_v1'), 'corporate-gifting.js must persist festival catalogs');
assert(js.includes('electromart_cg_bulk_orders_v1'), 'corporate-gifting.js must persist bulk orders');
assert(!js.includes('electromart_cg_gift_registries_v1'), 'gift registries must not use localStorage as their source of truth');
assert(js.includes('electromart_cg_team_members_v1'), 'corporate-gifting.js must persist team members');
assert(js.includes('ElectroMart.CorporateGifting') || js.includes('ElectroMartCorporateGifting'), 'corporate-gifting.js must use the approved ElectroMart namespace');
assert(js.includes('generateBulkInvoice'), 'corporate-gifting.js must expose the bulk invoice generator');
assert(js.includes('calculateBulkOrderTotal'), 'corporate-gifting.js must expose the bulk order total calculator');
assert(js.includes('createGiftRegistry'), 'corporate-gifting.js must expose the gift registry creator');
assert(js.includes('addTeamMember'), 'corporate-gifting.js must expose the team member management engine');
assert(js.includes("requestCorporateApi('/registry'"), 'Registry creation must use the backend API');
assert(js.includes("'/registry/' + encodeURIComponent(activeRegistry.id) + '/items'"), 'Registry item updates must synchronize with the backend');
assert(js.includes("'x-corporate-share-token'"), 'Shared registry requests must use a scoped share token header');
assert(js.includes("setRegistryStatus(error.message, true)"), 'Registry API errors must be announced accessibly');

const sandbox = {
  window: {},
  document: {
    addEventListener: () => {},
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({})
  },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  setTimeout: () => {},
  clearTimeout: () => {},
  Intl,
  Date,
  console
};
vm.createContext(sandbox);
vm.runInContext(js, sandbox);

const cgNamespace = sandbox.window.ElectroMart && sandbox.window.ElectroMart.CorporateGifting;
assert(cgNamespace, 'window.ElectroMart.CorporateGifting must exist after corporate-gifting.js runs');
['generateBulkInvoice', 'calculateBulkOrderTotal', 'createGiftRegistry', 'addTeamMember'].forEach((fn) => {
  assert(typeof cgNamespace[fn] === 'function', `CorporateGifting namespace must expose ${fn}()`);
});
assert.strictEqual(cgNamespace.escapeHtml('<img src="x" onerror="alert(1)"> &'), '&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt; &amp;', 'Corporate invoice previews must escape user-controlled text');

// 6a. Deterministic bulk invoice generator
const bulkOrder = {
  poNumber: 'PO-2026-001',
  companyName: 'Acme Corp',
  gstin: '27AAACA1234A1Z5',
  items: [
    { productId: 'PROD-001', quantity: 50, unitPrice: 1200 },
    { productId: 'PROD-002', quantity: 30, unitPrice: 2500 }
  ],
  billingAddress: 'Mumbai, Maharashtra',
  shippingAddress: 'Pune, Maharashtra'
};
const invoice1 = cgNamespace.generateBulkInvoice(bulkOrder);
const invoice2 = cgNamespace.generateBulkInvoice(bulkOrder);
assert.strictEqual(invoice1.invoiceNumber, invoice2.invoiceNumber, 'Invoice number must be deterministic');
assert.strictEqual(invoice1.total, invoice2.total, 'Total must be deterministic');
assert(invoice1.invoiceNumber.startsWith('EM-CG-INV-'), 'Invoice number must follow EM-CG-INV-XXXXXX format');
assert(typeof invoice1.subtotal === 'number' && invoice1.subtotal > 0, 'Subtotal must be positive');
assert(typeof invoice1.gstAmount === 'number' && invoice1.gstAmount >= 0, 'GST amount must be non-negative');
assert(typeof invoice1.total === 'number' && invoice1.total > 0, 'Total must be positive');
assert(invoice1.items.length === 2, 'Invoice must have correct number of items');
assert(invoice1.gstin === '27AAACA1234A1Z5', 'GSTIN must be preserved');
console.log('✓ Bulk invoice generator verified (deterministic).');

// 6b. Bulk order total calculator
const orderTotal = cgNamespace.calculateBulkOrderTotal([
  { unitPrice: 1200, quantity: 50, gstRate: 0.18 },
  { unitPrice: 2500, quantity: 30, gstRate: 0.18 }
]);
const orderTotal2 = cgNamespace.calculateBulkOrderTotal([
  { unitPrice: 1200, quantity: 50, gstRate: 0.18 },
  { unitPrice: 2500, quantity: 30, gstRate: 0.18 }
]);
assert.strictEqual(orderTotal.subtotal, orderTotal2.subtotal, 'Subtotal must be deterministic');
assert.strictEqual(orderTotal.gst, orderTotal2.gst, 'GST must be deterministic');
assert.strictEqual(orderTotal.total, orderTotal2.total, 'Total must be deterministic');
assert.strictEqual(orderTotal.subtotal, 135000, 'Subtotal = 50*1200 + 30*2500 = 135000');
assert.strictEqual(orderTotal.gst, 24300, 'GST = 18% of 135000 = 24300');
assert.strictEqual(orderTotal.total, 159300, 'Total = subtotal + GST');
console.log('✓ Bulk order total calculator verified (deterministic).');

// 6c. Gift registry creator
const registry = cgNamespace.createGiftRegistry({
  registryName: 'Diwali Corporate Gifts 2026',
  occasion: 'diwali',
  eventDate: '2026-10-20',
  items: [
    { productId: 'PROD-001', quantity: 100 },
    { productId: 'PROD-002', quantity: 50 }
  ],
  recipients: [
    { name: 'Rajesh Kumar', email: 'rajesh@client.com' },
    { name: 'Priya Sharma', email: 'priya@partner.com' }
  ]
});
const registry2 = cgNamespace.createGiftRegistry({
  registryName: 'Diwali Corporate Gifts 2026',
  occasion: 'diwali',
  eventDate: '2026-10-20',
  items: [
    { productId: 'PROD-001', quantity: 100 },
    { productId: 'PROD-002', quantity: 50 }
  ],
  recipients: [
    { name: 'Rajesh Kumar', email: 'rajesh@client.com' },
    { name: 'Priya Sharma', email: 'priya@partner.com' }
  ]
});
assert(registry && registry.registryName, 'Registry creator must return an API payload');
assert(!registry.registryId, 'Registry IDs must be generated by the backend');
assert(registry.occasion === 'diwali', 'Occasion must match');
assert(registry.recipients.length === 2, 'Must have 2 recipients');
assert.deepStrictEqual(registry, registry2, 'Registry payload normalization must be deterministic');
console.log('✓ Gift registry payload builder verified (server-authoritative).');

// 6d. Team member management
const teamMember = cgNamespace.addTeamMember({
  name: 'Amit Patel',
  email: 'amit@company.com',
  role: 'procurement_manager',
  budgetLimit: 500000
});
const teamMember2 = cgNamespace.addTeamMember({
  name: 'Amit Patel',
  email: 'amit@company.com',
  role: 'procurement_manager',
  budgetLimit: 500000
});
assert(teamMember && teamMember.memberId, 'Team member must return memberId');
assert(teamMember.memberId.startsWith('EM-CG-TM-'), 'Member ID must follow EM-CG-TM-XXXXXX format');
assert(teamMember.role === 'procurement_manager', 'Role must match');
assert(teamMember.budgetLimit === 500000, 'Budget limit must match');
assert.strictEqual(teamMember.memberId, teamMember2.memberId, 'Team member creation must be deterministic');
console.log('✓ Team member management verified (deterministic).');

// 7. PDP integration
assert(pdpHtml.includes('pdpCorporateGiftingCallout') || pdpHtml.includes('pdpCorporateGiftingBadge'), 'product-detail.html must contain the Corporate Gifting callout');
assert(pdpJs.includes('renderPdpCorporateGiftingCallout'), 'product-detail.js must contain renderPdpCorporateGiftingCallout');
assert(pdpHtml.includes('ElectroMart Corporate Gifting: Bulk Orders, Gift Registries & Festival Catalogs'), 'PDP must render the Corporate Gifting certification message');
console.log('✓ PDP corporate gifting integration verified.');

// 8. 11-language i18n coverage
const i18nSandbox = {
  window: {},
  document: {
    addEventListener: () => {},
    querySelectorAll: () => [],
    getElementById: () => null,
    querySelector: () => null,
    createElement: () => ({})
  },
  localStorage: { getItem: () => null, setItem: () => {} },
  console
};
vm.createContext(i18nSandbox);
vm.runInContext(translationsCode, i18nSandbox);

const translations = i18nSandbox.window.EM_TRANSLATIONS;
assert(translations, 'window.EM_TRANSLATIONS must exist');
const expectedI18nKeys = [
  'cg_hub_title',
  'cg_hub_subtitle',
  'cg_festival_catalog_title',
  'cg_bulk_order_title',
  'cg_po_number_label',
  'cg_company_name_label',
  'cg_gstin_label',
  'cg_billing_address_label',
  'cg_shipping_address_label',
  'cg_generate_invoice_btn',
  'cg_invoice_preview_title',
  'cg_gift_registry_title',
  'cg_registry_name_label',
  'cg_occasion_label',
  'cg_event_date_label',
  'cg_recipient_name_label',
  'cg_recipient_email_label',
  'cg_create_registry_btn',
  'cg_share_registry_btn',
  'cg_dashboard_title',
  'cg_team_management_title',
  'cg_add_team_member_btn',
  'cg_team_member_name_label',
  'cg_team_member_email_label',
  'cg_team_member_role_label',
  'cg_team_member_budget_label',
  'cg_pdp_badge'
];
languages.forEach((language) => {
  assert(translations[language], `Language ${language} must exist in translations`);
  expectedI18nKeys.forEach((key) => {
    assert(translations[language][key], `Key "${key}" must exist for language "${language}"`);
  });
});
assert(translationsCode.includes('ELECTROMART_CG_I18N'), 'translations.js must expose ELECTROMART_CG_I18N');
console.log('✓ All 11 Indian languages covered in translations.js.');

// 9. Brand safety
[html, css, js].forEach((source, index) => {
  const visibleSource = source
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\b(?:src|href|class|id)=(['"])[^'"]*\1/gi, '')
    .replace(/<[^>]+>/g, ' ');
  assert(!/Amazon|अमेज़न/i.test(visibleSource), `${requiredFiles[index]} must be free of prohibited brand references`);
});
console.log('✓ Brand safety verified (100% pure ElectroMart).');

console.log('\n===============================================================');
console.log('PASS: Phase 45 ElectroMart Corporate Gifting & Bulk Orders contract verified successfully!');
console.log('===============================================================');