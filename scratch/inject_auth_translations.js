const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'translations.js');
let content = fs.readFileSync(filePath, 'utf8');

if (content.includes('AMAZON_AUTH_PAGE_I18N')) {
  console.log('AMAZON_AUTH_PAGE_I18N already exists in translations.js');
  process.exit(0);
}

const authTranslations = `
  const AMAZON_AUTH_PAGE_I18N = {
    "en": {
      "auth_card_title_signin": "Sign in",
      "auth_card_title_signup": "Create Account",
      "auth_card_title_reset": "Password assistance",
      "auth_need_help": "Need help?",
      "auth_other_issues": "Other issues with Sign-In",
      "auth_terms_prefix": "By continuing, you agree to ElectroMart's",
      "auth_conditions_of_use": "Conditions of Use",
      "auth_privacy_notice": "Privacy Notice",
      "auth_new_to_electromart": "New to ElectroMart?",
      "auth_create_your_account_btn": "Create your ElectroMart account",
      "auth_already_have_account": "Already have an account?",
      "auth_show_password": "Show password",
      "auth_hide_password": "Hide password",
      "auth_help_link": "Help",
      "auth_footer_copyright": "© 2026, ElectroMart.in, Inc. or its affiliates"
    },
    "hi": {
      "auth_card_title_signin": "साइन इन करें",
      "auth_card_title_signup": "खाता बनाएं",
      "auth_card_title_reset": "पासवर्ड सहायता",
      "auth_need_help": "मदद चाहिए?",
      "auth_other_issues": "साइन-इन से जुड़ी अन्य समस्याएं",
      "auth_terms_prefix": "जारी रखकर, आप इलेक्ट्रोमार्ट की",
      "auth_conditions_of_use": "उपयोग की शर्तें",
      "auth_privacy_notice": "गोपनीयता नीति",
      "auth_new_to_electromart": "इलेक्ट्रोमार्ट पर नए हैं?",
      "auth_create_your_account_btn": "अपना इलेक्ट्रोमार्ट खाता बनाएं",
      "auth_already_have_account": "क्या आपके पास पहले से खाता है?",
      "auth_show_password": "पासवर्ड दिखाएं",
      "auth_hide_password": "पासवर्ड छिपाएं",
      "auth_help_link": "सहायता",
      "auth_footer_copyright": "© 2026, ElectroMart.in, Inc. या इसके सहयोगी"
    },
    "ta": {
      "auth_card_title_signin": "உள்நுழைய",
      "auth_card_title_signup": "கணக்கு உருவாக்கு",
      "auth_card_title_reset": "கடவுச்சொல் உதவி",
      "auth_need_help": "உதவி தேவையா?",
      "auth_other_issues": "உள்நுழைவு தொடர்பான பிற சிக்கல்கள்",
      "auth_terms_prefix": "தொடர்வதன் மூலம், எலெக்ட்ரோமார்ட்டின்",
      "auth_conditions_of_use": "பயன்பாட்டு விதிமுறைகள்",
      "auth_privacy_notice": "தனியுரிமை அறிவிப்பு",
      "auth_new_to_electromart": "எலெக்ட்ரோமார்ட்டிற்கு புதியவரா?",
      "auth_create_your_account_btn": "உங்கள் எலெக்ட்ரோமார்ட் கணக்கை உருவாக்கவும்",
      "auth_already_have_account": "ஏற்கனவே கணக்கு உள்ளதா?",
      "auth_show_password": "கடவுச்சொல்லைக் காட்டு",
      "auth_hide_password": "கடவுச்சொல்லை மறைக்கவும்",
      "auth_help_link": "உதவி",
      "auth_footer_copyright": "© 2026, ElectroMart.in, Inc. அல்லது அதன் துணை நிறுவனங்கள்"
    },
    "te": {
      "auth_card_title_signin": "సైన్ ఇన్ చేయండి",
      "auth_card_title_signup": "ఖాతాను సృష్టించండి",
      "auth_card_title_reset": "పాస్‌వర్డ్ సహాయం",
      "auth_need_help": "సహాయం కావాలా?",
      "auth_other_issues": "సైన్-ఇన్‌తో ఇతర సమస్యలు",
      "auth_terms_prefix": "కొనసాగించడం ద్వారా, మీరు ఎలక్ట్రోమార్ట్ యొక్క",
      "auth_conditions_of_use": "ఉపయోగ నిబంధనలు",
      "auth_privacy_notice": "గోప్యతా నోటీసు",
      "auth_new_to_electromart": "ఎలక్ట్రోమార్ట్‌కి కొత్తనా?",
      "auth_create_your_account_btn": "మీ ఎలక్ట్రోమార్ట్ ఖాతాను సృష్టించండి",
      "auth_already_have_account": "ఇప్పటికే ఖాతా ఉందా?",
      "auth_show_password": "పాస్‌వర్డ్ చూపించు",
      "auth_hide_password": "పాస్‌వర్డ్ దాచు",
      "auth_help_link": "సహాయం",
      "auth_footer_copyright": "© 2026, ElectroMart.in, Inc. లేదా దాని అనుబంధ సంస్థలు"
    },
    "kn": {
      "auth_card_title_signin": "ಸೈನ್ ಇನ್ ಮಾಡಿ",
      "auth_card_title_signup": "ಖಾತೆಯನ್ನು ರಚಿಸಿ",
      "auth_card_title_reset": "ಪಾಸ್ವರ್ಡ್ ಸಹಾಯ",
      "auth_need_help": "ಸಹಾಯ ಬೇಕೇ?",
      "auth_other_issues": "ಸೈನ್-ಇನ್ ಜೊತೆಗೆ ಇತರ ಸಮಸ್ಯೆಗಳು",
      "auth_terms_prefix": "ಮುಂದುವರಿಯುವ ಮೂಲಕ, ನೀವು ಎಲೆಕ್ಟ್ರೋಮಾರ್ಟ್‌ನ",
      "auth_conditions_of_use": "ಬಳಕೆಯ ನಿಯಮಗಳು",
      "auth_privacy_notice": "ಗೌಪ್ಯತಾ ಸೂಚನೆ",
      "auth_new_to_electromart": "ಎಲೆಕ್ಟ್ರೋಮಾರ್ಟ್‌ಗೆ ಹೊಸಬರೇ?",
      "auth_create_your_account_btn": "ನಿಮ್ಮ ಎಲೆಕ್ಟ್ರೋಮಾರ್ಟ್ ಖಾತೆಯನ್ನು ರಚಿಸಿ",
      "auth_already_have_account": "ಈಗಾಗಲೇ ಖಾತೆ ಹೊಂದಿದ್ದೀರಾ?",
      "auth_show_password": "ಪಾಸ್ವರ್ಡ್ ತೋರಿಸಿ",
      "auth_hide_password": "ಪಾಸ್ವರ್ಡ್ ಮರೆಮಾಡಿ",
      "auth_help_link": "ಸಹಾಯ",
      "auth_footer_copyright": "© 2026, ElectroMart.in, Inc. ಅಥವಾ ಅದರ ಅಂಗಸಂಸ್ಥೆಗಳು"
    },
    "ml": {
      "auth_card_title_signin": "സൈൻ ഇൻ ചെയ്യുക",
      "auth_card_title_signup": "അക്കൗണ്ട് ഉണ്ടാക്കുക",
      "auth_card_title_reset": "പാസ്‌വേഡ് സഹായം",
      "auth_need_help": "സഹായം വേണോ?",
      "auth_other_issues": "സൈൻ-ഇൻ സംബന്ധിച്ച മറ്റ് പ്രശ്നങ്ങൾ",
      "auth_terms_prefix": "തുടരുന്നതിലൂടെ, ഇലക്ട്രോമാർട്ടിന്റെ",
      "auth_conditions_of_use": "ഉപയോഗ നിബന്ധനകൾ",
      "auth_privacy_notice": "സ്വകാര്യതാ അറിയിപ്പ്",
      "auth_new_to_electromart": "ഇലക്ട്രോമാർട്ടിൽ പുതിയതാണോ?",
      "auth_create_your_account_btn": "നിങ്ങളുടെ ഇലക്ട്രോമാർട്ട് അക്കൗണ്ട് ഉണ്ടാക്കുക",
      "auth_already_have_account": "മുമ്പേ അക്കൗണ്ട് ഉണ്ടോ?",
      "auth_show_password": "പാസ്‌വേഡ് കാണിക്കുക",
      "auth_hide_password": "പാസ്‌വേഡ് മറയ്ക്കുക",
      "auth_help_link": "സഹായം",
      "auth_footer_copyright": "© 2026, ElectroMart.in, Inc. അല്ലെങ്കിൽ അതിന്റെ അനുബന്ധ സ്ഥാപനങ്ങൾ"
    },
    "bn": {
      "auth_card_title_signin": "সাইন ইন করুন",
      "auth_card_title_signup": "অ্যাকাউন্ট তৈরি করুন",
      "auth_card_title_reset": "পাসওয়ার্ড সহায়তা",
      "auth_need_help": "সাহায্য প্রয়োজন?",
      "auth_other_issues": "সাইন-ইন সংক্রান্ত অন্যান্য সমস্যা",
      "auth_terms_prefix": "চালিয়ে যাওয়ার মাধ্যমে, আপনি ইলেক্ট্রোমার্টের",
      "auth_conditions_of_use": "ব্যবহারের শর্তাবলী",
      "auth_privacy_notice": "গোপনীয়তা বিজ্ঞপ্তি",
      "auth_new_to_electromart": "ইলেক্ট্রোমার্টে নতুন?",
      "auth_create_your_account_btn": "আপনার ইলেক্ট্রোমার্ট অ্যাকাউন্ট তৈরি করুন",
      "auth_already_have_account": "ইতিমধ্যে একটি অ্যাকাউন্ট আছে?",
      "auth_show_password": "পাসওয়ার্ড দেখান",
      "auth_hide_password": "পাসওয়ার্ড লুকান",
      "auth_help_link": "সহায়তা",
      "auth_footer_copyright": "© 2026, ElectroMart.in, Inc. বা এর সহযোগীরা"
    },
    "mr": {
      "auth_card_title_signin": "साइन इन करा",
      "auth_card_title_signup": "खाते तयार करा",
      "auth_card_title_reset": "पासवर्ड मदत",
      "auth_need_help": "मदत हवी आहे?",
      "auth_other_issues": "साइन-इन संबंधी इतर समस्या",
      "auth_terms_prefix": "पुढे चालू ठेवून, आपण इलेक्ट्रोमार्टच्या",
      "auth_conditions_of_use": "वापराच्या अटी",
      "auth_privacy_notice": "गोपनीयता सूचना",
      "auth_new_to_electromart": "इलेक्ट्रोमार्टवर नवीन आहात?",
      "auth_create_your_account_btn": "आपले इलेक्ट्रोमार्ट खाते तयार करा",
      "auth_already_have_account": "आधीच खाते आहे का?",
      "auth_show_password": "पासवर्ड दाखवा",
      "auth_hide_password": "पासवर्ड लपवा",
      "auth_help_link": "मदत",
      "auth_footer_copyright": "© 2026, ElectroMart.in, Inc. किंवा त्याचे सहयोगी"
    },
    "ur": {
      "auth_card_title_signin": "سائن ان کریں",
      "auth_card_title_signup": "اکاؤنٹ بنائیں",
      "auth_card_title_reset": "پاس ورڈ کی مدد",
      "auth_need_help": "مدد چاہیے؟",
      "auth_other_issues": "سائن ان کے دیگر مسائل",
      "auth_terms_prefix": "جاری رکھ کر، آپ الیکٹرو مارٹ کے",
      "auth_conditions_of_use": "استعمال کی شرائط",
      "auth_privacy_notice": "رازداری کا نوٹس",
      "auth_new_to_electromart": "الیکٹرو مارٹ پر نئے ہیں؟",
      "auth_create_your_account_btn": "اپنا الیکٹرو مارٹ اکاؤنٹ بنائیں",
      "auth_already_have_account": "پہلے سے اکاؤنٹ موجود ہے؟",
      "auth_show_password": "پاس ورڈ دکھائیں",
      "auth_hide_password": "پاس ورڈ چھپائیں",
      "auth_help_link": "مدد",
      "auth_footer_copyright": "© 2026, ElectroMart.in, Inc. یا اس کے ملحقہ ادارے"
    },
    "pa": {
      "auth_card_title_signin": "ਸਾਈਨ ਇਨ ਕਰੋ",
      "auth_card_title_signup": "ਖਾਤਾ ਬਣਾਓ",
      "auth_card_title_reset": "ਪਾਸਵਰਡ ਸਹਾਇਤਾ",
      "auth_need_help": "ਮਦਦ ਚਾਹੀਦੀ ਹੈ?",
      "auth_other_issues": "ਸਾਈਨ-ਇਨ ਨਾਲ ਸੰਬੰਧਿਤ ਹੋਰ ਮੁੱਦੇ",
      "auth_terms_prefix": "ਜਾਰੀ ਰੱਖ ਕੇ, ਤੁਸੀਂ ਇਲੈਕਟ੍ਰੋਮਾਰਟ ਦੀਆਂ",
      "auth_conditions_of_use": "ਵਰਤੋਂ ਦੀਆਂ ਸ਼ਰਤਾਂ",
      "auth_privacy_notice": "ਨਿੱਜਤਾ ਨੋਟਿਸ",
      "auth_new_to_electromart": "ਇਲੈਕਟ੍ਰੋਮਾਰਟ 'ਤੇ ਨਵੇਂ ਹੋ?",
      "auth_create_your_account_btn": "ਆਪਣਾ ਇਲੈਕਟ੍ਰੋਮਾਰਟ ਖਾਤਾ ਬਣਾਓ",
      "auth_already_have_account": "ਕੀ ਪਹਿਲਾਂ ਹੀ ਖਾਤਾ ਹੈ?",
      "auth_show_password": "ਪਾਸਵਰਡ ਦਿਖਾਓ",
      "auth_hide_password": "ਪਾਸਵਰਡ ਲੁਕਾਓ",
      "auth_help_link": "ਮਦਦ",
      "auth_footer_copyright": "© 2026, ElectroMart.in, Inc. ਜਾਂ ਇਸਦੇ ਸਹਿਯੋਗੀ"
    },
    "gu": {
      "auth_card_title_signin": "સાઇન ઇન કરો",
      "auth_card_title_signup": "ખાતું બનાવો",
      "auth_card_title_reset": "પાસવર્ડ સહાય",
      "auth_need_help": "મદદ જોઈએ છે?",
      "auth_other_issues": "સાઇન-ઇન સંબંધિત અન્ય સમસ્યાઓ",
      "auth_terms_prefix": "ચાલુ રાખીને, તમે ઇલેક્ટ્રોમાર્ટની",
      "auth_conditions_of_use": "ઉપયોગની શરતો",
      "auth_privacy_notice": "ગોપનીયતા નોટિસ",
      "auth_new_to_electromart": "ઇલેક્ટ્રોમાર્ટ પર નવા છો?",
      "auth_create_your_account_btn": "તમારું ઇલેક્ટ્રોમાર્ટ એકાઉન્ટ બનાવો",
      "auth_already_have_account": "પહેલેથી જ એકાઉન્ટ છે?",
      "auth_show_password": "પાસવર્ડ બતાવો",
      "auth_hide_password": "પાસવર્ડ છુપાવો",
      "auth_help_link": "મદદ",
      "auth_footer_copyright": "© 2026, ElectroMart.in, Inc. અથવા તેની સંલગ્ન કંપનીઓ"
    }
  };

  Object.keys(AMAZON_AUTH_PAGE_I18N).forEach((lang) => {
    if (translations[lang]) {
      Object.assign(translations[lang], AMAZON_AUTH_PAGE_I18N[lang]);
    }
  });
`;

const anchor = '  Object.keys(AMAZON_WISHLIST_PAGE_I18N).forEach((lang) => {';
if (!content.includes(anchor)) {
  console.error('Anchor not found in translations.js');
  process.exit(1);
}

const parts = content.split(anchor);
const updatedContent = parts[0] + anchor + parts[1].replace(
  /    \}\r?\n  \}\);/,
  '    }\r\n  });\r\n\r\n' + authTranslations.replace(/\n/g, '\r\n')
);

fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log('Successfully injected AMAZON_AUTH_PAGE_I18N into translations.js');
