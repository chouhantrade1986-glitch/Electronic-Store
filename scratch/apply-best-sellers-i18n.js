const fs = require('fs');
const path = require('path');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');

const BEST_SELLERS_I18N = {
  en: {
    most_loved: "MOST LOVED PRODUCTS",
    best_sellers_desc: "See what customers are buying most across top categories.",
    updated_weekly: "Updated Weekly",
    top_rated: "Top Rated",
    fast_delivery: "Fast Delivery",
    customer_favorites: "Customer Favorites",
    badge_best_seller: "BEST SELLER",
    view_details: "View details",
    sold_this_month: "sold this month",
    amazon_style_filters: "Amazon style filters",
    best_seller_tip: "Best Seller Tip",
    best_seller_tip_desc: "Open product details to compare ratings and delivery options before buying.",
    ranked_by_demand: "Ranked by customer demand and ratings.",
    most_sold: "Most Sold",
    star_rating: "star rating"
  },
  hi: {
    most_loved: "सबसे पसंदीदा उत्पाद",
    best_sellers_desc: "देखें कि ग्राहक शीर्ष श्रेणियों में सबसे ज्यादा क्या खरीद रहे हैं.",
    updated_weekly: "साप्ताहिक अपडेट",
    top_rated: "टॉप रेटेड",
    fast_delivery: "तेज़ डिलीवरी",
    customer_favorites: "ग्राहकों के पसंदीदा",
    badge_best_seller: "बेस्ट सेलर",
    view_details: "विवरण देखें",
    sold_this_month: "इस महीने बिके",
    amazon_style_filters: "अमेज़न स्टाइल फ़िल्टर",
    best_seller_tip: "बेस्ट सेलर टिप",
    best_seller_tip_desc: "खरीदने से पहले रेटिंग और डिलीवरी विकल्पों की तुलना करने के लिए उत्पाद विवरण खोलें.",
    ranked_by_demand: "ग्राहकों की मांग और रेटिंग के अनुसार क्रमबद्ध.",
    most_sold: "सर्वाधिक बिके",
    star_rating: "स्टार रेटिंग"
  },
  ta: {
    most_loved: "மிகவும் விரும்பப்படும் பொருட்கள்",
    best_sellers_desc: "முக்கிய பிரிவுகளில் வாடிக்கையாளர்கள் அதிகம் வாங்குவதைப் பார்க்கவும்.",
    updated_weekly: "வாரந்தோறும் புதுப்பிக்கப்படுகிறது",
    top_rated: "சிறந்த மதிப்பீடு",
    fast_delivery: "விரைவான டெலிவரி",
    customer_favorites: "வாடிக்கையாளர் விருப்பங்கள்",
    badge_best_seller: "பெஸ்ட் செல்லர்",
    view_details: "விவரங்களைக் காண்க",
    sold_this_month: "இந்த மாதம் விற்பனையானது",
    amazon_style_filters: "Amazon பாணி வடிகட்டிகள்",
    best_seller_tip: "பெஸ்ட் செல்லர் குறிப்பு",
    best_seller_tip_desc: "வாங்குவதற்கு முன் மதிப்பீடுகள் மற்றும் டெலிவரி விருப்பங்களை ஒப்பிட தயாரிப்பு விவரங்களைத் திறக்கவும்.",
    ranked_by_demand: "வாடிக்கையாளர் தேவை மற்றும் மதிப்பீடுகளின் அடிப்படையில் தரவரிசைப்படுத்தப்பட்டது.",
    most_sold: "அதிகம் விற்கப்பட்டது",
    star_rating: "நட்சத்திர மதிப்பீடு"
  },
  te: {
    most_loved: "అత్యంత ప్రజాదరణ పొందిన ఉత్పత్తులు",
    best_sellers_desc: "టాప్ విభాగాలలో కస్టమర్లు ఎక్కువగా ఏమి కొంటున్నారో చూడండి.",
    updated_weekly: "వారానికోసారి నవీకరించబడుతుంది",
    top_rated: "టాప్ రేటింగ్",
    fast_delivery: "వేగవంతమైన డెలివరీ",
    customer_favorites: "కస్టమర్ ఇష్టాలు",
    badge_best_seller: "బెస్ట్ సెల్లర్",
    view_details: "వివరాలు చూడండి",
    sold_this_month: "ఈ నెలలో అమ్ముడయ్యాయి",
    amazon_style_filters: "అమెజాన్ శైలి ఫిల్టర్లు",
    best_seller_tip: "బెస్ట్ సెల్లర్ చిట్కా",
    best_seller_tip_desc: "కొనుగోలు చేయడానికి ముందు రేటింగ్‌లు మరియు డెలివరీ ఎంపికలను సరిపోల్చడానికి ఉత్పత్తి వివరాలను తెరవండి.",
    ranked_by_demand: "కస్టమర్ డిమాండ్ మరియు రేటింగ్‌ల ఆధారంగా ర్యాంక్ చేయబడింది.",
    most_sold: "ఎక్కువగా అమ్ముడైనవి",
    star_rating: "స్టార్ రేటింగ్"
  },
  kn: {
    most_loved: "ಹೆಚ್ಚು ಇಷ್ಟಪಟ್ಟ ಉತ್ಪನ್ನಗಳು",
    best_sellers_desc: "ಉನ್ನತ ವರ್ಗಗಳಲ್ಲಿ ಗ್ರಾಹಕರು ಹೆಚ್ಚು ಏನನ್ನು ಖರೀದಿಸುತ್ತಿದ್ದಾರೆ ಎಂಬುದನ್ನು ನೋಡಿ.",
    updated_weekly: "ವಾರಕ್ಕೊಮ್ಮೆ ನವೀಕರಿಸಲಾಗುತ್ತದೆ",
    top_rated: "ಟಾಪ್ ರೇಟಿಂಗ್",
    fast_delivery: "ವೇಗದ ವಿತರಣೆ",
    customer_favorites: "ಗ್ರಾಹಕರ ಮೆಚ್ಚಿನವುಗಳು",
    badge_best_seller: "ಬೆಸ್ಟ್ ಸೆಲ್ಲರ್",
    view_details: "ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
    sold_this_month: "ಈ ತಿಂಗಳು ಮಾರಾಟವಾಗಿದೆ",
    amazon_style_filters: "ಅಮೆಜಾನ್ ಶೈಲಿಯ ಫಿಲ್ಟರ್‌ಗಳು",
    best_seller_tip: "ಬೆಸ್ಟ್ ಸೆಲ್ಲರ್ ಸಲಹೆ",
    best_seller_tip_desc: "ಖರೀದಿಸುವ ಮೊದಲು ರೇಟಿಂಗ್‌ಗಳು ಮತ್ತು ವಿತರಣಾ ಆಯ್ಕೆಗಳನ್ನು ಹೋಲಿಸಲು ಉತ್ಪನ್ನದ ವಿವರಗಳನ್ನು ತೆರೆಯಿರಿ.",
    ranked_by_demand: "ಗ್ರಾಹಕರ ಬೇಡಿಕೆ ಮತ್ತು ರೇಟಿಂಗ್‌ಗಳ ಆಧಾರದ ಮೇಲೆ ಶ್ರೇಯಾಂಕ ನೀಡಲಾಗಿದೆ.",
    most_sold: "ಹೆಚ್ಚು ಮಾರಾಟವಾದವು",
    star_rating: "ಸ್ಟಾರ್ ರೇಟಿಂಗ್"
  },
  ml: {
    most_loved: "ഏറ്റവും പ്രിയപ്പെട്ട ഉൽപ്പന്നങ്ങൾ",
    best_sellers_desc: "മുൻനിര വിഭാഗങ്ങളിൽ ഉപഭോക്താക്കൾ ഏറ്റവും കൂടുതൽ എന്താണ് വാങ്ങുന്നതെന്ന് കാണുക.",
    updated_weekly: "പ്രതിവാര അപ്ഡേറ്റ്",
    top_rated: "ടോപ്പ് റേറ്റഡ്",
    fast_delivery: "വേഗത്തിലുള്ള ഡെലിവറി",
    customer_favorites: "ഉപഭോക്തൃ പ്രിയങ്കരങ്ങൾ",
    badge_best_seller: "ബെസ്റ്റ് സെല്ലർ",
    view_details: "വിശദാംശങ്ങൾ കാണുക",
    sold_this_month: "ഈ മാസം വിറ്റു",
    amazon_style_filters: "ആമസോൺ ശൈലിയിലുള്ള ഫിൽട്ടറുകൾ",
    best_seller_tip: "ബെസ്റ്റ് സെല്ലർ ടിപ്പ്",
    best_seller_tip_desc: "വാങ്ങുന്നതിനുമുമ്പ് റേറ്റിംഗുകളും ഡെലിവറി ഓപ്ഷനുകളും താരതമ്യം ചെയ്യാൻ ഉൽപ്പന്ന വിശദാംശങ്ങൾ തുറക്കുക.",
    ranked_by_demand: "ഉപഭോക്തൃ ആവശ്യവും റേറ്റിംഗുകളും അടിസ്ഥാനമാക്കി റാങ്ക് ചെയ്‌തിരിക്കുന്നു.",
    most_sold: "ഏറ്റവും കൂടുതൽ വിറ്റഴിഞ്ഞത്",
    star_rating: "സ്റ്റാർ റേറ്റിംഗ്"
  },
  bn: {
    most_loved: "সর্বাধিক পছন্দের পণ্য",
    best_sellers_desc: "শীর্ষ বিভাগে গ্রাহকরা সবচেয়ে বেশি কী কিনছেন তা দেখুন।",
    updated_weekly: "সাপ্তাহিক আপডেট",
    top_rated: "টপ রেটেড",
    fast_delivery: "দ্রুত ডেলিভারি",
    customer_favorites: "গ্রাহকদের পছন্দের",
    badge_best_seller: "বেস্ট সেলার",
    view_details: "বিস্তারিত দেখুন",
    sold_this_month: "এই মাসে বিক্রি হয়েছে",
    amazon_style_filters: "অ্যামাজন স্টাইল ফিল্টার",
    best_seller_tip: "বেস্ট সেলার টিপ",
    best_seller_tip_desc: "কেনার আগে রেটিং এবং ডেলিভারির বিকল্প তুলনা করতে পণ্যের বিবরণ দেখুন।",
    ranked_by_demand: "গ্রাহকের চাহিদা এবং রেটিং দ্বারা স্থান দেওয়া হয়েছে।",
    most_sold: "সবচেয়ে বেশি বিক্রি",
    star_rating: "স্টার রেটিং"
  },
  mr: {
    most_loved: "सर्वात आवडती उत्पादने",
    best_sellers_desc: "ग्राहक शीर्ष श्रेणींमध्ये सर्वात जास्त काय खरेदी करत आहेत ते पहा.",
    updated_weekly: "साप्ताहिक अपडेट",
    top_rated: "टॉप रेटेड",
    fast_delivery: "जलद डिलिव्हरी",
    customer_favorites: "ग्राहकांचे आवडते",
    badge_best_seller: "बेस्ट सेलर",
    view_details: "तपशील पहा",
    sold_this_month: "या महिन्यात विकले गेले",
    amazon_style_filters: "अ‍ॅमेझॉन शैली फिल्टर",
    best_seller_tip: "बेस्ट सेलर टीप",
    best_seller_tip_desc: "खरेदी करण्यापूर्वी रेटिंग आणि वितरण पर्यायांची तुलना करण्यासाठी उत्पादन तपशील उघडा.",
    ranked_by_demand: "ग्राहकांच्या मागणी आणि रेटिंगनुसार क्रमवारी लावली.",
    most_sold: "सर्वाधिक विकले गेलेले",
    star_rating: "स्टार रेटिंग"
  },
  ur: {
    most_loved: "سب سے زیادہ پسندیدہ مصنوعات",
    best_sellers_desc: "دیکھیں کہ صارفین ٹاپ کیٹیگریز میں سب سے زیادہ کیا خرید رہے ہیں۔",
    updated_weekly: "ہفتہ وار اپ ڈیٹ",
    top_rated: "ٹاپ ریٹیڈ",
    fast_delivery: "تیز ترسیل",
    customer_favorites: "صارفین کی پسندیدہ",
    badge_best_seller: "بہترین فروخت کنندہ",
    view_details: "تفصیلات دیکھیں",
    sold_this_month: "اس ماہ فروخت ہوئے",
    amazon_style_filters: "ایمیزون طرز کے فلٹرز",
    best_seller_tip: "بہترین فروخت کنندہ ٹپ",
    best_seller_tip_desc: "خریداری سے پہلے ریٹنگز اور ڈلیوری کے اختیارات کا موازنہ کرنے کے لیے پروڈکٹ کی تفصیلات دیکھیں۔",
    ranked_by_demand: "صارفین کی مانگ اور درجہ بندی کے مطابق درجہ بندی کی گئی۔",
    most_sold: "سب سے زیادہ فروخت ہونے والا",
    star_rating: "اسٹار کی درجہ بندی"
  },
  pa: {
    most_loved: "ਸਭ ਤੋਂ ਵੱਧ ਪਸੰਦੀਦਾ ਉਤਪਾਦ",
    best_sellers_desc: "ਦੇਖੋ ਕਿ ਗਾਹਕ ਚੋਟੀ ਦੀਆਂ ਸ਼੍ਰੇਣੀਆਂ ਵਿੱਚ ਸਭ ਤੋਂ ਵੱਧ ਕੀ ਖਰੀਦ ਰਹੇ ਹਨ.",
    updated_weekly: "ਹਫਤਾਵਾਰੀ ਅੱਪਡੇਟ",
    top_rated: "ਟਾਪ ਰੇਟਡ",
    fast_delivery: "ਤੇਜ਼ ਡਿਲਿਵਰੀ",
    customer_favorites: "ਗਾਹਕਾਂ ਦੇ ਪਸੰਦੀਦਾ",
    badge_best_seller: "ਬੈਸਟ ਸੇਲਰ",
    view_details: "ਵੇਰਵੇ ਦੇਖੋ",
    sold_this_month: "ਇਸ ਮਹੀਨੇ ਵਿਕ ਗਏ",
    amazon_style_filters: "ਐਮਾਜ਼ਾਨ ਸਟਾਈਲ ਫਿਲਟਰ",
    best_seller_tip: "ਬੈਸਟ ਸੇਲਰ ਸੁਝਾਅ",
    best_seller_tip_desc: "ਖਰੀਦਣ ਤੋਂ ਪਹਿਲਾਂ ਰੇਟਿੰਗਾਂ ਅਤੇ ਡਿਲੀਵਰੀ ਵਿਕਲਪਾਂ ਦੀ ਤੁਲਨਾ ਕਰਨ ਲਈ ਉਤਪਾਦ ਦੇ ਵੇਰਵੇ ਖੋਲ੍ਹੋ।",
    ranked_by_demand: "ਗਾਹਕਾਂ ਦੀ ਮੰਗ ਅਤੇ ਰੇਟਿੰਗਾਂ ਦੁਆਰਾ ਦਰਜਾਬੰਦੀ ਕੀਤੀ ਗਈ.",
    most_sold: "ਸਭ ਤੋਂ ਵੱਧ ਵਿਕਣ ਵਾਲੇ",
    star_rating: "ਸਟਾਰ ਰੇਟਿੰਗ"
  },
  gu: {
    most_loved: "સૌથી વધુ પસંદ કરાયેલ પ્રોડક્ટ્સ",
    best_sellers_desc: "ટોચની શ્રેણીઓમાં ગ્રાહકો સૌથી વધુ શું ખરીદી રહ્યા છે તે જુઓ.",
    updated_weekly: "સાપ્તાહિક અપડેટ",
    top_rated: "ટોચનું રેટિંગ",
    fast_delivery: "ઝડપી ડિલિવરી",
    customer_favorites: "ગ્રાહકોની પસંદ",
    badge_best_seller: "બેસ્ટ સેલર",
    view_details: "વિગતો જુઓ",
    sold_this_month: "આ મહિને વેચાયા",
    amazon_style_filters: "એમેઝોન શૈલી ફિલ્ટર્સ",
    best_seller_tip: "બેસ્ટ સેલર ટીપ",
    best_seller_tip_desc: "ખરીદતા પહેલા રેટિંગ્સ અને ડિલિવરી વિકલ્પોની તુલના કરવા માટે પ્રોડક્ટ વિગતો ખોલો.",
    ranked_by_demand: "ગ્રાહકની માંગ અને રેટિંગ્સ દ્વારા ક્રમાંકિત.",
    most_sold: "સૌથી વધુ વેચાયેલ",
    star_rating: "સ્ટાર રેટિંગ"
  }
};

// 1. Update translations.js
const transPath = path.join(projectDir, 'translations.js');
let transCode = fs.readFileSync(transPath, 'utf8');

const marker = 'window.EM_TRANSLATIONS = translations;';
const injection = `
  // Merge best sellers translations across all 11 languages
  const BEST_SELLERS_I18N = ${JSON.stringify(BEST_SELLERS_I18N, null, 2)};
  Object.keys(BEST_SELLERS_I18N).forEach((lang) => {
    if (translations[lang]) {
      Object.assign(translations[lang], BEST_SELLERS_I18N[lang]);
    }
  });

  ${marker}`;

if (transCode.includes(marker)) {
  transCode = transCode.replace(marker, injection);
}

// Add window.renderBestSellers call if present
if (!transCode.includes('window.renderBestSellers')) {
  transCode = transCode.replace(
    'if (typeof window.renderCart === "function") {\n      window.renderCart();\n    }',
    'if (typeof window.renderCart === "function") {\n      window.renderCart();\n    }\n    if (typeof window.renderBestSellers === "function") {\n      window.renderBestSellers(selectedLang);\n    }'
  );
}

fs.writeFileSync(transPath, transCode, 'utf8');
console.log('Successfully updated translations.js with best sellers translations');

// 2. Update best-sellers.html with data-i18n tags
const bshPath = path.join(projectDir, 'best-sellers.html');
let bshHtml = fs.readFileSync(bshPath, 'utf8');

bshHtml = bshHtml.replace('<p class="eyebrow">Most Loved Products</p>', '<p class="eyebrow" data-i18n="most_loved">Most Loved Products</p>');
bshHtml = bshHtml.replace('<p>See what customers are buying most across top categories.</p>', '<p data-i18n="best_sellers_desc">See what customers are buying most across top categories.</p>');
bshHtml = bshHtml.replace('<span>Updated Weekly</span>', '<span data-i18n="updated_weekly">Updated Weekly</span>');
bshHtml = bshHtml.replace('<span>Top Rated</span>', '<span data-i18n="top_rated">Top Rated</span>');
bshHtml = bshHtml.replace('<span>Fast Delivery</span>', '<span data-i18n="fast_delivery">Fast Delivery</span>');
bshHtml = bshHtml.replace('<p>Amazon style filters</p>', '<p data-i18n="amazon_style_filters">Amazon style filters</p>');
bshHtml = bshHtml.replace('<h3>Best Seller Tip</h3>', '<h3 data-i18n="best_seller_tip">Best Seller Tip</h3>');
bshHtml = bshHtml.replace('<p>Open product details to compare ratings and delivery options before buying.</p>', '<p data-i18n="best_seller_tip_desc">Open product details to compare ratings and delivery options before buying.</p>');
bshHtml = bshHtml.replace('<h2>Customer Favorites</h2>', '<h2 data-i18n="customer_favorites">Customer Favorites</h2>');
bshHtml = bshHtml.replace('<p class="result-note">Ranked by customer demand and ratings.</p>', '<p class="result-note" data-i18n="ranked_by_demand">Ranked by customer demand and ratings.</p>');
bshHtml = bshHtml.replace('<option value="all">All Categories</option>', '<option value="all" data-i18n="all_categories">All Categories</option>');
bshHtml = bshHtml.replace('<option value="laptop">Laptops</option>', '<option value="laptop" data-i18n="laptops">Laptops</option>');
bshHtml = bshHtml.replace('<option value="mobile">Mobiles</option>', '<option value="mobile" data-i18n="mobiles">Mobiles</option>');
bshHtml = bshHtml.replace('<option value="audio">Audio</option>', '<option value="audio" data-i18n="audio_headphones">Audio</option>');
bshHtml = bshHtml.replace('<option value="accessory">Accessories</option>', '<option value="accessory" data-i18n="accessories">Accessories</option>');
bshHtml = bshHtml.replace('<option value="relevance">Sort: Relevance</option>', '<option value="relevance" data-i18n="sort_featured">Sort: Relevance</option>');
bshHtml = bshHtml.replace('<option value="sold_desc">Most Sold</option>', '<option value="sold_desc" data-i18n="most_sold">Most Sold</option>');
bshHtml = bshHtml.replace('<option value="rating_desc">Top Rated</option>', '<option value="rating_desc" data-i18n="top_rated">Top Rated</option>');

fs.writeFileSync(bshPath, bshHtml, 'utf8');
console.log('Successfully updated best-sellers.html with data-i18n attributes');

// 3. Update best-sellers.js to dynamically localize cards and buttons
const bsjPath = path.join(projectDir, 'best-sellers.js');
let bsjCode = fs.readFileSync(bsjPath, 'utf8');

// Replace card(item)
const oldCardFunc = /function card\(item\) \{[\s\S]*?\n\}/;
const newCardFunc = `function card(item) {
  const detailUrl = \`product-detail.html?id=\${encodeURIComponent(item.id)}\`;
  const brandUrl = \`brands.html?brand=\${encodeURIComponent(String(item.brand || "").trim())}\`;
  const lang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
  const dict = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[lang]) || (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS.en) || {};

  const bestSellerBadge = dict.badge_best_seller || "BEST SELLER";
  const soldSuffix = dict.sold_this_month || "sold this month";
  const addToCartText = dict.add_to_cart || "Add to Cart";
  const viewDetailsText = dict.view_details || "View details";
  const starRatingText = dict.star_rating || "star rating";

  const soldDisplay = item.soldCount ? \`\${(item.soldCount / 1000).toFixed(1)}k \${soldSuffix}\` : item.sold;

  return \`
    <article class="product-card">
      <a class="product-card-media" href="\${detailUrl}" aria-label="Open \${escapeHtml(item.name)}">
        <img src="\${escapeHtml(item.image)}" alt="\${escapeHtml(item.name)}" loading="lazy" />
      </a>
      <div class="content">
        <p class="card-kicker"><span class="badge" data-i18n="badge_best_seller">\${escapeHtml(bestSellerBadge)}</span></p>
        <h3><a href="\${detailUrl}">\${escapeHtml(item.name)}</a></h3>
        <p><a class="brand-line" href="\${brandUrl}">by \${escapeHtml(item.brand)}</a></p>
        <div class="rating-line">
          <span class="rating">\${escapeHtml(String(item.rating.toFixed(1)))} \${escapeHtml(starRatingText)}</span>
          <span class="sold-tag">\${escapeHtml(soldDisplay)}</span>
        </div>
        <p class="price">\${escapeHtml(money(item.price))}</p>
        <p class="price-meta">Popular pick in \${escapeHtml(categoryLabel(item.category))} with fast checkout ready.</p>
        <div class="card-actions">
          <button class="add-btn btn-cart" data-id="\${escapeHtml(item.id)}" type="button" data-i18n="add_to_cart">\${escapeHtml(addToCartText)}</button>
          <a class="view-link btn-details" href="\${detailUrl}" data-i18n="view_details">\${escapeHtml(viewDetailsText)}</a>
        </div>
      </div>
    </article>
  \`;
}`;

bsjCode = bsjCode.replace(oldCardFunc, newCardFunc);

// Replace render(list)
const oldRenderFunc = /function render\(list\) \{[\s\S]*?\n\}/;
const newRenderFunc = `function render(list) {
  if (!resultMeta || !bestGrid) {
    return;
  }
  const lang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
  const dict = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[lang]) || (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS.en) || {};
  const showingText = dict.showing || "Showing";
  const productsText = dict.products || "products";
  resultMeta.textContent = \`\${showingText} \${list.length} \${productsText}\`;
  if (!list.length) {
    bestGrid.innerHTML = \`<div class='empty'>\${dict.no_matches_found || "No exact matches found. Try clearing one filter or broadening the search."}</div>\`;
    return;
  }
  bestGrid.innerHTML = list.map(card).join("");
  if (typeof window.applyFullPageTranslation === "function") {
    window.applyFullPageTranslation(lang);
  }
}`;

bsjCode = bsjCode.replace(oldRenderFunc, newRenderFunc);

// Expose window.renderBestSellers
if (!bsjCode.includes('window.renderBestSellers')) {
  bsjCode += '\nwindow.renderBestSellers = filterBestSellers;\n';
}

fs.writeFileSync(bsjPath, bsjCode, 'utf8');
console.log('Successfully updated best-sellers.js with dynamic i18n renderer');
