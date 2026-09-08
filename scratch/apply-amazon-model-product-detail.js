const fs = require('fs');
const path = require('path');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');

// 1. ALL AMAZON MODEL KEYS ACROSS ALL 11 LANGUAGES
const AMAZON_DETAIL_I18N = {
  en: {
    breadcrumb_products: "Products",
    visit_store_prefix: "Store",
    brand_label: "Brand:",
    ratings_count_suffix: "ratings",
    inclusive_all_taxes: "Inclusive of all taxes",
    ships_from: "Ships from:",
    sold_by: "Sold by:",
    payment_secure: "Payment: Secure transaction",
    spec_capacity: "Capacity",
    spec_voltage: "Voltage",
    spec_warranty: "Warranty Details",
    frequently_bought_together: "Frequently bought together",
    add_both_to_cart: "Add both to Cart",
    customers_also_viewed: "Customers also viewed",
    translate_reviews_btn: "Translate all reviews to English",
    global_ratings: "global ratings",
    verified_purchase: "Verified Purchase",
    val_this_item: "This item:",
    qa_q_prefix: "Q:",
    qa_a_prefix: "A:",
    qa_q1: "Does this product include GST invoice?",
    qa_a1: "Yes, GST invoice is available for all eligible orders.",
    qa_q2: "Is this suitable for office and home use?",
    qa_a2: "Yes, it is suitable for both regular office and home usage.",
    qa_q3: "What is the return policy?",
    qa_a3: "Replacement is available within 7 days if the item is damaged or defective."
  },
  hi: {
    breadcrumb_products: "उत्पाद",
    visit_store_prefix: "स्टोर पर जाएं",
    brand_label: "ब्रांड:",
    ratings_count_suffix: "रेटिंग",
    inclusive_all_taxes: "सभी टैक्स सहित",
    ships_from: "भेजनेवाला:",
    sold_by: "विक्रेता:",
    payment_secure: "भुगतान: सुरक्षित ट्रांज़ैक्शन",
    spec_capacity: "क्षमता",
    spec_voltage: "वोल्टेज",
    spec_warranty: "वारंटी विवरण",
    frequently_bought_together: "अक्सर साथ खरीदे जाने वाले",
    add_both_to_cart: "दोनों को कार्ट में जोड़ें",
    customers_also_viewed: "इस आइटम को देखने वाले ग्राहकों ने ये भी देखा",
    translate_reviews_btn: "सभी समीक्षाओं का हिन्दी में अनुवाद करें",
    global_ratings: "ग्लोबल रेटिंग",
    verified_purchase: "सत्यापित की गई खरीदी",
    val_this_item: "यह आइटम:",
    qa_q_prefix: "प्रश्न:",
    qa_a_prefix: "उत्तर:",
    qa_q1: "क्या इस उत्पाद में जीएसटी चालान (GST invoice) शामिल है?",
    qa_a1: "हाँ, सभी पात्र ऑर्डर्स के लिए जीएसटी चालान उपलब्ध है.",
    qa_q2: "क्या यह ऑफिस और घरेलू उपयोग दोनों के लिए उपयुक्त है?",
    qa_a2: "हाँ, यह सामान्य ऑफिस और घर दोनों के उपयोग के लिए पूरी तरह उपयुक्त है.",
    qa_q3: "रिटर्न पॉलिसी क्या है?",
    qa_a3: "यदि वस्तु क्षतिग्रस्त या काम न कर रही हो तो 7 दिनों के भीतर रिप्लेसमेंट उपलब्ध है."
  },
  ta: {
    breadcrumb_products: "தயாரிப்புகள்",
    visit_store_prefix: "ஸ்டோருக்குச் செல்லவும்",
    brand_label: "பிராண்ட்:",
    ratings_count_suffix: "மதிப்பீடுகள்",
    inclusive_all_taxes: "அனைத்து வரிகளும் அடங்கும்",
    ships_from: "அனுப்புபவர்:",
    sold_by: "விற்பனையாளர்:",
    payment_secure: "பணம் செலுத்துதல்: பாதுகாப்பான பரிவர்த்தனை",
    spec_capacity: "கொள்ளளவு",
    spec_voltage: "மின்னழுத்தம்",
    spec_warranty: "உத்தரவாத விவரங்கள்",
    frequently_bought_together: "அடிக்கடி ஒன்றாக வாங்கப்பட்டது",
    add_both_to_cart: "இரண்டையும் கார்ட்டில் சேர்க்கவும்",
    customers_also_viewed: "வாடிக்கையாளர்கள் இதையும் பார்த்துள்ளனர்",
    translate_reviews_btn: "அனைத்து மதிப்புரைகளையும் தமிழாக்கம் செய்க",
    global_ratings: "உலகளாவிய மதிப்பீடுகள்",
    verified_purchase: "சரிபார்க்கப்பட்ட கொள்முதல்",
    val_this_item: "இந்த உருப்படி:",
    qa_q_prefix: "கேள்வி:",
    qa_a_prefix: "பதில்:",
    qa_q1: "இந்த தயாரிப்பில் ஜிஎஸ்டி இன்வாய்ஸ் உள்ளதா?",
    qa_a1: "ஆம், தகுதியான அனைத்து ஆர்டர்களுக்கும் ஜிஎஸ்டி இன்வாய்ஸ் கிடைக்கும்.",
    qa_q2: "இது அலுவலக மற்றும் வீட்டு உபயோகத்திற்கு ஏற்றதா?",
    qa_a2: "ஆம், இது வழக்கமான அலுவலக மற்றும் வீட்டு உபயோகத்திற்கு ஏற்றது.",
    qa_q3: "திருப்பி அனுப்பும் கொள்கை என்ன?",
    qa_a3: "பொருள் சேதமடைந்திருந்தால் 7 நாட்களுக்குள் மாற்று வசதி உள்ளது."
  },
  te: {
    breadcrumb_products: "ఉత్పత్తులు",
    visit_store_prefix: "స్టోర్‌ను సందర్శించండి",
    brand_label: "బ్రాండ్:",
    ratings_count_suffix: "రేటింగ్‌లు",
    inclusive_all_taxes: "అన్ని పన్నులు కలుపుకుని",
    ships_from: "నుండి పంపబడింది:",
    sold_by: "విక్రేత:",
    payment_secure: "చెల్లింపు: సురక్షిత లావాదేవీ",
    spec_capacity: "సామర్థ్యం",
    spec_voltage: "వోల్టేజ్",
    spec_warranty: "వారంటీ వివరాలు",
    frequently_bought_together: "తరచుగా కలిసి కొనుగోలు చేసినవి",
    add_both_to_cart: "రెండింటినీ కార్ట్‌కు జోడించండి",
    customers_also_viewed: "కస్టమర్లు దీన్ని కూడా వీక్షించారు",
    translate_reviews_btn: "అన్ని సమీక్షలను తెలుగులోకి అనువదించండి",
    global_ratings: "గ్లోబల్ రేటింగ్‌లు",
    verified_purchase: "ధృవీకరించబడిన కొనుగోలు",
    val_this_item: "ఈ అంశం:",
    qa_q_prefix: "ప్రశ్న:",
    qa_a_prefix: "సమాధానం:",
    qa_q1: "ఈ ఉత్పత్తిలో జీఎస్టీ ఇన్‌వాయిస్ ఉందా?",
    qa_a1: "అవును, అర్హత కలిగిన అన్ని ఆర్డర్‌లకు జీఎస్టీ ఇన్‌వాయిస్ అందుబాటులో ఉంది.",
    qa_q2: "ఇది కార్యాలయం మరియు గృహ అవసరాలకు సరిపోతుందా?",
    qa_a2: "అవును, ఇది సాధారణ కార్యాలయ మరియు గృహ అవసరాలకు రెండింటికీ సరిపోతుంది.",
    qa_q3: "రిటర్న్ పాలసీ ఏమిటి?",
    qa_a3: "వస్తువు దెబ్బతిన్నట్లయితే 7 రోజుల్లో భర్తీ అందుబాటులో ఉంది."
  },
  kn: {
    breadcrumb_products: "ಉತ್ಪನ್ನಗಳು",
    visit_store_prefix: "ಸ್ಟೋರ್‌ಗೆ ಭೇಟಿ ನೀಡಿ",
    brand_label: "ಬ್ರ್ಯಾಂಡ್:",
    ratings_count_suffix: "ರೇಟಿಂಗ್‌ಗಳು",
    inclusive_all_taxes: "ಎಲ್ಲಾ ತೆರಿಗೆಗಳು ಸೇರಿವೆ",
    ships_from: "ರವಾನಿಸುವವರು:",
    sold_by: "ಮಾರಾಟಗಾರರು:",
    payment_secure: "ಪಾವತಿ: ಸುರಕ್ಷಿತ ವಹಿವಾಟು",
    spec_capacity: "ಸಾಮರ್ಥ್ಯ",
    spec_voltage: "ವೋಲ್ಟೇಜ್",
    spec_warranty: "ವಾರಂಟಿ ವಿವರಗಳು",
    frequently_bought_together: "ಸಾಮಾನ್ಯವಾಗಿ ಒಟ್ಟಿಗೆ ಖರೀದಿಸಲಾದವು",
    add_both_to_cart: "ಎರಡನ್ನೂ ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ",
    customers_also_viewed: "ಗ್ರಾಹಕರು ಇದನ್ನು ಸಹ ವೀಕ್ಷಿಸಿದ್ದಾರೆ",
    translate_reviews_btn: "ಎಲ್ಲಾ ವಿಮರ್ಶೆಗಳನ್ನು ಕನ್ನಡಕ್ಕೆ ಅನುವಾದಿಸಿ",
    global_ratings: "ಜಾಗತಿಕ ರೇಟಿಂಗ್‌ಗಳು",
    verified_purchase: "ದೃಢೀಕರಿಸಿದ ಖರೀದಿ",
    val_this_item: "ಈ ವಸ್ತು:",
    qa_q_prefix: "ಪ್ರಶ್ನೆ:",
    qa_a_prefix: "ಉತ್ತರ:",
    qa_q1: "ಈ ಉತ್ಪನ್ನವು ಜಿಎಸ್‌ಟಿ ಇನ್‌ವಾಯ್ಸ್ ಒಳಗೊಂಡಿದೆಯೇ?",
    qa_a1: "ಹೌದು, ಎಲ್ಲಾ ಅರ್ಹ ಆರ್ಡರ್‌ಗಳಿಗೆ ಜಿಎಸ್‌ಟಿ ಇನ್‌ವಾಯ್ಸ್ ಲಭ್ಯವಿದೆ.",
    qa_q2: "ಇದು ಕಚೇರಿ ಮತ್ತು ಮನೆಯ ಬಳಕೆಗೆ ಸೂಕ್ತವೇ?",
    qa_a2: "ಹೌದು, ಇದು ಕಚೇರಿ ಮತ್ತು ಮನೆಯ ಬಳಕೆಗೆ ಸೂಕ್ತವಾಗಿದೆ.",
    qa_q3: "ರಿಟರ್ನ್ ನೀತಿ ಏನು?",
    qa_a3: "ವಸ್ತು ಹಾಳಾಗಿದ್ದರೆ 7 ದಿನಗಳಲ್ಲಿ ಬದಲಿ ಲಭ್ಯವಿದೆ."
  },
  ml: {
    breadcrumb_products: "ഉൽപ്പന്നങ്ങൾ",
    visit_store_prefix: "സ്റ്റോർ സന്ദർശിക്കുക",
    brand_label: "ബ്രാൻഡ്:",
    ratings_count_suffix: "റേറ്റിംഗുകൾ",
    inclusive_all_taxes: "എല്ലാ നികുതികളും ഉൾപ്പെടെ",
    ships_from: "അയക്കുന്നത്:",
    sold_by: "വിൽപ്പനക്കാരൻ:",
    payment_secure: "പേയ്‌മെന്റ്: സുരക്ഷിത ഇടപാട്",
    spec_capacity: "ശേഷി",
    spec_voltage: "വോൾട്ടേജ്",
    spec_warranty: "വാറന്റി വിവരങ്ങൾ",
    frequently_bought_together: "പലപ്പോഴും ഒന്നിച്ച് വാങ്ങുന്നത്",
    add_both_to_cart: "രണ്ടും കാർട്ടിലേക്ക് ചേർക്കുക",
    customers_also_viewed: "ഉപഭോക്താക്കൾ ഇതും കണ്ടു",
    translate_reviews_btn: "എല്ലാ അവലോകനങ്ങളും മലയാളത്തിലേക്ക് വിവർത്തനം ചെയ്യുക",
    global_ratings: "ആഗോള റേറ്റിംഗുകൾ",
    verified_purchase: "സ്ഥിരീകരിച്ച വാങ്ങൽ",
    val_this_item: "ഈ ഇനം:",
    qa_q_prefix: "ചോദ്യം:",
    qa_a_prefix: "ഉത്തരം:",
    qa_q1: "ഈ ഉൽപ്പന്നത്തിൽ ജിഎസ്ടി ഇൻവോയ്സ് ഉൾപ്പെടുന്നുണ്ടോ?",
    qa_a1: "അതെ, എല്ലാ യോഗ്യമായ ഓർഡറുകൾക്കും ജിഎസ്ടി ഇൻവോയ്സ് ലഭ്യമാണ്.",
    qa_q2: "ഇത് ഓഫീസിനും വീട്ടുപയോഗത്തിനും അനുയോജ്യമാണോ?",
    qa_a2: "അതെ, ഇത് ഓഫീസിനും വീട്ടുപയോഗത്തിനും അനുയോജ്യമാണ്.",
    qa_q3: "റിട്ടേൺ പോളിസി എന്താണ്?",
    qa_a3: "സാധനം കേടായതാണെങ്കിൽ 7 ദിവസത്തിനകം റീപ്ലേസ്‌മെന്റ് ലഭ്യമാണ്."
  },
  bn: {
    breadcrumb_products: "পণ্যসমূহ",
    visit_store_prefix: "স্টোরে যান",
    brand_label: "ব্র্যান্ড:",
    ratings_count_suffix: "রেটিং",
    inclusive_all_taxes: "সমস্ত কর সহ",
    ships_from: "প্রেরক:",
    sold_by: "বিক্রেতা:",
    payment_secure: "পেমেন্ট: সুরক্ষিত লেনদেন",
    spec_capacity: "ক্ষমতা",
    spec_voltage: "ভোল্টেজ",
    spec_warranty: "ওয়ারেন্টি বিবরণ",
    frequently_bought_together: "প্রায়শই একসাথে কেনা হয়",
    add_both_to_cart: "উভয় কার্টে যোগ করুন",
    customers_also_viewed: "গ্রাহকরা এটিও দেখেছেন",
    translate_reviews_btn: "সমস্ত রিভিউ বাংলায় অনুবাদ করুন",
    global_ratings: "গ্লোবাল রেটিং",
    verified_purchase: "যাচাইকৃত কেনাকাটা",
    val_this_item: "এই আইটেমটি:",
    qa_q_prefix: "প্রশ্ন:",
    qa_a_prefix: "উত্তর:",
    qa_q1: "এই পণ্যে জিএসটি ইনভয়েস আছে কি?",
    qa_a1: "হ্যাঁ, সমস্ত উপযুক্ত অর্ডারের জন্য জিএসটি ইনভয়েস উপলব্ধ।",
    qa_q2: "এটি কি অফিস এবং বাড়ির জন্য উপযুক্ত?",
    qa_a2: "হ্যাঁ, এটি অফিস এবং বাড়ির উভয় ব্যবহারের জন্য উপযুক্ত।",
    qa_q3: "রিটার্ন নীতি কী?",
    qa_a3: "আইটেম ক্ষতিগ্রস্ত হলে 7 দিনের মধ্যে প্রতিস্থাপন উপলব্ধ।"
  },
  mr: {
    breadcrumb_products: "उत्पादने",
    visit_store_prefix: "स्टोअरला भेट द्या",
    brand_label: "ब्रँड:",
    ratings_count_suffix: "रेटिंग्स",
    inclusive_all_taxes: "सर्व करांसह",
    ships_from: "पाठवणारे:",
    sold_by: "विक्रेता:",
    payment_secure: "पेमेंट: सुरक्षित व्यवहार",
    spec_capacity: "क्षमता",
    spec_voltage: "व्होल्टेज",
    spec_warranty: "वारंटी तपशील",
    frequently_bought_together: "वारंवार एकत्र खरेदी केलेले",
    add_both_to_cart: "दोन्ही कार्टमध्ये जोडा",
    customers_also_viewed: "ग्राहकांनी हे देखील पाहिले",
    translate_reviews_btn: "सर्व पुनरावलोकने मराठीत भाषांतरित करा",
    global_ratings: "जागतिक रेटिंग्ज",
    verified_purchase: "सत्यापित खरेदी",
    val_this_item: "हा आयटम:",
    qa_q_prefix: "प्रश्न:",
    qa_a_prefix: "उत्तर:",
    qa_q1: "या उत्पादनामध्ये जीएसटी इनव्हॉइस समाविष्ट आहे का?",
    qa_a1: "होय, सर्व पात्र ऑर्डर्ससाठी जीएसटी इनव्हॉइस उपलब्ध आहे.",
    qa_q2: "हे ऑफिस आणि घरगुती वापरासाठी योग्य आहे का?",
    qa_a2: "होय, हे ऑफिस आणि घर दोन्हीसाठी योग्य आहे.",
    qa_q3: "परतावा धोरण काय आहे?",
    qa_a3: "वस्तू खराब असल्यास 7 दिवसांच्या आत रिप्लेसमेंट उपलब्ध आहे."
  },
  ur: {
    breadcrumb_products: "مصنوعات",
    visit_store_prefix: "اسٹور دیکھیں",
    brand_label: "برانڈ:",
    ratings_count_suffix: "درجہ بندیاں",
    inclusive_all_taxes: "تمام ٹیکس سمیت",
    ships_from: "بھیجنے والا:",
    sold_by: "فروخت کنندہ:",
    payment_secure: "ادائیگی: محفوظ لین دین",
    spec_capacity: "گنجائش",
    spec_voltage: "وولٹیج",
    spec_warranty: "وارنٹی کی تفصیلات",
    frequently_bought_together: "اکثر ایک ساتھ خریدی جانے والی اشیاء",
    add_both_to_cart: "دونوں کو کارٹ میں شامل کریں",
    customers_also_viewed: "صارفین نے یہ بھی دیکھا",
    translate_reviews_btn: "تمام تبصروں کا اردو میں ترجمہ کریں",
    global_ratings: "عالمی ریٹنگز",
    verified_purchase: "تصدیق شدہ خریداری",
    val_this_item: "یہ آئٹم:",
    qa_q_prefix: "سوال:",
    qa_a_prefix: "جواب:",
    qa_q1: "کیا اس پروڈکٹ میں جی ایس ٹی انوائس شامل ہے؟",
    qa_a1: "ہاں، تمام اہل آرڈرز کے لیے جی ایس ٹی انوائس دستیاب ہے۔",
    qa_q2: "کیا یہ دفتر اور گھر کے استعمال کے لیے موزوں ہے؟",
    qa_a2: "ہاں، یہ دفتر اور گھر دونوں کے لیے موزوں ہے۔",
    qa_q3: "واپسی کی پالیسی کیا ہے؟",
    qa_a3: "خرابی کی صورت میں 7 دن کے اندر متبادل دستیاب ہے۔"
  },
  pa: {
    breadcrumb_products: "ਉਤਪਾਦ",
    visit_store_prefix: "ਸਟੋਰ 'ਤੇ ਜਾਓ",
    brand_label: "ਬ੍ਰਾਂਡ:",
    ratings_count_suffix: "ਰੇਟਿੰਗਾਂ",
    inclusive_all_taxes: "ਸਾਰੇ ਟੈਕਸਾਂ ਸਮੇਤ",
    ships_from: "ਭੇਜਣ ਵਾਲਾ:",
    sold_by: "ਵਿਕਰੇਤਾ:",
    payment_secure: "ਭੁਗਤਾਨ: ਸੁਰੱਖਿਅਤ ਲੈਣ-ਦੇਣ",
    spec_capacity: "ਸਮਰੱਥਾ",
    spec_voltage: "ਵੋਲਟੇਜ",
    spec_warranty: "ਵਾਰੰਟੀ ਵੇਰਵੇ",
    frequently_bought_together: "ਅਕਸਰ ਇਕੱਠੇ ਖਰੀਦੇ ਜਾਂਦੇ ਹਨ",
    add_both_to_cart: "ਦੋਵਾਂ ਨੂੰ ਕਾਰਟ ਵਿੱਚ ਸ਼ਾਮਲ ਕਰੋ",
    customers_also_viewed: "ਗਾਹਕਾਂ ਨੇ ਇਹ ਵੀ ਦੇਖਿਆ",
    translate_reviews_btn: "ਸਾਰੀਆਂ ਸਮੀਖਿਆਵਾਂ ਦਾ ਪੰਜਾਬੀ ਵਿੱਚ ਅਨੁਵਾਦ ਕਰੋ",
    global_ratings: "ਗਲੋਬਲ ਰੇਟਿੰਗਾਂ",
    verified_purchase: "ਪ੍ਰਮਾਣਿਤ ਖਰੀਦ",
    val_this_item: "ਇਹ ਆਈਟਮ:",
    qa_q_prefix: "ਸਵਾਲ:",
    qa_a_prefix: "ਜਵਾਬ:",
    qa_q1: "ਕੀ ਇਸ ਉਤਪਾਦ ਵਿੱਚ ਜੀਐਸਟੀ ਇਨਵੌਇਸ ਸ਼ਾਮਲ ਹੈ?",
    qa_a1: "ਹਾਂ, ਸਾਰੇ ਯੋਗ ਆਰਡਰਾਂ ਲਈ ਜੀਐਸਟੀ ਇਨਵੌਇਸ ਉਪਲਬਧ ਹੈ।",
    qa_q2: "ਕੀ ਇਹ ਦਫ਼ਤਰ ਅਤੇ ਘਰੇਲੂ ਵਰਤੋਂ ਲਈ ਢੁਕਵਾਂ ਹੈ?",
    qa_a2: "ਹਾਂ, ਇਹ ਦਫ਼ਤਰ ਅਤੇ ਘਰੇਲੂ ਦੋਵਾਂ ਵਰਤੋਂ ਲਈ ਢੁਕਵਾਂ ਹੈ।",
    qa_q3: "ਵਾਪਸੀ ਨੀਤੀ ਕੀ ਹੈ?",
    qa_a3: "ਜੇਕਰ ਆਈਟਮ ਖਰਾਬ ਹੈ ਤਾਂ 7 ਦਿਨਾਂ ਦੇ ਅੰਦਰ ਬਦਲ ਉਪਲਬਧ ਹੈ।"
  },
  gu: {
    breadcrumb_products: "ઉત્પાદનો",
    visit_store_prefix: "સ્ટોર પર જાઓ",
    brand_label: "બ્રાન્ડ:",
    ratings_count_suffix: "રેટિંગ્સ",
    inclusive_all_taxes: "બધા કર સહિત",
    ships_from: "મોકલનાર:",
    sold_by: "વેચનાર:",
    payment_secure: "ચુકવણી: સુરક્ષિત વ્યવહાર",
    spec_capacity: "ક્ષમતા",
    spec_voltage: "વોલ્ટેજ",
    spec_warranty: "વોરંટી વિગતો",
    frequently_bought_together: "વારંવાર સાથે ખરીદેલ",
    add_both_to_cart: "બંને કાર્ટમાં ઉમેરો",
    customers_also_viewed: "ગ્રાહકોએ આ પણ જોયું",
    translate_reviews_btn: "બધી સમીક્ષાઓનો ગુજરાતીમાં અનુવાદ કરો",
    global_ratings: "ગ્લોબલ રેટિંગ્સ",
    verified_purchase: "ચકાસાયેલ ખરીદી",
    val_this_item: "આ આઇટમ:",
    qa_q_prefix: "પ્રશ્ન:",
    qa_a_prefix: "જવાબ:",
    qa_q1: "શું આ પ્રોડક્ટમાં જીએસટી ઇનવોઇસ સામેલ છે?",
    qa_a1: "હા, બધા પાત્ર ઓર્ડર માટે જીએસટી ઇનવોઇસ ઉપલબ્ધ છે.",
    qa_q2: "શું આ ઓફિસ અને ઘર વપરાશ માટે યોગ્ય છે?",
    qa_a2: "હા, આ ઓફિસ અને ઘર બંને માટે યોગ્ય છે.",
    qa_q3: "રીટર્ન પોલિસી શું છે?",
    qa_a3: "જો વસ્તુ ક્ષતિગ્રસ્ત હોય તો 7 દિવસમાં બદલી ઉપલબ્ધ છે."
  }
};

// 1. Update translations.js
const transPath = path.join(projectDir, 'translations.js');
let transContent = fs.readFileSync(transPath, 'utf8');

Object.keys(AMAZON_DETAIL_I18N).forEach((lang) => {
  const keys = AMAZON_DETAIL_I18N[lang];
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
console.log('Successfully updated translations.js with all Amazon model keys across 11 languages!');

// 2. Update product-detail.html
const htmlPath = path.join(projectDir, 'product-detail.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');
const isHtmlCRLF = htmlContent.includes('\r\n');
let normHtml = htmlContent.replace(/\r\n/g, '\n');

// 2A. Breadcrumbs container with id and data-i18n
normHtml = normHtml.replace(
  /<p class="breadcrumbs"><a href="products.html">Products<\/a> &gt; <span id="crumbName">Product<\/span><\/p>/,
  '<p id="productBreadcrumb" class="breadcrumbs"><a href="products.html" data-i18n="breadcrumb_products">Products</a> &gt; <span id="crumbName">Product</span></p>'
);

// 2B. Brand and store line with id="productBrandRow"
normHtml = normHtml.replace(
  /<p class="seller-line">Visit the <a id="brandStoreLink" href="brands.html">brand store<\/a><\/p>/,
  '<p class="seller-line" id="productBrandRow"><a id="brandStoreLink" href="brands.html"></a></p>'
);

// 2C. Buy Box tax info and meta details (Ships from, Sold by, Payment)
const oldBuyBoxPart = `<p id="buyBoxSavings" class="buy-savings"></p>
        <p id="deliveryText" class="delivery-text"></p>
        <p id="availabilityText" class="availability in-stock stock-status" data-i18n="in_stock"></p>`;

const newBuyBoxPart = `<p id="buyBoxSavings" class="buy-savings"></p>
        <p id="taxInfo" class="tax-info" data-i18n="inclusive_all_taxes">Inclusive of all taxes</p>
        <p id="deliveryText" class="delivery-text"></p>
        <p id="availabilityText" class="availability in-stock stock-status" data-i18n="in_stock"></p>
        <div id="buyBoxMetaDetails" class="buybox-meta-details"></div>`;

normHtml = normHtml.replace(oldBuyBoxPart, newBuyBoxPart);

// 2D. Add frequentlyBoughtContainer before relatedBlock
if (!normHtml.includes('id="frequentlyBoughtContainer"')) {
  normHtml = normHtml.replace(
    '<section id="relatedBlock" class="related-block" hidden>',
    '<section id="frequentlyBoughtContainer" class="detail-card frequently-bought-card" hidden></section>\n\n    <section id="relatedBlock" class="related-block" hidden>'
  );
}

// 2E. Reviews block: add translate reviews button and sample verified review structure
const oldReviewsHtml = `    <section id="reviewsBlock" class="detail-card" hidden>
      <h2 data-i18n="customer_reviews_title">Customer Reviews</h2>
      <div class="review-summary">
        <p id="reviewHeadline" class="review-headline"></p>
        <div id="reviewBars" class="review-bars"></div>
      </div>
    </section>`;

const newReviewsHtml = `    <section id="reviewsBlock" class="detail-card" hidden>
      <div class="reviews-header-flex">
        <h2 data-i18n="customer_reviews_title">Customer Reviews</h2>
        <button id="translateReviewsBtn" class="translate-reviews-btn" type="button" data-i18n="translate_reviews_btn">Translate all reviews</button>
      </div>
      <div class="review-summary">
        <p id="reviewHeadline" class="review-headline"></p>
        <div id="reviewBars" class="review-bars"></div>
      </div>
      <div id="customerReviewsList" class="customer-reviews-list"></div>
    </section>`;

normHtml = normHtml.replace(oldReviewsHtml, newReviewsHtml);

htmlContent = isHtmlCRLF ? normHtml.replace(/\n/g, '\r\n') : normHtml;
fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('Successfully updated product-detail.html with Amazon model IDs and containers!');

// 3. Update product-detail.js
const jsPath = path.join(projectDir, 'product-detail.js');
let jsContent = fs.readFileSync(jsPath, 'utf8');
const isJsCRLF = jsContent.includes('\r\n');
let jsNorm = jsContent.replace(/\r\n/g, '\n');

// 3A. Helper function to localize spec bullet points
const specLocalizerFunction = `
function localizeSpec(spec, t) {
  if (!spec) return "";
  let s = String(spec);
  return s
    .replace(/\\bCapacity\\b/gi, t.spec_capacity || "Capacity")
    .replace(/\\bVoltage\\b/gi, t.spec_voltage || "Voltage")
    .replace(/\\bWarranty Details?\\b/gi, t.spec_warranty || "Warranty Details")
    .replace(/\\bHigh performance processor\\b/gi, t.spec_high_performance || "High performance processor")
    .replace(/\\bSSD storage\\b/gi, t.spec_ssd_storage || "SSD storage")
    .replace(/\\bLong battery life\\b/gi, t.spec_battery_life || "Long battery life")
    .replace(/\\bAMOLED display\\b/gi, t.spec_amoled_display || "AMOLED display")
    .replace(/\\bFast charging\\b/gi, t.spec_fast_charging || "Fast charging")
    .replace(/\\bMulti-camera setup\\b/gi, t.spec_multi_camera || "Multi-camera setup")
    .replace(/\\bBluetooth 5\\.2\\b/gi, t.spec_bluetooth || "Bluetooth 5.2")
    .replace(/\\bDeep bass\\b/gi, t.spec_deep_bass || "Deep bass")
    .replace(/\\bLow-latency mode\\b/gi, t.spec_low_latency || "Low-latency mode")
    .replace(/\\bDurable build\\b/gi, t.spec_durable_build || "Durable build")
    .replace(/\\bWarranty included\\b/gi, t.spec_warranty_included || "Warranty included")
    .replace(/\\bUniversal compatibility\\b/gi, t.spec_universal_compat || "Universal compatibility")
    .replace(/\\bQuality assured\\b/gi, t.spec_quality_assured || "Quality assured")
    .replace(/\\bTrusted by customers\\b/gi, t.spec_trusted_customers || "Trusted by customers")
    .replace(/\\bFast delivery options\\b/gi, t.spec_fast_delivery || "Fast delivery options");
}

function renderFrequentlyBoughtTogether(product, t) {
  const container = document.getElementById("frequentlyBoughtContainer");
  if (!container) return;
  const candidates = allProducts.filter(p => p.id !== product.id && p.category === product.category);
  const bundleItem = candidates.length > 0 ? candidates[0] : (allProducts.find(p => p.id !== product.id) || null);
  if (!bundleItem) {
    container.hidden = true;
    return;
  }
  const total = Number(product.price || 0) + Number(bundleItem.price || 0);
  container.innerHTML = \`
    <h2>\${t.frequently_bought_together || "Frequently bought together"}</h2>
    <div class="bundle-flex" style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap; margin-top: 12px;">
      <div class="bundle-images" style="display: flex; align-items: center; gap: 12px;">
        <img src="\${product.image}" alt="\${escapeHtml(product.name)}" style="width: 90px; height: 90px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd;" />
        <span style="font-size: 1.5rem; font-weight: bold; color: #555;">+</span>
        <img src="\${bundleItem.image}" alt="\${escapeHtml(bundleItem.name)}" style="width: 90px; height: 90px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd;" />
      </div>
      <div class="bundle-details" style="flex: 1; min-width: 250px;">
        <p style="font-size: 1.05rem; margin-bottom: 8px;">
          <strong>\${t.cart_subtotal || "Total"}:</strong> <span style="color: #b12704; font-size: 1.25rem; font-weight: bold;">\${money(total)}</span>
        </p>
        <div style="font-size: 0.9rem; color: #333; margin-bottom: 12px;">
          <label style="display: block; margin-bottom: 4px;"><input type="checkbox" checked disabled /> <strong>\${t.val_this_item || "This item:"}</strong> \${escapeHtml(product.name)} (\${money(product.price)})</label>
          <label style="display: block;"><input type="checkbox" id="bundleAccCheckbox" checked /> \${escapeHtml(bundleItem.name)} (\${money(bundleItem.price)})</label>
        </div>
        <button type="button" id="addBundleBtn" class="primary-btn" style="background: #ffd814; border: 1px solid #fcd200; border-radius: 20px; padding: 8px 18px; font-weight: 600; cursor: pointer;">
          \${t.add_both_to_cart || "Add both to Cart"}
        </button>
      </div>
    </div>
  \`;
  container.hidden = false;

  const btn = document.getElementById("addBundleBtn");
  if (btn) {
    btn.onclick = () => {
      addProductToCart(product.id, 1);
      const chk = document.getElementById("bundleAccCheckbox");
      if (chk && chk.checked) {
        addProductToCart(bundleItem.id, 1);
      }
      syncCartCount();
      btn.textContent = t.cart_success_added || "Added to Cart!";
      setTimeout(() => {
        btn.textContent = t.add_both_to_cart || "Add both to Cart";
      }, 2000);
    };
  }
}
`;

if (!jsNorm.includes('function localizeSpec')) {
  jsNorm = jsNorm.replace(
    'let activeRenderedProduct = null;',
    `${specLocalizerFunction}\n\nlet activeRenderedProduct = null;`
  );
}

// 3B. Update breadcrumb and brand row in renderProduct
const oldBreadcrumbAndBrand = `  productImage.alt = product.name;
  productName.textContent = product.name;
  productBrand.textContent = \`Brand: \${product.brand}\`;
  brandStoreLink.textContent = \`\${product.brand}\`;
  brandStoreLink.href = \`brands.html?brand=\${encodeURIComponent(String(product.brand || "").trim())}\`;`;

const newBreadcrumbAndBrand = `  productImage.alt = product.name;
  productName.textContent = product.name;
  
  // 1. Localized Breadcrumb
  const breadcrumbEl = document.getElementById("productBreadcrumb");
  if (breadcrumbEl) {
    breadcrumbEl.innerHTML = \`<a href="products.html" data-i18n="breadcrumb_products">\${t.breadcrumb_products || "Products"}</a> &gt; <span id="crumbName">\${escapeHtml(product.name)}</span>\`;
  }

  // 2. Localized Brand & Store Link
  productBrand.textContent = \`\${t.brand_label || "Brand:"} \${product.brand}\`;
  brandStoreLink.textContent = \`\${product.brand} \${t.visit_store_prefix || "Store"}\`;
  brandStoreLink.href = \`brands.html?brand=\${encodeURIComponent(String(product.brand || "").trim())}\`;
  const productBrandRow = document.getElementById("productBrandRow");
  if (productBrandRow) {
    productBrandRow.innerHTML = \`<a id="brandStoreLink" href="brands.html?brand=\${encodeURIComponent(String(product.brand || "").trim())}" class="brand-store-link">\${product.brand} \${t.visit_store_prefix || "Store"}</a>\`;
  }`;

jsNorm = jsNorm.replace(oldBreadcrumbAndBrand, newBreadcrumbAndBrand);

// 3C. Update buyBoxMetaDetails
const oldDeliveryBlock = `  deliveryText.textContent = product.segment === "b2c" ? (t.free_delivery_tomorrow || "FREE delivery by tomorrow") : "Business delivery options available";`;

const newDeliveryBlock = `  deliveryText.textContent = product.segment === "b2c" ? (t.free_delivery_tomorrow || "FREE delivery by tomorrow") : "Business delivery options available";
  const taxInfoEl = document.getElementById("taxInfo");
  if (taxInfoEl) {
    taxInfoEl.textContent = t.inclusive_all_taxes || "Inclusive of all taxes";
  }
  const buyBoxMeta = document.getElementById("buyBoxMetaDetails");
  if (buyBoxMeta) {
    buyBoxMeta.innerHTML = \`
      <div class="meta-row" style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-top: 6px; color: #565959;">
        <span>\${t.ships_from || "Ships from:"}</span> <strong style="color: #0f1111;">ElectroMart</strong>
      </div>
      <div class="meta-row" style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-top: 4px; color: #565959;">
        <span>\${t.sold_by || "Sold by:"}</span> <strong style="color: #0f1111;">\${product.brand || "ElectroMart"} Retail</strong>
      </div>
      <div class="meta-row" style="font-size: 0.88rem; margin-top: 4px; color: #007185;">
        <span>\${t.payment_secure || "Payment: Secure transaction"}</span>
      </div>
    \`;
  }`;

jsNorm = jsNorm.replace(oldDeliveryBlock, newDeliveryBlock);

// 3D. Update specs list to use localizeSpec
const oldSpecsLine = `  productSpecs.innerHTML = specs.map((spec) => \`<li>\${spec}</li>\`).join("");`;
const newSpecsLine = `  productSpecs.innerHTML = specs.map((spec) => \`<li>\${localizeSpec(spec, t)}</li>\`).join("");`;
jsNorm = jsNorm.replace(oldSpecsLine, newSpecsLine);

// 3E. Call renderFrequentlyBoughtTogether in renderProduct
const oldRenderOffersLine = `  renderOffers(price, listPrice, productCategoryFamily);`;
const newRenderOffersLine = `  renderOffers(price, listPrice, productCategoryFamily);
  renderFrequentlyBoughtTogether(product, t);`;
jsNorm = jsNorm.replace(oldRenderOffersLine, newRenderOffersLine);

// 3F. Localized Q&A
const oldQaBlock = `function renderQa(product) {
  if (!qaBlock || !qaList) {
    return;
  }
  const qa = [
    {
      q: "Does this product include GST invoice?",
      a: "Yes, GST invoice is available for all eligible orders."
    },
    {
      q: "Is this suitable for office and home use?",
      a: \`Yes, \${product.name} is suitable for both regular office and home usage.\`
    },
    {
      q: "What is the return policy?",
      a: "Replacement is available within 7 days if the item is damaged or not working."
    }
  ];
  qaList.innerHTML = qa.map((item) => \`
    <article class="qa-item">
      <h3>Q: \${escapeHtml(item.q)}</h3>
      <p>A: \${escapeHtml(item.a)}</p>
    </article>
  \`).join("");
  qaBlock.hidden = false;
}`;

const newQaBlock = `function renderQa(product) {
  if (!qaBlock || !qaList) {
    return;
  }
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : (window.EM_TRANSLATIONS ? window.EM_TRANSLATIONS.en : {});
  const qa = [
    {
      q: t.qa_q1 || "Does this product include GST invoice?",
      a: t.qa_a1 || "Yes, GST invoice is available for all eligible orders."
    },
    {
      q: t.qa_q2 || "Is this suitable for office and home use?",
      a: t.qa_a2 || \`Yes, \${product.name} is suitable for both regular office and home usage.\`
    },
    {
      q: t.qa_q3 || "What is the return policy?",
      a: t.qa_a3 || "Replacement is available within 7 days if the item is damaged or not working."
    }
  ];
  qaList.innerHTML = qa.map((item) => \`
    <article class="qa-item">
      <h3><strong>\${t.qa_q_prefix || "Q:"}</strong> \${escapeHtml(item.q)}</h3>
      <p><strong>\${t.qa_a_prefix || "A:"}</strong> \${escapeHtml(item.a)}</p>
    </article>
  \`).join("");
  qaBlock.hidden = false;
}`;

jsNorm = jsNorm.replace(oldQaBlock, newQaBlock);

// 3G. Customer reviews with Translate button and Verified Purchase
const oldReviewSummaryCode = `function renderReviewSummary(product) {
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

const newReviewSummaryCode = `function renderReviewSummary(product) {
  if (!reviewsBlock || !reviewHeadline || !reviewBars) {
    return;
  }
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : (window.EM_TRANSLATIONS ? window.EM_TRANSLATIONS.en : {});

  const rating = Math.max(0, Math.min(5, Number(product.rating || 0)));
  const totalReviews = Math.max(8, Math.round(42 + (rating * 37)));
  reviewHeadline.innerHTML = \`\${rating.toFixed(1)} &#9733; (\${totalReviews.toLocaleString("en-IN")} \${t.global_ratings || t.ratings_label || "रेटिंग"})\`;

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

  const translateBtn = document.getElementById("translateReviewsBtn");
  if (translateBtn) {
    translateBtn.textContent = t.translate_reviews_btn || "Translate all reviews";
  }

  const reviewsList = document.getElementById("customerReviewsList");
  if (reviewsList) {
    reviewsList.innerHTML = \`
      <div class="sample-review-item" style="border-top: 1px solid #e7e7e7; padding: 14px 0; margin-top: 14px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <span style="font-weight: 600; font-size: 0.95rem;">Rahul S.</span>
          <span style="color: #c45500; font-size: 0.85rem; font-weight: 600;">\${t.verified_purchase || "Verified Purchase"}</span>
        </div>
        <div style="color: #de7921; font-size: 0.95rem; margin-bottom: 4px;">★★★★★ <strong style="color: #0f1111; margin-left: 4px;">\${t.val_top_review_title || "Excellent quality and fast delivery"}</strong></div>
        <p style="font-size: 0.92rem; color: #333; line-height: 1.4;">\${t.val_sample_review || "Authentic product with genuine warranty. Fully satisfied with ElectroMart service."}</p>
      </div>
    \`;
  }

  reviewsBlock.hidden = false;
}`;

jsNorm = jsNorm.replace(oldReviewSummaryCode, newReviewSummaryCode);

const finalJs = isJsCRLF ? jsNorm.replace(/\n/g, '\r\n') : jsNorm;
fs.writeFileSync(jsPath, finalJs, 'utf8');
console.log('Successfully updated product-detail.js with Amazon model features!');
