const fs = require('fs');
const path = require('path');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');

const TODAYS_DEALS_I18N = {
  en: {
    limited_time_offers: "LIMITED TIME OFFERS",
    deals_subheading: "Grab flash discounts on top electronics before they expire.",
    daily_refresh: "Daily Refresh",
    top_categories: "Top Categories",
    fast_checkout: "Fast Checkout",
    deal_tip_title: "Deal Tip",
    deal_tip_desc: "Open product details and checkout quickly before stock runs out.",
    best_deals_today: "Best Deals Today",
    showing_deals: "deals shown",
    limited_time_deal_badge: "LIMITED TIME DEAL",
    ends_in: "Ends in:",
    claimed: "claimed",
    grab_before_refresh: "grab it before the next refresh.",
    free_delivery_pincode: "FREE delivery by tomorrow on eligible pincodes",
    sort_relevance: "Sort: Relevance",
    sort_highest_discount: "Highest Discount",
    under_price: "Under",
    above_price: "& Above",
    or_more: "or more",
    limited_time_pricing_note: "Limited-time pricing updates daily.",
    reviews_label: "reviews",
    under_500: "Under ₹500",
    price_500_999: "₹500 - ₹999",
    price_1000_1999: "₹1000 - ₹1999",
    price_2000_4999: "₹2000 - ₹4999",
    price_5000_9999: "₹5000 - ₹9999",
    price_10000_above: "₹10000 & Above",
    discount_10_more: "10% or more",
    discount_20_more: "20% or more",
    discount_30_more: "30% or more",
    discount_40_more: "40% or more",
    discount_50_more: "50% or more",
    lightning_deal: "Lightning Deal",
    limited_stock: "Limited Stock"
  },
  hi: {
    limited_time_offers: "सीमित समय के ऑफर",
    deals_subheading: "अवधि समाप्त होने से पहले शीर्ष इलेक्ट्रॉनिक्स पर फ्लैश छूट पाएं.",
    daily_refresh: "दैनिक रिफ्रेश",
    top_categories: "शीर्ष श्रेणियां",
    fast_checkout: "तेज़ चेकआउट",
    deal_tip_title: "डील टिप",
    deal_tip_desc: "स्टॉक खत्म होने से पहले प्रोडक्ट विवरण देखें और तुरंत चेकआउट करें.",
    best_deals_today: "आज की सर्वश्रेष्ठ डील्स",
    showing_deals: "डील्स दिखाई जा रही हैं",
    limited_time_deal_badge: "सीमित समय की डील",
    ends_in: "समाप्त होने में:",
    claimed: "दावा किया गया",
    grab_before_refresh: "अगले रिफ्रेश से पहले पाएं.",
    free_delivery_pincode: "पात्र पिनकोड पर कल तक मुफ़्त डिलीवरी",
    sort_relevance: "क्रमबद्ध: प्रासंगिकता",
    sort_highest_discount: "सर्वाधिक छूट",
    under_price: "से कम",
    above_price: "और अधिक",
    or_more: "या अधिक",
    limited_time_pricing_note: "सीमित समय का मूल्य निर्धारण दैनिक अपडेट होता है.",
    reviews_label: "समीक्षाएं",
    under_500: "₹500 से कम",
    price_500_999: "₹500 - ₹999",
    price_1000_1999: "₹1000 - ₹1999",
    price_2000_4999: "₹2000 - ₹4999",
    price_5000_9999: "₹5000 - ₹9999",
    price_10000_above: "₹10,000 और अधिक",
    discount_10_more: "10% या अधिक",
    discount_20_more: "20% या अधिक",
    discount_30_more: "30% या अधिक",
    discount_40_more: "40% या अधिक",
    discount_50_more: "50% या अधिक",
    lightning_deal: "लाइटनिंग डील",
    limited_stock: "सीमित स्टॉक"
  },
  ta: {
    limited_time_offers: "வரையறுக்கப்பட்ட நேர சலுகைகள்",
    deals_subheading: "காலாவதியாகும் முன் சிறந்த எலக்ட்ரானிக்ஸ் பொருட்களில் ஃபிளாஷ் தள்ளுபடிகளைப் பெறுங்கள்.",
    daily_refresh: "தினசரி புதுப்பிப்பு",
    top_categories: "முக்கிய வகைகள்",
    fast_checkout: "விரைவான செக்அவுட்",
    deal_tip_title: "டீல் குறிப்பு",
    deal_tip_desc: "இருப்பு முடிவதற்குள் தயாரிப்பு விவரங்களைப் பார்த்து உடனே செக்அவுட் செய்யவும்.",
    best_deals_today: "இன்றைய சிறந்த சலுகைகள்",
    showing_deals: "சலுகைகள் காட்டப்படுகின்றன",
    limited_time_deal_badge: "வரையறுக்கப்பட்ட நேர டீல்",
    ends_in: "முடிவடைகிறது:",
    claimed: "கோரப்பட்டது",
    grab_before_refresh: "அடுத்த புதுப்பிப்புக்கு முன் பெறுங்கள்.",
    free_delivery_pincode: "தகுதியான பின்கோடுகளில் நாளைக்குள் இலவச டெலிவரி",
    sort_relevance: "வரிசைப்படுத்து: தொடர்பு",
    sort_highest_discount: "அதிகபட்ச தள்ளுபடி",
    under_price: "குறைவான",
    above_price: "மற்றும் அதற்கு மேல்",
    or_more: "அல்லது அதற்கு மேல்",
    limited_time_pricing_note: "வரையறுக்கப்பட்ட நேர விலை தினசரி புதுப்பிக்கப்படும்.",
    reviews_label: "மதிப்புரைகள்",
    under_500: "₹500-க்குக் குறைவு",
    price_500_999: "₹500 - ₹999",
    price_1000_1999: "₹1000 - ₹1999",
    price_2000_4999: "₹2000 - ₹4999",
    price_5000_9999: "₹5000 - ₹9999",
    price_10000_above: "₹10,000 மற்றும் அதற்கு மேல்",
    discount_10_more: "10% அல்லது அதற்கு மேல்",
    discount_20_more: "20% அல்லது அதற்கு மேல்",
    discount_30_more: "30% அல்லது அதற்கு மேல்",
    discount_40_more: "40% அல்லது அதற்கு மேல்",
    discount_50_more: "50% அல்லது அதற்கு மேல்",
    lightning_deal: "மின்னல் டீல்",
    limited_stock: "வரையறுக்கப்பட்ட இருப்பு"
  },
  te: {
    limited_time_offers: "పరిమిత సమయ ఆఫర్లు",
    deals_subheading: "గడువు ముగిసేలోపు అగ్ర ఎలక్ట్రానిక్స్‌పై ఫ్లాష్ తగ్గింపులను పొందండి.",
    daily_refresh: "రోజువారీ రిఫ్రెష్",
    top_categories: "అగ్ర విభాగాలు",
    fast_checkout: "వేగవంతమైన చెక్అవుట్",
    deal_tip_title: "డీల్ చిట్కా",
    deal_tip_desc: "స్టాక్ ముగిసేలోపు ఉత్పత్తి వివరాలను చూసి త్వరగా చెక్అవుట్ చేయండి.",
    best_deals_today: "నేటి ఉత్తమ డీల్స్",
    showing_deals: "డీల్స్ చూపబడుతున్నాయి",
    limited_time_deal_badge: "పరిమిత సమయ డీల్",
    ends_in: "ముగింపు:",
    claimed: "క్లెయిమ్ చేయబడింది",
    grab_before_refresh: "తదుపరి రిఫ్రెష్ కంటే ముందే పొందండి.",
    free_delivery_pincode: "అర్హతగల పిన్‌కోడ్‌లపై రేపటికి ఉచిత డెలివరీ",
    sort_relevance: "క్రమబద్ధీకరించు: ఔచిత్యం",
    sort_highest_discount: "అత్యధిక తగ్గింపు",
    under_price: "తక్కువ",
    above_price: "మరియు అంతకంటే ఎక్కువ",
    or_more: "లేదా అంతకంటే ఎక్కువ",
    limited_time_pricing_note: "పరిమిత సమయ ధర ప్రతిరోజూ నవీకరించబడుతుంది.",
    reviews_label: "సమీక్షలు",
    under_500: "₹500 లోపు",
    price_500_999: "₹500 - ₹999",
    price_1000_1999: "₹1000 - ₹1999",
    price_2000_4999: "₹2000 - ₹4999",
    price_5000_9999: "₹5000 - ₹9999",
    price_10000_above: "₹10,000 మరియు అంతకంటే ఎక్కువ",
    discount_10_more: "10% లేదా అంతకంటే ఎక్కువ",
    discount_20_more: "20% లేదా అంతకంటే ఎక్కువ",
    discount_30_more: "30% లేదా అంతకంటే ఎక్కువ",
    discount_40_more: "40% లేదా అంతకంటే ఎక్కువ",
    discount_50_more: "50% లేదా అంతకంటే ఎక్కువ",
    lightning_deal: "మెరుపు డీల్",
    limited_stock: "పరిమిత స్టాక్"
  },
  kn: {
    limited_time_offers: "ಸೀಮಿತ ಅವಧಿಯ ಕೊಡುಗೆಗಳು",
    deals_subheading: "ಅವಧಿ ಮುಗಿಯುವ ಮುನ್ನ ಉನ್ನತ ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್‌ನಲ್ಲಿ ಫ್ಲ್ಯಾಷ್ ರಿಯಾಯಿತಿಗಳನ್ನು ಪಡೆಯಿರಿ.",
    daily_refresh: "ದೈನಂದಿನ ರಿಫ್ರೆಶ್",
    top_categories: "ಉನ್ನತ ವಿಭಾಗಗಳು",
    fast_checkout: "ವೇಗದ ಚೆಕ್‌ಔಟ್",
    deal_tip_title: "ಡೀಲ್ ಸಲಹೆ",
    deal_tip_desc: "ಸ್ಟಾಕ್ ಮುಗಿಯುವ ಮುನ್ನ ಉತ್ಪನ್ನದ ವಿವರಗಳನ್ನು ನೋಡಿ ತಕ್ಷಣ ಚೆಕ್‌ಔಟ್ ಮಾಡಿ.",
    best_deals_today: "ಇಂದಿನ ಅತ್ಯುತ್ತಮ ಡೀಲ್‌ಗಳು",
    showing_deals: "ಡೀಲ್‌ಗಳನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ",
    limited_time_deal_badge: "ಸೀಮಿತ ಸಮಯದ ಡೀಲ್",
    ends_in: "ಮುಕ್ತಾಯ:",
    claimed: "ಕ್ಲೈಮ್ ಮಾಡಲಾಗಿದೆ",
    grab_before_refresh: "ಮುಂದಿನ ರಿಫ್ರೆಶ್‌ಗೆ ಮುನ್ನ ಪಡೆದುಕೊಳ್ಳಿ.",
    free_delivery_pincode: "ಅರ್ಹ ಪಿನ್‌ಕೋಡ್‌ಗಳಲ್ಲಿ ನಾಳೆಯೊಳಗೆ ಉಚಿತ ವಿತರಣೆ",
    sort_relevance: "ವಿಂಗಡಿಸಿ: ಪ್ರಸ್ತುತತೆ",
    sort_highest_discount: "ಅತಿ ಹೆಚ್ಚು ರಿಯಾಯಿತಿ",
    under_price: "ಒಳಗೆ",
    above_price: "ಮತ್ತು ಅದಕ್ಕಿಂತ ಹೆಚ್ಚು",
    or_more: "ಅಥವಾ ಹೆಚ್ಚು",
    limited_time_pricing_note: "ಸೀಮಿತ ಸಮಯದ ಬೆಲೆ ದೈನಂದಿನ ನವೀಕರಣಗೊಳ್ಳುತ್ತದೆ.",
    reviews_label: "ವಿಮರ್ಶೆಗಳು",
    under_500: "₹500 ಕ್ಕಿಂತ ಕಡಿಮೆ",
    price_500_999: "₹500 - ₹999",
    price_1000_1999: "₹1000 - ₹1999",
    price_2000_4999: "₹2000 - ₹4999",
    price_5000_9999: "₹5000 - ₹9999",
    price_10000_above: "₹10,000 ಮತ್ತು ಅದಕ್ಕಿಂತ ಹೆಚ್ಚು",
    discount_10_more: "10% ಅಥವಾ ಹೆಚ್ಚು",
    discount_20_more: "20% ಅಥವಾ ಹೆಚ್ಚು",
    discount_30_more: "30% ಅಥವಾ ಹೆಚ್ಚು",
    discount_40_more: "40% ಅಥವಾ ಹೆಚ್ಚು",
    discount_50_more: "50% ಅಥವಾ ಹೆಚ್ಚು",
    lightning_deal: "ಮಿಂಚಿನ ಡೀಲ್",
    limited_stock: "ಸೀಮಿತ ದಾಸ್ತಾನು"
  },
  ml: {
    limited_time_offers: "പരിമിത സമയ ഓഫറുകൾ",
    deals_subheading: "കാലഹരണപ്പെടുന്നതിന് മുമ്പ് മികച്ച ഇലക്ട്രോണിക്സിൽ ഫ്ലാഷ് ഡിസ്കൗണ്ടുകൾ നേടൂ.",
    daily_refresh: "ദിവസേനയുള്ള പുതുക്കൽ",
    top_categories: "മികച്ച വിഭാഗങ്ങൾ",
    fast_checkout: "വേഗതയേറിയ ചെക്ക്ഔട്ട്",
    deal_tip_title: "ഡീൽ ടിപ്പ്",
    deal_tip_desc: "സ്റ്റോക്ക് തീരുന്നതിന് മുമ്പ് ഉൽപ്പന്ന വിവരങ്ങൾ കണ്ട് വേഗത്തിൽ ചെക്ക്ഔട്ട് ചെയ്യുക.",
    best_deals_today: "ഇന്നത്തെ മികച്ച ഡീലുകൾ",
    showing_deals: "ഡീലുകൾ കാണിക്കുന്നു",
    limited_time_deal_badge: "പരിമിത സമയ ഡീൽ",
    ends_in: "അവസാനിക്കുന്നു:",
    claimed: "ക്ലെയിം ചെയ്തു",
    grab_before_refresh: "അടുത്ത പുതുക്കലിന് മുമ്പ് സ്വന്തമാക്കുക.",
    free_delivery_pincode: "അർഹമായ പിൻകോഡുകളിൽ നാളെ സൗജന്യ ഡെലിവറി",
    sort_relevance: "ക്രമീകരിക്കുക: പ്രസക്തി",
    sort_highest_discount: "കൂടിയ കിഴിവ്",
    under_price: "താഴെ",
    above_price: "കൂടുതലും",
    or_more: "അല്ലെങ്കിൽ കൂടുതൽ",
    limited_time_pricing_note: "പരിമിത സമയ വില ദിവസവും അപ്ഡേറ്റ് ചെയ്യുന്നു.",
    reviews_label: "അവലോകനങ്ങൾ",
    under_500: "₹500 ൽ താഴെ",
    price_500_999: "₹500 - ₹999",
    price_1000_1999: "₹1000 - ₹1999",
    price_2000_4999: "₹2000 - ₹4999",
    price_5000_9999: "₹5000 - ₹9999",
    price_10000_above: "₹10,000 ൽ കൂടുതൽ",
    discount_10_more: "10% അല്ലെങ്കിൽ കൂടുതൽ",
    discount_20_more: "20% അല്ലെങ്കിൽ കൂടുതൽ",
    discount_30_more: "30% അല്ലെങ്കിൽ കൂടുതൽ",
    discount_40_more: "40% അല്ലെങ്കിൽ കൂടുതൽ",
    discount_50_more: "50% അല്ലെങ്കിൽ കൂടുതൽ",
    lightning_deal: "മിന്നൽ ഡീൽ",
    limited_stock: "പരിമിത സ്റ്റോക്ക്"
  },
  bn: {
    limited_time_offers: "সীমিত সময়ের অফার",
    deals_subheading: "মেয়াদ শেষ হওয়ার আগেই সেরা ইলেকট্রনিক্সে ফ্ল্যাশ ছাড় পান।",
    daily_refresh: "দৈনিক রিফ্রেশ",
    top_categories: "শীর্ষ বিভাগ",
    fast_checkout: "দ্রুত চেকআউট",
    deal_tip_title: "ডিল টিপ",
    deal_tip_desc: "স্টক শেষ হওয়ার আগেই পণ্যের বিবরণ দেখুন এবং দ্রুত চেকআউট করুন।",
    best_deals_today: "আজকের সেরা ডিল",
    showing_deals: "ডিল দেখানো হচ্ছে",
    limited_time_deal_badge: "সীমিত সময়ের ডিল",
    ends_in: "শেষ হতে বাকি:",
    claimed: "দাবি করা হয়েছে",
    grab_before_refresh: "পরবর্তী রিফ্রেশের আগেই পান।",
    free_delivery_pincode: "যোগ্য পিনকোডে কালকের মধ্যে ফ্রি ডেলিভারি",
    sort_relevance: "বাছাই: প্রাসঙ্গিকতা",
    sort_highest_discount: "সর্বোচ্চ ছাড়",
    under_price: "কম",
    above_price: "এবং বেশি",
    or_more: "বা তার বেশি",
    limited_time_pricing_note: "সীমিত সময়ের মূল্য প্রতিদিন আপডেট হয়।",
    reviews_label: "পর্যালোচনা",
    under_500: "₹৫০০ এর নিচে",
    price_500_999: "₹৫০০ - ₹৯৯৯",
    price_1000_1999: "₹১০০০ - ₹১৯৯৯",
    price_2000_4999: "₹২০০০ - ₹৪৯৯৯",
    price_5000_9999: "₹৫০০০ - ₹৯৯৯৯",
    price_10000_above: "₹১০,০০০ বা তার বেশি",
    discount_10_more: "১০% বা তার বেশি",
    discount_20_more: "২০% বা তার বেশি",
    discount_30_more: "৩০% বা তার বেশি",
    discount_40_more: "৪০% বা তার বেশি",
    discount_50_more: "৫০% বা তার বেশি",
    lightning_deal: "লাইটনিং ডিল",
    limited_stock: "সীমিত স্টক"
  },
  mr: {
    limited_time_offers: "मर्यादित वेळेच्या ऑफर्स",
    deals_subheading: "मुदत संपण्यापूर्वी शीर्ष इलेक्ट्रॉनिक्सवर फ्लॅश सवलत मिळवा.",
    daily_refresh: "दैनिक रिफ्रेश",
    top_categories: "शीर्ष श्रेणी",
    fast_checkout: "जलद चेकआउट",
    deal_tip_title: "डील टीप",
    deal_tip_desc: "स्टॉक संपण्यापूर्वी उत्पादन तपशील पहा आणि त्वरित चेकआउट करा.",
    best_deals_today: "आजच्या सर्वोत्तम डील्स",
    showing_deals: "डील्स दाखवत आहे",
    limited_time_deal_badge: "मर्यादित वेळेची डील",
    ends_in: "समाप्त होण्यास:",
    claimed: "दावा केला",
    grab_before_refresh: "पुढील रिफ्रेशपूर्वी मिळवा.",
    free_delivery_pincode: "पात्र पिनकोडवर उद्यापर्यंत मोफत डिलिव्हरी",
    sort_relevance: "क्रमवारी: सुसंगतता",
    sort_highest_discount: "सर्वाधिक सवलत",
    under_price: "पेक्षा कमी",
    above_price: "आणि अधिक",
    or_more: "किंवा अधिक",
    limited_time_pricing_note: "मर्यादित कालावधीची किंमत दररोज अपडेट होते.",
    reviews_label: "पुनरावलोकने",
    under_500: "₹500 पेक्षा कमी",
    price_500_999: "₹500 - ₹999",
    price_1000_1999: "₹1000 - ₹1999",
    price_2000_4999: "₹2000 - ₹4999",
    price_5000_9999: "₹5000 - ₹9999",
    price_10000_above: "₹10,000 आणि अधिक",
    discount_10_more: "10% किंवा अधिक",
    discount_20_more: "20% किंवा अधिक",
    discount_30_more: "30% किंवा अधिक",
    discount_40_more: "40% किंवा अधिक",
    discount_50_more: "50% किंवा अधिक",
    lightning_deal: "लाइटनिंग डील",
    limited_stock: "मर्यादित स्टॉक"
  },
  ur: {
    limited_time_offers: "محدود وقت کی پیشکشیں",
    deals_subheading: "میعاد ختم ہونے سے پہلے اعلی الیکٹرانکس پر فلیش ڈسکاؤنٹ حاصل کریں۔",
    daily_refresh: "روزانہ ریفریش",
    top_categories: "اعلی زمرہ جات",
    fast_checkout: "تیز چیک آؤٹ",
    deal_tip_title: "ڈیل کی معلومات",
    deal_tip_desc: "اسٹاک ختم ہونے سے پہلے پروڈکٹ کی تفصیلات دیکھیں اور فوری چیک آؤٹ کریں۔",
    best_deals_today: "آج کی بہترین ڈیلز",
    showing_deals: "ڈیلز دکھائی جا رہی ہیں",
    limited_time_deal_badge: "محدود وقت کی ڈیل",
    ends_in: "ختم ہونے میں:",
    claimed: "دعویٰ کیا گیا",
    grab_before_refresh: "اگلے ریفریش سے پہلے حاصل کریں۔",
    free_delivery_pincode: "اہل پن کوڈز پر کل تک مفت ترسیل",
    sort_relevance: "ترتیب: مطابقت",
    sort_highest_discount: "سب سے زیادہ رعایت",
    under_price: "سے کم",
    above_price: "اور زیادہ",
    or_more: "یا زیادہ",
    limited_time_pricing_note: "محدود وقت کی قیمتیں روزانہ اپ ڈیٹ ہوتی ہیں۔",
    reviews_label: "جائزے",
    under_500: "₹500 سے کم",
    price_500_999: "₹500 - ₹999",
    price_1000_1999: "₹1000 - ₹1999",
    price_2000_4999: "₹2000 - ₹4999",
    price_5000_9999: "₹5000 - ₹9999",
    price_10000_above: "₹10,000 اور زیادہ",
    discount_10_more: "10% یا زیادہ",
    discount_20_more: "20% یا زیادہ",
    discount_30_more: "30% یا زیادہ",
    discount_40_more: "40% یا زیادہ",
    discount_50_more: "50% یا زیادہ",
    lightning_deal: "لائٹننگ ڈیل",
    limited_stock: "محدود اسٹاک"
  },
  pa: {
    limited_time_offers: "ਸੀਮਤ ਸਮੇਂ ਦੀਆਂ ਪੇਸ਼ਕਸ਼ਾਂ",
    deals_subheading: "ਮਿਆਦ ਪੁੱਗਣ ਤੋਂ ਪਹਿਲਾਂ ਪ੍ਰਮੁੱਖ ਇਲੈਕਟ੍ਰਾਨਿਕਸ 'ਤੇ ਫਲੈਸ਼ ਛੋਟ ਪ੍ਰਾਪਤ ਕਰੋ।",
    daily_refresh: "ਰੋਜ਼ਾਨਾ ਰਿਫ੍ਰੈਸ਼",
    top_categories: "ਚੋਟੀ ਦੀਆਂ ਸ਼੍ਰੇਣੀਆਂ",
    fast_checkout: "ਤੇਜ਼ ਚੈੱਕਆਉਟ",
    deal_tip_title: "ਡੀਲ ਸੁਝਾਅ",
    deal_tip_desc: "ਸਟਾਕ ਖਤਮ ਹੋਣ ਤੋਂ ਪਹਿਲਾਂ ਉਤਪਾਦ ਦੇ ਵੇਰਵੇ ਦੇਖੋ ਅਤੇ ਤੁਰੰਤ ਚੈੱਕਆਉਟ ਕਰੋ।",
    best_deals_today: "ਅੱਜ ਦੀਆਂ ਸਭ ਤੋਂ ਵਧੀਆ ਡੀਲਾਂ",
    showing_deals: "ਡੀਲਾਂ ਦਿਖਾਈਆਂ ਜਾ ਰਹੀਆਂ ਹਨ",
    limited_time_deal_badge: "ਸੀਮਤ ਸਮੇਂ ਦੀ ਡੀਲ",
    ends_in: "ਖਤਮ ਹੋਣ ਵਿੱਚ:",
    claimed: "ਦਾਅਵਾ ਕੀਤਾ",
    grab_before_refresh: "ਅਗਲੇ ਰਿਫ੍ਰੈਸ਼ ਤੋਂ ਪਹਿਲਾਂ ਪ੍ਰਾਪਤ ਕਰੋ।",
    free_delivery_pincode: "ਯੋਗ ਪਿੰਨ ਕੋਡਾਂ 'ਤੇ ਕੱਲ੍ਹ ਤੱਕ ਮੁਫ਼ਤ ਡਿਲਿਵਰੀ",
    sort_relevance: "ਲੜੀਬੱਧ: ਢੁਕਵਾਂ",
    sort_highest_discount: "ਸਭ ਤੋਂ ਵੱਧ ਛੋਟ",
    under_price: "ਤੋਂ ਘੱਟ",
    above_price: "ਅਤੇ ਵੱਧ",
    or_more: "ਜਾਂ ਵੱਧ",
    limited_time_pricing_note: "ਸੀਮਤ ਸਮੇਂ ਦੀ ਕੀਮਤ ਰੋਜ਼ਾਨਾ ਅੱਪਡੇਟ ਹੁੰਦੀ ਹੈ।",
    reviews_label: "ਸਮੀਖਿਆਵਾਂ",
    under_500: "₹500 ਤੋਂ ਘੱਟ",
    price_500_999: "₹500 - ₹999",
    price_1000_1999: "₹1000 - ₹1999",
    price_2000_4999: "₹2000 - ₹4999",
    price_5000_9999: "₹5000 - ₹9999",
    price_10000_above: "₹10,000 ਅਤੇ ਵੱਧ",
    discount_10_more: "10% ਜਾਂ ਵੱਧ",
    discount_20_more: "20% ਜਾਂ ਵੱਧ",
    discount_30_more: "30% ਜਾਂ ਵੱਧ",
    discount_40_more: "40% ਜਾਂ ਵੱਧ",
    discount_50_more: "50% ਜਾਂ ਵੱਧ",
    lightning_deal: "ਲਾਈਟਨਿੰਗ ਡੀਲ",
    limited_stock: "ਸੀਮਤ ਸਟਾਕ"
  },
  gu: {
    limited_time_offers: "મર્યાદિત સમયની ઑફર્સ",
    deals_subheading: "સમય સમાપ્ત થાય તે પહેલાં ટોચના ઇલેક્ટ્રોનિક્સ પર ફ્લેશ ડિસ્કાઉન્ટ મેળવો.",
    daily_refresh: "દૈનિક રિફ્રેશ",
    top_categories: "ટોચની શ્રેણીઓ",
    fast_checkout: "ઝડપી ચેકઆઉટ",
    deal_tip_title: "ડીલ ટીપ",
    deal_tip_desc: "સ્ટોક ખાલી થાય તે પહેલાં પ્રોડક્ટની વિગતો જુઓ અને ઝડપથી ચેકઆઉટ કરો.",
    best_deals_today: "આજની શ્રેષ્ઠ ડીલ્સ",
    showing_deals: "ડીલ્સ દર્શાવી રહ્યા છીએ",
    limited_time_deal_badge: "મર્યાદિત સમયની ડીલ",
    ends_in: "સમાપ્ત થવામાં:",
    claimed: "દાવો કર્યો",
    grab_before_refresh: "આગલા રિફ્રેશ પહેલાં મેળવો.",
    free_delivery_pincode: "પાત્ર પિનકોડ પર કાલ સુધીમાં મફત ડિલિવરી",
    sort_relevance: "ક્રમબદ્ધ: સુસંગતતા",
    sort_highest_discount: "સૌથી વધુ ડિસ્કાઉન્ટ",
    under_price: "થી ઓછું",
    above_price: "અને વધુ",
    or_more: "અથવા વધુ",
    limited_time_pricing_note: "મર્યાદિત સમયના ભાવો દૈનિક અપડેટ થાય છે.",
    reviews_label: "સમીક્ષાઓ",
    under_500: "₹500 થી ઓછું",
    price_500_999: "₹500 - ₹999",
    price_1000_1999: "₹1000 - ₹1999",
    price_2000_4999: "₹2000 - ₹4999",
    price_5000_9999: "₹5000 - ₹9999",
    price_10000_above: "₹10,000 અને વધુ",
    discount_10_more: "10% અથવા વધુ",
    discount_20_more: "20% અથવા વધુ",
    discount_30_more: "30% અથવા વધુ",
    discount_40_more: "40% અથવા વધુ",
    discount_50_more: "50% અથવા વધુ",
    lightning_deal: "લાઇટનિંગ ડીલ",
    limited_stock: "મર્યાદિત સ્ટોક"
  }
};

// 1. Update translations.js
const transPath = path.join(projectDir, 'translations.js');
let transCode = fs.readFileSync(transPath, 'utf8');

const marker = 'window.EM_TRANSLATIONS = translations;';
const injection = `
  // Merge today's deals translations across all 11 languages
  const TODAYS_DEALS_I18N = ${JSON.stringify(TODAYS_DEALS_I18N, null, 2)};
  Object.keys(TODAYS_DEALS_I18N).forEach((lang) => {
    if (translations[lang]) {
      Object.assign(translations[lang], TODAYS_DEALS_I18N[lang]);
    }
  });

  ${marker}`;

if (transCode.includes(marker)) {
  transCode = transCode.replace(marker, injection);
}

// Add renderTodaysDeals call in applyFullPageTranslation
if (!transCode.includes('window.renderTodaysDeals')) {
  transCode = transCode.replace(
    'if (typeof window.renderBestSellers === "function") {\n      window.renderBestSellers(selectedLang);\n    }',
    'if (typeof window.renderBestSellers === "function") {\n      window.renderBestSellers(selectedLang);\n    }\n    if (typeof window.renderTodaysDeals === "function") {\n      window.renderTodaysDeals(selectedLang);\n    }'
  );
}

fs.writeFileSync(transPath, transCode, 'utf8');
console.log("Successfully updated translations.js with Today's Deals keys");

// 2. Update todays-deals.html
const tdHtmlPath = path.join(projectDir, 'todays-deals.html');
let tdHtml = fs.readFileSync(tdHtmlPath, 'utf8');

// Hero section
tdHtml = tdHtml.replace(
  '<p class="eyebrow">Limited Time Offers</p>',
  '<p class="eyebrow" data-i18n="limited_time_offers">Limited Time Offers</p>'
);
tdHtml = tdHtml.replace(
  '<p>Grab flash discounts on top electronics before they expire.</p>',
  '<p data-i18n="deals_subheading">Grab flash discounts on top electronics before they expire.</p>'
);
tdHtml = tdHtml.replace(
  '<span>Daily Refresh</span>',
  '<span data-i18n="daily_refresh">Daily Refresh</span>'
);
tdHtml = tdHtml.replace(
  '<span>Top Categories</span>',
  '<span data-i18n="top_categories">Top Categories</span>'
);
tdHtml = tdHtml.replace(
  '<span>Fast Checkout</span>',
  '<span data-i18n="fast_checkout">Fast Checkout</span>'
);

// Sidebar & filters
tdHtml = tdHtml.replace(
  '<p>Amazon style filters</p>',
  '<p data-i18n="amazon_style_filters">Amazon style filters</p>'
);
tdHtml = tdHtml.replace(
  '<option value="all">All</option>',
  '<option value="all" data-i18n="all_option">All</option>'
);
tdHtml = tdHtml.replace(
  '<option value="0-499">Under ₹500</option>',
  '<option value="0-499" data-i18n="under_500">Under ₹500</option>'
);
tdHtml = tdHtml.replace(
  '<option value="500-999">₹500 - ₹999</option>',
  '<option value="500-999" data-i18n="price_500_999">₹500 - ₹999</option>'
);
tdHtml = tdHtml.replace(
  '<option value="1000-1999">₹1000 - ₹1999</option>',
  '<option value="1000-1999" data-i18n="price_1000_1999">₹1000 - ₹1999</option>'
);
tdHtml = tdHtml.replace(
  '<option value="2000-4999">₹2000 - ₹4999</option>',
  '<option value="2000-4999" data-i18n="price_2000_4999">₹2000 - ₹4999</option>'
);
tdHtml = tdHtml.replace(
  '<option value="5000-9999">₹5000 - ₹9999</option>',
  '<option value="5000-9999" data-i18n="price_5000_9999">₹5000 - ₹9999</option>'
);
tdHtml = tdHtml.replace(
  '<option value="10000-999999">₹10000 & Above</option>',
  '<option value="10000-999999" data-i18n="price_10000_above">₹10000 & Above</option>'
);

tdHtml = tdHtml.replace(
  '<h3>Discount</h3>',
  '<h3 data-i18n="discount">Discount</h3>'
);
tdHtml = tdHtml.replace(
  '<option value="10">10% or more</option>',
  '<option value="10" data-i18n="discount_10_more">10% or more</option>'
);
tdHtml = tdHtml.replace(
  '<option value="20">20% or more</option>',
  '<option value="20" data-i18n="discount_20_more">20% or more</option>'
);
tdHtml = tdHtml.replace(
  '<option value="30">30% or more</option>',
  '<option value="30" data-i18n="discount_30_more">30% or more</option>'
);
tdHtml = tdHtml.replace(
  '<option value="40">40% or more</option>',
  '<option value="40" data-i18n="discount_40_more">40% or more</option>'
);
tdHtml = tdHtml.replace(
  '<option value="50">50% or more</option>',
  '<option value="50" data-i18n="discount_50_more">50% or more</option>'
);

tdHtml = tdHtml.replace(
  '<option value="all">All Categories</option>',
  '<option value="all" data-i18n="all_categories">All Categories</option>'
);
tdHtml = tdHtml.replace(
  '<option value="laptop">Laptops</option>',
  '<option value="laptop" data-i18n="laptops">Laptops</option>'
);
tdHtml = tdHtml.replace(
  '<option value="mobile">Mobiles</option>',
  '<option value="mobile" data-i18n="mobiles">Mobiles</option>'
);
tdHtml = tdHtml.replace(
  '<option value="audio">Audio</option>',
  '<option value="audio" data-i18n="audio_headphones">Audio</option>'
);
tdHtml = tdHtml.replace(
  '<option value="accessory">Accessories</option>',
  '<option value="accessory" data-i18n="accessories">Accessories</option>'
);

tdHtml = tdHtml.replace(
  '<option value="relevance">Sort: Relevance</option>',
  '<option value="relevance" data-i18n="sort_relevance">Sort: Relevance</option>'
);
tdHtml = tdHtml.replace(
  '<option value="discount_desc">Highest Discount</option>',
  '<option value="discount_desc" data-i18n="sort_highest_discount">Highest Discount</option>'
);
tdHtml = tdHtml.replace(
  '<option value="price_asc">Price: Low to High</option>',
  '<option value="price_asc" data-i18n="price_low_high">Price: Low to High</option>'
);
tdHtml = tdHtml.replace(
  '<option value="price_desc">Price: High to Low</option>',
  '<option value="price_desc" data-i18n="price_high_low">Price: High to Low</option>'
);

tdHtml = tdHtml.replace(
  '<h3>Deal Tip</h3>',
  '<h3 data-i18n="deal_tip_title">Deal Tip</h3>'
);
tdHtml = tdHtml.replace(
  '<p>Open product details and checkout quickly before stock runs out.</p>',
  '<p data-i18n="deal_tip_desc">Open product details and checkout quickly before stock runs out.</p>'
);

// Result panel
tdHtml = tdHtml.replace(
  '<h2>Best Deals Today</h2>',
  '<h2 data-i18n="best_deals_today">Best Deals Today</h2>'
);
tdHtml = tdHtml.replace(
  '<p class="result-note">Limited-time pricing updates daily.</p>',
  '<p class="result-note" data-i18n="limited_time_pricing_note">Limited-time pricing updates daily.</p>'
);

// Script tags order: ensure translations.js is before todays-deals.js
const oldScripts = `<script src="listing-filter-chips.js?v=20260314a"></script>
  <script src="todays-deals.js?v=20260315d"></script>
  <script src="menu-manager.js"></script>
  <script src="shared-search.js?v=20260314g"></script>
  <script src="translations.js"></script>
  <script src="header.js"></script>`;

const newScripts = `<script src="listing-filter-chips.js?v=20260314a"></script>
  <script src="translations.js"></script>
  <script src="header.js"></script>
  <script src="todays-deals.js?v=20260315d"></script>
  <script src="menu-manager.js"></script>
  <script src="shared-search.js?v=20260314g"></script>`;

tdHtml = tdHtml.replace(oldScripts, newScripts);

fs.writeFileSync(tdHtmlPath, tdHtml, 'utf8');
console.log("Successfully updated todays-deals.html with data-i18n attributes");

// 3. Update todays-deals.js dealCard and render functions
const tdJsPath = path.join(projectDir, 'todays-deals.js');
let tdJs = fs.readFileSync(tdJsPath, 'utf8');

const oldDealCard = /function dealCard\(item\) \{[\s\S]*?\n\}/;
const newDealCard = `function dealCard(item) {
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : ((window.EM_TRANSLATIONS && window.EM_TRANSLATIONS.en) ? window.EM_TRANSLATIONS.en : {});

  // Preview overlay content
  const preview = \`<div class='deal-preview-overlay' tabindex="-1"><strong>\${t.quick_view || "Quick View"}:</strong> \${escapeHtml(item.name)}<br>\${t.brands || "Brand"}: \${escapeHtml(item.brand)}<br>\${t.discount || "Discount"}: \${discountPercent(item.oldPrice, item.dealPrice)}%</div>\`;
  const detailUrl = \`product-detail.html?id=\${encodeURIComponent(item.id)}\`;
  const brandUrl = \`brands.html?brand=\${encodeURIComponent(String(item.brand || "").trim())}\`;
  const discount = discountPercent(item.oldPrice, item.dealPrice);

  const rawBadge = getDealBadge(item);
  let badgeText = rawBadge.label;
  if (badgeText === "Best Seller") badgeText = t.badge_best_seller || "Best Seller";
  else if (badgeText === "Lightning Deal") badgeText = t.lightning_deal || "Lightning Deal";
  else if (badgeText === "Limited Stock") badgeText = t.limited_stock || "Limited Stock";
  else if (badgeText === "Deal") badgeText = t.deal_badge || "Deal";

  const expiry = getDealExpiry(item);
  const countdownId = \`deal-timer-\${item.id}\`;
  const progress = getDealProgress(item);
  const { rating, reviews } = getDealRating(item);

  return \`
    <article class="deal-card" tabindex="0" onmouseenter="this.querySelector('.deal-preview-overlay').style.opacity=0" onmouseleave="this.querySelector('.deal-preview-overlay').style.opacity=''">
      <div class="deal-badge \${rawBadge.class}">\${badgeText}</div>
      \${getPrimeTag(item)}
      <a class="deal-card-media" href="\${detailUrl}" aria-label="Open \${escapeHtml(item.name)}">
        <img src="\${escapeHtml(item.image)}" alt="\${escapeHtml(item.name)}" loading="lazy" />
        \${preview}
      </a>
      <div class="content">
        <p class="card-kicker">\${t.limited_time_deal_badge || "Limited time deal"}</p>
        <h3><a href="\${detailUrl}">\${escapeHtml(item.name)}</a></h3>
        <p><a class="brand-line" href="\${brandUrl}">\${t.by_brand || "by"} \${escapeHtml(item.brand)}</a></p>
        <div class="price-row">
          <span class="price-now">\${escapeHtml(money(item.dealPrice))}</span>
          <span class="discount">\${escapeHtml(String(discount))}% \${t.percent_off || "off"}</span>
        </div>
        <div class="deal-rating-row">
          \${renderStars(rating)}
          <span class="deal-rating-label">\${rating} | \${reviews} \${t.reviews_label || "reviews"}</span>
        </div>
        <div class="deal-timer-row"><span class="deal-timer-label">\${t.ends_in || "Ends in:"}</span> <span class="deal-timer" id="\${countdownId}">\${formatCountdown(expiry - Date.now())}</span></div>
        <div class="deal-progress-row">
          <div class="deal-progress-bar-bg">
            <div class="deal-progress-bar" style="width:\${progress}%"></div>
          </div>
          <span class="deal-progress-label">\${progress}% \${t.claimed || "claimed"}</span>
        </div>
        <p class="price-meta">\${t.mrp || "M.R.P."} <s>\${escapeHtml(money(item.oldPrice))}</s> - \${t.grab_before_refresh || "grab it before the next refresh."}</p>
        <p class="delivery-note">\${t.free_delivery_pincode || "FREE delivery by tomorrow on eligible pincodes"}</p>
        <div class="card-actions">
          <button class="add-btn" data-id="\${escapeHtml(item.id)}" type="button">\${t.add_to_cart || "Add to Cart"}</button>
          <a class="view-link" href="\${detailUrl}">\${t.view_details || "View details"}</a>
        </div>
      </div>
    </article>
  \`;
}`;

tdJs = tdJs.replace(oldDealCard, newDealCard);

// Update render function
const oldRender = /function render\(list\) \{[\s\S]*?dealsGrid\.innerHTML = list\.map\(dealCard\)\.join\(""\);\n\}/;
const newRender = `function render(list) {
  if (!resultMeta || !dealsGrid) {
    return;
  }
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : {};
  resultMeta.textContent = \`\${t.showing || "Showing"} \${list.length} \${t.showing_deals || "deals"}\`;
  if (!list.length) {
    dealsGrid.innerHTML = \`<div class='empty'>\${t.no_deals_found || "No exact deal matches found. Try clearing one filter or broadening the search."}</div>\`;
    return;
  }
  dealsGrid.innerHTML = list.map(dealCard).join("");
}`;

tdJs = tdJs.replace(oldRender, newRender);

// Expose window.renderTodaysDeals
if (!tdJs.includes('window.renderTodaysDeals')) {
  tdJs += `\nwindow.renderTodaysDeals = function() {\n  filterDeals();\n};\nwindow.filterDeals = filterDeals;\n`;
}

fs.writeFileSync(tdJsPath, tdJs, 'utf8');
console.log("Successfully updated todays-deals.js with dynamic i18n dealCard");
