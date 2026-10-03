const fs = require('fs');
const path = require('path');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');

// 1. New/Updated keys for all 11 languages
const SUBCARDS_I18N = {
  en: {
    save_to_wishlist: "Save to Wishlist",
    wishlisted: "Wishlisted",
    in_stock: "In Stock",
    sub_bank_offer: "Bank Offer",
    sub_no_cost_emi: "No Cost EMI",
    sub_exchange_offer: "Exchange Offer",
    sub_partner_offer: "Partner Offer",
    sub_delivery: "Delivery",
    sub_returns: "Returns",
    sub_warranty: "Warranty",
    sub_seller: "Seller"
  },
  hi: {
    save_to_wishlist: "विशलिस्ट में सहेजें",
    wishlisted: "विशलिस्ट में सहेजा गया",
    in_stock: "स्टॉक में उपलब्ध",
    sub_bank_offer: "बैंक ऑफ़र",
    sub_no_cost_emi: "नो कॉस्ट ईएमआई",
    sub_exchange_offer: "एक्सचेंज ऑफ़र",
    sub_partner_offer: "पार्टनर ऑफ़र",
    sub_delivery: "डिलीवरी",
    sub_returns: "वापसी",
    sub_warranty: "वारंटी",
    sub_seller: "विक्रेता"
  },
  ta: {
    save_to_wishlist: "விருப்பப்பட்டியலில் சேமிக்கவும்",
    wishlisted: "விருப்பப்பட்டியலில் சேர்க்கப்பட்டது",
    in_stock: "கையிருப்பில் உள்ளது",
    sub_bank_offer: "வங்கி சலுகை",
    sub_no_cost_emi: "நோ காஸ்ட் இஎம்ஐ",
    sub_exchange_offer: "பரிமாற்ற சலுகை",
    sub_partner_offer: "கூட்டாளர் சலுகை",
    sub_delivery: "டெலிவரி",
    sub_returns: "திருப்பி அனுப்புதல்",
    sub_warranty: "உத்தரவாதம்",
    sub_seller: "விற்பனையாளர்"
  },
  te: {
    save_to_wishlist: "విష్‌లిస్ట్‌లో భద్రపరచండి",
    wishlisted: "విష్‌లిస్ట్‌లో చేర్చబడింది",
    in_stock: "స్టాక్‌లో ఉంది",
    sub_bank_offer: "బ్యాంక్ ఆఫర్",
    sub_no_cost_emi: "నో కాస్ట్ ఈఎంఐ",
    sub_exchange_offer: "ఎక్స్ఛేంజ్ ఆఫర్",
    sub_partner_offer: "భాగస్వామి ఆఫర్",
    sub_delivery: "డెలివరీ",
    sub_returns: "రిటర్న్స్",
    sub_warranty: "వారంటీ",
    sub_seller: "విక్రేత"
  },
  kn: {
    save_to_wishlist: "ವಿಶ್‌ಲಿಸ್ಟ್‌ನಲ್ಲಿ ಉಳಿಸಿ",
    wishlisted: "ವಿಶ್‌ಲಿಸ್ಟ್‌ನಲ್ಲಿ ಸೇರಿಸಲಾಗಿದೆ",
    in_stock: "ದಾಸ್ತಾನು ಲಭ್ಯವಿದೆ",
    sub_bank_offer: "ಬ್ಯಾಂಕ್ ಆಫರ್",
    sub_no_cost_emi: "ನೋ ಕಾಸ್ಟ್ ಇಎಂಐ",
    sub_exchange_offer: "ಎಕ್ಸ್‌ಚೇಂಜ್ ಆಫರ್",
    sub_partner_offer: "ಪಾಲುದಾರ ಆಫರ್",
    sub_delivery: "ಡೆಲಿವರಿ",
    sub_returns: "ರಿಟರ್ನ್ಸ್",
    sub_warranty: "ವಾರಂಟಿ",
    sub_seller: "ಮಾರಾಟಗಾರ"
  },
  ml: {
    save_to_wishlist: "വിഷ്‌ലിസ്റ്റിൽ സംരക്ഷിക്കുക",
    wishlisted: "വിഷ്‌ലിസ്റ്റിൽ ചേർത്തു",
    in_stock: "സ്റ്റോക്കുണ്ട്",
    sub_bank_offer: "ബാങ്ക് ഓഫർ",
    sub_no_cost_emi: "നോ കോസ്റ്റ് ഇഎംഐ",
    sub_exchange_offer: "എക്സ്ചേഞ്ച് ഓഫർ",
    sub_partner_offer: "പാർട്ണർ ഓഫർ",
    sub_delivery: "ഡെലിവറി",
    sub_returns: "റിട്ടേൺസ്",
    sub_warranty: "വാറന്റി",
    sub_seller: "വിൽപ്പനക്കാരൻ"
  },
  bn: {
    save_to_wishlist: "উইশলিস্টে সংরক্ষণ করুন",
    wishlisted: "উইশলিস্টে যুক্ত হয়েছে",
    in_stock: "স্টকে উপলব্ধ",
    sub_bank_offer: "ব্যাঙ্ক অফার",
    sub_no_cost_emi: "নো কস্ট ইএমআই",
    sub_exchange_offer: "এক্সচেঞ্জ অফার",
    sub_partner_offer: "পার্টনার অফার",
    sub_delivery: "ডেলিভারি",
    sub_returns: "ফেরত",
    sub_warranty: "ওয়ারেন্টি",
    sub_seller: "বিক্রেতা"
  },
  mr: {
    save_to_wishlist: "विशलिस्टमध्ये जतन करा",
    wishlisted: "विशलिस्टमध्ये जोडले",
    in_stock: "स्टॉकमध्ये उपलब्ध",
    sub_bank_offer: "बँक ऑफर",
    sub_no_cost_emi: "नो कॉस्ट ईएमआय",
    sub_exchange_offer: "एक्सचेंज ऑफर",
    sub_partner_offer: "पार्टनर ऑफर",
    sub_delivery: "डिलिव्हरी",
    sub_returns: "परतावा",
    sub_warranty: "वारंटी",
    sub_seller: "विक्रेता"
  },
  ur: {
    save_to_wishlist: "خواہشات کی فہرست میں محفوظ کریں",
    wishlisted: "خواہشات کی فہرست میں شامل کیا گیا",
    in_stock: "اسٹاک میں دستیاب ہے",
    sub_bank_offer: "بینک آفر",
    sub_no_cost_emi: "نو کاسٹ ای ایم آئی",
    sub_exchange_offer: "ایکسچینج آفر",
    sub_partner_offer: "پارٹنر آفر",
    sub_delivery: "ڈیلیوری",
    sub_returns: "واپسی",
    sub_warranty: "وارنٹی",
    sub_seller: "بیچنے والا"
  },
  pa: {
    save_to_wishlist: "ਵਿਸ਼ਲਿਸਟ ਵਿੱਚ ਸੰਭਾਲੋ",
    wishlisted: "ਵਿਸ਼ਲਿਸਟ ਵਿੱਚ ਸ਼ਾਮਲ ਕੀਤਾ",
    in_stock: "ਸਟਾਕ ਵਿੱਚ ਉਪਲਬਧ",
    sub_bank_offer: "ਬੈਂਕ ਆਫ਼ਰ",
    sub_no_cost_emi: "ਨੋ ਕਾਸਟ ਈਐਮਆਈ",
    sub_exchange_offer: "ਐਕਸਚੇਂਜ ਆਫ਼ਰ",
    sub_partner_offer: "ਪਾਰਟਨਰ ਆਫ਼ਰ",
    sub_delivery: "ਡਿਲਿਵਰੀ",
    sub_returns: "ਵਾਪਸੀ",
    sub_warranty: "ਵਾਰੰਟੀ",
    sub_seller: "ਵਿਕਰੇਤਾ"
  },
  gu: {
    save_to_wishlist: "વિશલિસ્ટમાં સાચવો",
    wishlisted: "વિશલિસ્ટમાં ઉમેર્યું",
    in_stock: "સ્ટોકમાં ઉપલબ્ધ",
    sub_bank_offer: "બેંક ઑફર",
    sub_no_cost_emi: "નો કોસ્ટ ઇએમઆઇ",
    sub_exchange_offer: "એક્સચેન્જ ઑફર",
    sub_partner_offer: "પાર્ટનર ઑફર",
    sub_delivery: "ડિલિવરી",
    sub_returns: "પરત",
    sub_warranty: "વોરંટી",
    sub_seller: "વિક્રેતા"
  }
};

// 2. Update translations.js
const transPath = path.join(projectDir, 'translations.js');
let transContent = fs.readFileSync(transPath, 'utf8');

// Parse out translations object in JS execution sandbox or via regex
const vm = require('vm');
const sandbox = { window: {}, document: { addEventListener: () => {} } };
vm.createContext(sandbox);

// Safely modify translations.js by injecting keys before each lang closing brace or merging
Object.keys(SUBCARDS_I18N).forEach((lang) => {
  const keys = SUBCARDS_I18N[lang];
  // Regex to find `${lang}: {` block
  const langRegex = new RegExp(`(\\b${lang}:\\s*\\{[\\s\\S]*?\\n\\s*\\})`);
  const match = transContent.match(langRegex);
  if (match) {
    let block = match[1];
    // Update or insert each key
    Object.keys(keys).forEach((k) => {
      const val = keys[k];
      const keyRegex = new RegExp(`(["']?${k}["']?\\s*:\\s*)(["'][\\s\\S]*?["'])`);
      if (keyRegex.test(block)) {
        block = block.replace(keyRegex, `$1${JSON.stringify(val)}`);
      } else {
        // Insert right before closing }
        block = block.replace(/(\n\s*)\}$/, `,\n      ${JSON.stringify(k)}: ${JSON.stringify(val)}$1}`);
      }
    });
    transContent = transContent.replace(match[1], block);
  }
});

fs.writeFileSync(transPath, transContent, 'utf8');
console.log('Successfully updated translations.js with all subcard, wishlist, and in_stock keys across 11 languages!');

// 3. Update product-detail.html
const htmlPath = path.join(projectDir, 'product-detail.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Update availabilityText to have stock-status and data-i18n
htmlContent = htmlContent.replace(
  /<p id="availabilityText" class="availability in-stock"><\/p>/,
  '<p id="availabilityText" class="availability in-stock stock-status" data-i18n="in_stock"></p>'
);

// Update wishlistBtn to support saveWishlistBtn as well
htmlContent = htmlContent.replace(
  /<button id="wishlistBtn" type="button" class="secondary-btn" data-i18n="save_to_wishlist">Save to Wishlist<\/button>/,
  '<button id="saveWishlistBtn" type="button" class="secondary-btn wishlist-btn" data-i18n="save_to_wishlist">Save to Wishlist</button>'
);

// Update servicesBlock h3 headings to have data-i18n
htmlContent = htmlContent.replace(
  /<article class="service-item">\s*<h3>Delivery<\/h3>/,
  '<article class="service-item">\n          <h3 data-i18n="sub_delivery">Delivery</h3>'
);
htmlContent = htmlContent.replace(
  /<article class="service-item">\s*<h3>Returns<\/h3>/,
  '<article class="service-item">\n          <h3 data-i18n="sub_returns">Returns</h3>'
);
htmlContent = htmlContent.replace(
  /<article class="service-item">\s*<h3>Warranty<\/h3>/,
  '<article class="service-item">\n          <h3 data-i18n="sub_warranty">Warranty</h3>'
);
htmlContent = htmlContent.replace(
  /<article class="service-item">\s*<h3>Seller<\/h3>/,
  '<article class="service-item">\n          <h3 data-i18n="sub_seller">Seller</h3>'
);

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('Successfully updated product-detail.html with data-i18n and IDs!');

// 4. Update product-detail.js
const jsPath = path.join(projectDir, 'product-detail.js');
let jsContent = fs.readFileSync(jsPath, 'utf8');

// Ensure wishlistBtn selector looks for saveWishlistBtn first or wishlistBtn
jsContent = jsContent.replace(
  /const wishlistBtn = document\.getElementById\("wishlistBtn"\);/,
  'const wishlistBtn = document.getElementById("saveWishlistBtn") || document.getElementById("wishlistBtn");\nconst saveWishlistBtn = wishlistBtn;'
);

// Update syncWishlistButton to use localized text
jsContent = jsContent.replace(
  /function syncWishlistButton\(productId\) \{[\s\S]*?wishlistBtn\.textContent = active \? "Wishlisted" : "Save to Wishlist";[\s\S]*?\}/,
  `function syncWishlistButton(productId) {
  if (!wishlistBtn) {
    return;
  }
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : {};
  const active = isWishlisted(productId);
  wishlistBtn.classList.toggle("active", active);
  wishlistBtn.textContent = active ? (t.wishlisted || "Wishlisted") : (t.save_to_wishlist || "Save to Wishlist");
  wishlistBtn.setAttribute("data-id", String(productId || ""));
}`
);

// Update renderOffers to use localized titles and data-i18n
jsContent = jsContent.replace(
  /function renderOffers\(price, listPrice, category\) \{[\s\S]*?offersGrid\.innerHTML = offers\.map\(\(item\) => `[\s\S]*?<h3>\$\{escapeHtml\(item\.title\)\}<\/h3>[\s\S]*?\}\.join\(""\);[\s\S]*?offersBlock\.hidden = false;\s*\}/,
  `function renderOffers(price, listPrice, category) {
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
}`
);

// Update renderServices to bind localized headings
jsContent = jsContent.replace(
  /function renderServices\(product, isInStock\) \{[\s\S]*?serviceSellerText\.textContent = `\$\{product\.brand\} Authorized Seller \| GST invoice available\.`;\s*servicesBlock\.hidden = false;\s*\}/,
  `function renderServices(product, isInStock) {
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
}`
);

// Update renderProduct to bind wishlist button and in_stock text
jsContent = jsContent.replace(
  /availabilityText\.textContent = isInStock[\s\S]*?: "Currently unavailable";/,
  `availabilityText.textContent = isInStock
    ? (product.segment === "b2c" ? (t.in_stock || "In Stock") : \`\${t.in_stock || "In Stock"} (B2B)\`)
    : (t.out_of_stock || "Currently unavailable");
  const stockEl = document.querySelector(".stock-status");
  if (stockEl && isInStock) {
    stockEl.textContent = t.in_stock || "In Stock";
  }`
);

// Ensure wishlistBtn binding in renderProduct
jsContent = jsContent.replace(
  /if \(wishlistBtn\) wishlistBtn\.textContent = t\.save_to_wishlist \|\| "Save to Wishlist";/,
  `const targetWishlistBtn = document.getElementById("saveWishlistBtn") || wishlistBtn;
  if (targetWishlistBtn) {
    const active = isWishlisted(product.id);
    targetWishlistBtn.textContent = active ? (t.wishlisted || "Wishlisted") : (t.save_to_wishlist || "Save to Wishlist");
  }`
);

fs.writeFileSync(jsPath, jsContent, 'utf8');
console.log('Successfully updated product-detail.js with responsive subcards and stock/wishlist bindings!');
