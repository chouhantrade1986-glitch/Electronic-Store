const fs = require('fs');
const path = require('path');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');

const AUTH_ADMIN_I18N = {
  en: {
    auth_heading: "Sign in or create account",
    auth_subheading: "Access your orders, saved profile, and account settings.",
    admin_signin_title: "Admin sign in",
    admin_signin_copy: "Use an admin account to open Seller Central and manage store operations.",
    seller_central_access: "Seller Central access",
    seller_central_copy: "Sign in with your admin account. Customer and demo accounts remain unchanged.",
    admin_panel_home: "Admin Panel Home",
    back_to_store: "Back to Store",
    signin_tab: "Sign In",
    create_account_tab: "Create Account",
    otp_delivery: "OTP Delivery",
    otp_email: "Email",
    otp_mobile: "Mobile Number",
    email_or_mobile: "Email or Mobile",
    password: "Password",
    forgot_password: "Forgot password?",
    send_otp: "Send OTP",
    enter_otp: "Enter OTP",
    login_with_otp: "Login with OTP",
    seller_central: "Seller Central",
    admin_panel_access: "Admin Panel Access",
    admin_panel_desc: "Manage products, orders, analytics, automation, notifications, and store operations from one dashboard.",
    signin_as_admin: "Sign In as Admin",
    go_to_account: "Go to Account",
    nav_storefront: "Storefront",
    nav_account: "Account",
    nav_orders: "Orders"
  },
  hi: {
    auth_heading: "साइन इन करें या खाता बनाएं",
    auth_subheading: "अपने ऑर्डर, सहेजे गए प्रोफ़ाइल और खाता सेटिंग्स तक पहुंचें.",
    admin_signin_title: "एडमिन साइन इन",
    admin_signin_copy: "सेलर सेंट्रल खोलने और स्टोर संचालन प्रबंधित करने के लिए एडमिन खाते का उपयोग करें.",
    seller_central_access: "सेलर सेंट्रल एक्सेस",
    seller_central_copy: "अपने एडमिन खाते से साइन इन करें. ग्राहक और डेमो खाते अपरिवर्तित रहेंगे.",
    admin_panel_home: "एडमिन पैनल होम",
    back_to_store: "स्टोर पर वापस जाएं",
    signin_tab: "साइन इन",
    create_account_tab: "खाता बनाएं",
    otp_delivery: "ओटीपी डिलीवरी",
    otp_email: "ईमेल",
    otp_mobile: "मोबाइल नंबर",
    email_or_mobile: "ईमेल या मोबाइल",
    password: "पासवर्ड",
    forgot_password: "पासवर्ड भूल गए?",
    send_otp: "ओटीपी भेजें",
    enter_otp: "ओटीपी दर्ज करें",
    login_with_otp: "ओटीपी के साथ लॉगिन करें",
    seller_central: "सेलर सेंट्रल",
    admin_panel_access: "एडमिन पैनल एक्सेस",
    admin_panel_desc: "एक ही डैशबोर्ड से उत्पादों, ऑर्डर, एनालिटिक्स, ऑटोमेशन, नोटिफिकेशन और स्टोर संचालन को प्रबंधित करें.",
    signin_as_admin: "एडमिन के रूप में साइन इन करें",
    go_to_account: "अकाउंट पर जाएं",
    nav_storefront: "स्टोरफ्रंट",
    nav_account: "अकाउंट",
    nav_orders: "ऑर्डर"
  },
  ta: {
    auth_heading: "உள்நுழைக அல்லது கணக்கை உருவாக்கவும்",
    auth_subheading: "உங்கள் ஆர்டர்கள் மற்றும் கணக்கு அமைப்புகளை அணுகவும்.",
    admin_signin_title: "நிர்வாகி உள்நுழைவு",
    admin_signin_copy: "விற்பனையாளர் மையத்தைத் திறந்து செயல்பாடுகளை நிர்வகிக்க நிர்வாகி கணக்கைப் பயன்படுத்தவும்.",
    seller_central_access: "விற்பனையாளர் மைய அணுகல்",
    seller_central_copy: "உங்கள் நிர்வாகி கணக்குடன் உள்நுழைக.",
    admin_panel_home: "நிர்வாகி பேனல் முகப்பு",
    back_to_store: "ஸ்டோருக்குத் திரும்பு",
    signin_tab: "உள்நுழைக",
    create_account_tab: "கணக்கை உருவாக்கவும்",
    otp_delivery: "OTP விநியோகம்",
    otp_email: "மின்னஞ்சல்",
    otp_mobile: "மொபைல் எண்",
    email_or_mobile: "மின்னஞ்சல் அல்லது மொபைல்",
    password: "கடவுச்சொல்",
    forgot_password: "கடவுச்சொல்லை மறந்துவிட்டீர்களா?",
    send_otp: "OTP அனுப்பு",
    enter_otp: "OTP உள்ளிடவும்",
    login_with_otp: "OTP மூலம் உள்நுழைக",
    seller_central: "விற்பனையாளர் மையம்",
    admin_panel_access: "நிர்வாகி பேனல் அணுகல்",
    admin_panel_desc: "ஒரு டேஷ்போர்டில் இருந்து ஸ்டோர் செயல்பாடுகளை நிர்வகிக்கவும்.",
    signin_as_admin: "நிர்வாகியாக உள்நுழைக",
    go_to_account: "கணக்கிற்குச் செல்லவும்",
    nav_storefront: "ஸ்டோர்ஃபிரண்ட்",
    nav_account: "கணக்கு",
    nav_orders: "ஆர்டர்கள்"
  },
  te: {
    auth_heading: "సైన్ ఇన్ చేయండి లేదా ఖాతాను సృష్టించండి",
    auth_subheading: "మీ ఆర్డర్లు మరియు ఖాతా సెట్టింగ్‌లను యాక్సెస్ చేయండి.",
    admin_signin_title: "అడ్మిన్ సైన్ ఇన్",
    admin_signin_copy: "సెల్లర్ సెంట్రల్ తెరవడానికి అడ్మిన్ ఖాతాను ఉపయోగించండి.",
    seller_central_access: "సెల్లర్ సెంట్రల్ యాక్సెస్",
    seller_central_copy: "మీ అడ్మిన్ ఖాతాతో సైన్ ఇన్ చేయండి.",
    admin_panel_home: "అడ్మిన్ ప్యానెల్ హోమ్",
    back_to_store: "స్టోర్‌కు తిరిగి వెళ్ళు",
    signin_tab: "సైన్ ఇన్",
    create_account_tab: "ఖాతాను సృష్టించండి",
    otp_delivery: "OTP డెలివరీ",
    otp_email: "ఇమెయిల్",
    otp_mobile: "మొబైల్ సంఖ్య",
    email_or_mobile: "ఇమెయిల్ లేదా మొబైల్",
    password: "పాస్‌వర్డ్",
    forgot_password: "పాస్‌వర్డ్ మర్చిపోయారా?",
    send_otp: "OTP పంపండి",
    enter_otp: "OTP నమోదు చేయండి",
    login_with_otp: "OTP తో లాగిన్ అవ్వండి",
    seller_central: "సెల్లర్ సెంట్రల్",
    admin_panel_access: "అడ్మిన్ ప్యానెల్ యాక్సెస్",
    admin_panel_desc: "ఒకే డ్యాష్‌బోర్డ్ నుండి స్టోర్ కార్యకలాపాలను నిర్వహించండి.",
    signin_as_admin: "అడ్మిన్‌గా సైన్ ఇన్ చేయండి",
    go_to_account: "ఖాతాకు వెళ్లండి",
    nav_storefront: "స్టోర్‌ఫ్రంట్",
    nav_account: "ఖాతా",
    nav_orders: "ఆర్డర్లు"
  },
  kn: {
    auth_heading: "ಸೈನ್ ಇನ್ ಮಾಡಿ ಅಥವಾ ಖಾತೆಯನ್ನು ರಚಿಸಿ",
    auth_subheading: "ನಿಮ್ಮ ಆದೇಶಗಳು ಮತ್ತು ಖಾತೆ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಪ್ರವೇಶಿಸಿ.",
    admin_signin_title: "ನಿರ್ವಾಹಕ ಸೈನ್ ಇನ್",
    admin_signin_copy: "ಮಾರಾಟಗಾರರ ಕೇಂದ್ರವನ್ನು ತೆರೆಯಲು ನಿರ್ವಾಹಕ ಖಾತೆಯನ್ನು ಬಳಸಿ.",
    seller_central_access: "ಮಾರಾಟಗಾರರ ಕೇಂದ್ರ ಪ್ರವೇಶ",
    seller_central_copy: "ನಿಮ್ಮ ನಿರ್ವಾಹಕ ಖಾತೆಯೊಂದಿಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ.",
    admin_panel_home: "ನಿರ್ವಾಹಕ ಫಲಕ ಮುಖಪುಟ",
    back_to_store: "ಅಂಗಡಿಗೆ ಹಿಂತಿರುಗಿ",
    signin_tab: "ಸೈನ್ ಇನ್",
    create_account_tab: "ಖಾತೆಯನ್ನು ರಚಿಸಿ",
    otp_delivery: "OTP ವಿತರಣೆ",
    otp_email: "ಇಮೇಲ್",
    otp_mobile: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
    email_or_mobile: "ಇಮೇಲ್ ಅಥವಾ ಮೊಬೈಲ್",
    password: "ಪಾಸ್‌ವರ್ಡ್",
    forgot_password: "ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರುವಿರಾ?",
    send_otp: "OTP ಕಳುಹಿಸಿ",
    enter_otp: "OTP ನಮೂದಿಸಿ",
    login_with_otp: "OTP ಯೊಂದಿಗೆ ಲಾಗಿನ್ ಮಾಡಿ",
    seller_central: "ಮಾರಾಟಗಾರರ ಕೇಂದ್ರ",
    admin_panel_access: "ನಿರ್ವಾಹಕ ಫಲಕ ಪ್ರವೇಶ",
    admin_panel_desc: "ಒಂದೇ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಿಂದ ಅಂಗಡಿ ಕಾರ್ಯಾಚರಣೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ.",
    signin_as_admin: "ನಿರ್ವಾಹಕರಾಗಿ ಸೈನ್ ಇನ್ ಮಾಡಿ",
    go_to_account: "ಖಾತೆಗೆ ಹೋಗಿ",
    nav_storefront: "ಅಂಗಡಿ ಮುಂಭಾಗ",
    nav_account: "ಖಾತೆ",
    nav_orders: "ಆದೇಶಗಳು"
  },
  ml: {
    auth_heading: "സൈൻ ഇൻ ചെയ്യുക അല്ലെങ്കിൽ അക്കൗണ്ട് സൃഷ്ടിക്കുക",
    auth_subheading: "നിങ്ങളുടെ ഓർഡറുകളും അക്കൗണ്ട് ക്രമീകരണങ്ങളും ആക്സസ് ചെയ്യുക.",
    admin_signin_title: "അഡ്മിൻ സൈൻ ഇൻ",
    admin_signin_copy: "സെല്ലർ സെൻട്രൽ തുറക്കാൻ അഡ്മിൻ അക്കൗണ്ട് ഉപയോഗിക്കുക.",
    seller_central_access: "സെല്ലർ സെൻട്രൽ ആക്സസ്",
    seller_central_copy: "നിങ്ങളുടെ അഡ്മിൻ അക്കൗണ്ട് ഉപയോഗിച്ച് സൈൻ ഇൻ ചെയ്യുക.",
    admin_panel_home: "അഡ്മിൻ പാനൽ ഹോം",
    back_to_store: "സ്റ്റോറിലേക്ക് മടങ്ങുക",
    signin_tab: "സൈൻ ഇൻ",
    create_account_tab: "അക്കൗണ്ട് സൃഷ്ടിക്കുക",
    otp_delivery: "OTP ഡെലിവറി",
    otp_email: "ഇമെയിൽ",
    otp_mobile: "മൊബൈൽ നമ്പർ",
    email_or_mobile: "ഇമെയിൽ അല്ലെങ്കിൽ മൊബൈൽ",
    password: "പാസ്‌വേഡ്",
    forgot_password: "പാസ്‌വേഡ് മറന്നോ?",
    send_otp: "OTP അയയ്ക്കുക",
    enter_otp: "OTP നൽകുക",
    login_with_otp: "OTP ഉപയോഗിച്ച് ലോഗിൻ ചെയ്യുക",
    seller_central: "സെല്ലർ സെൻട്രൽ",
    admin_panel_access: "അഡ്മിൻ പാനൽ ആക്സസ്",
    admin_panel_desc: "ഒരു ഡാഷ്‌ബോർഡിൽ നിന്ന് സ്റ്റോർ പ്രവർത്തനങ്ങൾ നിയന്ത്രിക്കുക.",
    signin_as_admin: "അഡ്മിനായി സൈൻ ഇൻ ചെയ്യുക",
    go_to_account: "അക്കൗണ്ടിലേക്ക് പോകുക",
    nav_storefront: "സ്റ്റോർഫ്രണ്ട്",
    nav_account: "അക്കൗണ്ട്",
    nav_orders: "ഓർഡറുകൾ"
  },
  bn: {
    auth_heading: "সাইন ইন করুন বা অ্যাকাউন্ট তৈরি করুন",
    auth_subheading: "আপনার অর্ডার এবং অ্যাকাউন্ট সেটিংস অ্যাক্সেস করুন।",
    admin_signin_title: "অ্যাডমিন সাইন ইন",
    admin_signin_copy: "সেলার সেন্ট্রাল খুলতে অ্যাডমিন অ্যাকাউন্ট ব্যবহার করুন।",
    seller_central_access: "সেলার সেন্ট্রাল অ্যাক্সেস",
    seller_central_copy: "আপনার অ্যাডমিন অ্যাকাউন্ট দিয়ে সাইন ইন করুন।",
    admin_panel_home: "অ্যাডমিন প্যানেল হোম",
    back_to_store: "স্টোরে ফিরে যান",
    signin_tab: "সাইন ইন",
    create_account_tab: "অ্যাকাউন্ট তৈরি করুন",
    otp_delivery: "OTP ডেলিভারি",
    otp_email: "ইমেইল",
    otp_mobile: "মোবাইল নম্বর",
    email_or_mobile: "ইমেইল বা মোবাইল",
    password: "পাসওয়ার্ড",
    forgot_password: "পাসওয়ার্ড ভুলে গেছেন?",
    send_otp: "OTP পাঠান",
    enter_otp: "OTP লিখুন",
    login_with_otp: "OTP দিয়ে লগইন করুন",
    seller_central: "সেলার সেন্ট্রাল",
    admin_panel_access: "অ্যাডমিন প্যানেল অ্যাক্সেস",
    admin_panel_desc: "একটি ড্যাশবোর্ড থেকে স্টোর কার্যক্রম পরিচালনা করুন।",
    signin_as_admin: "অ্যাডমিন হিসাবে সাইন ইন করুন",
    go_to_account: "অ্যাকাউন্টে যান",
    nav_storefront: "স্টোরফ্রন্ট",
    nav_account: "অ্যাকাউন্ট",
    nav_orders: "অর্ডার"
  },
  mr: {
    auth_heading: "साइन इन करा किंवा खाते तयार करा",
    auth_subheading: "आपल्या ऑर्डर्स आणि खाते सेटिंग्ज अ‍ॅक्सेस करा.",
    admin_signin_title: "अ‍ॅडमिन साइन इन",
    admin_signin_copy: "विक्रेता केंद्र उघडण्यासाठी अ‍ॅडमिन खाते वापरा.",
    seller_central_access: "विक्रेता केंद्र अ‍ॅक्सेस",
    seller_central_copy: "आपल्या अ‍ॅडमिन खात्यासह साइन इन करा.",
    admin_panel_home: "अ‍ॅडमिन पॅनेल होम",
    back_to_store: "स्टोअरवर परत जा",
    signin_tab: "साइन इन",
    create_account_tab: "खाते तयार करा",
    otp_delivery: "OTP डिलिव्हरी",
    otp_email: "ईमेल",
    otp_mobile: "मोबाइल क्रमांक",
    email_or_mobile: "ईमेल किंवा मोबाइल",
    password: "पासवर्ड",
    forgot_password: "पासवर्ड विसरलात?",
    send_otp: "OTP पाठवा",
    enter_otp: "OTP टाका",
    login_with_otp: "OTP सह लॉगिन करा",
    seller_central: "विक्रेता केंद्र",
    admin_panel_access: "अ‍ॅडमिन पॅनेल अ‍ॅक्सेस",
    admin_panel_desc: "एकाच डॅशबोर्डवरून स्टोअर ऑपरेशन्स व्यवस्थापित करा.",
    signin_as_admin: "अ‍ॅडमिन म्हणून साइन इन करा",
    go_to_account: "खात्यावर जा",
    nav_storefront: "स्टोअरफ्रंट",
    nav_account: "खाते",
    nav_orders: "ऑर्डर्स"
  },
  ur: {
    auth_heading: "سائن ان کریں یا اکاؤنٹ بنائیں",
    auth_subheading: "اپنے آرڈرز اور اکاؤنٹ کی ترتیبات تک رسائی حاصل کریں۔",
    admin_signin_title: "ایڈمن سائن ان",
    admin_signin_copy: "سیلر سینٹرل کھولنے کے لیے ایڈمن اکاؤنٹ استعمال کریں۔",
    seller_central_access: "سیلر سینٹرل رسائی",
    seller_central_copy: "اپنے ایڈمن اکاؤنٹ کے ساتھ سائن ان کریں۔",
    admin_panel_home: "ایڈمن پینل ہوم",
    back_to_store: "اسٹور پر واپس جائیں",
    signin_tab: "سائن ان",
    create_account_tab: "اکاؤنٹ بنائیں",
    otp_delivery: "او ٹی پی ترسیل",
    otp_email: "ای میل",
    otp_mobile: "موبائل نمبر",
    email_or_mobile: "ای میل یا موبائل",
    password: "پاس ورڈ",
    forgot_password: "پاس ورڈ بھول گئے؟",
    send_otp: "او ٹی پی بھیجیں",
    enter_otp: "او ٹی پی درج کریں",
    login_with_otp: "او ٹی پی کے ساتھ لاگ ان کریں",
    seller_central: "سیلر سینٹرل",
    admin_panel_access: "ایڈمن پینل رسائی",
    admin_panel_desc: "ایک ڈیش بورڈ سے اسٹور کا کام کاج سنبھالیں۔",
    signin_as_admin: "بطور ایڈمن سائن ان کریں",
    go_to_account: "اکاؤنٹ پر جائیں",
    nav_storefront: "اسٹور فرنٹ",
    nav_account: "اکاؤنٹ",
    nav_orders: "آرڈرز"
  },
  pa: {
    auth_heading: "ਸਾਈਨ ਇਨ ਕਰੋ ਜਾਂ ਖਾਤਾ ਬਣਾਓ",
    auth_subheading: "ਆਪਣੇ ਆਰਡਰਾਂ ਅਤੇ ਖਾਤਾ ਸੈਟਿੰਗਾਂ ਤੱਕ ਪਹੁੰਚ ਕਰੋ।",
    admin_signin_title: "ਐਡਮਿਨ ਸਾਈਨ ਇਨ",
    admin_signin_copy: "ਵਿਕਰੇਤਾ ਕੇਂਦਰ ਖੋਲ੍ਹਣ ਲਈ ਐਡਮਿਨ ਖਾਤੇ ਦੀ ਵਰਤੋਂ ਕਰੋ।",
    seller_central_access: "ਵਿਕਰੇਤਾ ਕੇਂਦਰ ਪਹੁੰਚ",
    seller_central_copy: "ਆਪਣੇ ਐਡਮਿਨ ਖਾਤੇ ਨਾਲ ਸਾਈਨ ਇਨ ਕਰੋ।",
    admin_panel_home: "ਐਡਮਿਨ ਪੈਨਲ ਹੋਮ",
    back_to_store: "ਸਟੋਰ 'ਤੇ ਵਾਪਸ ਜਾਓ",
    signin_tab: "ਸਾਈਨ ਇਨ",
    create_account_tab: "ਖਾਤਾ ਬਣਾਓ",
    otp_delivery: "OTP ਡਿਲੀਵਰੀ",
    otp_email: "ਈਮੇਲ",
    otp_mobile: "ਮੋਬਾਈਲ ਨੰਬਰ",
    email_or_mobile: "ਈਮੇਲ ਜਾਂ ਮੋਬਾਈਲ",
    password: "ਪਾਸਵਰਡ",
    forgot_password: "ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ?",
    send_otp: "OTP ਭੇਜੋ",
    enter_otp: "OTP ਦਾਖਲ ਕਰੋ",
    login_with_otp: "OTP ਨਾਲ ਲੌਗਇਨ ਕਰੋ",
    seller_central: "ਵਿਕਰੇਤਾ ਕੇਂਦਰ",
    admin_panel_access: "ਐਡਮਿਨ ਪੈਨਲ ਪਹੁੰਚ",
    admin_panel_desc: "ਇੱਕ ਡੈਸ਼ਬੋਰਡ ਤੋਂ ਸਟੋਰ ਕਾਰਜਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ।",
    signin_as_admin: "ਐਡਮਿਨ ਵਜੋਂ ਸਾਈਨ ਇਨ ਕਰੋ",
    go_to_account: "ਖਾਤੇ 'ਤੇ ਜਾਓ",
    nav_storefront: "ਸਟੋਰਫ੍ਰੰਟ",
    nav_account: "ਖਾਤਾ",
    nav_orders: "ਆਰਡਰ"
  },
  gu: {
    auth_heading: "સાઇન ઇન કરો અથવા એકાઉન્ટ બનાવો",
    auth_subheading: "તમારા ઓર્ડર્સ અને એકાઉન્ટ સેટિંગ્સ ઍક્સેસ કરો.",
    admin_signin_title: "એડમિન સાઇન ઇન",
    admin_signin_copy: "સેલર સેન્ટ્રલ ખોલવા માટે એડમિન એકાઉન્ટનો ઉપયોગ કરો.",
    seller_central_access: "સેલર સેન્ટ્રલ એક્સેસ",
    seller_central_copy: "તમારા એડમિન એકાઉન્ટથી સાઇન ઇન કરો.",
    admin_panel_home: "એડમિન પેનલ હોમ",
    back_to_store: "સ્ટોર પર પાછા જાઓ",
    signin_tab: "સાઇન ઇન",
    create_account_tab: "એકાઉન્ટ બનાવો",
    otp_delivery: "OTP ડિલિવરી",
    otp_email: "ઇમેઇલ",
    otp_mobile: "મોબાઇલ નંબર",
    email_or_mobile: "ઇમેઇલ અથવા મોબાઇલ",
    password: "પાસવર્ડ",
    forgot_password: "પાસવર્ડ ભૂલી ગયા છો?",
    send_otp: "OTP મોકલો",
    enter_otp: "OTP દાખલ કરો",
    login_with_otp: "OTP સાથે લૉગિન કરો",
    seller_central: "સેલર સેન્ટ્રલ",
    admin_panel_access: "એડમિન પેનલ એક્સેસ",
    admin_panel_desc: "એક ડેશબોર્ડથી સ્ટોર કામગીરીનું સંચાલન કરો.",
    signin_as_admin: "એડમિન તરીકે સાઇન ઇન કરો",
    go_to_account: "એકાઉન્ટ પર જાઓ",
    nav_storefront: "સ્ટોરફ્રન્ટ",
    nav_account: "એકાઉન્ટ",
    nav_orders: "ઓર્ડર્સ"
  }
};

// 1. Update translations.js
const transPath = path.join(projectDir, 'translations.js');
let transCode = fs.readFileSync(transPath, 'utf8');

const marker = 'window.EM_TRANSLATIONS = translations;';
const injection = `
  // Merge auth and admin translations
  const AUTH_ADMIN_I18N = ${JSON.stringify(AUTH_ADMIN_I18N, null, 2)};
  Object.keys(AUTH_ADMIN_I18N).forEach((lang) => {
    if (translations[lang]) {
      Object.assign(translations[lang], AUTH_ADMIN_I18N[lang]);
    }
  });

  ${marker}`;

if (transCode.includes(marker)) {
  transCode = transCode.replace(marker, injection);
  fs.writeFileSync(transPath, transCode, 'utf8');
  console.log('Successfully updated translations.js with auth and admin translations');
}

// 2. Update auth.html
const authHtmlPath = path.join(projectDir, 'auth.html');
let authHtml = fs.readFileSync(authHtmlPath, 'utf8');

authHtml = authHtml.replace(
  '<h1 id="authHeading">Sign in or create account</h1>',
  '<h1 id="authHeading" data-i18n="auth_heading">Sign in or create account</h1>'
);
authHtml = authHtml.replace(
  '<p id="authSubheading">Access your orders, saved profile, and account settings.</p>',
  '<p id="authSubheading" data-i18n="auth_subheading">Access your orders, saved profile, and account settings.</p>'
);
authHtml = authHtml.replace(
  '<strong id="adminAccessTitle">Admin access</strong>',
  '<strong id="adminAccessTitle" data-i18n="seller_central_access">Seller Central access</strong>'
);
authHtml = authHtml.replace(
  '<p id="adminAccessCopy">Use your admin account to open Seller Central and manage the store dashboard.</p>',
  '<p id="adminAccessCopy" data-i18n="seller_central_copy">Use your admin account to open Seller Central and manage store operations.</p>'
);
authHtml = authHtml.replace(
  '<a id="adminAccessPrimaryLink" class="auth-chip auth-chip-primary" href="admin.html">Admin Panel</a>',
  '<a id="adminAccessPrimaryLink" class="auth-chip auth-chip-primary" href="admin.html" data-i18n="admin_panel_home">Admin Panel Home</a>'
);
authHtml = authHtml.replace(
  '<a id="adminAccessSecondaryLink" class="auth-chip" href="index.html">Back to Store</a>',
  '<a id="adminAccessSecondaryLink" class="auth-chip" href="index.html" data-i18n="back_to_store">Back to Store</a>'
);
authHtml = authHtml.replace(
  '<button id="signinTab" class="tab-btn active" type="button">Sign In</button>',
  '<button id="signinTab" class="tab-btn active" type="button" data-i18n="signin_tab">Sign In</button>'
);
authHtml = authHtml.replace(
  '<button id="signupTab" class="tab-btn" type="button">Create Account</button>',
  '<button id="signupTab" class="tab-btn" type="button" data-i18n="create_account_tab">Create Account</button>'
);

// Form fields
authHtml = authHtml.replace(
  '<label>OTP Delivery',
  '<label><span data-i18n="otp_delivery">OTP Delivery</span>'
);
authHtml = authHtml.replace(
  '<option value="email">Email</option>',
  '<option value="email" data-i18n="otp_email">Email</option>'
);
authHtml = authHtml.replace(
  '<option value="mobile">Mobile Number</option>',
  '<option value="mobile" data-i18n="otp_mobile">Mobile Number</option>'
);
authHtml = authHtml.replace(
  '<label>Email or Mobile',
  '<label><span data-i18n="email_or_mobile">Email or Mobile</span>'
);
authHtml = authHtml.replace(
  '<label>Password',
  '<label><span data-i18n="password">Password</span>'
);
authHtml = authHtml.replace(
  '<button id="forgotPasswordBtn" class="auth-link-btn" type="button">Forgot password?</button>',
  '<button id="forgotPasswordBtn" class="auth-link-btn" type="button" data-i18n="forgot_password">Forgot password?</button>'
);
authHtml = authHtml.replace(
  '<button id="generateOtpBtn" type="button">Send OTP</button>',
  '<button id="generateOtpBtn" type="button" data-i18n="send_otp">Send OTP</button>'
);
authHtml = authHtml.replace(
  '<label>Enter OTP',
  '<label><span data-i18n="enter_otp">Enter OTP</span>'
);
authHtml = authHtml.replace(
  '<button type="submit">Login with OTP</button>',
  '<button type="submit" data-i18n="login_with_otp">Login with OTP</button>'
);

// Include translations.js before auth.js if missing
if (!authHtml.includes('translations.js')) {
  authHtml = authHtml.replace(
    '<script src="auth.js"></script>',
    '<script src="translations.js"></script>\n  <script src="auth.js"></script>'
  );
}

fs.writeFileSync(authHtmlPath, authHtml, 'utf8');
console.log('Successfully updated auth.html with data-i18n tags and translations.js');

// 3. Update auth.js applyAuthModeUi to use translations
const authJsPath = path.join(projectDir, 'auth.js');
let authJs = fs.readFileSync(authJsPath, 'utf8');

const oldApply = `  if (!isAdminMode) {
    authHeading.textContent = "Sign in or create account";
    authSubheading.textContent = "Access your orders, saved profile, and account settings.";
    return;
  }

  authHeading.textContent = "Admin sign in";
  authSubheading.textContent = "Use an admin account to open Seller Central and manage store operations.";
  signupTab.hidden = true;
  if (signupForm.classList.contains("active")) {
    setActiveView("signin");
  }

  if (signinIdentifier && !signinIdentifier.value) {
    signinIdentifier.value = OFFLINE_ADMIN_EMAIL;
  }

  if (session && String(session.role || "").toLowerCase() === "admin") {
    adminAccessTitle.textContent = "Admin session detected";
    adminAccessCopy.textContent = "Your admin session is already active. Open the dashboard directly or switch user if needed.";
    adminAccessPrimaryLink.href = "admin-dashboard.html";
    adminAccessPrimaryLink.textContent = "Open Admin Dashboard";
    adminAccessSecondaryLink.href = "account.html";
    adminAccessSecondaryLink.textContent = "Admin Account";
    return;
  }

  adminAccessTitle.textContent = "Seller Central access";
  adminAccessCopy.textContent = "Sign in with your admin account. Customer and demo accounts remain unchanged.";
  adminAccessPrimaryLink.href = "admin.html";
  adminAccessPrimaryLink.textContent = "Admin Panel Home";
  adminAccessSecondaryLink.href = "index.html";
  adminAccessSecondaryLink.textContent = "Back to Store";`;

const newApply = `  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : {};

  if (!isAdminMode) {
    authHeading.textContent = t.auth_heading || "Sign in or create account";
    authSubheading.textContent = t.auth_subheading || "Access your orders, saved profile, and account settings.";
    return;
  }

  authHeading.textContent = t.admin_signin_title || "Admin sign in";
  authSubheading.textContent = t.admin_signin_copy || "Use an admin account to open Seller Central and manage store operations.";
  signupTab.hidden = true;
  if (signupForm.classList.contains("active")) {
    setActiveView("signin");
  }

  if (signinIdentifier && !signinIdentifier.value) {
    signinIdentifier.value = OFFLINE_ADMIN_EMAIL;
  }

  if (session && String(session.role || "").toLowerCase() === "admin") {
    adminAccessTitle.textContent = t.admin_session_detected || "Admin session detected";
    adminAccessCopy.textContent = t.admin_session_copy || "Your admin session is already active. Open the dashboard directly or switch user if needed.";
    adminAccessPrimaryLink.href = "admin-dashboard.html";
    adminAccessPrimaryLink.textContent = t.open_admin_dashboard || "Open Admin Dashboard";
    adminAccessSecondaryLink.href = "account.html";
    adminAccessSecondaryLink.textContent = t.admin_account || "Admin Account";
    return;
  }

  adminAccessTitle.textContent = t.seller_central_access || "Seller Central access";
  adminAccessCopy.textContent = t.seller_central_copy || "Sign in with your admin account. Customer and demo accounts remain unchanged.";
  adminAccessPrimaryLink.href = "admin.html";
  adminAccessPrimaryLink.textContent = t.admin_panel_home || "Admin Panel Home";
  adminAccessSecondaryLink.href = "index.html";
  adminAccessSecondaryLink.textContent = t.back_to_store || "Back to Store";`;

if (authJs.includes(oldApply)) {
  authJs = authJs.replace(oldApply, newApply);
  fs.writeFileSync(authJsPath, authJs, 'utf8');
  console.log('Successfully updated auth.js applyAuthModeUi to support active language');
}

// 4. Update admin.html
const adminHtmlPath = path.join(projectDir, 'admin.html');
let adminHtml = fs.readFileSync(adminHtmlPath, 'utf8');

adminHtml = adminHtml.replace('<a href="index.html">Storefront</a>', '<a href="index.html" data-i18n="nav_storefront">Storefront</a>');
adminHtml = adminHtml.replace('<a href="account.html">Account</a>', '<a href="account.html" data-i18n="nav_account">Account</a>');
adminHtml = adminHtml.replace('<a href="orders.html">Orders</a>', '<a href="orders.html" data-i18n="nav_orders">Orders</a>');
adminHtml = adminHtml.replace('<a href="auth.html?mode=admin&redirect=admin-dashboard.html">Admin Sign In</a>', '<a href="auth.html?mode=admin&redirect=admin-dashboard.html" data-i18n="admin_signin_title">Admin Sign In</a>');
adminHtml = adminHtml.replace('<div class="eyebrow">Seller Central</div>', '<div class="eyebrow" data-i18n="seller_central">Seller Central</div>');
adminHtml = adminHtml.replace('<h1>Admin Panel Access</h1>', '<h1 data-i18n="admin_panel_access">Admin Panel Access</h1>');
adminHtml = adminHtml.replace('<p>Manage products, orders, analytics, automation, notifications, and store operations from one dashboard.</p>', '<p data-i18n="admin_panel_desc">Manage products, orders, analytics, automation, notifications, and store operations from one dashboard.</p>');
adminHtml = adminHtml.replace('<a id="adminPrimaryAction" class="primary-btn" href="auth.html?mode=admin&redirect=admin-dashboard.html">Sign In as Admin</a>', '<a id="adminPrimaryAction" class="primary-btn" href="auth.html?mode=admin&redirect=admin-dashboard.html" data-i18n="signin_as_admin">Sign In as Admin</a>');
adminHtml = adminHtml.replace('<a id="adminSecondaryAction" class="secondary-btn" href="account.html">Go to Account</a>', '<a id="adminSecondaryAction" class="secondary-btn" href="account.html" data-i18n="go_to_account">Go to Account</a>');

if (!adminHtml.includes('translations.js')) {
  adminHtml = adminHtml.replace(
    '<script src="admin-portal.js"></script>',
    `<script src="translations.js"></script>
  <script src="admin-portal.js"></script>
  <script>
    document.addEventListener("DOMContentLoaded", () => {
      const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
      if (typeof window.applyFullPageTranslation === "function") {
        window.applyFullPageTranslation(currentLang);
      }
    });
  </script>`
  );
}

fs.writeFileSync(adminHtmlPath, adminHtml, 'utf8');
console.log('Successfully updated admin.html with data-i18n tags and translations.js');
