const fs = require('fs');
const path = require('path');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');

const MODAL_FILTERS_I18N = {
  en: {
    buy_now: "Buy Now",
    in_stock: "In Stock",
    out_of_stock: "Out of Stock",
    qty: "Qty:",
    add_to_wishlist: "Add to Wishlist",
    delivery_options: "Delivery Options",
    free_delivery_check: "Free Delivery",
    next_day_delivery: "Next Day Delivery",
    include_out_of_stock: "Include Out of Stock",
    search_in_products: "Search in all products...",
    grid_view: "⊞ Grid",
    list_view: "☰ List",
    show_label: "Show:",
    per_page_20: "20 per page",
    per_page_40: "40 per page",
    per_page_60: "60 per page",
    next_day_delivery_badge: "🚚 Next-Day Delivery",
    free_delivery_badge: "✔ FREE Delivery",
    days_replacement_7: "7 Days Replacement",
    secure_payment: "Secure Payment",
    free_returns: "Free Returns",
    about_this_item: "About this item",
    fbt_title: "Frequently Bought Together",
    add_all_to_cart: "Add all to Cart",
    estimated_delivery_tomorrow: "Estimated delivery by Tomorrow, if ordered within 2 hrs"
  },
  hi: {
    buy_now: "अभी खरीदें",
    in_stock: "स्टॉक में उपलब्ध",
    out_of_stock: "आउट ऑफ स्टॉक",
    qty: "मात्रा:",
    add_to_wishlist: "विशलिस्ट में जोड़ें",
    delivery_options: "डिलीवरी के विकल्प",
    free_delivery_check: "फ़्री डिलीवरी",
    next_day_delivery: "अगले दिन डिलीवरी",
    include_out_of_stock: "आउट ऑफ स्टॉक शामिल करें",
    search_in_products: "सभी उत्पादों में खोजें...",
    grid_view: "⊞ ग्रिड",
    list_view: "☰ सूची",
    show_label: "दिखाएं:",
    per_page_20: "प्रति पृष्ठ 20",
    per_page_40: "प्रति पृष्ठ 40",
    per_page_60: "प्रति पृष्ठ 60",
    next_day_delivery_badge: "🚚 अगले दिन डिलीवरी",
    free_delivery_badge: "✔ मुफ़्त डिलीवरी",
    days_replacement_7: "7 दिन का रिप्लेसमेंट",
    secure_payment: "सुरक्षित भुगतान",
    free_returns: "मुफ़्त वापसी",
    about_this_item: "इस आइटम के बारे में",
    fbt_title: "अक्सर साथ खरीदे जाने वाले",
    add_all_to_cart: "सभी को कार्ट में जोड़ें",
    estimated_delivery_tomorrow: "अनुमानित डिलीवरी कल तक, यदि 2 घंटे के भीतर ऑर्डर किया जाए"
  },
  ta: {
    buy_now: "இப்போதே வாங்கவும்",
    in_stock: "இருப்பில் உள்ளது",
    out_of_stock: "இருப்பில் இல்லை",
    qty: "அளவு:",
    add_to_wishlist: "விருப்பப்பட்டியலில் சேர்",
    delivery_options: "டெலிவரி விருப்பங்கள்",
    free_delivery_check: "இலவச டெலிவரி",
    next_day_delivery: "அடுத்த நாள் டெலிவரி",
    include_out_of_stock: "இருப்பில் இல்லாதவற்றைச் சேர்க்கவும்",
    search_in_products: "அனைத்து தயாரிப்புகளிலும் தேடுங்கள்...",
    grid_view: "⊞ கட்டம்",
    list_view: "☰ பட்டியல்",
    show_label: "காட்டு:",
    per_page_20: "பக்கத்திற்கு 20",
    per_page_40: "பக்கத்திற்கு 40",
    per_page_60: "பக்கத்திற்கு 60",
    next_day_delivery_badge: "🚚 அடுத்த நாள் டெலிவரி",
    free_delivery_badge: "✔ இலவச டெலிவரி",
    days_replacement_7: "7 நாட்கள் மாற்று வசதி",
    secure_payment: "பாதுகாப்பான கட்டணம்",
    free_returns: "இலவச திரும்பப் பெறுதல்",
    about_this_item: "இந்த பொருளைப் பற்றி",
    fbt_title: "அடிக்கடி ஒன்றாக வாங்கப்படும் பொருட்கள்",
    add_all_to_cart: "அனைத்தையும் கார்ட்டில் சேர்",
    estimated_delivery_tomorrow: "நாளைக்குள் எதிர்பார்க்கப்படும் டெலிவரி"
  },
  te: {
    buy_now: "ఇప్పుడే కొనండి",
    in_stock: "స్టాక్‌లో ఉంది",
    out_of_stock: "స్టాక్ అయిపోయింది",
    qty: "పరిమాణం:",
    add_to_wishlist: "విష్‌లిస్ట్‌కు జోడించు",
    delivery_options: "డెలివరీ ఎంపికలు",
    free_delivery_check: "ఉచిత డెలివరీ",
    next_day_delivery: "తరువాతి రోజు డెలివరీ",
    include_out_of_stock: "స్టాక్ లేని వాటిని చేర్చండి",
    search_in_products: "అన్ని ఉత్పత్తులలో శోధించండి...",
    grid_view: "⊞ గ్రిడ్",
    list_view: "☰ జాబితా",
    show_label: "చూపించు:",
    per_page_20: "పేజీకి 20",
    per_page_40: "పేజీకి 40",
    per_page_60: "పేజీకి 60",
    next_day_delivery_badge: "🚚 మరుసటి రోజు డెలివరీ",
    free_delivery_badge: "✔ ఉచిత డెలివరీ",
    days_replacement_7: "7 రోజుల రీప్లేస్‌మెంట్",
    secure_payment: "సురక్షిత చెల్లింపు",
    free_returns: "ఉచిత వాపసులు",
    about_this_item: "ఈ వస్తువు గురించి",
    fbt_title: "తరచుగా కలిసి కొనుగోలు చేసేవి",
    add_all_to_cart: "అన్నీ కార్ట్‌కు జోడించు",
    estimated_delivery_tomorrow: "రేపటికి అంచనా వేసిన డెలివరీ"
  },
  kn: {
    buy_now: "ಈಗಲೇ ಖರೀದಿಸಿ",
    in_stock: "ಸ್ಟಾಕ್‌ನಲ್ಲಿದೆ",
    out_of_stock: "ಸ್ಟಾಕ್ ಮುಗಿದಿದೆ",
    qty: "ಪ್ರಮಾಣ:",
    add_to_wishlist: "ವಿಶ್‌ಲಿಸ್ಟ್‌ಗೆ ಸೇರಿಸಿ",
    delivery_options: "ವಿತರಣಾ ಆಯ್ಕೆಗಳು",
    free_delivery_check: "ಉಚಿತ ವಿತರಣೆ",
    next_day_delivery: "ಮರುದಿನ ವಿತರಣೆ",
    include_out_of_stock: "ಸ್ಟಾಕ್ ಇಲ್ಲದಿರುವುದನ್ನು ಸೇರಿಸಿ",
    search_in_products: "ಎಲ್ಲಾ ಉತ್ಪನ್ನಗಳಲ್ಲಿ ಹುಡುಕಿ...",
    grid_view: "⊞ ಗ್ರಿಡ್",
    list_view: "☰ ಪಟ್ಟಿ",
    show_label: "ತೋರಿಸಿ:",
    per_page_20: "ಪುಟಕ್ಕೆ 20",
    per_page_40: "ಪುಟಕ್ಕೆ 40",
    per_page_60: "ಪುಟಕ್ಕೆ 60",
    next_day_delivery_badge: "🚚 ಮರುದಿನ ವಿತರಣೆ",
    free_delivery_badge: "✔ ಉಚಿತ ವಿತರಣೆ",
    days_replacement_7: "7 ದಿನಗಳ ಬದಲಿ",
    secure_payment: "ಸುರಕ್ಷಿತ ಪಾವತಿ",
    free_returns: "ಉಚಿತ ರಿಟರ್ನ್ಸ್",
    about_this_item: "ಈ ಐಟಂ ಬಗ್ಗೆ",
    fbt_title: "ಸಾಮಾನ್ಯವಾಗಿ ಒಟ್ಟಿಗೆ ಖರೀದಿಸುವ ವಸ್ತುಗಳು",
    add_all_to_cart: "ಎಲ್ಲವನ್ನೂ ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ",
    estimated_delivery_tomorrow: "ನಾಳೆಯೊಳಗೆ ಅಂದಾಜು ವಿತರಣೆ"
  },
  ml: {
    buy_now: "ഇപ്പോൾ വാങ്ങുക",
    in_stock: "സ്റ്റോക്കിൽ ഉണ്ട്",
    out_of_stock: "സ്റ്റോക്ക് കഴിഞ്ഞു",
    qty: "അളവ്:",
    add_to_wishlist: "വിഷ്‌ലിസ്റ്റിൽ ചേർക്കുക",
    delivery_options: "ഡെലിവറി ഓപ്ഷനുകൾ",
    free_delivery_check: "സൗജന്യ ഡെലിവറി",
    next_day_delivery: "അടുത്ത ദിവസം ഡെലിവറി",
    include_out_of_stock: "സ്റ്റോക്കില്ലാത്തവ ഉൾപ്പെടുത്തുക",
    search_in_products: "എല്ലാ ഉൽപ്പന്നങ്ങളിലും തിരയുക...",
    grid_view: "⊞ ഗ്രിഡ്",
    list_view: "☰ ലിസ്റ്റ്",
    show_label: "കാണിക്കുക:",
    per_page_20: "ഒരു പേജിൽ 20",
    per_page_40: "ഒരു പേജിൽ 40",
    per_page_60: "ഒരു പേജിൽ 60",
    next_day_delivery_badge: "🚚 അടുത്ത ദിവസത്തെ ഡെലിവറി",
    free_delivery_badge: "✔ സൗജന്യ ഡെലിവറി",
    days_replacement_7: "7 ദിവസത്തെ റീപ്ലേസ്‌മെന്റ്",
    secure_payment: "സുരക്ഷിത പേയ്‌മെന്റ്",
    free_returns: "സൗജന്യ റിട്ടേൺസ്",
    about_this_item: "ഈ ഇനത്തെക്കുറിച്ച്",
    fbt_title: "സാധാരണയായി ഒരുമിച്ച് വാങ്ങുന്നവ",
    add_all_to_cart: "എല്ലാം കാർട്ടിൽ ചേർക്കുക",
    estimated_delivery_tomorrow: "നാളെക്കുള്ളിൽ പ്രതീക്ഷിക്കുന്ന ഡെലിവറി"
  },
  bn: {
    buy_now: "এখনই কিনুন",
    in_stock: "স্টকে আছে",
    out_of_stock: "স্টক শেষ",
    qty: "পরিমাণ:",
    add_to_wishlist: "উইশলিস্টে যোগ করুন",
    delivery_options: "ডেলিভারি বিকল্প",
    free_delivery_check: "ফ্রি ডেলিভারি",
    next_day_delivery: "পরের দিন ডেলিভারি",
    include_out_of_stock: "স্টক নেই এমন পণ্য অন্তর্ভুক্ত করুন",
    search_in_products: "সমস্ত পণ্যে অনুসন্ধান করুন...",
    grid_view: "⊞ গ্রিড",
    list_view: "☰ তালিকা",
    show_label: "দেখান:",
    per_page_20: "প্রতি পৃষ্ঠায় ২০",
    per_page_40: "প্রতি পৃষ্ঠায় ৪০",
    per_page_60: "প্রতি পৃষ্ঠায় ৬০",
    next_day_delivery_badge: "🚚 পরের দিন ডেলিভারি",
    free_delivery_badge: "✔ ফ্রি ডেলিভারি",
    days_replacement_7: "৭ দিনের প্রতিস্থাপন",
    secure_payment: "নিরাপদ পেমেন্ট",
    free_returns: "বিনামূল্যে রিটার্ন",
    about_this_item: "এই আইটেম সম্পর্কে",
    fbt_title: "প্রায়শই একসাথে কেনা হয়",
    add_all_to_cart: "সব কার্টে যোগ করুন",
    estimated_delivery_tomorrow: "কালকের মধ্যে প্রত্যাশিত ডেলিভারি"
  },
  mr: {
    buy_now: "आत्ताच खरेदी करा",
    in_stock: "स्टॉकमध्ये उपलब्ध",
    out_of_stock: "स्टॉक संपला",
    qty: "प्रमाण:",
    add_to_wishlist: "विशलिस्टमध्ये जोडा",
    delivery_options: "डिलिव्हरी पर्याय",
    free_delivery_check: "मोफत डिलिव्हरी",
    next_day_delivery: "दुसऱ्या दिवशी डिलिव्हरी",
    include_out_of_stock: "आउट ऑफ स्टॉक समाविष्ट करा",
    search_in_products: "सर्व उत्पादनांमध्ये शोधा...",
    grid_view: "⊞ ग्रिड",
    list_view: "☰ यादी",
    show_label: "दाखवा:",
    per_page_20: "प्रति पृष्ठ २०",
    per_page_40: "प्रति पृष्ठ ४०",
    per_page_60: "प्रति पृष्ठ ६०",
    next_day_delivery_badge: "🚚 दुसऱ्या दिवशी डिलिव्हरी",
    free_delivery_badge: "✔ मोफत डिलिव्हरी",
    days_replacement_7: "७ दिवसांची पुनर्स्थापना",
    secure_payment: "सुरक्षित पेमेंट",
    free_returns: "मोफत परतावा",
    about_this_item: "या आयटमबद्दल",
    fbt_title: "वारंवार एकत्र खरेदी केलेले",
    add_all_to_cart: "सर्व कार्टमध्ये जोडा",
    estimated_delivery_tomorrow: "उद्यापर्यंत अंदाजे डिलिव्हरी"
  },
  ur: {
    buy_now: "ابھی خریدیں",
    in_stock: "اسٹاک میں دستیاب",
    out_of_stock: "اسٹاک ختم",
    qty: "مقدار:",
    add_to_wishlist: "خواہشات کی فہرست میں شامل کریں",
    delivery_options: "ترسیل کے اختیارات",
    free_delivery_check: "مفت ترسیل",
    next_day_delivery: "اگلے دن کی ترسیل",
    include_out_of_stock: "آؤٹ آف اسٹاک شامل کریں",
    search_in_products: "تمام مصنوعات میں تلاش کریں...",
    grid_view: "⊞ گرڈ",
    list_view: "☰ فہرست",
    show_label: "دکھائیں:",
    per_page_20: "فی صفحہ 20",
    per_page_40: "فی صفحہ 40",
    per_page_60: "فی صفحہ 60",
    next_day_delivery_badge: "🚚 اگلے دن کی ترسیل",
    free_delivery_badge: "✔ مفت ترسیل",
    days_replacement_7: "7 دن کی تبدیلی",
    secure_payment: "محفوظ ادائیگی",
    free_returns: "مفت واپسی",
    about_this_item: "اس چیز کے بارے میں",
    fbt_title: "عام طور پر ایک ساتھ خریدی جانے والی اشیاء",
    add_all_to_cart: "تمام کارٹ میں شامل کریں",
    estimated_delivery_tomorrow: "کل تک متوقع ترسیل"
  },
  pa: {
    buy_now: "ਹੁਣੇ ਖਰੀਦੋ",
    in_stock: "ਸਟਾਕ ਵਿੱਚ ਉਪਲਬਧ",
    out_of_stock: "ਸਟਾਕ ਖਤਮ",
    qty: "ਮਾਤਰਾ:",
    add_to_wishlist: "ਵਿਸ਼ਲਿਸਟ ਵਿੱਚ ਸ਼ਾਮਲ ਕਰੋ",
    delivery_options: "ਡਿਲਿਵਰੀ ਵਿਕਲਪ",
    free_delivery_check: "ਮੁਫ਼ਤ ਡਿਲਿਵਰੀ",
    next_day_delivery: "ਅਗਲੇ ਦਿਨ ਡਿਲਿਵਰੀ",
    include_out_of_stock: "ਆਉਟ ਆਫ਼ ਸਟਾਕ ਸ਼ਾਮਲ ਕਰੋ",
    search_in_products: "ਸਾਰੇ ਉਤਪਾਦਾਂ ਵਿੱਚ ਖੋਜੋ...",
    grid_view: "⊞ ਗਰਿੱਡ",
    list_view: "☰ ਸੂਚੀ",
    show_label: "ਦਿਖਾਓ:",
    per_page_20: "ਪ੍ਰਤੀ ਪੰਨਾ 20",
    per_page_40: "ਪ੍ਰਤੀ ਪੰਨਾ 40",
    per_page_60: "ਪ੍ਰਤੀ ਪੰਨਾ 60",
    next_day_delivery_badge: "🚚 ਅਗਲੇ ਦਿਨ ਡਿਲਿਵਰੀ",
    free_delivery_badge: "✔ ਮੁਫ਼ਤ ਡਿਲਿਵਰੀ",
    days_replacement_7: "7 ਦਿਨਾਂ ਦੀ ਬਦਲੀ",
    secure_payment: "ਸੁਰੱਖਿਅਤ ਭੁਗਤਾਨ",
    free_returns: "ਮੁਫ਼ਤ ਵਾਪਸੀ",
    about_this_item: "ਇਸ ਆਈਟਮ ਬਾਰੇ",
    fbt_title: "ਅਕਸਰ ਇਕੱਠੇ ਖਰੀਦੇ ਜਾਂਦੇ ਹਨ",
    add_all_to_cart: "ਸਾਰੇ ਕਾਰਟ ਵਿੱਚ ਸ਼ਾਮਲ ਕਰੋ",
    estimated_delivery_tomorrow: "ਕੱਲ੍ਹ ਤੱਕ ਅੰਦਾਜ਼ਨ ਡਿਲਿਵਰੀ"
  },
  gu: {
    buy_now: "હમણાં ખરીદો",
    in_stock: "સ્ટોકમાં છે",
    out_of_stock: "સ્ટોક બહાર",
    qty: "જથ્થો:",
    add_to_wishlist: "વિશલિસ્ટમાં ઉમેરો",
    delivery_options: "ડિલિવરી વિકલ્પો",
    free_delivery_check: "મફત ડિલિવરી",
    next_day_delivery: "બીજા દિવસે ડિલિવરી",
    include_out_of_stock: "આઉટ ઓફ સ્ટોક શામેલ કરો",
    search_in_products: "બધી પ્રોડક્ટ્સમાં શોધો...",
    grid_view: "⊞ ગ્રીડ",
    list_view: "☰ યાદી",
    show_label: "દર્શાવો:",
    per_page_20: "પ્રતિ પૃષ્ઠ 20",
    per_page_40: "પ્રતિ પૃષ્ઠ 40",
    per_page_60: "પ્રતિ પૃષ્ઠ 60",
    next_day_delivery_badge: "🚚 બીજા દિવસે ડિલિવરી",
    free_delivery_badge: "✔ મફત ડિલિવરી",
    days_replacement_7: "7 દિવસની રિપ્લેસમેન્ટ",
    secure_payment: "સુરક્ષિત ચુકવણી",
    free_returns: "મફત રિટર્ન",
    about_this_item: "આ આઇટમ વિશે",
    fbt_title: "સામાન્ય રીતે સાથે ખરીદવામાં આવતી વસ્તુઓ",
    add_all_to_cart: "બધું કાર્ટમાં ઉમેરો",
    estimated_delivery_tomorrow: "કાલ સુધીમાં અંદાજિત ડિલિવરી"
  }
};

// 1. Update translations.js
const transPath = path.join(projectDir, 'translations.js');
let transCode = fs.readFileSync(transPath, 'utf8');

const marker = 'window.EM_TRANSLATIONS = translations;';
const injection = `
  // Merge modal & filter translations across all 11 languages
  const MODAL_FILTERS_I18N = ${JSON.stringify(MODAL_FILTERS_I18N, null, 2)};
  Object.keys(MODAL_FILTERS_I18N).forEach((lang) => {
    if (translations[lang]) {
      Object.assign(translations[lang], MODAL_FILTERS_I18N[lang]);
    }
  });

  ${marker}`;

if (transCode.includes(marker)) {
  transCode = transCode.replace(marker, injection);
  fs.writeFileSync(transPath, transCode, 'utf8');
  console.log('Successfully updated translations.js with modal & filter translations');
}

// 2. Update products.html
const prodHtmlPath = path.join(projectDir, 'products.html');
let prodHtml = fs.readFileSync(prodHtmlPath, 'utf8');

// Delivery options & Availability
prodHtml = prodHtml.replace(
  '<h3 class="filter-section-title" data-i18n="in_stock">Availability</h3>',
  '<h3 class="filter-section-title" data-i18n="availability">Availability</h3>'
);
prodHtml = prodHtml.replace(
  '<span>Include Out of Stock</span>',
  '<span data-i18n="include_out_of_stock">Include Out of Stock</span>'
);
prodHtml = prodHtml.replace(
  '<h3 class="filter-section-title">Delivery Options</h3>',
  '<h3 class="filter-section-title" data-i18n="delivery_options">Delivery Options</h3>'
);
prodHtml = prodHtml.replace(
  '<span>Free Delivery</span>',
  '<span data-i18n="free_delivery_check">Free Delivery</span>'
);
prodHtml = prodHtml.replace(
  '<span>Next Day Delivery</span>',
  '<span data-i18n="next_day_delivery">Next Day Delivery</span>'
);

// Search placeholder
prodHtml = prodHtml.replace(
  'placeholder="Search in all products..."',
  'placeholder="Search in all products..." data-i18n-placeholder="search_in_products"'
);

// View toggle and items per page
prodHtml = prodHtml.replace(
  '<button class="view-btn active" data-view="grid" aria-label="Grid view">⊞ Grid</button>',
  '<button class="view-btn active" data-view="grid" aria-label="Grid view" data-i18n="grid_view">⊞ Grid</button>'
);
prodHtml = prodHtml.replace(
  '<button class="view-btn" data-view="list" aria-label="List view">☰ List</button>',
  '<button class="view-btn" data-view="list" aria-label="List view" data-i18n="list_view">☰ List</button>'
);
prodHtml = prodHtml.replace(
  '<label for="itemsPerPage">Show:</label>',
  '<label for="itemsPerPage" data-i18n="show_label">Show:</label>'
);
prodHtml = prodHtml.replace(
  '<option value="20">20 per page</option>',
  '<option value="20" data-i18n="per_page_20">20 per page</option>'
);
prodHtml = prodHtml.replace(
  '<option value="40">40 per page</option>',
  '<option value="40" data-i18n="per_page_40">40 per page</option>'
);
prodHtml = prodHtml.replace(
  '<option value="60">60 per page</option>',
  '<option value="60" data-i18n="per_page_60">60 per page</option>'
);

// Quick View Drawer elements
prodHtml = prodHtml.replace(
  '<span class="prime-delivery-badge">&#x1F69A; Next-Day Delivery</span>',
  '<span class="prime-delivery-badge" data-i18n="next_day_delivery_badge">&#x1F69A; Next-Day Delivery</span>'
);
prodHtml = prodHtml.replace(
  '<span class="free-delivery-badge">&#x2714; FREE Delivery</span>',
  '<span class="free-delivery-badge" data-i18n="free_delivery_badge">&#x2714; FREE Delivery</span>'
);
prodHtml = prodHtml.replace(
  '<span class="delivery-text">Estimated delivery by Tomorrow, if ordered within 2 hrs</span>',
  '<span class="delivery-text" data-i18n="estimated_delivery_tomorrow">Estimated delivery by Tomorrow, if ordered within 2 hrs</span>'
);
prodHtml = prodHtml.replace(
  '<span class="trust-item">7 Days Replacement</span>',
  '<span class="trust-item" data-i18n="days_replacement_7">7 Days Replacement</span>'
);
prodHtml = prodHtml.replace(
  '<span class="trust-item">Secure Payment</span>',
  '<span class="trust-item" data-i18n="secure_payment">Secure Payment</span>'
);
prodHtml = prodHtml.replace(
  '<span class="trust-item">Free Returns</span>',
  '<span class="trust-item" data-i18n="free_returns">Free Returns</span>'
);
prodHtml = prodHtml.replace(
  '<h4 class="features-title">About this item</h4>',
  '<h4 class="features-title" data-i18n="about_this_item">About this item</h4>'
);
prodHtml = prodHtml.replace(
  '<div class="qv-stock-status in-stock" id="qvStockStatus">In Stock</div>',
  '<div class="qv-stock-status in-stock" id="qvStockStatus" data-i18n="in_stock">In Stock</div>'
);
prodHtml = prodHtml.replace(
  '<label for="qvQuantity">Qty:</label>',
  '<label for="qvQuantity" data-i18n="qty">Qty:</label>'
);
prodHtml = prodHtml.replace(
  '<button class="qv-add-to-cart-btn" id="qvAddToCart" type="button">Add to Cart</button>',
  '<button class="qv-add-to-cart-btn" id="qvAddToCart" type="button" data-i18n="add_to_cart">Add to Cart</button>'
);
prodHtml = prodHtml.replace(
  '<button class="qv-buy-now-btn" id="qvBuyNow" type="button">Buy Now</button>',
  '<button class="qv-buy-now-btn" id="qvBuyNow" type="button" data-i18n="buy_now">Buy Now</button>'
);
prodHtml = prodHtml.replace(
  '<button class="qv-wishlist-btn" id="qvWishlist" type="button">&#x2661; Add to Wishlist</button>',
  '<button class="qv-wishlist-btn" id="qvWishlist" type="button" data-i18n="add_to_wishlist">&#x2661; Add to Wishlist</button>'
);
prodHtml = prodHtml.replace(
  '<h4 class="fbt-title">Frequently Bought Together</h4>',
  '<h4 class="fbt-title" data-i18n="fbt_title">Frequently Bought Together</h4>'
);
prodHtml = prodHtml.replace(
  '<button class="fbt-add-all-btn" id="qvFbtAddAll" type="button">Add all to Cart</button>',
  '<button class="fbt-add-all-btn" id="qvFbtAddAll" type="button" data-i18n="add_all_to_cart">Add all to Cart</button>'
);

fs.writeFileSync(prodHtmlPath, prodHtml, 'utf8');
console.log('Successfully updated products.html with Quick View & sidebar tags');

// 3. Update products.js drawer localized renderer
const prodJsPath = path.join(projectDir, 'products.js');
let prodJs = fs.readFileSync(prodJsPath, 'utf8');

// Update syncDrawerWishlistState
const oldWishlistState = /function syncDrawerWishlistState\(productId\) \{[\s\S]*?\n\}/;
const newWishlistState = `function syncDrawerWishlistState(productId) {
  if (!qvWishlist) return;
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : {};
  const active = isWishlisted(productId);
  qvWishlist.classList.toggle("active", active);
  qvWishlist.innerHTML = active ? \`\u2665 \${t.wishlisted || "Wishlisted"}\` : \`\u2661 \${t.add_to_wishlist || "Add to Wishlist"}\`;
}`;

prodJs = prodJs.replace(oldWishlistState, newWishlistState);

// In openQuickViewDrawer, localize buttons, status, and invoke applyFullPageTranslation
const targetSnippet = '/* Quantity */\n  if (qvQuantity) qvQuantity.value = "1";';
const replacementSnippet = `/* Quantity */
  if (qvQuantity) qvQuantity.value = "1";

  /* Apply i18n to Quick View Drawer */
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : {};
  if (qvAddToCart) qvAddToCart.textContent = t.add_to_cart || "Add to Cart";
  if (qvBuyNow) qvBuyNow.textContent = t.buy_now || "Buy Now";
  if (qvStockStatus) {
    if (stock > 0) {
      qvStockStatus.className = "qv-stock-status in-stock";
      qvStockStatus.textContent = stock > 5 ? (t.in_stock || "In Stock") : (t.only_left_stock ? t.only_left_stock.replace("{count}", stock) : \`Only \${stock} left in stock - order soon\`);
    } else {
      qvStockStatus.className = "qv-stock-status out-of-stock";
      qvStockStatus.textContent = t.out_of_stock || "Out of Stock";
    }
  }
  if (typeof window.applyFullPageTranslation === "function") {
    window.applyFullPageTranslation(currentLang);
  }`;

prodJs = prodJs.replace(targetSnippet, replacementSnippet);

fs.writeFileSync(prodJsPath, prodJs, 'utf8');
console.log('Successfully updated products.js drawer localization');
