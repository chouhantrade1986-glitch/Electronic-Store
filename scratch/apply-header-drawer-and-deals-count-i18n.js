const fs = require('fs');
const path = require('path');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');

const EXTRA_KEYS_I18N = {
  en: {
    all_categories_default: "All Categories",
    hello_sign_in_menu: "Hello, sign in",
    menu_trending: "Trending",
    menu_shop_department: "Shop by Department",
    menu_programs: "Programs & Features",
    menu_help_settings: "Help & Settings",
    showing_x_deals: "deals shown",
    main_menu: "MAIN MENU",
    see_all: "See all"
  },
  hi: {
    all_categories_default: "सभी कैटेगरी",
    hello_sign_in_menu: "नमस्ते, साइन इन करें",
    menu_trending: "ट्रेंडिंग",
    menu_shop_department: "विभाग के अनुसार खरीदारी करें",
    menu_programs: "प्रोग्राम और फीचर्स",
    menu_help_settings: "सहायता और सेटिंग्स",
    showing_x_deals: "डील्स दिखाई जा रही हैं",
    main_menu: "मुख्य मेन्यू",
    see_all: "सभी देखें"
  },
  ta: {
    all_categories_default: "அனைத்து பிரிவுகளும்",
    hello_sign_in_menu: "வணக்கம், உள்நுழைக",
    menu_trending: "டிரெண்டிங்",
    menu_shop_department: "பிரிவு வாரியாக வாங்கவும்",
    menu_programs: "திட்டங்கள் மற்றும் அம்சங்கள்",
    menu_help_settings: "உதவி மற்றும் அமைப்புகள்",
    showing_x_deals: "சலுகைகள் காட்டப்படுகின்றன",
    main_menu: "முதன்மை மெனு",
    see_all: "அனைத்தையும் காட்டு"
  },
  te: {
    all_categories_default: "అన్ని విభాగాలు",
    hello_sign_in_menu: "నమస్కారం, సైన్ ఇన్ చేయండి",
    menu_trending: "ట్రెండింగ్",
    menu_shop_department: "విభాగం వారీగా షాపింగ్ చేయండి",
    menu_programs: "కార్యక్రమాలు మరియు ఫీచర్లు",
    menu_help_settings: "సహాయం మరియు సెట్టింగ్‌లు",
    showing_x_deals: "డీల్స్ చూపబడుతున్నాయి",
    main_menu: "ప్రధాన మెను",
    see_all: "అన్నీ చూడండి"
  },
  kn: {
    all_categories_default: "ಎಲ್ಲಾ ವರ್ಗಗಳು",
    hello_sign_in_menu: "ನಮಸ್ಕಾರ, ಸೈನ್ ಇನ್ ಮಾಡಿ",
    menu_trending: "ಟ್ರೆಂಡಿಂಗ್",
    menu_shop_department: "ವಿಭಾಗದ ಪ್ರಕಾರ ಶಾಪಿಂಗ್ ಮಾಡಿ",
    menu_programs: "ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ವೈಶಿಷ್ಟ್ಯಗಳು",
    menu_help_settings: "ಸಹಾಯ ಮತ್ತು ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    showing_x_deals: "ಡೀಲ್‌ಗಳನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ",
    main_menu: "ಮುಖ್ಯ ಮೆನು",
    see_all: "ಎಲ್ಲವನ್ನೂ ನೋಡಿ"
  },
  ml: {
    all_categories_default: "എല്ലാ വിഭാഗങ്ങളും",
    hello_sign_in_menu: "ഹലോ, സൈൻ ഇൻ ചെയ്യുക",
    menu_trending: "ട്രെൻഡിംഗ്",
    menu_shop_department: "വിഭാഗം തിരിച്ച് ഷോപ്പ് ചെയ്യുക",
    menu_programs: "പ്രോഗ്രാമുകളും സവിശേഷതകളും",
    menu_help_settings: "സഹായവും ക്രമീകരണങ്ങളും",
    showing_x_deals: "ഡീലുകൾ കാണിക്കുന്നു",
    main_menu: "പ്രധാന മെനു",
    see_all: "എല്ലാം കാണുക"
  },
  bn: {
    all_categories_default: "সমস্ত বিভাগ",
    hello_sign_in_menu: "নমস্কার, সাইন ইন করুন",
    menu_trending: "ট্রেন্ডিং",
    menu_shop_department: "বিভাগ অনুযায়ী কেনাকাটা করুন",
    menu_programs: "প্রোগ্রাম এবং বৈশিষ্ট্য",
    menu_help_settings: "সহায়তা এবং সেটিংস",
    showing_x_deals: "ডিল দেখানো হচ্ছে",
    main_menu: "মূল মেনু",
    see_all: "সব দেখুন"
  },
  mr: {
    all_categories_default: "सर्व श्रेणी",
    hello_sign_in_menu: "नमस्ते, साइन इन करा",
    menu_trending: "ट्रेंडिंग",
    menu_shop_department: "विभागानुसार खरेदी करा",
    menu_programs: "कार्यक्रम आणि वैशिष्ट्ये",
    menu_help_settings: "मदत आणि सेटिंग्ज",
    showing_x_deals: "डील्स दाखवत आहे",
    main_menu: "मुख्य मेनू",
    see_all: "सर्व पहा"
  },
  ur: {
    all_categories_default: "تمام زمرہ جات",
    hello_sign_in_menu: "ہیلو، سائن ان کریں",
    menu_trending: "ٹرینڈنگ",
    menu_shop_department: "شعبہ کے لحاظ سے خریداری کریں",
    menu_programs: "پروگرامز اور فیچرز",
    menu_help_settings: "مدد اور ترتیبات",
    showing_x_deals: "ڈیلز دکھائی جا رہی ہیں",
    main_menu: "مین مینو",
    see_all: "سب دیکھیں"
  },
  pa: {
    all_categories_default: "ਸਾਰੀਆਂ ਸ਼੍ਰੇਣੀਆਂ",
    hello_sign_in_menu: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਸਾਈਨ ਇਨ ਕਰੋ",
    menu_trending: "ਟਰੈਂਡਿੰਗ",
    menu_shop_department: "ਵਿਭਾਗ ਅਨੁਸਾਰ ਖਰੀਦਦਾਰੀ ਕਰੋ",
    menu_programs: "ਪ੍ਰੋਗਰਾਮ ਅਤੇ ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ",
    menu_help_settings: "ਮਦਦ ਅਤੇ ਸੈਟਿੰਗਾਂ",
    showing_x_deals: "ਡੀਲਾਂ ਦਿਖਾਈਆਂ ਜਾ ਰਹੀਆਂ ਹਨ",
    main_menu: "ਮੁੱਖ ਮੀਨੂ",
    see_all: "ਸਾਰੇ ਦੇਖੋ"
  },
  gu: {
    all_categories_default: "બધી શ્રેણીઓ",
    hello_sign_in_menu: "નમસ્તે, સાઇન ઇન કરો",
    menu_trending: "ટ્રેન્ડિંગ",
    menu_shop_department: "વિભાગ મુજબ ખરીદી કરો",
    menu_programs: "પ્રોગ્રામ્સ અને સુવિધાઓ",
    menu_help_settings: "મદદ અને સેટિંગ્સ",
    showing_x_deals: "ડીલ્સ દર્શાવી રહ્યા છીએ",
    main_menu: "મુખ્ય મેનૂ",
    see_all: "બધા જુઓ"
  }
};

// 1. Update translations.js
const transPath = path.join(projectDir, 'translations.js');
let transCode = fs.readFileSync(transPath, 'utf8');

const marker = 'window.EM_TRANSLATIONS = translations;';
const injection = `
  // Merge header drawer and deals count translations
  const EXTRA_KEYS_I18N = ${JSON.stringify(EXTRA_KEYS_I18N, null, 2)};
  Object.keys(EXTRA_KEYS_I18N).forEach((lang) => {
    if (translations[lang]) {
      Object.assign(translations[lang], EXTRA_KEYS_I18N[lang]);
    }
  });

  ${marker}`;

if (transCode.includes(marker)) {
  transCode = transCode.replace(marker, injection);
}

// Add dropdown & drawer updater in applyFullPageTranslation
const syncHelper = `
    // Synchronize search category select default option
    document.querySelectorAll("select.search-context-select, select[data-search-catalog='1'], #categoryFilter").forEach((sel) => {
      if (sel && sel.options && sel.options.length) {
        Array.from(sel.options).forEach((opt) => {
          if (opt.value === "all") {
            opt.textContent = dict.all_categories_default || dict.all_categories || "All Categories";
          }
        });
      }
    });
`;

if (!transCode.includes('select.search-context-select')) {
  transCode = transCode.replace(
    'if (typeof window.renderTodaysDeals === "function") {\n      window.renderTodaysDeals(selectedLang);\n    }',
    'if (typeof window.renderTodaysDeals === "function") {\n      window.renderTodaysDeals(selectedLang);\n    }' + syncHelper
  );
}

fs.writeFileSync(transPath, transCode, 'utf8');
console.log('Successfully updated translations.js with extra keys & dropdown updater');

// 2. Update header.html
const headerHtmlPath = path.join(projectDir, 'header.html');
let headerHtml = fs.readFileSync(headerHtmlPath, 'utf8');

headerHtml = headerHtml.replace(
  '<option id="catAll" data-i18n="categoryFilter.all" value="all">All Categories</option>',
  '<option id="catAll" data-i18n="all_categories_default" value="all">All Categories</option>'
);
headerHtml = headerHtml.replace(
  '<span class="dept-header-greeting" id="sidebarGreeting"><strong>Hello,</strong> <a href="auth.html">sign in</a></span>',
  '<span class="dept-header-greeting" id="sidebarGreeting" data-i18n="hello_sign_in_menu"><strong>Hello,</strong> <a href="auth.html">sign in</a></span>'
);
headerHtml = headerHtml.replace(
  '<div class="dept-section-title">Trending</div>',
  '<div class="dept-section-title" data-i18n="menu_trending">Trending</div>'
);
headerHtml = headerHtml.replace(
  '<div class="dept-section-title">Shop by Department</div>',
  '<div class="dept-section-title" data-i18n="menu_shop_department">Shop by Department</div>'
);
headerHtml = headerHtml.replace(
  '<div class="dept-section-title">Programs &amp; Features</div>',
  '<div class="dept-section-title" data-i18n="menu_programs">Programs &amp; Features</div>'
);
headerHtml = headerHtml.replace(
  '<div class="dept-section-title">Help &amp; Settings</div>',
  '<div class="dept-section-title" data-i18n="menu_help_settings">Help &amp; Settings</div>'
);
headerHtml = headerHtml.replace(
  '<span id="deptSeeAllLabel">See all</span>',
  '<span id="deptSeeAllLabel" data-i18n="see_all">See all</span>'
);
headerHtml = headerHtml.replace(
  '<span class="dept-back-arrow">‹</span> <strong>MAIN MENU</strong>',
  '<span class="dept-back-arrow">‹</span> <strong data-i18n="main_menu">MAIN MENU</strong>'
);

fs.writeFileSync(headerHtmlPath, headerHtml, 'utf8');
console.log('Successfully updated header.html with data-i18n attributes on drawer and search select');

// 3. Update header.js
const headerJsPath = path.join(projectDir, 'header.js');
let headerJs = fs.readFileSync(headerJsPath, 'utf8');

headerJs = headerJs.replace(
  '<option id="catAll" data-i18n="categoryFilter.all" value="all">All Categories</option>',
  '<option id="catAll" data-i18n="all_categories_default" value="all">All Categories</option>'
);
headerJs = headerJs.replace(
  '<span class="dept-header-greeting" id="sidebarGreeting"><strong>Hello,</strong> <a href="auth.html">sign in</a></span>',
  '<span class="dept-header-greeting" id="sidebarGreeting" data-i18n="hello_sign_in_menu"><strong>Hello,</strong> <a href="auth.html">sign in</a></span>'
);
headerJs = headerJs.replace(
  '<div class="dept-section-title">Trending</div>',
  '<div class="dept-section-title" data-i18n="menu_trending">Trending</div>'
);
headerJs = headerJs.replace(
  '<div class="dept-section-title">Shop by Department</div>',
  '<div class="dept-section-title" data-i18n="menu_shop_department">Shop by Department</div>'
);
headerJs = headerJs.replace(
  '<div class="dept-section-title">Programs &amp; Features</div>',
  '<div class="dept-section-title" data-i18n="menu_programs">Programs &amp; Features</div>'
);
headerJs = headerJs.replace(
  '<div class="dept-section-title">Help &amp; Settings</div>',
  '<div class="dept-section-title" data-i18n="menu_help_settings">Help &amp; Settings</div>'
);
headerJs = headerJs.replace(
  '<span id="deptSeeAllLabel">See all</span>',
  '<span id="deptSeeAllLabel" data-i18n="see_all">See all</span>'
);
headerJs = headerJs.replace(
  '<span class="dept-back-arrow">‹</span> <strong>MAIN MENU</strong>',
  '<span class="dept-back-arrow">‹</span> <strong data-i18n="main_menu">MAIN MENU</strong>'
);

// Ensure drawer open triggers full page translation sync
if (!headerJs.includes('// syncDrawerOnOpen')) {
  headerJs = headerJs.replace(
    'deptSidebar.classList.add("open");',
    `deptSidebar.classList.add("open"); // syncDrawerOnOpen
      const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
      if (typeof window.applyFullPageTranslation === "function") {
        window.applyFullPageTranslation(currentLang);
      }`
  );
}

fs.writeFileSync(headerJsPath, headerJs, 'utf8');
console.log('Successfully updated header.js with drawer translations and open listener');

// 4. Update shared-search.js categoryLabel
const sharedSearchPath = path.join(projectDir, 'shared-search.js');
let sharedSearch = fs.readFileSync(sharedSearchPath, 'utf8');

const oldKnownLabels = `    const knownLabels = {
      all: "All Categories",`;
const newKnownLabels = `    const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
    const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : {};
    const knownLabels = {
      all: t.all_categories_default || t.all_categories || "All Categories",`;

if (sharedSearch.includes(oldKnownLabels)) {
  sharedSearch = sharedSearch.replace(oldKnownLabels, newKnownLabels);
  fs.writeFileSync(sharedSearchPath, sharedSearch, 'utf8');
  console.log('Successfully updated shared-search.js categoryLabel to use translations');
}

// 5. Update todays-deals.js resultMeta text
const tdJsPath = path.join(projectDir, 'todays-deals.js');
let tdJs = fs.readFileSync(tdJsPath, 'utf8');

tdJs = tdJs.replace(
  'resultMeta.textContent = `${t.showing || "Showing"} ${list.length} ${t.showing_deals || "deals"}`;',
  'resultMeta.textContent = `${list.length} ${t.showing_x_deals || "डील्स दिखाई जा रही हैं"}`;'
);

fs.writeFileSync(tdJsPath, tdJs, 'utf8');
console.log('Successfully updated todays-deals.js with localized deals count');
