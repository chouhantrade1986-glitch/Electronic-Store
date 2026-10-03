const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'translations.js');
let content = fs.readFileSync(filePath, 'utf8');

const checkoutHeaderTranslations = `
  // Amazon India Distraction-Free Checkout Header i18n
  const AMAZON_CHECKOUT_HEADER_I18N = {
    "en": {
      "checkout_title": "Checkout",
      "checkout_secure_badge": "100% Secure",
      "checkout_item_singular": "item",
      "checkout_items_plural": "items"
    },
    "hi": {
      "checkout_title": "चेकआउट",
      "checkout_secure_badge": "100% सुरक्षित",
      "checkout_item_singular": "आइटम",
      "checkout_items_plural": "आइटम"
    },
    "ta": {
      "checkout_title": "செக்அவுட்",
      "checkout_secure_badge": "100% பாதுகாப்பானது",
      "checkout_item_singular": "பொருள்",
      "checkout_items_plural": "பொருட்கள்"
    },
    "te": {
      "checkout_title": "చెక్అవుట్",
      "checkout_secure_badge": "100% సురక్షితం",
      "checkout_item_singular": "వస్తువు",
      "checkout_items_plural": "వస్తువులు"
    },
    "kn": {
      "checkout_title": "ಚೆಕ್‌ಔಟ್",
      "checkout_secure_badge": "100% ಸುರಕ್ಷಿತ",
      "checkout_item_singular": "ವಸ್ತು",
      "checkout_items_plural": "ವಸ್ತುಗಳು"
    },
    "ml": {
      "checkout_title": "ചെക്ക്ഔട്ട്",
      "checkout_secure_badge": "100% സുരക്ഷിതം",
      "checkout_item_singular": "ഇനം",
      "checkout_items_plural": "ഇനങ്ങൾ"
    },
    "bn": {
      "checkout_title": "চেকআউট",
      "checkout_secure_badge": "১০০% নিরাপদ",
      "checkout_item_singular": "আইটেম",
      "checkout_items_plural": "আইটেম"
    },
    "mr": {
      "checkout_title": "चेकआउट",
      "checkout_secure_badge": "100% सुरक्षित",
      "checkout_item_singular": "आयटम",
      "checkout_items_plural": "आयटम"
    },
    "ur": {
      "checkout_title": "چیک آؤٹ",
      "checkout_secure_badge": "100% محفوظ",
      "checkout_item_singular": "آئٹم",
      "checkout_items_plural": "اشیاء"
    },
    "pa": {
      "checkout_title": "ਚੈੱਕਆਉਟ",
      "checkout_secure_badge": "100% ਸੁਰੱਖਿਅਤ",
      "checkout_item_singular": "ਆਈਟਮ",
      "checkout_items_plural": "ਆਈਟਮਾਂ"
    },
    "gu": {
      "checkout_title": "ચેકઆઉટ",
      "checkout_secure_badge": "100% સુરક્ષિત",
      "checkout_item_singular": "આઇટમ",
      "checkout_items_plural": "આઇટમો"
    }
  };

  Object.keys(AMAZON_CHECKOUT_HEADER_I18N).forEach((lang) => {
    if (translations[lang]) {
      Object.assign(translations[lang], AMAZON_CHECKOUT_HEADER_I18N[lang]);
    }
  });
`;

const anchor = '  window.EM_TRANSLATIONS = translations;';
if (!content.includes(anchor)) {
  console.error('Target anchor not found in translations.js');
  process.exit(1);
}

// Ensure it hasn't already been injected
if (content.includes('AMAZON_CHECKOUT_HEADER_I18N')) {
  console.log('AMAZON_CHECKOUT_HEADER_I18N already exists in translations.js');
  process.exit(0);
}

content = content.replace(anchor, checkoutHeaderTranslations + '\n\n' + anchor);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully injected AMAZON_CHECKOUT_HEADER_I18N into translations.js');
