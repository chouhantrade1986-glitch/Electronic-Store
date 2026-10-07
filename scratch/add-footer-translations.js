const fs = require('fs');
const path = require('path');

const targetPath = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store', 'translations.js');
let code = fs.readFileSync(targetPath, 'utf8');

const FOOTER_TRANSLATIONS = {
  en: {
    back_to_top: "Back to top",
    footer_know_us: "Get to Know Us",
    footer_about: "About ElectroMart",
    footer_careers: "Careers",
    footer_press: "Press Releases",
    footer_cares: "ElectroMart Cares",
    footer_connect: "Connect with Us",
    footer_earn: "Make Money with Us",
    footer_sell: "Sell on ElectroMart",
    footer_affiliate: "Become an Affiliate",
    footer_fulfilment: "Fulfilment by ElectroMart",
    footer_advertise: "Advertise Your Products",
    footer_help_you: "Let Us Help You",
    footer_your_account: "Your Account",
    footer_your_orders: "Your Orders",
    footer_shipping: "Shipping Rates & Policies",
    footer_returns: "Returns & Replacements",
    footer_help: "Help"
  },
  hi: {
    back_to_top: "वापस सबसे ऊपर जाएं",
    footer_know_us: "हमारे बारे में जानें",
    footer_about: "हमारे बारे में जानकारी",
    footer_careers: "कैरियर",
    footer_press: "प्रेस विज्ञप्तियां",
    footer_cares: "इलेक्ट्रोमार्ट केयर्स",
    footer_connect: "हमसे जुड़ें",
    footer_earn: "हमारे साथ पैसे कमाएं",
    footer_sell: "ElectroMart पर बेचें",
    footer_affiliate: "एफिलिएट बनें",
    footer_fulfilment: "ElectroMart द्वारा फुलफिलमेंट",
    footer_advertise: "अपने प्रोडक्ट का विज्ञापन दें",
    footer_help_you: "हमें आपकी सहायता करने दें",
    footer_your_account: "आपका अकाउंट",
    footer_your_orders: "आपके ऑर्डर",
    footer_shipping: "शिपिंग दरें और नीतियां",
    footer_returns: "वापसी और रिप्लेसमेंट",
    footer_help: "सहायता"
  },
  ta: {
    back_to_top: "மீண்டும் மேலே செல்லவும்",
    footer_know_us: "எங்களைப் பற்றி தெரிந்து கொள்ளுங்கள்",
    footer_about: "ElectroMart பற்றி",
    footer_careers: "வேலைவாய்ப்புகள்",
    footer_press: "செய்தி வெளியீடுகள்",
    footer_cares: "ElectroMart கேர்ஸ்",
    footer_connect: "எங்களுடன் இணையுங்கள்",
    footer_earn: "எங்களுடன் சம்பாதியுங்கள்",
    footer_sell: "ElectroMart இல் விற்கவும்",
    footer_affiliate: "அஃபிலியேட் ஆக இணையுங்கள்",
    footer_fulfilment: "ElectroMart மூலம் ஃபுல்ஃபில்மென்ட்",
    footer_advertise: "உங்கள் தயாரிப்புகளை விளம்பரப்படுத்துங்கள்",
    footer_help_you: "உங்களுக்கு உதவ எங்களை அனுமதியுங்கள்",
    footer_your_account: "உங்கள் கணக்கு",
    footer_your_orders: "உங்கள் ஆர்டர்கள்",
    footer_shipping: "ஷிப்பிங் கட்டணங்கள் மற்றும் கொள்கைகள்",
    footer_returns: "திரும்பப் பெறுதல் மற்றும் மாற்றுதல்",
    footer_help: "உதவி"
  },
  te: {
    back_to_top: "తిరిగి పైకి వెళ్లండి",
    footer_know_us: "మా గురించి తెలుసుకోండి",
    footer_about: "ElectroMart గురించి",
    footer_careers: "కెరీర్లు",
    footer_press: "ప్రెస్ ప్రకటనలు",
    footer_cares: "ElectroMart కేర్స్",
    footer_connect: "మాతో కనెక్ట్ అవ్వండి",
    footer_earn: "మాతో డబ్బు సంపాదించండి",
    footer_sell: "ElectroMart లో అమ్మండి",
    footer_affiliate: "అనుబంధ భాగస్వామి అవ్వండి",
    footer_fulfilment: "ElectroMart ద్వారా నెరవేర్పు",
    footer_advertise: "మీ ఉత్పత్తులను ప్రచారం చేయండి",
    footer_help_you: "మేము మీకు సహాయం చేస్తాము",
    footer_your_account: "మీ ఖాతా",
    footer_your_orders: "మీ ఆర్డర్లు",
    footer_shipping: "షిప్పింగ్ రేట్లు & విధానాలు",
    footer_returns: "వాపసులు & రీప్లేస్‌మెంట్‌లు",
    footer_help: "సహాయం"
  },
  kn: {
    back_to_top: "ಮರಳಿ ಮೇಲಕ್ಕೆ ಹೋಗಿ",
    footer_know_us: "ನಮ್ಮ ಬಗ್ಗೆ ತಿಳಿಯಿರಿ",
    footer_about: "ElectroMart ಬಗ್ಗೆ",
    footer_careers: "ಉದ್ಯೋಗಗಳು",
    footer_press: "ಪತ್ರಿಕಾ ಪ್ರಕಟಣೆಗಳು",
    footer_cares: "ElectroMart ಕೇರ್ಸ್",
    footer_connect: "ನಮ್ಮೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಿ",
    footer_earn: "ನಮ್ಮೊಂದಿಗೆ ಹಣ ಸಂಪಾದಿಸಿ",
    footer_sell: "ElectroMart ನಲ್ಲಿ ಮಾರಾಟ ಮಾಡಿ",
    footer_affiliate: "ಅಫಿಲಿಯೇಟ್ ಆಗಿ",
    footer_fulfilment: "ElectroMart ಮೂಲಕ ಪೂರೈಕೆ",
    footer_advertise: "ನಿಮ್ಮ ಉತ್ಪನ್ನಗಳನ್ನು ಜಾಹೀರಾತು ಮಾಡಿ",
    footer_help_you: "ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ನಮಗೆ ಅವಕಾಶ ನೀಡಿ",
    footer_your_account: "ನಿಮ್ಮ ಖಾತೆ",
    footer_your_orders: "ನಿಮ್ಮ ಆರ್ಡರ್‌ಗಳು",
    footer_shipping: "ಶಿಪ್ಪಿಂಗ್ ದರಗಳು ಮತ್ತು ನೀತಿಗಳು",
    footer_returns: "ಹಿಂತಿರುಗಿಸುವಿಕೆ ಮತ್ತು ಬದಲಿ",
    footer_help: "ಸಹಾಯ"
  },
  ml: {
    back_to_top: "തിരികെ മുകളിലേക്ക് പോവുക",
    footer_know_us: "ഞങ്ങളെക്കുറിച്ച് അറിയുക",
    footer_about: "ElectroMart നെ കുറിച്ച്",
    footer_careers: "കരിയർ",
    footer_press: "പ്രസ് റിലീസുകൾ",
    footer_cares: "ElectroMart കെയേഴ്സ്",
    footer_connect: "ഞങ്ങളുമായി ബന്ധപ്പെടുക",
    footer_earn: "ഞങ്ങളോടൊപ്പം പണം സമ്പാദിക്കുക",
    footer_sell: "ElectroMart-ൽ വിൽക്കുക",
    footer_affiliate: "അഫിലിയേറ്റ് ആകുക",
    footer_fulfilment: "ElectroMart വഴിയുള്ള ഫുൾഫിൽമെന്റ്",
    footer_advertise: "നിങ്ങളുടെ ഉൽപ്പന്നങ്ങൾ പരസ്യം ചെയ്യുക",
    footer_help_you: "ഞങ്ങളെ സഹായിക്കാൻ അനുവദിക്കുക",
    footer_your_account: "നിങ്ങളുടെ അക്കൗണ്ട്",
    footer_your_orders: "നിങ്ങളുടെ ഓർഡറുകൾ",
    footer_shipping: "ഷിപ്പിംഗ് നിരക്കുകളും നയങ്ങളും",
    footer_returns: "തിരികെ നൽകലും മാറ്റിസ്ഥാപിക്കലും",
    footer_help: "സಹായം"
  },
  bn: {
    back_to_top: "উপরে ফিরে যান",
    footer_know_us: "আমাদের সম্পর্কে জানুন",
    footer_about: "ElectroMart সম্পর্কে",
    footer_careers: "ক্যারিয়ার",
    footer_press: "প্রেস রিলিজ",
    footer_cares: "ElectroMart কেয়ার্স",
    footer_connect: "আমাদের সাথে যোগাযোগ করুন",
    footer_earn: "আমাদের সাথে অর্থ উপার্জন করুন",
    footer_sell: "ElectroMart-এ বিক্রি করুন",
    footer_affiliate: "অ্যাফিলিয়েট হন",
    footer_fulfilment: "ElectroMart দ্বারা পূর্ণতা",
    footer_advertise: "আপনার পণ্যের বিজ্ঞাপন দিন",
    footer_help_you: "আমাদের আপনাকে সাহায্য করতে দিন",
    footer_your_account: "আপনার অ্যাকাউন্ট",
    footer_your_orders: "আপনার অর্ডার",
    footer_shipping: "শিপিং হার এবং নীতি",
    footer_returns: "রিটার্ন এবং প্রতিস্থাপন",
    footer_help: "সহায়তা"
  },
  mr: {
    back_to_top: "परत वर जा",
    footer_know_us: "आमच्याबद्दल जाणून घ्या",
    footer_about: "ElectroMart बद्दल माहिती",
    footer_careers: "करिअर",
    footer_press: "प्रेस विज्ञप्ति",
    footer_cares: "ElectroMart केअर्स",
    footer_connect: "आमच्याशी कनेक्ट व्हा",
    footer_earn: "आमच्यासोबत पैसे कमवा",
    footer_sell: "ElectroMart वर विक्री करा",
    footer_affiliate: "एफिलिएट बना",
    footer_fulfilment: "ElectroMart द्वारे पूर्तता",
    footer_advertise: "तुमच्या उत्पादनांची जाहिरात करा",
    footer_help_you: "आम्हाला तुमची मदत करू द्या",
    footer_your_account: "तुमचे खाते",
    footer_your_orders: "तुमच्या ऑर्डर्स",
    footer_shipping: "शिपिंग दर आणि धोरणे",
    footer_returns: "परतावा आणि पुनर्स्थापना",
    footer_help: "मदत"
  },
  ur: {
    back_to_top: "واپس اوپر جائیں",
    footer_know_us: "ہمارے بارے میں جانیں",
    footer_about: "ElectroMart کے بارے میں",
    footer_careers: "ملازمتیں",
    footer_press: "پریس ریلیز",
    footer_cares: "ElectroMart کیئرز",
    footer_connect: "ہم سے جڑیں",
    footer_earn: "ہمارے ساتھ پیسہ کمائیں",
    footer_sell: "ElectroMart پر بیچیں",
    footer_affiliate: "ایفیلی ایٹ بنیں",
    footer_fulfilment: "ElectroMart کے ذریعے ترسیل",
    footer_advertise: "اپنی مصنوعات کی تشہیر کریں",
    footer_help_you: "ہمیں اپنی مدد کرنے دیں",
    footer_your_account: "آپ کا اکاؤنٹ",
    footer_your_orders: "آپ کے آرڈرز",
    footer_shipping: "شپنگ کے نرخ اور پالیسیاں",
    footer_returns: "واپسی اور تبدیلی",
    footer_help: "مدد"
  },
  pa: {
    back_to_top: "ਵਾਪਸ ਉੱਪਰ ਜਾਓ",
    footer_know_us: "ਸਾਡੇ ਬਾਰੇ ਜਾਣੋ",
    footer_about: "ElectroMart ਬਾਰੇ",
    footer_careers: "ਕਰੀਅਰ",
    footer_press: "ਪ੍ਰੈਸ ਰਿਲੀਜ਼ਾਂ",
    footer_cares: "ElectroMart ਕੇਅਰਜ਼",
    footer_connect: "ਸਾਡੇ ਨਾਲ ਜੁੜੋ",
    footer_earn: "ਸਾਡੇ ਨਾਲ ਪੈਸੇ ਕਮਾਓ",
    footer_sell: "ElectroMart 'ਤੇ ਵੇਚੋ",
    footer_affiliate: "ਐਫੀਲੀਏਟ ਬਣੋ",
    footer_fulfilment: "ElectroMart ਦੁਆਰਾ ਪੂਰਤੀ",
    footer_advertise: "ਆਪਣੇ ਉਤਪਾਦਾਂ ਦਾ ਇਸ਼ਤਿਹਾਰ ਦਿਓ",
    footer_help_you: "ਸਾਨੂੰ ਤੁਹਾਡੀ ਮਦਦ ਕਰਨ ਦਿਓ",
    footer_your_account: "ਤੁਹਾਡਾ ਖਾਤਾ",
    footer_your_orders: "ਤੁਹਾਡੇ ਆਰਡਰ",
    footer_shipping: "ਸ਼ਿਪਿੰਗ ਦਰਾਂ ਅਤੇ ਨੀਤੀਆਂ",
    footer_returns: "ਵਾਪਸੀ ਅਤੇ ਬਦਲੀ",
    footer_help: "ਮਦਦ"
  },
  gu: {
    back_to_top: "પાછા ઉપર જાઓ",
    footer_know_us: "અમારા વિશે જાણો",
    footer_about: "ElectroMart વિશે",
    footer_careers: "કારકિર્દી",
    footer_press: "પ્રેસ જાહેરાતો",
    footer_cares: "ElectroMart કેર્સ",
    footer_connect: "અમારી સાથે જોડાઓ",
    footer_earn: "અમારી સાથે પૈસા કમાઓ",
    footer_sell: "ElectroMart પર વેચો",
    footer_affiliate: "એફિલિએટ બનો",
    footer_fulfilment: "ElectroMart દ્વારા પૂર્તિ",
    footer_advertise: "તમારા ઉત્પાદનોની જાહેરાત કરો",
    footer_help_you: "અમને તમારી મદદ કરવા દો",
    footer_your_account: "તમારું એકાઉન્ટ",
    footer_your_orders: "તમારા ઓર્ડર્સ",
    footer_shipping: "શિપિંગ દરો અને નીતિઓ",
    footer_returns: "રીટર્ન અને રિપ્લેસમેન્ટ",
    footer_help: "મદદ"
  }
};

const injectionMarker = 'window.EM_TRANSLATIONS = translations;';
const extensionCode = `
  // Merge footer translations across all 11 languages
  const FOOTER_I18N = ${JSON.stringify(FOOTER_TRANSLATIONS, null, 2)};
  Object.keys(FOOTER_I18N).forEach((lang) => {
    if (translations[lang]) {
      Object.assign(translations[lang], FOOTER_I18N[lang]);
    }
  });

  ${injectionMarker}`;

if (code.includes(injectionMarker)) {
  code = code.replace(injectionMarker, extensionCode);
  fs.writeFileSync(targetPath, code, 'utf8');
  console.log('Successfully injected footer translations into translations.js');
} else {
  console.error('Marker not found in translations.js');
  process.exit(1);
}
