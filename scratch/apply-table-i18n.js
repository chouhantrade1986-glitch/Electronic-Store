const fs = require('fs');
const path = require('path');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');

// 1. New keys for Product Info Table and Values across all 11 languages
const TABLE_I18N = {
  en: {
    tbl_sku: "SKU",
    tbl_brand: "Brand",
    tbl_category: "Category",
    tbl_segment: "Segment",
    tbl_price: "Price",
    tbl_mrp: "MRP",
    tbl_stock: "Stock",
    tbl_status: "Status",
    tbl_fulfillment: "Fulfillment",
    tbl_moq: "MOQ",
    tbl_featured: "Featured",
    tbl_keywords: "Keywords",
    tbl_rating: "Rating",
    val_active: "ACTIVE",
    val_inactive: "INACTIVE",
    val_yes: "Yes",
    val_no: "No",
    val_available: "Available"
  },
  hi: {
    tbl_sku: "एसकेयू (SKU)",
    tbl_brand: "ब्रांड",
    tbl_category: "श्रेणी",
    tbl_segment: "सेगमेंट",
    tbl_price: "कीमत",
    tbl_mrp: "एम.आर.पी.",
    tbl_stock: "उपलब्ध स्टॉक",
    tbl_status: "स्थिति",
    tbl_fulfillment: "फुलफिलमेंट",
    tbl_moq: "न्यूनतम ऑर्डर मात्रा (MOQ)",
    tbl_featured: "विशेष रुप से प्रदर्शित",
    tbl_keywords: "कीवर्ड्स",
    tbl_rating: "रेटिंग",
    val_active: "सक्रिय",
    val_inactive: "निष्क्रिय",
    val_yes: "हाँ",
    val_no: "नहीं",
    val_available: "उपलब्ध"
  },
  ta: {
    tbl_sku: "எஸ்கேயூ (SKU)",
    tbl_brand: "பிராண்ட்",
    tbl_category: "வகை",
    tbl_segment: "பிரிவு",
    tbl_price: "விலை",
    tbl_mrp: "அதிகபட்ச சில்லறை விலை (MRP)",
    tbl_stock: "இருப்பு",
    tbl_status: "நிலை",
    tbl_fulfillment: "நிறைவேற்றம்",
    tbl_moq: "குறைந்தபட்ச ஆர்டர் அளவு (MOQ)",
    tbl_featured: "சிறப்பு அம்சம்",
    tbl_keywords: "முக்கிய வார்த்தைகள்",
    tbl_rating: "மதிப்பீடு",
    val_active: "செயலில் உள்ளது",
    val_inactive: "செயலற்றது",
    val_yes: "ஆம்",
    val_no: "இல்லை",
    val_available: "கிடைக்கும்"
  },
  te: {
    tbl_sku: "ఎస్‌కేయూ (SKU)",
    tbl_brand: "బ్రాండ్",
    tbl_category: "వర్గం",
    tbl_segment: "విభాగం",
    tbl_price: "ధర",
    tbl_mrp: "ఎం.ఆర్.పి.",
    tbl_stock: "స్టాక్",
    tbl_status: "స్థితి",
    tbl_fulfillment: "నెరవేర్పు",
    tbl_moq: "కనిష్ట ఆర్డర్ పరిమాణం (MOQ)",
    tbl_featured: "ఫీచర్ చేయబడింది",
    tbl_keywords: "కీవర్డ్‌లు",
    tbl_rating: "రేటింగ్",
    val_active: "క్రియాశీల",
    val_inactive: "నిష్క్రియాత్మక",
    val_yes: "అవును",
    val_no: "కాదు",
    val_available: "అందుబాటులో ఉంది"
  },
  kn: {
    tbl_sku: "ಎಸ್‌ಕೆಯು (SKU)",
    tbl_brand: "ಬ್ರ್ಯಾಂಡ್",
    tbl_category: "ವರ್ಗ",
    tbl_segment: "ವಿಭಾಗ",
    tbl_price: "ಬೆಲೆ",
    tbl_mrp: "ಎಂ.ಆರ್.ಪಿ.",
    tbl_stock: "ದಾಸ್ತಾನು",
    tbl_status: "ಸ್ಥಿತಿ",
    tbl_fulfillment: "ಪೂರೈಕೆ",
    tbl_moq: "ಕನಿಷ್ಠ ಆರ್ಡರ್ ಪ್ರಮಾಣ (MOQ)",
    tbl_featured: "ವಿಶೇಷ ವೈಶಿಷ್ಟ್ಯ",
    tbl_keywords: "ಕೀವರ್ಡ್‌ಗಳು",
    tbl_rating: "ರೇಟಿಂಗ್",
    val_active: "ಸಕ್ರಿಯ",
    val_inactive: "ನಿಷ್ಕ್ರಿಯ",
    val_yes: "ಹೌದು",
    val_no: "ಇಲ್ಲ",
    val_available: "ಲಭ್ಯವಿದೆ"
  },
  ml: {
    tbl_sku: "എസ്‌ಕೆಯു (SKU)",
    tbl_brand: "ബ്രാൻഡ്",
    tbl_category: "വിഭാഗം",
    tbl_segment: "സെഗ്‌മെന്റ്",
    tbl_price: "വില",
    tbl_mrp: "എം.ആർ.പി.",
    tbl_stock: "സ്റ്റോക്ക്",
    tbl_status: "നില",
    tbl_fulfillment: "ഫുൾഫിൽമെന്റ്",
    tbl_moq: "കുറഞ്ഞ ഓർഡർ അളവ് (MOQ)",
    tbl_featured: "പ്രത്യേകതയുള്ളത്",
    tbl_keywords: "കീവേഡുകൾ",
    tbl_rating: "റേറ്റിംഗ്",
    val_active: "സജീവം",
    val_inactive: "നിഷ്‌ക്രിയം",
    val_yes: "അതെ",
    val_no: "അല്ല",
    val_available: "ലഭ്യമാണ്"
  },
  bn: {
    tbl_sku: "এসকেইউ (SKU)",
    tbl_brand: "ব্র্যান্ড",
    tbl_category: "বিভাগ",
    tbl_segment: "সেগমেন্ট",
    tbl_price: "মূল্য",
    tbl_mrp: "এম.আর.পি.",
    tbl_stock: "স্টক",
    tbl_status: "স্থিতি",
    tbl_fulfillment: "ফুলফিলমেন্ট",
    tbl_moq: "ন্যূনতম অর্ডার পরিমাণ (MOQ)",
    tbl_featured: "বিশেষ বৈশিষ্ট্যযুক্ত",
    tbl_keywords: "কীওয়ার্ড",
    tbl_rating: "রেটিং",
    val_active: "সক্রিয়",
    val_inactive: "নিষ্ক্রিয়",
    val_yes: "হ্যাঁ",
    val_no: "না",
    val_available: "উপলব্ধ"
  },
  mr: {
    tbl_sku: "एसकेयू (SKU)",
    tbl_brand: "ब्रँड",
    tbl_category: "श्रेणी",
    tbl_segment: "सेगमेंट",
    tbl_price: "किंमत",
    tbl_mrp: "एम.आर.पी.",
    tbl_stock: "उपलब्ध स्टॉक",
    tbl_status: "स्थिती",
    tbl_fulfillment: "पूर्तता",
    tbl_moq: "किमान ऑर्डर प्रमाण (MOQ)",
    tbl_featured: "वैशिष्ट्यीकृत",
    tbl_keywords: "कीवर्ड्स",
    tbl_rating: "रेटिंग",
    val_active: "सक्रिय",
    val_inactive: "निष्क्रिय",
    val_yes: "होय",
    val_no: "नाही",
    val_available: "उपलब्ध"
  },
  ur: {
    tbl_sku: "ایس کے یو (SKU)",
    tbl_brand: "برانڈ",
    tbl_category: "زمرہ",
    tbl_segment: "حصہ",
    tbl_price: "قیمت",
    tbl_mrp: "ایم آر پی",
    tbl_stock: "اسٹاک",
    tbl_status: "حیثیت",
    tbl_fulfillment: "تکمیل",
    tbl_moq: "کم از کم آرڈر کی مقدار (MOQ)",
    tbl_featured: "نمایاں",
    tbl_keywords: "کلیدی الفاظ",
    tbl_rating: "درجہ بندی",
    val_active: "فعال",
    val_inactive: "غیر فعال",
    val_yes: "ہاں",
    val_no: "نہیں",
    val_available: "دستیاب"
  },
  pa: {
    tbl_sku: "ਐਸਕੇਯੂ (SKU)",
    tbl_brand: "ਬ੍ਰਾਂਡ",
    tbl_category: "ਸ਼੍ਰੇਣੀ",
    tbl_segment: "ਸੈਗਮੈਂਟ",
    tbl_price: "ਕੀਮਤ",
    tbl_mrp: "ਐਮ.ਆਰ.ਪੀ.",
    tbl_stock: "ਸਟਾਕ",
    tbl_status: "ਸਥਿਤੀ",
    tbl_fulfillment: "ਪੂਰਤੀ",
    tbl_moq: "ਘੱਟੋ-ਘੱਟ ਆਰਡਰ ਮਾਤਰਾ (MOQ)",
    tbl_featured: "ਵਿਸ਼ੇਸ਼",
    tbl_keywords: "ਕੀਵਰਡ",
    tbl_rating: "ਰੇਟਿੰਗ",
    val_active: "ਸਰਗਰਮ",
    val_inactive: "ਅਕਿਰਿਆਸ਼ੀਲ",
    val_yes: "ਹਾਂ",
    val_no: "ਨਹੀਂ",
    val_available: "ਉਪਲਬਧ"
  },
  gu: {
    tbl_sku: "એસકેયુ (SKU)",
    tbl_brand: "બ્રાન્ડ",
    tbl_category: "શ્રેણી",
    tbl_segment: "સેગમેન્ટ",
    tbl_price: "કિંમત",
    tbl_mrp: "એમ.આર.પી.",
    tbl_stock: "સ્ટોક",
    tbl_status: "સ્થિતિ",
    tbl_fulfillment: "પૂર્ણતા",
    tbl_moq: "લઘુત્તમ ઓર્ડર જથ્થો (MOQ)",
    tbl_featured: "વિશેષ રૂપે દર્શાવેલ",
    tbl_keywords: "કીવર્ડ્સ",
    tbl_rating: "રેટિંગ",
    val_active: "સક્રિય",
    val_inactive: "નિષ્ક્રિય",
    val_yes: "હા",
    val_no: "ના",
    val_available: "ઉપલબ્ધ"
  }
};

// 1. Update translations.js
const transPath = path.join(projectDir, 'translations.js');
let transContent = fs.readFileSync(transPath, 'utf8');

Object.keys(TABLE_I18N).forEach((lang) => {
  const keys = TABLE_I18N[lang];
  const langRegex = new RegExp(`(\\b${lang}:\\s*\\{[\\s\\S]*?\\n\\s*\\})`);
  const match = transContent.match(langRegex);
  if (match) {
    let block = match[1];
    Object.keys(keys).forEach((k) => {
      const val = keys[k];
      const keyRegex = new RegExp(`(["']?${k}["']?\\s*:\\s*)(["'][\\s\\S]*?["'])`);
      if (keyRegex.test(block)) {
        block = block.replace(keyRegex, `$1${JSON.stringify(val)}`);
      } else {
        block = block.replace(/(\n\s*)\}$/, `,\n      ${JSON.stringify(k)}: ${JSON.stringify(val)}$1}`);
      }
    });
    transContent = transContent.replace(match[1], block);
  }
});

fs.writeFileSync(transPath, transContent, 'utf8');
console.log('Successfully updated translations.js with all table keys & values across 11 languages!');

// 2. Update product-detail.html
const htmlPath = path.join(projectDir, 'product-detail.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const oldTableHtml = `      <table>
        <tr><th>SKU</th><td id="infoSku"></td></tr>
        <tr><th>Brand</th><td id="infoBrand"></td></tr>
        <tr><th>Category</th><td id="infoCategory"></td></tr>
        <tr><th>Segment</th><td id="infoSegment"></td></tr>
        <tr><th>Price</th><td id="infoPrice"></td></tr>
        <tr><th>MRP</th><td id="infoListPrice"></td></tr>
        <tr><th>Stock</th><td id="infoStock"></td></tr>
        <tr><th>Status</th><td id="infoStatus"></td></tr>
        <tr><th>Fulfillment</th><td id="infoFulfillment"></td></tr>
        <tr><th>MOQ</th><td id="infoMoq"></td></tr>
        <tr><th>Featured</th><td id="infoFeatured"></td></tr>
        <tr><th>Keywords</th><td id="infoKeywords"></td></tr>
        <tr><th>Rating</th><td id="infoRating"></td></tr>
      </table>`;

const newTableHtml = `      <div id="productInfoTable">
      <table>
        <tr><th data-i18n="tbl_sku">SKU</th><td id="infoSku"></td></tr>
        <tr><th data-i18n="tbl_brand">Brand</th><td id="infoBrand"></td></tr>
        <tr><th data-i18n="tbl_category">Category</th><td id="infoCategory"></td></tr>
        <tr><th data-i18n="tbl_segment">Segment</th><td id="infoSegment"></td></tr>
        <tr><th data-i18n="tbl_price">Price</th><td id="infoPrice"></td></tr>
        <tr><th data-i18n="tbl_mrp">MRP</th><td id="infoListPrice"></td></tr>
        <tr><th data-i18n="tbl_stock">Stock</th><td id="infoStock"></td></tr>
        <tr><th data-i18n="tbl_status">Status</th><td id="infoStatus"></td></tr>
        <tr><th data-i18n="tbl_fulfillment">Fulfillment</th><td id="infoFulfillment"></td></tr>
        <tr><th data-i18n="tbl_moq">MOQ</th><td id="infoMoq"></td></tr>
        <tr><th data-i18n="tbl_featured">Featured</th><td id="infoFeatured"></td></tr>
        <tr><th data-i18n="tbl_keywords">Keywords</th><td id="infoKeywords"></td></tr>
        <tr><th data-i18n="tbl_rating">Rating</th><td id="infoRating"></td></tr>
      </table>
      </div>`;

if (htmlContent.replace(/\r\n/g, '\n').includes(oldTableHtml)) {
  const isCRLF = htmlContent.includes('\r\n');
  let norm = htmlContent.replace(/\r\n/g, '\n');
  norm = norm.replace(oldTableHtml, newTableHtml);
  htmlContent = isCRLF ? norm.replace(/\n/g, '\r\n') : norm;
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log('Successfully updated product-detail.html with data-i18n attributes on table headers!');
} else {
  console.warn('Could not find exact oldTableHtml in product-detail.html, checking individual replacements...');
}

// 3. Update product-detail.js
const jsPath = path.join(projectDir, 'product-detail.js');
let jsContent = fs.readFileSync(jsPath, 'utf8');
const isJsCRLF = jsContent.includes('\r\n');
let jsNorm = jsContent.replace(/\r\n/g, '\n');

// Replace the table field assignments with renderProductInfoTable
const oldTableBlock = `  infoSku.textContent = product.sku || "--";
  infoBrand.textContent = product.brand;
  infoCategory.textContent = formatCategoryLabel(productCategoryFamily);
  infoSegment.textContent = product.segment.toUpperCase();
  infoPrice.textContent = money(price);
  infoListPrice.textContent = money(listPrice);
  infoStock.textContent = stockCount == null ? "Available" : String(stockCount);
  infoStatus.textContent = String(product.status || "active").toUpperCase();
  infoFulfillment.textContent = String(product.fulfillment || "fbm").toUpperCase();
  infoMoq.textContent = Number(product.moq || 0) > 0 ? String(product.moq) : "--";
  infoFeatured.textContent = product.featured ? "Yes" : "No";
  infoKeywords.textContent = Array.isArray(product.keywords) && product.keywords.length ? product.keywords.join(", ") : "--";
  infoRating.innerHTML = \`\${product.rating} &#9733;\`;
  detailInfoTable.hidden = false;`;

const newTableBlock = `  renderProductInfoTable(product, stockCount, productCategoryFamily, price, listPrice);`;

const renderProductInfoTableCode = `function renderProductInfoTable(product, stockCount, categoryFamily, price, listPrice) {
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : (window.EM_TRANSLATIONS ? window.EM_TRANSLATIONS.en : {});

  const statusUpper = String(product.status || "active").toUpperCase();
  const statusMap = {
    ACTIVE: t.val_active || "सक्रिय",
    INACTIVE: t.val_inactive || "निष्क्रिय"
  };
  const featuredMap = {
    Yes: t.val_yes || "हाँ",
    No: t.val_no || "नहीं",
    true: t.val_yes || "हाँ",
    false: t.val_no || "नहीं"
  };

  if (infoSku) infoSku.textContent = product.sku || "--";
  if (infoBrand) infoBrand.textContent = product.brand || "--";
  if (infoCategory) infoCategory.textContent = formatCategoryLabel(categoryFamily || getProductCategoryFamily(product));
  if (infoSegment) infoSegment.textContent = String(product.segment || "--").toUpperCase();
  if (infoPrice) infoPrice.textContent = money(price != null ? price : product.price);
  if (infoListPrice) infoListPrice.textContent = money(listPrice != null ? listPrice : (product.listPrice || product.price));
  if (infoStock) infoStock.textContent = (stockCount == null || stockCount === "") ? (t.val_available || "उपलब्ध") : String(stockCount);
  if (infoStatus) infoStatus.textContent = statusMap[statusUpper] || statusUpper;
  if (infoFulfillment) infoFulfillment.textContent = String(product.fulfillment || "fbm").toUpperCase();
  if (infoMoq) infoMoq.textContent = Number(product.moq || 0) > 0 ? String(product.moq) : "--";
  if (infoFeatured) infoFeatured.textContent = featuredMap[product.featured] || (product.featured ? (t.val_yes || "हाँ") : (t.val_no || "नहीं"));
  if (infoKeywords) infoKeywords.textContent = Array.isArray(product.keywords) && product.keywords.length ? product.keywords.join(", ") : "--";
  if (infoRating) infoRating.innerHTML = \`\${product.rating} &#9733;\`;

  const tableContainer = document.getElementById("productInfoTable") || detailInfoTable;
  if (tableContainer) {
    tableContainer.querySelectorAll("[data-i18n]").forEach((el) => {
      const k = el.getAttribute("data-i18n");
      if (t[k]) el.textContent = t[k];
    });
  }

  if (detailInfoTable) detailInfoTable.hidden = false;
}
window.renderProductInfoTable = renderProductInfoTable;`;

// Replace renderReviewSummary with localized version
const oldReviewSummary = `function renderReviewSummary(product) {
  if (!reviewsBlock || !reviewHeadline || !reviewBars) {
    return;
  }
  const rating = Math.max(0, Math.min(5, Number(product.rating || 0)));
  const totalReviews = Math.max(8, Math.round(42 + (rating * 37)));
  reviewHeadline.innerHTML = \`\${rating.toFixed(1)} &#9733; from \${totalReviews.toLocaleString("en-IN")} ratings\`;

  const base = Math.max(20, Math.round((rating / 5) * 100));
  const distribution = [
    { stars: "5 star", value: Math.min(92, base + 20) },
    { stars: "4 star", value: Math.min(80, Math.max(5, base - 5)) },
    { stars: "3 star", value: Math.min(60, Math.max(4, base - 25)) },
    { stars: "2 star", value: Math.min(35, Math.max(3, base - 45)) },
    { stars: "1 star", value: Math.min(22, Math.max(2, base - 60)) }
  ];
  reviewBars.innerHTML = distribution.map((item) => \`
    <div class="review-bar">
      <span>\${item.stars}</span>
      <div class="review-track"><div class="review-fill" style="width:\${item.value}%"></div></div>
      <span>\${item.value}%</span>
    </div>
  \`).join("");
  reviewsBlock.hidden = false;
}`;

const newReviewSummary = `function renderReviewSummary(product) {
  if (!reviewsBlock || !reviewHeadline || !reviewBars) {
    return;
  }
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : (window.EM_TRANSLATIONS ? window.EM_TRANSLATIONS.en : {});

  const rating = Math.max(0, Math.min(5, Number(product.rating || 0)));
  const totalReviews = Math.max(8, Math.round(42 + (rating * 37)));
  reviewHeadline.innerHTML = \`\${rating.toFixed(1)} &#9733; (\${totalReviews.toLocaleString("en-IN")} \${t.ratings_label || "रेटिंग"})\`;

  const base = Math.max(20, Math.round((rating / 5) * 100));
  const distribution = [
    { stars: 5, value: Math.min(92, base + 20) },
    { stars: 4, value: Math.min(80, Math.max(5, base - 5)) },
    { stars: 3, value: Math.min(60, Math.max(4, base - 25)) },
    { stars: 2, value: Math.min(35, Math.max(3, base - 45)) },
    { stars: 1, value: Math.min(22, Math.max(2, base - 60)) }
  ];
  const starWord = t.tbl_rating || "स्टार";
  reviewBars.innerHTML = distribution.map((item) => \`
    <div class="review-bar">
      <span>\${item.stars} \${starWord}</span>
      <div class="review-track"><div class="review-fill" style="width:\${item.value}%"></div></div>
      <span>\${item.value}%</span>
    </div>
  \`).join("");
  reviewsBlock.hidden = false;
}`;

if (jsNorm.includes(oldTableBlock)) {
  jsNorm = jsNorm.replace(oldTableBlock, newTableBlock);
  console.log("Replaced oldTableBlock in renderProduct successfully!");
} else {
  console.warn("Could not find oldTableBlock in product-detail.js");
}

if (jsNorm.includes(oldReviewSummary)) {
  jsNorm = jsNorm.replace(oldReviewSummary, newReviewSummary);
  console.log("Replaced oldReviewSummary successfully!");
} else {
  console.warn("Could not find oldReviewSummary in product-detail.js");
}

// Add renderProductInfoTableCode before renderProduct
jsNorm = jsNorm.replace(
  'let activeRenderedProduct = null;',
  `${renderProductInfoTableCode}\n\nlet activeRenderedProduct = null;`
);

const finalJs = isJsCRLF ? jsNorm.replace(/\n/g, '\r\n') : jsNorm;
fs.writeFileSync(jsPath, finalJs, 'utf8');
console.log('Successfully updated product-detail.js with renderProductInfoTable and localized review summary!');
