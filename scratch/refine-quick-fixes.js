const fs = require('fs');
const path = require('path');

const repoRoot = "C:\\Users\\Admin\\Documents\\GitHub\\Electronic-Store";

// 1. Refine translations.js Hindi exact strings
const transPath = path.join(repoRoot, 'translations.js');
let transContent = fs.readFileSync(transPath, 'utf8');

// Update Hindi strings in translations.js
const hiReplacements = [
  ['"partner_card_cashback": "पार्टनर कार्ड के साथ अतिरिक्त 5% कैशबैक."', '"partner_card_cashback": "पार्टनर कार्ड पर अतिरिक्त 5% कैशबैक"'],
  ['"warranty_subtext": "1 वर्ष की निर्माता वारंटी + सेवा केंद्र सहायता."', '"warranty_subtext": "1 वर्ष की निर्माता वारंटी"'],
  ['"free_delivery_subtext": "चुनिंदा शहरों में कल तक मुफ़्त डिलीवरी."', '"free_delivery_subtext": "चुनिंदा शहरों में कल तक मुफ़्त डिलीवरी"'],
  ['"return_subtext": "7 दिनों का रिप्लेसमेंट, बिना किसी सवाल के."', '"return_subtext": "7 दिनों में आसान रिप्लेसमेंट"'],
  ['"seller_subtext": "अधिकृत सेलर | जीएसटी इनवॉइस उपलब्ध."', '"seller_subtext": "अधिकृत विक्रेता एवं जीएसटी चालान उपलब्ध"']
];

for (const [target, repl] of hiReplacements) {
  if (transContent.includes(target)) {
    transContent = transContent.replace(target, repl);
    console.log(`Updated translations.js: ${target.slice(0, 30)}...`);
  }
}
fs.writeFileSync(transPath, transContent, 'utf8');

// 2. Refine product-detail.js
const prodDetailPath = path.join(repoRoot, 'product-detail.js');
let prodDetailContent = fs.readFileSync(prodDetailPath, 'utf8');

// Fix window.renderProductDetailPage so it handles language string argument gracefully
prodDetailContent = prodDetailContent.replace(
  'const target = prod || window.currentLoadedProduct || activeRenderedProduct;',
  'const target = (prod && typeof prod === "object") ? prod : (window.currentLoadedProduct || activeRenderedProduct);'
);

// Replace default fallback 'en' with 'hi' in product-detail.js
prodDetailContent = prodDetailContent.replace(
  /localStorage\.getItem\("electromart_lang"\) \|\| "en"/g,
  'localStorage.getItem("electromart_lang") || "hi"'
);

// In renderServices, ensure serviceSellerText and fallback texts are polished
prodDetailContent = prodDetailContent.replace(
  'serviceDeliveryText.textContent = isInStock\n    ? (t.free_delivery_subtext || "FREE delivery by tomorrow in select cities.")',
  'serviceDeliveryText.textContent = isInStock\n    ? (t.free_delivery_subtext || "चुनिंदा शहरों में कल तक मुफ़्त डिलीवरी")'
);

prodDetailContent = prodDetailContent.replace(
  'serviceReturnText.textContent = t.return_subtext || "7-day replacement, no-questions-asked for defective items.";',
  'serviceReturnText.textContent = t.return_subtext || "7 दिनों में आसान रिप्लेसमेंट";'
);

prodDetailContent = prodDetailContent.replace(
  'serviceWarrantyText.textContent = (categoryFamily === "laptop" || categoryFamily === "computer")\n    ? (t.warranty_subtext || "1 Year manufacturer warranty + service center support.")\n    : (t.warranty_std_subtext || "6 Months to 1 Year standard brand warranty.");',
  'serviceWarrantyText.textContent = (categoryFamily === "laptop" || categoryFamily === "computer")\n    ? (t.warranty_subtext || "1 वर्ष की निर्माता वारंटी")\n    : (t.warranty_std_subtext || t.warranty_subtext || "1 वर्ष की निर्माता वारंटी");'
);

prodDetailContent = prodDetailContent.replace(
  'serviceSellerText.textContent = `${product.brand} ${t.seller_subtext || "Authorized Seller | GST invoice available."}`;',
  'serviceSellerText.textContent = `${product.brand ? product.brand + " " : ""}${t.seller_subtext || "अधिकृत विक्रेता एवं जीएसटी चालान उपलब्ध"}`;'
);

// In initProductPage, apply language state directly after loading product
if (!prodDetailContent.includes('const currentLang = localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "hi";\n  if (typeof applyFullPageTranslation === "function") {\n    applyFullPageTranslation(currentLang);\n  }\n  renderProduct(selectedProduct);')) {
  prodDetailContent = prodDetailContent.replace(
    'window.currentLoadedProduct = selectedProduct;\n  renderProduct(selectedProduct);',
    'window.currentLoadedProduct = selectedProduct;\n  const currentLang = localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "hi";\n  if (typeof applyFullPageTranslation === "function") {\n    applyFullPageTranslation(currentLang);\n  }\n  renderProduct(selectedProduct);'
  );
}

fs.writeFileSync(prodDetailPath, prodDetailContent, 'utf8');
console.log('Successfully polished product-detail.js and translations.js!');
