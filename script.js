const products = [
  { id: 1, name: "AstraBook Pro 14", brand: "AstraTech", segment: "b2c", category: "laptop", price: 999, rating: 4.6, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80" },
  { id: 2, name: "Nimbus Phone X", brand: "Nimbus", segment: "b2c", category: "mobile", price: 749, rating: 4.5, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80" },
  { id: 3, name: "Pulse ANC Headphones", brand: "PulseWave", segment: "b2c", category: "audio", price: 179, rating: 4.4, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80" },
  { id: 4, name: "4K Smart Television", brand: "Nimbus", segment: "b2c", category: "accessory", price: 699, rating: 4.7, image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=900&q=80" },
  { id: 5, name: "Orbit Mechanical Keyboard", brand: "OrbitX", segment: "b2c", category: "accessory", price: 109, rating: 4.3, image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80" },
  { id: 6, name: "ZenPad Tablet 11", brand: "ZenPad", segment: "b2c", category: "mobile", price: 529, rating: 4.2, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80" },
  { id: 7, name: "Vector Gaming Laptop", brand: "Vector", segment: "b2c", category: "laptop", price: 1299, rating: 4.8, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80" },
  { id: 8, name: "Echo Smart Speaker", brand: "EchoSphere", segment: "b2c", category: "audio", price: 89, rating: 4.1, image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=900&q=80" },
  { id: 9, name: "Office Laptop Bundle (10 Units)", brand: "AstraTech", segment: "b2b", category: "laptop", price: 8690, rating: 4.7, moq: 10, image: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80" },
  { id: 10, name: "Retail Smartphone Pack (25 Units)", brand: "Nimbus", segment: "b2b", category: "mobile", price: 15499, rating: 4.5, moq: 25, image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80" },
  { id: 11, name: "Corporate Headset Case (50 Units)", brand: "PulseWave", segment: "b2b", category: "audio", price: 5399, rating: 4.4, moq: 50, image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80" },
  { id: 12, name: "Accessory Mix Carton (100 Units)", brand: "OrbitX", segment: "b2b", category: "accessory", price: 4299, rating: 4.3, moq: 100, image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=900&q=80" },
  {
    id: "product_1772722039220",
    name: "Lenovo V15 G4 (2024)",
    brand: "Lenovo",
    segment: "b2c",
    category: "laptop",
    price: 36000,
    listPrice: 36000,
    rating: 0,
    moq: 0,
    image: "",
    status: "active",
    createdAt: "2026-03-05T14:47:19.204Z",
    updatedAt: "2026-03-05T14:47:19.204Z"
  }
,
  {
    id: "product_1773480601001",
    name: "AstraStudio Creator 16",
    brand: "AstraTech",
    segment: "b2c",
    category: "laptop",
    collections: ["laptop", "creator-studio", "computer"],
    price: 129999,
    listPrice: 139999,
    rating: 4.8,
    stock: 12,
    moq: 0,
    image: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
    description: "16-inch creator laptop with a color-accurate display, fast SSD storage, and export-ready performance for video, design, and streaming workflows.",
    keywords: ["creator studio", "laptop", "video editing", "design"],
    sku: "ASTRA-CREATOR-16",
    status: "active",
    fulfillment: "fbm",
    featured: true,
    createdAt: "2026-03-14T09:10:01.000Z",
    updatedAt: "2026-03-14T09:10:01.000Z"
  },
  {
    id: "product_1773480601002",
    name: "OrbitX ViewPro 32 4K",
    brand: "OrbitX",
    segment: "b2c",
    category: "computer",
    collections: ["computer", "creator-studio"],
    price: 32999,
    listPrice: 37999,
    rating: 4.7,
    stock: 18,
    moq: 0,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80",
    description: "32-inch 4K monitor tuned for editing timelines, grading work, and long studio sessions.",
    keywords: ["creator studio", "4k monitor", "color monitor", "editing"],
    sku: "ORBITX-VIEWPRO-32",
    status: "active",
    fulfillment: "fbm",
    featured: true,
    createdAt: "2026-03-14T09:12:00.000Z",
    updatedAt: "2026-03-14T09:12:00.000Z"
  },
  {
    id: "product_1773480601003",
    name: "PulseCast Pro USB Microphone",
    brand: "PulseWave",
    segment: "b2c",
    category: "audio",
    collections: ["audio", "creator-studio"],
    price: 8999,
    listPrice: 10999,
    rating: 4.6,
    stock: 26,
    moq: 0,
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80",
    description: "USB creator microphone with a clean vocal profile for streaming, podcasts, and client calls.",
    keywords: ["creator studio", "microphone", "podcast", "streaming"],
    sku: "PULSECAST-PRO-USB",
    status: "active",
    fulfillment: "fbm",
    featured: false,
    createdAt: "2026-03-14T09:14:00.000Z",
    updatedAt: "2026-03-14T09:14:00.000Z"
  },
  {
    id: "product_1773480601004",
    name: "Nimbus StreamCam 4K",
    brand: "Nimbus",
    segment: "b2c",
    category: "accessory",
    collections: ["accessory", "creator-studio"],
    price: 6999,
    listPrice: 8499,
    rating: 4.5,
    stock: 31,
    moq: 0,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    description: "Compact 4K webcam with autofocus and sharp framing for live sessions and remote shoots.",
    keywords: ["creator studio", "webcam", "4k camera", "streaming"],
    sku: "NIMBUS-STREAMCAM-4K",
    status: "active",
    fulfillment: "fbm",
    featured: false,
    createdAt: "2026-03-14T09:16:00.000Z",
    updatedAt: "2026-03-14T09:16:00.000Z"
  },
  {
    id: "product_1773480601005",
    name: "VectorDock 12-in-1 Thunderbolt Hub",
    brand: "Vector",
    segment: "b2c",
    category: "accessory",
    collections: ["accessory", "creator-studio", "computer"],
    price: 11999,
    listPrice: 13999,
    rating: 4.4,
    stock: 22,
    moq: 0,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=900&q=80",
    description: "Single-cable dock with creator-friendly ports for drives, monitors, cameras, and fast charging.",
    keywords: ["creator studio", "dock", "thunderbolt", "hub"],
    sku: "VECTORDOCK-12IN1",
    status: "active",
    fulfillment: "fbm",
    featured: false,
    createdAt: "2026-03-14T09:18:00.000Z",
    updatedAt: "2026-03-14T09:18:00.000Z"
  },
  {
    id: "product_1773480601006",
    name: "AstraPad Pen Display 13",
    brand: "AstraTech",
    segment: "b2c",
    category: "computer",
    collections: ["computer", "creator-studio"],
    price: 45999,
    listPrice: 49999,
    rating: 4.7,
    stock: 9,
    moq: 0,
    image: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&w=900&q=80",
    description: "13-inch pen display for sketching, retouching, and precise creative control across design workflows.",
    keywords: ["creator studio", "pen display", "illustration", "design"],
    sku: "ASTRAPAD-13",
    status: "active",
    fulfillment: "fbm",
    featured: false,
    createdAt: "2026-03-14T09:20:00.000Z",
    updatedAt: "2026-03-14T09:20:00.000Z"
  }
];

const b2cProductGrid = document.getElementById("b2cProductGrid");
const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchInput");
const b2cResultMeta = document.getElementById("b2cResultMeta");
const cartCount = document.getElementById("cartCount");
const searchForm = document.getElementById("searchForm");
const megaTrigger = document.getElementById("megaTrigger");
const megaMenu = document.getElementById("megaMenu");
const quickLinksTrigger = document.getElementById("quickLinksTrigger");
const quickLinksMenu = document.getElementById("quickLinksMenu");
const storeGrid = document.getElementById("storeGrid");
const newArrivalsGrid = document.getElementById("newArrivalsGrid");
const newArrivalsMeta = document.getElementById("newArrivalsMeta");
const topRatedGrid = document.getElementById("topRatedGrid");
const recommendedGrid = document.getElementById("recommendedGrid");
const creatorStudioSection = document.getElementById("creatorStudioSection");
const creatorStudioGrid = document.getElementById("creatorStudioGrid");
const creatorStudioMeta = document.getElementById("creatorStudioMeta");
const creatorStudioStats = document.getElementById("creatorStudioStats");
const homeMomentumBand = document.getElementById("homeMomentumBand");
const recentlyViewedSection = document.getElementById("recentlyViewedSection");
const recentlyViewedGrid = document.getElementById("recentlyViewedGrid");
const heroTrack = document.getElementById("heroTrack");
const heroDots = document.getElementById("heroDots");
const heroPrev = document.getElementById("heroPrev");
const heroNext = document.getElementById("heroNext");
const quickViewModal = document.getElementById("quickViewModal");
const quickViewClose = document.getElementById("quickViewClose");
const quickViewImage = document.getElementById("quickViewImage");
const quickViewEyebrow = document.getElementById("quickViewEyebrow");
const quickViewTitle = document.getElementById("quickViewTitle");
const quickViewRating = document.getElementById("quickViewRating");
const quickViewPrice = document.getElementById("quickViewPrice");
const quickViewMeta = document.getElementById("quickViewMeta");
const quickViewDescription = document.getElementById("quickViewDescription");
const quickViewAddBtn = document.getElementById("quickViewAddBtn");
const quickViewWishlistBtn = document.getElementById("quickViewWishlistBtn");
const quickViewDetailsLink = document.getElementById("quickViewDetailsLink");
const searchSuggestions = document.getElementById("searchSuggestions");
const languageSelect = document.getElementById("languageSelect");
const locationTrigger = document.getElementById("locationTrigger");
const deliveryLocationText = document.getElementById("deliveryLocationText");
const locationModal = document.getElementById("locationModal");
const locationCity = document.getElementById("locationCity");
const locationPostal = document.getElementById("locationPostal");
const locationCancel = document.getElementById("locationCancel");
const locationSave = document.getElementById("locationSave");
const CART_STORAGE_KEY = "electromart_cart_v1";
const CATALOG_STORAGE_KEY = "electromart_catalog_v1";
const LOCATION_STORAGE_KEY = "electromart_location_v1";
const LANGUAGE_STORAGE_KEY = "electromart_lang_v1";
const WISHLIST_STORAGE_KEY = "electromart_wishlist_v1";
const RECENTLY_VIEWED_STORAGE_KEY = "electromart_recently_viewed_v1";
const SEARCH_HISTORY_STORAGE_KEY = "electromart_search_history_v1";
const API_BASE_URL = (() => {
  const { protocol, hostname, port } = window.location;
  if (protocol === "file:" || hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:4000/api";
  }
  const origin = `${protocol}//${hostname}${port ? `:${port}` : ""}`;
  return `${origin}/api`;
})();
const HOME_MAIN_LIST_LIMIT = 12;
const HOME_NEW_ARRIVALS_LIMIT = 6;
const HOME_CURATED_LIST_LIMIT = 4;
const FALLBACK_IMAGE_URL = "./product-placeholder.svg";

let cart = 0;
let currentLang = "en";
let heroSlides = [];
let currentHeroIndex = 0;
let heroAutoplayTimer = 0;
let currentQuickViewProductId = "";
let homeApiProducts = [];
let homeProductsFetchPromise = null;
let homeCatalogRequested = false;
const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});

const stores = [
  { id: 1, cityKey: "stores.ny.city", addressKey: "stores.ny.address", hoursKey: "stores.ny.hours", phone: "+91 11 4100 1200" },
  { id: 2, cityKey: "stores.la.city", addressKey: "stores.la.address", hoursKey: "stores.la.hours", phone: "+91 22 4100 1300" },
  { id: 3, cityKey: "stores.chi.city", addressKey: "stores.chi.address", hoursKey: "stores.chi.hours", phone: "+91 80 4100 1400" }
];

const translations = {
  en: {
    "header.deliverTo": "Deliver to",
    "header.searchPlaceholder": "Search electronics",
    "header.searchBtn": "Search",
    "header.language": "Language",
    "location.title": "Choose your location",
    "location.subtitle": "Select a delivery location to see product availability and delivery options.",
    "location.cityLabel": "City",
    "location.postalLabel": "PIN code",
    "location.postalPlaceholder": "110001",
    "location.cancel": "Cancel",
    "location.save": "Save location",
    "nav.account": "Account",
    "nav.orders": "Orders",
    "nav.cart": "Cart",
    "category.allDepartments": "All Departments",
    "category.deals": "Today's Deals",
    "category.bestSellers": "Best Sellers",
    "category.gaming": "Gaming",
    "category.homeOffice": "Home Office",
    "category.smartHome": "Smart Home",
    "category.stores": "Stores",
    "category.customerService": "Customer Service",
    "category.giftCards": "Gift Cards",
    "category.more": "More",
    "mega.computers": "Computers",
    "mega.laptops": "Laptops",
    "mega.desktops": "Desktops",
    "mega.monitors": "Monitors",
    "mega.storage": "Storage",
    "mega.mobile": "Mobile",
    "mega.smartphones": "Smartphones",
    "mega.tablets": "Tablets",
    "mega.wearables": "Wearables",
    "mega.chargers": "Chargers",
    "mega.audioVideo": "Audio & Video",
    "mega.headphones": "Headphones",
    "mega.speakers": "Speakers",
    "mega.tvTheater": "TV & Home Theater",
    "mega.microphones": "Microphones",
    "mega.featuredDeal": "Featured Deal",
    "mega.productTitle": "Wireless Earbuds Pro",
    "mega.priceNow": "Now ₹79",
    "mega.seeOffer": "See offer",
    "hero.event": "Mega Electronics Sale",
    "hero.headline": "Up to 60% off on laptops, mobiles and accessories",
    "hero.shopNow": "Shop now",
    "quick.homeEntertainment": "Home Entertainment",
    "quick.homeEntertainmentDesc": "4K TVs, soundbars, and streaming gear.",
    "quick.gamingZone": "Gaming Zone",
    "quick.gamingZoneDesc": "Consoles, RGB accessories, and pro headsets.",
    "quick.workFromHome": "Work From Home",
    "quick.workFromHomeDesc": "Monitors, webcams, keyboards, and office sets.",
    "quick.mobileEssentials": "Mobile Essentials",
    "quick.mobileEssentialsDesc": "Phones, chargers, cases, and power banks.",
    "products.sectionTitle": "Product Listings",
    "products.b2cTitle": "B2C Products",
    "products.b2bTitle": "B2B Products",
    "products.showing": "Showing",
    "products.b2cListLabel": "B2C products",
    "products.b2bListLabel": "B2B products",
    "products.addToCart": "Add to Cart",
    "products.bulkMin": "Min order",
    "stores.title": "Our Stores",
    "stores.subtitle": "Visit a nearby ElectroMart location",
    "stores.visit": "Visit Store",
    "stores.ny.city": "New Delhi Flagship",
    "stores.ny.address": "Nehru Place, New Delhi, Delhi",
    "stores.ny.hours": "Open: 10 AM - 9 PM",
    "stores.la.city": "Mumbai Central",
    "stores.la.address": "Lamington Road, Mumbai, Maharashtra",
    "stores.la.hours": "Open: 10 AM - 9 PM",
    "stores.chi.city": "Bengaluru Tech Hub",
    "stores.chi.address": "SP Road, Bengaluru, Karnataka",
    "stores.chi.hours": "Open: 10 AM - 9 PM",
    "footer.backToTop": "Back to top",
    "footer.getToKnowUs": "Get to Know Us",
    "footer.about": "About",
    "footer.careers": "Careers",
    "footer.press": "Press",
    "footer.makeMoney": "Make Money with Us",
    "footer.sellProducts": "Sell Products",
    "footer.affiliate": "Become an Affiliate",
    "footer.advertise": "Advertise",
    "footer.help": "Help",
    "footer.yourAccount": "Your Account",
    "footer.shippingRates": "Shipping Rates",
    "footer.returns": "Returns",
    "footer.copyright": "© 2026 ElectroMart clone experience",
    "categoryFilter.all": "All Catalogue",
    "categoryFilter.computer": "Computers",
    "categoryFilter.laptop": "Laptops",
    "categoryFilter.printer": "Printers",
    "categoryFilter.mobile": "Mobiles",
    "categoryFilter.audio": "Audio",
    "categoryFilter.accessory": "Accessories"
  },
  hi: {
    "header.deliverTo": "पहुंचाएं",
    "header.searchPlaceholder": "इलेक्ट्रॉनिक्स खोजें",
    "header.searchBtn": "खोजें",
    "header.language": "भाषा",
    "location.title": "अपना स्थान चुनें",
    "location.subtitle": "उत्पाद उपलब्धता और डिलीवरी विकल्प देखने के लिए डिलीवरी स्थान चुनें।",
    "location.cityLabel": "शहर",
    "location.postalLabel": "पिन कोड",
    "location.postalPlaceholder": "110001",
    "location.cancel": "रद्द करें",
    "location.save": "स्थान सेव करें",
    "nav.account": "अकाउंट",
    "nav.orders": "ऑर्डर",
    "nav.cart": "कार्ट",
    "category.allDepartments": "सभी विभाग",
    "category.deals": "आज के ऑफर",
    "category.bestSellers": "बेस्ट सेलर",
    "category.gaming": "गेमिंग",
    "category.homeOffice": "होम ऑफिस",
    "category.smartHome": "स्मार्ट होम",
    "category.stores": "स्टोर्स",
    "category.customerService": "कस्टमर सर्विस",
    "category.giftCards": "गिफ्ट कार्ड",
    "category.more": "और",
    "mega.computers": "कंप्यूटर",
    "mega.laptops": "लैपटॉप",
    "mega.desktops": "डेस्कटॉप",
    "mega.monitors": "मॉनिटर",
    "mega.storage": "स्टोरेज",
    "mega.mobile": "मोबाइल",
    "mega.smartphones": "स्मार्टफोन",
    "mega.tablets": "टैबलेट",
    "mega.wearables": "वेयरेबल",
    "mega.chargers": "चार्जर",
    "mega.audioVideo": "ऑडियो और वीडियो",
    "mega.headphones": "हेडफोन",
    "mega.speakers": "स्पीकर",
    "mega.tvTheater": "टीवी और होम थिएटर",
    "mega.microphones": "माइक्रोफोन",
    "mega.featuredDeal": "विशेष ऑफर",
    "mega.productTitle": "वायरलेस ईयरबड्स प्रो",
    "mega.priceNow": "अब ₹79",
    "mega.seeOffer": "ऑफर देखें",
    "hero.event": "मेगा इलेक्ट्रॉनिक्स सेल",
    "hero.headline": "लैपटॉप, मोबाइल और एक्सेसरी पर 60% तक की छूट",
    "hero.shopNow": "अभी खरीदें",
    "quick.homeEntertainment": "होम एंटरटेनमेंट",
    "quick.homeEntertainmentDesc": "4K टीवी, साउंडबार और स्ट्रीमिंग गियर।",
    "quick.gamingZone": "गेमिंग ज़ोन",
    "quick.gamingZoneDesc": "कंसोल, RGB एक्सेसरी और प्रो हेडसेट।",
    "quick.workFromHome": "वर्क फ्रॉम होम",
    "quick.workFromHomeDesc": "मॉनिटर, वेबकैम, कीबोर्ड और ऑफिस सेट।",
    "quick.mobileEssentials": "मोबाइल जरूरी सामान",
    "quick.mobileEssentialsDesc": "फोन, चार्जर, कवर और पावर बैंक।",
    "products.sectionTitle": "प्रोडक्ट लिस्टिंग",
    "products.b2cTitle": "B2C प्रोडक्ट",
    "products.b2bTitle": "B2B प्रोडक्ट",
    "products.showing": "दिखा रहे हैं",
    "products.b2cListLabel": "B2C प्रोडक्ट",
    "products.b2bListLabel": "B2B प्रोडक्ट",
    "products.addToCart": "कार्ट में जोड़ें",
    "products.bulkMin": "न्यूनतम ऑर्डर",
    "stores.title": "हमारे स्टोर्स",
    "stores.subtitle": "अपने पास का इलेक्ट्रोमार्ट स्टोर देखें",
    "stores.visit": "स्टोर देखें",
    "stores.ny.city": "नई दिल्ली फ्लैगशिप",
    "stores.ny.address": "नेहरू प्लेस, नई दिल्ली, दिल्ली",
    "stores.ny.hours": "खुला: सुबह 10 बजे - रात 9 बजे",
    "stores.la.city": "मुंबई सेंट्रल",
    "stores.la.address": "लैमिंगटन रोड, मुंबई, महाराष्ट्र",
    "stores.la.hours": "खुला: सुबह 10 बजे - रात 9 बजे",
    "stores.chi.city": "बेंगलुरु टेक हब",
    "stores.chi.address": "एसपी रोड, बेंगलुरु, कर्नाटक",
    "stores.chi.hours": "खुला: सुबह 10 बजे - रात 9 बजे",
    "footer.backToTop": "ऊपर जाएं",
    "footer.getToKnowUs": "हमारे बारे में जानें",
    "footer.about": "परिचय",
    "footer.careers": "करियर",
    "footer.press": "प्रेस",
    "footer.makeMoney": "हमारे साथ कमाएं",
    "footer.sellProducts": "प्रोडक्ट बेचें",
    "footer.affiliate": "एफिलिएट बनें",
    "footer.advertise": "विज्ञापन करें",
    "footer.help": "मदद",
    "footer.yourAccount": "आपका अकाउंट",
    "footer.shippingRates": "शिपिंग दरें",
    "footer.returns": "रिटर्न",
    "footer.copyright": "© 2026 इलेक्ट्रोमार्ट क्लोन अनुभव",
    "categoryFilter.all": "सभी कैटलॉग",
    "categoryFilter.computer": "कंप्यूटर",
    "categoryFilter.laptop": "लैपटॉप",
    "categoryFilter.printer": "प्रिंटर",
    "categoryFilter.mobile": "मोबाइल",
    "categoryFilter.audio": "ऑडियो",
    "categoryFilter.accessory": "एक्सेसरी"
  }
};

const languageFallbackMap = {
  ta: "hi",
  te: "hi",
  kn: "hi",
  ml: "hi",
  bn: "hi",
  mr: "hi"
};

function getLanguagePack(lang) {
  if (translations[lang]) {
    return translations[lang];
  }
  const fallbackLang = languageFallbackMap[lang];
  if (fallbackLang && translations[fallbackLang]) {
    return translations[fallbackLang];
  }
  return translations.en || {};
}

function t(key) {
  const selected = getLanguagePack(currentLang);
  const english = translations.en || {};
  return selected[key] || english[key] || key;
}

function formatLocationLabel(preference) {
  const city = String(preference.city || "").trim();
  const postal = String(preference.postal || "").trim();
  return [city, postal].filter(Boolean).join(" ").trim();
}

function loadLocationPreference() {
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === "object") {
      const city = String(parsed.city || "").trim();
      const postal = String(parsed.postal || "").trim();
      if (city) {
        return { city, postal };
      }
    }
  } catch (error) {
    return { city: "New Delhi", postal: "110001" };
  }
  return { city: "New Delhi", postal: "110001" };
}

function saveLocationPreference(preference) {
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(preference));
  } catch (error) {
    return;
  }
}

function loadLanguagePreference() {
  try {
    const value = String(localStorage.getItem(LANGUAGE_STORAGE_KEY) || "").trim().toLowerCase();
    if (!value) {
      return "en";
    }
    if (translations[value] || languageFallbackMap[value]) {
      return value;
    }
    return "en";
  } catch (error) {
    return "en";
  }
}

function saveLanguagePreference(lang) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, String(lang || "en").toLowerCase());
  } catch (error) {
    return;
  }
}

function syncLocationLabel() {
  const preference = loadLocationPreference();
  const label = formatLocationLabel(preference) || "New Delhi 110001";
  if (deliveryLocationText) {
    deliveryLocationText.textContent = label;
  }
}

function closeLocationModal() {
  if (!locationModal) {
    return;
  }
  locationModal.hidden = true;
  document.body.classList.remove("modal-open");
  if (locationTrigger) {
    locationTrigger.focus();
  }
}

function openLocationModal() {
  if (!locationModal || !locationCity || !locationPostal) {
    return;
  }
  const preference = loadLocationPreference();
  locationCity.value = preference.city || "New Delhi";
  locationPostal.value = preference.postal || "";
  locationModal.hidden = false;
  document.body.classList.add("modal-open");
  locationCity.focus();
}

function handleLocationSave() {
  if (!locationCity || !locationPostal) {
    return;
  }
  const city = locationCity.value.trim() || "New Delhi";
  const postal = locationPostal.value.replace(/[^0-9A-Za-z -]/g, "").trim();
  const preference = { city, postal };
  saveLocationPreference(preference);
  syncLocationLabel();
  closeLocationModal();
}

function initLocationPicker() {
  syncLocationLabel();

  if (!locationTrigger || !locationModal || !locationCancel || !locationSave) {
    return;
  }

  locationTrigger.addEventListener("click", openLocationModal);
  locationCancel.addEventListener("click", closeLocationModal);
  locationSave.addEventListener("click", handleLocationSave);

  locationModal.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-location-modal]")) {
      closeLocationModal();
    }
  });
}

function loadCartMap() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch (error) {
    return {};
  }
}

function loadCatalogMap() {
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch (error) {
    return {};
  }
}

function saveCatalogMap(catalogMap) {
  try {
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(catalogMap));
  } catch (error) {
    return;
  }
}

function cacheCatalogProducts(productsList) {
  if (!Array.isArray(productsList) || !productsList.length) {
    return;
  }
  const next = loadCatalogMap();
  let changed = false;
  productsList.forEach((product) => {
    if (!product || !product.id) {
      return;
    }
    const key = String(product.id).trim();
    if (!key) {
      return;
    }
    const existing = next[key] || {};
    next[key] = {
      ...existing,
      ...product,
      id: key,
      name: product.name || existing.name || `Product #${key}`,
      price: Number(product.price ?? existing.price ?? 0),
      listPrice: Number(product.listPrice ?? existing.listPrice ?? product.price ?? 0),
      rating: Number(product.rating ?? existing.rating ?? 0),
      stock: Number(product.stock ?? existing.stock ?? 0),
      moq: Number(product.moq ?? existing.moq ?? 0),
      image: product.image || existing.image || FALLBACK_IMAGE_URL,
      images: Array.isArray(product.images) ? product.images : (Array.isArray(existing.images) ? existing.images : []),
      videos: Array.isArray(product.videos) ? product.videos : (Array.isArray(existing.videos) ? existing.videos : []),
      media: Array.isArray(product.media) ? product.media : (Array.isArray(existing.media) ? existing.media : []),
      keywords: Array.isArray(product.keywords) ? product.keywords : (Array.isArray(existing.keywords) ? existing.keywords : []),
      description: String(product.description ?? existing.description ?? "").trim(),
      sku: String(product.sku ?? existing.sku ?? "").trim(),
      status: String(product.status ?? existing.status ?? "active"),
      fulfillment: String(product.fulfillment ?? existing.fulfillment ?? "fbm"),
      featured: Boolean(product.featured ?? existing.featured ?? false),
      collections: Array.isArray(product.collections) ? product.collections : (Array.isArray(existing.collections) ? existing.collections : []),
      createdAt: String(product.createdAt ?? existing.createdAt ?? "").trim(),
      updatedAt: String(product.updatedAt ?? existing.updatedAt ?? "").trim()
    };
    changed = true;
  });
  if (changed) {
    saveCatalogMap(next);
  }
}

function normalizeHomeCategory(value) {
  const raw = String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (raw === "accessories") {
    return "accessory";
  }
  if (raw === "computers") {
    return "computer";
  }
  if (raw === "mobiles") {
    return "mobile";
  }
  return raw;
}

function buildHomeCategorySignalText(product) {
  const parts = [];
  const append = (value) => {
    if (Array.isArray(value)) {
      value.forEach(append);
      return;
    }
    const text = String(value || "").trim().toLowerCase();
    if (text) {
      parts.push(text);
    }
  };
  append(product?.category);
  append(product?.collections);
  append(product?.keywords);
  append(product?.name);
  append(product?.brand);
  return parts.join(" ").replace(/[^a-z0-9]+/g, " ");
}

function inferHomeCategory(product) {
  const fallbackCategory = normalizeHomeCategory(product?.category || "");
  const signal = buildHomeCategorySignalText(product);

  if (/(printer|plotter|scanner|ink|toner|cartridge|label printer|all printer)/.test(signal)) {
    return "printer";
  }
  if (/(headphone|headset|earbud|earphone|speaker|soundbar|microphone|audio|home theater)/.test(signal)) {
    return "audio";
  }
  if (/(battery|keyboard|adapter|charger|cable|case|cover|power bank|mouse|pendrive|ssd enclosure|cooler|fan|dock|hub|bag|accessory)/.test(signal)) {
    return "accessory";
  }
  if (/(desktop|workstation|cabinet|all in one|aio|monitor|computer|gaming pc|office tower|assembled pc|mini pc)/.test(signal)) {
    return "computer";
  }
  if (/(mobile|smartphone|phone|tablet|wearable|smartwatch|watch)/.test(signal)) {
    return "mobile";
  }
  if (/(laptop|notebook|macbook|chromebook)/.test(signal)) {
    return "laptop";
  }

  if (["laptop", "mobile", "audio", "accessory", "computer", "printer"].includes(fallbackCategory)) {
    return fallbackCategory;
  }
  return "accessory";
}

function mapHomeCatalogProduct(item) {
  if (!item || !item.id) {
    return null;
  }
  const status = String(item.status || "active").toLowerCase();
  if (status !== "active") {
    return null;
  }
  const normalizedPrice = Number(item.price || 0);
  if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
    return null;
  }
  const category = inferHomeCategory(item);
  return {
    id: String(item.id),
    name: String(item.name || `Product #${item.id}`).trim(),
    brand: String(item.brand || "Generic").trim(),
    segment: String(item.segment || "b2c").toLowerCase(),
    category,
    rawCategory: normalizeHomeCategory(item.category || category || "accessory"),
    collections: Array.isArray(item.collections) ? item.collections.slice(0, 8) : [],
    price: normalizedPrice,
    listPrice: Number(item.listPrice || item.price || 0),
    rating: Number(item.rating || 0),
    stock: Number(item.stock),
    moq: Number(item.moq || 0),
    image: normalizeImageUrl(item.image) || FALLBACK_IMAGE_URL,
    featured: Boolean(item.featured),
    description: String(item.description || "").trim(),
    keywords: Array.isArray(item.keywords) ? item.keywords : [],
    createdAt: String(item.createdAt || "").trim(),
    updatedAt: String(item.updatedAt || "").trim()
  };
}

function loadHomeCatalogProductsList() {
  return Object.values(loadCatalogMap())
    .map(mapHomeCatalogProduct)
    .filter(Boolean);
}

function mergeHomeProducts(...lists) {
  const merged = new Map();
  lists.flat().forEach((item) => {
    const normalized = mapHomeCatalogProduct(item);
    if (!normalized) {
      return;
    }
    merged.set(String(normalized.id), normalized);
  });
  return Array.from(merged.values());
}

function getHomeProducts() {
  const localCatalogProducts = loadHomeCatalogProductsList();
  return mergeHomeProducts(products, localCatalogProducts, homeApiProducts);
}

async function fetchHomeProductsFromApi() {
  if (homeCatalogRequested && !homeProductsFetchPromise) {
    return homeApiProducts;
  }
  if (homeProductsFetchPromise) {
    return homeProductsFetchPromise;
  }

  homeCatalogRequested = true;
  homeProductsFetchPromise = (async () => {
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/products?status=active`);
    } catch (error) {
      return homeApiProducts;
    }

    const data = await response.json().catch(() => null);
    if (!response.ok || !data || !Array.isArray(data.products)) {
      return homeApiProducts;
    }

    cacheCatalogProducts(data.products);
    homeApiProducts = mergeHomeProducts(data.products);
    renderHomeSurface();
    return homeApiProducts;
  })();

  try {
    return await homeProductsFetchPromise;
  } finally {
    homeProductsFetchPromise = null;
  }
}

function getReadableCategoryLabel(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "Others";
  }
  const lower = raw.toLowerCase();
  const knownLabelMap = {
    computer: t("categoryFilter.computer"),
    laptop: t("categoryFilter.laptop"),
    printer: t("categoryFilter.printer"),
    mobile: t("categoryFilter.mobile"),
    audio: t("categoryFilter.audio"),
    accessory: t("categoryFilter.accessory")
  };
  if (knownLabelMap[lower]) {
    return knownLabelMap[lower];
  }
  return raw
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function syncCategoryFilterOptions(sourceProducts) {
  if (!categoryFilter) {
    return;
  }
  const activeValue = String(categoryFilter.value || "all").trim() || "all";
  const categorySet = new Set();
  sourceProducts.forEach((item) => {
    const category = normalizeHomeCategory(item?.category);
    if (category) {
      categorySet.add(category);
    }
  });
  const categories = Array.from(categorySet).sort((a, b) => a.localeCompare(b));
  const optionsMarkup = [
    `<option id="catAll" value="all">${t("categoryFilter.all")}</option>`,
    ...categories.map((category) => `<option value="${category}">${getReadableCategoryLabel(category)}</option>`)
  ].join("");
  categoryFilter.innerHTML = optionsMarkup;
  const nextValue = categories.includes(activeValue) || activeValue === "all" ? activeValue : "all";
  categoryFilter.value = nextValue;
}

function saveCartMap(cartMap) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartMap));
  } catch (error) {
    return;
  }
}

function loadWishlistIds() {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((item) => String(item).trim()).filter(Boolean) : [];
  } catch (error) {
    return [];
  }
}

function saveWishlistIds(ids) {
  try {
    const uniqueIds = Array.from(new Set(ids.map((item) => String(item).trim()).filter(Boolean)));
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(uniqueIds));
  } catch (error) {
    return;
  }
}

function isWishlisted(productId) {
  return loadWishlistIds().includes(String(productId));
}

function toggleWishlist(productId) {
  const key = String(productId).trim();
  if (!key) {
    return false;
  }
  const ids = loadWishlistIds();
  if (ids.includes(key)) {
    saveWishlistIds(ids.filter((item) => item !== key));
    return false;
  }
  saveWishlistIds([key, ...ids]);
  return true;
}

function loadRecentlyViewedIds() {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((item) => String(item).trim()).filter(Boolean) : [];
  } catch (error) {
    return [];
  }
}

function getProductShortDescription(product) {
  const raw = String(product?.description || "").trim();
  if (raw) {
    return raw.replace(/\s+/g, " ").slice(0, 160);
  }
  return `${product?.brand || "ElectroMart"} ${getReadableCategoryLabel(product?.category)} picks with trusted ratings, fast delivery options and buyer-friendly pricing.`;
}

function loadSearchHistory() {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((item) => String(item).trim()).filter(Boolean) : [];
  } catch (error) {
    return [];
  }
}

function saveSearchHistory(entries) {
  try {
    const unique = Array.from(new Set(entries.map((item) => String(item).trim()).filter(Boolean)));
    localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(unique.slice(0, 6)));
  } catch (error) {
    return;
  }
}

function rememberSearchQuery(query) {
  const value = String(query || "").trim();
  if (!value) {
    return;
  }
  saveSearchHistory([value, ...loadSearchHistory()]);
}

function getProductStockState(product) {
  const stock = Number(product?.stock);
  if (Number.isFinite(stock)) {
    if (stock <= 0) {
      return { rank: 2, label: "Out of stock" };
    }
    if (stock <= 3) {
      return { rank: 1, label: `Low stock: ${stock} left` };
    }
    return { rank: 0, label: "In stock" };
  }
  return { rank: 0, label: "In stock" };
}

function syncCartCount() {
  const cartMap = loadCartMap();
  cart = Object.values(cartMap).reduce((sum, qty) => sum + Number(qty || 0), 0);
  cartCount.textContent = String(cart);
}

function addProductToCart(productId) {
  const cartMap = loadCartMap();
  const key = String(productId);
  cartMap[key] = (Number(cartMap[key]) || 0) + 1;
  saveCartMap(cartMap);
  syncCartCount();
}

function money(value) {
  return inrFormatter.format(Number(value || 0));
}

function normalizeImageUrl(value) {
  const rawValue = String(value || "").trim();
  if (rawValue.startsWith("data:image/") || rawValue.startsWith("data:video/")) {
    return rawValue;
  }
  const raw = rawValue.includes(";") || rawValue.includes("|")
    ? (rawValue.split(/[;|]/).map((item) => item.trim()).find(Boolean) || "")
    : rawValue;
  if (!raw) {
    return "";
  }
  if (raw.startsWith("data:image/")) {
    return raw;
  }
  if (raw.startsWith("blob:")) {
    return raw;
  }
  if (raw.startsWith("/")) {
    return raw;
  }

  const isLikelyDomainWithoutProtocol = /^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(raw);
  let normalized = raw;
  if (normalized.startsWith("//")) {
    normalized = `https:${normalized}`;
  } else if (!/^https?:\/\//i.test(normalized) && isLikelyDomainWithoutProtocol) {
    normalized = `https://${normalized}`;
  } else if (!/^https?:\/\//i.test(normalized)) {
    return normalized;
  }
  try {
    const url = new URL(normalized);
    const host = url.hostname.toLowerCase();
    if (host.includes("drive.google.com")) {
      const fileId = url.searchParams.get("id") || url.pathname.split("/d/")[1]?.split("/")[0];
      if (fileId) {
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
    }
    if (host.includes("dropbox.com")) {
      url.searchParams.delete("dl");
      url.searchParams.set("raw", "1");
      return url.toString();
    }
    return url.toString();
  } catch (error) {
    return "";
  }
}

function getRibbonLabel(product) {
  if (product.featured) {
    return "Featured";
  }
  if (Number(product.rating || 0) >= 4.7) {
    return "Top Rated";
  }
  return "";
}

function getCategoryLandingLink(category) {
  const normalized = normalizeHomeCategory(category);
  const knownPageMap = {
    laptop: "laptop.html",
    mobile: "products.html?category=mobile",
    audio: "products.html?category=audio",
    accessory: "products.html?category=accessory",
    desktops: "desktops.html",
    printers: "printer.html",
    printer: "printer.html"
  };
  return knownPageMap[normalized] || `catalogs.html?category=${encodeURIComponent(normalized || "all")}`;
}

function countProductsWithDiscount(items) {
  return items.filter((item) => Number(item.listPrice || item.price || 0) > Number(item.price || 0)).length;
}

function getStartingPrice(items) {
  const prices = items
    .map((item) => Number(item.price || 0))
    .filter((price) => Number.isFinite(price) && price > 0);
  if (!prices.length) {
    return 0;
  }
  return Math.min(...prices);
}

function getHighestRating(items) {
  const ratings = items
    .map((item) => Number(item.rating || 0))
    .filter((rating) => Number.isFinite(rating) && rating > 0);
  if (!ratings.length) {
    return 0;
  }
  return Math.max(...ratings);
}

function getHomeRatingBadge(items) {
  const rating = getHighestRating(items);
  if (rating <= 0) {
    return "New in";
  }
  return `${rating.toFixed(1)} star`;
}

function getUniqueCollectionCount(items) {
  const tokens = new Set();
  items.forEach((item) => {
    [item?.category, ...(Array.isArray(item?.collections) ? item.collections : [])]
      .map((value) => normalizeHomeCategory(value))
      .filter(Boolean)
      .forEach((token) => tokens.add(token));
  });
  return tokens.size;
}

function renderQuickGrid(sourceProducts) {
  const quickGrid = document.querySelector(".quick-grid");
  if (!quickGrid) {
    return;
  }

  const categoryMap = new Map();
  sourceProducts.forEach((item) => {
    const category = normalizeHomeCategory(item?.category);
    if (!category) {
      return;
    }
    const bucket = categoryMap.get(category) || [];
    bucket.push(item);
    categoryMap.set(category, bucket);
  });

  const entries = Array.from(categoryMap.entries())
    .map(([category, items]) => ({
      category,
      label: getReadableCategoryLabel(category),
      liveCount: items.length,
      startingPrice: getStartingPrice(items),
      highestRating: getHighestRating(items),
      items: items
        .slice()
        .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
        .slice(0, 2)
    }))
    .filter((entry) => entry.items.length > 0)
    .sort((a, b) => {
      const categoryPriority = {
        laptop: 6,
        computer: 5,
        mobile: 4,
        audio: 3,
        accessory: 2,
        printer: 1
      };
      const priorityDiff = (categoryPriority[b.category] || 0) - (categoryPriority[a.category] || 0);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      return b.liveCount - a.liveCount;
    });

  const creatorItems = getHomeCollectionProducts(sourceProducts, "creator-studio");
  const creatorCard = creatorItems.length ? `
      <article class="home-card creator-card">
        <p class="home-card-kicker">Fresh collection</p>
        <h2>Creator Studio</h2>
        <p class="home-card-meta">${creatorItems.length} creator-ready picks - From ${money(getStartingPrice(creatorItems))}</p>
        <div class="home-card-badges">
          <span class="home-card-badge">${getUniqueCollectionCount(creatorItems)} merch lanes</span>
          <span class="home-card-badge">${getHomeRatingBadge(creatorItems)} top rated</span>
        </div>
        <div class="home-card-grid">
          ${creatorItems.slice(0, 2).map((item) => {
            const image = normalizeImageUrl(item.image) || FALLBACK_IMAGE_URL;
            return `<img src="${image}" alt="${item.name}" loading="lazy" />`;
          }).join("")}
        </div>
        <div class="home-card-footer">
          <span class="home-card-proof">Editing, streaming, and design-ready</span>
          <a href="creator-studio.html" class="home-card-link">Build your setup</a>
        </div>
      </article>
    ` : "";

  const visibleEntries = entries.slice(0, creatorCard ? 2 : 3);

  const cards = visibleEntries.map((entry) => {
    const images = entry.items.map((item) => {
      const image = normalizeImageUrl(item.image) || FALLBACK_IMAGE_URL;
      return `<img src="${image}" alt="${item.name}" loading="lazy" />`;
    }).join("");

    return `
      <article class="home-card">
        <p class="home-card-kicker">${entry.liveCount} live now</p>
        <h2>${entry.label} Picks</h2>
        <p class="home-card-meta">From ${money(entry.startingPrice)} - ${getHomeRatingBadge(entry.items)} confidence</p>
        <div class="home-card-badges">
          <span class="home-card-badge">${entry.liveCount} active picks</span>
          <span class="home-card-badge">From ${money(entry.startingPrice)}</span>
        </div>
        <div class="home-card-grid">${images}</div>
        <div class="home-card-footer">
          <span class="home-card-proof">${getHomeRatingBadge(entry.items)} top rated</span>
          <a href="${getCategoryLandingLink(entry.category)}" class="home-card-link">See more</a>
        </div>
      </article>
    `;
  }).join("");

  const signInCard = `
    <article class="home-card sign-card">
      <p class="home-card-kicker">Account benefits</p>
      <h2>Sign in for best experience</h2>
      <p>Track orders, save creator picks, and keep your recent shopping synced across every page.</p>
      <div class="home-card-badges">
        <span class="home-card-badge">Wishlist sync</span>
        <span class="home-card-badge">Faster reorder</span>
      </div>
      <a href="auth.html" class="signin-btn">Sign in securely</a>
    </article>
  `;

  if (cards || creatorCard) {
    quickGrid.innerHTML = `${cards}${creatorCard}${signInCard}`;
  }
}

function renderDealStrip(sourceProducts) {
  const row = document.querySelector(".deal-strip-row");
  if (!row) {
    return;
  }
  const dealProducts = sourceProducts
    .filter((item) => item.segment !== "b2b")
    .slice()
    .sort((a, b) => {
      const aDiscount = Math.max(0, Number(a.listPrice || a.price || 0) - Number(a.price || 0));
      const bDiscount = Math.max(0, Number(b.listPrice || b.price || 0) - Number(b.price || 0));
      const savingsDiff = bDiscount - aDiscount;
      if (Math.abs(savingsDiff) > 0) {
        return savingsDiff;
      }
      const featuredDiff = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      if (featuredDiff !== 0) {
        return featuredDiff;
      }
      const ratingDiff = Number(b.rating || 0) - Number(a.rating || 0);
      if (Math.abs(ratingDiff) > 0.05) {
        return ratingDiff;
      }
      return Number(a.price || 0) - Number(b.price || 0);
    })
    .slice(0, 4);

  if (!dealProducts.length) {
    return;
  }

  row.innerHTML = dealProducts.map((item) => {
    const image = normalizeImageUrl(item.image) || FALLBACK_IMAGE_URL;
    const listPrice = Number(item.listPrice || item.price || 0);
    const livePrice = Number(item.price || 0);
    const savings = Math.max(0, listPrice - livePrice);
    const discountPercent = listPrice > livePrice ? Math.round(((listPrice - livePrice) / listPrice) * 100) : 0;
    const badge = discountPercent > 0 ? `${discountPercent}% off` : "Top pick";
    const kicker = item.featured ? "Featured deal" : getReadableCategoryLabel(item.category);
    const priceMeta = savings > 0
      ? `Was ${money(listPrice)} - Save ${money(savings)}`
      : `${Number(item.rating || 0).toFixed(1)} star rated - ${item.brand || "ElectroMart"}`;
    const deliveryMeta = item.featured
      ? "Fast delivery eligible on featured stock"
      : `${item.brand || "ElectroMart"} deal now live`;
    return `
      <a href="product-detail.html?id=${encodeURIComponent(item.id)}" class="deal-tile" aria-label="Open ${item.name} deal">
        <img src="${image}" alt="${item.name}" loading="lazy" />
        <small class="deal-kicker">${kicker}</small>
        <h3>${item.name}</h3>
        <p class="deal-price-line"><span>${badge}</span> Now ${money(livePrice)}</p>
        <small class="deal-price-meta">${priceMeta}</small>
        <small class="deal-delivery-note">${deliveryMeta}</small>
      </a>
    `;
  }).join("");
}

function getHeroBackdrop(category, product) {
  const normalized = normalizeHomeCategory(category);
  const visualMap = {
    "creator-studio": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1800&q=80",
    laptop: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1800&q=80",
    mobile: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1800&q=80",
    audio: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1800&q=80",
    accessory: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1800&q=80",
    printer: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=1800&q=80",
    computer: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=1800&q=80",
    desktops: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=1800&q=80"
  };
  return visualMap[normalized] || normalizeImageUrl(product?.image) || FALLBACK_IMAGE_URL;
}

function buildHeroSlides(sourceProducts) {
  const slides = [];
  const creatorItems = getHomeCollectionProducts(sourceProducts, "creator-studio");
  if (creatorItems.length) {
    const featuredCreator = creatorItems[0];
    slides.push({
      id: "creator-studio-launch",
      eyebrow: "Just launched",
      title: "Creator Studio setups built for editing, streaming, and sharper desks",
      description: `${creatorItems.length} creator-ready products are live now across ${getUniqueCollectionCount(creatorItems)} shopping paths. ${featuredCreator?.name || "Creator Studio"} leads the collection with premium-ready confidence.`,
      pills: ["Creator Studio", `From ${money(getStartingPrice(creatorItems))}`, `${getHomeRatingBadge(creatorItems)} top rated`],
      stats: [
        { label: "Live picks", value: `${creatorItems.length}` },
        { label: "Starting at", value: money(getStartingPrice(creatorItems)) },
        { label: "Top rating", value: getHomeRatingBadge(creatorItems) }
      ],
      actions: [
        { href: "creator-studio.html", label: "Explore Creator Studio", secondary: false },
        { href: featuredCreator ? `product-detail.html?id=${encodeURIComponent(featuredCreator.id)}` : "products.html?search=creator", label: "View featured creator pick", secondary: true }
      ],
      backgroundImage: getHeroBackdrop("creator-studio", featuredCreator)
    });
  }

  const categories = new Map();
  sourceProducts.forEach((item) => {
    if (item.segment === "b2b") {
      return;
    }
    const category = normalizeHomeCategory(item.category);
    if (!category) {
      return;
    }
    const bucket = categories.get(category) || [];
    bucket.push(item);
    categories.set(category, bucket);
  });

  const ranked = Array.from(categories.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, creatorItems.length ? 2 : 3);

  if (!ranked.length && !slides.length) {
    return [];
  }

  ranked.forEach(([category, items], index) => {
    const featured = items
      .slice()
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0) || Number(a.price || 0) - Number(b.price || 0))[0];
    const label = getReadableCategoryLabel(category);
    slides.push({
      id: `${category}-${index}`,
      eyebrow: index === 0 && !creatorItems.length ? "Today’s headline offer" : "Trending right now",
      title: `${label} deals built for fast checkout`,
      description: `${items.length} options live now. ${featured?.name || label} is leading this category with strong ratings and ready-to-ship pricing.`,
      pills: [label, featured?.brand || "ElectroMart", `From ${money(getStartingPrice(items))}`],
      stats: [
        { label: "Live now", value: `${items.length}` },
        { label: "Starting at", value: money(getStartingPrice(items)) },
        { label: "Top rating", value: getHomeRatingBadge(items) }
      ],
      actions: [
        { href: getCategoryLandingLink(category), label: `Shop ${label}`, secondary: false },
        { href: featured ? `product-detail.html?id=${encodeURIComponent(featured.id)}` : "products.html", label: "View featured pick", secondary: true }
      ],
      backgroundImage: getHeroBackdrop(category, featured)
    });
  });
  return slides.slice(0, 3);
}

function stopHeroAutoplay() {
  if (heroAutoplayTimer) {
    window.clearInterval(heroAutoplayTimer);
    heroAutoplayTimer = 0;
  }
}

function startHeroAutoplay() {
  stopHeroAutoplay();
  if (heroSlides.length <= 1 || !heroTrack) {
    return;
  }
  heroAutoplayTimer = window.setInterval(() => {
    setHeroSlide(currentHeroIndex + 1);
  }, 5000);
}

function setHeroSlide(index) {
  if (!heroSlides.length || !heroTrack) {
    return;
  }
  currentHeroIndex = (index + heroSlides.length) % heroSlides.length;
  heroTrack.style.transform = `translateX(-${currentHeroIndex * 100}%)`;
  if (heroDots) {
    Array.from(heroDots.querySelectorAll(".hero-dot")).forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === currentHeroIndex);
    });
  }
}

function renderHeroSection(sourceProducts) {
  if (!heroTrack || !heroDots) {
    return;
  }
  heroSlides = buildHeroSlides(sourceProducts);
  if (!heroSlides.length) {
    heroTrack.innerHTML = "";
    heroDots.innerHTML = "";
    return;
  }

  heroTrack.innerHTML = heroSlides.map((slide) => `
    <article class="hero-slide" style="background-image:url('${slide.backgroundImage}')">
      <div class="hero-content">
        <p>${slide.eyebrow}</p>
        <h1>${slide.title}</h1>
        <div class="hero-pills">
          ${slide.pills.map((pill) => `<span>${pill}</span>`).join("")}
        </div>
        <p>${slide.description}</p>
        <div class="hero-stats">
          ${Array.isArray(slide.stats) ? slide.stats.map((stat) => `
            <div class="hero-stat">
              <strong>${stat.value}</strong>
              <span>${stat.label}</span>
            </div>
          `).join("") : ""}
        </div>
        <div class="hero-actions">
          ${slide.actions.map((action) => `<a href="${action.href}" class="hero-btn${action.secondary ? " secondary" : ""}">${action.label}</a>`).join("")}
        </div>
      </div>
    </article>
  `).join("");

  heroDots.innerHTML = heroSlides.map((slide, index) => `
    <button class="hero-dot${index === 0 ? " active" : ""}" type="button" data-hero-index="${index}" aria-label="Go to slide ${index + 1}"></button>
  `).join("");
  setHeroSlide(0);
  startHeroAutoplay();
}

function getProductRecencyScore(product) {
  const createdAtMs = Date.parse(String(product?.createdAt || "").trim());
  if (Number.isFinite(createdAtMs) && createdAtMs > 0) {
    return createdAtMs;
  }
  const updatedAtMs = Date.parse(String(product?.updatedAt || "").trim());
  if (Number.isFinite(updatedAtMs) && updatedAtMs > 0) {
    return updatedAtMs;
  }
  const idMatch = String(product?.id || "").match(/(\d{10,})$/);
  if (idMatch) {
    const fromId = Number(idMatch[1]);
    if (Number.isFinite(fromId) && fromId > 0) {
      return fromId;
    }
  }
  return 0;
}

function isCatalogManagedProduct(product) {
  const key = String(product?.id || "");
  return /^product_\d+$/i.test(key) || Boolean(String(product?.createdAt || "").trim());
}

function renderNewArrivalsWindow(sourceProducts) {
  if (!newArrivalsGrid || !newArrivalsMeta) {
    return;
  }
  const catalogManaged = sourceProducts.filter(isCatalogManagedProduct);
  const ranked = (catalogManaged.length ? catalogManaged : sourceProducts.slice())
    .sort((a, b) => {
      const recencyDiff = getProductRecencyScore(b) - getProductRecencyScore(a);
      if (Math.abs(recencyDiff) > 0) {
        return recencyDiff;
      }
      return Number(b.rating || 0) - Number(a.rating || 0);
    })
    .slice(0, HOME_NEW_ARRIVALS_LIMIT);

  if (!ranked.length) {
    newArrivalsGrid.innerHTML = "<p class='new-arrivals-empty'>No new products yet.</p>";
    newArrivalsMeta.textContent = "Showing 0 products";
    return;
  }

  newArrivalsGrid.innerHTML = ranked.map(productCard).join("");
  newArrivalsMeta.textContent = `Showing ${ranked.length} latest products`;
}

function getRecentlyViewedProducts(sourceProducts) {
  const sourceMap = new Map(sourceProducts.map((item) => [String(item.id), item]));
  return loadRecentlyViewedIds()
    .map((id) => sourceMap.get(String(id)))
    .filter((item) => item && item.segment !== "b2b")
    .slice(0, HOME_CURATED_LIST_LIMIT);
}

function getRecommendedProducts(sourceProducts) {
  const preferredCategories = new Set();
  getRecentlyViewedProducts(sourceProducts).forEach((item) => {
    const category = normalizeHomeCategory(item.category);
    if (category) {
      preferredCategories.add(category);
    }
  });

  Object.keys(loadCartMap()).forEach((id) => {
    const match = sourceProducts.find((item) => String(item.id) === String(id));
    const category = normalizeHomeCategory(match?.category);
    if (category) {
      preferredCategories.add(category);
    }
  });

  return sourceProducts
    .filter((item) => item.segment !== "b2b")
    .map((item) => {
      let score = Number(item.rating || 0);
      if (preferredCategories.has(normalizeHomeCategory(item.category))) {
        score += 3;
      }
      if (item.featured) {
        score += 1.5;
      }
      if (isWishlisted(item.id)) {
        score += 1;
      }
      return { item, score };
    })
    .sort((a, b) => b.score - a.score || Number(a.item.price || 0) - Number(b.item.price || 0))
    .map((entry) => entry.item)
    .slice(0, HOME_CURATED_LIST_LIMIT);
}

function renderCuratedSection(targetGrid, items, emptyMessage) {
  if (!targetGrid) {
    return;
  }
  if (!items.length) {
    targetGrid.innerHTML = `<p class="new-arrivals-empty">${emptyMessage}</p>`;
    return;
  }
  targetGrid.innerHTML = items.map(productCard).join("");
}

function renderTopRatedSection(sourceProducts) {
  const topRated = sourceProducts
    .filter((item) => item.segment !== "b2b")
    .slice()
    .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0) || Number(a.price || 0) - Number(b.price || 0))
    .slice(0, HOME_CURATED_LIST_LIMIT);
  renderCuratedSection(topRatedGrid, topRated, "No top rated products yet.");
}

function renderRecommendedSection(sourceProducts) {
  renderCuratedSection(recommendedGrid, getRecommendedProducts(sourceProducts), "No recommendations available yet.");
}
function hasHomeCollection(product, collectionToken) {
  const target = normalizeHomeCategory(collectionToken);
  if (!target) {
    return false;
  }
  const tokens = [product?.category, product?.rawCategory, ...(Array.isArray(product?.collections) ? product.collections : [])]
    .map((item) => normalizeHomeCategory(item))
    .filter(Boolean);
  return tokens.includes(target);
}

function getHomeCollectionProducts(sourceProducts, collectionToken) {
  return sourceProducts
    .filter((item) => item.segment !== "b2b")
    .filter((item) => hasHomeCollection(item, collectionToken))
    .slice()
    .sort((a, b) => {
      const featuredDiff = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      if (featuredDiff !== 0) {
        return featuredDiff;
      }
      const ratingDiff = Number(b.rating || 0) - Number(a.rating || 0);
      if (Math.abs(ratingDiff) > 0) {
        return ratingDiff;
      }
      return getProductRecencyScore(b) - getProductRecencyScore(a);
    });
}

function renderCreatorStudioSection(sourceProducts) {
  if (!creatorStudioSection || !creatorStudioGrid || !creatorStudioMeta) {
    return;
  }
  const creatorItems = getHomeCollectionProducts(sourceProducts, "creator-studio");
  const items = creatorItems.slice(0, HOME_CURATED_LIST_LIMIT);
  if (!items.length) {
    creatorStudioSection.hidden = true;
    creatorStudioGrid.innerHTML = "";
    creatorStudioMeta.textContent = "";
    if (creatorStudioStats) {
      creatorStudioStats.innerHTML = "";
    }
    return;
  }
  creatorStudioSection.hidden = false;
  creatorStudioGrid.innerHTML = items.map(productCard).join("");
  creatorStudioMeta.textContent = `${creatorItems.length} creator-ready products live now - From ${money(getStartingPrice(creatorItems))} across audio, display, and workflow picks.`;
  if (creatorStudioStats) {
    creatorStudioStats.innerHTML = [
      `${creatorItems.length} live now`,
      `From ${money(getStartingPrice(creatorItems))}`,
      `${getHomeRatingBadge(creatorItems)} top rating`
    ].map((value) => `<span class="collection-spotlight-stat">${value}</span>`).join("");
  }
}

function renderHomeMomentumBand(sourceProducts) {
  if (!homeMomentumBand) {
    return;
  }
  const retailProducts = sourceProducts.filter((item) => item.segment !== "b2b");
  const creatorItems = getHomeCollectionProducts(sourceProducts, "creator-studio");
  const discountedProducts = countProductsWithDiscount(retailProducts);
  const topRatedProducts = retailProducts.filter((item) => Number(item.rating || 0) >= 4.5).length;

  homeMomentumBand.innerHTML = `
    <article class="momentum-card momentum-card--primary">
      <p>Live catalog</p>
      <strong>${retailProducts.length}</strong>
      <span>Products ready to browse across our homepage, category pages, and featured rails.</span>
    </article>
    <article class="momentum-card">
      <p>Creator Studio</p>
      <strong>${creatorItems.length}</strong>
      <span>${creatorItems.length ? `Setup-ready picks from ${money(getStartingPrice(creatorItems))}` : "Fresh gear spotlighted as soon as it goes live."}</span>
    </article>
    <article class="momentum-card">
      <p>High-confidence shopping</p>
      <strong>${topRatedProducts}</strong>
      <span>Products rated 4.5 star and above, with ${discountedProducts} live markdowns in the mix.</span>
    </article>
  `;
}

function renderRecentlyViewedSection(sourceProducts) {
  if (!recentlyViewedSection || !recentlyViewedGrid) {
    return;
  }
  const items = getRecentlyViewedProducts(sourceProducts);
  if (!items.length) {
    recentlyViewedSection.hidden = true;
    recentlyViewedGrid.innerHTML = "";
    return;
  }
  recentlyViewedSection.hidden = false;
  renderCuratedSection(recentlyViewedGrid, items, "No recently viewed products yet.");
}

function syncQuickViewWishlistState(productId) {
  if (!quickViewWishlistBtn) {
    return;
  }
  const active = isWishlisted(productId);
  quickViewWishlistBtn.classList.toggle("active", active);
  quickViewWishlistBtn.textContent = active ? "Wishlisted" : "Save to Wishlist";
}

function closeQuickViewModal() {
  if (!quickViewModal) {
    return;
  }
  quickViewModal.hidden = true;
  document.body.classList.remove("quick-view-open");
}

function openQuickViewModal(productId) {
  if (!quickViewModal || !quickViewImage || !quickViewTitle || !quickViewAddBtn || !quickViewDetailsLink) {
    return;
  }
  const product = getHomeProducts().find((item) => String(item.id) === String(productId));
  if (!product) {
    return;
  }
  currentQuickViewProductId = String(product.id);
  quickViewImage.src = normalizeImageUrl(product.image) || FALLBACK_IMAGE_URL;
  quickViewImage.alt = product.name;
  quickViewEyebrow.textContent = getReadableCategoryLabel(product.category);
  quickViewTitle.textContent = product.name;
  quickViewRating.textContent = `${Number(product.rating || 0).toFixed(1)} ★ customer rating`;
  quickViewPrice.textContent = money(product.price);
  quickViewMeta.textContent = `Brand: ${product.brand || "ElectroMart"} | ${product.segment === "b2b" ? "Bulk order ready" : "Fast retail delivery"}`;
  quickViewDescription.textContent = getProductShortDescription(product);
  quickViewAddBtn.setAttribute("data-id", currentQuickViewProductId);
  quickViewDetailsLink.href = `product-detail.html?id=${encodeURIComponent(currentQuickViewProductId)}`;
  syncQuickViewWishlistState(currentQuickViewProductId);
  quickViewModal.hidden = false;
  document.body.classList.add("quick-view-open");
}

function productCard(product) {
  const detailUrl = `product-detail.html?id=${encodeURIComponent(product.id)}`;
  const image = normalizeImageUrl(product.image) || FALLBACK_IMAGE_URL;
  const ribbon = getRibbonLabel(product);
  const listPrice = Number(product.listPrice || product.price || 0);
  const price = Number(product.price || 0);
  const discountPercent = listPrice > price ? Math.round(((listPrice - price) / listPrice) * 100) : 0;
  const bulkMeta = product.segment === "b2b" && product.moq
    ? `<p class="bulk-meta">${t("products.bulkMin")}: ${product.moq}</p>`
    : "";
  const wishlisted = isWishlisted(product.id);
  const discountMeta = discountPercent > 0
    ? `<p class="price-meta"><span class="list-price-inline">${money(listPrice)}</span><span class="discount-badge">${discountPercent}% off</span></p>`
    : "";

  return `
    <article class="product-card">
      ${ribbon ? `<span class="card-ribbon">${ribbon}</span>` : ""}
      <a href="${detailUrl}" aria-label="Open ${product.name}">
        <img src="${image}" alt="${product.name}" loading="lazy" />
      </a>
      <div class="content">
        <h3><a href="${detailUrl}">${product.name}</a></h3>
        <div class="meta">
          <span class="price-stack">
            <span class="price">${money(price)}</span>
            ${discountMeta}
          </span>
          <span class="rating">${product.rating} ★</span>
        </div>
        ${bulkMeta}
        <div class="card-actions-inline">
          <button class="add-btn" data-id="${product.id}" type="button">${t("products.addToCart")}</button>
          <button class="wishlist-btn ${wishlisted ? "active" : ""}" data-wishlist-id="${product.id}" type="button">${wishlisted ? "Wishlisted" : "Wishlist"}</button>
          <button class="quick-view-link quick-view-btn" data-quick-view-id="${product.id}" type="button">Quick view</button>
        </div>
      </div>
    </article>
  `;
}

function renderSegmentProducts(list, targetGrid, targetMeta, labelKey) {
  if (!targetGrid) {
    return;
  }
  targetGrid.innerHTML = list.map(productCard).join("");
  if (targetMeta) {
    targetMeta.textContent = "";
    targetMeta.hidden = true;
  }
}

function storeCard(store) {
  return `
    <article class="store-card">
      <h3>${t(store.cityKey)}</h3>
      <p>${t(store.addressKey)}</p>
      <p class="store-hours">${t(store.hoursKey)}</p>
      <p>${store.phone}</p>
      <button type="button">${t("stores.visit")}</button>
    </article>
  `;
}

function renderStores() {
  storeGrid.innerHTML = stores.map(storeCard).join("");
}

function matchesSmartKeyword(product, keyword) {
  if (!keyword) {
    return true;
  }

  if (keyword.includes("under 500")) {
    return product.price < 500;
  }

  if (keyword.includes("above 1000")) {
    return product.price > 1000;
  }

  if (keyword.includes("budget")) {
    return product.price <= 700;
  }

  if (keyword.includes("premium")) {
    return product.price >= 1000;
  }

  if (keyword.includes("gaming")) {
    return product.name.toLowerCase().includes("gaming") || product.category === "laptop";
  }

  if (keyword.includes("audio")) {
    return product.category === "audio";
  }

  if (keyword.includes("mobile")) {
    return product.category === "mobile";
  }

  if (keyword.includes("laptop")) {
    return product.category === "laptop";
  }

  return product.name.toLowerCase().includes(keyword);
}

function escapeSuggestionHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeSuggestionRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightSuggestionQuery(text, query) {
  const raw = String(text || "");
  const cleanQuery = String(query || "").trim();
  if (!cleanQuery) {
    return escapeSuggestionHtml(raw);
  }

  const matcher = new RegExp(`(${escapeSuggestionRegExp(cleanQuery)})`, "ig");
  const parts = raw.split(matcher);
  if (parts.length === 1) {
    return escapeSuggestionHtml(raw);
  }

  return parts
    .map((part, index) => (index % 2 === 1 ? `<mark>${escapeSuggestionHtml(part)}</mark>` : escapeSuggestionHtml(part)))
    .join("");
}

function renderSuggestionCard(item, query) {
  const media =
    item.type === "product" && item.image
      ? `
        <span class="suggestion-media suggestion-thumb" aria-hidden="true">
          <img src="${escapeSuggestionHtml(item.image)}" alt="" loading="lazy" />
        </span>
      `
      : `<span class="suggestion-media suggestion-icon suggestion-icon--${escapeSuggestionHtml(item.type)}" aria-hidden="true"></span>`;

  const kicker = item.kicker
    ? `<span class="suggestion-kicker">${escapeSuggestionHtml(item.kicker)}</span>`
    : "";
  const meta = item.meta
    ? `<span class="suggestion-meta">${highlightSuggestionQuery(item.meta, query)}</span>`
    : "";
  const trailingParts = [];
  if (item.priceText) {
    trailingParts.push(`<span class="suggestion-price">${escapeSuggestionHtml(item.priceText)}</span>`);
  }
  if (item.action) {
    trailingParts.push(`<span class="suggestion-action">${escapeSuggestionHtml(item.action)}</span>`);
  }
  const trailing = trailingParts.length
    ? `<span class="suggestion-trailing">${trailingParts.join("")}</span>`
    : "";

  return `
    <button class="suggestion-item suggestion-item--${escapeSuggestionHtml(item.type)}" type="button" data-suggestion-type="${escapeSuggestionHtml(item.type)}" data-suggestion-value="${escapeSuggestionHtml(item.value)}">
      ${media}
      <span class="suggestion-copy">
        ${kicker}
        <span class="suggestion-label">${highlightSuggestionQuery(item.label, query)}</span>
        ${meta}
      </span>
      ${trailing}
    </button>
  `;
}

function renderSuggestionSection(title, items, query) {
  if (!items.length) {
    return "";
  }
  return `
    <section class="suggestion-group">
      <div class="suggestion-group-head">
        <p class="suggestion-group-label">${escapeSuggestionHtml(title)}</p>
        ${title === "Recent Searches" ? '<button class="suggestion-clear" type="button" data-clear-search-history="1">Clear</button>' : ""}
      </div>
      ${items.map((item) => renderSuggestionCard(item, query)).join("")}
    </section>
  `;
}

function renderSuggestionEmptyState(query) {
  return `
    <div class="suggestion-empty">
      <strong>No direct matches yet</strong>
      <span>Press Search to explore all results for "${escapeSuggestionHtml(query)}".</span>
    </div>
  `;
}

function closeSearchSuggestions() {
  if (!searchSuggestions) {
    return;
  }
  searchSuggestions.hidden = true;
  searchSuggestions.innerHTML = "";
  searchSuggestions.setAttribute("aria-hidden", "true");
  searchInput?.setAttribute("aria-expanded", "false");
  searchInput?.removeAttribute("aria-activedescendant");
  resetSearchSuggestionNavigation();
}

function clearSearchHistory() {
  saveSearchHistory([]);
}

let activeSearchSuggestionIndex = -1;

function getSearchSuggestionButtons() {
  return searchSuggestions
    ? Array.from(searchSuggestions.querySelectorAll("[data-suggestion-type]"))
    : [];
}

function prepareSearchSuggestionAccessibility() {
  if (!searchSuggestions || !searchInput) {
    return;
  }
  searchSuggestions.setAttribute("role", "listbox");
  searchSuggestions.setAttribute("aria-hidden", searchSuggestions.hidden ? "true" : "false");
  searchInput.setAttribute("aria-controls", "searchSuggestions");
  searchInput.setAttribute("aria-expanded", searchSuggestions.hidden ? "false" : "true");
  getSearchSuggestionButtons().forEach((item, index) => {
    if (!item.id) {
      item.id = `search-suggestion-${index}`;
    }
    item.setAttribute("role", "option");
    item.setAttribute("aria-selected", item.classList.contains("is-active") ? "true" : "false");
  });
}

function resetSearchSuggestionNavigation() {
  activeSearchSuggestionIndex = -1;
  getSearchSuggestionButtons().forEach((item) => {
    item.classList.remove("is-active");
    item.setAttribute("aria-selected", "false");
  });
  searchInput?.removeAttribute("aria-activedescendant");
}

function setActiveSearchSuggestionIndex(nextIndex) {
  const items = getSearchSuggestionButtons();
  if (!items.length) {
    activeSearchSuggestionIndex = -1;
    return -1;
  }
  const safeIndex = Math.max(0, Math.min(nextIndex, items.length - 1));
  activeSearchSuggestionIndex = safeIndex;
  items.forEach((item, index) => {
    const active = index === safeIndex;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-selected", active ? "true" : "false");
  });
  searchInput?.setAttribute("aria-activedescendant", items[safeIndex].id);
  items[safeIndex].scrollIntoView({ block: "nearest" });
  return safeIndex;
}

function moveActiveSearchSuggestion(direction) {
  const items = getSearchSuggestionButtons();
  if (!items.length) {
    return false;
  }
  if (activeSearchSuggestionIndex < 0) {
    setActiveSearchSuggestionIndex(direction > 0 ? 0 : items.length - 1);
    return true;
  }
  const nextIndex = (activeSearchSuggestionIndex + direction + items.length) % items.length;
  setActiveSearchSuggestionIndex(nextIndex);
  return true;
}

function activateActiveSearchSuggestion() {
  const items = getSearchSuggestionButtons();
  if (activeSearchSuggestionIndex < 0 || !items[activeSearchSuggestionIndex]) {
    return false;
  }
  const activeItem = items[activeSearchSuggestionIndex];
  const type = activeItem.getAttribute("data-suggestion-type");
  const value = String(activeItem.getAttribute("data-suggestion-value") || "").trim();
  handleSearchSuggestionSelection(type, value);
  return true;
}

function handleSearchSuggestionKeydown(event) {
  if (!searchSuggestions || !searchInput) {
    return;
  }
  if (event.key === "Escape") {
    if (!searchSuggestions.hidden) {
      event.preventDefault();
      closeSearchSuggestions();
    }
    return;
  }
  if (event.key === "Tab") {
    if (searchSuggestions.hidden) {
      return;
    }
    const items = getSearchSuggestionButtons();
    if (!items.length) {
      if (event.shiftKey) {
        closeSearchSuggestions();
      }
      return;
    }
    if (event.shiftKey) {
      closeSearchSuggestions();
      return;
    }
    event.preventDefault();
    const nextIndex = activeSearchSuggestionIndex >= 0 ? activeSearchSuggestionIndex : 0;
    setActiveSearchSuggestionIndex(nextIndex);
    items[nextIndex].focus();
    return;
  }
  if (!["ArrowDown", "ArrowUp", "Enter"].includes(event.key)) {
    return;
  }
  if (searchSuggestions.hidden) {
    renderSearchSuggestions();
  }
  const items = getSearchSuggestionButtons();
  if (!items.length) {
    return;
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    moveActiveSearchSuggestion(1);
    return;
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    moveActiveSearchSuggestion(-1);
    return;
  }
  if (event.key === "Enter" && activeSearchSuggestionIndex >= 0) {
    event.preventDefault();
    activateActiveSearchSuggestion();
  }
}

function buildProductsSearchUrl(query = "", category = "all") {
  const params = new URLSearchParams();
  const cleanQuery = String(query || "").trim();
  const cleanCategory = String(category || "all").trim().toLowerCase();
  if (cleanQuery) {
    params.set("search", cleanQuery);
  }
  if (cleanCategory && cleanCategory !== "all") {
    params.set("category", cleanCategory);
  }
  const suffix = params.toString();
  return suffix ? `products.html?${suffix}` : "products.html";
}

function handleSearchSuggestionSelection(type, value) {
  closeSearchSuggestions();
  if (type === "product" && value) {
    window.location.href = `product-detail.html?id=${encodeURIComponent(value)}`;
    return;
  }
  if (type === "category" && value) {
    rememberSearchQuery(getReadableCategoryLabel(value));
    window.location.href = buildProductsSearchUrl("", value);
    return;
  }
  if (type === "history" && value) {
    searchInput.value = value;
    rememberSearchQuery(value);
    window.location.href = buildProductsSearchUrl(value, categoryFilter.value || "all");
  }
}

function renderSearchSuggestions() {
  if (!searchSuggestions || !searchInput) {
    return;
  }
  const query = String(searchInput.value || "").trim().toLowerCase();
  if (!query) {
    const recent = loadSearchHistory();
    if (!recent.length) {
      closeSearchSuggestions();
      return;
    }
    searchSuggestions.innerHTML = renderSuggestionSection(
      "Recent Searches",
      recent.map((item) => ({
        type: "history",
        value: item,
        label: item,
        meta: "Recent search",
        kicker: "Recent",
        action: "Use"
      })),
      ""
    );
    searchSuggestions.hidden = false;
    prepareSearchSuggestionAccessibility();
    resetSearchSuggestionNavigation();
    return;
  }
  if (query.length < 2) {
    closeSearchSuggestions();
    return;
  }

  const sourceProducts = getHomeProducts().filter((item) => item.segment !== "b2b");
  const categoryMatches = Array.from(new Set(sourceProducts
    .map((item) => normalizeHomeCategory(item.category))
    .filter((category) => category && getReadableCategoryLabel(category).toLowerCase().includes(query))))
    .slice(0, 2)
    .map((category) => ({
      type: "category",
      value: category,
      label: getReadableCategoryLabel(category),
      meta: "Browse category",
      kicker: "Category",
      action: "Browse"
    }));

  const productMatches = sourceProducts
    .filter((item) => `${item.name} ${item.brand} ${item.category}`.toLowerCase().includes(query))
    .map((item) => {
      const stockState = getProductStockState(item);
      return {
        type: "product",
        value: String(item.id),
        label: item.name,
        meta: `${item.brand} | ${getReadableCategoryLabel(normalizeHomeCategory(item.category))} | ${stockState.label}`,
        kicker: Number(item.rating || 0) > 0 ? `${Number(item.rating).toFixed(1)} star rated` : "Top match",
        stockRank: stockState.rank,
        priceText: money(item.price),
        action: "View",
        image: normalizeImageUrl(item.image || "")
      };
    })
    .sort((a, b) => a.stockRank - b.stockRank || a.label.localeCompare(b.label))
    .slice(0, 4);

  const markup = [
    renderSuggestionSection("Categories", categoryMatches, query),
    renderSuggestionSection("Top Matches", productMatches, query)
  ]
    .filter(Boolean)
    .join("");

  if (!markup) {
    searchSuggestions.innerHTML = renderSuggestionEmptyState(String(searchInput.value || "").trim());
    searchSuggestions.hidden = false;
    prepareSearchSuggestionAccessibility();
    resetSearchSuggestionNavigation();
    return;
  }

  searchSuggestions.innerHTML = markup;
  searchSuggestions.hidden = false;
  prepareSearchSuggestionAccessibility();
  resetSearchSuggestionNavigation();
}

function handleSuggestionListKeydown(event) {
  const suggestion = event.target.closest("[data-suggestion-type]");
  if (!suggestion) {
    return;
  }
  const items = getSearchSuggestionButtons();
  const currentIndex = items.indexOf(suggestion);
  if (currentIndex < 0) {
    return;
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    const nextIndex = (currentIndex + 1) % items.length;
    setActiveSearchSuggestionIndex(nextIndex);
    items[nextIndex].focus();
    return;
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    const nextIndex = (currentIndex - 1 + items.length) % items.length;
    setActiveSearchSuggestionIndex(nextIndex);
    items[nextIndex].focus();
    return;
  }
  if (event.key === "Tab") {
    if (event.shiftKey) {
      event.preventDefault();
      if (currentIndex === 0) {
        searchInput.focus();
        setActiveSearchSuggestionIndex(0);
        return;
      }
      const prevIndex = currentIndex - 1;
      setActiveSearchSuggestionIndex(prevIndex);
      items[prevIndex].focus();
      return;
    }
    if (currentIndex === items.length - 1) {
      window.setTimeout(() => closeSearchSuggestions(), 0);
      return;
    }
    event.preventDefault();
    const nextIndex = currentIndex + 1;
    setActiveSearchSuggestionIndex(nextIndex);
    items[nextIndex].focus();
    return;
  }
  if (event.key === "Escape") {
    event.preventDefault();
    closeSearchSuggestions();
    searchInput.focus();
    return;
  }
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    const type = suggestion.getAttribute("data-suggestion-type");
    const value = String(suggestion.getAttribute("data-suggestion-value") || "").trim();
    handleSearchSuggestionSelection(type, value);
  }
}

function applyTranslations() {
  document.documentElement.setAttribute("lang", currentLang);

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    element.textContent = t(key);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.getAttribute("data-i18n-placeholder");
    element.setAttribute("placeholder", t(key));
  });

  if (categoryFilter) {
    const currentValue = String(categoryFilter.value || "all");
    categoryFilter.innerHTML = [
      `<option value="all">${t("categoryFilter.all")}</option>`,
      `<option value="computer">${t("categoryFilter.computer")}</option>`,
      `<option value="laptop">${t("categoryFilter.laptop")}</option>`,
      `<option value="printer">${t("categoryFilter.printer")}</option>`,
      `<option value="mobile">${t("categoryFilter.mobile")}</option>`,
      `<option value="audio">${t("categoryFilter.audio")}</option>`,
      `<option value="accessory">${t("categoryFilter.accessory")}</option>`
    ].join("");
    categoryFilter.value = ["all", "computer", "laptop", "printer", "mobile", "audio", "accessory"].includes(currentValue) ? currentValue : "all";
  }
  renderStores();
}

function renderHomeSurface() {
  const sourceProducts = getHomeProducts();
  syncCategoryFilterOptions(sourceProducts);
  renderQuickGrid(sourceProducts);
  renderDealStrip(sourceProducts);
  renderHeroSection(sourceProducts);
  renderHomeMomentumBand(sourceProducts);
  renderNewArrivalsWindow(sourceProducts);
  renderCreatorStudioSection(sourceProducts);
  renderTopRatedSection(sourceProducts);
  renderRecommendedSection(sourceProducts);
  renderRecentlyViewedSection(sourceProducts);
  filterProducts();
}

function filterProducts() {
  const sourceProducts = getHomeProducts();
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  const filtered = sourceProducts.filter((product) => {
    const categoryMatch = category === "all" || product.category === category;
    const queryMatch = matchesSmartKeyword(product, query);
    return categoryMatch && queryMatch;
  });

  const visibleProducts = filtered
    .filter((product) => product.segment !== "b2b")
    .slice(0, HOME_MAIN_LIST_LIMIT);
  renderSegmentProducts(visibleProducts, b2cProductGrid, b2cResultMeta, "products.b2cListLabel");
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = String(searchInput.value || "").trim();
  const category = String(categoryFilter.value || "all").trim();
  rememberSearchQuery(query);
  window.location.href = buildProductsSearchUrl(query, category);
});

searchInput.addEventListener("input", () => {
  filterProducts();
  renderSearchSuggestions();
});
searchInput.addEventListener("focus", renderSearchSuggestions);
searchInput.addEventListener("keydown", handleSearchSuggestionKeydown);
if (searchSuggestions) {
  searchSuggestions.addEventListener("mousedown", (event) => {
    if (event.target.closest("[data-suggestion-type], [data-clear-search-history]")) {
      event.preventDefault();
    }
  });
  searchSuggestions.addEventListener("mouseover", (event) => {
    const suggestion = event.target.closest("[data-suggestion-type]");
    if (!suggestion) {
      return;
    }
    const items = getSearchSuggestionButtons();
    const nextIndex = items.indexOf(suggestion);
    if (nextIndex >= 0) {
      setActiveSearchSuggestionIndex(nextIndex);
    }
  });
  searchSuggestions.addEventListener("focusin", (event) => {
    const suggestion = event.target.closest("[data-suggestion-type]");
    if (!suggestion) {
      return;
    }
    const items = getSearchSuggestionButtons();
    const nextIndex = items.indexOf(suggestion);
    if (nextIndex >= 0) {
      setActiveSearchSuggestionIndex(nextIndex);
    }
  });
  searchSuggestions.addEventListener("keydown", handleSuggestionListKeydown);
  searchSuggestions.addEventListener("click", (event) => {
    const clearButton = event.target.closest("[data-clear-search-history]");
    if (clearButton) {
      event.preventDefault();
      clearSearchHistory();
      if (String(searchInput.value || "").trim()) {
        renderSearchSuggestions();
      } else {
        closeSearchSuggestions();
      }
      return;
    }
    const suggestion = event.target.closest("[data-suggestion-type]");
    if (!suggestion) {
      return;
    }
    const type = suggestion.getAttribute("data-suggestion-type");
    const value = String(suggestion.getAttribute("data-suggestion-value") || "").trim();
    handleSearchSuggestionSelection(type, value);
  });
}
categoryFilter.addEventListener("change", filterProducts);
languageSelect.addEventListener("change", (event) => {
  currentLang = event.target.value;
  saveLanguagePreference(currentLang);
  applyTranslations();
  renderHomeSurface();
});

if (heroPrev) {
  heroPrev.addEventListener("click", () => {
    setHeroSlide(currentHeroIndex - 1);
    startHeroAutoplay();
  });
}

if (heroNext) {
  heroNext.addEventListener("click", () => {
    setHeroSlide(currentHeroIndex + 1);
    startHeroAutoplay();
  });
}

if (heroDots) {
  heroDots.addEventListener("click", (event) => {
    const dot = event.target.closest("[data-hero-index]");
    if (!dot) {
      return;
    }
    setHeroSlide(Number(dot.getAttribute("data-hero-index") || 0));
    startHeroAutoplay();
  });
}

if (heroTrack) {
  heroTrack.addEventListener("mouseenter", stopHeroAutoplay);
  heroTrack.addEventListener("mouseleave", startHeroAutoplay);
}

function closeMegaMenu() {
  if (!megaMenu || !megaTrigger) {
    return;
  }
  megaMenu.classList.remove("open");
  megaTrigger.setAttribute("aria-expanded", "false");
}

function closeQuickLinksMenu() {
  if (!quickLinksMenu || !quickLinksTrigger) {
    return;
  }
  quickLinksMenu.classList.remove("open");
  quickLinksTrigger.setAttribute("aria-expanded", "false");
}

if (megaTrigger && megaMenu) {
  megaTrigger.addEventListener("click", () => {
    const isOpen = megaMenu.classList.toggle("open");
    megaTrigger.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
      closeQuickLinksMenu();
    }
  });
}

if (quickLinksTrigger && quickLinksMenu) {
  quickLinksTrigger.addEventListener("click", () => {
    const isOpen = quickLinksMenu.classList.toggle("open");
    quickLinksTrigger.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
      closeMegaMenu();
    }
  });
}

document.addEventListener("click", (event) => {
  if (megaMenu && megaTrigger && !megaMenu.contains(event.target) && !megaTrigger.contains(event.target)) {
    closeMegaMenu();
  }
  if (quickLinksMenu && quickLinksTrigger && !quickLinksMenu.contains(event.target) && !quickLinksTrigger.contains(event.target)) {
    closeQuickLinksMenu();
  }
});

window.addEventListener("storage", (event) => {
  if (event.key && event.key !== CATALOG_STORAGE_KEY) {
    return;
  }
  renderHomeSurface();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSearchSuggestions();
    if (quickViewModal && !quickViewModal.hidden) {
      closeQuickViewModal();
      return;
    }
    if (locationModal && !locationModal.hidden) {
      closeLocationModal();
      return;
    }
    closeMegaMenu();
    closeQuickLinksMenu();
  }
});

document.addEventListener("click", (event) => {
  if (searchSuggestions && !searchForm.contains(event.target)) {
    closeSearchSuggestions();
  }

  const quickViewBtn = event.target.closest("[data-quick-view-id]");
  if (quickViewBtn) {
    openQuickViewModal(String(quickViewBtn.getAttribute("data-quick-view-id") || ""));
    return;
  }

  const wishlistBtn = event.target.closest(".wishlist-btn");
  if (wishlistBtn) {
    const productId = String(wishlistBtn.getAttribute("data-wishlist-id") || "").trim();
    if (productId) {
      const active = toggleWishlist(productId);
      wishlistBtn.classList.toggle("active", active);
      wishlistBtn.textContent = active ? "Wishlisted" : "Wishlist";
      renderRecommendedSection(getHomeProducts());
    }
    return;
  }

  if (event.target.classList.contains("add-btn")) {
    const productId = String(event.target.getAttribute("data-id") || "").trim();
    if (productId) {
      addProductToCart(productId);
    }
  }
});

if (quickViewModal) {
  quickViewModal.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-quick-view]")) {
      closeQuickViewModal();
    }
  });
}

if (quickViewClose) {
  quickViewClose.addEventListener("click", closeQuickViewModal);
}

if (quickViewAddBtn) {
  quickViewAddBtn.addEventListener("click", () => {
    if (!currentQuickViewProductId) {
      return;
    }
    addProductToCart(currentQuickViewProductId);
    quickViewAddBtn.textContent = "Added";
    window.setTimeout(() => {
      quickViewAddBtn.textContent = "Add to Cart";
    }, 1200);
  });
}

if (quickViewWishlistBtn) {
  quickViewWishlistBtn.addEventListener("click", () => {
    if (!currentQuickViewProductId) {
      return;
    }
    toggleWishlist(currentQuickViewProductId);
    syncQuickViewWishlistState(currentQuickViewProductId);
    renderRecommendedSection(getHomeProducts());
  });
}

currentLang = loadLanguagePreference();
if (languageSelect) {
  languageSelect.value = currentLang;
}
applyTranslations();
initLocationPicker();
syncCartCount();
renderHomeSurface();
void fetchHomeProductsFromApi();
