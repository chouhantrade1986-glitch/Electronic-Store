const fs = require('fs');

let js = fs.readFileSync('product-detail.js', 'utf8');

// 1. Add renderAmazonPrice function before renderOffers
const renderAmazonPriceFn = `function renderAmazonPrice(product, priceVal, listPriceVal, discountVal, trans) {
  if (!product) return;
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "hi").toLowerCase();
  const t = trans || ((window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : {});
  
  const price = priceVal != null ? Number(priceVal) : Number(product.price || 0);
  const listPrice = listPriceVal != null ? Number(listPriceVal) : Number(product.listPrice || product.mrp || product.price || 0);
  const discount = discountVal != null ? Number(discountVal) : (listPrice > price ? Math.round(((listPrice - price) / listPrice) * 100) : 0);

  // 1. Deal Badge (Lightning Deal)
  const dealBadge = document.getElementById("dealBadgePill") || document.querySelector(".deal-badge-pill");
  if (dealBadge) {
    if (discount > 0 || product.featured) {
      dealBadge.textContent = t.lightning_deal || "लाइटनिंग डील";
      dealBadge.style.display = "inline-block";
    } else {
      dealBadge.style.display = "none";
    }
  }

  // 2. Discount percentage (-33% / -20% in bold red)
  const discountEl = document.getElementById("productDiscountPercent");
  if (discountEl) {
    if (discount > 0) {
      discountEl.textContent = \`-\${discount}%\`;
      discountEl.style.display = "inline";
    } else {
      discountEl.style.display = "none";
    }
  }

  // 3. Main price and optional fraction
  const mainPriceEl = document.getElementById("productMainPrice");
  if (mainPriceEl) {
    mainPriceEl.textContent = Math.floor(price).toLocaleString("en-IN");
  }

  const fractionEl = document.getElementById("productPriceFraction") || document.querySelector(".price-fraction");
  if (fractionEl) {
    const fraction = price % 1 !== 0 ? (price % 1).toFixed(2).slice(2) : "";
    fractionEl.textContent = fraction;
  }

  // 4. MRP strikethrough & Tax inclusive
  const mrpEl = document.getElementById("productMrpPrice");
  const mrpTaxRow = document.getElementById("mrpTaxRow") || document.querySelector(".mrp-tax-row");
  if (mrpEl) {
    if (listPrice > price) {
      mrpEl.textContent = \`₹\${Math.floor(listPrice).toLocaleString("en-IN")}\`;
      mrpEl.style.display = "inline";
      if (mrpTaxRow) {
        const mrpLabel = mrpTaxRow.querySelector(".mrp-label");
        if (mrpLabel) mrpLabel.style.display = "inline";
      }
    } else {
      mrpEl.style.display = "none";
      if (mrpTaxRow) {
        const mrpLabel = mrpTaxRow.querySelector(".mrp-label");
        if (mrpLabel) mrpLabel.style.display = "none";
      }
    }
  }

  const taxInclusive = document.querySelector(".tax-inclusive");
  if (taxInclusive) {
    taxInclusive.textContent = t.inclusive_all_taxes || "सभी टैक्स सहित";
  }
}
window.renderAmazonPrice = renderAmazonPrice;

`;

if (!js.includes('function renderAmazonPrice(')) {
  js = js.replace('function renderOffers(price, listPrice, category) {', renderAmazonPriceFn + 'function renderOffers(price, listPrice, category) {');
}

// 2. In renderProduct: call renderAmazonPrice and clear productDealMeta
const oldDealMetaCall = `productDealMeta.textContent = discountPercent > 0 ? \`\${t.you_save || "You save"} \${money(listPrice - price)} (\${discountPercent}% off)\` : "Everyday low price";`;
const newDealMetaCall = `if (productDealMeta) {
    productDealMeta.textContent = "";
    productDealMeta.style.display = "none";
  }
  renderAmazonPrice(product, price, listPrice, discountPercent, t);`;

if (js.includes(oldDealMetaCall)) {
  js = js.replace(oldDealMetaCall, newDealMetaCall);
}

// 3. Update languageChanged event listener
const oldLangChanged = `window.addEventListener("languageChanged", () => {
  if (typeof localizeBatterySpecs === "function") {
    localizeBatterySpecs();
  }
});`;

const newLangChanged = `window.addEventListener("languageChanged", () => {
  const currentProd = window.currentLoadedProduct || (typeof activeRenderedProduct !== "undefined" ? activeRenderedProduct : null);
  if (currentProd && typeof renderAmazonPrice === "function") {
    renderAmazonPrice(currentProd);
  }
  if (typeof localizeBatterySpecs === "function") {
    localizeBatterySpecs();
  }
});`;

if (js.includes(oldLangChanged)) {
  js = js.replace(oldLangChanged, newLangChanged);
}

fs.writeFileSync('product-detail.js', js, 'utf8');
console.log('product-detail.js updated with renderAmazonPrice successfully!');
