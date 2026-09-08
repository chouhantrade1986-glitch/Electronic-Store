const fs = require('fs');
const path = require('path');

const repoRoot = "C:\\Users\\Admin\\Documents\\GitHub\\Electronic-Store";

console.log("Applying full-tier Amazon India multilingual catalog architecture...");

// ============================================================================
// 1. Update translations.js with category and spec keys across all 11 languages
// ============================================================================
const transPath = path.join(repoRoot, 'translations.js');
let transContent = fs.readFileSync(transPath, 'utf8');

const categoryI18n = {
  en: {
    cat_laptop: "Laptops & Accessories",
    cat_mobile: "Mobile Phones & Wearable Tech",
    cat_computer: "Computers & Components",
    cat_audio: "Audio, Headphones & Speakers",
    cat_accessory: "Electronics Accessories",
    cat_printer: "Printers & Inks",
    kw_mobile_wearable: "Mobile and Wearable Tech",
    kw_business_laptop: "Business Laptop",
    spec_mobile_wearable: "Mobile and Wearable Tech",
    spec_water_resistant: "Water resistant IP68",
    spec_battery_7days: "Up to 7 days battery life"
  },
  hi: {
    cat_laptop: "लैपटॉप और एक्सेसरीज़",
    cat_mobile: "मोबाइल फ़ोन और वियरेबल तकनीक",
    cat_computer: "कंप्यूटर और सहायक उपकरण",
    cat_audio: "ऑडियो, हेडफ़ोन और स्पीकर",
    cat_accessory: "इलेक्ट्रॉनिक्स एक्सेसरीज़",
    cat_printer: "प्रिंटर और स्याही",
    kw_mobile_wearable: "मोबाइल और वियरेबल तकनीक",
    kw_business_laptop: "बिज़नेस लैपटॉप",
    spec_mobile_wearable: "मोबाइल और वियरेबल तकनीक",
    spec_water_resistant: "वॉटर रेसिस्टेंट IP68",
    spec_battery_7days: "7 दिनों तक की बैटरी लाइफ"
  },
  ta: {
    cat_laptop: "லேப்டாப்கள் & பாகங்கள்",
    cat_mobile: "மொபைல் போன்கள் & அணியக்கூடிய சாதனங்கள்",
    cat_computer: "கம்ப்யூட்டர்கள் & பாகங்கள்",
    cat_audio: "ஆடியோ, ஹெட்ஃபோன்கள் & ஸ்பீக்கர்கள்",
    cat_accessory: "எலக்ட்ரானிக்ஸ் பாகங்கள்",
    cat_printer: "பிரிண்டர்கள் & மை",
    kw_mobile_wearable: "மொபைல் மற்றும் அணியக்கூடிய தொழில்நுட்பம்",
    kw_business_laptop: "வணிக லேப்டாப்",
    spec_mobile_wearable: "மொபைல் மற்றும் அணியக்கூடிய தொழில்நுட்பம்",
    spec_water_resistant: "நீர் எதிர்ப்பு IP68",
    spec_battery_7days: "7 நாட்கள் வரை பேட்டரி ஆயுள்"
  },
  te: {
    cat_laptop: "ల్యాప్‌టాప్‌లు & ఉపకరణాలు",
    cat_mobile: "మొబైల్ ఫోన్లు & ధరించదగిన సాంకేతికత",
    cat_computer: "కంప్యూటర్లు & భాగాలు",
    cat_audio: "ఆడియో, హెడ్‌ఫోన్లు & స్పీకర్లు",
    cat_accessory: "ఎలక్ట్రానిక్స్ ఉపకరణాలు",
    cat_printer: "ప్రింటర్లు & ఇంక్",
    kw_mobile_wearable: "మొబైల్ మరియు ధరించదగిన సాంకేతికత",
    kw_business_laptop: "వ్యాపార ల్యాప్‌టాప్",
    spec_mobile_wearable: "మొబైల్ మరియు ధరించదగిన సాంకేతికత",
    spec_water_resistant: "నీటి నిరోధక IP68",
    spec_battery_7days: "7 రోజుల వరకు బ్యాటరీ లైఫ్"
  },
  kn: {
    cat_laptop: "ಲ್ಯಾಪ್‌ಟಾಪ್‌ಗಳು ಮತ್ತು ಪರಿಕರಗಳು",
    cat_mobile: "ಮೊಬೈಲ್ ಫೋನ್‌ಗಳು ಮತ್ತು ವೇರಬಲ್ ತಂತ್ರಜ್ಞಾನ",
    cat_computer: "ಕಂಪ್ಯೂಟರ್‌ಗಳು ಮತ್ತು ಬಿಡಿಭಾಗಗಳು",
    cat_audio: "ಆಡಿಯೋ, ಹೆಡ್‌ಫೋನ್ ಮತ್ತು ಸ್ಪೀಕರ್‌ಗಳು",
    cat_accessory: "ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ ಪರಿಕರಗಳು",
    cat_printer: "ಪ್ರಿಂಟರ್‌ಗಳು ಮತ್ತು ಶಾಯಿ",
    kw_mobile_wearable: "ಮೊಬೈಲ್ ಮತ್ತು ವೇರಬಲ್ ತಂತ್ರಜ್ಞಾನ",
    kw_business_laptop: "ವ್ಯಾಪಾರ ಲ್ಯಾಪ್‌ಟಾಪ್",
    spec_mobile_wearable: "ಮೊಬೈಲ್ ಮತ್ತು ವೇರಬಲ್ ತಂತ್ರಜ್ಞಾನ",
    spec_water_resistant: "ನೀರು ನಿರೋಧಕ IP68",
    spec_battery_7days: "7 ದಿನಗಳವರೆಗೆ ಬ್ಯಾಟರಿ ಬಾಳಿಕೆ"
  },
  ml: {
    cat_laptop: "ലാപ്‌ടോപ്പുകളും ആക്‌സസറികളും",
    cat_mobile: "മൊബൈൽ ഫോണുകളും വെയറബിൾ സാങ്കേതികവിദ്യയും",
    cat_computer: "കമ്പ്യൂട്ടറുകളും ഘടകങ്ങളും",
    cat_audio: "ഓഡിയോ, ഹെഡ്‌ഫോണുകൾ & സ്പീക്കറുകൾ",
    cat_accessory: "ഇലക്ട്രോണിക്സ് ആക്സസറികൾ",
    cat_printer: "പ്രിന്ററുകളും മഷിയും",
    kw_mobile_wearable: "മൊബൈൽ, വെയറബിൾ സാങ്കേതികവിദ്യ",
    kw_business_laptop: "ബിസിനസ് ലാപ്‌ടോപ്പ്",
    spec_mobile_wearable: "മൊബൈൽ, വെയറബിൾ സാങ്കേതികവിദ്യ",
    spec_water_resistant: "വാട്ടർ റെസിസ്റ്റന്റ് IP68",
    spec_battery_7days: "7 ദിവസം വരെ ബാറ്ററി ലൈഫ്"
  },
  bn: {
    cat_laptop: "ল্যাপটপ এবং আনুষাঙ্গিক",
    cat_mobile: "মোবাইল ফোন এবং পরিধানযোগ্য প্রযুক্তি",
    cat_computer: "কম্পিউটার এবং উপাদান",
    cat_audio: "অডিও, হেডফোন এবং স্পিকার",
    cat_accessory: "ইলেকট্রনিক্স আনুষাঙ্গিক",
    cat_printer: "প্রিন্টার এবং কালি",
    kw_mobile_wearable: "মোবাইল এবং পরিধানযোগ্য প্রযুক্তি",
    kw_business_laptop: "ব্যবসায়িক ল্যাপটপ",
    spec_mobile_wearable: "মোবাইল এবং পরিধানযোগ্য প্রযুক্তি",
    spec_water_resistant: "জল প্রতিরোধী IP68",
    spec_battery_7days: "7 দিন পর্যন্ত ব্যাটারি লাইফ"
  },
  mr: {
    cat_laptop: "लॅपटॉप आणि अ‍ॅक्सेसरीज",
    cat_mobile: "मोबाइल फोन आणि वेअरेबल तंत्रज्ञान",
    cat_computer: "संगणक आणि घटक",
    cat_audio: "ऑडिओ, हेडफोन आणि स्पीकर्स",
    cat_accessory: "इलेक्ट्रॉनिक्स अ‍ॅक्सेसरीज",
    cat_printer: "प्रिंटर आणि शाई",
    kw_mobile_wearable: "मोबाइल आणि वेअरेबल तंत्रज्ञान",
    kw_business_laptop: "बिझनेस लॅपटॉप",
    spec_mobile_wearable: "मोबाइल आणि वेअरेबल तंत्रज्ञान",
    spec_water_resistant: "जलरोधक IP68",
    spec_battery_7days: "7 दिवसांपर्यंत बॅटरी आयुष्य"
  },
  ur: {
    cat_laptop: "لیپ ٹاپ اور لوازمات",
    cat_mobile: "موبائل فون اور پہننے کے قابل ٹیک",
    cat_computer: "کمپیوٹرز اور پرزے",
    cat_audio: "آڈیو، ہیڈ فون اور اسپیکر",
    cat_accessory: "الیکٹرانکس کے لوازمات",
    cat_printer: "پرنٹرز اور انک",
    kw_mobile_wearable: "موبائل اور پہننے کے قابل ٹیک",
    kw_business_laptop: "بزنس لیپ ٹاپ",
    spec_mobile_wearable: "موبائل اور پہننے کے قابل ٹیک",
    spec_water_resistant: "پانی مزاحم IP68",
    spec_battery_7days: "7 دن تک بیٹری لائف"
  },
  pa: {
    cat_laptop: "ਲੈਪਟਾਪ ਅਤੇ ਸਹਾਇਕ ਉਪਕਰਣ",
    cat_mobile: "ਮੋਬਾਈਲ ਫੋਨ ਅਤੇ ਪਹਿਨਣਯੋਗ ਤਕਨੀਕ",
    cat_computer: "ਕੰਪਿਊਟਰ ਅਤੇ ਕੰਪੋਨੈਂਟ",
    cat_audio: "ਆਡੀਓ, ਹੈੱਡਫੋਨ ਅਤੇ ਸਪੀਕਰ",
    cat_accessory: "ਇਲੈਕਟ੍ਰਾਨਿਕਸ ਸਹਾਇਕ ਉਪਕਰਣ",
    cat_printer: "ਪ੍ਰਿੰਟਰ ਅਤੇ ਸਿਆਹੀ",
    kw_mobile_wearable: "ਮੋਬਾਈਲ ਅਤੇ ਪਹਿਨਣਯੋਗ ਤਕਨੀਕ",
    kw_business_laptop: "ਕਾਰੋਬਾਰੀ ਲੈਪਟਾਪ",
    spec_mobile_wearable: "ਮੋਬਾਈਲ ਅਤੇ ਪਹਿਨਣਯੋਗ ਤਕਨੀਕ",
    spec_water_resistant: "ਪਾਣੀ ਰੋਧਕ IP68",
    spec_battery_7days: "7 ਦਿਨਾਂ ਤੱਕ ਦੀ ਬੈਟਰੀ ਲਾਈਫ"
  },
  gu: {
    cat_laptop: "લેપટોપ અને એસેસરીઝ",
    cat_mobile: "મોબાઇલ ફોન અને વેરેબલ ટેક",
    cat_computer: "કમ્પ્યુટર્સ અને ઘટકો",
    cat_audio: "ઓડિયો, હેડફોન અને સ્પીકર્સ",
    cat_accessory: "ઇલેક્ટ્રોનિક્સ એસેસરીઝ",
    cat_printer: "પ્રિન્ટર્સ અને શાહી",
    kw_mobile_wearable: "મોબાઇલ અને વેરેબલ ટેકનોલોજી",
    kw_business_laptop: "બિઝનેસ લેપટોપ",
    spec_mobile_wearable: "મોબાઇલ અને વેરેબલ ટેકનોલોજી",
    spec_water_resistant: "વોટર રેઝિસ્ટન્ટ IP68",
    spec_battery_7days: "7 દિવસ સુધી બેટરી લાઈફ"
  }
};

for (const [lang, dict] of Object.entries(categoryI18n)) {
  const marker = '"' + lang + '": {';
  const idx = transContent.indexOf(marker);
  if (idx !== -1) {
    let injectStr = "";
    for (const [k, v] of Object.entries(dict)) {
      if (!transContent.includes('"' + k + '":')) {
        injectStr += '\n      "' + k + '": "' + v + '",';
      }
    }
    if (injectStr) {
      transContent = transContent.slice(0, idx + marker.length) + injectStr + transContent.slice(idx + marker.length);
    }
  }
}
fs.writeFileSync(transPath, transContent, 'utf8');
console.log("Updated translations.js with all category and spec keys");

// ============================================================================
// 2. Update product-detail.js
// ============================================================================
const prodDetailPath = path.join(repoRoot, 'product-detail.js');
let prodJs = fs.readFileSync(prodDetailPath, 'utf8');

// A. Insert renderProductHeader function before renderProduct
if (!prodJs.includes('function renderProductHeader(')) {
  const headerFuncCode = [
    'function renderProductHeader(product) {',
    '  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "hi").toLowerCase();',
    '  const localizedTitle = (window.getLocalizedTitle ? window.getLocalizedTitle(product, currentLang) : (product.title || product.name || "")).trim();',
    '  const titleEl = document.getElementById("productName") || document.getElementById("productTitle") || document.querySelector("h2.product-title") || document.querySelector("h1.product-title");',
    '  if (titleEl) titleEl.textContent = localizedTitle;',
    '  const breadcrumbTitle = document.getElementById("crumbName") || document.getElementById("breadcrumbProductTitle");',
    '  if (breadcrumbTitle) breadcrumbTitle.textContent = localizedTitle;',
    '  const bundleTitle = document.querySelector(".this-item-title") || document.getElementById("bundleMainTitle");',
    '  if (bundleTitle) bundleTitle.textContent = localizedTitle;',
    '  document.title = localizedTitle + " - ElectroMart";',
    '  if (productImage) productImage.alt = localizedTitle;',
    '}',
    'window.renderProductHeader = renderProductHeader;',
    ''
  ].join('\n');
  prodJs = prodJs.replace('function renderProduct(product) {', headerFuncCode + 'function renderProduct(product) {');
}

// B. In renderProduct, update title, description, and specs
const oldTitleBlock = '  productImage.alt = product.name;\n  productName.textContent = product.name;\n  \n  // 1. Localized Breadcrumb\n  const breadcrumbEl = document.getElementById("productBreadcrumb");\n  if (breadcrumbEl) {\n    breadcrumbEl.innerHTML = `<a href="products.html" data-i18n="breadcrumb_products">${t.breadcrumb_products || "Products"}</a> &gt; <span id="crumbName">${escapeHtml(product.name)}</span>`;\n  }';
const newTitleBlock = [
  '  const localizedTitle = (window.getLocalizedTitle ? window.getLocalizedTitle(product, currentLang) : (product.title || product.name || "")).trim();',
  '  const localizedDesc = (window.getLocalizedDescription ? window.getLocalizedDescription(product, currentLang) : "").trim();',
  '  const localizedSpecs = window.getLocalizedSpecs ? window.getLocalizedSpecs(product, currentLang) : [];',
  '  productImage.alt = localizedTitle;',
  '  productName.textContent = localizedTitle;',
  '  const breadcrumbEl = document.getElementById("productBreadcrumb");',
  '  if (breadcrumbEl) {',
  '    breadcrumbEl.innerHTML = `<a href="products.html" data-i18n="breadcrumb_products">${t.breadcrumb_products || "Products"}</a> &gt; <span id="crumbName">${escapeHtml(localizedTitle)}</span>`;',
  '  }',
  '  renderProductHeader(product);'
].join('\n');
if (prodJs.includes(oldTitleBlock)) {
  prodJs = prodJs.replace(oldTitleBlock, newTitleBlock);
}

// C. Description in renderProduct
const oldDescBlock = '  const fallbackDescription = `Explore ${product.name} for ${product.category} needs with trusted performance and reliable support.`;\n  const descriptionRaw = String(product.description || "").trim();\n  if (!descriptionRaw) {\n    productDescription.textContent = fallbackDescription;\n  } else if (/<[a-z][\\s\\S]*>/i.test(descriptionRaw) || /&[a-z]+;/i.test(descriptionRaw)) {\n    const sanitized = descriptionRaw\n      .replace(/<script[\\s\\S]*?>[\\s\\S]*?<\\/script>/gi, "")\n      .replace(/\\son\\w+="[^"]*"/gi, "")\n      .replace(/\\son\\w+=\'[^\']*\'/gi, "");\n    productDescription.innerHTML = sanitized;\n  } else {\n    productDescription.textContent = descriptionRaw;\n  }';
const newDescBlock = [
  '  const fallbackDescription = `Explore ${localizedTitle} for ${product.category} needs with trusted performance and reliable support.`;',
  '  const descriptionRaw = String(localizedDesc || product.description || "").trim();',
  '  if (!descriptionRaw || descriptionRaw.includes("I\'m a product description")) {',
  '    productDescription.textContent = localizedDesc || fallbackDescription;',
  '  } else if (/<[a-z][\\s\\S]*>/i.test(descriptionRaw) || /&[a-z]+;/i.test(descriptionRaw)) {',
  '    const sanitized = descriptionRaw',
  '      .replace(/<script[\\s\\S]*?>[\\s\\S]*?<\\/script>/gi, "")',
  '      .replace(/\\son\\w+="[^"]*"/gi, "")',
  '      .replace(/\\son\\w+=\'[^\']*\'/gi, "");',
  '    productDescription.innerHTML = sanitized;',
  '  } else {',
  '    productDescription.textContent = localizedDesc || descriptionRaw;',
  '  }'
].join('\n');
if (prodJs.includes(oldDescBlock)) {
  prodJs = prodJs.replace(oldDescBlock, newDescBlock);
}

// D. Specs & Bullets in renderProduct
const oldSpecsBlock = '  const defaultSpecs = specMap[productCategoryFamily] || ["Quality assured", "Trusted by customers", "Fast delivery options"];\n  const keywordSpecs = Array.isArray(product.keywords) ? product.keywords.slice(0, 6) : [];\n  const specs = keywordSpecs.length ? keywordSpecs : defaultSpecs;\n  productSpecs.innerHTML = specs.map((spec) => `<li>${localizeSpec(spec, t)}</li>`).join("");\n  \n  const bulletMap = {\n    "High performance processor": t.spec_high_performance || "उच्च प्रदर्शन प्रोसेसर",\n    "SSD storage": t.spec_ssd_storage || "एसएसडी स्टोरेज",\n    "Long battery life": t.spec_battery_life || "लंबी बैटरी लाइफ"\n  };\n  document.querySelectorAll("#productSpecs li, #aboutItemBulletList li").forEach((li) => {\n    const text = li.textContent.trim();\n    if (bulletMap[text]) li.textContent = bulletMap[text];\n  });';
const newSpecsBlock = [
  '  const defaultSpecs = specMap[productCategoryFamily] || ["Quality assured", "Trusted by customers", "Fast delivery options"];',
  '  const keywordSpecs = Array.isArray(product.keywords) ? product.keywords.slice(0, 6) : [];',
  '  const fallbackSpecs = keywordSpecs.length ? keywordSpecs : defaultSpecs;',
  '  const finalSpecs = (localizedSpecs && localizedSpecs.length) ? localizedSpecs : fallbackSpecs;',
  '  productSpecs.innerHTML = finalSpecs.map((spec) => `<li>${localizeSpec(spec, t)}</li>`).join("");',
  '  const bulletMap = {',
  '    "High performance processor": t.spec_high_performance || "उच्च प्रदर्शन प्रोसेसर",',
  '    "SSD storage": t.spec_ssd_storage || "एसएसडी स्टोरेज",',
  '    "Long battery life": t.spec_battery_life || "लंबी बैटरी लाइफ",',
  '    "Mobile and Wearable Tech": t.spec_mobile_wearable || "मोबाइल और वियरेबल तकनीक",',
  '    "Water resistant IP68": t.spec_water_resistant || "वॉटर रेसिस्टेंट IP68",',
  '    "Up to 7 days battery life": t.spec_battery_7days || "7 दिनों तक की बैटरी लाइफ"',
  '  };',
  '  document.querySelectorAll("#productSpecs li, #aboutItemBulletList li").forEach((li) => {',
  '    const text = li.textContent.trim();',
  '    if (bulletMap[text]) li.textContent = bulletMap[text];',
  '  });'
].join('\n');
if (prodJs.includes(oldSpecsBlock)) {
  prodJs = prodJs.replace(oldSpecsBlock, newSpecsBlock);
}

// E. Bundle rendering
const oldBundleLine = '<label style="display: block; margin-bottom: 4px;"><input type="checkbox" checked disabled /> <strong>${t.val_this_item || "This item:"}</strong> ${escapeHtml(product.name)} (${money(product.price)})</label>\n          <label style="display: block;"><input type="checkbox" id="bundleAccCheckbox" checked /> ${escapeHtml(bundleItem.name)} (${money(bundleItem.price)})</label>';
const newBundleLine = '<label style="display: block; margin-bottom: 4px;"><input type="checkbox" checked disabled /> <strong>${t.val_this_item || "This item:"}</strong> <span class="this-item-title">${escapeHtml(window.getLocalizedTitle ? window.getLocalizedTitle(product, currentLang) : product.name)}</span> (${money(product.price)})</label>\n          <label style="display: block;"><input type="checkbox" id="bundleAccCheckbox" checked /> <span class="bundle-item-title">${escapeHtml(window.getLocalizedTitle ? window.getLocalizedTitle(bundleItem, currentLang) : bundleItem.name)}</span> (${money(bundleItem.price)})</label>';
if (prodJs.includes(oldBundleLine)) {
  prodJs = prodJs.replace(oldBundleLine, newBundleLine);
}

// F. Related products rendering
const oldRelatedCard = '<p>${item.name}</p>';
const newRelatedCard = '<p>${escapeHtml(window.getLocalizedTitle ? window.getLocalizedTitle(item, currentLang) : (item.title || item.name || ""))}</p>';
if (prodJs.includes(oldRelatedCard)) {
  prodJs = prodJs.replace(
    'function renderRelatedProducts(items) {\n  if (!relatedBlock || !relatedGrid) {\n    return;\n  }\n  if (!Array.isArray(items) || !items.length) {\n    relatedGrid.innerHTML = "";\n    relatedBlock.hidden = true;\n    return;\n  }\n  relatedGrid.innerHTML = items.map((item) => `\n    <a href="product-detail.html?id=${encodeURIComponent(item.id)}" class="related-item">\n      <img src="${normalizeImageUrl(item.image) || FALLBACK_IMAGE_URL}" alt="${item.name}" loading="lazy" />\n      <p>${item.name}</p>\n    </a>\n  `).join("");\n  relatedBlock.hidden = false;\n}',
    [
      'function renderRelatedProducts(items) {',
      '  if (!relatedBlock || !relatedGrid) return;',
      '  if (!Array.isArray(items) || !items.length) {',
      '    relatedGrid.innerHTML = "";',
      '    relatedBlock.hidden = true;',
      '    return;',
      '  }',
      '  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "hi").toLowerCase();',
      '  relatedGrid.innerHTML = items.map((item) => {',
      '    const locTitle = (window.getLocalizedTitle ? window.getLocalizedTitle(item, currentLang) : (item.title || item.name || "")).trim();',
      '    return `',
      '      <a href="product-detail.html?id=${encodeURIComponent(item.id)}" class="related-item">',
      '        <img src="${normalizeImageUrl(item.image) || FALLBACK_IMAGE_URL}" alt="${escapeHtml(locTitle)}" loading="lazy" />',
      '        <p>${escapeHtml(locTitle)}</p>',
      '      </a>',
      '    `;',
      '  }).join("");',
      '  relatedBlock.hidden = false;',
      '}'
    ].join('\n')
  );
}

// G. Category & Keywords in renderProductInfoTable
const oldInfoCatLine = 'if (infoCategory) infoCategory.textContent = formatCategoryLabel(categoryFamily || getProductCategoryFamily(product));';
const newInfoCatLine = [
  '  const catFamily = categoryFamily || getProductCategoryFamily(product);',
  '  const localizedCat = (window.getLocalizedCategory ? window.getLocalizedCategory(catFamily, currentLang) : "") || t["cat_" + catFamily] || formatCategoryLabel(catFamily);',
  '  if (infoCategory) infoCategory.textContent = localizedCat;'
].join('\n');
if (prodJs.includes(oldInfoCatLine)) {
  prodJs = prodJs.replace(oldInfoCatLine, newInfoCatLine);
}

const oldInfoKwLine = 'if (infoKeywords) infoKeywords.textContent = Array.isArray(product.keywords) && product.keywords.length ? product.keywords.join(", ") : "--";';
const newInfoKwLine = [
  '  const kwMap = {',
  '    "Mobile and Wearable Tech": t.kw_mobile_wearable || "मोबाइल और वियरेबल तकनीक",',
  '    "lenovo": "Lenovo",',
  '    "laptop": t.cat_laptop || "लैपटॉप",',
  '    "business laptop": t.kw_business_laptop || "बिज़नेस लैपटॉप",',
  '    "ryzen 5": "Ryzen 5"',
  '  };',
  '  if (infoKeywords) {',
  '    if (Array.isArray(product.keywords) && product.keywords.length) {',
  '      infoKeywords.textContent = product.keywords.map(k => kwMap[k] || k).join(", ");',
  '    } else {',
  '      infoKeywords.textContent = "--";',
  '    }',
  '  }'
].join('\n');
if (prodJs.includes(oldInfoKwLine)) {
  prodJs = prodJs.replace(oldInfoKwLine, newInfoKwLine);
}

fs.writeFileSync(prodDetailPath, prodJs, 'utf8');
console.log("Updated product-detail.js successfully");

// ============================================================================
// 3. Update products.js
// ============================================================================
const productsJsPath = path.join(repoRoot, 'products.js');
let productsJs = fs.readFileSync(productsJsPath, 'utf8');

const oldProdCardTitle = '<h3><a class="title-link" href="product-detail.html?id=${encodeURIComponent(product.id)}">${product.name}</a></h3>';
const newProdCardTitle = '<h3><a class="title-link" href="product-detail.html?id=${encodeURIComponent(product.id)}">${escapeHtml(window.getLocalizedTitle ? window.getLocalizedTitle(product, currentLang) : product.name)}</a></h3>';
if (productsJs.includes(oldProdCardTitle)) {
  productsJs = productsJs.replace(oldProdCardTitle, newProdCardTitle);
  fs.writeFileSync(productsJsPath, productsJs, 'utf8');
  console.log("Updated products.js product title link");
}

// ============================================================================
// 4. Update todays-deals.js
// ============================================================================
const todaysDealsPath = path.join(repoRoot, 'todays-deals.js');
let dealsJs = fs.readFileSync(todaysDealsPath, 'utf8');

const oldDealTitle = '<h3><a href="${detailUrl}">${escapeHtml(item.name)}</a></h3>';
const newDealTitle = '<h3><a href="${detailUrl}">${escapeHtml(window.getLocalizedTitle ? window.getLocalizedTitle(item, currentLang) : item.name)}</a></h3>';
if (dealsJs.includes(oldDealTitle)) {
  dealsJs = dealsJs.replace(oldDealTitle, newDealTitle);
  fs.writeFileSync(todaysDealsPath, dealsJs, 'utf8');
  console.log("Updated todays-deals.js title link");
}

// ============================================================================
// 5. Update best-sellers.js
// ============================================================================
const bestSellersPath = path.join(repoRoot, 'best-sellers.js');
let bestSellersJs = fs.readFileSync(bestSellersPath, 'utf8');

const oldBestSellerTitle = '<h3><a href="${detailUrl}">${escapeHtml(item.name)}</a></h3>';
const newBestSellerTitle = '<h3><a href="${detailUrl}">${escapeHtml(window.getLocalizedTitle ? window.getLocalizedTitle(item, currentLang) : item.name)}</a></h3>';
if (bestSellersJs.includes(oldBestSellerTitle)) {
  bestSellersJs = bestSellersJs.replace(oldBestSellerTitle, newBestSellerTitle);
  fs.writeFileSync(bestSellersPath, bestSellersJs, 'utf8');
  console.log("Updated best-sellers.js title link");
}

// ============================================================================
// 6. Update cart.js
// ============================================================================
const cartPath = path.join(repoRoot, 'cart.js');
let cartJs = fs.readFileSync(cartPath, 'utf8');

const oldCartTitle = '<h3 class="item-title"><a href="product-detail.html?id=${encodeURIComponent(row.id)}">${row.name}</a></h3>';
const newCartTitle = '<h3 class="item-title"><a href="product-detail.html?id=${encodeURIComponent(row.id)}">${window.getLocalizedTitle ? window.getLocalizedTitle(row, currentLang) : row.name}</a></h3>';
if (cartJs.includes(oldCartTitle)) {
  cartJs = cartJs.replace(oldCartTitle, newCartTitle);
  fs.writeFileSync(cartPath, cartJs, 'utf8');
  console.log("Updated cart.js title link");
}

// ============================================================================
// 7. Inject products-data.js and universal-i18n-bus.js across HTML files
// ============================================================================
const htmlFiles = [
  'product-detail.html',
  'index.html',
  'products.html',
  'todays-deals.html',
  'best-sellers.html',
  'cart.html',
  'checkout.html',
  'orders.html',
  'account.html',
  'laptop.html',
  'printer.html'
];

htmlFiles.forEach(file => {
  const filePath = path.join(repoRoot, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('products-data.js')) {
      if (content.includes('<script src="translations.js"></script>')) {
        content = content.replace(
          '<script src="translations.js"></script>',
          '<script src="translations.js"></script>\n  <script src="products-data.js"></script>\n  <script src="universal-i18n-bus.js"></script>'
        );
      } else if (content.includes('translations.js')) {
        content = content.replace(
          /<script[^>]*translations\.js[^>]*><\/script>/,
          '$&\n  <script src="products-data.js"></script>\n  <script src="universal-i18n-bus.js"></script>'
        );
      }
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Injected scripts into ${file}`);
    }
  }
});

console.log("All updates completed successfully!");
