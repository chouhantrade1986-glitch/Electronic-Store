const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'translations.js');
let content = fs.readFileSync(filePath, 'utf8');

if (content.includes('AMAZON_LOCATION_MODAL_I18N')) {
  console.log('AMAZON_LOCATION_MODAL_I18N already exists in translations.js');
  process.exit(0);
}

const locationTranslations = `
  const AMAZON_LOCATION_MODAL_I18N = {
    "en": {
      "location_choose_title": "Choose your location",
      "location_subtitle": "Select a delivery location to see product availability and delivery options.",
      "location_signin_btn": "Sign in to see your addresses",
      "location_or_pincode": "or enter an Indian PIN code",
      "location_pincode_label": "PIN code",
      "location_pincode_placeholder": "Enter 6-digit PIN code",
      "location_apply_btn": "Apply",
      "location_or_city": "or select a major city",
      "location_invalid_pincode": "Please enter a valid 6-digit Indian PIN code.",
      "location_delivering_to": "Delivering to",
      "location_close": "Close",
      "location.title": "Choose your location",
      "location.subtitle": "Select a delivery location to see product availability and delivery options.",
      "location.cityLabel": "City",
      "location.postalLabel": "PIN code",
      "location.postalPlaceholder": "110001",
      "location.cancel": "Cancel",
      "location.save": "Save location"
    },
    "hi": {
      "location_choose_title": "अपना स्थान चुनें",
      "location_subtitle": "उत्पाद उपलब्धता और डिलीवरी विकल्प देखने के लिए डिलीवरी स्थान चुनें.",
      "location_signin_btn": "अपने पते देखने के लिए साइन इन करें",
      "location_or_pincode": "या भारतीय पिनकोड दर्ज करें",
      "location_pincode_label": "पिनकोड",
      "location_pincode_placeholder": "6-अंकीय पिनकोड दर्ज करें",
      "location_apply_btn": "लागू करें",
      "location_or_city": "या कोई प्रमुख शहर चुनें",
      "location_invalid_pincode": "कृपया एक मान्य 6-अंकीय भारतीय पिनकोड दर्ज करें.",
      "location_delivering_to": "डिलीवरी स्थान",
      "location_close": "बंद करें",
      "location.title": "अपना स्थान चुनें",
      "location.subtitle": "उत्पाद उपलब्धता और डिलीवरी विकल्प देखने के लिए डिलीवरी स्थान चुनें.",
      "location.cityLabel": "शहर",
      "location.postalLabel": "पिनकोड",
      "location.postalPlaceholder": "110001",
      "location.cancel": "रद्द करें",
      "location.save": "स्थान सहेजें"
    },
    "ta": {
      "location_choose_title": "உங்கள் இருப்பிடத்தைத் தேர்வுசெய்யவும்",
      "location_subtitle": "தயாரிப்பு கிடைக்கும் தன்மை மற்றும் டெலிவரி விருப்பங்களைக் காண டெலிவரி இருப்பிடத்தைத் தேர்ந்தெடுக்கவும்.",
      "location_signin_btn": "உங்கள் முகவரிகளைக் காண உள்நுழையவும்",
      "location_or_pincode": "அல்லது இந்திய பின்கோடை உள்ளிடவும்",
      "location_pincode_label": "பின்கோடு",
      "location_pincode_placeholder": "6-இலக்க பின்கோடை உள்ளிடவும்",
      "location_apply_btn": "பயன்படுத்து",
      "location_or_city": "அல்லது ஒரு முக்கிய நகரத்தைத் தேர்ந்தெடுக்கவும்",
      "location_invalid_pincode": "செல்லுபடியாகும் 6-இலக்க இந்திய பின்கோடை உள்ளிடவும்.",
      "location_delivering_to": "டெலிவரி செய்யும் இடம்",
      "location_close": "மூடு",
      "location.title": "உங்கள் இருப்பிடத்தைத் தேர்வுசெய்யவும்",
      "location.subtitle": "தயாரிப்பு கிடைக்கும் தன்மை மற்றும் டெலிவரி விருப்பங்களைக் காண டெலிவரி இருப்பிடத்தைத் தேர்ந்தெடுக்கவும்.",
      "location.cityLabel": "நகரம்",
      "location.postalLabel": "பின்கோடு",
      "location.postalPlaceholder": "110001",
      "location.cancel": "ரத்துசெய்",
      "location.save": "இருப்பிடத்தைச் சேமி"
    },
    "te": {
      "location_choose_title": "మీ స్థానాన్ని ఎంచుకోండి",
      "location_subtitle": "ఉత్పత్తి లభ్యత మరియు డెలివరీ ఎంపికలను చూడటానికి డెలివరీ స్థానాన్ని ఎంచుకోండి.",
      "location_signin_btn": "మీ చిరునామాలను చూడటానికి సైన్ ఇన్ చేయండి",
      "location_or_pincode": "లేదా భారతీయ పిన్‌కోడ్‌ను నమోదు చేయండి",
      "location_pincode_label": "పిన్‌కోడ్",
      "location_pincode_placeholder": "6-అంకెల పిన్‌కోడ్‌ను నమోదు చేయండి",
      "location_apply_btn": "వర్తింపజేయి",
      "location_or_city": "లేదా ఒక ప్రధాన నగరాన్ని ఎంచుకోండి",
      "location_invalid_pincode": "దయచేసి సరైన 6-అంకెల భారతీయ పిన్‌కోడ్‌ను నమోదు చేయండి.",
      "location_delivering_to": "డెలివరీ స్థానం",
      "location_close": "మూసివేయి",
      "location.title": "మీ స్థానాన్ని ఎంచుకోండి",
      "location.subtitle": "ఉత్పత్తి లభ్యత మరియు డెలివరీ ఎంపికలను చూడటానికి డెలివరీ స్థానాన్ని ఎంచుకోండి.",
      "location.cityLabel": "నగరం",
      "location.postalLabel": "పిన్‌కోడ్",
      "location.postalPlaceholder": "110001",
      "location.cancel": "రద్దు చేయి",
      "location.save": "స్థానాన్ని సేవ్ చేయి"
    },
    "kn": {
      "location_choose_title": "ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      "location_subtitle": "ಉತ್ಪನ್ನ ಲಭ್ಯತೆ ಮತ್ತು ವಿತರಣಾ ಆಯ್ಕೆಗಳನ್ನು ನೋಡಲು ವಿತರಣಾ ಸ್ಥಳವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
      "location_signin_btn": "ನಿಮ್ಮ ವಿಳಾಸಗಳನ್ನು ನೋಡಲು ಸೈನ್ ಇನ್ ಮಾಡಿ",
      "location_or_pincode": "ಅಥವಾ ಭಾರತೀಯ ಪಿನ್‌ಕೋಡ್ ನಮೂದಿಸಿ",
      "location_pincode_label": "ಪಿನ್‌ಕೋಡ್",
      "location_pincode_placeholder": "6-ಅಂಕಿಯ ಪಿನ್‌ಕೋಡ್ ನಮೂದಿಸಿ",
      "location_apply_btn": "ಅನ್ವಯಿಸು",
      "location_or_city": "ಅಥವಾ ಪ್ರಮುಖ ನಗರವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      "location_invalid_pincode": "ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 6-ಅಂಕಿಯ ಭಾರತೀಯ ಪಿನ್‌ಕೋಡ್ ನಮೂದಿಸಿ.",
      "location_delivering_to": "ವಿತರಣಾ ಸ್ಥಳ",
      "location_close": "ಮುಚ್ಚಿ",
      "location.title": "ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      "location.subtitle": "ಉತ್ಪನ್ನ ಲಭ್ಯತೆ ಮತ್ತು ವಿತರಣಾ ಆಯ್ಕೆಗಳನ್ನು ನೋಡಲು ವಿತರಣಾ ಸ್ಥಳವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
      "location.cityLabel": "ನಗರ",
      "location.postalLabel": "ಪಿನ್‌ಕೋಡ್",
      "location.postalPlaceholder": "110001",
      "location.cancel": "ರದ್ದುಮಾಡಿ",
      "location.save": "ಸ್ಥಳವನ್ನು ಉಳಿಸಿ"
    },
    "ml": {
      "location_choose_title": "നിങ്ങളുടെ ലൊക്കേഷൻ തിരഞ്ഞെടുക്കുക",
      "location_subtitle": "ഉൽപ്പന്ന ലഭ്യതയും ഡെലിവറി ഓപ്ഷനുകളും കാണുന്നതിന് ഒരു ഡെലിവറി ലൊക്കേഷൻ തിരഞ്ഞെടുക്കുക.",
      "location_signin_btn": "നിങ്ങളുടെ വിലാസങ്ങൾ കാണാൻ സൈൻ ഇൻ ചെയ്യുക",
      "location_or_pincode": "അല്ലെങ്കിൽ ഒരു ഇന്ത്യൻ പിൻകോഡ് നൽകുക",
      "location_pincode_label": "പിൻകോഡ്",
      "location_pincode_placeholder": "6 അക്ക പിൻകോഡ് നൽകുക",
      "location_apply_btn": "ബാധകമാക്കുക",
      "location_or_city": "അല്ലെങ്കിൽ ഒരു പ്രധാന നഗരം തിരഞ്ഞെടുക്കുക",
      "location_invalid_pincode": "ദയവായി സാധുവായ 6 അക്ക ഇന്ത്യൻ പിൻകോഡ് നൽകുക.",
      "location_delivering_to": "ഡെലിവറി ലൊക്കേഷൻ",
      "location_close": "അടയ്ക്കുക",
      "location.title": "നിങ്ങളുടെ ലൊക്കേഷൻ തിരഞ്ഞെടുക്കുക",
      "location.subtitle": "ഉൽപ്പന്ന ലഭ്യതയും ഡെലിവറി ഓപ്ഷനുകളും കാണുന്നതിന് ഒരു ഡെലിവറി ലൊക്കേഷൻ തിരഞ്ഞെടുക്കുക.",
      "location.cityLabel": "നഗരം",
      "location.postalLabel": "പിൻകോഡ്",
      "location.postalPlaceholder": "110001",
      "location.cancel": "റദ്ദാക്കുക",
      "location.save": "ലൊക്കേഷൻ സംരക്ഷിക്കുക"
    },
    "bn": {
      "location_choose_title": "আপনার অবস্থান নির্বাচন করুন",
      "location_subtitle": "পণ্যের প্রাপ্যতা এবং ডেলিভারি বিকল্প দেখতে একটি ডেলিভারি অবস্থান নির্বাচন করুন।",
      "location_signin_btn": "আপনার ঠিকানা দেখতে সাইন ইন করুন",
      "location_or_pincode": "অথবা একটি ভারতীয় পিনকোড লিখুন",
      "location_pincode_label": "পিনকোড",
      "location_pincode_placeholder": "৬-সংখ্যার পিনকোড লিখুন",
      "location_apply_btn": "প্রয়োগ করুন",
      "location_or_city": "অথবা একটি প্রধান শহর নির্বাচন করুন",
      "location_invalid_pincode": "অনুগ্রহ করে একটি বৈধ ৬-সংখ্যার ভারতীয় পিনকোড লিখুন।",
      "location_delivering_to": "ডেলিভারি অবস্থান",
      "location_close": "বন্ধ করুন",
      "location.title": "আপনার অবস্থান নির্বাচন করুন",
      "location.subtitle": "পণ্যের প্রাপ্যতা এবং ডেলিভারি বিকল্প দেখতে একটি ডেলিভারি অবস্থান নির্বাচন করুন।",
      "location.cityLabel": "শহর",
      "location.postalLabel": "পিনকোড",
      "location.postalPlaceholder": "110001",
      "location.cancel": "বাতিল করুন",
      "location.save": "অবস্থান সংরক্ষণ করুন"
    },
    "mr": {
      "location_choose_title": "आपले स्थान निवडा",
      "location_subtitle": "उत्पादन उपलब्धता आणि वितरण पर्याय पाहण्यासाठी वितरण स्थान निवडा.",
      "location_signin_btn": "आपले पत्ते पाहण्यासाठी साइन इन करा",
      "location_or_pincode": "किंवा भारतीय पिनकोड टाका",
      "location_pincode_label": "पिनकोड",
      "location_pincode_placeholder": "६-अंकी पिनकोड टाका",
      "location_apply_btn": "लागू करा",
      "location_or_city": "किंवा प्रमुख शहर निवडा",
      "location_invalid_pincode": "कृपया वैध ६-अंकी भारतीय पिनकोड टाका.",
      "location_delivering_to": "वितरण स्थान",
      "location_close": "बंद करा",
      "location.title": "आपले स्थान निवडा",
      "location.subtitle": "उत्पादन उपलब्धता आणि वितरण पर्याय पाहण्यासाठी वितरण स्थान निवडा.",
      "location.cityLabel": "शहर",
      "location.postalLabel": "पिनकोड",
      "location.postalPlaceholder": "110001",
      "location.cancel": "रद्द करा",
      "location.save": "स्थान जतन करा"
    },
    "ur": {
      "location_choose_title": "اپنا مقام منتخب کریں",
      "location_subtitle": "مصنوعات کی دستیابی اور ترسیل کے اختیارات دیکھنے کے لیے ترسیلی مقام منتخب کریں۔",
      "location_signin_btn": "اپنے پتے دیکھنے کے لیے سائن ان کریں",
      "location_or_pincode": "یا ہندوستانی پن کوڈ درج کریں",
      "location_pincode_label": "پن کوڈ",
      "location_pincode_placeholder": "6 ہندسوں کا پن کوڈ درج کریں",
      "location_apply_btn": "لاگو کریں",
      "location_or_city": "یا کوئی بڑا شہر منتخب کریں",
      "location_invalid_pincode": "براہ کرم ایک درست 6 ہندسوں کا ہندوستانی پن کوڈ درج کریں۔",
      "location_delivering_to": "ترسیلی مقام",
      "location_close": "بند کریں",
      "location.title": "اپنا مقام منتخب کریں",
      "location.subtitle": "مصنوعات کی دستیابی اور ترسیل کے اختیارات دیکھنے کے لیے ترسیلی مقام منتخب کریں۔",
      "location.cityLabel": "شہر",
      "location.postalLabel": "پن کوڈ",
      "location.postalPlaceholder": "110001",
      "location.cancel": "منسوخ کریں",
      "location.save": "مقام محفوظ کریں"
    },
    "pa": {
      "location_choose_title": "ਆਪਣਾ ਸਥਾਨ ਚੁਣੋ",
      "location_subtitle": "ਉਤਪਾਦ ਦੀ ਉਪਲਬਧਤਾ ਅਤੇ ਡਿਲਿਵਰੀ ਵਿਕਲਪ ਦੇਖਣ ਲਈ ਡਿਲਿਵਰੀ ਸਥਾਨ ਚੁਣੋ।",
      "location_signin_btn": "ਆਪਣੇ ਪਤੇ ਦੇਖਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ",
      "location_or_pincode": "ਜਾਂ ਭਾਰਤੀ ਪਿੰਨ ਕੋਡ ਦਰਜ ਕਰੋ",
      "location_pincode_label": "ਪਿੰਨ ਕੋਡ",
      "location_pincode_placeholder": "6-ਅੰਕਾਂ ਦਾ ਪਿੰਨ ਕੋਡ ਦਰਜ ਕਰੋ",
      "location_apply_btn": "ਲਾਗੂ ਕਰੋ",
      "location_or_city": "ਜਾਂ ਕੋਈ ਵੱਡਾ ਸ਼ਹਿਰ ਚੁਣੋ",
      "location_invalid_pincode": "ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵੈਧ 6-ਅੰਕਾਂ ਦਾ ਭਾਰਤੀ ਪਿੰਨ ਕੋਡ ਦਰਜ ਕਰੋ।",
      "location_delivering_to": "ਡਿਲਿਵਰੀ ਸਥਾਨ",
      "location_close": "ਬੰਦ ਕਰੋ",
      "location.title": "ਆਪਣਾ ਸਥਾਨ ਚੁਣੋ",
      "location.subtitle": "ਉਤਪਾਦ ਦੀ ਉਪਲਬਧਤਾ ਅਤੇ ਡਿਲਿਵਰੀ ਵਿਕਲਪ ਦੇਖਣ ਲਈ ਡਿਲਿਵਰੀ ਸਥਾਨ ਚੁਣੋ।",
      "location.cityLabel": "ਸ਼ਹਿਰ",
      "location.postalLabel": "ਪਿੰਨ ਕੋਡ",
      "location.postalPlaceholder": "110001",
      "location.cancel": "ਰੱਦ ਕਰੋ",
      "location.save": "ਸਥਾਨ ਸੁਰੱਖਿਅਤ ਕਰੋ"
    },
    "gu": {
      "location_choose_title": "તમારું સ્થાન પસંદ કરો",
      "location_subtitle": "ઉત્પાદનની ઉપલબ્ધતા અને ડિલિવરી વિકલ્પો જોવા માટે ડિલિવરી સ્થાન પસંદ કરો.",
      "location_signin_btn": "તમારા સરનામાં જોવા માટે સાઇન ઇન કરો",
      "location_or_pincode": "અથવા ભારતીય પિનકોડ દાખલ કરો",
      "location_pincode_label": "પિનકોડ",
      "location_pincode_placeholder": "6-અંકનો પિનકોડ દાખલ કરો",
      "location_apply_btn": "લાગુ કરો",
      "location_or_city": "અથવા મુખ્ય શહેર પસંદ કરો",
      "location_invalid_pincode": "કૃપા કરીને માન્ય 6-અંકનો ભારતીય પિનકોડ દાખલ કરો.",
      "location_delivering_to": "ડિલિવરી સ્થાન",
      "location_close": "બંધ કરો",
      "location.title": "તમારું સ્થાન પસંદ કરો",
      "location.subtitle": "ઉત્પાદનની ઉપલબ્ધતા અને ડિલિવરી વિકલ્પો જોવા માટે ડિલિવરી સ્થાન પસંદ કરો.",
      "location.cityLabel": "શહેર",
      "location.postalLabel": "પિનકોડ",
      "location.postalPlaceholder": "110001",
      "location.cancel": "રદ કરો",
      "location.save": "સ્થાન સાચવો"
    }
  };

  Object.keys(AMAZON_LOCATION_MODAL_I18N).forEach((lang) => {
    if (translations[lang]) {
      Object.assign(translations[lang], AMAZON_LOCATION_MODAL_I18N[lang]);
    }
  });
`;

const anchor = '  Object.keys(AMAZON_AUTH_PAGE_I18N).forEach((lang) => {';
if (!content.includes(anchor)) {
  console.error('Anchor AMAZON_AUTH_PAGE_I18N not found in translations.js');
  process.exit(1);
}

const parts = content.split(anchor);
const updatedContent = parts[0] + anchor + parts[1].replace(
  /    \}\r?\n  \}\);/,
  '    }\r\n  });\r\n\r\n' + locationTranslations.replace(/\n/g, '\r\n')
);

fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log('Successfully injected AMAZON_LOCATION_MODAL_I18N into translations.js');
