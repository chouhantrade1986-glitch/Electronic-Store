const fs = require('fs');
const path = require('path');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');

// 1. ALL NEW AND REFINED TRANSLATION KEYS ACROSS ALL 11 LANGUAGES
const MEGA_I18N = {
  en: {
    // Flyout menu keys
    "nav.yourLists": "Your Lists",
    "nav.createWishlist": "Create a Wish List",
    "nav.wishAnyWebsite": "Wish from Any Website",
    "nav.yourSavedItems": "Your Saved Items",
    "nav.discoverStyle": "Discover Your Style",
    "nav.exploreShowroom": "Explore Showroom",
    "footer.wishlist": "Your Wish List",
    "nav.yourRecommendations": "Your Recommendations",
    "dept.pcBuilder": "PC Builder & Custom PC",
    "footer.faq": "FAQ & Help",
    "footer.yourAccount": "Your Account",
    "nav.orders": "Your Orders",
    "category.customerService": "Customer Service",

    // Subcategory drawer keys
    subcat_motherboard: "Motherboard",
    subcat_ram: "Desktop RAM / Memory",
    subcat_cpu: "CPU / Processors",
    subcat_gpu: "Graphics Card / GPU",
    subcat_smps: "Power Supply / SMPS",
    subcat_cabinet: "Cabinet / PC Cases",
    subcat_cooling: "Cabinet Fan & Cooling",
    subcat_pc_tool: "PC Builder Tool",
    subcat_all_components: "All in PC Components",
    subcat_all_laptops: "All Laptops",
    subcat_gaming_laptops: "Gaming Laptops",
    subcat_branded_desktops: "Branded Desktops",
    subcat_barebone_desktops: "Barebone Desktops",
    subcat_all_desktops: "All Desktop Computers",

    // Hero Carousel keys
    just_launched: "Just launched",
    hero_creator_title: "Creator Studio setups built for editing, streaming, and sharper desks",
    explore_creator_studio: "Explore Creator Studio",
    view_featured_pick: "View featured pick",
    todays_headline_offer: "Today's headline offer",
    trending_right_now: "Trending right now",
    deals_fast_checkout: "deals built for fast checkout",
    shop_now_prefix: "Shop",
    live_now: "Live now",
    starting_at: "Starting at",
    top_rating: "Top rating",

    // Product Detail keys
    brand_label: "Brand:",
    visit_store_prefix: "Visit the",
    ratings_label: "ratings",
    about_item: "About this item",
    related_products: "Related products",
    offers_benefits: "Offers & Benefits",
    bank_offer: "Bank Offer",
    no_cost_emi: "No Cost EMI",
    exchange_offer: "Exchange Offer",
    partner_offer: "Partner Offer",
    delivery_returns_services: "Delivery, Returns & Services",
    warranty_label: "Warranty",
    seller_label: "Seller",
    customer_reviews_title: "Customer Reviews",
    questions_answers: "Questions & Answers",
    product_information: "Product information",
    save_to_wishlist: "Save to Wishlist",
    back_to_products: "Back to products",
    secure_transaction: "Secure transaction",
    add_to_cart: "Add to Cart",
    buy_now: "Buy Now",
    out_of_stock: "Out of Stock",
    in_stock: "In Stock",
    currently_unavailable: "Currently unavailable",
    qty_label: "Qty:",
    free_delivery_tomorrow: "FREE delivery by tomorrow",
    you_save: "You save",
    mrp_label: "M.R.P.:"
  },
  hi: {
    // Flyout menu keys
    "nav.yourLists": "आपकी सूचियां",
    "nav.createWishlist": "विशलिस्ट बनाएं",
    "nav.wishAnyWebsite": "यूनिवर्सल विशलिस्ट",
    "nav.yourSavedItems": "सहेजे गए आइटम",
    "nav.discoverStyle": "डिस्कवर स्टाइल",
    "nav.exploreShowroom": "शोरूम एक्सप्लोर करें",
    "footer.wishlist": "आपकी विशलिस्ट",
    "nav.yourRecommendations": "आपकी सिफारिशें",
    "dept.pcBuilder": "पीसी बिल्डर",
    "footer.faq": "अक्सर पूछे जाने वाले प्रश्न (FAQ)",
    "footer.yourAccount": "आपका अकाउंट",
    "nav.orders": "आपके ऑर्डर",
    "category.customerService": "ग्राहक सेवा",

    // Subcategory drawer keys
    subcat_motherboard: "मदरबोर्ड",
    subcat_ram: "डेस्कटॉप रैम / मेमोरी",
    subcat_cpu: "सीपीयू / प्रोसेसर",
    subcat_gpu: "ग्राफिक्स कार्ड / जीपीयू",
    subcat_smps: "पावर सप्लाई / एसएमपीएस",
    subcat_cabinet: "कैबिनेट / पीसी केस",
    subcat_cooling: "कैबिनेट फैन और कूलिंग",
    subcat_pc_tool: "पीसी बिल्डर टूल",
    subcat_all_components: "पीसी कंपोनेंट्स में सभी देखें",
    subcat_all_laptops: "सभी लैपटॉप",
    subcat_gaming_laptops: "गेमिंग लैपटॉप",
    subcat_branded_desktops: "ब्रांडेड डेस्कटॉप",
    subcat_barebone_desktops: "बेयरबोन डेस्कटॉप",
    subcat_all_desktops: "सभी डेस्कटॉप कंप्यूटर",

    // Hero Carousel keys
    just_launched: "अभी लॉन्च हुआ",
    hero_creator_title: "एडिटिंग, स्ट्रीमिंग और बेहतर वर्कस्पेस के लिए क्रिएटर स्टूडियो सेटअप",
    explore_creator_studio: "क्रिएटर स्टूडियो एक्सप्लोर करें",
    view_featured_pick: "विशेष चयन देखें",
    todays_headline_offer: "आज का मुख्य ऑफर",
    trending_right_now: "अभी ट्रेंडिंग में",
    deals_fast_checkout: "डील्स तेज़ चेकआउट के लिए तैयार",
    shop_now_prefix: "खरीदें",
    live_now: "अभी लाइव",
    starting_at: "शुरुआती कीमत",
    top_rating: "शीर्ष रेटिंग",

    // Product Detail keys
    brand_label: "ब्रांड:",
    visit_store_prefix: "स्टोर पर जाएं:",
    ratings_label: "रेटिंग",
    about_item: "इस उत्पाद के बारे में",
    related_products: "संबंधित उत्पाद",
    offers_benefits: "ऑफ़र और लाभ",
    bank_offer: "बैंक ऑफ़र",
    no_cost_emi: "नो कॉस्ट ईएमआई",
    exchange_offer: "एक्सचेंज ऑफ़र",
    partner_offer: "पार्टनर ऑफ़र",
    delivery_returns_services: "डिलीवरी, रिटर्न और सेवाएं",
    warranty_label: "वारंटी",
    seller_label: "विक्रेता",
    customer_reviews_title: "ग्राहक समीक्षाएं",
    questions_answers: "प्रश्न और उत्तर",
    product_information: "उत्पाद जानकारी",
    save_to_wishlist: "विशलिस्ट में सहेजें",
    back_to_products: "उत्पादों पर वापस जाएं",
    secure_transaction: "सुरक्षित लेन-देन",
    add_to_cart: "कार्ट में जोड़ें",
    buy_now: "अभी खरीदें",
    out_of_stock: "स्टॉक में नहीं है",
    in_stock: "स्टॉक में है",
    currently_unavailable: "वर्तमान में अनुपलब्ध",
    qty_label: "मात्रा:",
    free_delivery_tomorrow: "मुफ़्त डिलीवरी कल तक",
    you_save: "बचत:",
    mrp_label: "एम.आर.पी.:"
  },
  ta: {
    "nav.yourLists": "உங்கள் பட்டியல்கள்",
    "nav.createWishlist": "விருப்பப்பட்டியலை உருவாக்கவும்",
    "nav.wishAnyWebsite": "யுனிவர்சல் விருப்பப்பட்டியல்",
    "nav.yourSavedItems": "சேமிக்கப்பட்ட பொருட்கள்",
    "nav.discoverStyle": "உங்கள் பாணியைக் கண்டறியவும்",
    "nav.exploreShowroom": "ஷோரூமை ஆராயவும்",
    "footer.wishlist": "உங்கள் விருப்பப்பட்டியல்",
    "nav.yourRecommendations": "உங்கள் பரிந்துரைகள்",
    "dept.pcBuilder": "பிசி பில்டர்",
    "footer.faq": "அடிக்கடி கேட்கப்படும் கேள்விகள் (FAQ)",
    "footer.yourAccount": "உங்கள் கணக்கு",
    "nav.orders": "உங்கள் ஆர்டர்கள்",
    "category.customerService": "வாடிக்கையாளர் சேவை",

    subcat_motherboard: "மதர்போர்டு",
    subcat_ram: "டெஸ்க்டாப் ரேம் / நினைவகம்",
    subcat_cpu: "சிபியூ / செயலிகள்",
    subcat_gpu: "கிராபிக்ஸ் கார்டு / ஜிபியூ",
    subcat_smps: "பவர் சப்ளை / எஸ்எம்பிஎஸ்",
    subcat_cabinet: "கேபினெட் / பிசி கேஸ்",
    subcat_cooling: "கேபினெட் ஃபேன் & கூலிங்",
    subcat_pc_tool: "பிசி பில்டர் கருவி",
    subcat_all_components: "பிசி பாகங்களில் அனைத்தும்",
    subcat_all_laptops: "அனைத்து லேப்டாப்கள்",
    subcat_gaming_laptops: "கேமிங் லேப்டாப்கள்",
    subcat_branded_desktops: "பிராண்டட் டெஸ்க்டாப்கள்",
    subcat_barebone_desktops: "பேர்போன் டெஸ்க்டாப்கள்",
    subcat_all_desktops: "அனைத்து டெஸ்க்டாப் கணினிகள்",

    just_launched: "இப்போது அறிமுகப்படுத்தப்பட்டது",
    hero_creator_title: "கிரியேட்டர் ஸ்டுடியோ செட்டப்கள்",
    explore_creator_studio: "கிரியேட்டர் ஸ்டுடியோவை ஆராயுங்கள்",
    view_featured_pick: "சிறப்பு தேர்வைப் பார்க்கவும்",
    todays_headline_offer: "இன்றைய முக்கிய சலுகை",
    trending_right_now: "இப்போது டிரெண்டிங்",
    deals_fast_checkout: "வேகமான செக்அவுட் சலுகைகள்",
    shop_now_prefix: "வாங்கவும்",
    live_now: "நேரலை",
    starting_at: "தொடக்க விலை",
    top_rating: "சிறந்த மதிப்பீடு",

    brand_label: "பிராண்ட்:",
    visit_store_prefix: "ஸ்டோருக்குச் செல்லவும்:",
    ratings_label: "மதிப்பீடுகள்",
    about_item: "இந்த பொருளைப் பற்றி",
    related_products: "தொடர்புடைய தயாரிப்புகள்",
    offers_benefits: "சலுகைகள் மற்றும் நன்மைகள்",
    bank_offer: "வங்கி சலுகை",
    no_cost_emi: "நோ காஸ்ட் இஎம்ஐ",
    exchange_offer: "பரிமாற்ற சலுகை",
    partner_offer: "கூட்டாளர் சலுகை",
    delivery_returns_services: "டெலிவரி, ரிட்டர்ன்ஸ் & சேவைகள்",
    warranty_label: "உத்தரவாதம்",
    seller_label: "விற்பனையாளர்",
    customer_reviews_title: "வாடிக்கையாளர் மதிப்புரைகள்",
    questions_answers: "கேள்விகள் மற்றும் பதில்கள்",
    product_information: "தயாரிப்பு தகவல்",
    save_to_wishlist: "விருப்பப்பட்டியலில் சேமிக்கவும்",
    back_to_products: "தயாரிப்புகளுக்குத் திரும்புக",
    secure_transaction: "பாதுகாப்பான பரிவர்த்தனை",
    add_to_cart: "கார்ட்டில் சேர்க்கவும்",
    buy_now: "இப்போது வாங்கவும்",
    out_of_stock: "கையிருப்பில் இல்லை",
    in_stock: "கையிருப்பில் உள்ளது",
    currently_unavailable: "தற்போது கிடைக்கவில்லை",
    qty_label: "அளவு:",
    free_delivery_tomorrow: "நாளைக்குள் இலவச டெலிவரி",
    you_save: "சேமிப்பு:",
    mrp_label: "எம்.ஆர்.பி.:"
  },
  te: {
    "nav.yourLists": "మీ జాబితాలు",
    "nav.createWishlist": "విష్‌లిస్ట్‌ను సృష్టించండి",
    "nav.wishAnyWebsite": "యూనివర్సల్ విష్‌లిస్ట్",
    "nav.yourSavedItems": "సేవ్ చేసిన అంశాలు",
    "nav.discoverStyle": "మీ శైలిని కనుగొనండి",
    "nav.exploreShowroom": "షోరూమ్‌ను అన్వేషించండి",
    "footer.wishlist": "మీ విష్‌లిస్ట్",
    "nav.yourRecommendations": "మీ సిఫార్సులు",
    "dept.pcBuilder": "పీసీ బిల్డర్",
    "footer.faq": "తరచుగా అడిగే ప్రశ్నలు (FAQ)",
    "footer.yourAccount": "మీ ఖాతా",
    "nav.orders": "మీ ఆర్డర్లు",
    "category.customerService": "కస్టమర్ సర్వీస్",

    subcat_motherboard: "మదర్‌బోర్డ్",
    subcat_ram: "డెస్క్‌టాప్ ర్యామ్ / మెమరీ",
    subcat_cpu: "సీపీయూ / ప్రాసెసర్లు",
    subcat_gpu: "గ్రాఫిక్స్ కార్డ్ / జీపీయూ",
    subcat_smps: "పవర్ సప్లై / ఎస్‌ఎమ్‌పీఎస్",
    subcat_cabinet: "క్యాబినెట్ / పీసీ కేసులు",
    subcat_cooling: "క్యాబినెట్ ఫ్యాన్ & కూలింగ్",
    subcat_pc_tool: "పీసీ బిల్డర్ టూల్",
    subcat_all_components: "పీసీ భాగాలలో అన్నీ చూడండి",
    subcat_all_laptops: "అన్ని ల్యాప్‌టాప్‌లు",
    subcat_gaming_laptops: "గేమింగ్ ల్యాప్‌టాప్‌లు",
    subcat_branded_desktops: "బ్రాండెడ్ డెస్క్‌టాప్‌లు",
    subcat_barebone_desktops: "బేర్‌బోన్ డెస్క్‌టాప్‌లు",
    subcat_all_desktops: "అన్ని డెస్క్‌టాప్ కంప్యూటర్లు",

    just_launched: "ఇప్పుడే ప్రారంభించబడింది",
    hero_creator_title: "క్రియేటర్ స్టూడియో సెటప్‌లు",
    explore_creator_studio: "క్రియేటర్ స్టూడియోను అన్వేషించండి",
    view_featured_pick: "ఫీచర్ చేసిన ఎంపికను చూడండి",
    todays_headline_offer: "నేటి ప్రధాన ఆఫర్",
    trending_right_now: "ఇప్పుడు ట్రెండింగ్",
    deals_fast_checkout: "వేగవంతమైన చెక్అవుట్ డీల్స్",
    shop_now_prefix: "షాపింగ్ చేయండి",
    live_now: "లైవ్ నౌ",
    starting_at: "ప్రారంభ ధర",
    top_rating: "అత్యుత్తమ రేటింగ్",

    brand_label: "బ్రాండ్:",
    visit_store_prefix: "స్టోర్‌ను సందర్శించండి:",
    ratings_label: "రేటింగ్‌లు",
    about_item: "ఈ అంశం గురించి",
    related_products: "సంబంధిత ఉత్పత్తులు",
    offers_benefits: "ఆఫర్లు & ప్రయోజనాలు",
    bank_offer: "బ్యాంక్ ఆఫర్",
    no_cost_emi: "నో కాస్ట్ ఈఎమ్ఐ",
    exchange_offer: "ఎక్స్ఛేంజ్ ఆఫర్",
    partner_offer: "భాగస్వామి ఆఫర్",
    delivery_returns_services: "డెలివరీ, రిటర్న్స్ & సేవలు",
    warranty_label: "వారంటీ",
    seller_label: "విక్రేత",
    customer_reviews_title: "కస్టమర్ సమీక్షలు",
    questions_answers: "ప్రశ్నలు & సమాధానాలు",
    product_information: "ఉత్పత్తి సమాచారం",
    save_to_wishlist: "విష్‌లిస్ట్‌లో సేవ్ చేయండి",
    back_to_products: "ఉత్పత్తులకు తిరిగి వెళ్ళు",
    secure_transaction: "సురక్షిత లావాదేవీ",
    add_to_cart: "కార్ట్‌కు జోడించండి",
    buy_now: "ఇప్పుడే కొనండి",
    out_of_stock: "అందుబాటులో లేదు",
    in_stock: "స్టాక్‌లో ఉంది",
    currently_unavailable: "ప్రస్తుతం అందుబాటులో లేదు",
    qty_label: "పరిమాణం:",
    free_delivery_tomorrow: "రేపటిలోగా ఉచిత డెలివరీ",
    you_save: "పొదుపు:",
    mrp_label: "ఎమ్.ఆర్.పి.:"
  },
  kn: {
    "nav.yourLists": "ನಿಮ್ಮ ಪಟ್ಟಿಗಳು",
    "nav.createWishlist": "ವಿಶ್‌ಲಿಸ್ಟ್ ರಚಿಸಿ",
    "nav.wishAnyWebsite": "ಸಾರ್ವತ್ರಿಕ ವಿಶ್‌ಲಿಸ್ಟ್",
    "nav.yourSavedItems": "ಉಳಿಸಿದ ವಸ್ತುಗಳು",
    "nav.discoverStyle": "ನಿಮ್ಮ ಶೈಲಿಯನ್ನು ಅನ್ವೇಷಿಸಿ",
    "nav.exploreShowroom": "ಶೋರೂಮ್ ಅನ್ವೇಷಿಸಿ",
    "footer.wishlist": "ನಿಮ್ಮ ವಿಶ್‌ಲಿಸ್ಟ್",
    "nav.yourRecommendations": "ನಿಮ್ಮ ಶಿಫಾರಸುಗಳು",
    "dept.pcBuilder": "ಪಿಸಿ ಬಿಲ್ಡರ್",
    "footer.faq": "ಪದೇ ಪದೇ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು (FAQ)",
    "footer.yourAccount": "ನಿಮ್ಮ ಖಾತೆ",
    "nav.orders": "ನಿಮ್ಮ ಆದೇಶಗಳು",
    "category.customerService": "ಗ್ರಾಹಕ ಸೇವೆ",

    subcat_motherboard: "ಮದರ್‌ಬೋರ್ಡ್",
    subcat_ram: "ಡೆಸ್ಕ್‌ಟಾಪ್ RAM / ಮೆಮೊರಿ",
    subcat_cpu: "CPU / ಪ್ರೊಸೆಸರ್‌ಗಳು",
    subcat_gpu: "ಗ್ರಾಫಿಕ್ಸ್ ಕಾರ್ಡ್ / GPU",
    subcat_smps: "ಪವರ್ ಸಪ್ಲೈ / SMPS",
    subcat_cabinet: "ಕ್ಯಾಬಿನೆಟ್ / ಪಿಸಿ ಕೇಸ್‌ಗಳು",
    subcat_cooling: "ಕ್ಯಾಬಿನೆಟ್ ಫ್ಯಾನ್ ಮತ್ತು ಕೂಲಿಂಗ್",
    subcat_pc_tool: "ಪಿಸಿ ಬಿಲ್ಡರ್ ಟೂಲ್",
    subcat_all_components: "ಪಿಸಿ ಬಿಡಿಭಾಗಗಳಲ್ಲಿ ಎಲ್ಲವನ್ನೂ ನೋಡಿ",
    subcat_all_laptops: "ಎಲ್ಲಾ ಲ್ಯಾಪ್‌ಟಾಪ್‌ಗಳು",
    subcat_gaming_laptops: "ಗೇಮಿಂಗ್ ಲ್ಯಾಪ್‌ಟಾಪ್‌ಗಳು",
    subcat_branded_desktops: "ಬ್ರಾಂಡೆಡ್ ಡೆಸ್ಕ್‌ಟಾಪ್‌ಗಳು",
    subcat_barebone_desktops: "ಬೇರ್‌ಬೋನ್ ಡೆಸ್ಕ್‌ಟಾಪ್‌ಗಳು",
    subcat_all_desktops: "ಎಲ್ಲಾ ಡೆಸ್ಕ್‌ಟಾಪ್ ಕಂಪ್ಯೂಟರ್‌ಗಳು",

    just_launched: "ಈಗಷ್ಟೇ ಬಿಡುಗಡೆಯಾಗಿದೆ",
    hero_creator_title: "ಕ್ರಿಯೇಟರ್ ಸ್ಟುಡಿಯೋ ಸೆಟಪ್‌ಗಳು",
    explore_creator_studio: "ಕ್ರಿಯೇಟರ್ ಸ್ಟುಡಿಯೋ ಅನ್ವೇಷಿಸಿ",
    view_featured_pick: "ವಿಶೇಷ ಆಯ್ಕೆಯನ್ನು ವೀಕ್ಷಿಸಿ",
    todays_headline_offer: "ಇಂದಿನ ಪ್ರಮುಖ ಕೊಡುಗೆ",
    trending_right_now: "ಈಗ ಟ್ರೆಂಡಿಂಗ್",
    deals_fast_checkout: "ವೇಗದ ಚೆಕ್‌ಔಟ್ ಡೀಲ್‌ಗಳು",
    shop_now_prefix: "ಖರೀದಿಸಿ",
    live_now: "ಈಗ ಲೈವ್",
    starting_at: "ಆರಂಭಿಕ ಬೆಲೆ",
    top_rating: "ಉನ್ನತ ರೇಟಿಂಗ್",

    brand_label: "ಬ್ರ್ಯಾಂಡ್:",
    visit_store_prefix: "ಅಂಗಡಿಗೆ ಭೇಟಿ ನೀಡಿ:",
    ratings_label: "ರೇಟಿಂಗ್‌ಗಳು",
    about_item: "ಈ ವಸ್ತುವಿನ ಬಗ್ಗೆ",
    related_products: "ಸಂಬಂಧಿತ ಉತ್ಪನ್ನಗಳು",
    offers_benefits: "ಕೊಡುಗೆಗಳು ಮತ್ತು ಪ್ರಯೋಜನಗಳು",
    bank_offer: "ಬ್ಯಾಂಕ್ ಕೊಡುಗೆ",
    no_cost_emi: "ನೋ ಕಾಸ್ಟ್ ಇಎಂಐ",
    exchange_offer: "ಎಕ್ಸ್‌ಚೇಂಜ್ ಕೊಡುಗೆ",
    partner_offer: "ಪಾಲುದಾರ ಕೊಡುಗೆ",
    delivery_returns_services: "ವಿತರಣೆ, ರಿಟರ್ನ್ಸ್ ಮತ್ತು ಸೇವೆಗಳು",
    warranty_label: "ಖಾತರಿ",
    seller_label: "ಮಾರಾಟಗಾರ",
    customer_reviews_title: "ಗ್ರಾಹಕರ ವಿಮರ್ಶೆಗಳು",
    questions_answers: "ಪ್ರಶ್ನೆಗಳು ಮತ್ತು ಉತ್ತರಗಳು",
    product_information: "ಉತ್ಪನ್ನ ಮಾಹಿತಿ",
    save_to_wishlist: "ವಿಶ್‌ಲಿಸ್ಟ್‌ಗೆ ಉಳಿಸಿ",
    back_to_products: "ಉತ್ಪನ್ನಗಳಿಗೆ ಹಿಂತಿರುಗಿ",
    secure_transaction: "ಸುರಕ್ಷಿತ ವಹಿವಾಟು",
    add_to_cart: "ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ",
    buy_now: "ಈಗ ಖರೀದಿಸಿ",
    out_of_stock: "ಲಭ್ಯವಿಲ್ಲ",
    in_stock: "ಸ್ಟಾಕ್‌ನಲ್ಲಿದೆ",
    currently_unavailable: "ಪ್ರಸ್ತುತ ಲಭ್ಯವಿಲ್ಲ",
    qty_label: "ಪ್ರಮಾಣ:",
    free_delivery_tomorrow: "ನಾಳೆಯೊಳಗೆ ಉಚಿತ ವಿತರಣೆ",
    you_save: "ಉಳಿತಾಯ:",
    mrp_label: "ಎಂ.ಆರ್.ಪಿ.:"
  },
  ml: {
    "nav.yourLists": "നിങ്ങളുടെ ലിസ്റ്റുകൾ",
    "nav.createWishlist": "വിഷ്‌ലിസ്റ്റ് സൃഷ്ടിക്കുക",
    "nav.wishAnyWebsite": "യൂണിവേഴ്സൽ വിഷ്‌ലിസ്റ്റ്",
    "nav.yourSavedItems": "സംരക്ഷിച്ച ഇനങ്ങൾ",
    "nav.discoverStyle": "നിങ്ങളുടെ ശൈലി കണ്ടെത്തുക",
    "nav.exploreShowroom": "ഷോറൂം പര്യവേക്ഷണം ചെയ്യുക",
    "footer.wishlist": "നിങ്ങളുടെ വിഷ്‌ലിസ്റ്റ്",
    "nav.yourRecommendations": "നിങ്ങളുടെ ശുപാർശകൾ",
    "dept.pcBuilder": "പിസി ബിൽഡർ",
    "footer.faq": "പതിവായി ചോദിക്കുന്ന ചോദ്യങ്ങൾ (FAQ)",
    "footer.yourAccount": "നിങ്ങളുടെ അക്കൗണ്ട്",
    "nav.orders": "നിങ്ങളുടെ ഓർഡറുകൾ",
    "category.customerService": "ഉപഭോക്തൃ സേവനം",

    subcat_motherboard: "മദർബോർഡ്",
    subcat_ram: "ഡെസ്ക്ടോപ്പ് റാം / മെമ്മറി",
    subcat_cpu: "സിപിയു / പ്രൊസസ്സറുകൾ",
    subcat_gpu: "ഗ്രാഫിക്സ് കാർഡ് / ജിപിയു",
    subcat_smps: "പവർ സപ്ലൈ / എസ്എംപിഎസ്",
    subcat_cabinet: "കാബിനറ്റ് / പിസി കേസുകൾ",
    subcat_cooling: "കാബിനറ്റ് ഫാൻ & കൂളിംഗ്",
    subcat_pc_tool: "പിസി ബിൽഡർ ടൂൾ",
    subcat_all_components: "പിസി ഭാഗങ്ങളിൽ എല്ലാം കാണുക",
    subcat_all_laptops: "എല്ലാ ലാപ്‌ടോപ്പുകളും",
    subcat_gaming_laptops: "ഗെയിമിംഗ് ലാപ്‌ടോപ്പുകൾ",
    subcat_branded_desktops: "ബ്രാൻഡഡ് ഡെസ്‌ക്‌ടോപ്പുകൾ",
    subcat_barebone_desktops: "ബെയർബോൺ ഡെസ്‌ക്‌ടോപ്പുകൾ",
    subcat_all_desktops: "എല്ലാ ഡെസ്ക്ടോപ്പ് കമ്പ്യൂട്ടറുകളും",

    just_launched: "പുതിയത്",
    hero_creator_title: "ക്രിയേറ്റർ സ്റ്റുഡിയോ സെറ്റപ്പുകൾ",
    explore_creator_studio: "ക്രിയേറ്റർ സ്റ്റുഡിയോ കാണുക",
    view_featured_pick: "തിരഞ്ഞെടുത്ത ഇനം കാണുക",
    todays_headline_offer: "ഇന്നത്തെ പ്രധാന ഓഫർ",
    trending_right_now: "ട്രെൻഡിംഗ്",
    deals_fast_checkout: "വേഗത്തിലുള്ള ചെക്ക്ഔട്ട് ഡീലുകൾ",
    shop_now_prefix: "വാങ്ങുക",
    live_now: "ലൈവ്",
    starting_at: "തുടക്കത്തിൽ",
    top_rating: "മികച്ച റേറ്റിംഗ്",

    brand_label: "ബ്രാൻഡ്:",
    visit_store_prefix: "സ്റ്റോർ സന്ദർശിക്കുക:",
    ratings_label: "റേറ്റിംഗുകൾ",
    about_item: "ഈ ഇനത്തെക്കുറിച്ച്",
    related_products: "ബന്ധപ്പെട്ട ഉൽപ്പന്നങ്ങൾ",
    offers_benefits: "ഓഫറുകളും ആനുകൂല്യങ്ങളും",
    bank_offer: "ബാങ്ക് ഓഫർ",
    no_cost_emi: "നോ കോസ്റ്റ് ഇഎംഐ",
    exchange_offer: "എക്സ്ചേഞ്ച് ഓഫർ",
    partner_offer: "പങ്കാളിത്ത ഓഫർ",
    delivery_returns_services: "ഡെലിവറി, റിട്ടേൺസ് & സേവനങ്ങൾ",
    warranty_label: "വാറന്റി",
    seller_label: "വിൽപ്പനക്കാരൻ",
    customer_reviews_title: "ഉപഭോക്തൃ അവലോകനങ്ങൾ",
    questions_answers: "ചോദ്യോത്തരങ്ങൾ",
    product_information: "ഉൽപ്പന്ന വിവരങ്ങൾ",
    save_to_wishlist: "വിഷ്‌ലിസ്റ്റിൽ സംരക്ഷിക്കുക",
    back_to_products: "ഉൽപ്പന്നങ്ങളിലേക്ക് മടങ്ങുക",
    secure_transaction: "സുരക്ഷിത ഇടപാട്",
    add_to_cart: "കാർട്ടിലേക്ക് ചേർക്കുക",
    buy_now: "ഇപ്പോൾ വാങ്ങുക",
    out_of_stock: "സ്റ്റോക്കില്ല",
    in_stock: "സ്റ്റോക്കുണ്ട്",
    currently_unavailable: "നിലവിൽ ലഭ്യമല്ല",
    qty_label: "അളവ്:",
    free_delivery_tomorrow: "നാളെ സൗജന്യ ഡെലിവറി",
    you_save: "ലാഭം:",
    mrp_label: "എം.ആർ.പി.:"
  },
  bn: {
    "nav.yourLists": "আপনার তালিকা",
    "nav.createWishlist": "উইশলিস্ট তৈরি করুন",
    "nav.wishAnyWebsite": "ইউনিভার্সাল উইশলিস্ট",
    "nav.yourSavedItems": "সংরক্ষিত আইটেম",
    "nav.discoverStyle": "আপনার স্টাইল আবিষ্কার করুন",
    "nav.exploreShowroom": "শোরুম ঘুরে দেখুন",
    "footer.wishlist": "আপনার উইশলিস্ট",
    "nav.yourRecommendations": "আপনার সুপারিশ",
    "dept.pcBuilder": "পিসি বিল্ডার",
    "footer.faq": "প্রায়শই জিজ্ঞাসিত প্রশ্নাবলী (FAQ)",
    "footer.yourAccount": "আপনার অ্যাকাউন্ট",
    "nav.orders": "আপনার অর্ডার",
    "category.customerService": "গ্রাহক পরিষেবা",

    subcat_motherboard: "মাদারবোর্ড",
    subcat_ram: "ডেস্কটপ র‍্যাম / মেমোরি",
    subcat_cpu: "সিপিইউ / প্রসেসর",
    subcat_gpu: "গ্রাফিক্স কার্ড / জিপিইউ",
    subcat_smps: "পাওয়ার সাপ্লাই / এসএমপিএস",
    subcat_cabinet: "ক্যাবিনেট / পিসি কেস",
    subcat_cooling: "ক্যাবিনেট ফ্যান ও কুলিং",
    subcat_pc_tool: "পিসি বিল্ডার টুল",
    subcat_all_components: "পিসি উপাদান সব দেখুন",
    subcat_all_laptops: "সমস্ত ল্যাপটপ",
    subcat_gaming_laptops: "গেমিং ল্যাপটপ",
    subcat_branded_desktops: "ব্র্যান্ডেড ডেস্কটপ",
    subcat_barebone_desktops: "বেয়ারবোন ডেস্কটপ",
    subcat_all_desktops: "সমস্ত ডেস্কটপ কম্পিউটার",

    just_launched: "নতুন লঞ্চ",
    hero_creator_title: "ক্রিয়েটর স্টুডিও সেটআপ",
    explore_creator_studio: "ক্রিয়েটর স্টুডিও ঘুরে দেখুন",
    view_featured_pick: "নির্বাচিত পণ্য দেখুন",
    todays_headline_offer: "আজকের মূল অফার",
    trending_right_now: "এখন ট্রেন্ডিং",
    deals_fast_checkout: "দ্রুত চেকআউট ডিল",
    shop_now_prefix: "কিনুন",
    live_now: "লাইভ",
    starting_at: "শুরু",
    top_rating: "শীর্ষ রেটিং",

    brand_label: "ব্র্যান্ড:",
    visit_store_prefix: "স্টোরে যান:",
    ratings_label: "রেটিং",
    about_item: "এই আইটেমটি সম্পর্কে",
    related_products: "সম্পর্কিত পণ্য",
    offers_benefits: "অফার ও সুবিধাসমূহ",
    bank_offer: "ব্যাংক অফার",
    no_cost_emi: "নো কস্ট ইএমআই",
    exchange_offer: "এক্সচেঞ্জ অফার",
    partner_offer: "পার্টনার অফার",
    delivery_returns_services: "ডেলিভারি, রিটার্ন ও পরিষেবা",
    warranty_label: "ওয়ারেন্টি",
    seller_label: "বিক্রেতা",
    customer_reviews_title: "গ্রাহক পর্যালোচনা",
    questions_answers: "প্রশ্ন ও উত্তর",
    product_information: "পণ্য তথ্য",
    save_to_wishlist: "উইশলিস্টে সংরক্ষণ করুন",
    back_to_products: "পণ্যে ফিরে যান",
    secure_transaction: "নিরাপদ লেনদেন",
    add_to_cart: "কার্টে যোগ করুন",
    buy_now: "এখনই কিনুন",
    out_of_stock: "স্টকে নেই",
    in_stock: "স্টকে আছে",
    currently_unavailable: "বর্তমানে অনুপলব্ধ",
    qty_label: "পরিমাণ:",
    free_delivery_tomorrow: "আগামীকালের মধ্যে বিনামূল্যে ডেলিভারি",
    you_save: "সঞ্চয়:",
    mrp_label: "এম.আর.পি.:"
  },
  mr: {
    "nav.yourLists": "आपल्या याद्या",
    "nav.createWishlist": "विशलिस्ट तयार करा",
    "nav.wishAnyWebsite": "युनिव्हर्सल विशलिस्ट",
    "nav.yourSavedItems": "जतन केलेल्या वस्तू",
    "nav.discoverStyle": "आपली शैली शोधा",
    "nav.exploreShowroom": "शोरूम एक्सप्लोर करा",
    "footer.wishlist": "आपली विशलिस्ट",
    "nav.yourRecommendations": "आपल्या शिफारसी",
    "dept.pcBuilder": "पीसी बिल्डर",
    "footer.faq": "वारंवार विचारले जाणारे प्रश्न (FAQ)",
    "footer.yourAccount": "आपले खाते",
    "nav.orders": "आपल्या ऑर्डर्स",
    "category.customerService": "ग्राहक सेवा",

    subcat_motherboard: "मदरबोर्ड",
    subcat_ram: "डेस्कटॉप रॅम / मेमरी",
    subcat_cpu: "सीपीयू / प्रोसेसर",
    subcat_gpu: "ग्राफिक्स कार्ड / जीपीयू",
    subcat_smps: "पॉवर सप्लाय / एसएमपीएस",
    subcat_cabinet: "कॅबिनेट / पीसी केसेस",
    subcat_cooling: "कॅबिनेट फॅन आणि कूलिंग",
    subcat_pc_tool: "पीसी बिल्डर साधन",
    subcat_all_components: "पीसी कॉम्पोनंट्समध्ये सर्व पहा",
    subcat_all_laptops: "सर्व लॅपटॉप",
    subcat_gaming_laptops: "गेमिंग लॅपटॉप",
    subcat_branded_desktops: "ब्रँडेड डेस्कटॉप",
    subcat_barebone_desktops: "बेअरबोन डेस्कटॉप",
    subcat_all_desktops: "सर्व डेस्कटॉप संगणक",

    just_launched: "नुकतेच लाँच झाले",
    hero_creator_title: "क्रिएटर स्टुडिओ सेटअप्स",
    explore_creator_studio: "क्रिएटर स्टुडिओ एक्सप्लोर करा",
    view_featured_pick: "वैशिष्ट्यीकृत निवड पहा",
    todays_headline_offer: "आजची मुख्य ऑफर",
    trending_right_now: "सध्या ट्रेंडिंग",
    deals_fast_checkout: "वेगवान चेकआउट डील्स",
    shop_now_prefix: "खरेदी करा",
    live_now: "थेट उपलब्ध",
    starting_at: "किंमत सुरू",
    top_rating: "अव्वल रेटिंग",

    brand_label: "ब्रँड:",
    visit_store_prefix: "स्टोअरला भेट द्या:",
    ratings_label: "रेटिंग्ज",
    about_item: "या उत्पादनाविषयी",
    related_products: "संबंधित उत्पादने",
    offers_benefits: "ऑफर आणि फायदे",
    bank_offer: "बँक ऑफर",
    no_cost_emi: "नो कॉस्ट ईएमआय",
    exchange_offer: "एक्सचेंज ऑफर",
    partner_offer: "पार्टनर ऑफर",
    delivery_returns_services: "डिलिव्हरी, परतावा आणि सेवा",
    warranty_label: "वारंटी",
    seller_label: "विक्रेता",
    customer_reviews_title: "ग्राहक पुनरावलोकने",
    questions_answers: "प्रश्न आणि उत्तरे",
    product_information: "उत्पादन माहिती",
    save_to_wishlist: "विशलिस्टमध्ये जतन करा",
    back_to_products: "उत्पादनांवर परत जा",
    secure_transaction: "सुरक्षित व्यवहार",
    add_to_cart: "कार्टमध्ये जोडा",
    buy_now: "आता खरेदी करा",
    out_of_stock: "स्टॉकमध्ये नाही",
    in_stock: "स्टॉकमध्ये आहे",
    currently_unavailable: "सध्या अनुपलब्ध",
    qty_label: "प्रमाण:",
    free_delivery_tomorrow: "उद्यापर्यंत मोफत डिलिव्हरी",
    you_save: "बचत:",
    mrp_label: "एम.आर.पी.:"
  },
  ur: {
    "nav.yourLists": "آپ کی فہرستیں",
    "nav.createWishlist": "خواہشات کی فہرست بنائیں",
    "nav.wishAnyWebsite": "یونیورسل فہرست",
    "nav.yourSavedItems": "محفوظ کردہ اشیاء",
    "nav.discoverStyle": "اپنا انداز دریافت کریں",
    "nav.exploreShowroom": "شوروم دیکھیں",
    "footer.wishlist": "آپ کی خواہشات کی فہرست",
    "nav.yourRecommendations": "آپ کی سفارشات",
    "dept.pcBuilder": "پی سی بلڈر",
    "footer.faq": "اکثر پوچھے جانے والے سوالات (FAQ)",
    "footer.yourAccount": "آپ کا اکاؤنٹ",
    "nav.orders": "آپ کے آرڈرز",
    "category.customerService": "کسٹمر سروس",

    subcat_motherboard: "مدر بورڈ",
    subcat_ram: "ڈیسک ٹاپ ریم / میموری",
    subcat_cpu: "سی پی یو / پروسیسرز",
    subcat_gpu: "گرافکس کارڈ / جی پی یو",
    subcat_smps: "پاور سپلائی / ایس ایم پی ایس",
    subcat_cabinet: "کابینہ / پی سی کیسز",
    subcat_cooling: "کابینہ پنکھا اور کولنگ",
    subcat_pc_tool: "پی سی بلڈر ٹول",
    subcat_all_components: "پی سی کے تمام پرزے دیکھیں",
    subcat_all_laptops: "تمام لیپ ٹاپ",
    subcat_gaming_laptops: "گیمنگ لیپ ٹاپ",
    subcat_branded_desktops: "برانڈڈ ڈیسک ٹاپ",
    subcat_barebone_desktops: "بیئربن ڈیسک ٹاپ",
    subcat_all_desktops: "تمام ڈیسک ٹاپ کمپیوٹرز",

    just_launched: "نیا لانچ ہوا",
    hero_creator_title: "کریئیٹر اسٹوڈیو سیٹ اپ",
    explore_creator_studio: "کریئیٹر اسٹوڈیو دریافت کریں",
    view_featured_pick: "نمایاں پروڈکٹ دیکھیں",
    todays_headline_offer: "آج کی بڑی پیشکش",
    trending_right_now: "ابھی ٹرینڈنگ",
    deals_fast_checkout: "تیز چیک آؤٹ ڈیلز",
    shop_now_prefix: "خریداری کریں",
    live_now: "لائیو",
    starting_at: "شروع سے",
    top_rating: "اعلیٰ درجہ بندی",

    brand_label: "برانڈ:",
    visit_store_prefix: "اسٹور پر جائیں:",
    ratings_label: "ریٹنگز",
    about_item: "اس آئٹم کے بارے میں",
    related_products: "متعلقہ مصنوعات",
    offers_benefits: "پیشکشیں اور فوائد",
    bank_offer: "بینک آفر",
    no_cost_emi: "نو کاسٹ ای ایم آئی",
    exchange_offer: "تبادلہ پیشکش",
    partner_offer: "پارٹنر آفر",
    delivery_returns_services: "ترسیل، واپسی اور خدمات",
    warranty_label: "وارنٹی",
    seller_label: "بیچنے والا",
    customer_reviews_title: "گاہک کے تبصرے",
    questions_answers: "سوالات اور جوابات",
    product_information: "مصنوعات کی معلومات",
    save_to_wishlist: "خواہشات کی فہرست میں محفوظ کریں",
    back_to_products: "مصنوعات پر واپس جائیں",
    secure_transaction: "محفوظ لین دین",
    add_to_cart: "کارٹ میں شامل کریں",
    buy_now: "ابھی خریدیں",
    out_of_stock: "اسٹاک میں نہیں ہے",
    in_stock: "اسٹاک میں موجود ہے",
    currently_unavailable: "فی الحال دستیاب نہیں",
    qty_label: "مقدار:",
    free_delivery_tomorrow: "کل تک مفت ترسیل",
    you_save: "بچت:",
    mrp_label: "ایم آر پی:"
  },
  pa: {
    "nav.yourLists": "ਤੁਹਾਡੀਆਂ ਸੂਚੀਆਂ",
    "nav.createWishlist": "ਵਿਸ਼ਲਿਸਟ ਬਣਾਓ",
    "nav.wishAnyWebsite": "ਯੂਨੀਵਰਸਲ ਵਿਸ਼ਲਿਸਟ",
    "nav.yourSavedItems": "ਸੰਭਾਲੀਆਂ ਗਈਆਂ ਚੀਜ਼ਾਂ",
    "nav.discoverStyle": "ਆਪਣੀ ਸ਼ੈਲੀ ਖੋਜੋ",
    "nav.exploreShowroom": "ਸ਼ੋਰੂਮ ਦੇਖੋ",
    "footer.wishlist": "ਤੁਹਾਡੀ ਵਿਸ਼ਲਿਸਟ",
    "nav.yourRecommendations": "ਤੁਹਾਡੀਆਂ ਸਿਫ਼ਾਰਸ਼ਾਂ",
    "dept.pcBuilder": "ਪੀਸੀ ਬਿਲਡਰ",
    "footer.faq": "ਅਕਸਰ ਪੁੱਛੇ ਜਾਂਦੇ ਸਵਾਲ (FAQ)",
    "footer.yourAccount": "ਤੁਹਾਡਾ ਖਾਤਾ",
    "nav.orders": "ਤੁਹਾਡੇ ਆਰਡਰ",
    "category.customerService": "ਗਾਹਕ ਸੇਵਾ",

    subcat_motherboard: "ਮਦਰਬੋਰਡ",
    subcat_ram: "ਡੈਸਕਟਾਪ ਰੈਮ / ਮੈਮੋਰੀ",
    subcat_cpu: "ਸੀਪੀਯੂ / ਪ੍ਰੋਸੈਸਰ",
    subcat_gpu: "ਗ੍ਰਾਫਿਕਸ ਕਾਰਡ / ਜੀਪੀਯੂ",
    subcat_smps: "ਪਾਵਰ ਸਪਲਾਈ / ਐਸਐਮਪੀਐਸ",
    subcat_cabinet: "ਕੈਬਿਨੇਟ / ਪੀਸੀ ਕੇਸ",
    subcat_cooling: "ਕੈਬਿਨੇਟ ਪੱਖਾ ਅਤੇ ਕੂਲਿੰਗ",
    subcat_pc_tool: "ਪੀਸੀ ਬਿਲਡਰ ਟੂਲ",
    subcat_all_components: "ਪੀਸੀ ਕੰਪੋਨੈਂਟਸ ਵਿੱਚ ਸਾਰੇ ਦੇਖੋ",
    subcat_all_laptops: "ਸਾਰੇ ਲੈਪਟਾਪ",
    subcat_gaming_laptops: "ਗੇਮਿੰਗ ਲੈਪਟਾਪ",
    subcat_branded_desktops: "ਬ੍ਰਾਂਡੇਡ ਡੈਸਕਟਾਪ",
    subcat_barebone_desktops: "ਬੇਅਰਬੋਨ ਡੈਸਕਟਾਪ",
    subcat_all_desktops: "ਸਾਰੇ ਡੈਸਕਟਾਪ ਕੰਪਿਊਟਰ",

    just_launched: "ਨਵਾਂ ਲਾਂਚ ਕੀਤਾ",
    hero_creator_title: "ਕ੍ਰਿਏਟਰ ਸਟੂਡੀਓ ਸੈੱਟਅੱਪ",
    explore_creator_studio: "ਕ੍ਰਿਏਟਰ ਸਟੂਡੀਓ ਦੀ ਪੜਚੋਲ ਕਰੋ",
    view_featured_pick: "ਵਿਸ਼ੇਸ਼ ਚੋਣ ਦੇਖੋ",
    todays_headline_offer: "ਅੱਜ ਦੀ ਮੁੱਖ ਪੇਸ਼ਕਸ਼",
    trending_right_now: "ਹੁਣੇ ਟਰੈਂਡਿੰਗ",
    deals_fast_checkout: "ਤੇਜ਼ ਚੈੱਕਆਊਟ ਡੀਲਾਂ",
    shop_now_prefix: "ਖਰੀਦੋ",
    live_now: "ਲਾਈਵ",
    starting_at: "ਸ਼ੁਰੂਆਤੀ ਕੀਮਤ",
    top_rating: "ਸਿਖਰਲੀ ਰੇਟਿੰਗ",

    brand_label: "ਬ੍ਰਾਂਡ:",
    visit_store_prefix: "ਸਟੋਰ 'ਤੇ ਜਾਓ:",
    ratings_label: "ਰੇਟਿੰਗਾਂ",
    about_item: "ਇਸ ਵਸਤੂ ਬਾਰੇ",
    related_products: "ਸੰਬੰਧਿਤ ਉਤਪਾਦ",
    offers_benefits: "ਪੇਸ਼ਕਸ਼ਾਂ ਅਤੇ ਲਾਭ",
    bank_offer: "ਬੈਂਕ ਪੇਸ਼ਕਸ਼",
    no_cost_emi: "ਨੋ ਕਾਸਟ ਈਐਮਆਈ",
    exchange_offer: "ਐਕਸਚੇਂਜ ਪੇਸ਼ਕਸ਼",
    partner_offer: "ਸਹਿਭਾਗੀ ਪੇਸ਼ਕਸ਼",
    delivery_returns_services: "ਡਿਲੀਵਰੀ, ਵਾਪਸੀ ਅਤੇ ਸੇਵਾਵਾਂ",
    warranty_label: "ਵਾਰੰਟੀ",
    seller_label: "ਵਿਕਰੇਤਾ",
    customer_reviews_title: "ਗਾਹਕ ਸਮੀਖਿਆਵਾਂ",
    questions_answers: "ਸਵਾਲ ਅਤੇ ਜਵਾਬ",
    product_information: "ਉਤਪਾਦ ਜਾਣਕਾਰੀ",
    save_to_wishlist: "ਵਿਸ਼ਲਿਸਟ ਵਿੱਚ ਸੰਭਾਲੋ",
    back_to_products: "ਉਤਪਾਦਾਂ 'ਤੇ ਵਾਪਸ ਜਾਓ",
    secure_transaction: "ਸੁਰੱਖਿਅਤ ਲੈਣ-ਦੇਣ",
    add_to_cart: "ਕਾਰਟ ਵਿੱਚ ਸ਼ਾਮਲ ਕਰੋ",
    buy_now: "ਹੁਣੇ ਖਰੀਦੋ",
    out_of_stock: "ਸਟਾਕ ਵਿੱਚ ਨਹੀਂ ਹੈ",
    in_stock: "ਸਟਾਕ ਵਿੱਚ ਹੈ",
    currently_unavailable: "ਵਰਤਮਾਨ ਵਿੱਚ ਅਣਉਪਲਬਧ",
    qty_label: "ਮਾਤਰਾ:",
    free_delivery_tomorrow: "ਕੱਲ੍ਹ ਤੱਕ ਮੁਫਤ ਡਿਲੀਵਰੀ",
    you_save: "ਬੱਚਤ:",
    mrp_label: "ਐਮ.ਆਰ.ਪੀ.:"
  },
  gu: {
    "nav.yourLists": "તમારી યાદીઓ",
    "nav.createWishlist": "વિશલિસ્ટ બનાવો",
    "nav.wishAnyWebsite": "યુનિવર્સલ વિશલિસ્ટ",
    "nav.yourSavedItems": "સાચવેલી વસ્તુઓ",
    "nav.discoverStyle": "તમારી શૈલી શોધો",
    "nav.exploreShowroom": "શોરૂમ એક્સપ્લોર કરો",
    "footer.wishlist": "તમારી વિશલિસ્ટ",
    "nav.yourRecommendations": "તમારી ભલામણો",
    "dept.pcBuilder": "પીસી બિલ્ડર",
    "footer.faq": "વારંવાર પૂછાતા પ્રશ્નો (FAQ)",
    "footer.yourAccount": "તમારું એકાઉન્ટ",
    "nav.orders": "તમારા ઓર્ડર્સ",
    "category.customerService": "ગ્રાહક સેવા",

    subcat_motherboard: "મધરબોર્ડ",
    subcat_ram: "ડેસ્કટોપ રેમ / મેમરી",
    subcat_cpu: "સીપીયુ / પ્રોસેસર્સ",
    subcat_gpu: "ગ્રાફિક્સ કાર્ડ / જીપીયુ",
    subcat_smps: "પાવર સપ્લાય / એસએમપીએસ",
    subcat_cabinet: "કેબિનેટ / પીસી કેસ",
    subcat_cooling: "કેબિનેટ ફેન અને કૂલિંગ",
    subcat_pc_tool: "પીસી બિલ્ડર ટૂલ",
    subcat_all_components: "પીસી કમ્પોનન્ટ્સમાં બધું જુઓ",
    subcat_all_laptops: "બધા લેપટોપ્સ",
    subcat_gaming_laptops: "ગેમિંગ લેપટોપ્સ",
    subcat_branded_desktops: "બ્રાન્ડેડ ડેસ્કટોપ્સ",
    subcat_barebone_desktops: "બેઅરબોન ડેસ્કટોપ્સ",
    subcat_all_desktops: "બધા ડેસ્કટોપ કમ્પ્યુટર્સ",

    just_launched: "હમણાં જ લૉન્ચ થયું",
    hero_creator_title: "ક્રિએટર સ્ટુડિયો સેટઅપ્સ",
    explore_creator_studio: "ક્રિએટર સ્ટુડિયો જુઓ",
    view_featured_pick: "ખાસ પસંદગી જુઓ",
    todays_headline_offer: "આજની મુખ્ય ઑફર",
    trending_right_now: "હમણાં ટ્રેન્ડિંગ",
    deals_fast_checkout: "ઝડપી ચેકઆઉટ ડીલ્સ",
    shop_now_prefix: "ખરીદો",
    live_now: "લાઇવ",
    starting_at: "શરૂઆત",
    top_rating: "ટોચનું રેટિંગ",

    brand_label: "બ્રાન્ડ:",
    visit_store_prefix: "સ્ટોર પર જાઓ:",
    ratings_label: "રેટિંગ્સ",
    about_item: "આ વસ્તુ વિશે",
    related_products: "સંબંધિત ઉત્પાદનો",
    offers_benefits: "ઑફર્સ અને લાભો",
    bank_offer: "બેંક ઑફર",
    no_cost_emi: "નો કોસ્ટ ઈએમઆઈ",
    exchange_offer: "એક્સચેન્જ ઑફર",
    partner_offer: "પાર્ટનર ઑફર",
    delivery_returns_services: "ડિલિવરી, રિટર્ન અને સેવાઓ",
    warranty_label: "વોરંટી",
    seller_label: "વિક્રેતા",
    customer_reviews_title: "ગ્રાહક સમીક્ષાઓ",
    questions_answers: "પ્રશ્નો અને જવાબો",
    product_information: "ઉત્પાદન માહિતી",
    save_to_wishlist: "વિશલિસ્ટમાં સાચવો",
    back_to_products: "ઉત્પાદનો પર પાછા જાઓ",
    secure_transaction: "સુરક્ષિત વ્યવહાર",
    add_to_cart: "કાર્ટમાં ઉમેરો",
    buy_now: "હમણાં ખરીદો",
    out_of_stock: "સ્ટોકમાં નથી",
    in_stock: "સ્ટોકમાં છે",
    currently_unavailable: "હાલમાં અનુપલબ્ધ",
    qty_label: "જથ્થો:",
    free_delivery_tomorrow: "આવતીકાલ સુધીમાં મફત ડિલિવરી",
    you_save: "બચત:",
    mrp_label: "એમ.આર.પી.:"
  }
};

// 1. UPDATE translations.js
const transPath = path.join(projectDir, 'translations.js');
let transCode = fs.readFileSync(transPath, 'utf8');

const marker = 'window.EM_TRANSLATIONS = translations;';
const injection = `
  // Merge mega i18n fixes (Flyout, subcat drawer, hero carousel, product details)
  const MEGA_I18N = ${JSON.stringify(MEGA_I18N, null, 2)};
  Object.keys(MEGA_I18N).forEach((lang) => {
    if (translations[lang]) {
      Object.assign(translations[lang], MEGA_I18N[lang]);
    }
  });

  ${marker}`;

if (transCode.includes(marker)) {
  transCode = transCode.replace(marker, injection);
}

// Add hook in applyFullPageTranslation for product detail page re-render
if (!transCode.includes('window.renderProductDetailPage')) {
  transCode = transCode.replace(
    'if (typeof window.renderTodaysDeals === "function") {\n      window.renderTodaysDeals(selectedLang);\n    }',
    `if (typeof window.renderTodaysDeals === "function") {
      window.renderTodaysDeals(selectedLang);
    }
    if (typeof window.renderProductDetailPage === "function") {
      window.renderProductDetailPage(selectedLang);
    }`
  );
}

fs.writeFileSync(transPath, transCode, 'utf8');
console.log('Successfully updated translations.js with MEGA_I18N dictionary and product detail hook');

// 2. UPDATE script.js (Fix t(key) fallback & hero carousel localization)
const scriptJsPath = path.join(projectDir, 'script.js');
let scriptJs = fs.readFileSync(scriptJsPath, 'utf8');

// Fix t(key) in script.js so it never returns raw code keys like "nav.yourLists"
scriptJs = scriptJs.replace(
  'return selected[key] || english[key] || key;',
  'if (selected[key] !== undefined) return selected[key];\n  if (english[key] !== undefined) return english[key];\n  return "";'
);
scriptJs = scriptJs.replace(
  'element.textContent = t(key);',
  'const trVal = t(key); if (trVal) element.textContent = trVal;'
);

// Localize buildHeroSlides in script.js
const oldBuildHero = `    slides.push({
      id: "creator-studio-launch",
      eyebrow: "Just launched",
      title: "Creator Studio setups built for editing, streaming, and sharper desks",
      description: \`\${creatorItems.length} creator-ready products are live now across \${getUniqueCollectionCount(creatorItems)} shopping paths. \${featuredCreator?.name || "Creator Studio"} leads the collection with premium-ready confidence.\`,
      pills: ["Creator Studio", \`From \${money(getStartingPrice(creatorItems))}\`, \`\${getHomeRatingBadge(creatorItems)} top rated\`],
      stats: [
        { label: "Live picks", value: \`\${creatorItems.length}\` },
        { label: "Starting at", value: money(getStartingPrice(creatorItems)) },
        { label: "Top rating", value: getHomeRatingBadge(creatorItems) }
      ],
      actions: [
        { href: "creator-studio.html", label: "Explore Creator Studio", secondary: false },
        { href: featuredCreator ? \`product-detail.html?id=\${encodeURIComponent(featuredCreator.id)}\` : "products.html?search=creator", label: "View featured creator pick", secondary: true }
      ],
      backgroundImage: getHeroBackdrop("creator-studio", featuredCreator)
    });`;

const newBuildHero = `    const activeLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
    const heroT = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[activeLang]) ? window.EM_TRANSLATIONS[activeLang] : {};
    slides.push({
      id: "creator-studio-launch",
      eyebrow: heroT.just_launched || "Just launched",
      title: heroT.hero_creator_title || "Creator Studio setups built for editing, streaming, and sharper desks",
      description: \`\${creatorItems.length} \${heroT.live_now || "live now"}. \${featuredCreator?.name || "Creator Studio"}\`,
      pills: ["Creator Studio", \`\${heroT.starting_at || "From"} \${money(getStartingPrice(creatorItems))}\`, \`\${getHomeRatingBadge(creatorItems)} \${heroT.top_rating || "top rated"}\`],
      stats: [
        { label: heroT.live_now || "Live picks", value: \`\${creatorItems.length}\` },
        { label: heroT.starting_at || "Starting at", value: money(getStartingPrice(creatorItems)) },
        { label: heroT.top_rating || "Top rating", value: getHomeRatingBadge(creatorItems) }
      ],
      actions: [
        { href: "creator-studio.html", label: heroT.explore_creator_studio || "Explore Creator Studio", secondary: false },
        { href: featuredCreator ? \`product-detail.html?id=\${encodeURIComponent(featuredCreator.id)}\` : "products.html?search=creator", label: heroT.view_featured_pick || "View featured pick", secondary: true }
      ],
      backgroundImage: getHeroBackdrop("creator-studio", featuredCreator)
    });`;

if (scriptJs.includes(oldBuildHero)) {
  scriptJs = scriptJs.replace(oldBuildHero, newBuildHero);
}

// Localize ranked hero slides
const oldRankedSlide = `    slides.push({
      id: \`\${category}-\${index}\`,
      eyebrow: index === 0 && !creatorItems.length ? "Today’s headline offer" : "Trending right now",
      title: \`\${label} deals built for fast checkout\`,
      description: \`\${items.length} options live now. \${featured?.name || label} is leading this category with strong ratings and ready-to-ship pricing.\`,
      pills: [label, featured?.brand || "ElectroMart", \`From \${money(getStartingPrice(items))}\`],
      stats: [
        { label: "Live now", value: \`\${items.length}\` },
        { label: "Starting at", value: money(getStartingPrice(items)) },
        { label: "Top rating", value: getHomeRatingBadge(items) }
      ],
      actions: [
        { href: getCategoryLandingLink(category), label: \`Shop \${label}\`, secondary: false },
        { href: featured ? \`product-detail.html?id=\${encodeURIComponent(featured.id)}\` : "products.html", label: "View featured pick", secondary: true }
      ],
      backgroundImage: getHeroBackdrop(category, featured)
    });`;

const newRankedSlide = `    const activeLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
    const heroT = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[activeLang]) ? window.EM_TRANSLATIONS[activeLang] : {};
    slides.push({
      id: \`\${category}-\${index}\`,
      eyebrow: index === 0 && !creatorItems.length ? (heroT.todays_headline_offer || "Today’s headline offer") : (heroT.trending_right_now || "Trending right now"),
      title: \`\${label} \${heroT.deals_fast_checkout || "deals built for fast checkout"}\`,
      description: \`\${items.length} \${heroT.live_now || "live now"}. \${featured?.name || label}\`,
      pills: [label, featured?.brand || "ElectroMart", \`\${heroT.starting_at || "From"} \${money(getStartingPrice(items))}\`],
      stats: [
        { label: heroT.live_now || "Live now", value: \`\${items.length}\` },
        { label: heroT.starting_at || "Starting at", value: money(getStartingPrice(items)) },
        { label: heroT.top_rating || "Top rating", value: getHomeRatingBadge(items) }
      ],
      actions: [
        { href: getCategoryLandingLink(category), label: \`\${label} \${heroT.shop_now_prefix || "Shop"}\`, secondary: false },
        { href: featured ? \`product-detail.html?id=\${encodeURIComponent(featured.id)}\` : "products.html", label: heroT.view_featured_pick || "View featured pick", secondary: true }
      ],
      backgroundImage: getHeroBackdrop(category, featured)
    });`;

if (scriptJs.includes(oldRankedSlide)) {
  scriptJs = scriptJs.replace(oldRankedSlide, newRankedSlide);
}

fs.writeFileSync(scriptJsPath, scriptJs, 'utf8');
console.log('Successfully updated script.js with t(key) fallback fix and hero carousel localization');

// 3. UPDATE header.js (Subcategory drawer items and getLocalizedNavText helper)
const headerJsPath = path.join(projectDir, 'header.js');
let headerJs = fs.readFileSync(headerJsPath, 'utf8');

// Add getLocalizedNavText helper at top of header.js if missing
if (!headerJs.includes('function getLocalizedNavText')) {
  headerJs = headerJs.replace(
    'function initHeader() {',
    `function getLocalizedNavText(key, fallbackText) {
    const lang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
    const dict = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[lang]) ? window.EM_TRANSLATIONS[lang] : (typeof translations !== "undefined" ? translations[lang] : null);
    return (dict && dict[key]) ? dict[key] : (fallbackText || key);
  }

  function initHeader() {`
  );
}

// Update subcategories object in header.js with keys
const oldSubcat = `    const subcategories = {
      'pc-components': {
        title: 'PC Components & Parts',
        items: [
          { name: 'Motherboard', url: 'motherboard.html' },
          { name: 'Desktop RAM / Memory', url: 'desktop-ram-memory.html' },
          { name: 'CPU / Processors', url: 'cpu-processor.html' },
          { name: 'Graphics Card / GPU', url: 'graphics-card-gpu.html' },
          { name: 'Power Supply / SMPS', url: 'power-supply-smps.html' },
          { name: 'Cabinet / PC Cases', url: 'cabinet.html' },
          { name: 'Cabinet Fan & Cooling', url: 'cabinet-fan.html' },
          { name: 'PC Builder Tool', url: 'pc-builder.html' },
          { name: 'All in PC Components', url: 'products.html?category=computer' }
        ]
      },
      'laptops-desktops': {
        title: 'Laptops & Desktops',
        items: [
          { name: 'All Laptops', url: 'laptop.html' },
          { name: 'Gaming Laptops', url: 'laptop.html?filter=gaming' },
          { name: 'Branded Desktops', url: 'branded-desktop.html' },
          { name: 'Barebone Desktops', url: 'barebone-desktop.html' },
          { name: 'All Desktop Computers', url: 'desktops.html' }
        ]
      }
    };`;

const newSubcat = `    const subcategories = {
      'pc-components': {
        title: 'PC Components & Parts',
        titleKey: 'components_parts',
        items: [
          { name: 'Motherboard', url: 'motherboard.html', key: 'subcat_motherboard' },
          { name: 'Desktop RAM / Memory', url: 'desktop-ram-memory.html', key: 'subcat_ram' },
          { name: 'CPU / Processors', url: 'cpu-processor.html', key: 'subcat_cpu' },
          { name: 'Graphics Card / GPU', url: 'graphics-card-gpu.html', key: 'subcat_gpu' },
          { name: 'Power Supply / SMPS', url: 'power-supply-smps.html', key: 'subcat_smps' },
          { name: 'Cabinet / PC Cases', url: 'cabinet.html', key: 'subcat_cabinet' },
          { name: 'Cabinet Fan & Cooling', url: 'cabinet-fan.html', key: 'subcat_cooling' },
          { name: 'PC Builder Tool', url: 'pc-builder.html', key: 'subcat_pc_tool' },
          { name: 'All in PC Components', url: 'products.html?category=computer', key: 'subcat_all_components' }
        ]
      },
      'laptops-desktops': {
        title: 'Laptops & Desktops',
        titleKey: 'laptops_desktops',
        items: [
          { name: 'All Laptops', url: 'laptop.html', key: 'subcat_all_laptops' },
          { name: 'Gaming Laptops', url: 'laptop.html?filter=gaming', key: 'subcat_gaming_laptops' },
          { name: 'Branded Desktops', url: 'branded-desktop.html', key: 'subcat_branded_desktops' },
          { name: 'Barebone Desktops', url: 'barebone-desktop.html', key: 'subcat_barebone_desktops' },
          { name: 'All Desktop Computers', url: 'desktops.html', key: 'subcat_all_desktops' }
        ]
      }
    };`;

if (headerJs.includes(oldSubcat)) {
  headerJs = headerJs.replace(oldSubcat, newSubcat);
}

// Update subList rendering in header.js
const oldSubRender = `          subTitle.textContent = data.title;
          subList.innerHTML = data.items.map(item => \`
            <a class="dept-menu-item" href="\${item.url}">
              <span>\${item.name}</span>
            </a>
          \`).join('');`;

const newSubRender = `          const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
          const dict = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : {};
          subTitle.textContent = (data.titleKey && dict[data.titleKey]) ? dict[data.titleKey] : data.title;
          subList.innerHTML = data.items.map(item => {
            const label = (item.key && dict[item.key]) ? dict[item.key] : item.name;
            return \`
            <a class="dept-menu-item" href="\${item.url}" data-i18n="\${item.key || ''}">
              <span>\${label}</span>
            </a>
          \`;
          }).join('');`;

if (headerJs.includes(oldSubRender)) {
  headerJs = headerJs.replace(oldSubRender, newSubRender);
}

fs.writeFileSync(headerJsPath, headerJs, 'utf8');
console.log('Successfully updated header.js with localized subcategory drawer');

// 4. UPDATE product-detail.html & product-detail.js
const pdHtmlPath = path.join(projectDir, 'product-detail.html');
let pdHtml = fs.readFileSync(pdHtmlPath, 'utf8');

// Tag static sections with data-i18n
pdHtml = pdHtml.replace('<h2>About this item</h2>', '<h2 data-i18n="about_item">About this item</h2>');
pdHtml = pdHtml.replace('<label for="qtySelect">Qty:</label>', '<label for="qtySelect" data-i18n="qty_label">Qty:</label>');
pdHtml = pdHtml.replace('<button id="addToCartBtn" type="button">Add to Cart</button>', '<button id="addToCartBtn" type="button" data-i18n="add_to_cart">Add to Cart</button>');
pdHtml = pdHtml.replace('<button id="wishlistBtn" type="button" class="secondary-btn">Save to Wishlist</button>', '<button id="wishlistBtn" type="button" class="secondary-btn" data-i18n="save_to_wishlist">Save to Wishlist</button>');
pdHtml = pdHtml.replace('<a href="cart.html" class="buy-now-btn">Buy Now</a>', '<a href="cart.html" class="buy-now-btn" data-i18n="buy_now">Buy Now</a>');
pdHtml = pdHtml.replace('<a href="products.html" class="secondary-btn">Back to products</a>', '<a href="products.html" class="secondary-btn" data-i18n="back_to_products">Back to products</a>');
pdHtml = pdHtml.replace('<p class="secure-line">Secure transaction</p>', '<p class="secure-line" data-i18n="secure_transaction">Secure transaction</p>');
pdHtml = pdHtml.replace('<h2>Related products</h2>', '<h2 data-i18n="related_products">Related products</h2>');
pdHtml = pdHtml.replace('<h2>Offers & Benefits</h2>', '<h2 data-i18n="offers_benefits">Offers & Benefits</h2>');
pdHtml = pdHtml.replace('<h2>Delivery, Returns & Services</h2>', '<h2 data-i18n="delivery_returns_services">Delivery, Returns & Services</h2>');
pdHtml = pdHtml.replace('<h2>Customer Reviews</h2>', '<h2 data-i18n="customer_reviews_title">Customer Reviews</h2>');
pdHtml = pdHtml.replace('<h2>Questions & Answers</h2>', '<h2 data-i18n="questions_answers">Questions & Answers</h2>');
pdHtml = pdHtml.replace('<h2>Product information</h2>', '<h2 data-i18n="product_information">Product information</h2>');

fs.writeFileSync(pdHtmlPath, pdHtml, 'utf8');
console.log('Successfully updated product-detail.html with data-i18n attributes');

// UPDATE product-detail.js
const pdJsPath = path.join(projectDir, 'product-detail.js');
let pdJs = fs.readFileSync(pdJsPath, 'utf8');

// Replace static texts in renderProduct
const oldRatingsLine = `<a href="#reviewsBlock" class="rating-count-link" style="color: #007185; text-decoration: none; font-size: 0.95rem;">\${reviewCount.toLocaleString("en-IN")} ratings</a>`;
const newRatingsLine = `<a href="#reviewsBlock" class="rating-count-link" style="color: #007185; text-decoration: none; font-size: 0.95rem;">\${reviewCount.toLocaleString("en-IN")} \${t.ratings_label || "ratings"}</a>`;

const oldSaveLine = `buyBoxSavings.textContent = discountPercent > 0 ? \`Save \${money(listPrice - price)} (\${discountPercent}% off)\` : "";`;
const newSaveLine = `buyBoxSavings.textContent = discountPercent > 0 ? \`\${t.you_save || "Save"} \${money(listPrice - price)} (\${discountPercent}% off)\` : "";`;

const oldDeliveryLine = `deliveryText.textContent = product.segment === "b2c" ? "FREE delivery by tomorrow" : "Business delivery options available";`;
const newDeliveryLine = `deliveryText.textContent = product.segment === "b2c" ? (t.free_delivery_tomorrow || "FREE delivery by tomorrow") : "Business delivery options available";`;

const oldAvailLine = `availabilityText.textContent = isInStock
    ? (product.segment === "b2c" ? "In Stock" : "In Stock for business orders")
    : "Currently unavailable";`;
const newAvailLine = `availabilityText.textContent = isInStock
    ? (product.segment === "b2c" ? (t.in_stock || "In Stock") : "In Stock for business orders")
    : (t.currently_unavailable || "Currently unavailable");`;

const oldBtnLine = `addToCartBtn.textContent = isInStock ? "Add to Cart" : "Out of Stock";`;
const newBtnLine = `addToCartBtn.textContent = isInStock ? (t.add_to_cart || "Add to Cart") : (t.out_of_stock || "Out of Stock");
  if (wishlistBtn) wishlistBtn.textContent = t.save_to_wishlist || "Save to Wishlist";`;

// Inject dictionary lookup at start of renderProduct
if (!pdJs.includes('// pdDictLookup')) {
  pdJs = pdJs.replace(
    'function renderProduct(product) {',
    `let activeRenderedProduct = null;
function renderProduct(product) {
  activeRenderedProduct = product;
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : {}; // pdDictLookup`
  );
}

if (pdJs.includes(oldRatingsLine)) pdJs = pdJs.replace(oldRatingsLine, newRatingsLine);
if (pdJs.includes(oldSaveLine)) pdJs = pdJs.replace(oldSaveLine, newSaveLine);
if (pdJs.includes(oldDeliveryLine)) pdJs = pdJs.replace(oldDeliveryLine, newDeliveryLine);
if (pdJs.includes(oldAvailLine)) pdJs = pdJs.replace(oldAvailLine, newAvailLine);
if (pdJs.includes(oldBtnLine)) pdJs = pdJs.replace(oldBtnLine, newBtnLine);

// Add window.renderProductDetailPage for real-time translation updates
if (!pdJs.includes('window.renderProductDetailPage')) {
  pdJs += `\nwindow.renderProductDetailPage = function() {
  if (activeRenderedProduct) {
    renderProduct(activeRenderedProduct);
  }
};\n`;
}

fs.writeFileSync(pdJsPath, pdJs, 'utf8');
console.log('Successfully updated product-detail.js with active translation bindings and live hook');
