const fs = require('fs');
const path = require('path');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');

// 1. New card & spec keys across all 11 languages
const QUICK_I18N = {
  en: {
    partner_card_cashback: "Extra 5% cashback with partner cards on eligible orders.",
    warranty_subtext: "1 Year manufacturer warranty + service center support.",
    no_cost_emi_subtext: "No Cost EMI options available.",
    exchange_offer_subtext: "Exchange your old device and get instant discount.",
    partner_offer_subtext: "GST invoice available and business purchase support.",
    free_delivery_subtext: "FREE delivery by tomorrow in select cities.",
    return_subtext: "7-day replacement, no-questions-asked for defective items.",
    seller_subtext: "Authorized Seller | GST invoice available.",
    spec_high_performance: "High performance processor",
    spec_ssd_storage: "SSD storage",
    spec_battery_life: "Long battery life"
  },
  hi: {
    partner_card_cashback: "पार्टनर कार्ड के साथ अतिरिक्त 5% कैशबैक.",
    warranty_subtext: "1 वर्ष की निर्माता वारंटी + सेवा केंद्र सहायता.",
    no_cost_emi_subtext: "नो कॉस्ट ईएमआई विकल्प उपलब्ध.",
    exchange_offer_subtext: "पुराना डिवाइस एक्सचेंज करें और छूट पाएं.",
    partner_offer_subtext: "जीएसटी चालान और बिज़नेस खरीद सहायता उपलब्ध.",
    free_delivery_subtext: "चुनिंदा शहरों में कल तक मुफ़्त डिलीवरी.",
    return_subtext: "7 दिनों का रिप्लेसमेंट, बिना किसी सवाल के.",
    seller_subtext: "अधिकृत सेलर | जीएसटी इनवॉइस उपलब्ध.",
    spec_high_performance: "उच्च प्रदर्शन प्रोसेसर",
    spec_ssd_storage: "एसएसडी स्टोरेज",
    spec_battery_life: "लंबी बैटरी लाइफ"
  },
  ta: {
    partner_card_cashback: "பார்ட்னர் கார்டுகளுடன் கூடுதல் 5% கேஷ்பேக்.",
    warranty_subtext: "1 ஆண்டு உற்பத்தியாளர் உத்தரவாதம் + சேவை மைய ஆதரவு.",
    no_cost_emi_subtext: "நோ காஸ்ட் இஎம்ஐ விருப்பங்கள் உள்ளன.",
    exchange_offer_subtext: "பழைய சாதனத்தை மாற்றி உடனடி தள்ளுபடி பெறுங்கள்.",
    partner_offer_subtext: "ஜிஎஸ்டி இன்வாய்ஸ் மற்றும் வணிக ஆதரவு உள்ளது.",
    free_delivery_subtext: "தேர்ந்தெடுக்கப்பட்ட நகரங்களில் நாளைக்குள் இலவச டெலிவரி.",
    return_subtext: "குறைபாடுள்ள பொருட்களுக்கு 7 நாள் மாற்று வசதி.",
    seller_subtext: "அங்கீகரிக்கப்பட்ட விற்பனையாளர் | ஜிஎஸ்டி இன்வாய்ஸ் உள்ளது.",
    spec_high_performance: "உயர் செயல்திறன் செயலி",
    spec_ssd_storage: "எஸ்எஸ்டி சேமிப்பு",
    spec_battery_life: "நீண்ட பேட்டரி ஆயுள்"
  },
  te: {
    partner_card_cashback: "భాగస్వామి కార్డ్‌లతో అదనపు 5% క్యాష్‌బ్యాక్.",
    warranty_subtext: "1 సంవత్సరం తయారీదారు వారంటీ + సర్వీస్ సెంటర్ మద్దతు.",
    no_cost_emi_subtext: "నో కాస్ట్ ఈఎంఐ ఎంపికలు అందుబాటులో ఉన్నాయి.",
    exchange_offer_subtext: "పాత పరికరాన్ని ఎక్స్ఛేంజ్ చేసి తక్షణ తగ్గింపు పొందండి.",
    partner_offer_subtext: "జీఎస్టీ ఇన్‌వాయిస్ మరియు వ్యాపార కొనుగోలు మద్దతు ఉంది.",
    free_delivery_subtext: "ఎంచుకున్న నగరాల్లో రేపటిలోగా ఉచిత డెలివరీ.",
    return_subtext: "లోపభూయిష్ట వస్తువులకు 7 రోజుల భర్తీ సదుపాయం.",
    seller_subtext: "అధీకృత విక్రేత | జీఎస్టీ ఇన్‌వాయిస్ అందుబాటులో ఉంది.",
    spec_high_performance: "అధిక పనితీరు ప్రాసెసర్",
    spec_ssd_storage: "ఎస్‌ఎస్‌డీ నిల్వ",
    spec_battery_life: "సుదీర్ఘ బ్యాటరీ లైఫ్"
  },
  kn: {
    partner_card_cashback: "ಪಾಲುದಾರ ಕಾರ್ಡ್‌ಗಳೊಂದಿಗೆ ಹೆಚ್ಚುವರಿ 5% ಕ್ಯಾಶ್‌ಬ್ಯಾಕ್.",
    warranty_subtext: "1 ವರ್ಷ ತಯಾರಕರ ವಾರಂಟಿ + ಸೇವಾ ಕೇಂದ್ರ ಬೆಂಬಲ.",
    no_cost_emi_subtext: "ನೋ ಕಾಸ್ಟ್ ಇಎಂಐ ಆಯ್ಕೆಗಳು ಲಭ್ಯವಿವೆ.",
    exchange_offer_subtext: "ಹಳೆಯ ಸಾಧನವನ್ನು ವಿನಿಮಯ ಮಾಡಿ ತಕ್ಷಣದ ರಿಯಾಯಿತಿ ಪಡೆಯಿರಿ.",
    partner_offer_subtext: "ಜಿಎಸ್‌ಟಿ ಇನ್‌ವಾಯ್ಸ್ ಮತ್ತು ವ್ಯಾಪಾರ ಖರೀದಿ ಬೆಂಬಲ ಲಭ್ಯವಿದೆ.",
    free_delivery_subtext: "ಆಯ್ದ ನಗರಗಳಲ್ಲಿ ನಾಳೆಯೊಳಗೆ ಉಚಿತ ಡೆಲಿವರಿ.",
    return_subtext: "ದೋಷಪೂರಿತ ವಸ್ತುಗಳಿಗೆ 7 ದಿನಗಳ ಬದಲಿ ಸೌಲಭ್ಯ.",
    seller_subtext: "ಅಧಿಕೃತ ಮಾರಾಟಗಾರರು | ಜಿಎಸ್‌ಟಿ ಇನ್‌ವಾಯ್ಸ್ ಲಭ್ಯವಿದೆ.",
    spec_high_performance: "ಉನ್ನತ ಕಾರ್ಯಕ್ಷಮತೆಯ ಪ್ರೊಸೆಸರ್",
    spec_ssd_storage: "ಎಸ್‌ಎಸ್‌ಡಿ ಸಂಗ್ರಹಣೆ",
    spec_battery_life: "ದೀರ್ಘ ಬ್ಯಾಟರಿ ಬಾಳಿಕೆ"
  },
  ml: {
    partner_card_cashback: "പാർട്ണർ കാർഡുകളിൽ അധിക 5% ക്യാഷ്ബാക്ക്.",
    warranty_subtext: "1 വർഷത്തെ നിർമ്മാതാവിന്റെ വാറന്റി + സർവീസ് സെന്റർ പിന്തുണ.",
    no_cost_emi_subtext: "നോ കോസ്റ്റ് ഇഎംഐ ഓപ്ഷനുകൾ ലഭ്യമാണ്.",
    exchange_offer_subtext: "പഴയ ഉപകരണം മാറ്റി വാങ്ങി തൽക്ഷണ കിഴിവ് നേടുക.",
    partner_offer_subtext: "ജിഎസ്ടി ഇൻവോയ്സും ബിസിനസ്സ് വാങ്ങൽ പിന്തുണയും ലഭ്യമാണ്.",
    free_delivery_subtext: "തിരഞ്ഞെടുത്ത നഗരങ്ങളിൽ നാളെയോടെ സൗജന്യ ഡെലിവറി.",
    return_subtext: "തകരാറുള്ള ഇനങ്ങൾക്കായി 7 ദിവസത്തെ റീപ്ലേസ്‌മെന്റ്.",
    seller_subtext: "അംഗീകൃത വിൽപ്പനക്കാരൻ | ജിഎസ്ടി ഇൻവോയ്സ് ലഭ്യമാണ്.",
    spec_high_performance: "ഉയർന്ന പ്രകടന പ്രൊസസ്സർ",
    spec_ssd_storage: "എസ്എസ്ഡി സ്റ്റോറേജ്",
    spec_battery_life: "നീണ്ട ബാറ്ററി ലൈഫ്"
  },
  bn: {
    partner_card_cashback: "পার্টনার কার্ডের সাথে অতিরিক্ত 5% ক্যাশব্যাক।",
    warranty_subtext: "1 বছরের প্রস্তুতকারকের ওয়ারেন্টি + পরিষেবা কেন্দ্র সহায়তা।",
    no_cost_emi_subtext: "নো কস্ট ইএমআই বিকল্প উপলব্ধ।",
    exchange_offer_subtext: "পুরোনো ডিভাইস এক্সচেঞ্জ করুন এবং তাত্ক্ষণিক ছাড় পান।",
    partner_offer_subtext: "জিএসটি ইনভয়েস এবং ব্যবসায়িক ক্রয়ের সহায়তা উপলব্ধ।",
    free_delivery_subtext: "নির্বাচিত শহরে কালকের মধ্যে বিনামূল্যে ডেলিভারি।",
    return_subtext: "ত্রুটিপূর্ণ পণ্যের জন্য 7 দিনের রিপ্লেসমেন্ট।",
    seller_subtext: "অনুমোদিত বিক্রেতা | জিএসটি ইনভয়েস উপলব্ধ।",
    spec_high_performance: "উচ্চ পারফরম্যান্স প্রসেসর",
    spec_ssd_storage: "এসএসডি স্টোরেজ",
    spec_battery_life: "দীর্ঘ ব্যাটারি লাইফ"
  },
  mr: {
    partner_card_cashback: "पार्टनर कार्डसह अतिरिक्त 5% कॅशबॅक.",
    warranty_subtext: "1 वर्षाची निर्माता वॉरंटी + सेवा केंद्र समर्थन.",
    no_cost_emi_subtext: "नो कॉस्ट ईएमआय पर्याय उपलब्ध.",
    exchange_offer_subtext: "जुने डिव्हाइस एक्सचेंज करा आणि त्वरित सूट मिळवा.",
    partner_offer_subtext: "जीएसटी इनव्हॉइस आणि बिझनेस खरेदी समर्थन उपलब्ध.",
    free_delivery_subtext: "निवडक शहरांमध्ये उद्यापर्यंत मोफत डिलिव्हरी.",
    return_subtext: "त्रुटिपूर्ण वस्तूंसाठी 7 दिवसांची रिप्लेसमेंट सुविधा.",
    seller_subtext: "अधिकृत विक्रेता | जीएसटी इनव्हॉइस उपलब्ध.",
    spec_high_performance: "उच्च कार्यक्षमता प्रोसेसर",
    spec_ssd_storage: "एसएसडी स्टोरेज",
    spec_battery_life: "दीर्घ बॅटरी आयुष्य"
  },
  ur: {
    partner_card_cashback: "پارٹنر کارڈز پر اضافی 5% کیش بیک۔",
    warranty_subtext: "1 سال مینوفیکچرر وارنٹی + سروس سینٹر سپورٹ۔",
    no_cost_emi_subtext: "نو کاسٹ ای ایم آئی آپشن دستیاب ہے۔",
    exchange_offer_subtext: "اپنا پرانا آلہ ایکسچینج کریں اور فوری رعایت حاصل کریں۔",
    partner_offer_subtext: "جی ایس ٹی انوائس اور کاروباری خریداری کی معاونت دستیاب ہے۔",
    free_delivery_subtext: "منتخب شہروں میں کل تک مفت ڈیلیوری۔",
    return_subtext: "خراب اشیاء کے لیے 7 دن کی تبدیلی کی سہولت۔",
    seller_subtext: "مجاز ڈیلر | جی ایس ٹی انوائس دستیاب ہے۔",
    spec_high_performance: "اعلی کارکردگی پروسیسر",
    spec_ssd_storage: "ایس ایس ڈی اسٹوریج",
    spec_battery_life: "لمبی بیٹری کی زندگی"
  },
  pa: {
    partner_card_cashback: "ਪਾਰਟਨਰ ਕਾਰਡਾਂ ਨਾਲ ਵਾਧੂ 5% ਕੈਸ਼ਬੈਕ।",
    warranty_subtext: "1 ਸਾਲ ਦੀ ਨਿਰਮਾਤਾ ਵਾਰੰਟੀ + ਸੇਵਾ ਕੇਂਦਰ ਸਹਾਇਤਾ।",
    no_cost_emi_subtext: "ਨੋ ਕਾਸਟ ਈਐਮਆਈ ਵਿਕਲਪ ਉਪਲਬਧ ਹਨ।",
    exchange_offer_subtext: "ਪੁਰਾਣਾ ਡਿਵਾਈਸ ਐਕਸਚੇਂਜ ਕਰੋ ਅਤੇ ਤੁਰੰਤ ਛੋਟ ਪ੍ਰਾਪਤ ਕਰੋ।",
    partner_offer_subtext: "ਜੀਐਸਟੀ ਇਨਵੌਇਸ ਅਤੇ ਕਾਰੋਬਾਰੀ ਖਰੀਦ ਸਹਾਇਤਾ ਉਪਲਬਧ ਹੈ।",
    free_delivery_subtext: "ਚੋਣਵੇਂ ਸ਼ਹਿਰਾਂ ਵਿੱਚ ਕੱਲ੍ਹ ਤੱਕ ਮੁਫ਼ਤ ਡਿਲਿਵਰੀ।",
    return_subtext: "ਨੁਕਸਦਾਰ ਵਸਤੂਆਂ ਲਈ 7 ਦਿਨਾਂ ਦਾ ਬਦਲ ਉਪਲਬਧ ਹੈ।",
    seller_subtext: "ਅਧਿਕਾਰਤ ਵਿਕਰੇਤਾ | ਜੀਐਸਟੀ ਇਨਵੌਇਸ ਉਪਲਬਧ ਹੈ।",
    spec_high_performance: "ਉੱਚ ਪ੍ਰਦਰਸ਼ਨ ਪ੍ਰੋਸੈਸਰ",
    spec_ssd_storage: "ਐਸਐਸਡੀ ਸਟੋਰੇਜ",
    spec_battery_life: "ਲੰਬੀ ਬੈਟਰੀ ਲਾਈਫ"
  },
  gu: {
    partner_card_cashback: "પાર્ટનર કાર્ડ્સ પર વધારાનો 5% કેશબેક.",
    warranty_subtext: "1 વર્ષની ઉત્પાદક વોરંટી + સેવા કેન્દ્ર સહાય.",
    no_cost_emi_subtext: "નો કોસ્ટ ઇએમઆઇ વિકલ્પો ઉપલબ્ધ છે.",
    exchange_offer_subtext: "જૂનું ડિવાઇસ એક્સચેન્જ કરો અને ત્વરિત ડિસ્કાઉન્ટ મેળવો.",
    partner_offer_subtext: "જીએસટી ઇનવોઇસ અને બિઝનેસ ખરીદી સહાય ઉપલબ્ધ છે.",
    free_delivery_subtext: "પસંદ કરેલા શહેરોમાં આવતીકાલ સુધી મફત ડિલિવરી.",
    return_subtext: "ખામીયુક્ત વસ્તુઓ માટે 7 દિવસમાં બદલી સુવિધા.",
    seller_subtext: "અધિકૃત વેચનાર | જીએસટી ઇનવોઇસ ઉપલબ્ધ છે.",
    spec_high_performance: "ઉચ્ચ પ્રદર્શન પ્રોસેસર",
    spec_ssd_storage: "એસએસડી સ્ટોરેજ",
    spec_battery_life: "લાંબી બેટરી લાઇફ"
  }
};

// 1. Update translations.js
const transPath = path.join(projectDir, 'translations.js');
let transContent = fs.readFileSync(transPath, 'utf8');

Object.keys(QUICK_I18N).forEach((lang) => {
  const keys = QUICK_I18N[lang];
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
console.log("Successfully updated translations.js with all quick i18n keys!");

// 2. Update product-detail.html
const htmlPath = path.join(projectDir, 'product-detail.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');
const isHtmlCRLF = htmlContent.includes('\r\n');
let normHtml = htmlContent.replace(/\r\n/g, '\n');

// 2A. Add productQuickMeta ID support to stock-meta
normHtml = normHtml.replace(
  '<p id="productStockMeta" class="stock-meta"></p>',
  '<p id="productStockMeta" class="stock-meta" data-alias="productQuickMeta"></p>'
);

// 2B. Add aboutItemBulletList ID support to productSpecs
normHtml = normHtml.replace(
  '<ul id="productSpecs" class="spec-list"></ul>',
  '<ul id="productSpecs" class="spec-list" data-alias="aboutItemBulletList"></ul>'
);

htmlContent = isHtmlCRLF ? normHtml.replace(/\n/g, '\r\n') : normHtml;
fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log("Successfully updated product-detail.html with data aliases!");

// 3. Update product-detail.js
const jsPath = path.join(projectDir, 'product-detail.js');
let jsContent = fs.readFileSync(jsPath, 'utf8');
const isJsCRLF = jsContent.includes('\r\n');
let jsNorm = jsContent.replace(/\r\n/g, '\n');

// 3A. Update renderProduct stock meta string
const oldStockMeta = `  productStockMeta.textContent = \`Stock: \${stockCount == null ? "Available" : stockCount} | Status: \${String(product.status || "active").toUpperCase()} | Fulfillment: \${String(product.fulfillment || "fbm").toUpperCase()}\`;`;

const newStockMeta = `  const statusUpper = String(product.status || "active").toUpperCase();
  const statusMap = {
    ACTIVE: t.val_active || "सक्रिय",
    INACTIVE: t.val_inactive || "निष्क्रिय"
  };
  const metaRow = document.getElementById("productQuickMeta") || productStockMeta;
  if (metaRow) {
    metaRow.innerHTML = \`\${t.tbl_stock || "उपलब्ध स्टॉक"}: \${stockCount == null ? (t.val_available || "उपलब्ध") : stockCount} | \${t.tbl_status || "स्थिति"}: \${statusMap[statusUpper] || statusUpper} | \${t.tbl_fulfillment || "फुलफिलमेंट"}: \${String(product.fulfillment || "fbm").toUpperCase()}\`;
  }`;

jsNorm = jsNorm.replace(oldStockMeta, newStockMeta);

// 3B. Update bullet points rendering & bulletMap in renderProduct
const oldSpecsBlock = `  const defaultSpecs = specMap[productCategoryFamily] || ["Quality assured", "Trusted by customers", "Fast delivery options"];
  const keywordSpecs = Array.isArray(product.keywords) ? product.keywords.slice(0, 6) : [];
  const specs = keywordSpecs.length ? keywordSpecs : defaultSpecs;
  productSpecs.innerHTML = specs.map((spec) => \`<li>\${localizeSpec(spec, t)}</li>\`).join("");`;

const newSpecsBlock = `  const defaultSpecs = specMap[productCategoryFamily] || ["Quality assured", "Trusted by customers", "Fast delivery options"];
  const keywordSpecs = Array.isArray(product.keywords) ? product.keywords.slice(0, 6) : [];
  const specs = keywordSpecs.length ? keywordSpecs : defaultSpecs;
  productSpecs.innerHTML = specs.map((spec) => \`<li>\${localizeSpec(spec, t)}</li>\`).join("");
  
  const bulletMap = {
    "High performance processor": t.spec_high_performance || "उच्च प्रदर्शन प्रोसेसर",
    "SSD storage": t.spec_ssd_storage || "एसएसडी स्टोरेज",
    "Long battery life": t.spec_battery_life || "लंबी बैटरी लाइफ"
  };
  document.querySelectorAll("#productSpecs li, #aboutItemBulletList li").forEach((li) => {
    const text = li.textContent.trim();
    if (bulletMap[text]) li.textContent = bulletMap[text];
  });`;

jsNorm = jsNorm.replace(oldSpecsBlock, newSpecsBlock);

// 3C. Update renderOffers to use partner_card_cashback & subtext keys
const oldOffersMap = `  const offers = [
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
  \`).join("");`;

const newOffersMap = `  const offers = [
    {
      key: "sub_bank_offer",
      title: t.sub_bank_offer || "Bank Offer",
      descKey: "partner_card_cashback",
      text: t.partner_card_cashback || (savings > 0
        ? \`Extra 5% cashback with partner cards on orders above \${money(Math.max(1999, price))}.\`
        : "Flat 5% cashback with selected credit cards.")
    },
    {
      key: "sub_no_cost_emi",
      title: t.sub_no_cost_emi || "No Cost EMI",
      descKey: "no_cost_emi_subtext",
      text: t.no_cost_emi_subtext || \`EMI starts from \${money(Math.max(299, Math.round(price / 24)))} per month.\`
    },
    {
      key: "sub_exchange_offer",
      title: t.sub_exchange_offer || "Exchange Offer",
      descKey: "exchange_offer_subtext",
      text: t.exchange_offer_subtext || \`Exchange your old \${category} and get up to \${money(Math.round(price * 0.18))} off.\`
    },
    {
      key: "sub_partner_offer",
      title: t.sub_partner_offer || "Partner Offer",
      descKey: "partner_offer_subtext",
      text: t.partner_offer_subtext || "GST invoice available and business purchase support."
    }
  ];
  offersGrid.innerHTML = offers.map((item) => \`
    <article class="offer-item">
      <h3 data-i18n="\${item.key}">\${escapeHtml(item.title)}</h3>
      <p data-i18n="\${item.descKey}">\${escapeHtml(item.text)}</p>
    </article>
  \`).join("");`;

jsNorm = jsNorm.replace(oldOffersMap, newOffersMap);

// 3D. Update renderServices to use localized subtexts with data-i18n
const oldServicesText = `  serviceDeliveryText.textContent = isInStock
    ? "FREE delivery by tomorrow in select cities."
    : "Delivery date will be shown after stock update.";
  serviceReturnText.textContent = "7-day replacement, no-questions-asked for defective items.";
  serviceWarrantyText.textContent = categoryFamily === "laptop" || categoryFamily === "computer"
    ? "1 Year manufacturer warranty + service center support."
    : "6 Months to 1 Year standard brand warranty.";
  serviceSellerText.textContent = \`\${product.brand} Authorized Seller | GST invoice available.\`;`;

const newServicesText = `  serviceDeliveryText.textContent = isInStock
    ? (t.free_delivery_subtext || "FREE delivery by tomorrow in select cities.")
    : (t.delivery_date_after_stock || "Delivery date will be shown after stock update.");
  serviceDeliveryText.setAttribute("data-i18n", "free_delivery_subtext");

  serviceReturnText.textContent = t.return_subtext || "7-day replacement, no-questions-asked for defective items.";
  serviceReturnText.setAttribute("data-i18n", "return_subtext");

  serviceWarrantyText.textContent = (categoryFamily === "laptop" || categoryFamily === "computer")
    ? (t.warranty_subtext || "1 Year manufacturer warranty + service center support.")
    : (t.warranty_std_subtext || "6 Months to 1 Year standard brand warranty.");
  serviceWarrantyText.setAttribute("data-i18n", "warranty_subtext");

  serviceSellerText.textContent = \`\${product.brand} \${t.seller_subtext || "Authorized Seller | GST invoice available."}\`;
  serviceSellerText.setAttribute("data-i18n", "seller_subtext");`;

jsNorm = jsNorm.replace(oldServicesText, newServicesText);

// 3E. Update initProductPage to set window.currentLoadedProduct
const oldInitProductPage = `  renderProduct(selectedProduct);
  productDetail.hidden = false;`;

const newInitProductPage = `  window.currentLoadedProduct = selectedProduct;
  renderProduct(selectedProduct);
  productDetail.hidden = false;`;

jsNorm = jsNorm.replace(oldInitProductPage, newInitProductPage);

// 3F. Update renderProductDetailPage to accept optional product argument
const oldExport = `window.renderProductDetailPage = function() {
  if (activeRenderedProduct) {
    renderProduct(activeRenderedProduct);
  }
};`;

const newExport = `window.renderProductDetailPage = function(prod) {
  const target = prod || window.currentLoadedProduct || activeRenderedProduct;
  if (target) {
    renderProduct(target);
  }
};`;

jsNorm = jsNorm.replace(oldExport, newExport);

// 3G. Add DOMContentLoaded listener for auto-read global language state
const autoReadListener = `
// 1. Global Language State Auto-Read on Page Load
document.addEventListener("DOMContentLoaded", () => {
  const currentLang = localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "hi";
  if (typeof applyFullPageTranslation === "function") {
    applyFullPageTranslation(currentLang);
  }
  if (typeof renderProductDetailPage === "function" && (window.currentLoadedProduct || activeRenderedProduct)) {
    renderProductDetailPage(window.currentLoadedProduct || activeRenderedProduct);
  }
});
`;

if (!jsNorm.includes('Global Language State Auto-Read on Page Load')) {
  jsNorm += '\n' + autoReadListener;
}

const finalJs = isJsCRLF ? jsNorm.replace(/\n/g, '\r\n') : jsNorm;
fs.writeFileSync(jsPath, finalJs, 'utf8');
console.log("Successfully updated product-detail.js with all 3 quick fixes!");
