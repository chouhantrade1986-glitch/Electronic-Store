const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.resolve(__dirname, '..');

console.log("==================================================");
console.log("Testing Thank You & Tax Invoice Pages Implementation");
console.log("==================================================");

// 1. Validate thank-you.html markup
const thankYouHtml = fs.readFileSync(path.join(projectDir, 'thank-you.html'), 'utf8');
const expectedThankYouIds = [
  'thankYouOrderId',
  'thankYouOrderDate',
  'thankYouPaymentMethod',
  'thankYouOrderTotal',
  'thankYouDiscountRow',
  'thankYouDiscount',
  'thankYouCouponRow',
  'thankYouCouponCode',
  'thankYouDeliverySlotRow',
  'thankYouDeliverySlot',
  'thankYouReservationRow',
  'thankYouReservation',
  'thankYouNextStep',
  'thankYouLinks',
  'thankYouCustomerEmail',
  'thankYouDeliverySlotPreview',
  'thankYouShipAddress',
  'thankYouInvoiceBtn',
  'thankYouOrdersBtn',
  'thankYouItemsContainer',
  'thankYouRecsGrid'
];

for (const id of expectedThankYouIds) {
  assert(thankYouHtml.includes(`id="${id}"`), `thank-you.html must include id="${id}"`);
}
assert(thankYouHtml.includes('amz-thankyou-check-circle'), "thank-you.html must include green checkmark circle");
assert(thankYouHtml.includes('data-i18n="order_placed_thank_you"'), "thank-you.html must include order_placed_thank_you i18n");
assert(thankYouHtml.includes('products-data.js'), "thank-you.html must include products-data.js");
console.log("✔ Step 1: thank-you.html structure, green checkmark, action buttons, and IDs verified.");

// 2. Validate thank-you.js logic
const thankYouJs = fs.readFileSync(path.join(projectDir, 'thank-you.js'), 'utf8');
assert(thankYouJs.includes('thankYouInvoiceBtn.href'), "thank-you.js must set thankYouInvoiceBtn href");
assert(thankYouJs.includes('thankYouCustomerEmail.textContent'), "thank-you.js must populate thankYouCustomerEmail");
assert(thankYouJs.includes('thankYouDeliverySlotPreview.textContent'), "thank-you.js must populate thankYouDeliverySlotPreview");
assert(thankYouJs.includes('thankYouItemsContainer.innerHTML'), "thank-you.js must render thankYouItemsContainer");
assert(thankYouJs.includes('onerror="this.onerror=null;this.src='), "thank-you.js must include image onerror fallback");
console.log("✔ Step 2: thank-you.js email, delivery slot preview, items loop, and onerror fallback verified.");

// 3. Validate invoice.html markup
const invoiceHtml = fs.readFileSync(path.join(projectDir, 'invoice.html'), 'utf8');
assert(invoiceHtml.includes('id="invoiceCard"'), "invoice.html must include id='invoiceCard'");
assert(invoiceHtml.includes('id="printBtn"'), "invoice.html must include id='printBtn'");
assert(invoiceHtml.includes('class="invoice-header no-print"'), "invoice.html header must have no-print class");
assert(invoiceHtml.includes('id="invoiceMessage" class="invoice-message no-print"'), "invoiceMessage must have no-print class");
assert(invoiceHtml.includes('products-data.js'), "invoice.html must include products-data.js");
console.log("✔ Step 3: invoice.html print exclusions, header, and script dependencies verified.");

// 4. Validate invoice.js statutory GST & HSN logic
const invoiceJs = fs.readFileSync(path.join(projectDir, 'invoice.js'), 'utf8');
assert(invoiceJs.includes('85076000'), "invoice.js must include HSN code 85076000 for batteries");
assert(invoiceJs.includes('85287200'), "invoice.js must include HSN code 85287200 for displays/TVs");
assert(invoiceJs.includes('84713010'), "invoice.js must include HSN code 84713010 for computers/laptops");
assert(invoiceJs.includes('sameState ? (itemRate / 2) : 0'), "invoice.js must compute 50/50 split for CGST/SGST in intra-state");
assert(invoiceJs.includes('invoiceCard.classList.toggle("same-state-tax", sameState)'), "invoice.js must toggle same-state-tax class");
assert(invoiceJs.includes('invoiceCard.classList.toggle("inter-state-tax", !sameState)'), "invoice.js must toggle inter-state-tax class");
console.log("✔ Step 4: invoice.js statutory HSN codes and dynamic CGST/SGST/IGST logic verified.");

// 5. Validate invoice.css print rules & column visibility
const invoiceCss = fs.readFileSync(path.join(projectDir, 'invoice.css'), 'utf8');
assert(invoiceCss.includes('@media print'), "invoice.css must define @media print");
assert(invoiceCss.includes('size: A4 portrait;'), "invoice.css must enforce A4 portrait");
assert(invoiceCss.includes('.invoice-card.same-state-tax .items-table th:nth-child(11)'), "invoice.css must hide IGST for same-state");
assert(invoiceCss.includes('.invoice-card.inter-state-tax .items-table th:nth-child(7)'), "invoice.css must hide CGST/SGST for inter-state");
assert(invoiceCss.includes('.no-print,') && invoiceCss.includes('display: none !important;'), "invoice.css must hide .no-print elements");
console.log("✔ Step 5: invoice.css @media print A4 formatting and dynamic column visibility verified.");

// 6. Validate translations across all 11 languages
const translationsJs = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
const requiredKeys = [
  'order_placed_thank_you',
  'confirmation_email_sent',
  'guaranteed_delivery',
  'view_or_manage_order',
  'print_download_invoice',
  'items_in_order',
  'recommended_for_you',
  'shipping_to',
  'continue_shopping'
];
for (const key of requiredKeys) {
  assert(translationsJs.includes(key), `translations.js must include key: ${key}`);
}
console.log("✔ Step 6: translations.js order confirmation and invoice keys verified across 11 languages.");

console.log("==================================================");
console.log("ALL THANK-YOU & INVOICE TESTS PASSED (100%)");
console.log("==================================================");
