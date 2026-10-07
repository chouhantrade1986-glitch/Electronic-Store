const fs = require('fs');
const path = require('path');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');

const PRODUCTS_PAGE_I18N = {
  en: {
    you_save: "You save:",
    free_delivery_tomorrow: "FREE delivery Tomorrow",
    apply_coupon: "Apply coupon",
    apply_coupon_prefix: "Apply",
    apply_coupon_suffix: "coupon",
    add_to_cart: "Add to Cart",
    quick_view: "Quick view",
    view_details: "View details",
    wishlist: "Wishlist",
    wishlisted: "Wishlisted",
    under: "Under",
    above: "Above",
    price_results: "Results",
    showing_products: "Showing products",
    by_brand: "by",
    mrp: "M.R.P.:",
    percent_off: "off",
    price_under_10k: "Under ₹10,000",
    price_10k_30k: "₹10k - ₹30k",
    price_30k_50k: "₹30k - ₹50k",
    price_above_50k: "Above ₹50k",
    only_left_stock: "Only {count} left in stock — order soon",
    new_arrival: "New arrival",
    bulk_value: "BULK VALUE",
    deal_badge: "DEAL",
    showing: "Showing",
    of: "of",
    products: "products"
  },
  hi: {
    you_save: "बचत:",
    free_delivery_tomorrow: "मुफ़्त डिलीवरी कल तक",
    apply_coupon: "कूपन लागू करें",
    apply_coupon_prefix: "लागू करें",
    apply_coupon_suffix: "कूपन",
    add_to_cart: "कार्ट में जोड़ें",
    quick_view: "क्विक व्यू",
    view_details: "विवरण देखें",
    wishlist: "विशलिस्ट",
    wishlisted: "विशलिस्टेड",
    under: "से कम",
    above: "से अधिक",
    price_results: "परिणाम",
    showing_products: "उत्पाद दिखाए जा रहे हैं",
    by_brand: "द्वारा",
    mrp: "एम.आर.पी.:",
    percent_off: "छूट",
    price_under_10k: "₹10,000 से कम",
    price_10k_30k: "₹10k - ₹30k",
    price_30k_50k: "₹30k - ₹50k",
    price_above_50k: "₹50,000 से अधिक",
    only_left_stock: "स्टॉक में केवल {count} बचे हैं — जल्द ऑर्डर करें",
    new_arrival: "नया आगमन",
    bulk_value: "बल्क वैल्यू",
    deal_badge: "डील",
    showing: "दिखाए जा रहे हैं",
    of: "में से",
    products: "उत्पाद"
  },
  ta: {
    you_save: "சேமிப்பு:",
    free_delivery_tomorrow: "நாளைக்குள் இலவச டெலிவரி",
    apply_coupon: "கூப்பனைப் பயன்படுத்து",
    apply_coupon_prefix: "பயன்படுத்து",
    apply_coupon_suffix: "கூப்பன்",
    add_to_cart: "கார்ட்டில் சேர்",
    quick_view: "விரைவுப் பார்வை",
    view_details: "விவரங்களைக் காண்க",
    wishlist: "விருப்பப்பட்டியல்",
    wishlisted: "விருப்பப்பட்டியலில் சேர்க்கப்பட்டது",
    under: "குறைவான",
    above: "அதிகமான",
    price_results: "முடிவுகள்",
    showing_products: "தயாரிப்புகள் காட்டப்படுகின்றன",
    by_brand: "வழங்குபவர்",
    mrp: "அ.சி.வி.:",
    percent_off: "தள்ளுபடி",
    price_under_10k: "₹10,000-க்குக் குறைவு",
    price_10k_30k: "₹10k - ₹30k",
    price_30k_50k: "₹30k - ₹50k",
    price_above_50k: "₹50,000-க்கு மேல்",
    only_left_stock: "இருப்பில் {count} மட்டுமே உள்ளன — உடனே ஆர்டர் செய்க",
    new_arrival: "புதிய வருகை",
    bulk_value: "மொத்த மதிப்பு",
    deal_badge: "டீல்",
    showing: "காட்டப்படுகிறது",
    of: "இல்",
    products: "தயாரிப்புகள்"
  },
  te: {
    you_save: "మీ ఆదా:",
    free_delivery_tomorrow: "రేపటికి ఉచిత డెలివరీ",
    apply_coupon: "కూపన్ వర్తింపజేయి",
    apply_coupon_prefix: "వర్తింపజేయి",
    apply_coupon_suffix: "కూపన్",
    add_to_cart: "కార్ట్‌కు జోడించు",
    quick_view: "త్వరిత వీక్షణ",
    view_details: "వివరాలు చూడండి",
    wishlist: "విష్‌లిస్ట్",
    wishlisted: "విష్‌లిస్ట్‌లో చేర్చబడింది",
    under: "తక్కువ",
    above: "ఎక్కువ",
    price_results: "ఫలితాలు",
    showing_products: "ఉత్పత్తులు చూపబడుతున్నాయి",
    by_brand: "ద్వారా",
    mrp: "గ.చి.ధర:",
    percent_off: "రాయితీ",
    price_under_10k: "₹10,000 లోపు",
    price_10k_30k: "₹10k - ₹30k",
    price_30k_50k: "₹30k - ₹50k",
    price_above_50k: "₹50,000 పైన",
    only_left_stock: "స్టాక్‌లో కేవలం {count} మాత్రమే మిగిలి ఉన్నాయి — వెంటనే ఆర్డర్ చేయండి",
    new_arrival: "కొత్త రాక",
    bulk_value: "బల్క్ విలువ",
    deal_badge: "డీల్",
    showing: "చూపుతోంది",
    of: "లో",
    products: "ఉత్పత్తులు"
  },
  kn: {
    you_save: "ನಿಮ್ಮ ಉಳಿತಾಯ:",
    free_delivery_tomorrow: "ನಾಳೆಯೊಳಗೆ ಉಚಿತ ವಿತರಣೆ",
    apply_coupon: "ಕೂಪನ್ ಅನ್ವಯಿಸಿ",
    apply_coupon_prefix: "ಅನ್ವಯಿಸಿ",
    apply_coupon_suffix: "ಕೂಪನ್",
    add_to_cart: "ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ",
    quick_view: "ತ್ವರಿತ ನೋಟ",
    view_details: "ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
    wishlist: "ವಿಶ್‌ಲಿಸ್ಟ್",
    wishlisted: "ವಿಶ್‌ಲಿಸ್ಟ್‌ನಲ್ಲಿದೆ",
    under: "ಒಳಗೆ",
    above: "ಮೇಲೆ",
    price_results: "ಫಲಿತಾಂಶಗಳು",
    showing_products: "ಉತ್ಪನ್ನಗಳನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ",
    by_brand: "ಮೂಲಕ",
    mrp: "ಗ.ಚಿ.ಬೆಲೆ:",
    percent_off: "ರಿಯಾಯಿತಿ",
    price_under_10k: "₹10,000 ಕ್ಕಿಂತ ಕಡಿಮೆ",
    price_10k_30k: "₹10k - ₹30k",
    price_30k_50k: "₹30k - ₹50k",
    price_above_50k: "₹50,000 ಕ್ಕಿಂತ ಹೆಚ್ಚು",
    only_left_stock: "ಸ್ಟಾಕ್‌ನಲ್ಲಿ {count} ಮಾತ್ರ ಉಳಿದಿದೆ — ತಕ್ಷಣ ಆರ್ಡರ್ ಮಾಡಿ",
    new_arrival: "ಹೊಸ ಆಗಮನ",
    bulk_value: "ಬಲ್ಕ್ ಮೌಲ್ಯ",
    deal_badge: "ಡೀಲ್",
    showing: "ತೋರಿಸಲಾಗುತ್ತಿದೆ",
    of: "ರಲ್ಲಿ",
    products: "ಉತ್ಪನ್ನಗಳು"
  },
  ml: {
    you_save: "ലാഭം:",
    free_delivery_tomorrow: "നാളെ സൗജന്യ ഡെലിവറി",
    apply_coupon: "കൂപ്പൺ പ്രയോഗിക്കുക",
    apply_coupon_prefix: "പ്രയോഗിക്കുക",
    apply_coupon_suffix: "കൂപ്പൺ",
    add_to_cart: "കാർട്ടിൽ ചേർക്കുക",
    quick_view: "ദ്രുത കാഴ്ച",
    view_details: "വിശദാംശങ്ങൾ കാണുക",
    wishlist: "വിഷ്‌ലിസ്റ്റ്",
    wishlisted: "വിഷ്‌ലിസ്റ്റിൽ ചേർത്തു",
    under: "താഴെ",
    above: "മുകളിൽ",
    price_results: "ഫലങ്ങൾ",
    showing_products: "ഉൽപ്പന്നങ്ങൾ കാണിക്കുന്നു",
    by_brand: "നിർമ്മാതാവ്",
    mrp: "എം.ആർ.പി.:",
    percent_off: "കിഴിവ്",
    price_under_10k: "₹10,000 ൽ താഴെ",
    price_10k_30k: "₹10k - ₹30k",
    price_30k_50k: "₹30k - ₹50k",
    price_above_50k: "₹50,000 ൽ കൂടുതൽ",
    only_left_stock: "സ്റ്റോക്കിൽ {count} എണ്ണം മാത്രം — ഉടൻ ഓർഡർ ചെയ്യുക",
    new_arrival: "പുതിയ വരവ്",
    bulk_value: "ബൾക്ക് മൂല്യം",
    deal_badge: "ഡീൽ",
    showing: "കാണിക്കുന്നത്",
    of: "ൽ",
    products: "ഉൽപ്പന്നങ്ങൾ"
  },
  bn: {
    you_save: "সঞ্চয়:",
    free_delivery_tomorrow: "কালকের মধ্যে ফ্রি ডেলিভারি",
    apply_coupon: "কুপন প্রয়োগ করুন",
    apply_coupon_prefix: "প্রয়োগ করুন",
    apply_coupon_suffix: "কুপন",
    add_to_cart: "কার্টে যোগ করুন",
    quick_view: "দ্রুত দেখুন",
    view_details: "বিস্তারিত দেখুন",
    wishlist: "উইশলিস্ট",
    wishlisted: "উইশলিস্টে যুক্ত",
    under: "কম",
    above: "বেশি",
    price_results: "ফলাফল",
    showing_products: "পণ্য দেখানো হচ্ছে",
    by_brand: "দ্বারা",
    mrp: "সর্বোচ্চ খুচরা মূল্য:",
    percent_off: "ছাড়",
    price_under_10k: "₹১০,০০০ এর নিচে",
    price_10k_30k: "₹১০k - ₹৩০k",
    price_30k_50k: "₹৩০k - ₹৫০k",
    price_above_50k: "₹৫০,০০০ এর উপরে",
    only_left_stock: "স্টকে মাত্র {count}টি অবশিষ্ট আছে — শীঘ্রই অর্ডার করুন",
    new_arrival: "নতুন আগমন",
    bulk_value: "বাল্ক মান",
    deal_badge: "ডিল",
    showing: "দেখানো হচ্ছে",
    of: "এর মধ্যে",
    products: "পণ্য"
  },
  mr: {
    you_save: "बचत:",
    free_delivery_tomorrow: "उद्यापर्यंत मोफत डिलिव्हरी",
    apply_coupon: "कूपन लागू करा",
    apply_coupon_prefix: "लागू करा",
    apply_coupon_suffix: "कूपन",
    add_to_cart: "कार्टमध्ये जोडा",
    quick_view: "क्विक व्ह्यू",
    view_details: "तपशील पहा",
    wishlist: "विशलिस्ट",
    wishlisted: "विशलिस्टमध्ये जोडले",
    under: "पेक्षा कमी",
    above: "पेक्षा जास्त",
    price_results: "निकाल",
    showing_products: "उत्पादने दाखवत आहे",
    by_brand: "द्वारे",
    mrp: "कमाल किरकोळ किंमत:",
    percent_off: "सूट",
    price_under_10k: "₹10,000 पेक्षा कमी",
    price_10k_30k: "₹10k - ₹30k",
    price_30k_50k: "₹30k - ₹50k",
    price_above_50k: "₹50,000 पेक्षा जास्त",
    only_left_stock: "स्टॉकमध्ये फक्त {count} शिल्लक आहेत — त्वरित ऑर्डर करा",
    new_arrival: "नवीन आगमन",
    bulk_value: "बल्क व्हॅल्यू",
    deal_badge: "डील",
    showing: "दाखवत आहे",
    of: "पैकी",
    products: "उत्पादने"
  },
  ur: {
    you_save: "بچت:",
    free_delivery_tomorrow: "کل تک مفت ترسیل",
    apply_coupon: "کوپن لاگو کریں",
    apply_coupon_prefix: "لاگو کریں",
    apply_coupon_suffix: "کوپن",
    add_to_cart: "کارٹ میں شامل کریں",
    quick_view: "فوری منظر",
    view_details: "تفصیلات دیکھیں",
    wishlist: "خواہشات کی فہرست",
    wishlisted: "فہرست میں شامل",
    under: "سے کم",
    above: "سے زیادہ",
    price_results: "نتائج",
    showing_products: "مصنوعات دکھائی جا رہی ہیں",
    by_brand: "منجانب",
    mrp: "زیادہ سے زیادہ خوردہ قیمت:",
    percent_off: "رعایت",
    price_under_10k: "₹10,000 سے کم",
    price_10k_30k: "₹10k - ₹30k",
    price_30k_50k: "₹30k - ₹50k",
    price_above_50k: "₹50,000 سے زیادہ",
    only_left_stock: "اسٹاک میں صرف {count} باقی ہیں — جلدی آرڈر کریں",
    new_arrival: "نئی آمد",
    bulk_value: "بلک ویلیو",
    deal_badge: "ڈیل",
    showing: "دکھائے جا رہے ہیں",
    of: "میں سے",
    products: "مصنوعات"
  },
  pa: {
    you_save: "ਬੱਚਤ:",
    free_delivery_tomorrow: "ਕੱਲ੍ਹ ਤੱਕ ਮੁਫ਼ਤ ਡਿਲਿਵਰੀ",
    apply_coupon: "ਕੂਪਨ ਲਾਗੂ ਕਰੋ",
    apply_coupon_prefix: "ਲਾਗੂ ਕਰੋ",
    apply_coupon_suffix: "ਕੂਪਨ",
    add_to_cart: "ਕਾਰਟ ਵਿੱਚ ਸ਼ਾਮਲ ਕਰੋ",
    quick_view: "ਤੇਜ਼ ਝਲਕ",
    view_details: "ਵੇਰਵੇ ਦੇਖੋ",
    wishlist: "ਵਿਸ਼ਲਿਸਟ",
    wishlisted: "ਵਿਸ਼ਲਿਸਟ ਵਿੱਚ ਸ਼ਾਮਲ",
    under: "ਤੋਂ ਘੱਟ",
    above: "ਤੋਂ ਵੱਧ",
    price_results: "ਨਤੀਜੇ",
    showing_products: "ਉਤਪਾਦ ਦਿਖਾਏ ਜਾ ਰਹੇ ਹਨ",
    by_brand: "ਦੁਆਰਾ",
    mrp: "ਵੱਧ ਤੋਂ ਵੱਧ ਪ੍ਰਚੂਨ ਕੀਮਤ:",
    percent_off: "ਛੋਟ",
    price_under_10k: "₹10,000 ਤੋਂ ਘੱਟ",
    price_10k_30k: "₹10k - ₹30k",
    price_30k_50k: "₹30k - ₹50k",
    price_above_50k: "₹50,000 ਤੋਂ ਵੱਧ",
    only_left_stock: "ਸਟਾਕ ਵਿੱਚ ਸਿਰਫ਼ {count} ਬਚੇ ਹਨ — ਜਲਦੀ ਆਰਡਰ ਕਰੋ",
    new_arrival: "ਨਵਾਂ ਆਗਮਨ",
    bulk_value: "ਬਲਕ ਮੁੱਲ",
    deal_badge: "ਡੀਲ",
    showing: "ਦਿਖਾਇਆ ਜਾ ਰਿਹਾ ਹੈ",
    of: "ਵਿੱਚੋਂ",
    products: "ਉਤਪਾਦ"
  },
  gu: {
    you_save: "બચત:",
    free_delivery_tomorrow: "કાલ સુધીમાં મફત ડિલિવરી",
    apply_coupon: "કૂપન લાગુ કરો",
    apply_coupon_prefix: "લાગુ કરો",
    apply_coupon_suffix: "કૂપન",
    add_to_cart: "કાર્ટમાં ઉમેરો",
    quick_view: "ઝડપી જુઓ",
    view_details: "વિગતો જુઓ",
    wishlist: "વિશલિસ્ટ",
    wishlisted: "વિશલિસ્ટમાં ઉમેરાયેલ",
    under: "થી ઓછું",
    above: "થી વધુ",
    price_results: "પરિણામો",
    showing_products: "પ્રોડક્ટ્સ દર્શાવી રહ્યા છીએ",
    by_brand: "દ્વારા",
    mrp: "મહત્તમ છૂટક કિંમત:",
    percent_off: "છૂટ",
    price_under_10k: "₹10,000 થી ઓછું",
    price_10k_30k: "₹10k - ₹30k",
    price_30k_50k: "₹30k - ₹50k",
    price_above_50k: "₹50,000 થી વધુ",
    only_left_stock: "સ્ટોકમાં ફક્ત {count} બાકી છે — ઝડપથી ઓર્ડર કરો",
    new_arrival: "નવા આગમન",
    bulk_value: "બલ્ક વેલ્યુ",
    deal_badge: "ડીલ",
    showing: "દર્શાવી રહ્યું છે",
    of: "માંથી",
    products: "પ્રોડક્ટ્સ"
  }
};

// 1. Update translations.js
const transPath = path.join(projectDir, 'translations.js');
let transCode = fs.readFileSync(transPath, 'utf8');

const marker = 'window.EM_TRANSLATIONS = translations;';
const injection = `
  // Merge products page translations across all 11 languages
  const PRODUCTS_PAGE_I18N = ${JSON.stringify(PRODUCTS_PAGE_I18N, null, 2)};
  Object.keys(PRODUCTS_PAGE_I18N).forEach((lang) => {
    if (translations[lang]) {
      Object.assign(translations[lang], PRODUCTS_PAGE_I18N[lang]);
    }
  });

  ${marker}`;

if (transCode.includes(marker)) {
  transCode = transCode.replace(marker, injection);
}

// Add renderProductsList trigger in applyFullPageTranslation
const renderCall = `
    if (typeof window.renderProductsList === "function" && window.allLoadedProducts) {
      window.renderProductsList(window.allLoadedProducts);
    } else if (typeof window.reapplyProductFilters === "function") {
      window.reapplyProductFilters();
    }`;

if (!transCode.includes('window.renderProductsList')) {
  transCode = transCode.replace(
    'if (typeof window.renderBestSellers === "function") {\n      window.renderBestSellers(selectedLang);\n    }',
    'if (typeof window.renderBestSellers === "function") {\n      window.renderBestSellers(selectedLang);\n    }' + renderCall
  );
}

fs.writeFileSync(transPath, transCode, 'utf8');
console.log('Successfully updated translations.js with products page translations');

// 2. Update products.html with data-i18n on price presets
const prodHtmlPath = path.join(projectDir, 'products.html');
let prodHtml = fs.readFileSync(prodHtmlPath, 'utf8');

prodHtml = prodHtml.replace(
  '<button class="price-preset-btn" data-min="0" data-max="10000">Under ₹10,000</button>',
  '<button class="price-preset-btn" data-min="0" data-max="10000" data-i18n="price_under_10k">Under ₹10,000</button>'
);
prodHtml = prodHtml.replace(
  '<button class="price-preset-btn" data-min="10000" data-max="30000">₹10k - ₹30k</button>',
  '<button class="price-preset-btn" data-min="10000" data-max="30000" data-i18n="price_10k_30k">₹10k - ₹30k</button>'
);
prodHtml = prodHtml.replace(
  '<button class="price-preset-btn" data-min="30000" data-max="50000">₹30k - ₹50k</button>',
  '<button class="price-preset-btn" data-min="30000" data-max="50000" data-i18n="price_30k_50k">₹30k - ₹50k</button>'
);
prodHtml = prodHtml.replace(
  '<button class="price-preset-btn" data-min="50000" data-max="200000">Above ₹50k</button>',
  '<button class="price-preset-btn" data-min="50000" data-max="200000" data-i18n="price_above_50k">Above ₹50k</button>'
);

fs.writeFileSync(prodHtmlPath, prodHtml, 'utf8');
console.log('Successfully updated products.html with price preset data-i18n tags');

// 3. Update products.js productCard function to use i18n
const prodJsPath = path.join(projectDir, 'products.js');
let prodJs = fs.readFileSync(prodJsPath, 'utf8');

const oldProductCard = /function productCard\(product\) \{[\s\S]*?\n\}/;
const newProductCard = `function productCard(product) {
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : ((window.EM_TRANSLATIONS && window.EM_TRANSLATIONS.en) ? window.EM_TRANSLATIONS.en : {});

  const segment = product.segment || "b2c";
  const image = normalizeImageUrl(product.image) || fallbackImage();
  const ribbon = getRibbonLabel(product);
  const wishlisted = isWishlisted(product.id);
  const listPrice = Number(product.listPrice || product.price || 0);
  const price = Number(product.price || 0);
  const rating = Number(product.rating || 0);
  const stock = Number(product.stock);
  const reviewCount = getReviewCount(product);
  const discountPercent = listPrice > price ? Math.round(((listPrice - price) / listPrice) * 100) : 0;
  const savings = listPrice > price ? (listPrice - price) : 0;
  const onImageError = "handleProductImageError(this)";
  const couponAmount = isCouponEligible(product);

  /* --- Ribbon / Badge --- */
  let ribbonLabel = ribbon ? ribbon.label : "";
  if (ribbonLabel === "BEST SELLER") {
    ribbonLabel = t.badge_best_seller || "BEST SELLER";
  } else if (ribbonLabel === "DEAL") {
    ribbonLabel = t.deal_badge || "DEAL";
  } else if (ribbonLabel === "BULK VALUE") {
    ribbonLabel = t.bulk_value || "BULK VALUE";
  }
  const ribbonHtml = ribbon
    ? \`<span class="card-ribbon \${ribbon.cssClass}">\${ribbonLabel}</span>\`
    : "";

  /* --- Star characters --- */
  const starChars = rating > 0 ? renderStarCharacters(rating) : "";

  /* --- Rating row --- */
  let ratingHtml = "";
  if (rating > 0) {
    ratingHtml = \`
      <div class="rating-row">
        <span class="rating-stars-display">\${starChars}</span>
        <span class="rating-value-text">\${rating.toFixed(1)}</span>
        <span class="rating-count-link">(\${reviewCount.toLocaleString("en-IN")})</span>
      </div>\`;
  } else {
    ratingHtml = \`
      <div class="rating-row">
        <span class="rating-count-link" style="color: #007185; font-size: 12px;">\${t.new_arrival || "New arrival"}</span>
      </div>\`;
  }

  /* --- Price section --- */
  let priceHtml = \`
    <div class="price-section">
      <div class="price-current-amazon">
        <span class="price-symbol">\u20B9</span>\${price.toLocaleString("en-IN")}
      </div>\`;
  if (discountPercent > 0) {
    priceHtml += \`
      <div class="price-mrp-row">
        <span class="mrp-label">\${t.mrp || "M.R.P.:"}</span>
        <span class="mrp-value">\u20B9\${listPrice.toLocaleString("en-IN")}</span>
        <span class="price-discount-tag">(\${discountPercent}% \${t.percent_off || "off"})</span>
      </div>\`;
    if (savings > 0) {
      priceHtml += \`<div class="price-savings-row">\${t.you_save || "You save:"} \u20B9\${savings.toLocaleString("en-IN")}</div>\`;
    }
  }
  priceHtml += \`</div>\`;

  /* --- Coupon checkbox --- */
  let couponHtml = "";
  if (couponAmount) {
    couponHtml = \`
      <label class="card-coupon-box">
        <input type="checkbox" class="card-coupon-checkbox" data-product-id="\${product.id}" data-coupon-amount="\${couponAmount}" />
        <span class="card-coupon-text">\${t.apply_coupon_prefix || "Apply"} <strong>\u20B9\${couponAmount}</strong> \${t.apply_coupon_suffix || "coupon"}</span>
      </label>\`;
  }

  /* --- Stock urgency --- */
  let stockUrgencyHtml = "";
  if (Number.isFinite(stock) && stock > 0 && stock <= 5) {
    const urgencyText = t.only_left_stock
      ? t.only_left_stock.replace("{count}", stock)
      : \`Only \${stock} left in stock \u2014 order soon\`;
    stockUrgencyHtml = \`<div class="card-stock-urgency">\${urgencyText}</div>\`;
  }

  /* --- Delivery promise --- */
  const deliveryHtml = segment === "b2c"
    ? \`<div class="card-delivery-promise">
        <span class="delivery-truck-icon">\uD83D\uDE9A</span>
        <span class="delivery-text-fast">\${t.free_delivery_tomorrow || "FREE delivery Tomorrow"}</span>
      </div>\`
    : \`<div class="card-delivery-promise">
        <span class="delivery-truck-icon">\uD83D\uDCE6</span>
        <span class="delivery-text-free">Business delivery options available</span>
      </div>\`;

  /* --- Bulk note --- */
  const bulkMeta = segment === "b2b" && product.moq
    ? \`<p class="bulk-note">MOQ: \${product.moq} units \u2022 Bulk pricing available</p>\`
    : "";

  /* --- Brand line --- */
  const brandHtml = \`<p class="product-brand" style="margin:0;font-size:12px;color:#565959;">\${t.by_brand || "by"} <a href="\${brandStoreUrl(product.brand || "ElectroMart")}" style="color:#007185;text-decoration:none;">\${product.brand || "ElectroMart"}</a></p>\`;

  return \`
    <article class="product-card">
      \${ribbonHtml}
      <a class="product-card-media" href="product-detail.html?id=\${encodeURIComponent(product.id)}">
        <img src="\${image}" alt="\${product.name}" loading="lazy" onerror="\${onImageError}" />
      </a>
      <div class="content">
        \${brandHtml}
        <h3><a class="title-link" href="product-detail.html?id=\${encodeURIComponent(product.id)}">\${product.name}</a></h3>
        \${ratingHtml}
        \${priceHtml}
        \${couponHtml}
        \${deliveryHtml}
        \${stockUrgencyHtml}
        \${bulkMeta}
        <div class="card-atc-row">
          <button class="card-atc-btn" data-id="\${product.id}" data-name="\${product.name}" data-price="\${Number(product.price || 0)}" data-image="\${image}" type="button">
            <span class="atc-icon">\uD83D\uDED2</span> \${t.add_to_cart || "Add to Cart"}
          </button>
          <button class="card-quick-view-link" data-quick-view-id="\${product.id}" type="button">\${t.quick_view || "Quick view"}</button>
        </div>
        <div class="card-links-row">
          <a class="view-link" href="product-detail.html?id=\${encodeURIComponent(product.id)}">\${t.view_details || "View details"}</a>
          <button class="wishlist-btn \${wishlisted ? "active" : ""}" data-wishlist-id="\${product.id}" type="button"><span class="heart-icon">\${wishlisted ? "\u2665" : "\u2661"}</span> \${wishlisted ? (t.wishlisted || "Wishlisted") : (t.wishlist || "Wishlist")}</button>
        </div>
      </div>
    </article>
  \`;
}`;

prodJs = prodJs.replace(oldProductCard, newProductCard);

// Also update renderProducts to save window.allLoadedProducts and expose window.renderProductsList
const oldRenderProducts = /function renderProducts\(list\) \{[\s\S]*?productsGrid\.innerHTML = visibleItems\.map\(productCard\)\.join\(""\);/;
const newRenderProducts = `function renderProducts(list) {
  lastRenderedProducts = list.slice();
  fullResultSet = list.slice();
  window.allLoadedProducts = fullResultSet;
  window.renderProductsList = (items) => {
    if (Array.isArray(items) && items.length) {
      renderProducts(items);
    } else {
      renderProducts(fullResultSet);
    }
  };
  setProductsGridBusy(false);

  if (!list.length) {
    productsGrid.innerHTML = renderZeroResultsState();
    if (resultsFooter) {
      resultsFooter.hidden = true;
    }
    syncQuickViewDrawerTargets();
    return;
  }

  visibleResultCount = Math.min(list.length, Math.max(PRODUCTS_INITIAL_RENDER_LIMIT, visibleResultCount || 0));
  const visibleItems = list.slice(0, visibleResultCount);
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : {};
  resultMeta.textContent = \`\${t.showing || "Showing"} \${visibleItems.length} \${t.of || "of"} \${list.length} \${t.products || "products"}\`;
  productsGrid.innerHTML = visibleItems.map(productCard).join("");`;

prodJs = prodJs.replace(oldRenderProducts, newRenderProducts);

fs.writeFileSync(prodJsPath, prodJs, 'utf8');
console.log('Successfully updated products.js with dynamic i18n productCard');
