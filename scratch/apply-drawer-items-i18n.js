const fs = require('fs');
const path = require('path');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');

const DRAWER_ITEMS_I18N = {
  en: {
    best_sellers: "Best Sellers",
    todays_deals: "Today's Deals",
    new_arrivals: "New Arrivals",
    components_parts: "PC Components & Parts",
    laptops_desktops: "Laptops & Desktops",
    mobiles_accessories: "Mobiles & Accessories",
    audio_headphones: "Audio & Headphones",
    printers_office: "Printers & Office",
    barebone_desktops: "Barebone Desktops",
    branded_desktops: "Branded Desktops",
    pc_builder_custom: "PC Builder (Custom Rig)",
    creator_studio: "Creator Studio",
    business_gst_invoicing: "Business & GST Invoicing",
    top_brands_store: "Top Brands Store",
    your_account: "Your Account",
    returns_orders: "Returns & Orders",
    customer_service_help: "Customer Service / Help",
    sign_in: "Sign In"
  },
  hi: {
    best_sellers: "सर्वाधिक बिकने वाले",
    todays_deals: "आज की डील",
    new_arrivals: "नए आगमन",
    components_parts: "पीसी कंपोनेंट्स और पार्ट्स",
    laptops_desktops: "लैपटॉप और डेस्कटॉप",
    mobiles_accessories: "मोबाइल और एक्सेसरीज़",
    audio_headphones: "ऑडियो और हेडफोन",
    printers_office: "प्रिंटर और ऑफिस",
    barebone_desktops: "बेयरबोन डेस्कटॉप",
    branded_desktops: "ब्रांडेड डेस्कटॉप",
    pc_builder_custom: "पीसी बिल्डर (कस्टम रिग)",
    creator_studio: "क्रिएटर स्टूडियो",
    business_gst_invoicing: "बिजनेस और जीएसटी इनवॉइसिंग",
    top_brands_store: "शीर्ष ब्रांड स्टोर",
    your_account: "आपका अकाउंट",
    returns_orders: "रिटर्न और ऑर्डर",
    customer_service_help: "ग्राहक सेवा / सहायता",
    sign_in: "साइन इन"
  },
  ta: {
    best_sellers: "அதிக விற்பனையாகும் பொருட்கள்",
    todays_deals: "இன்றைய சலுகைகள்",
    new_arrivals: "புதிய வருகைகள்",
    components_parts: "பிசி பாகங்கள்",
    laptops_desktops: "லேப்டாப்கள் & டெஸ்க்டாப்கள்",
    mobiles_accessories: "மொபைல்கள் & பாகங்கள்",
    audio_headphones: "ஆடியோ & ஹெட்போன்கள்",
    printers_office: "பிரிண்டர்கள் & அலுவலகம்",
    barebone_desktops: "பேர்போன் டெஸ்க்டாப்கள்",
    branded_desktops: "பிராண்டட் டெஸ்க்டாப்கள்",
    pc_builder_custom: "பிசி பில்டர்",
    creator_studio: "கிரியேட்டர் ஸ்டுடியோ",
    business_gst_invoicing: "வணிகம் & ஜிஎஸ்டி விலைப்பட்டியல்",
    top_brands_store: "முக்கிய பிராண்டுகள் ஸ்டோர்",
    your_account: "உங்கள் கணக்கு",
    returns_orders: "திரும்பப் பெறுதல் & ஆர்டர்கள்",
    customer_service_help: "வாடிக்கையாளர் சேவை / உதவி",
    sign_in: "உள்நுழைக"
  },
  te: {
    best_sellers: "అత్యధికంగా అమ్ముడైనవి",
    todays_deals: "నేటి డీల్స్",
    new_arrivals: "కొత్త రాకలు",
    components_parts: "పీసీ భాగాలు",
    laptops_desktops: "ల్యాప్‌టాప్‌లు & డెస్క్‌టాప్‌లు",
    mobiles_accessories: "మొబైల్స్ & యాక్సెసరీలు",
    audio_headphones: "ఆడియో & హెడ్‌ఫోన్‌లు",
    printers_office: "ప్రింటర్లు & ఆఫీస్",
    barebone_desktops: "బేర్‌బోన్ డెస్క్‌టాప్‌లు",
    branded_desktops: "బ్రాండెడ్ డెస్క్‌టాప్‌లు",
    pc_builder_custom: "పీసీ బిల్డర్",
    creator_studio: "క్రియేటర్ స్టూడియో",
    business_gst_invoicing: "వ్యాపారం & జీఎస్టీ ఇన్వాయిసింగ్",
    top_brands_store: "టాప్ బ్రాండ్ల స్టోర్",
    your_account: "మీ ఖాతా",
    returns_orders: "రిటర్న్స్ & ఆర్డర్లు",
    customer_service_help: "కస్టమర్ సర్వీస్ / సహాయం",
    sign_in: "సైన్ ఇన్"
  },
  kn: {
    best_sellers: "ಅತ್ಯುತ್ತಮ ಮಾರಾಟಗಾರರು",
    todays_deals: "ಇಂದಿನ ಡೀಲ್‌ಗಳು",
    new_arrivals: "ಹೊಸ ಆಗಮನಗಳು",
    components_parts: "ಪಿಸಿ ಬಿಡಿಭಾಗಗಳು",
    laptops_desktops: "ಲ್ಯಾಪ್ಟಾಪ್ಗಳು ಮತ್ತು ಡೆಸ್ಕ್ಟಾಪ್ಗಳು",
    mobiles_accessories: "ಮೊಬೈಲ್‌ಗಳು ಮತ್ತು ಪರಿಕರಗಳು",
    audio_headphones: "ಆಡಿಯೋ ಮತ್ತು ಹೆಡ್‌ಫೋನ್‌ಗಳು",
    printers_office: "ಪ್ರಿಂಟರ್‌ಗಳು ಮತ್ತು ಕಚೇರಿ",
    barebone_desktops: "ಬೇರ್‌ಬೋನ್ ಡೆಸ್ಕ್‌ಟಾಪ್‌ಗಳು",
    branded_desktops: "ಬ್ರಾಂಡೆಡ್ ಡೆಸ್ಕ್‌ಟಾಪ್‌ಗಳು",
    pc_builder_custom: "ಪಿಸಿ ಬಿಲ್ಡರ್",
    creator_studio: "ಕ್ರಿಯೇಟರ್ ಸ್ಟುಡಿಯೋ",
    business_gst_invoicing: "ವ್ಯಾಪಾರ ಮತ್ತು ಜಿಎಸ್‌ಟಿ ಇನ್‌ವಾಯ್ಸಿಂಗ್",
    top_brands_store: "ಟಾಪ್ ಬ್ರ್ಯಾಂಡ್‌ಗಳ ಅಂಗಡಿ",
    your_account: "ನಿಮ್ಮ ಖಾತೆ",
    returns_orders: "ರಿಟರ್ನ್ಸ್ ಮತ್ತು ಆರ್ಡರ್‌ಗಳು",
    customer_service_help: "ಗ್ರಾಹಕ ಸೇವೆ / ಸಹಾಯ",
    sign_in: "ಸೈನ್ ಇನ್"
  },
  ml: {
    best_sellers: "ബെസ്റ്റ് സെല്ലറുകൾ",
    todays_deals: "ഇന്നത്തെ ഡീലുകൾ",
    new_arrivals: "പുതിയ വരവുകൾ",
    components_parts: "പിസി പാർട്സുകൾ",
    laptops_desktops: "ലാപ്‌ടോപ്പുകളും ഡെസ്‌ക്‌ടോപ്പുകളും",
    mobiles_accessories: "മൊബൈലുകളും അനുബന്ധ സാമഗ്രികളും",
    audio_headphones: "ഓഡിയോയും ഹെഡ്‌ഫോണുകളും",
    printers_office: "പ്രിന്ററുകളും ഓഫീസും",
    barebone_desktops: "ബെയർബോൺ ഡെസ്‌ക്‌ടോപ്പുകൾ",
    branded_desktops: "ബ്രാൻഡഡ് ഡെസ്‌ക്‌ടോപ്പുകൾ",
    pc_builder_custom: "പിസി ബിൽഡർ",
    creator_studio: "ക്രിയേറ്റർ സ്റ്റുഡിയോ",
    business_gst_invoicing: "ബിസിനസ്സും ജിഎസ്ടി ഇൻവോയ്സിംഗും",
    top_brands_store: "മുൻനിര ബ്രാൻഡ് സ്റ്റോർ",
    your_account: "നിങ്ങളുടെ അക്കൗണ്ട്",
    returns_orders: "റിട്ടേൺസും ഓർഡറുകളും",
    customer_service_help: "ഉപഭോക്തൃ സേവനം / സഹായം",
    sign_in: "സൈൻ ഇൻ"
  },
  bn: {
    best_sellers: "সর্বাধিক বিক্রীত",
    todays_deals: "আজকের ডিল",
    new_arrivals: "নতুন আগমন",
    components_parts: "পিসি উপাদান ও যন্ত্রাংশ",
    laptops_desktops: "ল্যাপটপ ও ডেস্কটপ",
    mobiles_accessories: "মোবাইল ও এক্সেসরিজ",
    audio_headphones: "অডিও ও হেডফোন",
    printers_office: "প্রিন্টার ও অফিস",
    barebone_desktops: "বেয়ারবোন ডেস্কটপ",
    branded_desktops: "ব্র্যান্ডেড ডেস্কটপ",
    pc_builder_custom: "পিসি বিল্ডার",
    creator_studio: "ক্রিয়েটর স্টুডিও",
    business_gst_invoicing: "ব্যবসা ও জিএসটি চালান",
    top_brands_store: "শীর্ষ ব্র্যান্ড স্টোর",
    your_account: "আপনার অ্যাকাউন্ট",
    returns_orders: "রিটার্ন ও অর্ডার",
    customer_service_help: "গ্রাহক পরিষেবা / সহায়তা",
    sign_in: "সাইন ইন"
  },
  mr: {
    best_sellers: "सर्वाधिक विकले जाणारे",
    todays_deals: "आजच्या डील्स",
    new_arrivals: "नवीन आगमन",
    components_parts: "पीसी कॉम्पोनंट्स आणि पार्ट्स",
    laptops_desktops: "लॅपटॉप आणि डेस्कटॉप",
    mobiles_accessories: "मोबाईल्स आणि अ‍ॅक्सेसरीज",
    audio_headphones: "ऑडिओ आणि हेडफोन्स",
    printers_office: "प्रिंटर आणि कार्यालय",
    barebone_desktops: "बेअरबोन डेस्कटॉप",
    branded_desktops: "ब्रँडेड डेस्कटॉप",
    pc_builder_custom: "पीसी बिल्डर",
    creator_studio: "क्रिएटर स्टुडिओ",
    business_gst_invoicing: "व्यवसाय आणि जीएसटी इनव्हॉइसिंग",
    top_brands_store: "टॉप ब्रँड्स स्टोअर",
    your_account: "आपले खाते",
    returns_orders: "परतावे आणि ऑर्डर्स",
    customer_service_help: "ग्राहक सेवा / मदत",
    sign_in: "साइन इन"
  },
  ur: {
    best_sellers: "سب سے زیادہ فروخت ہونے والے",
    todays_deals: "آج کی ڈیلز",
    new_arrivals: "نئی آمد",
    components_parts: "پی سی کے پرزے",
    laptops_desktops: "لیپ ٹاپ اور ڈیسک ٹاپ",
    mobiles_accessories: "موبائل اور لوازمات",
    audio_headphones: "آڈیو اور ہیڈ فون",
    printers_office: "پرنٹرز اور دفتر",
    barebone_desktops: "بیئربن ڈیسک ٹاپ",
    branded_desktops: "برانڈڈ ڈیسک ٹاپ",
    pc_builder_custom: "پی سی بلڈر",
    creator_studio: "کریئیٹر اسٹوڈیو",
    business_gst_invoicing: "کاروبار اور جی ایس ٹی انوائسنگ",
    top_brands_store: "ٹاپ برانڈز اسٹور",
    your_account: "آپ کا اکاؤنٹ",
    returns_orders: "واپسی اور آرڈرز",
    customer_service_help: "کسٹمر سروس / مدد",
    sign_in: "سائن ان"
  },
  pa: {
    best_sellers: "ਸਭ ਤੋਂ ਵੱਧ ਵਿਕਣ ਵਾਲੇ",
    todays_deals: "ਅੱਜ ਦੀਆਂ ਡੀਲਾਂ",
    new_arrivals: "ਨਵੇਂ ਆਗਮਨ",
    components_parts: "ਪੀਸੀ ਹਿੱਸੇ ਅਤੇ ਪੁਰਜ਼ੇ",
    laptops_desktops: "ਲੈਪਟਾਪ ਅਤੇ ਡੈਸਕਟਾਪ",
    mobiles_accessories: "ਮੋਬਾਈਲ ਅਤੇ ਸਹਾਇਕ ਉਪਕਰਣ",
    audio_headphones: "ਆਡੀਓ ਅਤੇ ਹੈੱਡਫੋਨ",
    printers_office: "ਪ੍ਰਿੰਟਰ ਅਤੇ ਦਫਤਰ",
    barebone_desktops: "ਬੇਅਰਬੋਨ ਡੈਸਕਟਾਪ",
    branded_desktops: "ਬ੍ਰਾਂਡ ਵਾਲੇ ਡੈਸਕਟਾਪ",
    pc_builder_custom: "ਪੀਸੀ ਬਿਲਡਰ",
    creator_studio: "ਸਿਰਜਣਹਾਰ ਸਟੂਡੀਓ",
    business_gst_invoicing: "ਕਾਰੋਬਾਰ ਅਤੇ ਜੀਐਸਟੀ ਇਨਵੌਇਸਿੰਗ",
    top_brands_store: "ਚੋਟੀ ਦੇ ਬ੍ਰਾਂਡ ਸਟੋਰ",
    your_account: "ਤੁਹਾਡਾ ਖਾਤਾ",
    returns_orders: "ਵਾਪਸੀ ਅਤੇ ਆਰਡਰ",
    customer_service_help: "ਗਾਹਕ ਸੇਵਾ / ਮਦਦ",
    sign_in: "ਸਾਈਨ ਇਨ"
  },
  gu: {
    best_sellers: "સર્વાધિક વેચાતા",
    todays_deals: "આજની ડીલ્સ",
    new_arrivals: "નવા આગમન",
    components_parts: "પીસી કમ્પોનન્ટ્સ અને પાર્ટ્સ",
    laptops_desktops: "લેપટોપ્સ અને ડેસ્કટોપ્સ",
    mobiles_accessories: "મોબાઇલ્સ અને એક્સેસરીઝ",
    audio_headphones: "ઑડિયો અને હેડફોન",
    printers_office: "પ્રિન્ટર્સ અને ઓફિસ",
    barebone_desktops: "બેઅરબોન ડેસ્કટોપ્સ",
    branded_desktops: "બ્રાન્ડેડ ડેસ્કટોપ્સ",
    pc_builder_custom: "પીસી બિલ્ડર",
    creator_studio: "ક્રિએટર સ્ટુડિયો",
    business_gst_invoicing: "બિઝનેસ અને જીએસટી ઇનવોઇસિંગ",
    top_brands_store: "ટોચના બ્રાન્ડ્સ સ્ટોર",
    your_account: "તમારું એકાઉન્ટ",
    returns_orders: "રિટર્ન અને ઓર્ડર્સ",
    customer_service_help: "ગ્રાહક સેવા / સહાય",
    sign_in: "સાઇન ઇન"
  }
};

// 1. Update translations.js
const transPath = path.join(projectDir, 'translations.js');
let transCode = fs.readFileSync(transPath, 'utf8');

const marker = 'window.EM_TRANSLATIONS = translations;';
const injection = `
  // Merge drawer items translations
  const DRAWER_ITEMS_I18N = ${JSON.stringify(DRAWER_ITEMS_I18N, null, 2)};
  Object.keys(DRAWER_ITEMS_I18N).forEach((lang) => {
    if (translations[lang]) {
      Object.assign(translations[lang], DRAWER_ITEMS_I18N[lang]);
    }
  });

  ${marker}`;

if (transCode.includes(marker)) {
  transCode = transCode.replace(marker, injection);
  fs.writeFileSync(transPath, transCode, 'utf8');
  console.log('Successfully updated translations.js with drawer items translations');
}

// 2. Helper to replace drawer links in HTML strings
function updateDrawerTemplate(code) {
  let res = code;
  // Trending
  res = res.replace('<a class="dept-menu-item" href="best-sellers.html">Best Sellers</a>', '<a class="dept-menu-item" href="best-sellers.html" data-i18n="best_sellers">Best Sellers</a>');
  res = res.replace('<a class="dept-menu-item" href="todays-deals.html">Today\'s Deals</a>', '<a class="dept-menu-item" href="todays-deals.html" data-i18n="todays_deals">Today\'s Deals</a>');
  res = res.replace('<a class="dept-menu-item" href="products.html?filter=new">New Arrivals</a>', '<a class="dept-menu-item" href="products.html?filter=new" data-i18n="new_arrivals">New Arrivals</a>');

  // Shop by Department
  res = res.replace('<span>PC Components &amp; Parts</span>', '<span data-i18n="components_parts">PC Components &amp; Parts</span>');
  res = res.replace('<span>Laptops &amp; Desktops</span>', '<span data-i18n="laptops_desktops">Laptops &amp; Desktops</span>');
  res = res.replace('<span>Mobiles &amp; Accessories</span>', '<span data-i18n="mobiles_accessories">Mobiles &amp; Accessories</span>');
  res = res.replace('<span>Audio &amp; Headphones</span>', '<span data-i18n="audio_headphones">Audio &amp; Headphones</span>');
  res = res.replace('<span>Printers &amp; Office</span>', '<span data-i18n="printers_office">Printers &amp; Office</span>');
  res = res.replace('<span>Barebone Desktops</span>', '<span data-i18n="barebone_desktops">Barebone Desktops</span>');
  res = res.replace('<span>Branded Desktops</span>', '<span data-i18n="branded_desktops">Branded Desktops</span>');
  res = res.replace('<span>PC Builder (Custom Rig)</span>', '<span data-i18n="pc_builder_custom">PC Builder (Custom Rig)</span>');

  // Programs & Features
  res = res.replace('<a class="dept-menu-item" href="pc-builder.html">PC Builder (Custom Rig)</a>', '<a class="dept-menu-item" href="pc-builder.html" data-i18n="pc_builder_custom">PC Builder (Custom Rig)</a>');
  res = res.replace('<a class="dept-menu-item" href="creator-studio.html">Creator Studio</a>', '<a class="dept-menu-item" href="creator-studio.html" data-i18n="creator_studio">Creator Studio</a>');
  res = res.replace('<a class="dept-menu-item" href="products.html?search=gst">Business &amp; GST Invoicing</a>', '<a class="dept-menu-item" href="products.html?search=gst" data-i18n="business_gst_invoicing">Business &amp; GST Invoicing</a>');
  res = res.replace('<a class="dept-menu-item" href="brands.html">Top Brands Store</a>', '<a class="dept-menu-item" href="brands.html" data-i18n="top_brands_store">Top Brands Store</a>');

  // Help & Settings
  res = res.replace('<a class="dept-menu-item" href="account.html">Your Account</a>', '<a class="dept-menu-item" href="account.html" data-i18n="your_account">Your Account</a>');
  res = res.replace('<a class="dept-menu-item" href="orders.html">Returns &amp; Orders</a>', '<a class="dept-menu-item" href="orders.html" data-i18n="returns_orders">Returns &amp; Orders</a>');
  res = res.replace('<a class="dept-menu-item" href="faq.html">Customer Service / Help</a>', '<a class="dept-menu-item" href="faq.html" data-i18n="customer_service_help">Customer Service / Help</a>');
  res = res.replace('<a class="dept-menu-item" href="auth.html">Sign In</a>', '<a class="dept-menu-item" href="auth.html" data-i18n="sign_in">Sign In</a>');

  return res;
}

// Update header.html
const headerHtmlPath = path.join(projectDir, 'header.html');
let headerHtml = fs.readFileSync(headerHtmlPath, 'utf8');
headerHtml = updateDrawerTemplate(headerHtml);
fs.writeFileSync(headerHtmlPath, headerHtml, 'utf8');
console.log('Successfully updated header.html drawer item tags');

// Update header.js
const headerJsPath = path.join(projectDir, 'header.js');
let headerJs = fs.readFileSync(headerJsPath, 'utf8');
headerJs = updateDrawerTemplate(headerJs);
fs.writeFileSync(headerJsPath, headerJs, 'utf8');
console.log('Successfully updated header.js drawer item tags');

// Update menu-manager.js with drawer sync
const menuMgrPath = path.join(projectDir, 'menu-manager.js');
let menuMgr = fs.readFileSync(menuMgrPath, 'utf8');

const drawerSyncLogic = `
  function syncDrawerMenuItems() {
    const drawer = document.getElementById("deptSidebar") || document.querySelector(".dept-sidebar");
    if (!drawer) return;
    const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
    const dict = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : null;
    if (!dict) return;

    const linkMap = [
      { selector: 'a[href*="best-sellers"]', key: 'best_sellers' },
      { selector: 'a[href*="todays-deals"]', key: 'todays_deals' },
      { selector: 'a[href*="filter=new"]', key: 'new_arrivals' },
      { selector: '[data-submenu="pc-components"] span:not(.dept-arrow)', key: 'components_parts' },
      { selector: '[data-submenu="laptops-desktops"] span:not(.dept-arrow)', key: 'laptops_desktops' },
      { selector: 'a[href*="search=mobile"] span:not(.dept-arrow)', key: 'mobiles_accessories' },
      { selector: 'a[href*="search=audio"] span:not(.dept-arrow)', key: 'audio_headphones' },
      { selector: 'a[href*="printer"] span:not(.dept-arrow)', key: 'printers_office' },
      { selector: 'a[href*="barebone"] span:not(.dept-arrow)', key: 'barebone_desktops' },
      { selector: 'a[href*="branded"] span:not(.dept-arrow)', key: 'branded_desktops' },
      { selector: 'a[href*="pc-builder"] span:not(.dept-arrow)', key: 'pc_builder_custom' },
      { selector: 'a[href*="creator-studio"]', key: 'creator_studio' },
      { selector: 'a[href*="search=gst"]', key: 'business_gst_invoicing' },
      { selector: 'a[href*="brands.html"]', key: 'top_brands_store' },
      { selector: 'a[href*="account.html"]', key: 'your_account' },
      { selector: 'a[href*="orders.html"]', key: 'returns_orders' },
      { selector: 'a[href*="faq.html"]', key: 'customer_service_help' },
      { selector: 'a[href*="auth.html"]:not(#sidebarGreeting a)', key: 'sign_in' }
    ];

    linkMap.forEach(({ selector, key }) => {
      drawer.querySelectorAll(selector).forEach((el) => {
        el.setAttribute('data-i18n', key);
        if (dict[key]) {
          el.textContent = dict[key];
        }
      });
    });
  }
`;

if (!menuMgr.includes('syncDrawerMenuItems')) {
  menuMgr = menuMgr.replace(
    'injectMenu(document.querySelector(".sub-nav"));',
    `injectMenu(document.querySelector(".sub-nav"));\n  syncDrawerMenuItems();`
  );
  menuMgr = menuMgr.replace(
    'injectMenu(document.querySelector(".sub-nav"));\n    });',
    `injectMenu(document.querySelector(".sub-nav"));\n      syncDrawerMenuItems();\n    });`
  );
  menuMgr = menuMgr.replace(
    'function injectMenu(nav) {',
    `${drawerSyncLogic}\n  function injectMenu(nav) {`
  );
  menuMgr += `\nwindow.syncDrawerMenuItems = syncDrawerMenuItems;\n`;
  fs.writeFileSync(menuMgrPath, menuMgr, 'utf8');
  console.log('Successfully updated menu-manager.js with syncDrawerMenuItems');
}
