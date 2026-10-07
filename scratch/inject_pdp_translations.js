const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'translations.js');
let content = fs.readFileSync(filePath, 'utf8');

if (content.includes('AMAZON_PDP_PAGE_I18N')) {
  console.log('AMAZON_PDP_PAGE_I18N already exists in translations.js');
  process.exit(0);
}

const pdpCode = `
  const AMAZON_PDP_PAGE_I18N = {
    "en": {
      "amazons_choice": "Amazon's Choice",
      "bought_in_past_month": "1K+ bought in past month",
      "bank_offers_title": "Bank Offer",
      "no_cost_emi_title": "No Cost EMI",
      "partner_offers_title": "Partner Offers",
      "bank_offer_detail": "Upto ₹1,500 discount on select Credit Cards",
      "no_cost_emi_detail": "Avail No Cost EMI on select cards for orders above ₹3,000",
      "partner_offer_detail": "Get GST invoice and save up to 28% on business purchases",
      "replacement_badge": "7 days Replacement",
      "free_delivery_badge": "Free Delivery",
      "warranty_badge": "1 Year Warranty",
      "pay_on_delivery_badge": "Pay on Delivery",
      "top_brand_badge": "Top Brand",
      "helpful_button": "Helpful",
      "write_review_btn": "Write a product review",
      "read_more_offers": "See more offers",
      "by_feature": "By feature",
      "value_for_money": "Value for money",
      "battery_life": "Battery life",
      "quality_assurance": "Quality"
    },
    "hi": {
      "amazons_choice": "अमेज़न चॉइस",
      "bought_in_past_month": "पिछले महीने में 1K+ खरीदे गए",
      "bank_offers_title": "बैंक ऑफर",
      "no_cost_emi_title": "नो कॉस्ट EMI",
      "partner_offers_title": "पार्टनर ऑफर्स",
      "bank_offer_detail": "चुनिंदा क्रेडिट कार्ड पर ₹1,500 तक की छूट",
      "no_cost_emi_detail": "₹3,000 से अधिक के ऑर्डर पर चुनिंदा कार्ड पर नो कॉस्ट EMI",
      "partner_offer_detail": "जीएसटी चालान पाएं और बिजनेस खरीदारी पर 28% तक बचाएं",
      "replacement_badge": "7 दिनों में रिप्लेसमेंट",
      "free_delivery_badge": "फ्री डिलीवरी",
      "warranty_badge": "1 वर्ष की वारंटी",
      "pay_on_delivery_badge": "पे ऑन डिलीवरी",
      "top_brand_badge": "टॉप ब्रांड",
      "helpful_button": "मददगार",
      "write_review_btn": "उत्पाद समीक्षा लिखें",
      "read_more_offers": "और ऑफ़र देखें",
      "by_feature": "सुविधा के अनुसार",
      "value_for_money": "पैसा वसूल",
      "battery_life": "बैटरी लाइफ",
      "quality_assurance": "गुणवत्ता"
    },
    "ta": {
      "amazons_choice": "அமேசான் சாய்ஸ்",
      "bought_in_past_month": "கடந்த மாதத்தில் 1K+ வாங்கப்பட்டது",
      "bank_offers_title": "வங்கிச் சலுகை",
      "no_cost_emi_title": "நோ காஸ்ட் EMI",
      "partner_offers_title": "கூட்டாளர் சலுகைகள்",
      "bank_offer_detail": "தேர்ந்தெடுக்கப்பட்ட கிரெடிட் கார்டுகளில் ₹1,500 வரை தள்ளுபடி",
      "no_cost_emi_detail": "₹3,000க்கு மேல் உள்ள ஆர்டர்களுக்கு நோ காஸ்ட் EMI",
      "partner_offer_detail": "ஜிஎஸ்டி இன்வாய்ஸ் மற்றும் வணிக சேமிப்பு",
      "replacement_badge": "7 நாட்களில் மாற்றுதல்",
      "free_delivery_badge": "இலவச டெலிவரி",
      "warranty_badge": "1 ஆண்டு உத்தரவாதம்",
      "pay_on_delivery_badge": "டெலிவரியின் போது பணம் செலுத்துதல்",
      "top_brand_badge": "சிறந்த பிராண்ட்",
      "helpful_button": "பயனுள்ளது",
      "write_review_btn": "மதிப்புரை எழுதுங்கள்",
      "read_more_offers": "கூடுதல் சலுகைகளைக் காண்க",
      "by_feature": "அம்சங்களின்படி",
      "value_for_money": "விலைக்கேற்ற மதிப்பு",
      "battery_life": "பேட்டரி ஆயுள்",
      "quality_assurance": "தரம்"
    },
    "te": {
      "amazons_choice": "అమెజాన్స్ ఛాయిస్",
      "bought_in_past_month": "గత నెలలో 1K+ కొనుగోలు చేయబడింది",
      "bank_offers_title": "బ్యాంక్ ఆఫర్",
      "no_cost_emi_title": "నో కాస్ట్ EMI",
      "partner_offers_title": "పార్టనర్ ఆఫర్లు",
      "bank_offer_detail": "ఎంపిక చేసిన క్రెడిట్ కార్డులపై ₹1,500 వరకు తగ్గింపు",
      "no_cost_emi_detail": "₹3,000 పైబడిన ఆర్డర్లపై నో కాస్ట్ EMI",
      "partner_offer_detail": "జీఎస్టీ ఇన్వాయిస్ మరియు వ్యాపార తగ్గింపు",
      "replacement_badge": "7 రోజుల్లో రీప్లేస్‌మెంట్",
      "free_delivery_badge": "ఉచిత డెలివరీ",
      "warranty_badge": "1 సంవత్సరం వారంటీ",
      "pay_on_delivery_badge": "పే ఆన్ డెలివరీ",
      "top_brand_badge": "టాప్ బ్రాండ్",
      "helpful_button": "సహాయకరం",
      "write_review_btn": "సమీక్ష రాయండి",
      "read_more_offers": "మరిన్ని ఆఫర్లను చూడండి",
      "by_feature": "ఫీచర్ల వారీగా",
      "value_for_money": "ధరకు తగిన విలువ",
      "battery_life": "బ్యాటరీ లైఫ్",
      "quality_assurance": "నాణ్యత"
    },
    "kn": {
      "amazons_choice": "ಅಮೆಜಾನ್ಸ್ ಚಾಯ್ಸ್",
      "bought_in_past_month": "ಕಳೆದ ತಿಂಗಳಲ್ಲಿ 1K+ ಖರೀದಿಸಲಾಗಿದೆ",
      "bank_offers_title": "ಬ್ಯಾಂಕ್ ಆಫರ್",
      "no_cost_emi_title": "ನೋ ಕಾಸ್ಟ್ EMI",
      "partner_offers_title": "ಪಾಲುದಾರ ಕೊಡುಗೆಗಳು",
      "bank_offer_detail": "ಆಯ್ದ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್‌ಗಳಲ್ಲಿ ₹1,500 ವರೆಗೆ ರಿಯಾಯಿತಿ",
      "no_cost_emi_detail": "₹3,000 ಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಆರ್ಡರ್‌ಗಳಿಗೆ ನೋ ಕಾಸ್ಟ್ EMI",
      "partner_offer_detail": "ಜಿಎಸ್‌ಟಿ ಇನ್‌ವಾಯ್ಸ್ ಮತ್ತು ವ್ಯಾಪಾರ ಉಳಿತಾಯ",
      "replacement_badge": "7 ದಿನಗಳಲ್ಲಿ ಬದಲಿ",
      "free_delivery_badge": "ಉಚಿತ ಡೆಲಿವರಿ",
      "warranty_badge": "1 ವರ್ಷದ ವಾರಂಟಿ",
      "pay_on_delivery_badge": "ಪೇ ಆನ್ ಡೆಲಿವರಿ",
      "top_brand_badge": "ಟಾಪ್ ಬ್ರ್ಯಾಂಡ್",
      "helpful_button": "ಸಹಾಯಕವಾಗಿದೆ",
      "write_review_btn": "ವಿಮರ್ಶೆ ಬರೆಯಿರಿ",
      "read_more_offers": "ಇನ್ನಷ್ಟು ಕೊಡುಗೆಗಳನ್ನು ನೋಡಿ",
      "by_feature": "ವೈಶಿಷ್ಟ್ಯಗಳ ಪ್ರಕಾರ",
      "value_for_money": "ಹಣಕ್ಕೆ ತಕ್ಕ ಮೌಲ್ಯ",
      "battery_life": "ಬ್ಯಾಟರಿ ಬಾಳಿಕೆ",
      "quality_assurance": "ಗುಣಮಟ್ಟ"
    },
    "ml": {
      "amazons_choice": "ആമസോൺസ് ചോയ്സ്",
      "bought_in_past_month": "കഴിഞ്ഞ മാസത്തിൽ 1K+ വാങ്ങിയത്",
      "bank_offers_title": "ബാങ്ക് ഓഫർ",
      "no_cost_emi_title": "നോ കോസ്റ്റ് EMI",
      "partner_offers_title": "പാർട്ണർ ഓഫറുകൾ",
      "bank_offer_detail": "തിരഞ്ഞെടുത്ത ക്രെഡിറ്റ് കാർഡുകളിൽ ₹1,500 വരെ കിഴിവ്",
      "no_cost_emi_detail": "₹3,000-ന് മുകളിലുള്ള ഓർഡറുകൾക്ക് നോ കോസ്റ്റ് EMI",
      "partner_offer_detail": "ജിഎസ്ടി ഇൻവോയ്സും ബിസിനസ്സ് ലാഭവും",
      "replacement_badge": "7 ദിവസത്തിനകം റീപ്ലേസ്മെന്റ്",
      "free_delivery_badge": "സൗജന്യ ഡെലിവറി",
      "warranty_badge": "1 വർഷത്തെ വാറന്റി",
      "pay_on_delivery_badge": "പേ ഓൺ ഡെലിവറി",
      "top_brand_badge": "ടോപ്പ് ബ്രാൻഡ്",
      "helpful_button": "ഉപകാരപ്രദം",
      "write_review_btn": "റിവ്യൂ എഴുതുക",
      "read_more_offers": "കൂടുതൽ ഓഫറുകൾ കാണുക",
      "by_feature": "സവിശേഷതകൾ പ്രകാരം",
      "value_for_money": "വിലയ്ക്കൊത്ത മൂല്യം",
      "battery_life": "ബാറ്ററി ലൈഫ്",
      "quality_assurance": "ഗുണനിലവാരം"
    },
    "bn": {
      "amazons_choice": "অ্যামাজনস চয়েস",
      "bought_in_past_month": "গত মাসে 1K+ কেনা হয়েছে",
      "bank_offers_title": "ব্যাংক অফার",
      "no_cost_emi_title": "নো কস্ট EMI",
      "partner_offers_title": "পার্টনার অফার",
      "bank_offer_detail": "নির্দিষ্ট ক্রেডিট কার্ডে ₹1,500 পর্যন্ত ছাড়",
      "no_cost_emi_detail": "₹3,000 এর বেশি অর্ডারে নো কস্ট EMI",
      "partner_offer_detail": "জিএসটি চালান এবং ব্যবসায়িক সুবিধা",
      "replacement_badge": "7 দিনে প্রতিস্থাপন",
      "free_delivery_badge": "বিনামূল্যে ডেলিভারি",
      "warranty_badge": "1 বছরের ওয়্যারেন্টি",
      "pay_on_delivery_badge": "পে অন ডেলিভারি",
      "top_brand_badge": "শীর্ষ ব্র্যান্ড",
      "helpful_button": "সহায়ক",
      "write_review_btn": "একটি পর্যালোচনা লিখুন",
      "read_more_offers": "আরও অফার দেখুন",
      "by_feature": "বৈশিষ্ট্য অনুযায়ী",
      "value_for_money": "অর্থের সঠিক মূল্য",
      "battery_life": "ব্যাটারি লাইফ",
      "quality_assurance": "গুণমান"
    },
    "mr": {
      "amazons_choice": "अॅमेझॉन चॉइस",
      "bought_in_past_month": "मागील महिन्यात 1K+ खरेदी केले",
      "bank_offers_title": "बँक ऑफर",
      "no_cost_emi_title": "नो कॉस्ट EMI",
      "partner_offers_title": "पार्टनर ऑफर्स",
      "bank_offer_detail": "निवडक क्रेडिट कार्डवर ₹1,500 पर्यंत सूट",
      "no_cost_emi_detail": "₹3,000 वरील ऑर्डर्सवर नो कॉस्ट EMI",
      "partner_offer_detail": "जीएसटी चलन आणि व्यवसाय बचत",
      "replacement_badge": "7 दिवसांत बदलून मिळेल",
      "free_delivery_badge": "मोफत डिलिव्हरी",
      "warranty_badge": "1 वर्षाची वॉरंटी",
      "pay_on_delivery_badge": "पे ऑन डिलिव्हरी",
      "top_brand_badge": "टॉप ब्रँड",
      "helpful_button": "उपयुक्त",
      "write_review_btn": "पुनरावलोकन लिहा",
      "read_more_offers": "अधिक ऑफर्स पहा",
      "by_feature": "वैशिष्ट्यांनुसार",
      "value_for_money": "पैशांचे योग्य मूल्य",
      "battery_life": "बॅटरी आयुष्य",
      "quality_assurance": "गुणवत्ता"
    },
    "ur": {
      "amazons_choice": "ایمیزون چوائس",
      "bought_in_past_month": "پچھلے مہینے میں 1K+ خریدا گیا",
      "bank_offers_title": "بینک آفر",
      "no_cost_emi_title": "نو کاسٹ EMI",
      "partner_offers_title": "پارٹنر آفرز",
      "bank_offer_detail": "منتخب کریڈٹ کارڈز پر ₹1,500 تک رعایت",
      "no_cost_emi_detail": "₹3,000 سے زائد کے آرڈرز پر نو کاسٹ EMI",
      "partner_offer_detail": "جی ایس ٹی انوائس اور کاروباری رعایت",
      "replacement_badge": "7 دنوں میں تبدیلی",
      "free_delivery_badge": "مفت ترسیل",
      "warranty_badge": "1 سال کی وارنٹی",
      "pay_on_delivery_badge": "ترسیل پر ادائیگی",
      "top_brand_badge": "اعلیٰ برانڈ",
      "helpful_button": "مددگار",
      "write_review_btn": "پروڈکٹ کا جائزہ لکھیں",
      "read_more_offers": "مزید آفرز دیکھیں",
      "by_feature": "خصوصیات کے لحاظ سے",
      "value_for_money": "پیسے کی صحیح قدر",
      "battery_life": "بیٹری لائف",
      "quality_assurance": "معیار"
    },
    "pa": {
      "amazons_choice": "ਐਮਾਜ਼ਾਨ ਚੁਆਇਸ",
      "bought_in_past_month": "ਪਿਛਲੇ ਮਹੀਨੇ ਵਿੱਚ 1K+ ਖਰੀਦਿਆ ਗਿਆ",
      "bank_offers_title": "ਬੈਂਕ ਆਫਰ",
      "no_cost_emi_title": "ਨੋ ਕਾਸਟ EMI",
      "partner_offers_title": "ਪਾਰਟਨਰ ਆਫਰਜ਼",
      "bank_offer_detail": "ਚੁਣੇ ਹੋਏ ਕ੍ਰੈਡਿਟ ਕਾਰਡਾਂ 'ਤੇ ₹1,500 ਤੱਕ ਦੀ ਛੋਟ",
      "no_cost_emi_detail": "₹3,000 ਤੋਂ ਵੱਧ ਦੇ ਆਰਡਰਾਂ 'ਤੇ ਨੋ ਕਾਸਟ EMI",
      "partner_offer_detail": "ਜੀਐਸਟੀ ਇਨਵੌਇਸ ਅਤੇ ਕਾਰੋਬਾਰੀ ਬੱਚਤ",
      "replacement_badge": "7 ਦਿਨਾਂ ਵਿੱਚ ਬਦਲੀ",
      "free_delivery_badge": "ਮੁਫ਼ਤ ਡਿਲੀਵਰੀ",
      "warranty_badge": "1 ਸਾਲ ਦੀ ਵਾਰੰਟੀ",
      "pay_on_delivery_badge": "ਪੇ ਆਨ ਡਿਲੀਵਰੀ",
      "top_brand_badge": "ਚੋਟੀ ਦਾ ਬ੍ਰਾਂਡ",
      "helpful_button": "ਮਦਦਗਾਰ",
      "write_review_btn": "ਉਤਪਾਦ ਸਮੀਖਿਆ ਲਿਖੋ",
      "read_more_offers": "ਹੋਰ ਪੇਸ਼ਕਸ਼ਾਂ ਦੇਖੋ",
      "by_feature": "ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ ਅਨੁਸਾਰ",
      "value_for_money": "ਪੈਸੇ ਦੀ ਸਹੀ ਕੀਮਤ",
      "battery_life": "ਬੈਟਰੀ ਲਾਈਫ",
      "quality_assurance": "ਗੁਣਵੱਤਾ"
    },
    "gu": {
      "amazons_choice": "એમેઝોન્સ ચોઇસ",
      "bought_in_past_month": "પાછલા મહિનામાં 1K+ ખરીદ્યા",
      "bank_offers_title": "બેંક ઓફર",
      "no_cost_emi_title": "નો કોસ્ટ EMI",
      "partner_offers_title": "પાર્ટનર ઑફર્સ",
      "bank_offer_detail": "પસંદગીના ક્રેડિટ કાર્ડ પર ₹1,500 સુધીની છૂટ",
      "no_cost_emi_detail": "₹3,000 થી વધુના ઓર્ડર પર નો કોસ્ટ EMI",
      "partner_offer_detail": "જીએસટી ઇનવોઇસ અને બિઝનેસ બચત",
      "replacement_badge": "7 દિવસમાં રિપ્લેસમેન્ટ",
      "free_delivery_badge": "મફત ડિલિવરી",
      "warranty_badge": "1 વર્ષની વોરંટી",
      "pay_on_delivery_badge": "પે ઓન ડિલિવરી",
      "top_brand_badge": "ટોચની બ્રાન્ડ",
      "helpful_button": "ઉપયોગી",
      "write_review_btn": "રિવ્યૂ લખો",
      "read_more_offers": "વધુ ઑફર્સ જુઓ",
      "by_feature": "સુવિધાઓ અનુસાર",
      "value_for_money": "મૂલ્યવાન",
      "battery_life": "બેટરી લાઈફ",
      "quality_assurance": "ગુણવત્તા"
    }
  };

  Object.keys(AMAZON_PDP_PAGE_I18N).forEach((lang) => {
    if (translations[lang]) {
      Object.assign(translations[lang], AMAZON_PDP_PAGE_I18N[lang]);
    }
  });
`;

const anchor = 'window.EM_TRANSLATIONS = translations;';
if (!content.includes(anchor)) {
  console.error('Anchor not found!');
  process.exit(1);
}

content = content.replace(anchor, pdpCode + '\n  ' + anchor);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully injected AMAZON_PDP_PAGE_I18N into translations.js');
