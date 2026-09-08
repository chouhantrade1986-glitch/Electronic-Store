const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.resolve(__dirname, '..');

console.log("Starting test-orders-and-account-popups.js...");

// 1. Check orders.html structure
const ordersHtml = fs.readFileSync(path.join(projectDir, 'orders.html'), 'utf8');
assert(ordersHtml.includes('id="orderDetailsModal"'), "orders.html must have id='orderDetailsModal'");
assert(ordersHtml.includes('id="modalOrderTitle"'), "orders.html must have id='modalOrderTitle'");
assert(ordersHtml.includes('id="closeOrderDetailsBtn"'), "orders.html must have id='closeOrderDetailsBtn'");
assert(ordersHtml.includes('id="modalDownloadInvoiceLink"'), "orders.html must have id='modalDownloadInvoiceLink'");
console.log("  ✓ orders.html modal structure verified.");

// 2. Check orders.js popover, modal and empty state logic
const ordersJs = fs.readFileSync(path.join(projectDir, 'orders.js'), 'utf8');
assert(ordersJs.includes('amz-ship-to-wrapper'), "orders.js must include amz-ship-to-wrapper");
assert(ordersJs.includes('amz-ship-to-trigger'), "orders.js must include amz-ship-to-trigger");
assert(ordersJs.includes('amz-ship-to-popover'), "orders.js must include amz-ship-to-popover");
assert(ordersJs.includes('openOrderDetailsModal'), "orders.js must include openOrderDetailsModal");
assert(ordersJs.includes('closeOrderDetailsModal'), "orders.js must include closeOrderDetailsModal");
assert(ordersJs.includes('amz-empty-orders-card'), "orders.js must include amz-empty-orders-card");
assert(ordersJs.includes('Escape'), "orders.js must handle Escape key for modal & popover closing");
console.log("  ✓ orders.js popover, modal, and empty state verified.");

// 3. Check account.html address management and modal
const accountHtml = fs.readFileSync(path.join(projectDir, 'account.html'), 'utf8');
assert(accountHtml.includes('id="savedAddressesGrid"'), "account.html must have id='savedAddressesGrid'");
assert(accountHtml.includes('id="openAddAddressBtn"'), "account.html must have id='openAddAddressBtn'");
assert(accountHtml.includes('id="addressEditModal"'), "account.html must have id='addressEditModal'");
assert(accountHtml.includes('id="addressModalForm"'), "account.html must have id='addressModalForm'");
console.log("  ✓ account.html address grid & modal markup verified.");

// 4. Check account.js address sync logic
const accountJs = fs.readFileSync(path.join(projectDir, 'account.js'), 'utf8');
assert(accountJs.includes('electromart_saved_addresses_v1'), "account.js must use electromart_saved_addresses_v1");
assert(accountJs.includes('setupAddressesManagement'), "account.js must include setupAddressesManagement");
assert(accountJs.includes('loadSavedAddresses'), "account.js must include loadSavedAddresses");
assert(accountJs.includes('saveSavedAddresses'), "account.js must include saveSavedAddresses");
assert(accountJs.includes('renderSavedAddresses'), "account.js must include renderSavedAddresses");
assert(accountJs.includes('openAddressModal'), "account.js must include openAddressModal");
assert(accountJs.includes('closeAddressModal'), "account.js must include closeAddressModal");
console.log("  ✓ account.js address management and sync verified.");

// 5. Check checkout.js sync with saved addresses
const checkoutJs = fs.readFileSync(path.join(projectDir, 'checkout.js'), 'utf8');
assert(checkoutJs.includes('electromart_saved_addresses_v1'), "checkout.js must use electromart_saved_addresses_v1");
assert(checkoutJs.includes('loadSavedAddressesForCheckout'), "checkout.js must include loadSavedAddressesForCheckout");
console.log("  ✓ checkout.js synchronization with saved addresses verified.");

// 6. Check amazon-theme.css styles
const cssContent = fs.readFileSync(path.join(projectDir, 'amazon-theme.css'), 'utf8');
assert(cssContent.includes('.amz-ship-to-popover'), "amazon-theme.css must style .amz-ship-to-popover");
assert(cssContent.includes('.amz-modal-overlay'), "amazon-theme.css must style .amz-modal-overlay");
assert(cssContent.includes('.amz-empty-orders-card'), "amazon-theme.css must style .amz-empty-orders-card");
assert(cssContent.includes('.address-modal-overlay'), "amazon-theme.css must style .address-modal-overlay");
console.log("  ✓ amazon-theme.css modal and popover styles verified.");

console.log("ALL TESTS PASSED for test-orders-and-account-popups.js!");
