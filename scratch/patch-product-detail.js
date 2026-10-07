const fs = require('fs');
const path = require('path');

const filePath = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store', 'product-detail.js');
let code = fs.readFileSync(filePath, 'utf8');

// Detect line ending
const isCRLF = code.includes('\r\n');
const newline = isCRLF ? '\r\n' : '\n';

// Normalize to \n for reliable search/replace
let normalized = code.replace(/\r\n/g, '\n');

// 1. Selector for wishlistBtn
const oldSelector = 'const wishlistBtn = document.getElementById("wishlistBtn");';
const newSelector = 'const wishlistBtn = document.getElementById("saveWishlistBtn") || document.getElementById("wishlistBtn");\nconst saveWishlistBtn = wishlistBtn;';
if (!normalized.includes(oldSelector)) {
  console.error("Could not find oldSelector!");
} else {
  normalized = normalized.replace(oldSelector, newSelector);
  console.log("Replaced selector successfully");
}

// 2. renderOffers
const oldOffers = `function renderOffers(price, listPrice, category) {
  if (!offersBlock || !offersGrid) {
    return;
  }
  const savings = Math.max(0, Number(listPrice) - Number(price));
  const offers = [
    {
      title: "Bank Offer",
      text: savings > 0
        ? \`Extra 5% cashback with partner cards on orders above \${money(Math.max(1999, price))}.\`
        : "Flat 5% cashback with selected credit cards."
    },
    {
      title: "No Cost EMI",
      text: \`EMI starts from \${money(Math.max(299, Math.round(price / 24)))} per month.\`
    },
    {
      title: "Exchange Offer",
      text: \`Exchange your old \${category} and get up to \${money(Math.round(price * 0.18))} off.\`
    },
    {
      title: "Partner Offer",
      text: "GST invoice available and business purchase support."
    }
  ];
  offersGrid.innerHTML = offers.map((item) => \`
    <article class="offer-item">
      <h3>\${escapeHtml(item.title)}</h3>
      <p>\${escapeHtml(item.text)}</p>
    </article>
  \`).join("");
  offersBlock.hidden = false;
}`;

const newOffers = `function renderOffers(price, listPrice, category) {
  if (!offersBlock || !offersGrid) {
    return;
  }
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : {};
  const savings = Math.max(0, Number(listPrice) - Number(price));
  const offers = [
    {
      key: "sub_bank_offer",
      title: t.sub_bank_offer || "Bank Offer",
      text: savings > 0
        ? \`Extra 5% cashback with partner cards on orders above \${money(Math.max(1999, price))}.\`
        : "Flat 5% cashback with selected credit cards."
    },
    {
      key: "sub_no_cost_emi",
      title: t.sub_no_cost_emi || "No Cost EMI",
      text: \`EMI starts from \${money(Math.max(299, Math.round(price / 24)))} per month.\`
    },
    {
      key: "sub_exchange_offer",
      title: t.sub_exchange_offer || "Exchange Offer",
      text: \`Exchange your old \${category} and get up to \${money(Math.round(price * 0.18))} off.\`
    },
    {
      key: "sub_partner_offer",
      title: t.sub_partner_offer || "Partner Offer",
      text: "GST invoice available and business purchase support."
    }
  ];
  offersGrid.innerHTML = offers.map((item) => \`
    <article class="offer-item">
      <h3 data-i18n="\${item.key}">\${escapeHtml(item.title)}</h3>
      <p>\${escapeHtml(item.text)}</p>
    </article>
  \`).join("");
  offersBlock.hidden = false;
}`;

if (!normalized.includes(oldOffers)) {
  console.error("Could not find oldOffers!");
} else {
  normalized = normalized.replace(oldOffers, newOffers);
  console.log("Replaced renderOffers successfully");
}

// 3. renderServices
const oldServices = `function renderServices(product, isInStock) {
  if (!servicesBlock || !serviceDeliveryText || !serviceReturnText || !serviceWarrantyText || !serviceSellerText) {
    return;
  }
  const categoryFamily = getProductCategoryFamily(product);
  serviceDeliveryText.textContent = isInStock
    ? "FREE delivery by tomorrow in select cities."
    : "Delivery date will be shown after stock update.";
  serviceReturnText.textContent = "7-day replacement, no-questions-asked for defective items.";
  serviceWarrantyText.textContent = categoryFamily === "laptop" || categoryFamily === "computer"
    ? "1 Year manufacturer warranty + service center support."
    : "6 Months to 1 Year standard brand warranty.";
  serviceSellerText.textContent = \`\${product.brand} Authorized Seller | GST invoice available.\`;
  servicesBlock.hidden = false;
}`;

const newServices = `function renderServices(product, isInStock) {
  if (!servicesBlock || !serviceDeliveryText || !serviceReturnText || !serviceWarrantyText || !serviceSellerText) {
    return;
  }
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : {};
  const categoryFamily = getProductCategoryFamily(product);

  const deliveryH3 = servicesBlock.querySelector('[data-i18n="sub_delivery"]') || servicesBlock.querySelectorAll(".service-item h3")[0];
  const returnsH3 = servicesBlock.querySelector('[data-i18n="sub_returns"]') || servicesBlock.querySelectorAll(".service-item h3")[1];
  const warrantyH3 = servicesBlock.querySelector('[data-i18n="sub_warranty"]') || servicesBlock.querySelectorAll(".service-item h3")[2];
  const sellerH3 = servicesBlock.querySelector('[data-i18n="sub_seller"]') || servicesBlock.querySelectorAll(".service-item h3")[3];

  if (deliveryH3) deliveryH3.textContent = t.sub_delivery || "Delivery";
  if (returnsH3) returnsH3.textContent = t.sub_returns || "Returns";
  if (warrantyH3) warrantyH3.textContent = t.sub_warranty || "Warranty";
  if (sellerH3) sellerH3.textContent = t.sub_seller || "Seller";

  serviceDeliveryText.textContent = isInStock
    ? "FREE delivery by tomorrow in select cities."
    : "Delivery date will be shown after stock update.";
  serviceReturnText.textContent = "7-day replacement, no-questions-asked for defective items.";
  serviceWarrantyText.textContent = categoryFamily === "laptop" || categoryFamily === "computer"
    ? "1 Year manufacturer warranty + service center support."
    : "6 Months to 1 Year standard brand warranty.";
  serviceSellerText.textContent = \`\${product.brand} Authorized Seller | GST invoice available.\`;
  servicesBlock.hidden = false;
}`;

if (!normalized.includes(oldServices)) {
  console.error("Could not find oldServices!");
} else {
  normalized = normalized.replace(oldServices, newServices);
  console.log("Replaced renderServices successfully");
}

// 4. syncWishlistButton
const oldSyncWish = `function syncWishlistButton(productId) {
  if (!wishlistBtn) {
    return;
  }
  const active = isWishlisted(productId);
  wishlistBtn.classList.toggle("active", active);
  wishlistBtn.textContent = active ? "Wishlisted" : "Save to Wishlist";
  wishlistBtn.setAttribute("data-id", String(productId || ""));
}`;

const newSyncWish = `function syncWishlistButton(productId) {
  const targetWishlistBtn = document.getElementById("saveWishlistBtn") || wishlistBtn;
  if (!targetWishlistBtn) {
    return;
  }
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : {};
  const active = isWishlisted(productId);
  targetWishlistBtn.classList.toggle("active", active);
  targetWishlistBtn.textContent = active ? (t.wishlisted || "Wishlisted") : (t.save_to_wishlist || "Save to Wishlist");
  targetWishlistBtn.setAttribute("data-id", String(productId || ""));
}`;

if (!normalized.includes(oldSyncWish)) {
  console.error("Could not find oldSyncWish!");
} else {
  normalized = normalized.replace(oldSyncWish, newSyncWish);
  console.log("Replaced syncWishlistButton successfully");
}

// 5. availabilityText in renderProduct
const oldAvail = `  availabilityText.textContent = isInStock
    ? (product.segment === "b2c" ? "In Stock" : "In Stock for business orders")
    : "Currently unavailable";`;

const newAvail = `  availabilityText.textContent = isInStock
    ? (product.segment === "b2c" ? (t.in_stock || "In Stock") : \`\${t.in_stock || "In Stock"} (B2B)\`)
    : (t.out_of_stock || "Currently unavailable");
  const stockEl = document.querySelector(".stock-status");
  if (stockEl && isInStock) {
    stockEl.textContent = t.in_stock || "In Stock";
  }`;

if (!normalized.includes(oldAvail)) {
  console.error("Could not find oldAvail!");
} else {
  normalized = normalized.replace(oldAvail, newAvail);
  console.log("Replaced availabilityText successfully");
}

// 6. wishlistBtn in renderProduct
const oldWishBtn = `  if (wishlistBtn) wishlistBtn.textContent = t.save_to_wishlist || "Save to Wishlist";`;
const newWishBtn = `  const targetWishlistBtn = document.getElementById("saveWishlistBtn") || wishlistBtn;
  if (targetWishlistBtn) {
    const active = isWishlisted(product.id);
    targetWishlistBtn.textContent = active ? (t.wishlisted || "Wishlisted") : (t.save_to_wishlist || "Save to Wishlist");
  }`;

if (!normalized.includes(oldWishBtn)) {
  console.error("Could not find oldWishBtn!");
} else {
  normalized = normalized.replace(oldWishBtn, newWishBtn);
  console.log("Replaced wishlistBtn in renderProduct successfully");
}

// Convert back to CRLF if needed
const finalCode = isCRLF ? normalized.replace(/\n/g, '\r\n') : normalized;
fs.writeFileSync(filePath, finalCode, 'utf8');
console.log("Successfully patched product-detail.js");
