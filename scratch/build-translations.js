const fs = require('fs');
const path = require('path');

const targetPath = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store', 'translations.js');

const fileContent = `/**
 * ElectroMart i18n Translation Dictionary & Engine
 * Supports 8 Indian Regional Languages matching Amazon India:
 * en (English), hi (हिन्दी), ta (தமிழ்), te (తెలుగు),
 * mr (मराठी), bn (বাংলা), kn (ಕನ್ನಡ), ml (മലയാളം)
 */

(function () {
  const translations = {
    en: {
      deliver_to: "Deliver to New Delhi 110001",
      deliver_to_prefix: "Deliver to",
      update_location: "Update location",
      search_all: "All Categories",
      search_placeholder: "Search ElectroMart.in",
      search_btn: "Search",
      hello_sign_in: "Hello, sign in",
      account_lists: "Account & Lists ▾",
      returns: "Returns",
      orders: "& Orders",
      returns_orders: "Returns & Orders",
      cart: "Cart",
      all: "All",
      todays_deals: "Today's Deals",
      best_sellers: "Best Sellers",
      all_products: "All Products",
      mobiles: "Mobiles",
      laptops: "Laptops",
      pc_builder: "PC Builder",
      creator_studio: "Creator Studio",
      customer_service: "Customer Service",
      fast_delivery: "Fast Delivery | GST Invoicing",
      lang_settings_title: "Language Settings",
      lang_settings_desc: "Select the language you prefer for browsing, shopping and communications.",
      lang_info_title: "Translation",
      lang_info_desc: "We will translate the most important information for your browsing, shopping and communications. Our translations are provided for your convenience. The English version of ElectroMart.in is the definitive version. Learn more",
      cancel: "Cancel",
      save_changes: "Save Changes",
      recommendations_title: "See personalized recommendations",
      sign_in: "Sign in",
      new_customer: "New customer?",
      start_here: "Start here.",
      back_to_top: "Back to top",

      // Category filter options
      "categoryFilter.all": "All Categories",
      "categoryFilter.computer": "Computers & Desktops",
      "categoryFilter.laptop": "Laptops & Accessories",
      "categoryFilter.components": "Components & Parts",
      "categoryFilter.printer": "Printers & Cartridges",
      "categoryFilter.audio": "Audio & Headphones",
      "categoryFilter.mobile": "Mobile Accessories",

      // Legacy compatibility keys
      "nav.helloSignIn": "Hello, sign in",
      "nav.account": "Account & Lists ▾",
      "nav.returns": "Returns",
      "nav.orders": "& Orders",
      "nav.cart": "Cart",
      "category.deals": "Today's Deals",
      "category.bestSellers": "Best Sellers",
      "header.deliveringTo": "Delivering to",
      "header.updateLocation": "Update location",
      "header.searchPlaceholder": "Search ElectroMart.in",
      "header.searchBtn": "Search"
    },
    hi: {
      deliver_to: "New Delhi 110001 में डिलीवर किया जा रहा है",
      deliver_to_prefix: "में डिलीवर किया जा रहा है",
      update_location: "लोकेशन अपडेट करें",
      search_all: "सभी कैटेगरी",
      search_placeholder: "ElectroMart.in खोजें",
      search_btn: "खोजें",
      hello_sign_in: "नमस्ते, साइन इन",
      account_lists: "अकाउंट और लिस्ट ▾",
      returns: "रिटर्न",
      orders: "और ऑर्डर",
      returns_orders: "रिटर्न और ऑर्डर",
      cart: "कार्ट",
      all: "सभी",
      todays_deals: "आज की डील",
      best_sellers: "सर्वाधिक बिकने वाले",
      all_products: "सभी उत्पाद",
      mobiles: "मोबाइल",
      laptops: "लैपटॉप",
      pc_builder: "पीसी बिल्डर",
      creator_studio: "क्रिएटर स्टूडियो",
      customer_service: "ग्राहक सेवा",
      fast_delivery: "तेज़ डिलीवरी | जीएसटी इनवॉइसिंग",
      lang_settings_title: "भाषा सेटिंग",
      lang_settings_desc: "ब्राउज़िंग, खरीदारी और कम्यूनिकेशन के लिए अपनी पसंद की भाषा चुनें.",
      lang_info_title: "अनुवाद",
      lang_info_desc: "हम आपकी ब्राउज़िंग, खरीदारी और कम्यूनिकेशन के लिए सबसे ज़रूरी जानकारी का अनुवाद करेंगे. हमारे अनुवाद आपकी सहूलियत के लिए प्रदान किए जाते हैं. हमारी उपयोग की शर्तों सहित ElectroMart.in का अंग्रेज़ी वर्जन ही अंतिम वर्जन है. और जानें",
      cancel: "कैंसल करें",
      save_changes: "परिवर्तन सहेजें",
      recommendations_title: "व्यक्तिगत सुझाव देखें",
      sign_in: "साइन इन करें",
      new_customer: "क्या आप नए ग्राहक हैं?",
      start_here: "यहाँ से शुरू करें.",
      back_to_top: "वापस ऊपर जाएं",

      // Category filter options
      "categoryFilter.all": "सभी कैटेगरी",
      "categoryFilter.computer": "कंप्यूटर और डेस्कटॉप",
      "categoryFilter.laptop": "लैपटॉप और एक्सेसरीज",
      "categoryFilter.components": "कंपोनेंट्स और पार्ट्स",
      "categoryFilter.printer": "प्रिंटर और कार्ट्रिज",
      "categoryFilter.audio": "ऑडियो और हेडफोन",
      "categoryFilter.mobile": "मोबाइल एक्सेसरीज",

      // Legacy compatibility keys
      "nav.helloSignIn": "नमस्ते, साइन इन",
      "nav.account": "अकाउंट और लिस्ट ▾",
      "nav.returns": "रिटर्न",
      "nav.orders": "और ऑर्डर",
      "nav.cart": "कार्ट",
      "category.deals": "आज की डील",
      "category.bestSellers": "सर्वाधिक बिकने वाले",
      "header.deliveringTo": "में डिलीवर किया जा रहा है",
      "header.updateLocation": "लोकेशन अपडेट करें",
      "header.searchPlaceholder": "ElectroMart.in खोजें",
      "header.searchBtn": "खोजें"
    },
    ta: {
      deliver_to: "New Delhi 110001-க்கு டெலிவரி செய்யப்படுகிறது",
      deliver_to_prefix: "டெலிவரி செய்யப்படுகிறது",
      update_location: "இருப்பிடத்தைப் புதுப்பிக்கவும்",
      search_all: "அனைத்து பிரிவுகள்",
      search_placeholder: "ElectroMart.in இல் தேடவும்",
      search_btn: "தேடு",
      hello_sign_in: "வணக்கம், உள்நுழைக",
      account_lists: "கணக்கு & பட்டியல்கள் ▾",
      returns: "ரிட்டர்ன்கள்",
      orders: "& ஆர்டர்கள்",
      returns_orders: "ரிட்டர்ன்கள் & ஆர்டர்கள்",
      cart: "கார்ட்",
      all: "அனைத்தும்",
      todays_deals: "இன்றைய சலுகைகள்",
      best_sellers: "அதிகம் விற்பனையாகும் பொருட்கள்",
      all_products: "அனைத்து தயாரிப்புகள்",
      mobiles: "மொபைல்கள்",
      laptops: "லேப்டாப்கள்",
      pc_builder: "பிசி பில்டர்",
      creator_studio: "கிரியேட்டர் ஸ்டுடியோ",
      customer_service: "வாடிக்கையாளர் சேவை",
      fast_delivery: "விரைவான டெலிவரி | ஜிஎஸ்டி இன்வாய்ஸ்",
      lang_settings_title: "மொழி அமைப்புகள்",
      lang_settings_desc: "உலாவல், ஷாப்பிங் மற்றும் தகவல்தொடர்புக்கு நீங்கள் விரும்பும் மொழியைத் தேர்ந்தெடுக்கவும்.",
      lang_info_title: "மொழிபெயர்ப்பு",
      lang_info_desc: "உலாவல், ஷாப்பிங் மற்றும் தகவல்தொடர்புக்கு தேவையான முக்கியமான தகவல்களை நாங்கள் மொழிபெயர்ப்போம். உங்கள் வசதிக்காக மட்டுமே எங்கள் மொழிபெயர்ப்புகள் வழங்கப்படுகின்றன.",
      cancel: "ரத்து செய்",
      save_changes: "மாற்றங்களைச் சேமிக்கவும்",
      recommendations_title: "தனிப்பயனாக்கப்பட்ட பரிந்துரைகளைக் காண்க",
      sign_in: "உள்நுழையவும்",
      new_customer: "புதிய வாடிக்கையாளரா?",
      start_here: "இங்கே தொடங்கவும்.",
      back_to_top: "மீண்டும் மேலே செல்லவும்",

      "categoryFilter.all": "அனைத்து பிரிவுகள்",
      "categoryFilter.computer": "கணினி & டெஸ்க்டாப்",
      "categoryFilter.laptop": "லேப்டாப் & பாகங்கள்",
      "categoryFilter.components": "உதிரிபாகங்கள்",
      "categoryFilter.printer": "பிரிண்டர்கள்",
      "categoryFilter.audio": "ஆடியோ & ஹெட்போன்கள்",
      "categoryFilter.mobile": "மொபைல் பாகங்கள்",

      "nav.helloSignIn": "வணக்கம், உள்நுழைக",
      "nav.account": "கணக்கு & பட்டியல்கள் ▾",
      "nav.returns": "ரிட்டர்ன்கள்",
      "nav.orders": "& ஆர்டர்கள்",
      "nav.cart": "கார்ட்",
      "category.deals": "இன்றைய சலுகைகள்",
      "category.bestSellers": "அதிகம் விற்பனையாகும் பொருட்கள்",
      "header.deliveringTo": "டெலிவரி செய்யப்படுகிறது",
      "header.updateLocation": "இருப்பிடத்தைப் புதுப்பிக்கவும்",
      "header.searchPlaceholder": "ElectroMart.in இல் தேடவும்",
      "header.searchBtn": "தேடு"
    },
    te: {
      deliver_to: "New Delhi 110001 కి డెలివరీ చేయబడుతోంది",
      deliver_to_prefix: "డెలివరీ చేయబడుతోంది",
      update_location: "స్థానాన్ని అప్‌డేట్ చేయండి",
      search_all: "అన్ని విభాగాలు",
      search_placeholder: "ElectroMart.in లో శోధించండి",
      search_btn: "శోధన",
      hello_sign_in: "హలో, సైన్ ఇన్",
      account_lists: "ఖాతా & జాబితాలు ▾",
      returns: "రిటర్న్స్",
      orders: "& ఆర్డర్లు",
      returns_orders: "రిటర్న్స్ & ఆర్డర్లు",
      cart: "కార్ట్",
      all: "అన్నీ",
      todays_deals: "నేటి డీల్స్",
      best_sellers: "బెస్ట్ సెల్లర్లు",
      all_products: "అన్ని ఉత్పత్తులు",
      mobiles: "మొబైల్స్",
      laptops: "ల్యాప్‌టాప్‌లు",
      pc_builder: "పీసీ బిల్డర్",
      creator_studio: "క్రియేటర్ స్టూడియో",
      customer_service: "కస్టమర్ సేవ",
      fast_delivery: "వేగవంతమైన డెలివరీ | జీఎస్టీ ఇన్‌వాయిస్",
      lang_settings_title: "భాష సెట్టింగ్లు",
      lang_settings_desc: "బ్రౌజింగ్, షాపింగ్ మరియు కమ్యూనికేషన్ కోసం మీరు ఇష్టపడే భాషను ఎంచుకోండి.",
      lang_info_title: "అనువాదం",
      lang_info_desc: "బ్రౌజింగ్, షాపింగ్ మరియు కమ్యూనికేషన్ కోసం అవసరమైన ముఖ్యమైన సమాచారాన్ని మేము అనువదిస్తాము. మీ సౌలభ్యం కోసం మాత్రమే మా అనువాదాలు అందించబడతాయి.",
      cancel: "రద్దు చేయండి",
      save_changes: "మార్పులను సేవ్ చేయండి",
      recommendations_title: "వ్యక్తిగతీకరించిన సిఫార్సులను చూడండి",
      sign_in: "సైన్ ఇన్ చేయండి",
      new_customer: "కొత్త కస్టమరా?",
      start_here: "ఇక్కడ ప్రారంభించండి.",
      back_to_top: "పైకి వెళ్ళండి",

      "categoryFilter.all": "అన్ని విభాగాలు",
      "categoryFilter.computer": "కంప్యూటర్లు & డెస్క్‌టాప్‌లు",
      "categoryFilter.laptop": "ల్యాప్‌టాప్‌లు & ఉపకరణాలు",
      "categoryFilter.components": "భాగములు",
      "categoryFilter.printer": "ప్రింటర్లు",
      "categoryFilter.audio": "ఆడియో & హెడ్‌ఫోన్లు",
      "categoryFilter.mobile": "మొబైల్ ఉపకరణాలు",

      "nav.helloSignIn": "హలో, సైన్ ఇన్",
      "nav.account": "ఖాతా & జాబితాలు ▾",
      "nav.returns": "రిటర్న్స్",
      "nav.orders": "& ఆర్డర్లు",
      "nav.cart": "కార్ట్",
      "category.deals": "నేటి డీల్స్",
      "category.bestSellers": "బెస్ట్ సెల్లర్లు",
      "header.deliveringTo": "డెలివరీ చేయబడుతోంది",
      "header.updateLocation": "స్థానాన్ని అప్‌డేట్ చేయండి",
      "header.searchPlaceholder": "ElectroMart.in లో శోధించండి",
      "header.searchBtn": "శోధన"
    },
    mr: {
      deliver_to: "New Delhi 110001 वर वितरित केले जात आहे",
      deliver_to_prefix: "वर वितरित केले जात आहे",
      update_location: "स्थान अपडेट करा",
      search_all: "सर्व कॅटेगरी",
      search_placeholder: "ElectroMart.in शोधा",
      search_btn: "शोधा",
      hello_sign_in: "नमस्कार, साइन इन",
      account_lists: "खाते आणि याद्या ▾",
      returns: "परतावा",
      orders: "आणि ऑर्डर्स",
      returns_orders: "परतावा आणि ऑर्डर्स",
      cart: "कार्ट",
      all: "सर्व",
      todays_deals: "आजचे डील्स",
      best_sellers: "सर्वाधिक विकले जाणारे",
      all_products: "सर्व उत्पादने",
      mobiles: "मोबाईल्स",
      laptops: "लॅपटॉप्स",
      pc_builder: "पीसी बिल्डर",
      creator_studio: "क्रिएटर स्टुडिओ",
      customer_service: "ग्राहक सेवा",
      fast_delivery: "जलद वितरण | जीएसटी इनव्हॉइस",
      lang_settings_title: "भाषा सेटिंग्ज",
      lang_settings_desc: "ब्राउझिंग, खरेदी आणि संवादासाठी तुमची पसंतीची भाषा निवडा.",
      lang_info_title: "अनुवाद",
      lang_info_desc: "आम्ही आपल्या ब्राउझिंग, खरेदी आणि संवादासाठी सर्वात महत्त्वाची माहिती अनुवादित करू. आमचे भाषांतर आपल्या सोयीसाठी प्रदान केले जाते.",
      cancel: "रद्द करा",
      save_changes: "बदल जतन करा",
      recommendations_title: "वैयक्तिकृत शिफारसी पहा",
      sign_in: "साइन इन करा",
      new_customer: "नवीन ग्राहक आहात?",
      start_here: "येथून सुरू करा.",
      back_to_top: "परत वर जा",

      "categoryFilter.all": "सर्व कॅटेगरी",
      "categoryFilter.computer": "संगणक आणि डेस्कटॉप",
      "categoryFilter.laptop": "लॅपटॉप आणि अ‍ॅक्सेसरीज",
      "categoryFilter.components": "भाग आणि स्पेअर्स",
      "categoryFilter.printer": "प्रिंटर्स",
      "categoryFilter.audio": "ऑडिओ आणि हेडफोन्स",
      "categoryFilter.mobile": "मोबाइल अ‍ॅक्सेसरीज",

      "nav.helloSignIn": "नमस्कार, साइन इन",
      "nav.account": "खाते आणि याद्या ▾",
      "nav.returns": "परतावा",
      "nav.orders": "आणि ऑर्डर्स",
      "nav.cart": "कार्ट",
      "category.deals": "आजचे डील्स",
      "category.bestSellers": "सर्वाधिक विकले जाणारे",
      "header.deliveringTo": "वर वितरित केले जात आहे",
      "header.updateLocation": "स्थान अपडेट करा",
      "header.searchPlaceholder": "ElectroMart.in शोधा",
      "header.searchBtn": "शोधा"
    },
    bn: {
      deliver_to: "New Delhi 110001-এ ডেলিভারি করা হচ্ছে",
      deliver_to_prefix: "ডেলিভারি করা হচ্ছে",
      update_location: "লোকেশন আপডেট করুন",
      search_all: "সব বিভাগ",
      search_placeholder: "ElectroMart.in-এ খুঁজুন",
      search_btn: "অনুসন্ধান",
      hello_sign_in: "হ্যালো, সাইন ইন",
      account_lists: "অ্যাকাউন্ট ও তালিকা ▾",
      returns: "রিটার্ন",
      orders: "এবং অর্ডার",
      returns_orders: "রিটার্ন এবং অর্ডার",
      cart: "কার্ট",
      all: "সব",
      todays_deals: "আজকের ডিল",
      best_sellers: "সেরা বিক্রেতা",
      all_products: "সমস্ত পণ্য",
      mobiles: "মোবাইল",
      laptops: "ল্যাপটপ",
      pc_builder: "পিসি বিল্ডার",
      creator_studio: "ক্রিয়েটর স্টুডিও",
      customer_service: "গ্রাহক পরিষেবা",
      fast_delivery: "দ্রুত ডেলিভারি | জিএসটি ইনভয়েস",
      lang_settings_title: "ভাষা সেটিংস",
      lang_settings_desc: "ব্রাউজিং, কেনাকাটা এবং যোগাযোগের জন্য আপনার পছন্দের ভাষা নির্বাচন করুন।",
      lang_info_title: "অনুবাদ",
      lang_info_desc: "আমরা আপনার ব্রাউজিং, কেনাকাটা এবং যোগাযোগের সবচেয়ে প্রয়োজনীয় তথ্য অনুবাদ করব। অনুবাদগুলি আপনার সুবিধার জন্য সরবরাহ করা হয়েছে।",
      cancel: "বাতিল করুন",
      save_changes: "পরিবর্তন সংরক্ষণ করুন",
      recommendations_title: "ব্যক্তিগতকৃত সুপারিশ দেখুন",
      sign_in: "সাইন ইন করুন",
      new_customer: "নতুন গ্রাহক?",
      start_here: "এখান থেকে শুরু করুন।",
      back_to_top: "উপরে ফিরে যান",

      "categoryFilter.all": "সব বিভাগ",
      "categoryFilter.computer": "কম্পিউটার ও ডেস্কটপ",
      "categoryFilter.laptop": "ল্যাপটপ ও আনুষাঙ্গিক",
      "categoryFilter.components": "কম্পোনেন্ট ও পার্টস",
      "categoryFilter.printer": "প্রিন্টার",
      "categoryFilter.audio": "অডিও ও হেডফোন",
      "categoryFilter.mobile": "মোবাইল এক্সেসরিজ",

      "nav.helloSignIn": "হ্যালো, সাইন ইন",
      "nav.account": "অ্যাকাউন্ট ও তালিকা ▾",
      "nav.returns": "রিটার্ন",
      "nav.orders": "এবং অর্ডার",
      "nav.cart": "কার্ট",
      "category.deals": "আজকের ডিল",
      "category.bestSellers": "সেরা বিক্রেতা",
      "header.deliveringTo": "ডেলিভারি করা হচ্ছে",
      "header.updateLocation": "লোকেশন আপডেট করুন",
      "header.searchPlaceholder": "ElectroMart.in-এ খুঁজুন",
      "header.searchBtn": "অনুসন্ধান"
    },
    kn: {
      deliver_to: "New Delhi 110001 ಗೆ ತಲುಪಿಸಲಾಗುತ್ತಿದೆ",
      deliver_to_prefix: "ತಲುಪಿಸಲಾಗುತ್ತಿದೆ",
      update_location: "ಸ್ಥಳವನ್ನು ನವೀಕರಿಸಿ",
      search_all: "ಎಲ್ಲಾ ವಿಭಾಗಗಳು",
      search_placeholder: "ElectroMart.in ನಲ್ಲಿ ಹುಡುಕಿ",
      search_btn: "ಹುಡುಕಿ",
      hello_sign_in: "ನಮಸ್ಕಾರ, ಸೈನ್ ಇನ್",
      account_lists: "ಖಾತೆ & ಪಟ್ಟಿಗಳು ▾",
      returns: "ರಿಟರ್ನ್ಸ್",
      orders: "ಮತ್ತು ಆರ್ಡರ್‌ಗಳು",
      returns_orders: "ರಿಟರ್ನ್ಸ್ ಮತ್ತು ಆರ್ಡರ್ಗಳು",
      cart: "ಕಾರ್ಟ್",
      all: "ಎಲ್ಲಾ",
      todays_deals: "ಇಂದಿನ ಡೀಲ್ಗಳು",
      best_sellers: "ಹೆಚ್ಚು ಮಾರಾಟವಾಗುವ ಉತ್ಪನ್ನಗಳು",
      all_products: "ಎಲ್ಲಾ ಉತ್ಪನ್ನಗಳು",
      mobiles: "ಮೊಬೈಲ್‌ಗಳು",
      laptops: "ಲ್ಯಾಪ್‌ಟಾಪ್‌ಗಳು",
      pc_builder: "ಪಿಸಿ ಬಿಲ್ಡರ್",
      creator_studio: "ಕ್ರಿಯೇಟರ್ ಸ್ಟುಡಿಯೋ",
      customer_service: "ಗ್ರಾಹಕ ಸೇವೆ",
      fast_delivery: "ವೇಗದ ವಿತರಣೆ | ಜಿಎಸ್‌ಟಿ ಇನ್‌ವಾಯ್ಸಿಂಗ್",
      lang_settings_title: "ಭಾಷಾ ಸೆಟ್ಟಿಂಗ್ಗಳು",
      lang_settings_desc: "ಬ್ರೌಸಿಂಗ್, ಶಾಪಿಂಗ್ ಮತ್ತು ಸಂವಹನಕ್ಕಾಗಿ ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
      lang_info_title: "ಭಾಷಾಂತರ",
      lang_info_desc: "ನಿಮ್ಮ ಬ್ರೌಸಿಂಗ್, ಶಾಪಿಂಗ್ ಮತ್ತು ಸಂವಹನಕ್ಕಾಗಿ ಪ್ರಮುಖ ಮಾಹಿತಿಯನ್ನು ನಾವು ಭಾಷಾಂತರಿಸುತ್ತೇವೆ. ನಮ್ಮ ಅನುವಾದಗಳನ್ನು ನಿಮ್ಮ ಅನುಕೂಲಕ್ಕಾಗಿ ಒದಗಿಸಲಾಗಿದೆ.",
      cancel: "ರದ್ದುಮಾಡಿ",
      save_changes: "ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ",
      recommendations_title: "ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ ಶಿಫಾರಸುಗಳನ್ನು ನೋಡಿ",
      sign_in: "ಸೈನ್ ಇನ್ ಮಾಡಿ",
      new_customer: "ಹೊಸ ಗ್ರಾಹಕರೇ?",
      start_here: "ಇಲ್ಲಿ ಪ್ರಾರಂಭಿಸಿ.",
      back_to_top: "ಮೇಲಕ್ಕೆ ಹಿಂತಿರುಗಿ",

      "categoryFilter.all": "ಎಲ್ಲಾ ವಿಭಾಗಗಳು",
      "categoryFilter.computer": "ಕಂಪ್ಯೂಟರ್ ಮತ್ತು ಡೆಸ್ಕ್‌ಟಾಪ್",
      "categoryFilter.laptop": "ಲ್ಯಾಪ್‌ಟಾಪ್ ಮತ್ತು ಪರಿಕರಗಳು",
      "categoryFilter.components": "ಬಿಡಿಭಾಗಗಳು",
      "categoryFilter.printer": "ಪ್ರಿಂಟರ್‌ಗಳು",
      "categoryFilter.audio": "ಆಡಿಯೋ ಮತ್ತು ಹೆಡ್‌ಫೋನ್‌ಗಳು",
      "categoryFilter.mobile": "ಮೊಬೈಲ್ ಪರಿಕರಗಳು",

      "nav.helloSignIn": "ನಮಸ್ಕಾರ, ಸೈನ್ ಇನ್",
      "nav.account": "ಖಾತೆ & ಪಟ್ಟಿಗಳು ▾",
      "nav.returns": "ರಿಟರ್ನ್ಸ್",
      "nav.orders": "ಮತ್ತು ಆರ್ಡರ್‌ಗಳು",
      "nav.cart": "ಕಾರ್ಟ್",
      "category.deals": "ಇಂದಿನ ಡೀಲ್ಗಳು",
      "category.bestSellers": "ಹೆಚ್ಚು ಮಾರಾಟವಾಗುವ ಉತ್ಪನ್ನಗಳು",
      "header.deliveringTo": "ತಲುಪಿಸಲಾಗುತ್ತಿದೆ",
      "header.updateLocation": "ಸ್ಥಳವನ್ನು ನವೀಕರಿಸಿ",
      "header.searchPlaceholder": "ElectroMart.in ನಲ್ಲಿ ಹುಡುಕಿ",
      "header.searchBtn": "ಹುಡುಕಿ"
    },
    ml: {
      deliver_to: "New Delhi 110001 ലേക്ക് ഡെലിവർ ചെയ്യുന്നു",
      deliver_to_prefix: "ഡെലിവർ ചെയ്യുന്നു",
      update_location: "ലൊക്കേഷൻ പുതുക്കുക",
      search_all: "എല്ലാ വിഭാഗങ്ങളും",
      search_placeholder: "ElectroMart.in ൽ തിരയുക",
      search_btn: "തിരയുക",
      hello_sign_in: "ഹലോ, സൈൻ ഇൻ",
      account_lists: "അക്കൗണ്ട് & ലിസ്റ്റുകൾ ▾",
      returns: "റിട്ടേൺസ്",
      orders: "ഓർഡറുകളും",
      returns_orders: "റിട്ടേണുകളും ഓർഡറുകളും",
      cart: "കാർട്ട്",
      all: "എല്ലാം",
      todays_deals: "ഇന്നത്തെ ഡീലുകൾ",
      best_sellers: "ബെസ്റ്റ് സെല്ലറുകൾ",
      all_products: "എല്ലാ ഉൽപ്പന്നങ്ങളും",
      mobiles: "മൊബൈലുകൾ",
      laptops: "ലാപ്‌ടോപ്പുകൾ",
      pc_builder: "പിസി ബിൽഡർ",
      creator_studio: "ക്രിയേറ്റർ സ്റ്റുഡിയോ",
      customer_service: "ഉപഭോക്തൃ സേവനം",
      fast_delivery: "വേഗത്തിലുള്ള ഡെലിവറി | ജിഎസ്ടി ഇൻവോയ്സ്",
      lang_settings_title: "ഭാഷാ ക്രമീകരണങ്ങൾ",
      lang_settings_desc: "ബ്രൗസിംഗ്, ഷോപ്പിംഗ്, ആശയവിനിമയം എന്നിവയ്ക്കായി നിങ്ങൾ താൽപ്പര്യപ്പെടുന്ന ഭാഷ തിരഞ്ഞെടുക്കുക.",
      lang_info_title: "വിവർത്തനം",
      lang_info_desc: "നിങ്ങളുടെ ബ്രൗസിംഗ്, ഷോപ്പിംഗ്, ആശയവിനിമയം എന്നിവയ്ക്കുള്ള പ്രധാനപ്പെട്ട വിവരങ്ങൾ ഞങ്ങൾ വിവർത്തനം ചെയ്യും. നിങ്ങളുടെ സൗകര്യത്തിനായാണ് വിവർത്തനങ്ങൾ നൽകിയിരിക്കുന്നത്.",
      cancel: "റദ്ദാക്കുക",
      save_changes: "മാറ്റങ്ങൾ സംരക്ഷിക്കുക",
      recommendations_title: "വ്യക്തിഗത ശുപാർശകൾ കാണുക",
      sign_in: "സൈൻ ഇൻ ചെയ്യുക",
      new_customer: "പുതിയ ഉപഭോക്താവാണോ?",
      start_here: "ഇവിടെ ആരംഭിക്കുക.",
      back_to_top: "മുകളിലേക്ക് മടങ്ങുക",

      "categoryFilter.all": "എല്ലാ വിഭാഗങ്ങളും",
      "categoryFilter.computer": "കമ്പ്യൂട്ടറുകൾ & ഡെസ്ക്ടോപ്പ്",
      "categoryFilter.laptop": "ലാപ്‌ടോപ്പുകൾ & അനുബന്ധങ്ങൾ",
      "categoryFilter.components": "ഘടകങ്ങൾ",
      "categoryFilter.printer": "പ്രിന്ററുകൾ",
      "categoryFilter.audio": "ഓഡിയോ & ഹെഡ്‌ഫോണുകൾ",
      "categoryFilter.mobile": "മൊബൈൽ അനുബന്ധങ്ങൾ",

      "nav.helloSignIn": "ഹലോ, സൈൻ ഇൻ",
      "nav.account": "അക്കൗണ്ട് & ലിസ്റ്റുകൾ ▾",
      "nav.returns": "റിട്ടേൺസ്",
      "nav.orders": "ഓർഡറുകളും",
      "nav.cart": "കാർട്ട്",
      "category.deals": "ഇന്നത്തെ ഡീലുകൾ",
      "category.bestSellers": "ബെസ്റ്റ് സെല്ലറുകൾ",
      "header.deliveringTo": "ഡെലിവർ ചെയ്യുന്നു",
      "header.updateLocation": "ലൊക്കേഷൻ പുതുക്കുക",
      "header.searchPlaceholder": "ElectroMart.in ൽ തിരയുക",
      "header.searchBtn": "തിരയുക"
    }
  };

  const LANGUAGE_DISPLAY_NAMES = {
    en: "English",
    hi: "हिन्दी - HI",
    ta: "தமிழ் - TA",
    te: "తెలుగు - TE",
    kn: "ಕನ್ನಡ - KN",
    ml: "മലയാളം - ML",
    bn: "বাংলা - BN",
    mr: "मराठी - MR"
  };

  function applyFullPageTranslation(lang) {
    const selectedLang = (lang && translations[lang]) ? lang : "en";
    const dict = translations[selectedLang] || translations.en;

    // 1. Text elements with data-i18n
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key] !== undefined) {
        el.textContent = dict[key];
      } else if (translations.en[key] !== undefined) {
        el.textContent = translations.en[key];
      }
    });

    // 2. Input placeholders with data-i18n-placeholder
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (dict[key] !== undefined) {
        el.setAttribute("placeholder", dict[key]);
      } else if (translations.en[key] !== undefined) {
        el.setAttribute("placeholder", translations.en[key]);
      }
    });

    // 3. Elements with data-i18n-title
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      if (dict[key] !== undefined) {
        el.setAttribute("title", dict[key]);
      }
    });

    // 4. Header delivery text formatting (Amazon India style: "<City PIN> में डिलीवर किया जा रहा है")
    const deliveryLocationText = document.getElementById("deliveryLocationText");
    const locPrefix = document.querySelector(".deliver-to-prefix");
    if (deliveryLocationText && locPrefix) {
      const locVal = deliveryLocationText.textContent.trim() || "New Delhi 110001";
      if (selectedLang === "hi") {
        locPrefix.innerHTML = \`<strong id="deliveryLocationText">\${locVal}</strong> में डिलीवर किया जा रहा है\`;
      } else if (selectedLang === "ta") {
        locPrefix.innerHTML = \`<strong id="deliveryLocationText">\${locVal}</strong>-க்கு டெலிவரி செய்யப்படுகிறது\`;
      } else if (selectedLang === "te") {
        locPrefix.innerHTML = \`<strong id="deliveryLocationText">\${locVal}</strong> కి డెలివరీ చేయబడుతోంది\`;
      } else if (selectedLang === "mr") {
        locPrefix.innerHTML = \`<strong id="deliveryLocationText">\${locVal}</strong> वर वितरित केले जात आहे\`;
      } else if (selectedLang === "bn") {
        locPrefix.innerHTML = \`<strong id="deliveryLocationText">\${locVal}</strong>-এ ডেলিভারি করা হচ্ছে\`;
      } else if (selectedLang === "kn") {
        locPrefix.innerHTML = \`<strong id="deliveryLocationText">\${locVal}</strong> ಗೆ ತಲುಪಿಸಲಾಗುತ್ತಿದೆ\`;
      } else if (selectedLang === "ml") {
        locPrefix.innerHTML = \`<strong id="deliveryLocationText">\${locVal}</strong> ലേക്ക് ഡെലിവർ ചെയ്യുന്നു\`;
      } else {
        locPrefix.innerHTML = \`<span data-i18n="deliver_to_prefix">\${dict.deliver_to_prefix || "Deliver to"}</span> <strong id="deliveryLocationText">\${locVal}</strong>\`;
      }
    }

    // 5. Category Dropdown options translation
    const categorySelect = document.getElementById("categoryFilter");
    if (categorySelect) {
      const cur = categorySelect.value;
      const opts = [
        { v: "all", k: "categoryFilter.all" },
        { v: "computer", k: "categoryFilter.computer" },
        { v: "laptop", k: "categoryFilter.laptop" },
        { v: "components", k: "categoryFilter.components" },
        { v: "printer", k: "categoryFilter.printer" },
        { v: "audio", k: "categoryFilter.audio" },
        { v: "mobile", k: "categoryFilter.mobile" }
      ];
      categorySelect.innerHTML = opts.map(o => \`<option value="\${o.v}">\${dict[o.k] || o.v}</option>\`).join("");
      categorySelect.value = cur || "all";
    }

    // 6. Header Language Badge
    document.querySelectorAll(".lang-text, #currentLangCode").forEach((el) => {
      el.textContent = selectedLang.toUpperCase();
    });

    // 7. Sidebar Hamburger Drawer Language Display
    document.querySelectorAll(".dept-drawer-lang-text, #deptDrawerLangText").forEach((el) => {
      el.textContent = LANGUAGE_DISPLAY_NAMES[selectedLang] || "English";
    });

    // 8. Footer Language Selector
    document.querySelectorAll("#footerLanguageSelect, .footer-language-select, #languageSelect").forEach((el) => {
      if (el.value !== selectedLang) {
        el.value = selectedLang;
      }
    });

    // 9. Document Lang attribute
    document.documentElement.setAttribute("lang", selectedLang);

    // 10. Document title for Language Settings page
    if (window.location.pathname.includes("language-settings")) {
      const pageTitles = {
        en: "Change Language Settings | ElectroMart.in",
        hi: "भाषा सेटिंग बदलें | ElectroMart.in",
        ta: "மொழி அமைப்புகளை மாற்றவும் | ElectroMart.in",
        te: "భాష సెట్టింగ్‌లను మార్చండి | ElectroMart.in",
        mr: "भाषा सेटिंग्ज बदला | ElectroMart.in",
        bn: "भाषा সেটিংস পরিবর্তন করুন | ElectroMart.in",
        kn: "ಭಾಷಾ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಬದಲಾಯಿಸಿ | ElectroMart.in",
        ml: "ಭಾಷാ ക്രമീകരണങ്ങൾ മാറ്റുക | ElectroMart.in"
      };
      if (pageTitles[selectedLang]) {
        document.title = pageTitles[selectedLang];
      }
    }
  }

  // Export to global scope
  window.EM_TRANSLATIONS = translations;
  window.applyFullPageTranslation = applyFullPageTranslation;

  // Auto-run on DOMContentLoaded or immediate execution
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      const savedLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
      applyFullPageTranslation(savedLang);
    });
  } else {
    const savedLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
    applyFullPageTranslation(savedLang);
  }
})();
`;

fs.writeFileSync(targetPath, fileContent, 'utf8');
console.log('Successfully written translations.js');
